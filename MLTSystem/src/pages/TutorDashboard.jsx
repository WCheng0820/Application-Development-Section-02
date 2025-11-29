// src/pages/TutorDashboard.jsx
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
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SearchIcon from "@mui/icons-material/Search";
import FolderIcon from "@mui/icons-material/Folder";
import MessageIcon from "@mui/icons-material/Message";
import ScheduleIcon from "@mui/icons-material/Schedule";
import UploadIcon from "@mui/icons-material/Upload";
import { useAuth } from "../context/AuthContext";

export default function TutorDashboard() {
  const { currentUser } = useAuth();

  return (
    <Box sx={{ bgcolor: "#f8f9fb", minHeight: "100vh", pt: 10 }}>
      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mr: 2 }}>
            Welcome back, {currentUser?.username}!
          </Typography>
          <Chip
            label="Tutor"
            color="primary"
            size="small"
          />
        </Box>
        {currentUser?.profile.bio && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
            "{currentUser.profile.bio}"
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage your tutoring sessions and materials
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Today's Sessions
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" fontWeight="bold">4</Typography>
                  <CalendarMonthIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Teaching Hours
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" fontWeight="bold">32</Typography>
                  <AccessTimeIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Active Students
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" fontWeight="bold">8</Typography>
                  <CheckCircleIcon color="secondary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Unread Messages
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" fontWeight="bold">5</Typography>
                  <ChatBubbleOutlineIcon color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Bottom Sections */}
        <Grid container spacing={3}>
          {/* Today's Schedule */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Today's Schedule
                </Typography>
                {[
                  { title: "Conversational Practice", student: "Alice Wang", time: "2:00 PM - 3:00 PM" },
                  { title: "Grammar Fundamentals", student: "Bob Chen", time: "4:00 PM - 5:00 PM" },
                  { title: "Business Mandarin", student: "Carol Liu", time: "6:00 PM - 7:00 PM" },
                ].map((s, i) => (
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
                      <Typography fontWeight="bold">{s.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        with {s.student}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {s.time}
                      </Typography>
                    </Box>
                    <Button variant="outlined" size="small">
                      Start Session
                    </Button>
                  </Box>
                ))}

                <Button variant="text" fullWidth sx={{ mt: 2 }}>
                  View Full Schedule
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Quick Actions
                </Typography>
                <List>
                  {[
                    { text: "Upload Materials", icon: <UploadIcon />, path: "/materials" },
                    { text: "Manage Sessions", icon: <ScheduleIcon />, path: "/bookings" },
                    { text: "Messages", icon: <MessageIcon />, path: "/messages" },
                    { text: "View Students", icon: <SearchIcon />, path: "/find-tutors" },
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
