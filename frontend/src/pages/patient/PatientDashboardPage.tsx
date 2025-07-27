import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchAppointments } from '../../features/appointments/appointmentsSlice';
import { fetchMedicalRecords } from '../../features/medicalRecords/medicalRecordsSlice';
import { fetchVitals } from '../../features/vitals/vitalsSlice';
import { fetchNotifications } from '../../features/notifications/notificationsSlice';
import { fetchResources } from '../../features/resources/resourcesSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Calendar, FileText, Heart, Clock, MessageSquare, BookOpen
} from 'lucide-react';

const InsuranceCard: React.FC = () => (
  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-48">
    <div>
      <h3 className="text-xl font-bold mb-2">My Insurance</h3>
      <p className="text-sm">Provider: Safaricom Health</p>
      <p className="text-sm">Policy No: SH-123456789</p>
      <p className="text-sm mt-2">Status: <span className="font-semibold text-yellow-200">Active</span></p>
    </div>
    <div className="text-right text-sm opacity-80">Valid until: 12/2026</div>
  </div>
);

const PatientDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { appointments, isLoading: appointmentsLoading } = useAppSelector((state) => state.appointments);
  const { records, isLoading: recordsLoading } = useAppSelector((state) => state.medicalRecords);
  const { vitals, isLoading: vitalsLoading } = useAppSelector((state) => state.vitals);
  const { resources, isLoading: resourcesLoading } = useAppSelector((state) => state.resources);

  useEffect(() => {
    dispatch(fetchAppointments());
    dispatch(fetchMedicalRecords());
    dispatch(fetchVitals());
    dispatch(fetchNotifications());
    dispatch(fetchResources());
  }, [dispatch]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const upcomingAppointments = Array.isArray(appointments) ? appointments.filter(a => new Date(a.date) >= new Date()).slice(0, 3) : [];
  const recentVitals = Array.isArray(vitals) ? vitals.slice(0, 3) : [];
  const recentMedicalRecords = Array.isArray(records) ? records.slice(0, 3) : [];

  const patientStats = [
    { name: 'Upcoming Appointments', value: upcomingAppointments.length, icon: Calendar, color: 'bg-green-500', loading: appointmentsLoading },
    { name: 'My Medical Records', value: recentMedicalRecords.length, icon: FileText, color: 'bg-purple-500', loading: recordsLoading },
    { name: 'Recent Vitals', value: recentVitals.length, icon: Heart, color: 'bg-red-500', loading: vitalsLoading },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{getGreeting()}, {user?.fullName || 'Patient'}!</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Welcome to your personalized health dashboard.</p>
        <div className="mt-4 text-md text-gray-500 dark:text-gray-400 font-semibold">Role: Patient</div>
      </div>

      {/* Patient-Specific Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {patientStats.map((stat) => (
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

      {/* Main Content Grid for Patient */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* My Upcoming Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="h-6 w-6 mr-3 text-blue-500" />My Upcoming Appointments
            </h2>
          </div>
          <div className="p-6">
            {appointmentsLoading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400"><LoadingSpinner size="medium" /> Loading appointments...</div>
            ) : upcomingAppointments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming appointments.</p>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 transition-transform transform hover:scale-[1.01]">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{appointment.patientName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center"><Clock className="h-4 w-4 mr-1" />{new Date(appointment.date).toLocaleString()}</p>
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
            <button className="mt-4 w-full text-blue-600 hover:underline text-sm font-medium" onClick={() => navigate('/patient/appointments')}>
              View All Appointments
            </button>
          </div>
        </div>

        {/* My Medical Records */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FileText className="h-6 w-6 mr-3 text-purple-500" />My Medical Records
            </h2>
          </div>
          <div className="p-6">
            {recordsLoading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400"><LoadingSpinner size="medium" /> Loading records...</div>
            ) : recentMedicalRecords.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No medical records found.</p>
            ) : (
              <div className="space-y-4">
                {recentMedicalRecords.map((record) => (
                  <div key={record._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 transition-transform transform hover:scale-[1.01]">
                    <p className="font-semibold text-gray-900 dark:text-white">{record.patientName ? `${record.patientName}'s Record` : 'Record'}</p>
                    <button className="text-blue-500 hover:underline text-sm">View Details</button>
                  </div>
                ))}
              </div>
            )}
            <button className="mt-4 w-full text-blue-600 hover:underline text-sm font-medium" onClick={() => navigate('/patient/medical-records')}>
              View All Records
            </button>
          </div>
        </div>

        {/* My Vitals */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Heart className="h-6 w-6 mr-3 text-red-500" />My Recent Vitals
            </h2>
          </div>
          <div className="p-6">
            {vitalsLoading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400"><LoadingSpinner size="medium" /> Loading vitals...</div>
            ) : recentVitals.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent vitals recorded.</p>
            ) : (
              <div className="space-y-4">
                {recentVitals.map((vital) => (
                  <div key={vital._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 transition-transform transform hover:scale-[1.01]">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {vital.patient?.fullName || vital.patientName || "My Vitals"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{vital.recordedAt ? `${new Date(vital.recordedAt).toLocaleDateString()} - ${new Date(vital.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {vital.bloodPressure?.systolic && vital.bloodPressure?.diastolic
                        ? `BP: ${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic} mmHg`
                        : "N/A"
                      }
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button className="mt-4 w-full text-blue-600 hover:underline text-sm font-medium" onClick={() => navigate('/patient/vitals')}>
              View All Vitals
            </button>
          </div>
        </div>

        {/* Insurance Card (My Insurance) */}
        <div className="lg:col-span-1 xl:col-span-1">
          <InsuranceCard />
        </div>

        {/* Resources Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1 xl:col-span-2">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <BookOpen className="h-6 w-6 mr-3 text-orange-500" />Health Resources
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {resourcesLoading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400"><LoadingSpinner size="medium" /> Loading resources...</div>
            ) : Array.isArray(resources) && resources.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No resources available.</p>
            ) : (
              Array.isArray(resources) && resources.map(post => (
                <div key={post._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{post.content}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>Category: <span className="font-medium text-blue-600 dark:text-blue-400">{post.category ? post.category.charAt(0).toUpperCase() + post.category.slice(1) : 'General'}</span></span>
                  </div>
                </div>
              ))
            )}
            <button className="mt-4 w-full text-blue-600 hover:underline text-sm font-medium" onClick={() => navigate('/resources')}>
              View All Resources
            </button>
          </div>
        </div>

        {/* Chat Button */}
        <div className="lg:col-span-1 xl:col-span-1">
          <button
            className="w-full bg-blue-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center transition-transform transform hover:scale-105 hover:shadow-xl border border-gray-100 dark:border-gray-700"
            onClick={() => navigate('/patient/chat')}
          >
            <MessageSquare className="h-10 w-10 text-white" />
            <p className="mt-2 text-lg font-semibold text-white">Chat with Doctor</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardPage; 