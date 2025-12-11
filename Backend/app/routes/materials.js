const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');
const { google } = require('googleapis');

// Fetch materials from DB (uploaded via backend, stored in MLT folder on Drive)
// Optionally fetch from Drive's MLT folder if credentials available
router.get('/', async (req, res) => {
  try {
    // Always fetch from database first (source of truth)
    // Join with tutor table to get uploader name
    const rows = await query(`
        SELECT m.*, t.name as tutor_name 
        FROM materials m 
        LEFT JOIN tutor t ON m.tutorId = t.tutorId 
        ORDER BY m.created_at DESC
    `);
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
