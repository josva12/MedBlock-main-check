import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { createSelector } from 'reselect';

export interface Claim {
  _id: string;
  policyId: string;
  patientId: string;
  facilityId: string;
  claimAmount: number;
  servicesRendered: string[];
  status: 'pending' | 'approved' | 'rejected' | 'flagged_for_review';
  rejectionReason?: string;
  processedBy?: string;
  transactionHash?: string;
  createdAt: string;
  updatedAt: string;
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

// Submit a new claim
export const submitClaim = createAsyncThunk(
  'claims/submit',
  async (data: {
    policyId: string;
    patientId: string;
    facilityId: string;
    claimAmount: number;
    servicesRendered: string[];
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/claims', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to submit claim');
    }
  }
);

// Fetch all claims (admin)
export const fetchAllClaims = createAsyncThunk(
  'claims/fetchAll',
  async (status?: string, { rejectWithValue }) => {
    try {
      const url = status ? `/claims?status=${status}` : '/claims';
      const response = await api.get(url);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch claims');
    }
  }
);

// Fetch patient's claim history
export const fetchPatientClaims = createAsyncThunk(
  'claims/fetchPatientClaims',
  async (patientId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/claims/patient/${patientId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch patient claims');
    }
  }
);

// Process claim (approve/reject) - admin only
export const processClaim = createAsyncThunk(
  'claims/process',
  async ({ claimId, status, rejectionReason }: {
    claimId: string;
    status: string;
    rejectionReason?: string;
  }, { rejectWithValue }) => {
    try {
      const data: any = { status };
      if (status === 'rejected' && rejectionReason) {
        data.rejectionReason = rejectionReason;
      }
      const response = await api.patch(`/claims/${claimId}/process`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to process claim');
    }
  }
);

// Memoized selectors
export const selectClaims = createSelector(
  (state: any) => state.claims.claims,
  (claims) => claims
);

export const selectCurrentClaim = createSelector(
  (state: any) => state.claims.currentClaim,
  (claim) => claim
);

export const selectClaimsLoading = createSelector(
  (state: any) => state.claims.isLoading,
  (loading) => loading
);

export const selectClaimsError = createSelector(
  (state: any) => state.claims.error,
  (error) => error
);

export const selectClaimsByStatus = createSelector(
  (state: any) => state.claims.claims,
  (claims) => (status: string) => claims.filter(claim => claim.status === status)
);

const claimsSlice = createSlice({
  name: 'claims',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentClaim: (state, action: PayloadAction<Claim | null>) => {
      state.currentClaim = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit claim
      .addCase(submitClaim.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitClaim.fulfilled, (state, action) => {
        state.isLoading = false;
        state.claims.push(action.payload);
      })
      .addCase(submitClaim.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch all claims
      .addCase(fetchAllClaims.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllClaims.fulfilled, (state, action) => {
        state.isLoading = false;
        state.claims = action.payload;
      })
      .addCase(fetchAllClaims.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch patient claims
      .addCase(fetchPatientClaims.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientClaims.fulfilled, (state, action) => {
        state.isLoading = false;
        state.claims = action.payload;
      })
      .addCase(fetchPatientClaims.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Process claim
      .addCase(processClaim.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(processClaim.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedClaim = action.payload;
        const index = state.claims.findIndex(c => c._id === updatedClaim._id);
        if (index !== -1) {
          state.claims[index] = updatedClaim;
        }
        if (state.currentClaim?._id === updatedClaim._id) {
          state.currentClaim = updatedClaim;
        }
      })
      .addCase(processClaim.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentClaim } = claimsSlice.actions;
export default claimsSlice.reducer; 