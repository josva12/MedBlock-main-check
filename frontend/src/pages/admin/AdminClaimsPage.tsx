import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { 
  fetchAllClaims, 
  processClaim, 
  selectClaims, 
  selectClaimsLoading, 
  selectClaimsError,
  clearError 
} from '../../features/claims/claimsSlice';

const AdminClaimsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const claims = useSelector(selectClaims);
  const loading = useSelector(selectClaimsLoading);
  const error = useSelector(selectClaimsError);

  const [statusFilter, setStatusFilter] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processData, setProcessData] = useState({
    status: '',
    rejectionReason: ''
  });

  useEffect(() => {
    dispatch(fetchAllClaims(statusFilter));
  }, [dispatch, statusFilter]);

  const handleProcessClaim = async () => {
    if (!selectedClaim) return;

    try {
      await dispatch(processClaim({
        claimId: selectedClaim._id,
        status: processData.status,
        rejectionReason: processData.rejectionReason
      })).unwrap();
      setShowProcessModal(false);
      setSelectedClaim(null);
      setProcessData({ status: '', rejectionReason: '' });
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openProcessModal = (claim: any) => {
    setSelectedClaim(claim);
    setShowProcessModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Claims Management</h1>
              <p className="text-gray-600">Process and manage all insurance claims</p>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="flagged_for_review">Flagged for Review</option>
              </select>
            </div>
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

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading claims...</p>
            </div>
          ) : claims.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No claims found.</p>
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
                      Patient ID
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
                      Actions
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
                        {claim.patientId.substring(0, 8)}...
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {claim.status === 'pending' && (
                          <button
                            onClick={() => openProcessModal(claim)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Process
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedClaim(claim)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Process Claim Modal */}
      {showProcessModal && selectedClaim && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Process Claim</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action
                </label>
                <select
                  value={processData.status}
                  onChange={(e) => setProcessData({ ...processData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select action</option>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                  <option value="flagged_for_review">Flag for Review</option>
                </select>
              </div>
              {processData.status === 'rejected' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason
                  </label>
                  <textarea
                    value={processData.rejectionReason}
                    onChange={(e) => setProcessData({ ...processData, rejectionReason: e.target.value })}
                    placeholder="Enter rejection reason"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div className="flex gap-4">
                <button
                  onClick={handleProcessClaim}
                  disabled={loading || !processData.status}
                  className={`flex-1 px-4 py-2 rounded-md font-semibold transition-colors ${
                    loading || !processData.status
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Processing...' : 'Process'}
                </button>
                <button
                  onClick={() => setShowProcessModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Claim Details Modal */}
      {selectedClaim && !showProcessModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Claim Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Claim ID:</span>
                  <p className="text-gray-600">{selectedClaim._id}</p>
                </div>
                <div>
                  <span className="font-medium">Patient ID:</span>
                  <p className="text-gray-600">{selectedClaim.patientId}</p>
                </div>
                <div>
                  <span className="font-medium">Policy ID:</span>
                  <p className="text-gray-600">{selectedClaim.policyId}</p>
                </div>
                <div>
                  <span className="font-medium">Facility ID:</span>
                  <p className="text-gray-600">{selectedClaim.facilityId}</p>
                </div>
                <div>
                  <span className="font-medium">Amount:</span>
                  <p className="text-gray-600">KSh {selectedClaim.claimAmount.toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium">Services:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedClaim.servicesRendered.map((service, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedClaim.status)}`}>
                    {selectedClaim.status.replace('_', ' ')}
                  </span>
                </div>
                {selectedClaim.rejectionReason && (
                  <div>
                    <span className="font-medium">Rejection Reason:</span>
                    <p className="text-gray-600">{selectedClaim.rejectionReason}</p>
                  </div>
                )}
                {selectedClaim.transactionHash && (
                  <div>
                    <span className="font-medium">Transaction Hash:</span>
                    <p className="text-gray-600 font-mono text-xs">{selectedClaim.transactionHash}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium">Created:</span>
                  <p className="text-gray-600">{formatDate(selectedClaim.createdAt)}</p>
                </div>
                <div>
                  <span className="font-medium">Updated:</span>
                  <p className="text-gray-600">{formatDate(selectedClaim.updatedAt)}</p>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setSelectedClaim(null)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClaimsPage; 