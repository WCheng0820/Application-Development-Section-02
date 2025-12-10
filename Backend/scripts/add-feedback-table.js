const { query, pool } = require('../config/database');

const addFeedbackTable = async () => {
    try {
        console.log('Creating feedback table...');
        await query(`
            CREATE TABLE IF NOT EXISTS feedback (
                id INT AUTO_INCREMENT PRIMARY KEY,
                bookingId INT NOT NULL,
                studentId VARCHAR(255) NOT NULL,
                tutorId VARCHAR(255) NOT NULL,
                rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (bookingId) REFERENCES booking(bookingId) ON DELETE CASCADE,
                FOREIGN KEY (studentId) REFERENCES student(studentId) ON DELETE CASCADE,
                FOREIGN KEY (tutorId) REFERENCES tutor(tutorId) ON DELETE CASCADE,
                UNIQUE KEY unique_booking_feedback (bookingId)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Feedback table created successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating feedback table:', err);
        process.exit(1);
    }
};

addFeedbackTable();
