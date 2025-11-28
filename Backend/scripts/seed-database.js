// scripts/seed-database.js

const { query } = require('../config/database');
const crypto = require('crypto');

const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

async function seed() {
    try {
        // ------------------------------
        // SAMPLE TUTORS (Pending)
        // ------------------------------
        const tutors = [
            {
                name: 'Ms. Chen Wei',
                availability: JSON.stringify({ Monday: '9-17' }),
                yearsOfExperience: 5,
                verification_documents: JSON.stringify([]),
                rating: 4.8,
                price: 30.0,
                specialization: 'Conversational Mandarin',
                bio: 'I specialize in conversational Mandarin and help students build confidence in real-world communication.',
                nophone: '012345678'
            },
            {
                name: 'Mr. Wang Ming',
                availability: JSON.stringify({ Tuesday: '9-17' }),
                yearsOfExperience: 8,
                verification_documents: JSON.stringify([]),
                rating: 4.9,
                price: 35.0,
                specialization: 'HSK preparation and Business Mandarin',
                bio: 'Experienced in teaching both HSK preparation and business Mandarin.',
                nophone: '012345678'
            },
            {
                name: 'Ms. Liu Hong',
                availability: JSON.stringify({ Wednesday: '10-18' }),
                yearsOfExperience: 6,
                verification_documents: JSON.stringify([]),
                rating: 4.7,
                price: 28.0,
                specialization: 'Cultural Mandarin',
                bio: 'My teaching style blends language learning with cultural immersion for deeper understanding.',
                nophone: '012345678'
            }
        ];

        // ------------------------------
        // INSERT TUTOR USERS (Pending)
        // ------------------------------
        for (const t of tutors) {
            try {
                const username = t.name.toLowerCase().replace(/\s+/g, '_');
                const email = `${username}@example.com`;
                const password = hashPassword('seeded');
                const role = 'tutor';
                const status = 'pending'; // all tutors start as pending

                // Check if user exists
                const existing = await query('SELECT id, userId FROM users WHERE username=?', [username]);
                let userId;

                if (existing.length > 0) {
                    userId = existing[0].id;

                    if (!existing[0].userId) {
                        const userIdStr = `t${String(userId).padStart(6, '0')}`;
                        await query('UPDATE users SET userId=? WHERE id=?', [userIdStr, userId]);
                        console.log('Updated tutor userId:', userIdStr);
                    } else {
                        console.log('Tutor user already exists:', existing[0].userId);
                    }
                } else {
                    const res = await query(
                        'INSERT INTO users (username, email, password, role, status, nophone) VALUES (?, ?, ?, ?, ?, ?)',
                        [username, email, password, role, status, t.nophone]
                    );

                    userId = res.insertId;
                    const userIdStr = `t${String(userId).padStart(6, '0')}`;
                    await query('UPDATE users SET userId=? WHERE id=?', [userIdStr, userId]);
                    console.log('Created tutor user (pending):', userIdStr);
                }

                // ✅ DO NOT insert into tutor table yet
                // Tutors will be added after admin approval

            } catch (err) {
                console.error('Tutor error:', err.message);
                throw err;
            }
        }

        //booking func not yet completed
        // ------------------------------
        // SAMPLE STUDENTS & BOOKINGS
        // ------------------------------
        // const bookings = [
        //     {
        //         tutorIndex: 0, // This will match the tutorIds list after approval
        //         studentName: 'John Smith',
        //         studentEmail: 'john.smith@email.com',
        //         booking_date: '2025-11-28',
        //         start_time: '10:00:00',
        //         end_time: '11:00:00',
        //         subject: 'Conversation',
        //         status: 'confirmed',
        //         notes: 'First class'
        //     },
        //     {
        //         tutorIndex: 1,
        //         studentName: 'Sarah Johnson',
        //         studentEmail: 'sarah.j@email.com',
        //         booking_date: '2025-11-29',
        //         start_time: '14:00:00',
        //         end_time: '15:00:00',
        //         subject: 'HSK Prep',
        //         status: 'pending',
        //         notes: ''
        //     }
        // ];

        // for (const b of bookings) {
        //     try {
        //         const username = b.studentEmail.split('@')[0];

        //         // Insert student user if missing
        //         const existing = await query('SELECT id, userId FROM users WHERE username=?', [username]);
        //         let studentUserId;

        //         if (existing.length > 0) {
        //             studentUserId = existing[0].id;

        //             if (!existing[0].userId) {
        //                 const sid = `s${String(studentUserId).padStart(6, '0')}`;
        //                 await query('UPDATE users SET userId=? WHERE id=?', [sid, studentUserId]);
        //             }
        //         } else {
        //             const res = await query(
        //                 'INSERT INTO users (username, email, password, role, status, nophone) VALUES (?, ?, ?, "student", "active", NULL)',
        //                 [username, b.studentEmail, hashPassword('seeded')]
        //             );

        //             studentUserId = res.insertId;
        //             const sid = `s${String(studentUserId).padStart(6, '0')}`;
        //             await query('UPDATE users SET userId=? WHERE id=?', [sid, studentUserId]);
        //         }

        //         // Insert student record if missing
        //         const studentRow = await query('SELECT student_pk, studentId FROM student WHERE user_id=?', [studentUserId]);
        //         let studentId;

        //         if (studentRow.length === 0) {
        //             const res = await query(
        //                 'INSERT INTO student (user_id, yearOfStudy, programme, faculty) VALUES (?, 1, NULL, NULL)',
        //                 [studentUserId]
        //             );
        //             studentId = `s${String(studentUserId).padStart(6, '0')}`;
        //             await query('UPDATE student SET studentId=? WHERE student_pk=?', [studentId, res.insertId]);
        //         } else {
        //             studentId = studentRow[0].studentId;
        //             if (!studentId) {
        //                 studentId = `s${String(studentUserId).padStart(6, '0')}`;
        //                 await query('UPDATE student SET studentId=? WHERE user_id=?', [studentId, studentUserId]);
        //             }
        //         }

        //         // ✅ Booking insertion depends on tutor approval
        //         // Here we can skip or insert a placeholder if needed
        //         console.log('Student ready for booking:', studentId);

        //     } catch (err) {
        //         console.error('Booking error:', err.message);
        //         throw err;
        //     }
        // }

        console.log('✨ Seeding complete. All tutors are pending. ✨');
        process.exit(0);

    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

if (require.main === module) seed();

module.exports = seed;
