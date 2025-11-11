import React, { useState, useEffect } from "react";
import { Container, Typography, Card, Grid } from "@mui/material";
import BookingCards from "../components/BookingCard";
import * as BookingsController from "../controllers/BookingsController";

export default function Bookings() {
  // View: keeps its own UI state but delegates data ops to Controller
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const all = BookingsController.fetchBookings();
    setBookings(all);
  }, []);

  const handleCancel = (id) => {
    const updated = BookingsController.cancelBooking(id);
    setBookings(updated);
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
          {bookings.map((booking) => (
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
                  tutor={booking.tutor}
                  date={booking.date}
                  time={booking.time}
                  status={booking.status}
                  id={booking.id}
                  onCancel={handleCancel}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
