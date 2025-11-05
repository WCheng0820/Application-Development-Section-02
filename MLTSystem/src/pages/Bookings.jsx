import React, { useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  Chip,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";

export default function Bookings() {
  const [bookings, setBookings] = useState([
    {
      id: 1,
      tutor: "Ms. Chen",
      date: "2025-11-10",
      time: "10:00 AM",
      status: "Confirmed",
    },
    {
      id: 2,
      tutor: "Mr. Lee",
      date: "2025-11-12",
      time: "4:30 PM",
      status: "Pending",
    },
  ]);

  const handleCancel = (id) => {
    setBookings((prev) => prev.filter((booking) => booking.id !== id));
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
            <Grid item xs={12} key={booking.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  "&:hover": { boxShadow: 6 },
                  transition: "0.3s",
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {booking.tutor}
                      </Typography>

                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <CalendarMonthIcon fontSize="small" />
                        <Typography>{booking.date}</Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <AccessTimeIcon fontSize="small" />
                        <Typography>{booking.time}</Typography>
                      </Box>
                    </Box>

                    <Box textAlign="right">
                      <Chip
                        label={booking.status}
                        color={booking.status === "Confirmed" ? "success" : "warning"}
                        sx={{ mb: 1 }}
                      />
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleCancel(booking.id)}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
