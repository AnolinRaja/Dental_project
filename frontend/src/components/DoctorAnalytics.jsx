import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;

const DoctorAnalytics = ({ appointments = [] }) => {
  const [analytics, setAnalytics] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    cancelledAppointments: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    completionRate: 0
  });

  useEffect(() => {
    calculateAnalytics();
  }, [appointments]);

  const calculateAnalytics = () => {
    if (!appointments || appointments.length === 0) {
      setAnalytics(prev => ({
        ...prev,
        totalAppointments: 0,
        pendingAppointments: 0,
        confirmedAppointments: 0,
        cancelledAppointments: 0
      }));
      return;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let pending = 0;
    let confirmed = 0;
    let cancelled = 0;
    let monthlyRev = 0;
    let totalRev = 0;

    appointments.forEach(appt => {
      const apptStatus = appt.status || 'Pending';
      if (apptStatus === 'Pending') pending++;
      else if (apptStatus === 'Confirmed') confirmed++;
      else if (apptStatus === 'Cancelled') cancelled++;

      // Calculate revenue (assuming $100 per confirmed appointment)
      if (apptStatus === 'Confirmed') {
        const amount = 100;
        totalRev += amount;
        const apptDate = new Date(appt.appointmentDate);
        if (apptDate.getMonth() === currentMonth && apptDate.getFullYear() === currentYear) {
          monthlyRev += amount;
        }
      }
    });

    const total = appointments.length;
    const completionRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;

    setAnalytics({
      totalAppointments: total,
      pendingAppointments: pending,
      confirmedAppointments: confirmed,
      cancelledAppointments: cancelled,
      monthlyRevenue: monthlyRev,
      totalRevenue: totalRev,
      completionRate
    });
  };

  const StatCard = ({ icon, label, value, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-lg shadow-md p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl opacity-30">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">📊 Analytics Dashboard</h2>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon="📅"
            label="Total Appointments"
            value={analytics.totalAppointments}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon="⏳"
            label="Pending"
            value={analytics.pendingAppointments}
            color="from-yellow-500 to-yellow-600"
          />
          <StatCard
            icon="✅"
            label="Confirmed"
            value={analytics.confirmedAppointments}
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon="❌"
            label="Cancelled"
            value={analytics.cancelledAppointments}
            color="from-red-500 to-red-600"
          />
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 font-medium">Monthly Revenue</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">${analytics.monthlyRevenue}</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-6 border-l-4 border-indigo-500">
            <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">${analytics.totalRevenue}</p>
          </div>
          <div className="bg-teal-50 rounded-lg p-6 border-l-4 border-teal-500">
            <p className="text-sm text-gray-600 font-medium">Completion Rate</p>
            <p className="text-3xl font-bold text-teal-600 mt-2">{analytics.completionRate}%</p>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-bold text-gray-800 mb-4">Performance Summary</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-700">Appointment Completion</span>
                <span className="text-sm font-semibold text-gray-800">{analytics.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${analytics.completionRate}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t text-sm text-gray-600">
              <p>
                {analytics.confirmedAppointments > 0 ? (
                  <span>
                    🎉 <strong>{analytics.confirmedAppointments}</strong> confirmed appointments.{' '}
                    {analytics.monthlyRevenue > 0 && (
                      <span>Generated <strong>${analytics.monthlyRevenue}</strong> this month.</span>
                    )}
                  </span>
                ) : (
                  <span>✓ No confirmed appointments yet.</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAnalytics;
