// app/controllers/ScheduleController.js
const { query, pool } = require('../../config/database');

class ScheduleController {
    // Get tutor's schedule
    static async getSchedule(req, res, next) {
        try {
            const { tutorId } = req.params;

            const tutors = await query('SELECT tutorId FROM tutor WHERE tutorId = ?', [tutorId]);
            if (!tutors || tutors.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Tutor not found'
                });
            }

            const schedules = await query(
                'SELECT schedule_id, tutorId, schedule_date, start_time, end_time, status, reserved_by, reserved_at, booked_at, created_at, updated_at FROM tutor_schedule WHERE tutorId = ? ORDER BY schedule_date DESC, start_time ASC',
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
    }

    // Add schedule slot
    static async addSchedule(req, res, next) {
        try {
            const { tutorId } = req.params;
            const { schedule_date, start_time, end_time } = req.body;

            if (!schedule_date || !start_time || !end_time) {
                return res.status(400).json({
                    success: false,
                    error: 'schedule_date, start_time, and end_time are required'
                });
            }

            // Use the original route logic
            const router = require('../../routes/schedule');
            // Delegate to original route handler
            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to add schedule'
            });
        }
    }
}

module.exports = ScheduleController;
