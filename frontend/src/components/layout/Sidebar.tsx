import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { RootState } from '../../store';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  HeartIcon,
  ChartBarIcon,
  CogIcon,
  CubeIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { user } = useSelector((state: RootState) => state.auth);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'doctor', 'nurse', 'front-desk', 'pharmacy'] },
    { name: 'Patients', href: '/patients', icon: UserGroupIcon, roles: ['admin', 'doctor', 'nurse', 'front-desk'] },
    { name: 'Appointments', href: '/appointments', icon: CalendarIcon, roles: ['admin', 'doctor', 'nurse', 'front-desk'] },
    { name: 'Medical Records', href: '/medical-records', icon: DocumentTextIcon, roles: ['admin', 'doctor', 'nurse'] },
    { name: 'Vital Signs', href: '/vitals', icon: HeartIcon, roles: ['admin', 'doctor', 'nurse'] },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon, roles: ['admin', 'doctor', 'nurse'] },
    { name: 'Blockchain', href: '/blockchain', icon: CubeIcon, roles: ['admin', 'doctor', 'nurse'] },
    { name: 'AI Chat', href: '/ai-chat', icon: ChatBubbleLeftRightIcon, roles: ['admin', 'doctor', 'nurse'] },
    { name: 'Admin Panel', href: '/admin', icon: ShieldCheckIcon, roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="ml-2 text-xl font-semibold text-gray-900">MedBlock</span>
          </div>
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
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">
                {user?.fullName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('-', ' ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 