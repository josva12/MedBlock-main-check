import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Claim {
  _id: string;
  patientId: string;
  insurerId: string;
  amount: number;
  blockchainHash?: string;
  createdAt: string;
}

interface ClaimsState {
  claims: Claim[];
  currentClaim: Claim | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ClaimsState = {
  claims: [],
  currentClaim: null,
  isLoading: false,
  error: null,
};

export const fetchClaims = createAsyncThunk(
  'claims/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/claims');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch claims');
    }
  }
);

export const createClaim = createAsyncThunk(
  'claims/create',
  async (data: Omit<Claim, '_id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/claims', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create claim');
    }
  }
);

export const fetchClaimById = createAsyncThunk(
  'claims/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/claims/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch claim');
    }
  }
);

const claimsSlice = createSlice({
  name: 'claims',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setCurrentClaim: (state, action: PayloadAction<Claim | null>) => {
      state.currentClaim = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClaims.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClaims.fulfilled, (state, action) => {
        state.isLoading = false;
        state.claims = action.payload;
      })
      .addCase(fetchClaims.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createClaim.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createClaim.fulfilled, (state, action) => {
        state.isLoading = false;
        state.claims.push(action.payload);
      })
      .addCase(createClaim.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchClaimById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClaimById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentClaim = action.payload;
      })
      .addCase(fetchClaimById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentClaim } = claimsSlice.actions;
export default claimsSlice.reducer; 