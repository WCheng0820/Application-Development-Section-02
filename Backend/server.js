const express = require('express');
const cors = require('cors');
const { query } = require('./config/database');
const initDatabase = require('./config/db.init');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize database on server start
initDatabase()
    .then(() => {
        console.log('✅ Database ready');
    })
    .catch(err => {
        console.error('❌ Database initialization failed:', err);
        console.error('Server will continue but database operations may fail');
    });

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        await query('SELECT 1');
        res.json({ 
            status: 'ok', 
            message: 'Server and database are running',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Database connection failed',
            error: error.message 
        });
    }
});

// Import routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Add admin routes
try {
    const adminRoutes = require('./routes/admin');
    app.use('/api/admin', adminRoutes);
} catch (err) {
    console.warn('Could not load admin routes:', err.message);
}

// Add tutors and bookings routes
try {
    const tutorsRoutes = require('./routes/tutors');
    app.use('/api/tutors', tutorsRoutes);
} catch (err) {
    console.warn('Could not load tutors routes:', err.message);
}

try {
    const bookingsRoutes = require('./routes/bookings');
    app.use('/api/bookings', bookingsRoutes);
} catch (err) {
    console.warn('Could not load bookings routes:', err.message);
}

try {
    const scheduleRoutes = require('./routes/schedule');
    app.use('/api/schedule', scheduleRoutes);
} catch (err) {
    console.warn('Could not load schedule routes:', err.message);
}

// Add payments route (for handling cancellations / webhooks)
try {
    const paymentsRoutes = require('./routes/payments');
    app.use('/api/payments', paymentsRoutes);
} catch (err) {
    console.warn('Could not load payments routes:', err.message);
}

// Add messages and notifications routes
try {
    const messagesRoutes = require('./routes/messages');
    app.use('/api/messages', messagesRoutes);
} catch (err) {
    console.warn('Could not load messages routes:', err.message);
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

