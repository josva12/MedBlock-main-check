import React, { useEffect, useCallback } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchMedicalRecords } from '../../features/medicalRecords/medicalRecordsSlice';
import { fetchFacilities } from '../../features/facilities/facilitiesSlice';
import { fetchTeleconsultations } from '../../features/teleconsultations/teleconsultationsSlice';
import { fetchNotifications } from '../../features/notifications/notificationsSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ShoppingCart, Package, MessageCircle, ClipboardList, Bell, BarChart2, BriefcaseMedical, PlusCircle, Blocks, Settings, MessageSquare, Pill, LogOut, Menu, Sun, Moon
} from 'lucide-react';

const PharmacyDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
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

  // Pharmacy-specific data
  const pharmacyOrders = Array.isArray(records) ? records.filter(r => r.status === 'pharmacy_dispense' || r.prescription) : [];
  const pharmacyFacilities = Array.isArray(facilities) ? facilities.filter(f => f.type === 'pharmacy') : [];
  const unreadNotificationsCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;

  const isLoading = ordersLoading || inventoryLoading || consultationsLoading || notificationsLoading;

  // Navigation handler (replace with real navigation if using react-router)
  const navigateTo = useCallback((page: string) => {
    // TODO: Integrate with router navigation
    // For now, just log
    console.log('Navigate to:', page);
  }, []);

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Stats
  const pendingOrders = Array.isArray(pharmacyOrders) ? pharmacyOrders.filter(o => o.status === 'Pending').length : 0;
  // Facility does not have stock property; set lowStockCount to 0 or implement inventory logic if available
  const lowStockCount = 0;
  const newConsultations = Array.isArray(teleconsultations) ? teleconsultations.length : 0;

  const pharmacyStats = [
    { name: 'Pending Orders', value: pendingOrders, icon: ShoppingCart, color: 'bg-orange-500', loading: ordersLoading },
    { name: 'Low Stock Items', value: lowStockCount, icon: Package, color: 'bg-red-500', loading: inventoryLoading },
    { name: 'New Consultations', value: newConsultations, icon: MessageCircle, color: 'bg-blue-500', loading: consultationsLoading },
    { name: 'Total Inventory Items', value: pharmacyFacilities.length, icon: Pill, color: 'bg-green-500', loading: inventoryLoading },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{getGreeting()}, {user?.fullName || 'Pharmacy'}!</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Pharmacy Dashboard - Manage inventory, orders, and patient interactions.</p>
        <div className="mt-4 text-md text-gray-500 dark:text-gray-400 font-semibold">Role: Pharmacy</div>
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
        {/* Quick Actions, Orders, Inventory, Notifications, etc. */}
        {/* ... Implement as per your provided design ... */}
        {/* Placeholder for now */}
        <div className="col-span-full text-center text-gray-400 dark:text-gray-500 py-12">
          <span>Pharmacy dashboard widgets and quick actions go here (see design spec).</span>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboardPage; 