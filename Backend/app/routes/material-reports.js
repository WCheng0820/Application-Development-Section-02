const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyToken } = require('../middlewares/auth');

// Create a report for a material (inserts into reports table)
// POST /api/material-reports
router.post('/', verifyToken, async (req, res) => {
    try {
        const { materialLink, materialTitle, reason } = req.body;
        const reporterId = req.user.userId;

        console.log('Report submission:', { materialLink, materialTitle, reason, reporterId });

        if (!materialLink || !reason) {
            return res.status(400).json({ success: false, error: 'Missing materialLink or reason' });
        }

        if (!reporterId) {
            console.error('Missing reporterId - user:', req.user);
            return res.status(400).json({ success: false, error: 'User ID not found in session' });
        }

        // Insert into existing reports table with proper field mappings:
        // target_type: 'content' (for material content)
        // target_id: NULL (no specific material ID)
        // category: 'material'
        // evidence_url: materialLink (the Google Drive link)
        // reporter_id: student who flagged
        // reported_id: NULL (one-directional, no specific user reported)
        const description = materialTitle ? `[${materialTitle}] ${reason}` : reason;
        const result = await db.query(
            `INSERT INTO reports (reporter_id, reported_id, target_type, target_id, category, description, evidence_url, status)
             VALUES (?, NULL, 'content', NULL, 'material', ?, ?, 'pending')`,
            [reporterId, description, materialLink]
        );

        console.log('Report created successfully:', result.insertId);

        res.status(201).json({ 
            success: true,
            message: 'Material report submitted successfully',
            data: {
                id: result.insertId,
                materialLink,
                reporterId,
                reason,
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Material report creation error:', error);
        console.error('Error details:', error.message, error.code);
        res.status(500).json({ success: false, error: `Failed to create report: ${error.message}` });
    }
});

// Get all material reports (admin only)
// GET /api/material-reports
router.get('/', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Only admins can view reports' });
        }

        // Get material-type reports from reports table
        const reports = await db.query(`
            SELECT r.*, m.title as material_title, u.name as reporter_name
            FROM reports r
            LEFT JOIN materials m ON r.target_id = m.id AND r.target_type = 'content'
            LEFT JOIN users u ON r.reporter_id = u.userId
            WHERE r.target_type = 'content' AND r.category = 'material'
            ORDER BY r.created_at DESC
        `);

        res.json({ success: true, data: reports });
    } catch (error) {
        console.error('Report fetch error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch reports' });
    }
});

// Update material report status (admin only)
// PATCH /api/material-reports/:id
router.patch('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Only admins can update reports' });
        }

        const { status, adminNotes } = req.body;
        const reportId = req.params.id;

        if (!status) {
            return res.status(400).json({ success: false, error: 'Status is required' });
        }

        const result = await db.query(
            `UPDATE reports SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND target_type = 'content'`,
            [status, adminNotes || null, reportId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        res.json({ success: true, message: 'Material report updated successfully' });
    } catch (error) {
        console.error('Report update error:', error);
        res.status(500).json({ success: false, error: 'Failed to update report' });
    }
});

module.exports = router;
