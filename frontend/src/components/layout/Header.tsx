import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { logout } from '../../features/auth/authSlice';
import { toggleSidebar } from '../../features/ui/uiSlice';
import NotificationsDropdown from '../common/NotificationsDropdown';
import ThemeToggle from '../common/ThemeToggle';
import {
  Menu,
  User,
  Settings,
  LogOut,
  Loader2,
} from 'lucide-react';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logout());
      setIsUserMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: 'Administrator',
      doctor: 'Doctor',
      nurse: 'Nurse',
      'front-desk': 'Front Desk',
      pharmacy: 'Pharmacist',
    };
    return roleMap[role] || role;
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Menu button and title */}
        <div className="flex items-center">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="ml-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">MedBlock</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Healthcare Management System</p>
          </div>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <NotificationsDropdown />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
            >
              <User className="h-8 w-8" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.fullName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{getRoleDisplayName(user?.role || '')}</p>
              </div>
            </button>

            {/* Dropdown menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{getRoleDisplayName(user?.role || '')}</p>
                </div>
                
                <button 
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </button>
                
                <button 
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </button>
                
                <div className="border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut || isLoading}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4 mr-2" />
                    )}
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header; 