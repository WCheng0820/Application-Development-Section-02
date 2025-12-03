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

// Get conversations for a user (with optional tutors they haven't booked)
router.get('/conversations/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const conversationMap = new Map(); // Use map to consolidate by participant

        // 1. Get bookings where user is student or tutor - fetch related messages
        const bookings = await query(
            `SELECT b.*, 
                    t.name as tutor_name, 
                    u_student.username as student_name
             FROM booking b
             LEFT JOIN tutor t ON b.tutorId = t.tutorId
             LEFT JOIN student s ON b.studentId = s.studentId
             LEFT JOIN users u_student ON s.user_id = u_student.id
             WHERE b.tutorId = ? OR b.studentId = ?`,
            [userId, userId]
        );

        for (const booking of bookings) {
            const latestMsg = await query(
                `SELECT * FROM message 
                 WHERE bookingId = ?
                 ORDER BY created_at DESC
                 LIMIT 1`,
                [booking.bookingId]
            );

            // Count unread messages in this conversation
            const unreadMsgs = await query(
                `SELECT COUNT(*) as count FROM message 
                 WHERE bookingId = ? AND senderId != ? AND JSON_CONTAINS(readBy_json, ?, '$[*].userId') = 0`,
                [booking.bookingId, userId, JSON.stringify(userId)]
            );
            const unreadCount = unreadMsgs[0]?.count || 0;

            const otherParticipantId = booking.tutorId === userId ? booking.studentId : booking.tutorId;
            const otherParticipantName = booking.tutorId === userId ? booking.student_name : booking.tutor_name;

            const latest = latestMsg[0];
            const snippet = latest
                ? latest.content || (latest.attachment_name ? `Attachment: ${latest.attachment_name}` : 'No messages yet')
                : 'No messages yet';

            // Check if unread from this user's perspective
            let readBy = latest && latest.readBy_json ? JSON.parse(latest.readBy_json) : [];
            const unread = latest && !readBy.some(r => r.userId === userId);

            const conversationKey = otherParticipantId;
            const newConversation = {
                bookingId: booking.bookingId,
                title: `Session with ${otherParticipantName}`,
                otherParticipantId,
                otherParticipantName,
                snippet,
                timestamp: latest ? new Date(latest.created_at).getTime() : null,
                unread,
                unreadCount,
                hasBooking: true,
                bookingInfo: {
                    date: booking.booking_date,
                    startTime: booking.start_time,
                    endTime: booking.end_time,
                    status: booking.status
                }
            };

            // If participant already exists, keep the one with the most recent message
            if (!conversationMap.has(conversationKey) || (newConversation.timestamp > (conversationMap.get(conversationKey).timestamp || 0))) {
                conversationMap.set(conversationKey, newConversation);
            }
        }

        const conversations = Array.from(conversationMap.values());

        // 2. If user is a student, also show all tutors they can chat with (not just booked ones)
        const studentCheck = await query(
            `SELECT studentId FROM student WHERE studentId = ?`,
            [userId]
        );

        if (studentCheck.length > 0) {
            const tutors = await query(
                `SELECT t.tutorId, t.name, t.price, t.specialization, t.rating
                 FROM tutor t
                 WHERE t.tutorId IS NOT NULL
                 ORDER BY t.name ASC`
            );

            for (const tutor of tutors) {
                // Check if this tutor is already in conversations via booking
                const alreadyExists = conversations.some(c => c.otherParticipantId === tutor.tutorId);
                if (!alreadyExists) {
                    // Count unread messages from this tutor (non-booked chats)
                    const unreadFromTutor = await query(
                        `SELECT COUNT(*) as count FROM message 
                         WHERE bookingId IS NULL AND senderId = ? AND recipientId = ? AND JSON_CONTAINS(readBy_json, ?, '$[*].userId') = 0`,
                        [tutor.tutorId, userId, JSON.stringify(userId)]
                    );
                    const unreadCount = unreadFromTutor[0]?.count || 0;

                    conversations.push({
                        bookingId: null,  // No booking yet
                        title: `Chat with ${tutor.name}`,
                        otherParticipantId: tutor.tutorId,
                        otherParticipantName: tutor.name,
                        snippet: 'No messages yet',
                        timestamp: null,
                        unread: false,
                        unreadCount,
                        hasBooking: false,
                        tutorInfo: {
                            price: tutor.price,
                            specialization: tutor.specialization,
                            rating: tutor.rating
                        }
                    });
                }
            }
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
        
        if (bookingId && bookingId !== 'null') {
            // Booking-based chat
            messages = await query(
                `SELECT * FROM message 
                 WHERE bookingId = ?
                 ORDER BY created_at ASC`,
                [bookingId]
            );
        } else if (senderId && recipientId) {
            // Direct tutor chat (no booking) - filter by participants
            messages = await query(
                `SELECT * FROM message 
                 WHERE bookingId IS NULL 
                 AND ((senderId = ? AND recipientId = ?) OR (senderId = ? AND recipientId = ?))
                 ORDER BY created_at ASC`,
                [senderId, recipientId, recipientId, senderId]
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
            const matches = attachment.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
                attachmentType = matches[1];
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

        // Create notification for recipient
        await query(
            `INSERT INTO notification (recipientId, senderId, bookingId, messageId, text, type)
             VALUES (?, ?, ?, ?, ?, 'message')`,
            [recipientId, senderId, bookingId || null, messageId, content || (attachmentName ? `Attachment: ${attachmentName}` : 'Attachment')]
        );

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

        res.json({ success: true, status, readBy });
    } catch (err) {
        console.error('Error marking message as read:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get unread message count for a user
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
