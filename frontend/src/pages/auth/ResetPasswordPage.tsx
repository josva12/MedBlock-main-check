import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    // TODO: Call reset password API with token
    setTimeout(() => {
      setLoading(false);
      setMessage("Password reset successful. You can now log in.");
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Reset Password</h2>
        {message && <div className="mb-4 text-green-600 text-center">{message}</div>}
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <div className="flex justify-between mt-4 text-sm">
          <Link to="/auth/login" className="text-blue-700 hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 