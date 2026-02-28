import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 text-white py-32 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">Your Smile, Our Priority</h1>
          <p className="text-lg md:text-2xl mb-10 text-gray-100 max-w-2xl mx-auto">
            Professional dental care designed for your comfort and health. Book your appointment today!
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary-600 px-10 py-4 rounded-full font-bold hover:bg-gray-100 hover:shadow-2xl shadow-lg transition-all duration-300 transform hover:scale-105 text-lg"
          >
            📅 Book Appointment
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: '5000+', label: 'Happy Patients' },
              { number: '20+', label: 'Years Experience' },
              { number: '99%', label: 'Satisfaction Rate' },
              { number: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border-2 border-primary-100 hover:shadow-lg transition-shadow">
                <h3 className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">{stat.number}</h3>
                <p className="text-gray-700 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Why Choose Our Clinic?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">We provide the best dental care experience with modern technology and compassionate service</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '👨‍⚕️',
                title: 'Expert Doctors',
                description: 'Experienced and certified dental professionals with latest qualifications'
              },
              {
                icon: '⏰',
                title: 'Easy Booking',
                description: 'Simple online appointment scheduling available 24/7'
              },
              {
                icon: '💻',
                title: 'Modern Facilities',
                description: 'State-of-the-art technology and comfortable treatment rooms'
              },
              {
                icon: '💰',
                title: 'Affordable Pricing',
                description: 'Transparent pricing with flexible payment options'
              },
              {
                icon: '🛡️',
                title: 'Safe & Hygienic',
                description: 'Highest standards of sterilization and infection control'
              },
              {
                icon: '😊',
                title: 'Friendly Staff',
                description: 'Caring professionals dedicated to your comfort'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-l-4 border-primary-500">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">What Our Patients Say</h2>
            <p className="text-xl text-gray-600">Real stories from satisfied patients</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Johnson', text: 'Amazing service! The doctors are very professional and friendly. Highly recommended!', rating: 5 },
              { name: 'Michael Chen', text: 'Best dental clinic I\'ve been to. Clean, modern, and the staff made me feel comfortable.', rating: 5 },
              { name: 'Emily Davis', text: 'Great experience from booking to treatment. Will definitely come back for my next checkup.', rating: 5 }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-primary-50 to-secondary-50 p-8 rounded-xl border-2 border-primary-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-2xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">\"${testimonial.text}\"</p>
                <p className="font-bold text-gray-800">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20 rounded-2xl mx-4 md:mx-0">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready for Your Best Smile?</h2>
          <p className="text-lg md:text-xl mb-10 text-gray-100">Join thousands of happy patients. Schedule your appointment today and experience the difference!</p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary-600 px-10 py-4 rounded-full font-bold hover:bg-gray-100 hover:shadow-2xl shadow-lg transition-all duration-300 transform hover:scale-105 text-lg"
          >
            Get Started Now →
          </Link>
        </div>
      </section>

      {/* Space */}
      <div className="h-10"></div>
    </div>
  );
};

export default Home;
