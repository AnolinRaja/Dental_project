import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">About Our Clinic</h1>
          <p className="text-xl md:text-2xl text-gray-100 max-w-2xl mx-auto">Delivering excellence in dental care since 2003</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Mission */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border-l-4 border-primary-500">
              <h2 className="text-3xl font-bold mb-4 text-gray-800 flex items-center gap-3">
                <span className="text-4xl">🎯</span>
                Our Mission
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                At Dental Clinic Management, our mission is to provide comprehensive, high-quality dental care to patients of all ages. We are committed to promoting oral health and restoring confident smiles through advanced treatment options and compassionate patient care.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border-l-4 border-secondary-500">
              <h2 className="text-3xl font-bold mb-4 text-gray-800 flex items-center gap-3">
                <span className="text-4xl">✨</span>
                Our Vision
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                To be the most trusted dental clinic in the region, recognized for our commitment to excellence, innovation, and patient satisfaction. We envision a community where everyone has access to quality dental care and maintains optimal oral health.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: '❤️', title: 'Compassion', desc: 'Treating every patient with care and empathy' },
              { icon: '⚡', title: 'Excellence', desc: 'Delivering the highest quality of care' },
              { icon: '🔬', title: 'Innovation', desc: 'Using latest technology and techniques' },
              { icon: '🤝', title: 'Trust', desc: 'Building lasting relationships with patients' }
            ].map((value, index) => (
              <div key={index} className="bg-gradient-to-br from-primary-50 to-secondary-50 p-8 rounded-xl border-2 border-primary-100 hover:shadow-lg transition-shadow text-center">
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Our Expert Team</h2>
            <p className="text-xl text-gray-600">Experienced professionals dedicated to your oral health</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Dr. Sarah Johnson', role: 'General Dentist', specialty: '15+ years experience', icon: '👩‍⚕️' },
              { name: 'Dr. Michael Chen', role: 'Orthodontist', specialty: 'Smile alignment specialist', icon: '👨‍⚕️' },
              { name: 'Dr. Emily Davis', role: 'Cosmetic Dentist', specialty: 'Aesthetic expertise', icon: '👩‍⚕️' }
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all">
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 h-24 flex items-center justify-center">
                  <span className="text-6xl">{member.icon}</span>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{member.name}</h3>
                  <p className="text-primary-600 font-semibold mb-2">{member.role}</p>
                  <p className="text-gray-600">{member.specialty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Why Choose Us?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: '🏥', title: 'Modern Facilities', desc: 'State-of-the-art equipment and comfortable treatment rooms' },
              { icon: '📅', title: 'Flexible Scheduling', desc: 'Convenient appointment times to fit your lifestyle' },
              { icon: '💰', title: 'Affordable Pricing', desc: 'Transparent costs with flexible payment options' },
              { icon: '🔐', title: 'Safety First', desc: 'Highest standards of sterilization and hygiene' },
              { icon: '👥', title: 'Patient-Centric', desc: 'Your comfort and satisfaction are our priority' },
              { icon: '🎓', title: 'Continuous Learning', desc: 'Our team stays updated with latest dental techniques' }
            ].map((item, index) => (
              <div key={index} className="flex gap-4 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
                <div className="text-4xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Get In Touch With Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white bg-opacity-10 p-8 rounded-xl backdrop-blur">
              <div className="text-4xl mb-4">📍</div>
              <p className="text-lg font-semibold mb-2">Address</p>
              <p className="text-gray-100">123 Dental Street</p>
              <p className="text-gray-100">Healthcare City</p>
            </div>
            <div className="bg-white bg-opacity-10 p-8 rounded-xl backdrop-blur">
              <div className="text-4xl mb-4">📞</div>
              <p className="text-lg font-semibold mb-2">Phone</p>
              <p className="text-gray-100">+1 (555) 123-4567</p>
              <p className="text-gray-200 text-sm mt-2">Mon-Fri 9AM-6PM</p>
            </div>
            <div className="bg-white bg-opacity-10 p-8 rounded-xl backdrop-blur">
              <div className="text-4xl mb-4">📧</div>
              <p className="text-lg font-semibold mb-2">Email</p>
              <p className="text-gray-100">info@dentalclinic.com</p>
              <p className="text-gray-200 text-sm mt-2">Response within 24hrs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Space */}
      <div className="h-10"></div>
    </div>
  );
};

export default About;
