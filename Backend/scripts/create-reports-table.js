const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' }); // Adjust path if needed

const createReportsTable = async () => {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'mlt_system',
        multipleStatements: true
    };

    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('Connected to MySQL server');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reporter_id VARCHAR(255) NOT NULL,
                reported_id VARCHAR(255),
                target_type ENUM('message', 'booking', 'review', 'profile', 'other') NOT NULL,
                target_id VARCHAR(255),
                category ENUM('harassment', 'spam', 'payment_issue', 'other') NOT NULL,
                description TEXT NOT NULL,
                evidence_url TEXT,
                status ENUM('pending', 'reviewed', 'resolved', 'rejected') DEFAULT 'pending',
                admin_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_reporter (reporter_id),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Reports table created');

    } catch (error) {
        console.error('❌ Error creating reports table:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

createReportsTable();
