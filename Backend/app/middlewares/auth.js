// app/middlewares/auth.js
const { query } = require('../../config/database');

// Middleware to verify token and attach user to request (required auth)
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        // Check session
        const sessions = await query(
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
        const users = await query(
            'SELECT id, username, email, role FROM users WHERE id = ?',
            [session.user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        req.user = users[0];
        next();
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Token verification failed'
        });
    }
};

// Middleware to optionally verify token (attach user if present, but don't require)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (token) {
            // Check session
            const sessions = await query(
                'SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()',
                [token]
            );

            if (sessions.length > 0) {
                const session = sessions[0];
                const users = await query(
                    'SELECT id, username, email, role FROM users WHERE id = ?',
                    [session.user_id]
                );

                if (users.length > 0) {
                    req.user = users[0];
                }
            }
        }
        next();
    } catch (err) {
        console.error('Optional auth error:', err);
        next(); // Continue even if optional auth fails
    }
};

module.exports = {
    verifyToken,
    optionalAuth
};
