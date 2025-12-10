import React, { useState, useEffect } from "react";
import { 
  Box, Button, Grid, Typography, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";

// Keep your image import exactly as it was
import pngtreeImage from "../assets/—Pngtree—thank you in different languages_9057022.jpg"; 

export default function StudentMaterials() {
  const [materials, setMaterials] = useState([]); // Store data from DB
  const [category, setCategory] = useState("All Materials");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch materials from Backend on load
  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      // Use backend API base (defaults to 5000)
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/materials`);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setMaterials(data.data);
      } else {
        console.error("Failed to fetch materials");
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
      // Fallback demo data so page still renders if backend route is missing
      setMaterials([
        { id: 'demo-1', title: 'Pinyin Basics', category: 'Beginner', web_view_link: 'https://example.com/pinyin' },
        { id: 'demo-2', title: 'Tone Drills', category: 'Beginner', web_view_link: 'https://example.com/tones' },
        { id: 'demo-3', title: 'Grammar Patterns', category: 'Intermediate', web_view_link: 'https://example.com/grammar' },
        { id: 'demo-4', title: 'Essay Writing', category: 'Advanced', web_view_link: 'https://example.com/essay' },
      ]);
    }
  };

  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory);
  };

  const handleReportClick = (material) => {
    setSelectedMaterial(material);
    setReportReason("");
    setReportDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setReportDialogOpen(false);
    setSelectedMaterial(null);
    setReportReason("");
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) {
      alert("Please enter a reason for this report.");
      return;
    }

    if (!selectedMaterial.web_view_link) {
      alert("Material link is missing. Cannot submit report.");
      handleCloseDialog();
      return;
    }

    setIsSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = sessionStorage.getItem('mlt_session_token');
      if (!token) {
        alert("Session expired. Please log in again.");
        setIsSubmitting(false);
        return;
      }
      const response = await fetch(`${API_URL}/api/material-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          materialLink: selectedMaterial.web_view_link,
          materialTitle: selectedMaterial.title,
          reason: reportReason.trim()
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('Material reported successfully. Admins will review it shortly.');
        handleCloseDialog();
      } else {
        alert(`Error: ${data.error || 'Failed to report material'}`);
      }
    } catch (error) {
      console.error('Report submission error:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Filter logic based on the real data
  const filteredMaterials =
    category === "All Materials"
      ? materials
      : materials.filter((material) => material.category === category);

  // 3. Open Google Drive Link
  const handleView = (link) => {
    if (link) {
        window.open(link, "_blank"); // Opens in new tab
    } else {
        alert("Link not available");
    }
  };

  return (
    <Box sx={{ mt: 10, px: 5 }}>
      {/* Title */}
      <Typography variant="h4" fontWeight="bold" sx={{ textAlign: "left" }}>
        Learning Material
      </Typography>

      {/* Subtitle */}
      <Typography variant="h6" sx={{ textAlign: "left", mb: 3 }}>
        Browse and download study resources
      </Typography>

      {/* PNGTree Image */}
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <img
          src={pngtreeImage}
          alt="Thank you in different languages"
          style={{
            maxWidth: "100%", 
            height: "auto", 
          }}
        />
      </Box>

      {/* Category Selection Bar */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 5 }}>
        {['All Materials', 'Beginner', 'Intermediate', 'Advanced'].map((cat) => (
            <Button
                key={cat}
                variant={category === cat ? "contained" : "outlined"}
                onClick={() => handleCategoryChange(cat)}
                sx={{ mx: 1 }}
            >
                {cat}
            </Button>
        ))}
      </Box>

      {/* Materials Grid */}
      <Grid container spacing={3}>
        {filteredMaterials.map((material, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={2.4} 
            key={material.id || index} // Use DB ID if available
          >
            <Box
              sx={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: 2,
                textAlign: "center",
                height: "200px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              {/* Category Label */}
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "#f0f0f0",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#555",
                }}
              >
                {material.category}
              </Box>

              {/* Report Flag Button (Top Left) */}
              <Tooltip title="Report this material">
                <IconButton
                  size="small"
                  onClick={() => handleReportClick(material)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    color: "#d32f2f",
                    "&:hover": {
                      backgroundColor: "rgba(211, 47, 47, 0.1)",
                    },
                  }}
                >
                  <FlagIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {/* Material Title (Changed from .name to .title to match DB) */}
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5, mt: 3, fontSize: '1rem' }}>
                {material.title}
              </Typography>

              {/* Material Description */}
              {material.description && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 1, 
                    fontSize: '0.85rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.4,
                  }}
                >
                  {material.description}
                </Typography>
              )}

              {/* View Button */}
              <Button
                variant="contained"
                color="primary"
                // Uses the web_view_link from Google Drive
                onClick={() => handleView(material.web_view_link)}
              >
                View
              </Button>
            </Box>
          </Grid>
        ))}
      </Grid>
      
      {/* Helper message if no files found */}
      {filteredMaterials.length === 0 && (
          <Typography sx={{ textAlign: 'center', mt: 4, width: '100%' }}>
              No materials found in this category.
          </Typography>
      )}

      {/* Report Dialog Form */}
      <Dialog open={reportDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Report Material: {selectedMaterial?.title}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Please provide a reason for reporting this material. Our admins will review it shortly.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Report Reason"
            placeholder="Explain why you're reporting this material..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            variant="outlined"
            disabled={isSubmitting}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReport}
            variant="contained"
            color="error"
            disabled={isSubmitting || !reportReason.trim()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}