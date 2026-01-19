import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import CancelIcon from '@mui/icons-material/Cancel';
import * as AdminController from '../controllers/AdminController';
import { formatMalaysiaDate as formatDate, formatMalaysiaTime as formatTime } from '../utils/dateUtils';

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await AdminController.getAllSessions();
      setSessions(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setError('Failed to load sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSession = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this session? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      await AdminController.cancelSession(bookingId);
      // Refresh list
      await fetchSessions();
      alert('Session cancelled successfully');
    } catch (err) {
      console.error('Failed to cancel session:', err);
      alert('Failed to cancel session. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.tutorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #e5b8f5 0%, #f3e0f9 100%)', 
      minHeight: "100vh", 
      pt: 10, 
      pb: 4, 
      px: 4 
    }}>
      {/* Header */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 4, 
          mx: 4, 
          borderRadius: 4, 
          mb: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#7b1fa2' }}>
            Manage Bookings
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Track and manage all tutoring sessions
          </Typography>
        </Box>
        <IconButton onClick={fetchSessions} sx={{ color: '#7b1fa2', bgcolor: 'rgba(123, 31, 162, 0.1)', '&:hover': { bgcolor: 'rgba(123, 31, 162, 0.2)' } }}>
          <RefreshIcon />
        </IconButton>
      </Paper>

      {/* Filters and Search */}
      <Paper 
        sx={{ 
          mb: 4, 
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search tutor, student or subject..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { bgcolor: 'white', borderRadius: 2 }
            }}
            sx={{ flexGrow: 1, minWidth: '250px' }}
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <Chip
                key={status}
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                onClick={() => setStatusFilter(status)}
                color={statusFilter === status ? 'primary' : 'default'}
                variant={statusFilter === status ? 'filled' : 'outlined'}
                clickable
                sx={{ fontWeight: statusFilter === status ? 'bold' : 'normal' }}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Sessions Table */}
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 3, 
          boxShadow: 3,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(156, 39, 176, 0.1)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>Date & Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>Tutor</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress color="secondary" />
                </TableCell>
              </TableRow>
            ) : filteredSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No sessions found matching your criteria.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredSessions.map((session) => (
                <TableRow key={session.bookingId} hover sx={{ '&:hover': { bgcolor: 'rgba(156, 39, 176, 0.05)' } }}>
                  <TableCell>#{session.bookingId}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {formatDate(session.booking_date)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(session.start_time)} - {formatTime(session.end_time)}
                    </Typography>
                  </TableCell>
                  <TableCell>{session.tutorName || 'Unknown'}</TableCell>
                  <TableCell>{session.studentName || 'Unknown'}</TableCell>
                  <TableCell>{session.subject || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={session.status} 
                      color={getStatusColor(session.status)} 
                      size="small" 
                      sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>
                    {session.status !== 'cancelled' && session.status !== 'completed' && (
                      <Tooltip title="Cancel Session">
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleCancelSession(session.bookingId)}
                          disabled={actionLoading}
                          sx={{ bgcolor: 'rgba(211, 47, 47, 0.1)', '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.2)' } }}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
