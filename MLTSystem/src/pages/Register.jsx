// src/pages/Register.jsx
import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Grid
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SchoolIcon from '@mui/icons-material/School';
import BadgeIcon from '@mui/icons-material/Badge';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nophone: '',
    role: 'student',
    // Student fields
    yearOfStudy: 1,
    programme: '',
    faculty: '',
    // Tutor fields
    yearsOfExperience: 0,
    bio: '',
    specialization: ''
  });
  const [verificationDocuments, setVerificationDocuments] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const filePromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              data: event.target.result
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises)
        .then(fileData => {
          setVerificationDocuments(fileData);
        })
        .catch(err => {
          setError('Error reading file. Please try again.');
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.username || !formData.username.trim()) {
      setError('Username is required');
      return;
    }

    if (!formData.email || !formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // For tutors, require verification documents
    if (formData.role === 'tutor' && verificationDocuments.length === 0) {
      setError('Please upload verification documents to show your experience in teaching Mandarin');
      return;
    }

    setIsLoading(true);

    try {
      const registrationData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        nophone: formData.nophone.trim() || null,
        verificationDocuments: formData.role === 'tutor' ? verificationDocuments : [],
        yearOfStudy: formData.role === 'student' ? parseInt(formData.yearOfStudy) || 1 : undefined,
        programme: formData.role === 'student' ? formData.programme.trim() || null : undefined,
        faculty: formData.role === 'student' ? formData.faculty.trim() || null : undefined,
        yearsOfExperience: formData.role === 'tutor' ? parseInt(formData.yearsOfExperience) || 0 : undefined,
        bio: formData.role === 'tutor' ? formData.bio.trim() || null : undefined,
        specialization: formData.role === 'tutor' ? formData.specialization || null : undefined
      };

      const result = await register(registrationData);
      if (result.success) {
        if (formData.role === 'tutor') {
          alert('Registration successful! Your account is pending admin approval. You will be notified once approved.');
          navigate('/login');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #6db3f2 0%, #a8d5ff 100%)',
        py: 4
      }}
    >
      <Container component="main" maxWidth="md">
        <Paper 
          elevation={6} 
          sx={{ 
            p: 4, 
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box 
              sx={{ 
                bgcolor: 'secondary.main', 
                color: 'white', 
                p: 2, 
                borderRadius: '50%', 
                mb: 2,
                boxShadow: 3
              }}
            >
              <PersonAddIcon fontSize="large" />
            </Box>
            <Typography component="h1" variant="h4" fontWeight="bold" color="primary">
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join our community of learners and tutors
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Info Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BadgeIcon color="action" /> Basic Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  helperText="Choose a unique username"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="nophone"
                  label="Phone Number"
                  name="nophone"
                  type="tel"
                  value={formData.nophone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="role-label">I want to be a</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    name="role"
                    value={formData.role}
                    label="I want to be a"
                    onChange={handleChange}
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="tutor">Tutor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Password Section */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  helperText="At least 6 characters"
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  helperText="Re-enter your password"
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
                />
              </Grid>

              {/* Role Specific Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon color="action" /> {formData.role === 'student' ? 'Student Details' : 'Tutor Profile'}
                </Typography>
              </Grid>

              {formData.role === 'student' ? (
                <>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      name="yearOfStudy"
                      label="Year of Study"
                      value={formData.yearOfStudy}
                      onChange={handleChange}
                      inputProps={{ min: 1, max: 10 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      name="programme"
                      label="Programme"
                      value={formData.programme}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      name="faculty"
                      label="Faculty"
                      value={formData.faculty}
                      onChange={handleChange}
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      name="yearsOfExperience"
                      label="Years of Experience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Specialization</InputLabel>
                      <Select
                        name="specialization"
                        value={formData.specialization}
                        label="Specialization"
                        onChange={handleChange}
                      >
                        <MenuItem value="">Select...</MenuItem>
                        <MenuItem value="HSK Test Prep">HSK Test Prep</MenuItem>
                        <MenuItem value="Conversational">Conversational</MenuItem>
                        <MenuItem value="Business">Business</MenuItem>
                        <MenuItem value="Children">Children & Beginners</MenuItem>
                        <MenuItem value="Advanced">Advanced</MenuItem>
                        <MenuItem value="General">General Chinese</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="bio"
                      label="Bio / Teaching Style"
                      value={formData.bio}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      placeholder="Tell students about yourself..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                      <Typography variant="subtitle2" gutterBottom>Verification Documents</Typography>
                      <input
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        style={{ display: 'none' }}
                        id="verification-documents-upload"
                        multiple
                        type="file"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="verification-documents-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<UploadFileIcon />}
                          size="small"
                        >
                          Upload Files
                        </Button>
                      </label>
                      <FormHelperText>Upload certificates or credentials (required for tutors)</FormHelperText>
                      
                      {verificationDocuments.length > 0 && (
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {verificationDocuments.map((doc, index) => (
                            <Typography key={index} variant="caption" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', px: 1, py: 0.5, borderRadius: 1 }}>
                              {doc.name}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </>
              )}
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ 
                mt: 4, 
                mb: 2, 
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 'bold',
                textTransform: 'none',
                boxShadow: 2
              }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" variant="body2" fontWeight="bold">
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
