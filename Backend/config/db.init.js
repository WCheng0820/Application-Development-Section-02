// config/db.init.js
// Database initialization script - creates tables if they don't exist
const mysql = require('mysql2/promise');

const initDatabase = async () => {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    };

    let connection;
    try {
        // Connect without specifying database first
        connection = await mysql.createConnection(config);
        console.log('Connected to MySQL server');

        // Create database if it doesn't exist
        const dbName = process.env.DB_NAME || 'mlt_system';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`✅ Database "${dbName}" ready`);

        // Use the database
        await connection.query(`USE \`${dbName}\``);

        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('student', 'tutor', 'admin') NOT NULL DEFAULT 'student',
                is_approved BOOLEAN DEFAULT TRUE,
                approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                bio TEXT,
                verification_documents JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_role (role),
                INDEX idx_approval_status (approval_status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Users table created');

        // Create sessions table for session management
        await connection.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                token VARCHAR(500) UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_token (token),
                INDEX idx_user_id (user_id),
                INDEX idx_expires_at (expires_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Sessions table created');

        // Insert default admin user if not exists
        const [existingAdmin] = await connection.query(
            'SELECT id FROM users WHERE email = ?',
            ['admin@mltsystem.com']
        );

        if (existingAdmin.length === 0) {
            // Default password: admin123 (should be hashed in production)
            await connection.query(
                `INSERT INTO users (email, password, role, is_approved, approval_status, first_name, last_name, bio) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    'admin@mltsystem.com',
                    'admin123', // In production, use bcrypt hash
                    'admin',
                    true,
                    'approved',
                    'Admin',
                    'User',
                    'System administrator'
                ]
            );
            console.log('✅ Default admin user created (email: admin@mltsystem.com, password: admin123)');
        }

        console.log('✅ Database initialization completed successfully');
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

// Run initialization if this file is executed directly
if (require.main === module) {
    initDatabase()
        .then(() => {
            console.log('Database setup complete!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Database setup failed:', error);
            process.exit(1);
        });
}

module.exports = initDatabase;

