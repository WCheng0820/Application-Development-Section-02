const express = require('express');
const cors = require('cors');
const { query } = require('./config/database');
const initDatabase = require('./config/db.init');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Store online users: { userId: socketId }
const onlineUsers = new Map();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Make io and onlineUsers available to routes
app.use((req, res, next) => {
    req.io = io;
    req.onlineUsers = onlineUsers;
    next();
});

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

try {
    const reportsRoutes = require('./routes/reports');
    app.use('/api/reports', reportsRoutes);
} catch (err) {
    console.warn('Could not load reports routes:', err.message);
}

// Add messages and notifications routes
try {
    const messagesRoutes = require('./routes/messages');
    app.use('/api/messages', messagesRoutes);
} catch (err) {
    console.warn('Could not load messages routes:', err.message);
}

// Socket.io events
io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Handle user coming online
    socket.on('user:online', (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log(`🟢 User online: ${userId}`);
        
        // Broadcast online status to all connected clients
        io.emit('user:status', {
            userId,
            status: 'online',
            onlineUsers: Array.from(onlineUsers.keys())
        });
    });

    // Handle join conversation room
    socket.on('conversation:join', (data) => {
        const { conversationId } = data;
        socket.join(`conversation:${conversationId}`);
        console.log(`📍 User joined conversation: ${conversationId}`);
    });

    // Handle leave conversation room
    socket.on('conversation:leave', (data) => {
        const { conversationId } = data;
        socket.leave(`conversation:${conversationId}`);
        console.log(`📍 User left conversation: ${conversationId}`);
    });

    // Handle typing indicator
    socket.on('typing:start', (data) => {
        const { conversationId, userId, userName } = data;
        socket.to(`conversation:${conversationId}`).emit('typing:active', {
            userId,
            userName,
            isTyping: true
        });
    });

    socket.on('typing:stop', (data) => {
        const { conversationId, userId, userName } = data;
        socket.to(`conversation:${conversationId}`).emit('typing:active', {
            userId,
            userName,
            isTyping: false
        });
    });

    // Handle message read receipt
    socket.on('message:read', (data) => {
        const { conversationId, messageId, userId } = data;
        socket.to(`conversation:${conversationId}`).emit('message:read', {
            messageId,
            userId,
            readAt: new Date().toISOString()
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        // Find and remove user from online users
        let disconnectedUserId = null;
        for (const [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                disconnectedUserId = userId;
                onlineUsers.delete(userId);
                break;
            }
        }
        
        if (disconnectedUserId) {
            console.log(`🔴 User offline: ${disconnectedUserId}`);
            io.emit('user:status', {
                userId: disconnectedUserId,
                status: 'offline',
                onlineUsers: Array.from(onlineUsers.keys())
            });
        } else {
            console.log(`❌ Unknown user disconnected: ${socket.id}`);
        }
    });
});

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

server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`🔌 WebSocket (Socket.io) available at ws://localhost:${PORT}`);
});

