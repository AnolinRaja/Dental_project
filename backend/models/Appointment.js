import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
    sparse: true
  },
  completedAt: {
    type: Date,
    default: null // When appointment was marked as completed
  },
  paymentPhoto: {
    type: String,
    default: null // URL to proof of payment image (screenshot of QR transfer)
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    default: null
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  notes: {
    type: String,
    default: ''
  },
  reasonForVisit: {
    type: String,
    default: ''
  },
  doctorNotes: {
    type: String,
    default: ''
  },
  treatmentCost: {
    type: Number,
    default: 0 // Amount charged to patient
  },
  expenses: {
    type: Number,
    default: 0 // Doctor's expenses for this appointment
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Cancelled'],
    default: 'Pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  documentUrl: {
    type: String,
    default: null
  },
  emailNotificationSent: {
    type: Boolean,
    default: false
  },
  history: [
    {
      status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      notes: {
        type: String,
        default: ''
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Appointment', AppointmentSchema);
