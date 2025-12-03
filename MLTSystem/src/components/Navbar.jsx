import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import AccountCircle from "@mui/icons-material/AccountCircle";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Find Tutors", path: "/find-tutors" },
    { label: "Bookings", path: "/bookings" },
    { label: "Materials", path: "/materials" },
    { label: "Messages", path: "/messages" },
  ];

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/edit-profile');
  };

  // Compute display name and avatar initial for current user (safe fallbacks)
  let displayName = 'User';
  let avatarInitial = '?';
  if (currentUser) {
    const profile = currentUser.profile || {};
    const firstName = profile.firstName || (profile.fullName ? profile.fullName.split(' ')[0] : '') || '';
    const lastName = profile.lastName || (profile.fullName ? profile.fullName.split(' ').slice(1).join(' ') : '') || '';
    const username = currentUser.username || '';
    const email = currentUser.email || '';
    displayName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : (username || email || 'User');
    avatarInitial = (firstName && firstName[0]) || (username && username[0]) || (email && email[0]) || '?';
  }

  // Don't show navbar on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

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

        {isAuthenticated && (
          <Box>
            {navItems.map((item) => {
              // Hide "Find Tutors" nav item for tutors
              if (item.path === '/find-tutors' && currentUser?.role?.toString().toLowerCase() === 'tutor') {
                return null;
              }
              return (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={{
                    mx: 1,
                    color: location.pathname === item.path ? "black" : "text.secondary",
                    fontWeight: location.pathname === item.path ? "bold" : "normal",
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
            {/* Top-level Manage Schedule for tutors */}
            {currentUser?.role === 'tutor' && (
              <Button
                key="/manage-schedule"
                component={Link}
                to="/manage-schedule"
                sx={{
                  mx: 1,
                  color: location.pathname === '/manage-schedule' ? 'black' : 'text.secondary',
                  fontWeight: location.pathname === '/manage-schedule' ? 'bold' : 'normal'
                }}
              >
                Manage Schedule
              </Button>
            )}
          </Box>
        )}

        {isAuthenticated && currentUser ? (
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ bgcolor: "grey.700" }}>{avatarInitial}</Avatar>
            </IconButton>
            <Typography variant="body1">{displayName}</Typography>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>Edit Profile</MenuItem>
              {/* Tutor-only menu entry to manage schedule */}
              {currentUser.role === 'tutor' && (
                <MenuItem onClick={() => { handleClose(); navigate('/manage-schedule'); }}>
                  Manage Schedule
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button component={Link} to="/login" color="inherit">
              Login
            </Button>
            <Button component={Link} to="/register" color="inherit">
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
