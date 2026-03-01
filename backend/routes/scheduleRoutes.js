import express from 'express';
import jwt from 'jsonwebtoken';
import DoctorSchedule from '../models/DoctorSchedule.js';

const router = express.Router();

// Protect route with doctor auth
const requireDoctorToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    console.log('❌ No token provided in Authorization header');
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✓ Token verified for:', decoded.email);
    req.doctorEmail = decoded.email;
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    res.status(401).json({ success: false, message: 'Invalid or expired token', error: error.message });
  }
};

/**
 * Get all doctor schedules
 * GET /api/schedule
 */
router.get('/', async (req, res) => {
  try {
    const schedules = await DoctorSchedule.find().sort({ createdAt: 1 });
    res.json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching schedule', error: error.message });
  }
});

/**
 * Update or create schedule for a day
 * POST /api/schedule
 */
router.post('/', requireDoctorToken, async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, isOffDay } = req.body;
    
    console.log('📝 Schedule save request for day:', dayOfWeek);
    console.log('   Data received:', { dayOfWeek, startTime, endTime, isOffDay });

    if (!dayOfWeek) {
      return res.status(400).json({ success: false, message: 'dayOfWeek required' });
    }

    const existing = await DoctorSchedule.findOne({ dayOfWeek });
    if (existing) {
      console.log('   Updating existing schedule');
      existing.startTime = startTime || existing.startTime;
      existing.endTime = endTime || existing.endTime;
      existing.isOffDay = isOffDay !== undefined ? isOffDay : existing.isOffDay;
      await existing.save();
      console.log('✓ Schedule updated');
      return res.json({ success: true, data: existing });
    }

    console.log('   Creating new schedule');
    const schedule = await DoctorSchedule.create({ dayOfWeek, startTime, endTime, isOffDay });
    console.log('✓ Schedule created');
    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    console.error('❌ Error saving schedule:', error.message);
    res.status(500).json({ success: false, message: 'Error saving schedule', error: error.message });
  }
});

export default router;
