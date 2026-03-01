const express = require('express');
const Appointment = require('../models/Appointment');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer storage for payment proof photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = '/tmp/uploads/payment-proofs';
    require('fs').mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `proof_${timestamp}_${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * Get payment details for appointment
 * GET /api/payments/:appointmentId
 */
router.get('/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId).populate('patientId');
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: {
        appointmentId: appointment._id,
        patientName: appointment.patientId.fullName,
        patientEmail: appointment.patientId.email,
        appointmentDate: appointment.appointmentDate,
        treatmentCost: appointment.treatmentCost,
        paymentStatus: appointment.paymentStatus,
        timeSlot: appointment.timeSlot,
        doctorName: process.env.DOCTOR_NAME || process.env.DOCTOR_EMAIL || 'Doctor',
        doctorId: appointment.doctorId || null
      }
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment details',
      error: error.message
    });
  }
});

/**
 * Upload payment proof (payment screenshot)
 * POST /api/payments/:appointmentId/upload-proof
 */
router.post('/:appointmentId/upload-proof', upload.single('paymentProof'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { appointmentId } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        paymentPhoto: `/uploads/payment-proofs/${req.file.filename}`,
        paymentStatus: 'Pending Verification',
        updatedAt: new Date()
      },
      { new: true }
    ).populate('patientId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment proof uploaded successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading payment proof',
      error: error.message
    });
  }
});

module.exports = router;
