import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import type { RootState } from '../../store';
import { register, clearError } from '../../features/auth/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { User, Mail, Lock, Phone, BriefcaseMedical, Stethoscope, Eye, EyeOff } from 'lucide-react';

const TITLES = ["Dr.", "Prof.", "Mr.", "Mrs.", "Ms.", "Nurse", "Pharm.", "Tech."];
const ROLES = ['doctor', 'nurse', 'admin', 'front-desk', 'pharmacy'];
const LICENSING_BODIES = ['KMPDC', 'NCK', 'PPB', 'other'];
const COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta", "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi"
];

const initialForm = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  role: 'doctor',
  title: 'Dr.',
  specialization: '',
  department: '',
  submittedLicenseNumber: '',
  licensingBody: '',
  address: {
    street: '',
    city: '',
    county: 'Nairobi',
    subCounty: '',
    postalCode: '',
    country: 'Kenya',
  },
};

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, error } = useSelector((state: RootState) => state.auth);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => { dispatch(clearError()); }, [dispatch]);
  // Remove the useEffect that redirects on isAuthenticated
  // Instead, redirect after successful registration
  useEffect(() => {
    if (registrationSuccess) navigate('/dashboard');
  }, [registrationSuccess, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setForm(prev => ({ ...prev, address: { ...prev.address, [addressField]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full Name is required.';
    if (!form.email.trim()) newErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email.';
    if (!form.title) newErrors.title = 'Title is required.';
    if (!form.role) newErrors.role = 'Role is required.';
    if (!form.address.street) newErrors['address.street'] = 'Street is required.';
    if (!form.address.city) newErrors['address.city'] = 'City is required.';
    if (!form.address.county) newErrors['address.county'] = 'County is required.';
    if (!form.address.subCounty) newErrors['address.subCounty'] = 'Sub-County is required.';
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!form.password) newErrors.password = 'Password is required.';
    else if (!passwordRegex.test(form.password)) newErrors.password = 'Password must be 8+ chars, with uppercase, lowercase, digit, and special character.';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (!form.phone) newErrors.phone = 'Phone number is required.';
    else if (!phoneRegex.test(form.phone)) newErrors.phone = 'Must be a valid Kenyan number (e.g., +2547... or 07...).';
    if ((form.role === 'doctor' || form.role === 'nurse')) {
      if (!form.submittedLicenseNumber) newErrors.submittedLicenseNumber = 'License number is required for doctors/nurses.';
      if (!form.licensingBody) newErrors.licensingBody = 'Licensing body is required for doctors/nurses.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const { confirmPassword, ...dataToSubmit } = form;
    const result = await dispatch(register({
      ...dataToSubmit,
      role: dataToSubmit.role as 'doctor' | 'nurse' | 'admin' | 'front-desk' | 'pharmacy' | 'patient',
      licensingBody: (dataToSubmit.licensingBody || undefined) as 'KMPDC' | 'NCK' | 'PPB' | 'other' | undefined,
    }) as any);
      if (register.fulfilled.match(result)) {
      setRegistrationSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">Join MedBlock today</p>
        </div>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Personal Information */}
            <fieldset>
              <legend className="text-lg font-semibold text-gray-700 mb-4">Personal Information</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required placeholder="John Doe" className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm text-gray-900 dark:text-white ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} />
                  </div>
                  {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm text-gray-900 dark:text-white ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
              </div>
            </fieldset>
            {/* Professional Details */}
            <fieldset>
              <legend className="text-lg font-semibold text-gray-700 mb-4">Professional Details</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <select id="title" name="title" value={form.title} onChange={handleChange} className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm text-gray-900 dark:text-white ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} required>
                    {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select id="role" name="role" value={form.role} onChange={handleChange} className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm text-gray-900 dark:text-white ${errors.role ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} required>
                    {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                  {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role}</p>}
                </div>
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <input type="text" id="specialization" name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Pediatrics" className="block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm text-gray-900 dark:text-white border-gray-300 focus:ring-blue-500" />
                </div>
            <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input type="text" id="department" name="department" value={form.department} onChange={handleChange} placeholder="e.g. Cardiology" className="block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm text-gray-900 dark:text-white border-gray-300 focus:ring-blue-500" />
              </div>
                {(form.role === 'doctor' || form.role === 'nurse') && (
                  <>
                    <div>
                      <label htmlFor="submittedLicenseNumber" className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                      <input type="text" id="submittedLicenseNumber" name="submittedLicenseNumber" value={form.submittedLicenseNumber} onChange={handleChange} required={form.role === 'doctor' || form.role === 'nurse'} className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm text-gray-900 dark:text-white ${errors.submittedLicenseNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} />
                      {errors.submittedLicenseNumber && <p className="mt-1 text-xs text-red-600">{errors.submittedLicenseNumber}</p>}
            </div>
            <div>
                      <label htmlFor="licensingBody" className="block text-sm font-medium text-gray-700 mb-1">Licensing Body</label>
                      <select id="licensingBody" name="licensingBody" value={form.licensingBody} onChange={handleChange} required={form.role === 'doctor' || form.role === 'nurse'} className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm text-gray-900 dark:text-white ${errors.licensingBody ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}>
                        <option value="">Select</option>
                        {LICENSING_BODIES.map(lb => <option key={lb} value={lb}>{lb}</option>)}
                      </select>
                      {errors.licensingBody && <p className="mt-1 text-xs text-red-600">{errors.licensingBody}</p>}
                    </div>
                  </>
                )}
              </div>
            </fieldset>
            {/* Contact Information */}
            <fieldset>
              <legend className="text-lg font-semibold text-gray-700 mb-4">Contact Information</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} required placeholder="e.g. +254712345678" className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm text-gray-900 dark:text-white ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>
              </div>
            </fieldset>
            {/* Address */}
            <fieldset>
              <legend className="text-lg font-semibold text-gray-700 mb-4">Address</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                  <input type="text" id="address.street" name="address.street" value={form.address.street} onChange={handleChange} required className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm text-gray-900 dark:text-white ${errors['address.street'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} />
                  {errors['address.street'] && <p className="mt-1 text-xs text-red-600">{errors['address.street']}</p>}
                </div>
                <div>
                  <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" id="address.city" name="address.city" value={form.address.city} onChange={handleChange} required className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm text-gray-900 dark:text-white ${errors['address.city'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} />
                  {errors['address.city'] && <p className="mt-1 text-xs text-red-600">{errors['address.city']}</p>}
            </div>
            <div>
                  <label htmlFor="address.county" className="block text-sm font-medium text-gray-700 mb-1">County</label>
                  <select id="address.county" name="address.county" value={form.address.county} onChange={handleChange} required className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm text-gray-900 dark:text-white ${errors['address.county'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}>
                    {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                  {errors['address.county'] && <p className="mt-1 text-xs text-red-600">{errors['address.county']}</p>}
                </div>
                <div>
                  <label htmlFor="address.subCounty" className="block text-sm font-medium text-gray-700 mb-1">Sub-County</label>
                  <input type="text" id="address.subCounty" name="address.subCounty" value={form.address.subCounty} onChange={handleChange} required className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm text-gray-900 dark:text-white ${errors['address.subCounty'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} />
                  {errors['address.subCounty'] && <p className="mt-1 text-xs text-red-600">{errors['address.subCounty']}</p>}
              </div>
                <div>
                  <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input type="text" id="address.postalCode" name="address.postalCode" value={form.address.postalCode} onChange={handleChange} className="block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm text-gray-900 dark:text-white border-gray-300 focus:ring-blue-500" />
            </div>
            <div>
                  <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input type="text" id="address.country" name="address.country" value={form.address.country} onChange={handleChange} required className="block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm text-gray-900 dark:text-white border-gray-300 focus:ring-blue-500" />
                </div>
              </div>
            </fieldset>
            {/* Password */}
            <fieldset>
              <legend className="text-lg font-semibold text-gray-700 mb-4">Set Password</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={form.password} onChange={handleChange} required placeholder="Password" className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm text-gray-900 dark:text-white ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>
            <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required placeholder="Confirm Password" className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm text-gray-900 dark:text-white ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} />
                    <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>
            </fieldset>
            {/* Error Message */}
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
            {/* Submit Button */}
            <div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="small" color="white" /> : 'Create Account'}
              </button>
            </div>
            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">Already have an account? </span>
              <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 