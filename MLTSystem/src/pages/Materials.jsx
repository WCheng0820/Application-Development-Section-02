import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Paper,
  Link,
  Stack,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Tooltip
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useAuth } from '../context/AuthContext';

export default function TutorUploadMaterial() {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Beginner");
  const [file, setFile] = useState(null);
  
  const [uploaded, setUploaded] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = sessionStorage.getItem('mlt_session_token');
      const response = await fetch(`${API_URL}/api/materials`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUploaded(data.data);
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  const handleUpload = async () => {
    if (!title || !file) {
      alert("Please enter a title and select a file!");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("file", file);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = sessionStorage.getItem('mlt_session_token');
      const response = await fetch(`${API_URL}/api/materials/upload`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert("Material uploaded successfully to Drive!");
        setTitle("");
        setDescription("");
        setFile(null);
        fetchMaterials();
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  // --- NEW: Handle Delete Function ---
  const handleDelete = async (id) => {
    // 1. Confirm with the user
    if (!window.confirm("Are you sure you want to delete this material? This cannot be undone.")) {
      return;
    }

    try {
      // 2. Call the backend
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/materials/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        alert("Material deleted!");
        // 3. Refresh the list
        fetchMaterials();
      } else {
        alert("Delete failed: " + data.error);
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Error deleting material.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pt: 10,
        pb: 4,
        px: 3,
        background: currentUser?.role === 'admin' ? 'linear-gradient(135deg, #e5b8f5 0%, #f3e0f9 100%)' : 'linear-gradient(135deg, #7abf6f 0%, #a0d69a 100%)',
      }}
    >
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
        <DescriptionIcon sx={{ fontSize: 40, color: currentUser?.role === 'admin' ? '#7b1fa2' : '#2e7d32' }} />
        <Box>
          <Typography variant="h4" fontWeight="700" sx={{ color: currentUser?.role === 'admin' ? '#7b1fa2' : '#2e7d32' }}>
            Upload Study Material
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Share learning resources with your students
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Upload Form */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 4,
              background: '#ffffff',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              height: "100%",
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
              <CloudUploadIcon /> New Upload
            </Typography>

            <TextField
              label="Material Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "rgba(255,255,255,0.5)" } }}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "rgba(255,255,255,0.5)" } }}
              placeholder="Brief description of the material..."
            />

            <TextField
              select
              fullWidth
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "rgba(255,255,255,0.5)" } }}
            >
              <MenuItem value="Beginner">Beginner</MenuItem>
              <MenuItem value="Intermediate">Intermediate</MenuItem>
              <MenuItem value="Advanced">Advanced</MenuItem>
            </TextField>

            <Box sx={{ mb: 3, p: 2, border: '2px dashed #ccc', borderRadius: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.3)' }}>
              <input
                accept="*/*"
                style={{ display: 'none' }}
                id="raised-button-file"
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <label htmlFor="raised-button-file">
                <Button variant="outlined" component="span" startIcon={<UploadFileIcon />}>
                  Select File
                </Button>
              </label>
              {file && (
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                  Selected: {file.name}
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={uploading}
              fullWidth
              size="large"
              startIcon={<CloudUploadIcon />}
              sx={{ borderRadius: 2, py: 1.5 }}
            >
              {uploading ? "Uploading..." : "Upload Material"}
            </Button>
          </Paper>
        </Grid>

        {/* Recently Uploaded List */}
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Recently Uploaded
            </Typography>
            <Chip label={`${uploaded.length} Files`} color="primary" size="small" />
          </Box>

          <Grid container spacing={3}>
            {uploaded.map((item, idx) => (
              <Grid item xs={12} sm={6} key={item.id || idx}>
                <Card
                  onClick={() => setExpandedCards(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                  sx={{
                    height: expandedCards[item.id] ? 'auto' : '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 3,
                    background: "#ffffff",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 4px 16px 0 rgba(31, 38, 135, 0.05)",
                    transition: "transform 0.2s, height 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px 0 rgba(31, 38, 135, 0.15)",
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" fontWeight="bold" noWrap sx={{ maxWidth: '70%' }}>
                        {item.title}
                      </Typography>
                      <Chip 
                        label={item.category} 
                        size="small" 
                        color={item.category === 'Beginner' ? 'success' : item.category === 'Intermediate' ? 'warning' : 'error'} 
                        variant="outlined"
                      />
                    </Box>
                    
                    {item.description && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 1,
                          overflow: expandedCards[item.id] ? 'visible' : 'hidden',
                          textOverflow: expandedCards[item.id] ? 'clip' : 'ellipsis',
                          display: expandedCards[item.id] ? 'block' : '-webkit-box',
                          WebkitLineClamp: expandedCards[item.id] ? 'none' : 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: expandedCards[item.id] ? 'auto' : '40px'
                        }}
                      >
                        {item.description}
                      </Typography>
                    )}
                    {item.description && item.description.length > 80 && (
                      <Typography variant="caption" color="primary" sx={{ fontStyle: 'italic', fontSize: '0.75rem', mb: 1 }}>
                        {expandedCards[item.id] ? 'Click to collapse' : 'Click to expand'}
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                    {item.web_view_link && (
                      <Button 
                        component={Link} 
                        href={item.web_view_link} 
                        target="_blank" 
                        variant="outlined" 
                        size="small"
                        startIcon={<VisibilityIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        View
                      </Button>
                    )}

                    <Tooltip title="Delete Material">
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(item.id)}
                        size="small"
                        sx={{ bgcolor: 'rgba(211, 47, 47, 0.1)', '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.2)' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            {uploaded.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 3 }}>
                  <Typography color="text.secondary">No materials uploaded yet.</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}