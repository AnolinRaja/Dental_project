import express from 'express';
import Appointment from '../models/Appointment.js';
import { sendAppointmentConfirmedEmail } from '../utils/sendEmail.js';

const router = express.Router();

/**
 * Create a new appointment
 * POST /api/appointments
 */
router.post('/', async (req, res) => {
  try {
    const { patientId, appointmentDate, timeSlot, reasonForVisit, notes } = req.body;

    if (!patientId || !appointmentDate) {
      return res.status(400).json({
        success: false,
        message: 'patientId and appointmentDate are required'
      });
    }

    const newAppointment = new Appointment({
      patientId,
      appointmentDate,
      timeSlot: timeSlot || '',
      reasonForVisit: reasonForVisit || '',
      notes: notes || '',
      status: 'Pending'
    });

    const savedAppointment = await newAppointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: savedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message
    });
  }
});

/**
 * Get all appointments
 * GET /api/appointments
 */
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'fullName email phone')
      .populate('doctorId', 'fullName specialization')
      .sort({ appointmentDate: -1 });

    res.json({
      success: true,
      data: appointments
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
 * Get appointments by patient ID
 * GET /api/appointments/patient/:patientId
 */
router.get('/patient/:patientId', async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.params.patientId })
      .populate('doctorId', 'fullName specialization')
      .sort({ appointmentDate: -1 });

    res.json({
      success: true,
      data: appointments
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
 * Get a specific appointment
 * GET /api/appointments/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId')
      .populate('doctorId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message
    });
  }
});

/**
 * Update appointment status
 * PUT /api/appointments/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { status, doctorId, doctorNotes, timeSlot } = req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status,
        doctorId: doctorId || undefined,
        doctorNotes: doctorNotes || undefined,
        timeSlot: timeSlot || undefined,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('patientId').populate('doctorId');

    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Send confirmation email if status changed to Confirmed
    if (status === 'Confirmed' && updatedAppointment.patientId) {
      const patientEmail = updatedAppointment.patientId.email;
      const patientName = updatedAppointment.patientId.fullName;
      const doctorName = updatedAppointment.doctorId?.fullName || 'Clinic Staff';
      const doctorType = updatedAppointment.doctorId?.specialization || 'General';

      await sendAppointmentConfirmedEmail(
        patientEmail,
        patientName,
        updatedAppointment.appointmentDate,
        doctorName,
        doctorType
      );
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating appointment',
      error: error.message
    });
  }
});

/**
 * Delete an appointment
 * DELETE /api/appointments/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!deletedAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment deleted successfully',
      data: deletedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting appointment',
      error: error.message
    });
  }
});

export default router;
