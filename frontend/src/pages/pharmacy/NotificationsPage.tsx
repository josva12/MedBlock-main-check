import React, { useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchNotifications } from '../../features/notifications/notificationsSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, isLoading } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Pharmacy Notifications</h1>
      {isLoading ? (
        <LoadingSpinner size="medium" />
      ) : (
        <ul className="space-y-4">
          {Array.isArray(notifications) && notifications.length === 0 && (
            <li className="text-gray-500 dark:text-gray-400">No notifications found.</li>
          )}
          {Array.isArray(notifications) && notifications.map((n) => (
            <li key={n._id} className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 ${n.isRead === false ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 dark:text-white">{n.title || 'Notification'}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{n.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage; 