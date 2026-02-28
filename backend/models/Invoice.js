const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  invoiceNumber: { type: String, unique: true, required: true },
  items: [
    {
      description: String,
      quantity: Number,
      rate: Number,
      amount: Number
    }
  ],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Paid', 'Overdue'], default: 'Pending' },
  dueDate: { type: Date },
  paidDate: { type: Date },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
