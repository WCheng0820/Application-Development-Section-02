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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import * as AdminController from '../controllers/AdminController';
import { formatMalaysiaDate as formatDate } from '../utils/dateUtils';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editUser, setEditUser] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await AdminController.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditUser({ ...user });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditUser(null);
  };

  const handleSaveUser = async () => {
    if (!editUser) return;
    setActionLoading(true);
    try {
      await AdminController.updateUser(editUser.id, {
        status: editUser.status,
        role: editUser.role
      });
      await fetchUsers();
      handleCloseEditDialog();
      alert('User updated successfully');
    } catch (err) {
      console.error('Failed to update user:', err);
      alert('Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    setActionLoading(true);
    try {
      await AdminController.deleteUser(userId);
      await fetchUsers();
      alert('User deleted successfully');
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e5b8f5 0%, #f3e0f9 100%)',
        pt: 10, 
        pb: 4, 
        px: 4 
      }}
    >
      {/* Header */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 4, 
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
            Manage Users
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            View and manage all user accounts
          </Typography>
        </Box>
        <IconButton onClick={fetchUsers} sx={{ color: '#7b1fa2', bgcolor: 'rgba(123, 31, 162, 0.1)', '&:hover': { bgcolor: 'rgba(123, 31, 162, 0.2)' } }}>
          <RefreshIcon />
        </IconButton>
      </Paper>

      {/* Filters and Search */}
      <Paper 
        elevation={3}
        sx={{ 
          mb: 4, 
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          p: 3
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search username, email or ID..."
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
            }}
            sx={{ flexGrow: 1, minWidth: '250px' }}
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['all', 'student', 'tutor', 'admin'].map((role) => (
              <Chip
                key={role}
                label={role.charAt(0).toUpperCase() + role.slice(1)}
                onClick={() => setRoleFilter(role)}
                color={roleFilter === role ? 'secondary' : 'default'}
                variant={roleFilter === role ? 'filled' : 'outlined'}
                clickable
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Users Table */}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 4, 
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(156, 39, 176, 0.1)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>User ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>Joined Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No users found matching your criteria.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.userId}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {user.username}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      size="small" 
                      color={user.role === 'admin' ? 'secondary' : user.role === 'tutor' ? 'primary' : 'default'}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.status} 
                      color={getStatusColor(user.status)} 
                      size="small" 
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit User">
                      <IconButton 
                        color="primary" 
                        size="small"
                        onClick={() => handleEditClick(user)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {user.role !== 'admin' && (
                      <Tooltip title="Delete User">
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <DeleteIcon />
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

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 300 }}>
          {editUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Username"
                value={editUser.username}
                disabled
                fullWidth
              />
              <TextField
                label="Email"
                value={editUser.email}
                disabled
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editUser.status}
                  label="Status"
                  onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editUser.role}
                  label="Role"
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="tutor">Tutor</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained" disabled={actionLoading}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
