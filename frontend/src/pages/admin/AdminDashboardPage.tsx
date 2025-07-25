import React, { useEffect, useState } from 'react';
import {
  Users,
  Calendar,
  FileText,
  LogOut,
  BriefcaseMedical,
  PlusCircle,
  ClipboardList,
  Store, // For Marketplace
  MessageSquare, // For AI Chat
  Blocks, // For Blockchain
  Settings, // For Settings
  BarChart2, // For Reports
  Bell, // For Notifications
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
import { fetchNotifications, sendNotification } from '../../features/notifications/notificationsSlice';
import { fetchFacilities } from '../../features/facilities/facilitiesSlice';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';
import api from '../../services/api';

const KENYAN_COUNTIES = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita Taveta', 'Garissa', 'Wajir', 'Mandera',
  'Marsabit', 'Isiolo', 'Meru', 'Tharaka Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua',
  'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia',
  'Uasin Gishu', 'Elgeyo Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado',
  'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia', 'Siaya', 'Kisumu', 'Homa Bay',
  'Migori', 'Kisii', 'Nyamira', 'Nairobi'
];

const TITLES = ['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.', 'Nurse', 'Pharm.', 'Tech.'];
const ROLES = ['doctor', 'nurse', 'admin', 'front-desk'];

const NOTIFICATION_TYPES = ['info', 'success', 'warning', 'error', 'admin'];

const AdminDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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
    dispatch(fetchFacilities({}));
  }, [dispatch]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Handlers for navigation
  const handleAddUser = () => setShowAddUserModal(true);
  const handleVerifyBusiness = () => setShowVerifyBusinessModal(true);
  const handleSendNotification = () => setShowSendNotificationModal(true);
  const handleViewAuditLogs = () => navigate('/admin/audit-logs');
  const handleAIChat = () => navigate('/ai-chat');
  const handleBlockchain = () => navigate('/blockchain');
  const handleReports = () => navigate('/admin/reports');
  const handleSettings = () => navigate('/admin/settings');
  const handleUserVerification = () => navigate('/admin/user-management?filter=pending');
  const handleManageBusinesses = () => navigate('/facilities');
  const handleManagePartners = () => navigate('/insurance-marketplace');

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    fullName: '',
    email: '',
    role: 'doctor',
    phone: '',
    title: 'Dr.',
    password: '',
    address: { county: '', subCounty: '' },
  });
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [addUserSuccess, setAddUserSuccess] = useState<string | null>(null);

  const handleAddUserClose = () => {
    setShowAddUserModal(false);
    setAddUserForm({ fullName: '', email: '', role: 'doctor', phone: '', title: 'Dr.', password: '', address: { county: '', subCounty: '' } });
    setAddUserError(null);
    setAddUserSuccess(null);
  };
  const handleAddUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      setAddUserForm((prev) => ({ ...prev, address: { ...prev.address, [name.split('.')[1]]: value } }));
    } else {
      setAddUserForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserLoading(true);
    setAddUserError(null);
    setAddUserSuccess(null);
    try {
      await api.post('/users', addUserForm);
      setAddUserSuccess('User created successfully!');
      setTimeout(() => handleAddUserClose(), 1200);
      dispatch(fetchUsers());
    } catch (err: any) {
      setAddUserError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setAddUserLoading(false);
    }
  };

  const [showVerifyBusinessModal, setShowVerifyBusinessModal] = useState(false);
  const [verifyingFacilityId, setVerifyingFacilityId] = useState<string | null>(null);
  const [rejectingFacilityId, setRejectingFacilityId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const handleVerifyBusinessClose = () => {
    setShowVerifyBusinessModal(false);
    setVerifyingFacilityId(null);
    setRejectingFacilityId(null);
    setRejectionReason('');
    setVerifyError(null);
  };
  const handleVerify = async (facilityId: string) => {
    setVerifyingFacilityId(facilityId);
    setVerifyLoading(true);
    setVerifyError(null);
    try {
      await api.patch(`/facilities/${facilityId}/verify`, { status: 'verified' });
      dispatch(fetchFacilities());
      setVerifyingFacilityId(null);
    } catch (err: any) {
      setVerifyError(err.response?.data?.error || 'Failed to verify facility');
    } finally {
      setVerifyLoading(false);
    }
  };
  const handleReject = async (facilityId: string) => {
    setRejectingFacilityId(facilityId);
    setVerifyLoading(true);
    setVerifyError(null);
    try {
      await api.patch(`/facilities/${facilityId}/verify`, { status: 'rejected', rejectionReason });
      dispatch(fetchFacilities());
      setRejectingFacilityId(null);
      setRejectionReason('');
    } catch (err: any) {
      setVerifyError(err.response?.data?.error || 'Failed to reject facility');
    } finally {
      setVerifyLoading(false);
    }
  };

  const [showSendNotificationModal, setShowSendNotificationModal] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info',
    roles: [] as string[],
  });
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(null);

  const handleSendNotificationClose = () => {
    setShowSendNotificationModal(false);
    setNotificationForm({ title: '', message: '', type: 'info', roles: [] });
    setNotificationError(null);
    setNotificationSuccess(null);
  };
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNotificationForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleRoleToggle = (role: string) => {
    setNotificationForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };
  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotificationLoading(true);
    setNotificationError(null);
    setNotificationSuccess(null);
    if (!notificationForm.title || !notificationForm.message || notificationForm.roles.length === 0) {
      setNotificationError('Title, message, and at least one role are required.');
      setNotificationLoading(false);
      return;
    }
    try {
      await dispatch(sendNotification({
        title: notificationForm.title,
        message: notificationForm.message,
        type: notificationForm.type as any,
        roles: notificationForm.roles,
      })).unwrap();
      setNotificationSuccess('Notification sent successfully!');
      setTimeout(() => handleSendNotificationClose(), 1200);
      dispatch(fetchNotifications());
    } catch (err: any) {
      setNotificationError(err.message || 'Failed to send notification');
    } finally {
      setNotificationLoading(false);
    }
  };

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
            <button className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors" onClick={() => navigate('/admin/users')}>
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
            <button className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors" onClick={handleManageBusinesses}>
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
            <button className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors" onClick={handleManagePartners}>
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
            <button onClick={handleViewAuditLogs} className="mt-4 w-full text-blue-600 hover:underline text-sm font-medium">View All Notifications</button>
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
            <button onClick={handleAddUser} className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-lg shadow-sm text-blue-700 dark:text-blue-300 font-medium transition-colors">
              <UserPlus className="h-5 w-5 mr-2" /> Add New User
            </button>
            <button onClick={handleVerifyBusiness} className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900 dark:hover:bg-green-800 rounded-lg shadow-sm text-green-700 dark:text-green-300 font-medium transition-colors">
              <ShieldCheck className="h-5 w-5 mr-2" /> Verify Business
            </button>
            <button onClick={handleSendNotification} className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900 dark:hover:bg-purple-800 rounded-lg shadow-sm text-purple-700 dark:text-purple-300 font-medium transition-colors">
              <Bell className="h-5 w-5 mr-2" /> Send Notification
            </button>
            <button onClick={handleViewAuditLogs} className="flex items-center justify-center p-4 bg-red-50 hover:bg-red-100 dark:bg-red-900 dark:hover:bg-red-800 rounded-lg shadow-sm text-red-700 dark:text-red-300 font-medium transition-colors">
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
            <button onClick={handleAIChat} className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <MessageSquare className="h-5 w-5 mr-2 text-teal-500" /> AI Chat
            </button>
            <button onClick={handleBlockchain} className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <Blocks className="h-5 w-5 mr-2 text-indigo-500" /> Blockchain
            </button>
            <button onClick={handleReports} className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <BarChart2 className="h-5 w-5 mr-2 text-green-500" /> Reports
            </button>
            <button onClick={handleSettings} className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <Settings className="h-5 w-5 mr-2 text-gray-500" /> Settings
            </button>
            <button onClick={handleViewAuditLogs} className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <ClipboardList className="h-5 w-5 mr-2 text-orange-500" /> Audit Logs
            </button>
            <button onClick={handleUserVerification} className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <ShieldCheck className="h-5 w-5 mr-2 text-purple-500" /> User Verification
            </button>
            <button onClick={handleAIChat} className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900 dark:hover:bg-purple-800 rounded-lg shadow-sm text-purple-700 dark:text-purple-300 font-medium transition-colors transform hover:scale-[1.02]">
              <MessageSquare className="h-5 w-5 mr-2 text-teal-500" /> Chat
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

      {/* Modals for Add User, Verify Business, Send Notification (to be implemented or imported) */}
      <Modal isOpen={showAddUserModal} onClose={handleAddUserClose} title="Add New User">
        <form onSubmit={handleAddUserSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input name="fullName" value={addUserForm.fullName} onChange={handleAddUserChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input name="email" type="email" value={addUserForm.email} onChange={handleAddUserChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select name="role" value={addUserForm.role} onChange={handleAddUserChange} required className="w-full border rounded px-3 py-2">
              {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <select name="title" value={addUserForm.title} onChange={handleAddUserChange} required className="w-full border rounded px-3 py-2">
              {TITLES.map((title) => <option key={title} value={title}>{title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input name="phone" value={addUserForm.phone} onChange={handleAddUserChange} required className="w-full border rounded px-3 py-2" placeholder="+2547... or 07..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input name="password" type="password" value={addUserForm.password} onChange={handleAddUserChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">County</label>
            <select name="address.county" value={addUserForm.address.county} onChange={handleAddUserChange} required className="w-full border rounded px-3 py-2">
              <option value="">Select county</option>
              {KENYAN_COUNTIES.map((county) => <option key={county} value={county}>{county}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sub-County</label>
            <input name="address.subCounty" value={addUserForm.address.subCounty} onChange={handleAddUserChange} required className="w-full border rounded px-3 py-2" />
          </div>
          {addUserError && <div className="text-red-600 text-sm">{addUserError}</div>}
          {addUserSuccess && <div className="text-green-600 text-sm">{addUserSuccess}</div>}
          <div className="flex justify-end">
            <button type="submit" disabled={addUserLoading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              {addUserLoading ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={showVerifyBusinessModal} onClose={handleVerifyBusinessClose} title="Verify Businesses">
        <div className="space-y-4">
          {facilities.filter(f => f.status !== 'verified').length === 0 ? (
            <div className="text-gray-600">All businesses are verified.</div>
          ) : (
            facilities.filter(f => f.status !== 'verified').map((facility) => (
              <div key={facility._id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{facility.name}</div>
                  <div className="text-sm text-gray-500">Type: {facility.type}</div>
                  <div className="text-sm text-gray-500">Reg #: {facility.registrationNumber}</div>
                  <div className="text-sm text-gray-500">Status: <span className="font-semibold">{facility.status}</span></div>
                </div>
                <div className="flex flex-col md:flex-row gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => handleVerify(facility._id)}
                    disabled={verifyLoading && verifyingFacilityId === facility._id}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                  >
                    {verifyLoading && verifyingFacilityId === facility._id ? 'Verifying...' : 'Verify'}
                  </button>
                  <button
                    onClick={() => setRejectingFacilityId(facility._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </div>
                {/* Reject Reason Modal */}
                {rejectingFacilityId === facility._id && (
                  <div className="mt-2 w-full">
                    <input
                      type="text"
                      placeholder="Rejection reason"
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      className="w-full border rounded px-2 py-1 mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(facility._id)}
                        disabled={verifyLoading || !rejectionReason}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                      >
                        {verifyLoading ? 'Rejecting...' : 'Confirm Reject'}
                      </button>
                      <button
                        onClick={() => { setRejectingFacilityId(null); setRejectionReason(''); }}
                        className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {verifyError && <div className="text-red-600 text-sm">{verifyError}</div>}
        </div>
      </Modal>
      <Modal isOpen={showSendNotificationModal} onClose={handleSendNotificationClose} title="Send Notification">
        <form onSubmit={handleNotificationSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input name="title" value={notificationForm.title} onChange={handleNotificationChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea name="message" value={notificationForm.message} onChange={handleNotificationChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select name="type" value={notificationForm.type} onChange={handleNotificationChange} required className="w-full border rounded px-3 py-2">
              {NOTIFICATION_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Roles</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <label key={role} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={notificationForm.roles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    className="form-checkbox"
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>
          {notificationError && <div className="text-red-600 text-sm">{notificationError}</div>}
          {notificationSuccess && <div className="text-green-600 text-sm">{notificationSuccess}</div>}
          <div className="flex justify-end">
            <button type="submit" disabled={notificationLoading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              {notificationLoading ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboardPage; 