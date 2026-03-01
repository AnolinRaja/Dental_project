import express from 'express';
import jwt from 'jsonwebtoken';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import DoctorOtp from '../models/DoctorOtp.js';
import { sendAppointmentConfirmedEmail, sendAppointmentRejectedEmail, sendDoctorOtpEmail } from '../utils/sendEmail.js';

const router = express.Router();

/**
 * Doctor login (step 1) - verify credentials and send OTP to allowed doctor email
 * POST /api/doctors/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔍 Doctor Login Attempt:', email);

    // only allow the pre-configured doctor email to initiate login
    if (!process.env.DOCTOR_EMAIL || email !== process.env.DOCTOR_EMAIL) {
      return res.status(401).json({ success: false, message: 'Unauthorized email' });
    }

    if (password !== process.env.DOCTOR_PASSWORD) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // persist OTP
    await DoctorOtp.create({ email, otp, expiresAt });

    // send OTP via email
    await sendDoctorOtpEmail(email, otp);

    res.json({ success: true, message: 'OTP sent to registered doctor email' });
  } catch (error) {
    console.error('Error in doctor login OTP step:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

/**
 * Verify OTP and issue JWT (step 2)
 * POST /api/doctors/verify-otp
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP required' });
    }

    const record = await DoctorOtp.findOne({ email, otp, used: false, expiresAt: { $gt: new Date() } });
    if (!record) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // mark used
    record.used = true;
    await record.save();

    const token = jwt.sign({ email, role: 'doctor' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, message: 'Login successful', token, user: { email, role: 'doctor' } });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

/**
 * Get all appointments (history + pending)
 * GET /api/doctors/appointments
 * Optionally supply ?date=YYYY-MM-DD to filter by that day
 */
router.get('/appointments', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const { date } = req.query;
    let filter = {};
    if (date) {
      const start = new Date(date);
      start.setHours(0,0,0,0);
      const end = new Date(date);
      end.setHours(23,59,59,999);
      filter.appointmentDate = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'fullName email phone age gender address doctorType symptoms medicalHistory')
      .sort({ appointmentDate: -1 });

    res.json({
      success: true,
      data: appointments,
      count: appointments.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
});

// existing pending route preserved for compatibility
router.get('/pending-appointments', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const appointments = await Appointment.find({ status: 'Pending' })
      .populate('patientId', 'fullName email phone age gender address doctorType symptoms medicalHistory')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: appointments,
      count: appointments.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
});

/**
 * Confirm appointment and send email to patient
 * PUT /api/doctors/confirm-appointment/:appointmentId
 */
router.put('/confirm-appointment/:appointmentId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const { appointmentId } = req.params;
    const { timeSlot, doctorNotes, treatmentCost } = req.body;

    // Find appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Update appointment status
    appointment.status = 'Confirmed';
    if (timeSlot) appointment.timeSlot = timeSlot;
    if (doctorNotes) appointment.doctorNotes = doctorNotes;
    if (treatmentCost !== undefined) appointment.treatmentCost = treatmentCost;
    appointment.paymentStatus = 'Pending'; // Set payment status
    appointment.updatedAt = new Date();
    appointment.history = appointment.history || [];
    appointment.history.push({ status: 'Confirmed', notes: doctorNotes || '' });

    const updatedAppointment = await appointment.save();

    // Send confirmation email to patient
    const patient = appointment.patientId;
    if (patient && patient.email) {
      await sendAppointmentConfirmedEmail(
        patient.email,
        patient.fullName,
        appointment.appointmentDate,
        'Dr. Clinic Staff',
        patient.doctorType,
        appointment.timeSlot || 'To be determined'
      );
    }

    // schedule reminder for doctor 30 minutes before
    const { sendDoctorReminderEmail } = require('../utils/sendEmail');
    const reminderDelay = new Date(appointment.appointmentDate).getTime() - Date.now() - (30 * 60 * 1000);
    if (reminderDelay > 0) {
      setTimeout(() => {
        sendDoctorReminderEmail(process.env.DOCTOR_EMAIL, patient.fullName, appointment.appointmentDate, appointment.timeSlot || 'TBD');
      }, reminderDelay);
    }

    res.json({
      success: true,
      message: 'Appointment confirmed and patient notified via email',
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error confirming appointment',
      error: error.message
    });
  }
});

/**
 * Reject appointment
 * PUT /api/doctors/reject-appointment/:appointmentId
 */
router.put('/reject-appointment/:appointmentId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const { appointmentId } = req.params;
    const { rejectionReason } = req.body;

    // Find appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Update appointment status
    appointment.status = 'Cancelled';
    appointment.doctorNotes = `Rejected: ${rejectionReason || 'No reason provided'}`;
    appointment.rejectionReason = rejectionReason || '';
    appointment.updatedAt = new Date();
    appointment.history = appointment.history || [];
    appointment.history.push({ status: 'Cancelled', notes: rejectionReason || '' });

    const updatedAppointment = await appointment.save();

    // Send rejection email to patient
    const patient = appointment.patientId;
    if (patient && patient.email) {
      await sendAppointmentRejectedEmail(
        patient.email,
        patient.fullName,
        appointment.appointmentDate,
        rejectionReason || 'No reason provided'
      );
    }

    res.json({
      success: true,
      message: 'Appointment rejected and patient notified via email',
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting appointment',
      error: error.message
    });
  }
});

/**
 * Mark appointment as completed and record expenses/treatment cost
 * PUT /api/doctors/complete-appointment/:appointmentId
 */
router.put('/complete-appointment/:appointmentId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const { appointmentId } = req.params;
    const { expenses, treatmentCost } = req.body;

    const appointment = await Appointment.findById(appointmentId).populate('patientId');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = 'Completed';
    appointment.completedAt = new Date();
    if (expenses !== undefined) appointment.expenses = Number(expenses) || 0;
    if (treatmentCost !== undefined) appointment.treatmentCost = Number(treatmentCost) || appointment.treatmentCost;
    appointment.updatedAt = new Date();
    appointment.history = appointment.history || [];
    appointment.history.push({ status: 'Completed', notes: `Completed with cost ₹${appointment.treatmentCost}` });

    const updated = await appointment.save();

    // Optionally send invoice email to patient here

    res.json({ success: true, message: 'Appointment marked as completed', data: updated });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ success: false, message: 'Error completing appointment', error: error.message });
  }
});

export default router;
