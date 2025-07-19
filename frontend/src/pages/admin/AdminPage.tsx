import React, { useEffect, useState } from "react";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useAppSelector } from "../../hooks/useAppSelector";
import { 
  fetchUsers, 
  fetchAuditLogs, 
  fetchReports,
  clearError 
} from "../../features/admin/adminSlice";
import { 
  Users, 
  Shield, 
  Activity, 
  BarChart3, 
  UserCheck, 
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react";
import { type RootState } from "../../store";

// Components
import UserManagementTab from "../../components/admin/UserManagementTab";
import ProfessionalVerificationTab from "../../components/admin/ProfessionalVerificationTab";
import AuditLogsTab from "../../components/admin/AuditLogsTab";
import ReportsTab from "../../components/admin/ReportsTab";

type TabType = 'users' | 'verification' | 'audit' | 'reports';

const AdminPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state: RootState) => state.admin);
  const [activeTab, setActiveTab] = useState<TabType>('users');

  // ========= THE CRITICAL FIX IS HERE =========
  // We now provide the exact arguments that each thunk expects.
  useEffect(() => {
    // For thunks defined with `async (_, ...)`, we pass `undefined`.
    dispatch(fetchUsers(undefined)); 
    dispatch(fetchReports(undefined));

    // For thunks defined with `async (params = {}, ...)`, we pass an empty object.
    dispatch(fetchAuditLogs({})); 
  }, [dispatch]);
  // ===========================================

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const tabs = [
    { id: 'users' as TabType, label: 'User Management', icon: Users },
    { id: 'verification' as TabType, label: 'Professional Verification', icon: Shield },
    { id: 'audit' as TabType, label: 'Audit Logs', icon: Activity },
    { id: 'reports' as TabType, label: 'Reports', icon: BarChart3 },
  ];

  const getStats = () => {
    if (!Array.isArray(users)) {
      return { totalUsers: 0, activeUsers: 0, pendingVerification: 0, verifiedProfessionals: 0 };
    }
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const pendingVerification = users.filter(u => 
      u.professionalVerification?.status === 'pending'
    ).length;
    const verifiedProfessionals = users.filter(u => 
      u.professionalVerification?.status === 'verified'
    ).length;

    return { totalUsers, activeUsers, pendingVerification, verifiedProfessionals };
  };

  const stats = getStats();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagementTab />;
      case 'verification':
        return <ProfessionalVerificationTab />;
      case 'audit':
        return <AuditLogsTab />;
      case 'reports':
        return <ReportsTab />;
      default:
        return <UserManagementTab />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage users, verify professionals, and monitor system activity</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Verification</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.pendingVerification}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified Professionals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.verifiedProfessionals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;