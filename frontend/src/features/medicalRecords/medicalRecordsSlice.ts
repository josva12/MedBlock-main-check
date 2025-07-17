import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Types
export interface MedicalRecord {
  _id: string;
  patientId: string;
  patientName: string;
  diagnosis: string;
  treatment: string;
  prescription?: string;
  notes?: string;
  doctorId: string;
  doctorName: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecordsState {
  records: MedicalRecord[];
  currentRecord: MedicalRecord | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MedicalRecordsState = {
  records: [],
  currentRecord: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchMedicalRecords = createAsyncThunk(
  'medicalRecords/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/medical-records');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch medical records';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchMedicalRecordById = createAsyncThunk(
  'medicalRecords/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/medical-records/${id}`);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch medical record';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createMedicalRecord = createAsyncThunk(
  'medicalRecords/create',
  async (recordData: Omit<MedicalRecord, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/medical-records', recordData);
      toast.success('Medical record created successfully');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create medical record';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateMedicalRecord = createAsyncThunk(
  'medicalRecords/update',
  async ({ id, data }: { id: string; data: Partial<MedicalRecord> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/medical-records/${id}`, data);
      toast.success('Medical record updated successfully');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update medical record';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteMedicalRecord = createAsyncThunk(
  'medicalRecords/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/medical-records/${id}`);
      toast.success('Medical record deleted successfully');
      return id;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete medical record';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Slice
const medicalRecordsSlice = createSlice({
  name: 'medicalRecords',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRecord: (state, action: PayloadAction<MedicalRecord | null>) => {
      state.currentRecord = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all records
      .addCase(fetchMedicalRecords.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMedicalRecords.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = action.payload;
      })
      .addCase(fetchMedicalRecords.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch by ID
      .addCase(fetchMedicalRecordById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMedicalRecordById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRecord = action.payload;
      })
      .addCase(fetchMedicalRecordById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create
      .addCase(createMedicalRecord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMedicalRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records.push(action.payload);
      })
      .addCase(createMedicalRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update
      .addCase(updateMedicalRecord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMedicalRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.records.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
        if (state.currentRecord?._id === action.payload._id) {
          state.currentRecord = action.payload;
        }
      })
      .addCase(updateMedicalRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete
      .addCase(deleteMedicalRecord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMedicalRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = state.records.filter(r => r._id !== action.payload);
        if (state.currentRecord?._id === action.payload) {
          state.currentRecord = null;
        }
      })
      .addCase(deleteMedicalRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentRecord } = medicalRecordsSlice.actions;
export default medicalRecordsSlice.reducer; 