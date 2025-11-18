// src/pages/AdminDashboard.jsx
import React from "react";
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
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { currentUser } = useAuth();

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
                  Pending Reports
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" fontWeight="bold">7</Typography>
                  <ChatBubbleOutlineIcon color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
