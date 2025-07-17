import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export interface Vital {
  _id: string;
  patient: string;
  temperature: number;
  bloodPressure: string;
  heartRate: number;
  date: string;
}

interface VitalsState {
  vitals: Vital[];
  loading: boolean;
  error: string | null;
}

const initialState: VitalsState = {
  vitals: [],
  loading: false,
  error: null,
};

export const fetchVitals = createAsyncThunk(
  "vitals/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/vital-signs");
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch vitals");
    }
  }
);

export const addVital = createAsyncThunk(
  "vitals/add",
  async (data: Partial<Vital>, { rejectWithValue }) => {
    try {
      const res = await api.post("/vital-signs", data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to add vital");
    }
  }
);

export const updateVital = createAsyncThunk(
  "vitals/update",
  async ({ id, data }: { id: string; data: Partial<Vital> }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/vital-signs/${id}`, data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to update vital");
    }
  }
);

export const deleteVital = createAsyncThunk(
  "vitals/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/vital-signs/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete vital");
    }
  }
);

const vitalsSlice = createSlice({
  name: "vitals",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVitals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVitals.fulfilled, (state, action) => {
        state.loading = false;
        state.vitals = action.payload;
      })
      .addCase(fetchVitals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addVital.fulfilled, (state, action) => {
        state.vitals.push(action.payload);
      })
      .addCase(updateVital.fulfilled, (state, action) => {
        const idx = state.vitals.findIndex(v => v._id === action.payload._id);
        if (idx !== -1) state.vitals[idx] = action.payload;
      })
      .addCase(deleteVital.fulfilled, (state, action) => {
        state.vitals = state.vitals.filter(v => v._id !== action.payload);
      });
  },
});

export default vitalsSlice.reducer; 