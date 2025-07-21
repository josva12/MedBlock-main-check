import React, { useState } from 'react';
import Modal from '../Modal';
import axios from 'axios';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: any;
}

const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({ isOpen, onClose, policy }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(
        '/api/v1/insurance/quote',
        { ...form, policyId: policy?.policyId || policy?._id || policy?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(res.data.message || 'Quote request sent!');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send quote request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Request a Quote for ${policy?.name || 'Policy'}`}> 
      {success ? (
        <div className="text-green-600 font-semibold p-4">{success}</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Your Name" required className="w-full border p-2 rounded" />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required className="w-full border p-2 rounded" />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required className="w-full border p-2 rounded" />
          <textarea name="message" value={form.message} onChange={handleChange} placeholder="Message" className="w-full border p-2 rounded" />
          {error && <div className="text-red-600">{error}</div>}
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Sending...' : 'Send Quote Request'}</button>
        </form>
      )}
    </Modal>
  );
};

export default QuoteRequestModal; 