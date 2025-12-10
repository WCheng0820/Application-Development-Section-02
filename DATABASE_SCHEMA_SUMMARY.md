# 📊 Database Schema Summary

**Database:** MLT System (Mandarin Learning & Tutoring Platform)
**Last Updated:** December 10, 2025
**Total Tables:** 11
**Documentation:** See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for comprehensive details

---

## 📋 Complete Table Inventory

### User Management
1. **users** - Core authentication & profiles (id, userId, username, email, password, role, status)
2. **admin** - Admin accounts (adminId, user_id, name)
3. **tutor** - Tutor profiles (tutorId, user_id, yearsOfExperience, rating, rating_count, price, bio, specialization)
4. **student** - Student profiles (studentId, user_id, yearOfStudy, programme, faculty)
5. **sessions** - Active sessions (id, user_id, token, expires_at)

### Booking & Scheduling
6. **tutor_schedule** - Availability slots (schedule_id, tutorId, schedule_date, start_time, end_time, status)
7. **booking** - Confirmed bookings (bookingId, tutorId, studentId, booking_date, start_time, end_time, subject, status, rating)
8. **feedback** - Student reviews (id, bookingId, studentId, tutorId, rating, comment, is_anonymous)

### Communication & Notifications
9. **message** - Direct messaging (id, bookingId, senderId, recipientId, content, attachment_*, status)
10. **notification** - In-app notifications (id, recipientId, senderId, type, is_read)

### Moderation
11. **reports** - Incident reporting (id, reporter_id, reported_id, category, description, status, admin_notes)

---

## 🎯 Key Attributes by Table

### users
```
id (PK), userId (UK), username (UK), password, email (UK), nophone
role (enum: student|tutor|admin), status (varchar)
created_at, updated_at
```
**Count:** ~100-1000 active users
**Relationships:** Parent for admin, tutor, student, sessions

### admin
```
adminId (PK), user_id (FK, UK), name
created_at, updated_at
```
**Count:** 1-10 admins
**Format:** adminId = "a" + zero-padded ID (e.g., "a000001")

### tutor
```
tutor_pk (PK), tutorId (UK), user_id (FK, UK), name
yearsOfExperience (INT), verification_documents (JSON)
rating (DECIMAL 3.2), rating_count (INT), price (DECIMAL 10.2)
bio (TEXT), specialization (VARCHAR)
created_at, updated_at
```
**Count:** ~50-200 tutors
**Format:** tutorId = "t" + zero-padded ID (e.g., "t000002")
**Performance:** Indexed on rating for "Find Tutors" sorting

### student
```
student_pk (PK), studentId (UK), user_id (FK, UK)
yearOfStudy (INT 1-4), programme (VARCHAR), faculty (VARCHAR)
created_at, updated_at
```
**Count:** ~500-2000 students
**Format:** studentId = "s" + zero-padded ID (e.g., "s000003")

### sessions
```
id (PK), user_id (FK), token (UK), expires_at (TIMESTAMP)
created_at
```
**Count:** ~50-500 active sessions (24-hour expiry)
**Indexes:** token, user_id, expires_at for cleanup

### tutor_schedule
```
schedule_id (PK), tutorId (FK), schedule_date (DATE)
start_time (TIME), end_time (TIME)
status (enum: free|reserved|booked)
reserved_by (VARCHAR nullable), reserved_at (TIMESTAMP nullable)
booked_at (TIMESTAMP nullable)
created_at, updated_at
UNIQUE (tutorId, schedule_date, start_time, end_time)
```
**Count:** ~5000-20000 slots
**State Machine:** free → reserved → booked
**Purpose:** 3-state system for cart abandonment handling

### booking
```
bookingId (PK), tutorId (FK), studentId (FK)
booking_date (DATE), start_time (TIME), end_time (TIME)
subject (VARCHAR), status (enum: pending|confirmed|completed|cancelled)
rating (TINYINT nullable), notes (TEXT)
created_at, updated_at
```
**Count:** ~100-1000 confirmed bookings
**Lifecycle:** pending → confirmed → completed or cancelled
**Rating:** Filled when feedback submitted

### feedback
```
id (PK), bookingId (FK, UK), studentId (FK), tutorId (FK)
rating (TINYINT 1-5, CHECK constraint), comment (TEXT)
is_anonymous (TINYINT 0|1)
created_at
```
**Count:** ~50-500 reviews
**Constraint:** One feedback per booking (UNIQUE on bookingId)
**Impact:** Updates tutor.rating and tutor.rating_count

### message
```
id (PK), bookingId (FK nullable), senderId (FK), recipientId (FK)
content (TEXT), attachment_name, attachment_type, attachment_size
attachment_data (LONGBLOB max 4GB)
status (enum: sent|delivered|read), readBy_json (JSON)
created_at, updated_at
```
**Count:** ~1000-10000 messages
**Features:** File attachments up to 4GB, read tracking
**Indexes:** bookingId, senderId, recipientId, created_at

### notification
```
id (PK), recipientId (FK), senderId (FK)
bookingId (FK nullable), messageId (FK nullable), reportId (FK nullable)
text (TEXT), type (enum: message|booking|material|feedback|report|tutor_approval)
is_read (BOOLEAN), created_at, updated_at
```
**Count:** ~1000-5000 active notifications
**Delivery:** Real-time via Socket.IO
**Cleanup:** Mark as read, auto-archive after 30 days

### reports
```
id (PK), reporter_id (FK), reported_id (FK nullable)
target_type (enum: user|tutor|content|behavior)
target_id (INT nullable), category (VARCHAR)
description (TEXT), evidence_url (VARCHAR)
status (enum: pending|investigating|resolved|dismissed)
admin_notes (TEXT), created_at, updated_at, resolved_at (nullable)
```
**Count:** ~10-100 reports
**Workflow:** pending → investigating → (resolved | dismissed)
**Admin:** Investigation tracking with notes

---

## 🔗 Critical Relationships

### User → Role-Specific Table (1:1)
- users.id → admin.user_id
- users.id → tutor.user_id
- users.id → student.user_id
- All cascade on delete

### Tutor → Schedule (1:N)
- tutor.tutorId → tutor_schedule.tutorId
- One tutor can have many availability slots

### Tutor & Student → Booking (N:N via booking)
- tutor.tutorId ← booking.tutorId
- student.studentId ← booking.studentId
- Creates confirmed session record

### Booking → Feedback (1:1 optional)
- booking.bookingId → feedback.bookingId (UNIQUE)
- One review per booking maximum

### Booking → Message (1:N)
- booking.bookingId ← message.bookingId
- Context for related messages

### User → Session (1:N)
- users.id → sessions.user_id
- Multiple concurrent sessions possible

---

## 📊 Unique Constraints Summary

| Table | Unique Constraints | Purpose |
|-------|-------------------|---------|
| users | userId, username, email | Prevent duplicate accounts |
| admin | user_id | One admin record per user |
| tutor | tutorId, user_id | One tutor record per user |
| student | studentId, user_id | One student record per user |
| sessions | token | One token per session |
| tutor_schedule | (tutorId, schedule_date, start_time, end_time) | No overlapping slots |
| feedback | bookingId | One feedback per booking |

---

## 🎮 State Machines

### Tutor Schedule Status
```
┌─────┐
│free │ ← Initial state, slot is available
└──┬──┘
   │ student selects
   ↓
┌──────────┐
│reserved  │ ← Student in checkout (cart)
└──┬───────┘
   │ payment success OR timeout
   ├────────────────┐
   ↓                ↓
┌───────┐       ┌─────┐
│booked │       │free │ ← Timeout/abandoned cart
└───────┘       └─────┘
```

### Booking Status
```
┌─────────┐
│pending  │ ← Payment just confirmed
└──┬──────┘
   │ both parties confirm
   ↓
┌──────────┐
│confirmed │ ← Ready for session
└──┬───────┘
   │
   ├──────────────────┐
   │ session happens  │
   ↓                  ↓
┌──────────┐    ┌───────────┐
│completed │    │cancelled  │
└──────────┘    └───────────┘
   │
   │ student submits
   ↓
FEEDBACK created
TUTOR.rating updated
```

### User Status
```
┌─────────┐
│pending  │ ← Tutor registration (awaiting admin)
└──┬──────┘
   │ admin approves
   ↓
┌────────┐
│active  │ ← Can login & use platform
└────────┘
```

### Report Status
```
┌─────────┐
│pending  │ ← Just filed
└──┬──────┘
   │ admin reviews
   ↓
┌─────────────┐
│investigating│ ← Under investigation
└──┬──────────┘
   │
   ├─────────────┐
   ↓             ↓
┌────────┐  ┌──────────┐
│resolved│  │dismissed │ ← Closed
└────────┘  └──────────┘
```

---

## 📈 Data Statistics

### Expected Volumes
| Metric | Estimate | Notes |
|--------|----------|-------|
| Active Users | 100-1000 | Platform size |
| Tutors | 50-200 | Vetted professionals |
| Students | 500-2000 | Main user base |
| Monthly Bookings | 500-2000 | Usage rate |
| Feedback Records | 50-500 | ~25% booking feedback rate |
| Messages | 1000-10000 | Pre & post-session communication |
| Notifications | 1000-5000 | Daily user interactions |
| Schedule Slots | 5000-20000 | ~100-400 per tutor |

### Storage Estimates
- Text data: ~100-500 MB
- File attachments: 1-10 GB (LONGBLOB)
- Full database: 2-20 GB
- Recommend backup: 20-50 GB

---

## 🔐 Security & Compliance

### Password Security
- SHA-256 hashing on backend
- Never transmitted plain-text
- Enforce minimum 6 characters

### Session Management
- 64-character hex tokens (crypto.randomBytes)
- 24-hour expiration
- Stored in sessionStorage (not localStorage)
- Validated on each request

### Data Privacy
- PII stored: email, phone, name, programme, faculty
- GDPR: Users can request data export/deletion
- Anonymous feedback option available
- Admin can view reports

### Access Control
- Role-based (student, tutor, admin)
- Routes protected via AuthContext
- Backend validates role on each request
- Foreign key constraints prevent unauthorized access

---

## 🔧 Maintenance Tasks

### Daily
- Clean expired sessions (expires_at < NOW())
- Generate daily notifications

### Weekly
- Recalculate tutor ratings & rating_count
- Expire reserved schedule slots (>30 min)

### Monthly
- Archive old notifications (>30 days)
- Backup database

### Quarterly
- Analyze slow queries (use EXPLAIN)
- Optimize indexes
- Capacity planning

---

## 📝 Quick Reference: SQL Patterns

### Find top-rated tutors
```sql
SELECT * FROM tutor WHERE rating >= 4.5 ORDER BY rating DESC LIMIT 10;
```

### Get student's upcoming bookings
```sql
SELECT b.*, t.name FROM booking b
JOIN tutor t ON b.tutorId = t.tutorId
WHERE b.studentId = ? AND b.booking_date >= CURDATE();
```

### Calculate tutor's average rating
```sql
SELECT tutorId, AVG(rating) as avg_rating, COUNT(*) as count
FROM feedback GROUP BY tutorId;
```

### Get unread notifications
```sql
SELECT * FROM notification WHERE recipientId = ? AND is_read = 0;
```

### Find available slots
```sql
SELECT * FROM tutor_schedule
WHERE tutorId = ? AND schedule_date >= CURDATE() AND status = 'free';
```

### Cleanup expired sessions
```sql
DELETE FROM sessions WHERE expires_at < NOW();
```

---

## 📞 Need More Details?

👉 **Comprehensive Documentation:** See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

Includes:
- ✅ Detailed attribute descriptions with examples
- ✅ Data types and validation rules
- ✅ Business logic & constraints
- ✅ Entity relationship diagrams
- ✅ State transition workflows
- ✅ Performance optimization tips
- ✅ Query examples
- ✅ Troubleshooting guide

