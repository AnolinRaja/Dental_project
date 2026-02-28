import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;

const PaymentPage = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    fetchPaymentDetails();
  }, [appointmentId]);

  const fetchPaymentDetails = async () => {
    const patientToken = localStorage.getItem('patientToken');
    try {
      const response = await axios.get(`${API_URL}/payments/${appointmentId}`, {
        headers: { 'Authorization': `Bearer ${patientToken}` }
      });
      if (response.data.success) {
        setAppointment(response.data.data);
        // Fetch public doctor QR/profile (single-doctor app)
        fetchDoctorProfile();
      }
    } catch (error) {
      toast.error('Failed to fetch payment details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/doctor-profile/public`);
      if (response.data.success) {
        setDoctorProfile(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch doctor profile:', error);
    }
  };

  const handleUploadProof = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const patientToken = localStorage.getItem('patientToken');
    const formData = new FormData();
    formData.append('paymentProof', file);

    try {
      const response = await axios.post(
        `${API_URL}/payments/${appointmentId}/upload-proof`,
        formData,
        { 
          headers: { 
            'Authorization': `Bearer ${patientToken}`,
            'Content-Type': 'multipart/form-data' 
          } 
        }
      );
      if (response.data.success) {
        setAppointment(response.data.data);
        setShowUploadForm(false);
        toast.success('✅ Payment proof uploaded! Doctor will verify it.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Appointment not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary-600 hover:text-primary-800 font-semibold mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800">💰 Payment</h1>
          <p className="text-gray-600 mt-2">Complete your payment via UPI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Appointment Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Appointment Details</h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Doctor</p>
                <p className="font-semibold text-gray-800">{appointment.doctorName}</p>
              </div>

              <div>
                <p className="text-gray-600">Date</p>
                <p className="font-semibold text-gray-800">
                  {new Date(appointment.appointmentDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-gray-600">Time Slot</p>
                <p className="font-semibold text-gray-800">
                  {appointment.timeSlot || 'Not yet confirmed'}
                </p>
              </div>

              <div className="border-t pt-3">
                <p className="text-gray-600">Treatment Cost</p>
                <p className="text-2xl font-bold text-primary-600">
                  ₹{appointment.treatmentCost}
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-blue-700 text-sm">
                <p className="font-semibold">ℹ️ Payment Status</p>
                {appointment.paymentStatus === 'Paid' ? (
                  <p className="text-green-600 font-semibold mt-1">✓ Payment Complete</p>
                ) : appointment.paymentStatus === 'Pending' ? (
                  <p className="mt-1">Please scan QR code above and upload proof</p>
                ) : (
                  <p className="mt-1">{appointment.paymentStatus}</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            {/* QR Code Display */}
            {doctorProfile?.qrCodeUrl && appointment.paymentStatus !== 'Paid' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📱 Scan to Pay</h2>

                <div className="text-center mb-4">
                  <img
                    src={doctorProfile.qrCodeUrl}
                    alt="Payment QR Code"
                    className="w-48 h-48 mx-auto border-4 border-primary-300 rounded-lg shadow-md"
                  />
                  <p className="text-xs text-gray-500 mt-3">Scan this QR code with any UPI app</p>
                </div>

                {/* UPI Details */}
                {doctorProfile.upiId && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-gray-600 text-sm">UPI Address</p>
                    <p className="font-mono font-semibold text-gray-800 break-all">
                      {doctorProfile.upiId}
                    </p>
                  </div>
                )}

                {/* Bank Details (if provided) */}
                {doctorProfile.bankDetails?.accountNumber && (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p className="text-gray-600 font-semibold mb-2">Bank Transfer</p>
                    <p><span className="text-gray-600">Name:</span> {doctorProfile.bankDetails.accountHolderName}</p>
                    <p className="font-mono"><span className="text-gray-600">Account:</span> {doctorProfile.bankDetails.accountNumber}</p>
                    <p className="font-mono"><span className="text-gray-600">IFSC:</span> {doctorProfile.bankDetails.ifscCode}</p>
                  </div>
                )}

                <p className="text-xs text-gray-500 text-center mt-4">
                  ✓ Send ₹{appointment.treatmentCost} and save the receipt
                </p>
              </div>
            )}

            {/* Upload Proof Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📸 Upload Payment Proof</h2>

              {appointment.paymentStatus === 'Paid' ? (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
                  <p className="text-2xl mb-2">✅</p>
                  <p className="font-semibold text-green-700">Payment Verified!</p>
                  <p className="text-sm text-green-600 mt-1">Your payment has been successfully processed.</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 text-sm mb-4">
                    After paying via UPI/Bank, upload a screenshot of the transaction as proof.
                  </p>

                  {!showUploadForm ? (
                    <button
                      onClick={() => setShowUploadForm(true)}
                      className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                    >
                      📤 Upload Payment Proof
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-primary-300 rounded-lg p-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadProof}
                          disabled={uploading}
                          className="w-full cursor-pointer text-sm text-gray-600"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          JPG, PNG, GIF (Max 5MB). Must show UPI reference number.
                        </p>
                      </div>

                      {uploading && (
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">Uploading...</p>
                        </div>
                      )}

                      <button
                        onClick={() => setShowUploadForm(false)}
                        disabled={uploading}
                        className="w-full bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    <p className="font-semibold mb-1">📝 Important</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Screenshot must show transaction reference/ID</li>
                      <li>Doctor will verify and confirm payment within 24 hours</li>
                      <li>Upon verification, your appointment is locked in</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
