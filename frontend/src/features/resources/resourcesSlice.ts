import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Resource {
  _id: string;
  title: string;
  content: string;
  category?: string;
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
  async (params: { category?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/resources', { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch resources');
    }
  }
);

export const createResource = createAsyncThunk(
  'resources/create',
  async (data: Omit<Resource, '_id' | 'createdAt'>, { rejectWithValue }) => {
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
      });
  },
});

export const { clearError, setCurrentResource } = resourcesSlice.actions;
export default resourcesSlice.reducer; 