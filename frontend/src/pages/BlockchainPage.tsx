import React, { useEffect } from "react";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSelector";
import { fetchBlockchainLogs } from "../features/blockchain/blockchainSlice";
import { type RootState } from "../store";

const BlockchainPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { logs, loading, error } = useAppSelector((state: RootState) => state.blockchain);

  useEffect(() => {
    dispatch(fetchBlockchainLogs());
  }, [dispatch]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Blockchain Logs</h2>
      {loading && <div className="text-blue-700 mb-4">Loading...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
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
            {logs.map((log: any) => (
              <tr key={log._id}>
                <td className="px-4 py-2">{log.blockNumber}</td>
                <td className="px-4 py-2">{log.hash}</td>
                <td className="px-4 py-2">{log.record}</td>
                <td className="px-4 py-2">{log.timestamp}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded ${log.status === "Verified" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{log.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <img src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80" alt="Kenyan healthcare" className="rounded-lg shadow w-full max-w-xl mx-auto" />
    </div>
  );
};

export default BlockchainPage; 