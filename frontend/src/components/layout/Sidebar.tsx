import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { toggleSidebar } from '../../features/ui/uiSlice';
import {
  Home,
  Users,
  Calendar,
  FileText,
  Heart,
  BarChart3,
  MessageSquare,
  Shield,
  Receipt,
  Video,
  Book,
  Building,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { type RootState } from '../../store';

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector((state: RootState) => state.ui.sidebarOpen);
  const isSidebarCollapsed = useAppSelector((state: RootState) => state.ui.sidebarCollapsed);
  const { user } = useAppSelector((state: RootState) => state.auth);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'doctor', 'nurse', 'front-desk', 'pharmacy'] },
    { name: 'Patients', href: '/patients', icon: Users, roles: ['admin', 'doctor', 'nurse', 'front-desk'] },
    { name: 'Appointments', href: '/appointments', icon: Calendar, roles: ['admin', 'doctor', 'nurse', 'front-desk'] },
    { name: 'Medical Records', href: '/medical-records', icon: FileText, roles: ['admin', 'doctor', 'nurse'] },
    { name: 'Vital Signs', href: '/vitals', icon: Heart, roles: ['admin', 'doctor', 'nurse', 'front-desk'] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin', 'doctor', 'nurse', 'front-desk'] },
    { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard, roles: ['admin', 'doctor', 'nurse', 'front-desk', 'pharmacy'] },
    { name: 'Blockchain', href: '/blockchain', icon: MessageSquare, roles: ['admin', 'doctor', 'nurse'] },
    { name: 'AI Chat', href: '/ai-chat', icon: MessageSquare, roles: ['admin', 'doctor', 'nurse'] },
    { name: 'Audit Logs', href: '/audit-logs', icon: ShieldCheck, roles: ['admin', 'doctor', 'nurse', 'front-desk'] },
    { name: 'Claims', href: '/claims', icon: Receipt, roles: ['admin', 'doctor', 'nurse', 'front-desk', 'pharmacy'] },
    { name: 'Teleconsultations', href: '/teleconsultations', icon: Video, roles: ['admin', 'doctor', 'nurse', 'front-desk'] },
    { name: 'Resources', href: '/resources', icon: Book, roles: ['admin', 'doctor', 'nurse', 'front-desk', 'pharmacy'] },
    { name: 'Facilities', href: '/facilities', icon: Building, roles: ['admin', 'doctor', 'nurse', 'front-desk', 'pharmacy'] },
    { name: 'Admin Panel', href: '/admin', icon: Shield, roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item => user && item.roles.includes(user.role));

  return (
    <div className={`fixed inset-y-0 left-0 z-40 ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="flex flex-col h-full">
        {/* Collapse/Expand Button (Desktop Only) */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            {!isSidebarCollapsed && <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">MedBlock</span>}
          </div>
          <button
            className="hidden lg:inline-flex p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-700"
            onClick={() => dispatch(toggleSidebar())}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            )}
          </button>
        </div>
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <Icon className="mr-3 h-5 w-5" />
                {!isSidebarCollapsed && item.name}
              </NavLink>
            );
          })}
        </nav>
        {/* User info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                {user?.fullName?.charAt(0).toUpperCase()}
              </span>
            </div>
            {!isSidebarCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.fullName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role?.replace('-', ' ')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 