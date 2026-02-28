import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;

const ReviewForm = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    rating: 5,
    cleanliness: 5,
    professionalism: 5,
    painManagement: 5,
    communication: 5,
    comment: ''
  });

  useEffect(() => {
    fetchConfirmedAppointments();
  }, []);

  const fetchConfirmedAppointments = async () => {
    const patientId = localStorage.getItem('patientId');
    const token = localStorage.getItem('patientToken');

    if (!patientId) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/doctors/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        const confirmed = response.data.data
          .filter(appt => appt.status === 'Confirmed' && appt.patientId?._id === patientId)
          .filter(appt => !appt.reviewed); // Filter out already reviewed
        setAppointments(confirmed);
      }
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!selectedAppointment) {
      toast.error('Please select an appointment');
      return;
    }

    setSubmitting(true);
    const patientId = localStorage.getItem('patientId');
    const token = localStorage.getItem('patientToken');

    try {
      const payload = {
        patientId,
        appointmentId: selectedAppointment._id,
        doctorEmail: selectedAppointment.doctorEmail,
        rating: parseInt(formData.rating),
        cleanliness: parseInt(formData.cleanliness),
        professionalism: parseInt(formData.professionalism),
        painManagement: parseInt(formData.painManagement),
        communication: parseInt(formData.communication),
        comment: formData.comment.trim(),
        status: 'Pending'
      };

      const response = await axios.post(`${API_URL}/reviews`, payload);

      if (response.data.success) {
        toast.success('🎉 Thank you for your feedback!');
        setShowForm(false);
        setSelectedAppointment(null);
        setFormData({
          rating: 5,
          cleanliness: 5,
          professionalism: 5,
          painManagement: 5,
          communication: 5,
          comment: ''
        });
        fetchConfirmedAppointments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const RatingInput = ({ label, value, onChange }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              onClick={() => onChange(num)}
              type="button"
              className={`text-2xl transition-transform hover:scale-125 ${
                num <= value ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <span className="ml-2 font-semibold text-gray-700">{value}/5</span>
      </div>
    </div>
  );

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading...</div>;
  }

  if (appointments.length === 0 && !showForm) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">⭐ Give Feedback</h2>
        <div className="text-center py-8 text-gray-600">
          <p>No completed appointments to review yet</p>
          <p className="text-sm mt-2">You can rate your doctor after your appointment is confirmed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">⭐ Give Feedback</h2>

      {!showForm ? (
        <div className="space-y-3">
          <p className="text-gray-700 mb-4">Select an appointment to leave feedback:</p>
          {appointments.map(appt => (
            <button
              key={appt._id}
              onClick={() => {
                setSelectedAppointment(appt);
                setShowForm(true);
              }}
              className="w-full text-left p-4 border rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
            >
              <div className="font-semibold text-gray-800">
                {appt.patientId?.fullName} - {appt.patientId?.email}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                📅 {new Date(appt.appointmentDate).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmitReview} className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Selected Appointment:</h3>
            <p className="text-gray-600">
              📅 {new Date(selectedAppointment?.appointmentDate).toLocaleDateString()}
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-800 mb-4">Rate Your Experience</h3>

            <RatingInput
              label="Overall Experience"
              value={formData.rating}
              onChange={(val) => setFormData({ ...formData, rating: val })}
            />

            <hr className="my-4" />

            <h4 className="font-semibold text-gray-800 mb-4">Specific Categories</h4>

            <RatingInput
              label="Cleanliness & Hygiene"
              value={formData.cleanliness}
              onChange={(val) => setFormData({ ...formData, cleanliness: val })}
            />

            <RatingInput
              label="Professionalism"
              value={formData.professionalism}
              onChange={(val) => setFormData({ ...formData, professionalism: val })}
            />

            <RatingInput
              label="Pain Management"
              value={formData.painManagement}
              onChange={(val) => setFormData({ ...formData, painManagement: val })}
            />

            <RatingInput
              label="Communication"
              value={formData.communication}
              onChange={(val) => setFormData({ ...formData, communication: val })}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments (Optional)
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Share your experience..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary-600 text-white py-2 rounded font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : '✓ Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setSelectedAppointment(null);
              }}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded font-semibold hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReviewForm;
