import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;

const PatientAuth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('register'); // 'register' or 'login'
  const [step, setStep] = useState(1); // Step 1: form, Step 2: OTP verification

  // Registration form state
  const [regFormData, setRegFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
    doctorType: ''
  });
  const [regOtp, setRegOtp] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Handle registration form input
  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setRegFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Send OTP for registration
  const handleRegisterSendOtp = async (e) => {
    e.preventDefault();

    // Validation
    if (!regFormData.fullName || !regFormData.email || !regFormData.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    setRegLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/patient-auth/send-otp-registration`,
        {
          email: regFormData.email,
          fullName: regFormData.fullName
        }
      );

      if (response.data.success) {
        setStep(2);
        toast.success('OTP sent to your email!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setRegLoading(false);
    }
  };

  // Verify OTP for registration
  const handleRegisterVerifyOtp = async (e) => {
    e.preventDefault();

    if (!regOtp) {
      toast.error('Please enter the OTP');
      return;
    }

    setRegLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/patient-auth/verify-otp-registration`,
        {
          email: regFormData.email,
          otp: regOtp
        }
      );

      if (response.data.success) {
        // Save token and patient data
        localStorage.setItem('patientToken', response.data.token);
        localStorage.setItem('patientEmail', regFormData.email);
        localStorage.setItem('patientId', response.data.patientId);
        
        toast.success('Registration successful!');
        navigate('/patient-dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setRegLoading(false);
    }
  };

  // Send OTP for login
  const handleLoginSendOtp = async (e) => {
    e.preventDefault();

    if (!loginEmail) {
      toast.error('Please enter your email');
      return;
    }

    setLoginLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/patient-auth/send-otp-login`,
        { email: loginEmail }
      );

      if (response.data.success) {
        setStep(2);
        toast.success('OTP sent to your email!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoginLoading(false);
    }
  };

  // Verify OTP for login
  const handleLoginVerifyOtp = async (e) => {
    e.preventDefault();

    if (!loginOtp) {
      toast.error('Please enter the OTP');
      return;
    }

    setLoginLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/patient-auth/verify-otp-login`,
        {
          email: loginEmail,
          otp: loginOtp
        }
      );

      if (response.data.success) {
        // Save token and patient data
        localStorage.setItem('patientToken', response.data.token);
        localStorage.setItem('patientEmail', loginEmail);
        localStorage.setItem('patientId', response.data.patientId);

        toast.success('Login successful!');
        navigate('/patient-dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoginLoading(false);
    }
  };

  // Reset form
  const resetForms = () => {
    setStep(1);
    setRegFormData({
      fullName: '',
      email: '',
      phone: '',
      age: '',
      gender: '',
      address: '',
      doctorType: ''
    });
    setRegOtp('');
    setLoginEmail('');
    setLoginOtp('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12">
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🦷 Patient Portal</h1>
          <p className="text-gray-600">Manage your dental appointments</p>
        </div>

        {/* Mode Toggle */}
        <div className="bg-white rounded-lg shadow-lg p-2 mb-8 flex gap-2 border-2 border-primary-200">
          <button
            onClick={() => { setMode('register'); resetForms(); }}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all text-base ${
              mode === 'register'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            📝 New Registration
          </button>
          <button
            onClick={() => { setMode('login'); resetForms(); }}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all text-base ${
              mode === 'login'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            ✓ Already Registered
          </button>
        </div>

        {/* Registration Mode */}
        {mode === 'register' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {step === 1 ? (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Your Account</h2>
                <form onSubmit={handleRegisterSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={regFormData.fullName}
                      onChange={handleRegChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={regFormData.email}
                      onChange={handleRegChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={regFormData.phone}
                      onChange={handleRegChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={regFormData.age}
                      onChange={handleRegChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="25"
                      min="0"
                      max="150"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={regFormData.gender}
                      onChange={handleRegChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={regFormData.address}
                      onChange={handleRegChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="123 Main Street, City, State"
                      rows="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Doctor Type *
                    </label>
                    <select
                      name="doctorType"
                      value={regFormData.doctorType}
                      onChange={handleRegChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select doctor type</option>
                      <option value="General">General</option>
                      <option value="Dental">Dental</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {regLoading ? 'Sending OTP...' : '📧 Send OTP'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Verify Your Email</h2>
                <div className="bg-blue-50 border-l-4 border-primary-600 p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    We've sent a 6-digit code to <strong>{regFormData.email}</strong>
                  </p>
                </div>

                <form onSubmit={handleRegisterVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={regOtp}
                      onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 text-center text-2xl letter-spacing tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="000000"
                      maxLength="6"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading || regOtp.length !== 6}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {regLoading ? 'Verifying...' : '✓ Verify & Register'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    ← Back
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {/* Login Mode */}
        {mode === 'login' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {step === 1 ? (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome Back</h2>
                <form onSubmit={handleLoginSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {loginLoading ? 'Sending OTP...' : '📧 Send OTP'}
                  </button>
                </form>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    ℹ️ Not registered yet? Create a new account using the "New Registration" option above.
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Enter Your OTP</h2>
                <div className="bg-blue-50 border-l-4 border-primary-600 p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    We've sent a 6-digit code to <strong>{loginEmail}</strong>
                  </p>
                </div>

                <form onSubmit={handleLoginVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 text-center text-2xl letter-spacing tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="000000"
                      maxLength="6"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading || loginOtp.length !== 6}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {loginLoading ? 'Verifying...' : '✓ Login'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    ← Back
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAuth;
