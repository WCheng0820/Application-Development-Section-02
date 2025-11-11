import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Card,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Paper,
  Collapse,
  IconButton,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import TutorCard from "../components/TutorCard";
import * as TutorsController from "../controllers/TutorsController";

export default function FindTutors() {
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [expandFilters, setExpandFilters] = useState(false);

  // Filter states
  const [keywords, setKeywords] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [minExperience, setMinExperience] = useState(0);
  const [minRating, setMinRating] = useState(0);

  const [subjects, setSubjects] = useState([]);
  const [priceMax, setPriceMax] = useState(50);
  const [experienceMax, setExperienceMax] = useState(10);

  // Initialize
  useEffect(() => {
    const allTutors = TutorsController.fetchAllTutors();
    setTutors(allTutors);
    setFilteredTutors(allTutors);

    const availableSubjects = TutorsController.getAvailableSubjects();
    setSubjects(availableSubjects);

    const priceRange = TutorsController.getPriceRange();
    setPriceMax(priceRange.max);
    setPriceRange([0, priceRange.max]);

    const expRange = TutorsController.getExperienceRange();
    setExperienceMax(expRange.max);
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

    const results = TutorsController.searchAndFilterTutors(filters);
    setFilteredTutors(results);
  }, [keywords, selectedSubject, priceRange, minExperience, minRating]);

  const handleResetFilters = () => {
    setKeywords("");
    setSelectedSubject("");
    setPriceRange([0, priceMax]);
    setMinExperience(0);
    setMinRating(0);
  };

  const handleBooking = (tutor) => {
    alert(`Booking tutor: ${tutor.name}\nThis would open a booking form in a full implementation.`);
    // In a full implementation, this would navigate to a booking form or open a dialog
  };

  const activeFiltersCount =
    (keywords ? 1 : 0) +
    (selectedSubject ? 1 : 0) +
    (priceRange[1] < priceMax ? 1 : 0) +
    (minExperience > 0 ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 6 }}>
      {/* Header Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Find Your Perfect Mandarin Tutor 🇨🇳
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Browse our experienced Mandarin Chinese tutors and filter by learning focus, experience, price, and rating to find the perfect match for your Mandarin learning journey.
        </Typography>
      </Box>

      {/* Search and Filter Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, bgcolor: "background.paper" }}>
        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by tutor name, learning focus, or keywords..."
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
            variant="outlined"
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
              color="inherit"
            >
              Clear All
            </Button>
          )}
        </Box>

        {/* Expandable Filters */}
        <Collapse in={expandFilters}>
          <Box sx={{ pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
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

              {/* Price Range Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                  Price per Hour: RM{priceRange[1]}
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={(e, newValue) => setPriceRange(newValue)}
                  min={0}
                  max={priceMax}
                  step={2}
                  marks={[
                    { value: 0, label: "RM0" },
                    { value: priceMax, label: `RM${priceMax}` },
                  ]}
                  valueLabelDisplay="auto"
                  sx={{ mt: 2 }}
                />
              </Grid>

              {/* Experience Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                  Min. Experience: {minExperience} years
                </Typography>
                <Slider
                  value={minExperience}
                  onChange={(e, newValue) => setMinExperience(newValue)}
                  min={0}
                  max={experienceMax}
                  step={1}
                  marks={[
                    { value: 0, label: "0" },
                    { value: experienceMax, label: `${experienceMax}` },
                  ]}
                  valueLabelDisplay="auto"
                  sx={{ mt: 2 }}
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

      {/* Results Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={3}>
          {filteredTutors.length} tutor{filteredTutors.length !== 1 ? "s" : ""} found
        </Typography>

        {filteredTutors.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              bgcolor: "action.hover",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary" mb={2}>
              No tutors match your filters
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Try adjusting your search criteria to see more results.
            </Typography>
            <Button
              variant="contained"
              onClick={handleResetFilters}
              startIcon={<ClearIcon />}
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
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}
