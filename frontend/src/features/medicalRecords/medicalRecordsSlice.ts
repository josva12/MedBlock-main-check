import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import medicalRecordsService, { 
  MedicalRecord, 
  CreateMedicalRecordData, 
  UpdateMedicalRecordData,
  MedicalRecordsFilter,
  MedicalRecordStats
} from '../../services/medicalRecordsService';
import toast from 'react-hot-toast';

export interface MedicalRecordsState {
  records: MedicalRecord[];
  stats: MedicalRecordStats | null;
  isLoading: boolean;
  error: string | null;
  filters: MedicalRecordsFilter;
  selectedRecord: MedicalRecord | null;
}

const initialState: MedicalRecordsState = {
  records: [],
  stats: null,
  isLoading: false,
  error: null,
  filters: {
    page: 1,
    limit: 20
  },
  selectedRecord: null
};

// Async thunks
export const fetchMedicalRecords = createAsyncThunk(
  'medicalRecords/fetchAll',
  async (filters: MedicalRecordsFilter | undefined, { rejectWithValue }) => {
    try {
      const response = await medicalRecordsService.getMedicalRecords(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch medical records');
    }
  }
);

export const fetchMedicalRecordById = createAsyncThunk(
  'medicalRecords/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const record = await medicalRecordsService.getMedicalRecord(id);
      return record;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch medical record');
    }
  }
);

export const createMedicalRecord = createAsyncThunk(
  'medicalRecords/create',
  async (data: CreateMedicalRecordData, { rejectWithValue }) => {
    try {
      const record = await medicalRecordsService.createMedicalRecord(data);
      toast.success('Medical record created successfully');
      return record;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create medical record');
      return rejectWithValue(error.message || 'Failed to create medical record');
    }
  }
);

export const updateMedicalRecord = createAsyncThunk(
  'medicalRecords/update',
  async ({ id, data }: { id: string; data: UpdateMedicalRecordData }, { rejectWithValue }) => {
    try {
      const record = await medicalRecordsService.updateMedicalRecord(id, data);
      toast.success('Medical record updated successfully');
      return record;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update medical record');
      return rejectWithValue(error.message || 'Failed to update medical record');
    }
  }
);

export const deleteMedicalRecord = createAsyncThunk(
  'medicalRecords/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await medicalRecordsService.deleteMedicalRecord(id);
      toast.success('Medical record deleted successfully');
      return id;
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete medical record');
      return rejectWithValue(error.message || 'Failed to delete medical record');
    }
  }
);

export const fetchMedicalRecordsStats = createAsyncThunk(
  'medicalRecords/fetchStats',
  async (filters: MedicalRecordsFilter | undefined, { rejectWithValue }) => {
    try {
      const stats = await medicalRecordsService.getMedicalRecordsStats(filters);
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch medical records stats');
    }
  }
);

export const searchMedicalRecords = createAsyncThunk(
  'medicalRecords/search',
  async ({ query, filters }: { query: string; filters?: MedicalRecordsFilter }, { rejectWithValue }) => {
    try {
      const response = await medicalRecordsService.searchMedicalRecords(query, filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search medical records');
    }
  }
);

export const uploadAttachment = createAsyncThunk(
  'medicalRecords/uploadAttachment',
  async ({ recordId, file }: { recordId: string; file: File }, { rejectWithValue }) => {
    try {
      const attachment = await medicalRecordsService.uploadAttachment(recordId, file);
      toast.success('File uploaded successfully');
      return { recordId, attachment };
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file');
      return rejectWithValue(error.message || 'Failed to upload file');
    }
  }
);

export const deleteAttachment = createAsyncThunk(
  'medicalRecords/deleteAttachment',
  async ({ recordId, filename }: { recordId: string; filename: string }, { rejectWithValue }) => {
    try {
      await medicalRecordsService.deleteAttachment(recordId, filename);
      toast.success('Attachment deleted successfully');
      return { recordId, filename };
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete attachment');
      return rejectWithValue(error.message || 'Failed to delete attachment');
    }
  }
);

const medicalRecordsSlice = createSlice({
  name: 'medicalRecords',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<MedicalRecordsFilter>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedRecord: (state, action: PayloadAction<MedicalRecord | null>) => {
      state.selectedRecord = action.payload;
    },
    clearRecords: (state) => {
      state.records = [];
    },
    updateRecordInList: (state, action: PayloadAction<MedicalRecord>) => {
      const index = state.records.findIndex(record => record._id === action.payload._id);
      if (index !== -1) {
        state.records[index] = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch all records
    builder
      .addCase(fetchMedicalRecords.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMedicalRecords.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = action.payload.data;
      })
      .addCase(fetchMedicalRecords.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single record
    builder
      .addCase(fetchMedicalRecordById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMedicalRecordById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRecord = action.payload;
      })
      .addCase(fetchMedicalRecordById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create record
    builder
      .addCase(createMedicalRecord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMedicalRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records.unshift(action.payload);
      })
      .addCase(createMedicalRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update record
    builder
      .addCase(updateMedicalRecord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMedicalRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.records.findIndex(record => record._id === action.payload._id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
        if (state.selectedRecord?._id === action.payload._id) {
          state.selectedRecord = action.payload;
        }
      })
      .addCase(updateMedicalRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete record
    builder
      .addCase(deleteMedicalRecord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMedicalRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = state.records.filter(record => record._id !== action.payload);
        if (state.selectedRecord?._id === action.payload) {
          state.selectedRecord = null;
        }
      })
      .addCase(deleteMedicalRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchMedicalRecordsStats.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchMedicalRecordsStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchMedicalRecordsStats.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Search records
    builder
      .addCase(searchMedicalRecords.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchMedicalRecords.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = action.payload.data;
      })
      .addCase(searchMedicalRecords.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Upload attachment
    builder
      .addCase(uploadAttachment.fulfilled, (state, action) => {
        const { recordId, attachment } = action.payload;
        const record = state.records.find(r => r._id === recordId);
        if (record) {
          if (!record.attachments) {
            record.attachments = [];
          }
          record.attachments.push(attachment);
        }
        if (state.selectedRecord?._id === recordId) {
          if (!state.selectedRecord.attachments) {
            state.selectedRecord.attachments = [];
          }
          state.selectedRecord.attachments.push(attachment);
        }
      });

    // Delete attachment
    builder
      .addCase(deleteAttachment.fulfilled, (state, action) => {
        const { recordId, filename } = action.payload;
        const record = state.records.find(r => r._id === recordId);
        if (record?.attachments) {
          record.attachments = record.attachments.filter(att => att.filename !== filename);
        }
        if (state.selectedRecord?._id === recordId && state.selectedRecord.attachments) {
          state.selectedRecord.attachments = state.selectedRecord.attachments.filter(att => att.filename !== filename);
        }
      });
  }
});

export const { 
  clearError, 
  setFilters, 
  setSelectedRecord, 
  clearRecords, 
  updateRecordInList 
} = medicalRecordsSlice.actions;

export default medicalRecordsSlice.reducer; 