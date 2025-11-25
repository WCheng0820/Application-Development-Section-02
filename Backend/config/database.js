// config/database.js
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mlt_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Connected to MySQL database successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Error connecting to MySQL database:', err.message);
        console.error('Please make sure:');
        console.error('1. MySQL server is running');
        console.error('2. Database "mlt_system" exists');
        console.error('3. User credentials are correct');
    });

// Helper function to execute queries
const query = async (sql, params) => {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

module.exports = {
    query
};

