import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Register from './pages/Register';
import Contact from './pages/Contact';
import DoctorPortal from './pages/DoctorPortal';
import PatientAuth from './pages/PatientAuth';
import PatientDashboard from './pages/PatientDashboard';
import PaymentPage from './pages/PaymentPage';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/doctor-portal" element={<DoctorPortal />} />
            <Route path="/patient-auth" element={<PatientAuth />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/dashboard" element={<PatientDashboard />} />
            <Route path="/payment/:appointmentId" element={<PaymentPage />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
