import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export interface BlockchainLog {
  _id: string;
  blockNumber: number;
  hash: string;
  record: string;
  timestamp: string;
  status: string;
}

interface BlockchainState {
  logs: BlockchainLog[];
  loading: boolean;
  error: string | null;
}

const initialState: BlockchainState = {
  logs: [],
  loading: false,
  error: null,
};

export const fetchBlockchainLogs = createAsyncThunk(
  "blockchain/fetchLogs",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/medical-records/blockchain/status");
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch blockchain logs");
    }
  }
);

const blockchainSlice = createSlice({
  name: "blockchain",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlockchainLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlockchainLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchBlockchainLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default blockchainSlice.reducer; 