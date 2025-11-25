// Backend/examples/dbExample.js
// Example demonstrating how to use the database connection and query helper

const express = require('express');
const router = express.Router();

const { query } = require('../config/database');

// Example: Get user by ID
router.get('/user/:id', async (req, res, next) => {
    const userId = req.params.id;

    try {
        const sql = 'SELECT * FROM users WHERE id = ?';
        const results = await query(sql, [userId]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(results[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        next(error);
    }
});

// Example: Create a new user
router.post('/user', async (req, res, next) => {
    const { username, email, password, role, nophone } = req.body;

    try {
        const sql = `
            INSERT INTO users (username, email, password, role, nophone)
            VALUES (?, ?, ?, ?, ?)
        `;

        const result = await query(sql, [username, email, password, role, nophone]);

        res.status(201).json({ message: 'User created', userId: result.insertId });
    } catch (error) {
        console.error('Error creating user:', error);
        next(error);
    }
});

module.exports = router;

/*
Instructions for usage:

1. Import this router in your Backend/server.js or appropriate route file:
    const exampleRoutes = require('./examples/dbExample');
    app.use('/api/example', exampleRoutes);

2. Use HTTP GET /api/example/user/:id to get user details by ID.

3. Use HTTP POST /api/example/user with JSON body to create a new user:
   {
     "username": "johndoe",
     "email": "john@example.com",
     "password": "hashedpassword",
     "role": "student",
     "nophone": "1234567890"
   }

4. All queries use async/await and the shared connection pool with proper error handling.

This pattern can be followed for other models/tables accordingly.
*/
