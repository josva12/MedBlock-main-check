import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchTeleconsultations, createTeleconsultation } from '../features/teleconsultations/teleconsultationsSlice';
import { type RootState } from '../store';

const TeleconsultationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { teleconsultations = [], isLoading, error } = useAppSelector((state: RootState) => state.teleconsultations || { teleconsultations: [], isLoading: false, error: null });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patientId: '', doctorId: '', paymentMethod: 'mpesa', mpesaReceipt: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch(fetchTeleconsultations());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.patientId || !form.doctorId) {
      setFormError('Patient and Doctor are required');
      return;
    }
    try {
      await dispatch(createTeleconsultation(form)).unwrap();
      setShowModal(false);
      setForm({ patientId: '', doctorId: '', paymentMethod: 'mpesa', mpesaReceipt: '' });
    } catch (err: any) {
      setFormError(err.message || 'Failed to create teleconsultation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teleconsultations</h1>
        <button
          className="bg-pink-600 text-white px-4 py-2 rounded-lg shadow hover:bg-pink-700 transition"
          onClick={() => setShowModal(true)}
        >
          New Teleconsultation
        </button>
      </div>
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Doctor ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">M-Pesa Receipt</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</td>
              </tr>
            ) : teleconsultations.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">No teleconsultations found</td>
              </tr>
            ) : (
              teleconsultations.map((t) => (
                <tr key={t._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{t.patientId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{t.doctorId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{t.paymentMethod}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{t.mpesaReceipt || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Teleconsultation</h2>
            {formError && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Patient ID</label>
                <input name="patientId" value={form.patientId} onChange={handleChange} className="w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Doctor ID</label>
                <input name="doctorId" value={form.doctorId} onChange={handleChange} className="w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="w-full rounded border px-3 py-2">
                  <option value="mpesa">M-Pesa</option>
                  <option value="card">Card</option>
                </select>
              </div>
              {form.paymentMethod === 'mpesa' && (
                <div>
                  <label className="block text-sm font-medium mb-1">M-Pesa Receipt</label>
                  <input name="mpesaReceipt" value={form.mpesaReceipt} onChange={handleChange} className="w-full rounded border px-3 py-2" />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-pink-600 text-white hover:bg-pink-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeleconsultationsPage; 