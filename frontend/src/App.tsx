import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import AuthenticatedLayout from './layouts/AuthenticatedLayout';

// Lazy load page components
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage')); // Fixed path
const PatientsPage = React.lazy(() => import('./pages/patients/PatientsPage'));
const AppointmentsPage = React.lazy(() => import('./pages/appointments/AppointmentsPage'));
const MedicalRecordsPage = React.lazy(() => import('./pages/MedicalRecordsPage'));
const VitalsPage = React.lazy(() => import('./pages/vitals/VitalsPage')); // Path updated
const ReportsPage = React.lazy(() => import('./pages/ReportsPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const AdminPage = React.lazy(() => import('./pages/admin/AdminPage'));
const BlockchainPage = React.lazy(() => import('./pages/BlockchainPage'));
const AIChatPage = React.lazy(() => import('./pages/AIChatPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));
const SubscriptionsPage = React.lazy(() => import('./pages/SubscriptionsPage'));
const AuditLogsPage = React.lazy(() => import('./pages/AuditLogsPage'));
const ClaimsPage = React.lazy(() => import('./pages/ClaimsPage'));
const TeleconsultationsPage = React.lazy(() => import('./pages/TeleconsultationsPage'));
const ResourcesPage = React.lazy(() => import('./pages/ResourcesPage'));
const FacilitiesPage = React.lazy(() => import('./pages/FacilitiesPage'));

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Styles
import './index.css';

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading MedBlock...</p>
    </div>
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
              },
            }}
          />
          
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected Routes */}
              <Route 
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="patients" element={<PatientsPage />} />
                <Route path="appointments" element={<AppointmentsPage />} />
                <Route path="medical-records" element={<MedicalRecordsPage />} />
                <Route path="vitals" element={<VitalsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="blockchain" element={<BlockchainPage />} />
                <Route path="ai-chat" element={<AIChatPage />} />
                <Route path="subscriptions" element={<SubscriptionsPage />} />
                <Route path="audit-logs" element={<AuditLogsPage />} />
                <Route path="claims" element={<ClaimsPage />} />
                <Route path="teleconsultations" element={<TeleconsultationsPage />} />
                <Route path="resources" element={<ResourcesPage />} />
                <Route path="facilities" element={<FacilitiesPage />} />
              </Route>

              {/* Admin-Only Routes */}
              <Route
                path="/admin/*" // Use wildcard for nested admin routes
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AuthenticatedLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminPage />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

// ========= THE FIX IS HERE =========
// This line was missing, causing the application to crash on startup.
export default App;
// ===================================