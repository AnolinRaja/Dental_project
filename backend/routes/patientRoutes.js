const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const {
  sendPatientConfirmationEmail,
  sendDoctorNotificationEmail
} = require('../utils/sendEmail');

const router = express.Router();

// Patient authentication middleware
const requirePatientToken = (req, res, next) => {
  try {
    console.log('🔐 [AUTH-MIDDLEWARE] Checking token...');
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('🔐 [AUTH-MIDDLEWARE] Token exists:', !!token);
    
    if (!token) {
      console.log('🔐 [AUTH-MIDDLEWARE] ERROR: No token provided');
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 [AUTH-MIDDLEWARE] Token verified, patientId:', decoded.patientId);
    req.patientId = decoded.patientId;
    req.patientEmail = decoded.email;
    next();
  } catch (error) {
    console.error('🔐 [AUTH-MIDDLEWARE] ERROR:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// helper route: get patient by email (used for registration prefill)
router.get('/by-email', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email parameter required' });
  }
  try {
    const patient = await Patient.findOne({ email: email.toLowerCase() }).select('fullName email phone age gender address doctorType');
    if (!patient) {
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: patient });
  } catch (err) {
    console.error('Error fetching patient by email:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, DOCX are allowed.'));
  }
});

/**
 * Register a new patient
 * POST /api/patients/register
 */
router.post('/register', upload.single('document'), async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      age,
      gender,
      address,
      doctorType,
      symptoms,
      medicalHistory,
      appointmentDate
    } = req.body;

    // Validation
    if (!fullName || !email || !phone || !age || !gender || !address || !doctorType) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // attempt to locate an existing patient by email or phone
    let savedPatient;
    let existingPatient = await Patient.findOne({ $or: [{ email }, { phone }] });

    if (existingPatient) {
      // if the incoming email matches a different document's email or
      // the incoming phone matches a different document's phone, the find
      // above would have returned one of them – but we must also ensure we
      // don't overwrite unique values that belong to someone else.
      // e.g. user supplies email A and phone B where A belongs to patient1
      // and B belongs to patient2. We should reject such requests.

      // check if existingPatient has a conflicting phone
      if (existingPatient.phone !== phone) {
        const phoneOwner = await Patient.findOne({ phone });
        if (phoneOwner && phoneOwner._id.toString() !== existingPatient._id.toString()) {
          return res.status(409).json({
            success: false,
            message: 'The provided phone number is already used by another patient.'
          });
        }
        existingPatient.phone = phone; // allow updating phone if not taken
      }

      // check if existingPatient has a conflicting email
      if (existingPatient.email !== email) {
        const emailOwner = await Patient.findOne({ email });
        if (emailOwner && emailOwner._id.toString() !== existingPatient._id.toString()) {
          return res.status(409).json({
            success: false,
            message: 'The provided email address is already used by another patient.'
          });
        }
        existingPatient.email = email;
      }

      // reuse existing patient record but update basic info if changed
      existingPatient.fullName = fullName || existingPatient.fullName;
      existingPatient.age = parseInt(age) || existingPatient.age;
      existingPatient.gender = gender || existingPatient.gender;
      existingPatient.address = address || existingPatient.address;
      existingPatient.doctorType = doctorType || existingPatient.doctorType;
      existingPatient.symptoms = symptoms || existingPatient.symptoms;
      existingPatient.medicalHistory = medicalHistory || existingPatient.medicalHistory;
      if (req.file) {
        existingPatient.profileImage = `/uploads/${req.file.filename}`;
      }
      savedPatient = await existingPatient.save();
    } else {
      // no existing patient found, create new record
      const newPatient = new Patient({
        fullName,
        email,
        phone,
        age: parseInt(age),
        gender,
        address,
        doctorType,
        symptoms: symptoms || '',
        medicalHistory: medicalHistory || '',
        profileImage: req.file ? `/uploads/${req.file.filename}` : null
      });
      savedPatient = await newPatient.save();
    }

    // validate appointment date coming from form
    let apptDate = new Date();
    if (appointmentDate) {
      const parsed = new Date(appointmentDate);
      if (!isNaN(parsed.getTime())) {
        apptDate = parsed;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid appointment date format'
        });
      }
    }

    // Create appointment record for this patient
    const newAppointment = new Appointment({
      patientId: savedPatient._id,
      appointmentDate: apptDate,
      status: 'Pending',
      reasonForVisit: symptoms || '',
      emailNotificationSent: false,
      history: [
        { status: 'Pending', notes: 'Appointment created' }
      ]
    });

    await newAppointment.save();

    console.log('✓ Appointment created for patient:', savedPatient._id);

    // Send confirmation emails
    await sendPatientConfirmationEmail(email, fullName, appointmentDate, doctorType);
    await sendDoctorNotificationEmail({
      fullName,
      email,
      phone,
      age,
      gender,
      address,
      doctorType,
      symptoms,
      medicalHistory,
      appointmentDate
    });

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: savedPatient
    });
  } catch (error) {
    // handle common errors explicitly
    console.error('⚠️ Patient registration failed:', error);
    // duplicate key (email or phone) causing unique index violation
    if (error.code === 11000) {
      const dupField = Object.keys(error.keyPattern || {}).join(', ');
      return res.status(409).json({
        success: false,
        message: `A patient with the same ${dupField} already exists.`
      });
    }

    // validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${messages}`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error registering patient',
      error: error.message
    });
  }
});

/**
 * Get all patients
 * GET /api/patients
 */
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patients',
      error: error.message
    });
  }
});

/**
 * Get a specific patient
 * GET /api/patients/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patient',
      error: error.message
    });
  }
});

/**
 * Update a patient
 * PUT /api/patients/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { fullName, email, phone, age, gender, address, medicalHistory } = req.body;
    
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        fullName,
        email,
        phone,
        age,
        gender,
        address,
        medicalHistory,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: updatedPatient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating patient',
      error: error.message
    });
  }
});

/**
 * Delete a patient
 * DELETE /api/patients/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
    
    if (!deletedPatient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient deleted successfully',
      data: deletedPatient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting patient',
      error: error.message
    });
  }
});

/**
 * Get patient's past and upcoming appointments
 * GET /api/patients/my-appointments
 */
router.get('/my-appointments', requirePatientToken, async (req, res) => {
  try {
    console.log('📋 [MY-APPOINTMENTS] START - patientId:', req.patientId);
    console.log('📋 [MY-APPOINTMENTS] Token present:', !!req.patientId);
    
    if (!req.patientId) {
      console.log('📋 [MY-APPOINTMENTS] ERROR: No patientId in request');
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID'
      });
    }

    console.log('📋 [MY-APPOINTMENTS] Querying database...');
    const appointments = await Appointment.find({ patientId: req.patientId }).sort({ appointmentDate: -1 });
    
    console.log('📋 [MY-APPOINTMENTS] SUCCESS - Found', appointments.length, 'appointments');

    // Separate past and upcoming
    const now = new Date();
    const upcoming = appointments.filter(a => new Date(a.appointmentDate) >= now);
    const past = appointments.filter(a => new Date(a.appointmentDate) < now);

    res.json({
      success: true,
      data: {
        upcoming,
        past,
        total: appointments.length
      }
    });
  } catch (error) {
    console.error('Error fetching patient appointments:', error.message);
    console.error('Full error object:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
});

module.exports = router;
