import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Alert, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  InputAdornment
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TutorSetup() {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      setError('Please enter a valid hourly rate greater than 0.');
      return;
    }

    setLoading(true);
    try {
      const result = await updateProfile({ price: priceValue });
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: '#f5f5f5',
        p: 3
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          maxWidth: 600, 
          width: '100%', 
          p: 4, 
          borderRadius: 2 
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Welcome to MLT System!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Congratulations on your approval! Before you start teaching, please set up your tutoring profile.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon color="success" fontSize="small" />
            Tutor Guidelines
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckCircleIcon fontSize="small" color="action" /></ListItemIcon>
              <ListItemText primary="Be professional and punctual for all sessions." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon fontSize="small" color="action" /></ListItemIcon>
              <ListItemText primary="Maintain a high standard of teaching and respect students." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon fontSize="small" color="action" /></ListItemIcon>
              <ListItemText primary="Respond to student inquiries within 24 hours." />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MonetizationOnIcon color="primary" fontSize="small" />
              Set Your Hourly Rate
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please set your tutoring rate in MYR per hour. 
              <br />
              <strong>Recommended:</strong> MYR 30 - MYR 100 per hour based on your experience.
            </Typography>
            
            <TextField
              fullWidth
              label="Hourly Rate (MYR)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">MYR</InputAdornment>,
              }}
              helperText="You cannot set a rate of 0. This ensures fair compensation."
              error={!!error}
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            size="large"
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? 'Saving...' : 'Complete Setup'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
