import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
