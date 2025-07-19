import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Types are correct
export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'admin';
  isRead: boolean;
  createdAt: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface SendNotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'admin';
  userIds?: string[];
  roles?: string[];
  metadata?: Record<string, any>;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isSending: false,
  error: null,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/notifications`);
      const notifications = response.data.data || [];
      const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
      return { notifications, unreadCount };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch notifications');
    }
  }
);

// --- FIX: Restored the missing async thunks ---
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue('Failed to mark as read');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (userId: string, { rejectWithValue }) => {
    try {
      await api.post('/notifications/read-all', { userId });
      return;
    } catch (error: any) {
      return rejectWithValue('Failed to mark all as read');
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
      toast.error('Failed to delete notification');
      return rejectWithValue('Failed to delete notification');
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
      toast.error('Failed to send notification');
      return rejectWithValue('Failed to send notification');
    }
  }
);

export const markNotificationAsUnread = createAsyncThunk(
  'notifications/markAsUnread',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await api.patch(`/notifications/${notificationId}/unread`);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue('Failed to mark as unread');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/notifications/unread-count`, { params: { userId } });
      return response.data.unreadCount;
    } catch (error: any) {
      return rejectWithValue('Failed to fetch unread count');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  // --- FIX: Restored the missing reducers block ---
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  // --- FIX: Restored the missing extraReducers block ---
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n._id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => { n.isRead = true; });
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.payload);
        if (index !== -1) {
          if (!state.notifications[index].isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.splice(index, 1);
        }
      })
      .addCase(sendNotification.pending, (state) => {
        state.isSending = true;
      })
      .addCase(sendNotification.fulfilled, (state) => {
        state.isSending = false;
      })
      .addCase(sendNotification.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
      })
      .addCase(markNotificationAsUnread.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n._id === action.payload);
        if (notification && notification.isRead) {
          notification.isRead = false;
          state.unreadCount += 1;
        }
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

export const { clearError, addNotification, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;