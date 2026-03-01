import mongoose from 'mongoose';

const DoctorProfileSchema = new mongoose.Schema({
  doctorEmail: {
    type: String,
    required: true,
    unique: true
  },
  upiId: {
    type: String,
    default: '' // UPI address (e.g., doctor@upi)
  },
  qrCodeUrl: {
    type: String,
    default: null // URL to the uploaded QR code image
  },
  paymentMethods: {
    acceptUPI: { type: Boolean, default: true },
    upiAddress: { type: String, default: '' }
  },
  bankDetails: {
    accountHolderName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('DoctorProfile', DoctorProfileSchema);
