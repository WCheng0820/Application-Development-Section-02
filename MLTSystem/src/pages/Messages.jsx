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
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";

import * as BookingsController from "../controllers/BookingsController";
import * as MessagesController from "../controllers/MessagesController";
import { useAuth } from "../context/AuthContext";

// Messages page using AuthContext for current user
// Features:
// - Bidirectional messaging (student <-> tutor)
// - Auto-mark-as-read when opening chat
// - File attachment draft preview before send
// - Uses User IDs from AuthContext

export default function Messages() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [text, setText] = useState("");
  const [fileObj, setFileObj] = useState(null);
  const [snack, setSnack] = useState(null);

  // Mock users map for display (in a real app, fetch from user service)
  const usersMap = {
    1: { id: 1, firstName: "Alice", lastName: "Wang", role: "student" },
    2: { id: 2, firstName: "Li", lastName: "Ming", role: "tutor" },
    3: { id: 3, firstName: "Admin", lastName: "User", role: "admin" },
  };

  const getCurrentUserName = (userId) => {
    const user = usersMap[userId];
    return user ? `${user.firstName} ${user.lastName}` : `User ${userId}`;
  };

  // Load conversations on mount and when currentUser changes
  useEffect(() => {
    if (currentUser?.id) {
      refreshConversations();
    }
  }, [currentUser?.id]);

  async function refreshConversations() {
    if (!currentUser?.id) return;
    try {
      const convos = await MessagesController.fetchConversations(currentUser.id);
      setConversations(convos);
      if (!selectedBookingId && convos.length) {
        setSelectedBookingId(convos[0].bookingId);
      }
    } catch (err) {
      setSnack({ severity: "error", message: "Failed to load conversations" });
    }
  }

  // When conversation is selected, load messages and auto-mark unread as read
  useEffect(() => {
    if (!selectedBookingId || !currentUser?.id) return;
    
    (async () => {
      try {
        const msgs = await MessagesController.fetchMessages(selectedBookingId);
        setThreadMessages(msgs);
        
        // Auto-mark unread messages as read when opening chat
        for (const msg of msgs) {
          if (msg.senderId !== currentUser.id && !msg.readBy?.some((r) => r.userId === currentUser.id)) {
            await MessagesController.markRead(msg.id, currentUser.id);
          }
        }
        
        // Refresh to show updated read status
        const updatedMsgs = await MessagesController.fetchMessages(selectedBookingId);
        setThreadMessages(updatedMsgs);
        
        // Refresh conversations to update unread badges
        const convos = await MessagesController.fetchConversations(currentUser.id);
        setConversations(convos);
      } catch (err) {
        setSnack({ severity: "error", message: "Failed to load messages" });
      }
    })();
  }, [selectedBookingId, currentUser?.id]);

  function handleFileChange(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) {
      setFileObj(null);
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setSnack({ severity: "error", message: "File too large (max 2MB)" });
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
    setSnack({ severity: "info", message: "File attachment removed" });
  }

  async function handleSend() {
    if (!selectedBookingId || !currentUser?.id) {
      setSnack({ severity: "error", message: "Please select a conversation" });
      return;
    }
    
    if (!text.trim() && !fileObj) {
      setSnack({ severity: "error", message: "Please enter a message or attach a file" });
      return;
    }

    try {
      await MessagesController.sendMessage({
        bookingId: selectedBookingId,
        senderId: currentUser.id,
        senderName: `${currentUser.profile?.firstName || currentUser.email} ${currentUser.profile?.lastName || ""}`.trim(),
        content: text,
        attachment: fileObj,
      });
      
      setText("");
      setFileObj(null);
      
      // Reload thread + conversations
      const msgs = await MessagesController.fetchMessages(selectedBookingId);
      setThreadMessages(msgs);
      const convos = await MessagesController.fetchConversations(currentUser.id);
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
    <Box sx={{ mt: 10, px: 4 }}>
      <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
        Messages & Notifications
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Stay connected with your tutors and students
      </Typography>

      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Left column: conversations */}
        <Paper sx={{ width: 360, p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Tabs value={0} sx={{ "& .MuiTabs-flexContainer": { gap: 1 } }}>
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography>Messages</Typography>
                    <Badge
                      color="error"
                      badgeContent={conversations.reduce((acc, c) => acc + (c.unread ? 1 : 0), 0)}
                    />
                  </Box>
                }
              />
            </Tabs>
          </Box>

          <List>
            {conversations.map((c) => (
              <ListItem
                key={c.bookingId}
                onClick={() => setSelectedBookingId(c.bookingId)}
                button
                selected={selectedBookingId === c.bookingId}
                sx={{ mb: 1, borderRadius: 2 }}
              >
                <ListItemAvatar>
                  <Avatar>{(getCurrentUserName(c.otherParticipantId) || "U").charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography fontWeight={700}>{getCurrentUserName(c.otherParticipantId)}</Typography>
                      {c.unread && (
                        <Box sx={{ bgcolor: "error.main", color: "white", px: 1, borderRadius: 1, fontSize: 12 }}>
                          New
                        </Box>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {c.snippet}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {c.timestamp ? new Date(c.timestamp).toLocaleString() : ""}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
            {conversations.length === 0 && (
              <Box sx={{ p: 2 }}>
                <Typography color="text.secondary">No conversations yet</Typography>
              </Box>
            )}
          </List>
        </Paper>

        {/* Right column: thread */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ height: "auto", maxHeight: 600, p: 2, display: "flex", flexDirection: "column" }}>
            <Box sx={{ overflowY: "auto", mb: 2, flex: 1, minHeight: 300 }}>
              {!selectedBookingId ? (
                <Box sx={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography color="text.secondary">Select a message to view</Typography>
                </Box>
              ) : (
                threadMessages.map((m) => {
                  const isCurrentUser = m.senderId === currentUser.id;
                  return (
                    <Box
                      key={m.id}
                      sx={{
                        mb: 2,
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-start",
                        flexDirection: isCurrentUser ? "row-reverse" : "row",
                      }}
                    >
                      <Avatar sx={{ bgcolor: isCurrentUser ? "#4caf50" : "#1976d2" }}>
                        {(getCurrentUserName(m.senderId) || "?").charAt(0)}
                      </Avatar>
                      <Box sx={{ bgcolor: isCurrentUser ? "#c8e6c9" : "#f5f7fa", p: 2, borderRadius: 2, flex: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography fontWeight={700}>{getCurrentUserName(m.senderId)}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(m.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography sx={{ mt: 1, whiteSpace: "pre-wrap" }}>{m.content}</Typography>
                        {m.attachment && m.attachment.dataUrl && (
                          <Box sx={{ mt: 1 }}>
                            {m.attachment.type.startsWith("image/") && (
                              <img
                                src={m.attachment.dataUrl}
                                alt="attachment"
                                style={{ maxWidth: 300, borderRadius: 4 }}
                              />
                            )}
                            {m.attachment.type.startsWith("audio/") && (
                              <audio controls src={m.attachment.dataUrl} />
                            )}
                            {m.attachment.type === "application/pdf" && (
                              <a href={m.attachment.dataUrl} target="_blank" rel="noreferrer">
                                Open PDF ({m.attachment.name})
                              </a>
                            )}
                          </Box>
                        )}
                        <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
                          {/* Tick marks for message status */}
                          {m.readBy && m.readBy.length >= 2 ? (
                            <Typography variant="caption" sx={{ color: "#2196F3", fontWeight: "bold" }}>
                              ✓✓
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={{ color: "#999" }}>
                              ✓
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {m.readBy && m.readBy.length >= 2 ? "Read" : "Sent"}
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
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Write a message"
                value={text}
                onChange={(e) => setText(e.target.value)}
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
