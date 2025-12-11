// src/pages/ManageSchedule.jsx
import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Paper } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScheduleManager from '../components/ScheduleManager';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ManageSchedule() {
  const [tutorId, setTutorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = sessionStorage.getItem('mlt_session_token');
        const res = await fetch(`${API_BASE}/api/auth/verify`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || 'Failed to get user info');
          setLoading(false);
          return;
        }
        // tutorId should be available for tutors
        const id = data.tutorId || data.user?.tutorId || data.tutorId || data.user?.profile?.tutorId;
        // If the API returns user object inside 'user'
        const tutorIdentifier = data.tutorId || (data.user && data.user.tutorId) || null;
        if (tutorIdentifier) {
          setTutorId(tutorIdentifier);
        } else if (data.data && data.data.tutorId) {
          setTutorId(data.data.tutorId);
        } else if (data.user && data.user.tutorId) {
          setTutorId(data.user.tutorId);
        } else {
          // Try fallback: the verify endpoint may return top-level id fields
          setTutorId(null);
        }
      } catch (err) {
        console.error('Error fetching verify:', err);
        setError('Failed to fetch user info');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!tutorId) {
    return (
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <Alert severity="warning">No tutor profile found for current user. Ensure you're logged in as a tutor.</Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pt: 10,
        pb: 4,
        px: 3,
        background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
      }}
    >
      <Container maxWidth="md">
        {/* Header Section */}
        <Paper
          elevation={3}
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CalendarTodayIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ color: '#2e7d32' }}>
              Manage Schedule
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              Set your availability for student bookings
            </Typography>
          </Box>
        </Paper>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          }}
        >
          <ScheduleManager tutorId={tutorId} />
        </Paper>
      </Container>
    </Box>
  );
}
