import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store';

const NotFoundPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'doctor': return '/doctor/dashboard';
      case 'front-desk': return '/frontdesk/dashboard';
      case 'patient': return '/patient/dashboard';
      case 'pharmacy': return '/pharmacy/dashboard';
      case 'nurse': return '/nurse/dashboard';
      default: return '/login';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <h1 className="text-5xl font-bold text-blue-700 mb-4">404</h1>
      <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">Page Not Found</p>
      <button
        onClick={() => navigate(getDashboardRoute())}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default NotFoundPage; 