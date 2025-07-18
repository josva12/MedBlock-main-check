import React, { useState } from "react";
import { Mail, ArrowLeft } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000';

const ForgotPasswordPage: React.FC<{ navigateTo?: (page: string) => void }> = ({ navigateTo }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please provide a valid email address.');
      setMessageType('error');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "If an account exists, a reset link has been sent to your email.");
        setMessageType('success');
      } else {
        setMessage(data.error || "Failed to send reset link. Please try again.");
        setMessageType('error');
      }
    } catch (error) {
      setMessage("An error occurred. Please try again later.");
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105 relative border-t-4 border-blue-600">
      <a
        href="#"
        onClick={() => navigateTo && navigateTo('login')}
        className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 flex items-center space-x-1"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm font-medium">Back to Login</span>
      </a>
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6 mt-8">Forgot Password?</h2>
      <p className="text-center text-gray-600 mb-6 text-sm">
        Enter your email address below and we'll send you a link to reset your password.
      </p>
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
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage; 