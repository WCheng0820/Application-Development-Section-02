const express = require('express');
const router = express.Router();
const { query, pool } = require('../config/database');

// Middleware to verify token and attach user to request (required auth)
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        // Check session
        const sessions = await query(
            'SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()',
            [token]
        );

        if (sessions.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

        const session = sessions[0];

        // Get user
        const users = await query(
            'SELECT id, username, email, role FROM users WHERE id = ?',
            [session.user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        req.user = users[0];
        next();
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Token verification failed'
        });
    }
};

// Middleware to optionally verify token (attach user if present, but don't require)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (token) {
            // Check session
            const sessions = await query(
                'SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()',
                [token]
            );

            if (sessions.length > 0) {
                const session = sessions[0];
                const users = await query(
                    'SELECT id, username, email, role FROM users WHERE id = ?',
                    [session.user_id]
                );

                if (users.length > 0) {
                    req.user = users[0];
                }
            }
        }
        next();
    } catch (err) {
        console.error('Optional auth error:', err);
        next(); // Continue even if optional auth fails
    }
};

// Get all bookings (with optional auth for role-based filtering)
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const { upcoming } = req.query;
        const user = req.user; // Will be undefined if not authenticated

        // Join booking -> tutor -> tutor.user -> student -> student.user to include contact details
        let sql = `SELECT b.*, 
            t.name AS tutor_name, ut.username AS tutor_username, ut.nophone AS tutor_phone, ut.email AS tutor_email, 
            s.studentId AS student_id, us.username AS student_username, us.nophone AS student_phone, us.email AS student_email,
            f.rating as feedback_rating, f.comment as feedback_comment, f.is_anonymous as feedback_anonymous
            FROM booking b
            LEFT JOIN tutor t ON b.tutorId = t.tutorId
            LEFT JOIN users ut ON t.user_id = ut.id
            LEFT JOIN student s ON b.studentId = s.studentId
            LEFT JOIN users us ON s.user_id = us.id
            LEFT JOIN feedback f ON b.bookingId = f.bookingId
            WHERE 1=1`;
        const params = [];

        // If user is authenticated and not admin, only show their bookings
        if (user && user.role !== 'admin') {
            if (user.role === 'student') {
                // Get student ID from student table
                const students = await query(
                    'SELECT studentId FROM student WHERE user_id = ?',
                    [user.id]
                );
                if (students.length === 0) {
                    return res.status(404).json({ success: false, error: 'Student record not found' });
                }
                sql += ' AND b.studentId = ?';
                params.push(students[0].studentId);
            } else if (user.role === 'tutor') {
                // Get tutor ID from tutor table
                const tutors = await query(
                    'SELECT tutorId FROM tutor WHERE user_id = ?',
                    [user.id]
                );
                if (tutors.length === 0) {
                    return res.status(404).json({ success: false, error: 'Tutor record not found' });
                }
                sql += ' AND b.tutorId = ?';
                params.push(tutors[0].tutorId);
            }
        } else if (!user) {
            // If not authenticated, return empty result (don't show any bookings)
            return res.json({ success: true, data: [] });
        }

        // By default include all statuses (confirmed, pending, cancelled). Allow optional upcoming filter.
        if (upcoming && (upcoming === 'true' || upcoming === '1')) {
            sql += ' AND b.booking_date >= CURDATE()';
        }

        sql += ' ORDER BY b.booking_date ASC, b.start_time ASC';

        const results = await query(sql, params);
        res.json({ success: true, data: results });
    } catch (err) {
        next(err);
    }
});


// Get booking by ID (with role-based access check)
router.get('/:id', verifyToken, async (req, res, next) => {
    const id = req.params.id;
    try {
        // Pull booking with tutor and student contact info
        const results = await query(
            `SELECT b.*, 
                t.name AS tutor_name, ut.username AS tutor_username, ut.nophone AS tutor_phone, ut.email AS tutor_email, 
                s.studentId AS student_id, us.username AS student_username, us.nophone AS student_phone, us.email AS student_email
             FROM booking b
             LEFT JOIN tutor t ON b.tutorId = t.tutorId
             LEFT JOIN users ut ON t.user_id = ut.id
             LEFT JOIN student s ON b.studentId = s.studentId
             LEFT JOIN users us ON s.user_id = us.id
             WHERE b.bookingId = ?`,
            [id]
        );

        if (!results || results.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
        
        const booking = results[0];
        const { role, id: userId } = req.user;

        // Only tutors (owners) or admins can cancel/delete bookings. Students are not allowed to cancel.
        if (role === 'admin') {
            // admin allowed
        } else if (role === 'tutor') {
            const tutors = await query('SELECT tutorId FROM tutor WHERE user_id = ?', [userId]);
            if (tutors.length === 0 || tutors[0].tutorId !== booking.tutorId) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }
        } else {
            // all other roles (including student) are forbidden
            return res.status(403).json({ success: false, message: 'Only tutors or admins can cancel bookings' });
        }

        res.json({ success: true, data: booking });
    } catch (err) {
        next(err);
    }
});

// Create booking
router.post('/', async (req, res, next) => {
    const booking = req.body;
    if (!booking.bookingId || !booking.tutorId || !booking.studentId) return res.status(400).json({ success: false, message: 'Missing required fields' });
    try {
        const result = await query('INSERT INTO booking SET ?', [booking]);
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
});

// Update booking (supports status change and rating updates)
router.put('/:id', verifyToken, async (req, res, next) => {
    const id = req.params.id;
    const data = req.body;
    const conn = await pool.getConnection();
    try {
        console.log('[bookings.put] update booking', { bookingId: id, data });
        await conn.beginTransaction();

        // Update booking row. Build SET clause from provided data to avoid using object placeholder.
        let updateRes;
        if (!data || Object.keys(data).length === 0) {
            // Nothing to update
            await conn.rollback();
            conn.release();
            return res.status(400).json({ success: false, error: 'No update data provided' });
        } else {
            // If a rating is being provided, ensure the booking hasn't been rated before
            // and that the requester is the student who made the booking.
            if (Object.prototype.hasOwnProperty.call(data, 'rating')) {
                // Lock the booking row for update to prevent race conditions
                const [lockRows] = await conn.execute('SELECT rating, studentId FROM booking WHERE bookingId = ? FOR UPDATE', [id]);
                if (!lockRows || lockRows.length === 0) {
                    await conn.rollback();
                    conn.release();
                    return res.status(404).json({ success: false, error: 'Booking not found' });
                }

                const existingRating = lockRows[0].rating;
                const bookingStudentId = lockRows[0].studentId;

                if (existingRating !== null && existingRating !== undefined) {
                    await conn.rollback();
                    conn.release();
                    return res.status(400).json({ success: false, error: 'This booking has already been rated' });
                }

                // Verify the requester is the student for this booking
                const token = req.headers.authorization?.replace('Bearer ', '');
                if (!token) {
                    await conn.rollback();
                    conn.release();
                    return res.status(401).json({ success: false, error: 'Authentication required to rate booking' });
                }

                const sessions = await query('SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()', [token]);
                if (!sessions || sessions.length === 0) {
                    await conn.rollback();
                    conn.release();
                    return res.status(401).json({ success: false, error: 'Invalid or expired session token' });
                }

                const session = sessions[0];
                const users = await query('SELECT id, role FROM users WHERE id = ?', [session.user_id]);
                if (!users || users.length === 0) {
                    await conn.rollback();
                    conn.release();
                    return res.status(401).json({ success: false, error: 'User not found for session' });
                }

                if (users[0].role !== 'student') {
                    await conn.rollback();
                    conn.release();
                    return res.status(403).json({ success: false, error: 'Only students can submit ratings for bookings' });
                }

                const studentRows = await query('SELECT studentId FROM student WHERE user_id = ?', [users[0].id]);
                if (!studentRows || studentRows.length === 0) {
                    await conn.rollback();
                    conn.release();
                    return res.status(403).json({ success: false, error: 'Student record not found for user' });
                }

                const studentIdForUser = studentRows[0].studentId;
                if (studentIdForUser !== bookingStudentId) {
                    await conn.rollback();
                    conn.release();
                    return res.status(403).json({ success: false, error: 'You are not authorized to rate this booking' });
                }
                // At this point, booking row is locked and student is authorized to rate
            }
            const keys = Object.keys(data);
            const setClause = keys.map(k => `\`${k}\` = ?`).join(', ');
            const values = keys.map(k => data[k]);
            console.log('[bookings.put] SET clause:', setClause, 'values:', values);
            const [result] = await conn.execute(`UPDATE booking SET ${setClause} WHERE bookingId = ?`, [...values, id]);
            updateRes = result;

            // Log the updated booking row to inspect resulting status/value
            try {
                const [afterRows] = await conn.execute('SELECT bookingId, status FROM booking WHERE bookingId = ?', [id]);
                console.log('[bookings.put] booking after update:', afterRows && afterRows[0]);
            } catch (e) {
                console.error('[bookings.put] failed to query booking after update', e);
            }
        }
        if (!updateRes || updateRes.affectedRows === 0) {
            // Nothing updated
            await conn.rollback();
            conn.release();
            console.warn('[bookings.put] no rows updated for booking', id);
            return res.status(404).json({ success: false, error: 'Booking not found or no changes applied' });
        }

        // If status changed to completed, free the associated tutor_schedule slot
        if (data && Object.prototype.hasOwnProperty.call(data, 'status')) {
            const newStatus = ('' + data.status).toLowerCase();

            // Notification logic
            if (newStatus === 'completed' || newStatus === 'cancelled') {
                 try {
                     const [bRows] = await conn.execute(`
                        SELECT b.studentId, b.tutorId, b.subject, b.booking_date, b.start_time, t.name as tutor_name 
                        FROM booking b
                        JOIN tutor t ON b.tutorId = t.tutorId
                        WHERE b.bookingId = ?`, [id]);

                     if (bRows.length > 0) {
                         const b = bRows[0];
                         // Notify student if tutor performed the action
                         if (req.user && req.user.role === 'tutor') {
                             const dateStr = new Date(b.booking_date).toDateString();
                             const msg = `Your booking with ${b.tutor_name} on ${dateStr} at ${b.start_time} has been marked as ${newStatus}.`;
                             await conn.execute(
                                `INSERT INTO notification (recipientId, senderId, bookingId, text, type)
                                 VALUES (?, ?, ?, ?, 'booking')`,
                                [b.studentId, b.tutorId, id, msg]
                             );
                         }
                     }
                 } catch (e) {
                     console.error('Failed to send notification:', e);
                 }
            }

            if (newStatus === 'completed' || newStatus === 'complete') {
                try {
                    console.log('[bookings.put] booking marked completed, freeing schedule slot for booking', id);
                    // Get booking details to identify the schedule slot
                    const [rows] = await conn.execute('SELECT tutorId, booking_date, start_time FROM booking WHERE bookingId = ?', [id]);
                    if (rows && rows.length > 0) {
                        const b = rows[0];
                        const [slotRes] = await conn.execute(
                            'UPDATE tutor_schedule SET status = ?, reserved_by = NULL, reserved_at = NULL, booked_at = NULL WHERE tutorId = ? AND schedule_date = ? AND start_time = ? AND status = ?',
                            ['free', b.tutorId, b.booking_date, b.start_time, 'booked']
                        );
                        console.log('[bookings.put] schedule slot update result', { slotRes });
                    }
                } catch (e) {
                    console.error('Failed to free schedule slot after booking completed:', e);
                }
            }
        }

        // If a rating was provided, recompute tutor average rating
        if (data && Object.prototype.hasOwnProperty.call(data, 'rating')) {
            try {
                // Get tutorId for this booking
                const [rows] = await conn.execute('SELECT tutorId FROM booking WHERE bookingId = ?', [id]);
                if (rows && rows.length > 0) {
                    const tutorId = rows[0].tutorId;
                    // Compute average rating from all bookings with non-null rating for this tutor
                    const [stats] = await conn.execute('SELECT AVG(rating) AS avgRating, COUNT(rating) AS cnt FROM booking WHERE tutorId = ? AND rating IS NOT NULL', [tutorId]);
                    const avg = stats && stats[0] && stats[0].avgRating ? parseFloat(stats[0].avgRating).toFixed(2) : null;
                    const cnt = stats && stats[0] && stats[0].cnt ? parseInt(stats[0].cnt, 10) : 0;
                    if (avg !== null) {
                        await conn.execute('UPDATE tutor SET rating = ?, rating_count = ? WHERE tutorId = ?', [avg, cnt, tutorId]);
                    }
                }
            } catch (e) {
                console.error('Failed to update tutor rating after booking rating:', e);
            }
        }

        await conn.commit();

        // Return the updated booking row to the client
        const updatedRows = await query(
            `SELECT b.*, 
                t.name AS tutor_name, ut.username AS tutor_username, ut.nophone AS tutor_phone, ut.email AS tutor_email, 
                s.studentId AS student_id, us.username AS student_username, us.nophone AS student_phone, us.email AS student_email
             FROM booking b
             LEFT JOIN tutor t ON b.tutorId = t.tutorId
             LEFT JOIN users ut ON t.user_id = ut.id
             LEFT JOIN student s ON b.studentId = s.studentId
             LEFT JOIN users us ON s.user_id = us.id
             WHERE b.bookingId = ?`,
            [id]
        );

        conn.release();
        res.json({ success: true, data: (updatedRows && updatedRows[0]) || null });
    } catch (err) {
        try { await conn.rollback(); } catch (e) {}
        conn.release();
        next(err);
    }
});


// Delete booking (with role-based access check)
router.delete('/:id', verifyToken, async (req, res, next) => {
    const id = req.params.id;
    try {
        const bookings = await query('SELECT * FROM booking WHERE bookingId = ?', [id]);
        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const booking = bookings[0];
        const { role, id: userId } = req.user;

        // If not admin, verify ownership
        if (role !== 'admin') {
            if (role === 'student') {
                const students = await query('SELECT studentId FROM student WHERE user_id = ?', [userId]);
                if (students.length === 0 || students[0].studentId !== booking.studentId) {
                    return res.status(403).json({ success: false, message: 'Unauthorized' });
                }
            } else if (role === 'tutor') {
                const tutors = await query('SELECT tutorId FROM tutor WHERE user_id = ?', [userId]);
                if (tutors.length === 0 || tutors[0].tutorId !== booking.tutorId) {
                    return res.status(403).json({ success: false, message: 'Unauthorized' });
                }
            }
        }

        // Delete booking and free corresponding schedule slot inside a transaction
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [delRes] = await conn.execute('DELETE FROM booking WHERE bookingId = ?', [id]);

            // Try to free the schedule slot that matches this booking (by tutor, date and start_time)
            await conn.execute(
                'UPDATE tutor_schedule SET status = ?, reserved_by = NULL, reserved_at = NULL, booked_at = NULL WHERE tutorId = ? AND schedule_date = ? AND start_time = ? AND status = ?',
                ['free', booking.tutorId, booking.booking_date, booking.start_time, 'booked']
            );

            await conn.commit();
            conn.release();

            res.json({ success: true, data: delRes });
        } catch (err) {
            try { await conn.rollback(); } catch (e) {}
            conn.release();
            throw err;
        }
    } catch (err) {
        next(err);
    }
});

// Submit feedback for a completed booking
router.post('/:bookingId/feedback', verifyToken, async (req, res, next) => {
    const { bookingId } = req.params;
    const { rating, comment } = req.body;
    const { role, id: userId } = req.user;

    if (role !== 'student') {
        return res.status(403).json({ success: false, message: 'Only students can submit feedback' });
    }

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Verify booking exists, belongs to student, and is completed
        const [bookings] = await conn.query(
            `SELECT b.*, s.user_id as student_user_id, u.username as student_name
             FROM booking b
             JOIN student s ON b.studentId = s.studentId
             JOIN users u ON s.user_id = u.id
             WHERE b.bookingId = ?`,
            [bookingId]
        );

        if (bookings.length === 0) {
            throw new Error('Booking not found');
        }

        const booking = bookings[0];

        if (booking.student_user_id !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized: You are not the student for this booking' });
        }

        if (booking.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Feedback can only be submitted for completed sessions' });
        }

        // 2. Check if feedback already exists
        const [existingFeedback] = await conn.query(
            'SELECT id FROM feedback WHERE bookingId = ?',
            [bookingId]
        );

        if (existingFeedback.length > 0) {
            return res.status(400).json({ success: false, message: 'Feedback already submitted for this session' });
        }

        // 3. Insert feedback
        await conn.query(
            `INSERT INTO feedback (bookingId, studentId, tutorId, rating, comment, is_anonymous)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [bookingId, booking.studentId, booking.tutorId, rating, comment || null, req.body.isAnonymous ? 1 : 0]
        );

        // 4. Update tutor's average rating
        // Fetch current stats
        const [tutorStats] = await conn.query(
            'SELECT rating, rating_count FROM tutor WHERE tutorId = ? FOR UPDATE',
            [booking.tutorId]
        );

        const currentRating = parseFloat(tutorStats[0].rating || 0);
        const currentCount = parseInt(tutorStats[0].rating_count || 0);

        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + parseInt(rating)) / newCount;

        await conn.query(
            'UPDATE tutor SET rating = ?, rating_count = ? WHERE tutorId = ?',
            [newRating, newCount, booking.tutorId]
        );

        // 5. Create notification for tutor
        const isAnonymous = req.body.isAnonymous;
        const senderName = isAnonymous ? 'Anonymous Student' : (booking.student_name || 'Student');
        const notificationText = `New ${rating}-star rating received from ${senderName}!`;

        await conn.query(
            `INSERT INTO notification (recipientId, senderId, bookingId, text, type)
             VALUES (?, ?, ?, ?, 'feedback')`,
            [booking.tutorId, booking.studentId, bookingId, notificationText]
        );

        await conn.commit();
        res.json({ success: true, message: 'Feedback submitted successfully' });

    } catch (err) {
        await conn.rollback();
        console.error('Feedback submission error:', err);
        res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    } finally {
        conn.release();
    }
});

// Get feedback for a specific booking (to check if submitted)
router.get('/:bookingId/feedback', verifyToken, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const feedback = await query('SELECT * FROM feedback WHERE bookingId = ?', [bookingId]);
        res.json({ success: true, data: feedback[0] || null });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
