const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Get all tutors
router.get('/', async (req, res, next) => {
    try {
        const results = await query('SELECT * FROM tutor');
        
        // Fetch schedules for each tutor
        const tutorsWithSchedules = await Promise.all(results.map(async (tutor) => {
            const schedules = await query('SELECT * FROM tutor_schedule WHERE tutorId = ?', [tutor.tutorId]);
            return {
                ...tutor,
                schedule: schedules || []
            };
        }));
        
        res.json({ success: true, data: tutorsWithSchedules });
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
        
        // Fetch schedules for this tutor
        const schedules = await query('SELECT * FROM tutor_schedule WHERE tutorId = ?', [id]);
        const tutor = {
            ...results[0],
            schedule: schedules || []
        };
        
        res.json({ success: true, data: tutor });
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
            `INSERT INTO tutor (user_id, name, yearsOfExperience, verification_documents, rating, rating_count, price, bio, specialization) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [tutor.user_id || null, tutor.name, tutor.yearsOfExperience || 0, JSON.stringify(tutor.verification_documents || []), tutor.rating || null, tutor.rating_count || 0, tutor.price || null, tutor.bio || null, tutor.specialization || null]
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
