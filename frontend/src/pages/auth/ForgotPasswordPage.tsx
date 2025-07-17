import React, { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    // TODO: Call forgot password API
    setTimeout(() => {
      setLoading(false);
      setMessage("If an account exists, a reset link has been sent to your email.");
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Forgot Password</h2>
        {message && <div className="mb-4 text-green-600 text-center">{message}</div>}
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <div className="flex justify-between mt-4 text-sm">
          <Link to="/auth/login" className="text-blue-700 hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 