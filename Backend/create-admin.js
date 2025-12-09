const { query } = require('./config/database');
const crypto = require('crypto');

async function createAdmin() {
    try {
        console.log('Creating admin user...');
        
        const username = 'admin';
        const email = 'admin@mltsystem.com';
        const password = crypto.createHash('sha256').update('admin123').digest('hex');
        const role = 'admin';
        const status = 'active';

        // Check if exists
        const existing = await query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
        
        if (existing.length > 0) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Insert user
        const result = await query(
            'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
            [username, email, password, role, status]
        );

        const userId = result.insertId;
        console.log('Admin user created with ID:', userId);

        // Update userId field
        const adminId = `a${String(userId).padStart(6, '0')}`;
        await query('UPDATE users SET userId = ? WHERE id = ?', [adminId, userId]);
        console.log('Admin userId set to:', adminId);

        // Create admin record
        await query(
            'INSERT INTO admin (adminId, user_id, name) VALUES (?, ?, ?)',
            [adminId, userId, 'Admin User']
        );
        console.log('Admin record created');
        
        console.log('✅ Admin user created successfully!');
        console.log('Email: admin@mltsystem.com');
        console.log('Password: admin123');
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

createAdmin();
