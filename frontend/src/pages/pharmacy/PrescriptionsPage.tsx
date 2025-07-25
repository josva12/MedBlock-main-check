import React, { useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchMedicalRecords } from '../../features/medicalRecords/medicalRecordsSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PrescriptionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { records, isLoading } = useAppSelector((state) => state.medicalRecords);

  useEffect(() => {
    dispatch(fetchMedicalRecords(undefined));
  }, [dispatch]);

  const prescriptions = Array.isArray(records) ? records.filter(r => r.prescription) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Prescriptions</h1>
      {isLoading ? (
        <LoadingSpinner size="medium" />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prescription</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {prescriptions.map((record) => (
                <tr key={record._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{record.patientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{record.prescription}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{record.doctorName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{record.createdAt ? new Date(record.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PrescriptionsPage; 