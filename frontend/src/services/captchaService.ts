import api from './api';

export interface CaptchaResponse {
  sessionId: string;
  imageUrl: string;
  expiresAt: string;
}

export interface CaptchaValidationRequest {
  sessionId: string;
  captchaInput: string;
}

export interface CaptchaValidationResponse {
  valid: boolean;
  reason?: string;
  captchaRequired?: boolean;
}

export interface CaptchaMetrics {
  total: {
    generated: number;
    validated: number;
    failed: number;
    failedAttempts: number;
    lockouts: number;
    rateLimitExceeded: number;
    validationAttempts: number;
    sessionExpirations: number;
    inputSanitizations: number;
  };
  successRate: string;
  performance: {
    avgResponseTime: number;
    medianResponseTime: number;
    totalResponseTimes: number;
  };
  hourlyStats: Record<string, { generated: number; validated: number; failed: number }>;
  dailyStats: Record<string, { generated: number; validated: number; failed: number }>;
  timeOfDayStats: Record<string, { generated: number; validated: number; failed: number }>;
  dayOfWeekStats: Record<string, { generated: number; validated: number; failed: number }>;
  endpointUsage: Record<string, { generated: number; validated: number; failed: number }>;
  userAgents: Record<string, number>;
  geographicData: Record<string, { attempts: number; firstSeen: string; lastSeen: string }>;
  securityEvents: Record<string, number>;
  difficultyLevels: Record<string, { attempts: number; successes: number; failures: number }>;
  topIPs: Array<{
    ip: string;
    attempts: number;
    firstAttempt: string;
    lastAttempt: string;
  }>;
  topGeographicLocations: Array<{
    location: string;
    attempts: number;
    firstSeen: string;
    lastSeen: string;
  }>;
}

class CaptchaService {
  /**
   * Generate a new CAPTCHA image
   */
  async generateCaptcha(endpoint?: string): Promise<CaptchaResponse> {
    try {
      const response = await api.get('/captcha/generate', {
        responseType: 'blob',
        headers: {
          'X-Requested-Endpoint': endpoint || 'unknown'
        }
      });

      // Get session ID from response headers
      const sessionId = response.headers['x-captcha-session'];
      if (!sessionId) {
        throw new Error('No session ID received from server');
      }

      // Convert blob to data URL for display
      const blob = new Blob([response.data], { type: 'image/png' });
      const imageUrl = URL.createObjectURL(blob);

      return {
        sessionId,
        imageUrl,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      };
    } catch (error) {
      console.error('Failed to generate CAPTCHA:', error);
      throw new Error('Failed to generate CAPTCHA. Please try again.');
    }
  }

  /**
   * Validate CAPTCHA input
   */
  async validateCaptcha(sessionId: string, captchaInput: string, clientIP?: string): Promise<CaptchaValidationResponse> {
    try {
      const response = await api.post('/captcha/validate', {
        sessionId,
        captchaInput,
        clientIP
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Failed to validate CAPTCHA. Please try again.');
    }
  }

  /**
   * Check if CAPTCHA is required for a specific endpoint
   */
  async checkCaptchaRequirement(endpoint: string): Promise<{ required: boolean; reason?: string }> {
    try {
      const response = await api.get(`/captcha/check?endpoint=${encodeURIComponent(endpoint)}`);
      return response.data;
    } catch (error) {
      console.error('Failed to check CAPTCHA requirement:', error);
      return { required: false };
    }
  }

  /**
   * Get CAPTCHA metrics (admin only)
   */
  async getMetrics(): Promise<CaptchaMetrics> {
    try {
      const response = await api.get('/metrics/captcha');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch CAPTCHA metrics:', error);
      throw new Error('Failed to fetch CAPTCHA metrics');
    }
  }

  /**
   * Get CAPTCHA metrics in Prometheus format (admin only)
   */
  async getPrometheusMetrics(): Promise<string> {
    try {
      const response = await api.get('/metrics/captcha/prometheus');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch Prometheus metrics:', error);
      throw new Error('Failed to fetch Prometheus metrics');
    }
  }

  /**
   * Get system health status
   */
  async getHealthStatus(): Promise<{ status: string; message: string; timestamp: string }> {
    try {
      const response = await api.get('/metrics/health');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch health status:', error);
      throw new Error('Failed to fetch health status');
    }
  }

  /**
   * Record a security event (for monitoring)
   */
  async recordSecurityEvent(eventType: string, details?: any): Promise<void> {
    try {
      await api.post('/metrics/security-event', {
        eventType,
        details,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to record security event:', error);
      // Don't throw error for monitoring events
    }
  }

  /**
   * Get CAPTCHA configuration
   */
  async getConfiguration(): Promise<{
    sessionTimeout: number;
    maxAttempts: number;
    lockoutDuration: number;
    rateLimit: number;
  }> {
    try {
      const response = await api.get('/captcha/config');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch CAPTCHA configuration:', error);
      // Return default configuration
      return {
        sessionTimeout: 600000, // 10 minutes
        maxAttempts: 3,
        lockoutDuration: 900000, // 15 minutes
        rateLimit: 20
      };
    }
  }

  /**
   * Update CAPTCHA configuration (admin only)
   */
  async updateConfiguration(config: {
    sessionTimeout?: number;
    maxAttempts?: number;
    lockoutDuration?: number;
    rateLimit?: number;
  }): Promise<void> {
    try {
      await api.put('/captcha/config', config);
    } catch (error) {
      console.error('Failed to update CAPTCHA configuration:', error);
      throw new Error('Failed to update CAPTCHA configuration');
    }
  }

  /**
   * Reset failed attempts for an IP
   */
  async resetFailedAttempts(ip?: string): Promise<void> {
    try {
      await api.post('/captcha/reset-attempts', { ip });
    } catch (error) {
      console.error('Failed to reset failed attempts:', error);
      throw new Error('Failed to reset failed attempts');
    }
  }

  /**
   * Get CAPTCHA statistics for a specific time period
   */
  async getPeriodStats(startDate: string, endDate: string): Promise<CaptchaMetrics> {
    try {
      const response = await api.get(`/metrics/captcha/period?startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch period statistics:', error);
      throw new Error('Failed to fetch period statistics');
    }
  }
}

export default new CaptchaService(); 