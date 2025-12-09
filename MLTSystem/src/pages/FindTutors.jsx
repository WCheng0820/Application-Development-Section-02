import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  Collapse,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import TutorCard from "../components/TutorCard";
import * as TutorsController from "../controllers/TutorsController";
import * as ScheduleController from "../controllers/ScheduleController";
import { useAuth } from "../context/AuthContext";
import { formatMalaysiaDate, formatMalaysiaTime } from "../utils/dateUtils";

export default function FindTutors() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [expandFilters, setExpandFilters] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Filter states
  const [keywords, setKeywords] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [minExperience, setMinExperience] = useState(0);
  const [minRating, setMinRating] = useState(0);

  const [subjects, setSubjects] = useState([]);
  const [priceMax, setPriceMax] = useState(50);
  const [experienceMax, setExperienceMax] = useState(10);

  // Initialize tutors
  useEffect(() => {
    const initializeTutors = async () => {
      await TutorsController.fetchTutors();

      const allTutors = TutorsController.getAllTutors();
      setTutors(allTutors);
      setFilteredTutors(allTutors);

      setSubjects(TutorsController.getUniqueSubjects());

      const priceMaxValue = TutorsController.getMaxRate();
      setPriceMax(priceMaxValue);
      setPriceRange([0, priceMaxValue]);

      const expMaxValue = TutorsController.getMaxExperience();
      setExperienceMax(expMaxValue);
    };

    initializeTutors();
  }, []);

  // Apply filters
  useEffect(() => {
    const filters = {
      keywords,
      subject: selectedSubject,
      minExperience,
      maxPrice: priceRange[1],
      minRating,
    };

    const results = TutorsController.filterTutors(filters);
    setFilteredTutors(results);
  }, [keywords, selectedSubject, priceRange, minExperience, minRating]);

  const handleResetFilters = () => {
    setKeywords("");
    setSelectedSubject("");
    setPriceRange([0, priceMax]);
    setMinExperience(0);
    setMinRating(0);
  };

  // Booking
  const handleBooking = async (tutor, selectedSlot) => {
    if (!selectedSlot) {
      alert("Please select a time slot");
      return;
    }
    if (!currentUser) {
      alert("Please log in to book a session");
      navigate("/login");
      return;
    }
    if (currentUser.role !== "student") {
      alert("Only students can book sessions");
      return;
    }

    setIsBooking(true);

    try {
    const studentId = currentUser.studentId || `s${String(currentUser.id).padStart(6, '0')}`;
      await ScheduleController.reserveSlot(
        tutor.id,
        selectedSlot.schedule_id,
        studentId
      );

      const bookingData = {
        tutorId: tutor.id,
        tutorName: tutor.name,
        scheduleId: selectedSlot.schedule_id,
        // keep a machine-readable schedule date and raw times so the payment page
        // can compute duration/total price accurately
        scheduleDate: selectedSlot.schedule_date,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        date: formatMalaysiaDate(selectedSlot.schedule_date, {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        time: `${formatMalaysiaTime(selectedSlot.start_time, { dateContext: selectedSlot.schedule_date })} - ${formatMalaysiaTime(selectedSlot.end_time, { dateContext: selectedSlot.schedule_date })}`,
        rate: tutor.ratePerHour,
        subject: tutor.subject,
      };

      navigate("/payment", { state: { booking: bookingData } });
    } catch (error) {
      alert(error.response?.data?.error || "Failed to reserve slot.");
      setIsBooking(false);
    }
  };

  // Count active filters
  const activeFiltersCount =
    (keywords ? 1 : 0) +
    (selectedSubject ? 1 : 0) +
    (priceRange[1] < priceMax ? 1 : 0) +
    (minExperience > 0 ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Find Your Perfect Mandarin Tutor 🇨🇳
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Browse experienced Mandarin Chinese tutors and filter by focus,
          experience, price, and rating to find your perfect match.
        </Typography>
      </Box>

      {/* Search + Filters */}
      {/* Hide search/filter dash for tutors (they don't need to find other tutors) */}
      {currentUser?.role?.toString().toLowerCase() !== 'tutor' && (
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by tutor name, learning focus, or keywords..."
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
            size="small"
          />
        </Box>

        {/* Filter Toggle */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Button
            startIcon={<FilterListIcon />}
            onClick={() => setExpandFilters(!expandFilters)}
            size="small"
          >
            {expandFilters ? "Hide" : "Show"} Filters
            {activeFiltersCount > 0 && (
              <Chip
                label={activeFiltersCount}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              startIcon={<ClearIcon />}
              onClick={handleResetFilters}
              size="small"
              variant="text"
            >
              Clear All
            </Button>
          )}
        </Box>

        {/* Expandable Filters */}
        <Collapse in={expandFilters}>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {/* Subject Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Learning Focus</InputLabel>
                  <Select
                    value={selectedSubject}
                    label="Learning Focus"
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <MenuItem value="">All Learning Focuses</MenuItem>
                    {subjects.map((subject) => (
                      <MenuItem key={subject} value={subject}>
                        {subject}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Price Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <Typography fontWeight="bold" mb={1}>
                  Price per Hour: RM{priceRange[1]}
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={(e, v) => setPriceRange(v)}
                  min={0}
                  max={priceMax}
                  step={2}
                  marks={[
                    { value: 0, label: "RM0" },
                    { value: priceMax, label: `RM${priceMax}` },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Grid>

              {/* Experience Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <Typography fontWeight="bold" mb={1}>
                  Min. Experience: {minExperience} years
                </Typography>
                <Slider
                  value={minExperience}
                  onChange={(e, v) => setMinExperience(v)}
                  min={0}
                  max={experienceMax}
                  step={1}
                  marks={[
                    { value: 0, label: "0" },
                    { value: experienceMax, label: `${experienceMax}` },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Grid>

              {/* Rating Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Minimum Rating</InputLabel>
                  <Select
                    value={minRating}
                    label="Minimum Rating"
                    onChange={(e) => setMinRating(e.target.value)}
                  >
                    <MenuItem value={0}>Any Rating</MenuItem>
                    <MenuItem value={3}>3★ & Above</MenuItem>
                    <MenuItem value={3.5}>3.5★ & Above</MenuItem>
                    <MenuItem value={4}>4★ & Above</MenuItem>
                    <MenuItem value={4.5}>4.5★ & Above</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>
      )}

      {/* Results */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={3}>
          {filteredTutors.length} tutor
          {filteredTutors.length !== 1 ? "s" : ""} found
        </Typography>

        {filteredTutors.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <Typography variant="h6" mb={2}>
              No tutors match your filters
            </Typography>
            <Button
              variant="contained"
              startIcon={<ClearIcon />}
              onClick={handleResetFilters}
            >
              Reset Filters
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredTutors.map((tutor) => (
              <Grid item xs={12} sm={6} md={4} key={tutor.id}>
                <TutorCard
                  tutor={tutor}
                  onBook={handleBooking}
                  isProcessing={isBooking}
                  initiallyOpen={location.state?.openTutorId === tutor.id}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}
