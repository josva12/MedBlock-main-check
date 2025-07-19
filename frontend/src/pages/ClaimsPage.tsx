import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { 
  fetchPatientClaims, 
  submitClaim, 
  selectClaims, 
  selectClaimsLoading, 
  selectClaimsError,
  clearError 
} from '../features/claims/claimsSlice';
import { selectCurrentUser } from '../features/auth/authSlice';
import { selectCurrentPolicy } from '../features/insurance/insuranceSlice';

const ClaimsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector(selectCurrentUser);
  const currentPolicy = useSelector(selectCurrentPolicy);
  const claims = useSelector(selectClaims);
  const loading = useSelector(selectClaimsLoading);
  const error = useSelector(selectClaimsError);

  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [newClaim, setNewClaim] = useState({
    facilityId: '',
    claimAmount: '',
    servicesRendered: [] as string[]
  });
  const [selectedService, setSelectedService] = useState('');

  const availableServices = [
    'Consultation',
    'Laboratory Tests',
    'X-Ray',
    'Ultrasound',
    'Medication',
    'Surgery',
    'Physiotherapy',
    'Dental Care',
    'Eye Care',
    'Emergency Care'
  ];

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchPatientClaims(currentUser._id));
    }
  }, [dispatch, currentUser?._id]);

  const handleAddService = () => {
    if (selectedService && !newClaim.servicesRendered.includes(selectedService)) {
      setNewClaim({
        ...newClaim,
        servicesRendered: [...newClaim.servicesRendered, selectedService]
      });
      setSelectedService('');
    }
  };

  const handleRemoveService = (service: string) => {
    setNewClaim({
      ...newClaim,
      servicesRendered: newClaim.servicesRendered.filter(s => s !== service)
    });
  };

  const handleSubmitClaim = async () => {
    if (!currentPolicy || !currentUser) return;

    const claimData = {
      policyId: currentPolicy._id,
      patientId: currentUser._id,
      facilityId: newClaim.facilityId,
      claimAmount: parseFloat(newClaim.claimAmount),
      servicesRendered: newClaim.servicesRendered
    };

    try {
      await dispatch(submitClaim(claimData)).unwrap();
      setShowSubmitForm(false);
      setNewClaim({ facilityId: '', claimAmount: '', servicesRendered: [] });
    } catch (err) {
      // Error is handled by the slice
    }
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'flagged_for_review': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!currentPolicy) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Insurance Policy Found</h1>
            <p className="text-gray-600 mb-6">
              You need to enroll in an insurance policy before you can submit claims.
            </p>
            <button
              onClick={() => window.location.href = '/insurance-enrollment'}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Enroll Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Claims Management</h1>
              <p className="text-gray-600">View and submit your healthcare claims</p>
            </div>
            <button
              onClick={() => setShowSubmitForm(!showSubmitForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {showSubmitForm ? 'Cancel' : 'Submit New Claim'}
            </button>
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

          {/* Submit New Claim Form */}
          {showSubmitForm && (
            <div className="mb-8 bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit New Claim</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facility ID
                  </label>
                  <input
                    type="text"
                    value={newClaim.facilityId}
                    onChange={(e) => setNewClaim({ ...newClaim, facilityId: e.target.value })}
                    placeholder="Enter facility ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Claim Amount (KSh)
                  </label>
                  <input
                    type="number"
                    value={newClaim.claimAmount}
                    onChange={(e) => setNewClaim({ ...newClaim, claimAmount: e.target.value })}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services Rendered
                </label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a service</option>
                    {availableServices.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddService}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {newClaim.servicesRendered.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newClaim.servicesRendered.map((service, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {service}
                        <button
                          onClick={() => handleRemoveService(service)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSubmitClaim}
                  disabled={loading || !newClaim.facilityId || !newClaim.claimAmount || newClaim.servicesRendered.length === 0}
                  className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                    loading || !newClaim.facilityId || !newClaim.claimAmount || newClaim.servicesRendered.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {loading ? 'Submitting...' : 'Submit Claim'}
                </button>
                <button
                  onClick={() => setShowSubmitForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Claims History */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Claims History</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading claims...</p>
              </div>
            ) : claims.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No claims found. Submit your first claim above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Services
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction Hash
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {claims.map((claim) => (
                      <tr key={claim._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(claim.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          KSh {claim.claimAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex flex-wrap gap-1">
                            {claim.servicesRendered.map((service, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                            {claim.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {claim.transactionHash ? (
                            <span className="font-mono text-xs text-green-600">
                              {claim.transactionHash.substring(0, 10)}...
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimsPage; 