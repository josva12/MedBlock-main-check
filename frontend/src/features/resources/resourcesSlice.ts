import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { createSelector } from 'reselect';

export interface Resource {
  _id: string;
  title: string;
  content: string;
  category?: string;
  reactions: {
    happy: number;
    sad: number;
    helpful: number;
    unhelpful: number;
    neutral: number;
  };
  averageRating?: number;
  totalRatings?: number;
  userReaction?: string | null;
  userRating?: number | null;
  createdAt: string;
}

interface ResourcesState {
  resources: Resource[];
  currentResource: Resource | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ResourcesState = {
  resources: [],
  currentResource: null,
  isLoading: false,
  error: null,
};

export const fetchResources = createAsyncThunk(
  'resources/fetchAll',
  async (params?: { category?: string }, { rejectWithValue } = {} as any) => {
    try {
      const response = await api.get('/resources', { params: params || {} });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch resources');
    }
  }
);

export const createResource = createAsyncThunk(
  'resources/create',
  async (data: Omit<Resource, '_id' | 'createdAt' | 'reactions' | 'averageRating' | 'totalRatings'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/resources', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create resource');
    }
  }
);

export const fetchResourceById = createAsyncThunk(
  'resources/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/resources/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch resource');
    }
  }
);

export const reactToResource = createAsyncThunk(
  'resources/react',
  async ({ resourceId, reaction }: { resourceId: string; reaction: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/resources/${resourceId}/react`, { reaction });
      return { resourceId, ...response.data.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to react to resource');
    }
  }
);

export const rateResource = createAsyncThunk(
  'resources/rate',
  async ({ resourceId, rating }: { resourceId: string; rating: number }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/resources/${resourceId}/rate`, { rating });
      return { resourceId, ...response.data.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to rate resource');
    }
  }
);

// Memoized selector for resources
export const selectResources = createSelector(
  (state: any) => state.resources.resources,
  (resources) => resources
);

const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setCurrentResource: (state, action: PayloadAction<Resource | null>) => {
      state.currentResource = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResources.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resources = action.payload;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createResource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createResource.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resources.push(action.payload);
      })
      .addCase(createResource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchResourceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResourceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentResource = action.payload;
      })
      .addCase(fetchResourceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(reactToResource.fulfilled, (state, action) => {
        const { resourceId, reactions, userReaction } = action.payload;
        const resource = state.resources.find(r => r._id === resourceId);
        if (resource) {
          resource.reactions = reactions;
          resource.userReaction = userReaction;
        }
        if (state.currentResource && state.currentResource._id === resourceId) {
          state.currentResource.reactions = reactions;
          state.currentResource.userReaction = userReaction;
        }
      })
      .addCase(rateResource.fulfilled, (state, action) => {
        const { resourceId, averageRating, totalRatings, userRating } = action.payload;
        const resource = state.resources.find(r => r._id === resourceId);
        if (resource) {
          resource.averageRating = averageRating;
          resource.totalRatings = totalRatings;
          resource.userRating = userRating;
        }
        if (state.currentResource && state.currentResource._id === resourceId) {
          state.currentResource.averageRating = averageRating;
          state.currentResource.totalRatings = totalRatings;
          state.currentResource.userRating = userRating;
        }
      });
  },
});

export const { clearError, setCurrentResource } = resourcesSlice.actions;
export default resourcesSlice.reducer; 