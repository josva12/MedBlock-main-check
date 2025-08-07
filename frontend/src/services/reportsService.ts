import api from './api';

export interface Report {
  _id: string;
  title: string;
  description: string;
  type: 'appointments' | 'medical_records' | 'patients' | 'revenue' | 'performance' | 'custom';
  category: 'analytics' | 'operational' | 'financial' | 'clinical' | 'administrative';
  data: any;
  filters: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isPublic: boolean;
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    recipients: string[];
    lastSent?: string;
  };
}

export interface CreateReportData {
  title: string;
  description: string;
  type: Report['type'];
  category: Report['category'];
  data: any;
  filters: Record<string, any>;
  isPublic?: boolean;
  schedule?: Report['schedule'];
}

export interface ReportsFilter {
  page?: number;
  limit?: number;
  type?: Report['type'];
  category?: Report['category'];
  createdBy?: string;
  isPublic?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface ReportsResponse {
  data: Report[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnalyticsData {
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    pending: number;
    byMonth: Array<{ month: string; count: number }>;
    byDoctor: Array<{ doctor: string; count: number }>;
    byDepartment: Array<{ department: string; count: number }>;
    averageDuration: number;
    utilizationRate: number;
  };
  patients: {
    total: number;
    newThisMonth: number;
    activeThisMonth: number;
    byAgeGroup: Array<{ ageGroup: string; count: number }>;
    byGender: Array<{ gender: string; count: number }>;
    byLocation: Array<{ location: string; count: number }>;
    averageVisits: number;
  };
  medicalRecords: {
    total: number;
    thisMonth: number;
    byType: Array<{ type: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
    byDoctor: Array<{ doctor: string; count: number }>;
    averageProcessingTime: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    thisYear: number;
    byMonth: Array<{ month: string; amount: number }>;
    byService: Array<{ service: string; amount: number }>;
    byPaymentMethod: Array<{ method: string; amount: number }>;
    averageTransactionValue: number;
  };
  performance: {
    averageResponseTime: number;
    systemUptime: number;
    errorRate: number;
    activeUsers: number;
    peakUsageTime: string;
    byHour: Array<{ hour: number; users: number }>;
  };
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }>;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeCharts?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
}

class ReportsService {
  // Get reports with filtering
  async getReports(filter?: ReportsFilter): Promise<ReportsResponse> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/reports?${params.toString()}`);
    return response.data;
  }

  // Get a single report
  async getReport(id: string): Promise<Report> {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  }

  // Create a new report
  async createReport(data: CreateReportData): Promise<Report> {
    const response = await api.post('/reports', data);
    return response.data;
  }

  // Update a report
  async updateReport(id: string, data: Partial<CreateReportData>): Promise<Report> {
    const response = await api.put(`/reports/${id}`, data);
    return response.data;
  }

  // Delete a report
  async deleteReport(id: string): Promise<void> {
    await api.delete(`/reports/${id}`);
  }

  // Get analytics data
  async getAnalyticsData(filter?: {
    startDate?: string;
    endDate?: string;
    department?: string;
    doctor?: string;
  }): Promise<AnalyticsData> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/reports/analytics?${params.toString()}`);
    return response.data;
  }

  // Generate appointment analytics
  async getAppointmentAnalytics(filter?: {
    startDate?: string;
    endDate?: string;
    department?: string;
    doctor?: string;
  }): Promise<AnalyticsData['appointments']> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/reports/analytics/appointments?${params.toString()}`);
    return response.data;
  }

  // Generate patient analytics
  async getPatientAnalytics(filter?: {
    startDate?: string;
    endDate?: string;
    department?: string;
  }): Promise<AnalyticsData['patients']> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/reports/analytics/patients?${params.toString()}`);
    return response.data;
  }

  // Generate medical records analytics
  async getMedicalRecordsAnalytics(filter?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    status?: string;
  }): Promise<AnalyticsData['medicalRecords']> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/reports/analytics/medical-records?${params.toString()}`);
    return response.data;
  }

  // Generate revenue analytics
  async getRevenueAnalytics(filter?: {
    startDate?: string;
    endDate?: string;
    service?: string;
    paymentMethod?: string;
  }): Promise<AnalyticsData['revenue']> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/reports/analytics/revenue?${params.toString()}`);
    return response.data;
  }

  // Generate performance analytics
  async getPerformanceAnalytics(filter?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AnalyticsData['performance']> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/reports/analytics/performance?${params.toString()}`);
    return response.data;
  }

  // Export report
  async exportReport(id: string, options: ExportOptions): Promise<Blob> {
    const response = await api.post(`/reports/${id}/export`, options, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Export analytics
  async exportAnalytics(options: ExportOptions): Promise<Blob> {
    const response = await api.post('/reports/analytics/export', options, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Schedule report
  async scheduleReport(id: string, schedule: Report['schedule']): Promise<Report> {
    const response = await api.patch(`/reports/${id}/schedule`, { schedule });
    return response.data;
  }

  // Get report templates
  async getReportTemplates(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    type: Report['type'];
    category: Report['category'];
    template: any;
  }>> {
    const response = await api.get('/reports/templates');
    return response.data;
  }

  // Create report from template
  async createFromTemplate(templateId: string, data: Partial<CreateReportData>): Promise<Report> {
    const response = await api.post(`/reports/templates/${templateId}`, data);
    return response.data;
  }

  // Get report types
  getReportTypes(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'appointments', label: 'Appointments', description: 'Appointment analytics and reports' },
      { value: 'medical_records', label: 'Medical Records', description: 'Medical records analytics and reports' },
      { value: 'patients', label: 'Patients', description: 'Patient analytics and reports' },
      { value: 'revenue', label: 'Revenue', description: 'Revenue analytics and reports' },
      { value: 'performance', label: 'Performance', description: 'System performance analytics and reports' },
      { value: 'custom', label: 'Custom', description: 'Custom reports and analytics' }
    ];
  }

  // Get report categories
  getReportCategories(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'analytics', label: 'Analytics', description: 'Data analytics and insights' },
      { value: 'operational', label: 'Operational', description: 'Operational reports and metrics' },
      { value: 'financial', label: 'Financial', description: 'Financial reports and analysis' },
      { value: 'clinical', label: 'Clinical', description: 'Clinical reports and outcomes' },
      { value: 'administrative', label: 'Administrative', description: 'Administrative reports and compliance' }
    ];
  }

  // Get chart colors
  getChartColors(): string[] {
    return [
      '#3B82F6', // blue
      '#10B981', // green
      '#F59E0B', // yellow
      '#EF4444', // red
      '#8B5CF6', // purple
      '#06B6D4', // cyan
      '#F97316', // orange
      '#84CC16', // lime
      '#EC4899', // pink
      '#6B7280'  // gray
    ];
  }

  // Convert data to chart format
  convertToChartData(data: any[], labelKey: string, valueKey: string, label?: string): ChartData {
    return {
      labels: data.map(item => item[labelKey]),
      datasets: [{
        label: label || valueKey,
        data: data.map(item => item[valueKey]),
        backgroundColor: this.getChartColors()[0],
        borderColor: this.getChartColors()[0],
        borderWidth: 1
      }]
    };
  }

  // Generate trend data
  generateTrendData(data: Array<{ date: string; value: number }>, days: number = 30): ChartData {
    const labels = [];
    const values = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dataPoint = data.find(d => d.date === dateStr);
      labels.push(dateStr);
      values.push(dataPoint ? dataPoint.value : 0);
    }

    return {
      labels,
      datasets: [{
        label: 'Trend',
        data: values,
        borderColor: this.getChartColors()[0],
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true
      }]
    };
  }

  // Validate report data
  validateReportData(data: CreateReportData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (!data.type) {
      errors.push('Type is required');
    }

    if (!data.category) {
      errors.push('Category is required');
    }

    if (!data.data) {
      errors.push('Data is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  // Format percentage
  formatPercentage(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }

  // Format date range
  formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();
    return `${start} - ${end}`;
  }

  // Get report status color
  getReportStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

export default new ReportsService(); 