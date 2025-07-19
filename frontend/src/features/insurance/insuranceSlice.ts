import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { createSelector } from 'reselect';

export interface Dependent {
  name: string;
  relationship: string;
}

export interface InsurancePolicy {
  _id: string;
  userId: string;
  policyTier: 'msingi' | 'kati' | 'juu' | 'familia';
  status: 'active' | 'lapsed' | 'cancelled' | 'pending';
  premiumAmount: number;
  coverageLimit: number;
  startDate?: string;
  endDate?: string;
  dependents: Dependent[];
  createdAt: string;
  updatedAt: string;
}

interface InsuranceState {
  policies: InsurancePolicy[];
  currentPolicy: InsurancePolicy | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: InsuranceState = {
  policies: [],
  currentPolicy: null,
  isLoading: false,
  error: null,
};

// Enroll a user in insurance
export const enrollUser = createAsyncThunk(
  'insurance/enrollUser',
  async (data: {
    policyTier: string;
    premiumAmount: number;
    coverageLimit: number;
    dependents: Dependent[];
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/insurance', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to enroll user');
    }
  }
);

// Get user's insurance policy
export const getUserPolicy = createAsyncThunk(
  'insurance/getUserPolicy',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/insurance/user/${userId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch policy');
    }
  }
);

// Update policy status (admin only)
export const updatePolicyStatus = createAsyncThunk(
  'insurance/updateStatus',
  async ({ policyId, status }: { policyId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/insurance/${policyId}/status`, { status });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update policy status');
    }
  }
);

// Memoized selectors
export const selectPolicies = createSelector(
  (state: any) => state.insurance.policies,
  (policies) => policies
);

export const selectCurrentPolicy = createSelector(
  (state: any) => state.insurance.currentPolicy,
  (policy) => policy
);

export const selectInsuranceLoading = createSelector(
  (state: any) => state.insurance.isLoading,
  (loading) => loading
);

export const selectInsuranceError = createSelector(
  (state: any) => state.insurance.error,
  (error) => error
);

const insuranceSlice = createSlice({
  name: 'insurance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPolicy: (state, action: PayloadAction<InsurancePolicy | null>) => {
      state.currentPolicy = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Enroll user
      .addCase(enrollUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(enrollUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPolicy = action.payload;
        state.policies.push(action.payload);
      })
      .addCase(enrollUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get user policy
      .addCase(getUserPolicy.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserPolicy.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPolicy = action.payload;
      })
      .addCase(getUserPolicy.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update policy status
      .addCase(updatePolicyStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePolicyStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedPolicy = action.payload;
        state.currentPolicy = updatedPolicy;
        const index = state.policies.findIndex(p => p._id === updatedPolicy._id);
        if (index !== -1) {
          state.policies[index] = updatedPolicy;
        }
      })
      .addCase(updatePolicyStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentPolicy } = insuranceSlice.actions;
export default insuranceSlice.reducer; 