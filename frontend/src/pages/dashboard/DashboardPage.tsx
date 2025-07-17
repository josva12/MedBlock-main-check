import React from "react";

const DashboardPage: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-blue-600 text-4xl font-bold mb-2">23</span>
        <span className="text-gray-700">Appointments</span>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-green-600 text-4xl font-bold mb-2">120</span>
        <span className="text-gray-700">Patients</span>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-purple-600 text-4xl font-bold mb-2">8</span>
        <span className="text-gray-700">Recent Reports</span>
      </div>
    </div>
  );
};

export default DashboardPage; 