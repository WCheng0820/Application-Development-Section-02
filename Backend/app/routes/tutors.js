// app/routes/tutors.js
const express = require('express');
const router = express.Router();
const TutorsController = require('../controllers/TutorsController');

// Get all tutors
router.get('/', TutorsController.getAll);

// Get tutor by ID
router.get('/:id', TutorsController.getById);

// Create tutor
router.post('/', TutorsController.create);

// Update tutor
router.put('/:id', TutorsController.update);

// Delete tutor
router.delete('/:id', TutorsController.delete);

// Get reviews for a tutor
router.get('/:id/reviews', TutorsController.getReviews);

module.exports = router;
