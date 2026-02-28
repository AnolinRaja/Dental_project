const express = require('express');
const jwt = require('jsonwebtoken');
const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');

const router = express.Router();

const requireDoctorToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

/**
 * Create invoice (doctor only)
 * POST /api/invoices
 */
router.post('/', requireDoctorToken, async (req, res) => {
  try {
    const { patientId, appointmentId, items, subtotal, tax, total, dueDate, notes } = req.body;
    if (!patientId || !items || !total) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const invoiceNumber = 'INV-' + Date.now();
    const invoice = await Invoice.create({
      patientId,
      appointmentId,
      invoiceNumber,
      items,
      subtotal,
      tax,
      total,
      dueDate,
      notes
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating invoice', error: error.message });
  }
});

/**
 * Get invoices for a patient (patient or doctor)
 * GET /api/invoices?patientId=xxx
 */
router.get('/', async (req, res) => {
  try {
    const { patientId } = req.query;
    if (!patientId) return res.status(400).json({ success: false, message: 'patientId required' });

    const invoices = await Invoice.find({ patientId }).sort({ createdAt: -1 });
    res.json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching invoices', error: error.message });
  }
});

/**
 * Get single invoice
 * GET /api/invoices/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('patientId');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching invoice', error: error.message });
  }
});

/**
 * Update invoice status
 * PUT /api/invoices/:id
 */
router.put('/:id', requireDoctorToken, async (req, res) => {
  try {
    const { status, paidDate } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status, paidDate: status === 'Paid' ? new Date() : paidDate },
      { new: true }
    );
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating invoice', error: error.message });
  }
});

module.exports = router;
