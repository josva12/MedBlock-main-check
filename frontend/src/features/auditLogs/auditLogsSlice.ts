import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { createSelector } from 'reselect';

export interface AuditLog {
  _id: string;
  userId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: any;
  timestamp: string;
}

interface AuditLogsState {
  logs: AuditLog[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AuditLogsState = {
  logs: [],
  isLoading: false,
  error: null,
};

export const fetchAuditLogs = createAsyncThunk(
  'auditLogs/fetchAll',
  async (params: { userId?: string; action?: string; startDate?: string; endDate?: string; page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/audit-logs', { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch audit logs');
    }
  }
);

const auditLogsSlice = createSlice({
  name: 'auditLogs',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.logs = action.payload;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = auditLogsSlice.actions;
export default auditLogsSlice.reducer;

// Memoized selector for audit logs
export const selectAuditLogs = createSelector(
  (state: any) => state.auditLogs.logs,
  (logs) => logs
); 