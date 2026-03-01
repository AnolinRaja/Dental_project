import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = '/api';

const DayItem = ({ day, schedule, onSave, isSaving }) => {
  const [startTime, setStartTime] = useState(schedule?.startTime || '09:00');
  const [endTime, setEndTime] = useState(schedule?.endTime || '17:00');
  const [isOffDay, setIsOffDay] = useState(schedule?.isOffDay || false);

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 capitalize">{day}</h3>
        {isOffDay && <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">Off</span>}
      </div>

      {!isOffDay ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600">Day off</p>
      )}

      <div className="mt-3 flex items-center">
        <input
          type="checkbox"
          id={`offday-${day}`}
          checked={isOffDay}
          onChange={(e) => setIsOffDay(e.target.checked)}
          className="w-4 h-4 text-primary-600 rounded"
        />
        <label htmlFor={`offday-${day}`} className="ml-2 text-sm text-gray-700">
          Mark as off day
        </label>
      </div>

      <button
        onClick={() => onSave(day, { startTime, endTime, isOffDay })}
        disabled={isSaving}
        className="mt-4 w-full bg-primary-600 text-white py-2 rounded font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm"
      >
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};

const DoctorSchedule = () => {
  const [schedules, setSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingDay, setSavingDay] = useState(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const token = localStorage.getItem('doctorToken');
    try {
      const response = await axios.get(`${API_URL}/schedule`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        const schedulesMap = {};
        days.forEach(day => {
          const found = response.data.data?.find(s => s.dayOfWeek === day);
          schedulesMap[day] = found || null;
        });
        setSchedules(schedulesMap);
      }
    } catch (error) {
      console.error('Fetch schedules error:', error.response?.data);
      toast.error('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async (day, data) => {
    const token = localStorage.getItem('doctorToken');
    
    if (!token) {
      toast.error('❌ You are not authenticated. Please login again.');
      return;
    }

    setSavingDay(day);
    try {
      const response = await axios.post(
        `${API_URL}/schedule`,
        { dayOfWeek: day, ...data },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.success) {
        setSchedules(prev => ({
          ...prev,
          [day]: response.data.data
        }));
        toast.success(`${day} schedule saved!`);
      }
    } catch (error) {
      console.error('Schedule save error:', error.response?.data);
      if (error.response?.status === 401) {
        toast.error('❌ Your session expired. Please login again.');
        localStorage.removeItem('doctorToken');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save schedule');
      }
    } finally {
      setSavingDay(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading schedule...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📅 Your Schedule</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map(day => (
          <DayItem
            key={day}
            day={day}
            schedule={schedules[day]}
            onSave={handleSaveSchedule}
            isSaving={savingDay === day}
          />
        ))}
      </div>
    </div>
  );
};

export default DoctorSchedule;
