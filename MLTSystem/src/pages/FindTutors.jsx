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
  InputAdornment
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import SchoolIcon from "@mui/icons-material/School";
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
    <Box sx={{ 
      background: currentUser?.role === 'admin' ? 'linear-gradient(135deg, #e5b8f5 0%, #f3e0f9 100%)' : 'linear-gradient(135deg, #6db3f2 0%, #a8d5ff 100%)', 
      minHeight: "100vh", 
      pt: 10, 
      pb: 6 
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper 
          elevation={3}
          sx={{ 
            mb: 6, 
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            p: 4,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          }}
        >
          <Box display="flex" justifyContent="center" mb={2}>
            <Box sx={{ bgcolor: currentUser?.role === 'admin' ? 'rgba(123, 31, 162, 0.1)' : 'rgba(25, 118, 210, 0.1)', p: 2, borderRadius: '50%' }}>
              <SchoolIcon sx={{ fontSize: 40, color: currentUser?.role === 'admin' ? '#7b1fa2' : '#1565c0' }} />
            </Box>
          </Box>
          <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: currentUser?.role === 'admin' ? '#7b1fa2' : '#1565c0' }}>
            Find Your Perfect Mandarin Tutor 🇨🇳
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '800px', mx: 'auto' }}>
            Browse experienced Mandarin Chinese tutors and filter by focus,
            experience, price, and rating to find your perfect match.
          </Typography>
        </Paper>

        {/* Search + Filters */}
        {/* Hide search/filter dash for tutors (they don't need to find other tutors) */}
        {currentUser?.role?.toString().toLowerCase() !== 'tutor' && (
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
          {/* Search Bar */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search by tutor name, learning focus, or keywords..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, bgcolor: 'white' }
              }}
              variant="outlined"
            />
          </Box>

          {/* Filter Toggle */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Button
              startIcon={<FilterListIcon />}
              onClick={() => setExpandFilters(!expandFilters)}
              variant={expandFilters ? "contained" : "outlined"}
              sx={{ borderRadius: 2 }}
            >
              {expandFilters ? "Hide Filters" : "Show Filters"}
              {activeFiltersCount > 0 && (
                <Chip
                  label={activeFiltersCount}
                  size="small"
                  color="secondary"
                  sx={{ ml: 1, height: 20, minWidth: 20 }}
                />
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                startIcon={<ClearIcon />}
                onClick={handleResetFilters}
                color="error"
                sx={{ borderRadius: 2 }}
              >
                Clear All
              </Button>
            )}
          </Box>

          {/* Expandable Filters */}
          <Collapse in={expandFilters}>
            <Box sx={{ pt: 2, borderTop: '1px solid #eee', mt: 2 }}>
              <Grid container spacing={3}>
                {/* Subject Filter */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Learning Focus</InputLabel>
                    <Select
                      value={selectedSubject}
                      label="Learning Focus"
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      sx={{ bgcolor: 'white', borderRadius: 1 }}
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
                  <Typography variant="body2" fontWeight="bold" gutterBottom color="text.secondary">
                    Max Price: RM{priceRange[1]}/hr
                  </Typography>
                  <Slider
                    value={priceRange}
                    onChange={(e, v) => setPriceRange(v)}
                    min={0}
                    max={priceMax}
                    step={5}
                    valueLabelDisplay="auto"
                    sx={{ color: 'primary.main' }}
                  />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">RM0</Typography>
                    <Typography variant="caption" color="text.secondary">RM{priceMax}</Typography>
                  </Box>
                </Grid>

                {/* Experience Filter */}
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom color="text.secondary">
                    Min Experience: {minExperience} years
                  </Typography>
                  <Slider
                    value={minExperience}
                    onChange={(e, v) => setMinExperience(v)}
                    min={0}
                    max={experienceMax}
                    step={1}
                    valueLabelDisplay="auto"
                    sx={{ color: 'secondary.main' }}
                  />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">0 yrs</Typography>
                    <Typography variant="caption" color="text.secondary">{experienceMax} yrs</Typography>
                  </Box>
                </Grid>

                {/* Rating Filter */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Minimum Rating</InputLabel>
                    <Select
                      value={minRating}
                      label="Minimum Rating"
                      onChange={(e) => setMinRating(e.target.value)}
                      sx={{ bgcolor: 'white', borderRadius: 1 }}
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
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              color="text.primary"
              sx={{ 
                backgroundColor: '#fafafa',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}
            >
              Available Tutors
            </Typography>
            <Chip 
              label={`${filteredTutors.length} found`} 
              color="primary" 
              variant="filled" 
              sx={{ fontWeight: 'bold', backgroundColor: 'white', color: 'black' }}
            />
          </Box>

          {filteredTutors.length === 0 ? (
            <Paper 
              sx={{ 
                p: 6, 
                textAlign: "center", 
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <SearchIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" mb={2} color="text.secondary">
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
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4} 
                  key={tutor.id}
                  sx={{
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                >
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
    </Box>
  );
}
