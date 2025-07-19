import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchClaims, createClaim } from '../features/claims/claimsSlice';
import { type RootState } from '../store';

const ClaimsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { claims = [], isLoading, error } = useAppSelector((state: RootState) => state.claims || { claims: [], isLoading: false, error: null });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patientId: '', insurerId: '', amount: '', blockchainHash: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch(fetchClaims());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.patientId || !form.insurerId || !form.amount) {
      setFormError('Patient, Insurer, and Amount are required');
      return;
    }
    try {
      await dispatch(createClaim({ ...form, amount: parseFloat(form.amount) })).unwrap();
      setShowModal(false);
      setForm({ patientId: '', insurerId: '', amount: '', blockchainHash: '' });
    } catch (err: any) {
      setFormError(err.message || 'Failed to create claim');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Claims</h1>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
          onClick={() => setShowModal(true)}
        >
          New Claim
        </button>
      </div>
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Insurer ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Blockchain Hash</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</td>
              </tr>
            ) : claims.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">No claims found</td>
              </tr>
            ) : (
              claims.map((claim) => (
                <tr key={claim._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{claim.patientId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{claim.insurerId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{claim.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{claim.blockchainHash || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(claim.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Claim</h2>
            {formError && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Patient ID</label>
                <input name="patientId" value={form.patientId} onChange={handleChange} className="w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Insurer ID</label>
                <input name="insurerId" value={form.insurerId} onChange={handleChange} className="w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input name="amount" value={form.amount} onChange={handleChange} className="w-full rounded border px-3 py-2" type="number" min="0" step="0.01" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Blockchain Hash (optional)</label>
                <input name="blockchainHash" value={form.blockchainHash} onChange={handleChange} className="w-full rounded border px-3 py-2" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsPage; 