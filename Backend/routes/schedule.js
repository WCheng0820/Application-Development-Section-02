const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Get tutor's schedule
router.get('/:tutorId', async (req, res, next) => {
    try {
        const { tutorId } = req.params;

        // Verify tutor exists
        const tutors = await query('SELECT tutorId FROM tutor WHERE tutorId = ?', [tutorId]);
        if (!tutors || tutors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tutor not found'
            });
        }

        // Get all schedules for this tutor, ordered by date and start time
        const schedules = await query(
            'SELECT schedule_id, tutorId, schedule_date, start_time, end_time, created_at, updated_at FROM tutor_schedule WHERE tutorId = ? ORDER BY schedule_date DESC, start_time ASC',
            [tutorId]
        );

        res.json({
            success: true,
            data: schedules || []
        });
    } catch (error) {
        console.error('Error getting schedule:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get schedule'
        });
    }
});

// Add schedule slot
router.post('/:tutorId', async (req, res, next) => {
    try {
        const { tutorId } = req.params;
        const { schedule_date, start_time, end_time } = req.body;

        // Validation
        if (!schedule_date || !start_time || !end_time) {
            return res.status(400).json({
                success: false,
                error: 'schedule_date, start_time, and end_time are required'
            });
        }

        // Verify tutor exists
        const tutors = await query('SELECT tutorId FROM tutor WHERE tutorId = ?', [tutorId]);
        if (!tutors || tutors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tutor not found'
            });
        }

        // Validate times
        if (start_time >= end_time) {
            return res.status(400).json({
                success: false,
                error: 'start_time must be before end_time'
            });
        }

        // Validate date is not in the past
        const scheduleDate = new Date(schedule_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (scheduleDate < today) {
            return res.status(400).json({
                success: false,
                error: 'schedule_date cannot be in the past'
            });
        }

        // Insert schedule
        const result = await query(
            'INSERT INTO tutor_schedule (tutorId, schedule_date, start_time, end_time) VALUES (?, ?, ?, ?)',
            [tutorId, schedule_date, start_time, end_time]
        );

        res.status(201).json({
            success: true,
            message: 'Schedule added successfully',
            data: {
                schedule_id: result.insertId,
                tutorId,
                schedule_date,
                start_time,
                end_time
            }
        });
    } catch (error) {
        console.error('Error adding schedule:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to add schedule'
        });
    }
});

// Update schedule slot
router.put('/:tutorId/:scheduleId', async (req, res, next) => {
    try {
        const { tutorId, scheduleId } = req.params;
        const { schedule_date, start_time, end_time } = req.body;

        // Validation
        if (!schedule_date || !start_time || !end_time) {
            return res.status(400).json({
                success: false,
                error: 'schedule_date, start_time, and end_time are required'
            });
        }

        // Validate times
        if (start_time >= end_time) {
            return res.status(400).json({
                success: false,
                error: 'start_time must be before end_time'
            });
        }

        // Verify schedule belongs to tutor
        const schedules = await query(
            'SELECT schedule_id FROM tutor_schedule WHERE schedule_id = ? AND tutorId = ?',
            [scheduleId, tutorId]
        );

        if (!schedules || schedules.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        // Update schedule
        await query(
            'UPDATE tutor_schedule SET schedule_date = ?, start_time = ?, end_time = ? WHERE schedule_id = ?',
            [schedule_date, start_time, end_time, scheduleId]
        );

        res.json({
            success: true,
            message: 'Schedule updated successfully',
            data: {
                schedule_id: scheduleId,
                tutorId,
                schedule_date,
                start_time,
                end_time
            }
        });
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update schedule'
        });
    }
});

// Delete schedule slot
router.delete('/:tutorId/:scheduleId', async (req, res, next) => {
    try {
        const { tutorId, scheduleId } = req.params;

        // Verify schedule belongs to tutor
        const schedules = await query(
            'SELECT schedule_id FROM tutor_schedule WHERE schedule_id = ? AND tutorId = ?',
            [scheduleId, tutorId]
        );

        if (!schedules || schedules.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        // Delete schedule
        await query('DELETE FROM tutor_schedule WHERE schedule_id = ?', [scheduleId]);

        res.json({
            success: true,
            message: 'Schedule deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete schedule'
        });
    }
});

// Reserve a slot (student selects a slot -> becomes reserved)
router.post('/:tutorId/:scheduleId/reserve', async (req, res, next) => {
    try {
        const { tutorId, scheduleId } = req.params;
        const { studentId } = req.body;

        if (!studentId) {
            return res.status(400).json({ success: false, error: 'studentId is required' });
        }

        // Try to atomically reserve when status is 'free'
        const result = await query(
            'UPDATE tutor_schedule SET status = ?, reserved_by = ?, reserved_at = NOW() WHERE schedule_id = ? AND tutorId = ? AND status = ?',
            ['reserved', studentId, scheduleId, tutorId, 'free']
        );

        if (!result || result.affectedRows === 0) {
            return res.status(409).json({ success: false, error: 'Slot is not available for reservation' });
        }

        res.json({ success: true, message: 'Slot reserved', data: { schedule_id: parseInt(scheduleId), tutorId, reserved_by: studentId } });
    } catch (error) {
        console.error('Error reserving slot:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to reserve slot' });
    }
});

// Release a reserved slot (student cancels before payment)
router.post('/:tutorId/:scheduleId/release', async (req, res, next) => {
    try {
        const { tutorId, scheduleId } = req.params;
        const { studentId } = req.body;

        if (!studentId) {
            return res.status(400).json({ success: false, error: 'studentId is required' });
        }

        // Only release if reserved_by matches
        const result = await query(
            'UPDATE tutor_schedule SET status = ?, reserved_by = NULL, reserved_at = NULL WHERE schedule_id = ? AND tutorId = ? AND reserved_by = ? AND status = ?',
            ['free', scheduleId, tutorId, studentId, 'reserved']
        );

        if (!result || result.affectedRows === 0) {
            return res.status(409).json({ success: false, error: 'Slot is not reserved by this student or cannot be released' });
        }

        res.json({ success: true, message: 'Slot released' });
    } catch (error) {
        console.error('Error releasing slot:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to release slot' });
    }
});

// Book a reserved slot (after successful payment)
router.post('/:tutorId/:scheduleId/book', async (req, res, next) => {
    try {
        const { tutorId, scheduleId } = req.params;
        const { studentId, subject, paymentMethod } = req.body;

        if (!studentId) {
            return res.status(400).json({ success: false, error: 'studentId is required' });
        }

        // Only allow booking if currently reserved by the same student
        const updateRes = await query(
            'UPDATE tutor_schedule SET status = ?, booked_at = NOW() WHERE schedule_id = ? AND tutorId = ? AND reserved_by = ? AND status = ?',
            ['booked', scheduleId, tutorId, studentId, 'reserved']
        );

        if (!updateRes || updateRes.affectedRows === 0) {
            return res.status(409).json({ success: false, error: 'Slot cannot be booked - not reserved by this student' });
        }

        // Read schedule info to populate booking
        const rows = await query('SELECT schedule_date, start_time, end_time FROM tutor_schedule WHERE schedule_id = ?', [scheduleId]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Schedule not found after update' });
        }
        const slot = rows[0];

        // Create booking record (status 'confirmed')
        const bookingRes = await query(
            'INSERT INTO booking (tutorId, studentId, booking_date, start_time, end_time, subject, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [tutorId, studentId, slot.schedule_date, slot.start_time, slot.end_time, subject || null, 'confirmed', `payment:${paymentMethod || 'unknown'}`]
        );

        res.status(201).json({ success: true, message: 'Slot booked', data: { bookingId: bookingRes.insertId } });
    } catch (error) {
        console.error('Error booking slot:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to book slot' });
    }
});

module.exports = router;
