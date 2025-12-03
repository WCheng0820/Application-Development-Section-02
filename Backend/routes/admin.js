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

module.exports = router;
