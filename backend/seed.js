require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const Message = require('./models/Message');

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dental-clinic';

const run = async () => {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for seeding');

    const seedPath = path.join(__dirname, 'data', 'seedData.json');
    if (!fs.existsSync(seedPath)) {
      console.error('Seed data not found:', seedPath);
      process.exit(1);
    }

    const raw = fs.readFileSync(seedPath, 'utf8');
    const data = JSON.parse(raw);

    // Clear collections
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Message.deleteMany({});

    // Insert patients
    const createdPatients = await Patient.insertMany(data.patients || []);
    console.log('Inserted patients:', createdPatients.length);

    // Insert messages
    const createdMessages = await Message.insertMany(data.messages || []);
    console.log('Inserted messages:', createdMessages.length);

    // Create appointments linked to first patient if present
    if ((data.appointments || []).length > 0 && createdPatients.length > 0) {
      const appts = data.appointments.map(a => ({
        ...a,
        patientId: createdPatients[0]._id,
        appointmentDate: a.appointmentDate ? new Date(a.appointmentDate) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        reasonForVisit: a.reasonForVisit || 'General'
      }));
      const createdAppts = await Appointment.insertMany(appts);
      console.log('Inserted appointments:', createdAppts.length);
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error', err);
    process.exit(1);
  }
};

run();
