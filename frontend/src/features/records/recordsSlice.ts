import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export interface MedicalRecord {
  _id: string;
  patient: string;
  type: string;
  title: string;
  date: string;
}

interface RecordsState {
  records: MedicalRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: RecordsState = {
  records: [],
  loading: false,
  error: null,
};

export const fetchRecords = createAsyncThunk(
  "records/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/medical-records");
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch records");
    }
  }
);

export const addRecord = createAsyncThunk(
  "records/add",
  async (data: Partial<MedicalRecord>, { rejectWithValue }) => {
    try {
      const res = await api.post("/medical-records", data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to add record");
    }
  }
);

export const updateRecord = createAsyncThunk(
  "records/update",
  async ({ id, data }: { id: string; data: Partial<MedicalRecord> }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/medical-records/${id}`, data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to update record");
    }
  }
);

export const deleteRecord = createAsyncThunk(
  "records/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/medical-records/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete record");
    }
  }
);

const recordsSlice = createSlice({
  name: "records",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addRecord.fulfilled, (state, action) => {
        state.records.push(action.payload);
      })
      .addCase(updateRecord.fulfilled, (state, action) => {
        const idx = state.records.findIndex(r => r._id === action.payload._id);
        if (idx !== -1) state.records[idx] = action.payload;
      })
      .addCase(deleteRecord.fulfilled, (state, action) => {
        state.records = state.records.filter(r => r._id !== action.payload);
      });
  },
});

export default recordsSlice.reducer; 