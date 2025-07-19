import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Facility {
  _id: string;
  name: string;
  type: string;
  registrationNumber: string;
  licensingBody: string;
  address?: any;
  contact?: any;
  status: string;
  submissionDate: string;
  createdBy: string;
  verificationDate?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  notes?: string;
  isActive?: boolean;
}

interface FacilitiesState {
  facilities: Facility[];
  currentFacility: Facility | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: FacilitiesState = {
  facilities: [],
  currentFacility: null,
  isLoading: false,
  error: null,
};

export const fetchFacilities = createAsyncThunk(
  'facilities/fetchAll',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/facilities', { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch facilities');
    }
  }
);

export const createFacility = createAsyncThunk(
  'facilities/create',
  async (data: Omit<Facility, '_id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/facilities', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create facility');
    }
  }
);

export const fetchFacilityById = createAsyncThunk(
  'facilities/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/facilities/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch facility');
    }
  }
);

export const updateFacility = createAsyncThunk(
  'facilities/update',
  async ({ id, data }: { id: string; data: Partial<Facility> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/facilities/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update facility');
    }
  }
);

export const deleteFacility = createAsyncThunk(
  'facilities/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/facilities/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete facility');
    }
  }
);

const facilitiesSlice = createSlice({
  name: 'facilities',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setCurrentFacility: (state, action: PayloadAction<Facility | null>) => {
      state.currentFacility = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFacilities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFacilities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.facilities = action.payload;
      })
      .addCase(fetchFacilities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createFacility.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFacility.fulfilled, (state, action) => {
        state.isLoading = false;
        state.facilities.push(action.payload);
      })
      .addCase(createFacility.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFacilityById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFacilityById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFacility = action.payload;
      })
      .addCase(fetchFacilityById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateFacility.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateFacility.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.facilities.findIndex(f => f._id === action.payload._id);
        if (index !== -1) {
          state.facilities[index] = action.payload;
        }
        if (state.currentFacility?._id === action.payload._id) {
          state.currentFacility = action.payload;
        }
      })
      .addCase(updateFacility.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteFacility.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteFacility.fulfilled, (state, action) => {
        state.isLoading = false;
        state.facilities = state.facilities.filter(f => f._id !== action.payload);
        if (state.currentFacility?._id === action.payload) {
          state.currentFacility = null;
        }
      })
      .addCase(deleteFacility.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentFacility } = facilitiesSlice.actions;
export default facilitiesSlice.reducer; 