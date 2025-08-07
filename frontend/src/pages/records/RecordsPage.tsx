import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import medicalRecordsService, { 
  MedicalRecord, 
  CreateMedicalRecordData, 
  MedicalRecordsFilter,
  MedicalRecordStats
} from '../../services/medicalRecordsService';
import { fetchPatients } from '../../features/patients/patientsSlice';
import { type RootState } from '../../store';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  FileText, 
  User, 
  Calendar,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Eye,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  Tag,
  Paperclip,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface MedicalRecordFormData {
  patient: string;
  recordType: 'consultation' | 'lab_result' | 'imaging' | 'prescription' | 'vaccination' | 'surgery' | 'emergency' | 'other';
  title: string;
  description?: string;
  content: string;
  status: 'draft' | 'final';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  recordedAt?: string;
}

const RecordsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { patients } = useAppSelector((state: RootState) => state.patients);
  const { user } = useAppSelector((state: RootState) => state.auth);
  
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [stats, setStats] = useState<MedicalRecordStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [formData, setFormData] = useState<MedicalRecordFormData>({
    patient: '',
    recordType: 'consultation',
    title: '',
    content: '',
    status: 'draft',
    priority: 'medium'
  });
  const [filters, setFilters] = useState<MedicalRecordsFilter>({
    page: 1,
    limit: 20
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const safePatients = Array.isArray(patients) ? patients : [];

  useEffect(() => {
    loadMedicalRecords();
    loadStats();
    dispatch(fetchPatients());
  }, [filters]);

  const loadMedicalRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await medicalRecordsService.getMedicalRecords(filters);
      setRecords(response.data);
    } catch (error: any) {
      setError(error.message || 'Failed to load medical records');
      toast.error('Failed to load medical records');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await medicalRecordsService.getMedicalRecordsStats(filters);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validation = medicalRecordsService.validateMedicalRecordData(formData);
      if (!validation.isValid) {
        toast.error(validation.errors.join(', '));
        return;
      }

      if (editingRecord) {
        await medicalRecordsService.updateMedicalRecord(editingRecord._id, formData);
        toast.success('Medical record updated successfully');
      } else {
        await medicalRecordsService.createMedicalRecord(formData);
        toast.success('Medical record created successfully');
      }

      setShowModal(false);
      setEditingRecord(null);
      resetForm();
      loadMedicalRecords();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save medical record');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this medical record?')) {
      try {
        await medicalRecordsService.deleteMedicalRecord(id);
        toast.success('Medical record deleted successfully');
        loadMedicalRecords();
      } catch (error) {
        toast.error('Failed to delete medical record');
      }
    }
  };

  const handleEdit = (record: MedicalRecord) => {
    setEditingRecord(record);
    setFormData({
      patient: record.patient._id,
      recordType: record.recordType,
      title: record.title,
      description: record.description,
      content: record.content,
      status: record.status as 'draft' | 'final',
      priority: record.priority,
      tags: record.tags,
      recordedAt: record.recordedAt
    });
    setShowModal(true);
  };

  const handleViewDetails = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setShowDetails(true);
  };

  const handleFileUpload = async (recordId: string, file: File) => {
    try {
      setUploadingFile(true);
      await medicalRecordsService.uploadAttachment(recordId, file);
      toast.success('File uploaded successfully');
      loadMedicalRecords();
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await medicalRecordsService.exportMedicalRecords(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medical-records-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Medical records exported successfully');
    } catch (error) {
      toast.error('Failed to export medical records');
    }
  };

  const resetForm = () => {
    setFormData({
      patient: '',
      recordType: 'consultation',
      title: '',
      content: '',
      status: 'draft',
      priority: 'medium'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'amended': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <User className="h-4 w-4" />;
      case 'lab_result': return <FileText className="h-4 w-4" />;
      case 'imaging': return <BarChart3 className="h-4 w-4" />;
      case 'prescription': return <Save className="h-4 w-4" />;
      case 'vaccination': return <CheckCircle className="h-4 w-4" />;
      case 'surgery': return <AlertCircle className="h-4 w-4" />;
      case 'emergency': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = safePatients.find(p => p._id === patientId);
    return patient ? patient.fullName : 'Unknown Patient';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-600">Manage and monitor patient medical records</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              showAdvanced 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>{showAdvanced ? 'Hide Stats' : 'Show Stats'}</span>
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {showAdvanced && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Records</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Final Records</h3>
            <p className="text-3xl font-bold text-green-600">{stats.byStatus?.final || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Draft Records</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.byStatus?.draft || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">This Month</h3>
            <p className="text-3xl font-bold text-purple-600">
              {stats.byMonth?.[new Date().toISOString().slice(0, 7)] || 0}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Record Type
            </label>
            <select
              value={filters.recordType || ''}
              onChange={(e) => setFilters({ ...filters, recordType: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {medicalRecordsService.getMedicalRecordTypes().map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              {medicalRecordsService.getStatusOptions().map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={filters.priority || ''}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Priorities</option>
              {medicalRecordsService.getPriorityLevels().map(priority => (
                <option key={priority.value} value={priority.value}>{priority.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Medical Records Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Medical Records Found</h3>
          <p className="text-gray-600">Start by adding a new medical record.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <div key={record._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  {getRecordTypeIcon(record.recordType)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                    <p className="text-sm text-gray-500">{getPatientName(record.patient._id)}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDetails(record)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(record)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(record._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 line-clamp-3">{record.description || record.content}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(record.recordedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(record.priority)}`}>
                  {record.priority}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                  {record.status}
                </span>
              </div>

              {record.attachments && record.attachments.length > 0 && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Paperclip className="h-3 w-3" />
                  <span>{record.attachments.length} attachment(s)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingRecord ? 'Edit Medical Record' : 'Add New Medical Record'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingRecord(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient
                  </label>
                  <select
                    value={formData.patient}
                    onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Patient</option>
                    {safePatients.map(patient => (
                      <option key={patient._id} value={patient._id}>
                        {patient.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Record Type
                  </label>
                  <select
                    value={formData.recordType}
                    onChange={(e) => setFormData({ ...formData, recordType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {medicalRecordsService.getMedicalRecordTypes().map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'final' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="final">Final</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {medicalRecordsService.getPriorityLevels().map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recorded Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.recordedAt || new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setFormData({ ...formData, recordedAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRecord(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingRecord ? 'Update' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Medical Record Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">{selectedRecord.title}</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Patient:</span> {selectedRecord.patient.fullName}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {selectedRecord.recordType}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRecord.status)}`}>
                        {selectedRecord.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Priority:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedRecord.priority)}`}>
                        {selectedRecord.priority}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {new Date(selectedRecord.createdAt).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Recorded:</span> {new Date(selectedRecord.recordedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Content</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedRecord.content}</p>
                  </div>
                </div>
              </div>
              
              {selectedRecord.attachments && selectedRecord.attachments.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {selectedRecord.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{attachment.originalName}</span>
                        </div>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordsPage;
