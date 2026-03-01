import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = '/api';

const DoctorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [qrFile, setQrFile] = useState(null);
  const [formData, setFormData] = useState({
    upiId: '',
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      ifscCode: ''
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('doctorToken');
    try {
      const response = await axios.get(`${API_URL}/doctor-profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setProfile(response.data.data);
        setFormData({
          upiId: response.data.data.upiId || '',
          bankDetails: response.data.data.bankDetails || {
            accountHolderName: '',
            accountNumber: '',
            ifscCode: ''
          }
        });
      }
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const token = localStorage.getItem('doctorToken');
    const uploadData = new FormData();
    uploadData.append('qrCode', file);

    try {
      const response = await axios.post(
        `${API_URL}/doctor-profile/upload-qr`,
        uploadData,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      if (response.data.success) {
        setProfile(response.data.data);
        toast.success('QR code uploaded successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload QR code');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('bank_')) {
      const field = name.replace('bank_', '');
      setFormData(prev => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('doctorToken');
    try {
      const response = await axios.put(
        `${API_URL}/doctor-profile`,
        formData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.success) {
        setProfile(response.data.data);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to save profile');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      {/* QR Code Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">📱 Payment QR Code</h2>
        <p className="text-gray-600 mb-4">Upload your UPI/Payment QR code so patients can pay you directly</p>

        {profile?.qrCodeUrl && (
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Current QR Code:</p>
            <img
              src={profile.qrCodeUrl}
              alt="Payment QR Code"
              className="w-48 h-48 mx-auto border-2 border-primary-300 rounded-lg shadow-md"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload New QR Code (Image)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleQrUpload}
            disabled={uploading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Supported: JPG, PNG, GIF (Max 5MB)
          </p>
          {uploading && <p className="text-sm text-primary-600 mt-2">Uploading...</p>}
        </div>
      </div>

      {/* UPI & Bank Details Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">💼 Payment Details</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              UPI Address (Optional)
            </label>
            <input
              type="text"
              name="upiId"
              value={formData.upiId}
              onChange={handleInputChange}
              placeholder="doctor@upi or your.upi.id"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your UPI address for direct transfers
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Bank Account (Optional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="bank_accountHolderName"
                value={formData.bankDetails.accountHolderName}
                onChange={handleInputChange}
                placeholder="Account Holder Name"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <input
                type="text"
                name="bank_accountNumber"
                value={formData.bankDetails.accountNumber}
                onChange={handleInputChange}
                placeholder="Account Number"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <input
                type="text"
                name="bank_ifscCode"
                value={formData.bankDetails.ifscCode}
                onChange={handleInputChange}
                placeholder="IFSC Code"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Optional: Add bank details for patient reference
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          ✓ Save Payment Details
        </button>
      </div>
    </div>
  );
};

export default DoctorProfile;
