import React, { useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchMedicalRecords } from '../../features/medicalRecords/medicalRecordsSlice';
import { fetchFacilities } from '../../features/facilities/facilitiesSlice';
import { fetchTeleconsultations } from '../../features/teleconsultations/teleconsultationsSlice';
import { fetchNotifications } from '../../features/notifications/notificationsSlice';
import { fetchResources } from '../../features/resources/resourcesSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users, Calendar, FileText, Heart, LogOut, BriefcaseMedical, PlusCircle, Clock, ClipboardList, MessageSquare, Blocks, Settings, BarChart2, Bell, Menu, Sun, Moon, Pill, Package, ShoppingCart, MessageCircle,
} from 'lucide-react';

const PharmacyDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { records, isLoading: ordersLoading } = useAppSelector((state) => state.medicalRecords);
  const { facilities, isLoading: inventoryLoading } = useAppSelector((state) => state.facilities);
  const { teleconsultations, isLoading: consultationsLoading } = useAppSelector((state) => state.teleconsultations);
  const { notifications, isLoading: notificationsLoading } = useAppSelector((state) => state.notifications);
  const { resources, isLoading: resourcesLoading } = useAppSelector((state) => state.resources);

  useEffect(() => {
    dispatch(fetchMedicalRecords());
    dispatch(fetchFacilities());
    dispatch(fetchTeleconsultations());
    dispatch(fetchNotifications());
    dispatch(fetchResources());
  }, [dispatch]);

  // Filter for pharmacy-specific data
  const pharmacyOrders = Array.isArray(records) ? records.filter(r => r.status === 'pharmacy_dispense' || r.prescription) : [];
  const pharmacyFacilities = Array.isArray(facilities) ? facilities.filter(f => f.type === 'pharmacy') : [];

  const isLoading = ordersLoading || inventoryLoading || consultationsLoading || notificationsLoading || resourcesLoading;

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center"><Pill className="mr-3 text-green-500" />Pharmacy Dashboard</h1>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center mb-2"><ShoppingCart className="h-6 w-6 mr-2 text-blue-500" /><span className="font-semibold">Orders</span></div>
            <div className="text-2xl font-bold">{pharmacyOrders.length}</div>
          </div>
          {/* Inventory */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center mb-2"><Package className="h-6 w-6 mr-2 text-purple-500" /><span className="font-semibold">Inventory (Pharmacies)</span></div>
            <div className="text-2xl font-bold">{pharmacyFacilities.length}</div>
          </div>
          {/* Consultations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center mb-2"><MessageCircle className="h-6 w-6 mr-2 text-pink-500" /><span className="font-semibold">Consultations</span></div>
            <div className="text-2xl font-bold">{Array.isArray(teleconsultations) ? teleconsultations.length : 0}</div>
          </div>
          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center mb-2"><Bell className="h-6 w-6 mr-2 text-yellow-500" /><span className="font-semibold">Notifications</span></div>
            <div className="text-2xl font-bold">{Array.isArray(notifications) ? notifications.length : 0}</div>
          </div>
          {/* Resources */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center mb-2"><ClipboardList className="h-6 w-6 mr-2 text-indigo-500" /><span className="font-semibold">Resources</span></div>
            <div className="text-2xl font-bold">{Array.isArray(resources) ? resources.length : 0}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyDashboardPage; 