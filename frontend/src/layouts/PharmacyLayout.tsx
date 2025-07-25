import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Pill, ShoppingCart, Package, ClipboardList, MessageCircle, BarChart2, Blocks, Settings, Bell, MessageSquare, LogOut, User } from 'lucide-react';

const pharmacyNav = [
  { label: 'Dashboard', icon: Pill, path: '/pharmacy/dashboard' },
  { label: 'Orders', icon: ShoppingCart, path: '/pharmacy/orders' },
  { label: 'Inventory', icon: Package, path: '/pharmacy/inventory' },
  { label: 'Prescriptions', icon: ClipboardList, path: '/pharmacy/prescriptions' },
  { label: 'Consultations', icon: MessageCircle, path: '/pharmacy/consultations' },
  { label: 'Chat', icon: MessageSquare, path: '/pharmacy/chat' },
  { label: 'Reports', icon: BarChart2, path: '/pharmacy/reports' },
  { label: 'Blockchain', icon: Blocks, path: '/pharmacy/blockchain' },
  { label: 'Settings', icon: Settings, path: '/pharmacy/settings' },
  { label: 'Notifications', icon: Bell, path: '/pharmacy/notifications' },
  { label: 'Profile', icon: User, path: '/pharmacy/profile' },
];

const PharmacyLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={`w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col ${sidebarOpen ? '' : 'hidden lg:flex'}`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-2">
          <Pill className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">Pharmacy Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {pharmacyNav.map((item) => (
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
          <button className="lg:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setSidebarOpen((v) => !v)}>
            <Pill className="h-6 w-6" />
          </button>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Pharmacy Dashboard</span>
        </header>
        <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PharmacyLayout; 