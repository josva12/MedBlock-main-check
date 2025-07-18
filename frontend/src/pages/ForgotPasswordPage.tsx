import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from 'lucide-react';

// This API base URL should ideally be in an environment variable
const API_BASE_URL = 'http://localhost:3000';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous messages
    setMessageType("error");

    // Basic client-side validation for immediate feedback
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
      
      const responseData = await response.json();

      if (response.ok) {
        // Use the secure, generic message from the backend
        setMessage(responseData.message || "If an account with that email exists, a password reset link has been sent.");
        setMessageType('success');
      } else {
        // Display a generic error on failure to avoid exposing system details
        setMessage(responseData.error || "Failed to send reset link. Please try again.");
        setMessageType('error');
      }
    } catch (err) {
      console.error("Forgot Password API call failed:", err);
      setMessage("An unexpected error occurred. Please check your network and try again.");
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

      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative border-t-4 border-blue-600">
        <Link 
            to="/login" 
            className="absolute top-4 left-4 text-gray-600 hover:text-blue-600 flex items-center space-x-1 transition-colors"
        >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Login</span>
        </Link>
        <div className="mt-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Forgot Password?</h2>
            <p className="text-center text-gray-500 mb-6 text-sm">
                No problem. We'll email you a reset link.
            </p>
            
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
                
                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-wait"
                    disabled={loading}
                >
                    {loading ? "Sending Link..." : "Send Reset Link"}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;