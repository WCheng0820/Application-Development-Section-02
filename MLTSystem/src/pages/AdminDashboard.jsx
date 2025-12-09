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
import * as AdminController from "../controllers/AdminController";

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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/auth/pending-tutors`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPendingTutors(result.tutors || []);
      } else {
        console.error('Error fetching pending users:', result.error);
        setPendingTutors([]);
      }
    } catch (error) {
      console.error('Error fetching pending users:', error);
      setPendingTutors([]);
    }
  };

  const handleApprove = async (tutorId) => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/auth/approve-tutor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tutorId })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Refresh the list
        await fetchPendingUsers();
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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/auth/reject-tutor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tutorId })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Refresh the list
        await fetchPendingUsers();
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
    <Box sx={{ bgcolor: "#f8f9fb", minHeight: "100vh", pt: 10 }}>
      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mr: 2 }}>
            Welcome back, {currentUser?.username}!
          </Typography>
          <Chip
            label="Admin"
            color="secondary"
            size="small"
          />
        </Box>
        {currentUser?.profile.bio && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
            "{currentUser.profile.bio}"
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          System administration and management overview
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Users
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" fontWeight="bold">
                    {stats ? (Number(stats.users?.totalStudents || 0) + Number(stats.users?.totalTutors || 0)) : '...'}
                  </Typography>
                  <PeopleIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Bookings
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" fontWeight="bold">
                    {stats ? (stats.bookings?.totalBookings || 0) : '...'}
                  </Typography>
                  <AccessTimeIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Pending Reports
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" fontWeight="bold">
                    {stats ? (stats.reports?.pendingReports || 0) : '...'}
                  </Typography>
                  <FlagIcon color="error" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Pending Tutor Approvals
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" fontWeight="bold">{pendingTutors.length}</Typography>
                  <PendingActionsIcon color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>



        {/* Pending Tutors Section */}
        <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PendingActionsIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Pending Tutor Approvals ({pendingTutors.length})
                </Typography>
              </Box>
              {pendingTutors.length === 0 ? (
                  <Alert severity="info">No pending tutor approvals.</Alert>
              ) : (
                  <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {pendingTutors.length} tutor{pendingTutors.length > 1 ? 's' : ''} {pendingTutors.length > 1 ? 'are' : 'is'} waiting for approval
                  </Alert>
                  {pendingTutors.map((tutor) => (
                    <Paper
                      key={tutor.tutorId}
                      elevation={1}
                      sx={{ p: 2, mb: 2, bgcolor: '#f9fafb' }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {tutor.name || 'Unknown Tutor'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {tutor.tutorId}
                          </Typography>
                          {tutor.availability && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Availability: {tutor.availability}
                            </Typography>
                          )}
                          {tutor.yearsOfExperience && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Experience: {tutor.yearsOfExperience} year{tutor.yearsOfExperience > 1 ? 's' : ''}
                            </Typography>
                          )}
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={`${tutor.verificationDocuments?.length || 0} document(s) uploaded`}
                              size="small"
                              icon={<DescriptionIcon />}
                            />
                            {tutor.verificationDocuments && tutor.verificationDocuments.length > 0 && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleViewDocuments(tutor)}
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
        >
          <DialogTitle>
            Verification Documents - {selectedTutor?.name || 'Unknown Tutor'}
          </DialogTitle>
          <DialogContent>
            {selectedTutor?.verificationDocuments && selectedTutor.verificationDocuments.length > 0 ? (
              <Box>
                {selectedTutor.verificationDocuments.map((doc, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {doc.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Type: {doc.type} | Size: {(doc.size / 1024).toFixed(2)} KB
                    </Typography>
                    {doc.data && (
                      <Box sx={{ mt: 2 }}>
                        {doc.type.startsWith('image/') ? (
                          <img
                            src={doc.data}
                            alt={doc.name}
                            style={{ maxWidth: '100%', height: 'auto', borderRadius: 4 }}
                          />
                        ) : (
                          <Button
                            variant="outlined"
                            href={doc.data}
                            target="_blank"
                            download={doc.name}
                            startIcon={<DescriptionIcon />}
                          >
                            Download {doc.name}
                          </Button>
                        )}
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography>No documents available</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDocumentsDialog}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Bottom Sections */}
        <Grid container spacing={3}>
          {/* System Overview */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  System Overview
                </Typography>
                {[
                  { title: "New Registrations", value: stats ? `${stats.newRegistrations || 0} today` : '...', status: "up" },
                  { title: "Active Tutors", value: stats ? `${stats.users?.activeTutors || 0} active` : '...', status: "stable" },
                  { title: "Completed Sessions", value: stats ? `${stats.bookings?.completedBookings || 0} total` : '...', status: "up" },
                  { title: "Total Reports", value: stats ? `${stats.reports?.totalReports || 0} filed` : '...', status: "stable" },
                ].map((item, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 2,
                      mb: 1,
                      bgcolor: "#f9fafb",
                      borderRadius: 2,
                    }}
                  >
                    <Box>
                      <Typography fontWeight="bold">{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.value}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color={item.status === 'up' ? 'success.main' : 'text.secondary'}>
                      {item.status === 'up' ? '↗' : '→'}
                    </Typography>
                  </Box>
                ))}

                <Button variant="text" fullWidth sx={{ mt: 2 }} href="/reports">
                  View Detailed Reports
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Admin Actions */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Admin Actions
                </Typography>
                <List>
                  {[
                    { text: "Manage Users", icon: <PeopleIcon />, path: "/admin/users" },
                    { text: "System Settings", icon: <SettingsIcon />, path: "/admin/settings" },
                    { text: "View Reports", icon: <FolderIcon />, path: "/reports" },
                    { text: "Monitor Sessions", icon: <ScheduleIcon />, path: "/admin/sessions" },
                  ].map((item, i) => (
                    <ListItem key={i} button component="a" href={item.path}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
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
