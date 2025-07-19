import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import toast from "react-hot-toast";

// Types
export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  role: 'doctor' | 'nurse' | 'admin' | 'front-desk' | 'pharmacy';
  title: string;
  specialization?: string;
  department?: string;
  phone: string;
  address: {
    street: string;
    city: string;
    county: string;
    subCounty: string;
    postalCode?: string;
    country: string;
  };
  isActive: boolean;
  isVerified: boolean;
  isGovernmentVerified: boolean;
  professionalVerification: {
    status: 'unsubmitted' | 'pending' | 'verified' | 'rejected';
    licensingBody?: string;
    submittedLicenseNumber?: string;
    submissionDate?: string;
    verificationDate?: string;
    verifiedBy?: string;
    rejectionReason?: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  userId: string;
  action: string;
  resource: string;
  details: any;
  ip: string;
  userAgent: string;
  timestamp: string;
}

export interface ReportData {
  medicalRecordTrends: any[];
  appointmentUtilization: any[];
  patientDemographics: {
    gender: any[];
    ageGroups: any[];
    county: any[];
  };
}

export interface ProfessionalVerificationData {
  status: 'verified' | 'rejected' | 'pending' | 'unsubmitted';
  rejectionReason?: string;
  notes?: string;
  submittedLicenseNumber?: string;
  licensingBody?: string;
}

interface AdminState {
  users: AdminUser[];
  auditLogs: AuditLog[];
  reports: ReportData | null;
  loading: boolean;
  error: string | null;
  selectedUser: AdminUser | null;
}

const initialState: AdminState = {
  users: [],
  auditLogs: [],
  reports: null,
  loading: false,
  error: null,
  selectedUser: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/users");
      return res.data.data;
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to fetch users";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchAdmins = createAsyncThunk(
  "admin/fetchAdmins",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/admins");
      return res.data.data;
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to fetch admins";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateUser = createAsyncThunk(
  "admin/updateUser",
  async ({ id, data }: { id: string; data: Partial<AdminUser> }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/users/${id}`, data);
      toast.success("User updated successfully");
      return res.data.data;
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to update user";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User deleted successfully");
      return id;
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to delete user";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const verifyProfessional = createAsyncThunk(
  "admin/verifyProfessional",
  async ({ id, data }: { id: string; data: ProfessionalVerificationData }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/admin/users/${id}/verify-professional`, data);
      toast.success("Professional verification updated successfully");
      return res.data.data.user;
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to verify professional";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchAuditLogs = createAsyncThunk(
  "admin/fetchAuditLogs",
  async (params: { userId?: string; action?: string; startDate?: string; endDate?: string; page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/audit-logs", { params });
      return res.data.data;
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to fetch audit logs";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchReports = createAsyncThunk(
  "admin/fetchReports",
  async (_, { rejectWithValue }) => {
    try {
      const [trendsRes, utilizationRes, demographicsRes] = await Promise.all([
        api.get("/reports/medical-record-trends"),
        api.get("/reports/appointment-utilization"),
        api.get("/reports/patient-demographics")
      ]);

      return {
        medicalRecordTrends: trendsRes.data.data,
        appointmentUtilization: utilizationRes.data.data,
        patientDemographics: demographicsRes.data.data
      };
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to fetch reports";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
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
      
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex(u => u._id === action.payload._id);
        if (idx !== -1) {
          state.users[idx] = action.payload;
        }
      })
      
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u._id !== action.payload);
      })
      
      // Verify Professional
      .addCase(verifyProfessional.fulfilled, (state, action) => {
        const idx = state.users.findIndex(u => u._id === action.payload._id);
        if (idx !== -1) {
          state.users[idx] = action.payload;
        }
      })
      
      // Fetch Audit Logs
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.auditLogs = action.payload;
      })
      
      // Fetch Reports
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.reports = action.payload;
      });
  },
});

export const { clearError, setSelectedUser, clearSelectedUser } = adminSlice.actions;
export default adminSlice.reducer; 