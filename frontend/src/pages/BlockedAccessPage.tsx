import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldOff,
  Mail,
  Phone,
  Sun,
  Moon,
} from 'lucide-react';

const BlockedAccessPage: React.FC = () => {
  // State to manage the current theme (light or dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Attempt to load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Default to system preference if no theme is saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Effect to apply theme class to documentElement and save to localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme); // Save current theme to localStorage
    if (theme === 'dark') {
      document.documentElement.classList.add('dark'); // Add dark class for dark mode
    } else {
      document.documentElement.classList.remove('dark'); // Remove dark class for light mode
    }
  }, [theme]); // Re-run effect when theme changes

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 font-inter transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      {/* Tailwind CSS CDN for styling */}
      <script src="https://cdn.tailwindcss.com"></script>
      {/* Inter font for better typography */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>
        {`
        body {
          font-family: 'Inter', sans-serif;
        }
        /* Custom keyframe for subtle pulse animation */
        @keyframes subtle-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        .animate-subtle-pulse {
          animation: subtle-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Dark mode specific styles for better contrast */
        .dark .bg-gray-800 { background-color: #1f2937; }
        .dark .text-white { color: #ffffff; }
        .dark .text-gray-400 { color: #9ca3af; }
        .dark .text-gray-700 { color: #d1d5db; }
        .dark .border-gray-700 { border-color: #374151; }
        .dark .bg-gray-700 { background-color: #374151; }
        .dark .bg-gray-600 { background-color: #4b5563; }
        .dark .bg-gray-900 { background-color: #111827; }
        .dark .bg-blue-900 { background-color: #1e3a8a; }
        .dark .hover\\:bg-blue-800:hover { background-color: #1e40af; }
        .dark .bg-green-900 { background-color: #065f46; }
        .dark .hover\\:bg-green-800:hover { background-color: #047857; }
        .dark .bg-purple-900 { background-color: #581c87; }
        .dark .hover\\:bg-purple-800:hover { background-color: #6b21a8; }
        .dark .bg-red-900 { background-color: #7f1d1d; }
        .dark .hover\\:bg-red-800:hover { background-color: #991b1b; }
        .dark .bg-teal-500 { background-color: #14b8a6; }
        .dark .text-teal-500 { color: #2dd4bf; }
        .dark .bg-indigo-500 { background-color: #6366f1; }
        .dark .text-indigo-500 { color: #818cf8; }
        .dark .bg-orange-500 { background-color: #f97316; }
        .dark .text-orange-500 { color: #fb923c; }
        `}
      </style>

      {/* Header with Theme Toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 md:p-12 text-center max-w-lg w-full border border-gray-100 dark:border-gray-700 transform transition-transform duration-300 hover:scale-[1.01]">
        {/* Animated ShieldOff icon */}
        <ShieldOff className="h-20 w-20 text-red-500 mx-auto mb-6 animate-subtle-pulse" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Access Blocked</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          We regret to inform you that your access to the MedBlock system has been blocked.
          This is due to repeated failures in submitting the required verification details.
        </p>
        <p className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-8">
          You have exhausted your opportunities to provide the necessary information.
        </p>

        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-8">
          <p className="text-red-700 dark:text-red-200 font-medium flex items-center justify-center">
            <Lock className="h-5 w-5 mr-2" />
            Further access attempts will be denied.
          </p>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Need Assistance?</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          If you believe this is an error, please contact our support team.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="mailto:support@medblock.com"
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105"
          >
            <Mail className="h-5 w-5 mr-2" />
            Email Support
          </a>
          <a
            href="tel:+254712345678"
            className="flex items-center justify-center border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 font-bold py-3 px-6 rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105"
          >
            <Phone className="h-5 w-5 mr-2" />
            Call Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default BlockedAccessPage; 