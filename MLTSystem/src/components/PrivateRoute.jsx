// src/components/PrivateRoute.jsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import { getSession } from '../utils/sessionManager';

const PrivateRoute = ({ children, requiredRole }) => {
  const { currentUser, isLoading, logout } = useAuth();
  const location = useLocation();

  // Check session validity
  useEffect(() => {
    if (!isLoading && currentUser) {
      const session = getSession();
      if (!session) {
        // Session expired or invalid, logout user
        logout();
      }
    }
  }, [currentUser, isLoading, logout]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !currentUser.hasRole(requiredRole)) {
    // User doesn't have required role, redirect to dashboard
    return <Navigate to="/" replace />;
  }

  // Check if tutor needs setup (price is null or 0)
  // Only enforce this if the user is approved (active)
  if (currentUser.role === 'tutor' && currentUser.isApproved) {
    const needsSetup = !currentUser.price || parseFloat(currentUser.price) <= 0;
    const isSetupPage = location.pathname === '/tutor-setup';

    if (needsSetup && !isSetupPage) {
      return <Navigate to="/tutor-setup" replace />;
    }

    if (!needsSetup && isSetupPage) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
