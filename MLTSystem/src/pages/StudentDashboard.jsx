// src/pages/StudentDashboard.jsx
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
  Paper,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SearchIcon from "@mui/icons-material/Search";
import FolderIcon from "@mui/icons-material/Folder";
import MessageIcon from "@mui/icons-material/Message";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from "../context/AuthContext";
import * as BookingsController from "../controllers/BookingsController";
import * as MessagesController from "../controllers/MessagesController";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    learningHours: 0,
    completedLessons: 0,
    unreadMessages: 0
  });
  const [upcomingList, setUpcomingList] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;

      try {
        // Fetch bookings
        const bookings = await BookingsController.fetchBookings();
        
        const now = new Date();
        const todayStart = new Date(now.setHours(0,0,0,0));

        // Filter upcoming
        const upcoming = bookings.filter(b => {
          // Use raw data for logic because controller formats the main fields
          const raw = b.raw || {};
          const bookingDate = new Date(raw.booking_date);
          const status = raw.status || '';
          return (status === 'confirmed' || status === 'pending') && bookingDate >= todayStart;
        }).sort((a, b) => {
          const rawA = a.raw || {};
          const rawB = b.raw || {};
          return new Date(rawA.booking_date + ' ' + rawA.start_time) - new Date(rawB.booking_date + ' ' + rawB.start_time);
        });

        setUpcomingList(upcoming.slice(0, 3)); // Top 3

        const completed = bookings.filter(b => (b.raw?.status || '') === 'completed');
        
        // Calculate hours
        let totalMinutes = 0;
        completed.forEach(b => {
          const raw = b.raw || {};
          if (raw.start_time && raw.end_time) {
            const [h1, m1] = raw.start_time.split(':').map(Number);
            const [h2, m2] = raw.end_time.split(':').map(Number);
            const start = h1 * 60 + m1;
            const end = h2 * 60 + m2;
            totalMinutes += (end - start);
          }
        });
        const hours = Math.round(totalMinutes / 60);

        // Fetch unread messages
        const unreadMsg = await MessagesController.getUnreadMessagesCount(currentUser.id || currentUser.studentId);

        setStats({
          upcomingSessions: upcoming.length,
          learningHours: hours,
          completedLessons: completed.length,
          unreadMessages: unreadMsg
        });

      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      }
    };

    loadData();
  }, [currentUser]);

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #6db3f2 0%, #a8d5ff 100%)', 
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
          <Typography variant="h4" sx={{ fontWeight: "bold", mr: 2, color: '#1565c0' }}>
            Welcome back, {currentUser?.username}!
          </Typography>
          <Chip
            label="Student"
            sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', color: '#1565c0', fontWeight: 'bold' }}
            size="small"
          />
        </Box>
        {currentUser?.profile.bio && (
          <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}>
            "{currentUser.profile.bio}"
          </Typography>
        )}
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Here's what's happening with your Mandarin learning journey
        </Typography>
      </Paper>

      {/* Main Content */}
      <Box sx={{ px: 4 }}>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { title: "Upcoming Sessions", value: stats.upcomingSessions, icon: <CalendarMonthIcon sx={{ fontSize: 40, color: '#1976d2' }} />, color: '#e3f2fd' },
            { title: "Learning Hours", value: stats.learningHours, icon: <AccessTimeIcon sx={{ fontSize: 40, color: '#2e7d32' }} />, color: '#e8f5e9' },
            { title: "Completed Lessons", value: stats.completedLessons, icon: <CheckCircleIcon sx={{ fontSize: 40, color: '#9c27b0' }} />, color: '#f3e5f5' },
            { title: "Unread Messages", value: stats.unreadMessages, icon: <ChatBubbleOutlineIcon sx={{ fontSize: 40, color: '#ed6c02' }} />, color: '#fff3e0' }
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

        {/* Bottom Sections */}
        <Grid container spacing={3}>
          {/* Upcoming Sessions */}
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              height: "100%", 
              borderRadius: 3, 
              boxShadow: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight="bold">
                    Upcoming Sessions
                  </Typography>
                  <Button 
                    variant="text" 
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/bookings')}
                  >
                    View All
                  </Button>
                </Box>
                
                {upcomingList.length > 0 ? (
                  upcomingList.map((s, i) => (
                    <Paper
                      key={i}
                      elevation={0}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                        mb: 2,
                        bgcolor: "#f8f9fa",
                        borderRadius: 2,
                        border: '1px solid #e0e0e0',
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          bgcolor: '#f0f4f8'
                        }
                      }}
                    >
                      <Box display="flex" alignItems="center">
                        <Box 
                          sx={{ 
                            bgcolor: '#e3f2fd', 
                            p: 1.5, 
                            borderRadius: 2, 
                            mr: 2,
                            color: '#1976d2'
                          }}
                        >
                          <CalendarMonthIcon />
                        </Box>
                        <Box>
                          <Typography fontWeight="bold" variant="subtitle1">{s.subject || 'Mandarin Lesson'}</Typography>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                              <PersonIcon fontSize="small" /> {s.tutor_name || s.tutor}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                              <AccessTimeIcon fontSize="small" /> {new Date(s.booking_date).toLocaleDateString()} {s.start_time}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Button 
                        variant="contained" 
                        size="small"
                        disableElevation
                        onClick={() => navigate('/bookings', { state: { highlightBookingId: s.bookingId } })}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                      >
                        Details
                      </Button>
                    </Paper>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4, opacity: 0.7 }}>
                    <CalendarMonthIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      No upcoming sessions scheduled.
                    </Typography>
                    <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/find-tutors')}>
                      Find a Tutor
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: "100%", 
              borderRadius: 3, 
              boxShadow: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Quick Actions
                </Typography>
                <List disablePadding>
                  {[
                    { text: "Find a Tutor", icon: <SearchIcon />, path: "/find-tutors", color: '#2196f3', desc: "Browse available tutors" },
                    { text: "Browse Materials", icon: <FolderIcon />, path: "/materials", color: '#ff9800', desc: "Access learning resources" },
                    { text: "Messages", icon: <MessageIcon />, path: "/messages", color: '#4caf50', desc: "Chat with your tutors" },
                    { text: "Manage Schedule", icon: <ScheduleIcon />, path: "/bookings", color: '#9c27b0', desc: "View your calendar" },
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
