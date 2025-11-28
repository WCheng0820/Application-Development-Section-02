const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Get all bookings
router.get('/', async (req, res, next) => {
    try {
        const results = await query('SELECT * FROM booking');
        res.json({ success: true, data: results });
    } catch (err) {
        next(err);
    }
});

// Get booking by ID
router.get('/:id', async (req, res, next) => {
    const id = req.params.id;
    try {
        const results = await query('SELECT * FROM booking WHERE bookingId = ?', [id]);
        if (!results || results.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, data: results[0] });
    } catch (err) {
        next(err);
    }
});

// Create booking
router.post('/', async (req, res, next) => {
    const booking = req.body;
    if (!booking.bookingId || !booking.tutorId || !booking.studentId) return res.status(400).json({ success: false, message: 'Missing required fields' });
    try {
        const result = await query('INSERT INTO booking SET ?', [booking]);
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
});

// Update booking
router.put('/:id', async (req, res, next) => {
    const id = req.params.id;
    const data = req.body;
    try {
        const result = await query('UPDATE booking SET ? WHERE bookingId = ?', [data, id]);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
});

// Delete booking
router.delete('/:id', async (req, res, next) => {
    const id = req.params.id;
    try {
        const result = await query('DELETE FROM booking WHERE bookingId = ?', [id]);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
