import api from './api';

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'appointment' | 'medical_record' | 'payment' | 'system';
  category: 'general' | 'appointments' | 'medical_records' | 'payments' | 'security' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  isArchived: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: Notification['type'];
  category: Notification['category'];
  priority: Notification['priority'];
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  categories: {
    general: boolean;
    appointments: boolean;
    medical_records: boolean;
    payments: boolean;
    security: boolean;
    system: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
}

export interface NotificationsFilter {
  page?: number;
  limit?: number;
  isRead?: boolean;
  isArchived?: boolean;
  type?: Notification['type'];
  category?: Notification['category'];
  priority?: Notification['priority'];
  startDate?: string;
  endDate?: string;
}

export interface NotificationsResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  archived: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
}

class NotificationsService {
  // Get notifications with filtering
  async getNotifications(filter?: NotificationsFilter): Promise<NotificationsResponse> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/notifications?${params.toString()}`);
    return response.data;
  }

  // Get a single notification
  async getNotification(id: string): Promise<Notification> {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  }

  // Create a new notification
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const response = await api.post('/notifications', data);
    return response.data;
  }

  // Mark notification as read
  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  }

  // Mark notification as unread
  async markAsUnread(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/unread`);
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(ids: string[]): Promise<void> {
    await api.patch('/notifications/mark-read', { ids });
  }

  // Archive notification
  async archiveNotification(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/archive`);
  }

  // Unarchive notification
  async unarchiveNotification(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/unarchive`);
  }

  // Delete notification
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  }

  // Delete multiple notifications
  async deleteMultipleNotifications(ids: string[]): Promise<void> {
    await api.delete('/notifications/bulk', { data: { ids } });
  }

  // Get notification preferences
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await api.get('/notifications/preferences');
    return response.data;
  }

  // Update notification preferences
  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  }

  // Get notification statistics
  async getNotificationStats(filter?: NotificationsFilter): Promise<NotificationStats> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/notifications/stats?${params.toString()}`);
    return response.data;
  }

  // Subscribe to real-time notifications
  subscribeToNotifications(callback: (notification: Notification) => void): () => void {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll simulate with polling
    const interval = setInterval(async () => {
      try {
        const response = await this.getNotifications({ limit: 1, isRead: false });
        if (response.data.length > 0) {
          const latestNotification = response.data[0];
          callback(latestNotification);
        }
      } catch (error) {
        console.error('Failed to check for new notifications:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }

  // Send test notification
  async sendTestNotification(type: Notification['type'] = 'info'): Promise<Notification> {
    const response = await api.post('/notifications/test', { type });
    return response.data;
  }

  // Get notification templates
  async getNotificationTemplates(): Promise<Array<{
    id: string;
    name: string;
    title: string;
    message: string;
    type: Notification['type'];
    category: Notification['category'];
    variables: string[];
  }>> {
    const response = await api.get('/notifications/templates');
    return response.data;
  }

  // Create notification from template
  async createFromTemplate(templateId: string, variables: Record<string, string>): Promise<Notification> {
    const response = await api.post(`/notifications/templates/${templateId}`, { variables });
    return response.data;
  }

  // Get notification history
  async getNotificationHistory(filter?: NotificationsFilter): Promise<NotificationsResponse> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/notifications/history?${params.toString()}`);
    return response.data;
  }

  // Export notifications
  async exportNotifications(filter?: NotificationsFilter): Promise<Blob> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/notifications/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Get notification types
  getNotificationTypes(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'info', label: 'Information', description: 'General information notifications' },
      { value: 'success', label: 'Success', description: 'Successful operation notifications' },
      { value: 'warning', label: 'Warning', description: 'Warning notifications' },
      { value: 'error', label: 'Error', description: 'Error notifications' },
      { value: 'appointment', label: 'Appointment', description: 'Appointment-related notifications' },
      { value: 'medical_record', label: 'Medical Record', description: 'Medical record notifications' },
      { value: 'payment', label: 'Payment', description: 'Payment-related notifications' },
      { value: 'system', label: 'System', description: 'System notifications' }
    ];
  }

  // Get notification categories
  getNotificationCategories(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'general', label: 'General', description: 'General notifications' },
      { value: 'appointments', label: 'Appointments', description: 'Appointment-related notifications' },
      { value: 'medical_records', label: 'Medical Records', description: 'Medical record notifications' },
      { value: 'payments', label: 'Payments', description: 'Payment notifications' },
      { value: 'security', label: 'Security', description: 'Security-related notifications' },
      { value: 'system', label: 'System', description: 'System notifications' }
    ];
  }

  // Get priority levels
  getPriorityLevels(): Array<{ value: string; label: string; color: string }> {
    return [
      { value: 'low', label: 'Low', color: 'text-green-600' },
      { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
      { value: 'high', label: 'High', color: 'text-orange-600' },
      { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
    ];
  }

  // Validate notification data
  validateNotificationData(data: CreateNotificationData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.userId) {
      errors.push('User ID is required');
    }

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!data.message || data.message.trim().length === 0) {
      errors.push('Message is required');
    }

    if (!data.type) {
      errors.push('Type is required');
    }

    if (!data.category) {
      errors.push('Category is required');
    }

    if (!data.priority) {
      errors.push('Priority is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format notification message
  formatNotificationMessage(notification: Notification): string {
    return `${notification.title}: ${notification.message}`;
  }

  // Get notification icon
  getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'appointment':
        return '📅';
      case 'medical_record':
        return '📋';
      case 'payment':
        return '💰';
      case 'system':
        return '⚙️';
      default:
        return 'ℹ️';
    }
  }

  // Get notification color
  getNotificationColor(type: Notification['type']): string {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'appointment':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medical_record':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'payment':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'system':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  }
}

export default new NotificationsService(); 