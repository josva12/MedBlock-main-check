import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Define the theme type
export type Theme = 'light' | 'dark' | 'system';

export const updateThemePreference = createAsyncThunk(
  'ui/updateThemePreference',
  async (darkMode: boolean, { rejectWithValue }) => {
    try {
      const response = await api.patch('/users/me/preferences', { darkMode });
      return response.data.data.darkMode;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update theme');
    }
  }
);

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: Theme; // <-- Add theme to state
  loading: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>;
}

const initialState: UIState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: (localStorage.getItem('theme') as Theme) || 'system', // <-- Initialize theme from localStorage
  loading: false,
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // --- NEW ---
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      // Also save to localStorage to persist across page reloads
      localStorage.setItem('theme', action.payload);
    },
    // --- END NEW ---
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id'>>) => {
      const id = Date.now().toString();
      state.notifications.push({ ...action.payload, id });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
  },
  // --- NEW ---
  extraReducers: (builder) => {
    builder
      .addCase(updateThemePreference.fulfilled, (state, action: PayloadAction<boolean>) => {
        const newTheme = action.payload ? 'dark' : 'light';
        state.theme = newTheme;
        localStorage.setItem('theme', newTheme);
      });
  },
  // --- END NEW ---
});

export const { setTheme, toggleSidebar, setSidebarOpen, setLoading, addNotification, removeNotification } = uiSlice.actions; // Add setTheme
export default uiSlice.reducer; 