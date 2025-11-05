import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Find Tutors", path: "/find-tutors" },
    { label: "Bookings", path: "/bookings" },
    { label: "Materials", path: "/materials" },
    { label: "Messages", path: "/messages" },
  ];

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={1}
      sx={{ backgroundColor: "white" }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "red" }}>
          Mandarin Tutoring
        </Typography>

        <Box>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              sx={{
                mx: 1,
                color:
                  location.pathname === item.path ? "black" : "text.secondary",
                fontWeight:
                  location.pathname === item.path ? "bold" : "normal",
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: "grey.700" }}>A</Avatar>
          <Typography variant="body1">Alice Wang</Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
