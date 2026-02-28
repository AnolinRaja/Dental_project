import React from 'react';
import { Link } from 'react-router-dom';

const Services = () => {
  const services = [
    {
      icon: '🦷',
      title: 'General Dental Checkups',
      description: 'Regular dental examinations to maintain oral health and detect potential issues early.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '✨',
      title: 'Dental Cleaning',
      description: 'Professional cleaning and hygiene treatments to keep your teeth healthy and bright.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: '🪥',
      title: 'Cavity Treatment',
      description: 'Effective cavity treatment and filling procedures using modern materials.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: '⚡',
      title: 'Root Canal Therapy',
      description: 'Advanced root canal treatments to save infected or damaged teeth.',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: '🎯',
      title: 'Orthodontics',
      description: 'Braces and alignment treatments for a perfectly straight smile.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: '💎',
      title: 'Cosmetic Dentistry',
      description: 'Teeth whitening, veneers, and other cosmetic procedures for your dream smile.',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Services</h1>
          <p className="text-xl md:text-2xl text-gray-100 max-w-2xl mx-auto">Comprehensive dental care solutions tailored to meet your needs</p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden border-t-4 border-primary-500"
              >
                {/* Color Bar */}
                <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
                
                <div className="p-8">
                  {/* Icon */}
                  <div className={`text-6xl mb-6 inline-block p-4 rounded-xl bg-gradient-to-br ${service.color} text-white group-hover:scale-110 transition-transform`}>
                    {service.icon}
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-primary-600 transition-colors">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  
                  {/* Divider */}
                  <div className="mt-6 pt-6 border-t border-gray-200"></div>
                  
                  {/* Learn More */}
                  <button className="mt-4 text-primary-600 font-semibold hover:text-primary-800 transition-colors flex items-center gap-2 group/btn">
                    Learn more 
                    <span className="transform group-hover/btn:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Simple Steps to Better Oral Health</h2>
            <p className="text-xl text-gray-600">Our hassle-free process makes getting dental care easy</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Book', desc: 'Schedule your appointment online' },
              { step: '2', title: 'Consult', desc: 'Meet with our experienced dentist' },
              { step: '3', title: 'Treat', desc: 'Receive professional dental care' },
              { step: '4', title: 'Smile', desc: 'Enjoy your healthier, brighter smile' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="inline-block mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-600 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20 mx-4 md:mx-0 rounded-3xl">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Important Notice</h2>
          <p className="text-lg md:text-xl mb-10 text-gray-100">If you don't see your specific dental need in our listed services, please don't hesitate to contact us. We offer comprehensive dental care and can discuss your specific requirements.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/register"
              className="inline-block bg-white text-primary-600 px-10 py-4 rounded-full font-bold hover:bg-gray-100 hover:shadow-2xl shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Book Now
            </Link>
            <Link
              to="/contact"
              className="inline-block border-2 border-white text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-primary-600 transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Space */}
      <div className="h-10"></div>
    </div>
  );
};

export default Services;
