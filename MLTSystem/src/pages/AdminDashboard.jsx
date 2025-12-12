// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Button,
  Alert,
  Divider,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField as MuiTextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SearchIcon from "@mui/icons-material/Search";
import FolderIcon from "@mui/icons-material/Folder";
import MessageIcon from "@mui/icons-material/Message";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SettingsIcon from "@mui/icons-material/Settings";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";
import DescriptionIcon from "@mui/icons-material/Description";
import FlagIcon from "@mui/icons-material/Flag";
import { useAuth } from "../context/AuthContext";
import * as AdminController from '../controllers/AdminController';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [pendingTutors, setPendingTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [viewDocumentsDialog, setViewDocumentsDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchPendingUsers();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await AdminController.getDashboardStats();
      console.log('Dashboard stats received:', data);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const tutors = await AdminController.getPendingTutors();
      setPendingTutors(tutors);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      setPendingTutors([]);
    }
  };

  const handleApprove = async (tutorId) => {
    setLoading(true);
    try {
      const result = await AdminController.approveTutor(tutorId);
      if (result.success) {
        // Refresh the list and stats
        await fetchPendingUsers();
        await fetchStats();
        alert('Tutor approved successfully!');
      } else {
        alert(`Error approving tutor: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error approving tutor:', error);
      alert('Error approving tutor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (tutorId) => {
    if (!window.confirm('Are you sure you want to reject this tutor registration?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await AdminController.rejectTutor(tutorId);
      if (result.success) {
        // Refresh the list and stats
        await fetchPendingUsers();
        await fetchStats();
        alert('Tutor rejected successfully!');
      } else {
        alert(`Error rejecting tutor: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error rejecting tutor:', error);
      alert('Error rejecting tutor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocuments = (tutor) => {
    setSelectedTutor(tutor);
    setViewDocumentsDialog(true);
  };

  const handleCloseDocumentsDialog = () => {
    setViewDocumentsDialog(false);
    setSelectedTutor(null);
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #e5b8f5 0%, #f3e0f9 100%)',
      minHeight: "100vh", 
      pt: 10, 
      pb: 4 
    }}>
      {/* Header Section with Gradient */}
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
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", mr: 2, color: '#7b1fa2' }}>
            Welcome back, {currentUser?.username}!
          </Typography>
          <Chip
            label="Admin"
            sx={{ bgcolor: 'rgba(123, 31, 162, 0.1)', color: '#7b1fa2', fontWeight: 'bold' }}
            size="small"
          />
        </Box>
        {currentUser?.profile.bio && (
          <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}>
            "{currentUser.profile.bio}"
          </Typography>
        )}
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          System administration and management overview
        </Typography>
      </Paper>

      {/* Main Content */}
      <Box sx={{ px: 4 }}>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { title: "Total Users", value: stats ? (Number(stats.users?.totalStudents || 0) + Number(stats.users?.totalTutors || 0)) : '...', icon: <PeopleIcon sx={{ fontSize: 40, color: '#1976d2' }} />, color: '#e3f2fd' },
            { title: "Total Bookings", value: stats ? (stats.bookings?.totalBookings || 0) : '...', icon: <AccessTimeIcon sx={{ fontSize: 40, color: '#2e7d32' }} />, color: '#e8f5e9' },
            { title: "Pending Reports", value: stats ? (stats.reports?.pendingReports || 0) : '...', icon: <FlagIcon sx={{ fontSize: 40, color: '#d32f2f' }} />, color: '#ffebee' },
            { title: "Pending Approvals", value: pendingTutors.length, icon: <PendingActionsIcon sx={{ fontSize: 40, color: '#ed6c02' }} />, color: '#fff3e0' }
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  borderRadius: 3, 
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="text.primary">
                        {item.value}
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        bgcolor: item.color, 
                        p: 1, 
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {item.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pending Tutors Section */}
        <Card sx={{ 
          mb: 4, 
          borderRadius: 3, 
          boxShadow: 2,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{ bgcolor: '#fff3e0', p: 1, borderRadius: 1.5, mr: 2 }}>
                  <PendingActionsIcon sx={{ color: '#ed6c02' }} />
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  Pending Tutor Approvals ({pendingTutors.length})
                </Typography>
              </Box>
              
              {pendingTutors.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4, opacity: 0.7 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 48, color: 'success.light', mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      All caught up! No pending tutor approvals.
                    </Typography>
                  </Box>
              ) : (
                  <>
                  <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    {pendingTutors.length} tutor{pendingTutors.length > 1 ? 's' : ''} {pendingTutors.length > 1 ? 'are' : 'is'} waiting for approval
                  </Alert>
                  {pendingTutors.map((tutor) => (
                    <Paper
                      key={tutor.tutorId}
                      elevation={0}
                      sx={{ 
                        p: 3, 
                        mb: 2, 
                        bgcolor: '#f8f9fa', 
                        borderRadius: 2,
                        border: '1px solid #e0e0e0',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: '#bdbdbd',
                          bgcolor: '#fff'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ flex: 1, minWidth: '300px' }}>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Typography variant="h6" fontWeight="bold">
                              {tutor.name || 'Unknown Tutor'}
                            </Typography>
                            <Chip label={`ID: ${tutor.tutorId}`} size="small" variant="outlined" />
                          </Box>
                          
                          <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
                                <AccessTimeIcon fontSize="small" /> Availability: {tutor.availability || 'Not specified'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
                                <PeopleIcon fontSize="small" /> Experience: {tutor.yearsOfExperience || 0} years
                              </Typography>
                            </Grid>
                          </Grid>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip
                              label={`${tutor.verificationDocuments?.length || 0} document(s)`}
                              size="small"
                              color={tutor.verificationDocuments?.length > 0 ? "primary" : "default"}
                              icon={<DescriptionIcon />}
                            />
                            {tutor.verificationDocuments && tutor.verificationDocuments.length > 0 && (
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => handleViewDocuments(tutor)}
                                startIcon={<DescriptionIcon />}
                              >
                                View Documents
                              </Button>
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleOutlineIcon />}
                            onClick={() => handleApprove(tutor.tutorId)}
                            disabled={loading}
                            disableElevation
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleReject(tutor.tutorId)}
                            disabled={loading}
                          >
                            Reject
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                  </>
              )}
            </CardContent>
          </Card>

        {/* View Documents Dialog */}
        <Dialog
          open={viewDocumentsDialog}
          onClose={handleCloseDocumentsDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <DescriptionIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Verification Documents
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              For {selectedTutor?.name || 'Unknown Tutor'}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedTutor?.verificationDocuments && selectedTutor.verificationDocuments.length > 0 ? (
              <Box>
                {selectedTutor.verificationDocuments.map((doc, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {doc.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Type: {doc.type} | Size: {(doc.size / 1024).toFixed(2)} KB
                        </Typography>
                      </Box>
                      {!doc.type.startsWith('image/') && (
                        <Button
                          variant="outlined"
                          size="small"
                          href={doc.data}
                          target="_blank"
                          download={doc.name}
                          startIcon={<DescriptionIcon />}
                        >
                          Download
                        </Button>
                      )}
                    </Box>
                    
                    {doc.data && doc.type.startsWith('image/') && (
                      <Box 
                        sx={{ 
                          mt: 2, 
                          bgcolor: '#f5f5f5', 
                          p: 2, 
                          borderRadius: 2, 
                          textAlign: 'center' 
                        }}
                      >
                        <img
                          src={doc.data}
                          alt={doc.name}
                          style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        />
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <DescriptionIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">No documents available for this tutor.</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
            <Button onClick={handleCloseDocumentsDialog} variant="contained">Close</Button>
          </DialogActions>
        </Dialog>

        {/* Bottom Sections */}
        <Grid container spacing={3}>
          {/* System Overview */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              height: "100%", 
              borderRadius: 3, 
              boxShadow: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  System Overview
                </Typography>
                {[
                  { title: "New Registrations", value: stats ? `${stats.newRegistrations || 0} today` : '...', status: "up", icon: <PeopleIcon /> },
                  { title: "Active Tutors", value: stats ? `${stats.users?.activeTutors || 0} active` : '...', status: "stable", icon: <CheckCircleIcon /> },
                  { title: "Completed Sessions", value: stats ? `${stats.bookings?.completedBookings || 0} total` : '...', status: "up", icon: <CheckCircleIcon /> },
                  { title: "Total Reports", value: stats ? `${stats.reports?.totalReports || 0} filed` : '...', status: "stable", icon: <FlagIcon /> },
                ].map((item, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 2,
                      mb: 2,
                      bgcolor: "#f8f9fa",
                      borderRadius: 2,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box sx={{ color: 'text.secondary' }}>{item.icon}</Box>
                      <Box>
                        <Typography fontWeight="bold" variant="subtitle2">{item.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.value}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={item.status === 'up' ? 'Increasing' : 'Stable'} 
                      color={item.status === 'up' ? 'success' : 'default'} 
                      size="small" 
                      variant="outlined"
                    />
                  </Box>
                ))}

                <Button 
                  variant="text" 
                  fullWidth 
                  sx={{ mt: 1 }} 
                  href="/reports"
                  endIcon={<ArrowForwardIcon />}
                >
                  View Detailed Reports
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Admin Actions */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              height: "100%", 
              borderRadius: 3, 
              boxShadow: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Admin Actions
                </Typography>
                <List disablePadding>
                  {[
                    { text: "Manage Users", icon: <PeopleIcon />, path: "/admin/users", color: '#2196f3', desc: "View and edit user accounts" },
                    { text: "Monitor Sessions", icon: <ScheduleIcon />, path: "/admin/sessions", color: '#9c27b0', desc: "Track active sessions" },
                    { text: "View Reports", icon: <FolderIcon />, path: "/reports", color: '#f44336', desc: "Handle user reports" },
                    { text: "Messages", icon: <MessageIcon />, path: "/messages", color: '#607d8b', desc: "Communicate with users" },
                  ].map((item, i) => (
                    <ListItem 
                      key={i} 
                      button 
                      component="a" 
                      href={item.path}
                      sx={{ 
                        mb: 2, 
                        borderRadius: 2, 
                        border: '1px solid #f0f0f0',
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}
                    >
                      <ListItemIcon>
                        <Box sx={{ bgcolor: `${item.color}15`, p: 1, borderRadius: 1.5, color: item.color }}>
                          {item.icon}
                        </Box>
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        secondary={item.desc}
                        primaryTypographyProps={{ fontWeight: 'bold', variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <ArrowForwardIcon fontSize="small" color="action" sx={{ opacity: 0.5 }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
