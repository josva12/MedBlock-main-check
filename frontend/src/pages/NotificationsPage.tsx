import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import notificationsService, { 
  Notification, 
  CreateNotificationData, 
  NotificationsFilter,
  NotificationStats,
  NotificationPreferences
} from '../services/notificationsService';
import { 
  Bell, 
  Check, 
  X, 
  Archive, 
  Trash2, 
  Settings, 
  Search, 
  Filter, 
  Download, 
  Plus,
  Eye,
  EyeOff,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  Mail,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX,
  Calendar,
  Star,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  BarChart3
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface NotificationFormData {
  title: string;
  message: string;
  type: Notification['type'];
  category: Notification['category'];
  priority: Notification['priority'];
  actionUrl?: string;
  actionText?: string;
}

const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filters, setFilters] = useState<NotificationsFilter>({
    page: 1,
    limit: 20
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadStats();
    loadPreferences();
  }, [filters]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await notificationsService.getNotifications(filters);
      setNotifications(response.data);
    } catch (error: any) {
      setError(error.message || 'Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await notificationsService.getNotificationStats(filters);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadPreferences = async () => {
    try {
      const prefs = await notificationsService.getNotificationPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === id 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAsUnread = async (id: string) => {
    try {
      await notificationsService.markAsUnread(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === id 
            ? { ...notification, isRead: false, readAt: undefined }
            : notification
        )
      );
      toast.success('Notification marked as unread');
    } catch (error) {
      toast.error('Failed to mark notification as unread');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await notificationsService.archiveNotification(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === id 
            ? { ...notification, isArchived: true }
            : notification
        )
      );
      toast.success('Notification archived');
    } catch (error) {
      toast.error('Failed to archive notification');
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      await notificationsService.unarchiveNotification(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === id 
            ? { ...notification, isArchived: false }
            : notification
        )
      );
      toast.success('Notification unarchived');
    } catch (error) {
      toast.error('Failed to unarchive notification');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await notificationsService.deleteNotification(id);
        setNotifications(prev => prev.filter(notification => notification._id !== id));
        toast.success('Notification deleted');
      } catch (error) {
        toast.error('Failed to delete notification');
      }
    }
  };

  const handleBulkAction = async (action: 'read' | 'unread' | 'archive' | 'unarchive' | 'delete') => {
    if (selectedNotifications.length === 0) {
      toast.error('Please select notifications first');
      return;
    }

    try {
      switch (action) {
        case 'read':
          await notificationsService.markMultipleAsRead(selectedNotifications);
          setNotifications(prev => 
            prev.map(notification => 
              selectedNotifications.includes(notification._id)
                ? { ...notification, isRead: true, readAt: new Date().toISOString() }
                : notification
            )
          );
          toast.success('Notifications marked as read');
          break;
        case 'archive':
          await Promise.all(selectedNotifications.map(id => notificationsService.archiveNotification(id)));
          setNotifications(prev => 
            prev.map(notification => 
              selectedNotifications.includes(notification._id)
                ? { ...notification, isArchived: true }
                : notification
            )
          );
          toast.success('Notifications archived');
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete selected notifications?')) {
            await notificationsService.deleteMultipleNotifications(selectedNotifications);
            setNotifications(prev => prev.filter(notification => !selectedNotifications.includes(notification._id)));
            toast.success('Notifications deleted');
          }
          break;
      }
      setSelectedNotifications([]);
    } catch (error) {
      toast.error(`Failed to ${action} notifications`);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await notificationsService.exportNotifications(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notifications-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Notifications exported successfully');
    } catch (error) {
      toast.error('Failed to export notifications');
    }
  };

  const handleUpdatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const updatedPrefs = await notificationsService.updateNotificationPreferences(newPreferences);
      setPreferences(updatedPrefs);
      toast.success('Preferences updated successfully');
    } catch (error) {
      toast.error('Failed to update preferences');
    }
  };

  const handleSendTestNotification = async (type: Notification['type'] = 'info') => {
    try {
      await notificationsService.sendTestNotification(type);
      toast.success('Test notification sent');
      loadNotifications();
    } catch (error) {
      toast.error('Failed to send test notification');
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'appointment':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'medical_record':
        return <Check className="h-5 w-5 text-purple-500" />;
      case 'payment':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (!showArchived && notification.isArchived) return false;
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Manage and monitor your notifications</p>
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
            onClick={() => setShowPreferences(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Preferences</span>
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Send Test</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {showAdvanced && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Notifications</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Unread</h3>
            <p className="text-3xl font-bold text-red-600">{stats.unread}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Archived</h3>
            <p className="text-3xl font-bold text-gray-600">{stats.archived}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-3xl font-bold text-green-600">
              {stats.recentActivity?.[0]?.count || 0}
            </p>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filters.type || ''}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as Notification['type'] || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {notificationsService.getNotificationTypes().map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <select
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value as Notification['category'] || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {notificationsService.getNotificationCategories().map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show Archived</span>
            </label>
          </div>

          <div className="flex items-center space-x-2">
            {selectedNotifications.length > 0 && (
              <>
                <button
                  onClick={() => handleBulkAction('read')}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Mark Read
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Archive
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications Found</h3>
          <p className="text-gray-600">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                notification.isRead ? 'border-gray-200' : 'border-blue-500'
              } ${notification.isArchived ? 'opacity-75' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedNotifications(prev => [...prev, notification._id]);
                        } else {
                          setSelectedNotifications(prev => prev.filter(id => id !== notification._id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className={`text-lg font-semibold ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      {!notification.isRead && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-gray-600 mb-2 ${notification.isRead ? 'text-gray-500' : ''}`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(notification.createdAt)}</span>
                      </span>
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>{notification.actionText || 'View'}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!notification.isRead ? (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkAsUnread(notification._id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Mark as unread"
                    >
                      <EyeOff className="h-4 w-4" />
                    </button>
                  )}
                  
                  {!notification.isArchived ? (
                    <button
                      onClick={() => handleArchive(notification._id)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-full"
                      title="Archive"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnarchive(notification._id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Unarchive"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(notification._id)}
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

      {/* Preferences Modal */}
      {showPreferences && preferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Notification Preferences</h2>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Notification Channels</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={preferences.email}
                      onChange={(e) => handleUpdatePreferences({ email: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Mail className="h-5 w-5 text-gray-500" />
                    <span>Email Notifications</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={preferences.sms}
                      onChange={(e) => handleUpdatePreferences({ sms: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Smartphone className="h-5 w-5 text-gray-500" />
                    <span>SMS Notifications</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={preferences.push}
                      onChange={(e) => handleUpdatePreferences({ push: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Bell className="h-5 w-5 text-gray-500" />
                    <span>Push Notifications</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={preferences.inApp}
                      onChange={(e) => handleUpdatePreferences({ inApp: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Monitor className="h-5 w-5 text-gray-500" />
                    <span>In-App Notifications</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Notification Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(preferences.categories).map(([category, enabled]) => (
                    <label key={category} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => handleUpdatePreferences({
                          categories: {
                            ...preferences.categories,
                            [category]: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="capitalize">{category.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Quiet Hours</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={preferences.quietHours.enabled}
                      onChange={(e) => handleUpdatePreferences({
                        quietHours: {
                          ...preferences.quietHours,
                          enabled: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Enable Quiet Hours</span>
                  </label>
                  
                  {preferences.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={preferences.quietHours.startTime}
                          onChange={(e) => handleUpdatePreferences({
                            quietHours: {
                              ...preferences.quietHours,
                              startTime: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={preferences.quietHours.endTime}
                          onChange={(e) => handleUpdatePreferences({
                            quietHours: {
                              ...preferences.quietHours,
                              endTime: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Send Test Notification</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notification Type
                  </label>
                  <select
                    onChange={(e) => {
                      const type = e.target.value as Notification['type'];
                      handleSendTestNotification(type);
                      setShowCreateModal(false);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Type</option>
                    {notificationsService.getNotificationTypes().map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage; 