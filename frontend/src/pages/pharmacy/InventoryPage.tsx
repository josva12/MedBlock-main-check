import React, { useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchFacilities } from '../../features/facilities/facilitiesSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const InventoryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { facilities, isLoading } = useAppSelector((state) => state.facilities);

  useEffect(() => {
    dispatch(fetchFacilities({}));
  }, [dispatch]);

  const pharmacyFacilities = Array.isArray(facilities) ? facilities.filter(f => f.type === 'pharmacy') : [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Pharmacy Inventory</h1>
      {isLoading ? (
        <LoadingSpinner size="medium" />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Registration #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {pharmacyFacilities.map((facility) => (
                <tr key={facility._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{facility.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{facility.registrationNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{facility.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{facility.submissionDate ? new Date(facility.submissionDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryPage; 