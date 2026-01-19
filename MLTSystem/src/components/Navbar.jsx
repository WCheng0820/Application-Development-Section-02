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
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CircleIcon from '@mui/icons-material/Circle';
import * as MessagesController from "../controllers/MessagesController";
import * as socketService from "../services/socketService";
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Find Tutors", path: "/find-tutors" },
    // Admin sees "Manage Bookings", others see "Bookings"
    ...(currentUser?.role === 'admin' 
      ? [{ label: "Manage Bookings", path: "/admin/sessions" }]
      : [{ label: "Bookings", path: "/bookings" }]
    ),
    { label: "Materials", path: "/materials" },
    { 
      label: "Messages", 
      path: "/messages",
      badge: unreadMessages // Add badge count property
    },
  ];

  if (currentUser?.role === 'admin') {
    navItems.push({ label: "Reports", path: "/reports" });
    navItems.push({ label: "Manage Users", path: "/admin/users" });
  }

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (event) => {
    setNotificationAnchorEl(event.currentTarget);
    // Fetch latest notifications when opening the menu
    if (currentUser) {
        const userId = currentUser.studentId || currentUser.tutorId || currentUser.adminId || currentUser.id;
        if (userId) {
            try {
                const notifs = await MessagesController.fetchNotifications(userId);
                setNotifications(notifs);
            } catch (err) {
                console.error('Failed to fetch notifications', err);
            }
        }
    }
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleMarkAllRead = async () => {
    if (currentUser) {
      const userId = currentUser.studentId || currentUser.tutorId || currentUser.adminId || currentUser.id;
      if (userId) {
        await MessagesController.clearNotificationsForUser(userId);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadNotifications(0);
      }
    }
  };

  const handleNotificationItemClick = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
        await MessagesController.markNotificationRead(notification.id);
        // Update local state to reflect read status immediately
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
        setUnreadNotifications(prev => Math.max(0, prev - 1));
    }
    
    handleNotificationClose();

    // Navigate based on type
    if (notification.type === 'message') {
        navigate('/messages');
    } else if (notification.type === 'booking') {
        navigate('/bookings', { state: { highlightBookingId: notification.bookingId } });
    } else if (notification.type === 'feedback') {
        // If tutor receives feedback, go to dashboard or profile? 
        // User requirement: "Tutor will receive a notification when new feedback receive"
        // Dashboard seems appropriate as it has the "Recent Reviews" section now.
        navigate('/#recent-reviews'); 
    } else if (notification.type === 'report') {
        if (currentUser.role === 'admin') {
            navigate('/reports');
        }
        // For reporter, just stay on current page (notification cleared)
    } else if (notification.type === 'tutor_approval') {
        if (currentUser.role === 'admin') {
            navigate('/');
        }
    } else {
        // Default fallback
        navigate('/');
    }
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

  // Fetch unread count on mount and when currentUser changes
  useEffect(() => {
    const userId = currentUser?.studentId || currentUser?.tutorId || currentUser?.adminId || currentUser?.id;
    
    if (!userId) return;
    
    // Refresh count immediately
    refreshUnreadCount(userId);
    
    // Listen for new notifications via socket (user receives new message)
    const handleNotification = (notification) => {
        // If type is message, increment messages, else notifications
        if (notification.type === 'message') {
            setUnreadMessages(prev => prev + 1);
        } else {
            setUnreadNotifications(prev => prev + 1);
        }
    };
    socketService.onNotification(handleNotification);
    
    // Poll every 3 seconds for unread count
    const interval = setInterval(() => {
      refreshUnreadCount(userId);
    }, 3000);
    
    return () => {
      clearInterval(interval);
      socketService.offNotification();
    };
  }, [currentUser]);

  async function refreshUnreadCount(userId) {
    if (!userId) return;
    try {
      const msgs = await MessagesController.getUnreadMessagesCount(userId);
      const notifs = await MessagesController.getUnreadCount(userId);
      setUnreadMessages(msgs);
      setUnreadNotifications(notifs);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }

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
        <Box display="flex" alignItems="center" gap={2} component={Link} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            <AutoStoriesIcon sx={{ color: 'white' }} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main", letterSpacing: 1 }}>
            Mandarin Tutoring
          </Typography>
        </Box>

        {isAuthenticated && (
          <Box>
            {navItems.map((item) => {
              // Hide "Find Tutors" nav item for tutors
              if (item.path === '/find-tutors' && currentUser?.role?.toString().toLowerCase() === 'tutor') {
                return null;
              }
              // Add badge to Messages button
              if (item.path === '/messages') {
                return (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    sx={{
                      mx: 1,
                      color: location.pathname === item.path ? "black" : "text.secondary",
                      fontWeight: location.pathname === item.path ? "bold" : "normal",
                      position: 'relative'
                    }}
                  >
                    <Badge badgeContent={item.badge} color="error">
                      {item.label}
                    </Badge>
                  </Button>
                );
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
            <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge badgeContent={unreadNotifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Menu
              anchorEl={notificationAnchorEl}
              open={Boolean(notificationAnchorEl)}
              onClose={handleNotificationClose}
              PaperProps={{
                style: {
                  maxHeight: 500,
                  width: 360,
                },
                elevation: 4,
                sx: { borderRadius: 2, mt: 1.5 }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                  <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
                  {notifications.length > 0 && unreadNotifications > 0 && (
                    <Button 
                      size="small" 
                      startIcon={<DoneAllIcon />} 
                      onClick={handleMarkAllRead}
                      sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                    >
                      Mark all read
                    </Button>
                  )}
                </Box>
                {notifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', opacity: 0.6 }}>
                        <NotificationsIcon sx={{ fontSize: 40, mb: 1, color: 'text.disabled' }} />
                        <Typography variant="body2">No notifications yet</Typography>
                    </Box>
                ) : (
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {notifications.map((notif) => (
                        <MenuItem 
                            key={notif.id} 
                            onClick={() => handleNotificationItemClick(notif)}
                            sx={{ 
                                whiteSpace: 'normal', 
                                backgroundColor: notif.is_read ? 'inherit' : 'rgba(25, 118, 210, 0.04)',
                                borderBottom: '1px solid #f5f5f5',
                                py: 2,
                                px: 2,
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1.5
                            }}
                        >
                            {!notif.is_read && (
                              <CircleIcon sx={{ fontSize: 10, color: 'primary.main', mt: 0.8 }} />
                            )}
                            <Box sx={{ flex: 1 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                                  <Typography variant="subtitle2" fontWeight="bold" color={notif.is_read ? 'text.primary' : 'primary.main'}>
                                      {notif.type.charAt(0).toUpperCase() + notif.type.slice(1).replace('_', ' ')}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', ml: 1 }}>
                                      {new Date(notif.created_at).toLocaleDateString() === new Date().toLocaleDateString() 
                                        ? new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : new Date(notif.created_at).toLocaleDateString()}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                    {notif.text}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))}
                    </Box>
                )}
            </Menu>

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
