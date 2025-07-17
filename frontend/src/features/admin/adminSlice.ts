import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface AuditLog {
  _id: string;
  user: string;
  action: string;
  timestamp: string;
}

export interface Subscription {
  _id: string;
  plan: string;
  facility: string;
  user: string;
  status: string;
}

interface AdminState {
  users: AdminUser[];
  logs: AuditLog[];
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  logs: [],
  subscriptions: [],
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/users");
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch users");
    }
  }
);

export const updateUser = createAsyncThunk(
  "admin/updateUser",
  async ({ id, data }: { id: string; data: Partial<AdminUser> }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/users/${id}`, data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to update user");
    }
  }
);

export const fetchLogs = createAsyncThunk(
  "admin/fetchLogs",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/audit-logs");
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch logs");
    }
  }
);

export const fetchSubscriptions = createAsyncThunk(
  "admin/fetchSubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/subscriptions");
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch subscriptions");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex(u => u._id === action.payload._id);
        if (idx !== -1) state.users[idx] = action.payload;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.logs = action.payload;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.subscriptions = action.payload;
      });
  },
});

export default adminSlice.reducer; 