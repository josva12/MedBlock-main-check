import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  sendNotification,
  type Notification,
  type SendNotificationData
} from '../../features/notifications/notificationsSlice';
import { 
  Bell, 
  Send, 
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings
} from 'lucide-react';

const NotificationsDropdown: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { notifications, unreadCount, isLoading } = useAppSelector((state) => state.notifications);
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminNotification, setAdminNotification] = useState<SendNotificationData>({
    title: '',
    message: '',
    type: 'info',
    userIds: [],
    roles: [],
  });

  // Auto-fetch notifications every 30 seconds
  useEffect(() => {
    if (user?._id) {
      dispatch(fetchNotifications(user._id));
      
      const interval = setInterval(() => {
        dispatch(fetchNotifications(user._id));
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [dispatch, user?._id]);

  const handleMarkAsRead = async (notificationId: string) => {
    await dispatch(markNotificationAsRead(notificationId));
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllNotificationsAsRead());
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await dispatch(deleteNotification(notificationId));
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNotification.title || !adminNotification.message) {
      return;
    }
    
    await dispatch(sendNotification(adminNotification));
    setAdminNotification({
      title: '',
      message: '',
      type: 'info',
      userIds: [],
      roles: [],
    });
    setIsAdminPanelOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'admin':
        return <Settings className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = (notification: Notification) => (
    <div
      key={notification._id}
      className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {notification.title}
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(notification.createdAt)}
              </span>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {notification.message}
          </p>
          <div className="flex items-center space-x-2 mt-2">
            {!notification.isRead && (
              <button
                onClick={() => handleMarkAsRead(notification._id)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Mark as read
              </button>
            )}
            <button
              onClick={() => handleDeleteNotification(notification._id)}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminPanel = () => (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
        Send Notification
      </h3>
      <form onSubmit={handleSendNotification} className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Notification title"
            value={adminNotification.title}
            onChange={(e) => setAdminNotification({ ...adminNotification, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <textarea
            placeholder="Notification message"
            value={adminNotification.message}
            onChange={(e) => setAdminNotification({ ...adminNotification, message: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <select
            value={adminNotification.type}
            onChange={(e) => setAdminNotification({ ...adminNotification, type: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            <Send className="h-4 w-4 mr-1" />
            Send
          </button>
          <button
            type="button"
            onClick={() => setIsAdminPanelOpen(false)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Notifications
              </h3>
              <div className="flex items-center space-x-2">
                {user?.role === 'admin' && (
                  <button
                    onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                )}
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Admin Panel */}
          {isAdminPanelOpen && user?.role === 'admin' && renderAdminPanel()}

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map(renderNotification)
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationsDropdown; 