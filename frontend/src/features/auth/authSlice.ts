import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Types
export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: 'doctor' | 'nurse' | 'admin' | 'front-desk' | 'pharmacy';
  title: string;
  specialization?: string;
  department?: string;
  phone: string;
  address: {
    street: string;
    city: string;
    county: string;
    subCounty: string;
    postalCode?: string;
    country: string;
  };
  isActive: boolean;
  isVerified: boolean;
  isGovernmentVerified: boolean;
  professionalVerification: {
    status: 'unsubmitted' | 'pending' | 'verified' | 'rejected';
    licensingBody?: string;
    submittedLicenseNumber?: string;
    submissionDate?: string;
    verificationDate?: string;
    verifiedBy?: string;
    rejectionReason?: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  role: 'doctor' | 'nurse' | 'admin' | 'front-desk' | 'pharmacy';
  phone: string;
  title: string;
  specialization?: string;
  department?: string;
  address: {
    street: string;
    city: string;
    county: string;
    subCounty: string;
    postalCode?: string;
    country: string;
  };
  submittedLicenseNumber?: string;
  licensingBody?: 'KMPDC' | 'NCK' | 'PPB' | 'other';
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('accessToken'), // Corrected to match what LoginPage sets
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'), // Corrected
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { data } = response.data;
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
      
      return data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { data } = response.data;
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
      
      toast.success('Registration successful!');
      return data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      return response.data.data.user;
    } catch (error: any) {
      return rejectWithValue('Failed to get user data');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  // --- FIX: Removed unused 'rejectWithValue' parameter ---
  async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      delete api.defaults.headers.common['Authorization'];
      
      toast.success('Logged out successfully');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;