import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import reportsService, { 
  Report, 
  CreateReportData, 
  ReportsFilter,
  AnalyticsData,
  ChartData,
  ExportOptions
} from '../../services/reportsService';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Activity,
  Download,
  Plus,
  Settings,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Share2,
  Mail,
  Bell
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface ReportFormData {
  title: string;
  description: string;
  type: Report['type'];
  category: Report['category'];
  filters: Record<string, any>;
  isPublic: boolean;
}

const ReportsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [reports, setReports] = useState<Report[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filters, setFilters] = useState<ReportsFilter>({
    page: 1,
    limit: 20
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedAnalytics, setSelectedAnalytics] = useState<string>('overview');

  useEffect(() => {
    loadReports();
    loadAnalytics();
  }, [filters, dateRange]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await reportsService.getReports(filters);
      setReports(response.data);
    } catch (error: any) {
      setError(error.message || 'Failed to load reports');
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await reportsService.getAnalyticsData({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const handleCreateReport = async (formData: ReportFormData) => {
    try {
      const validation = reportsService.validateReportData({
        ...formData,
        data: {},
        filters: formData.filters
      });
      
      if (!validation.isValid) {
        toast.error(validation.errors.join(', '));
        return;
      }

      await reportsService.createReport({
        ...formData,
        data: {},
        filters: formData.filters
      });
      
      toast.success('Report created successfully');
      setShowCreateModal(false);
      loadReports();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create report');
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await reportsService.deleteReport(id);
        setReports(prev => prev.filter(report => report._id !== id));
        toast.success('Report deleted successfully');
      } catch (error) {
        toast.error('Failed to delete report');
      }
    }
  };

  const handleExportReport = async (id: string, format: ExportOptions['format']) => {
    try {
      const options: ExportOptions = {
        format,
        includeCharts: true,
        dateRange: {
          start: dateRange.startDate,
          end: dateRange.endDate
        }
      };
      
      const blob = await reportsService.exportReport(id, options);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const handleExportAnalytics = async (format: ExportOptions['format']) => {
    try {
      const options: ExportOptions = {
        format,
        includeCharts: true,
        dateRange: {
          start: dateRange.startDate,
          end: dateRange.endDate
        }
      };
      
      const blob = await reportsService.exportAnalytics(options);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Analytics exported successfully');
    } catch (error) {
      toast.error('Failed to export analytics');
    }
  };

  const getAnalyticsCard = (title: string, value: number, change?: number, icon?: React.ReactNode) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </div>
  );

  const getChartData = (data: any[], labelKey: string, valueKey: string, label?: string): ChartData => {
    return reportsService.convertToChartData(data, labelKey, valueKey, label);
  };

  const formatCurrency = (amount: number) => reportsService.formatCurrency(amount);

  const formatPercentage = (value: number) => reportsService.formatPercentage(value);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive data analysis and reporting</p>
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
            <span>{showAdvanced ? 'Hide Analytics' : 'Show Analytics'}</span>
          </button>
          <button
            onClick={() => handleExportAnalytics('csv')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Analytics</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Report</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mt-6"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      {showAdvanced && analytics && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics Overview</h2>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {getAnalyticsCard('Total Appointments', analytics.appointments.total, 12, <Calendar className="h-6 w-6" />)}
            {getAnalyticsCard('Active Patients', analytics.patients.total, 8, <Users className="h-6 w-6" />)}
            {getAnalyticsCard('Medical Records', analytics.medicalRecords.total, 15, <FileText className="h-6 w-6" />)}
            {getAnalyticsCard('Total Revenue', analytics.revenue.total, 20, <DollarSign className="h-6 w-6" />)}
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointments Analytics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointments</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{analytics.appointments.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">{analytics.appointments.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cancelled</span>
                  <span className="font-semibold text-red-600">{analytics.appointments.cancelled}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Utilization Rate</span>
                  <span className="font-semibold text-blue-600">{formatPercentage(analytics.appointments.utilizationRate)}</span>
                </div>
              </div>
            </div>

            {/* Revenue Analytics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-semibold text-green-600">{formatCurrency(analytics.revenue.thisMonth)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Year</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(analytics.revenue.thisYear)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Transaction</span>
                  <span className="font-semibold text-purple-600">{formatCurrency(analytics.revenue.averageTransactionValue)}</span>
                </div>
              </div>
            </div>

            {/* Patient Analytics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patients</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New This Month</span>
                  <span className="font-semibold text-green-600">{analytics.patients.newThisMonth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active This Month</span>
                  <span className="font-semibold text-blue-600">{analytics.patients.activeThisMonth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Visits</span>
                  <span className="font-semibold text-purple-600">{analytics.patients.averageVisits.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Performance Analytics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="font-semibold text-blue-600">{analytics.performance.averageResponseTime}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">System Uptime</span>
                  <span className="font-semibold text-green-600">{formatPercentage(analytics.performance.systemUptime)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className="font-semibold text-red-600">{formatPercentage(analytics.performance.errorRate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="font-semibold text-purple-600">{analytics.performance.activeUsers}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Reports</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                {reportsService.getReportTypes().map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-6 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-600">Start by creating a new report.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reports
              .filter(report => 
                !searchTerm || 
                report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.description.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((report) => (
                <div key={report._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {report.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{report.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </span>
                        <span className="capitalize">{report.type.replace('_', ' ')}</span>
                        <span className="capitalize">{report.category}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleExportReport(report._id, 'csv')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                        title="Export CSV"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleExportReport(report._id, 'pdf')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                        title="Export PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReport(report._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Create New Report</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateReport({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                type: formData.get('type') as Report['type'],
                category: formData.get('category') as Report['category'],
                filters: {},
                isPublic: formData.get('isPublic') === 'on'
              });
            }} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Type</option>
                    {reportsService.getReportTypes().map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {reportsService.getReportCategories().map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    name="isPublic"
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Make this report public</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
