// scripts/check-db.js
// Script to check database contents
const mysql = require('mysql2/promise');

const checkDatabase = async () => {
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

        // Check tables
        const [tables] = await connection.query('SHOW TABLES');
        console.log('📊 Tables in database:');
        tables.forEach(table => {
            console.log(`   - ${Object.values(table)[0]}`);
        });
        console.log('');

        // Check users count
        const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
        console.log(`👥 Total users: ${userCount[0].count}`);

        // List all users (without passwords)
        const [users] = await connection.query(
            'SELECT id, username, email, role, status, nophone, created_at FROM users'
        );
        
        if (users.length > 0) {
            console.log('\n📋 Users in database:');
            for (const user of users) {
                console.log(`   ID: ${user.id}`);
                console.log(`   Username: ${user.username}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Status: ${user.status}`);
                console.log(`   Phone: ${user.nophone || 'N/A'}`);
                
                // Get role-specific data
                if (user.role === 'admin') {
                    const [admins] = await connection.query(
                        'SELECT adminId, name FROM admin WHERE user_id = ?',
                        [user.id]
                    );
                    if (admins.length > 0) {
                        console.log(`   Admin ID: ${admins[0].adminId}`);
                        console.log(`   Name: ${admins[0].name}`);
                    }
                } else if (user.role === 'tutor') {
                    const [tutors] = await connection.query(
                        'SELECT tutorId, name, yearsOfExperience FROM tutor WHERE user_id = ?',
                        [user.id]
                    );
                    if (tutors.length > 0) {
                        console.log(`   Tutor ID: ${tutors[0].tutorId}`);
                        console.log(`   Name: ${tutors[0].name}`);
                        console.log(`   Experience: ${tutors[0].yearsOfExperience} years`);
                    }
                } else if (user.role === 'student') {
                    const [students] = await connection.query(
                        'SELECT studentId, yearOfStudy, programme, faculty FROM student WHERE user_id = ?',
                        [user.id]
                    );
                    if (students.length > 0) {
                        console.log(`   Student ID: ${students[0].studentId}`);
                        console.log(`   Year: ${students[0].yearOfStudy}`);
                        console.log(`   Programme: ${students[0].programme || 'N/A'}`);
                        console.log(`   Faculty: ${students[0].faculty || 'N/A'}`);
                    }
                }
                
                console.log(`   Created: ${user.created_at}`);
                console.log('');
            }
        } else {
            console.log('⚠️  No users found in database');
        }

        // Check sessions count
        const [sessionCount] = await connection.query('SELECT COUNT(*) as count FROM sessions');
        console.log(`🔐 Active sessions: ${sessionCount[0].count}`);

    } catch (error) {
        console.error('❌ Error checking database:', error.message);
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('   Database does not exist. Run: npm run init-db');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('   Cannot connect to MySQL server. Make sure MySQL is running.');
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

checkDatabase();

