const { query } = require('./config/database');

async function fixMissingTutorRecords() {
    try {
        console.log('Finding pending tutors without tutor records...');
        
        // Get all pending tutor users
        const pendingTutorUsers = await query(
            'SELECT id, username FROM users WHERE role = ? AND status = ?',
            ['tutor', 'pending']
        );

        console.log(`Found ${pendingTutorUsers.length} pending tutors`);

        for (const user of pendingTutorUsers) {
            // Check if tutor record exists
            const existingTutor = await query(
                'SELECT tutor_pk FROM tutor WHERE user_id = ?',
                [user.id]
            );

            if (existingTutor.length === 0) {
                // Create tutor record
                const tutorId = `t${String(user.id).padStart(6, '0')}`;
                await query(
                    'INSERT INTO tutor (tutorId, user_id, name) VALUES (?, ?, ?)',
                    [tutorId, user.id, user.username]
                );
                console.log(`✅ Created tutor record: ${tutorId} for user ${user.id}`);
            } else {
                console.log(`⏭️  Tutor record already exists for user ${user.id}`);
            }
        }

        console.log('✨ Done!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

fixMissingTutorRecords();
