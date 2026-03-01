import mongoose from 'mongoose';

const PatientSchema = new mongoose.Schema({
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
    unique: true,
    sparse: true,
    default: ''
  },
  age: {
    type: Number,
    min: 0,
    max: 150,
    default: 0
  },
  gender: {
    type: String,
    enum: [null, 'Male', 'Female', 'Other'],
    default: null
  },
  address: {
    type: String,
    default: ''
  },
  doctorType: {
    type: String,
    enum: [null, 'General', 'Dental'],
    default: null
  },
  medicalHistory: {
    type: String,
    default: ''
  },
  symptoms: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  },
  otpAttempts: {
    type: Number,
    default: 0
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

export default mongoose.model('Patient', PatientSchema);
