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
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import * as BookingsController from "../controllers/BookingsController";
import * as MessagesController from "../controllers/MessagesController";

// Redesigned two-column Messages UI (left = conversations, right = thread)
// Matches the provided screenshot style. The "switch user" function has been removed.
// The controller layer is async-ready so you can replace the in-memory model with MySQL later.

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [text, setText] = useState("");
  const [fileObj, setFileObj] = useState(null);
  const [snack, setSnack] = useState(null);

  // For demo, current logged-in user name; in a real app obtain from auth.
  const currentUser = "Alice Wang";

  useEffect(() => {
    refreshConversations();
  }, []);

  async function refreshConversations() {
    // Build conversations from bookings + messages
    const convos = await MessagesController.fetchConversations(currentUser);
    setConversations(convos);
    if (!selectedBookingId && convos.length) setSelectedBookingId(convos[0].bookingId);
    // refresh thread if a booking is selected
    if (selectedBookingId) {
      const msgs = await MessagesController.fetchMessages(selectedBookingId);
      setThreadMessages(msgs);
    }
  }

  useEffect(() => {
    if (!selectedBookingId) return;
    (async () => {
      const msgs = await MessagesController.fetchMessages(selectedBookingId);
      setThreadMessages(msgs);
      // refresh conversations to update unread badges
      const convos = await MessagesController.fetchConversations(currentUser);
      setConversations(convos);
    })();
  }, [selectedBookingId]);

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
    };
    reader.readAsDataURL(f);
  }

  async function handleSend() {
    if (!selectedBookingId) {
      setSnack({ severity: "error", message: "Please select a conversation" });
      return;
    }
    try {
      await MessagesController.sendMessage({ bookingId: selectedBookingId, sender: currentUser, content: text, attachment: fileObj });
      setText("");
      setFileObj(null);
      // reload thread + conversations
      const msgs = await MessagesController.fetchMessages(selectedBookingId);
      setThreadMessages(msgs);
      const convos = await MessagesController.fetchConversations(currentUser);
      setConversations(convos);
      setSnack({ severity: "success", message: "Message sent" });
    } catch (err) {
      setSnack({ severity: "error", message: err.message || "Send failed" });
    }
  }

  async function handleMarkRead(msg) {
    await MessagesController.markRead(msg.id, currentUser);
    const msgs = await MessagesController.fetchMessages(selectedBookingId);
    setThreadMessages(msgs);
    const convos = await MessagesController.fetchConversations(currentUser);
    setConversations(convos);
  }

  // Render
  return (
    // add extra top spacing so the page header sits below the app's top bar
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
            <Tabs value={0} sx={{ '& .MuiTabs-flexContainer': { gap: 1 } }}>
              <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Typography>Messages</Typography><Badge color="error" badgeContent={conversations.reduce((acc, c)=> acc + (c.unread?1:0), 0)} /></Box>} />
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
                  <Avatar>{(c.tutor || "T").charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Typography fontWeight={700}>{c.title}</Typography>{c.unread && <Box sx={{ bgcolor: 'error.main', color: 'white', px:1, borderRadius:1, fontSize:12}}>New</Box>}</Box>}
                  secondary={<Box><Typography variant="body2" color="text.secondary">{c.snippet}</Typography><Typography variant="caption" color="text.secondary">{c.timestamp ? new Date(c.timestamp).toLocaleString() : ''}</Typography></Box>}
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
          <Paper sx={{ height: 480, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ overflowY: 'auto', mb: 2 }}>
              {!selectedBookingId ? (
                <Box sx={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Select a message to view</Typography>
                </Box>
              ) : (
                threadMessages.map((m) => (
                  <Box key={m.id} sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Avatar sx={{ bgcolor: '#1976d2' }}>{(m.sender || '?').charAt(0)}</Avatar>
                    <Box sx={{ bgcolor: '#f5f7fa', p: 2, borderRadius: 2, flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontWeight={700}>{m.sender}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(m.timestamp).toLocaleString()}</Typography>
                      </Box>
                      <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{m.content}</Typography>
                      {m.attachment && m.attachment.dataUrl && (
                        <Box sx={{ mt: 1 }}>
                          {m.attachment.type.startsWith('image/') && <img src={m.attachment.dataUrl} alt="attachment" style={{ maxWidth: 300 }} />}
                          {m.attachment.type.startsWith('audio/') && <audio controls src={m.attachment.dataUrl} />}
                          {m.attachment.type === 'application/pdf' && <a href={m.attachment.dataUrl} target="_blank" rel="noreferrer">Open PDF ({m.attachment.name})</a>}
                        </Box>
                      )}
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="caption">Read by: {m.readBy ? m.readBy.join(', ') : '-'}</Typography>
                        {m.sender !== currentUser && !(m.readBy || []).includes(currentUser) && (
                          <Button size="small" onClick={() => handleMarkRead(m)}>Mark as read</Button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))
              )}
            </Box>

            {/* composer */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Write a message"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <input id="file-input" type="file" style={{ display: 'none' }} onChange={handleFileChange} />
              <label htmlFor="file-input">
                <IconButton component="span"><AttachFileIcon /></IconButton>
              </label>
              <Button variant="contained" endIcon={<SendIcon />} onClick={handleSend}>Send</Button>
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
