import React, { useState, useEffect } from "react";
import { Container, Typography, Card, Grid } from "@mui/material";
import BookingCards from "../components/BookingCard";
import * as BookingsController from "../controllers/BookingsController";
import { useAuth } from "../context/AuthContext";

export default function Bookings() {
  // View: keeps its own UI state but delegates data ops to Controller
  const [bookings, setBookings] = useState([]);

  const { currentUser } = useAuth();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      // Backend will filter based on token/user role
      const filters = { upcoming: true };
      const all = await BookingsController.fetchBookings(filters);
      if (mounted) setBookings(all || []);
    };
    load();
    return () => { mounted = false; };
  }, [currentUser]);

  const handleCancel = (id) => {
    const doCancel = async () => {
      try {
        await BookingsController.cancelBooking(id);
        // Refetch bookings after cancel
        const refreshed = await BookingsController.fetchBookings({ upcoming: true });
        setBookings(refreshed || []);
      } catch (err) {
        console.error('Cancel failed', err);
      }
    };
    doCancel();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 12, mb: 6 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        My Current Bookings 📚
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        View all your scheduled Mandarin tutoring sessions below.
      </Typography>

      {bookings.length === 0 ? (
        <Typography align="center" color="text.secondary" mt={8}>
          You don’t have any active bookings yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {bookings.map((booking) => {
            const isTutor = currentUser && (currentUser.role || '').toString().toLowerCase() === 'tutor';
            const heading = isTutor ? booking.student : booking.tutor;
            return (
              <Grid item xs={12} sm={6} md={4} key={booking.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: 3,
                    "&:hover": { boxShadow: 6 },
                    transition: "0.3s",
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <BookingCards
                    tutor={heading}
                    date={booking.date}
                    time={booking.time}
                    status={booking.status}
                    id={booking.id}
                    onCancel={handleCancel}
                  />
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}
