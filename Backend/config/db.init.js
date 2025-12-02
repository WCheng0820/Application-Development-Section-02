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
                userId VARCHAR(255) UNIQUE,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                nophone VARCHAR(50),
                role ENUM('student', 'tutor', 'admin') NOT NULL DEFAULT 'student',
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_userId (userId),
                INDEX idx_username (username),
                INDEX idx_email (email),
                INDEX idx_role (role),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Users table created');

        // Create admin table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS admin (
                adminId VARCHAR(255) PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Admin table created');

        // Create tutor table with surrogate auto-increment and explicit tutorId (will be populated by application or seed script)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tutor (
                tutor_pk INT AUTO_INCREMENT PRIMARY KEY,
                tutorId VARCHAR(255) UNIQUE,
                user_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                availability VARCHAR(500),
                yearsOfExperience INT DEFAULT 0,
                verification_documents JSON,
                rating DECIMAL(3,2) DEFAULT 0,
                price DECIMAL(10,2) DEFAULT 0,
                bio TEXT,
                specialization VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Tutor table created');

        // Create student table with surrogate auto-increment and generated studentId
        await connection.query(`
            CREATE TABLE IF NOT EXISTS student (
                student_pk INT AUTO_INCREMENT PRIMARY KEY,
                studentId VARCHAR(255) UNIQUE,
                user_id INT NOT NULL,
                yearOfStudy INT DEFAULT 1,
                programme VARCHAR(255),
                faculty VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Student table created');

        // Create student table with surrogate auto-increment and explicit studentId
        // studentId will be populated by application or seed script

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

        // Create booking table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS booking (
                bookingId INT AUTO_INCREMENT PRIMARY KEY,
                tutorId VARCHAR(255) NOT NULL,
                studentId VARCHAR(255) NOT NULL,
                booking_date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                subject VARCHAR(255),
                status ENUM('confirmed','pending','cancelled') DEFAULT 'pending',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (tutorId) REFERENCES tutor(tutorId) ON DELETE CASCADE,
                INDEX idx_tutorId (tutorId),
                INDEX idx_studentId (studentId),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Booking table created');

        // Insert default admin user if not exists
        const [existingAdmin] = await connection.query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            ['admin@mltsystem.com', 'admin']
        );

        if (existingAdmin.length === 0) {
            // Hash password using SHA-256 (same as auth routes)
            const crypto = require('crypto');
            const hashedPassword = crypto.createHash('sha256').update('admin123').digest('hex');
            
            // Insert user
            const [userResult] = await connection.query(
                `INSERT INTO users (username, email, password, role, status, nophone) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    'admin',
                    'admin@mltsystem.com',
                    hashedPassword,
                    'admin',
                    'active',
                    null
                ]
            );

            const userId = userResult.insertId;
            const adminId = `ADM${String(userId).padStart(6, '0')}`;

            // Insert admin record
            await connection.query(
                `INSERT INTO admin (adminId, user_id, name) 
                 VALUES (?, ?, ?)`,
                [adminId, userId, 'System Administrator']
            );

            // Ensure the users table has the application-facing userId populated
            await connection.query(
                `UPDATE users SET userId = ? WHERE id = ?`,
                [adminId, userId]
            );

            console.log('✅ Default admin user created');
            console.log('   Username: admin');
            console.log('   Email: admin@mltsystem.com');
            console.log('   Password: admin123');
            console.log(`   Admin ID: ${adminId}`);
        } else {
            console.log('ℹ️  Admin user already exists');
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

