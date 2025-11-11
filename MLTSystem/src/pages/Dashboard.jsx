// src/Dashboard.jsx
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SearchIcon from "@mui/icons-material/Search";
import FolderIcon from "@mui/icons-material/Folder";
import MessageIcon from "@mui/icons-material/Message";
import ScheduleIcon from "@mui/icons-material/Schedule";
import GridLayout from "react-grid-layout";

export default function Dashboard() {
  const layout = [
    { i: "a", x: 0, y: 0, w: 1, h: 2, },
    { i: "b", x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
    { i: "c", x: 4, y: 0, w: 1, h: 2 }
  ];
  
  return (
    <Box sx={{ bgcolor: "#f8f9fb", minHeight: "100vh" }}>
      {/* Top AppBar */}
      <AppBar position="static" color="inherit" elevation={1}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: "bold", color: "#d32f2f" }}
          >
            Mandarin Tutoring
          </Typography>

          <Button color="inherit">Dashboard</Button>
          <Button color="inherit">Find Tutors</Button>
          <Button color="inherit">Bookings</Button>
          <Button color="inherit">Materials</Button>
          <Button color="inherit" startIcon={<MessageIcon />}>
            Messages
          </Button>

          <Avatar sx={{ bgcolor: "#1976d2", ml: 2 }}>A</Avatar>
          <Typography sx={{ ml: 1 }}>Alice Wang</Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
          Welcome back, Alice Wang!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Here's what's happening with your Mandarin learning journey
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Upcoming Sessions
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" fontWeight="bold">3</Typography>
                  <CalendarMonthIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Learning Hours
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" fontWeight="bold">24</Typography>
                  <AccessTimeIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Completed Lessons
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" fontWeight="bold">12</Typography>
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
                  <Typography variant="h5" fontWeight="bold">2</Typography>
                  <ChatBubbleOutlineIcon color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Bottom Sections */}
        <Grid container spacing={3}>
          {/* Upcoming Sessions */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Upcoming Sessions
                </Typography>
                {[
                  { title: "Conversational Practice", tutor: "Li Ming", time: "Today, 2:00 PM" },
                  { title: "Grammar Fundamentals", tutor: "Zhang Wei", time: "Tomorrow, 10:00 AM" },
                  { title: "Business Mandarin", tutor: "Li Ming", time: "Nov 7, 3:00 PM" },
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
                        with {s.tutor}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {s.time}
                      </Typography>
                    </Box>
                    <Button variant="outlined" size="small">
                      View
                    </Button>
                  </Box>
                ))}

                <Button variant="text" fullWidth sx={{ mt: 2 }}>
                  View All Bookings
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
                    { text: "Find a Tutor", icon: <SearchIcon /> },
                    { text: "Browse Learning Materials", icon: <FolderIcon /> },
                    { text: "Messages", icon: <MessageIcon /> },
                    { text: "Manage Schedule", icon: <ScheduleIcon /> },
                  ].map((item, i) => (
                    <ListItem key={i} button>
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
