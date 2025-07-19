import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchSubscriptions, createSubscription } from '../features/subscriptions/subscriptionsSlice';
import { type RootState } from '../store';

const plans = [
  { value: 'basic', label: 'Basic' },
  { value: 'premium', label: 'Premium' },
];

const paymentMethods = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'card', label: 'Card' },
];

const SubscriptionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { subscriptions, isLoading, error } = useAppSelector((state: RootState) => state.subscriptions);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ plan: 'basic', facilityId: '', paymentMethod: 'mpesa', mpesaReceipt: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch(fetchSubscriptions());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.plan || !form.facilityId) {
      setFormError('Plan and Facility are required');
      return;
    }
    try {
      await dispatch(createSubscription(form)).unwrap();
      setShowModal(false);
      setForm({ plan: 'basic', facilityId: '', paymentMethod: 'mpesa', mpesaReceipt: '' });
    } catch (err: any) {
      setFormError(err.message || 'Failed to create subscription');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscriptions</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          onClick={() => setShowModal(true)}
        >
          New Subscription
        </button>
      </div>
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Facility</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</td>
              </tr>
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">No subscriptions found</td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr key={sub._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{sub.plan}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{sub.facilityId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{sub.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{sub.paymentMethod}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(sub.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Subscription</h2>
            {formError && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Plan</label>
                <select name="plan" value={form.plan} onChange={handleChange} className="w-full rounded border px-3 py-2">
                  {plans.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Facility ID</label>
                <input name="facilityId" value={form.facilityId} onChange={handleChange} className="w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="w-full rounded border px-3 py-2">
                  {paymentMethods.map((pm) => (
                    <option key={pm.value} value={pm.value}>{pm.label}</option>
                  ))}
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
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage; 