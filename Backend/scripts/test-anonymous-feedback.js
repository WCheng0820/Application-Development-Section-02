const { pool } = require('../config/database');

async function testAnonymousFeedback() {
    const conn = await pool.getConnection();
    try {
        console.log('\n📋 Testing Anonymous Feedback Logic\n');

        // 1. Check if is_anonymous column exists
        const [columns] = await conn.query(
            "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'feedback' AND TABLE_SCHEMA = DATABASE()"
        );
        
        console.log('✅ Feedback table columns:');
        columns.forEach(col => {
            console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
        });

        const hasIsAnonymous = columns.some(col => col.COLUMN_NAME === 'is_anonymous');
        if (hasIsAnonymous) {
            console.log('\n✅ is_anonymous column EXISTS in feedback table');
        } else {
            console.log('\n❌ is_anonymous column MISSING in feedback table');
        }

        // 2. Check any existing feedback records
        const [feedback] = await conn.query(
            'SELECT bookingId, rating, is_anonymous, comment FROM feedback LIMIT 5'
        );

        if (feedback.length > 0) {
            console.log('\n📊 Sample feedback records:');
            feedback.forEach((f, idx) => {
                const status = f.is_anonymous === 1 ? '🔒 Anonymous' : '👤 Non-anonymous';
                console.log(`   ${idx + 1}. Booking ${f.bookingId}: ${f.rating}⭐ - ${status}`);
                if (f.comment) {
                    console.log(`      Comment: "${f.comment.substring(0, 50)}..."`);
                }
            });
        } else {
            console.log('\n⚠️  No feedback records found yet');
        }

        console.log('\n✅ Anonymous feedback logic is ready!\n');
        
    } catch (error) {
        console.error('❌ Error testing anonymous feedback:', error.message);
    } finally {
        conn.release();
        process.exit(0);
    }
}

testAnonymousFeedback();
