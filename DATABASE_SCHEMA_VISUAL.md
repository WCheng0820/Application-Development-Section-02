# 🎯 Database Schema Visual Reference

## Table Structure Overview

### Core Database Layout

```
╔════════════════════════════════════════════════════════════════════════════╗
║                          USERS (Authentication Core)                        ║
╠════════════════════════════════════════════════════════════════════════════╣
║ id (PK) │ userId (UK) │ username (UK) │ email (UK) │ password              ║
║ role (student|tutor|admin) │ status │ created_at │ updated_at              ║
╚════════════════════════════════════════════════════════════════════════════╝
      ▼              ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│    ADMIN     │ │    TUTOR     │ │   STUDENT    │
├──────────────┤ ├──────────────┤ ├──────────────┤
│adminId (PK)  │ │tutorId (PK)  │ │studentId(PK) │
│user_id (FK)  │ │user_id (FK)  │ │user_id (FK)  │
│name          │ │name          │ │yearOfStudy   │
│created_at    │ │rating        │ │programme     │
│              │ │rating_count  │ │faculty       │
│              │ │price         │ │              │
│              │ │bio           │ │              │
│              │ │specialization│ │              │
└──────────────┘ └──────┬───────┘ └──────────────┘
                        │
                        ▼
            ╔═══════════════════════╗
            │ TUTOR_SCHEDULE        ║
            ╠═══════════════════════╣
            ║ schedule_id           ║
            ║ tutorId (FK)          ║
            ║ schedule_date         ║
            ║ start_time            ║
            ║ end_time              ║
            ║ status (free|reserved ║
            ║        |booked)       ║
            ║ reserved_by           ║
            ║ reserved_at           ║
            ║ booked_at             ║
            ╚═══════════════════════╝

                    BOOKING (Central)
        ╔═══════════════════════════════════╗
        ║ bookingId (PK)                    ║
        ║ tutorId (FK) → TUTOR              ║
        ║ studentId (FK) → STUDENT          ║
        ║ booking_date                      ║
        ║ start_time                        ║
        ║ end_time                          ║
        ║ subject                           ║
        ║ status (pending|confirmed|        ║
        ║        completed|cancelled)       ║
        ║ rating (nullable)                 ║
        ║ notes                             ║
        ╚═══════════════════════════════════╝
                ▼     ▼          ▼
        ┌────────┐  ┌─────────┐  ┌──────────────┐
        │FEEDBACK│  │ MESSAGE │  │NOTIFICATION  │
        ├────────┤  ├─────────┤  ├──────────────┤
        │id      │  │id       │  │id            │
        │booking │  │booking  │  │recipientId   │
        │StudentId  │senderId │  │senderId      │
        │tutorId │  │recipientId  │bookingId     │
        │rating  │  │content  │  │messageId     │
        │comment │  │attach*  │  │reportId      │
        │is_anon │  │status   │  │type          │
        │created │  │readBy   │  │is_read       │
        └────────┘  └─────────┘  └──────────────┘

╔════════════════════════════════╗     ╔═════════════════╗
║      SESSIONS (Auth)           ║     ║    REPORTS      ║
╠════════════════════════════════╣     ╠═════════════════╣
║ id                             ║     ║ id              ║
║ user_id (FK)                   ║     ║ reporter_id (FK)║
║ token (UK)                     ║     ║ reported_id     ║
║ expires_at                     ║     ║ target_type     ║
║ created_at                     ║     ║ category        ║
╚════════════════════════════════╝     ║ description     ║
                                       ║ status          ║
                                       ║ admin_notes     ║
                                       ║ resolved_at     ║
                                       ╚═════════════════╝
```

---

## 📊 Table Attributes At A Glance

### users (Authentication)
```
┌─ id            → Primary key, auto-increment
├─ userId        → UNIQUE, role-prefixed ("s000001", "t000001", "a000001")
├─ username      → UNIQUE, login identifier
├─ password      → SHA-256 hashed, never plaintext
├─ email         → UNIQUE, contact
├─ nophone       → Phone number (optional)
├─ role          → ENUM: student | tutor | admin
├─ status        → VARCHAR: active | pending | inactive | suspended
├─ created_at    → Account creation timestamp
└─ updated_at    → Last modification timestamp
```

### tutor (Profiles & Ratings)
```
┌─ tutor_pk              → Internal primary key
├─ tutorId               → UNIQUE, "t" + padded ID
├─ user_id              → FK to users.id
├─ name                 → Display name
├─ yearsOfExperience    → Integer years of experience
├─ verification_documents → JSON array of uploaded docs
├─ rating               → DECIMAL(3,2), avg of feedback ratings
├─ rating_count         → INT, count of feedback records
├─ price                → DECIMAL(10,2), hourly rate in MYR
├─ bio                  → TEXT, professional biography
├─ specialization       → VARCHAR, teaching focus
├─ created_at           → Profile creation date
└─ updated_at           → Profile update date
```

### student (Profile)
```
┌─ student_pk           → Internal primary key
├─ studentId            → UNIQUE, "s" + padded ID
├─ user_id             → FK to users.id
├─ yearOfStudy         → INT 1-4, academic level
├─ programme           → VARCHAR, degree programme
├─ faculty             → VARCHAR, faculty/department
├─ created_at          → Profile creation date
└─ updated_at          → Profile update date
```

### tutor_schedule (Availability - State Machine)
```
┌─ schedule_id          → Primary key, auto-increment
├─ tutorId              → FK to tutor.tutorId
├─ schedule_date        → DATE, yyyy-mm-dd
├─ start_time           → TIME, HH:MM:SS
├─ end_time             → TIME, HH:MM:SS
├─ status               → ENUM: free | reserved | booked
│  └─ free: available for booking
│  └─ reserved: student in checkout (cart)
│  └─ booked: payment confirmed
├─ reserved_by          → VARCHAR, studentId if reserved
├─ reserved_at          → TIMESTAMP, when reserved
├─ booked_at            → TIMESTAMP, when confirmed paid
├─ created_at           → Slot creation date
└─ updated_at           → Slot last update
UNIQUE: (tutorId, schedule_date, start_time, end_time)
```

### booking (Confirmed Sessions - State Machine)
```
┌─ bookingId            → Primary key, auto-increment
├─ tutorId              → FK to tutor.tutorId
├─ studentId            → FK to student.studentId
├─ booking_date         → DATE, session date
├─ start_time           → TIME, session start
├─ end_time             → TIME, session end
├─ subject              → VARCHAR, topic being taught
├─ status               → ENUM: pending | confirmed | completed | cancelled
│  └─ pending: just booked, awaiting confirmation
│  └─ confirmed: both parties ready
│  └─ completed: session occurred
│  └─ cancelled: one party cancelled
├─ rating               → TINYINT 1-5, filled when feedback submitted
├─ notes                → TEXT, session notes
├─ created_at           → Booking creation date
└─ updated_at           → Booking update date
```

### feedback (Reviews)
```
┌─ id                   → Primary key, auto-increment
├─ bookingId            → FK to booking.bookingId (UNIQUE)
├─ studentId            → FK to student.studentId
├─ tutorId              → FK to tutor.tutorId
├─ rating               → TINYINT 1-5, CHECK (rating BETWEEN 1 AND 5)
├─ comment              → TEXT, written review
├─ is_anonymous         → TINYINT 0|1, hides student name
└─ created_at           → Feedback submission date
UNIQUE: bookingId (one feedback per booking)
```

### message (Messaging)
```
┌─ id                   → Primary key, auto-increment
├─ bookingId            → FK to booking.bookingId (optional)
├─ senderId             → VARCHAR, role ID of sender
├─ recipientId          → VARCHAR, role ID of recipient
├─ content              → TEXT, message body
├─ attachment_name      → VARCHAR, filename (optional)
├─ attachment_type      → VARCHAR, MIME type (optional)
├─ attachment_size      → INT, file size in bytes (optional)
├─ attachment_data      → LONGBLOB, binary file (max 4GB)
├─ status               → ENUM: sent | delivered | read
├─ readBy_json          → JSON, {"userId": "timestamp"}
├─ created_at           → Message send time
└─ updated_at           → Last status update
```

### notification (Alerts)
```
┌─ id                   → Primary key, auto-increment
├─ recipientId          → VARCHAR, user receiving alert
├─ senderId             → VARCHAR, user sending alert
├─ bookingId            → INT, FK to booking (optional)
├─ messageId            → INT, FK to message (optional)
├─ reportId             → INT, FK to reports (optional)
├─ text                 → TEXT, notification message
├─ type                 → ENUM: message | booking | material | feedback | report | tutor_approval
├─ is_read              → BOOLEAN, 0 (unread) | 1 (read)
├─ created_at           → Notification time
└─ updated_at           → Status update time
```

### sessions (Authentication)
```
┌─ id                   → Primary key, auto-increment
├─ user_id              → FK to users.id
├─ token                → VARCHAR(500), UNIQUE, 64-char hex
├─ expires_at           → TIMESTAMP, session expiration (now + 24h)
└─ created_at           → Token creation time
```

### admin (Admin Accounts)
```
┌─ adminId              → VARCHAR(255), PRIMARY KEY, "a" + padded ID
├─ user_id              → INT, FK to users.id (UNIQUE)
├─ name                 → VARCHAR, admin display name
├─ created_at           → Account creation date
└─ updated_at           → Last update date
```

### reports (Incident Tracking)
```
┌─ id                   → Primary key, auto-increment
├─ reporter_id          → VARCHAR, FK to users.userId
├─ reported_id          → VARCHAR, FK to users.userId (nullable)
├─ target_type          → ENUM: user | tutor | content | behavior
├─ target_id            → INT, ID of reported item (nullable)
├─ category             → VARCHAR, report category
├─ description          → TEXT, detailed complaint
├─ evidence_url         → VARCHAR, URL to evidence
├─ status               → ENUM: pending | investigating | resolved | dismissed
├─ admin_notes          → TEXT, investigation details
├─ created_at           → Report submission date
├─ updated_at           → Last status update
└─ resolved_at          → TIMESTAMP, resolution date (nullable)
```

---

## 🔄 Data Type Reference

| Type | Example | Purpose |
|------|---------|---------|
| INT | 1, 100, 5000 | Whole numbers |
| VARCHAR(n) | "john_doe", "t000001" | Text, max n chars |
| TEXT | "Long biography..." | Long text (64KB max) |
| LONGBLOB | [binary file data] | Binary files (4GB max) |
| DATE | 2025-12-10 | Date only (YYYY-MM-DD) |
| TIME | 14:30:00 | Time only (HH:MM:SS) |
| TIMESTAMP | 2025-12-10 14:30:00 | Date & time, auto-managed |
| DECIMAL(10,2) | 150.50 | Fixed-point decimal, 10 total digits, 2 after decimal |
| DECIMAL(3,2) | 4.50 | Ratings, max 99.99 |
| TINYINT | 1, 5, 0 | Small integers, 1 byte |
| BOOLEAN | 0 or 1 | True/False, stored as TINYINT |
| JSON | {"key": "value"} | JSON object or array |
| ENUM | 'student', 'tutor' | Fixed set of values |

---

## 📍 Index Map

### Performance Indexes Created

```
users:              id, userId, username, email, role, status
admin:              user_id
tutor:              tutorId, user_id, rating
student:            studentId, user_id
sessions:           token, user_id, expires_at
tutor_schedule:     tutorId, schedule_date, status
booking:            tutorId, studentId, status, booking_date
feedback:           bookingId (UNIQUE), studentId, tutorId
message:            bookingId, senderId, recipientId, created_at
notification:       recipientId, senderId, is_read, created_at
reports:            reporter_id, reported_id, status, created_at
```

---

## 🔐 Constraints Summary

### Unique Constraints (UK)
```
users.userId         ← Must be unique across system
users.username       ← No duplicate usernames
users.email          ← No duplicate emails
tutor.tutorId        ← Unique per tutor
student.studentId    ← Unique per student
sessions.token       ← Each token unique
tutor_schedule       ← (tutorId, date, start_time, end_time) composite unique
feedback.bookingId   ← One feedback per booking
```

### Foreign Key Constraints (FK)
```
admin.user_id        → users.id (CASCADE DELETE)
tutor.user_id        → users.id (CASCADE DELETE)
student.user_id      → users.id (CASCADE DELETE)
sessions.user_id     → users.id (CASCADE DELETE)
tutor_schedule.tutorId → tutor.tutorId (CASCADE DELETE)
booking.tutorId      → tutor.tutorId (CASCADE DELETE)
feedback.bookingId   → booking.bookingId (CASCADE DELETE)
feedback.studentId   → student.studentId (CASCADE DELETE)
feedback.tutorId     → tutor.tutorId (CASCADE DELETE)
message.bookingId    → booking.bookingId (CASCADE DELETE)
notification.bookingId → booking.bookingId (CASCADE DELETE)
notification.messageId → message.id (CASCADE DELETE)
reports.reporter_id  → users.userId (CASCADE DELETE)
reports.reported_id  → users.userId (SET NULL)
```

### Check Constraints (CHK)
```
feedback.rating      → CHECK (rating BETWEEN 1 AND 5)
```

---

## 📈 Expected Database Size

### Records by Table
| Table | Expected Count | Size |
|-------|---|---|
| users | 500-2000 | ~2 MB |
| admin | 1-10 | <1 KB |
| tutor | 50-200 | ~2 MB |
| student | 500-2000 | ~1 MB |
| sessions | 50-500 | ~1 MB |
| tutor_schedule | 5000-20000 | ~5 MB |
| booking | 100-1000 | ~2 MB |
| feedback | 50-500 | ~1 MB |
| message | 1000-10000 | ~50 MB |
| notification | 1000-5000 | ~2 MB |
| reports | 10-100 | ~500 KB |

**Total: 2-20 GB** (varies with file attachments)

---

## 🎯 Quick SQL Snippets

### View all tables
```sql
SHOW TABLES;
```

### Check table structure
```sql
DESCRIBE users;
DESCRIBE booking;
```

### Count records per table
```sql
SELECT
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM booking) as bookings,
  (SELECT COUNT(*) FROM feedback) as feedback,
  (SELECT COUNT(*) FROM message) as messages;
```

### List all indexes
```sql
SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME 
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'mlt_system';
```

### Check foreign key relationships
```sql
SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'mlt_system' AND REFERENCED_TABLE_NAME IS NOT NULL;
```

---

## 📚 Related Documentation

- **DATABASE_SCHEMA.md** - Comprehensive table documentation
- **DATABASE_SCHEMA_SUMMARY.md** - Quick reference guide
- **DB_DOCUMENTATION_INDEX.md** - Navigation guide
- **BOOKING_SUBSYSTEM.md** - Project overview

