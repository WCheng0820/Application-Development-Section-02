// src/components/ScheduleManager.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { formatMalaysiaDate, formatMalaysiaTime } from '../utils/dateUtils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ScheduleManager({ tutorId }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    schedule_date: '',
    start_time: '',
    end_time: ''
  });

  // Fetch schedules on component mount
  useEffect(() => {
    if (tutorId) {
      fetchSchedules();
    }
  }, [tutorId]);

  const fetchSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE}/api/schedule/${tutorId}`);
      if (response.data.success) {
        setSchedules(response.data.data || []);
      }
    } catch (err) {
      setError('Failed to load schedules');
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (schedule = null) => {
    if (schedule) {
      setEditingId(schedule.schedule_id);
      setFormData({
        schedule_date: schedule.schedule_date,
        start_time: schedule.start_time,
        end_time: schedule.end_time
      });
    } else {
      setEditingId(null);
      setFormData({
        schedule_date: '',
        start_time: '',
        end_time: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({
      schedule_date: '',
      start_time: '',
      end_time: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.schedule_date) {
      setError('Please select a date');
      return false;
    }
    if (!formData.start_time) {
      setError('Please select a start time');
      return false;
    }
    if (!formData.end_time) {
      setError('Please select an end time');
      return false;
    }
    if (formData.start_time >= formData.end_time) {
      setError('Start time must be before end time');
      return false;
    }
    setError('');
    return true;
  };

  const handleSaveSchedule = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        // Update existing schedule
        const response = await axios.put(
          `${API_BASE}/api/schedule/${tutorId}/${editingId}`,
          formData
        );
        if (response.data.success) {
          setSchedules(schedules.map(s =>
            s.schedule_id === editingId
              ? { ...s, ...formData }
              : s
          ));
          handleCloseDialog();
          setError('');
        }
      } else {
        // Add new schedule
        const response = await axios.post(
          `${API_BASE}/api/schedule/${tutorId}`,
          formData
        );
        if (response.data.success) {
          setSchedules([...schedules, response.data.data]);
          handleCloseDialog();
          setError('');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save schedule');
      console.error('Error saving schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this availability slot?')) {
      setLoading(true);
      try {
        const response = await axios.delete(
          `${API_BASE}/api/schedule/${tutorId}/${scheduleId}`
        );
        if (response.data.success) {
          setSchedules(schedules.filter(s => s.schedule_id !== scheduleId));
          setError('');
        }
      } catch (err) {
        setError('Failed to delete schedule');
        console.error('Error deleting schedule:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    return formatMalaysiaDate(dateString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString, dateContext) => {
    return formatMalaysiaTime(timeString, { dateContext });
  };

  return (
    <Card>
      <CardHeader
        title="Manage Your Availability"
        subheader="Add, edit, or remove your available teaching time slots"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={loading}
          >
            Add Availability
          </Button>
        }
      />
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && schedules.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : schedules.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No availability slots added yet. Click "Add Availability" to add your first time slot.
          </Typography>
        ) : (
          <List>
            {schedules.map((schedule) => (
              <ListItem key={schedule.schedule_id} sx={{ mb: 1, border: '1px solid #eee', borderRadius: 1 }}>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={formatDate(schedule.schedule_date)}
                        color="primary"
                        variant="outlined"
                      />
                      <Typography variant="body2">
                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                      </Typography>
                    </Stack>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => handleOpenDialog(schedule)}
                    disabled={loading}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteSchedule(schedule.schedule_id)}
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Availability' : 'Add Availability'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            type="date"
            name="schedule_date"
            label="Date"
            value={formData.schedule_date}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
            inputProps={{ min: new Date().toISOString().split('T')[0] }}
          />
          <TextField
            fullWidth
            type="time"
            name="start_time"
            label="Start Time"
            value={formData.start_time}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="time"
            name="end_time"
            label="End Time"
            value={formData.end_time}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveSchedule}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
