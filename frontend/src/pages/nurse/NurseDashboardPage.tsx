import React, { useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchPatients } from '../../features/patients/patientsSlice';
import { fetchAppointments } from '../../features/appointments/appointmentsSlice';
import { fetchMedicalRecords } from '../../features/medicalRecords/medicalRecordsSlice';
import { fetchVitals } from '../../features/vitals/vitalsSlice';
import { fetchNotifications } from '../../features/notifications/notificationsSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users, Calendar, FileText, Heart, LogOut, BriefcaseMedical, PlusCircle, Clock, ClipboardList, MessageSquare, Blocks, Settings, BarChart2, Bell, Menu, Sun, Moon, Syringe,
} from 'lucide-react';

const NurseDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
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

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center"><Users className="mr-3 text-blue-500" />Nurse Dashboard</h1>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Patients */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center mb-2"><Users className="h-6 w-6 mr-2 text-blue-500" /><span className="font-semibold">Patients</span></div>
            <div className="text-2xl font-bold">{Array.isArray(patients) ? patients.length : 0}</div>
          </div>
          {/* Appointments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center mb-2"><Calendar className="h-6 w-6 mr-2 text-green-500" /><span className="font-semibold">Appointments</span></div>
            <div className="text-2xl font-bold">{Array.isArray(appointments) ? appointments.length : 0}</div>
          </div>
          {/* Medical Records */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center mb-2"><FileText className="h-6 w-6 mr-2 text-purple-500" /><span className="font-semibold">Medical Records</span></div>
            <div className="text-2xl font-bold">{Array.isArray(records) ? records.length : 0}</div>
          </div>
          {/* Vitals */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center mb-2"><Heart className="h-6 w-6 mr-2 text-pink-500" /><span className="font-semibold">Vitals</span></div>
            <div className="text-2xl font-bold">{Array.isArray(vitals) ? vitals.length : 0}</div>
          </div>
          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center mb-2"><Bell className="h-6 w-6 mr-2 text-yellow-500" /><span className="font-semibold">Notifications</span></div>
            <div className="text-2xl font-bold">{Array.isArray(notifications) ? notifications.length : 0}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseDashboardPage; 