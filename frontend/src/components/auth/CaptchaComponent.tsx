import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import captchaService, { CaptchaResponse } from '../../services/captchaService';

interface CaptchaComponentProps {
  onCaptchaChange: (sessionId: string, captchaInput: string) => void;
  error?: string;
  className?: string;
  endpoint?: string;
  required?: boolean;
  disabled?: boolean;
  autoRefresh?: boolean;
  showStatus?: boolean;
}

const CaptchaComponent: React.FC<CaptchaComponentProps> = ({
  onCaptchaChange,
  error,
  className = '',
  endpoint = 'unknown',
  required = false,
  disabled = false,
  autoRefresh = false,
  showStatus = true
}) => {
  const [captchaData, setCaptchaData] = useState<CaptchaResponse | null>(null);
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showInput, setShowInput] = useState<boolean>(true);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [lastError, setLastError] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generateCaptcha = useCallback(async () => {
    try {
      setIsLoading(true);
      setLastError('');
      setValidationStatus('idle');

      const response = await captchaService.generateCaptcha(endpoint);
      setCaptchaData(response);

      // Clear previous input
      setCaptchaInput('');
      onCaptchaChange(response.sessionId, '');

      // Set up auto-refresh if enabled
      if (autoRefresh && response.expiresAt) {
        const expiresAt = new Date(response.expiresAt);
        const now = new Date();
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        
        if (timeUntilExpiry > 0) {
          refreshTimeoutRef.current = setTimeout(() => {
            generateCaptcha();
          }, timeUntilExpiry - 30000); // Refresh 30 seconds before expiry
        }
      }

    } catch (error: any) {
      console.error('Failed to generate CAPTCHA:', error);
      setLastError(error.message || 'Failed to generate CAPTCHA');
      setValidationStatus('invalid');
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, autoRefresh, onCaptchaChange]);

  useEffect(() => {
    generateCaptcha();

    // Cleanup function
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [generateCaptcha]);

  useEffect(() => {
    if (captchaData?.sessionId && captchaInput) {
      onCaptchaChange(captchaData.sessionId, captchaInput);
    }
  }, [captchaData?.sessionId, captchaInput, onCaptchaChange]);

  const handleRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    generateCaptcha();
  }, [generateCaptcha]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCaptchaInput(value);
    setValidationStatus('idle');
    setLastError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only allow alphanumeric characters
    const char = String.fromCharCode(e.which);
    if (!/[A-Z0-9]/.test(char) && e.key !== 'Backspace' && e.key !== 'Delete') {
      e.preventDefault();
    }
  };

  const handleValidation = async () => {
    if (!captchaData?.sessionId || !captchaInput) {
      setValidationStatus('invalid');
      setLastError('Please enter the CAPTCHA text');
      return;
    }

    try {
      setValidationStatus('validating');
      const result = await captchaService.validateCaptcha(captchaData.sessionId, captchaInput);
      
      if (result.valid) {
        setValidationStatus('valid');
        setLastError('');
      } else {
        setValidationStatus('invalid');
        setLastError(result.reason || 'Invalid CAPTCHA');
        // Auto-refresh on invalid input
        setTimeout(() => {
          generateCaptcha();
        }, 1000);
      }
    } catch (error: any) {
      setValidationStatus('invalid');
      setLastError(error.message || 'Validation failed');
    }
  };

  const getStatusIcon = () => {
    switch (validationStatus) {
      case 'validating':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (validationStatus) {
      case 'validating':
        return 'Validating...';
      case 'valid':
        return 'CAPTCHA verified';
      case 'invalid':
        return lastError || 'Invalid CAPTCHA';
      default:
        return '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          CAPTCHA Verification {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading || disabled}
          className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        {/* CAPTCHA Image */}
        <div className="flex-shrink-0">
          {captchaData?.imageUrl ? (
            <div className="relative">
              <img
                src={captchaData.imageUrl}
                alt="CAPTCHA verification"
                className="border border-gray-300 rounded-lg shadow-sm"
                style={{ minWidth: '200px', minHeight: '80px' }}
                onError={() => setLastError('Failed to load CAPTCHA image')}
              />
              {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-48 h-20 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
              {isLoading ? (
                <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              ) : (
                <span className="text-gray-500">Loading CAPTCHA...</span>
              )}
            </div>
          )}
        </div>

        {/* CAPTCHA Input */}
        <div className="flex-1 space-y-2">
          <div className="relative">
            <input
              type={showInput ? 'text' : 'password'}
              value={captchaInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onBlur={handleValidation}
              disabled={disabled || isLoading}
              maxLength={6}
              placeholder="Enter CAPTCHA"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                validationStatus === 'invalid' ? 'border-red-500' : 
                validationStatus === 'valid' ? 'border-green-500' : 
                'border-gray-300'
              }`}
              aria-describedby="captcha-error captcha-help"
            />
            
            {/* Show/Hide Toggle */}
            <button
              type="button"
              onClick={() => setShowInput(!showInput)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={disabled}
            >
              {showInput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Status and Error Display */}
          {showStatus && (validationStatus !== 'idle' || error || lastError) && (
            <div className="flex items-center space-x-2 text-sm">
              {getStatusIcon()}
              <span className={`
                ${validationStatus === 'valid' ? 'text-green-600' : 
                  validationStatus === 'invalid' || error || lastError ? 'text-red-600' : 
                  'text-blue-600'}
              `}>
                {error || lastError || getStatusText()}
              </span>
            </div>
          )}

          {/* Help Text */}
          <p id="captcha-help" className="text-xs text-gray-500">
            Enter the 6-character code shown in the image above. Only letters and numbers are allowed.
          </p>
        </div>
      </div>

      {/* Accessibility Features */}
      <div className="sr-only">
        <p>CAPTCHA verification required. Please enter the 6-character code shown in the image.</p>
        {error && <p>Error: {error}</p>}
        {lastError && <p>Error: {lastError}</p>}
      </div>
    </div>
  );
};

export default CaptchaComponent; 