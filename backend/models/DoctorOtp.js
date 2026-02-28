const mongoose = require('mongoose');

const DoctorOtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  used: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('DoctorOtp', DoctorOtpSchema);
