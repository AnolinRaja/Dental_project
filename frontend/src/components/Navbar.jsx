import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(prev => !prev);

  // lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isOpen]);
  return (
    <nav className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-xl">🦷</span>
            </div>
            <span className="hidden sm:block font-bold text-xl">Dental Clinic</span>
          </Link>

          {/* mobile menu button */}
          <button
            className="sm:hidden focus:outline-none z-20"
            onClick={toggleMenu}
            aria-label="Toggle navigation"
          >
            {isOpen ? (
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>

          {/* Desktop/large links */}
          <div className="hidden sm:flex sm:flex-row sm:space-x-6 items-center">
            <Link to="/" className="hover:text-secondary-200 transition-colors">
              Home
            </Link>
            <Link to="/about" className="hover:text-secondary-200 transition-colors">
              About
            </Link>
            <Link to="/services" className="hover:text-secondary-200 transition-colors">
              Services
            </Link>
            <Link to="/contact" className="hover:text-secondary-200 transition-colors">
              Contact
            </Link>
            <Link
              to="/patient-auth"
              className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-secondary-100 transition-colors"
            >
              Patient Portal
            </Link>
          </div>
        </div>

        {/* Mobile menu overlay (fixed with backdrop) */}
        {isOpen && (
          <div className="fixed inset-0 z-50">
            {/* backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* panel */}
            <div className="absolute top-16 left-0 right-0 bottom-0 bg-gray-900 text-white p-6 overflow-auto">
              <nav className="flex flex-col gap-3 max-w-md mx-auto">
                <Link to="/" onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300 active:text-gray-100 transition-colors py-3 px-3 rounded-md text-lg font-medium">Home</Link>
                <Link to="/about" onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300 active:text-gray-100 transition-colors py-3 px-3 rounded-md text-lg font-medium">About</Link>
                <Link to="/services" onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300 active:text-gray-100 transition-colors py-3 px-3 rounded-md text-lg font-medium">Services</Link>
                <Link to="/contact" onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300 active:text-gray-100 transition-colors py-3 px-3 rounded-md text-lg font-medium">Contact</Link>
                <Link to="/patient-auth" onClick={() => setIsOpen(false)} className="mt-4 bg-primary-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-primary-700 active:bg-primary-800 transition-colors text-center">Patient Portal</Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
