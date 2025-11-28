const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Get all tutors
router.get('/', async (req, res, next) => {
    try {
        const results = await query('SELECT * FROM tutor');
        res.json({ success: true, data: results });
    } catch (err) {
        next(err);
    }
});

// Get tutor by ID
router.get('/:id', async (req, res, next) => {
    const id = req.params.id;
    try {
        const results = await query('SELECT * FROM tutor WHERE tutorId = ?', [id]);
        if (!results || results.length === 0) return res.status(404).json({ success: false, message: 'Tutor not found' });
        res.json({ success: true, data: results[0] });
    } catch (err) {
        next(err);
    }
});

// Create tutor
router.post('/', async (req, res, next) => {
    const tutor = req.body;
    if (!tutor.name) return res.status(400).json({ success: false, message: 'Missing name' });
    try {
        // If tutorId provided, insert directly
        if (tutor.tutorId) {
            const result = await query('INSERT INTO tutor SET ?', [tutor]);
            return res.status(201).json({ success: true, data: result });
        }

        // Insert without tutorId, then generate one from the inserted PK
        const insertRes = await query(
            `INSERT INTO tutor (user_id, name, availability, yearsOfExperience, verification_documents, rating, price) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [tutor.user_id || null, tutor.name, tutor.availability || null, tutor.yearsOfExperience || 0, JSON.stringify(tutor.verification_documents || []), tutor.rating || null, tutor.price || null]
        );

        const pk = insertRes.insertId;
        const generatedTutorId = `t${String(pk).padStart(6, '0')}`;
        await query('UPDATE tutor SET tutorId = ? WHERE tutor_pk = ?', [generatedTutorId, pk]);

        const rows = await query('SELECT * FROM tutor WHERE tutor_pk = ?', [pk]);
        return res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
        next(err);
    }
});

// Update tutor
router.put('/:id', async (req, res, next) => {
    const id = req.params.id;
    const data = req.body;
    try {
        const result = await query('UPDATE tutor SET ? WHERE tutorId = ?', [data, id]);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
});

// Delete tutor
router.delete('/:id', async (req, res, next) => {
    const id = req.params.id;
    try {
        const result = await query('DELETE FROM tutor WHERE tutorId = ?', [id]);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
