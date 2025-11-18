import React, { useState } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import pngtreeImage from "../assets/—Pngtree—thank you in different languages_9057022.jpg"; // Import the image

const allMaterials = [
  { name: "Material 1", category: "Beginner", link: "#" },
  { name: "Material 2", category: "Intermediate", link: "#" },
  { name: "Material 3", category: "Advanced", link: "#" },
  { name: "Material 4", category: "Beginner", link: "#" },
  { name: "Material 5", category: "Intermediate", link: "#" },
  { name: "Material 6", category: "Advanced", link: "#" },
];

export default function Materials() {
  const [category, setCategory] = useState("All Materials");

  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory);
  };

  const filteredMaterials =
    category === "All Materials"
      ? allMaterials
      : allMaterials.filter((material) => material.category === category);

  const handleView = (link) => {
    alert("This will link to the material: " + link);
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
            maxWidth: "100%", // Ensures the image scales properly
            height: "auto", // Maintains the aspect ratio
          }}
        />
      </Box>

      {/* Category Selection Bar */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 5 }}>
        <Button
          variant={category === "All Materials" ? "contained" : "outlined"}
          onClick={() => handleCategoryChange("All Materials")}
          sx={{ mx: 1 }}
        >
          All Materials
        </Button>
        <Button
          variant={category === "Beginner" ? "contained" : "outlined"}
          onClick={() => handleCategoryChange("Beginner")}
          sx={{ mx: 1 }}
        >
          Beginner
        </Button>
        <Button
          variant={category === "Intermediate" ? "contained" : "outlined"}
          onClick={() => handleCategoryChange("Intermediate")}
          sx={{ mx: 1 }}
        >
          Intermediate
        </Button>
        <Button
          variant={category === "Advanced" ? "contained" : "outlined"}
          onClick={() => handleCategoryChange("Advanced")}
          sx={{ mx: 1 }}
        >
          Advanced
        </Button>
      </Box>

      {/* Materials Grid */}
      <Grid container spacing={3}>
        {filteredMaterials.map((material, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={2.4} // Adjust for 5 items in full-width
            key={index}
          >
            <Box
              sx={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: 2,
                textAlign: "center",
                height: "140px", // Adjusted height to fit the label and title
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

              {/* Material Title */}
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                {material.name}
              </Typography>

              {/* View Button */}
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleView(material.link)}
              >
                View
              </Button>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}