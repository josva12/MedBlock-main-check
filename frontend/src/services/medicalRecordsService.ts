import api from './api';

export interface MedicalRecord {
  _id: string;
  patient: {
    _id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    dateOfBirth: string;
    gender: string;
  };
  patientId?: string;
  patientName?: string;
  recordType: 'consultation' | 'lab_result' | 'imaging' | 'prescription' | 'vaccination' | 'surgery' | 'emergency' | 'other';
  title: string;
  description?: string;
  content: string;
  attachments?: Array<{
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedAt: string;
  }>;
  status: 'draft' | 'final' | 'amended' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  metadata?: Record<string, any>;
  createdBy: {
    _id: string;
    fullName: string;
    role: string;
  };
  updatedBy?: {
    _id: string;
    fullName: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  recordedAt: string;
}

export interface CreateMedicalRecordData {
  patient: string;
  recordType: 'consultation' | 'lab_result' | 'imaging' | 'prescription' | 'vaccination' | 'surgery' | 'emergency' | 'other';
  title: string;
  description?: string;
  content: string;
  status?: 'draft' | 'final';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  metadata?: Record<string, any>;
  recordedAt?: string;
}

export interface UpdateMedicalRecordData extends Partial<CreateMedicalRecordData> {
  status?: 'draft' | 'final' | 'amended' | 'archived';
}

export interface MedicalRecordsFilter {
  patientId?: string;
  recordType?: string;
  status?: string;
  priority?: string;
  createdBy?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MedicalRecordsResponse {
  success: boolean;
  data: MedicalRecord[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  message?: string;
}

export interface MedicalRecordStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byMonth: Record<string, number>;
  recentActivity: Array<{
    recordId: string;
    action: string;
    timestamp: string;
    user: string;
  }>;
}

class MedicalRecordsService {
  /**
   * Get all medical records with optional filtering
   */
  async getMedicalRecords(filter?: MedicalRecordsFilter): Promise<MedicalRecordsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filter?.patientId) params.append('patientId', filter.patientId);
      if (filter?.recordType) params.append('recordType', filter.recordType);
      if (filter?.status) params.append('status', filter.status);
      if (filter?.priority) params.append('priority', filter.priority);
      if (filter?.createdBy) params.append('createdBy', filter.createdBy);
      if (filter?.startDate) params.append('startDate', filter.startDate);
      if (filter?.endDate) params.append('endDate', filter.endDate);
      if (filter?.tags) params.append('tags', filter.tags.join(','));
      if (filter?.search) params.append('search', filter.search);
      if (filter?.page) params.append('page', filter.page.toString());
      if (filter?.limit) params.append('limit', filter.limit.toString());
      if (filter?.sortBy) params.append('sortBy', filter.sortBy);
      if (filter?.sortOrder) params.append('sortOrder', filter.sortOrder);

      const response = await api.get(`/medical-records?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch medical records:', error);
      throw new Error('Failed to fetch medical records');
    }
  }

  /**
   * Get a single medical record by ID
   */
  async getMedicalRecord(id: string): Promise<MedicalRecord> {
    try {
      const response = await api.get(`/medical-records/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch medical record:', error);
      throw new Error('Failed to fetch medical record');
    }
  }

  /**
   * Create a new medical record
   */
  async createMedicalRecord(data: CreateMedicalRecordData): Promise<MedicalRecord> {
    try {
      const response = await api.post('/medical-records', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to create medical record:', error);
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      throw new Error('Failed to create medical record');
    }
  }

  /**
   * Update an existing medical record
   */
  async updateMedicalRecord(id: string, data: UpdateMedicalRecordData): Promise<MedicalRecord> {
    try {
      const response = await api.put(`/medical-records/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to update medical record:', error);
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      throw new Error('Failed to update medical record');
    }
  }

  /**
   * Delete a medical record
   */
  async deleteMedicalRecord(id: string): Promise<void> {
    try {
      await api.delete(`/medical-records/${id}`);
    } catch (error) {
      console.error('Failed to delete medical record:', error);
      throw new Error('Failed to delete medical record');
    }
  }

  /**
   * Get medical records for a specific patient
   */
  async getPatientMedicalRecords(patientId: string, filter?: Omit<MedicalRecordsFilter, 'patientId'>): Promise<MedicalRecordsResponse> {
    return this.getMedicalRecords({ ...filter, patientId });
  }

  /**
   * Upload file attachment to a medical record
   */
  async uploadAttachment(recordId: string, file: File): Promise<{
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedAt: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/medical-records/${recordId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to upload attachment:', error);
      throw new Error('Failed to upload attachment');
    }
  }

  /**
   * Delete file attachment from a medical record
   */
  async deleteAttachment(recordId: string, filename: string): Promise<void> {
    try {
      await api.delete(`/medical-records/${recordId}/attachments/${filename}`);
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      throw new Error('Failed to delete attachment');
    }
  }

  /**
   * Get medical records statistics
   */
  async getMedicalRecordsStats(filter?: MedicalRecordsFilter): Promise<MedicalRecordStats> {
    try {
      const params = new URLSearchParams();
      
      if (filter?.patientId) params.append('patientId', filter.patientId);
      if (filter?.startDate) params.append('startDate', filter.startDate);
      if (filter?.endDate) params.append('endDate', filter.endDate);

      const response = await api.get(`/medical-records/stats?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch medical records stats:', error);
      throw new Error('Failed to fetch medical records stats');
    }
  }

  /**
   * Search medical records
   */
  async searchMedicalRecords(query: string, filter?: MedicalRecordsFilter): Promise<MedicalRecordsResponse> {
    return this.getMedicalRecords({ ...filter, search: query });
  }

  /**
   * Get medical records by type
   */
  async getMedicalRecordsByType(recordType: string, filter?: Omit<MedicalRecordsFilter, 'recordType'>): Promise<MedicalRecordsResponse> {
    return this.getMedicalRecords({ ...filter, recordType });
  }

  /**
   * Export medical records to CSV
   */
  async exportMedicalRecords(filter?: MedicalRecordsFilter): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filter?.patientId) params.append('patientId', filter.patientId);
      if (filter?.recordType) params.append('recordType', filter.recordType);
      if (filter?.status) params.append('status', filter.status);
      if (filter?.startDate) params.append('startDate', filter.startDate);
      if (filter?.endDate) params.append('endDate', filter.endDate);

      const response = await api.get(`/medical-records/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to export medical records:', error);
      throw new Error('Failed to export medical records');
    }
  }

  /**
   * Get medical record templates
   */
  async getMedicalRecordTemplates(): Promise<Array<{
    id: string;
    name: string;
    recordType: string;
    content: string;
    fields: Array<{
      name: string;
      type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox';
      label: string;
      required: boolean;
      options?: string[];
    }>;
  }>> {
    try {
      const response = await api.get('/medical-records/templates');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch medical record templates:', error);
      throw new Error('Failed to fetch medical record templates');
    }
  }

  /**
   * Create medical record from template
   */
  async createFromTemplate(templateId: string, data: CreateMedicalRecordData): Promise<MedicalRecord> {
    try {
      const response = await api.post(`/medical-records/templates/${templateId}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to create medical record from template:', error);
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      throw new Error('Failed to create medical record from template');
    }
  }

  /**
   * Share medical record with another user
   */
  async shareMedicalRecord(recordId: string, userId: string, permissions: string[]): Promise<void> {
    try {
      await api.post(`/medical-records/${recordId}/share`, {
        userId,
        permissions
      });
    } catch (error) {
      console.error('Failed to share medical record:', error);
      throw new Error('Failed to share medical record');
    }
  }

  /**
   * Get shared medical records
   */
  async getSharedMedicalRecords(): Promise<MedicalRecordsResponse> {
    try {
      const response = await api.get('/medical-records/shared');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch shared medical records:', error);
      throw new Error('Failed to fetch shared medical records');
    }
  }

  /**
   * Get medical record history/audit trail
   */
  async getMedicalRecordHistory(recordId: string): Promise<Array<{
    id: string;
    action: string;
    timestamp: string;
    user: {
      _id: string;
      fullName: string;
      role: string;
    };
    changes?: Record<string, any>;
  }>> {
    try {
      const response = await api.get(`/medical-records/${recordId}/history`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch medical record history:', error);
      throw new Error('Failed to fetch medical record history');
    }
  }

  /**
   * Validate medical record data
   */
  validateMedicalRecordData(data: CreateMedicalRecordData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.patient) {
      errors.push('Patient ID is required');
    }

    if (!data.recordType) {
      errors.push('Record type is required');
    }

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!data.content || data.content.trim().length === 0) {
      errors.push('Content is required');
    }

    if (data.title && data.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    if (data.content && data.content.length > 10000) {
      errors.push('Content must be less than 10,000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get medical record types
   */
  getMedicalRecordTypes(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'consultation', label: 'Consultation', description: 'Doctor consultation notes' },
      { value: 'lab_result', label: 'Lab Result', description: 'Laboratory test results' },
      { value: 'imaging', label: 'Imaging', description: 'X-ray, MRI, CT scan results' },
      { value: 'prescription', label: 'Prescription', description: 'Medication prescriptions' },
      { value: 'vaccination', label: 'Vaccination', description: 'Vaccination records' },
      { value: 'surgery', label: 'Surgery', description: 'Surgical procedure records' },
      { value: 'emergency', label: 'Emergency', description: 'Emergency room records' },
      { value: 'other', label: 'Other', description: 'Other medical records' }
    ];
  }

  /**
   * Get priority levels
   */
  getPriorityLevels(): Array<{ value: string; label: string; color: string }> {
    return [
      { value: 'low', label: 'Low', color: 'green' },
      { value: 'medium', label: 'Medium', color: 'yellow' },
      { value: 'high', label: 'High', color: 'orange' },
      { value: 'urgent', label: 'Urgent', color: 'red' }
    ];
  }

  /**
   * Get status options
   */
  getStatusOptions(): Array<{ value: string; label: string; color: string }> {
    return [
      { value: 'draft', label: 'Draft', color: 'gray' },
      { value: 'final', label: 'Final', color: 'green' },
      { value: 'amended', label: 'Amended', color: 'blue' },
      { value: 'archived', label: 'Archived', color: 'purple' }
    ];
  }
}

export default new MedicalRecordsService(); 