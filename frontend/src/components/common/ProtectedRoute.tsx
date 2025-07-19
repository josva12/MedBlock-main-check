import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

// ========= THE FIX IS HERE =========
// We now import each hook from its correct source file.
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector'; // This was the missing link
// ===================================

import { getCurrentUser } from '../../features/auth/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'doctor' | 'nurse' | 'front-desk' | 'pharmacy';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const dispatch = useAppDispatch();
  
  // This line will now work correctly
  const { isAuthenticated, user, isLoading, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // This effect is crucial for handling page reloads.
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, user]);


  // While we are checking for the user (on a page refresh), show a loading spinner.
  if (isLoading || (token && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-blue-600"></div>
        <p className="sr-only">Loading...</p>
      </div>
    );
  }

  // If the loading is finished and the user is NOT authenticated, redirect to the login page.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and the user's role does not match, show an "Access Denied" message.
  if (requiredRole && user && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="text-center bg-white p-10 rounded-lg shadow-xl">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-lg text-gray-700 mb-6">
            You do not have the required permissions to view this page.
          </p>
          <p className="text-md text-gray-500">
            Required role: <span className="font-semibold text-gray-800">{requiredRole}</span> | Your role: <span className="font-semibold text-gray-800">{user.role}</span>
          </p>
        </div>
      </div>
    );
  }

  // If all checks pass, render the child components (e.g., the AuthenticatedLayout with the page).
  return <>{children}</>;
};

export default ProtectedRoute;