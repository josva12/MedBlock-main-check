import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export interface Appointment {
  _id: string;
  patient: string;
  doctor: string;
  date: string;
  time: string;
  reason: string;
  status: string;
}

interface AppointmentsState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentsState = {
  appointments: [],
  loading: false,
  error: null,
};

export const fetchAppointments = createAsyncThunk(
  "appointments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/appointments");
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch appointments");
    }
  }
);

export const addAppointment = createAsyncThunk(
  "appointments/add",
  async (data: Partial<Appointment>, { rejectWithValue }) => {
    try {
      const res = await api.post("/appointments", data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to add appointment");
    }
  }
);

export const updateAppointment = createAsyncThunk(
  "appointments/update",
  async ({ id, data }: { id: string; data: Partial<Appointment> }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/appointments/${id}`, data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to update appointment");
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  "appointments/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/appointments/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete appointment");
    }
  }
);

const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addAppointment.fulfilled, (state, action) => {
        state.appointments.push(action.payload);
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        const idx = state.appointments.findIndex(a => a._id === action.payload._id);
        if (idx !== -1) state.appointments[idx] = action.payload;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.appointments = state.appointments.filter(a => a._id !== action.payload);
      });
  },
});

export default appointmentsSlice.reducer; 