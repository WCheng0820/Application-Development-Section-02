// scripts/test-student-registration.js
// Test script to verify student registration works
const mysql = require('mysql2/promise');
const crypto = require('crypto');

const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

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

const testStudentRegistration = async () => {
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

        // Test data
        const username = 'teststudent';
        const email = 'teststudent@example.com';
        const password = 'test123';
        const role = 'student';
        const nophone = '1234567890';
        const fullName = 'Test Student';
        const yearOfStudy = 2;
        const programme = 'Computer Science';
        const faculty = 'Engineering';

        // Check if user already exists
        const [existing] = await connection.query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existing.length > 0) {
            console.log('⚠️  Test user already exists. Deleting...');
            const userId = existing[0].id;
            await connection.query('DELETE FROM student WHERE user_id = ?', [userId]);
            await connection.query('DELETE FROM users WHERE id = ?', [userId]);
            console.log('✅ Old test user deleted\n');
        }

        // Hash password
        const hashedPassword = hashPassword(password);
        const status = 'active';

        console.log('📝 Testing student registration...\n');

        // Insert user
        const [userResult] = await connection.query(
            `INSERT INTO users (username, email, password, role, status, nophone) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [username, email, hashedPassword, role, status, nophone]
        );

        const userId = userResult.insertId;
        const studentId = generateRoleId(role, userId);

        console.log(`✅ User created with ID: ${userId}`);
        console.log(`✅ Generated Student ID: ${studentId}\n`);

        // Insert student record
        const [studentResult] = await connection.query(
            `INSERT INTO student (studentId, user_id, yearOfStudy, programme, faculty) 
             VALUES (?, ?, ?, ?, ?)`,
            [studentId, userId, yearOfStudy, programme, faculty]
        );

        console.log('✅ Student record created successfully!\n');

        // Verify the data
        const [students] = await connection.query(
            `SELECT s.*, u.username, u.email, u.role, u.status, u.nophone 
             FROM student s 
             JOIN users u ON s.user_id = u.id 
             WHERE s.studentId = ?`,
            [studentId]
        );

        if (students.length > 0) {
            console.log('📊 Student Data in Database:');
            console.log('   Student ID:', students[0].studentId);
            console.log('   User ID:', students[0].user_id);
            console.log('   Username:', students[0].username);
            console.log('   Email:', students[0].email);
            console.log('   Year of Study:', students[0].yearOfStudy);
            console.log('   Programme:', students[0].programme);
            console.log('   Faculty:', students[0].faculty);
            console.log('   Phone:', students[0].nophone);
            console.log('   Status:', students[0].status);
            console.log('\n✅ Student registration test PASSED!');
        } else {
            console.log('❌ Student record not found after insertion!');
        }

    } catch (error) {
        console.error('❌ Error testing student registration:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

testStudentRegistration();

