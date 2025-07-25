import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchPatients } from '../../features/patients/patientsSlice';
import { fetchAppointments } from '../../features/appointments/appointmentsSlice';
import { fetchMedicalRecords } from '../../features/medicalRecords/medicalRecordsSlice';
import { fetchVitals } from '../../features/vitals/vitalsSlice';
import { fetchNotifications } from '../../features/notifications/notificationsSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users, Calendar, FileText, Heart, LogOut, BriefcaseMedical, PlusCircle, Clock, ClipboardList, MessageSquare, Blocks, Settings, BarChart2, Bell, Syringe,
} from 'lucide-react';

const NurseDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { patients, isLoading: patientsLoading } = useAppSelector((state) => state.patients);
  const { appointments, isLoading: appointmentsLoading } = useAppSelector((state) => state.appointments);
  const { records, isLoading: recordsLoading } = useAppSelector((state) => state.medicalRecords);
  const { vitals, isLoading: vitalsLoading } = useAppSelector((state) => state.vitals);
  const { notifications, isLoading: notificationsLoading } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchAppointments());
    dispatch(fetchMedicalRecords());
    dispatch(fetchVitals());
    dispatch(fetchNotifications());
  }, [dispatch]);

  const isLoading = patientsLoading || appointmentsLoading || recordsLoading || vitalsLoading || notificationsLoading;

  // Quick Actions
  const quickActions = [
    { label: 'View Patients', icon: Users, onClick: () => navigate('/nurse/patients'), color: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800', text: 'text-blue-700 dark:text-blue-300' },
    { label: 'Record Vitals', icon: Heart, onClick: () => navigate('/nurse/vitals'), color: 'bg-green-50 hover:bg-green-100 dark:bg-green-900 dark:hover:bg-green-800', text: 'text-green-700 dark:text-green-300' },
    { label: 'Administer Meds', icon: Syringe, onClick: () => navigate('/nurse/medical-records'), color: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900 dark:hover:bg-purple-800', text: 'text-purple-700 dark:text-purple-300' },
    { label: 'New Observation', icon: FileText, onClick: () => navigate('/nurse/medical-records'), color: 'bg-red-50 hover:bg-red-100 dark:bg-red-900 dark:hover:bg-red-800', text: 'text-red-700 dark:text-red-300' },
  ];

  // Nurse Features
  const nurseFeatures = [
    { label: 'AI Chat', icon: MessageSquare, onClick: () => navigate('/nurse/ai-chat'), color: 'text-teal-500' },
    { label: 'Blockchain', icon: Blocks, onClick: () => navigate('/nurse/blockchain'), color: 'text-indigo-500' },
    { label: 'Reports', icon: BarChart2, onClick: () => navigate('/nurse/reports'), color: 'text-green-500' },
    { label: 'Settings', icon: Settings, onClick: () => navigate('/nurse/settings'), color: 'text-gray-500' },
    { label: 'Chat', icon: MessageSquare, onClick: () => navigate('/nurse/chat'), color: 'text-teal-500' },
  ];

  // My Department widget
  const myDepartment = user?.department || null;
  const safePatients = Array.isArray(patients) ? patients : [];

  return (
    <div className="min-h-screen p-6">
      {/* Department warning */}
      {user?.role === 'nurse' && !myDepartment && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded mb-6">
          You are not assigned to any department. Please contact your administrator.
        </div>
      )}
      <h1 className="text-3xl font-bold mb-6 flex items-center"><Users className="mr-3 text-blue-500" />Nurse Dashboard</h1>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <PlusCircle className="h-6 w-6 mr-3 text-purple-500" />Quick Actions
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <button key={action.label} onClick={action.onClick} className={`flex items-center justify-center p-4 ${action.color} rounded-lg shadow-sm ${action.text} font-medium transition-colors`}>
                  <action.icon className="h-5 w-5 mr-2" /> {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* My Patients */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Users className="h-6 w-6 mr-3 text-blue-500" />My Patients
              </h2>
            </div>
            <div className="p-6">
              {safePatients.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No patients assigned.</p>
              ) : (
                <div className="space-y-4">
                  {safePatients.slice(0, 5).map((patient) => (
                    <div key={patient._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 transition-transform transform hover:scale-[1.01]">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{patient.fullName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Room: N/A</p>
                      </div>
                      <button className="text-blue-500 hover:underline text-sm" onClick={() => navigate(`/nurse/patients?patientId=${patient._id}`)}>View Profile</button>
                    </div>
                  ))}
                </div>
              )}
              <button className="mt-6 w-full text-blue-600 hover:underline text-sm font-medium" onClick={() => navigate('/nurse/patients')}>
                View All Patients
              </button>
            </div>
          </div>

          {/* Nurse Features */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <BriefcaseMedical className="h-6 w-6 mr-3 text-blue-500" />Nurse Features
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nurseFeatures.map((feature) => (
                <button key={feature.label} onClick={feature.onClick} className={`flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]`}>
                  <feature.icon className={`h-5 w-5 mr-2 ${feature.color}`} /> {feature.label}
                </button>
              ))}
          </div>
          </div>

          {/* My Department Widget */}
          {user?.role === 'nurse' && myDepartment && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-6 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">My Department</h2>
              <p className="text-gray-700 dark:text-gray-300">Department: <span className="font-bold">{myDepartment}</span></p>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NurseDashboardPage; 