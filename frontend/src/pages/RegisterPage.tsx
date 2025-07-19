import React, { useState } from "react";
import { Mail, Lock, User, Phone, MapPin, Building, BriefcaseMedical, Stethoscope, Hash, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/api';

const TITLES = ["Dr.", "Prof.", "Mr.", "Mrs.", "Ms.", "Nurse", "Pharm.", "Tech.", "Facility"];
const LICENSING_BODIES = ["KMPDC", "NCK", "PPB", "other"];
const COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta", "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi"
];
const ROLES = ['doctor', 'nurse', 'admin', 'front-desk', 'pharmacy', 'clinic', 'hospital'];

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    phone: "",
    title: "",
    address: {
      street: "",
      city: "",
      county: "",
      subCounty: "",
      postalCode: "",
      country: "Kenya"
    },
    specialization: "",
    department: "",
    submittedLicenseNumber: "",
    licensingBody: ""
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!form.role) newErrors.role = 'Role is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!form.title) newErrors.title = 'Title is required';
    if (!form.address.street.trim()) newErrors['address.street'] = 'Street address is required';
    if (!form.address.city.trim()) newErrors['address.city'] = 'City is required';
    if (!form.address.county) newErrors['address.county'] = 'County is required';
    if (!form.address.subCounty.trim()) newErrors['address.subCounty'] = 'Sub-county is required';
    
    // Professional role validations
    if (["doctor", "nurse"].includes(form.role)) {
      if (!form.specialization.trim()) newErrors.specialization = 'Specialization is required';
      if (!form.department.trim()) newErrors.department = 'Department is required';
      if (!form.submittedLicenseNumber.trim()) newErrors.submittedLicenseNumber = 'License number is required';
      if (!form.licensingBody) newErrors.licensingBody = 'Licensing body is required';
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
      
      // Handle optional fields for non-professional roles
      const isProfessionalRole = ["doctor", "nurse"].includes(dataToSend.role);
      if (!isProfessionalRole) {
        dataToSend.specialization = '';
        dataToSend.department = '';
        dataToSend.submittedLicenseNumber = '';
        dataToSend.licensingBody = '';
      }
      
      // Handle optional postal code
      if (!dataToSend.address.postalCode) {
        dataToSend.address.postalCode = '';
      }

      const response = await apiClient.post('/auth/register', dataToSend);
      const data = response.data;
      
      setMessage(data.message || 'Registration successful! Please log in.');
      setMessageType('success');
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const backendErrors: any = {};
        error.response.data.details.forEach((err: any) => {
          if (err.path) {
            backendErrors[err.path] = err.msg;
          }
        });
        setErrors(backendErrors);
        setMessage(error.response.data.error || 'Validation failed. Please check your inputs.');
      } else {
        setMessage(error.response?.data?.error || 'Registration failed. Please try again.');
      }
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const isProfessionalRole = ["doctor", "nurse"].includes(form.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center p-4 font-inter text-gray-800">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg flex items-center justify-center space-x-3">
          <span>MEDBLOCK</span>
          <span role="img" aria-label="Kenyan Flag">🇰🇪</span>
        </h1>
        <p className="text-lg md:text-xl text-blue-100 mt-2 font-medium">Secure Healthcare Management</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 hover:scale-105 relative border-t-4 border-blue-600">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-600 text-sm">Join MedBlock for secure healthcare management</p>
        </div>

        {message && (
          <div className={`p-3 mb-4 rounded-lg text-sm font-medium text-center ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Role and Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <div className="relative">
                <BriefcaseMedical className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Role</option>
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                  ))}
                </select>
              </div>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="+254700000000"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Title</option>
                  {TITLES.map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </div>
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>
          </div>

          {/* Professional Fields (Conditional) */}
          {isProfessionalRole && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${errors.specialization ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Cardiology, Pediatrics, etc."
                  />
                </div>
                {errors.specialization && <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>}
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Emergency, ICU, etc."
                  />
                </div>
                {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
              </div>

              <div>
                <label htmlFor="submittedLicenseNumber" className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="submittedLicenseNumber"
                    name="submittedLicenseNumber"
                    value={form.submittedLicenseNumber}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${errors.submittedLicenseNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="License number"
                  />
                </div>
                {errors.submittedLicenseNumber && <p className="mt-1 text-sm text-red-600">{errors.submittedLicenseNumber}</p>}
              </div>

              <div>
                <label htmlFor="licensingBody" className="block text-sm font-medium text-gray-700 mb-1">Licensing Body</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    id="licensingBody"
                    name="licensingBody"
                    value={form.licensingBody}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${errors.licensingBody ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Licensing Body</option>
                    {LICENSING_BODIES.map(body => (
                      <option key={body} value={body}>{body}</option>
                    ))}
                  </select>
                </div>
                {errors.licensingBody && <p className="mt-1 text-sm text-red-600">{errors.licensingBody}</p>}
              </div>
            </div>
          )}

          {/* Address Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="address.street"
                  name="address.street"
                  value={form.address.street}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${errors['address.street'] ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="123 Main Street"
                />
              </div>
              {errors['address.street'] && <p className="mt-1 text-sm text-red-600">{errors['address.street']}</p>}
            </div>

            <div>
              <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={form.address.city}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${errors['address.city'] ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nairobi"
                />
              </div>
              {errors['address.city'] && <p className="mt-1 text-sm text-red-600">{errors['address.city']}</p>}
            </div>

            <div>
              <label htmlFor="address.county" className="block text-sm font-medium text-gray-700 mb-1">County</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="address.county"
                  name="address.county"
                  value={form.address.county}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${errors['address.county'] ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select County</option>
                  {COUNTIES.map(county => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
              </div>
              {errors['address.county'] && <p className="mt-1 text-sm text-red-600">{errors['address.county']}</p>}
            </div>

            <div>
              <label htmlFor="address.subCounty" className="block text-sm font-medium text-gray-700 mb-1">Sub-County</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="address.subCounty"
                  name="address.subCounty"
                  value={form.address.subCounty}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${errors['address.subCounty'] ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Westlands"
                />
              </div>
              {errors['address.subCounty'] && <p className="mt-1 text-sm text-red-600">{errors['address.subCounty']}</p>}
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-wait"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="text-center">
            <span className="text-gray-600 text-sm">Already have an account? </span>
            <a href="#" onClick={e => { e.preventDefault(); navigate('/login'); }} className="font-medium text-blue-600 hover:text-blue-500">
              Sign In
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;