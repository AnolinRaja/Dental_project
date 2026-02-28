import React from 'react';
import RegistrationForm from '../components/RegistrationForm';

const Register = () => {
  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Patient Registration</h1>
          <p className="text-gray-600 text-lg">
            Fill out the form below to book an appointment with our clinic.
          </p>
        </div>
        <RegistrationForm />
      </div>
    </div>
  );
};

export default Register;
