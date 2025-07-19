import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Teleconsultation {
  _id: string;
  patientId: string;
  doctorId: string;
  paymentMethod: 'mpesa' | 'card';
  mpesaReceipt?: string;
  createdAt: string;
}

interface TeleconsultationsState {
  teleconsultations: Teleconsultation[];
  currentTeleconsultation: Teleconsultation | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TeleconsultationsState = {
  teleconsultations: [],
  currentTeleconsultation: null,
  isLoading: false,
  error: null,
};

export const fetchTeleconsultations = createAsyncThunk(
  'teleconsultations/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teleconsultations');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch teleconsultations');
    }
  }
);

export const createTeleconsultation = createAsyncThunk(
  'teleconsultations/create',
  async (data: Omit<Teleconsultation, '_id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/teleconsultations', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create teleconsultation');
    }
  }
);

export const fetchTeleconsultationById = createAsyncThunk(
  'teleconsultations/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/teleconsultations/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch teleconsultation');
    }
  }
);

const teleconsultationsSlice = createSlice({
  name: 'teleconsultations',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setCurrentTeleconsultation: (state, action: PayloadAction<Teleconsultation | null>) => {
      state.currentTeleconsultation = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeleconsultations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeleconsultations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teleconsultations = action.payload;
      })
      .addCase(fetchTeleconsultations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createTeleconsultation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTeleconsultation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teleconsultations.push(action.payload);
      })
      .addCase(createTeleconsultation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTeleconsultationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeleconsultationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTeleconsultation = action.payload;
      })
      .addCase(fetchTeleconsultationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentTeleconsultation } = teleconsultationsSlice.actions;
export default teleconsultationsSlice.reducer; 