import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Badge,
  Snackbar,
  Alert,
  Chip,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  InputAdornment,
  Collapse,
} from "@mui/material";
import MessageIcon from "@mui/icons-material/Message";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StarIcon from "@mui/icons-material/Star";
import AddCommentIcon from "@mui/icons-material/AddComment";
import SearchIcon from "@mui/icons-material/Search";
import FlagIcon from "@mui/icons-material/Flag";
import ReportDialog from "../components/ReportDialog";

import * as MessagesController from "../controllers/MessagesController";
import { useAuth } from "../context/AuthContext";
import * as socketService from "../services/socketService";

export default function Messages() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [text, setText] = useState("");
  const [fileObj, setFileObj] = useState(null);
  const [snack, setSnack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [bookingInfoExpanded, setBookingInfoExpanded] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const messagesEndRef = React.useRef(null);
  const selectedConversationRef = React.useRef(selectedConversation);
  
  // New Chat Dialog State
  const [openNewChat, setOpenNewChat] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]); // Tutors or Students
  const [searchTerm, setSearchTerm] = useState("");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  // Keep ref in sync with state
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadMessages]);

  // Load conversations on mount and when currentUser changes
  useEffect(() => {
    if (currentUser?.studentId || currentUser?.tutorId || currentUser?.adminId) {
      refreshConversations();
    }
  }, [currentUser?.studentId, currentUser?.tutorId, currentUser?.adminId]);

  // Refresh conversations periodically to update booking status
  useEffect(() => {
    if (!currentUser?.studentId && !currentUser?.tutorId && !currentUser?.adminId) return;
    
    const interval = setInterval(() => {
      refreshConversations();
    }, 10000); // Check every 10 seconds for status updates
    
    return () => clearInterval(interval);
  }, [currentUser?.studentId, currentUser?.tutorId, currentUser?.adminId]);

  // Initialize socket connection
  useEffect(() => {
    const userId = currentUser?.studentId || currentUser?.tutorId || currentUser?.adminId;
    if (!userId) return;

    socketService.initSocket(userId);

    // Clean up old listeners first to prevent duplicates
    socketService.offMessageReceived();
    socketService.offReadReceipt();
    socketService.offUserStatus();
    socketService.offTypingStatus();

    // Listen for incoming messages
    socketService.onMessageReceived((data) => {
      const currentSelected = selectedConversationRef.current;
      const currentUserId = currentUser?.studentId || currentUser?.tutorId || currentUser?.adminId;

      // 1. Update thread messages if viewing this conversation
      const isCurrentConversation = currentSelected && (
        (data.bookingId && data.bookingId === currentSelected.bookingId) ||
        (!data.bookingId && (data.senderId === currentSelected.otherParticipantId || data.recipientId === currentSelected.otherParticipantId))
      );

      if (isCurrentConversation) {
        setThreadMessages(prev => {
          if (prev.some(m => m.id === data.id)) return prev;
          return [...prev, {
            ...data,
            id: data.id || Date.now(),
            timestamp: data.timestamp || Date.now(),
            readBy: data.readBy || [],
            status: data.status || 'delivered'
          }];
        });

        // If message is from other person, mark as read immediately
        if (data.senderId !== currentUserId) {
           MessagesController.markRead(data.id, currentUserId);
           // Send read receipt
           const conversationId = data.bookingId || 
             `${[currentUserId, data.senderId].sort().join('-')}`;
           socketService.sendReadReceipt(conversationId, data.id, currentUserId);
        }
      }

      // 2. Update conversations list (unread count, snippet, timestamp)
      setConversations(prev => {
        const updated = prev.map(c => {
          const isForThisConvo = (data.bookingId && data.bookingId === c.bookingId) ||
                                 (!data.bookingId && (data.senderId === c.otherParticipantId || data.recipientId === c.otherParticipantId));
          
          if (isForThisConvo) {
            // If we are currently viewing this conversation, unread count stays 0 (since we read it)
            // Otherwise, increment it
            const newUnreadCount = isCurrentConversation ? 0 : (c.unreadCount || 0) + 1;
            
            return {
              ...c,
              snippet: data.content || (data.attachment ? `Attachment: ${data.attachment.name}` : 'New message'),
              timestamp: data.timestamp || Date.now(),
              unreadCount: newUnreadCount,
              unread: newUnreadCount > 0
            };
          }
          return c;
        });
        // Sort by timestamp desc
        return updated.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      });
    });

    // Listen for read receipts - update message status in real-time
    socketService.onReadReceipt((data) => {
      const { messageId, userId: readByUserId, readAt } = data;
      setThreadMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          let readBy = msg.readBy || [];
          const alreadyRead = readBy.some(r => r.userId === readByUserId);
          if (!alreadyRead) {
            readBy = [...readBy, { userId: readByUserId, readAt }];
          }
          return {
            ...msg,
            readBy,
            status: readBy.length >= 2 ? 'read' : 'delivered'
          };
        }
        return msg;
      }));
    });

    // Listen for user status changes
    socketService.onUserStatus((data) => {
      setOnlineUsers(data.onlineUsers || []);
    });

    // Listen for typing status
    socketService.onTypingStatus((data) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(JSON.stringify({ userId: data.userId, userName: data.userName }));
          return newSet;
        } else {
          // Remove all entries with this userId
          const filtered = new Set();
          newSet.forEach(item => {
            try {
              const parsed = JSON.parse(item);
              if (parsed.userId !== data.userId) {
                filtered.add(item);
              }
            } catch (e) {
              // Skip invalid JSON items
            }
          });
          return filtered;
        }
      });
    });

    // Cleanup on unmount
    return () => {
      socketService.offMessageReceived();
      socketService.offReadReceipt();
      socketService.offUserStatus();
      socketService.offTypingStatus();
      socketService.disconnectSocket();
    };
  }, [currentUser?.studentId, currentUser?.tutorId, currentUser?.adminId]);

  async function refreshConversations() {
    const userId = currentUser?.studentId || currentUser?.tutorId || currentUser?.adminId;
    if (!userId) return;
    setLoading(true);
    try {
      const convos = await MessagesController.fetchConversations(userId);
      setConversations(convos);
      if (!selectedConversation && convos.length) {
        setSelectedConversation(convos[0]);
      }
    } catch (err) {
      setSnack({ severity: "error", message: "Failed to load conversations" });
    } finally {
      setLoading(false);
    }
  }

  // When conversation is selected, load messages and auto-mark unread as read
  useEffect(() => {
    if (!selectedConversation || !currentUser?.id) return;
    
    (async () => {
      try {
        const currentUserId = currentUser.studentId || currentUser.tutorId || currentUser.adminId;
        
        // Join socket room for real-time updates
        socketService.joinConversation(
          selectedConversation.bookingId,
          currentUserId,
          selectedConversation.otherParticipantId
        );
        
        const msgs = await MessagesController.fetchMessages(
          selectedConversation.bookingId,
          currentUserId,
          selectedConversation.otherParticipantId
        );
        setThreadMessages(msgs);
        
        // Auto-mark unread messages as read when opening chat
        for (const msg of msgs) {
          if (msg.senderId !== currentUserId && !msg.readBy?.some((r) => r.userId === currentUserId)) {
            await MessagesController.markRead(msg.id, currentUserId);
            
            // Send read receipt via socket
            const conversationId = selectedConversation.bookingId || 
              `${[currentUserId, selectedConversation.otherParticipantId].sort().join('-')}`;
            socketService.sendReadReceipt(conversationId, msg.id, currentUserId);
          }
        }
        
        // Refresh to show updated read status
        const updatedMsgs = await MessagesController.fetchMessages(
          selectedConversation.bookingId,
          currentUserId,
          selectedConversation.otherParticipantId
        );
        setThreadMessages(updatedMsgs);
        
        // Refresh conversations to update unread badges
        // const convos = await MessagesController.fetchConversations(currentUserId);
        // setConversations(convos);
      } catch (err) {
        setSnack({ severity: "error", message: "Failed to load messages" });
      }
    })();

    // Cleanup when leaving conversation
    return () => {
      if (selectedConversation && (currentUser?.studentId || currentUser?.tutorId || currentUser?.adminId)) {
        const currentUserId = currentUser.studentId || currentUser.tutorId || currentUser.adminId;
        socketService.leaveConversation(
          selectedConversation.bookingId,
          currentUserId,
          selectedConversation.otherParticipantId
        );
        setTypingUsers(new Set());
      }
    };
  }, [selectedConversation, currentUser?.id]);

  function handleFileChange(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) {
      setFileObj(null);
      return;
    }
    // Max 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (f.size > MAX_SIZE) {
      setSnack({ severity: "error", message: "File too large (max 5MB)" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFileObj({ name: f.name, type: f.type, size: f.size, dataUrl: ev.target.result });
      setSnack({ severity: "info", message: `File "${f.name}" attached as draft` });
    };
    reader.readAsDataURL(f);
  }

  function handleRemoveFile() {
    setFileObj(null);
  }

  // Handle typing indicators with debounce
  const typingTimeoutRef = React.useRef(null);
  
  function handleTextChange(e) {
    const newText = e.target.value;
    setText(newText);
    
    if (!selectedConversation) return;
    
    const conversationId = selectedConversation.bookingId || 
      `${[currentUser.studentId || currentUser.tutorId || currentUser.adminId, selectedConversation.otherParticipantId].sort().join('-')}`;
    const userId = currentUser.studentId || currentUser.tutorId || currentUser.adminId;
    
    // Get user's full name from profile
    const firstName = currentUser.profile?.firstName || '';
    const lastName = currentUser.profile?.lastName || '';
    const userName = (firstName || lastName) 
      ? `${firstName} ${lastName}`.trim()
      : currentUser.username || userId;
    
    // Send typing indicator
    if (newText.trim().length > 0) {
      socketService.setTypingStatus(conversationId, userId, userName, true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketService.setTypingStatus(conversationId, userId, userName, false);
      }, 2000);
    } else {
      socketService.setTypingStatus(conversationId, userId, userName, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  }

  async function handleSend() {
    if (!selectedConversation || !currentUser?.id) {
      setSnack({ severity: "error", message: "Please select a conversation" });
      return;
    }
    
    if (!text.trim() && !fileObj) {
      setSnack({ severity: "error", message: "Please enter a message or attach a file" });
      return;
    }

    try {
      const currentUserId = currentUser.studentId || currentUser.tutorId || currentUser.adminId || currentUser.userId;
      const messageData = {
        bookingId: selectedConversation.bookingId,
        senderId: currentUserId,
        senderName: `${currentUser.profile?.firstName || currentUser.email} ${currentUser.profile?.lastName || ""}`.trim(),
        recipientId: selectedConversation.otherParticipantId,
        content: text,
        attachment: fileObj,
      };

      // Send via HTTP (Backend will handle socket broadcast)
      await MessagesController.sendMessage(messageData);
      
      setText("");
      setFileObj(null);
      setTypingUsers(new Set()); // Clear typing status
      
      // Reload thread + conversations
      const msgs = await MessagesController.fetchMessages(
        selectedConversation.bookingId,
        currentUserId,
        selectedConversation.otherParticipantId
      );
      setThreadMessages(msgs);
      const convos = await MessagesController.fetchConversations(currentUserId);
      setConversations(convos);
      
      setSnack({ severity: "success", message: "Message sent" });
    } catch (err) {
      setSnack({ severity: "error", message: err.message || "Send failed" });
    }
  }

  // Handle opening new chat dialog
  const handleOpenNewChat = async () => {
    setOpenNewChat(true);
    setAvailableUsers([]);
    try {
      if (currentUser?.studentId) {
        const tutors = await MessagesController.fetchAvailableTutors();
        setAvailableUsers(tutors);
      } else if (currentUser?.tutorId) {
        const students = await MessagesController.fetchAvailableStudents();
        setAvailableUsers(students);
      } else if (currentUser?.adminId) {
        const users = await MessagesController.fetchAllUsers();
        setAvailableUsers(users);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const handleStartChat = (user) => {
    // Determine other participant ID based on current user role
    let otherId;
    if (currentUser?.studentId) {
        otherId = user.tutorId;
    } else if (currentUser?.tutorId) {
        otherId = user.studentId;
    } else if (currentUser?.adminId) {
        otherId = user.userId;
    }
    
    // Check if conversation already exists
    const existing = conversations.find(c => c.otherParticipantId === otherId);
    
    if (existing) {
      setSelectedConversation(existing);
    } else {
      // Create temporary conversation object
      const newConvo = {
        bookingId: null,
        title: `Chat with ${user.name || user.username}`,
        otherParticipantId: otherId,
        otherParticipantName: user.name || user.username,
        snippet: 'Start a new conversation',
        timestamp: Date.now(),
        unread: false,
        unreadCount: 0,
        hasBooking: false,
        // Only add tutorInfo if we are a student viewing a tutor
        tutorInfo: currentUser?.studentId ? {
          price: user.price,
          specialization: user.specialization,
          rating: user.rating
        } : null
      };
      setConversations([newConvo, ...conversations]);
      setSelectedConversation(newConvo);
    }
    setOpenNewChat(false);
  };

  const handleBookingClick = (bookingId) => {
    navigate('/bookings', { state: { highlightBookingId: bookingId } });
  };

  const handleTutorClick = (tutorId) => {
    navigate('/find-tutors', { state: { openTutorId: tutorId } });
  };

  if (!currentUser) {
    return (
      <Box sx={{ mt: 10, px: 4 }}>
        <Typography>Please log in to view messages</Typography>
      </Box>
    );
  }

  const isTutor = currentUser?.role === 'tutor';
  const isAdmin = currentUser?.role === 'admin';
  const themeColor = isTutor ? '#2e7d32' : isAdmin ? '#7b1fa2' : '#1976d2';
  const gradient = isTutor 
    ? 'linear-gradient(135deg, #7abf6f 0%, #a0d69a 100%)' 
    : isAdmin
      ? 'linear-gradient(135deg, #e5b8f5 0%, #f3e0f9 100%)'
      : 'linear-gradient(135deg, #6db3f2 0%, #a8d5ff 100%)';
  const iconColor = isTutor ? '#2e7d32' : isAdmin ? '#7b1fa2' : '#1565c0';

  return (
    <Box
      sx={{
        height: "100vh",
        pt: 10,
        pb: 2,
        px: 3,
        background: gradient,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header Section */}
      <Paper
        elevation={3}
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <MessageIcon sx={{ fontSize: 32, color: iconColor }} />
        <Box>
          <Typography variant="h5" fontWeight="700" sx={{ color: iconColor }}>
            Messages & Notifications
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: "flex", gap: 3, flex: 1, minHeight: 0 }}>
        {/* Left column: conversations list */}
        <Paper
          elevation={3}
          sx={{
            width: 320,
            p: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6" fontWeight="600" color="primary">
                Conversations
              </Typography>
              {conversations.some(c => c.unread) && (
                <Badge badgeContent={conversations.filter(c => c.unread).length} color="error" />
              )}
            </Box>
            <IconButton onClick={handleOpenNewChat} color="primary" title="New Chat">
              <AddCommentIcon />
            </IconButton>
          </Box>

          <List sx={{ p: 0, overflowY: "auto", flex: 1 }}>
            {conversations.map((c) => (
              <ListItem
                key={c.otherParticipantId}
                onClick={() => setSelectedConversation(c)}
                button
                selected={selectedConversation?.otherParticipantId === c.otherParticipantId}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  cursor: "pointer",
                  backgroundColor: selectedConversation?.otherParticipantId === c.otherParticipantId ? "rgba(25, 118, 210, 0.1)" : "transparent",
                  "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.05)" },
                  borderLeft: selectedConversation?.otherParticipantId === c.otherParticipantId ? "4px solid #1976d2" : "4px solid transparent",
                  transition: "all 0.2s"
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "#1976d2" }}>
                    {(c.otherParticipantName || "?").charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={c.otherParticipantName}
                  primaryTypographyProps={{ fontWeight: c.unread ? 700 : 500 }}
                  secondary={c.snippet}
                  secondaryTypographyProps={{ variant: "body2", color: "text.secondary", sx: { mt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }}
                />
                {c.unreadCount > 0 && (
                  <Box sx={{ 
                    ml: 1,
                    bgcolor: "error.main",
                    color: "white",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    boxShadow: 1
                  }}>
                    {c.unreadCount}
                  </Box>
                )}
                {c.timestamp && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                    {new Date(c.timestamp).toLocaleString()}
                  </Typography>
                )}
              </ListItem>
            ))}
            {conversations.length === 0 && (
              <Box sx={{ p: 2, textAlign: "center", mt: 4 }}>
                <Typography color="text.secondary" sx={{ mb: 2 }}>No conversations yet</Typography>
                <Button variant="contained" startIcon={<AddCommentIcon />} onClick={handleOpenNewChat}>
                  Start New Chat
                </Button>
              </Box>
            )}
          </List>
        </Paper>

        {/* Right column: thread + booking info */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
          {!selectedConversation ? (
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: 3,
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
              }}
            >
              <MessageIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary">Select a conversation to start messaging</Typography>
            </Paper>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, height: "100%" }}>
              {/* Chat Header with Report Button */}
              <Paper
                sx={{
                  p: 1.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 3,
                  boxShadow: "0 4px 16px 0 rgba(31, 38, 135, 0.1)",
                }}
              >
                  <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: "#1976d2" }}>
                          {(selectedConversation.otherParticipantName || "?").charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="h6" fontWeight="600">
                          {selectedConversation.otherParticipantName}
                      </Typography>
                  </Box>
                  <Button 
                      variant="outlined" 
                      color="error" 
                      startIcon={<FlagIcon />}
                      onClick={() => setReportDialogOpen(true)}
                      size="small"
                      sx={{ borderRadius: 2 }}
                  >
                      Report
                  </Button>
              </Paper>

              {/* Booking Info Box (if applicable) */}
              {selectedConversation.hasBooking && selectedConversation.bookings && selectedConversation.bookings.length > 0 && (
                <Card 
                    sx={{ 
                        background: "#ffffff",
                        borderRadius: 3,
                        boxShadow: "0 4px 16px 0 rgba(31, 38, 135, 0.1)",
                    }}
                >
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Box 
                        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => setBookingInfoExpanded(!bookingInfoExpanded)}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle2" fontWeight="600" color="primary.dark">
                            📅 Latest Booking
                            </Typography>
                            {selectedConversation.bookings.length > 1 && (
                                <Chip label={`${selectedConversation.bookings.length}`} size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
                            )}
                        </Box>
                        <IconButton size="small" sx={{ p: 0 }}>
                            {bookingInfoExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                        </IconButton>
                    </Box>
                    
                    <Collapse in={bookingInfoExpanded}>
                        <Box 
                            sx={{ mt: 1, cursor: 'pointer' }} 
                            onClick={() => handleBookingClick(selectedConversation.bookings[0].id)}
                        >
                            {(() => {
                                const latestBooking = selectedConversation.bookings[0];
                                return (
                                    <Grid container spacing={1}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Date</Typography>
                                            <Typography variant="body2" fontWeight="600">
                                            {new Date(latestBooking.date).toLocaleDateString()}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Time</Typography>
                                            <Typography variant="body2" fontWeight="600">
                                            {latestBooking.startTime} - {latestBooking.endTime}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary">Status:</Typography>
                                            <Chip
                                            label={latestBooking.status}
                                            color={latestBooking.status === "confirmed" ? "success" : latestBooking.status === "cancelled" ? "error" : "warning"}
                                            size="small"
                                            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }}
                                            />
                                        </Grid>
                                    </Grid>
                                );
                            })()}
                        </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              )}

              {/* Tutor Info (if no booking) */}
              {!selectedConversation.hasBooking && selectedConversation.tutorInfo && (
                <Card 
                    sx={{ 
                        background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
                        borderRadius: 3,
                        boxShadow: "0 4px 16px 0 rgba(31, 38, 135, 0.1)",
                    }}
                >
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Box 
                        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => setBookingInfoExpanded(!bookingInfoExpanded)}
                    >
                        <Typography variant="subtitle2" fontWeight="600" color="secondary.dark">
                        👨‍🏫 Tutor Information
                        </Typography>
                        <IconButton size="small" sx={{ p: 0 }}>
                            {bookingInfoExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                        </IconButton>
                    </Box>

                    <Collapse in={bookingInfoExpanded}>
                        <Box sx={{ mt: 1, cursor: 'pointer' }} onClick={() => handleTutorClick(selectedConversation.otherParticipantId)}>
                            <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Specialization</Typography>
                                <Typography variant="body1" fontWeight="600">
                                {selectedConversation.tutorInfo.specialization}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Hourly Rate</Typography>
                                <Typography variant="body1" fontWeight="600">
                                RM {selectedConversation.tutorInfo.price}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <StarIcon sx={{ color: "#ffc107", fontSize: 18 }} />
                                <Typography variant="body1" fontWeight="600">
                                    {selectedConversation.tutorInfo.rating || "No rating yet"}
                                </Typography>
                                </Box>
                            </Grid>
                            </Grid>
                        </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              )}

              {/* Messages Thread */}
              <Paper
                sx={{
                  flex: 1,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  background: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 3,
                  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                }}
              >
                <Box sx={{ flex: 1, overflowY: "auto", mb: 2, px: 1 }}>
                  {threadMessages.length === 0 ? (
                    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography color="text.secondary">No messages yet. Start the conversation!</Typography>
                    </Box>
                  ) : (
                    threadMessages.map((m) => {
                      const currentUserId = currentUser.studentId || currentUser.tutorId || currentUser.adminId;
                      const isCurrentUser = m.senderId === currentUserId;
                      
                      // Use name initials instead of ID initials
                      const myInitial = (currentUser?.username || currentUser?.email || "?").charAt(0).toUpperCase();
                      const otherInitial = (selectedConversation?.otherParticipantName || "?").charAt(0).toUpperCase();
                      
                      return (
                        <Box
                          key={m.id}
                          sx={{
                            mb: 2,
                            display: "flex",
                            gap: 1,
                            alignItems: "flex-start",
                            flexDirection: isCurrentUser ? "row-reverse" : "row",
                          }}
                        >
                          <Avatar sx={{ bgcolor: isCurrentUser ? "#4caf50" : "#1976d2", width: 32, height: 32 }}>
                            {isCurrentUser ? myInitial : otherInitial}
                          </Avatar>
                          <Box sx={{ flex: 1, maxWidth: "70%" }}>
                            <Box sx={{
                              bgcolor: "white",
                              color: "text.primary",
                              p: 2,
                              borderRadius: isCurrentUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                              wordBreak: "break-word",
                              border: "1px solid #eee"
                            }}>
                              {m.content && (
                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", fontSize: "0.95rem" }}>
                                  {m.content}
                                </Typography>
                              )}
                              {m.attachment && m.attachment.dataUrl && (
                                <Box sx={{ mt: m.content ? 1 : 0 }}>
                                  {m.attachment.type.startsWith("image/") && (
                                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                      <img
                                        src={m.attachment.dataUrl}
                                        alt="attachment"
                                        style={{ maxWidth: 250, borderRadius: 8, cursor: 'pointer' }}
                                        onClick={() => setExpandedImage(m.attachment.dataUrl)}
                                      />
                                      <IconButton
                                        size="small"
                                        sx={{
                                          position: 'absolute',
                                          top: 5,
                                          right: 5,
                                          bgcolor: 'rgba(0,0,0,0.5)',
                                          color: 'white',
                                          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                                        }}
                                        onClick={() => setExpandedImage(m.attachment.dataUrl)}
                                        title="Expand image"
                                      >
                                        <SearchIcon fontSize="small" />
                                      </IconButton>
                                      {m.attachment.size && (
                                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                          {formatFileSize(m.attachment.size)}
                                        </Typography>
                                      )}
                                    </Box>
                                  )}
                                  {m.attachment.type.startsWith("audio/") && (
                                    <Box>
                                      <audio controls src={m.attachment.dataUrl} style={{ maxWidth: 250 }} />
                                      {m.attachment.size && (
                                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                          {formatFileSize(m.attachment.size)}
                                        </Typography>
                                      )}
                                    </Box>
                                  )}
                                  {/* Generic handler for documents including PDF, Office files */}
                                  {!m.attachment.type.startsWith("image/") && !m.attachment.type.startsWith("audio/") && (
                                    <a 
                                      href={m.attachment.dataUrl} 
                                      download={m.attachment.name}
                                      target="_blank" 
                                      rel="noreferrer"
                                      style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: 'inherit' }}
                                    >
                                      <Box sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2">
                                          {m.attachment.type.includes('pdf') ? '📄' : 
                                           m.attachment.type.includes('sheet') || m.attachment.type.includes('excel') ? '📊' :
                                           m.attachment.type.includes('presentation') || m.attachment.type.includes('powerpoint') ? '📽️' :
                                           m.attachment.type.includes('word') ? '📝' : '📎'}
                                        </Typography>
                                        <Box>
                                          <Typography variant="body2" sx={{ textDecoration: 'underline' }}>
                                            {m.attachment.name}
                                          </Typography>
                                          {m.attachment.size && (
                                            <Typography variant="caption" color="text.secondary">
                                              {formatFileSize(m.attachment.size)}
                                            </Typography>
                                          )}
                                        </Box>
                                      </Box>
                                    </a>
                                  )}
                                </Box>
                              )}
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: isCurrentUser ? "flex-end" : "flex-start", gap: 0.5, mt: 0.5 }}>
                              {isCurrentUser ? (
                                // For sent messages, show read/sent status
                                m.readBy && m.readBy.length >= 2 ? (
                                  <Typography variant="caption" sx={{ color: "#2196F3", fontWeight: "bold" }}>
                                    ✓✓ Read
                                  </Typography>
                                ) : (
                                  <Typography variant="caption" sx={{ color: "#999" }}>
                                    ✓ Sent
                                  </Typography>
                                )
                              ) : (
                                // For received messages, show delivered status
                                <Typography variant="caption" sx={{ color: "#4CAF50", fontWeight: "500" }}>
                                  ✓ Delivered
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Typing indicator */}
                {typingUsers.size > 0 && (
                  <Box sx={{ mb: 1, px: 1.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      {Array.from(typingUsers).map(item => {
                        try {
                          const parsed = JSON.parse(item);
                          return parsed.userName || parsed.userId;
                        } catch {
                          return item;
                        }
                      }).join(", ")} {typingUsers.size === 1 ? "is" : "are"} typing...
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.3 }}>
                      <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#999", animation: "bounce 1.4s infinite" }} />
                      <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#999", animation: "bounce 1.4s infinite 0.2s" }} />
                      <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#999", animation: "bounce 1.4s infinite 0.4s" }} />
                    </Box>
                  </Box>
                )}

                {/* File draft preview */}
                {fileObj && (
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: "#f0f0f0", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2">📎 Draft:</Typography>
                      <Box>
                        <Chip
                          label={fileObj.name}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(fileObj.size)}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={handleRemoveFile}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}

                {/* Composer */}
                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end", borderTop: "1px solid rgba(0,0,0,0.05)", pt: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Type a message..."
                    value={text}
                    onChange={handleTextChange}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        backgroundColor: "rgba(255,255,255,0.5)",
                      }
                    }}
                  />
                  <input id="file-input" type="file" style={{ display: "none" }} onChange={handleFileChange} />
                  <label htmlFor="file-input">
                    <IconButton component="span" size="small" color="primary">
                      <AttachFileIcon />
                    </IconButton>
                  </label>
                  <Button variant="contained" endIcon={<SendIcon />} onClick={handleSend} size="small" sx={{ borderRadius: 3, px: 3 }}>
                    Send
                  </Button>
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      </Box>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack(null)}>
        {snack ? (
          <Alert onClose={() => setSnack(null)} severity={snack.severity} sx={{ width: "100%" }}>
            {snack.message}
          </Alert>
        ) : null}
      </Snackbar>

      {/* New Chat Dialog */}
      <Dialog 
        open={openNewChat} 
        onClose={() => setOpenNewChat(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: "#ffffff",
            backgroundColor: "#ffffff !important",
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#1976d2", bgcolor: "#ffffff" }}>Start New Conversation</DialogTitle>
        <DialogContent sx={{ bgcolor: "#ffffff" }}>
          <TextField
            fullWidth
            placeholder={currentUser?.studentId ? "Search tutors..." : "Search students..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2, mt: 1 }}
          />
          <List>
            {availableUsers
              .filter(u => (u.name || u.username).toLowerCase().includes(searchTerm.toLowerCase()))
              .map((user) => (
                <ListItem 
                  key={user.tutorId || user.studentId || user.userId} 
                  button 
                  onClick={() => handleStartChat(user)}
                  sx={{ borderRadius: 2, mb: 0.5, '&:hover': { bgcolor: '#f5f5f5' } }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "#1976d2" }}>
                      {(user.name || user.username).charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={user.name || user.username} 
                    secondary={
                      currentUser?.studentId 
                        ? `${user.specialization} • RM${user.price}/hr`
                        : currentUser?.adminId
                          ? null
                          : user.email
                    } 
                  />
                  {currentUser?.adminId && (
                    <Chip label={user.role} size="small" color={user.role === 'tutor' ? 'primary' : 'default'} sx={{ height: 20, fontSize: '0.7rem', textTransform: 'capitalize', ml: 1 }} />
                  )}
                </ListItem>
              ))}
            {availableUsers.length === 0 && (
              <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                No users found
              </Typography>
            )}
          </List>
        </DialogContent>
      </Dialog>
      <ReportDialog 
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        targetType="message"
        targetId={selectedConversation?.bookingId ? `booking-${selectedConversation.bookingId}` : `chat-${selectedConversation?.otherParticipantId}`}
        reportedId={selectedConversation?.otherParticipantId}
        defaultCategory="harassment"
      />

      {/* Image Expansion Dialog */}
      <Dialog
        open={!!expandedImage}
        onClose={() => setExpandedImage(null)}
        maxWidth="lg"
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <IconButton
            onClick={() => setExpandedImage(null)}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              zIndex: 1
            }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={expandedImage}
            alt="Expanded view"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 8
            }}
          />
        </Box>
      </Dialog>
    </Box>
  );
}

