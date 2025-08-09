import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Types
export interface InventoryItem {
  _id: string;
  name: string;
  genericName?: string;
  brandName?: string;
  medicationType: string;
  category: string;
  strength: {
    value: number;
    unit: string;
  };
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  costPrice: number;
  sellingPrice: number;
  batchNumber: string;
  expirationDate: string;
  status: string;
  supplier: {
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
  };
  requiresPrescription: boolean;
  controlledSubstance: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PharmacyState {
  inventory: InventoryItem[];
  currentItem: InventoryItem | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

const initialState: PharmacyState = {
  inventory: [],
  currentItem: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
};

// Async thunks
export const fetchInventory = createAsyncThunk(
  'pharmacy/fetchInventory',
  async (params: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    category?: string; 
    status?: string; 
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/pharmacy/inventory?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch inventory';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createInventoryItem = createAsyncThunk(
  'pharmacy/createInventoryItem',
  async (itemData: Omit<InventoryItem, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/pharmacy/inventory', itemData);
      toast.success('Inventory item created successfully');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create inventory item';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateInventoryStock = createAsyncThunk(
  'pharmacy/updateInventoryStock',
  async ({ itemId, quantity, type }: { 
    itemId: string; 
    quantity: number; 
    type: 'add' | 'subtract'; 
  }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/pharmacy/inventory/${itemId}/stock`, { 
        quantity, 
        type 
      });
      toast.success('Stock updated successfully');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update stock';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteInventoryItem = createAsyncThunk(
  'pharmacy/deleteInventoryItem',
  async (itemId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/pharmacy/inventory/${itemId}`);
      toast.success('Inventory item deleted successfully');
      return itemId;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete inventory item';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchInventoryItemById = createAsyncThunk(
  'pharmacy/fetchInventoryItemById',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/pharmacy/inventory/${itemId}`);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch inventory item';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateInventoryItem = createAsyncThunk(
  'pharmacy/updateInventoryItem',
  async ({ itemId, data }: { 
    itemId: string; 
    data: Partial<InventoryItem>; 
  }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/pharmacy/inventory/${itemId}`, data);
      toast.success('Inventory item updated successfully');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update inventory item';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Slice
const pharmacySlice = createSlice({
  name: 'pharmacy',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentItem: (state, action: PayloadAction<InventoryItem | null>) => {
      state.currentItem = action.payload;
    },
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchInventory
      .addCase(fetchInventory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventory = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // createInventoryItem
      .addCase(createInventoryItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventory.unshift(action.payload);
        state.pagination.totalItems += 1;
      })
      .addCase(createInventoryItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // updateInventoryStock
      .addCase(updateInventoryStock.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateInventoryStock.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.inventory.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.inventory[index] = action.payload;
        }
        if (state.currentItem?._id === action.payload._id) {
          state.currentItem = action.payload;
        }
      })
      .addCase(updateInventoryStock.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // deleteInventoryItem
      .addCase(deleteInventoryItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventory = state.inventory.filter(item => item._id !== action.payload);
        state.pagination.totalItems -= 1;
        if (state.currentItem?._id === action.payload) {
          state.currentItem = null;
        }
      })
      .addCase(deleteInventoryItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // fetchInventoryItemById
      .addCase(fetchInventoryItemById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInventoryItemById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload;
      })
      .addCase(fetchInventoryItemById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // updateInventoryItem
      .addCase(updateInventoryItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.inventory.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.inventory[index] = action.payload;
        }
        if (state.currentItem?._id === action.payload._id) {
          state.currentItem = action.payload;
        }
      })
      .addCase(updateInventoryItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentItem, clearCurrentItem } = pharmacySlice.actions;
export default pharmacySlice.reducer;
