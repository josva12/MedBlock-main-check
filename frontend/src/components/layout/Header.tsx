import React from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { logout } from '../../features/auth/authSlice';
import ThemeToggle from '../common/ThemeToggle';
import NotificationsDropdown from '../common/NotificationsDropdown';
import { LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="flex items-center space-x-4">
        <span className="text-xl font-bold text-blue-600 dark:text-blue-300">MedBlock</span>
        <span className="text-gray-700 dark:text-gray-200 font-medium text-base">{user?.fullName}</span>
      </div>
      <div className="flex items-center space-x-4">
        <NotificationsDropdown />
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200 flex items-center"
          title="Sign out"
        >
          <LogOut className="h-5 w-5 mr-1" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header; 