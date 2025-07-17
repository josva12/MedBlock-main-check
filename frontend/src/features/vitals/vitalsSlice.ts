import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Types
export interface VitalSign {
  _id: string;
  patientId: string;
  patientName: string;
  temperature: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight?: number;
  height?: number;
  bmi?: number;
  notes?: string;
  recordedBy: string;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface VitalsState {
  vitals: VitalSign[];
  currentVital: VitalSign | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: VitalsState = {
  vitals: [],
  currentVital: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchVitals = createAsyncThunk(
  'vitals/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/vital-signs');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch vital signs';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchVitalById = createAsyncThunk(
  'vitals/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/vital-signs/${id}`);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch vital sign';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createVital = createAsyncThunk(
  'vitals/create',
  async (vitalData: Omit<VitalSign, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/vital-signs', vitalData);
      toast.success('Vital signs recorded successfully');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to record vital signs';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateVital = createAsyncThunk(
  'vitals/update',
  async ({ id, data }: { id: string; data: Partial<VitalSign> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/vital-signs/${id}`, data);
      toast.success('Vital signs updated successfully');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update vital signs';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteVital = createAsyncThunk(
  'vitals/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/vital-signs/${id}`);
      toast.success('Vital signs deleted successfully');
      return id;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete vital signs';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Slice
const vitalsSlice = createSlice({
  name: 'vitals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentVital: (state, action: PayloadAction<VitalSign | null>) => {
      state.currentVital = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all vitals
      .addCase(fetchVitals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVitals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vitals = action.payload;
      })
      .addCase(fetchVitals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch by ID
      .addCase(fetchVitalById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVitalById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentVital = action.payload;
      })
      .addCase(fetchVitalById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create
      .addCase(createVital.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createVital.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vitals.push(action.payload);
      })
      .addCase(createVital.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update
      .addCase(updateVital.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateVital.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.vitals.findIndex(v => v._id === action.payload._id);
        if (index !== -1) {
          state.vitals[index] = action.payload;
        }
        if (state.currentVital?._id === action.payload._id) {
          state.currentVital = action.payload;
        }
      })
      .addCase(updateVital.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete
      .addCase(deleteVital.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteVital.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vitals = state.vitals.filter(v => v._id !== action.payload);
        if (state.currentVital?._id === action.payload) {
          state.currentVital = null;
        }
      })
      .addCase(deleteVital.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentVital } = vitalsSlice.actions;
export default vitalsSlice.reducer; 