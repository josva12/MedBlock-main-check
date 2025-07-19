// ========= FIX: Corrected the React import =========
import React, { useEffect } from 'react';
// ================================================

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
} from 'lucide-react';
import { type RootState } from '../store';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { patients, isLoading: patientsLoading } = useAppSelector((state: RootState) => state.patients);
  const { appointments, isLoading: appointmentsLoading } = useAppSelector((state: RootState) => state.appointments);
  const { records, isLoading: recordsLoading } = useAppSelector((state: RootState) => state.medicalRecords);
  const { vitals, isLoading: vitalsLoading } = useAppSelector((state: RootState) => state.vitals);

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

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{getGreeting()}, {user?.fullName}!</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back. Here is a summary of the clinic's activity.</p>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">Role: {getRoleDisplayName(user?.role)}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleStats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex items-center">
            <div className={`p-3 rounded-lg ${stat.color} text-white`}><stat.icon className="h-6 w-6" /></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
              {stat.loading ? <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-12 rounded mt-1"></div> : <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {user && ['admin', 'doctor', 'nurse', 'front-desk'].includes(user.role) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center"><Calendar className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />Today's Appointments</h2></div>
            <div className="p-6">
              {todayAppointments.length === 0 ? <p className="text-gray-500 dark:text-gray-400 text-center py-4">No appointments for today</p> : (
                <div className="space-y-3">
                  {todayAppointments.slice(0, 5).map((appointment) => (
                    <div key={appointment._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{appointment.patientName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(appointment.date).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{appointment.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {user && ['admin', 'doctor', 'nurse', 'front-desk'].includes(user.role) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center"><Heart className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />Recent Vitals</h2></div>
            <div className="p-6">
              {recentVitals.length === 0 ? <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent vitals recorded</p> : (
                <div className="space-y-3">
                  {recentVitals.map((vital) => (
                    <div key={vital._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{vital.patientName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(vital.recordedAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">BP: {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;