import React, { useEffect } from 'react';
import {
  Users,
  Calendar,
  FileText,
  Heart,
  LogOut,
  BriefcaseMedical,
  PlusCircle,
  Clock,
  ClipboardList,
  Store, // For Marketplace
  MessageSquare, // For AI Chat
  Blocks, // For Blockchain
  Settings, // For Settings
  BarChart2, // For Reports
  Bell, // For Notifications
  Menu, // Hamburger menu
  Sun, // Light mode
  Moon, // Dark mode
  UserCog, // Admin specific icon
  Hospital, // For Pharmacies/Hospitals
  DollarSign, // For Insurance packages
  ShieldCheck, // For Verified Businesses
  UserPlus, // Add User
} from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchUsers } from '../../features/admin/adminSlice';
import { fetchPatients } from '../../features/patients/patientsSlice';
import { fetchAppointments } from '../../features/appointments/appointmentsSlice';
import { fetchMedicalRecords } from '../../features/medicalRecords/medicalRecordsSlice';
import { fetchNotifications } from '../../features/notifications/notificationsSlice';
import { fetchFacilities } from '../../features/facilities/facilitiesSlice';

const AdminDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { users, loading: usersLoading } = useAppSelector((state) => state.admin);
  const { patients, isLoading: patientsLoading } = useAppSelector((state) => state.patients);
  const { appointments, isLoading: appointmentsLoading } = useAppSelector((state) => state.appointments);
  const { records, isLoading: recordsLoading } = useAppSelector((state) => state.medicalRecords);
  const { notifications, isLoading: notificationsLoading } = useAppSelector((state) => state.notifications);
  const { facilities, isLoading: facilitiesLoading } = useAppSelector((state) => state.facilities);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchPatients());
    dispatch(fetchAppointments());
    dispatch(fetchMedicalRecords());
    dispatch(fetchNotifications());
    dispatch(fetchFacilities());
  }, [dispatch]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const isLoading = usersLoading || patientsLoading || appointmentsLoading || recordsLoading || notificationsLoading || facilitiesLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{getGreeting()}, {user?.fullName || 'Admin'}!</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Admin Dashboard - Comprehensive System Overview.</p>
        <div className="mt-4 text-md text-gray-500 dark:text-gray-400 font-semibold">Role: Admin</div>
      </div>

      {/* Admin-Specific Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center transition-transform transform hover:scale-103 hover:shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="p-4 rounded-full bg-blue-500 text-white flex-shrink-0 shadow-md">
            <Users className="h-7 w-7" />
          </div>
          <div className="ml-5">
            <p className="text-base font-medium text-gray-600 dark:text-gray-400">Total Patients</p>
            {patientsLoading ? <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded mt-2"></div> : <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{patients.length}</p>}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center transition-transform transform hover:scale-103 hover:shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="p-4 rounded-full bg-green-500 text-white flex-shrink-0 shadow-md">
            <Calendar className="h-7 w-7" />
          </div>
          <div className="ml-5">
            <p className="text-base font-medium text-gray-600 dark:text-gray-400">Total Appointments</p>
            {appointmentsLoading ? <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded mt-2"></div> : <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{appointments.length}</p>}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center transition-transform transform hover:scale-103 hover:shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="p-4 rounded-full bg-purple-500 text-white flex-shrink-0 shadow-md">
            <FileText className="h-7 w-7" />
          </div>
          <div className="ml-5">
            <p className="text-base font-medium text-gray-600 dark:text-gray-400">Total Medical Records</p>
            {recordsLoading ? <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded mt-2"></div> : <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{records.length}</p>}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center transition-transform transform hover:scale-103 hover:shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="p-4 rounded-full bg-red-500 text-white flex-shrink-0 shadow-md">
            <UserCog className="h-7 w-7" />
          </div>
          <div className="ml-5">
            <p className="text-base font-medium text-gray-600 dark:text-gray-400">Total Users</p>
            {usersLoading ? <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded mt-2"></div> : <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{users.length}</p>}
          </div>
        </div>
      </div>

      {/* Main Content Grid for Admin */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* User Management Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Users className="h-6 w-6 mr-3 text-teal-500" />User Management
            </h2>
            {users.filter(u => u.professionalVerification?.status === 'pending').length > 0 && (
              <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">{users.filter(u => u.professionalVerification?.status === 'pending').length} Pending</span>
            )}
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Overview of all system users.</p>
            {usersLoading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading users...</div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 mb-3">
                  <span className="font-medium text-gray-900 dark:text-white">Total Users:</span>
                  <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{users.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                  <span className="font-medium text-gray-900 dark:text-white">Active Users:</span>
                  <span className="font-bold text-lg text-green-600 dark:text-green-400">{users.filter(u => u.isActive).length}</span>
                </div>
              </>
            )}
            <button className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors">
              Manage All Users
            </button>
          </div>
        </div>

        {/* Pharmacies & Hospitals List (for admin verification/management) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Hospital className="h-6 w-6 mr-3 text-purple-500" />Businesses Overview
            </h2>
            {facilities.filter(f => f.status !== 'verified').length > 0 && (
              <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">{facilities.filter(f => f.status !== 'verified').length} Pending</span>
            )}
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Manage registered pharmacies and hospitals.</p>
            {facilitiesLoading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading businesses...</div>
            ) : facilities.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No businesses registered.</p>
            ) : (
              <div className="space-y-3">
                {facilities.slice(0, 3).map((business) => (
                  <div key={business._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 transition-transform transform hover:scale-[1.01]">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{business.type === 'Pharmacy' ? '💊' : '🏥'}</span>
                      <p className="font-medium text-gray-900 dark:text-white">{business.name}</p>
                    </div>
                    {business.status === 'verified' ? (
                      <ShieldCheck className="h-5 w-5 text-green-500" />
                    ) : (
                      <button className="text-blue-500 hover:underline text-sm">Verify</button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors">
              Manage Businesses
            </button>
          </div>
        </div>

        {/* Health Insurance Marketplace (for admin management) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Store className="h-6 w-6 mr-3 text-orange-500" />Insurance Partners
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Manage integrated health insurance companies.</p>
            <button className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors">
              Manage All Partners
            </button>
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Bell className="h-6 w-6 mr-3 text-yellow-500" />Notifications
            </h2>
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{notifications.filter(n => !n.isRead).length} New</span>
            )}
          </div>
          <div className="p-6">
            {notificationsLoading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading notifications...</div>
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
            <button className="mt-4 w-full text-blue-600 hover:underline text-sm font-medium">View All Notifications</button>
          </div>
        </div>

        {/* Quick Actions (Admin specific) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <PlusCircle className="h-6 w-6 mr-3 text-purple-500" />Admin Quick Actions
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-lg shadow-sm text-blue-700 dark:text-blue-300 font-medium transition-colors">
              <UserPlus className="h-5 w-5 mr-2" /> Add New User
            </button>
            <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900 dark:hover:bg-green-800 rounded-lg shadow-sm text-green-700 dark:text-green-300 font-medium transition-colors">
              <ShieldCheck className="h-5 w-5 mr-2" /> Verify Business
            </button>
            <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900 dark:hover:bg-purple-800 rounded-lg shadow-sm text-purple-700 dark:text-purple-300 font-medium transition-colors">
              <Bell className="h-5 w-5 mr-2" /> Send Notification
            </button>
            <button className="flex items-center justify-center p-4 bg-red-50 hover:bg-red-100 dark:bg-red-900 dark:hover:bg-red-800 rounded-lg shadow-sm text-red-700 dark:text-red-300 font-medium transition-colors">
              <LogOut className="h-5 w-5 mr-2" /> View Audit Logs
            </button>
          </div>
        </div>

        {/* Activity Overview (Placeholder for a chart) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-2 xl:col-span-2">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <ClipboardList className="h-6 w-6 mr-3 text-orange-500" />System Activity Overview
            </h2>
          </div>
          <div className="p-6 text-center text-gray-500 dark:text-gray-400 h-64 flex items-center justify-center">
            <p>
              <span className="font-bold">Chart Placeholder:</span> This area would display a dynamic chart (e.g., user registrations over time, system resource usage)
              <br /> based on the clinic's data.
            </p>
          </div>
        </div>

        {/* Core MedBlock Modules (Admin-specific links) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <BriefcaseMedical className="h-6 w-6 mr-3 text-blue-500" />Admin Features
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <MessageSquare className="h-5 w-5 mr-2 text-teal-500" /> AI Chat
            </button>
            <button className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <Blocks className="h-5 w-5 mr-2 text-indigo-500" /> Blockchain
            </button>
            <button className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <BarChart2 className="h-5 w-5 mr-2 text-green-500" /> Reports
            </button>
            <button className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <Settings className="h-5 w-5 mr-2 text-gray-500" /> Settings
            </button>
            <button className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <ClipboardList className="h-5 w-5 mr-2 text-orange-500" /> Audit Logs
            </button>
            <button className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <ShieldCheck className="h-5 w-5 mr-2 text-purple-500" /> User Verification
            </button>
          </div>
        </div>

        {/* Insurance Overview Card */}
        <div className="lg:col-span-1 xl:col-span-1">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-48">
            <div>
              <h3 className="text-xl font-bold mb-2">Insurance Overview</h3>
              <p className="text-sm">Total Policies: 1,200</p>
              <p className="text-sm">Active Claims: 85</p>
            </div>
            <div className="text-right text-sm opacity-80">
              <DollarSign className="inline-block h-5 w-5 mr-1" /> Revenue: Ksh 12M
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage; 