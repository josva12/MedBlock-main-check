import React from 'react';
import { Outlet } from 'react-router-dom';

const PharmacyLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Topbar */}
      <header className="flex items-center justify-between px-8 py-4 bg-white dark:bg-gray-800 shadow border-b border-gray-200 dark:border-gray-700">
        <span className="text-lg font-semibold text-gray-900 dark:text-white">Pharmacy Dashboard</span>
      </header>
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
};

export default PharmacyLayout; 