import api from './api';

export interface VitalSign {
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
  temperature?: {
    value: number;
    unit: string;
  };
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: {
    value: number;
    unit: string;
  };
  height?: {
    value: number;
    unit: string;
  };
  bmi?: number;
  painLevel?: number;
  bloodGlucose?: {
    value: number;
    unit: string;
  };
  status: 'draft' | 'final' | 'amended';
  notes?: string;
  recordedBy: string;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVitalSignData {
  patient: string;
  temperature?: {
    value: number;
    unit: string;
  };
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: {
    value: number;
    unit: string;
  };
  height?: {
    value: number;
    unit: string;
  };
  painLevel?: number;
  bloodGlucose?: {
    value: number;
    unit: string;
  };
  status: 'draft' | 'final';
  notes?: string;
}

export interface UpdateVitalSignData {
  patient?: string;
  temperature?: {
    value: number;
    unit: string;
  };
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: {
    value: number;
    unit: string;
  };
  height?: {
    value: number;
    unit: string;
  };
  painLevel?: number;
  bloodGlucose?: {
    value: number;
    unit: string;
  };
  status?: 'draft' | 'final' | 'amended';
  notes?: string;
}

export interface VitalSignsFilter {
  patientId?: string;
  status?: 'draft' | 'final' | 'amended';
  startDate?: string;
  endDate?: string;
  recordedBy?: string;
  page?: number;
  limit?: number;
}

export interface VitalSignsResponse {
  success: boolean;
  data: VitalSign[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  message?: string;
}

export interface VitalSignTrends {
  temperature: Array<{ date: string; value: number; unit: string }>;
  bloodPressure: Array<{ date: string; systolic: number; diastolic: number }>;
  heartRate: Array<{ date: string; value: number }>;
  weight: Array<{ date: string; value: number; unit: string }>;
  bmi: Array<{ date: string; value: number }>;
}

class VitalSignsService {
  /**
   * Get all vital signs with optional filtering
   */
  async getVitalSigns(filter?: VitalSignsFilter): Promise<VitalSignsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filter?.patientId) params.append('patientId', filter.patientId);
      if (filter?.status) params.append('status', filter.status);
      if (filter?.startDate) params.append('startDate', filter.startDate);
      if (filter?.endDate) params.append('endDate', filter.endDate);
      if (filter?.recordedBy) params.append('recordedBy', filter.recordedBy);
      if (filter?.page) params.append('page', filter.page.toString());
      if (filter?.limit) params.append('limit', filter.limit.toString());

      const response = await api.get(`/vital-signs?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch vital signs:', error);
      throw new Error('Failed to fetch vital signs');
    }
  }

  /**
   * Get a single vital sign by ID
   */
  async getVitalSign(id: string): Promise<VitalSign> {
    try {
      const response = await api.get(`/vital-signs/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch vital sign:', error);
      throw new Error('Failed to fetch vital sign');
    }
  }

  /**
   * Create a new vital sign record
   */
  async createVitalSign(data: CreateVitalSignData): Promise<VitalSign> {
    try {
      const response = await api.post('/vital-signs', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to create vital sign:', error);
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      throw new Error('Failed to create vital sign');
    }
  }

  /**
   * Update an existing vital sign record
   */
  async updateVitalSign(id: string, data: UpdateVitalSignData): Promise<VitalSign> {
    try {
      const response = await api.put(`/vital-signs/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to update vital sign:', error);
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      throw new Error('Failed to update vital sign');
    }
  }

  /**
   * Delete a vital sign record
   */
  async deleteVitalSign(id: string): Promise<void> {
    try {
      await api.delete(`/vital-signs/${id}`);
    } catch (error) {
      console.error('Failed to delete vital sign:', error);
      throw new Error('Failed to delete vital sign');
    }
  }

  /**
   * Get vital signs for a specific patient
   */
  async getPatientVitalSigns(patientId: string, filter?: Omit<VitalSignsFilter, 'patientId'>): Promise<VitalSignsResponse> {
    return this.getVitalSigns({ ...filter, patientId });
  }

  /**
   * Get vital signs trends for a patient
   */
  async getVitalSignTrends(patientId: string, startDate?: string, endDate?: string): Promise<VitalSignTrends> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/vital-signs/${patientId}/trends?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch vital sign trends:', error);
      throw new Error('Failed to fetch vital sign trends');
    }
  }

  /**
   * Get vital signs summary for a patient
   */
  async getPatientVitalSignsSummary(patientId: string): Promise<{
    latest: VitalSign;
    trends: VitalSignTrends;
    count: number;
  }> {
    try {
      const response = await api.get(`/vital-signs/${patientId}/summary`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch vital signs summary:', error);
      throw new Error('Failed to fetch vital signs summary');
    }
  }

  /**
   * Calculate BMI from weight and height
   */
  calculateBMI(weightKg: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }

  /**
   * Get BMI category
   */
  getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  /**
   * Get blood pressure category
   */
  getBloodPressureCategory(systolic: number, diastolic: number): string {
    if (systolic < 120 && diastolic < 80) return 'Normal';
    if (systolic < 130 && diastolic < 80) return 'Elevated';
    if (systolic < 140 || diastolic < 90) return 'High Blood Pressure (Stage 1)';
    if (systolic >= 140 || diastolic >= 90) return 'High Blood Pressure (Stage 2)';
    if (systolic > 180 || diastolic > 120) return 'Hypertensive Crisis';
    return 'Unknown';
  }

  /**
   * Get heart rate category
   */
  getHeartRateCategory(heartRate: number, age?: number): string {
    if (age && age < 18) {
      // Pediatric heart rate ranges
      if (heartRate < 60) return 'Bradycardia';
      if (heartRate > 100) return 'Tachycardia';
      return 'Normal';
    } else {
      // Adult heart rate ranges
      if (heartRate < 60) return 'Bradycardia';
      if (heartRate > 100) return 'Tachycardia';
      return 'Normal';
    }
  }

  /**
   * Get temperature category
   */
  getTemperatureCategory(temperature: number, unit: string = 'C'): string {
    let tempC = temperature;
    if (unit === 'F') {
      tempC = (temperature - 32) * 5/9;
    }
    
    if (tempC < 35) return 'Hypothermia';
    if (tempC < 36) return 'Low';
    if (tempC <= 37.5) return 'Normal';
    if (tempC <= 38) return 'Elevated';
    if (tempC <= 39) return 'Fever';
    return 'High Fever';
  }

  /**
   * Validate vital sign data
   */
  validateVitalSignData(data: CreateVitalSignData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.patient) {
      errors.push('Patient ID is required');
    }

    if (data.temperature) {
      if (data.temperature.value < 20 || data.temperature.value > 50) {
        errors.push('Temperature value is out of range (20-50°C)');
      }
    }

    if (data.bloodPressure) {
      if (data.bloodPressure.systolic < 50 || data.bloodPressure.systolic > 300) {
        errors.push('Systolic blood pressure is out of range (50-300 mmHg)');
      }
      if (data.bloodPressure.diastolic < 30 || data.bloodPressure.diastolic > 200) {
        errors.push('Diastolic blood pressure is out of range (30-200 mmHg)');
      }
    }

    if (data.heartRate) {
      if (data.heartRate < 30 || data.heartRate > 300) {
        errors.push('Heart rate is out of range (30-300 bpm)');
      }
    }

    if (data.respiratoryRate) {
      if (data.respiratoryRate < 8 || data.respiratoryRate > 60) {
        errors.push('Respiratory rate is out of range (8-60 breaths/min)');
      }
    }

    if (data.oxygenSaturation) {
      if (data.oxygenSaturation < 70 || data.oxygenSaturation > 100) {
        errors.push('Oxygen saturation is out of range (70-100%)');
      }
    }

    if (data.weight) {
      if (data.weight.value < 0.5 || data.weight.value > 500) {
        errors.push('Weight is out of range (0.5-500 kg)');
      }
    }

    if (data.height) {
      if (data.height.value < 30 || data.height.value > 300) {
        errors.push('Height is out of range (30-300 cm)');
      }
    }

    if (data.painLevel !== undefined) {
      if (data.painLevel < 0 || data.painLevel > 10) {
        errors.push('Pain level is out of range (0-10)');
      }
    }

    if (data.bloodGlucose) {
      if (data.bloodGlucose.value < 20 || data.bloodGlucose.value > 1000) {
        errors.push('Blood glucose is out of range (20-1000 mg/dL)');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Export vital signs to CSV
   */
  async exportVitalSigns(filter?: VitalSignsFilter): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filter?.patientId) params.append('patientId', filter.patientId);
      if (filter?.status) params.append('status', filter.status);
      if (filter?.startDate) params.append('startDate', filter.startDate);
      if (filter?.endDate) params.append('endDate', filter.endDate);
      if (filter?.recordedBy) params.append('recordedBy', filter.recordedBy);

      const response = await api.get(`/vital-signs/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to export vital signs:', error);
      throw new Error('Failed to export vital signs');
    }
  }

  /**
   * Get vital signs statistics
   */
  async getVitalSignsStats(filter?: VitalSignsFilter): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byMonth: Record<string, number>;
    averageValues: {
      temperature?: number;
      heartRate?: number;
      systolic?: number;
      diastolic?: number;
      weight?: number;
      bmi?: number;
    };
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filter?.patientId) params.append('patientId', filter.patientId);
      if (filter?.startDate) params.append('startDate', filter.startDate);
      if (filter?.endDate) params.append('endDate', filter.endDate);

      const response = await api.get(`/vital-signs/stats?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch vital signs statistics:', error);
      throw new Error('Failed to fetch vital signs statistics');
    }
  }
}

export default new VitalSignsService(); 