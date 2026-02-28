🏥 Dental Clinic Management System
Full-Stack MERN Application

A modern MERN stack (MongoDB, Express, React, Node.js) web application designed to manage dental clinic operations efficiently.

The platform enables patients to register and book appointments, while doctors/admins can manage schedules, track patient records, and send notifications.

📑 Table of Contents

Features

Tech Stack

Project Structure

Prerequisites

Installation Guide

Environment Variables

Running the Application

API Endpoints

Database Schema

Email Configuration

Troubleshooting

Future Enhancements

✨ Features
👤 Patient Features

User registration with detailed form

Doctor specialization selection (General / Dental)

Medical history & symptoms tracking

File/document uploads

Email appointment confirmations

Appointment status tracking

🩺 Doctor / Admin Features

Secure admin authentication (JWT)

Manage and view appointments

Assign doctors to patients

Update appointment status

Send patient notifications

Add medical notes

⚙️ Technical Highlights

JWT authentication

MongoDB Atlas support

Email notifications (Nodemailer)

File uploads with Multer

RESTful API

Tailwind responsive UI

Environment-based configuration

🛠 Tech Stack
Backend

Node.js

Express.js

MongoDB (Atlas or Local)

JWT Authentication

Nodemailer

Multer

dotenv

Frontend

React 18

React Router v6

Tailwind CSS

Axios

React Hot Toast

📁 Project Structure
Dental-Clinic-Management
 ├── backend
 │   ├── models
 │   ├── routes
 │   ├── utils
 │   ├── uploads
 │   └── server.js
 │
 ├── frontend
 │   ├── public
 │   ├── src
 │   │   ├── components
 │   │   └── pages
 │   └── package.json
 │
 └── README.md
📋 Prerequisites

Make sure you have installed:

Node.js (v14+)

npm

MongoDB (Local or Atlas)

Git (optional)

Check versions:

node -v
npm -v
🚀 Installation Guide
1️⃣ Clone Repository
git clone <repo-url>
cd Dental-Clinic-Management
2️⃣ Backend Setup
cd backend
npm install

Create .env from example:

cp .env.example .env

Run backend:

npm run dev

Backend runs at 👉 http://localhost:5000

3️⃣ Frontend Setup
cd frontend
npm install
npm start

Frontend runs at 👉 http://localhost:3000

🔐 Environment Variables

Create backend/.env

MONGO_URI=your_connection_string
PORT=5000
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:3000

⚠️ Never commit .env to GitHub

▶️ Running the App
Terminal 1
cd backend
npm run dev
Terminal 2
cd frontend
npm start
📡 API Endpoints
Auth
POST /api/auth/login
POST /api/auth/verify
Patients
POST /api/patients/register
GET /api/patients
GET /api/patients/:id
PUT /api/patients/:id
DELETE /api/patients/:id
Appointments
POST /api/appointments
GET /api/appointments
PUT /api/appointments/:id
DELETE /api/appointments/:id
Health
GET /api/health

💾 Database Schema
Patient

name

email

phone

age

gender

medicalHistory

symptoms

Doctor

name

specialization

licenseNumber

availability

Appointment

patientId

doctorId

date

status

notes

📧 Email Configuration

Uses Nodemailer with Gmail App Password.

Steps:

Enable 2FA

Generate App Password

Add to .env

🔧 Troubleshooting
MongoDB connection error

👉 Check URI and database running

Email not sending

👉 Verify app password

CORS error

👉 Ensure frontend URL matches backend

Port already in use

Change PORT in .env

🚀 Future Enhancements

Online payments

SMS notifications

Video consultation

Patient dashboard

Doctor dashboard

Appointment reminders

Analytics

📄 License

MIT License — free to use and modify.

👨‍💻 Development Notes
Add new route

Create file in routes and import in server.

Add new page

Create component in pages and add route in React router.

✅ Setup Checklist

Install dependencies

Configure .env

Start backend

Start frontend

Test API

Register patient