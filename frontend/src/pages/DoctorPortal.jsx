import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import DoctorLogin from '../components/DoctorLogin';
import DoctorSchedule from '../components/DoctorSchedule';
import DoctorAnalytics from '../components/DoctorAnalytics';
import DoctorProfile from '../components/DoctorProfile';

// allow API to resolve relative to host when working over LAN
const API_URL = '/api';

const DoctorPortal = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('appointments'); // appointments, schedule, analytics, profile
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [confirmData, setConfirmData] = useState({
    timeSlot: '',
    doctorNotes: '',
    treatmentCost: 0
  });
  const [completingId, setCompletingId] = useState(null);
  const [completeData, setCompleteData] = useState({
    treatmentCost: 0,
    expenses: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('doctorToken');
    if (token) {
      setIsLoggedIn(true);
      fetchAppointments(token);
      fetchMessages(token);
    }
  }, []);

  const fetchAppointments = async (token, date) => {
    setLoading(true);
    try {
      let url = `${API_URL}/doctors/appointments`;
      if (date) {
        url += `?date=${date}`;
      }
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        const list = response.data.data;
        setAppointments(list);
        // check for upcoming within 30 minutes (only pending ones)
        const now = Date.now();
        const soon = list.filter(a => {
          const apptTime = new Date(a.appointmentDate).getTime();
          return a.status === 'Pending' && apptTime > now && apptTime - now <= 30 * 60 * 1000;
        });
        if (soon.length > 0) {
          toast(`Reminder: ${soon.length} pending appointment(s) within 30 minutes!`, { duration: 8000 });
        }
      }
    } catch (error) {
      toast.error('Failed to fetch appointments');
      if (error.response?.status === 401) {
        localStorage.removeItem('doctorToken');
        setIsLoggedIn(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (token) => {
    setIsLoggedIn(true);
    fetchAppointments(token);
    fetchMessages(token);
  };

  const handleMarkCompleted = async (appointmentId) => {
    const token = localStorage.getItem('doctorToken');
    try {
      const response = await axios.put(`${API_URL}/doctors/complete-appointment/${appointmentId}`, completeData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success('Appointment marked completed and billing recorded');
        setCompletingId(null);
        setCompleteData({ treatmentCost: 0, expenses: 0 });
        fetchAppointments(token);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete appointment');
    }
  };

  const fetchMessages = async (token, date) => {
    setLoadingMessages(true);
    try {
      let url = `${API_URL}/contacts`;
      if (date) {
        url += `?date=${date}`;
      }
      const response = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.data.success) {
        setMessages(response.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to fetch messages');
      if (error.response?.status === 401) {
        localStorage.removeItem('doctorToken');
        setIsLoggedIn(false);
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  const markMessageRead = async (id) => {
    const token = localStorage.getItem('doctorToken');
    try {
      const res = await axios.put(`${API_URL}/contacts/${id}/read`, {}, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.data.success) {
        setMessages(prev => prev.map(m => m._id === id ? { ...m, read: true } : m));
      }
    } catch (err) {
      toast.error('Unable to mark as read');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorEmail');
    setIsLoggedIn(false);
    toast.success('Logged out successfully');
  };

  const handleConfirmAppointment = async (appointmentId) => {
    const appointment = appointments.find(a => a._id === appointmentId);
    
    if (!confirmData.timeSlot) {
      toast.error('Please select a time slot');
      return;
    }

    const token = localStorage.getItem('doctorToken');
    try {
      const response = await axios.put(
        `${API_URL}/doctors/confirm-appointment/${appointmentId}`,
        confirmData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`✓ ${appointment.patientId?.fullName}'s appointment confirmed!`);
        setConfirmingId(null);
        setConfirmData({ timeSlot: '', doctorNotes: '', treatmentCost: 0 });
        if (selectedDate) {
          const month = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
          const dayStr = selectedDate.toString().padStart(2, '0');
          const dateStr = `${currentMonth.getFullYear()}-${month}-${dayStr}`;
          fetchAppointments(token, dateStr);
        } else {
          fetchAppointments(token);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm');
    }
  };

  const handleRejectAppointment = async (appointmentId) => {
    const appointment = appointments.find(a => a._id === appointmentId);
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    const token = localStorage.getItem('doctorToken');
    try {
      await axios.put(
        `${API_URL}/doctors/reject-appointment/${appointmentId}`,
        { rejectionReason: reason },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success(`✗ ${appointment.patientId?.fullName}'s appointment rejected`);
      if (selectedDate) {
        const month = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
        const dayStr = selectedDate.toString().padStart(2, '0');
        const dateStr = `${currentMonth.getFullYear()}-${month}-${dayStr}`;
        fetchAppointments(token, dateStr);
      } else {
        fetchAppointments(token);
      }
    } catch (error) {
      toast.error('Failed to reject appointment');
    }
  };

  // Calendar functions
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDay = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const getAppointmentsForDate = (day) => {
    return appointments.filter(appt => {
      const apptDate = new Date(appt.appointmentDate);
      return (
        apptDate.getDate() === day &&
        apptDate.getMonth() === currentMonth.getMonth() &&
        apptDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  const getAppointmentsForSelectedDate = () => {
    if (!selectedDate) return [];
    return getAppointmentsForDate(selectedDate);
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDay(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (!isLoggedIn) {
    return <DoctorLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">🏥 Doctor Portal</h1>
            <p className="text-gray-600 mt-2">
              Logged in as: <strong>{localStorage.getItem('doctorEmail')}</strong>
            </p>
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
            📅 Appointments
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'schedule'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🗓️ My Schedule
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'analytics'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📊 Analytics
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ⚙️ Profile & Payment
          </button>

        </div>

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="text-primary-600 hover:text-primary-800 font-bold"
                  >
                    ←
                  </button>
                  <h2 className="text-lg font-bold text-gray-800">{monthName}</h2>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="text-primary-600 hover:text-primary-800 font-bold"
                  >
                    →
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-bold text-gray-600 text-sm py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array(firstDay).fill(null).map((_, i) => (
                    <div key={`empty-${i}`} className="p-2"></div>
                  ))}
                  {Array(daysInMonth).fill(null).map((_, i) => {
                    const day = i + 1;
                    const dayAppointments = getAppointmentsForDate(day);
                    const isSelected = selectedDate === day;
                    const hasAppointments = dayAppointments.length > 0;

                    return (
                      <button
                        key={day}
                        onClick={() => {
                          const token = localStorage.getItem('doctorToken');
                          if (isSelected) {
                            setSelectedDate(null);
                            if (token) {
                              fetchAppointments(token);
                              fetchMessages(token);
                            }
                          } else {
                            setSelectedDate(day);
                            if (token) {
                              const month = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
                              const dayStr = day.toString().padStart(2, '0');
                              const dateStr = `${currentMonth.getFullYear()}-${month}-${dayStr}`;
                              fetchAppointments(token, dateStr);
                              fetchMessages(token, dateStr);
                            }
                          }
                        }}
                        className={`p-2 rounded text-sm font-semibold transition-all ${
                          isSelected
                            ? 'bg-primary-600 text-white'
                            : hasAppointments
                            ? 'bg-yellow-100 text-yellow-900 border-2 border-yellow-400'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div>{day}</div>
                        {hasAppointments && (
                          <div className="text-xs mt-1">
                            {dayAppointments.length} appt{dayAppointments.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                  <p className="text-blue-900">
                    <strong>📅 {appointments.length} Total Appointments</strong>
                  </p>
                  {selectedDate && (
                    <p className="text-blue-900 mt-2">
                      {getAppointmentsForSelectedDate().length} on {new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Appointments List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Messages Panel */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">
                    Messages
                    {selectedDate && (
                      <span className="text-sm text-gray-500 ml-2">
                        on {new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </h2>
                  <button 
                    onClick={() => { 
                      const token = localStorage.getItem('doctorToken'); 
                      if (token) {
                        if (selectedDate) {
                          const month = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
                          const dayStr = selectedDate.toString().padStart(2, '0');
                          const dateStr = `${currentMonth.getFullYear()}-${month}-${dayStr}`;
                          fetchMessages(token, dateStr);
                        } else {
                          fetchMessages(token);
                        }
                      }
                    }} 
                    className="text-sm text-primary-600 hover:underline"
                  >
                    Refresh
                  </button>
                </div>

                {loadingMessages ? (
                  <div className="text-center py-6 text-gray-600">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-6 text-gray-600">No messages</div>
                ) : (
                  <div className="space-y-3">
                    {messages.map(m => (
                      <div key={m._id} className={`p-3 rounded border ${m.read ? 'border-gray-200 bg-gray-50' : 'border-primary-300 bg-white'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-gray-800">{m.name} <span className="text-sm text-gray-500">· {new Date(m.createdAt).toLocaleString()}</span></div>
                            <div className="text-sm text-gray-600">{m.email} · {m.phone || '—'}</div>
                            <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{m.message}</div>
                          </div>
                          <div className="ml-4 text-right">
                            {!m.read && (
                              <button onClick={() => markMessageRead(m._id)} className="text-sm bg-primary-600 text-white px-3 py-1 rounded">Mark read</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {selectedDate
                    ? `Appointments on ${new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`
                    : 'All Appointments'}
                </h2>

                {loading ? (
                  <div className="text-center py-8 text-gray-600">Loading...</div>
                ) : (getAppointmentsForSelectedDate().length === 0 && selectedDate) ? (
                  <div className="text-center py-8 text-gray-600">
                    ✓ No appointments on this date
                  </div>
                ) : (getAppointmentsForSelectedDate().length > 0 || !selectedDate) ? (
                  <div className="space-y-4">
                    {(selectedDate ? getAppointmentsForSelectedDate() : appointments).map((appt) => (
                      <div key={appt._id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary-400 transition-all">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Patient Info */}
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">
                              {appt.patientId?.fullName}
                            </h3>
                            <p className="text-sm text-gray-600 mt-2">
                              📧 {appt.patientId?.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              📞 {appt.patientId?.phone}
                            </p>
                            <p className="text-sm text-gray-600">
                              👤 {appt.patientId?.age} yrs, {appt.patientId?.gender}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              📅 {new Date(appt.appointmentDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {appt.patientId?.symptoms && (
                              <p className="text-sm text-gray-700 mt-2">
                                <strong>Symptoms:</strong> {appt.patientId.symptoms}
                              </p>
                            )}
                          </div>

                          {/* Confirmation Form / Status / Complete */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            {appt.status === 'Pending' ? (
                              confirmingId === appt._id ? (
                                <>
                                  <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Appointment Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="time"
                                      value={confirmData.timeSlot}
                                      onChange={(e) =>
                                        setConfirmData(prev => ({
                                          ...prev,
                                          timeSlot: e.target.value
                                        }))
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                  </div>
                                  <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Notes
                                    </label>
                                    <textarea
                                      value={confirmData.doctorNotes}
                                      onChange={(e) =>
                                        setConfirmData(prev => ({
                                          ...prev,
                                          doctorNotes: e.target.value
                                        }))
                                      }
                                      placeholder="Add notes..."
                                      rows="2"
                                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                  </div>
                                  <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Treatment Cost ($)
                                    </label>
                                    <input
                                      type="number"
                                      value={confirmData.treatmentCost}
                                      onChange={(e) =>
                                        setConfirmData(prev => ({
                                          ...prev,
                                          treatmentCost: parseFloat(e.target.value) || 0
                                        }))
                                      }
                                      placeholder="e.g., 50"
                                      min="0"
                                      step="0.01"
                                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Patient will pay this amount</p>
                                  </div>
                                  <div className="space-y-2">
                                    <button
                                      onClick={() => handleConfirmAppointment(appt._id)}
                                      className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 text-sm transition-colors"
                                    >
                                      ✓ Confirm
                                    </button>
                                    <button
                                      onClick={() => setConfirmingId(null)}
                                      className="w-full bg-gray-400 text-white py-2 rounded font-semibold hover:bg-gray-500 text-sm transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="space-y-2">
                                  <button
                                    onClick={() => {
                                      setConfirmingId(appt._id);
                                      setConfirmData({ timeSlot: '', doctorNotes: '', treatmentCost: 0 });
                                    }}
                                    className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 text-sm transition-colors"
                                  >
                                    ✓ Accept
                                  </button>
                                  <button
                                    onClick={() => handleRejectAppointment(appt._id)}
                                    className="w-full bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 text-sm transition-colors"
                                  >
                                    ✗ Reject
                                  </button>
                                </div>
                              )
                            ) : appt.status === 'Confirmed' ? (
                              <div>
                                <div className="mb-2 text-sm font-semibold">
                                  <span className="text-green-600">✔ Confirmed</span>
                                </div>

                                {completingId === appt._id ? (
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-sm text-gray-700 mb-1">Final Treatment Cost</label>
                                      <input
                                        type="number"
                                        value={completeData.treatmentCost}
                                        onChange={(e) => setCompleteData(prev => ({ ...prev, treatmentCost: parseFloat(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm text-gray-700 mb-1">Expenses (doctor)</label>
                                      <input
                                        type="number"
                                        value={completeData.expenses}
                                        onChange={(e) => setCompleteData(prev => ({ ...prev, expenses: parseFloat(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <button
                                        onClick={() => handleMarkCompleted(appt._id)}
                                        className="w-full bg-primary-600 text-white py-2 rounded font-semibold hover:bg-primary-700 text-sm"
                                      >
                                        ✓ Mark Completed & Save
                                      </button>
                                      <button
                                        onClick={() => { setCompletingId(null); setCompleteData({ treatmentCost: 0, expenses: 0 }); }}
                                        className="w-full bg-gray-300 text-gray-800 py-2 rounded font-semibold hover:bg-gray-400 text-sm"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <button
                                      onClick={() => { setCompletingId(appt._id); setCompleteData({ treatmentCost: appt.treatmentCost || 0, expenses: appt.expenses || 0 }); }}
                                      className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 text-sm"
                                    >
                                      ✅ Mark Completed
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : appt.status === 'Cancelled' ? (
                              <div className="mb-2 text-sm font-semibold text-red-600">✖ Rejected {appt.rejectionReason && `(${appt.rejectionReason})`}</div>
                            ) : appt.status === 'Completed' ? (
                              <div className="text-sm">
                                <div className="font-semibold text-gray-800">Completed</div>
                                <div className="mt-2 text-gray-700">Treatment: ₹{appt.treatmentCost}</div>
                                <div className="text-gray-700">Expenses: ₹{appt.expenses}</div>
                                <div className="text-gray-700 font-semibold">Profit: ₹{(appt.treatmentCost - (appt.expenses || 0)).toFixed(2)}</div>
                              </div>
                            ) : (
                              <div className="mb-2 text-sm text-gray-600">{appt.status}</div>
                            )}

                            {/* History section */}
                            {appt.history && appt.history.length > 0 && (
                              <div className="mt-4 pt-4 border-t text-xs text-gray-600">
                                <h4 className="font-semibold mb-2">History</h4>
                                {appt.history.map((h, idx) => (
                                  <div key={idx} className="mb-1">
                                    <span className="font-medium">{h.status}</span> &middot; {' '}
                                    {new Date(h.timestamp).toLocaleString()} 
                                    {h.notes && <>({h.notes})</>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    ✓ No pending appointments - Great job!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <DoctorSchedule />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <DoctorAnalytics appointments={appointments} />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <DoctorProfile />
        )}
      </div>
    </div>
  );
};

export default DoctorPortal;
