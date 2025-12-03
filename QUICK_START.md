# Quick Start Guide - Message & Notification System

## Prerequisites
- MySQL 8.0+ running on localhost (or configure in Backend/.env)
- Node.js 16+
- npm or yarn

## Setup Steps

### 1. Initialize Backend Database
```bash
cd Backend
npm install  # If not already installed
npm run init-db  # Creates all tables including message and notification tables
```

### 2. Start Backend Server
```bash
cd Backend
npm start  # Starts on http://localhost:5000
# Should see: ✅ Database ready
#            🚀 Server running on http://localhost:5000
```

### 3. Configure Frontend (if needed)
```bash
cd MLTSystem
# Set VITE_API_URL in .env (default: http://localhost:5000)
```

### 4. Start Frontend Development Server
```bash
cd MLTSystem
npm run dev  # Starts on http://localhost:5173 (or configured port)
```

## Key API Endpoints

### Message Endpoints
- `GET /api/messages/conversations/:userId` - Get all conversations
- `GET /api/messages/messages/:bookingId` - Get messages in a booking
- `POST /api/messages/messages` - Send a message
- `POST /api/messages/messages/:messageId/read` - Mark as read

### Notification Endpoints
- `GET /api/messages/notifications/:userId` - Get notifications
- `GET /api/messages/unread-count/:userId` - Get unread count
- `POST /api/messages/notifications/:notificationId/read` - Mark as read

## Testing the Feature

### Login with Test Users
**Student Account:**
- Email: student1@example.com
- Password: password123 (or as seeded)

**Tutor Account:**
- Email: tutor1@example.com
- Password: password123 (or as seeded)

### Test Flow
1. Login as student
2. Go to **Messages** page
3. Select a conversation
4. Send a message (text and/or attachment)
5. Message should appear immediately
6. Logout and login as tutor
7. Verify tutor sees notification badge
8. Open Messages page - badge should disappear
9. See student's message with ✓ (sent) status
10. Reply to message - status changes to ✓✓ (read)

## Troubleshooting

### Backend Not Starting
```bash
# Check MySQL is running
mysql -u root -p

# Check database exists
SHOW DATABASES;

# If not, init-db will create it
npm run init-db
```

### Frontend Can't Connect to Backend
```bash
# Verify Backend is running on port 5000
curl http://localhost:5000/api/health

# Check VITE_API_URL in .env is correct
# Default: http://localhost:5000
```

### Messages Not Appearing
1. Check Backend console for errors
2. Verify booking exists in database
3. Check userId matches between frontend and backend
4. Look at Network tab in browser DevTools for API responses

### Database Tables Not Created
```bash
# Manually trigger init
node config/db.init.js

# Check tables
npm run check-db
```

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=mlt_system
PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## Database Schema

### message table
```sql
CREATE TABLE message (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bookingId INT NOT NULL,
  senderId VARCHAR(255),
  recipientId VARCHAR(255),
  content TEXT,
  attachment_name VARCHAR(255),
  attachment_type VARCHAR(100),
  attachment_size INT,
  attachment_data LONGBLOB,
  status ENUM('sent','delivered','read'),
  created_at TIMESTAMP,
  ...
)
```

### message_read_status table
```sql
CREATE TABLE message_read_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  messageId INT,
  userId VARCHAR(255),
  read_at TIMESTAMP,
  UNIQUE KEY unique_read (messageId, userId),
  ...
)
```

### notification table
```sql
CREATE TABLE notification (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipientId VARCHAR(255),
  senderId VARCHAR(255),
  bookingId INT,
  messageId INT,
  text TEXT,
  type ENUM('message','booking','material'),
  is_read BOOLEAN,
  created_at TIMESTAMP,
  ...
)
```

## Performance Tips

1. **Polling Optimization**: Currently polls every 3 seconds. For production, consider WebSocket
2. **Database Indexes**: Already created on frequently queried columns (recipientId, senderId, bookingId, created_at)
3. **Attachment Size**: Limited to 2MB in Frontend, but can store larger in database BLOB
4. **Pagination**: Add pagination to conversations/messages for large histories

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Token not provided" | Login first, token stored in sessionStorage |
| "Booking not found" | Ensure booking exists for the message's bookingId |
| "User not a participant" | Verify senderId matches booking tutorId or studentId |
| Attachment not saving | Check file size < 2MB, type is image/audio/pdf |
| No unread badge | Check Backend is polling, userId matches |
| "CORS error" | Verify Backend CORS middleware enabled |

## Next Steps

1. ✅ Database tables created
2. ✅ API endpoints implemented
3. ✅ Frontend controllers updated
4. ⚙️ **TODO**: Replace polling with WebSocket for real-time updates
5. ⚙️ **TODO**: Implement message search
6. ⚙️ **TODO**: Add typing indicators
7. ⚙️ **TODO**: Move attachments to cloud storage
8. ⚙️ **TODO**: Add message encryption

## Support

For issues or questions:
1. Check Backend console logs
2. Check Browser DevTools Network tab
3. Verify database has tables and data
4. Review MIGRATION_SUMMARY.md for detailed architecture
