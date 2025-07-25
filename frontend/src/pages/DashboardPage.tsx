import React, { useEffect } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchPatients } from '../features/patients/patientsSlice';
import { fetchAppointments } from '../features/appointments/appointmentsSlice';
import { fetchMedicalRecords } from '../features/medicalRecords/medicalRecordsSlice';
import { fetchVitals } from '../features/vitals/vitalsSlice';
import {
    Users,
    Calendar,
    FileText,
    Heart,
    BriefcaseMedical,
    PlusCircle,
    Clock,
    ClipboardList,
    Store,
    MessageSquare,
    Blocks,
    Settings,
    BarChart2,
} from 'lucide-react';
import type { RootState } from '../store';
import InsuranceCard from '../components/dashboard/InsuranceCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const HealthInsuranceMarketplace: React.FC = () => {
  const insuranceCompanies = [
    { name: "Britam Health", plans: 5, icon: "🏢" },
    { name: "Jubilee Health", plans: 7, icon: "🌟" },
    { name: "UAP Old Mutual", plans: 4, icon: "🛡️" },
    { name: "AAR Insurance", plans: 6, icon: "🏥" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <Store className="h-6 w-6 mr-3 text-orange-500" />Health Insurance Marketplace
        </h2>
      </div>
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Explore health insurance plans from our partners.</p>
        <div className="space-y-3">
          {insuranceCompanies.map((company) => (
            <div key={company.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 transition-transform transform hover:scale-[1.01]">
              <div className="flex items-center">
                <span className="text-lg mr-2">{company.icon}</span>
                <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{company.plans} Plans</span>
            </div>
          ))}
        </div>
        <button className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors">
          View All Plans
        </button>
      </div>
    </div>
  );
};

const CoreMedBlockModules: React.FC<{ navigateTo: (page: string) => void }> = ({ navigateTo }) => {
  const modules = [
    { name: "AI Chat", icon: MessageSquare, color: "text-teal-500", page: "ai-chat" },
    { name: "Blockchain", icon: Blocks, color: "text-indigo-500", page: "blockchain" },
    { name: "Reports", icon: BarChart2, color: "text-green-500", page: "reports" },
    { name: "Settings", icon: Settings, color: "text-gray-500", page: "settings" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <BriefcaseMedical className="h-6 w-6 mr-3 text-blue-500" />Core MedBlock Modules
        </h2>
      </div>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modules.map((module) => (
          <button
            key={module.name}
            onClick={() => navigateTo(module.page)}
            className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]"
          >
            <module.icon className={`h-5 w-5 mr-2 ${module.color}`} /> {module.name}
          </button>
        ))}
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { patients, isLoading: patientsLoading } = useAppSelector((state: RootState) => state.patients);
  const { appointments, isLoading: appointmentsLoading } = useAppSelector((state: RootState) => state.appointments);
  const { records, isLoading: recordsLoading } = useAppSelector((state: RootState) => state.medicalRecords);
  const { vitals, isLoading: vitalsLoading } = useAppSelector((state: RootState) => state.vitals);
  const navigate = useNavigate();

  // Redirect to role-specific dashboard if not already there
  React.useEffect(() => {
    if (!user) return;
    switch (user.role) {
      case 'admin':
        if (!window.location.pathname.startsWith('/admin')) navigate('/admin/dashboard', { replace: true });
        break;
      case 'doctor':
        if (!window.location.pathname.startsWith('/doctor')) navigate('/doctor/dashboard', { replace: true });
        break;
      case 'nurse':
        if (!window.location.pathname.startsWith('/nurse')) navigate('/nurse/dashboard', { replace: true });
        break;
      case 'front-desk':
        if (!window.location.pathname.startsWith('/frontdesk')) navigate('/frontdesk/dashboard', { replace: true });
        break;
      case 'patient':
        if (!window.location.pathname.startsWith('/patient')) navigate('/patient/dashboard', { replace: true });
        break;
      case 'pharmacy':
        if (!window.location.pathname.startsWith('/pharmacy')) navigate('/pharmacy/dashboard', { replace: true });
        break;
      default:
        navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    const canViewPatients = ['admin', 'doctor', 'nurse', 'front-desk'].includes(user.role);
    const canViewAppointments = ['admin', 'doctor', 'nurse', 'front-desk'].includes(user.role);
    const canViewMedicalRecords = ['admin', 'doctor', 'nurse'].includes(user.role);
    const canViewVitals = ['admin', 'doctor', 'nurse', 'front-desk'].includes(user.role);

    if (canViewPatients) dispatch(fetchPatients());
    if (canViewAppointments) dispatch(fetchAppointments());
    if (canViewMedicalRecords) dispatch(fetchMedicalRecords());
    if (canViewVitals) dispatch(fetchVitals(undefined));
  }, [dispatch, user]);

  const getRoleDisplayName = (role: string | undefined) => {
    return role ? role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ') : '';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayAppointments = Array.isArray(appointments) ? appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()) : [];
  const recentVitals = Array.isArray(vitals) ? vitals.slice(0, 5) : [];

  const allStats = [
    { name: 'Today\'s Appointments', value: todayAppointments.length, icon: Calendar, color: 'bg-green-500', loading: appointmentsLoading, requiredRole: ['admin', 'doctor', 'nurse', 'front-desk'] },
    { name: 'Total Patients', value: Array.isArray(patients) ? patients.length : 0, icon: Users, color: 'bg-blue-500', loading: patientsLoading, requiredRole: ['admin', 'doctor', 'nurse', 'front-desk'] },
    { name: 'Medical Records', value: Array.isArray(records) ? records.length : 0, icon: FileText, color: 'bg-purple-500', loading: recordsLoading, requiredRole: ['admin', 'doctor', 'nurse'] },
    { name: 'Recent Vitals', value: recentVitals.length, icon: Heart, color: 'bg-red-500', loading: vitalsLoading, requiredRole: ['admin', 'doctor', 'nurse', 'front-desk'] },
  ];

  const visibleStats = allStats.filter(stat => user && stat.requiredRole.includes(user.role));

  const navigateTo = (page: string) => {
    // In a real app, you would use useNavigate from react-router-dom
    console.log(`Navigating to ${page}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{getGreeting()}, {user?.fullName || 'User'}!</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Welcome back. Here is a summary of the clinic's activity.</p>
        <div className="mt-4 text-md text-gray-500 dark:text-gray-400 font-semibold">Role: {getRoleDisplayName(user?.role)}</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {visibleStats.map((stat) => (
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Today's Appointments */}
        {user && ['admin', 'doctor', 'nurse', 'front-desk'].includes(user.role) && (
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
                  {todayAppointments.slice(0, 5).map((appointment) => (
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
            </div>
          </div>
        )}

        {/* Recent Vitals */}
        {user && ['admin', 'doctor', 'nurse', 'front-desk'].includes(user.role) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Heart className="h-6 w-6 mr-3 text-red-500" />Recent Vitals
              </h2>
            </div>
            <div className="p-6">
              {vitalsLoading ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400"><LoadingSpinner size="medium" /> Loading vitals...</div>
              ) : recentVitals.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent vitals recorded</p>
              ) : (
                <div className="space-y-4">
                  {recentVitals.map((vital) => (
                    <div key={vital._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 transition-transform transform hover:scale-[1.01]">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {vital.patient?.fullName || vital.patientName || "Unknown Patient"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{new Date(vital.recordedAt).toLocaleDateString()} - {new Date(vital.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
            </div>
          </div>
        )}

        {/* Insurance Card */}
        <div className="lg:col-span-1 xl:col-span-1">
          <InsuranceCard />
        </div>

        {/* Health Insurance Marketplace */}
        {user && ['admin', 'front-desk', 'patient'].includes(user.role) && (
          <HealthInsuranceMarketplace />
        )}

        {/* Core MedBlock Modules */}
        <CoreMedBlockModules navigateTo={navigateTo} />

        {/* Quick Actions */}
        {user && ['admin', 'doctor', 'nurse', 'front-desk'].includes(user.role) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <PlusCircle className="h-6 w-6 mr-3 text-purple-500" />Quick Actions
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-lg shadow-sm text-blue-700 dark:text-blue-300 font-medium transition-colors">
                <Users className="h-5 w-5 mr-2" /> Add Patient
              </button>
              <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900 dark:hover:bg-green-800 rounded-lg shadow-sm text-green-700 dark:text-green-300 font-medium transition-colors">
                <Calendar className="h-5 w-5 mr-2" /> Schedule Appt.
              </button>
              <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900 dark:hover:bg-purple-800 rounded-lg shadow-sm text-purple-700 dark:text-purple-300 font-medium transition-colors">
                <FileText className="h-5 w-5 mr-2" /> New Record
              </button>
              <button className="flex items-center justify-center p-4 bg-red-50 hover:bg-red-100 dark:bg-red-900 dark:hover:bg-red-800 rounded-lg shadow-sm text-red-700 dark:text-red-300 font-medium transition-colors">
                <Heart className="h-5 w-5 mr-2" /> Record Vitals
              </button>
            </div>
          </div>
        )}

        {/* Activity Overview (Placeholder) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-2 xl:col-span-2">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <ClipboardList className="h-6 w-6 mr-3 text-orange-500" />Activity Overview
            </h2>
          </div>
          <div className="p-6 text-center text-gray-500 dark:text-gray-400 h-64 flex items-center justify-center">
            <p>
              <span className="font-bold">Chart Placeholder:</span> This area would display a dynamic chart.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;