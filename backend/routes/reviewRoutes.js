const express = require('express');
const Review = require('../models/Review');

const router = express.Router();

/**
 * Create review (patient)
 * POST /api/reviews
 */
router.post('/', async (req, res) => {
  try {
    const { patientId, appointmentId, doctorEmail, rating, comment, categories } = req.body;
    if (!patientId || !appointmentId || !doctorEmail || !rating) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const review = await Review.create({
      patientId,
      appointmentId,
      doctorEmail,
      rating,
      comment,
      categories
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating review', error: error.message });
  }
});

/**
 * Get reviews for doctor
 * GET /api/reviews?doctorEmail=xxx&approved=true
 */
router.get('/', async (req, res) => {
  try {
    const { doctorEmail, approved } = req.query;
    let filter = {};
    if (doctorEmail) filter.doctorEmail = doctorEmail;
    if (approved === 'true') filter.status = 'Approved';

    const reviews = await Review.find(filter).populate('patientId', 'fullName').sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching reviews', error: error.message });
  }
});

/**
 * Get single review
 * GET /api/reviews/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching review', error: error.message });
  }
});

module.exports = router;
