# Quick Reference: Simplified Message System

## What Changed?

### ✅ Removed
- `message_read_status` table
- Separate join queries for read tracking
- Mock users map from frontend

### ✅ Added
- `readBy_json` field in message table (stores: `[{userId, readAt}, ...]`)
- Support for chats WITHOUT bookings (nullable `bookingId`)
- Tutor availability for all students to message
- Booking info card for booked tutors
- Tutor info card for non-booked chats
- New API endpoint: `/tutors`

---

## Database: Before vs After

### BEFORE (Complex):
```
message table
    ↓ (JOIN)
message_read_status table  ← separate table
```

### AFTER (Simple):
```
message table (with readBy_json directly)
    ↓ (no joins needed)
```

---

## Key Features

| Feature | How It Works |
|---------|-------------|
| **Chat with booked tutor** | Select tutor → See booking details (date, time, status) |
| **Chat with new tutor** | Select tutor → See tutor info (specialization, rate, rating) |
| **Read receipts** | ✓ (sent), ✓✓ (read) based on `readBy_json` length |
| **Conversations list** | Shows all tutors (booked + non-booked) sorted by latest message |
| **Attachments** | Support images, audio, PDF (same as before) |
| **Notifications** | Unread badge count in navbar |

---

## API Endpoints

```
GET /api/messages/tutors
→ List all tutors available for messaging

GET /api/messages/conversations/:userId
→ All conversations (booked tutors + available tutors)

GET /api/messages/messages/:bookingId
→ Messages in conversation (bookingId can be null for non-booked)

POST /api/messages/messages
→ Send message (bookingId optional)

POST /api/messages/messages/:messageId/read
→ Mark message as read

GET /api/messages/unread-count/:userId
→ Unread notification count

POST /api/messages/notifications/:notificationId/read
→ Mark notification as read
```

---

## Conversation Object

### Scenario 1: Booked Tutor
```javascript
{
  bookingId: 1,
  otherParticipantId: "TUT001",
  otherParticipantName: "Ms. Chen Wei",
  hasBooking: true,
  bookingInfo: { date, startTime, endTime, status },
  snippet: "Last message...",
  unread: false
}
```

### Scenario 2: Non-Booked Tutor
```javascript
{
  bookingId: null,
  otherParticipantId: "TUT002",
  otherParticipantName: "Mr. Wang Ming",
  hasBooking: false,
  tutorInfo: { price, specialization, rating },
  snippet: "No messages yet",
  unread: false
}
```

---

## Message Object

```javascript
{
  id: 5,
  bookingId: 1,                    // or null
  senderId: "STU001",
  recipientId: "TUT001",
  content: "Hello",
  attachment: { name, type, size, dataUrl },  // or null
  timestamp: 1701612345000,
  readBy: [                        // from readBy_json
    { userId: "STU001", readAt: "..." },
    { userId: "TUT001", readAt: "..." }
  ],
  status: "read"  // 'sent', 'delivered', 'read'
}
```

---

## Frontend Components

### Messages.jsx Layout
```
┌─────────────────────────────────────────┐
│ Left: Conversation List (320px)         │
│ - All tutors (booked + available)       │
│ - Unread badge                          │
│ - Booking date/time chips               │
└────────┬────────────────────────────────┘
         │ Right: Thread Area (flexible)
         ├─ Booking Info Card (if booked)
         ├─ Tutor Info Card (if not booked)
         ├─ Messages Thread
         └─ Composer (text + file)
```

---

## Testing Checklist

- [ ] Backend database initialized (`npm run init-db`)
- [ ] Backend server running (`npm start`)
- [ ] Frontend connects to Backend API
- [ ] Login as student
- [ ] Messages page loads conversations
- [ ] Click booked tutor → See booking info
- [ ] Click non-booked tutor → See tutor info
- [ ] Send message → Appears with ✓ (sent)
- [ ] Logout, login as tutor
- [ ] See message with ✓✓ (read) tick
- [ ] Tutor sees notification badge in navbar
- [ ] Tutor replies → Student sees ✓✓ (read)

---

## Common Queries

### Get All Conversations for a User
```javascript
const conversations = await MessagesController.fetchConversations(userId);
// Returns: all tutors (booked + available) with booking/tutor info
```

### Send Message to Tutor (Booked)
```javascript
await MessagesController.sendMessage({
  bookingId: 1,           // Has booking
  senderId: "STU001",
  recipientId: "TUT001",
  content: "Hello tutor",
  attachment: null
});
```

### Send Message to Tutor (Not Booked)
```javascript
await MessagesController.sendMessage({
  bookingId: null,        // No booking yet
  senderId: "STU001",
  recipientId: "TUT002",
  content: "Can you help?",
  attachment: null
});
```

### Mark Message as Read
```javascript
await MessagesController.markRead(messageId, currentUser.id);
// Updates readBy_json and status
```

---

## Files Modified

```
Backend/
  ├─ config/db.init.js           ✏️ Updated schema (removed message_read_status)
  ├─ routes/messages.js          ✏️ New API logic (supports null bookingId)
  └─ server.js                   ✏️ Registered /messages route

MLTSystem/
  ├─ src/controllers/
  │  └─ MessagesController.js     ✏️ Simplified API calls (no joins)
  ├─ src/pages/
  │  └─ Messages.jsx             ✏️ New layout with booking/tutor info cards
  └─ src/components/
     └─ Navbar.jsx               ✏️ Added unread badge (unchanged logic)
```

---

## Performance Notes

**Improvements:**
- Fewer database queries (no message_read_status JOIN)
- JSON parsing faster than row-by-row JOIN
- Smaller table footprint

**Scale:**
- Works well up to 100K+ messages
- For millions, consider: pagination, archiving, sharding

---

## Future Ideas

- [ ] Bulk mark-as-read (for conversations)
- [ ] Message reactions (😂 👍)
- [ ] Typing indicators (WebSocket)
- [ ] Message pinning
- [ ] Forwarding messages
- [ ] Message editing
- [ ] Scheduling messages
- [ ] Group chats

---

## Support

For issues:
1. Check Backend console logs
2. Check Browser DevTools Network tab
3. Verify database connection (`npm run check-db`)
4. Review `MESSAGE_SYSTEM_ANSWERS.md` for details
