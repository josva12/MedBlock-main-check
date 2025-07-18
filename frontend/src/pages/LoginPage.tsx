import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000';

const LoginPage: React.FC<{ navigateTo?: (page: string) => void; setIsAuthenticated?: (status: boolean) => void }> = ({ navigateTo, setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || 'Login successful!');
        setMessageType('success');
        if (data.data && data.data.accessToken && data.data.refreshToken) {
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          if (setIsAuthenticated) setIsAuthenticated(true);
        }
      } else {
        let errorMessage = data.error || 'Login failed. Please check your credentials.';
        if (data.code === 'ACCOUNT_LOCKED') {
          errorMessage = 'Account is locked due to too many failed login attempts. Please try again later.';
        } else if (data.code === 'INVALID_EMAIL_OR_PASSWORD') {
          errorMessage = 'Invalid email or password.';
        } else if (data.code === 'MISSING_TOKEN') {
          errorMessage = 'Access token required.';
        } else if (data.code === 'INVALID_TOKEN_FORMAT') {
          errorMessage = 'Invalid token format.';
        } else if (data.code === 'TOKEN_EXPIRED') {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (data.code === 'ACCOUNT_DEACTIVATED') {
          errorMessage = 'Your account has been deactivated.';
        }
        setMessage(errorMessage);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred during login. Please try again later.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105 relative border-t-4 border-blue-600">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back!</h2>
      {message && (
        <div className={`p-3 mb-4 rounded-lg text-sm ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <a href="#" onClick={() => navigateTo && navigateTo('forgot-password')} className="font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </a>
          </div>
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <a href="#" onClick={() => navigateTo && navigateTo('register')} className="font-medium text-blue-600 hover:text-blue-500">
          Sign Up
        </a>
      </p>
    </div>
  );
};

export default LoginPage; 