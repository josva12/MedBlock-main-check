import React, { useState, useEffect, useRef } from 'react';
import { Mail, RefreshCw, AlertCircle, CheckCircle, Clock, Eye, EyeOff } from 'lucide-react';
import mfaService, { MFAVerificationRequest } from '../../services/mfaService';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

interface MFAVerificationProps {
  sessionId: string;
  expiresAt: string;
  purpose: string;
  email: string;
  onVerificationSuccess: (data: any) => void;
  onVerificationError: (error: string) => void;
  onResendCode: () => void;
  className?: string;
}

const MFAVerification: React.FC<MFAVerificationProps> = ({
  sessionId,
  expiresAt,
  purpose,
  email,
  onVerificationSuccess,
  onVerificationError,
  onResendCode,
  className = ''
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(5);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const remaining = mfaService.getRemainingTime(expiresAt);
      setRemainingTime(remaining);
      
      if (remaining <= 0) {
        setCanResend(true);
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
      }
    };

    updateTimer();
    countdownRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [expiresAt]);

  // Handle code input changes
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    const newCode = code.split('');
    newCode[index] = value;
    const updatedCode = newCode.join('');
    setCode(updatedCode);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (updatedCode.length === 6) {
      handleSubmit();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      setCode(pastedData);
      // Focus the last input
      inputRefs.current[5]?.focus();
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    if (!mfaService.validateCodeFormat(code)) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (remainingTime <= 0) {
      setError('Code has expired. Please request a new one.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const verificationData: MFAVerificationRequest = {
        sessionId,
        code
      };

      const response = await mfaService.verifyCode(verificationData);
      
      if (response.success && response.data) {
        toast.success('MFA verification successful!');
        onVerificationSuccess(response.data);
      } else {
        setError(response.message || 'Verification failed');
        onVerificationError(response.message || 'Verification failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Verification failed';
      setError(errorMessage);
      setAttempts(prev => prev + 1);
      
      if (attempts >= maxAttempts - 1) {
        setError('Too many failed attempts. Please request a new code.');
        onVerificationError('Too many failed attempts');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError('');

    try {
      await onResendCode();
      setCode('');
      setAttempts(0);
      setCanResend(false);
      
      // Reset countdown
      const newExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      setRemainingTime(10 * 60 * 1000);
      
      toast.success('New code sent to your email!');
    } catch (error: any) {
      setError(error.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  // Get purpose display text
  const getPurposeText = () => {
    const purposes = {
      login: 'login to your account',
      password_reset: 'reset your password',
      account_verification: 'verify your account',
      settings_change: 'change your account settings'
    };
    return purposes[purpose as keyof typeof purposes] || 'complete this action';
  };

  // Format remaining time
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Two-Factor Authentication
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            We've sent a 6-digit code to <span className="font-medium">{email}</span>
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
            Enter the code to {getPurposeText()}
          </p>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center mb-4">
          <Clock className="h-4 w-4 text-gray-500 mr-2" />
          <span className={`text-sm font-medium ${
            remainingTime <= 30000 ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
          }`}>
            {remainingTime > 0 ? formatTime(remainingTime) : 'Expired'}
          </span>
        </div>

        {/* Code Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter 6-digit code
          </label>
          <div className="flex justify-center space-x-2 mb-4">
            {Array.from({ length: 6 }, (_, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type={showCode ? 'text' : 'password'}
                maxLength={1}
                value={code[index] || ''}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isLoading || remainingTime <= 0}
              />
            ))}
          </div>
          
          {/* Show/Hide Code Toggle */}
          <div className="flex items-center justify-center mb-4">
            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              {showCode ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Hide code
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Show code
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-center mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
            </div>
          )}

          {/* Attempts Counter */}
          {attempts > 0 && (
            <div className="text-center mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Attempts: {attempts}/{maxAttempts}
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || code.length !== 6 || remainingTime <= 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              Verifying...
            </>
          ) : (
            'Verify Code'
          )}
        </button>

        {/* Resend Code */}
        <div className="mt-4 text-center">
          <button
            onClick={handleResendCode}
            disabled={!canResend || isLoading}
            className="flex items-center justify-center w-full text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            {canResend ? 'Resend Code' : `Resend available in ${formatTime(remainingTime)}`}
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            🔒 This code will expire in 10 minutes. Never share this code with anyone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MFAVerification; 