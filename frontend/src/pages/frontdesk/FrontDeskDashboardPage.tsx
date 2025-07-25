import React, { useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchPatients } from '../../features/patients/patientsSlice';
import { fetchAppointments } from '../../features/appointments/appointmentsSlice';
import { fetchVitals } from '../../features/vitals/vitalsSlice';
import { fetchNotifications } from '../../features/notifications/notificationsSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, BriefcaseMedical, PlusCircle, Clock, MessageSquare, Blocks, Settings, BarChart2, Bell, UserPlus, CheckCircle, CreditCard, MessageCircle
} from 'lucide-react';

const FrontDeskDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { patients, isLoading: patientsLoading } = useAppSelector((state) => state.patients);
  const { appointments, isLoading: appointmentsLoading } = useAppSelector((state) => state.appointments);
  const { notifications, isLoading: notificationsLoading } = useAppSelector((state) => state.notifications);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchAppointments());
    dispatch(fetchVitals());
    dispatch(fetchNotifications());
  }, [dispatch]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Defensive: ensure patients is always an array
  const safePatients = Array.isArray(patients) ? patients : [];

  // Stats
  const todayAppointmentsCount = Array.isArray(appointments) ? appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length : 0;
  const patientsWaiting = safePatients.filter(p => p.checkInStatus === 'not_admitted').length;
  const patientsCheckedIn = safePatients.filter(p => p.checkInStatus === 'admitted').length;

  const frontDeskStats = [
    { name: "Today's Appointments", value: todayAppointmentsCount, icon: Calendar, color: 'bg-green-500', loading: appointmentsLoading },
    { name: 'Patients Waiting', value: patientsWaiting, icon: Users, color: 'bg-orange-500', loading: patientsLoading },
    { name: 'Patients Checked-In', value: patientsCheckedIn, icon: CheckCircle, color: 'bg-blue-500', loading: patientsLoading },
    { name: 'New Registrations (Today)', value: 0, icon: UserPlus, color: 'bg-purple-500', loading: false },
  ];

  const unreadNotificationsCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{getGreeting()}, {user?.fullName || 'Front Desk'}!</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Front Desk Dashboard - Streamline patient flow and administrative tasks.</p>
        <div className="mt-4 text-md text-gray-500 dark:text-gray-400 font-semibold">Role: Front Desk</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {frontDeskStats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center transition-transform transform hover:scale-103 hover:shadow-xl border border-gray-100 dark:border-gray-700">
            <div className={`p-4 rounded-full ${stat.color} text-white flex-shrink-0 shadow-md`}>
              <stat.icon className="h-7 w-7" />
            </div>
            <div className="ml-5">
              <p className="text-base font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
              {stat.loading ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded mt-2"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid for Front Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <PlusCircle className="h-6 w-6 mr-3 text-purple-500" />Quick Actions
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => navigate('/frontdesk/patients')} className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-lg shadow-sm text-blue-700 dark:text-blue-300 font-medium transition-colors">
              <UserPlus className="h-5 w-5 mr-2" /> Register Patient
            </button>
            <button onClick={() => navigate('/frontdesk/appointments')} className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900 dark:hover:bg-green-800 rounded-lg shadow-sm text-green-700 dark:text-green-300 font-medium transition-colors">
              <Calendar className="h-5 w-5 mr-2" /> Schedule Appt.
            </button>
            <button onClick={() => navigate('/frontdesk/patients')} className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900 dark:hover:bg-purple-800 rounded-lg shadow-sm text-purple-700 dark:text-purple-300 font-medium transition-colors">
              <CheckCircle className="h-5 w-5 mr-2" /> Check-In/Out
            </button>
            <button onClick={() => navigate('/frontdesk/claims')} className="flex items-center justify-center p-4 bg-red-50 hover:bg-red-100 dark:bg-red-900 dark:hover:bg-red-800 rounded-lg shadow-sm text-red-700 dark:text-red-300 font-medium transition-colors">
              <CreditCard className="h-5 w-5 mr-2" /> Process Payment
            </button>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="h-6 w-6 mr-3 text-blue-500" />Today's Appointments
            </h2>
          </div>
          <div className="p-6">
            {appointmentsLoading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400"><LoadingSpinner size="medium" /> Loading appointments...</div>
            ) : todayAppointmentsCount === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No appointments for today</p>
            ) : (
              <div className="space-y-4">
                {appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).slice(0, 5).map((appointment) => (
                  <div key={appointment._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 transition-transform transform hover:scale-[1.01]">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{appointment.patientName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center"><Clock className="h-4 w-4 mr-1" />{new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${(() => {
                      switch (appointment.status) {
                        case 'scheduled': return 'bg-blue-100 text-blue-800';
                        case 'confirmed': return 'bg-green-100 text-green-800';
                        case 'completed': return 'bg-gray-100 text-gray-800';
                        case 'cancelled': return 'bg-red-100 text-red-800';
                        case 'no-show': return 'bg-yellow-100 text-yellow-800';
                        default: return 'bg-gray-100 text-gray-800';
                      }
                    })()}`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button className="mt-4 w-full text-blue-600 hover:underline text-sm font-medium" onClick={() => navigate('/frontdesk/appointments')}>
              View All Appointments
            </button>
          </div>
        </div>

        {/* Patient Queue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Users className="h-6 w-6 mr-3 text-orange-500" />Patient Queue
            </h2>
          </div>
          <div className="p-6">
            {patientsLoading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400"><LoadingSpinner size="medium" /> Loading patient queue...</div>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Waiting ({patientsWaiting})</h3>
                  {safePatients.filter(p => p.checkInStatus === 'not_admitted').length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No patients waiting.</p>
                  ) : (
                    <div className="space-y-2">
                      {safePatients.filter(p => p.checkInStatus === 'not_admitted').slice(0, 3).map(patient => (
                        <div key={patient._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{patient.fullName}</p>
                          </div>
                          <button className="text-blue-500 hover:underline text-xs">Check-In</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Checked-In ({patientsCheckedIn})</h3>
                  {safePatients.filter(p => p.checkInStatus === 'admitted').length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No patients checked-in.</p>
                  ) : (
                    <div className="space-y-2">
                      {safePatients.filter(p => p.checkInStatus === 'admitted').slice(0, 3).map(patient => (
                        <div key={patient._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{patient.fullName}</p>
                          </div>
                          <button className="text-blue-500 hover:underline text-xs">Check-Out</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            <button className="mt-6 w-full text-blue-600 hover:underline text-sm font-medium" onClick={() => navigate('/frontdesk/patients')}>
              View Full Queue
            </button>
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Bell className="h-6 w-6 mr-3 text-yellow-500" />Notifications
            </h2>
            {unreadNotificationsCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{unreadNotificationsCount} New</span>
            )}
          </div>
          <div className="p-6">
            {notificationsLoading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400"><LoadingSpinner size="small" /> Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No new notifications.</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notif) => (
                  <div key={notif._id} className={`p-3 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ${!notif.isRead ? 'font-semibold' : ''}`}>
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs opacity-75 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
            <button className="mt-4 w-full text-blue-600 hover:underline text-sm font-medium" onClick={() => navigate('/frontdesk/appointments')}>
              View All Notifications
            </button>
          </div>
        </div>

        {/* Activity Overview (Placeholder for a chart) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-2 xl:col-span-2">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <BarChart2 className="h-6 w-6 mr-3 text-orange-500" />Daily Operations Summary
            </h2>
          </div>
          <div className="p-6 text-center text-gray-500 dark:text-gray-400 h-64 flex items-center justify-center">
            <p>
              <span className="font-bold">Chart Placeholder:</span> This area would display a dynamic chart (e.g., daily patient check-ins, appointment statuses)
              <br /> relevant to front desk operations.
            </p>
          </div>
        </div>

        {/* Core MedBlock Modules (Front Desk-specific links) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <BriefcaseMedical className="h-6 w-6 mr-3 text-blue-500" />Front Desk Features
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => navigate('/ai-chat')} className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <MessageSquare className="h-5 w-5 mr-2 text-teal-500" /> AI Chat
            </button>
            <button onClick={() => navigate('/blockchain')} className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <Blocks className="h-5 w-5 mr-2 text-indigo-500" /> Blockchain
            </button>
            <button onClick={() => navigate('/frontdesk/reports')} className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <BarChart2 className="h-5 w-5 mr-2 text-green-500" /> Reports
            </button>
            <button onClick={() => navigate('/frontdesk/settings')} className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <Settings className="h-5 w-5 mr-2 text-gray-500" /> Settings
            </button>
            <button onClick={() => navigate('/frontdesk/chat')} className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900 dark:hover:bg-purple-800 rounded-lg shadow-sm text-purple-700 dark:text-purple-300 font-medium transition-colors transform hover:scale-[1.02]">
              <MessageCircle className="h-5 w-5 mr-2 text-teal-500" /> Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrontDeskDashboardPage; 