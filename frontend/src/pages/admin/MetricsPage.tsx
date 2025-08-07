import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import MetricsDashboard from '../../components/admin/MetricsDashboard';
import metricsService, { MetricsFilter } from '../../services/metricsService';
import { 
  Calendar, 
  Filter, 
  Download, 
  Settings, 
  BarChart3,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const MetricsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [filters, setFilters] = useState<MetricsFilter>({
    interval: 'daily',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState<any>(null);

  useEffect(() => {
    loadDashboardConfig();
  }, []);

  const loadDashboardConfig = async () => {
    try {
      const config = await metricsService.getDashboardConfig();
      setDashboardConfig(config);
      setRefreshInterval(config.refreshInterval);
    } catch (error) {
      console.error('Failed to load dashboard config:', error);
    }
  };

  const handleFilterChange = (key: keyof MetricsFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExportMetrics = async () => {
    try {
      setIsLoading(true);
      const blob = await metricsService.exportMetrics(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `metrics-${filters.startDate}-to-${filters.endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Metrics exported successfully');
    } catch (error) {
      toast.error('Failed to export metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPrometheus = async () => {
    try {
      setIsLoading(true);
      const prometheusData = await metricsService.getPrometheusMetrics();
      const blob = new Blob([prometheusData], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prometheus-metrics-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Prometheus metrics exported successfully');
    } catch (error) {
      toast.error('Failed to export Prometheus metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const getQuickStats = () => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return [
      { label: 'Today', startDate: today.toISOString().split('T')[0], endDate: today.toISOString().split('T')[0] },
      { label: 'Last 7 Days', startDate: lastWeek.toISOString().split('T')[0], endDate: today.toISOString().split('T')[0] },
      { label: 'Last 30 Days', startDate: lastMonth.toISOString().split('T')[0], endDate: today.toISOString().split('T')[0] }
    ];
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Metrics & Monitoring</h1>
          <p className="text-gray-600">Comprehensive system monitoring and analytics dashboard</p>
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
            <span>{showAdvanced ? 'Hide Advanced' : 'Show Advanced'}</span>
          </button>
          <button
            onClick={handleExportMetrics}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPrometheus}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Export Prometheus</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Configuration
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interval
            </label>
            <select
              value={filters.interval || 'daily'}
              onChange={(e) => handleFilterChange('interval', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Refresh Interval
            </label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
              <option value={300000}>5 minutes</option>
              <option value={600000}>10 minutes</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Filters</h3>
          <div className="flex flex-wrap gap-2">
            {getQuickStats().map((stat) => (
              <button
                key={stat.label}
                onClick={() => setFilters({ ...filters, startDate: stat.startDate, endDate: stat.endDate })}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filters.startDate === stat.startDate && filters.endDate === stat.endDate
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {stat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <MetricsDashboard
        refreshInterval={refreshInterval}
        showDetails={showAdvanced}
        className="mb-6"
      />

      {/* Additional Metrics Sections */}
      {showAdvanced && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trends */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Performance Trends
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Response Time Trend</span>
                <span className="text-sm font-semibold text-blue-600">Stable</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Throughput Trend</span>
                <span className="text-sm font-semibold text-green-600">Increasing</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Error Rate Trend</span>
                <span className="text-sm font-semibold text-yellow-600">Decreasing</span>
              </div>
            </div>
          </div>

          {/* Security Alerts */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Security Alerts
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Failed Login Attempts</span>
                <span className="text-sm font-semibold text-red-600">High</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Suspicious Activities</span>
                <span className="text-sm font-semibold text-yellow-600">Medium</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">System Security</span>
                <span className="text-sm font-semibold text-green-600">Good</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <LoadingSpinner />
            <span className="text-gray-700">Exporting metrics...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsPage; 