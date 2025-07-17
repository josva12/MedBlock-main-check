import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Types
export interface Appointment {
  _id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentsState {
  appointments: Appointment[];
  currentAppointment: Appointment | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AppointmentsState = {
  appointments: [],
  currentAppointment: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/appointments');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch appointments';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch appointment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/create',
  async (appointmentData: Omit<Appointment, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      toast.success('Appointment created successfully');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create appointment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/update',
  async ({ id, data }: { id: string; data: Partial<Appointment> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/appointments/${id}`, data);
      toast.success('Appointment updated successfully');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update appointment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  'appointments/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/appointments/${id}`);
      toast.success('Appointment deleted successfully');
      return id;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete appointment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Slice
const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentAppointment: (state, action: PayloadAction<Appointment | null>) => {
      state.currentAppointment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch by ID
      .addCase(fetchAppointmentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAppointment = action.payload;
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create
      .addCase(createAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments.push(action.payload);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update
      .addCase(updateAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.appointments.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        if (state.currentAppointment?._id === action.payload._id) {
          state.currentAppointment = action.payload;
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete
      .addCase(deleteAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = state.appointments.filter(a => a._id !== action.payload);
        if (state.currentAppointment?._id === action.payload) {
          state.currentAppointment = null;
        }
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentAppointment } = appointmentsSlice.actions;
export default appointmentsSlice.reducer; 