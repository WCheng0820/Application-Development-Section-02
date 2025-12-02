const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

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

        let sql = `SELECT b.*, t.name AS tutor_name FROM booking b LEFT JOIN tutor t ON b.tutorId = t.tutorId WHERE 1=1`;
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
        const results = await query('SELECT * FROM booking WHERE bookingId = ?', [id]);
        if (!results || results.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
        
        const booking = results[0];
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

// Update booking
router.put('/:id', async (req, res, next) => {
    const id = req.params.id;
    const data = req.body;
    try {
        const result = await query('UPDATE booking SET ? WHERE bookingId = ?', [data, id]);
        res.json({ success: true, data: result });
    } catch (err) {
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

        const result = await query('DELETE FROM booking WHERE bookingId = ?', [id]);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
