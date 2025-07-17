import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

const MainLayout: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar placeholder */}
      <aside className="w-64 bg-blue-900 dark:bg-blue-950 text-white flex flex-col p-4 hidden md:block min-h-screen">
        <div className="text-2xl font-bold mb-8">MedBlock</div>
        {/* Navigation links will go here */}
        <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" alt="Kenyan healthcare" className="rounded-lg shadow mb-4" />
      </aside>
      <div className="flex-1 flex flex-col">
        {/* Header placeholder */}
        <header className="bg-white dark:bg-gray-800 shadow p-4 flex items-center justify-between">
          <div className="font-semibold text-lg text-blue-900 dark:text-blue-100">Dashboard</div>
          <button
            aria-label="Toggle dark mode"
            className="rounded-full p-2 bg-blue-100 dark:bg-gray-700 hover:bg-blue-200 dark:hover:bg-gray-600 transition"
            onClick={() => setDarkMode((d) => !d)}
          >
            {darkMode ? (
              <SunIcon className="h-6 w-6 text-yellow-400" />
            ) : (
              <MoonIcon className="h-6 w-6 text-blue-900" />
            )}
          </button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
