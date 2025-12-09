const express = require('express');
const router = express.Router();
const { query, pool } = require('../config/database');

// Cancel payment / free slot
// Accepts { bookingId } OR { scheduleId, studentId } OR { tutorId, booking_date, start_time }
router.post('/cancel', async (req, res, next) => {
    const { bookingId, scheduleId, studentId, tutorId, booking_date, start_time } = req.body;

    // Authenticate and authorize: only tutors can cancel bookings
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ success: false, error: 'No token provided' });

        const sessions = await query('SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()', [token]);
        if (!sessions || sessions.length === 0) return res.status(401).json({ success: false, error: 'Invalid or expired token' });

        const session = sessions[0];
        const users = await query('SELECT id, username, email, role FROM users WHERE id = ?', [session.user_id]);
        if (!users || users.length === 0) return res.status(404).json({ success: false, error: 'User not found' });

        const user = users[0];
        if (user.role !== 'tutor') return res.status(403).json({ success: false, error: 'Only tutors can cancel bookings' });

        // Get the tutorId for this user
        const tutors = await query('SELECT tutorId FROM tutor WHERE user_id = ?', [user.id]);
        if (!tutors || tutors.length === 0) return res.status(403).json({ success: false, error: 'Tutor record not found for this user' });
        var tutorAuthorizedId = tutors[0].tutorId;
    } catch (authErr) {
        return next(authErr);
    }

    if (!bookingId && !scheduleId && !(tutorId && booking_date && start_time)) {
        return res.status(400).json({ success: false, error: 'Provide bookingId OR scheduleId+studentId OR tutorId+booking_date+start_time' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        let booking = null;

        if (bookingId) {
            const [rows] = await conn.execute('SELECT * FROM booking WHERE bookingId = ?', [bookingId]);
            if (rows && rows.length > 0) booking = rows[0];

            if (booking) {
                // Only the tutor of this booking may cancel
                if (booking.tutorId !== tutorAuthorizedId) {
                    await conn.rollback();
                    conn.release();
                    return res.status(403).json({ success: false, error: 'Not authorized to cancel this booking' });
                }

                // Delete booking
                await conn.execute('DELETE FROM booking WHERE bookingId = ?', [bookingId]);

                // Free matching schedule slot
                await conn.execute(
                    'UPDATE tutor_schedule SET status = ?, reserved_by = NULL, reserved_at = NULL, booked_at = NULL WHERE tutorId = ? AND schedule_date = ? AND start_time = ? AND status IN (?, ?)',
                    ['free', booking.tutorId, booking.booking_date, booking.start_time, 'booked', 'reserved']
                );
            }
        } else if (scheduleId) {
            // When freeing by scheduleId, ensure the schedule belongs to the authorized tutor
            const [srows] = await conn.execute('SELECT tutorId FROM tutor_schedule WHERE schedule_id = ?', [scheduleId]);
            if (!srows || srows.length === 0) {
                await conn.rollback();
                conn.release();
                return res.status(404).json({ success: false, error: 'Schedule not found' });
            }
            const scheduleTutorId = srows[0].tutorId;
            if (scheduleTutorId !== tutorAuthorizedId) {
                await conn.rollback();
                conn.release();
                return res.status(403).json({ success: false, error: 'Not authorized to free this schedule' });
            }

            if (!studentId) {
                await conn.rollback();
                conn.release();
                return res.status(400).json({ success: false, error: 'studentId is required when using scheduleId' });
            }

            const [resu] = await conn.execute(
                'UPDATE tutor_schedule SET status = ?, reserved_by = NULL, reserved_at = NULL WHERE schedule_id = ? AND reserved_by = ? AND status = ?',
                ['free', scheduleId, studentId, 'reserved']
            );

            // Optionally remove any pending booking rows matching this (defensive)
            await conn.execute('DELETE FROM booking WHERE tutorId IS NOT NULL AND studentId = ? AND booking_date IS NULL', [studentId]);

            if (resu && resu.affectedRows === 0) {
                await conn.rollback();
                conn.release();
                return res.status(409).json({ success: false, error: 'Schedule not reserved by this student or cannot be freed' });
            }
        } else if (tutorId && booking_date && start_time) {
            // Ensure provided tutorId matches authorized tutor
            if (tutorId !== tutorAuthorizedId) {
                await conn.rollback();
                conn.release();
                return res.status(403).json({ success: false, error: 'Not authorized to free this tutor schedule' });
            }

            await conn.execute(
                'UPDATE tutor_schedule SET status = ?, reserved_by = NULL, reserved_at = NULL, booked_at = NULL WHERE tutorId = ? AND schedule_date = ? AND start_time = ? AND status IN (?, ?)',
                ['free', tutorId, booking_date, start_time, 'reserved', 'booked']
            );
        }

        await conn.commit();
        conn.release();

        res.json({ success: true, message: 'Payment canceled and slot freed' });
    } catch (err) {
        try { await conn.rollback(); } catch (e) {}
        conn.release();
        next(err);
    }
});

module.exports = router;
