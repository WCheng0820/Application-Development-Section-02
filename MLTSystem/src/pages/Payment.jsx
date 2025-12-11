import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Grid,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import * as ScheduleController from "../controllers/ScheduleController";
import { useAuth } from "../context/AuthContext";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const bookingData = location.state?.booking || null;
  // compute price based on slot duration and tutor rate
  const computeTotalAmount = (b) => {
    if (!b) return 0;
    const rate = parseFloat(b.rate) || 0;
    const scheduleDate = b.scheduleDate || b.schedule_date || null;
    const start = b.start_time || b.startTime || null;
    const end = b.end_time || b.endTime || null;

    const parseTimeToDate = (dateStr, timeStr) => {
      if (!dateStr || !timeStr) return null;
      const d = new Date(dateStr);
      const m = (timeStr || '').trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (!m || isNaN(d.getTime())) return null;
      d.setHours(parseInt(m[1], 10), parseInt(m[2], 10), m[3] ? parseInt(m[3], 10) : 0, 0);
      return d;
    };

    const s = parseTimeToDate(scheduleDate, start);
    const e = parseTimeToDate(scheduleDate, end);
    if (!s || !e) return +rate.toFixed(2);
    const hours = Math.max(0, (e.getTime() - s.getTime()) / (1000 * 60 * 60));
    const total = +(rate * hours).toFixed(2);
    return isNaN(total) ? +rate.toFixed(2) : total;
  };

  const totalAmount = computeTotalAmount(bookingData);
  const [paymentMethod, setPaymentMethod] = useState("tng");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!bookingData || !currentUser) {
      navigate("/find-tutors");
    }
  }, [bookingData, currentUser, navigate]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleConfirmPayment = async () => {
    if (!bookingData || !currentUser) return;

    setIsProcessing(true);
    setError("");

    try {
      // Call the book endpoint to finalize the booking
      const token = sessionStorage.getItem("mlt_session_token");
      const response = await fetch(
        `http://localhost:5000/api/schedule/${bookingData.tutorId}/${bookingData.scheduleId}/book`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId: currentUser.studentId || currentUser.id,
            subject: bookingData.subject || "Mandarin Tutoring",
            paymentMethod: paymentMethod,
            amount: totalAmount,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Booking failed");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/bookings");
      }, 2000);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment processing failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!bookingData) return;

    try {
      // Release the reserved slot
      const token = sessionStorage.getItem("mlt_session_token");
      await fetch(
        `http://localhost:5000/api/schedule/${bookingData.tutorId}/${bookingData.scheduleId}/release`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId: currentUser.studentId || currentUser.id,
          }),
        }
      );

      navigate("/find-tutors");
    } catch (err) {
      console.error("Cancel error:", err);
      setError("Failed to cancel booking");
    }
  };

  if (!bookingData) {
    return (
      <Container maxWidth="md" sx={{ mt: 12, mb: 6, textAlign: "center" }}>
        <Typography color="error">Booking data not found. Redirecting...</Typography>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="md" sx={{ mt: 12, mb: 6 }}>
        <Card sx={{ p: 4, textAlign: "center" }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" mb={2}>
            Booking Confirmed! ✅
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Your tutoring session has been successfully booked. You will be redirected to your bookings page.
          </Typography>
          <Typography variant="subtitle2" fontWeight="bold">
            Tutor: {bookingData.tutorName}
          </Typography>
          <Typography variant="body2">
            {bookingData.date} • {bookingData.time}
          </Typography>
        </Card>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pt: 10,
        pb: 4,
        px: 3,
        background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
      }}
    >
      <Container maxWidth="md">
        {/* Header Section */}
        <Paper
          elevation={3}
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <PaymentIcon sx={{ fontSize: 40, color: '#1565c0' }} />
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ color: '#1565c0' }}>
              Secure Payment
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              Complete your booking securely
            </Typography>
          </Box>
        </Paper>

        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          sx={{ mb: 3, color: 'white' }}
          disabled={isProcessing}
        >
          Back to Tutors
        </Button>

        <Grid container spacing={3}>
          {/* Booking Details */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={3}
              sx={{
                mb: 3,
                p: 3,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              }}
            >
              <Typography variant="h6" fontWeight="bold" mb={2} color="primary.main">
                Booking Details
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Tutor
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {bookingData.tutorName}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Date & Time
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {bookingData.date} • {bookingData.time}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="body2">Session Rate (per hour)</Typography>
                <Typography variant="body2" fontWeight="bold">
                  RM{Number(bookingData.rate).toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Total Amount
                </Typography>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  RM{Number(totalAmount).toFixed(2)}
                </Typography>
              </Box>
            </Paper>

            {/* Payment Method Selection */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
              }}
            >
              <Typography variant="h6" fontWeight="bold" mb={2} color="primary.main">
                Choose Payment Method
              </Typography>

              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                >
                  {/* TNG eWallet */}
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 2,
                      cursor: "pointer",
                      border: paymentMethod === "tng" ? "2px solid" : "1px solid",
                      borderColor: paymentMethod === "tng" ? "primary.main" : "divider",
                      bgcolor: paymentMethod === "tng" ? "rgba(25, 118, 210, 0.08)" : "rgba(255,255,255,0.5)",
                      transition: "all 0.3s",
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: "rgba(25, 118, 210, 0.04)",
                      },
                    }}
                    onClick={() => setPaymentMethod("tng")}
                  >
                    <FormControlLabel
                      value="tng"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <AccountBalanceWalletIcon color="primary" />
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              TNG eWallet
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Fast and secure payment via Touch 'n Go eWallet
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ width: "100%" }}
                    />
                  </Paper>

                  {/* Credit/Debit Card */}
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 2,
                      cursor: "pointer",
                      border: paymentMethod === "card" ? "2px solid" : "1px solid",
                      borderColor: paymentMethod === "card" ? "primary.main" : "divider",
                      bgcolor: paymentMethod === "card" ? "rgba(25, 118, 210, 0.08)" : "rgba(255,255,255,0.5)",
                      transition: "all 0.3s",
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: "rgba(25, 118, 210, 0.04)",
                      },
                    }}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <FormControlLabel
                      value="card"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <CreditCardIcon color="primary" />
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              Credit/Debit Card
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Visa, MasterCard, or American Express
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ width: "100%" }}
                    />
                  </Paper>
                </RadioGroup>
              </FormControl>

              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                <Typography variant="body2">
                  💡 This is a demo payment flow. In production, this would integrate with a real payment gateway.
                </Typography>
              </Alert>
            </Paper>
          </Grid>

          {/* Order Summary & Confirm */}
          <Grid item xs={12} md={5}>
            <Paper
              sx={{
                position: "sticky",
                top: 100,
                p: 3,
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
              }}
            >
              <Typography variant="h6" fontWeight="bold" mb={3} color="primary.main">
                Order Summary
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">Tutor Session</Typography>
                  <Typography variant="body2">RM{Number(bookingData.rate).toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="body2">Platform Fee</Typography>
                  <Typography variant="body2">RM0</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Total Payment
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  RM{Number(totalAmount).toFixed(2)}
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                sx={{ mb: 2, borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
              >
                {isProcessing ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                    Processing...
                  </>
                ) : (
                  `Pay RM${Number(totalAmount).toFixed(2)}`
                )}
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                fullWidth
                onClick={handleCancel}
                disabled={isProcessing}
                sx={{ borderRadius: 2 }}
              >
                Cancel Booking
              </Button>

              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, textAlign: "center" }}>
                Your payment information is secure and encrypted.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
