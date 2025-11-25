// Database-connected Booking Model
// This model handles all database operations for bookings

const mysql = require('mysql');

// Import the database connection from server
let db = null;

function setDatabase(database) {
    db = database;
}

// Get all bookings from database
function getAllBookings(callback) {
    const query = 'SELECT * FROM bookings';
    db.query(query, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
}

// Get booking by ID
function getBookingById(bookingId, callback) {
    const query = 'SELECT * FROM bookings WHERE booking_id = ?';
    db.query(query, [bookingId], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results[0]);
    });
}

// Get bookings by tutor ID
function getBookingsByTutorId(tutorId, callback) {
    const query = 'SELECT * FROM bookings WHERE tutor_id = ?';
    db.query(query, [tutorId], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
}

// Get bookings by student email
function getBookingsByStudentEmail(email, callback) {
    const query = 'SELECT * FROM bookings WHERE student_email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
}

// Add new booking
function addBooking(bookingData, callback) {
    const query = 'INSERT INTO bookings SET ?';
    db.query(query, bookingData, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
}

// Update booking
function updateBooking(bookingId, bookingData, callback) {
    const query = 'UPDATE bookings SET ? WHERE booking_id = ?';
    db.query(query, [bookingData, bookingId], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
}

// Delete booking
function deleteBooking(bookingId, callback) {
    const query = 'DELETE FROM bookings WHERE booking_id = ?';
    db.query(query, [bookingId], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
}

// Update booking status
function updateBookingStatus(bookingId, status, callback) {
    const query = 'UPDATE bookings SET status = ? WHERE booking_id = ?';
    db.query(query, [status, bookingId], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
}

// Get bookings by date range
function getBookingsByDateRange(startDate, endDate, callback) {
    const query = 'SELECT * FROM bookings WHERE booking_date BETWEEN ? AND ?';
    db.query(query, [startDate, endDate], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
}

// Get bookings by status
function getBookingsByStatus(status, callback) {
    const query = 'SELECT * FROM bookings WHERE status = ?';
    db.query(query, [status], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
}

module.exports = {
    setDatabase,
    getAllBookings,
    getBookingById,
    getBookingsByTutorId,
    getBookingsByStudentEmail,
    addBooking,
    updateBooking,
    deleteBooking,
    updateBookingStatus,
    getBookingsByDateRange,
    getBookingsByStatus
};
