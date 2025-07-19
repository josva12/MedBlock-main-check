import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store';
import { getUserPolicy, selectCurrentPolicy, selectInsuranceLoading } from '../../features/insurance/insuranceSlice';
import { useAppSelector } from '../../hooks/useAppSelector';

const InsuranceCard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useAppSelector((state) => state.auth.user);
  const currentPolicy = useSelector(selectCurrentPolicy);
  const loading = useSelector(selectInsuranceLoading);

  useEffect(() => {
    if (currentUser?._id && !currentPolicy) {
      dispatch(getUserPolicy(currentUser._id));
    }
  }, [dispatch, currentUser?._id, currentPolicy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'lapsed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'msingi': return 'bg-blue-100 text-blue-800';
      case 'kati': return 'bg-green-100 text-green-800';
      case 'juu': return 'bg-purple-100 text-purple-800';
      case 'familia': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!currentPolicy) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Insurance Policy</h3>
          <p className="text-gray-600 mb-4">You don't have an active insurance policy.</p>
          <button
            onClick={() => window.location.href = '/insurance-enrollment'}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Enroll Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Insurance Policy</h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(currentPolicy.status)}`}>
          {currentPolicy.status}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Plan Tier</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(currentPolicy.policyTier)}`}>
            {currentPolicy.policyTier.charAt(0).toUpperCase() + currentPolicy.policyTier.slice(1)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Monthly Premium</span>
          <span className="text-sm font-medium text-gray-900">
            KSh {currentPolicy.premiumAmount.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Coverage Limit</span>
          <span className="text-sm font-medium text-gray-900">
            KSh {currentPolicy.coverageLimit.toLocaleString()}
          </span>
        </div>

        {currentPolicy.dependents.length > 0 && (
          <div>
            <span className="text-sm text-gray-600">Dependents</span>
            <div className="mt-1 space-y-1">
              {currentPolicy.dependents.map((dependent: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-900">{dependent.name}</span>
                  <span className="text-gray-500">{dependent.relationship}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPolicy.startDate && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Start Date</span>
            <span className="text-sm text-gray-900">
              {new Date(currentPolicy.startDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {currentPolicy.endDate && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">End Date</span>
            <span className="text-sm text-gray-900">
              {new Date(currentPolicy.endDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => window.location.href = '/claims'}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            View Claims
          </button>
          {currentPolicy.status === 'active' && (
            <button
              onClick={() => window.location.href = '/claims'}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
            >
              Submit Claim
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsuranceCard; 