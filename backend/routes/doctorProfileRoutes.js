import express from 'express';
import jwt from 'jsonwebtoken';
import DoctorProfile from '../models/DoctorProfile.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = '/tmp/uploads/qrcodes';
    require('fs').mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `qr_${req.doctorEmail}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to verify doctor token
const requireDoctorToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.doctorEmail = decoded.email;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/**
 * Get doctor profile
 * GET /api/doctor-profile
 */
router.get('/', requireDoctorToken, async (req, res) => {
  try {
    let profile = await DoctorProfile.findOne({ doctorEmail: req.doctorEmail });
    
    if (!profile) {
      // Create default profile if doesn't exist
      profile = await DoctorProfile.create({ doctorEmail: req.doctorEmail });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
});

/**
 * Public endpoint to fetch the configured doctor's profile
 * GET /api/doctor-profile/public
 */
router.get('/public', async (req, res) => {
  try {
    const doctorEmail = process.env.DOCTOR_EMAIL;
    if (!doctorEmail) {
      return res.status(400).json({ success: false, message: 'Doctor not configured' });
    }

    let profile = await DoctorProfile.findOne({ doctorEmail });
    if (!profile) {
      profile = await DoctorProfile.create({ doctorEmail });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching public doctor profile:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
});

/**
 * Update doctor profile
 * PUT /api/doctor-profile
 */
router.put('/', requireDoctorToken, async (req, res) => {
  try {
    const { upiId, bankDetails } = req.body;

    const profile = await DoctorProfile.findOneAndUpdate(
      { doctorEmail: req.doctorEmail },
      {
        upiId,
        paymentMethods: {
          acceptUPI: true,
          upiAddress: upiId
        },
        bankDetails,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
});

/**
 * Upload QR code
 * POST /api/doctor-profile/upload-qr
 */
router.post('/upload-qr', requireDoctorToken, upload.single('qrCode'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const qrCodeUrl = `/uploads/qrcodes/${req.file.filename}`;

    const profile = await DoctorProfile.findOneAndUpdate(
      { doctorEmail: req.doctorEmail },
      {
        qrCodeUrl,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    console.log(`✓ QR code uploaded for doctor: ${req.doctorEmail}`);
    res.json({ success: true, message: 'QR code uploaded successfully', data: profile });
  } catch (error) {
    console.error('Error uploading QR code:', error);
    res.status(500).json({ success: false, message: 'Error uploading QR code', error: error.message });
  }
});

export default router;
