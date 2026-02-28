const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /.+\@.+\..+/
  },
  phone: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    enum: ['General', 'Dental'],
    required: true
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  qualification: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: null
  },
  availability: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', DoctorSchema);
