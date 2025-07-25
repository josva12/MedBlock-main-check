import React, { useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchPatients } from '../../features/patients/patientsSlice';
import { fetchAppointments } from '../../features/appointments/appointmentsSlice';
import { fetchMedicalRecords } from '../../features/medicalRecords/medicalRecordsSlice';
import { fetchVitals } from '../../features/vitals/vitalsSlice';
import { fetchNotifications } from '../../features/notifications/notificationsSlice';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  FileText,
  Heart,
  BriefcaseMedical,
  PlusCircle,
  Clock,
  ClipboardList,
  MessageSquare,
  Blocks,
  Settings,
  BarChart2,
  Bell,
  Pill,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DoctorDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state: any) => state.auth);
  const { patients, isLoading: patientsLoading } = useAppSelector((state: any) => state.patients);
  const { appointments, isLoading: appointmentsLoading } = useAppSelector((state: any) => state.appointments);
  const { records, isLoading: recordsLoading } = useAppSelector((state: any) => state.medicalRecords);
  const { vitals, isLoading: vitalsLoading } = useAppSelector((state: any) => state.vitals);
  const { notifications, isLoading: notificationsLoading } = useAppSelector((state: any) => state.notifications);

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchAppointments());
    dispatch(fetchMedicalRecords());
    dispatch(fetchVitals());
    dispatch(fetchNotifications());
  }, [dispatch]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayAppointments = Array.isArray(appointments) ? appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()) : [];
  const recentVitals = Array.isArray(vitals) ? vitals.slice(0, 3) : [];
  const unreadNotificationsCount = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0;

  const doctorStats = [
    { name: "Today's Appointments", value: todayAppointments.length, icon: Calendar, color: 'bg-green-500', loading: appointmentsLoading },
    { name: 'Total Patients', value: Array.isArray(patients) ? patients.length : 0, icon: Users, color: 'bg-blue-500', loading: patientsLoading },
    { name: 'Recent Medical Records', value: Array.isArray(records) ? records.length : 0, icon: FileText, color: 'bg-purple-500', loading: recordsLoading },
    { name: 'Recent Vitals', value: recentVitals.length, icon: Heart, color: 'bg-red-500', loading: vitalsLoading },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{getGreeting()}, {user?.fullName || 'Doctor'}!</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Doctor Dashboard - Manage your patients and practice efficiently.</p>
        <div className="mt-4 text-md text-gray-500 dark:text-gray-400 font-semibold">Role: Doctor</div>
      </div>

      {/* Doctor-Specific Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {doctorStats.map((stat) => (
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

      {/* Main Content Grid for Doctor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Doctor Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <PlusCircle className="h-6 w-6 mr-3 text-purple-500" />Quick Actions
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => navigate('/doctor/patients')} className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-lg shadow-sm text-blue-700 dark:text-blue-300 font-medium transition-colors">
              <Users className="h-5 w-5 mr-2" /> View Patients
            </button>
            <button onClick={() => navigate('/doctor/appointments')} className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900 dark:hover:bg-green-800 rounded-lg shadow-sm text-green-700 dark:text-green-300 font-medium transition-colors">
              <Calendar className="h-5 w-5 mr-2" /> Manage Appt.
            </button>
            <button onClick={() => navigate('/doctor/medical-records')} className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900 dark:hover:bg-purple-800 rounded-lg shadow-sm text-purple-700 dark:text-purple-300 font-medium transition-colors">
              <FileText className="h-5 w-5 mr-2" /> New Record
            </button>
            <button onClick={() => navigate('/doctor/prescriptions')} className="flex items-center justify-center p-4 bg-red-50 hover:bg-red-100 dark:bg-red-900 dark:hover:bg-red-800 rounded-lg shadow-sm text-red-700 dark:text-red-300 font-medium transition-colors">
              <Pill className="h-5 w-5 mr-2" /> Prescribe
            </button>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Users className="h-6 w-6 mr-3 text-blue-500" />My Patients
            </h2>
          </div>
          <div className="p-6">
            {patientsLoading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400"><LoadingSpinner size="medium" /> Loading patients...</div>
            ) : Array.isArray(patients) && patients.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No patients assigned.</p>
            ) : (
              <div className="space-y-4">
                {Array.isArray(patients) && patients.slice(0, 5).map((patient: any) => (
                  <div key={patient._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 transition-transform transform hover:scale-[1.01]">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{patient.fullName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last Visit: {patient.lastVisit || '-'}</p>
                    </div>
                    <button className="text-blue-500 hover:underline text-sm" onClick={() => navigate(`/doctor/patients/${patient._id}`)}>View Profile</button>
                  </div>
                ))}
              </div>
            )}
            <button className="mt-6 w-full text-blue-600 hover:underline text-sm font-medium" onClick={() => navigate('/doctor/patients')}>
              View All Patients
            </button>
          </div>
        </div>

        {/* Recent Medical Records */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FileText className="h-6 w-6 mr-3 text-purple-500" />Recent Medical Records
            </h2>
          </div>
          <div className="p-6">
            {recordsLoading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400"><LoadingSpinner size="medium" /> Loading records...</div>
            ) : Array.isArray(records) && records.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent medical records.</p>
            ) : (
              <div className="space-y-4">
                {Array.isArray(records) && records.slice(0, 5).map((record: any) => (
                  <div key={record._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 transition-transform transform hover:scale-[1.01]">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{record.patientName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{record.type} - {record.date}</p>
                    </div>
                    <button className="text-blue-500 hover:underline text-sm" onClick={() => navigate(`/doctor/medical-records/${record._id}`)}>View</button>
                  </div>
                ))}
              </div>
            )}
            <button className="mt-6 w-full text-blue-600 hover:underline text-sm font-medium" onClick={() => navigate('/doctor/medical-records')}>
              View All Records
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
            ) : todayAppointments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No appointments for today</p>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((appointment: any) => (
                  <div key={appointment._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 transition-transform transform hover:scale-[1.01]">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{appointment.patientName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center"><Clock className="h-4 w-4 mr-1" />{new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>{appointment.status}</span>
                  </div>
                ))}
              </div>
            )}
            <button className="mt-4 w-full text-blue-600 hover:underline text-sm font-medium" onClick={() => navigate('/doctor/appointments')}>
              View All Today's Appointments
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
            ) : Array.isArray(notifications) && notifications.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No new notifications.</p>
            ) : (
              <div className="space-y-3">
                {Array.isArray(notifications) && notifications.slice(0, 3).map((notif: any) => (
                  <div key={notif._id} className={`p-3 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ${!notif.isRead ? 'font-semibold' : ''}`}>
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs opacity-75 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
            <button className="mt-4 w-full text-blue-600 hover:underline text-sm font-medium" onClick={() => navigate('/doctor/appointments')}>
              View All Notifications
            </button>
          </div>
        </div>

        {/* Activity Overview (Placeholder for a chart) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-2 xl:col-span-2">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <BarChart2 className="h-6 w-6 mr-3 text-orange-500" />Patient Trends Overview
            </h2>
          </div>
          <div className="p-6 text-center text-gray-500 dark:text-gray-400 h-64 flex items-center justify-center">
            <p>
              <span className="font-bold">Chart Placeholder:</span> This area would display a dynamic chart (e.g., patient visits over time, common diagnoses)
              <br /> based on your practice's data.
            </p>
          </div>
        </div>

        {/* Core MedBlock Modules (Doctor-specific links) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <BriefcaseMedical className="h-6 w-6 mr-3 text-blue-500" />Doctor Features
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => navigate('/ai-chat')} className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <MessageSquare className="h-5 w-5 mr-2 text-teal-500" /> AI Chat
            </button>
            <button onClick={() => navigate('/blockchain')} className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <Blocks className="h-5 w-5 mr-2 text-indigo-500" /> Blockchain
            </button>
            <button onClick={() => navigate('/doctor/reports')} className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <BarChart2 className="h-5 w-5 mr-2 text-green-500" /> Reports
            </button>
            <button onClick={() => navigate('/doctor/settings')} className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <Settings className="h-5 w-5 mr-2 text-gray-500" /> Settings
            </button>
            <button onClick={() => navigate('/doctor/chat')} className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900 dark:hover:bg-purple-800 rounded-lg shadow-sm text-purple-700 dark:text-purple-300 font-medium transition-colors transform hover:scale-[1.02]">
              <MessageSquare className="h-5 w-5 mr-2 text-teal-500" /> Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardPage;