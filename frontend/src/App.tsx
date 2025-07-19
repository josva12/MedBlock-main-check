import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from './context/ThemeContext';
import store from './store';

// Import layouts
import AdminLayout from './layouts/AdminLayout';
import DoctorLayout from './layouts/DoctorLayout';
import FrontDeskLayout from './layouts/FrontDeskLayout';
import PatientLayout from './layouts/PatientLayout';
import PharmacyLayout from './layouts/PharmacyLayout';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';

// Import components
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load pages that exist
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/auth/ResetPasswordPage'));

// Admin pages
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'));

// Common pages
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const InsuranceEnrollmentPage = React.lazy(() => import('./pages/InsuranceEnrollmentPage'));
const ClaimsPage = React.lazy(() => import('./pages/ClaimsPage'));
const InsuranceMarketplacePage = React.lazy(() => import('./pages/InsuranceMarketplacePage'));

// Placeholder component for missing pages
const PlaceholderPage: React.FC<{ role: string; feature: string }> = ({ role, feature }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="max-w-md mx-auto text-center">
      <div className="text-6xl mb-6">🚧</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{feature}</h1>
      <p className="text-lg text-gray-600 mb-8">
        This {role} feature is coming soon!
      </p>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Under Development</h2>
        <p className="text-gray-600 mb-4">
          This page is currently being developed and will be available soon.
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Development in progress</span>
        </div>
      </div>
    </div>
  </div>
);

// Role-based route component
const RoleBasedRoute: React.FC<{
  allowedRoles: string[];
  children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  return (
    <ProtectedRoute>
      {({ user }) => {
        if (!user || !allowedRoles.includes(user.role)) {
          return <Navigate to="/unauthorized" replace />;
        }
        return <>{children}</>;
      }}
    </ProtectedRoute>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/insurance-marketplace" element={<InsuranceMarketplacePage />} />

              {/* Admin routes */}
              <Route
                path="/admin/*"
                element={
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <AdminLayout>
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboardPage />} />
                        <Route path="users" element={<PlaceholderPage role="admin" feature="User Management" />} />
                        <Route path="patients" element={<PlaceholderPage role="admin" feature="Patient Management" />} />
                        <Route path="appointments" element={<PlaceholderPage role="admin" feature="Appointment Management" />} />
                        <Route path="claims" element={<PlaceholderPage role="admin" feature="Claims Management" />} />
                        <Route path="insurance" element={<PlaceholderPage role="admin" feature="Insurance Management" />} />
                        <Route path="reports" element={<PlaceholderPage role="admin" feature="Reports & Analytics" />} />
                        <Route path="audit-logs" element={<PlaceholderPage role="admin" feature="Audit Logs" />} />
                        <Route path="settings" element={<PlaceholderPage role="admin" feature="System Settings" />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </AdminLayout>
                  </RoleBasedRoute>
                }
              />

              {/* Doctor routes */}
              <Route
                path="/doctor/*"
                element={
                  <RoleBasedRoute allowedRoles={['doctor']}>
                    <DoctorLayout>
                      <Routes>
                        <Route path="dashboard" element={<PlaceholderPage role="doctor" feature="Doctor Dashboard" />} />
                        <Route path="appointments" element={<PlaceholderPage role="doctor" feature="My Appointments" />} />
                        <Route path="patients" element={<PlaceholderPage role="doctor" feature="My Patients" />} />
                        <Route path="medical-records" element={<PlaceholderPage role="doctor" feature="Medical Records" />} />
                        <Route path="teleconsultations" element={<PlaceholderPage role="doctor" feature="Teleconsultations" />} />
                        <Route path="prescriptions" element={<PlaceholderPage role="doctor" feature="Prescriptions" />} />
                        <Route path="insurance" element={<PlaceholderPage role="doctor" feature="My Insurance" />} />
                        <Route path="claims" element={<PlaceholderPage role="doctor" feature="My Claims" />} />
                        <Route path="profile" element={<PlaceholderPage role="doctor" feature="Profile" />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </DoctorLayout>
                  </RoleBasedRoute>
                }
              />

              {/* Front Desk routes */}
              <Route
                path="/frontdesk/*"
                element={
                  <RoleBasedRoute allowedRoles={['front-desk']}>
                    <FrontDeskLayout>
                      <Routes>
                        <Route path="dashboard" element={<PlaceholderPage role="front desk" feature="Front Desk Dashboard" />} />
                        <Route path="appointments" element={<PlaceholderPage role="front desk" feature="Appointment Management" />} />
                        <Route path="patients" element={<PlaceholderPage role="front desk" feature="Patient Registration" />} />
                        <Route path="insurance" element={<PlaceholderPage role="front desk" feature="Insurance Enrollment" />} />
                        <Route path="claims" element={<PlaceholderPage role="front desk" feature="Claims Submission" />} />
                        <Route path="profile" element={<PlaceholderPage role="front desk" feature="Profile" />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </FrontDeskLayout>
                  </RoleBasedRoute>
                }
              />

              {/* Patient routes */}
              <Route
                path="/patient/*"
                element={
                  <RoleBasedRoute allowedRoles={['patient']}>
                    <PatientLayout>
                      <Routes>
                        <Route path="dashboard" element={<PlaceholderPage role="patient" feature="Patient Dashboard" />} />
                        <Route path="appointments" element={<PlaceholderPage role="patient" feature="My Appointments" />} />
                        <Route path="insurance" element={<PlaceholderPage role="patient" feature="My Insurance" />} />
                        <Route path="claims" element={<PlaceholderPage role="patient" feature="My Claims" />} />
                        <Route path="medical-records" element={<PlaceholderPage role="patient" feature="Medical Records" />} />
                        <Route path="chat" element={<PlaceholderPage role="patient" feature="Chat Support" />} />
                        <Route path="pharmacy" element={<PlaceholderPage role="patient" feature="Pharmacy" />} />
                        <Route path="profile" element={<PlaceholderPage role="patient" feature="Profile" />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </PatientLayout>
                  </RoleBasedRoute>
                }
              />

              {/* Pharmacy routes */}
              <Route
                path="/pharmacy/*"
                element={
                  <RoleBasedRoute allowedRoles={['pharmacy']}>
                    <PharmacyLayout>
                      <Routes>
                        <Route path="dashboard" element={<PlaceholderPage role="pharmacy" feature="Pharmacy Dashboard" />} />
                        <Route path="inventory" element={<PlaceholderPage role="pharmacy" feature="Drug Inventory" />} />
                        <Route path="orders" element={<PlaceholderPage role="pharmacy" feature="Orders" />} />
                        <Route path="consultations" element={<PlaceholderPage role="pharmacy" feature="Consultations" />} />
                        <Route path="chat" element={<PlaceholderPage role="pharmacy" feature="Patient Chat" />} />
                        <Route path="prescriptions" element={<PlaceholderPage role="pharmacy" feature="Prescriptions" />} />
                        <Route path="reports" element={<PlaceholderPage role="pharmacy" feature="Reports" />} />
                        <Route path="profile" element={<PlaceholderPage role="pharmacy" feature="Profile" />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </PharmacyLayout>
                  </RoleBasedRoute>
                }
              />

              {/* Legacy routes for backward compatibility */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    {({ user }) => {
                      // Redirect based on user role
                      if (user) {
                        switch (user.role) {
                          case 'admin':
                            return <Navigate to="/admin/dashboard" replace />;
                          case 'doctor':
                            return <Navigate to="/doctor/dashboard" replace />;
                          case 'front-desk':
                            return <Navigate to="/frontdesk/dashboard" replace />;
                          case 'patient':
                            return <Navigate to="/patient/dashboard" replace />;
                          case 'pharmacy':
                            return <Navigate to="/pharmacy/dashboard" replace />;
                          default:
                            return <Navigate to="/dashboard" replace />;
                        }
                      }
                      return <Navigate to="/login" replace />;
                    }}
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <DashboardPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/insurance-enrollment"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <InsuranceEnrollmentPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/claims"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <ClaimsPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              {/* Error routes */}
              <Route path="/unauthorized" element={<div>Unauthorized access</div>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;