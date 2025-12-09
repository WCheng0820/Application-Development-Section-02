const { pool } = require('../config/database');

async function verifySeedFeedback() {
    const conn = await pool.getConnection();
    try {
        console.log('\n📊 Seeded Feedback Verification\n');
        console.log('='.repeat(60));

        const [feedback] = await conn.query(
            'SELECT id, bookingId, rating, comment, is_anonymous FROM feedback ORDER BY id'
        );

        if (feedback.length === 0) {
            console.log('⚠️  No feedback records found');
        } else {
            console.log(`✅ Found ${feedback.length} feedback record(s)\n`);
            
            feedback.forEach((f, idx) => {
                const anonymousStatus = f.is_anonymous === 1 ? '🔒 Anonymous' : '👤 Non-anonymous';
                console.log(`${idx + 1}. Booking ${f.bookingId}: ${f.rating}⭐ - ${anonymousStatus}`);
                console.log(`   Comment: "${f.comment}"`);
                console.log(`   is_anonymous: ${f.is_anonymous}`);
                console.log();
            });
        }

        console.log('='.repeat(60));
        console.log('\n✅ Seed verification complete!\n');
        
    } catch (error) {
        console.error('❌ Error verifying feedback:', error.message);
    } finally {
        conn.release();
        process.exit(0);
    }
}

verifySeedFeedback();
