// routes/auth.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const crypto = require('crypto');

// Helper function to hash password (simple hash for demo - use bcrypt in production)
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Helper function to generate session token
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, role, fullName, verificationDocuments } = req.body;

        // Validation
        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                error: 'Email, password, and role are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const [existingUsers] = await query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Email already exists'
            });
        }

        // Parse fullName
        const nameParts = (fullName || '').trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Set approval status for tutors
        const isApproved = role === 'tutor' ? false : true;
        const approvalStatus = role === 'tutor' ? 'pending' : 'approved';

        // For tutors, require verification documents
        if (role === 'tutor' && (!verificationDocuments || verificationDocuments.length === 0)) {
            return res.status(400).json({
                success: false,
                error: 'Verification documents are required for tutor registration'
            });
        }

        // Hash password
        const hashedPassword = hashPassword(password);

        // Insert user
        const [result] = await query(
            `INSERT INTO users (email, password, role, is_approved, approval_status, first_name, last_name, verification_documents) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                email,
                hashedPassword,
                role,
                isApproved,
                approvalStatus,
                firstName,
                lastName,
                JSON.stringify(verificationDocuments || [])
            ]
        );

        const userId = result.insertId;

        // Create session if user is not a tutor (tutors need approval)
        let session = null;
        if (role !== 'tutor') {
            const token = generateToken();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            await query(
                'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
                [userId, token, expiresAt]
            );

            session = {
                token,
                expiresAt: expiresAt.toISOString()
            };
        }

        // Return user data (without password)
        const [newUser] = await query(
            'SELECT id, email, role, is_approved, approval_status, first_name, last_name, bio, verification_documents, created_at FROM users WHERE id = ?',
            [userId]
        );

        res.status(201).json({
            success: true,
            message: role === 'tutor' 
                ? 'Registration successful! Your account is pending admin approval.'
                : 'Registration successful!',
            user: {
                ...newUser[0],
                verificationDocuments: JSON.parse(newUser[0].verification_documents || '[]'),
                profile: {
                    firstName: newUser[0].first_name,
                    lastName: newUser[0].last_name,
                    bio: newUser[0].bio
                }
            },
            session
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred during registration'
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Find user
        const [users] = await query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Verify password
        const hashedPassword = hashPassword(password);
        if (user.password !== hashedPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Check if tutor is approved
        if (user.role === 'tutor' && !user.is_approved) {
            return res.status(403).json({
                success: false,
                error: 'Your account is pending admin approval. Please wait for approval before logging in.'
            });
        }

        // Generate session token
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store session
        await query(
            'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user.id, token, expiresAt]
        );

        // Return user data (without password)
        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isApproved: user.is_approved,
                approvalStatus: user.approval_status,
                profile: {
                    firstName: user.first_name,
                    lastName: user.last_name,
                    bio: user.bio
                },
                verificationDocuments: JSON.parse(user.verification_documents || '[]')
            },
            session: {
                token,
                expiresAt: expiresAt.toISOString()
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred during login'
        });
    }
});

// Verify session token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        // Check session
        const [sessions] = await query(
            'SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()',
            [token]
        );

        if (sessions.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

        const session = sessions[0];

        // Get user
        const [users] = await query(
            'SELECT id, email, role, is_approved, approval_status, first_name, last_name, bio FROM users WHERE id = ?',
            [session.user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const user = users[0];

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isApproved: user.is_approved,
                approvalStatus: user.approval_status,
                profile: {
                    firstName: user.first_name,
                    lastName: user.last_name,
                    bio: user.bio
                }
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred during token verification'
        });
    }
});

// Logout user
router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (token) {
            await query('DELETE FROM sessions WHERE token = ?', [token]);
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred during logout'
        });
    }
});

module.exports = router;

