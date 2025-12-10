// app/routes/bookings.js
const express = require('express');
const router = express.Router();
const BookingsController = require('../controllers/BookingsController');
const { verifyToken, optionalAuth } = require('../middlewares/auth');

// Get all bookings (with optional auth)
router.get('/', optionalAuth, BookingsController.getAll);

// Get booking by ID
router.get('/:id', verifyToken, BookingsController.getById);

// Create booking
router.post('/', BookingsController.create);

// Update booking
router.put('/:id', verifyToken, BookingsController.update);

// Delete booking
router.delete('/:id', verifyToken, BookingsController.delete);

// Submit feedback for a completed booking
router.post('/:bookingId/feedback', verifyToken, BookingsController.submitFeedback);

// Get feedback for a specific booking
router.get('/:bookingId/feedback', verifyToken, BookingsController.getFeedback);

module.exports = router;
