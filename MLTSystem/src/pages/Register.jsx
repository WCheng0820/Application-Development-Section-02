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
  FormHelperText
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../models/Role';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    nophone: '',
    role: 'student',
    // Student fields
    yearOfStudy: 1,
    programme: '',
    faculty: '',
    // Tutor fields
    yearsOfExperience: 0,
    availability: ''
  });
  const [verificationDocuments, setVerificationDocuments] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Convert files to base64 for storage (in a real app, upload to server)
      const filePromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              data: event.target.result // base64 encoded
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

    // For tutors, require verification documents
    if (formData.role === 'tutor' && verificationDocuments.length === 0) {
      setError('Please upload verification documents to show your experience in teaching Mandarin');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare registration data with all form fields
      const registrationData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        fullName: formData.fullName.trim(),
        nophone: formData.nophone.trim() || null,
        verificationDocuments: formData.role === 'tutor' ? verificationDocuments : [],
        // Student-specific fields
        yearOfStudy: formData.role === 'student' ? parseInt(formData.yearOfStudy) || 1 : undefined,
        programme: formData.role === 'student' ? formData.programme.trim() || null : undefined,
        faculty: formData.role === 'student' ? formData.faculty.trim() || null : undefined,
        // Tutor-specific fields
        yearsOfExperience: formData.role === 'tutor' ? parseInt(formData.yearsOfExperience) || 0 : undefined,
        availability: formData.role === 'tutor' ? formData.availability.trim() || null : undefined
      };

      const result = await register(registrationData);
      if (result.success) {
        if (formData.role === 'tutor') {
          // Show success message and redirect to login
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
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Sign Up
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Join Mandarin Tutoring today
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              autoFocus
              sx={{ mb: 2 }}
              helperText="Choose a unique username for login"
            />
            <TextField
              autoComplete="name"
              name="fullName"
              required
              fullWidth
              id="fullName"
              label="Full Name"
              value={formData.fullName}
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
            <TextField
              fullWidth
              id="nophone"
              label="Phone Number"
              name="nophone"
              type="tel"
              value={formData.nophone}
              onChange={handleChange}
              sx={{ mb: 2 }}
              helperText="Optional contact number"
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleChange}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="tutor">Tutor</MenuItem>
              </Select>
            </FormControl>
            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              sx={{ mb: 2 }}
              helperText="Must be at least 6 characters"
            />

            {/* Student-specific fields */}
            {formData.role === 'student' && (
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  type="number"
                  name="yearOfStudy"
                  label="Year of Study"
                  value={formData.yearOfStudy}
                  onChange={handleChange}
                  inputProps={{ min: 1, max: 10 }}
                  sx={{ mb: 2 }}
                  helperText="What year are you in?"
                />
                <TextField
                  fullWidth
                  name="programme"
                  label="Programme/Course"
                  value={formData.programme}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                  helperText="e.g., Computer Science, Engineering"
                />
                <TextField
                  fullWidth
                  name="faculty"
                  label="Faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  helperText="e.g., Faculty of Engineering"
                />
              </Box>
            )}

            {/* Tutor-specific fields */}
            {formData.role === 'tutor' && (
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  type="number"
                  name="yearsOfExperience"
                  label="Years of Experience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                  sx={{ mb: 2 }}
                  helperText="How many years of teaching experience do you have?"
                />
                <TextField
                  fullWidth
                  name="availability"
                  label="Availability"
                  value={formData.availability}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                  helperText="e.g., Monday-Friday, 9am-5pm"
                />
              </Box>
            )}

            {formData.role === 'tutor' && (
              <Box sx={{ mb: 2 }}>
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
                    fullWidth
                    startIcon={<UploadFileIcon />}
                    sx={{ mb: 1 }}
                  >
                    Upload Verification Documents
                  </Button>
                </label>
                <FormHelperText>
                  Upload documents showing your experience in teaching Mandarin (e.g., certificates, diplomas, teaching credentials)
                </FormHelperText>
                {verificationDocuments.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {verificationDocuments.length} file(s) selected:
                    </Typography>
                    {verificationDocuments.map((doc, index) => (
                      <Typography key={index} variant="caption" display="block" color="success.main">
                        • {doc.name}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                {"Already have an account? Sign In"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
