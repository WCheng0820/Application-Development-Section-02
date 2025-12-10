const express = require('express');
const router = express.Router();
const multer = require('multer');
const { google } = require('googleapis');
const stream = require('stream');
const mysql = require('mysql');

// Multer config for file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Google Drive setup
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
});

// Create MySQL connection for callback-based queries
const db = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mlt_system'
});

// POST /api/materials/upload - Upload file to Drive (MLT folder) and save metadata to DB
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { title, category, description } = req.body;
        const MLT_FOLDER_ID = process.env.GOOGLE_MLT_FOLDER_ID; // Add this to .env

        if (!MLT_FOLDER_ID) {
            return res.status(500).json({ success: false, error: 'MLT folder ID not configured' });
        }

        // Prepare file for Google Drive
        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file.buffer);

        // Upload to Google Drive (into MLT folder)
        const driveResponse = await drive.files.create({
            requestBody: {
                name: title || req.file.originalname,
                mimeType: req.file.mimetype,
                parents: [MLT_FOLDER_ID] // Upload into MLT folder
            },
            media: {
                mimeType: req.file.mimetype,
                body: bufferStream,
            },
        });

        const fileId = driveResponse.data.id;

        // Make file publicly readable
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        // Get shareable links
        const result = await drive.files.get({
            fileId: fileId,
            fields: 'webViewLink, webContentLink',
        });

        const { webViewLink, webContentLink } = result.data;

        // Save metadata to database
        const sql = `INSERT INTO materials (title, description, category, drive_file_id, web_view_link, web_content_link) VALUES (?, ?, ?, ?, ?, ?)`;
        
        db.query(sql, [title, description || null, category, fileId, webViewLink, webContentLink], (err, dbResult) => {
            if (err) {
                console.error('DB error:', err);
                return res.status(500).json({ success: false, error: err.message });
            }
            
            res.status(200).json({
                success: true,
                message: 'File uploaded to Drive and Database',
                data: {
                    id: dbResult.insertId,
                    title,
                    webViewLink
                }
            });
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/materials/:id - Delete from Drive and DB
router.delete('/:id', async (req, res) => {
    const materialId = req.params.id;

    try {
        // Get Drive file ID from database
        const getSql = 'SELECT drive_file_id FROM materials WHERE id = ?';
        
        db.query(getSql, [materialId], async (err, results) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            if (results.length === 0) return res.status(404).json({ success: false, error: 'Material not found' });

            const driveFileId = results[0].drive_file_id;

            // Delete from Google Drive
            try {
                await drive.files.delete({ fileId: driveFileId });
            } catch (driveError) {
                console.warn("Warning: Could not delete from Drive:", driveError.message);
            }

            // Delete from database
            const deleteSql = 'DELETE FROM materials WHERE id = ?';
            db.query(deleteSql, [materialId], (delErr) => {
                if (delErr) return res.status(500).json({ success: false, error: delErr.message });
                
                res.json({ success: true, message: 'Material deleted successfully' });
            });
        });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
