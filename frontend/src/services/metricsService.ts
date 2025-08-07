import api from './api';

export interface SystemMetrics {
  total: {
    users: number;
    patients: number;
    appointments: number;
    medicalRecords: number;
    notifications: number;
    facilities: number;
    vitalSigns: number;
    auditLogs: number;
    blockchainTransactions: number;
    payments: number;
    aiChats: number;
    teleconsultations: number;
    predictions: number;
    subscriptions: number;
  };
  active: {
    users: number;
    sessions: number;
    appointments: number;
    consultations: number;
  };
  performance: {
    avgResponseTime: number;
    uptime: number;
    errorRate: number;
    throughput: number;
  };
  security: {
    failedLogins: number;
    blockedIPs: number;
    securityEvents: number;
    captchaFailures: number;
  };
}

export interface CaptchaMetrics {
  total: {
    generated: number;
    validated: number;
    failed: number;
    failedAttempts: number;
    lockouts: number;
    rateLimitExceeded: number;
    validationAttempts: number;
    sessionExpirations: number;
    inputSanitizations: number;
  };
  successRate: string;
  performance: {
    avgResponseTime: number;
    medianResponseTime: number;
    totalResponseTimes: number;
  };
  hourlyStats: Record<string, { generated: number; validated: number; failed: number }>;
  dailyStats: Record<string, { generated: number; validated: number; failed: number }>;
  timeOfDayStats: Record<string, { generated: number; validated: number; failed: number }>;
  dayOfWeekStats: Record<string, { generated: number; validated: number; failed: number }>;
  endpointUsage: Record<string, { generated: number; validated: number; failed: number }>;
  userAgents: Record<string, number>;
  geographicData: Record<string, { attempts: number; firstSeen: string; lastSeen: string }>;
  securityEvents: Record<string, number>;
  difficultyLevels: Record<string, { attempts: number; successes: number; failures: number }>;
  topIPs: Array<{
    ip: string;
    attempts: number;
    firstAttempt: string;
    lastAttempt: string;
  }>;
  topGeographicLocations: Array<{
    location: string;
    attempts: number;
    firstSeen: string;
    lastSeen: string;
  }>;
}

export interface PerformanceMetrics {
  responseTimes: {
    avg: number;
    median: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  errors: {
    total: number;
    rate: number;
    byEndpoint: Record<string, number>;
    byType: Record<string, number>;
  };
  resources: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
}

export interface SecurityMetrics {
  authentication: {
    totalLogins: number;
    failedLogins: number;
    successfulLogins: number;
    blockedIPs: number;
    suspiciousActivities: number;
  };
  authorization: {
    unauthorizedAccess: number;
    permissionDenied: number;
    roleViolations: number;
  };
  captcha: {
    totalAttempts: number;
    successfulValidations: number;
    failedValidations: number;
    lockouts: number;
  };
  audit: {
    totalEvents: number;
    securityEvents: number;
    dataAccessEvents: number;
    modificationEvents: number;
  };
}

export interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  message: string;
  timestamp: string;
  checks: {
    database: { status: 'healthy' | 'warning' | 'critical'; message: string };
    redis: { status: 'healthy' | 'warning' | 'critical'; message: string };
    externalServices: { status: 'healthy' | 'warning' | 'critical'; message: string };
    blockchain: { status: 'healthy' | 'warning' | 'critical'; message: string };
  };
  uptime: number;
  version: string;
}

export interface MetricsFilter {
  startDate?: string;
  endDate?: string;
  interval?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  endpoint?: string;
  userId?: string;
  patientId?: string;
  facilityId?: string;
}

class MetricsService {
  /**
   * Get system-wide metrics
   */
  async getSystemMetrics(filter?: MetricsFilter): Promise<SystemMetrics> {
    try {
      const params = new URLSearchParams();
      if (filter?.startDate) params.append('startDate', filter.startDate);
      if (filter?.endDate) params.append('endDate', filter.endDate);
      if (filter?.interval) params.append('interval', filter.interval);

      const response = await api.get(`/metrics/system?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
      throw new Error('Failed to fetch system metrics');
    }
  }

  /**
   * Get CAPTCHA-specific metrics
   */
  async getCaptchaMetrics(filter?: MetricsFilter): Promise<CaptchaMetrics> {
    try {
      const params = new URLSearchParams();
      if (filter?.startDate) params.append('startDate', filter.startDate);
      if (filter?.endDate) params.append('endDate', filter.endDate);
      if (filter?.interval) params.append('interval', filter.interval);

      const response = await api.get(`/metrics/captcha?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch CAPTCHA metrics:', error);
      throw new Error('Failed to fetch CAPTCHA metrics');
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(filter?: MetricsFilter): Promise<PerformanceMetrics> {
    try {
      const params = new URLSearchParams();
      if (filter?.startDate) params.append('startDate', filter.startDate);
      if (filter?.endDate) params.append('endDate', filter.endDate);
      if (filter?.interval) params.append('interval', filter.interval);

      const response = await api.get(`/metrics/performance?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      throw new Error('Failed to fetch performance metrics');
    }
  }

  /**
   * Get security metrics
   */
  async getSecurityMetrics(filter?: MetricsFilter): Promise<SecurityMetrics> {
    try {
      const params = new URLSearchParams();
      if (filter?.startDate) params.append('startDate', filter.startDate);
      if (filter?.endDate) params.append('endDate', filter.endDate);
      if (filter?.interval) params.append('interval', filter.interval);

      const response = await api.get(`/metrics/security?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch security metrics:', error);
      throw new Error('Failed to fetch security metrics');
    }
  }

  /**
   * Get system health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    try {
      const response = await api.get('/metrics/health');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch health status:', error);
      throw new Error('Failed to fetch health status');
    }
  }

  /**
   * Get Prometheus format metrics
   */
  async getPrometheusMetrics(): Promise<string> {
    try {
      const response = await api.get('/metrics/prometheus');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch Prometheus metrics:', error);
      throw new Error('Failed to fetch Prometheus metrics');
    }
  }

  /**
   * Get metrics for a specific time period
   */
  async getPeriodMetrics(startDate: string, endDate: string, interval: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<{
    system: SystemMetrics;
    captcha: CaptchaMetrics;
    performance: PerformanceMetrics;
    security: SecurityMetrics;
  }> {
    try {
      const filter: MetricsFilter = { startDate, endDate, interval };
      const [system, captcha, performance, security] = await Promise.all([
        this.getSystemMetrics(filter),
        this.getCaptchaMetrics(filter),
        this.getPerformanceMetrics(filter),
        this.getSecurityMetrics(filter)
      ]);

      return { system, captcha, performance, security };
    } catch (error) {
      console.error('Failed to fetch period metrics:', error);
      throw new Error('Failed to fetch period metrics');
    }
  }

  /**
   * Get real-time metrics (last 24 hours)
   */
  async getRealTimeMetrics(): Promise<{
    system: SystemMetrics;
    captcha: CaptchaMetrics;
    performance: PerformanceMetrics;
    security: SecurityMetrics;
  }> {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    return this.getPeriodMetrics(startDate, endDate, 'hourly');
  }

  /**
   * Export metrics to CSV
   */
  async exportMetrics(filter?: MetricsFilter): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (filter?.startDate) params.append('startDate', filter.startDate);
      if (filter?.endDate) params.append('endDate', filter.endDate);
      if (filter?.interval) params.append('interval', filter.interval);

      const response = await api.get(`/metrics/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to export metrics:', error);
      throw new Error('Failed to export metrics');
    }
  }

  /**
   * Get metrics dashboard configuration
   */
  async getDashboardConfig(): Promise<{
    refreshInterval: number;
    defaultTimeRange: string;
    enabledMetrics: string[];
    alertThresholds: Record<string, number>;
  }> {
    try {
      const response = await api.get('/metrics/dashboard/config');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch dashboard config:', error);
      // Return default configuration
      return {
        refreshInterval: 30000, // 30 seconds
        defaultTimeRange: '24h',
        enabledMetrics: ['system', 'captcha', 'performance', 'security'],
        alertThresholds: {
          errorRate: 0.05,
          responseTime: 2000,
          cpuUsage: 80,
          memoryUsage: 85
        }
      };
    }
  }

  /**
   * Update dashboard configuration
   */
  async updateDashboardConfig(config: {
    refreshInterval?: number;
    defaultTimeRange?: string;
    enabledMetrics?: string[];
    alertThresholds?: Record<string, number>;
  }): Promise<void> {
    try {
      await api.put('/metrics/dashboard/config', config);
    } catch (error) {
      console.error('Failed to update dashboard config:', error);
      throw new Error('Failed to update dashboard config');
    }
  }

  /**
   * Get alert history
   */
  async getAlertHistory(filter?: MetricsFilter): Promise<Array<{
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: string;
    resolved: boolean;
    resolvedAt?: string;
  }>> {
    try {
      const params = new URLSearchParams();
      if (filter?.startDate) params.append('startDate', filter.startDate);
      if (filter?.endDate) params.append('endDate', filter.endDate);

      const response = await api.get(`/metrics/alerts?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch alert history:', error);
      throw new Error('Failed to fetch alert history');
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      await api.post(`/metrics/alerts/${alertId}/acknowledge`);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      throw new Error('Failed to acknowledge alert');
    }
  }

  /**
   * Get metrics summary for quick overview
   */
  async getMetricsSummary(): Promise<{
    systemHealth: 'healthy' | 'warning' | 'critical';
    activeUsers: number;
    totalAppointments: number;
    errorRate: number;
    avgResponseTime: number;
    securityEvents: number;
  }> {
    try {
      const response = await api.get('/metrics/summary');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch metrics summary:', error);
      throw new Error('Failed to fetch metrics summary');
    }
  }
}

export default new MetricsService(); 