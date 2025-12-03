// src/pages/ManageSchedule.jsx
import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
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
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Manage Schedule</Typography>
      <ScheduleManager tutorId={tutorId} />
    </Container>
  );
}
