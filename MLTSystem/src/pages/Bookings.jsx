import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Container, Typography, Card, Grid, Tabs, Tab, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Rating, FormControlLabel, Checkbox, Paper } from "@mui/material";
import BookingCards from "../components/BookingCard";
import * as BookingsController from "../controllers/BookingsController";
import { useAuth } from "../context/AuthContext";
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

export default function Bookings() {
  const location = useLocation();
  // View: keeps its own UI state but delegates data ops to Controller
  const [bookings, setBookings] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [openFeedback, setOpenFeedback] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { currentUser } = useAuth();

  const loadBookings = async () => {
    // Fetch all bookings and filter client-side for tabs
    const all = await BookingsController.fetchBookings({});
    setBookings(all || []);
  };

  useEffect(() => {
    let mounted = true;
    if (currentUser) {
      loadBookings();
    }
    return () => { mounted = false; };
  }, [currentUser]);

  // Handle navigation from Messages
  useEffect(() => {
    if (bookings.length > 0 && location.state?.highlightBookingId) {
      const targetId = location.state.highlightBookingId;
      const targetBooking = bookings.find(b => b.bookingId === targetId);
      
      if (targetBooking) {
        // Determine which tab this booking belongs to
        const isCompleted = targetBooking.status && targetBooking.status.toLowerCase() === 'completed';
        const isCancelled = targetBooking.status && targetBooking.status.toLowerCase() === 'cancelled';
        
        if (isCompleted || isCancelled) {
          setTabValue(1); // History tab
        } else {
          setTabValue(0); // Upcoming tab
        }
        
        // Scroll to the booking card after a short delay to allow rendering
        setTimeout(() => {
          const element = document.getElementById(`booking-${targetId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Optional: Add a highlight effect
            element.style.transition = 'background-color 0.5s';
            element.style.backgroundColor = '#e3f2fd';
            setTimeout(() => {
              element.style.backgroundColor = '';
            }, 2000);
          }
        }, 100);
      }
    }
  }, [bookings, location.state]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCancel = (id) => {
    const doCancel = async () => {
      try {
        await BookingsController.cancelBooking(id);
        loadBookings();
      } catch (err) {
        console.error('Cancel failed', err);
      }
    };
    doCancel();
  };

  const handleMarkCompleted = async (id) => {
    try {
      await BookingsController.updateBooking(id, { status: 'completed' });
      loadBookings();
      return { success: true };
    } catch (err) {
      console.error('Mark completed failed', err);
      throw err;
    }
  };

  const handleOpenFeedback = (id) => {
    setSelectedBookingId(id);
    setRating(5);
    setComment("");
    setIsAnonymous(false);
    setOpenFeedback(true);
  };

  const handleSubmitFeedback = async () => {
    try {
      await BookingsController.submitFeedback(selectedBookingId, rating, comment, isAnonymous);
      setOpenFeedback(false);
      loadBookings(); // Refresh to show updated status/rating
    } catch (err) {
      console.error('Feedback submission failed', err);
      alert('Failed to submit feedback: ' + (err.response?.data?.message || err.message));
    }
  };

  // Filter bookings based on tab
  const filteredBookings = bookings.filter(b => {
    const isCompleted = b.status && b.status.toLowerCase() === 'completed';
    const isCancelled = b.status && b.status.toLowerCase() === 'cancelled';
    
    if (tabValue === 0) {
      // Upcoming: Not completed and not cancelled
      return !isCompleted && !isCancelled;
    } else {
      // Completed (History): Completed or Cancelled
      return isCompleted || isCancelled;
    }
  });

  const isTutor = currentUser?.role === 'tutor';
  const themeColor = isTutor ? '#2e7d32' : '#1976d2';
  const gradient = isTutor 
    ? 'linear-gradient(135deg, #7abf6f 0%, #a0d69a 100%)' 
    : 'linear-gradient(135deg, #6db3f2 0%, #a8d5ff 100%)';
  const iconBg = isTutor ? 'rgba(46, 125, 50, 0.1)' : 'rgba(25, 118, 210, 0.1)';
  const iconColor = isTutor ? '#2e7d32' : '#1565c0';

  return (
    <Box sx={{ 
      background: gradient, 
      minHeight: "100vh", 
      pt: 10, 
      pb: 6 
    }}>
      <Container maxWidth="md">
        {/* Header */}
        <Paper 
          elevation={3}
          sx={{ 
            mb: 4, 
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            p: 4,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          }}
        >
          <Box display="flex" justifyContent="center" mb={2}>
            <Box sx={{ bgcolor: iconBg, p: 2, borderRadius: '50%' }}>
              <LibraryBooksIcon sx={{ fontSize: 40, color: iconColor }} />
            </Box>
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: iconColor }}>
            My Bookings 📚
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Manage your scheduled Mandarin tutoring sessions.
          </Typography>
        </Paper>

        <Paper 
          elevation={0} 
          sx={{ 
            mb: 4, 
            borderRadius: 3, 
            bgcolor: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(10px)',
            p: 1
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered
            sx={{
              '& .MuiTab-root': {
                fontWeight: 'bold',
                fontSize: '1rem',
                borderRadius: 2,
                mx: 1,
                transition: 'all 0.2s',
                '&.Mui-selected': {
                  bgcolor: 'white',
                  boxShadow: 1
                }
              },
              '& .MuiTabs-indicator': {
                display: 'none'
              }
            }}
          >
            <Tab label="Upcoming Sessions" />
            <Tab label="Booking History" />
          </Tabs>
        </Paper>

        {filteredBookings.length === 0 ? (
          <Paper 
            sx={{ 
              p: 6, 
              textAlign: "center", 
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <LibraryBooksIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No bookings found in this category.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredBookings.map((booking) => {
              const role = (currentUser && (currentUser.role || '').toString().toLowerCase()) || '';
              const isTutor = role === 'tutor';
              const isAdmin = role === 'admin';
              let heading = '';
              if (isAdmin) {
                // Admin: show booking id in the card title (details shown inside card)
                heading = `Booking #${booking.id}`;
              } else {
                // Tutors should see the student's account username (if available) instead of raw id
                heading = isTutor ? (booking.studentUsername || booking.student) : booking.tutor;
              }
              return (
                <Grid item xs={12} sm={6} md={6} key={booking.id} id={`booking-${booking.id}`}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        boxShadow: 3,
                        "&:hover": { 
                          boxShadow: 6,
                          transform: 'translateY(-4px)'
                        },
                        transition: "all 0.3s",
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 0,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        overflow: 'visible'
                      }}
                    >
                      <Box sx={{ p: 2, flexGrow: 1 }}>
                        <BookingCards
                          tutor={heading}
                          date={booking.date}
                          time={booking.time}
                          rating={booking.rating}
                          status={booking.status}
                          id={booking.id}
                          onCancel={handleCancel}
                          onMarkCompleted={handleMarkCompleted}
                          onRate={() => handleOpenFeedback(booking.id)} // Use new handler
                          studentContact={booking.studentContact}
                          tutorContact={booking.tutorContact}
                          studentUsername={booking.studentUsername}
                          studentName={booking.student}
                          tutorUsername={booking.tutorUsername}
                          tutorNameOriginal={booking.tutor}
                          studentNameOriginal={booking.student}
                          tutorId={booking.tutorId}
                          studentId={booking.studentId}
                          feedback={booking.feedback}
                        />
                      </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Feedback Dialog */}
        <Dialog 
          open={openFeedback} 
          onClose={() => setOpenFeedback(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 2 }}>
            <Typography variant="h6" fontWeight="bold">Give Feedback</Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <Box textAlign="center">
                <Typography component="legend" gutterBottom>Rate your session</Typography>
                <Rating
                  name="simple-controlled"
                  value={rating}
                  onChange={(event, newValue) => {
                    setRating(newValue);
                  }}
                  size="large"
                  sx={{ fontSize: '3rem' }}
                />
              </Box>
              <TextField
                label="Share your experience (Optional)"
                multiline
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{ bgcolor: '#f9f9f9' }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                }
                label="Submit anonymously"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
            <Button onClick={() => setOpenFeedback(false)} color="inherit">Cancel</Button>
            <Button onClick={handleSubmitFeedback} variant="contained" color="primary" disableElevation>
              Submit Feedback
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
