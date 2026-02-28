const mongoose = require('mongoose');

const DoctorScheduleSchema = new mongoose.Schema({
  dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
  startTime: { type: String, required: true }, // HH:MM format (09:00)
  endTime: { type: String, required: true }, // HH:MM format (17:00)
  isOffDay: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DoctorSchedule', DoctorScheduleSchema);
