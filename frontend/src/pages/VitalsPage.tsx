import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { 
  fetchVitals, 
  createVital, 
  updateVital, 
  deleteVital,
  type CreateVitalSignData,
  type VitalSign
} from '../features/vitals/vitalsSlice';
import vitalSignsService, { 
  VitalSignsFilter,
  VitalSignTrends 
} from '../services/vitalSignsService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  BarChart3, 
  Calendar,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface VitalSignFormData {
  patient: string;
  temperature?: { value: number; unit: string };
  bloodPressure?: { systolic: number; diastolic: number };
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: { value: number; unit: string };
  height?: { value: number; unit: string };
  painLevel?: number;
  bloodGlucose?: { value: number; unit: string };
  status: 'draft' | 'final';
  notes?: string;
}

const VitalsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { vitals, isLoading, error } = useAppSelector((state) => state.vitals);
  
  const [showForm, setShowForm] = useState(false);
  const [editingVital, setEditingVital] = useState<VitalSign | null>(null);
  const [formData, setFormData] = useState<VitalSignFormData>({
    patient: '',
    status: 'draft'
  });
  const [filters, setFilters] = useState<VitalSignsFilter>({
    page: 1,
    limit: 20
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [showTrends, setShowTrends] = useState(false);
  const [trends, setTrends] = useState<VitalSignTrends | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadVitalSigns();
    loadStats();
  }, [filters]);

  const loadVitalSigns = async () => {
    try {
      await dispatch(fetchVitals() as any);
    } catch (error) {
      toast.error('Failed to load vital signs');
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await vitalSignsService.getVitalSignsStats(filters);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadTrends = async (patientId: string) => {
    try {
      const trendsData = await vitalSignsService.getVitalSignTrends(patientId);
      setTrends(trendsData);
      setShowTrends(true);
    } catch (error) {
      toast.error('Failed to load trends');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validation = vitalSignsService.validateVitalSignData(formData);
      if (!validation.isValid) {
        toast.error(validation.errors.join(', '));
        return;
      }

      if (editingVital) {
        // For update, we need to map the form data to the expected format
        // Remove the patient field since it's already set in the existing record
        const { patient, ...updateData } = formData;
        await dispatch(updateVital({ id: editingVital._id, data: updateData }) as any);
        toast.success('Vital sign updated successfully');
      } else {
        // For create, we need to add the required fields
        const createData: CreateVitalSignData = {
          ...formData,
          recordedBy: '', // This will be set by the backend
          recordedAt: new Date().toISOString()
        };
        await dispatch(createVital(createData) as any);
        toast.success('Vital sign created successfully');
      }

      setShowForm(false);
      setEditingVital(null);
      resetForm();
      loadVitalSigns();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save vital sign');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vital sign?')) {
      try {
        await dispatch(deleteVital(id) as any);
        toast.success('Vital sign deleted successfully');
        loadVitalSigns();
      } catch (error) {
        toast.error('Failed to delete vital sign');
      }
    }
  };

  const handleEdit = (vital: VitalSign) => {
    setEditingVital(vital);
    setFormData({
      patient: vital.patient._id,
      temperature: vital.temperature,
      bloodPressure: vital.bloodPressure,
      heartRate: vital.heartRate,
      respiratoryRate: vital.respiratoryRate,
      oxygenSaturation: vital.oxygenSaturation,
      weight: vital.weight,
      height: vital.height,
      painLevel: vital.painLevel,
      bloodGlucose: vital.bloodGlucose,
      status: vital.status as 'draft' | 'final',
      notes: vital.notes
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      patient: '',
      status: 'draft'
    });
  };

  const handleExport = async () => {
    try {
      const blob = await vitalSignsService.exportVitalSigns(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vital-signs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Vital signs exported successfully');
    } catch (error) {
      toast.error('Failed to export vital signs');
    }
  };

  const getVitalSignCard = (vital: VitalSign) => (
    <div key={vital._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {vital.patient.fullName || `${vital.patient.firstName} ${vital.patient.lastName}`}
          </h3>
          <p className="text-sm text-gray-500">
            Patient ID: {vital.patient.patientId}
          </p>
          <p className="text-sm text-gray-500">
            Recorded: {new Date(vital.recordedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(vital)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => loadTrends(vital.patient._id)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-full"
          >
            <BarChart3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(vital._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {vital.temperature && (
          <div className="text-center">
            <p className="text-sm text-gray-500">Temperature</p>
            <p className="text-lg font-semibold">
              {vital.temperature.value}°{vital.temperature.unit}
            </p>
            <p className="text-xs text-gray-400">
              {vitalSignsService.getTemperatureCategory(vital.temperature.value, vital.temperature.unit)}
            </p>
          </div>
        )}

        {vital.bloodPressure && (
          <div className="text-center">
            <p className="text-sm text-gray-500">Blood Pressure</p>
            <p className="text-lg font-semibold">
              {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic} mmHg
            </p>
            <p className="text-xs text-gray-400">
              {vitalSignsService.getBloodPressureCategory(vital.bloodPressure.systolic, vital.bloodPressure.diastolic)}
            </p>
          </div>
        )}

        {vital.heartRate && (
          <div className="text-center">
            <p className="text-sm text-gray-500">Heart Rate</p>
            <p className="text-lg font-semibold">{vital.heartRate} bpm</p>
            <p className="text-xs text-gray-400">
              {vitalSignsService.getHeartRateCategory(vital.heartRate)}
            </p>
          </div>
        )}

        {vital.weight && (
          <div className="text-center">
            <p className="text-sm text-gray-500">Weight</p>
            <p className="text-lg font-semibold">
              {vital.weight.value} {vital.weight.unit}
            </p>
            {vital.bmi && (
              <p className="text-xs text-gray-400">
                BMI: {vital.bmi.toFixed(1)} ({vitalSignsService.getBMICategory(vital.bmi)})
              </p>
            )}
          </div>
        )}
      </div>

      {vital.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{vital.notes}</p>
        </div>
      )}

      <div className="mt-4 flex justify-between items-center">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          vital.status === 'final' ? 'bg-green-100 text-green-800' :
          vital.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {vital.status.charAt(0).toUpperCase() + vital.status.slice(1)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vital Signs</h1>
          <p className="text-gray-600">Manage and monitor patient vital signs</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Vital Sign</span>
        </button>
      </div>

      {/* Filters and Search */}
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
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="final">Final</option>
              <option value="amended">Amended</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
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

      {/* Vital Signs Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      ) : vitals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Vital Signs Found</h3>
          <p className="text-gray-600">Start by adding a new vital sign record.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vitals.map(getVitalSignCard)}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingVital ? 'Edit Vital Sign' : 'Add New Vital Sign'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingVital(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Form fields would go here - simplified for brevity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    value={formData.patient}
                    onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

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
              </div>

              {/* Add more form fields for vital signs data */}
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingVital(null);
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
                  <span>{editingVital ? 'Update' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trends Modal */}
      {showTrends && trends && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Vital Signs Trends</h2>
              <button
                onClick={() => setShowTrends(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              {/* Add charts and trends visualization here */}
              <p className="text-gray-600">Trends visualization will be implemented here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalsPage; 