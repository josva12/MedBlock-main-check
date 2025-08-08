import api from './api';

export interface MFAResponse {
  success: boolean;
  message: string;
  data?: {
    sessionId: string;
    expiresAt: string;
    purpose: string;
    requiresMFA?: boolean;
  };
}

export interface MFAVerificationRequest {
  sessionId: string;
  code: string;
}

export interface MFAVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    refreshToken: string;
    user: {
      _id: string;
      fullName: string;
      email: string;
      role: string;
      title: string;
      isGovernmentVerified: boolean;
      professionalVerification: any;
    };
  };
}

export interface MFAStatus {
  sessionId: string;
  isExpired: boolean;
  isUsed: boolean;
  attempts: number;
  maxAttempts: number;
  expiresAt: string;
  purpose: string;
}

export interface MFAGenerateRequest {
  email: string;
  purpose: 'login' | 'password_reset' | 'account_verification' | 'settings_change';
}

export interface MFASettings {
  enabled: boolean;
  method: 'email' | 'sms' | 'totp';
  lastVerified?: string;
}

class MFAService {
  /**
   * Generate and send MFA code to user's email
   */
  async generateCode(data: MFAGenerateRequest): Promise<MFAResponse> {
    try {
      const response = await api.post('/mfa/generate', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate MFA code');
    }
  }

  /**
   * Verify MFA code and complete authentication
   */
  async verifyCode(data: MFAVerificationRequest): Promise<MFAVerificationResponse> {
    try {
      const response = await api.post('/mfa/verify', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to verify MFA code');
    }
  }

  /**
   * Resend MFA code to user's email
   */
  async resendCode(data: MFAGenerateRequest): Promise<MFAResponse> {
    try {
      const response = await api.post('/mfa/resend', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to resend MFA code');
    }
  }

  /**
   * Check MFA session status
   */
  async getStatus(sessionId: string): Promise<MFAStatus> {
    try {
      const response = await api.get(`/mfa/status/${sessionId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get MFA status');
    }
  }

  /**
   * Invalidate MFA session (for logout or security)
   */
  async invalidateSession(sessionId: string): Promise<void> {
    try {
      await api.delete('/mfa/invalidate', { data: { sessionId } });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to invalidate MFA session');
    }
  }

  /**
   * Generate MFA code for login (convenience method)
   */
  async generateLoginCode(email: string): Promise<MFAResponse> {
    return this.generateCode({
      email,
      purpose: 'login'
    });
  }

  /**
   * Generate MFA code for password reset (convenience method)
   */
  async generatePasswordResetCode(email: string): Promise<MFAResponse> {
    return this.generateCode({
      email,
      purpose: 'password_reset'
    });
  }

  /**
   * Generate MFA code for account verification (convenience method)
   */
  async generateAccountVerificationCode(email: string): Promise<MFAResponse> {
    return this.generateCode({
      email,
      purpose: 'account_verification'
    });
  }

  /**
   * Generate MFA code for settings change (convenience method)
   */
  async generateSettingsChangeCode(email: string): Promise<MFAResponse> {
    return this.generateCode({
      email,
      purpose: 'settings_change'
    });
  }

  /**
   * Get current user's MFA settings
   */
  async getMFASettings(): Promise<MFASettings> {
    const response = await api.get('/users/me');
    return response.data.data.mfa;
  }

  /**
   * Update current user's MFA settings (enable/disable)
   */
  async updateMFASettings(enabled: boolean): Promise<MFASettings> {
    const response = await api.patch('/users/me/mfa', { enabled });
    return response.data.mfa;
  }

  /**
   * Validate MFA code format (client-side validation)
   */
  validateCodeFormat(code: string): boolean {
    return /^\d{6}$/.test(code);
  }

  /**
   * Check if MFA session is expired
   */
  isSessionExpired(expiresAt: string): boolean {
    return new Date() > new Date(expiresAt);
  }

  /**
   * Get remaining time for MFA session
   */
  getRemainingTime(expiresAt: string): number {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    return Math.max(0, expiry - now);
  }

  /**
   * Format remaining time as MM:SS
   */
  formatRemainingTime(expiresAt: string): string {
    const remaining = this.getRemainingTime(expiresAt);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

export default new MFAService(); 