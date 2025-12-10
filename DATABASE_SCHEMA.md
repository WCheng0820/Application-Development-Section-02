# 📊 Complete Database Schema Documentation

**Last Updated:** December 10, 2025
**Database:** MLT System (Mandarin Learning & Tutoring Platform)
**Total Tables:** 11

---

## 🗂️ Table Overview

| # | Table Name | Purpose | Key Entity |
|---|-----------|---------|-----------|
| 1 | `users` | Core user authentication & profiles | All users |
| 2 | `admin` | Administrator accounts | Admin staff |
| 3 | `tutor` | Tutor profiles & ratings | Tutors |
| 4 | `student` | Student profiles & education info | Students |
| 5 | `sessions` | Active user sessions | Session tokens |
| 6 | `tutor_schedule` | Tutor availability slots | Time slots |
| 7 | `booking` | Confirmed tutoring sessions | Bookings |
| 8 | `feedback` | Student reviews & ratings | Ratings |
| 9 | `message` | Direct messaging between users | Messages |
| 10 | `notification` | In-app notifications | Notifications |
| 11 | `reports` | Incident & issue reporting | Reports |

---

## 📋 Detailed Table Definitions

### 1️⃣ **users** - Core User Accounts
**Purpose:** Central authentication and user account management

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(255) UNIQUE,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    nophone VARCHAR(50),
    role ENUM('student', 'tutor', 'admin') NOT NULL DEFAULT 'student',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

**Attributes:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | INT | Auto-increment primary key | 1, 2, 3... |
| `userId` | VARCHAR(255) | Role-prefixed unique identifier | "s000001", "t000001", "a000001" |
| `username` | VARCHAR(255) | Unique username for login | "john_doe" |
| `password` | VARCHAR(255) | SHA-256 hashed password | "3c59dc048e8850243be8079a5c74d079d2146910d7..." |
| `email` | VARCHAR(255) | Unique email address | "john@example.com" |
| `nophone` | VARCHAR(50) | Phone number (optional) | "601123456789" |
| `role` | ENUM | User role | 'student', 'tutor', 'admin' |
| `status` | VARCHAR(50) | Account status | 'active', 'inactive', 'pending', 'suspended' |
| `created_at` | TIMESTAMP | Account creation time | 2025-12-10 10:30:00 |
| `updated_at` | TIMESTAMP | Last update time | 2025-12-10 11:45:00 |

**Indexes:** id, userId, username, email, role, status
**Relationships:** Parent for admin, tutor, student, sessions

**Business Rules:**
- Email and username must be globally unique
- All passwords are SHA-256 hashed on backend
- Role assignment happens at registration
- New student accounts default to 'active' status
- New tutor accounts default to 'pending' status (requires admin approval)

---

### 2️⃣ **admin** - Administrator Accounts
**Purpose:** Store admin-specific information

```sql
CREATE TABLE admin (
    adminId VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

**Attributes:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `adminId` | VARCHAR(255) | Role-prefixed primary key | "a000001" |
| `user_id` | INT | Foreign key to users.id | 1 |
| `name` | VARCHAR(255) | Admin display name | "System Administrator" |
| `created_at` | TIMESTAMP | Record creation | 2025-12-10 09:00:00 |
| `updated_at` | TIMESTAMP | Last update | 2025-12-10 09:00:00 |

**Indexes:** user_id
**Foreign Key:** user_id → users.id (CASCADE DELETE)
**Relationships:** 1:1 with users table

**Business Rules:**
- One admin record per admin user
- adminId format: "a" + zero-padded numeric ID (e.g., "a000001")
- Admin has permissions to manage users, tutors, reports, and system settings

---

### 3️⃣ **tutor** - Tutor Profiles & Ratings
**Purpose:** Store tutor-specific information and performance metrics

```sql
CREATE TABLE tutor (
    tutor_pk INT AUTO_INCREMENT PRIMARY KEY,
    tutorId VARCHAR(255) UNIQUE,
    user_id INT NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    yearsOfExperience INT DEFAULT 0,
    verification_documents JSON,
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0,
    bio TEXT,
    specialization VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

**Attributes:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `tutor_pk` | INT | Surrogate auto-increment key | 1, 2, 3... |
| `tutorId` | VARCHAR(255) | Role-prefixed unique identifier | "t000002" |
| `user_id` | INT | Foreign key to users.id | 2 |
| `name` | VARCHAR(255) | Display name | "Wang Ming" |
| `yearsOfExperience` | INT | Teaching experience in years | 5, 10, 15... |
| `verification_documents` | JSON | Array of uploaded proof docs | [{"name": "cert.pdf", "type": "..."}] |
| `rating` | DECIMAL(3,2) | Average star rating | 4.50, 4.75, 5.00 |
| `rating_count` | INT | Number of ratings received | 10, 25, 100... |
| `price` | DECIMAL(10,2) | Hourly rate in MYR | 50.00, 75.00, 150.00 |
| `bio` | TEXT | Professional biography | "Experienced in HSK preparation..." |
| `specialization` | VARCHAR(255) | Teaching focus | "HSK Preparation", "Business Chinese" |
| `created_at` | TIMESTAMP | Profile creation | 2025-12-10 10:30:00 |
| `updated_at` | TIMESTAMP | Profile last update | 2025-12-10 11:45:00 |

**Indexes:** tutorId, user_id, rating
**Foreign Key:** user_id → users.id (CASCADE Delete)
**Relationships:** 1:1 with users; 1:N with tutor_schedule, booking, feedback, message

**Business Rules:**
- tutorId format: "t" + zero-padded numeric ID (e.g., "t000002")
- Rating is automatically updated from feedback table (DECIMAL 3.2 = max 999.99)
- price must be ≥ 0
- verification_documents stored as JSON array
- rating_count tracks how many students rated this tutor
- New tutors start with rating = 0, rating_count = 0

**Performance Note:** Index on rating allows efficient sorting/filtering in "Find Tutors"

---

### 4️⃣ **student** - Student Profiles
**Purpose:** Store student-specific education information

```sql
CREATE TABLE student (
    student_pk INT AUTO_INCREMENT PRIMARY KEY,
    studentId VARCHAR(255) UNIQUE,
    user_id INT NOT NULL UNIQUE,
    yearOfStudy INT DEFAULT 1,
    programme VARCHAR(255),
    faculty VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

**Attributes:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `student_pk` | INT | Surrogate auto-increment key | 1, 2, 3... |
| `studentId` | VARCHAR(255) | Role-prefixed unique identifier | "s000003" |
| `user_id` | INT | Foreign key to users.id | 3 |
| `yearOfStudy` | INT | Academic year (1-4) | 1, 2, 3, 4 |
| `programme` | VARCHAR(255) | Degree programme | "Bachelor of Engineering", "Master of Business" |
| `faculty` | VARCHAR(255) | Faculty/Department | "Faculty of Engineering", "School of Business" |
| `created_at` | TIMESTAMP | Profile creation | 2025-12-10 10:30:00 |
| `updated_at` | TIMESTAMP | Profile last update | 2025-12-10 11:45:00 |

**Indexes:** studentId, user_id
**Foreign Key:** user_id → users.id (CASCADE Delete)
**Relationships:** 1:1 with users; 1:N with booking, feedback, message

**Business Rules:**
- studentId format: "s" + zero-padded numeric ID (e.g., "s000003")
- yearOfStudy helps tutors understand student level (1=foundation, 4=advanced)
- programme and faculty are optional but help with matching

---

### 5️⃣ **sessions** - User Session Tokens
**Purpose:** Manage active user authentication sessions

```sql
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Attributes:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | INT | Auto-increment primary key | 1, 2, 3... |
| `user_id` | INT | Foreign key to users.id | 1, 2, 3... |
| `token` | VARCHAR(500) | Session token (64-char hex) | "a1b2c3d4e5f6..." |
| `expires_at` | TIMESTAMP | Session expiration time | 2025-12-11 10:30:00 (24 hours from creation) |
| `created_at` | TIMESTAMP | Token creation time | 2025-12-10 10:30:00 |

**Indexes:** token, user_id, expires_at
**Foreign Key:** user_id → users.id (CASCADE Delete)
**Relationships:** N:1 with users

**Business Rules:**
- Token is generated on backend using crypto.randomBytes(32).toString('hex')
- Expires 24 hours after creation
- Each login creates a new session (old sessions remain valid until expiry)
- Expired sessions should be cleaned up periodically (backend cron job)
- Only one session per user at a time in most implementations

---

### 6️⃣ **tutor_schedule** - Tutor Availability Slots
**Purpose:** Manage tutor availability and booking state machine

```sql
CREATE TABLE tutor_schedule (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    tutorId VARCHAR(255) NOT NULL,
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('free','reserved','booked') NOT NULL DEFAULT 'free',
    reserved_by VARCHAR(255) DEFAULT NULL,
    reserved_at TIMESTAMP NULL DEFAULT NULL,
    booked_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_schedule (tutorId, schedule_date, start_time, end_time)
)
```

**Attributes:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `schedule_id` | INT | Auto-increment primary key | 1, 2, 3... |
| `tutorId` | VARCHAR(255) | Foreign key to tutor.tutorId | "t000002" |
| `schedule_date` | DATE | Date of availability | 2025-12-15 |
| `start_time` | TIME | Slot start time (HH:MM:SS) | 14:00:00 |
| `end_time` | TIME | Slot end time (HH:MM:SS) | 15:00:00 |
| `status` | ENUM | Booking state | 'free', 'reserved', 'booked' |
| `reserved_by` | VARCHAR(255) | StudentId if in cart | "s000003" or NULL |
| `reserved_at` | TIMESTAMP | When student added to cart | 2025-12-10 11:00:00 or NULL |
| `booked_at` | TIMESTAMP | When payment confirmed | 2025-12-10 11:30:00 or NULL |
| `created_at` | TIMESTAMP | Slot creation | 2025-12-09 10:00:00 |
| `updated_at` | TIMESTAMP | Last state change | 2025-12-10 11:30:00 |

**Indexes:** tutorId, schedule_date, status
**Foreign Key:** tutorId → tutor.tutorId (CASCADE Delete)
**Unique Constraint:** (tutorId, schedule_date, start_time, end_time) - No overlapping slots
**Relationships:** 1:N with tutor; Referenced by booking

**Business Rules - State Machine:**
```
free → reserved → booked
  ↑         ↓
  └─────────┘  (cart abandonment)
```
- `free`: Slot available for booking
- `reserved`: Student added to cart but not paid (expires after ~30 mins)
- `booked`: Payment confirmed, booking created

**Cleanup:** Reserved slots that expire should be reset to 'free' (backend cron)

---

### 7️⃣ **booking** - Confirmed Tutoring Sessions
**Purpose:** Store confirmed booking records and session information

```sql
CREATE TABLE booking (
    bookingId INT AUTO_INCREMENT PRIMARY KEY,
    tutorId VARCHAR(255) NOT NULL,
    studentId VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject VARCHAR(255),
    status ENUM('confirmed','pending','cancelled','completed') DEFAULT 'pending',
    rating TINYINT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

**Attributes:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `bookingId` | INT | Auto-increment primary key | 1, 2, 3... |
| `tutorId` | VARCHAR(255) | Foreign key to tutor.tutorId | "t000002" |
| `studentId` | VARCHAR(255) | Foreign key to student.studentId | "s000003" |
| `booking_date` | DATE | Date of session | 2025-12-15 |
| `start_time` | TIME | Session start (HH:MM:SS) | 14:00:00 |
| `end_time` | TIME | Session end (HH:MM:SS) | 15:00:00 |
| `subject` | VARCHAR(255) | Topic/subject being taught | "HSK Preparation", "Business Conversation" |
| `status` | ENUM | Booking lifecycle state | 'pending', 'confirmed', 'completed', 'cancelled' |
| `rating` | TINYINT | Per-booking rating (1-5) | 5 or NULL |
| `notes` | TEXT | Session notes | "Focus on tones and pronunciation" |
| `created_at` | TIMESTAMP | Booking creation | 2025-12-10 11:30:00 |
| `updated_at` | TIMESTAMP | Last update | 2025-12-15 15:00:00 |

**Indexes:** bookingId, tutorId, studentId, status, booking_date
**Foreign Keys:**
- tutorId → tutor.tutorId (CASCADE Delete)
- studentId → student.studentId (implicit)
**Relationships:** 1:1 with feedback (optional); 1:N with message, notification

**Business Rules - Lifecycle:**
```
pending → confirmed → completed
            ↓
        cancelled
```
- `pending`: Initial state after payment
- `confirmed`: Both parties agreed
- `completed`: Session occurred
- `cancelled`: Either party cancelled
- `rating`: Filled when student submits feedback (nullable until feedback submitted)

---

### 8️⃣ **feedback** - Student Reviews & Ratings
**Purpose:** Store student reviews of tutor sessions

```sql
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bookingId INT NOT NULL,
    studentId VARCHAR(255) NOT NULL,
    tutorId VARCHAR(255) NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_anonymous TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_booking_feedback (bookingId)
)
```

**Attributes:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | INT | Auto-increment primary key | 1, 2, 3... |
| `bookingId` | INT | Foreign key to booking.bookingId (UNIQUE) | 1 |
| `studentId` | VARCHAR(255) | Foreign key to student.studentId | "s000003" |
| `tutorId` | VARCHAR(255) | Foreign key to tutor.tutorId | "t000002" |
| `rating` | TINYINT | Star rating (1-5, enforced by CHECK) | 1, 2, 3, 4, 5 |
| `comment` | TEXT | Written review/feedback | "Great tutor! Very patient." |
| `is_anonymous` | TINYINT | Anonymous feedback flag | 0 (named), 1 (anonymous) |
| `created_at` | TIMESTAMP | Feedback submission time | 2025-12-15 15:30:00 |

**Indexes:** bookingId (UNIQUE), studentId, tutorId
**Foreign Keys:**
- bookingId → booking.bookingId (UNIQUE, CASCADE Delete)
- studentId → student.studentId (CASCADE Delete)
- tutorId → tutor.tutorId (CASCADE Delete)
**Relationships:** 1:1 with booking; N:1 with student & tutor

**Business Rules:**
- One feedback record per booking (enforced by UNIQUE constraint)
- Rating is mandatory (1-5 stars)
- Comment is optional
- is_anonymous: 1 = hides student name from tutor, 0 = shows name
- After feedback submitted, booking.rating is updated
- Tutor's overall rating = AVG(feedback.rating) WHERE tutorId = X
- Tutor's rating_count = COUNT(*) WHERE tutorId = X

---

### 9️⃣ **message** - Direct Messaging
**Purpose:** Store messages between tutors and students

```sql
CREATE TABLE message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bookingId INT,
    senderId VARCHAR(255) NOT NULL,
    recipientId VARCHAR(255) NOT NULL,
    content TEXT,
    attachment_name VARCHAR(255),
    attachment_type VARCHAR(100),
    attachment_size INT,
    attachment_data LONGBLOB,
    status ENUM('sent','delivered','read') DEFAULT 'sent',
    readBy_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

**Attributes:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | INT | Auto-increment primary key | 1, 2, 3... |
| `bookingId` | INT | Optional FK to booking.bookingId | 1 or NULL |
| `senderId` | VARCHAR(255) | Sender's role ID | "s000003" or "t000002" |
| `recipientId` | VARCHAR(255) | Recipient's role ID | "t000002" or "s000003" |
| `content` | TEXT | Message text | "When is our next session?" |
| `attachment_name` | VARCHAR(255) | File name if attached | "homework.pdf" or NULL |
| `attachment_type` | VARCHAR(100) | MIME type | "application/pdf", "image/png" |
| `attachment_size` | INT | File size in bytes | 1024000 or NULL |
| `attachment_data` | LONGBLOB | Binary file data (up to 4GB) | [binary data] or NULL |
| `status` | ENUM | Delivery tracking | 'sent', 'delivered', 'read' |
| `readBy_json` | JSON | Read status tracking | {"s000003": "2025-12-10 12:00:00"} |
| `created_at` | TIMESTAMP | Message send time | 2025-12-10 11:00:00 |
| `updated_at` | TIMESTAMP | Last status update | 2025-12-10 11:05:00 |

**Indexes:** bookingId, senderId, recipientId, created_at
**Foreign Key:** bookingId → booking.bookingId (optional, CASCADE Delete)
**Relationships:** N:M between users (via role IDs)

**Business Rules:**
- senderId and recipientId are role-prefixed IDs ("s000003" or "t000002")
- Content OR attachment must be present (not empty)
- attachment_data uses LONGBLOB (4GB max per file)
- status tracks message delivery: sent → delivered → read
- readBy_json stores JSON of {userId: timestamp} when read
- Booking context optional (direct message or booking-related)

**Performance Note:** Max 4GB per attachment (LONGBLOB limit)

---

### 🔟 **notification** - System Notifications
**Purpose:** Manages in-app notifications for user actions

```sql
CREATE TABLE notification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipientId VARCHAR(255) NOT NULL,
    senderId VARCHAR(255) NOT NULL,
    bookingId INT,
    messageId INT,
    reportId INT,
    text TEXT,
    type ENUM('message','booking','material','feedback','report','tutor_approval') DEFAULT 'message',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

**Attributes:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | INT | Auto-increment primary key | 1, 2, 3... |
| `recipientId` | VARCHAR(255) | User receiving notification | "s000003", "t000002" |
| `senderId` | VARCHAR(255) | User triggering notification | "t000002", "s000003", "admin" |
| `bookingId` | INT | Optional FK to booking.bookingId | 1 or NULL |
| `messageId` | INT | Optional FK to message.id | 1 or NULL |
| `reportId` | INT | Optional FK to reports.id | 1 or NULL |
| `text` | TEXT | Notification message | "Tutor John accepted your booking" |
| `type` | ENUM | Notification category | See below |
| `is_read` | BOOLEAN | Read status | 0 (unread), 1 (read) |
| `created_at` | TIMESTAMP | Notification time | 2025-12-10 11:00:00 |
| `updated_at` | TIMESTAMP | Last status update | 2025-12-10 11:05:00 |

**Notification Types:**

| Type | Trigger | Example |
|------|---------|---------|
| `message` | New message received | "You received a message from John" |
| `booking` | Booking status changed | "Your booking is confirmed" |
| `material` | Tutor uploads material | "John uploaded study materials" |
| `feedback` | Feedback left on session | "You received a 5-star review" |
| `report` | Admin report action | "Your report has been resolved" |
| `tutor_approval` | Tutor registration decision | "Your tutor account has been approved" |

**Indexes:** recipientId, senderId, is_read, created_at
**Foreign Keys:**
- bookingId → booking.bookingId (optional, CASCADE Delete)
- messageId → message.id (optional, CASCADE Delete)
- reportId → reports.id (optional)
**Relationships:** N:M between users (via role IDs)

**Business Rules:**
- At least one of {bookingId, messageId, reportId} may be populated
- Sent real-time to clients via Socket.IO
- is_read toggles when user reads notification
- Automatically created on relevant system events

---

### 1️⃣1️⃣ **reports** - Incident & Issue Reporting
**Purpose:** Track user reports and incidents for moderation

```sql
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id VARCHAR(255) NOT NULL,
    reported_id VARCHAR(255),
    target_type ENUM('user','tutor','content','behavior') NOT NULL,
    target_id INT,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    evidence_url VARCHAR(500),
    status ENUM('pending','investigating','resolved','dismissed') DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL
)
```

**Attributes:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | INT | Auto-increment primary key | 1, 2, 3... |
| `reporter_id` | VARCHAR(255) | User filing report (FK to users.userId) | "s000003" |
| `reported_id` | VARCHAR(255) | User being reported (nullable) | "t000002" or NULL |
| `target_type` | ENUM | Type of thing reported | 'user', 'tutor', 'content', 'behavior' |
| `target_id` | INT | ID of reported item | 1 (booking ID) or NULL |
| `category` | VARCHAR(100) | Report category | "harassment", "fraud", "low_quality", "abuse" |
| `description` | TEXT | Detailed complaint | "Tutor didn't show up to session" |
| `evidence_url` | VARCHAR(500) | URL to evidence/screenshot | "https://..." or NULL |
| `status` | ENUM | Investigation workflow | 'pending', 'investigating', 'resolved', 'dismissed' |
| `admin_notes` | TEXT | Admin investigation notes | "Verified issue, warned tutor" |
| `created_at` | TIMESTAMP | Report submission time | 2025-12-10 11:00:00 |
| `updated_at` | TIMESTAMP | Last status update | 2025-12-10 15:00:00 |
| `resolved_at` | TIMESTAMP | Resolution time (if resolved) | 2025-12-10 15:00:00 or NULL |

**Indexes:** reporter_id, reported_id, status, created_at
**Foreign Keys:**
- reporter_id → users.userId (CASCADE Delete)
- reported_id → users.userId (SET NULL)
**Relationships:** N:1 with users (as reporter & reported)

**Business Rules:**
- Reporter is mandatory, reported_id optional
- status progression: pending → investigating → (resolved | dismissed)
- resolved_at filled when status → resolved
- admin_notes contains investigation details
- Evidence URL links to external proof

---

## 🔗 Entity Relationship Diagram (Conceptual)

```
┌─────────────────┐
│     users       │ (root entity)
├─────────────────┤
│ id (PK)         │
│ userId          │
│ username        │
│ email           │
│ role            │
│ status          │
└─────────────────┘
    │    │    │
    ├────┼────┼──────────┐
    │    │    │          │
    │    │    │    ┌─────────────────┐
    │    │    │    │     sessions    │
    │    │    │    ├─────────────────┤
    │    │    │    │ token (UK)      │
    │    │    │    │ expires_at      │
    │    │    │    └─────────────────┘
    │    │    │
    ↓    ↓    ↓
 ┌──────┐  ┌────────┐  ┌──────────┐
 │admin │  │tutor   │  │student   │
 ├──────┤  ├────────┤  ├──────────┤
 │ (1:1)│  │ (1:1)  │  │  (1:1)   │
 └──────┘  └────────┘  └──────────┘
              │            │
              │            │
         ┌────┴───┐        │
         │         │       │
    ┌─────────────┐   ┌────────┐
    │tutor_       │   │booking │
    │schedule     │   ├────────┤
    ├─────────────┤   │(bridges│
    │status       │   │tutor &│
    │reserved_by  │   │student)
    └─────────────┘   └────────┘
                           │
                  ┌────────┼────────┐
                  │        │        │
              ┌───────┐┌──────────┐┌──────────┐
              │message││feedback  ││notification│
              ├───────┤├──────────┤├──────────┤
              │(N:M)  ││(1:1)     ││(N:M)     │
              └───────┘└──────────┘└──────────┘

reports connects to users(reporter_id, reported_id)
```

---

## 📊 Data Flow & State Machines

### Booking Workflow
```
TUTOR_SCHEDULE (free)
    ↓
[Student browses & selects]
    ↓
TUTOR_SCHEDULE (reserved) + PAYMENT
    ↓
[Student completes payment]
    ↓
BOOKING (pending) + TUTOR_SCHEDULE (booked)
    ↓
[Session date arrives]
    ↓
BOOKING (completed)
    ↓
[Student submits feedback]
    ↓
FEEDBACK created + TUTOR.rating updated + BOOKING.rating updated
```

### User Registration & Status
```
Registration
    ↓
USERS (status = 'pending' for tutors, 'active' for students/admins)
    ├─ TUTOR (created)
    ├─ STUDENT (created)
    └─ ADMIN (created)
    ↓
[Admin approval for tutors]
    ↓
USERS.status = 'active'
NOTIFICATION.type = 'tutor_approval' sent
```

### Session Lifecycle
```
Login
    ↓
SESSION created (token, expires_at = now + 24h)
    ↓
[Client stores token in sessionStorage]
    ↓
[On each request, send: Authorization: Bearer <token>]
    ↓
[Backend validates token]
    ↓
[24 hours later]
    ↓
SESSION expires (backend should clean up)
```

---

## 💾 Performance Optimization

### Indexes Summary

| Table | Indexes | Purpose |
|-------|---------|---------|
| users | id, userId, username, email, role, status | Fast lookup by any user identifier |
| tutor | tutorId, user_id, rating | Find tutors, sort by rating |
| student | studentId, user_id | Student lookup |
| sessions | token, user_id, expires_at | Session validation & cleanup |
| tutor_schedule | tutorId, schedule_date, status | Find available slots |
| booking | tutorId, studentId, status, booking_date | Filter & sort bookings |
| message | bookingId, senderId, recipientId, created_at | Message history & notifications |
| notification | recipientId, senderId, is_read, created_at | Notification feed |
| feedback | bookingId, studentId, tutorId | Find reviews |
| reports | reporter_id, reported_id, status, created_at | Report management |

### Key Constraints
- **Unique Constraints:** userId, username, email (users); tutorId, studentId (role tables); token (sessions); one feedback per booking; no duplicate schedule slots
- **Check Constraints:** feedback.rating BETWEEN 1 AND 5
- **Foreign Key Cascades:** User deletion cascades to all related records
- **Engine:** InnoDB (ACID compliance, transaction support)
- **Charset:** utf8mb4 (emoji & international characters support)

---

## 🔐 Data Integrity Rules

### Authentication
- All passwords are SHA-256 hashed
- Session tokens are 64-character hex strings
- Sessions expire after 24 hours

### Role Assignment
- User.role is ENUM (enforced at database level)
- Matching role-specific table must exist (admin, tutor, or student)
- userId must follow format: [role_char] + zero-padded numeric ID

### Booking Consistency
- Schedule state machine enforced at application layer
- One feedback per booking (database constraint)
- Tutor.rating automatically updated from feedback table

### Data Validation
- Email and username unique globally
- Phone numbers optional
- Rating values constrained to 1-5
- No orphaned records (foreign key constraints)

---

## 📈 Query Examples

### Find tutors with high ratings
```sql
SELECT * FROM tutor WHERE rating >= 4.5 AND rating_count > 0 ORDER BY rating DESC;
```

### Get booking history for student
```sql
SELECT b.*, t.name as tutor_name FROM booking b
JOIN tutor t ON b.tutorId = t.tutorId
WHERE b.studentId = ? AND b.status IN ('completed', 'cancelled')
ORDER BY b.booking_date DESC;
```

### Calculate tutor ratings
```sql
UPDATE tutor t
SET rating = (SELECT AVG(rating) FROM feedback WHERE tutorId = t.tutorId),
    rating_count = (SELECT COUNT(*) FROM feedback WHERE tutorId = t.tutorId);
```

### Cleanup expired sessions
```sql
DELETE FROM sessions WHERE expires_at < NOW();
```

### Get unread notifications
```sql
SELECT * FROM notification WHERE recipientId = ? AND is_read = FALSE ORDER BY created_at DESC;
```

---

## 🚨 Important Notes

1. **Password Hashing**: Always use SHA-256 on backend. Never store plain text passwords.
2. **Session Expiry**: Implement background job to clean expired sessions.
3. **Rating Recalculation**: Trigger on feedback creation/update to refresh tutor.rating and rating_count.
4. **Cascade Deletes**: User deletion cascades through entire data tree. Be careful!
5. **Timezone Handling**: All timestamps in UTC. Convert on frontend for display.
6. **File Storage**: LONGBLOB works but consider external storage (S3) for large files.
7. **Backup**: Regular backups essential. Sensitive data includes passwords and personal information.

---

## 📝 Schema Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-10 | Initial schema with 11 tables: users, admin, tutor, student, sessions, tutor_schedule, booking, feedback, message, notification, reports |

