import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchAuditLogs } from '../features/auditLogs/auditLogsSlice';
import { type RootState } from '../store';

const AuditLogsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { logs = [], isLoading, error } = useAppSelector((state: RootState) => state.auditLogs || { logs: [], isLoading: false, error: null });
  const [filters, setFilters] = useState({ userId: '', action: '', startDate: '', endDate: '' });

  useEffect(() => {
    dispatch(fetchAuditLogs(filters));
    // eslint-disable-next-line
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchAuditLogs(filters));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
      <form onSubmit={handleFilter} className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">User ID</label>
          <input name="userId" value={filters.userId} onChange={handleChange} className="rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Action</label>
          <input name="action" value={filters.action} onChange={handleChange} className="rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleChange} className="rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input type="date" name="endDate" value={filters.endDate} onChange={handleChange} className="rounded border px-3 py-2" />
        </div>
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Filter</button>
      </form>
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Resource</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Resource ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">No audit logs found</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{log.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{log.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{log.resource}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{log.resourceId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogsPage; 