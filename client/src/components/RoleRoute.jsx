import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const RoleRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard
    switch (user.role) {
      case 'CUSTOMER':
        return <Navigate to="/customer/dashboard" />;
      case 'CUSTOMER_SERVICE_OFFICER':
        return <Navigate to="/officer/dashboard" />;
      case 'BANK_MANAGER':
        return <Navigate to="/manager/dashboard" />;
      case 'SYSTEM_ADMIN':
        return <Navigate to="/admin/dashboard" />;
      default:
        return <Navigate to="/login" />;
    }
  }

  return <Outlet />;
};

export default RoleRoute;
