// src/pages/EditProfile.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ScheduleManager from '../components/ScheduleManager';

export default function EditProfile() {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    specialization: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || currentUser.profile.username || '',
        email: currentUser.email || '',
        bio: currentUser.role === 'tutor' ? (currentUser.profile.bio || '') : '',
        specialization: currentUser.role === 'tutor' ? (currentUser.profile.specialization || '') : '',
        password: ''
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validation
    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Updating profile with data:', formData);
      const result = await updateProfile(formData);
      console.log('Update result:', result);
      if (result.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(`An error occurred while updating profile: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          Please log in to edit your profile.
        </Typography>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{ width: 80, height: 80, bgcolor: 'primary.main', mb: 2 }}
            >
              {currentUser.username?.[0]?.toUpperCase()}
            </Avatar>
            <Typography component="h1" variant="h4" align="center">
              Edit Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Role: {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              autoComplete="username"
              name="username"
              required
              fullWidth
              id="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            {currentUser?.role === 'tutor' && (
              <>
                <TextField
                  fullWidth
                  id="bio"
                  label="Bio"
                  name="bio"
                  multiline
                  rows={4}
                  placeholder="Tell students about your teaching style..."
                  value={formData.bio}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Specialization</InputLabel>
                  <Select
                    name="specialization"
                    value={formData.specialization}
                    label="Specialization"
                    onChange={handleChange}
                  >
                    <MenuItem value="">Select a specialization</MenuItem>
                    <MenuItem value="HSK Test Prep">HSK Test Preparation</MenuItem>
                    <MenuItem value="Conversational">Conversational Mandarin</MenuItem>
                    <MenuItem value="Business">Business Mandarin</MenuItem>
                    <MenuItem value="Children">Children & Beginners</MenuItem>
                    <MenuItem value="Advanced">Advanced Mandarin</MenuItem>
                    <MenuItem value="General">General Chinese</MenuItem>
                  </Select>
                  <FormHelperText>Choose your primary teaching specialization</FormHelperText>
                </FormControl>
              </>
            )}
            <TextField
              fullWidth
              name="password"
              label="New Password (leave blank to keep current)"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/')}
              sx={{ mb: 2 }}
            >
              Cancel
            </Button>
          </Box>
        </Paper>

        {/* Schedule Manager for tutors */}
        {currentUser?.role === 'tutor' && currentUser?.profile?.tutorId && (
          <Box sx={{ mt: 4 }}>
            <ScheduleManager tutorId={currentUser.profile.tutorId} />
          </Box>
        )}
      </Box>
    </Container>
  );
}
