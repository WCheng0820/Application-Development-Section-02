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
    price: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || currentUser.profile?.username || '',
        email: currentUser.email || '',
        bio: currentUser.role === 'tutor' ? (currentUser.profile?.bio || currentUser.bio || '') : '',
        specialization: currentUser.role === 'tutor' ? (currentUser.profile?.specialization || currentUser.specialization || '') : '',
        price: currentUser.role === 'tutor' ? (currentUser.profile?.price ?? currentUser.price ?? '') : '',
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

    // Validate price when provided
    if (formData.price !== undefined && formData.price !== '') {
      const p = parseFloat(formData.price);
      if (Number.isNaN(p) || p < 0) {
        setError('Price must be a non-negative number');
        setIsLoading(false);
        return;
      }
      // normalize to 2 decimal places
      formData.price = p.toFixed(2);
    }

    try {
      // Only include specialization in update if it has a value
      const updateData = { ...formData };
      if (currentUser?.role === 'tutor' && !updateData.specialization) {
        delete updateData.specialization;
      }
      
      console.log('Updating profile with data:', updateData);
      const result = await updateProfile(updateData);
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
                <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Current Hourly Rate
                  </Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    MYR {currentUser.price ? parseFloat(currentUser.price).toFixed(2) : '0.00'} / hour
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  id="price"
                  label="Update Hourly Rate (MYR)"
                  name="price"
                  type="number"
                  inputProps={{ step: '1', min: 0 }}
                  value={formData.price}
                  onChange={handleChange}
                  helperText="Enter a new amount to update your rate"
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
                    <MenuItem value="">No change (keep current)</MenuItem>
                    <MenuItem value="HSK Test Prep">HSK Test Preparation</MenuItem>
                    <MenuItem value="Conversational">Conversational Mandarin</MenuItem>
                    <MenuItem value="Business">Business Mandarin</MenuItem>
                    <MenuItem value="Children">Children & Beginners</MenuItem>
                    <MenuItem value="Advanced">Advanced Mandarin</MenuItem>
                    <MenuItem value="General">General Chinese</MenuItem>
                  </Select>
                  <FormHelperText>Select only if you want to change your specialization</FormHelperText>
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
