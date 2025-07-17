import React from "react";

const BlockchainPage: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Blockchain Logs</h2>
      <div className="overflow-x-auto rounded-lg shadow mb-8">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Block #</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Hash</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Record</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Timestamp</th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Status</th>
            </tr>
          </thead>
          <tbody>
            {/* Placeholder rows */}
            <tr>
              <td className="px-4 py-2">1000001</td>
              <td className="px-4 py-2">0xabc123...</td>
              <td className="px-4 py-2">Blood Test</td>
              <td className="px-4 py-2">2025-07-18 10:00</td>
              <td className="px-4 py-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded">Verified</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <img src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80" alt="Kenyan healthcare" className="rounded-lg shadow w-full max-w-xl mx-auto" />
    </div>
  );
};

export default BlockchainPage;
