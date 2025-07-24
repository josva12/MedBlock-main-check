import React, { useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchNotifications, markNotificationAsRead, markNotificationAsUnread, deleteNotification } from '../../features/notifications/notificationsSlice';
import { Bell, CheckCircle, AlertTriangle, XCircle, Info, Settings, Trash2 } from 'lucide-react';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
    case 'admin': return <Settings className="h-5 w-5 text-purple-500" />;
    default: return <Info className="h-5 w-5 text-blue-500" />;
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

const NurseNotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, isLoading } = useAppSelector(state => state.notifications);
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Only show notifications for this nurse (userId matches or role includes 'nurse')
  const nurseNotifications = Array.isArray(notifications)
    ? notifications.filter(n => n.userId === user?._id || (n.metadata?.roles?.includes?.('nurse')))
    : [];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Bell className="mr-3 text-yellow-500" />Notifications
      </h1>
      {isLoading ? (
        <div className="text-center text-gray-500 dark:text-gray-400">Loading notifications...</div>
      ) : nurseNotifications.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">No notifications found.</div>
      ) : (
        <div className="space-y-4">
          {nurseNotifications.map((notification) => (
            <div key={notification._id} className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-start space-x-3 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'}`}>
              <div className="mt-1">{getNotificationIcon(notification.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{notification.title}</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(notification.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {!notification.isRead && (
                    <button onClick={() => dispatch(markNotificationAsRead(notification._id))} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">Mark as read</button>
                  )}
                  {notification.isRead && (
                    <button onClick={() => dispatch(markNotificationAsUnread(notification._id))} className="text-xs text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300">Mark as unread</button>
                  )}
                  <button onClick={() => dispatch(deleteNotification(notification._id))} className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center"><Trash2 className="h-4 w-4 mr-1" />Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NurseNotificationsPage; 