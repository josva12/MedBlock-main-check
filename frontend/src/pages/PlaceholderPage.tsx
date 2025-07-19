import React from 'react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: string;
  color: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description, icon, color }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className={`text-6xl mb-6 ${color}`}>{icon}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-lg text-gray-600 mb-8">{description}</p>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Coming Soon!</h2>
          <p className="text-gray-600 mb-4">
            This feature is currently under development and will be available soon.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Development in progress</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage; 