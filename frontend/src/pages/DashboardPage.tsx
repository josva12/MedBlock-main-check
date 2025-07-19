import React, { useEffect } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchPatients } from '../features/patients/patientsSlice';
import { fetchAppointments } from '../features/appointments/appointmentsSlice';
import { fetchMedicalRecords } from '../features/medicalRecords/medicalRecordsSlice';
import { fetchVitals } from '../features/vitals/vitalsSlice';
import {
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { type RootState } from '../store';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state: RootState) => state.auth);
  const { patients, isLoading: patientsLoading } = useAppSelector((state: RootState) => state.patients);
  const { appointments, isLoading: appointmentsLoading } = useAppSelector((state: RootState) => state.appointments);
  const { records, isLoading: recordsLoading } = useAppSelector((state: RootState) => state.medicalRecords);
  const { vitals, isLoading: vitalsLoading } = useAppSelector((state: RootState) => state.vitals);

  // ========= THE CRITICAL FIX IS HERE =========
  // This effect is now "role-aware". It checks the user's role
  // before dispatching actions, preventing 403 Forbidden errors.
  useEffect(() => {
    // Don't fetch anything until the user object is available
    if (!user) {
      return;
    }

    // Define permissions based on typical roles.
    // NOTE: This should mirror the permissions you set on your backend.
    const canViewPatients = ['admin', 'doctor', 'nurse', 'front-desk'].includes(user.role);
    const canViewAppointments = ['admin', 'doctor', 'nurse', 'front-desk'].includes(user.role);
    const canViewMedicalRecords = ['admin', 'doctor', 'nurse'].includes(user.role);
    // Assuming all authenticated users can view vitals for this example.
    const canViewVitals = true;

    // Dispatch actions only if the user has permission.
    if (canViewPatients) dispatch(fetchPatients());
    if (canViewAppointments) dispatch(fetchAppointments());
    if (canViewMedicalRecords) dispatch(fetchMedicalRecords());
    if (canViewVitals) dispatch(fetchVitals());

  }, [dispatch, user]); // Add `user` as a dependency.

  const getRoleDisplayName = (role: string | undefined) => {
    const roleMap: Record<string, string> = {
      admin: 'Administrator',
      doctor: 'Doctor',
      nurse: 'Nurse',
      'front-desk': 'Front Desk',
      pharmacy: 'Pharmacist',
    };
    return role ? roleMap[role] || role : '';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayAppointments = Array.isArray(appointments)
    ? appointments.filter(appointment => new Date(appointment.date).toDateString() === new Date().toDateString())
    : [];

  const recentVitals = Array.isArray(vitals) ? vitals.slice(0, 5) : [];

  // The base list of all possible stats cards
  const allStats = [
    { name: 'Total Patients', value: Array.isArray(patients) ? patients.length : 0, icon: UserGroupIcon, color: 'bg-blue-500', loading: patientsLoading, requiredRole: ['admin', 'doctor', 'nurse', 'front-desk'] },
    { name: 'Today\'s Appointments', value: todayAppointments.length, icon: CalendarIcon, color: 'bg-green-500', loading: appointmentsLoading, requiredRole: ['admin', 'doctor', 'nurse', 'front-desk'] },
    { name: 'Medical Records', value: Array.isArray(records) ? records.length : 0, icon: DocumentTextIcon, color: 'bg-purple-500', loading: recordsLoading, requiredRole: ['admin', 'doctor', 'nurse'] },
    { name: 'Vital Signs', value: Array.isArray(vitals) ? vitals.length : 0, icon: HeartIcon, color: 'bg-red-500', loading: vitalsLoading, requiredRole: ['admin', 'doctor', 'nurse', 'front-desk', 'pharmacy'] },
  ];

  // Filter the stats cards to show only what the current user is allowed to see
  const visibleStats = allStats.filter(stat => user && stat.requiredRole.includes(user.role));

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {user?.fullName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome back. Here is a summary of the clinic's activity.
        </p>
        <div className="mt-2 text-sm text-gray-500">
          Role: {getRoleDisplayName(user?.role)}
        </div>
      </div>

      {/* Stats Grid - Renders only the cards the user is permitted to see */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {visibleStats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6 flex items-center">
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                {stat.loading ? (
                  <div className="animate-pulse bg-gray-200 h-6 w-12 rounded mt-1"></div>
                ) : (
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* Main Content Grid - Renders sections based on role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {user && ['admin', 'doctor', 'nurse', 'front-desk'].includes(user.role) && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
                Today's Appointments
              </h2>
            </div>
            <div className="p-6">
              {/* ... appointments JSX ... */}
            </div>
          </div>
        )}

        {user && ['admin', 'doctor', 'nurse'].includes(user.role) && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <HeartIcon className="h-5 w-5 mr-2 text-gray-500" />
                Recent Vital Signs
              </h2>
            </div>
            <div className="p-6">
              {/* ... vitals JSX ... */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;