// src/Dashboard.jsx
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
  Paper,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SearchIcon from "@mui/icons-material/Search";
import FolderIcon from "@mui/icons-material/Folder";
import MessageIcon from "@mui/icons-material/Message";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { currentUser } = useAuth();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pt: 10,
        pb: 4,
        px: 3,
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 2,
          background: "linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)",
          color: "white",
          boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <DashboardIcon sx={{ fontSize: 40 }} />
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" fontWeight="700">
              Welcome back, {currentUser?.username}!
            </Typography>
            <Chip
              label={currentUser?.role.charAt(0).toUpperCase() + currentUser?.role.slice(1)}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                fontWeight: 'bold',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
              size="small"
            />
          </Box>
          {currentUser?.profile.bio && (
            <Typography variant="subtitle1" sx={{ opacity: 0.9, fontStyle: 'italic', mt: 0.5 }}>
              "{currentUser.profile.bio}"
            </Typography>
          )}
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
            Here's what's happening with your Mandarin learning journey
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Upcoming Sessions", value: "3", icon: <CalendarMonthIcon sx={{ fontSize: 40, color: "#1976d2" }} />, color: "#e3f2fd" },
          { title: "Learning Hours", value: "24", icon: <AccessTimeIcon sx={{ fontSize: 40, color: "#2e7d32" }} />, color: "#e8f5e9" },
          { title: "Completed Lessons", value: "12", icon: <CheckCircleIcon sx={{ fontSize: 40, color: "#9c27b0" }} />, color: "#f3e5f5" },
          { title: "Unread Messages", value: "2", icon: <ChatBubbleOutlineIcon sx={{ fontSize: 40, color: "#ed6c02" }} />, color: "#fff3e0" },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                height: "100%",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-5px)",
                }
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </Box>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                {item.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="500">
                {item.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Bottom Sections */}
      <Grid container spacing={3}>
        {/* Upcoming Sessions */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              height: "100%",
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: 'primary.main' }}>
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
                  mb: 2,
                  bgcolor: "rgba(255,255,255,0.6)",
                  borderRadius: 2,
                  border: "1px solid rgba(0,0,0,0.05)",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.9)",
                    transform: "translateX(5px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                  }
                }}
              >
                <Box>
                  <Typography fontWeight="bold" color="text.primary">{s.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    with {s.tutor}
                  </Typography>
                  <Typography variant="caption" color="primary.main" fontWeight="bold">
                    {s.time}
                  </Typography>
                </Box>
                <Button variant="outlined" size="small" sx={{ borderRadius: 2 }}>
                  View
                </Button>
              </Box>
            ))}

            <Button variant="text" fullWidth sx={{ mt: 1 }}>
              View All Bookings
            </Button>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              height: "100%",
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: 'primary.main' }}>
              Quick Actions
            </Typography>
            <List>
              {[
                { text: "Find a Tutor", icon: <SearchIcon color="primary" /> },
                { text: "Browse Learning Materials", icon: <FolderIcon color="secondary" /> },
                { text: "Messages", icon: <MessageIcon color="action" /> },
                { text: "Manage Schedule", icon: <ScheduleIcon color="success" /> },
              ].map((item, i) => (
                <ListItem 
                  key={i} 
                  button 
                  sx={{ 
                    mb: 1, 
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.6)",
                    "&:hover": {
                      bgcolor: "rgba(25, 118, 210, 0.08)",
                    }
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
