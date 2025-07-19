import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Types
export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'admin';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    action?: string;
    resource?: string;
    link?: string;
  };
}

export interface SendNotificationData {
  userIds?: string[];
  roles?: string[];
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'admin';
  metadata?: {
    action?: string;
    resource?: string;
    link?: string;
  };
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  isSending: boolean;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  isSending: false,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/notifications`);
      return response.data.data || [];
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch notifications';
      return rejectWithValue(message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      return notificationId;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to mark notification as read';
      return rejectWithValue(message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/notifications/read-all');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to mark all notifications as read';
      return rejectWithValue(message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      toast.success('Notification deleted');
      return notificationId;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete notification';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const sendNotification = createAsyncThunk(
  'notifications/sendNotification',
  async (data: SendNotificationData, { rejectWithValue }) => {
    try {
      const response = await api.post('/notifications/send', data);
      toast.success('Notification sent successfully');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to send notification';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action) => {
      const newNotification = action.payload;
      state.notifications.unshift(newNotification);
      if (!newNotification.isRead) {
        state.unreadCount += 1;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n: Notification) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Mark as Read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n._id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      
      // Mark All as Read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.isRead = true;
        });
        state.unreadCount = 0;
      })
      
      // Delete Notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const deletedNotification = state.notifications.find(n => n._id === action.payload);
        if (deletedNotification && !deletedNotification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
      })
      
      // Send Notification
      .addCase(sendNotification.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendNotification.fulfilled, (state) => {
        state.isSending = false;
      })
      .addCase(sendNotification.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, addNotification, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer; 