import React from "react";

const VitalsPage: React.FC = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Vital Signs</h2>
        <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition">Add Vitals</button>
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Patient</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Temperature</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">BP</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Heart Rate</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Placeholder rows */}
            <tr>
              <td className="px-4 py-2">Jane Doe</td>
              <td className="px-4 py-2">37.2°C</td>
              <td className="px-4 py-2">120/80</td>
              <td className="px-4 py-2">72</td>
              <td className="px-4 py-2">
                <button className="text-blue-600 hover:underline mr-2">View</button>
                <button className="text-green-600 hover:underline mr-2">Edit</button>
                <button className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <img src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80" alt="Kenyan healthcare" className="rounded-lg shadow mt-8 w-full max-w-xl mx-auto" />
    </div>
  );
};

export default VitalsPage;
