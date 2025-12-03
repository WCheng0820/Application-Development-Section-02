import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StarIcon from "@mui/icons-material/Star";

import * as MessagesController from "../controllers/MessagesController";
import { useAuth } from "../context/AuthContext";

export default function Messages() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [text, setText] = useState("");
  const [fileObj, setFileObj] = useState(null);
  const [snack, setSnack] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load conversations on mount and when currentUser changes
  useEffect(() => {
    if (currentUser?.studentId || currentUser?.tutorId) {
      refreshConversations();
    }
  }, [currentUser?.studentId, currentUser?.tutorId]);

  async function refreshConversations() {
    if (!currentUser?.studentId && !currentUser?.tutorId) return;
    setLoading(true);
    try {
      const userId = currentUser.studentId || currentUser.tutorId;
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
        const currentUserId = currentUser.studentId || currentUser.tutorId;
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
        const convos = await MessagesController.fetchConversations(currentUserId);
        setConversations(convos);
      } catch (err) {
        setSnack({ severity: "error", message: "Failed to load messages" });
      }
    })();
  }, [selectedConversation, currentUser?.id]);

  function handleFileChange(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) {
      setFileObj(null);
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
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
      await MessagesController.sendMessage({
        bookingId: selectedConversation.bookingId,
        senderId: currentUser.studentId || currentUser.tutorId,
        senderName: `${currentUser.profile?.firstName || currentUser.email} ${currentUser.profile?.lastName || ""}`.trim(),
        recipientId: selectedConversation.otherParticipantId,
        content: text,
        attachment: fileObj,
      });
      
      setText("");
      setFileObj(null);
      
      // Reload thread + conversations
      const currentUserId = currentUser.studentId || currentUser.tutorId;
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

  if (!currentUser) {
    return (
      <Box sx={{ mt: 10, px: 4 }}>
        <Typography>Please log in to view messages</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 10, px: 4, pb: 4 }}>
      <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
        Messages & Notifications
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Chat with your tutors and receive updates on your bookings
      </Typography>

      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Left column: conversations list */}
        <Paper sx={{ width: 320, p: 2, maxHeight: 700, overflowY: "auto" }}>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
            Conversations
            {conversations.some(c => c.unread) && (
              <Badge badgeContent={conversations.filter(c => c.unread).length} color="error" sx={{ ml: 1 }} />
            )}
          </Typography>

          <List sx={{ p: 0 }}>
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
                  backgroundColor: selectedConversation?.otherParticipantId === c.otherParticipantId ? "#f5f5f5" : "transparent",
                  "&:hover": { backgroundColor: "#fafafa" }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "#1976d2" }}>
                    {(c.otherParticipantName || "?").charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography fontWeight={c.unread ? 700 : 500} sx={{ flex: 1 }}>
                        {c.otherParticipantName}
                      </Typography>
                      {c.unread && (
                        <Badge color="error" variant="dot" sx={{ ml: 1 }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {c.snippet}
                      </Typography>
                      {c.hasBooking && c.bookingInfo && (
                        <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                          <Chip
                            size="small"
                            icon={<CalendarTodayIcon />}
                            label={c.bookingInfo.date}
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            icon={<AccessTimeIcon />}
                            label={`${c.bookingInfo.startTime} - ${c.bookingInfo.endTime}`}
                            variant="outlined"
                          />
                        </Box>
                      )}
                      {c.timestamp && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                          {new Date(c.timestamp).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
            {conversations.length === 0 && (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography color="text.secondary">No conversations yet</Typography>
              </Box>
            )}
          </List>
        </Paper>

        {/* Right column: thread + booking info */}
        <Box sx={{ flex: 1 }}>
          {!selectedConversation ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">Select a conversation to start messaging</Typography>
            </Paper>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Booking Info Box (if applicable) */}
              {selectedConversation.hasBooking && selectedConversation.bookingInfo && (
                <Card sx={{ backgroundColor: "#e3f2fd" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                      📅 Booking Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Date</Typography>
                        <Typography variant="body1" fontWeight="600">
                          {new Date(selectedConversation.bookingInfo.date).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Time</Typography>
                        <Typography variant="body1" fontWeight="600">
                          {selectedConversation.bookingInfo.startTime} - {selectedConversation.bookingInfo.endTime}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <Chip
                          label={selectedConversation.bookingInfo.status}
                          color={selectedConversation.bookingInfo.status === "confirmed" ? "success" : "warning"}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Tutor Info (if no booking) */}
              {!selectedConversation.hasBooking && selectedConversation.tutorInfo && (
                <Card sx={{ backgroundColor: "#f3e5f5" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                      👨‍🏫 Tutor Information
                    </Typography>
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
                  </CardContent>
                </Card>
              )}

              {/* Messages Thread */}
              <Paper sx={{ height: 400, p: 2, display: "flex", flexDirection: "column", overflowY: "auto" }}>
                <Box sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
                  {threadMessages.length === 0 ? (
                    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography color="text.secondary">No messages yet. Start the conversation!</Typography>
                    </Box>
                  ) : (
                    threadMessages.map((m) => {
                      const currentUserId = currentUser.studentId || currentUser.tutorId;
                      const isCurrentUser = m.senderId === currentUserId;
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
                            {(m.senderId || "?").charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1, maxWidth: "70%" }}>
                            <Box sx={{
                              bgcolor: isCurrentUser ? "#c8e6c9" : "#e3f2fd",
                              p: 1.5,
                              borderRadius: 2,
                              wordBreak: "break-word"
                            }}>
                              {m.content && (
                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                  {m.content}
                                </Typography>
                              )}
                              {m.attachment && m.attachment.dataUrl && (
                                <Box sx={{ mt: m.content ? 1 : 0 }}>
                                  {m.attachment.type.startsWith("image/") && (
                                    <img
                                      src={m.attachment.dataUrl}
                                      alt="attachment"
                                      style={{ maxWidth: 250, borderRadius: 4 }}
                                    />
                                  )}
                                  {m.attachment.type.startsWith("audio/") && (
                                    <audio controls src={m.attachment.dataUrl} style={{ maxWidth: 250 }} />
                                  )}
                                  {m.attachment.type === "application/pdf" && (
                                    <a href={m.attachment.dataUrl} target="_blank" rel="noreferrer">
                                      📄 {m.attachment.name}
                                    </a>
                                  )}
                                </Box>
                              )}
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: isCurrentUser ? "flex-end" : "flex-start", gap: 0.5, mt: 0.5 }}>
                              {m.readBy && m.readBy.length >= 2 ? (
                                <Typography variant="caption" sx={{ color: "#2196F3", fontWeight: "bold" }}>
                                  ✓✓ Read
                                </Typography>
                              ) : (
                                <Typography variant="caption" sx={{ color: "#999" }}>
                                  ✓ Sent
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
                </Box>

                {/* File draft preview */}
                {fileObj && (
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: "#f0f0f0", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2">📎 Draft:</Typography>
                      <Chip
                        label={fileObj.name}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <IconButton size="small" onClick={handleRemoveFile}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}

                {/* Composer */}
                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end", borderTop: "1px solid #eee", pt: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    size="small"
                  />
                  <input id="file-input" type="file" style={{ display: "none" }} onChange={handleFileChange} />
                  <label htmlFor="file-input">
                    <IconButton component="span" size="small">
                      <AttachFileIcon />
                    </IconButton>
                  </label>
                  <Button variant="contained" endIcon={<SendIcon />} onClick={handleSend} size="small">
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
    </Box>
  );
}
