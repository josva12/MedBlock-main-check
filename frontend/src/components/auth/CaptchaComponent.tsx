import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';

interface CaptchaComponentProps {
  onCaptchaChange: (sessionId: string, captchaInput: string) => void;
  error?: string;
  className?: string;
}

const CaptchaComponent: React.FC<CaptchaComponentProps> = ({
  onCaptchaChange,
  error,
  className = ''
}) => {
  const [captchaImage, setCaptchaImage] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showInput, setShowInput] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCaptcha = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/captcha/generate', {
        responseType: 'blob'
      });

      // Get session ID from response headers
      const newSessionId = response.headers['x-captcha-session'];
      setSessionId(newSessionId);

      // Convert blob to data URL for display
      const blob = new Blob([response.data], { type: 'image/png' });
      const imageUrl = URL.createObjectURL(blob);
      setCaptchaImage(imageUrl);

      // Clear previous input
      setCaptchaInput('');
      onCaptchaChange(newSessionId, '');

    } catch (error) {
      console.error('Failed to generate CAPTCHA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (sessionId && captchaInput) {
      onCaptchaChange(sessionId, captchaInput);
    }
  }, [sessionId, captchaInput, onCaptchaChange]);

  const handleRefresh = () => {
    generateCaptcha();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCaptchaInput(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only allow alphanumeric characters
    const char = String.fromCharCode(e.which);
    if (!/[A-Z0-9]/.test(char) && e.key !== 'Backspace' && e.key !== 'Delete') {
      e.preventDefault();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          CAPTCHA Verification
        </label>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        {/* CAPTCHA Image */}
        <div className="flex-shrink-0">
          {captchaImage ? (
            <div className="relative">
              <img
                src={captchaImage}
                alt="CAPTCHA"
                className="border border-gray-300 rounded-md"
                style={{ width: '200px', height: '80px' }}
              />
              {isLoading && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-md">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-48 h-20 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center">
              {isLoading ? (
                <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              ) : (
                <span className="text-gray-500">Loading CAPTCHA...</span>
              )}
            </div>
          )}
        </div>

        {/* CAPTCHA Input */}
        <div className="flex-1">
          <div className="relative">
            <input
              type={showInput ? 'text' : 'password'}
              value={captchaInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              maxLength={6}
              placeholder="Enter CAPTCHA"
              className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm ${
                error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
              style={{ fontFamily: 'monospace', letterSpacing: '0.2em' }}
            />
            <button
              type="button"
              onClick={() => setShowInput(!showInput)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showInput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>• Enter the 6 characters shown in the image above</p>
        <p>• Characters are not case-sensitive</p>
        <p>• Click refresh to get a new CAPTCHA</p>
      </div>
    </div>
  );
};

export default CaptchaComponent; 