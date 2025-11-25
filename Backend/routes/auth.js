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

// Helper function to generate ID based on role and user ID
const generateRoleId = (role, userId) => {
    const paddedId = String(userId).padStart(6, '0');
    switch (role) {
        case 'admin':
            return `ADM${paddedId}`;
        case 'tutor':
            return `TUT${paddedId}`;
        case 'student':
            return `STU${paddedId}`;
        default:
            return `${role.toUpperCase().substring(0, 3)}${paddedId}`;
    }
};

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role, nophone, fullName, verificationDocuments, yearOfStudy, programme, faculty, yearsOfExperience, availability } = req.body;

        // Validation
        if (!username || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                error: 'Username, email, password, and role are required'
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
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Email or username already exists'
            });
        }

        // Set status based on role (tutors need approval)
        const status = role === 'tutor' ? 'pending' : 'active';

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
            `INSERT INTO users (username, email, password, role, status, nophone) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                username,
                email,
                hashedPassword,
                role,
                status,
                nophone || null
            ]
        );

        const userId = result.insertId;
        const roleId = generateRoleId(role, userId);

        // Create role-specific record
        try {
            if (role === 'admin') {
                await query(
                    'INSERT INTO admin (adminId, user_id, name) VALUES (?, ?, ?)',
                    [roleId, userId, fullName || username]
                );
                console.log(`✅ Admin record created: ${roleId}`);
            } else if (role === 'tutor') {
                await query(
                    `INSERT INTO tutor (tutorId, user_id, name, availability, yearsOfExperience, verification_documents) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        roleId,
                        userId,
                        fullName || username,
                        availability || null,
                        yearsOfExperience || 0,
                        JSON.stringify(verificationDocuments || [])
                    ]
                );
                console.log(`✅ Tutor record created: ${roleId}`);
            } else if (role === 'student') {
                await query(
                    `INSERT INTO student (studentId, user_id, yearOfStudy, programme, faculty) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                        roleId,
                        userId,
                        yearOfStudy || 1,
                        programme || null,
                        faculty || null
                    ]
                );
                console.log(`✅ Student record created: ${roleId} for user ${userId}`);
            }
        } catch (roleError) {
            console.error(`❌ Error creating ${role} record:`, roleError);
            // Rollback user creation if role record fails
            await query('DELETE FROM users WHERE id = ?', [userId]);
            throw new Error(`Failed to create ${role} record: ${roleError.message}`);
        }

        // Create session if user is active (not pending)
        let session = null;
        if (status === 'active') {
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

        // Get user with role-specific data
        const userData = await getUserWithRoleData(userId, role);

        res.status(201).json({
            success: true,
            message: role === 'tutor' 
                ? 'Registration successful! Your account is pending admin approval.'
                : 'Registration successful!',
            user: userData,
            session
        });
    } catch (error) {
        console.error('Registration error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message || 'An error occurred during registration',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Login user (can use username or email)
router.post('/login', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!password || (!username && !email)) {
            return res.status(400).json({
                success: false,
                error: 'Username/email and password are required'
            });
        }

        // Find user by username or email
        const [users] = await query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username || email, email || username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid username/email or password'
            });
        }

        const user = users[0];

        // Verify password
        const hashedPassword = hashPassword(password);
        if (user.password !== hashedPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid username/email or password'
            });
        }

        // Check if account is active
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                error: user.status === 'pending' 
                    ? 'Your account is pending admin approval. Please wait for approval before logging in.'
                    : 'Your account is inactive. Please contact administrator.'
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

        // Get user with role-specific data
        const userData = await getUserWithRoleData(user.id, user.role);

        res.json({
            success: true,
            user: userData,
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

// Helper function to get user with role-specific data
async function getUserWithRoleData(userId, role) {
    const [users] = await query(
        'SELECT id, username, email, role, status, nophone, created_at FROM users WHERE id = ?',
        [userId]
    );

    if (users.length === 0) {
        return null;
    }

    const user = users[0];
    let roleData = {};

    if (role === 'admin') {
        const [admins] = await query(
            'SELECT adminId, name FROM admin WHERE user_id = ?',
            [userId]
        );
        if (admins.length > 0) {
            roleData = {
                adminId: admins[0].adminId,
                name: admins[0].name
            };
        }
    } else if (role === 'tutor') {
        const [tutors] = await query(
            'SELECT tutorId, name, availability, yearsOfExperience, verification_documents FROM tutor WHERE user_id = ?',
            [userId]
        );
        if (tutors.length > 0) {
            roleData = {
                tutorId: tutors[0].tutorId,
                name: tutors[0].name,
                availability: tutors[0].availability,
                yearsOfExperience: tutors[0].yearsOfExperience,
                verificationDocuments: JSON.parse(tutors[0].verification_documents || '[]')
            };
        }
    } else if (role === 'student') {
        const [students] = await query(
            'SELECT studentId, yearOfStudy, programme, faculty FROM student WHERE user_id = ?',
            [userId]
        );
        if (students.length > 0) {
            roleData = {
                studentId: students[0].studentId,
                yearOfStudy: students[0].yearOfStudy,
                programme: students[0].programme,
                faculty: students[0].faculty
            };
        }
    }

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        nophone: user.nophone,
        ...roleData,
        createdAt: user.created_at
    };
}

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
            'SELECT id, username, email, role, status FROM users WHERE id = ?',
            [session.user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const user = users[0];
        const userData = await getUserWithRoleData(user.id, user.role);

        res.json({
            success: true,
            user: userData
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

// Approve tutor (admin only)
router.post('/approve-tutor', async (req, res) => {
    try {
        const { tutorId } = req.body;

        if (!tutorId) {
            return res.status(400).json({
                success: false,
                error: 'Tutor ID is required'
            });
        }

        // Find the tutor user by tutorId
        const [tutors] = await query(
            'SELECT user_id FROM tutor WHERE tutorId = ?',
            [tutorId]
        );

        if (tutors.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Tutor not found'
            });
        }

        const userId = tutors[0].user_id;

        // Update user status to 'active'
        await query(
            'UPDATE users SET status = ? WHERE id = ?',
            ['active', userId]
        );

        // Get updated user with role data
        const userData = await getUserWithRoleData(userId, 'tutor');

        res.json({
            success: true,
            message: 'Tutor approved successfully',
            user: userData
        });
    } catch (error) {
        console.error('Approve tutor error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'An error occurred during approval'
        });
    }
});

// Get pending tutors
router.get('/pending-tutors', async (req, res) => {
    try {
        const [users] = await query(
            'SELECT * FROM users WHERE role = ? AND status = ?',
            ['tutor', 'pending']
        );

        // Get full data for each pending tutor
        const tutors = await Promise.all(
            users.map(user => getUserWithRoleData(user.id, 'tutor'))
        );

        res.json({
            success: true,
            tutors: tutors.filter(t => t !== null)
        });
    } catch (error) {
        console.error('Get pending tutors error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'An error occurred'
        });
    }
});

// Reject tutor (admin only)
router.post('/reject-tutor', async (req, res) => {
    try {
        const { tutorId } = req.body;

        if (!tutorId) {
            return res.status(400).json({
                success: false,
                error: 'Tutor ID is required'
            });
        }

        // Find the tutor user by tutorId
        const [tutors] = await query(
            'SELECT user_id FROM tutor WHERE tutorId = ?',
            [tutorId]
        );

        if (tutors.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Tutor not found'
            });
        }

        const userId = tutors[0].user_id;

        // Delete the user account (rejection)
        await query('DELETE FROM tutor WHERE user_id = ?', [userId]);
        await query('DELETE FROM users WHERE id = ?', [userId]);

        res.json({
            success: true,
            message: 'Tutor registration rejected'
        });
    } catch (error) {
        console.error('Reject tutor error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'An error occurred during rejection'
        });
    }
});

module.exports = router;
