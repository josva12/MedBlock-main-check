import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { fetchAllUsers } from '../../features/admin/adminSlice';
import { fetchAllPatients } from '../../features/patients/patientsSlice';
import { fetchAllAppointments } from '../../features/appointments/appointmentsSlice';
import { fetchAllClaims } from '../../features/claims/claimsSlice';

const AdminDashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const adminState = useSelector((state: RootState) => state.admin);
  const patientsState = useSelector((state: RootState) => state.patients);
  const appointmentsState = useSelector((state: RootState) => state.appointments);
  const claimsState = useSelector((state: RootState) => state.claims);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalClaims: 0,
    pendingClaims: 0,
    activeInsurance: 0,
  });

  useEffect(() => {
    // Fetch all data for admin dashboard
    dispatch(fetchAllUsers());
    dispatch(fetchAllPatients());
    dispatch(fetchAllAppointments());
    dispatch(fetchAllClaims());
  }, [dispatch]);

  useEffect(() => {
    // Calculate stats
    setStats({
      totalUsers: adminState.users.length,
      totalPatients: patientsState.patients.length,
      totalAppointments: appointmentsState.appointments.length,
      totalClaims: claimsState.claims.length,
      pendingClaims: claimsState.claims.filter(claim => claim.status === 'pending').length,
      activeInsurance: 0, // TODO: Add insurance stats
    });
  }, [adminState, patientsState, appointmentsState, claimsState]);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'bg-blue-500',
      description: 'Registered users in the system'
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: '🏥',
      color: 'bg-green-500',
      description: 'Registered patients'
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: '📅',
      color: 'bg-purple-500',
      description: 'Scheduled appointments'
    },
    {
      title: 'Total Claims',
      value: stats.totalClaims,
      icon: '📋',
      color: 'bg-orange-500',
      description: 'Insurance claims submitted'
    },
    {
      title: 'Pending Claims',
      value: stats.pendingClaims,
      icon: '⏳',
      color: 'bg-yellow-500',
      description: 'Claims awaiting approval'
    },
    {
      title: 'Active Insurance',
      value: stats.activeInsurance,
      icon: '🛡️',
      color: 'bg-indigo-500',
      description: 'Active insurance policies'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Add, edit, or remove system users',
      icon: '👥',
      link: '/admin/users',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Patient Records',
      description: 'View and manage patient information',
      icon: '🏥',
      link: '/admin/patients',
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'Appointments',
      description: 'Manage all appointments',
      icon: '📅',
      link: '/admin/appointments',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'Claims Processing',
      description: 'Review and process insurance claims',
      icon: '📋',
      link: '/admin/claims',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      title: 'Insurance Management',
      description: 'Manage insurance policies and companies',
      icon: '🛡️',
      link: '/admin/insurance',
      color: 'bg-indigo-100 text-indigo-800'
    },
    {
      title: 'Reports & Analytics',
      description: 'View system reports and analytics',
      icon: '📊',
      link: '/admin/reports',
      color: 'bg-red-100 text-red-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user?.fullName}. Here's an overview of your system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${action.color}`}>
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
          {adminState.users.slice(0, 5).map((user) => (
            <div key={user._id} className="flex items-center space-x-3 py-2 border-b last:border-b-0">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{user.fullName}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                user.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                user.role === 'front-desk' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user.role}
              </span>
            </div>
          ))}
        </div>

        {/* Recent Claims */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Claims</h3>
          {claimsState.claims.slice(0, 5).map((claim) => (
            <div key={claim._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div>
                <p className="font-medium text-gray-900">KES {claim.claimAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{claim.servicesRendered.join(', ')}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                claim.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {claim.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Database</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">API Server</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">File Storage</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage; 