import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Types
export interface Report {
  _id: string;
  patientId: string;
  patientName: string;
  reportType: 'lab' | 'imaging' | 'pathology' | 'consultation' | 'discharge';
  title: string;
  content: string;
  findings?: string;
  recommendations?: string;
  attachments?: string[];
  status: 'draft' | 'completed' | 'reviewed' | 'approved';
  generatedBy: string;
  generatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportsState {
  reports: Report[];
  currentReport: Report | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  reports: [],
  currentReport: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchReports = createAsyncThunk(
  'reports/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch reports';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchReportById = createAsyncThunk(
  'reports/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reports/${id}`);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch report';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createReport = createAsyncThunk(
  'reports/create',
  async (reportData: Omit<Report, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/reports', reportData);
      toast.success('Report created successfully');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create report';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateReport = createAsyncThunk(
  'reports/update',
  async ({ id, data }: { id: string; data: Partial<Report> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/reports/${id}`, data);
      toast.success('Report updated successfully');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update report';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteReport = createAsyncThunk(
  'reports/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/reports/${id}`);
      toast.success('Report deleted successfully');
      return id;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete report';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Slice
const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentReport: (state, action: PayloadAction<Report | null>) => {
      state.currentReport = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all reports
      .addCase(fetchReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch by ID
      .addCase(fetchReportById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReport = action.payload;
      })
      .addCase(fetchReportById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create
      .addCase(createReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.push(action.payload);
      })
      .addCase(createReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update
      .addCase(updateReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.reports.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
        if (state.currentReport?._id === action.payload._id) {
          state.currentReport = action.payload;
        }
      })
      .addCase(updateReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete
      .addCase(deleteReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports = state.reports.filter(r => r._id !== action.payload);
        if (state.currentReport?._id === action.payload) {
          state.currentReport = null;
        }
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentReport } = reportsSlice.actions;
export default reportsSlice.reducer; 