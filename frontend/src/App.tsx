import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Toaster } from 'react-hot-toast';

// Layouts
import AuthenticatedLayout from './layouts/AuthenticatedLayout';

// Lazy load page components
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const PatientsPage = React.lazy(() => import('./pages/PatientsPage'));
const AppointmentsPage = React.lazy(() => import('./pages/AppointmentsPage'));
const MedicalRecordsPage = React.lazy(() => import('./pages/MedicalRecordsPage'));
const VitalsPage = React.lazy(() => import('./pages/VitalsPage'));
const ReportsPage = React.lazy(() => import('./pages/ReportsPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const BlockchainPage = React.lazy(() => import('./pages/BlockchainPage'));
const AIChatPage = React.lazy(() => import('./pages/AIChatPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Styles
import './index.css';

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading MedBlock...</p>
    </div>
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected Routes for all authenticated users */}
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
              <Route path="blockchain" element={<BlockchainPage />} />
              <Route path="ai-chat" element={<AIChatPage />} />
            </Route>

            {/* Admin-Only Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AuthenticatedLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminPage />} />
              {/* Add more admin-only routes here if needed */}
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Router>
    </Provider>
  );
}

export default App;
