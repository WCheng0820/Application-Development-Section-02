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
  Stack // Added Stack for button alignment
} from "@mui/material";

export default function TutorUploadMaterial() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Beginner");
  const [file, setFile] = useState(null);
  
  const [uploaded, setUploaded] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/materials`);
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
      const response = await fetch(`${API_URL}/api/materials/upload`, {
        method: "POST",
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
    <Box sx={{ mt: 10, px: 5 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
        Upload Study Material
      </Typography>

      <Typography variant="h6" sx={{ mb: 5 }}>
        Tutors can upload learning resources for students
      </Typography>

      <Paper sx={{ p: 4, mb: 6 }}>
        <TextField
          label="Material Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 3 }}
          placeholder="Brief description of the material..."
        />

        <TextField
          select
          fullWidth
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ mb: 3 }}
        >
          <MenuItem value="Beginner">Beginner</MenuItem>
          <MenuItem value="Intermediate">Intermediate</MenuItem>
          <MenuItem value="Advanced">Advanced</MenuItem>
        </TextField>

        <Box sx={{ mb: 3 }}>
          <Button variant="outlined" component="label">
            Select File
            <input
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files[0])}
            />
          </Button>
        </Box>

        {file && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1">
              Selected: <strong>{file.name}</strong>
            </Typography>
          </Box>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={uploading}
          sx={{ mt: 2 }}
        >
          {uploading ? "Uploading..." : "Upload Material"}
        </Button>
      </Paper>

      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Recently Uploaded
      </Typography>

      <Grid container spacing={3}>
        {uploaded.map((item, idx) => (
          <Grid item xs={12} sm={6} md={4} key={item.id || idx}>
            <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" fontWeight="bold" noWrap>
                  {item.title}
                </Typography>
                {item.description && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.description}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Category: {item.category}
                </Typography>
              </Box>
              
              {/* Buttons Area */}
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {/* View Button */}
                {item.web_view_link && (
                  <Button 
                    component={Link} 
                    href={item.web_view_link} 
                    target="_blank" 
                    variant="outlined" 
                    size="small"
                    fullWidth
                  >
                    View
                  </Button>
                )}

                {/* --- NEW: Delete Button --- */}
                <Button 
                  variant="contained" 
                  color="error" // Red color
                  size="small"
                  onClick={() => handleDelete(item.id)}
                  fullWidth
                >
                  Delete
                </Button>
              </Stack>

            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}