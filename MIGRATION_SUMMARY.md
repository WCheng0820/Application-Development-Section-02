# Message & Notification Module Migration Summary

## Overview
Successfully migrated the Message and Notification functionality from in-memory models to Backend database (MySQL) with proper API endpoints.

---

## Backend Changes

### 1. Database Schema Updates (`Backend/config/db.init.js`)
Added three new tables for message and notification management:

#### `message` Table
- Stores all messages between users in a booking
- Fields: `id`, `bookingId`, `senderId`, `recipientId`, `content`, `attachment_*`, `status` (sent/delivered/read), `created_at`, `updated_at`
- Foreign key: Links to `booking` table

#### `message_read_status` Table
- Tracks read receipts for messages
- Fields: `id`, `messageId`, `userId`, `read_at`
- Composite unique key on `(messageId, userId)` to prevent duplicate reads
- Foreign key: Links to `message` table

#### `notification` Table
- Stores notifications for new messages
- Fields: `id`, `recipientId`, `senderId`, `bookingId`, `messageId`, `text`, `type` (message/booking/material), `is_read`, `created_at`, `updated_at`
- Foreign keys: Links to `booking` and `message` tables
- Index on `recipientId` and `is_read` for efficient queries

### 2. New API Routes (`Backend/routes/messages.js`)
Created comprehensive messaging API with the following endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/messages/conversations/:userId` | GET | Fetch all conversations for a user with unread status |
| `/api/messages/messages/:bookingId` | GET | Fetch all messages in a booking |
| `/api/messages/messages` | POST | Send a new message with optional attachment |
| `/api/messages/messages/:messageId/read` | POST | Mark a message as read |
| `/api/messages/notifications/:userId` | GET | Fetch notifications for a user |
| `/api/messages/notifications/:notificationId/read` | POST | Mark a notification as read |
| `/api/messages/unread-count/:userId` | GET | Get unread notification count |

**Key Features:**
- Authentication via Bearer token
- Bidirectional messaging support (student ↔ tutor)
- Attachment handling with Base64 encoding/decoding
- Read receipt tracking with dual-read status (sent → delivered → read)
- Automatic notification creation on message send

### 3. Server Integration (`Backend/server.js`)
- Registered messages routes with the Express app
- Added error handling for message route loading

---

## Frontend Changes

### 1. Removed In-Memory Models
**Deleted Files:**
- `MLTSystem/src/models/MessageModel.js` (in-memory message store)
- `MLTSystem/src/models/BookingModel.js` (in-memory booking store - no longer needed)

**Reason:** All data is now persisted in Backend database via API calls

### 2. Updated MessagesController (`MLTSystem/src/controllers/MessagesController.js`)
Replaced in-memory model calls with Backend API calls via axios:

```javascript
// Before: Called local MessageModel functions
// Now: Calls Backend API endpoints
export async function fetchConversations(userId) {
  const res = await axios.get(`${MESSAGES_URL}/conversations/${userId}`, config);
  return res.data.success ? res.data.data : [];
}
```

**All functions now use Backend API:**
- `fetchConversations()` - Get user's conversations
- `fetchMessages()` - Get messages for a booking
- `sendMessage()` - Send message with optional attachment
- `markRead()` - Mark message as read
- `fetchNotifications()` - Get user's notifications
- `getUnreadCount()` - Get unread notification count
- `markNotificationRead()` - Mark notification as read
- `clearNotificationsForUser()` - Clear all notifications

### 3. Enhanced Navbar (`MLTSystem/src/components/Navbar.jsx`)
Added unread message badge functionality:

**Features:**
- Shows unread message count on "Messages" nav button
- Polls Backend every 3 seconds for new messages
- Badge automatically resets when user navigates to `/messages`
- Imports Badge component from Material-UI
- Imports MessagesController for API calls

---

## Data Flow Architecture

### Before (In-Memory)
```
Frontend UI → MessagesController → MessageModel (in-memory arrays) → Display
```

### After (Database)
```
Frontend UI → MessagesController → axios → Backend API → MySQL Database
                                      ↓
                                   Routes
                                      ↓
                                   Queries
```

---

## API Request/Response Examples

### Send Message
**Request:**
```javascript
POST /api/messages/messages
{
  "bookingId": 1,
  "senderId": "STU001",
  "recipientId": "TUT001",
  "content": "Hello tutor",
  "attachment": { "name": "file.pdf", "type": "application/pdf", "size": 1024, "dataUrl": "data:..." }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "bookingId": 1,
    "senderId": "STU001",
    "recipientId": "TUT001",
    "content": "Hello tutor",
    "attachment": {...},
    "timestamp": 1701612345000,
    "readBy": [{"userId": "STU001", "readAt": 1701612345000}],
    "status": "sent"
  }
}
```

### Fetch Conversations
**Request:**
```javascript
GET /api/messages/conversations/STU001
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "bookingId": 1,
      "title": "Session with Li Ming",
      "otherParticipantId": "TUT001",
      "otherParticipantName": "Li Ming",
      "snippet": "Hello, how are you?",
      "timestamp": 1701612345000,
      "unread": true
    }
  ]
}
```

---

## File Structure Changes

### Removed:
```
MLTSystem/src/models/MessageModel.js    ✓ Deleted
MLTSystem/src/models/BookingModel.js    ✓ Deleted
```

### Added:
```
Backend/routes/messages.js               ✓ New
```

### Modified:
```
Backend/config/db.init.js                ✓ Updated (added tables)
Backend/server.js                        ✓ Updated (added route)
MLTSystem/src/controllers/MessagesController.js  ✓ Refactored (API calls)
MLTSystem/src/components/Navbar.jsx     ✓ Enhanced (badge + polling)
```

---

## Key Improvements

1. **Data Persistence**: Messages and notifications now persisted in MySQL database
2. **Scalability**: Can handle large numbers of messages without memory issues
3. **Real-time Awareness**: Unread badge updates via polling (can be upgraded to WebSocket later)
4. **Bidirectional Messaging**: Full support for student-tutor 2-way conversations
5. **Read Receipts**: Dual-tick system (✓ sent, ✓✓ read) with database tracking
6. **Attachment Support**: Base64 encoded file attachments stored in database
7. **Proper API Design**: RESTful endpoints with authentication and error handling

---

## Testing Checklist

Before deploying to production:

- [ ] Backend database tables created successfully
- [ ] Message API endpoints responding correctly
- [ ] Send message with/without attachments working
- [ ] Read receipts updating properly
- [ ] Unread count badge showing correctly
- [ ] Navbar polling every 3 seconds
- [ ] Badge resets when navigating to Messages page
- [ ] Bidirectional messaging working (student → tutor → student)
- [ ] Conversations sorted by latest message
- [ ] Old data (in-memory) cleared/migrated if needed

---

## Future Enhancements

1. **WebSocket Integration**: Replace polling with real-time WebSocket events for instant notifications
2. **File Storage**: Move attachments to cloud storage (AWS S3, Azure Blob) instead of database BLOB
3. **Message Search**: Add full-text search capability
4. **Message Typing Indicator**: Show when other user is typing
5. **Voice/Video Messages**: Support for multimedia messages
6. **Message Reactions**: Emoji reactions to messages
7. **Message Encryption**: End-to-end encryption for privacy
8. **Scheduled Messages**: Schedule messages to send at specific time
9. **Message Pinning**: Pin important messages
10. **Admin Moderation**: Admin tools to moderate messages

---

## Database Maintenance

### Backup Tables Before Migration
```bash
npm run reset-db  # If you want to start fresh
```

### Check Database Status
```bash
npm run check-db  # Verify tables created
```

### Initialize Database
```bash
npm run init-db   # Create all tables
```

---

## Version Info
- **Database Version**: MySQL 8.0+
- **Backend Framework**: Express.js with mysql2/promise
- **Frontend**: React with axios
- **UI Library**: Material-UI v5
- **Status**: Ready for integration testing
