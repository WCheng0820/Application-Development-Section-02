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
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { currentUser, getPendingTutors, approveTutor, rejectTutor } = useAuth();
  const [pendingTutors, setPendingTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [viewDocumentsDialog, setViewDocumentsDialog] = useState(false);

  useEffect(() => {
    // Refresh pending tutors list
    const fetchTutors = async () => {
      try {
        const tutors = await getPendingTutors();
        setPendingTutors(tutors || []);
      } catch (error) {
        console.error('Error fetching pending tutors:', error);
        setPendingTutors([]);
      }
    };
    fetchTutors();
  }, []);

  const handleApprove = async (tutorId) => {
    try {
      const result = await approveTutor(tutorId);
      if (result && result.success) {
        // Refresh the list
        const tutors = await getPendingTutors();
        setPendingTutors(tutors || []);
      }
    } catch (error) {
      console.error('Error approving tutor:', error);
    }
  };

  const handleReject = async (tutorId) => {
    if (window.confirm('Are you sure you want to reject this tutor registration?')) {
      try {
        const result = await rejectTutor(tutorId);
        if (result && result.success) {
          // Refresh the list
          const tutors = await getPendingTutors();
          setPendingTutors(tutors || []);
        }
      } catch (error) {
        console.error('Error rejecting tutor:', error);
      }
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
            Welcome back, {currentUser?.profile.firstName} {currentUser?.profile.lastName}!
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
                  <Typography variant="h5" fontWeight="bold">156</Typography>
                  <PeopleIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Active Sessions
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" fontWeight="bold">23</Typography>
                  <AccessTimeIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  System Health
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" fontWeight="bold">98%</Typography>
                  <CheckCircleIcon color="secondary" />
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

        {/* Pending Tutor Approvals Section */}
        {pendingTutors.length > 0 && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PendingActionsIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Pending Tutor Approvals ({pendingTutors.length})
                </Typography>
              </Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                {pendingTutors.length} tutor{pendingTutors.length > 1 ? 's' : ''} {pendingTutors.length > 1 ? 'are' : 'is'} waiting for approval
              </Alert>
              {pendingTutors.map((tutor) => (
                <Paper
                  key={tutor.id}
                  elevation={1}
                  sx={{ p: 2, mb: 2, bgcolor: '#f9fafb' }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {tutor.profile.firstName} {tutor.profile.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tutor.email}
                      </Typography>
                      {tutor.profile.bio && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {tutor.profile.bio}
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
                        onClick={() => handleApprove(tutor.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleReject(tutor.id)}
                      >
                        Reject
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </CardContent>
          </Card>
        )}

        {/* View Documents Dialog */}
        <Dialog
          open={viewDocumentsDialog}
          onClose={handleCloseDocumentsDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Verification Documents - {selectedTutor?.profile.firstName} {selectedTutor?.profile.lastName}
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
                  { title: "User Registrations", value: "12 new today", status: "up" },
                  { title: "Active Tutors", value: "28 online", status: "stable" },
                  { title: "Completed Sessions", value: "45 this week", status: "up" },
                  { title: "System Uptime", value: "99.9%", status: "stable" },
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

                <Button variant="text" fullWidth sx={{ mt: 2 }}>
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
                    { text: "View Reports", icon: <FolderIcon />, path: "/admin/reports" },
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
