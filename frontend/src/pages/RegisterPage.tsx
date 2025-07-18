import React, { useState } from "react";
import { Mail, Lock, User, Phone, MapPin, Building, BriefcaseMedical, Stethoscope, Hash, Eye, EyeOff } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000';
const TITLES = ["Dr.", "Prof.", "Mr.", "Mrs.", "Ms.", "Nurse", "Pharm.", "Tech.", "Facility"];
const LICENSING_BODIES = ["KMPDC", "NCK", "PPB", "other"];
const COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta", "Garissa", "Wajir", "Mandera",
  "Marsabit", "Isiolo", "Meru", "Tharaka Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua",
  "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia",
  "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado",
  "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya", "Kisumu", "Homa Bay",
  "Migori", "Kisii", "Nyamira", "Nairobi"
];
const ROLES = ['doctor', 'nurse', 'admin', 'front-desk', 'pharmacy', 'clinic', 'hospital'];

const RegisterPage: React.FC<{ navigateTo?: (page: string) => void }> = ({ navigateTo }) => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "doctor",
    phone: "",
    title: "Dr.",
    specialization: "",
    department: "",
    submittedLicenseNumber: "",
    licensingBody: "",
    address: {
      street: "",
      city: "",
      county: "",
      subCounty: "",
      postalCode: "",
      country: "Kenya",
    },
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      setForm({ ...form, address: { ...form.address, [name.split(".")[1]]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!form.fullName) newErrors.fullName = "Full Name is required.";
    if (!form.email) newErrors.email = "Email is required.";
    if (!form.password) newErrors.password = "Password is required.";
    if (!form.confirmPassword) newErrors.confirmPassword = "Confirm Password is required.";
    if (!form.role) newErrors.role = "Role is required.";
    if (!form.phone) newErrors.phone = "Phone number is required.";
    if (!form.title) newErrors.title = "Title is required.";
    if (!form.address.street) newErrors['address.street'] = "Street is required.";
    if (!form.address.city) newErrors['address.city'] = "City is required.";
    if (!form.address.county) newErrors['address.county'] = "County is required.";
    if (!form.address.subCounty) newErrors['address.subCounty'] = "Sub-County is required.";
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(form.password)) {
      newErrors.password = "Password must be at least 8 characters, include uppercase, lowercase, digit, and special character.";
    }
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (!phoneRegex.test(form.phone)) {
      newErrors.phone = "Phone must be a valid Kenyan number (e.g., +2547XXXXXXXX or 07XXXXXXXX).";
    }
    const isProfessionalRole = ["doctor", "nurse"].includes(form.role);
    if (isProfessionalRole) {
      if (!form.submittedLicenseNumber) {
        newErrors.submittedLicenseNumber = "License number is required for doctors and nurses.";
      } else if (form.submittedLicenseNumber.length < 5 || form.submittedLicenseNumber.length > 50) {
        newErrors.submittedLicenseNumber = "License number must be between 5 and 50 characters.";
      }
      if (!form.licensingBody) {
        newErrors.licensingBody = "Licensing body is required for doctors and nurses.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    if (!validateForm()) {
      setMessage("Please correct the errors in the form.");
      setMessageType("error");
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...dataToSend } = form;
      const isProfessionalRole = ["doctor", "nurse"].includes(dataToSend.role);
      if (!isProfessionalRole) {
        if ('specialization' in dataToSend) dataToSend.specialization = '';
        if ('department' in dataToSend) dataToSend.department = '';
        if ('submittedLicenseNumber' in dataToSend) dataToSend.submittedLicenseNumber = '';
        if ('licensingBody' in dataToSend) dataToSend.licensingBody = '';
      } else {
        if (!dataToSend.specialization) dataToSend.specialization = '';
        if (!dataToSend.department) dataToSend.department = '';
        if (!dataToSend.submittedLicenseNumber) dataToSend.submittedLicenseNumber = '';
        if (!dataToSend.licensingBody) dataToSend.licensingBody = '';
      }
      if (!dataToSend.address.postalCode) dataToSend.address.postalCode = '';
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || 'Registration successful! Please log in.');
        setMessageType('success');
        setTimeout(() => navigateTo && navigateTo('login'), 2000);
      } else {
        if (response.status === 400 && data.details && Array.isArray(data.details)) {
          const backendErrors: any = {};
          data.details.forEach((err: any) => {
            if (err.path) {
              backendErrors[err.path] = err.msg;
            }
          });
          setErrors(backendErrors);
          setMessage(data.error || 'Validation failed. Please check your inputs.');
        } else {
          setMessage(data.error || 'Registration failed. Please try again.');
        }
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred during registration. Please try again later.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const isProfessionalRole = ["doctor", "nurse"].includes(form.role);

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 hover:scale-105 relative border-t-4 border-blue-600">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create Your MedBlock Account</h2>
      {message && (
        <div className={`p-3 mb-4 rounded-lg text-sm ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={form.fullName}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>
            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
          </div>

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
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number (e.g., +2547XXXXXXXX)</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="+254712345678"
              />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>
        </div>

        {/* Professional Information */}
        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-4">Professional Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Stethoscope className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="title"
                name="title"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={form.title}
                onChange={handleChange}
                required
              >
                {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BriefcaseMedical className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="role"
                name="role"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={form.role}
                onChange={handleChange}
                required
              >
                 {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
          </div>

          {isProfessionalRole && (
            <>
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">Specialization (Optional)</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Stethoscope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={form.specialization}
                    onChange={handleChange}
                    placeholder="e.g., Cardiology"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department (Optional)</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="e.g., Emergency"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="submittedLicenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  License Number for Verification
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="submittedLicenseNumber"
                    name="submittedLicenseNumber"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={form.submittedLicenseNumber}
                    onChange={handleChange}
                    required
                    placeholder="e.g., MD12345"
                  />
                </div>
                {errors.submittedLicenseNumber && <p className="mt-1 text-sm text-red-600">{errors.submittedLicenseNumber}</p>}
              </div>

              <div>
                <label htmlFor="licensingBody" className="block text-sm font-medium text-gray-700 mb-1">
                  Licensing Body
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="licensingBody"
                    name="licensingBody"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={form.licensingBody}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Licensing Body</option>
                    {LICENSING_BODIES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                {errors.licensingBody && <p className="mt-1 text-sm text-red-600">{errors.licensingBody}</p>}
              </div>
            </>
          )}
        </div>

        {/* Address fields */}
        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-4">Address Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="address.street"
                name="address.street"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={form.address.street}
                onChange={handleChange}
                required
                placeholder="123 Main St"
              />
            </div>
            {errors['address.street'] && <p className="mt-1 text-sm text-red-600">{errors['address.street']}</p>}
          </div>
          <div>
            <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="address.city"
                name="address.city"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={form.address.city}
                onChange={handleChange}
                required
                placeholder="Nairobi"
              />
            </div>
            {errors['address.city'] && <p className="mt-1 text-sm text-red-600">{errors['address.city']}</p>}
          </div>
          <div>
            <label htmlFor="address.county" className="block text-sm font-medium text-gray-700 mb-1">County</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="address.county"
                name="address.county"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={form.address.county}
                onChange={handleChange}
                required
              >
                <option value="">Select county...</option>
                {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {errors['address.county'] && <p className="mt-1 text-sm text-red-600">{errors['address.county']}</p>}
          </div>
          <div>
            <label htmlFor="address.subCounty" className="block text-sm font-medium text-gray-700 mb-1">Sub-County</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="address.subCounty"
                name="address.subCounty"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={form.address.subCounty}
                onChange={handleChange}
                required
                placeholder="e.g., Westlands"
              />
            </div>
            {errors['address.subCounty'] && <p className="mt-1 text-sm text-red-600">{errors['address.subCounty']}</p>}
          </div>
          <div>
            <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700 mb-1">Postal Code (Optional)</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="address.postalCode"
                name="address.postalCode"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={form.address.postalCode}
                onChange={handleChange}
                placeholder="e.g., 00100"
              />
            </div>
          </div>
        </div>

        {/* Password fields */}
        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-4">Set Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                value={form.password}
                onChange={handleChange}
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
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </div>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a href="#" onClick={() => navigateTo && navigateTo('login')} className="font-medium text-blue-600 hover:text-blue-500">
          Sign In
        </a>
      </p>
    </div>
  );
};

export default RegisterPage; 