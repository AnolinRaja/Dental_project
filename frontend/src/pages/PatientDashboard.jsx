import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import PatientInvoices from '../components/PatientInvoices';
import ReviewForm from '../components/ReviewForm';

const API_URL = '/api';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appointments'); // appointments, invoices, reviews
  const [appointments, setAppointments] = useState({ upcoming: [], past: [] });
  const [appointmentTab, setAppointmentTab] = useState('upcoming');
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const patientName = localStorage.getItem('patientName');
  const patientEmail = localStorage.getItem('patientEmail');
  const patientToken = localStorage.getItem('patientToken');

  useEffect(() => {
    if (!patientToken) {
      navigate('/patient-auth');
      return;
    }
    fetchAppointments();
  }, [patientToken, navigate]);

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    try {
      console.log('📋 [FRONTEND] Fetching appointments...');
      console.log('📋 [FRONTEND] Token:', patientToken?.substring(0, 20) + '...');
      
      const response = await axios.get(`${API_URL}/patients/my-appointments`, {
        headers: { 'Authorization': `Bearer ${patientToken}` }
      });
      console.log('📋 [FRONTEND] Response received:', response.data);
      
      if (response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      console.error('❌ [FRONTEND] Failed to fetch appointments:', error);
      console.error('❌ [FRONTEND] Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        fullError: error.response?.data
      });
      if (error.response?.status === 401) {
        localStorage.removeItem('patientToken');
        navigate('/patient-auth');
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to fetch appointments');
      }
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('patientToken');
    localStorage.removeItem('patientEmail');
    localStorage.removeItem('patientName');
    localStorage.removeItem('patientId');
    toast.success('Logged out successfully');
    navigate('/patient-auth');
  };

  if (!patientToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-lg text-gray-600 mb-4">Please log in to access your dashboard</p>
          <button
            onClick={() => navigate('/patient-auth')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Confirmed': 'bg-green-100 text-green-800',
      'Completed': 'bg-blue-100 text-blue-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-orange-100 text-orange-800',
      'Paid': 'bg-green-100 text-green-800',
      'Pending Verification': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">👤 Patient Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome, <strong>{patientName}</strong>
            </p>
            <p className="text-gray-600 text-sm">{patientEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'appointments'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📅 My Appointments
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'invoices'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            💰 My Invoices
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'reviews'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ⭐ Feedback
          </button>
        </div>

        {/* Content */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Appointment Sub-tabs */}
            <div className="flex gap-2 mb-6 border-b">
              <button
                onClick={() => setAppointmentTab('upcoming')}
                className={`px-4 py-2 font-semibold transition-colors ${
                  appointmentTab === 'upcoming'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📅 Upcoming ({appointments.upcoming.length})
              </button>
              <button
                onClick={() => setAppointmentTab('past')}
                className={`px-4 py-2 font-semibold transition-colors ${
                  appointmentTab === 'past'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                ✓ Past ({appointments.past.length})
              </button>
            </div>

            {/* Upcoming Appointments */}
            {appointmentTab === 'upcoming' && (
              <div>
                {loadingAppointments ? (
                  <div className="text-center py-8 text-gray-600">Loading appointments...</div>
                ) : appointments.upcoming.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <p className="text-lg">No upcoming appointments</p>
                    <p className="text-sm mt-2">Schedule one to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.upcoming.map(appt => (
                      <div key={appt._id} className="border rounded-lg p-5 hover:shadow-md transition-shadow">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {/* Date & Time */}
                          <div>
                            <p className="text-sm text-gray-600 mb-1">📅 Date & Time</p>
                            <p className="font-semibold text-gray-800">
                              {new Date(appt.appointmentDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            {appt.timeSlot && (
                              <p className="text-sm text-gray-600">⏰ {appt.timeSlot}</p>
                            )}
                          </div>

                          {/* Doctor Type & Reason */}
                          <div>
                            <p className="text-sm text-gray-600 mb-1">👨‍⚕️ Doctor Type</p>
                            <p className="font-semibold text-gray-800">{appt.doctorType || 'To be assigned'}</p>
                            {appt.reasonForVisit && (
                              <p className="text-sm text-gray-600">Reason: {appt.reasonForVisit}</p>
                            )}
                          </div>

                          {/* Status & Cost */}
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appt.status)}`}>
                              {appt.status}
                            </span>
                            {appt.treatmentCost && (
                              <p className="text-lg font-bold text-primary-600 mt-2">₹{appt.treatmentCost}</p>
                            )}
                          </div>
                        </div>

                        {/* Payment Status */}
                        {appt.paymentStatus && (
                          <div className="mb-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(appt.paymentStatus)}`}>
                              💳 {appt.paymentStatus}
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        {appt.paymentStatus === 'Pending' && (
                          <button
                            onClick={() => navigate(`/payment/${appt._id}`)}
                            className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700 transition-colors"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Past Appointments */}
            {appointmentTab === 'past' && (
              <div>
                {loadingAppointments ? (
                  <div className="text-center py-8 text-gray-600">Loading appointments...</div>
                ) : appointments.past.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <p className="text-lg">No past appointments</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.past.map(appt => (
                      <div key={appt._id} className="border rounded-lg p-5 bg-gray-50 hover:shadow-md transition-shadow">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {/* Date */}
                          <div>
                            <p className="text-sm text-gray-600 mb-1">📅 Date</p>
                            <p className="font-semibold text-gray-800">
                              {new Date(appt.appointmentDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>

                          {/* Doctor Type */}
                          <div>
                            <p className="text-sm text-gray-600 mb-1">👨‍⚕️ Doctor Type</p>
                            <p className="font-semibold text-gray-800">{appt.doctorType || 'N/A'}</p>
                          </div>

                          {/* Status */}
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appt.status)}`}>
                              {appt.status}
                            </span>
                          </div>
                        </div>

                        {/* Treatment Summary */}
                        {(appt.treatmentCost || appt.expenses) && (
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            {appt.treatmentCost && (
                              <div>
                                <p className="text-sm text-gray-600">Treatment Cost</p>
                                <p className="text-lg font-bold text-gray-800">₹{appt.treatmentCost}</p>
                              </div>
                            )}
                            {appt.expenses && (
                              <div>
                                <p className="text-sm text-gray-600">Expenses</p>
                                <p className="text-lg font-bold text-gray-800">₹{appt.expenses}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {activeTab === 'invoices' && <PatientInvoices />}
        {activeTab === 'reviews' && <ReviewForm />}
      </div>
    </div>
  );
};

export default PatientDashboard;
