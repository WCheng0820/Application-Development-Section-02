// scripts/fix-admin-password.js
// Script to fix admin password hashing
const mysql = require('mysql2/promise');
const crypto = require('crypto');

const fixAdminPassword = async () => {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'mlt_system'
    };

    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('✅ Connected to database\n');

        // Check if admin user exists
        const [users] = await connection.query(
            'SELECT id, email, password FROM users WHERE email = ?',
            ['admin@mltsystem.com']
        );

        if (users.length === 0) {
            console.log('⚠️  Admin user not found');
            return;
        }

        const admin = users[0];
        
        // Check if password is already hashed (SHA-256 produces 64 character hex string)
        const isHashed = /^[a-f0-9]{64}$/i.test(admin.password);

        if (isHashed) {
            console.log('✅ Admin password is already hashed correctly');
            return;
        }

        // Hash the password
        const hashedPassword = crypto.createHash('sha256').update('admin123').digest('hex');

        // Update admin password
        await connection.query(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, 'admin@mltsystem.com']
        );

        console.log('✅ Admin password has been hashed successfully');
        console.log('   Email: admin@mltsystem.com');
        console.log('   Password: admin123 (now hashed)');

    } catch (error) {
        console.error('❌ Error fixing admin password:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

fixAdminPassword();

