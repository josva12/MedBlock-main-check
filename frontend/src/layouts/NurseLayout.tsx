import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  Calendar,
  FileText,
  Heart,
  BriefcaseMedical,
  MessageSquare,
  Blocks,
  BarChart2,
  Settings,
  LogOut,
  Bell,
  Sun,
  Moon,
} from 'lucide-react';
import { useAppSelector } from '../hooks/useAppSelector';

const nurseNav = [
  { label: 'Dashboard', icon: BriefcaseMedical, path: '/nurse/dashboard' },
  { label: 'My Patients', icon: Users, path: '/nurse/patients' },
  { label: 'Appointments', icon: Calendar, path: '/nurse/appointments' },
  { label: 'Record Vitals', icon: Heart, path: '/nurse/vitals' },
  { label: 'Medical Records', icon: FileText, path: '/nurse/medical-records' },
  { label: 'Reports', icon: BarChart2, path: '/nurse/reports' },
  { label: 'AI Chat', icon: MessageSquare, path: '/nurse/ai-chat' },
  { label: 'Blockchain', icon: Blocks, path: '/nurse/blockchain' },
  { label: 'Settings', icon: Settings, path: '/nurse/settings' },
];

const NurseLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { notifications } = useAppSelector((state) => state.notifications);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-2">
          <BriefcaseMedical className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">Nurse Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {nurseNav.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors font-medium text-left ${
                location.pathname.startsWith(item.path)
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" /> {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => navigate('/login')}
          className="m-4 flex items-center px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
        >
          <LogOut className="h-5 w-5 mr-2" /> Logout
        </button>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="flex items-center justify-between px-8 py-4 bg-white dark:bg-gray-800 shadow border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">{user?.fullName || 'Nurse'}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative" onClick={() => navigate('/nurse/notifications')}>
              <Bell className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
            </button>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default NurseLayout; 