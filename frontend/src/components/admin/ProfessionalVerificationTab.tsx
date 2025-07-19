// ========= THE FIX IS HERE =========
// Correctly import useState within the curly braces.
import React, { useState } from 'react';
// ===================================
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { verifyProfessional, type ProfessionalVerificationData } from '../../features/admin/adminSlice';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Calendar,
  User,
  Search,
} from 'lucide-react';
import { type RootState } from '../../store';

const ProfessionalVerificationTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state: RootState) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [verificationForm, setVerificationForm] = useState<ProfessionalVerificationData>({
    status: 'pending',
    rejectionReason: '',
    notes: '',
  });

  const professionals = users.filter(user => 
    ['doctor', 'nurse'].includes(user.role)
  );

  const filteredProfessionals = professionals.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phone && user.phone.includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || user.professionalVerification.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleVerification = async (userId: string) => {
    await dispatch(verifyProfessional({ id: userId, data: verificationForm }));
    setSelectedUser(null);
    setVerificationForm({ status: 'pending', rejectionReason: '', notes: '' });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      verified: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Verified' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending Review' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Rejected' },
      unsubmitted: { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle, label: 'Not Submitted' },
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.unsubmitted;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getRoleDisplayName = (role: string) => {
    return role === 'doctor' ? 'Doctor' : 'Nurse';
  };

  const getLicensingBodyDisplay = (body?: string) => {
    const bodyMap: Record<string, string> = {
      KMPDC: 'Kenya Medical Practitioners and Dentists Council',
      NCK: 'Nursing Council of Kenya',
      PPB: 'Pharmacy and Poisons Board',
      other: 'Other'
    };
    return body ? bodyMap[body] || 'Not specified' : 'Not specified';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Professional Verification</h2>
          <p className="text-sm text-gray-600">Review and verify professional credentials for doctors and nurses</p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredProfessionals.length} professionals found
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-lg font-semibold text-gray-900">
                {professionals.filter(p => p.professionalVerification.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-lg font-semibold text-gray-900">
                {professionals.filter(p => p.professionalVerification.status === 'verified').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-lg font-semibold text-gray-900">
                {professionals.filter(p => p.professionalVerification.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Not Submitted</p>
              <p className="text-lg font-semibold text-gray-900">
                {professionals.filter(p => p.professionalVerification.status === 'unsubmitted').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="unsubmitted">Not Submitted</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="doctor">Doctors</option>
            <option value="nurse">Nurses</option>
          </select>
        </div>
      </div>

      {/* Professionals List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Professional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  License Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProfessionals.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{getRoleDisplayName(user.role)}</span>
                    {user.specialization && (
                      <div className="text-sm text-gray-500">{user.specialization}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.professionalVerification.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.professionalVerification.submittedLicenseNumber ? (
                        <>
                          <div className="flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            {user.professionalVerification.submittedLicenseNumber}
                          </div>
                          <div className="text-gray-500">
                            {getLicensingBodyDisplay(user.professionalVerification.licensingBody)}
                          </div>
                          {user.professionalVerification.submissionDate && (
                            <div className="text-gray-500 text-xs">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              Submitted: {new Date(user.professionalVerification.submissionDate).toLocaleDateString()}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-500">No license submitted</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedUser(user._id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4 text-center">Professional Verification</h3>
              
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Verification Status</label>
                  <select
                    value={verificationForm.status}
                    onChange={(e) => setVerificationForm({ ...verificationForm, status: e.target.value as ProfessionalVerificationData['status'] })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {verificationForm.status === 'rejected' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                    <textarea
                      value={verificationForm.rejectionReason}
                      onChange={(e) => setVerificationForm({ ...verificationForm, rejectionReason: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Provide reason for rejection..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={verificationForm.notes}
                    onChange={(e) => setVerificationForm({ ...verificationForm, notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerification(selectedUser)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalVerificationTab;