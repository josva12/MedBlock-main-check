import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export interface Report {
  _id: string;
  patient: string;
  type: string;
  description: string;
  date: string;
}

interface ReportsState {
  reports: Report[];
  loading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  reports: [],
  loading: false,
  error: null,
};

export const fetchReports = createAsyncThunk(
  "reports/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/reports");
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch reports");
    }
  }
);

export const addReport = createAsyncThunk(
  "reports/add",
  async (data: Partial<Report>, { rejectWithValue }) => {
    try {
      const res = await api.post("/reports", data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to add report");
    }
  }
);

export const deleteReport = createAsyncThunk(
  "reports/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/reports/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete report");
    }
  }
);

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addReport.fulfilled, (state, action) => {
        state.reports.push(action.payload);
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.reports = state.reports.filter(r => r._id !== action.payload);
      });
  },
});

export default reportsSlice.reducer; 