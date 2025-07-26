import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchResources, createResource } from '../features/resources/resourcesSlice';
import ResourceCard from '../components/resources/ResourceCard';
import MessageBox from '../components/resources/MessageBox';

const ResourcesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { resources = [], isLoading, error } = useAppSelector((state) => state.resources || { resources: [], isLoading: false, error: null });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'health' });
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    dispatch(fetchResources());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.title || !form.content) {
      setFormError('Title and Content are required');
      return;
    }
    try {
      await dispatch(createResource(form)).unwrap();
      setShowModal(false);
      setForm({ title: '', content: '', category: 'health' });
      setMessage({ text: 'Resource created successfully!', type: 'success' });
    } catch (err: any) {
      setFormError(err.message || 'Failed to create resource');
      setMessage({ text: 'Failed to create resource', type: 'error' });
    }
  };

  const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage({ text, type });
  };

  return (
    <div className="container mx-auto px-4 py-8 resources-page">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-12">Health Resources & Blogs</h1>

      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">Resources</h2>
          <span className="text-gray-600">({resources.length} resources)</span>
        </div>
        <button
          className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition-colors duration-200 font-semibold"
          onClick={() => setShowModal(true)}
        >
          <i className="fas fa-plus mr-2"></i>
          New Resource
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          // Loading skeleton cards
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))
        ) : resources.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              <i className="fas fa-book-open text-4xl mb-4"></i>
              <p>No resources found</p>
              <p className="text-sm mt-2">Create your first resource to get started!</p>
            </div>
          </div>
        ) : (
          resources.map((resource) => (
            <ResourceCard key={resource._id} resource={resource} />
          ))
        )}
      </div>

      {/* Create Resource Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Resource</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {formError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter resource title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="health">Health</option>
                  <option value="finance">Finance</option>
                  <option value="educational">Educational</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter resource content..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold"
                >
                  Create Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Box */}
      {message && (
        <MessageBox
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}
    </div>
  );
};

export default ResourcesPage; 