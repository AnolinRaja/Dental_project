import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

// when accessed from other devices the backend may not be on localhost
// use the current hostname with port 5000 if no env variable is provided
const API_URL = '/api';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    gender: 'Male',
    address: '',
    doctorType: 'General',
    symptoms: '',
    medicalHistory: '',
    appointmentDate: '',
    document: null
  });

  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);

  // track if email already exists in DB
  const [emailExists, setEmailExists] = useState(false);

  // Fetch doctor schedules on mount
  React.useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(`${API_URL}/schedule`);
        if (response.data.success) {
          setSchedules(response.data.data || []);
        }
      } catch (error) {
        console.log('Could not fetch schedules');
      } finally {
        setSchedulesLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // when email changes, check if patient already exists
    if (name === 'email') {
      if (value.trim() === '') {
        setEmailExists(false);
        return;
      }
      checkEmail(value);
    }
  };

  // helper to query backend for existing patient by email
  const checkEmail = async (email) => {
    try {
      const resp = await axios.get(`${API_URL}/patients/by-email`, {
        params: { email }
      });
      if (resp.data.success && resp.data.data) {
        setEmailExists(true);
        // autofill name and other non-editable fields
        setFormData(prev => ({
          ...prev,
          fullName: resp.data.data.fullName || prev.fullName,
          phone: resp.data.data.phone || prev.phone,
          age: resp.data.data.age || prev.age,
          gender: resp.data.data.gender || prev.gender,
          address: resp.data.data.address || prev.address,
          doctorType: resp.data.data.doctorType || prev.doctorType
        }));
      } else {
        setEmailExists(false);
      }
    } catch (err) {
      console.error('Error checking email', err);
      setEmailExists(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      document: e.target.files[0]
    }));
  };

  // Check if doctor is available on selected date
  const isDoctorAvailable = (dateString) => {
    if (!dateString || schedules.length === 0) return true; // If no schedules, allow booking
    
    const selectedDate = new Date(dateString);
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDate.getDay()];
    
    // Find schedule for this day
    const daySchedule = schedules.find(s => s.dayOfWeek === dayOfWeek);
    
    // If no schedule found or marked as off day, doctor is unavailable
    if (!daySchedule || daySchedule.isOffDay) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.fullName || !formData.email || !formData.phone || 
          !formData.age || !formData.address || !formData.appointmentDate) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Check if doctor is available on selected date
      if (!isDoctorAvailable(formData.appointmentDate)) {
        const selectedDate = new Date(formData.appointmentDate);
        const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDate.getDay()];
        toast.error(`❌ Doctor is not available on ${dayOfWeek}s. Please select another date.`);
        setLoading(false);
        return;
      }

      // Create FormData for multipart/form-data
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      const response = await axios.post(`${API_URL}/patients/register`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Registration successful! Redirecting to dashboard...');
        
        // Save patient info to localStorage for dashboard access
        localStorage.setItem('patientName', formData.fullName);
        localStorage.setItem('patientEmail', formData.email);
        localStorage.setItem('patientId', response.data.data?._id || '');
        localStorage.setItem('patientToken', response.data.data?.token || '');
        
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          age: '',
          gender: 'Male',
          address: '',
          doctorType: 'General',
          symptoms: '',
          medicalHistory: '',
          appointmentDate: '',
          document: null
        });
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Patient Registration</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none ${emailExists ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                required
                disabled={emailExists}
              />
              {emailExists && (
                <p className="text-xs text-gray-500 mt-1">
                  Name auto-filled from your previous registration and cannot be changed.
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="25"
                min="0"
                max="150"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Doctor Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor Type <span className="text-red-500">*</span>
              </label>
              <select
                name="doctorType"
                value={formData.doctorType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                required
              >
                <option value="General">General Doctor</option>
                <option value="Dental">Dental Doctor</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your complete address"
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              required
            />
          </div>
        </div>

        {/* Medical Information */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Medical Information</h3>

          {/* Appointment Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Appointment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    appointmentDate: e.target.value
                  }));
                  // Show warning if selected date is not available
                  if (e.target.value && !isDoctorAvailable(e.target.value)) {
                    const selectedDate = new Date(e.target.value);
                    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDate.getDay()];
                    toast.error(`⚠️ Doctor is not available on ${dayOfWeek}s`);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                required
              />
              {schedulesLoading ? (
                <p className="text-xs text-gray-500 mt-1">Loading availability...</p>
              ) : schedules.length > 0 ? (
                <p className="text-xs text-gray-600 mt-1">
                  📅 {schedules.filter(s => !s.isOffDay).length} days available per week
                  {schedules.filter(s => s.isOffDay).length > 0 && (
                    <span className="block">
                      Closed: {schedules.filter(s => s.isOffDay).map(s => s.dayOfWeek).join(', ')}
                    </span>
                  )}
                </p>
              ) : null}
            </div>
          </div>

          {/* Symptoms */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Symptoms
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              placeholder="Describe any symptoms or concerns"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Medical History */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical History
            </label>
            <textarea
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              placeholder="Any previous medical conditions, allergies, or medications"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Document Upload */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Documents</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Medical Documents (Optional)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 5MB)
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register Now'}
          </button>
          <button
            type="reset"
            className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
