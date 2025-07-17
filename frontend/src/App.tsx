import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import LoadingSpinner from "./components/LoadingSpinner";
import ProtectedRoute from "./components/ProtectedRoute";

const Dashboard = React.lazy(() => import("./pages/dashboard/DashboardPage"));
const PatientsPage = React.lazy(() => import("./pages/patients/PatientsPage"));
const AppointmentsPage = React.lazy(() => import("./pages/appointments/AppointmentsPage"));
const VitalsPage = React.lazy(() => import("./pages/vitals/VitalsPage"));
const RecordsPage = React.lazy(() => import("./pages/records/RecordsPage"));
const ReportsPage = React.lazy(() => import("./pages/reports/ReportsPage"));
const BlockchainPage = React.lazy(() => import("./pages/blockchain/BlockchainPage"));
const AIPage = React.lazy(() => import("./pages/ai/AIPage"));
const AdminPage = React.lazy(() => import("./pages/admin/AdminPage"));

const LoginPage = React.lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = React.lazy(() => import("./pages/auth/RegisterPage"));
const ForgotPasswordPage = React.lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = React.lazy(() => import("./pages/auth/ResetPasswordPage"));

const UnauthorizedPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <h1 className="text-3xl font-bold text-red-600 mb-4">Unauthorized</h1>
    <p className="text-gray-700">You do not have permission to view this page.</p>
  </div>
);

function App() {
  return (
    <Router>
      <React.Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset/:token" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="patients" element={<PatientsPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="vitals" element={<VitalsPage />} />
              <Route path="records" element={<RecordsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="blockchain" element={<BlockchainPage />} />
              <Route path="ai" element={<AIPage />} />
              <Route path="admin" element={<AdminPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App;
