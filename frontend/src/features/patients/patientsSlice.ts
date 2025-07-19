import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Types
export interface Patient {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: {
    street: string;
    city: string;
    county: string;
    subCounty: string;
    postalCode?: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  bloodType?: string;
  allergies?: string[];
  medicalHistory?: string;
  insurance?: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PatientsState {
  patients: Patient[];
  currentPatient: Patient | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PatientsState = {
  patients: [],
  currentPatient: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchPatients = createAsyncThunk(
  'patients/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/patients');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch patients';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchPatientById = createAsyncThunk(
  'patients/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/patients/${id}`);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch patient';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createPatient = createAsyncThunk(
  'patients/create',
  async (patientData: Omit<Patient, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/patients', patientData);
      toast.success('Patient created successfully');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create patient';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updatePatient = createAsyncThunk(
  'patients/update',
  async ({ id, data }: { id: string; data: Partial<Patient> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/patients/${id}`, data);
      toast.success('Patient updated successfully');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update patient';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deletePatient = createAsyncThunk(
  'patients/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/patients/${id}`);
      toast.success('Patient deleted successfully');
      return id;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete patient';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Slice
const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPatient: (state, action: PayloadAction<Patient | null>) => {
      state.currentPatient = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all patients
      .addCase(fetchPatients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.patients = [];
      })
      
      // Fetch by ID
      .addCase(fetchPatientById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPatient = action.payload;
      })
      .addCase(fetchPatientById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create
      .addCase(createPatient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patients.push(action.payload);
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update
      .addCase(updatePatient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.patients.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.patients[index] = action.payload;
        }
        if (state.currentPatient?._id === action.payload._id) {
          state.currentPatient = action.payload;
        }
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete
      .addCase(deletePatient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patients = state.patients.filter(p => p._id !== action.payload);
        if (state.currentPatient?._id === action.payload) {
          state.currentPatient = null;
        }
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentPatient } = patientsSlice.actions;
export default patientsSlice.reducer; 