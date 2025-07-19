import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchFacilities, createFacility } from '../features/facilities/facilitiesSlice';
import { type RootState } from '../store';

const FacilitiesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { facilities = [], isLoading, error } = useAppSelector((state: RootState) => state.facilities || { facilities: [], isLoading: false, error: null });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', registrationNumber: '', licensingBody: '', address: '', contact: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch(fetchFacilities());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name || !form.type || !form.registrationNumber || !form.licensingBody) {
      setFormError('Name, Type, Registration Number, and Licensing Body are required');
      return;
    }
    try {
      await dispatch(createFacility(form)).unwrap();
      setShowModal(false);
      setForm({ name: '', type: '', registrationNumber: '', licensingBody: '', address: '', contact: '' });
    } catch (err: any) {
      setFormError(err.message || 'Failed to create facility');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Facilities</h1>
        <button
          className="bg-blue-800 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-900 transition"
          onClick={() => setShowModal(true)}
        >
          New Facility
        </button>
      </div>
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Registration #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Licensing Body</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</td>
              </tr>
            ) : facilities.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">No facilities found</td>
              </tr>
            ) : (
              facilities.map((f) => (
                <tr key={f._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{f.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{f.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{f.registrationNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{f.licensingBody}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(f.submissionDate).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Facility</h2>
            {formError && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <input name="type" value={form.type} onChange={handleChange} className="w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Registration Number</label>
                <input name="registrationNumber" value={form.registrationNumber} onChange={handleChange} className="w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Licensing Body</label>
                <input name="licensingBody" value={form.licensingBody} onChange={handleChange} className="w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input name="address" value={form.address} onChange={handleChange} className="w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact</label>
                <input name="contact" value={form.contact} onChange={handleChange} className="w-full rounded border px-3 py-2" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-800 text-white hover:bg-blue-900">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilitiesPage; 