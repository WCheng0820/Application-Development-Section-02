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
  Badge,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import AccountCircle from "@mui/icons-material/AccountCircle";
import * as MessagesController from "../controllers/MessagesController";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count when user logs in or navigates
  useEffect(() => {
    if (currentUser?.id) {
      fetchUnreadCount();
      // Refresh unread count every 3 seconds
      const interval = setInterval(fetchUnreadCount, 3000);
      return () => clearInterval(interval);
    }
  }, [currentUser?.id]);

  // Reset unread count when navigating to Messages page
  useEffect(() => {
    if (location.pathname === "/messages") {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  async function fetchUnreadCount() {
    if (!currentUser?.id) return;
    try {
      const conversations = await MessagesController.fetchConversations(currentUser.id);
      const unread = conversations.reduce((count, c) => count + (c.unread ? 1 : 0), 0);
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }

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
            {navItems.map((item) => (
              <Badge
                key={item.path}
                badgeContent={item.path === "/messages" ? unreadCount : 0}
                color="error"
              >
                <Button
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
              </Badge>
            ))}
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
              <Avatar sx={{ bgcolor: "grey.700" }}>
                {currentUser.profile.firstName?.[0]}{currentUser.profile.lastName?.[0]}
              </Avatar>
            </IconButton>
            <Typography variant="body1">
              {currentUser.profile.firstName} {currentUser.profile.lastName}
            </Typography>
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
