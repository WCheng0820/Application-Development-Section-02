const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

// Import database models
const TutorModelDB = require('./TutorModelDB');
const BookingModelDB = require('./BookingModelDB');

const app = express();
app.use(cors());
app.use(express.json());

// Create MySQL connection pool
const db = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mlts'
});

// Initialize models with database connection
TutorModelDB.setDatabase(db);
BookingModelDB.setDatabase(db);

// Test database connection and create tables if they don't exist
db.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Database access was denied.');
        }
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.log('Database does not exist, creating it...');
            createDatabaseAndTables();
        }
    } else {
        if (connection) connection.release();
        // Create tables even if database exists
        createTablesIfNotExist();
    }
    return;
});

// Function to create tables if they don't exist
const createTablesIfNotExist = () => {
    // Create tutors table
    const tutorsTable = `
        CREATE TABLE IF NOT EXISTS tutors (
            tutor_id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(20),
            languages JSON,
            experience_years INT,
            hourly_rate DECIMAL(10, 2),
            rating INT,
            availability JSON,
            bio TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;

    db.query(tutorsTable, (err) => {
        if (err) {
            console.error('Error creating tutors table:', err);
        } else {
            console.log('✓ Tutors table ready');
        }
    });

    // Create bookings table
    const bookingsTable = `
        CREATE TABLE IF NOT EXISTS bookings (
            booking_id INT AUTO_INCREMENT PRIMARY KEY,
            tutor_id VARCHAR(255) NOT NULL,
            student_name VARCHAR(255) NOT NULL,
            student_email VARCHAR(255) NOT NULL,
            booking_date DATE NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            subject VARCHAR(255),
            status ENUM('confirmed', 'pending', 'cancelled') DEFAULT 'pending',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (tutor_id) REFERENCES tutors(tutor_id) ON DELETE CASCADE
        )
    `;

    db.query(bookingsTable, (err) => {
        if (err) {
            console.error('Error creating bookings table:', err);
        } else {
            console.log('✓ Bookings table ready');
        }
    });
};

// Function to create database if it doesn't exist
const createDatabaseAndTables = () => {
    // Create initial connection without database to create database
    const initialDb = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: ''
    });

    initialDb.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            return;
        }
        
        // Create database if it doesn't exist
        initialDb.query('CREATE DATABASE IF NOT EXISTS mlts', (err) => {
            if (err) {
                console.error('Error creating database:', err);
                initialDb.end();
                return;
            }
            console.log('✓ Database "mlts" created');
            initialDb.end();
            
            // Now create tables
            setTimeout(() => {
                createTablesIfNotExist();
            }, 1000);
        });
    });
};

// Test endpoint - Server is working
app.get('/', (req, res) => {
    return res.json("Server is running!");
});

// Test database connection
app.get('/api/test-db', (req, res) => {
    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database connection failed',
                error: err.message
            });
        }
        
        connection.query('SELECT 1', (err, results) => {
            connection.release();
            
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Database query failed',
                    error: err.message
                });
            }
            
            return res.json({
                success: true,
                message: 'Database connection successful!',
                data: results
            });
        });
    });
});

// Get all tutors
app.get('/api/tutors', (req, res) => {
    TutorModelDB.getAllTutors((err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching tutors',
                error: err.message
            });
        }
        return res.json({
            success: true,
            data: results
        });
    });
});

// Get tutor by ID
app.get('/api/tutors/:id', (req, res) => {
    const tutorId = req.params.id;
    TutorModelDB.getTutorById(tutorId, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching tutor',
                error: err.message
            });
        }
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Tutor not found'
            });
        }
        return res.json({
            success: true,
            data: result
        });
    });
});

// Create new tutor
app.post('/api/tutors', (req, res) => {
    const tutorData = req.body;
    
    // Validate required fields
    if (!tutorData.tutor_id || !tutorData.name || !tutorData.email) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: tutor_id, name, email'
        });
    }

    TutorModelDB.addTutor(tutorData, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error adding tutor',
                error: err.message
            });
        }
        return res.status(201).json({
            success: true,
            message: 'Tutor added successfully',
            data: result
        });
    });
});

// Update tutor
app.put('/api/tutors/:id', (req, res) => {
    const tutorId = req.params.id;
    const tutorData = req.body;

    TutorModelDB.updateTutor(tutorId, tutorData, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error updating tutor',
                error: err.message
            });
        }
        return res.json({
            success: true,
            message: 'Tutor updated successfully',
            data: result
        });
    });
});

// Delete tutor
app.delete('/api/tutors/:id', (req, res) => {
    const tutorId = req.params.id;

    TutorModelDB.deleteTutor(tutorId, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error deleting tutor',
                error: err.message
            });
        }
        return res.json({
            success: true,
            message: 'Tutor deleted successfully',
            data: result
        });
    });
});

// Search tutors by keyword
app.get('/api/tutors/search/:keyword', (req, res) => {
    const keyword = req.params.keyword;
    TutorModelDB.searchTutors(keyword, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error searching tutors',
                error: err.message
            });
        }
        return res.json({
            success: true,
            data: results
        });
    });
});

// ====================
// BOOKINGS ROUTES
// ====================

// Get all bookings
app.get('/api/bookings', (req, res) => {
    BookingModelDB.getAllBookings((err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching bookings',
                error: err.message
            });
        }
        return res.json({
            success: true,
            data: results
        });
    });
});

// Get booking by ID
app.get('/api/bookings/:id', (req, res) => {
    const bookingId = req.params.id;
    BookingModelDB.getBookingById(bookingId, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching booking',
                error: err.message
            });
        }
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        return res.json({
            success: true,
            data: result
        });
    });
});

// Get bookings by tutor ID
app.get('/api/bookings/tutor/:tutorId', (req, res) => {
    const tutorId = req.params.tutorId;
    BookingModelDB.getBookingsByTutorId(tutorId, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching bookings',
                error: err.message
            });
        }
        return res.json({
            success: true,
            data: results
        });
    });
});

// Get bookings by student email
app.get('/api/bookings/student/:email', (req, res) => {
    const email = req.params.email;
    BookingModelDB.getBookingsByStudentEmail(email, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching bookings',
                error: err.message
            });
        }
        return res.json({
            success: true,
            data: results
        });
    });
});

// Create new booking
app.post('/api/bookings', (req, res) => {
    const bookingData = req.body;
    
    // Validate required fields
    if (!bookingData.tutor_id || !bookingData.student_name || !bookingData.student_email || 
        !bookingData.booking_date || !bookingData.start_time || !bookingData.end_time) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    BookingModelDB.addBooking(bookingData, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error creating booking',
                error: err.message
            });
        }
        return res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: result
        });
    });
});

// Update booking
app.put('/api/bookings/:id', (req, res) => {
    const bookingId = req.params.id;
    const bookingData = req.body;

    BookingModelDB.updateBooking(bookingId, bookingData, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error updating booking',
                error: err.message
            });
        }
        return res.json({
            success: true,
            message: 'Booking updated successfully',
            data: result
        });
    });
});

// Update booking status
app.patch('/api/bookings/:id/status', (req, res) => {
    const bookingId = req.params.id;
    const { status } = req.body;

    if (!status || !['confirmed', 'pending', 'cancelled'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be: confirmed, pending, or cancelled'
        });
    }

    BookingModelDB.updateBookingStatus(bookingId, status, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error updating booking status',
                error: err.message
            });
        }
        return res.json({
            success: true,
            message: 'Booking status updated successfully',
            data: result
        });
    });
});

// Delete booking
app.delete('/api/bookings/:id', (req, res) => {
    const bookingId = req.params.id;

    BookingModelDB.deleteBooking(bookingId, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error deleting booking',
                error: err.message
            });
        }
        return res.json({
            success: true,
            message: 'Booking deleted successfully',
            data: result
        });
    });
});

// Get bookings by status
app.get('/api/bookings/status/:status', (req, res) => {
    const status = req.params.status;
    BookingModelDB.getBookingsByStatus(status, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching bookings',
                error: err.message
            });
        }
        return res.json({
            success: true,
            data: results
        });
    });
});

// Add a test tutor (for testing purposes)
app.post('/api/tutors/test', (req, res) => {
    const testTutor = {
        tutor_id: 'tutor_test_' + Date.now(),
        name: 'Test Tutor',
        email: 'test_' + Date.now() + '@example.com',
        phone: '1234567890',
        languages: JSON.stringify(['English', 'Mandarin']),
        experience_years: 5,
        hourly_rate: 50.00,
        availability: JSON.stringify({ Monday: '9-5', Tuesday: '9-5' }),
        bio: 'This is a test tutor'
    };

    TutorModelDB.addTutor(testTutor, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error adding test tutor',
                error: err.message
            });
        }
        return res.json({
            success: true,
            message: 'Test tutor added successfully',
            data: result
        });
    });
});

app.listen(8081, () => {
    console.log("listening on port 8081");
});