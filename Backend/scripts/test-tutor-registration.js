// scripts/test-tutor-registration.js
// Test script to verify tutor registration works
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

const testTutorRegistration = async () => {
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
        const username = 'testtutor';
        const email = 'testtutor@example.com';
        const password = 'test123';
        const role = 'tutor';
        const nophone = '9876543210';
        const fullName = 'Test Tutor';
        const yearsOfExperience = 5;
        const availability = 'Monday-Friday, 9am-5pm';
        const verificationDocuments = [
            {
                name: 'teaching_certificate.pdf',
                type: 'application/pdf',
                size: 102400,
                data: 'base64encodeddata...'
            }
        ];

        // Check if user already exists
        const [existing] = await connection.query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existing.length > 0) {
            console.log('⚠️  Test tutor already exists. Deleting...');
            const userId = existing[0].id;
            await connection.query('DELETE FROM tutor WHERE user_id = ?', [userId]);
            await connection.query('DELETE FROM users WHERE id = ?', [userId]);
            console.log('✅ Old test tutor deleted\n');
        }

        // Hash password
        const hashedPassword = hashPassword(password);
        const status = 'pending'; // Tutors need approval

        console.log('📝 Testing tutor registration...\n');

        // Insert user
        const [userResult] = await connection.query(
            `INSERT INTO users (username, email, password, role, status, nophone) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [username, email, hashedPassword, role, status, nophone]
        );

        const userId = userResult.insertId;
        const tutorId = generateRoleId(role, userId);

        console.log(`✅ User created with ID: ${userId}`);
        console.log(`✅ Generated Tutor ID: ${tutorId}\n`);

        // Insert tutor record
        const [tutorResult] = await connection.query(
            `INSERT INTO tutor (tutorId, user_id, name, availability, yearsOfExperience, verification_documents) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                tutorId,
                userId,
                fullName,
                availability,
                yearsOfExperience,
                JSON.stringify(verificationDocuments)
            ]
        );

        console.log('✅ Tutor record created successfully!\n');

        // Verify the data
        const [tutors] = await connection.query(
            `SELECT t.*, u.username, u.email, u.role, u.status, u.nophone 
             FROM tutor t 
             JOIN users u ON t.user_id = u.id 
             WHERE t.tutorId = ?`,
            [tutorId]
        );

        if (tutors.length > 0) {
            console.log('📊 Tutor Data in Database:');
            console.log('   Tutor ID:', tutors[0].tutorId);
            console.log('   User ID:', tutors[0].user_id);
            console.log('   Username:', tutors[0].username);
            console.log('   Email:', tutors[0].email);
            console.log('   Name:', tutors[0].name);
            console.log('   Years of Experience:', tutors[0].yearsOfExperience);
            console.log('   Availability:', tutors[0].availability);
            console.log('   Phone:', tutors[0].nophone);
            console.log('   Status:', tutors[0].status);
            
            const docs = JSON.parse(tutors[0].verification_documents || '[]');
            console.log('   Verification Documents:', docs.length, 'file(s)');
            docs.forEach((doc, idx) => {
                console.log(`      ${idx + 1}. ${doc.name} (${doc.type})`);
            });
            
            console.log('\n✅ Tutor registration test PASSED!');
        } else {
            console.log('❌ Tutor record not found after insertion!');
        }

    } catch (error) {
        console.error('❌ Error testing tutor registration:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

testTutorRegistration();

