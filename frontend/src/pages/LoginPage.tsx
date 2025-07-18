import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

// This API base URL should ideally be in an environment variable
const API_BASE_URL = 'http://localhost:3000';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous messages on new submission

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const responseData = await response.json();

      if (response.ok) {
        setMessage(responseData.message || 'Login successful! Redirecting...');
        setMessageType('success');
        
        // Store tokens in localStorage for session persistence
        if (responseData.data && responseData.data.accessToken && responseData.data.refreshToken) {
          localStorage.setItem('accessToken', responseData.data.accessToken);
          localStorage.setItem('refreshToken', responseData.data.refreshToken);
        }

        // --- TODO: Dispatch Redux action here if needed ---
        // dispatch(loginSuccess({ user: responseData.data.user }));

        // Redirect to the dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard'); 
        }, 1500);

      } else {
        // Use the specific error message from the backend
        setMessage(responseData.error || 'Login failed. Please check your credentials.');
        setMessageType('error');
      }
    } catch (err) {
      console.error('Login API call failed:', err);
      setMessage('An unexpected error occurred. Please check your network and try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center justify-center p-4 font-sans">
        <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 drop-shadow-lg flex items-center justify-center space-x-3">
            <span>MEDBLOCK</span>
            <span role="img" aria-label="Kenyan Flag">🇰🇪</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mt-2 font-medium">Secure Healthcare Management</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-blue-600">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back!</h2>
            
            {message && (
            <div className={`p-3 mb-4 rounded-lg text-sm font-medium text-center ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message}
            </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                            placeholder="••••••••"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end">
                    <div className="text-sm">
                        <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                            Forgot your password?
                        </Link>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-wait"
                    disabled={loading}
                >
                    {loading ? "Signing In..." : "Sign In"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                    Sign Up
                </Link>
            </p>
        </div>
    </div>
  );
};

export default LoginPage;