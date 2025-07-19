import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { enrollUser, selectInsuranceLoading, selectInsuranceError, clearError } from '../features/insurance/insuranceSlice';
import { selectCurrentUser } from '../features/auth/authSlice';

interface Dependent {
  name: string;
  relationship: string;
}

const policyTiers = [
  {
    id: 'msingi',
    name: 'Msingi (Basic)',
    description: 'Essential healthcare coverage',
    premium: 500,
    coverage: 50000,
    features: ['Basic consultations', 'Essential medications', 'Emergency care']
  },
  {
    id: 'kati',
    name: 'Kati (Standard)',
    description: 'Comprehensive healthcare coverage',
    premium: 1500,
    coverage: 150000,
    features: ['All consultations', 'Laboratory tests', 'Specialist care', 'Medications']
  },
  {
    id: 'juu',
    name: 'Juu (Premium)',
    description: 'Premium healthcare coverage',
    premium: 3000,
    coverage: 300000,
    features: ['All consultations', 'Advanced diagnostics', 'Specialist care', 'Medications', 'Dental care']
  },
  {
    id: 'familia',
    name: 'Familia (Family)',
    description: 'Family healthcare coverage',
    premium: 5000,
    coverage: 500000,
    features: ['Family coverage', 'All consultations', 'Advanced diagnostics', 'Specialist care', 'Medications', 'Dental care', 'Maternity care']
  }
];

const InsuranceEnrollmentPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const loading = useSelector(selectInsuranceLoading);
  const error = useSelector(selectInsuranceError);
  const currentUser = useSelector(selectCurrentUser);

  const [selectedTier, setSelectedTier] = useState('');
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [newDependent, setNewDependent] = useState({ name: '', relationship: '' });

  const selectedPolicy = policyTiers.find(tier => tier.id === selectedTier);

  const handleAddDependent = () => {
    if (newDependent.name && newDependent.relationship) {
      setDependents([...dependents, newDependent]);
      setNewDependent({ name: '', relationship: '' });
    }
  };

  const handleRemoveDependent = (index: number) => {
    setDependents(dependents.filter((_, i) => i !== index));
  };

  const handleEnrollment = async () => {
    if (!selectedTier || !currentUser) return;

    const enrollmentData = {
      policyTier: selectedTier,
      premiumAmount: selectedPolicy!.premium,
      coverageLimit: selectedPolicy!.coverage,
      dependents
    };

    try {
      await dispatch(enrollUser(enrollmentData)).unwrap();
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the slice
    }
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Afya Pomoja Insurance Enrollment
            </h1>
            <p className="text-gray-600">
              Choose your healthcare coverage plan and enroll today
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={handleClearError}
                    className="text-red-400 hover:text-red-600"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Policy Tier Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {policyTiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTier === tier.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTier(tier.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">KSh {tier.premium}</p>
                      <p className="text-sm text-gray-500">per month</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{tier.description}</p>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Coverage: KSh {tier.coverage.toLocaleString()}
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Dependents Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Dependents (Optional)</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Dependent Name"
                  value={newDependent.name}
                  onChange={(e) => setNewDependent({ ...newDependent, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newDependent.relationship}
                  onChange={(e) => setNewDependent({ ...newDependent, relationship: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Relationship</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                </select>
              </div>
              <button
                onClick={handleAddDependent}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Dependent
              </button>
            </div>

            {dependents.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Dependents</h3>
                <div className="space-y-2">
                  {dependents.map((dependent, index) => (
                    <div key={index} className="flex justify-between items-center bg-white border border-gray-200 rounded-md p-3">
                      <div>
                        <p className="font-medium">{dependent.name}</p>
                        <p className="text-sm text-gray-500">{dependent.relationship}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveDependent(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          {selectedPolicy && (
            <div className="mb-8 bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Enrollment Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Selected Plan</p>
                  <p className="font-semibold">{selectedPolicy.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Monthly Premium</p>
                  <p className="font-semibold text-blue-600">KSh {selectedPolicy.premium}</p>
                </div>
                <div>
                  <p className="text-gray-600">Coverage Limit</p>
                  <p className="font-semibold">KSh {selectedPolicy.coverage.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Dependents</p>
                  <p className="font-semibold">{dependents.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* Enrollment Button */}
          <div className="flex justify-center">
            <button
              onClick={handleEnrollment}
              disabled={!selectedTier || loading}
              className={`px-8 py-3 rounded-md font-semibold transition-colors ${
                !selectedTier || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {loading ? 'Processing...' : 'Enroll Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceEnrollmentPage; 