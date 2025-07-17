import React from "react";
import { Outlet } from "react-router-dom";

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar placeholder */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col p-4 hidden md:block">
        <div className="text-2xl font-bold mb-8">MedBlock</div>
        {/* Navigation links will go here */}
      </aside>
      <div className="flex-1 flex flex-col">
        {/* Header placeholder */}
        <header className="bg-white shadow p-4 flex items-center justify-between">
          <div className="font-semibold text-lg">Dashboard</div>
          {/* User info, notifications, etc. */}
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
