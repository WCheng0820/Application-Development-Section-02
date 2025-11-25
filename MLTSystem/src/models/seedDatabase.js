// Seed database with test data
// Run this file to populate the database with sample tutors and bookings

const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mlts'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
    console.log('Connected to database');
    seedDatabase();
});

function seedDatabase() {
    // Sample tutors data
    const tutors = [
        {
            tutor_id: 'T001',
            name: 'Ms. Chen Wei',
            email: 'chen.wei@tutors.com',
            phone: '+86-10-1234-5678',
            languages: JSON.stringify(['Mandarin', 'English']),
            experience_years: 5,
            hourly_rate: 30.00,
            availability: JSON.stringify({ Monday: '9:00-17:00', Wednesday: '10:00-16:00', Friday: '14:00-20:00' }),
            bio: 'Expert Mandarin conversation teacher with 5 years of teaching experience. Specializes in daily communication and cultural immersion. Native speaker from Beijing.'
        },
        {
            tutor_id: 'T002',
            name: 'Mr. Wang Ming',
            email: 'wang.ming@tutors.com',
            phone: '+86-10-2234-5678',
            languages: JSON.stringify(['Mandarin', 'English', 'Spanish']),
            experience_years: 8,
            hourly_rate: 35.00,
            availability: JSON.stringify({ Tuesday: '9:00-17:00', Thursday: '10:00-18:00', Saturday: '10:00-14:00' }),
            bio: 'Certified HSK exam specialist with 8 years of experience. Expert in HSK levels 1-6 preparation. Helped 200+ students achieve their target scores.'
        },
        {
            tutor_id: 'T003',
            name: 'Ms. Liu Hong',
            email: 'liu.hong@tutors.com',
            phone: '+86-10-3234-5678',
            languages: JSON.stringify(['Mandarin', 'English']),
            experience_years: 6,
            hourly_rate: 28.00,
            availability: JSON.stringify({ Monday: '14:00-20:00', Wednesday: '15:00-19:00', Saturday: '14:00-18:00' }),
            bio: 'Patient teacher specializing in absolute beginner Mandarin. Uses modern teaching methods and interactive learning. 6 years of one-on-one tutoring.'
        },
        {
            tutor_id: 'T004',
            name: 'Dr. Zhang Jun',
            email: 'zhang.jun@tutors.com',
            phone: '+86-10-4234-5678',
            languages: JSON.stringify(['Mandarin', 'English', 'German', 'French']),
            experience_years: 10,
            hourly_rate: 40.00,
            availability: JSON.stringify({ Tuesday: '14:00-20:00', Thursday: '15:00-21:00', Sunday: '10:00-16:00' }),
            bio: 'PhD-educated Mandarin specialist with 10 years of teaching experience. Expert in advanced pronunciation, business Mandarin, and classical Chinese texts.'
        },
        {
            tutor_id: 'T005',
            name: 'Ms. Xu Fang',
            email: 'xu.fang@tutors.com',
            phone: '+86-10-5234-5678',
            languages: JSON.stringify(['Mandarin', 'English']),
            experience_years: 3,
            hourly_rate: 22.00,
            availability: JSON.stringify({ Monday: '10:00-14:00', Friday: '16:00-20:00', Sunday: '14:00-18:00' }),
            bio: 'Enthusiastic Mandarin teacher with 3 years of experience. Specializes in conversational practice and cultural immersion for beginners. Native Shanghai accent.'
        },
        {
            tutor_id: 'T006',
            name: 'Mr. Guo Lei',
            email: 'guo.lei@tutors.com',
            phone: '+86-10-6234-5678',
            languages: JSON.stringify(['Mandarin', 'English', 'Cantonese']),
            experience_years: 7,
            hourly_rate: 32.00,
            availability: JSON.stringify({ Wednesday: '14:00-18:00', Friday: '17:00-21:00', Saturday: '11:00-15:00' }),
            bio: 'Business Mandarin specialist with 7 years of corporate training experience. Expert in business communication, negotiations, and professional writing.'
        }
    ];

    // Sample bookings data
    const bookings = [
        {
            tutor_id: 'T001',
            student_name: 'John Smith',
            student_email: 'john.smith@email.com',
            booking_date: '2025-11-26',
            start_time: '10:00:00',
            end_time: '11:00:00',
            subject: 'Mandarin Conversation',
            status: 'confirmed',
            notes: 'First lesson - focus on basic greetings'
        },
        {
            tutor_id: 'T002',
            student_name: 'Sarah Johnson',
            student_email: 'sarah.j@email.com',
            booking_date: '2025-11-27',
            start_time: '14:00:00',
            end_time: '15:00:00',
            subject: 'HSK Preparation',
            status: 'confirmed',
            notes: 'HSK 2 preparation - practice listening'
        },
        {
            tutor_id: 'T003',
            student_name: 'Michael Brown',
            student_email: 'michael.b@email.com',
            booking_date: '2025-11-28',
            start_time: '15:00:00',
            end_time: '16:00:00',
            subject: 'Beginner Mandarin',
            status: 'pending',
            notes: 'Complete beginner - no prior experience'
        },
        {
            tutor_id: 'T004',
            student_name: 'Emily Davis',
            student_email: 'emily.d@email.com',
            booking_date: '2025-11-29',
            start_time: '16:00:00',
            end_time: '17:30:00',
            subject: 'Advanced Mandarin',
            status: 'confirmed',
            notes: 'Focus on business terminology'
        },
        {
            tutor_id: 'T005',
            student_name: 'David Wilson',
            student_email: 'david.w@email.com',
            booking_date: '2025-11-30',
            start_time: '11:00:00',
            end_time: '12:00:00',
            subject: 'Conversation Practice',
            status: 'confirmed',
            notes: 'Intermediate level - practice real-world scenarios'
        },
        {
            tutor_id: 'T006',
            student_name: 'Lisa Anderson',
            student_email: 'lisa.a@email.com',
            booking_date: '2025-12-01',
            start_time: '14:00:00',
            end_time: '15:30:00',
            subject: 'Business Mandarin',
            status: 'pending',
            notes: 'Corporate training - email writing and phone calls'
        },
        {
            tutor_id: 'T001',
            student_name: 'Robert Taylor',
            student_email: 'robert.t@email.com',
            booking_date: '2025-12-02',
            start_time: '09:00:00',
            end_time: '10:00:00',
            subject: 'Mandarin Conversation',
            status: 'cancelled',
            notes: 'Student requested rescheduling'
        },
        {
            tutor_id: 'T002',
            student_name: 'Jennifer Martinez',
            student_email: 'jennifer.m@email.com',
            booking_date: '2025-12-03',
            start_time: '15:00:00',
            end_time: '16:00:00',
            subject: 'HSK Preparation',
            status: 'confirmed',
            notes: 'Mock exam practice'
        }
    ];

    // Insert tutors
    console.log('\nInserting tutors...');
    let tutorCount = 0;
    
    tutors.forEach((tutor, index) => {
        const query = 'INSERT INTO tutors SET ?';
        db.query(query, tutor, (err) => {
            if (err) {
                console.error(`Error inserting tutor ${tutor.name}:`, err.message);
            } else {
                console.log(`✓ Inserted tutor: ${tutor.name}`);
                tutorCount++;
            }
            
            // After all tutors are inserted, insert bookings
            if (index === tutors.length - 1) {
                setTimeout(() => insertBookings(), 500);
            }
        });
    });

    function insertBookings() {
        console.log('\nInserting bookings...');
        let bookingCount = 0;

        bookings.forEach((booking, index) => {
            const query = 'INSERT INTO bookings SET ?';
            db.query(query, booking, (err) => {
                if (err) {
                    console.error(`Error inserting booking for ${booking.student_name}:`, err.message);
                } else {
                    console.log(`✓ Inserted booking: ${booking.student_name} with ${getTutorName(booking.tutor_id)}`);
                    bookingCount++;
                }
                
                // After all bookings are inserted, show summary
                if (index === bookings.length - 1) {
                    setTimeout(() => {
                        console.log('\n========================================');
                        console.log(`✓ Successfully inserted ${tutorCount} tutors`);
                        console.log(`✓ Successfully inserted ${bookingCount} bookings`);
                        console.log('========================================\n');
                        db.end();
                        process.exit(0);
                    }, 500);
                }
            });
        });
    }
}

function getTutorName(tutorId) {
    const tutorMap = {
        'T001': 'Ms. Chen Wei',
        'T002': 'Mr. Wang Ming',
        'T003': 'Ms. Liu Hong',
        'T004': 'Dr. Zhang Jun',
        'T005': 'Ms. Xu Fang',
        'T006': 'Mr. Guo Lei'
    };
    return tutorMap[tutorId] || tutorId;
}
