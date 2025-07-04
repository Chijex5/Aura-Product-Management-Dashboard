import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardSkeletonLoader from './loaders/SkeletonLoader';
interface ProtectedRouteProps {
  children: React.ReactNode;
}
export default function ProtectedRoute({
  children
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isCheckingAuth,
    isLoading
  } = useAuth();
  const location = useLocation();
  if (isCheckingAuth || isLoading) {
    return <DashboardSkeletonLoader />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{
      from: location
    }} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
}