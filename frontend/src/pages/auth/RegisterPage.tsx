import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { register } from "../../features/auth/authSlice";

const TITLES = ["Dr.", "Prof.", "Mr.", "Mrs.", "Ms.", "Nurse", "Pharm.", "Tech."];
const LICENSING_BODIES = ["KMPDC", "NCK", "PPB", "other"];
const COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta", "Garissa", "Wajir", "Mandera",
  "Marsabit", "Isiolo", "Meru", "Tharaka Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua",
  "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia",
  "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado",
  "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya", "Kisumu", "Homa Bay",
  "Migori", "Kisii", "Nyamira", "Nairobi"
];

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "doctor",
    phone: "",
    title: "Dr.",
    submittedLicenseNumber: "",
    licensingBody: "",
    address: {
      street: "",
      city: "",
      county: "",
      subCounty: "",
    },
  });
  const [formError, setFormError] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {}, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      setForm({ ...form, address: { ...form.address, [name.split(".")[1]]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validate = () => {
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword || !form.role || !form.phone || !form.title) {
      return "All required fields must be filled.";
    }
    if (!form.address.street || !form.address.city || !form.address.county || !form.address.subCounty) {
      return "All address fields are required.";
    }
    if (form.password !== form.confirmPassword) {
      return "Passwords do not match";
    }
    if (form.password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(form.password)) {
      return "Password must include uppercase, lowercase, digit, and special character.";
    }
    if (!/^((\+254|0)[17]\d{8})$/.test(form.phone)) {
      return "Phone must be a valid Kenyan number (e.g. +2547XXXXXXXX or 07XXXXXXXX).";
    }
    if (["doctor", "nurse"].includes(form.role)) {
      if (!form.submittedLicenseNumber || !form.licensingBody) {
        return "License number and licensing body are required for doctors and nurses.";
      }
      if (form.submittedLicenseNumber.length < 5 || form.submittedLicenseNumber.length > 50) {
        return "License number must be between 5 and 50 characters.";
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    setFormError(err || "");
    if (err) return;
    const result = await dispatch(register({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      role: form.role,
      phone: form.phone,
      title: form.title,
      submittedLicenseNumber: form.submittedLicenseNumber || undefined,
      licensingBody: form.licensingBody || undefined,
      address: form.address,
    }));
    if ((result as any).meta.requestStatus === "fulfilled") {
      navigate("/auth/login");
    }
  };

  // Improved error display: show backend error details if available
  const errorMsg = formError || (error && typeof error === "string" ? error : (error as any)?.details || "");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-200">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md flex flex-col items-center mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Create Your MedBlock Account</h2>
        {errorMsg && <div className="mb-4 text-red-600 text-center">{errorMsg}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div>
            <label className="block text-gray-700">Full Name</label>
            <input
              type="text"
              name="fullName"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Role</label>
            <select
              name="role"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="admin">Admin</option>
              <option value="front-desk">Front Desk</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Title</label>
            <select
              name="title"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.title}
              onChange={handleChange}
              required
            >
              {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>
          {/* Address fields */}
          <div>
            <label className="block text-gray-700">Street</label>
            <input
              type="text"
              name="address.street"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.address.street}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">City</label>
            <input
              type="text"
              name="address.city"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.address.city}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">County</label>
            <select
              name="address.county"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.address.county}
              onChange={handleChange}
              required
            >
              <option value="">Select county...</option>
              {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Sub-County</label>
            <input
              type="text"
              name="address.subCounty"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.address.subCounty}
              onChange={handleChange}
              required
            />
          </div>
          {/* Professional verification fields for doctor/nurse */}
          {["doctor", "nurse"].includes(form.role) && (
            <>
              <div>
                <label className="block text-gray-700">License Number</label>
                <input
                  type="text"
                  name="submittedLicenseNumber"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={form.submittedLicenseNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Licensing Body</label>
                <select
                  name="licensingBody"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={form.licensingBody}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select...</option>
                  {LICENSING_BODIES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 transition"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        <div className="flex justify-between mt-4 text-sm w-full">
          <Link to="/auth/login" className="text-blue-700 hover:underline">Already have an account?</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 