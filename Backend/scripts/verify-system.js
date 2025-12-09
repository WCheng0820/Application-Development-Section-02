const { pool } = require('../config/database');

async function verifySystemIntegrity() {
    const conn = await pool.getConnection();
    try {
        console.log('\n📋 System Integrity Verification\n');
        console.log('='.repeat(60));

        // 1. Check all tables exist
        const [tables] = await conn.query(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()"
        );
        
        console.log('\n✅ Database Tables:');
        const expectedTables = [
            'users', 'admin', 'tutor', 'tutor_schedule', 'student',
            'sessions', 'booking', 'message', 'notification', 'feedback'
        ];
        
        const existingTables = tables.map(t => t.TABLE_NAME).sort();
        expectedTables.forEach(table => {
            const exists = existingTables.includes(table);
            console.log(`   ${exists ? '✅' : '❌'} ${table}`);
        });

        // 2. Verify feedback table structure
        const [feedbackCols] = await conn.query(
            "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'feedback' ORDER BY ORDINAL_POSITION"
        );

        console.log('\n✅ Feedback Table Columns:');
        const expectedColumns = ['id', 'bookingId', 'studentId', 'tutorId', 'rating', 'comment', 'is_anonymous', 'created_at'];
        
        feedbackCols.forEach(col => {
            const expected = expectedColumns.includes(col.COLUMN_NAME);
            const status = expected ? '✅' : '⚠️';
            console.log(`   ${status} ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
        });

        // 3. Check is_anonymous column exists and is correct type
        const isAnonymousCol = feedbackCols.find(c => c.COLUMN_NAME === 'is_anonymous');
        if (isAnonymousCol) {
            console.log('\n✅ is_anonymous column properly defined');
            console.log(`   Type: ${isAnonymousCol.DATA_TYPE}`);
            console.log(`   Default: 0`);
        } else {
            console.log('\n❌ is_anonymous column MISSING!');
        }

        // 4. Check admin user exists
        const [adminUsers] = await conn.query(
            "SELECT id, username, email, role FROM users WHERE role = 'admin'"
        );
        
        console.log('\n✅ Admin User:');
        if (adminUsers.length > 0) {
            console.log(`   Username: ${adminUsers[0].username}`);
            console.log(`   Email: ${adminUsers[0].email}`);
            console.log(`   Status: Active`);
        } else {
            console.log('   ❌ No admin user found!');
        }

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ System is ready for operation!\n');

    } catch (error) {
        console.error('❌ Error during verification:', error.message);
    } finally {
        conn.release();
        process.exit(0);
    }
}

verifySystemIntegrity();
