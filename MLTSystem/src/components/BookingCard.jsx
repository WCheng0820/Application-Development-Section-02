import React, { useState } from "react";
import {
  Typography,
  CardContent,
  Button,
  Box,
  Chip,
  Stack,
  Avatar,
  Divider
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Rating from '@mui/material/Rating';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
// Comments removed from rating dialog per requirements
import { useAuth } from "../context/AuthContext";

export default function BookingCards(props) {
  // Expect props: tutor, date, time, status, id, onCancel, studentContact, tutorContact, onMarkCompleted, onRate, studentUsername, studentName, tutorUsername,
  // tutorNameOriginal, studentNameOriginal
  const { tutor, date, time, status, id, onCancel, studentContact, tutorContact, onMarkCompleted, onRate, studentUsername, studentName, tutorUsername, tutorNameOriginal, studentNameOriginal, tutorId, studentId, rating } = props;
  const [openRate, setOpenRate] = useState(false);
  const [ratingValue, setRatingValue] = useState(rating || 5);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const { currentUser } = useAuth();
  const role = currentUser?.role || '';

  return (
    <CardContent>
      <Box display="flex" gap={2} alignItems="flex-start">
        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>{(tutor || '').charAt(0)}</Avatar>

        <Box flex={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                {tutor}
              </Typography>

              {/* Show contact info appropriate to the viewer: tutors should see student contact; students see tutor contact; admins see both */}
              {role.toLowerCase() === 'admin' ? (
                <Box>
                  {(tutorContact?.phone || tutorContact?.email) && (
                    <Box>
                      {tutorContact.phone && <Typography variant="caption" color="text.secondary">📞 Tutor: {tutorContact.phone}</Typography>}
                      {tutorContact.email && <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>✉️ Tutor: {tutorContact.email}</Typography>}
                    </Box>
                  )}
                  {(studentContact?.phone || studentContact?.email) && (
                    <Box>
                      {studentContact.phone && <Typography variant="caption" color="text.secondary">📞 Student: {studentContact.phone}</Typography>}
                      {studentContact.email && <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>✉️ Student: {studentContact.email}</Typography>}
                    </Box>
                  )}
                </Box>
              ) : (
                <Box>
                  {/* For tutors, show student contact; for students, show tutor contact */}
                  {role.toLowerCase() === 'tutor' ? (
                    (studentContact?.phone || studentContact?.email) && (
                      <Box>
                        {studentContact.phone && <Typography variant="caption" color="text.secondary">📞 {studentContact.phone}</Typography>}
                        {studentContact.email && <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>✉️ {studentContact.email}</Typography>}
                      </Box>
                    )
                  ) : (
                    (tutorContact?.phone || tutorContact?.email) && (
                      <Box>
                        {tutorContact.phone && <Typography variant="caption" color="text.secondary">📞 {tutorContact.phone}</Typography>}
                        {tutorContact.email && <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>✉️ {tutorContact.email}</Typography>}
                      </Box>
                    )
                  )}
                </Box>
              )}

              {/* If current user is a tutor, show the student's username (preferred) or display name */}
              {role.toLowerCase() === 'tutor' && (
                <Box mt={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Student: {studentUsername || studentName || 'Unknown'}
                  </Typography>
                </Box>
              )}

              {/* For admin show original names and account usernames below title */}
              {role.toLowerCase() === 'admin' && (
                <Box mt={0.5}>
                  {/* Show tutor id (preferred) and account username; fallback to original name if id missing */}
                  <Typography variant="caption" color="text.secondary">
                    Tutor: {tutorId ?? tutorNameOriginal}{tutorUsername ? ` (${tutorUsername})` : ''}
                  </Typography> <br></br>
                  <Typography variant="caption" color="text.secondary">
                    Student: {studentId ?? studentNameOriginal}{studentUsername ? ` (${studentUsername})` : ''}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box>
              <Chip
                label={status}
                color={status === "Confirmed" || status === "Completed" ? "success" : "warning"}
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Stack direction="row" spacing={2} alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarMonthIcon fontSize="small" />
              <Typography variant="body2">{date}</Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <AccessTimeIcon fontSize="small" />
              <Typography variant="body2">{time}</Typography>
            </Box>
          </Stack>

          <Box display="flex" justifyContent="flex-end" mt={2} gap={1}>
            {/* Only tutors or admins can cancel bookings */}
            {(role.toLowerCase() === 'tutor' || role.toLowerCase() === 'admin') && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => onCancel && onCancel(id)}
              >
                Cancel
              </Button>
            )}

            {/* Tutor: mark completed */}
            {role.toLowerCase() === 'tutor' && status === 'Confirmed' && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => {
                  if (!onMarkCompleted) return;
                  try {
                    setLoadingComplete(true);
                    const p = onMarkCompleted(id);
                    // onMarkCompleted returns a promise (Bookings page), so handle it
                    if (p && typeof p.then === 'function') {
                      p.then(() => setLoadingComplete(false)).catch(() => setLoadingComplete(false));
                    } else {
                      setLoadingComplete(false);
                    }
                  } catch (e) {
                    setLoadingComplete(false);
                  }
                }}
                disabled={loadingComplete}
              >
                {loadingComplete ? 'Marking...' : 'Mark Completed'}
              </Button>
            )}

            {/* Student: rate after completed */}
            {role.toLowerCase() === 'student' && status === 'Completed' && (
              <>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={() => setOpenRate(true)}
                  disabled={rating !== null && rating !== undefined}
                >
                  {rating !== null && rating !== undefined ? 'Already Rated' : 'Rate Tutor'}
                </Button>
                <Dialog open={openRate} onClose={() => setOpenRate(false)}>
                  <DialogTitle>Rate Tutor</DialogTitle>
                  <DialogContent>
                    <Box display="flex" alignItems="center" gap={2} mt={1} mb={1}>
                      <Rating
                        name="rating"
                        value={ratingValue}
                        onChange={(e, v) => setRatingValue(v)}
                      />
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setOpenRate(false)}>Cancel</Button>
                    <Button onClick={() => { setOpenRate(false); onRate && onRate(id, ratingValue); }} variant="contained">Submit</Button>
                  </DialogActions>
                </Dialog>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </CardContent>
  );
}
