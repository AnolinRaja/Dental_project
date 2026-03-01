require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const doctorProfileRoutes = require('./routes/doctorProfileRoutes');
const patientRoutes = require('./routes/patientRoutes');
const patientAuthRoutes = require('./routes/patientAuthRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const contactRoutes = require('./routes/contactRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ========================
// Security Middleware
// ========================
app.use(helmet()); // Secure HTTP headers
app.use(compression()); // Gzip compression

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter); // Apply to all routes

// More strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later.'
});

// ========================
// Middleware
// ========================
const allowedOrigins = [
  process.env.FRONTEND_URL, // Production frontend
  'http://localhost:3000',     // Local development
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow vercel preview deployments
      if (/\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Static files for uploads from the /tmp directory
app.use('/uploads', express.static('/tmp/uploads'));

// Ensure uploads folder exists in /tmp
const uploadsDir = path.join('/tmp', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✓ Uploads directory created in /tmp');
}

// ========================
// Database Connection
// ========================
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dental-clinic';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✓ MongoDB Connected');
    console.log(`  URI: ${mongoURI}`);
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    // process.exit(1); // Exiting the process is not ideal for serverless functions
  }
};

connectDB();

// ========================
// Routes
// ========================
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/doctor-profile', doctorProfileRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/patient-auth', patientAuthRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Dental Clinic Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      doctors: '/api/doctors',
      patients: '/api/patients',
      appointments: '/api/appointments',
      health: '/api/health'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// ========================
// Server Start
// ========================
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  Dental Clinic Management - Backend   ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`✓ Server running on: http://0.0.0.0:${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ API Health: http://localhost:${PORT}/api/health`);
    console.log(`✓ Uploads folder: ${uploadsDir}`);
    console.log('');
  });
}

module.exports = app;

