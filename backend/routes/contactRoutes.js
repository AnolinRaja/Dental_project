const express = require('express');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const { sendContactNotificationEmail } = require('../utils/sendEmail');

const router = express.Router();

// Debug: indicate the contact router was loaded
console.log('⚙️ Contact routes initialized');

/**
 * Submit contact message (public)
 * POST /api/contacts
 */
router.post('/', async (req, res) => {
  console.log('→ POST /api/contacts', { body: req.body });
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required' });
    }

    const msg = new Message({ name, email, phone, subject, message });
    await msg.save();

    // send notification to doctor/admin via Gmail
    try {
      await sendContactNotificationEmail(msg);
      msg.notified = true;
      await msg.save();
    } catch (err) {
      console.error('Failed sending contact notification:', err.message || err);
    }

    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

/**
 * Get all contact messages (protected for doctor)
 * GET /api/contacts
 * Optional ?date=YYYY-MM-DD to filter by that day
 */
router.get('/', async (req, res) => {
  console.log('→ GET /api/contacts', { query: req.query, headers: { authorization: req.headers.authorization } });
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
    try { jwt.verify(token, process.env.JWT_SECRET); } catch (err) { return res.status(401).json({ success: false, message: 'Invalid token' }); }

    const { date } = req.query;
    let filter = {};
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const messages = await Message.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: messages, count: messages.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching messages', error: error.message });
  }
});

/**
 * Mark message as read
 * PUT /api/contacts/:id/read
 */
router.put('/:id/read', async (req, res) => {
  console.log('→ PUT /api/contacts/:id/read', { id: req.params.id, headers: { authorization: req.headers.authorization } });
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
    try { jwt.verify(token, process.env.JWT_SECRET); } catch (err) { return res.status(401).json({ success: false, message: 'Invalid token' }); }

    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    msg.read = true;
    await msg.save();
    res.json({ success: true, message: 'Marked as read', data: msg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating message', error: error.message });
  }
});

module.exports = router;
