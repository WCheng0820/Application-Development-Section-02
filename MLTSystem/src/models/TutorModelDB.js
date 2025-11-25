// Database-connected Tutor Model
// This model handles all database operations for tutors

const mysql = require('mysql');

// Import the database connection from server
let db = null;

function setDatabase(database) {
    db = database;
}

// Get all tutors from database
function getAllTutors(callback) {
    const query = 'SELECT * FROM tutors';
    db.query(query, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
}

// Get tutor by ID
function getTutorById(tutorId, callback) {
    const query = 'SELECT * FROM tutors WHERE tutor_id = ?';
    db.query(query, [tutorId], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results[0]);
    });
}

// Add new tutor
function addTutor(tutorData, callback) {
    const query = 'INSERT INTO tutors SET ?';
    db.query(query, tutorData, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
}

// Update tutor
function updateTutor(tutorId, tutorData, callback) {
    const query = 'UPDATE tutors SET ? WHERE tutor_id = ?';
    db.query(query, [tutorData, tutorId], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
}

// Delete tutor
function deleteTutor(tutorId, callback) {
    const query = 'DELETE FROM tutors WHERE tutor_id = ?';
    db.query(query, [tutorId], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
}

// Filter tutors by criteria
function filterTutors(filters, callback) {
    let query = 'SELECT * FROM tutors WHERE 1=1';
    const params = [];

    if (filters.experience_years) {
        query += ' AND experience_years >= ?';
        params.push(filters.experience_years);
    }

    if (filters.hourly_rate) {
        query += ' AND hourly_rate <= ?';
        params.push(filters.hourly_rate);
    }

    if (filters.languages) {
        // For JSON search in languages
        query += ' AND JSON_CONTAINS(languages, JSON_QUOTE(?))';
        params.push(filters.languages);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
}

// Search tutors by name or bio
function searchTutors(keyword, callback) {
    const query = 'SELECT * FROM tutors WHERE name LIKE ? OR bio LIKE ?';
    const searchTerm = `%${keyword}%`;
    db.query(query, [searchTerm, searchTerm], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
}

module.exports = {
    setDatabase,
    getAllTutors,
    getTutorById,
    addTutor,
    updateTutor,
    deleteTutor,
    filterTutors,
    searchTutors
};
