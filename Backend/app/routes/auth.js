// app/routes/auth.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// Register new user
router.post('/register', AuthController.register);

// Login user
router.post('/login', AuthController.login);

// Verify session token
router.get('/verify', AuthController.verify);

// Logout user
router.post('/logout', AuthController.logout);

// Update user profile
router.put('/profile', AuthController.updateProfile);

// Get pending tutors (admin only)
router.get('/pending-tutors', AuthController.getPendingTutors);

// Approve tutor (admin only)
router.post('/approve-tutor', AuthController.approveTutor);

// Reject tutor (admin only)
router.post('/reject-tutor', AuthController.rejectTutor);

module.exports = router;
