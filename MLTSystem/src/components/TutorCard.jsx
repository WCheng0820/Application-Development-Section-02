import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Paper,
  Button,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import StarIcon from "@mui/icons-material/Star";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ReviewsIcon from "@mui/icons-material/Reviews";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FlagIcon from "@mui/icons-material/Flag";

import * as TutorsController from "../controllers/TutorsController";
import { formatMalaysiaDate, formatMalaysiaTime } from "../utils/dateUtils";
import ReportDialog from "./ReportDialog";

export default function TutorCard({ tutor, onBook, initiallyOpen = false }) {
  const [openProfile, setOpenProfile] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  useEffect(() => {
    if (initiallyOpen) {
      handleOpenProfile();
    }
  }, [initiallyOpen]);

  const handleOpenProfile = async () => {
    setOpenProfile(true);
    try {
      const r = await TutorsController.getTutorReviews(tutor.id);
      setReviews(r);
    } catch (err) {
      console.error("Failed to load reviews", err);
    }
  };

  const handleCloseProfile = () => {
    setOpenProfile(false);
    setSelectedSlot(null);
  };

  // Filter for free/available slots
  const getAvailableSlots = () => {
    if (!tutor.schedule || !Array.isArray(tutor.schedule)) return [];
    return tutor.schedule.filter((slot) => slot.status === "free");
  };

  const availableSlots = getAvailableSlots();

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBook = () => {
    if (onBook) {
      onBook(tutor, selectedSlot);
    }
    handleCloseProfile();
  };

  // Format slot info for display
  const formatSlot = (slot) => {
    if (typeof slot === "string") {
      return slot;
    }
    if (slot && typeof slot === "object") {
      const date = slot.schedule_date ? formatMalaysiaDate(slot.schedule_date, { year: "numeric", month: "short", day: "numeric" }) : "";
      const time = slot.start_time && slot.end_time ? `${formatMalaysiaTime(slot.start_time, { hour: '2-digit', minute: '2-digit' })} - ${formatMalaysiaTime(slot.end_time, { hour: '2-digit', minute: '2-digit' })}` : "";
      return `${date} ${time}`.trim() || "Slot";
    }
    return "Slot";
  };

  const previewSlots = availableSlots.slice(0, 3);

  return (
    <>
      <Card
        onClick={handleOpenProfile}
        sx={{
          borderRadius: 2,
          boxShadow: 2,
          "&:hover": {
            boxShadow: 6,
            transform: "translateY(-4px)",
            cursor: "pointer",
          },
          transition: "all 0.3s ease",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent sx={{ pb: 1, flexGrow: 1 }}>
          {/* Tutor Avatar and Name */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              sx={{ width: 56, height: 56, mr: 2, bgcolor: "#1976d2", fontWeight: "bold" }}
              alt={tutor.name}
            >
              {(tutor.name || "?").charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                {tutor.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tutor.subject}
              </Typography>
            </Box>
          </Box>

          {/* Rating and Reviews */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Rating value={Number(tutor.rating) || 0} readOnly size="small" precision={0.1} />
            <Typography variant="body2" fontWeight="bold">
              {Number(tutor.rating || 0).toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ({(tutor.ratingCount || 0)} review{(tutor.ratingCount || 0) === 1 ? '' : 's'})
            </Typography>
          </Box>

          {/* Quick Info */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <SchoolIcon sx={{ fontSize: 18, color: "primary.main" }} />
                <Typography variant="body2">
                  {tutor.experience} yrs exp
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AttachMoneyIcon sx={{ fontSize: 18, color: "success.main" }} />
                <Typography variant="body2" fontWeight="bold">
                  RM{tutor.ratePerHour}/hr
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Bio Preview */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mb: 2,
            }}
          >
            {tutor.bio}
          </Typography>

          {/* Available Slots Preview */}
          {availableSlots.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" fontWeight="bold" color="success.main" sx={{ display: "block", mb: 1 }}>
                📅 {availableSlots.length} slots available
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {previewSlots.map((slot, idx) => (
                  <Chip
                    key={idx}
                    label={formatSlot(slot)}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                ))}
                {availableSlots.length > 3 && (
                  <Chip
                    label={`+${availableSlots.length - 3} more`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Profile Dialog */}
      <Dialog
        open={openProfile}
        onClose={handleCloseProfile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{ width: 48, height: 48, bgcolor: "#1976d2", fontWeight: "bold" }}
              alt={tutor.name}
            >
              {(tutor.name || "?").charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {tutor.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tutor.subject}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {/* Rating Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <StarIcon sx={{ color: "warning.main" }} />
              <Typography variant="subtitle2" fontWeight="bold">
                Rating & Reviews
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 3 }}>
              <Rating value={Number(tutor.rating) || 0} readOnly precision={0.1} />
              <Typography variant="body2" fontWeight="bold">
                {Number(tutor.rating || 0).toFixed(1)}/5
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ({(tutor.ratingCount || 0)} review{(tutor.ratingCount || 0) === 1 ? '' : 's'})
              </Typography>
            </Box>
          </Box>

          {/* Experience and Rate */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <SchoolIcon sx={{ color: "primary.main" }} />
              <Typography variant="subtitle2" fontWeight="bold">
                Experience & Rate
              </Typography>
            </Box>
            <Box sx={{ ml: 3, display: "flex", gap: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Years of Experience
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {tutor.experience} years
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Rate per Hour
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  RM{tutor.ratePerHour}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Bio */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
              About
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              {tutor.bio}
            </Typography>
          </Box>

          {/* Available Slots for Booking */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <CalendarTodayIcon sx={{ color: "info.main", fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight="bold">
                Available Slots ({availableSlots.length})
              </Typography>
            </Box>

            {availableSlots.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1, fontStyle: "italic" }}>
                No available slots at the moment. Please check back later.
              </Typography>
            ) : (
              <List
                sx={{
                  ml: 1,
                  maxHeight: 300,
                  overflow: "auto",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                {availableSlots.map((slot, index) => (
                  <ListItemButton
                    key={index}
                    selected={selectedSlot && selectedSlot.schedule_id === slot.schedule_id}
                    onClick={() => handleSelectSlot(slot)}
                    sx={{
                      py: 1.5,
                      "&.Mui-selected": {
                        bgcolor: "primary.lighter",
                        "&:hover": { bgcolor: "primary.lighter" },
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%", gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {formatSlot(slot)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Free slot
                        </Typography>
                      </Box>
                      {selectedSlot && selectedSlot.schedule_id === slot.schedule_id && (
                        <CheckCircleIcon sx={{ color: "success.main", fontSize: 20 }} />
                      )}
                    </Box>
                  </ListItemButton>
                ))}
              </List>
            )}

            {selectedSlot && (
              <Paper
                sx={{
                  mt: 2,
                  p: 1.5,
                  bgcolor: "success.lighter",
                  border: "1px solid",
                  borderColor: "success.main",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleIcon sx={{ color: "success.main" }} />
                  <Box>
                    <Typography variant="caption" fontWeight="bold" color="success.main">
                      Selected Slot
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatSlot(selectedSlot)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReviewsIcon color="primary" /> Reviews ({reviews.length})
            </Typography>
            
            {reviews.length === 0 ? (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                No reviews yet.
              </Typography>
            ) : (
              <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                {reviews.map((review) => (
                  <React.Fragment key={review.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {review.student_name || 'Student'}
                            </Typography>
                            <Rating value={review.rating} readOnly size="small" />
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {review.comment}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                              {new Date(review.created_at).toLocaleDateString()}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
          <Button 
            startIcon={<FlagIcon />} 
            color="error" 
            onClick={() => setReportDialogOpen(true)}
            size="small"
          >
            Report Tutor
          </Button>
          <Box>
            <Button onClick={handleCloseProfile} color="inherit" sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button
              onClick={handleBook}
              variant="contained"
              color="primary"
              size="small"
              disabled={!selectedSlot || availableSlots.length === 0}
            >
              Proceed to Payment
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <ReportDialog 
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        targetType="tutor"
        targetId={`tutor-${tutor.id}`}
        reportedId={tutor.userId || tutor.id} // Fallback if userId is not directly on tutor object
        defaultCategory="other"
      />
    </>
  );
}
