import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  MenuItem,
  Snackbar,
  Alert,
  Rating,
} from "@mui/material";

const tutorsData = [
  {
    id: 1,
    name: "Ms. Chen",
    subject: "Mandarin Grammar",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&w=400&q=60",
  },
  {
    id: 2,
    name: "Mr. Lee",
    subject: "Conversational Mandarin",
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&w=400&q=60",
  },
  {
    id: 3,
    name: "Ms. Wong",
    subject: "Mandarin for Beginners",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&w=400&q=60",
  },
];

export default function FindTutors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [success, setSuccess] = useState(false);

  const filteredTutors = tutorsData.filter(
    (tutor) =>
      tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBook = (tutor) => {
    setSelectedTutor(tutor);
  };

  const handleConfirmBooking = () => {
    if (date && time) {
      setSelectedTutor(null);
      setSuccess(true);
      setDate("");
      setTime("");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 8 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Find a Mandarin Tutor 🧑‍🏫
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Browse through available tutors and book a session instantly.
      </Typography>

      {/* Search bar */}
      <TextField
        fullWidth
        label="Search by tutor name or subject"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
      />

      {/* Tutor list */}
      <Grid container spacing={3}>
        {filteredTutors.map((tutor) => (
          <Grid item xs={12} sm={6} md={4} key={tutor.id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                transition: "0.3s",
                "&:hover": { boxShadow: 6 },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={tutor.image}
                alt={tutor.name}
              />
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  {tutor.name}
                </Typography>
                <Typography color="text.secondary" mb={1}>
                  {tutor.subject}
                </Typography>
                <Rating value={tutor.rating} precision={0.1} readOnly />
                <Box textAlign="center" mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleBook(tutor)}
                  >
                    Book Now
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Booking dialog */}
      <Dialog open={!!selectedTutor} onClose={() => setSelectedTutor(null)}>
        <DialogTitle>Book a Session with {selectedTutor?.name}</DialogTitle>
        <DialogContent>
          <TextField
            label="Select Date"
            type="date"
            fullWidth
            value={date}
            onChange={(e) => setDate(e.target.value)}
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Select Time"
            type="time"
            fullWidth
            value={time}
            onChange={(e) => setTime(e.target.value)}
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTutor(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmBooking}
            disabled={!date || !time}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success message */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Booking confirmed successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
}
