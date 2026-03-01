import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold text-xl">🦷</span>
              </div>
              <h3 className="text-2xl font-bold">Dental Clinic</h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Providing exceptional dental care with modern technology and compassionate professionals dedicated to your oral health.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors">f</a>
              <a href="#" className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors">𝕏</a>
              <a href="#" className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors">📷</a>
              <a href="#" className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors">in</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary-500 rounded"></span>
              Navigation
            </h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors">Book Appointment</Link></li>
              <li><Link to="/doctor-portal" className="text-primary-400 hover:text-white transition-colors font-semibold">For Doctors</Link></li>
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary-500 rounded"></span>
              Services
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">General Checkups</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cleaning</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Orthodontics</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cosmetic Surgery</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary-500 rounded"></span>
              Contact
            </h4>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <span className="text-xl mt-1">📍</span>
                <div>
                  <p className="text-gray-400">123 Dental Street</p>
                  <p className="text-gray-400">Healthcare City</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-xl">📞</span>
                <p className="text-gray-400">+1 (555) 123-4567</p>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-xl">📧</span>
                <p className="text-gray-400">info@dentalclinic.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left text-gray-400 text-sm">
            <p>&copy; {currentYear} Dental Clinic Management. All rights reserved.</p>
            <p>Designed & Developed with 💙</p>
            <div className="flex gap-4 justify-center md:justify-end">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <div className="flex justify-center py-6 border-t border-gray-700">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full transition-colors text-sm font-semibold"
        >
          ↑ Back to Top
        </button>
      </div>
    </footer>
  );
};

export default Footer;
