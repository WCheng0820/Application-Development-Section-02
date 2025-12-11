// routes/admin.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    // Check for token in headers (assume authenticated)
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify token and check if user is admin
    const sessions = await query(
      'SELECT user_id FROM sessions WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if (sessions.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    const users = await query(
      'SELECT role FROM users WHERE id = ?',
      [sessions[0].user_id]
    );

    if (users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    req.userId = sessions[0].user_id;
    next();
  } catch (err) {
    res.status(500).json({ success: false, error: 'Authorization error' });
  }
};

// Get all pending users
router.get('/pending-users', isAdmin, async (req, res) => {
  try {
    const pendingUsers = await query(
      'SELECT id, userId, username, email, role, created_at FROM users WHERE status = ?',
      ['pending']
    );

    res.json({
      success: true,
      data: pendingUsers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error fetching pending users'
    });
  }
});

// Activate a pending user and create their role record
router.post('/activate-user/:userId', isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user by userId (string id like t000001, s000001)
    const users = await query(
      'SELECT id, role, username FROM users WHERE userId = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = users[0];

    // Update user status to active
    await query('UPDATE users SET status = ? WHERE userId = ?', ['active', userId]);

    // Check if role record exists
    let roleExists = false;

    if (user.role === 'tutor') {
      const tutors = await query('SELECT tutor_pk FROM tutor WHERE user_id = ?', [user.id]);
      roleExists = tutors.length > 0;
    } else if (user.role === 'student') {
      const students = await query('SELECT student_pk FROM student WHERE user_id = ?', [user.id]);
      roleExists = students.length > 0;
    } else if (user.role === 'admin') {
      const admins = await query('SELECT adminId FROM admin WHERE user_id = ?', [user.id]);
      roleExists = admins.length > 0;
    }

    // Create role record if it doesn't exist
    if (!roleExists) {
      if (user.role === 'tutor') {
        await query(
          `INSERT INTO tutor (tutorId, user_id, name, verification_documents) VALUES (?, ?, ?, ?)`,
          [userId, user.id, user.username, JSON.stringify([])]
        );
      } else if (user.role === 'student') {
        await query(
          `INSERT INTO student (studentId, user_id, yearOfStudy) VALUES (?, ?, ?)`,
          [userId, user.id, 1]
        );
      } else if (user.role === 'admin') {
        await query(
          `INSERT INTO admin (adminId, user_id, name) VALUES (?, ?, ?)`,
          [userId, user.id, user.username]
        );
      }
    }

    res.json({
      success: true,
      message: `User ${userId} activated successfully`,
      user: {
        userId,
        username: user.username,
        role: user.role,
        status: 'active'
      }
    });
  } catch (err) {
    console.error('Activation error:', err);
    res.status(500).json({
      success: false,
      error: 'Error activating user'
    });
  }
});

// Reject a pending user (delete)
router.post('/reject-user/:userId', isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Find and delete user
    const users = await query('SELECT id FROM users WHERE userId = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await query('DELETE FROM users WHERE userId = ?', [userId]);

    res.json({
      success: true,
      message: `User ${userId} rejected and removed`
    });
  } catch (err) {
    console.error('Rejection error:', err);
    res.status(500).json({
      success: false,
      error: 'Error rejecting user'
    });
  }
});

// Get dashboard stats
router.get('/stats', isAdmin, async (req, res) => {
  try {
    // 1. Total Users (Students, Tutors)
    const [userCounts] = await query(`
      SELECT 
        SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as totalStudents,
        SUM(CASE WHEN role = 'tutor' THEN 1 ELSE 0 END) as totalTutors,
        SUM(CASE WHEN role = 'tutor' AND status = 'active' THEN 1 ELSE 0 END) as activeTutors,
        SUM(CASE WHEN role = 'tutor' AND status = 'pending' THEN 1 ELSE 0 END) as pendingTutors
      FROM users
    `);

    // 2. Bookings Stats
    const [bookingCounts] = await query(`
      SELECT 
        COUNT(*) as totalBookings,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedBookings,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingBookings
      FROM booking
    `);

    // 3. Reports Stats
    const [reportCounts] = await query(`
      SELECT 
        COUNT(*) as totalReports,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingReports
      FROM reports
    `);

    // 4. New Registrations (Today)
    const [newRegistrations] = await query(`
      SELECT COUNT(*) as newToday 
      FROM users 
      WHERE DATE(created_at) = CURDATE()
    `);

    res.json({
      success: true,
      data: {
        users: userCounts,
        bookings: bookingCounts,
        reports: reportCounts,
        newRegistrations: newRegistrations.newToday
      }
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ success: false, error: 'Error fetching stats' });
  }
});

// Get all sessions (bookings)
router.get('/sessions', isAdmin, async (req, res) => {
  try {
    const sessions = await query(`
      SELECT 
        b.bookingId,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.status,
        b.subject,
        t.name as tutorName,
        u.username as studentName,
        b.created_at
      FROM booking b
      LEFT JOIN tutor t ON b.tutorId = t.tutorId
      LEFT JOIN student s ON b.studentId = s.studentId
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY b.booking_date DESC, b.start_time DESC
    `);

    res.json({
      success: true,
      data: sessions
    });
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ success: false, error: 'Error fetching sessions' });
  }
});

// Cancel a session (booking)
router.post('/cancel-session/:bookingId', isAdmin, async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Check if booking exists
    const bookings = await query('SELECT bookingId, status FROM booking WHERE bookingId = ?', [bookingId]);
    if (bookings.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const booking = bookings[0];
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Booking is already cancelled' });
    }

    // Update status to cancelled
    await query('UPDATE booking SET status = ? WHERE bookingId = ?', ['cancelled', bookingId]);

    // Also update tutor schedule to free if needed? 
    // Usually if a booking is cancelled, the slot should become free again.
    // Let's check if there is a corresponding schedule entry.
    // The booking table has tutorId, booking_date, start_time, end_time.
    // The tutor_schedule table has tutorId, schedule_date, start_time, end_time.
    
    const bookingDetails = await query('SELECT tutorId, booking_date, start_time, end_time FROM booking WHERE bookingId = ?', [bookingId]);
    if (bookingDetails.length > 0) {
        const { tutorId, booking_date, start_time, end_time } = bookingDetails[0];
        // Format date for query
        const dateStr = new Date(booking_date).toISOString().split('T')[0];
        
        await query(
            `UPDATE tutor_schedule 
             SET status = 'free', reserved_by = NULL, reserved_at = NULL, booked_at = NULL 
             WHERE tutorId = ? AND schedule_date = ? AND start_time = ? AND end_time = ?`,
            [tutorId, dateStr, start_time, end_time]
        );
    }

    res.json({
      success: true,
      message: `Session ${bookingId} cancelled successfully`
    });
  } catch (err) {
    console.error('Error cancelling session:', err);
    res.status(500).json({ success: false, error: 'Error cancelling session' });
  }
});

// Get all users
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await query(
      'SELECT id, userId, username, email, role, status, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, error: 'Error fetching users' });
  }
});

// Update user
router.put('/users/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;
    
    await query(
      'UPDATE users SET status = ?, role = ? WHERE id = ?',
      [status, role, id]
    );
    
    res.json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ success: false, error: 'Error updating user' });
  }
});

// Delete user
router.delete('/users/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user details first to know which role tables to clean up
    const users = await query('SELECT userId, role FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const user = users[0];

    // Delete from role-specific tables
    if (user.role === 'student') {
      await query('DELETE FROM student WHERE user_id = ?', [id]);
    } else if (user.role === 'tutor') {
      await query('DELETE FROM tutor WHERE user_id = ?', [id]);
      // Also clean up schedule?
      await query('DELETE FROM tutor_schedule WHERE tutorId = ?', [user.userId]);
    } else if (user.role === 'admin') {
      await query('DELETE FROM admin WHERE user_id = ?', [id]);
    }

    // Delete bookings? (Maybe keep them for records, but set user_id to NULL? Or delete?)
    // For simplicity, let's delete bookings associated with this user
    if (user.role === 'student') {
        await query('DELETE FROM booking WHERE studentId = ?', [user.userId]);
    } else if (user.role === 'tutor') {
        await query('DELETE FROM booking WHERE tutorId = ?', [user.userId]);
    }

    // Finally delete the user
    await query('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, error: 'Error deleting user' });
  }
});

module.exports = router;
