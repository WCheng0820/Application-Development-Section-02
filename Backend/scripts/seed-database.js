// scripts/seed-database.js

const { query } = require('../config/database');
const crypto = require('crypto');

const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

async function seed() {
    try {
        // ------------------------------
        // SAMPLE TUTORS
        // ------------------------------
        const tutors = [
            {
                name: 'Ms. Chen Wei',
                availability: JSON.stringify({ Monday: '9-17' }),
                yearsOfExperience: 5,
                verification_documents: JSON.stringify([]),
                rating: 4.8,
                price: 30.00,
                specialization: 'Conversational Mandarin',
                bio: 'I specialize in conversational Mandarin and help students build confidence in real-world communication. With 5 years of teaching experience, I make learning fun and engaging.',
                nophone: '012345678'
            },
            {
                name: 'Mr. Wang Ming',
                availability: JSON.stringify({ Tuesday: '9-17' }),
                yearsOfExperience: 8,
                verification_documents: JSON.stringify([]),
                rating: 4.9,
                price: 35.00,
                specialization: 'HSK preparation and Business Mandarin',
                bio: 'Experienced in teaching both HSK preparation and business Mandarin. I focus on grammar and pronunciation to help students achieve fluency.',
                nophone: '012345678'
            },
            {
                name: 'Ms. Liu Hong',
                availability: JSON.stringify({ Wednesday: '10-18' }),
                yearsOfExperience: 6,
                verification_documents: JSON.stringify([]),
                rating: 4.7,
                price: 28.00,
                specialization: 'Cultural Mandarin',
                bio: 'My teaching style blends language learning with cultural immersion for deeper understanding.',
                nophone: '012345678'
            }
        ];

        const tutorIds = [];

        // ------------------------------
        // INSERT TUTORS
        // ------------------------------
        for (const t of tutors) {
            try {
                const username = t.name.toLowerCase().replace(/\s+/g, '_');
                const email = `${username}@example.com`;
                const password = hashPassword('seeded');
                const role = 'tutor';
                const status = 'active';

                // Check existing user
                const existing = await query('SELECT id, userId FROM users WHERE username = ?', [username]);
                let userId;

                if (existing.length > 0) {
                    userId = existing[0].id;

                    // Assign missing userId
                    if (!existing[0].userId) {
                        const userIdStr = `t${String(userId).padStart(6, '0')}`;
                        await query('UPDATE users SET userId=? WHERE id=?', [userIdStr, userId]);
                        console.log('Updated tutor userId:', userIdStr);
                    }
                } else {
                    const res = await query(
                        `INSERT INTO users (username, email, password, role, status, nophone) VALUES (?, ?, ?, ?, ?, ?)`,
                        [username, email, password, role, status, t.nophone]
                    );

                    userId = res.insertId;

                    const userIdStr = `t${String(userId).padStart(6, '0')}`;
                    await query('UPDATE users SET userId=? WHERE id=?', [userIdStr, userId]);
                    console.log('Created tutor user:', userIdStr);
                }

                // Insert tutor if missing
                const tutorExists = await query('SELECT tutor_pk FROM tutor WHERE user_id=?', [userId]);

                if (tutorExists.length === 0) {
                    const tutorRes = await query(
                        `INSERT INTO tutor (user_id, name, availability, yearsOfExperience, verification_documents, rating, price, specialization, bio)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            userId,
                            t.name,
                            t.availability,
                            t.yearsOfExperience,
                            t.verification_documents,
                            t.rating,
                            t.price,
                            t.specialization,
                            t.bio
                        ]
                    );

                    const tutorPk = tutorRes.insertId;
                    const tutorId = `t${String(userId).padStart(6, '0')}`;
                    await query('UPDATE tutor SET tutorId=? WHERE tutor_pk=?', [tutorId, tutorPk]);

                    tutorIds.push(tutorId);
                    console.log('Inserted tutor record:', tutorId);
                } else {
                    const tutorId = `t${String(userId).padStart(6, '0')}`;
                    tutorIds.push(tutorId);
                    console.log('Tutor already exists:', tutorId);
                }

            } catch (err) {
                console.error('Tutor error:', err.message);
                throw err;
            }
        }

        // ------------------------------
        // SAMPLE BOOKINGS
        // ------------------------------
        const bookings = [
            {
                tutorIndex: 0,
                studentName: 'John Smith',
                studentEmail: 'john.smith@email.com',
                booking_date: '2025-11-28',
                start_time: '10:00:00',
                end_time: '11:00:00',
                subject: 'Conversation',
                status: 'confirmed',
                notes: 'First class'
            },
            {
                tutorIndex: 1,
                studentName: 'Sarah Johnson',
                studentEmail: 'sarah.j@email.com',
                booking_date: '2025-11-29',
                start_time: '14:00:00',
                end_time: '15:00:00',
                subject: 'HSK Prep',
                status: 'pending',
                notes: ''
            }
        ];

        // ------------------------------
        // INSERT BOOKINGS
        // ------------------------------
        for (const b of bookings) {
            try {
                const username = b.studentEmail.split('@')[0];

                // Insert student user if missing
                const existing = await query('SELECT id, userId FROM users WHERE username=?', [username]);
                let studentUserId;

                if (existing.length > 0) {
                    studentUserId = existing[0].id;

                    if (!existing[0].userId) {
                        const sid = `s${String(studentUserId).padStart(6, '0')}`;
                        await query('UPDATE users SET userId=? WHERE id=?', [sid, studentUserId]);
                    }
                } else {
                    const res = await query(
                        `INSERT INTO users (username, email, password, role, status, nophone)
                         VALUES (?, ?, ?, 'student', 'active', NULL)`,
                        [username, b.studentEmail, hashPassword('seeded')]
                    );

                    studentUserId = res.insertId;

                    const sid = `s${String(studentUserId).padStart(6, '0')}`;
                    await query('UPDATE users SET userId=? WHERE id=?', [sid, studentUserId]);
                }

                // Insert student record if missing
                const studentRow = await query('SELECT student_pk, studentId FROM student WHERE user_id=?', [studentUserId]);
                let studentId;

                if (studentRow.length === 0) {
                    const res = await query(
                        `INSERT INTO student (user_id, yearOfStudy, programme, faculty)
                         VALUES (?, 1, NULL, NULL)`,
                        [studentUserId]
                    );

                    studentId = `s${String(studentUserId).padStart(6, '0')}`;
                    await query('UPDATE student SET studentId=? WHERE student_pk=?', [studentId, res.insertId]);

                } else {
                    studentId = studentRow[0].studentId;
                    if (!studentId) {
                        studentId = `s${String(studentUserId).padStart(6, '0')}`;
                        await query('UPDATE student SET studentId=? WHERE user_id=?', [studentId, studentUserId]);
                    }
                }

                // Insert booking if missing
                const tutorId = tutorIds[b.tutorIndex];
                const bookingExists = await query(
                    `SELECT bookingId FROM booking WHERE tutorId=? AND studentId=? AND booking_date=?`,
                    [tutorId, studentId, b.booking_date]
                );

                if (bookingExists.length === 0) {
                    await query(
                        `INSERT INTO booking (tutorId, studentId, booking_date, start_time, end_time, subject, status, notes)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            tutorId,
                            studentId,
                            b.booking_date,
                            b.start_time,
                            b.end_time,
                            b.subject,
                            b.status,
                            b.notes
                        ]
                    );

                    console.log('Inserted booking for student:', studentId);

                } else {
                    console.log('Booking already exists:', studentId);
                }

            } catch (err) {
                console.error('Booking error:', err.message);
                throw err;
            }
        }

        console.log('✨ Seeding complete ✨');
        process.exit(0);

    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

if (require.main === module) seed();

module.exports = seed;
