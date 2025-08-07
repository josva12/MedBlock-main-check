import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Shield, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Download,
  RefreshCw,
  Settings,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react';
import metricsService, { 
  SystemMetrics, 
  CaptchaMetrics, 
  PerformanceMetrics, 
  SecurityMetrics,
  HealthStatus,
  MetricsFilter
} from '../../services/metricsService';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

interface MetricsDashboardProps {
  className?: string;
  refreshInterval?: number;
  showDetails?: boolean;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  className = '',
  refreshInterval = 30000,
  showDetails = true
}) => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [captchaMetrics, setCaptchaMetrics] = useState<CaptchaMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MetricsFilter>({
    interval: 'daily'
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const loadMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [system, captcha, performance, security, health] = await Promise.all([
        metricsService.getSystemMetrics(filters),
        metricsService.getCaptchaMetrics(filters),
        metricsService.getPerformanceMetrics(filters),
        metricsService.getSecurityMetrics(filters),
        metricsService.getHealthStatus()
      ]);

      setSystemMetrics(system);
      setCaptchaMetrics(captcha);
      setPerformanceMetrics(performance);
      setSecurityMetrics(security);
      setHealthStatus(health);
    } catch (error: any) {
      console.error('Failed to load metrics:', error);
      setError(error.message || 'Failed to load metrics');
      toast.error('Failed to load metrics');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadMetrics();

    if (autoRefresh) {
      const interval = setInterval(loadMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadMetrics, autoRefresh, refreshInterval]);

  const handleExport = async () => {
    try {
      const blob = await metricsService.exportMetrics(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `metrics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Metrics exported successfully');
    } catch (error) {
      toast.error('Failed to export metrics');
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <XCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number) => `${(num * 100).toFixed(1)}%`;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading && !systemMetrics) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System Metrics Dashboard</h2>
            <p className="text-gray-600">Real-time monitoring and analytics</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg ${
                autoRefresh ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={loadMetrics}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200"
            >
              {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Health Status */}
        {healthStatus && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg border ${getHealthStatusColor(healthStatus.status)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">System Health</p>
                  <p className="text-lg font-bold">{healthStatus.status.toUpperCase()}</p>
                </div>
                {getHealthStatusIcon(healthStatus.status)}
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Uptime</p>
                  <p className="text-lg font-bold">{formatDuration(healthStatus.uptime)}</p>
                </div>
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-green-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Version</p>
                  <p className="text-lg font-bold">{healthStatus.version}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-lg font-bold">{new Date(healthStatus.timestamp).toLocaleTimeString()}</p>
                </div>
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* System Metrics */}
      {systemMetrics && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            System Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{formatNumber(systemMetrics.total.users)}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{formatNumber(systemMetrics.total.patients)}</p>
              <p className="text-sm text-gray-600">Patients</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{formatNumber(systemMetrics.total.appointments)}</p>
              <p className="text-sm text-gray-600">Appointments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{formatNumber(systemMetrics.total.medicalRecords)}</p>
              <p className="text-sm text-gray-600">Medical Records</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{formatNumber(systemMetrics.total.notifications)}</p>
              <p className="text-sm text-gray-600">Notifications</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{formatNumber(systemMetrics.total.facilities)}</p>
              <p className="text-sm text-gray-600">Facilities</p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {performanceMetrics && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Performance Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-blue-600">{performanceMetrics.responseTimes.avg}ms</p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Throughput</p>
                  <p className="text-2xl font-bold text-green-600">{formatNumber(performanceMetrics.throughput.requestsPerSecond)}/s</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Error Rate</p>
                  <p className="text-2xl font-bold text-red-600">{formatPercentage(performanceMetrics.errors.rate)}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                  <p className="text-2xl font-bold text-purple-600">{performanceMetrics.resources.cpu}%</p>
                </div>
                <Activity className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Metrics */}
      {securityMetrics && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                  <p className="text-2xl font-bold text-red-600">{formatNumber(securityMetrics.authentication.failedLogins)}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Blocked IPs</p>
                  <p className="text-2xl font-bold text-yellow-600">{formatNumber(securityMetrics.authentication.blockedIPs)}</p>
                </div>
                <Shield className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Events</p>
                  <p className="text-2xl font-bold text-orange-600">{formatNumber(securityMetrics.audit.securityEvents)}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-400" />
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">CAPTCHA Success</p>
                  <p className="text-2xl font-bold text-green-600">{formatNumber(securityMetrics.captcha.successfulValidations)}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CAPTCHA Metrics */}
      {captchaMetrics && showAdvanced && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            CAPTCHA Security Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{captchaMetrics.successRate}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Generated</p>
                  <p className="text-2xl font-bold text-green-600">{formatNumber(captchaMetrics.total.generated)}</p>
                </div>
                <Activity className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{formatNumber(captchaMetrics.total.failed)}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lockouts</p>
                  <p className="text-2xl font-bold text-yellow-600">{formatNumber(captchaMetrics.total.lockouts)}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsDashboard; 