import React, { useEffect, useCallback } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchMedicalRecords } from '../../features/medicalRecords/medicalRecordsSlice';
import { fetchFacilities } from '../../features/facilities/facilitiesSlice';
import { fetchTeleconsultations } from '../../features/teleconsultations/teleconsultationsSlice';
import { fetchNotifications } from '../../features/notifications/notificationsSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ShoppingCart, Package, MessageCircle, ClipboardList, Bell, BarChart2, BriefcaseMedical, PlusCircle, Blocks, Settings, MessageSquare, Pill, LogOut, BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PharmacyDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { records, isLoading: ordersLoading } = useAppSelector((state) => state.medicalRecords);
  const { facilities, isLoading: inventoryLoading } = useAppSelector((state) => state.facilities);
  const { teleconsultations, isLoading: consultationsLoading } = useAppSelector((state) => state.teleconsultations);
  const { notifications, isLoading: notificationsLoading } = useAppSelector((state) => state.notifications);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMedicalRecords(undefined));
    dispatch(fetchFacilities({}));
    dispatch(fetchTeleconsultations());
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Orders: filter medical records for prescription type
  const pharmacyOrders = Array.isArray(records) ? records.filter(r => r.recordType === 'prescription') : [];
  // Inventory: filter facilities for type 'pharmacy' (or use inventory field if available)
  const pharmacyInventory = Array.isArray(facilities) ? facilities.filter(f => f.type === 'pharmacy') : [];
  // Consultations: use teleconsultations
  const consultations = Array.isArray(teleconsultations) ? teleconsultations : [];
  // Notifications
  const pharmacyNotifications = Array.isArray(notifications) ? notifications : [];

  // Stats
  const pendingOrders = pharmacyOrders.filter(o => o.status === 'draft').length;
  // TODO: Integrate real inventory model. For now, use pharmacyInventory.length and set lowStockCount to 0.
  const lowStockCount = 0;
  const newConsultations = consultations.length;
  const unreadNotificationsCount = pharmacyNotifications.filter(n => n.isRead === false).length;

  const pharmacyStats = [
    { name: 'Pending Orders', value: pendingOrders, icon: ShoppingCart, color: 'bg-orange-500', loading: ordersLoading },
    { name: 'Low Stock Items', value: lowStockCount, icon: Package, color: 'bg-red-500', loading: inventoryLoading },
    { name: 'New Consultations', value: newConsultations, icon: MessageCircle, color: 'bg-blue-500', loading: consultationsLoading },
    { name: 'Total Inventory Items', value: pharmacyInventory.length, icon: Pill, color: 'bg-green-500', loading: inventoryLoading },
  ];

  // Navigation handler
  const navigateTo = useCallback((page: string) => {
    switch (page) {
      case 'orders': navigate('/pharmacy/orders'); break;
      case 'inventory': navigate('/pharmacy/inventory'); break;
      case 'consultations': navigate('/pharmacy/consultations'); break;
      case 'prescriptions': navigate('/pharmacy/prescriptions'); break;
      case 'ai-chat': navigate('/pharmacy/chat'); break;
      case 'blockchain': navigate('/pharmacy/blockchain'); break;
      case 'reports': navigate('/pharmacy/reports'); break;
      case 'settings': navigate('/pharmacy/settings'); break;
      case 'profile': navigate('/pharmacy/profile'); break;
      case 'dashboard': navigate('/pharmacy/dashboard'); break;
      case 'notifications': navigate('/pharmacy/notifications'); break;
      default: break;
    }
  }, [navigate]);

  // Helper for order status color
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'final': return 'bg-green-100 text-green-800';
      case 'amended': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper for notification color
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'system': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'alert': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'info': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{getGreeting()}, {user?.fullName || 'Pharmacy'}!</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Pharmacy Dashboard - Manage inventory, orders, and patient interactions.</p>
          <div className="mt-4 text-md text-gray-500 dark:text-gray-400 font-semibold">Role: Pharmacy</div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => navigateTo('notifications')} className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-lg text-blue-700 dark:text-blue-300 font-medium transition-colors">
            <Bell className="h-6 w-6 mr-2" />
            <span className="text-sm">{unreadNotificationsCount} New</span>
          </button>
          <button onClick={() => navigateTo('chat')} className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900 dark:hover:bg-purple-800 rounded-lg text-purple-700 dark:text-purple-300 font-medium transition-colors">
            <MessageCircle className="h-6 w-6 mr-2" />
            <span className="text-sm">Chat</span>
          </button>
          <button onClick={() => navigateTo('settings')} className="flex items-center p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium transition-colors">
            <Settings className="h-6 w-6 mr-2" />
            <span className="text-sm">Settings</span>
          </button>
          <button onClick={() => navigateTo('logout')} className="flex items-center p-3 bg-red-50 hover:bg-red-100 dark:bg-red-900 dark:hover:bg-red-800 rounded-lg text-red-700 dark:text-red-300 font-medium transition-colors">
            <LogOut className="h-6 w-6 mr-2" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Pharmacy-Specific Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {pharmacyStats.map((stat) => (
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

      {/* Main Content Grid for Pharmacy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Pharmacy Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <PlusCircle className="h-6 w-6 mr-3 text-purple-500" />Quick Actions
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => navigateTo('orders')} className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-lg shadow-sm text-blue-700 dark:text-blue-300 font-medium transition-colors">
              <ShoppingCart className="h-5 w-5 mr-2" /> New Order
            </button>
            <button onClick={() => navigateTo('inventory')} className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900 dark:hover:bg-green-800 rounded-lg shadow-sm text-green-700 dark:text-green-300 font-medium transition-colors">
              <Package className="h-5 w-5 mr-2" /> Update Inventory
            </button>
            <button onClick={() => navigateTo('consultations')} className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900 dark:hover:bg-purple-800 rounded-lg shadow-sm text-purple-700 dark:text-purple-300 font-medium transition-colors">
              <MessageCircle className="h-5 w-5 mr-2" /> Consultations
            </button>
            <button onClick={() => navigateTo('prescriptions')} className="flex items-center justify-center p-4 bg-red-50 hover:bg-red-100 dark:bg-red-900 dark:hover:bg-red-800 rounded-lg shadow-sm text-red-700 dark:text-red-300 font-medium transition-colors">
              <ClipboardList className="h-5 w-5 mr-2" /> View Prescriptions
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <ShoppingCart className="h-6 w-6 mr-3 text-blue-500" />Recent Orders
            </h2>
          </div>
          <div className="p-6">
            {ordersLoading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400"><LoadingSpinner size="medium" /> Loading orders...</div>
            ) : pharmacyOrders.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent orders.</p>
            ) : (
              <div className="space-y-4">
                {pharmacyOrders.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 transition-transform transform hover:scale-[1.01]">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{order.patient?.fullName || order.patientName || 'Unknown Patient'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{order.description || order.content || '-'}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${getOrderStatusColor(order.status || '')}`}> {order.status || '-'}</span>
                  </div>
                ))}
              </div>
            )}
            <button className="mt-6 w-full text-blue-600 hover:underline text-sm font-medium" onClick={() => navigateTo('orders')}>
              View All Orders
            </button>
          </div>
        </div>

        {/* Inventory Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Package className="h-6 w-6 mr-3 text-green-500" />Inventory Overview
            </h2>
          </div>
          <div className="p-6">
            {inventoryLoading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400"><LoadingSpinner size="medium" /> Loading inventory...</div>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Total Items: {pharmacyInventory.length}</h3>
                  {lowStockCount > 0 ? (
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                      <span className="font-bold">{lowStockCount}</span> items are running low on stock!
                    </p>
                  ) : (
                    <p className="text-green-600 dark:text-green-400 text-sm">All good, sufficient stock levels.</p>
                  )}
                </div>
                {/* TODO: Show inventory items when inventory model is available */}
                <div className="space-y-3 text-gray-400 dark:text-gray-500 text-sm">Inventory details coming soon.</div>
              </>
            )}
            <button className="mt-6 w-full text-blue-600 hover:underline text-sm font-medium" onClick={() => navigateTo('inventory')}>
              Manage Inventory
            </button>
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Bell className="h-6 w-6 mr-3 text-yellow-500" />Notifications
            </h2>
            {unreadNotificationsCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{unreadNotificationsCount} New</span>
            )}
          </div>
          <div className="p-6">
            {notificationsLoading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400"><LoadingSpinner size="small" /> Loading notifications...</div>
            ) : pharmacyNotifications.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No new notifications.</p>
            ) : (
              <div className="space-y-3">
                {pharmacyNotifications.slice(0, 3).map((notif) => (
                  <div key={notif._id} className={`p-3 rounded-lg ${getNotificationColor(notif.type)} ${notif.isRead === false ? 'font-semibold' : ''}`}>
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs opacity-75 mt-1">{notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}</p>
                  </div>
                ))}
              </div>
            )}
            <button className="mt-4 w-full text-blue-600 hover:underline text-sm font-medium" onClick={() => navigateTo('notifications')}>View All Notifications</button>
          </div>
        </div>

        {/* Activity Overview (Placeholder for a chart) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-2 xl:col-span-2">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <BarChart2 className="h-6 w-6 mr-3 text-orange-500" />Sales & Inventory Trends
            </h2>
          </div>
          <div className="p-6 text-center text-gray-500 dark:text-gray-400 h-64 flex items-center justify-center">
            <p>
              <span className="font-bold">Chart Placeholder:</span> This area would display a dynamic chart (e.g., daily sales, inventory levels over time)
              <br /> relevant to pharmacy operations.
            </p>
          </div>
        </div>

        {/* Core MedBlock Modules (Pharmacy-specific links) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <BriefcaseMedical className="h-6 w-6 mr-3 text-blue-500" />Pharmacy Features
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => navigateTo('chat')} className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <MessageSquare className="h-5 w-5 mr-2 text-teal-500" /> AI Chat
            </button>
            <button onClick={() => navigateTo('blockchain')} className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <Blocks className="h-5 w-5 mr-2 text-indigo-500" /> Blockchain
            </button>
            <button onClick={() => navigateTo('reports')} className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <BarChart2 className="h-5 w-5 mr-2 text-green-500" /> Reports
            </button>
            <button onClick={() => navigateTo('settings')} className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium transition-colors transform hover:scale-[1.02]">
              <Settings className="h-5 w-5 mr-2 text-gray-500" /> Settings
            </button>
            <button onClick={() => navigate('/resources')} className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900 dark:hover:bg-orange-800 rounded-lg shadow-sm text-orange-700 dark:text-orange-300 font-medium transition-colors transform hover:scale-[1.02]">
              <BookOpen className="h-5 w-5 mr-2 text-orange-500" /> Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboardPage; 