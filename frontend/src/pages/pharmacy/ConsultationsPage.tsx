import React, { useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchTeleconsultations } from '../../features/teleconsultations/teleconsultationsSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ConsultationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { teleconsultations, isLoading } = useAppSelector((state) => state.teleconsultations);

  useEffect(() => {
    dispatch(fetchTeleconsultations());
  }, [dispatch]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Consultations</h1>
      {isLoading ? (
        <LoadingSpinner size="medium" />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {Array.isArray(teleconsultations) && teleconsultations.map((c) => (
                <tr key={c._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{c.patientId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">-</td>
                  <td className="px-6 py-4 whitespace-nowrap">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConsultationsPage; 