const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');
const { google } = require('googleapis');
const { verifyToken } = require('../middlewares/auth');

// Fetch materials from DB (uploaded via backend, stored in MLT folder on Drive)
// Optionally fetch from Drive's MLT folder if credentials available
router.get('/', verifyToken, async (req, res) => {
  try {
    // Always fetch from database first (source of truth)
    // Join with tutor table to get uploader name
    // If user is a tutor, only show their materials. Admin/students see all.
    let sql = `
        SELECT m.*, t.name as tutor_name 
        FROM materials m 
        LEFT JOIN tutor t ON m.tutorId = t.tutorId 
    `;
    const params = [];
    
    if (req.user.role === 'tutor') {
      sql += ` WHERE m.tutorId = ?`;
      params.push(req.user.tutorId || req.user.userId);
    }
    
    sql += ` ORDER BY m.created_at DESC`;
    
    const rows = await query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (error) {
    if (error && error.code === 'ER_NO_SUCH_TABLE') {
      console.warn('Materials table not found. Upload files via the upload form first.');
      return res.json({ success: true, data: [] });
    }
    console.error('Error fetching materials:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch materials' });
  }
});

module.exports = router;
