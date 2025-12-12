// src/pages/TutorDashboard.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  Rating,
  Divider,
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
import UploadIcon from "@mui/icons-material/Upload";
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAuth } from "../context/AuthContext";
import * as TutorsController from "../controllers/TutorsController";
import * as BookingsController from "../controllers/BookingsController";

export default function TutorDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tutorInfo, setTutorInfo] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    todaysSessions: 0,
    teachingHours: 0,
    activeStudents: 0,
    todaysSessionsList: []
  });
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#recent-reviews') {
      const element = document.getElementById('recent-reviews');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location, reviews]); // Re-run when reviews load so element exists

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // Ensure tutors cache is loaded then pick current tutor by id
        await TutorsController.fetchTutors();
        const t = TutorsController.getTutorById(currentUser?.tutorId);
        
        let r = [];
        if (currentUser?.tutorId) {
          r = await TutorsController.getTutorReviews(currentUser.tutorId);
        }

        // Fetch bookings for stats
        const bookings = await BookingsController.fetchBookings();
        
        const now = new Date();
        const todayStart = new Date(now.setHours(0,0,0,0));
        const todayEnd = new Date(now.setHours(23,59,59,999));

        // Today's sessions
        const todaysList = bookings.filter(b => {
          const raw = b.raw || {};
          const bookingDate = new Date(raw.booking_date);
          const status = raw.status || '';
          return (status === 'confirmed') && bookingDate >= todayStart && bookingDate <= todayEnd;
        });
        const todays = todaysList.length;

        // Teaching hours (completed)
        const completed = bookings.filter(b => (b.raw?.status || '') === 'completed');
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

        // Active students (unique students in confirmed/completed bookings)
        const uniqueStudents = new Set(
          bookings
            .filter(b => {
                const status = b.raw?.status || '';
                return status === 'confirmed' || status === 'completed';
            })
            .map(b => b.studentId)
        );

        if (mounted) {
          setTutorInfo(t || null);
          setReviews(r);
          setStats({
            todaysSessions: todays,
            teachingHours: hours,
            activeStudents: uniqueStudents.size,
            todaysSessionsList: todaysList
          });
        }
      } catch (e) {
        console.error('Failed to load tutor info for dashboard', e);
      }
    };
    if (currentUser && currentUser.role === 'tutor') load();
    return () => { mounted = false; };
  }, [currentUser]);

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #7abf6f 0%, #a0d69a 100%)', 
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
          <Typography variant="h4" sx={{ fontWeight: "bold", mr: 2, color: '#2e7d32' }}>
            Welcome back, {currentUser?.username}!
          </Typography>
          <Chip
            label="Tutor"
            sx={{ bgcolor: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32', fontWeight: 'bold' }}
            size="small"
          />
        </Box>
        {currentUser?.profile.bio && (
          <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}>
            "{currentUser.profile.bio}"
          </Typography>
        )}
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Manage your tutoring sessions and materials
        </Typography>
      </Paper>

      {/* Main Content */}
      <Box sx={{ px: 4 }}>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { title: "Today's Sessions", value: stats.todaysSessions, icon: <CalendarMonthIcon sx={{ fontSize: 40, color: '#1976d2' }} />, color: '#e3f2fd' },
            { title: "Teaching Hours", value: stats.teachingHours, icon: <AccessTimeIcon sx={{ fontSize: 40, color: '#2e7d32' }} />, color: '#e8f5e9' },
            { title: "Active Students", value: stats.activeStudents, icon: <CheckCircleIcon sx={{ fontSize: 40, color: '#9c27b0' }} />, color: '#f3e5f5' },
            { 
              title: "Rating", 
              value: (
                <Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                      {tutorInfo && tutorInfo.rating != null ? Number(tutorInfo.rating).toFixed(1) : '—'}
                    </Typography>
                    <StarIcon sx={{ color: '#ed6c02', fontSize: 28 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -0.5 }}>
                    {tutorInfo && (tutorInfo.ratingCount != null) ? `${tutorInfo.ratingCount} review${tutorInfo.ratingCount === 1 ? '' : 's'}` : 'No reviews'}
                  </Typography>
                </Box>
              ), 
              icon: <StarIcon sx={{ fontSize: 40, color: '#ed6c02' }} />, 
              color: '#fff3e0',
              isCustomValue: true
            }
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
                      {item.isCustomValue ? item.value : (
                        <Typography variant="h4" fontWeight="bold" color="text.primary">
                          {item.value}
                        </Typography>
                      )}
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
          {/* Today's Schedule */}
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
                    Today's Schedule
                  </Typography>
                  <Button 
                    variant="text" 
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/manage-schedule')}
                  >
                    View Full Schedule
                  </Button>
                </Box>
                
                {stats.todaysSessionsList && stats.todaysSessionsList.length > 0 ? (
                  stats.todaysSessionsList.map((s, i) => (
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
                            bgcolor: '#e8f5e9', 
                            p: 1.5, 
                            borderRadius: 2, 
                            mr: 2,
                            color: '#2e7d32'
                          }}
                        >
                          <AccessTimeIcon />
                        </Box>
                        <Box>
                          <Typography fontWeight="bold" variant="subtitle1">{s.subject || 'Mandarin Lesson'}</Typography>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                              <PersonIcon fontSize="small" /> {s.student_name || 'Student'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                              <AccessTimeIcon fontSize="small" /> {s.start_time} - {s.end_time}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Button 
                        variant="contained" 
                        size="small"
                        color="success"
                        disableElevation
                        onClick={() => navigate('/bookings')}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                      >
                        Start
                      </Button>
                    </Paper>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4, opacity: 0.7 }}>
                    <CalendarMonthIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      No sessions scheduled for today.
                    </Typography>
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
                    { text: "Upload Materials", icon: <UploadIcon />, path: "/materials", color: '#2196f3', desc: "Share resources" },
                    { text: "Manage Bookings", icon: <ScheduleIcon />, path: "/bookings", color: '#ff9800', desc: "Check your calendar" },
                    { text: "Manage Schedule", icon: <CalendarMonthIcon />, path: "/manage-schedule", color: '#9c27b0', desc: "Set availability" },
                    { text: "Messages", icon: <MessageIcon />, path: "/messages", color: '#4caf50', desc: "Chat with students" },
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

          {/* Recent Reviews */}
          <Grid item xs={12} id="recent-reviews">
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Recent Reviews
                </Typography>
                {reviews.length === 0 ? (
                  <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>No reviews yet.</Typography>
                ) : (
                  <List>
                    {reviews.map((review, index) => (
                      <Box key={index}>
                        <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {review.student_name || "Anonymous"}
                                </Typography>
                                <Rating value={parseFloat(review.rating)} readOnly size="small" />
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                  sx={{ display: 'block', mb: 0.5 }}
                                >
                                  {review.comment}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        {index < reviews.length - 1 && <Divider variant="inset" component="li" sx={{ ml: 0 }} />}
                      </Box>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
