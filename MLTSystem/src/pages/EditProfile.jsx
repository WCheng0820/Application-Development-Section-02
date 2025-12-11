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
  Divider,
  InputAdornment,
  IconButton,
  Grid
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ScheduleManager from '../components/ScheduleManager';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

export default function EditProfile() {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    specialization: '',
    price: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || currentUser.profile?.username || '',
        email: currentUser.email || '',
        bio: currentUser.role === 'tutor' ? (currentUser.profile?.bio || currentUser.bio || '') : '',
        specialization: currentUser.role === 'tutor' ? (currentUser.profile?.specialization || currentUser.specialization || '') : '',
        price: currentUser.role === 'tutor' ? (currentUser.profile?.price ?? currentUser.price ?? '') : '',
        password: '',
        confirmPassword: ''
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
    if (formData.password) {
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
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
      
      // Remove confirmPassword from data sent to server
      delete updateData.confirmPassword;
      
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

  const isTutor = currentUser?.role === 'tutor';
  const themeColor = isTutor ? '#2e7d32' : '#1976d2';
  const gradient = isTutor 
    ? 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)' 
    : 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)';
  const iconBg = isTutor ? 'rgba(46, 125, 50, 0.1)' : 'rgba(25, 118, 210, 0.1)';
  const iconColor = isTutor ? '#2e7d32' : '#1565c0';
  const iconBorder = isTutor ? '2px solid rgba(46, 125, 50, 0.2)' : '2px solid rgba(25, 118, 210, 0.2)';

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        pt: 10,
        pb: 4,
        px: 3,
        background: gradient,
      }}
    >
      <Container component="main" maxWidth="md">
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
          <Avatar
            sx={{ 
              width: 64, 
              height: 64, 
              bgcolor: iconBg, 
              color: iconColor,
              fontSize: '1.5rem',
              boxShadow: 2,
              border: iconBorder
            }}
          >
            {currentUser.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ color: iconColor }}>
              Edit Profile
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              Update your personal information and settings
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
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 600 }}>
                  <PersonIcon /> Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="username"
                  name="username"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  value={formData.username}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "rgba(255,255,255,0.5)",
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "rgba(255,255,255,0.5)",
                    }
                  }}
                />
              </Grid>

              {currentUser?.role === 'tutor' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 600 }}>
                      <EditIcon /> Tutor Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  
                  <Grid item xs={12}>
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
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "rgba(255,255,255,0.5)",
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2, border: '1px solid rgba(25, 118, 210, 0.1)' }}>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom fontWeight="bold">
                        CURRENT HOURLY RATE
                      </Typography>
                      <Typography variant="h5" color="primary.main" fontWeight="bold">
                        MYR {currentUser.price ? parseFloat(currentUser.price).toFixed(2) : '0.00'} <Typography component="span" variant="body2" color="text.secondary">/ hour</Typography>
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
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
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "rgba(255,255,255,0.5)",
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "rgba(255,255,255,0.5)",
                        }
                      }}>
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
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 600 }}>
                  <Visibility /> Security
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="password"
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  helperText="Leave blank to keep current password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "rgba(255,255,255,0.5)",
                    }
                  }}
                />
              </Grid>
              
              {formData.password && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="confirmPassword"
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    helperText="Re-enter your new password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "rgba(255,255,255,0.5)",
                      }
                    }}
                  />
                </Grid>
              )}
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={() => navigate('/')}
                startIcon={<CancelIcon />}
                sx={{ py: 1.5, borderRadius: 2, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={<SaveIcon />}
                sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
              >
                {isLoading ? 'Updating...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Schedule Manager for tutors */}
        {currentUser?.role === 'tutor' && currentUser?.profile?.tutorId && (
          <Box sx={{ mt: 4, mb: 4 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
              }}
            >
              <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
                Manage Schedule
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <ScheduleManager tutorId={currentUser.profile.tutorId} />
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
}
