const express = require('express');
const router = express.Router();
const { query, pool } = require('../config/database');

// Middleware: Check authentication (basic token validation)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }
    // In a real app, verify the token and extract userId
    // For now, we'll trust the client-provided userId
    next();
};

// Get all tutors available for a student to chat with
router.get('/tutors', authenticateToken, async (req, res) => {
    try {
        const tutors = await query(
            `SELECT t.tutorId, t.name, t.price, t.specialization, t.rating, t.rating_count
             FROM tutor t
             WHERE t.tutorId IS NOT NULL
             ORDER BY t.name ASC`
        );

        res.json({ success: true, data: tutors });
    } catch (err) {
        console.error('Error fetching tutors:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get all students available for a tutor to chat with
router.get('/students', authenticateToken, async (req, res) => {
    try {
        const students = await query(
            `SELECT s.studentId, u.username as name, u.email
             FROM student s
             JOIN users u ON s.user_id = u.id
             WHERE s.studentId IS NOT NULL
             ORDER BY u.username ASC`
        );

        res.json({ success: true, data: students });
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get all users (students and tutors) for admin to chat with
router.get('/all-users', authenticateToken, async (req, res) => {
    try {
        const users = await query(
            `SELECT userId, username as name, role, email 
             FROM users 
             WHERE role IN ('student', 'tutor') AND status = 'active'
             ORDER BY username ASC`
        );
        res.json({ success: true, data: users });
    } catch (err) {
        console.error('Error fetching all users:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get conversations for a user (with optional tutors they haven't booked)
router.get('/conversations/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const conversationMap = new Map(); // Use map to consolidate by participant

        // 1. Get bookings where user is student or tutor - fetch related messages
        // Order by booking_date DESC to get the latest booking info first
        const bookings = await query(
            `SELECT b.*, 
                    t.name as tutor_name, 
                    u_student.username as student_name
             FROM booking b
             LEFT JOIN tutor t ON b.tutorId = t.tutorId
             LEFT JOIN student s ON b.studentId = s.studentId
             LEFT JOIN users u_student ON s.user_id = u_student.id
             WHERE b.tutorId = ? OR b.studentId = ?
             ORDER BY b.booking_date DESC, b.start_time DESC`,
            [userId, userId]
        );

        for (const booking of bookings) {
            const otherParticipantId = booking.tutorId === userId ? booking.studentId : booking.tutorId;
            const otherParticipantName = booking.tutorId === userId ? booking.student_name : booking.tutor_name;
            
            // Fetch ALL messages between these two participants, regardless of bookingId
            // This ensures chat history persists across bookings
            const latestMsg = await query(
                `SELECT * FROM message 
                 WHERE ((senderId = ? AND recipientId = ?) OR (senderId = ? AND recipientId = ?))
                 ORDER BY created_at DESC
                 LIMIT 1`,
                [userId, otherParticipantId, otherParticipantId, userId]
            );

            // Count unread messages in this conversation (participant-based)
            const unreadMsgs = await query(
                `SELECT COUNT(*) as count FROM message 
                 WHERE ((senderId = ? AND recipientId = ?) OR (senderId = ? AND recipientId = ?))
                 AND senderId != ? 
                 AND JSON_CONTAINS(readBy_json, ?, '$[*].userId') = 0`,
                [userId, otherParticipantId, otherParticipantId, userId, userId, JSON.stringify(userId)]
            );
            const unreadCount = unreadMsgs[0]?.count || 0;

            const latest = latestMsg[0];
            const snippet = latest
                ? latest.content || (latest.attachment_name ? `Attachment: ${latest.attachment_name}` : 'No messages yet')
                : 'No messages yet';

            // Check if unread from this user's perspective
            let readBy = latest && latest.readBy_json ? JSON.parse(latest.readBy_json) : [];
            const unread = latest && !readBy.some(r => r.userId === userId);

            const conversationKey = otherParticipantId;
            
            let conversation = conversationMap.get(conversationKey);
            
            if (!conversation) {
                conversation = {
                    bookingId: booking.bookingId, // Default to latest
                    title: `Session with ${otherParticipantName}`,
                    otherParticipantId,
                    otherParticipantName,
                    snippet,
                    timestamp: latest ? new Date(latest.created_at).getTime() : null,
                    unread,
                    unreadCount,
                    hasBooking: true,
                    bookings: [] // Initialize array
                };
                conversationMap.set(conversationKey, conversation);
            }
            
            // Add this booking to the list
            conversation.bookings.push({
                id: booking.bookingId,
                date: booking.booking_date,
                startTime: booking.start_time,
                endTime: booking.end_time,
                status: booking.status
            });
        }

        const conversations = Array.from(conversationMap.values());

        // 2. Fetch active direct conversations (no booking or admin chats)
        // Find messages where user is sender or recipient
        const directMessages = await query(
            `SELECT DISTINCT 
                CASE WHEN senderId = ? THEN recipientId ELSE senderId END as otherId
             FROM message 
             WHERE senderId = ? OR recipientId = ?`,
            [userId, userId, userId]
        );

        for (const dm of directMessages) {
            const otherId = dm.otherId;
            
            // Skip if we already have a conversation with this person (e.g. via booking)
            if (conversationMap.has(otherId)) continue;

            // Fetch other user details
            // Try tutor table first, then student/users
            let otherName = 'Unknown User';
            let tutorInfo = null;

            // Check if it's a tutor
            const tutorRes = await query('SELECT name, price, specialization, rating FROM tutor WHERE tutorId = ?', [otherId]);
            if (tutorRes.length > 0) {
                otherName = tutorRes[0].name;
                tutorInfo = {
                    price: tutorRes[0].price,
                    specialization: tutorRes[0].specialization,
                    rating: tutorRes[0].rating
                };
            } else {
                // Check users table (for students or admins)
                const userRes = await query('SELECT username FROM users WHERE userId = ?', [otherId]);
                if (userRes.length > 0) {
                    otherName = userRes[0].username;
                }
            }

            // Get latest message (participant-based)
            const latestMsg = await query(
                `SELECT * FROM message 
                 WHERE ((senderId = ? AND recipientId = ?) OR (senderId = ? AND recipientId = ?))
                 ORDER BY created_at DESC
                 LIMIT 1`,
                [userId, otherId, otherId, userId]
            );

            // Count unread
            const unreadFromUser = await query(
                `SELECT COUNT(*) as count FROM message 
                 WHERE ((senderId = ? AND recipientId = ?) OR (senderId = ? AND recipientId = ?))
                 AND senderId != ? 
                 AND (readBy_json IS NULL OR JSON_CONTAINS(readBy_json, ?, '$[*].userId') = 0)`,
                [userId, otherId, otherId, userId, userId, JSON.stringify(userId)]
            );
            const unreadCount = unreadFromUser[0]?.count || 0;

            const latest = latestMsg[0];
            const snippet = latest
                ? latest.content || (latest.attachment_name ? `Attachment: ${latest.attachment_name}` : 'No messages yet')
                : 'No messages yet';
            
            let readBy = latest && latest.readBy_json ? JSON.parse(latest.readBy_json) : [];
            const unread = latest && !readBy.some(r => r.userId === userId);

            conversations.push({
                bookingId: null,
                title: `Chat with ${otherName}`,
                otherParticipantId: otherId,
                otherParticipantName: otherName,
                snippet,
                timestamp: latest ? new Date(latest.created_at).getTime() : null,
                unread,
                unreadCount,
                hasBooking: false,
                tutorInfo
            });
        }

        // Sort by timestamp desc
        conversations.sort((a, z) => (z.timestamp || 0) - (a.timestamp || 0));

        res.json({ success: true, data: conversations });
    } catch (err) {
        console.error('Error fetching conversations:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get messages for a conversation (booking or direct tutor chat)
router.get('/messages/:bookingId', authenticateToken, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { senderId, recipientId } = req.query; // Additional params for non-booked chats

        let messages;
        
        // Always fetch by participants if provided, to show full history regardless of booking status
        if (senderId && recipientId) {
            messages = await query(
                `SELECT * FROM message 
                 WHERE ((senderId = ? AND recipientId = ?) OR (senderId = ? AND recipientId = ?))
                 ORDER BY created_at ASC`,
                [senderId, recipientId, recipientId, senderId]
            );
        } else if (bookingId && bookingId !== 'null' && bookingId !== 'undefined') {
            // Fallback to bookingId if participants not provided (legacy support)
            messages = await query(
                `SELECT * FROM message 
                 WHERE bookingId = ?
                 ORDER BY created_at ASC`,
                [bookingId]
            );
        } else {
            // No booking and no participants specified
            messages = [];
        }

        const formatted = messages.map(m => {
            let readBy = m.readBy_json ? JSON.parse(m.readBy_json) : [];
            return {
                id: m.id,
                bookingId: m.bookingId,
                senderId: m.senderId,
                recipientId: m.recipientId,
                content: m.content,
                attachment: m.attachment_name ? {
                    name: m.attachment_name,
                    type: m.attachment_type,
                    size: m.attachment_size,
                    dataUrl: m.attachment_data ? `data:${m.attachment_type};base64,${m.attachment_data.toString('base64')}` : null
                } : null,
                timestamp: new Date(m.created_at).getTime(),
                readBy: readBy,
                status: m.status
            };
        });

        res.json({ success: true, data: formatted });
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Send a message (with or without booking)
router.post('/messages', authenticateToken, async (req, res) => {
    try {
        const { bookingId, senderId, recipientId, content, attachment } = req.body;

        if (!senderId || !recipientId) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // If bookingId provided and not null, validate sender is participant
        if (bookingId && bookingId !== null && bookingId !== 'null') {
            const bookings = await query(
                `SELECT * FROM booking WHERE bookingId = ?`,
                [bookingId]
            );

            if (bookings.length === 0) {
                return res.status(404).json({ success: false, error: 'Booking not found' });
            }

            const booking = bookings[0];
            const isParticipant = senderId === booking.tutorId || senderId === booking.studentId;
            
            if (!isParticipant) {
                return res.status(403).json({ success: false, error: 'User not a participant in this booking' });
            }
        }

        // Insert message
        let attachmentData = null;
        let attachmentName = null;
        let attachmentType = null;
        let attachmentSize = null;

        if (attachment && attachment.dataUrl) {
            // Validate size
            // Max 5MB
            const MAX_SIZE = 5 * 1024 * 1024; // 5MB
            
            // Base64 string length * 0.75 is approx file size in bytes
            if (attachment.dataUrl.length * 0.75 > MAX_SIZE) {
                 return res.status(400).json({ 
                     success: false, 
                     error: 'File too large. Max 5MB.' 
                 });
            }

            const matches = attachment.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
                attachmentType = matches[1];
                
                // Validate file type
                const allowedTypes = [
                    'image/jpeg', 'image/png', 'image/gif', 
                    'application/pdf', 
                    'audio/mpeg', 'audio/wav', 'audio/mp3',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
                    'application/vnd.ms-powerpoint', // ppt
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
                    'application/vnd.ms-excel', // xls
                    'application/msword', // doc
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // docx
                ];
                
                if (!allowedTypes.includes(attachmentType)) {
                    return res.status(400).json({ success: false, error: 'Invalid file type. Allowed: Images, PDF, Audio, Office Docs.' });
                }

                attachmentData = Buffer.from(matches[2], 'base64');
                attachmentName = attachment.name;
                attachmentSize = attachment.size;
            }
        }

        // Initialize readBy with sender
        const readByJson = JSON.stringify([{ userId: senderId, readAt: new Date().toISOString() }]);

        const result = await query(
            `INSERT INTO message (bookingId, senderId, recipientId, content, attachment_name, attachment_type, attachment_size, attachment_data, status, readBy_json)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sent', ?)`,
            [bookingId || null, senderId, recipientId, content || '', attachmentName, attachmentType, attachmentSize, attachmentData, readByJson]
        );

        const messageId = result.insertId;

        // Fetch sender name for notification
        let senderName = 'Someone';
        try {
            // Check if sender is tutor
            const tutors = await query('SELECT name FROM tutor WHERE tutorId = ?', [senderId]);
            if (tutors.length > 0) {
                senderName = tutors[0].name;
            } else {
                // Check if sender is student
                const students = await query(
                    `SELECT u.username 
                     FROM student s 
                     JOIN users u ON s.user_id = u.id 
                     WHERE s.studentId = ?`, 
                    [senderId]
                );
                if (students.length > 0) {
                    senderName = students[0].username;
                }
            }
        } catch (e) {
            console.error('Error fetching sender name for notification:', e);
        }

        const notifText = `New message from ${senderName}: ${content ? (content.length > 30 ? content.substring(0, 30) + '...' : content) : (attachmentName ? 'Sent an attachment' : 'Sent a message')}`;

        // Create notification for recipient
        await query(
            `INSERT INTO notification (recipientId, senderId, bookingId, messageId, text, type)
             VALUES (?, ?, ?, ?, ?, 'message')`,
            [recipientId, senderId, bookingId || null, messageId, notifText]
        );

        // Emit socket events for real-time updates
        const conversationId = (bookingId && bookingId !== 'null') ? bookingId : [senderId, recipientId].sort().join('-');
        
        if (req.io) {
            // Broadcast message to conversation room
            req.io.to(`conversation:${conversationId}`).emit('message:received', {
                id: messageId,
                bookingId: bookingId || null,
                senderId,
                recipientId,
                content: content || '',
                attachment: attachment || null,
                timestamp: Date.now(),
                readBy: [{ userId: senderId, readAt: new Date().toISOString() }],
                status: 'sent'
            });

            // Notify recipient if online
            if (req.onlineUsers && req.onlineUsers.has(recipientId)) {
                req.io.to(req.onlineUsers.get(recipientId)).emit('notification:new', {
                    type: 'message',
                    from: senderId,
                    bookingId,
                    message: content || (attachmentName ? `Attachment: ${attachmentName}` : 'New message'),
                    timestamp: Date.now()
                });
            }
        }

        res.json({ 
            success: true, 
            data: { 
                id: messageId,
                bookingId: bookingId || null,
                senderId,
                recipientId,
                content: content || '',
                attachment: attachment || null,
                timestamp: Date.now(),
                readBy: [{ userId: senderId, readAt: new Date().toISOString() }],
                status: 'sent'
            } 
        });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Mark message as read
router.post('/messages/:messageId/read', authenticateToken, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'userId required' });
        }

        // Get current message
        const messages = await query(
            `SELECT readBy_json FROM message WHERE id = ?`,
            [messageId]
        );

        if (messages.length === 0) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        let readBy = messages[0].readBy_json ? JSON.parse(messages[0].readBy_json) : [];
        
        // Check if already read by this user
        const alreadyRead = readBy.some(r => r.userId === userId);
        if (!alreadyRead) {
            readBy.push({ userId, readAt: new Date().toISOString() });
        }

        // Update status based on read count
        let status = 'sent';
        if (readBy.length >= 2) {
            status = 'read';
        } else if (readBy.length >= 1) {
            status = 'delivered';
        }

        await query(
            `UPDATE message SET readBy_json = ?, status = ? WHERE id = ?`,
            [JSON.stringify(readBy), status, messageId]
        );

        // Also mark corresponding notification as read
        await query(
            `UPDATE notification SET is_read = TRUE WHERE messageId = ? AND recipientId = ?`,
            [messageId, userId]
        );

        // Emit socket event for read receipt
        const msgDetails = await query('SELECT bookingId, senderId, recipientId FROM message WHERE id = ?', [messageId]);
        if (msgDetails.length > 0) {
            const m = msgDetails[0];
            const conversationId = (m.bookingId && m.bookingId !== 'null') ? m.bookingId : [m.senderId, m.recipientId].sort().join('-');
            
            if (req.io) {
                req.io.to(`conversation:${conversationId}`).emit('message:read', {
                    messageId: parseInt(messageId),
                    userId,
                    readAt: new Date().toISOString()
                });
            }
        }

        res.json({ success: true, status, readBy });
    } catch (err) {
        console.error('Error marking message as read:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get unread message count for a user
router.get('/unread-messages-count/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await query(
            `SELECT COUNT(*) as count 
             FROM message m
             JOIN booking b ON m.bookingId = b.bookingId
             WHERE (b.studentId = ? OR b.tutorId = ?)
               AND m.senderId != ?
               AND (m.readBy_json IS NULL OR JSON_CONTAINS(m.readBy_json, ?, '$[*].userId') = 0)`,
            [userId, userId, userId, JSON.stringify(userId)]
        );
        
        res.json({ success: true, data: { unreadCount: result[0]?.count || 0 } });
    } catch (err) {
        console.error('Error getting unread message count:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get unread notification count for a user
router.get('/unread-count/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await query(
            `SELECT COUNT(DISTINCT id) as count
             FROM notification
             WHERE recipientId = ? AND is_read = FALSE`,
            [userId]
        );

        res.json({ success: true, data: { unreadCount: result[0]?.count || 0 } });
    } catch (err) {
        console.error('Error getting unread count:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get notifications for a user
router.get('/notifications/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await query(
            `SELECT * FROM notification 
             WHERE recipientId = ?
             ORDER BY created_at DESC
             LIMIT 50`,
            [userId]
        );

        res.json({ success: true, data: notifications });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Mark notification as read
router.post('/notifications/:notificationId/read', authenticateToken, async (req, res) => {
    try {
        const { notificationId } = req.params;

        await query(
            `UPDATE notification SET is_read = TRUE WHERE id = ?`,
            [notificationId]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Error marking notification as read:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
