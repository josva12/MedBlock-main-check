import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { register, clearError } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

// Lucide React icons
import { Mail, Lock, User, Phone, BriefcaseMedical, Stethoscope, Eye } from 'lucide-react';

// Constants for form dropdowns - aligned with backend validation
const TITLES = ["Dr.", "Prof.", "Mr.", "Mrs.", "Ms.", "Nurse", "Pharm.", "Tech.", "Facility"];
const LICENSING_BODIES = ["KMPDC", "NCK", "PPB", "other"];
const COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta", "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi"
];
const ROLES = ['doctor', 'nurse', 'admin', 'front-desk', 'pharmacy'];

type FormErrors = {
  [key: string]: string | undefined;
};

type FormState = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  phone: string;
  title: string;
  specialization: string;
  department: string;
  submittedLicenseNumber: string;
  licensingBody: string;
  address: {
    street: string;
    city: string;
    county: string;
    subCounty: string;
    postalCode: string;
    country: string;
  };
};

const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, error } = useAppSelector((state) => state.auth);

  const [form, setForm] = useState<FormState>({
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
      county: "Nairobi",
      subCounty: "",
      postalCode: "",
      country: "Kenya",
    },
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      setNotificationMessage('Registration successful!');
      setNotificationType('success');
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        navigate('/dashboard');
      }, 3000);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      setNotificationMessage(error);
      setNotificationType('error');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setForm(prevForm => ({ 
        ...prevForm, 
        address: { ...prevForm.address, [addressField]: value } 
      }));
    } else {
      setForm(prevForm => ({ ...prevForm, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = "Full Name is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    if (!form.title) newErrors.title = "Title is required.";
    if (!form.role) newErrors.role = "Role is required.";
    if (!form.address.street) newErrors['address.street'] = "Street is required.";
    if (!form.address.city) newErrors['address.city'] = "City is required.";
    if (!form.address.county) newErrors['address.county'] = "County is required.";
    if (!form.address.subCounty) newErrors['address.subCounty'] = "Sub-County is required.";

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!form.password) newErrors.password = "Password is required.";
    else if (!passwordRegex.test(form.password)) newErrors.password = "Password must be 8+ chars, with uppercase, lowercase, digit, and special character.";

    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (!form.phone) newErrors.phone = "Phone number is required.";
    else if (!phoneRegex.test(form.phone)) newErrors.phone = "Must be a valid Kenyan number (e.g., +2547... or 07...).";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setNotificationMessage('Please correct the errors in the form.');
      setNotificationType('error');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
      return;
    }

    const { confirmPassword, ...dataToSubmit } = form;

    const finalData = {
      ...dataToSubmit,
      role: dataToSubmit.role as 'doctor' | 'nurse' | 'admin' | 'front-desk' | 'pharmacy',
      licensingBody: (dataToSubmit.licensingBody || undefined) as 'KMPDC' | 'NCK' | 'PPB' | 'other' | undefined,
    };

    dispatch(register(finalData));
  };

  const isProfessionalRole = ["doctor", "nurse"].includes(form.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center justify-center p-4 font-sans">
      {showNotification && (
        <div className={`fixed top-4 z-50 p-4 rounded-lg shadow-lg text-white ${notificationType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notificationMessage}
      </div>
      )}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-3xl border-t-4 border-blue-600">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 drop-shadow-lg flex items-center justify-center space-x-3">
            <span>MEDBLOCK</span>
            <span role="img" aria-label="Kenyan Flag">🇰🇪</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mt-2 font-medium">Secure Healthcare Management</p>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">Create Your Account</h2>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Personal Information */}
            <fieldset>
            <legend className="text-lg font-semibold text-gray-700 mb-4">Personal Information</legend>
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
                    required 
                    placeholder="John Doe" 
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} 
                  />
                  </div>
                  {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
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
                    required 
                    placeholder="you@example.com" 
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} 
                  />
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
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select 
                    id="title" 
                    name="title" 
                    value={form.title} 
                    onChange={handleChange} 
                    required 
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  >
                    {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                </div>
                <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="relative">
                  <BriefcaseMedical className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select 
                    id="role" 
                    name="role" 
                    value={form.role} 
                    onChange={handleChange} 
                    required 
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm ${errors.role ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  >
                    {ROLES.map(role => <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {isProfessionalRole && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <input 
                    type="text" 
                    id="specialization" 
                    name="specialization" 
                    value={form.specialization} 
                    onChange={handleChange} 
                    placeholder="e.g., Cardiology" 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm" 
                  />
                </div>
            <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input 
                    type="text" 
                    id="department" 
                    name="department" 
                    value={form.department} 
                    onChange={handleChange} 
                    placeholder="e.g., Internal Medicine" 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm" 
                  />
              </div>
                    <div>
                  <label htmlFor="submittedLicenseNumber" className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <input 
                    type="text" 
                    id="submittedLicenseNumber" 
                    name="submittedLicenseNumber" 
                    value={form.submittedLicenseNumber} 
                    onChange={handleChange} 
                    placeholder="e.g., 12345" 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm" 
                  />
            </div>
            <div>
                  <label htmlFor="licensingBody" className="block text-sm font-medium text-gray-700 mb-1">Licensing Body</label>
                  <select 
                    id="licensingBody" 
                    name="licensingBody" 
                    value={form.licensingBody} 
                    onChange={handleChange} 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Select Licensing Body</option>
                    {LICENSING_BODIES.map(body => <option key={body} value={body}>{body}</option>)}
                      </select>
                    </div>
              </div>
            )}
            </fieldset>

            {/* Contact Information */}
            <fieldset>
            <legend className="text-lg font-semibold text-gray-700 mb-4">Contact Information</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    required 
                    placeholder="+254712345678" 
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} 
                  />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>
              </div>
            </fieldset>

          {/* Address Information */}
            <fieldset>
            <legend className="text-lg font-semibold text-gray-700 mb-4">Address Information</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input 
                  type="text" 
                  id="address.street" 
                  name="address.street" 
                  value={form.address.street} 
                  onChange={handleChange} 
                  required 
                  placeholder="123 Main Street" 
                  className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm ${errors['address.street'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} 
                />
                  {errors['address.street'] && <p className="mt-1 text-xs text-red-600">{errors['address.street']}</p>}
                </div>
                <div>
                <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input 
                  type="text" 
                  id="address.city" 
                  name="address.city" 
                  value={form.address.city} 
                  onChange={handleChange} 
                  required 
                  placeholder="Nairobi" 
                  className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm ${errors['address.city'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} 
                />
                  {errors['address.city'] && <p className="mt-1 text-xs text-red-600">{errors['address.city']}</p>}
            </div>
            <div>
                <label htmlFor="address.county" className="block text-sm font-medium text-gray-700 mb-1">County</label>
                <select 
                  id="address.county" 
                  name="address.county" 
                  value={form.address.county} 
                  onChange={handleChange} 
                  required 
                  className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm ${errors['address.county'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                >
                  {COUNTIES.map(county => <option key={county} value={county}>{county}</option>)}
                </select>
                  {errors['address.county'] && <p className="mt-1 text-xs text-red-600">{errors['address.county']}</p>}
                </div>
                <div>
                <label htmlFor="address.subCounty" className="block text-sm font-medium text-gray-700 mb-1">Sub-County</label>
                <input 
                  type="text" 
                  id="address.subCounty" 
                  name="address.subCounty" 
                  value={form.address.subCounty} 
                  onChange={handleChange} 
                  required 
                  placeholder="Westlands" 
                  className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm ${errors['address.subCounty'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} 
                />
                  {errors['address.subCounty'] && <p className="mt-1 text-xs text-red-600">{errors['address.subCounty']}</p>}
              </div>
                <div>
                <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input 
                  type="text" 
                  id="address.postalCode" 
                  name="address.postalCode" 
                  value={form.address.postalCode} 
                  onChange={handleChange} 
                  placeholder="00100" 
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm" 
                />
                </div>
              </div>
            </fieldset>

            {/* Password */}
            <fieldset>
            <legend className="text-lg font-semibold text-gray-700 mb-4">Security</legend>
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
                    required 
                    placeholder="••••••••" 
                    className={`block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <Eye className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
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
                    required 
                    placeholder="••••••••" 
                    className={`block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <Eye className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>
            </fieldset>

          <div className="flex items-center justify-between">
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in here
              </Link>
            </p>
            </div>
          </form>
      </div>
    </div>
  );
};

export default RegisterPage; 