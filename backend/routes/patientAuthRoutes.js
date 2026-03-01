import express from 'express';
import jwt from 'jsonwebtoken';
import Patient from '../models/Patient.js';
import { sendPatientOtpEmail } from '../utils/sendEmail.js';

const router = express.Router();

// Generate random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP to patient email for registration
 * POST /api/patient-auth/send-otp-registration
 */
router.post('/send-otp-registration', async (req, res) => {
  try {
    const { email, fullName } = req.body;

    if (!email || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email and full name are required'
      });
    }

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient && existingPatient.isVerified) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered. Use "Already Registered" option to login.'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create or update patient with OTP
    let patient = await Patient.findOne({ email });
    if (patient) {
      // Update existing unverified patient
      patient.otp = otp;
      patient.otpExpiry = otpExpiry;
      patient.otpAttempts = 0;
      await patient.save();
    } else {
      // Create new patient (not yet verified)
      patient = new Patient({
        email,
        fullName,
        otp,
        otpExpiry,
        isVerified: false,
        phone: '',
        age: 0
      });
      await patient.save();
    }

    // Send OTP email
    await sendPatientOtpEmail(email, otp);

    res.json({
      success: true,
      message: 'OTP sent to your email',
      patientId: patient._id
    });
  } catch (error) {
    console.error('Error sending registration OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message
    });
  }
});

/**
 * Verify OTP and mark patient email as verified (registration flow)
 * POST /api/patient-auth/verify-otp-registration
 */
router.post('/verify-otp-registration', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found. Please register first.'
      });
    }

    // Check OTP expiry
    if (!patient.otpExpiry || new Date() > patient.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check OTP attempts
    if (patient.otpAttempts >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum OTP attempts exceeded. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (patient.otp !== otp) {
      patient.otpAttempts += 1;
      await patient.save();
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${5 - patient.otpAttempts} attempts remaining.`
      });
    }

    // OTP verified successfully
    patient.isVerified = true;
    patient.otp = null;
    patient.otpExpiry = null;
    patient.otpAttempts = 0;
    await patient.save();

    // Generate JWT token
    const token = jwt.sign(
      { patientId: patient._id, email: patient.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Email verified successfully',
      token,
      patientId: patient._id,
      patient: {
        _id: patient._id,
        email: patient.email,
        fullName: patient.fullName,
        isVerified: patient.isVerified
      }
    });
  } catch (error) {
    console.error('Error verifying registration OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
});

/**
 * Send OTP to already registered patient for login
 * POST /api/patient-auth/send-otp-login
 */
router.post('/send-otp-login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const patient = await Patient.findOne({ email, isVerified: true });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or email not verified'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    patient.otp = otp;
    patient.otpExpiry = otpExpiry;
    patient.otpAttempts = 0;
    await patient.save();

    // Send OTP email
    await sendPatientOtpEmail(email, otp);

    res.json({
      success: true,
      message: 'OTP sent to your email',
      patientId: patient._id
    });
  } catch (error) {
    console.error('Error sending login OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message
    });
  }
});

/**
 * Verify OTP for patient login
 * POST /api/patient-auth/verify-otp-login
 */
router.post('/verify-otp-login', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const patient = await Patient.findOne({ email, isVerified: true });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or email not verified'
      });
    }

    // Check OTP expiry
    if (!patient.otpExpiry || new Date() > patient.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check OTP attempts
    if (patient.otpAttempts >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum OTP attempts exceeded. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (patient.otp !== otp) {
      patient.otpAttempts += 1;
      await patient.save();
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${5 - patient.otpAttempts} attempts remaining.`
      });
    }

    // OTP verified successfully
    patient.otp = null;
    patient.otpExpiry = null;
    patient.otpAttempts = 0;
    await patient.save();

    // Generate JWT token
    const token = jwt.sign(
      { patientId: patient._id, email: patient.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      patientId: patient._id,
      patient: {
        _id: patient._id,
        email: patient.email,
        fullName: patient.fullName,
        phone: patient.phone,
        age: patient.age,
        gender: patient.gender,
        isVerified: patient.isVerified
      }
    });
  } catch (error) {
    console.error('Error verifying login OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
});

export default router;
