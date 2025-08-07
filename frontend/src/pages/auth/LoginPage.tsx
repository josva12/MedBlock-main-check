import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import type { RootState } from '../../store';
import { login } from '../../features/auth/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CaptchaComponent from '../../components/auth/CaptchaComponent';
import MFAVerification from '../../components/auth/MFAVerification';
import mfaService from '../../services/mfaService';
import { Sun, Moon, ArrowLeft } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [captchaData, setCaptchaData] = useState({
    sessionId: '',
    captchaInput: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaData, setMfaData] = useState({
    sessionId: '',
    expiresAt: '',
    purpose: ''
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state: RootState) => state.auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCaptchaChange = (sessionId: string, captchaInput: string) => {
    setCaptchaData({ sessionId, captchaInput });
  };

  const handleMFAVerificationSuccess = (data: any) => {
    // Store tokens and user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Redirect to dashboard
    navigate('/');
  };

  const handleMFAVerificationError = (error: string) => {
    console.error('MFA verification error:', error);
  };

  const handleMFAResendCode = async () => {
    try {
      await mfaService.resendCode({
        email: formData.email,
        purpose: 'login'
      });
    } catch (error: any) {
      console.error('Failed to resend MFA code:', error);
    }
  };

  const handleBackToLogin = () => {
    setMfaRequired(false);
    setMfaData({ sessionId: '', expiresAt: '', purpose: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if CAPTCHA is required
    if (captchaRequired && (!captchaData.sessionId || !captchaData.captchaInput)) {
      setErrors(prev => ({
        ...prev,
        captcha: 'CAPTCHA is required. Please complete the verification.'
      }));
      return;
    }

    try {
      const loginData = captchaRequired 
        ? { ...formData, ...captchaData }
        : formData;
        
      const result = await dispatch(login(loginData) as any);
      
      if (login.fulfilled.match(result)) {
        // Check if MFA is required
        const response = result.payload;
        if (response?.data?.requiresMFA) {
          setMfaRequired(true);
          setMfaData({
            sessionId: response.data.sessionId,
            expiresAt: response.data.expiresAt,
            purpose: response.data.purpose
          });
        } else {
          // Redirect to root so RootRedirector handles role-based dashboard
          navigate('/');
        }
      } else if (login.rejected.match(result)) {
        // Check if CAPTCHA is required from error response
        const errorPayload = result.payload as any;
        if (errorPayload?.code === 'CAPTCHA_REQUIRED' || errorPayload?.captchaRequired) {
          setCaptchaRequired(true);
          setErrors(prev => ({
            ...prev,
            captcha: 'CAPTCHA verification is now required due to multiple failed attempts.'
          }));
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <button onClick={toggleTheme} className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
        </button>
      </div>

      {/* Show MFA verification if required */}
      {mfaRequired ? (
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-6">
            <button
              onClick={handleBackToLogin}
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to login
            </button>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Two-Factor Authentication
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Enter the code sent to your email
            </p>
          </div>
          
          <MFAVerification
            sessionId={mfaData.sessionId}
            expiresAt={mfaData.expiresAt}
            purpose={mfaData.purpose}
            email={formData.email}
            onVerificationSuccess={handleMFAVerificationSuccess}
            onVerificationError={handleMFAVerificationError}
            onResendCode={handleMFAResendCode}
          />
        </div>
      ) : (
        <>
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Welcome to MedBlock
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Sign in to your account
              </p>
            </div>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.email ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.password ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="Enter your password"
                    />
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                    )}
                  </div>
                </div>

                {/* CAPTCHA Component */}
                {captchaRequired && (
                  <CaptchaComponent
                    onCaptchaChange={handleCaptchaChange}
                    error={errors.captcha}
                    className="mt-4"
                  />
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="small" className="mr-2" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LoginPage; 