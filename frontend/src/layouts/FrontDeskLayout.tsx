import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const FrontDeskLayout: React.FC = () => {
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);

  const frontDeskNavItems = [
    { path: '/frontdesk/dashboard', label: 'Dashboard', icon: '🏥' },
    { path: '/frontdesk/appointments', label: 'Appointments', icon: '📅' },
    { path: '/frontdesk/patients', label: 'Patient Registration', icon: '👥' },
    { path: '/frontdesk/insurance', label: 'Insurance Enrollment', icon: '🛡️' },
    { path: '/frontdesk/claims', label: 'Claims Submission', icon: '📄' },
    { path: '/frontdesk/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">MedBlock Front Desk</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{user?.fullName}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Front Desk
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {frontDeskNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location.pathname === item.path
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FrontDeskLayout; 