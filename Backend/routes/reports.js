const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Middleware to verify token and attach user to request
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const sessions = await query(
            'SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()',
            [token]
        );

        if (sessions.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid or expired token' });
        }

        const session = sessions[0];
        const users = await query(
            'SELECT id, userId, username, email, role FROM users WHERE id = ?',
            [session.user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        req.user = users[0];
        next();
    } catch (err) {
        res.status(500).json({ success: false, error: 'Token verification failed' });
    }
};

// Create a new report
router.post('/', verifyToken, async (req, res) => {
    try {
        const { reportedId, targetType, targetId, category, description, evidenceUrl } = req.body;
        const reporterId = req.user.userId; // Use the string userId (e.g., S000001)

        if (!targetType || !category || !description) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const result = await query(
            `INSERT INTO reports (reporter_id, reported_id, target_type, target_id, category, description, evidence_url, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [reporterId, reportedId || null, targetType, targetId || null, category, description, evidenceUrl || null]
        );

        const reportId = result.insertId;

        // Notify all admins
        const admins = await query("SELECT userId FROM users WHERE role = 'admin'");
        for (const admin of admins) {
            await query(
                `INSERT INTO notification (recipientId, senderId, reportId, text, type)
                 VALUES (?, ?, ?, ?, 'report')`,
                [admin.userId, reporterId, reportId, `New report submitted: ${category}`]
            );
        }
        
        res.status(201).json({ success: true, message: 'Report submitted successfully', reportId: result.insertId });
    } catch (err) {
        console.error('Error creating report:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get all reports (Admin only)
router.get('/', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const reports = await query(
            `SELECT r.*, 
                    u_reporter.username as reporter_name,
                    u_reported.username as reported_name
             FROM reports r
             LEFT JOIN users u_reporter ON r.reporter_id = u_reporter.userId
             LEFT JOIN users u_reported ON r.reported_id = u_reported.userId
             ORDER BY r.created_at DESC`
        );

        res.json({ success: true, data: reports });
    } catch (err) {
        console.error('Error fetching reports:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Update report status (Admin only)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const { id } = req.params;
        const { status, adminNotes } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, error: 'Status is required' });
        }

        await query(
            `UPDATE reports SET status = ?, admin_notes = ? WHERE id = ?`,
            [status, adminNotes || null, id]
        );

        // Notify reporter about the update
        const [report] = await query('SELECT reporter_id FROM reports WHERE id = ?', [id]);
        if (report) {
            const msg = `Your report #${id} has been ${status}. ${adminNotes ? 'Note: ' + adminNotes : ''}`;
            await query(
                `INSERT INTO notification (recipientId, senderId, reportId, text, type)
                 VALUES (?, ?, ?, ?, 'report')`,
                [report.reporter_id, req.user.userId, id, msg]
            );
        }

        res.json({ success: true, message: 'Report updated successfully' });
    } catch (err) {
        console.error('Error updating report:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
