import mongoose from 'mongoose';

const DoctorOtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  used: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model('DoctorOtp', DoctorOtpSchema);
