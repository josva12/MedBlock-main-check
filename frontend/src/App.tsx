import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './store';
import type { RootState } from './store';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import DoctorLayout from './layouts/DoctorLayout';
import FrontDeskLayout from './layouts/FrontDeskLayout';
import PatientLayout from './layouts/PatientLayout';
import PharmacyLayout from './layouts/PharmacyLayout';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import MainLayout from './layouts/MainLayout';

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import AIChatWidget from './components/ai/AIChatWidget';

// --- Page Components (Lazy Loaded) ---

// Auth Pages
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/auth/ResetPasswordPage'));

// Admin Pages
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = React.lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminClaimsPage = React.lazy(() => import('./pages/admin/AdminClaimsPage'));

// General Pages
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'));
const PatientsPage = React.lazy(() => import('./pages/patients/PatientsPage'));
const AppointmentsPage = React.lazy(() => import('./pages/appointments/AppointmentsPage'));
const VitalsPage = React.lazy(() => import('./pages/vitals/VitalsPage'));
const RecordsPage = React.lazy(() => import('./pages/records/RecordsPage'));
const ReportsPage = React.lazy(() => import('./pages/reports/ReportsPage'));
const BlockchainPage = React.lazy(() => import('./pages/blockchain/BlockchainPage'));
const AiChatPage = React.lazy(() => import('./pages/ai/AIPage'));
const FacilitiesPage = React.lazy(() => import('./pages/FacilitiesPage'));
const ResourcesPage = React.lazy(() => import('./pages/ResourcesPage'));
const SubscriptionsPage = React.lazy(() => import('./pages/SubscriptionsPage'));
const InsuranceMarketplacePage = React.lazy(() => import('./pages/InsuranceMarketplacePage'));
const InsuranceEnrollmentPage = React.lazy(() => import('./pages/InsuranceEnrollmentPage'));
const ClaimsPage = React.lazy(() => import('./pages/ClaimsPage'));
const TeleconsultationsPage = React.lazy(() => import('./pages/TeleconsultationsPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));
const FrontDeskDashboardPage = React.lazy(() => import('./pages/frontdesk/FrontDeskDashboardPage'));

// --- Helper Components ---

const ThemeManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useSelector((state: RootState) => state.ui.theme);
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
    root.classList.toggle('light', !isDark);
  }, [theme]);
  return <>{children}</>;
};

const RootRedirector: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'admin': return <Navigate to="/admin" replace />;
    case 'doctor': return <Navigate to="/doctor" replace />;
    case 'front-desk': return <Navigate to="/frontdesk" replace />;
    case 'patient': return <Navigate to="/patient" replace />;
    case 'pharmacy': return <Navigate to="/pharmacy" replace />;
    default: return <Navigate to="/dashboard" replace />;
  }
};

const PlaceholderPage: React.FC<{ feature: string }> = ({ feature }) => (
    <div className="p-8 text-center">
        <h1 className="text-3xl font-bold">🚧 Coming Soon 🚧</h1>
        <p className="mt-4 text-lg">The "{feature}" feature is under construction.</p>
  </div>
);

// --- Main App Component ---

function AppContent() {
  const [showAIChat, setShowAIChat] = React.useState(false);
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  // Hide floating widget on dedicated AI chat page
  const isAIChatPage = location.pathname.startsWith('/ai-chat') || location.pathname.startsWith('/ai');

  return (
    <>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* --- Public Routes --- */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/insurance-marketplace" element={<InsuranceMarketplacePage />} />
              <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />

              {/* --- Root Redirect --- */}
              <Route path="/" element={<ProtectedRoute><RootRedirector /></ProtectedRoute>} />
              
              {/* --- Admin Routes --- */}
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                  <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboardPage />} />
                      <Route path="users" element={<AdminUsersPage />} />
                      <Route path="patients" element={<PatientsPage />} />
                      <Route path="appointments" element={<AppointmentsPage />} />
                      <Route path="claims" element={<AdminClaimsPage />} />
                      <Route path="insurance" element={<PlaceholderPage feature="Insurance Management" />} />
                      <Route path="reports" element={<ReportsPage />} />
                      <Route path="audit-logs" element={<PlaceholderPage feature="Audit Logs" />} />
                      <Route path="settings" element={<SettingsPage />} />
                  </Route>
              </Route>

              {/* --- Doctor Routes --- */}
              <Route element={<ProtectedRoute requiredRole="doctor" />}>
                  <Route path="/doctor" element={<DoctorLayout />}>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="appointments" element={<AppointmentsPage />} />
                      <Route path="patients" element={<PatientsPage />} />
                      <Route path="medical-records" element={<RecordsPage />} />
                      <Route path="teleconsultations" element={<TeleconsultationsPage />} />
                      <Route path="prescriptions" element={<PlaceholderPage feature="Prescriptions" />} />
                      <Route path="insurance" element={<PlaceholderPage feature="Insurance" />} />
                      <Route path="claims" element={<ClaimsPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                  </Route>
              </Route>

              {/* --- Front Desk Routes --- */}
              <Route element={<ProtectedRoute requiredRole="front-desk" />}>
                  <Route path="/frontdesk" element={<FrontDeskLayout />}>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<FrontDeskDashboardPage />} />
                      <Route path="appointments" element={<AppointmentsPage />} />
                      <Route path="patients" element={<PatientsPage />} />
                      <Route path="insurance" element={<InsuranceEnrollmentPage />} />
                      <Route path="claims" element={<ClaimsPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                  </Route>
              </Route>
              
              {/* --- Patient Routes --- */}
              <Route element={<ProtectedRoute requiredRole="patient" />}>
                  <Route path="/patient" element={<PatientLayout />}>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="appointments" element={<AppointmentsPage />} />
                      <Route path="insurance" element={<InsuranceEnrollmentPage />} />
                      <Route path="claims" element={<ClaimsPage />} />
                      <Route path="medical-records" element={<RecordsPage />} />
                      <Route path="chat" element={<AiChatPage />} />
                      <Route path="pharmacy" element={<PlaceholderPage feature="Pharmacy" />} />
                      <Route path="profile" element={<ProfilePage />} />
                  </Route>
              </Route>
              
              {/* --- Pharmacy Routes --- */}
              <Route element={<ProtectedRoute requiredRole="pharmacy" />}>
                  <Route path="/pharmacy" element={<PharmacyLayout />}>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="inventory" element={<PlaceholderPage feature="Inventory" />} />
                      <Route path="orders" element={<PlaceholderPage feature="Orders" />} />
                      <Route path="consultations" element={<PlaceholderPage feature="Consultations" />} />
                      <Route path="chat" element={<AiChatPage />} />
                      <Route path="prescriptions" element={<PlaceholderPage feature="Prescriptions" />} />
                      <Route path="reports" element={<ReportsPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                  </Route>
              </Route>

              {/* --- General Authenticated Routes (using MainLayout) --- */}
              <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<MainLayout />} >
                      <Route index element={<DashboardPage />} />
                  </Route>
                  <Route path="/facilities" element={<FacilitiesPage />} />
                  <Route path="/resources" element={<ResourcesPage />} />
                  <Route path="/subscriptions" element={<SubscriptionsPage />} />
                  <Route path="/vitals" element={<VitalsPage />} />
                  <Route path="/blockchain" element={<BlockchainPage />} />
                  <Route path="/ai-chat" element={<AiChatPage />} />
              </Route>

              {/* --- Catch-all 404 Route --- */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            {/* Floating AI Chat Widget (global, except on AI chat page) */}
            {user && !isAIChatPage && (
              <>
                {showAIChat && (
                  <AIChatWidget floating onClose={() => setShowAIChat(false)} />
                )}
                <button
                  className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform focus:outline-none"
                  onClick={() => setShowAIChat((v) => !v)}
                  title="Open MedBlock AI Assistant"
                  style={{ boxShadow: '0 4px 24px rgba(80, 80, 200, 0.15)' }}
                >
                  <span className="sr-only">Open AI Chat</span>
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="url(#paint0_linear)"/><path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" fill="#fff"/><defs><linearGradient id="paint0_linear" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stopColor="#6366F1"/><stop offset="1" stopColor="#8B5CF6"/></linearGradient></defs></svg>
                </button>
              </>
            )}
          </Suspense>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeManager>
        <Router>
          <AppContent />
        </Router>
      </ThemeManager>
    </Provider>
  );
}

export default App;