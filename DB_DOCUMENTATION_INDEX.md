# 📚 MLT System Documentation Index

**Platform:** Mandarin Learning & Tutoring System
**Last Updated:** December 10, 2025

## 📂 Documentation Files

### 1. **DATABASE_SCHEMA.md** (Comprehensive)
📖 **Size:** 30+ KB | **Tables:** 11 | **Level:** Expert

Complete database documentation with:
- All 11 tables with full attribute descriptions
- Data types, constraints, and validation rules
- Relationships and foreign keys
- Business logic and workflows
- Entity relationship diagrams
- State machines (booking, schedule, user)
- Performance optimization notes
- SQL query examples
- Data integrity rules
- Troubleshooting guide

**Best for:** Backend developers, database architects, system design

---

### 2. **DATABASE_SCHEMA_SUMMARY.md** (Quick Reference)
📖 **Size:** 10+ KB | **Tables:** 11 | **Level:** Intermediate

Quick-access summary including:
- Table inventory with counts
- Key attributes per table
- Unique constraints
- State machines (visual)
- Expected data volumes
- Common SQL patterns
- Maintenance tasks
- Links to comprehensive docs

**Best for:** Quick lookups, onboarding, planning

---

### 3. **BOOKING_SUBSYSTEM.md** (Project Overview)
📖 **Size:** 5+ KB | **Modules:** 4 Sprints | **Level:** Beginner

Booking subsystem architecture with:
- Sprint-by-sprint breakdown
- Module dependencies
- Frontend components
- Backend routes
- Database tables per module
- Cross-module dependencies
- API endpoints
- Deployment notes

**Best for:** Project planning, understanding data flow, sprint organization

---

## 🗂️ Current Schema (11 Tables)

### User Management (5 tables)
- **users** - Core authentication
- **admin** - Admin accounts
- **tutor** - Tutor profiles & ratings
- **student** - Student profiles
- **sessions** - Active sessions

### Booking & Scheduling (3 tables)
- **tutor_schedule** - Availability slots
- **booking** - Confirmed bookings
- **feedback** - Student reviews

### Communication (2 tables)
- **message** - Direct messaging
- **notification** - In-app alerts

### Moderation (1 table)
- **reports** - Incident reporting

---

## 📊 Data Flows

### Student Booking Flow
1. Student registers → **users** + **student** created
2. Searches tutors → Query **tutor** table
3. Views availability → **tutor_schedule** (status='free')
4. Selects slot → **tutor_schedule** (status='reserved')
5. Completes payment → **booking** created (status='pending')
6. After session → **feedback** submitted
7. Tutor rating updated automatically

### Admin Workflow
1. Admin logs in → **users** + **admin** record
2. Reviews new tutors → **users** (status='pending')
3. Approves/rejects → Users status updated
4. Monitors reports → **reports** table
5. Takes action → Sends **notification**

### Communication Flow
1. Send message → **message** created
2. Message delivery → **notification** created
3. Recipient marks read → **notification** (is_read=true)
4. Cleanup → Old notifications archived

---

## 🔄 Key Relationships

`
users (root)
├── admin (1:1)
├── tutor (1:1)
│   ├── tutor_schedule (1:N)
│   ├── booking (1:N)
│   └── feedback (1:N)
├── student (1:1)
│   ├── booking (1:N)
│   └── feedback (1:N)
└── sessions (1:N)

booking (central)
├── feedback (1:1 optional)
├── message (1:N)
└── notification (1:N)
`

---

## 📋 File Structure

`
Application-Development-Section-02/
├── DATABASE_SCHEMA.md                 ← COMPREHENSIVE (start here)
├── DATABASE_SCHEMA_SUMMARY.md         ← QUICK REFERENCE
├── BOOKING_SUBSYSTEM.md               ← PROJECT OVERVIEW
├── Backend/
│   ├── config/
│   │   ├── database.js                ← Connection pool
│   │   └── db.init.js                 ← Schema creation
│   ├── app/
│   │   ├── controllers/
│   │   │   ├── AuthController.js
│   │   │   ├── BookingsController.js
│   │   │   ├── TutorsController.js
│   │   │   └── ScheduleController.js
│   │   ├── routes/
│   │   └── middlewares/
│   │       └── auth.js
│   ├── routes/                        ← Legacy routes
│   └── scripts/                       ← Database utilities
│
└── MLTSystem/
    └── src/
        ├── context/
        │   └── AuthContext.jsx        ← Frontend session mgmt
        ├── controllers/               ← API calls
        ├── pages/
        │   ├── FindTutors.jsx
        │   ├── Bookings.jsx
        │   └── Payment.jsx
        └── models/
            └── User.js
`

---

## 🚀 Quick Start - Database Setup

### 1. Review Schema
`ash
# Read comprehensive documentation
cat DATABASE_SCHEMA.md
`

### 2. Initialize Database
`ash
cd Backend
npm install
node config/db.init.js
`

### 3. Verify Tables
`ash
mysql -u root mlt_system -e "SHOW TABLES;"
`

### 4. Check Sample Data
`ash
mysql -u root mlt_system -e "SELECT COUNT(*) as total FROM users;"
`

---

## 💡 When to Use Each Document

| Scenario | Use This Document |
|----------|------------------|
| "I need to understand the full database" | DATABASE_SCHEMA.md |
| "I need to quickly find a table's attributes" | DATABASE_SCHEMA_SUMMARY.md |
| "I'm working on booking feature" | BOOKING_SUBSYSTEM.md |
| "I need to add a new table" | DATABASE_SCHEMA.md (Attributes section) |
| "I need to optimize a query" | DATABASE_SCHEMA.md (Indexes & Performance) |
| "I'm onboarding and need overview" | DATABASE_SCHEMA_SUMMARY.md |
| "I need to understand data flow" | BOOKING_SUBSYSTEM.md |

---

## ✨ Key Features

### Session Management
- 24-hour sessions with token validation
- sessionStorage for frontend persistence
- Backend session cleanup

### Booking State Machine
- 3-state schedule (free → reserved → booked)
- 4-state booking lifecycle (pending → confirmed → completed/cancelled)
- Automatic cleanup of abandoned carts

### Rating System
- Per-booking ratings (1-5 stars)
- Anonymous feedback option
- Automatic tutor rating calculation
- Rating count tracking

### Real-time Features
- Socket.IO notifications
- Message delivery tracking
- Unread notification management

### Admin Capabilities
- Tutor approval workflow
- Report investigation
- User management

---

## 🔐 Important Security Notes

1. **Always hash passwords** - SHA-256 on backend only
2. **Validate session tokens** - Check expiry on each request
3. **Enforce role checks** - Backend must validate permissions
4. **Use prepared statements** - Prevent SQL injection
5. **Encrypt sensitive data** - PII, tokens, credentials
6. **Regular backups** - Database contains critical data
7. **Clean expired sessions** - Daily maintenance task

---

## 📞 Support & Questions

### Common Issues
- **"studentId not found"** → Check if student record created (look in student table)
- **"Session expires too quickly"** → Verify expires_at calculation (should be +24h)
- **"Booking fails"** → Check tutor_schedule status before creating booking
- **"Notifications not working"** → Check Socket.IO connection & notification table

### Debugging
1. Check database: SELECT * FROM [table] LIMIT 10;
2. Review logs: Backend/server.js console output
3. Validate schema: 
ode Backend/verify-schema.js
4. Check constraints: Foreign keys, unique, check constraints

---

## 📈 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-10 | Complete schema documentation (11 tables) |

---

**Need Help?** Start with DATABASE_SCHEMA_SUMMARY.md for quick answers, then dive into DATABASE_SCHEMA.md for detailed information.
