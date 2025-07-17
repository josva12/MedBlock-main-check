import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address?: any;
}

interface PatientsState {
  patients: Patient[];
  loading: boolean;
  error: string | null;
}

const initialState: PatientsState = {
  patients: [],
  loading: false,
  error: null,
};

export const fetchPatients = createAsyncThunk(
  "patients/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/patients");
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch patients");
    }
  }
);

export const addPatient = createAsyncThunk(
  "patients/add",
  async (data: Partial<Patient>, { rejectWithValue }) => {
    try {
      const res = await api.post("/patients", data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to add patient");
    }
  }
);

export const updatePatient = createAsyncThunk(
  "patients/update",
  async ({ id, data }: { id: string; data: Partial<Patient> }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/patients/${id}`, data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to update patient");
    }
  }
);

export const deletePatient = createAsyncThunk(
  "patients/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/patients/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete patient");
    }
  }
);

const patientsSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addPatient.fulfilled, (state, action) => {
        state.patients.push(action.payload);
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        const idx = state.patients.findIndex(p => p._id === action.payload._id);
        if (idx !== -1) state.patients[idx] = action.payload;
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.patients = state.patients.filter(p => p._id !== action.payload);
      });
  },
});

export default patientsSlice.reducer; 