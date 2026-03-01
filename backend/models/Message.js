import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String, default: 'General Inquiry' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  notified: { type: Boolean, default: false },
}, { timestamps: true });

const Message = mongoose.model('Message', MessageSchema);
export default Message;
