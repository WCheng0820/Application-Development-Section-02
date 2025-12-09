import React, { useState, useEffect } from "react";
import { Container, Typography, Card, Grid, Tabs, Tab, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Rating, FormControlLabel, Checkbox } from "@mui/material";
import BookingCards from "../components/BookingCard";
import * as BookingsController from "../controllers/BookingsController";
import { useAuth } from "../context/AuthContext";

export default function Bookings() {
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

  return (
    <Container maxWidth="md" sx={{ mt: 12, mb: 6 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        My Bookings 📚
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Manage your scheduled Mandarin tutoring sessions.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="booking tabs">
          <Tab label="Upcoming" />
          <Tab label="History" />
        </Tabs>
      </Box>

      {filteredBookings.length === 0 ? (
        <Typography align="center" color="text.secondary" mt={8}>
          No bookings found in this category.
        </Typography>
      ) : (
        <Grid container spacing={4}>
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
              <Grid item xs={12} sm={6} md={6} key={booking.id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: 3,
                      "&:hover": { boxShadow: 6 },
                      transition: "0.3s",
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: 1.5,
                    }}
                  >
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
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Feedback Dialog */}
      <Dialog open={openFeedback} onClose={() => setOpenFeedback(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Give Feedback</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography component="legend">Rate your session</Typography>
            <Rating
              name="simple-controlled"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
              size="large"
            />
            <TextField
              label="Comment (Optional)"
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
              variant="outlined"
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
        <DialogActions>
          <Button onClick={() => setOpenFeedback(false)}>Cancel</Button>
          <Button onClick={handleSubmitFeedback} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
