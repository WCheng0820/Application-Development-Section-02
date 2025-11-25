// src/components/SessionTimeout.jsx
// Component to warn users about session expiration
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSessionTimeRemaining } from '../utils/sessionManager';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  LinearProgress,
  Box
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before expiration

export default function SessionTimeout() {
  const { currentUser, logout, getSessionInfo } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      setShowWarning(false);
      return;
    }

    const checkSession = () => {
      const remaining = getSessionTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining > 0 && remaining <= WARNING_TIME) {
        setShowWarning(true);
      } else if (remaining === 0) {
        // Session expired, logout
        logout();
        setShowWarning(false);
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkSession();

    // Check every 30 seconds
    const interval = setInterval(checkSession, 30000);

    return () => clearInterval(interval);
  }, [currentUser, logout]);

  const handleExtendSession = () => {
    // In a real app, this would call an API to refresh the session
    // For now, we'll just close the warning (session refresh happens automatically)
    setShowWarning(false);
  };

  const handleLogout = () => {
    logout();
    setShowWarning(false);
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!showWarning || !currentUser) {
    return null;
  }

  return (
    <Dialog
      open={showWarning}
      onClose={handleExtendSession}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          <Typography variant="h6">Session Expiring Soon</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Your session will expire in {formatTime(timeRemaining)}. Would you like to continue?
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(timeRemaining / WARNING_TIME) * 100}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLogout} color="error">
          Logout
        </Button>
        <Button onClick={handleExtendSession} variant="contained" color="primary">
          Continue Session
        </Button>
      </DialogActions>
    </Dialog>
  );
}

