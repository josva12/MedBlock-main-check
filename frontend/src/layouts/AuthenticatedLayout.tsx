import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { useAppSelector } from '../hooks/useAppSelector';

const AuthenticatedLayout: React.FC = () => {
  const sidebarCollapsed = useAppSelector(state => state.ui.sidebarCollapsed);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className={`${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'} flex flex-col flex-1`}>
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AuthenticatedLayout;