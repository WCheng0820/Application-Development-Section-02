# 📅 Booking Subsystem

**Developer: Chu Cheng Qing**

| Sprint | Module Name | Frontend | Backend | Database |
|--------|----------|---------|---------|---------|
| **1**  | Search Tutor Module | MLTSystem/src/pages/FindTutors.jsx<br>MLTSystem/src/components/TutorCard.jsx<br>MLTSystem/src/controllers/TutorsController.js | Backend/app/routes/tutors.js<br>Backend/app/controllers/TutorsController.js<br>Backend/routes/tutors.js | tutor<br>tutor_schedule<br>feedback |
| **2**  | Schedule Availability Module | MLTSystem/src/pages/ManageSchedule.jsx<br>MLTSystem/src/pages/TutorSetup.jsx<br>MLTSystem/src/components/ScheduleManager.jsx<br>MLTSystem/src/controllers/ScheduleController.js<br>MLTSystem/src/utils/dateUtils.js | Backend/app/routes/schedule.js<br>Backend/app/controllers/ScheduleController.js<br>Backend/routes/schedule.js | tutor_schedule |
| **3**  | Make Booking Module | MLTSystem/src/pages/Bookings.jsx<br>MLTSystem/src/pages/StudentDashboard.jsx<br>MLTSystem/src/components/BookingCard.jsx<br>MLTSystem/src/components/RoleBasedDashboard.jsx<br>MLTSystem/src/controllers/BookingsController.js | Backend/app/routes/bookings.js<br>Backend/app/controllers/BookingsController.js<br>Backend/routes/bookings.js | booking<br>student<br>feedback<br>sessions<br>notification |
| **4**  | Make Payment Module | MLTSystem/src/pages/Payment.jsx | Backend/app/routes/payments.js<br>Backend/routes/payments.js<br>Backend/app/controllers/BookingsController.js | booking<br>sessions |

---

## 🔗 Cross-Module Dependencies

### Shared Frontend Components & Services
| File | Path | Used By |
|------|------|---------|
| AuthContext.jsx | `MLTSystem/src/context/AuthContext.jsx` | All modules for authentication |
| PrivateRoute.jsx | `MLTSystem/src/components/PrivateRoute.jsx` | Route protection across modules |
| Navbar.jsx | `MLTSystem/src/components/Navbar.jsx` | Navigation across all modules |
| SessionTimeout.jsx | `MLTSystem/src/components/SessionTimeout.jsx` | Session management |
| socketService.js | `MLTSystem/src/services/socketService.js` | Real-time updates for bookings |
| User.js | `MLTSystem/src/models/User.js` | User data modeling |
| Role.js | `MLTSystem/src/models/Role.js` | Role-based access control |
| sessionManager.js | `MLTSystem/src/utils/sessionManager.js` | Session state management |

### Shared Backend Components
| File | Path | Used By |
|------|------|---------|
| auth.js (Middleware) | `Backend/app/middlewares/auth.js` | All routes for authentication |
| AuthController.js | `Backend/app/controllers/AuthController.js` | User authentication & authorization |
| database.js | `Backend/config/database.js` | All database operations |
| db.init.js | `Backend/config/db.init.js` | Database initialization on startup |
| server.js | `Backend/server.js` | Main Express server setup |

---

## 📊 Summary Statistics

| Metric | Count |
|--------|-------|
| **Frontend Pages** | 6 |
| **Frontend Components** | 4 |
| **Frontend Controllers** | 2 |
| **Frontend Utilities** | 3 |
| **Backend Routes (MVC)** | 4 |
| **Backend Controllers** | 3 |
| **Backend Routes (Legacy)** | 4 |
| **Database Tables** | 8 |
| **Total Booking Subsystem Files** | 35+ |

---

## 🗄️ Database Schema Reference

### Core Tables for Booking Subsystem

#### `tutor` Table
```
- tutorId (VARCHAR, PK)
- user_id (INT, FK to users.id)
- name (VARCHAR)
- specialization (VARCHAR)
- experience (INT)
- hourly_rate (DECIMAL)
- rating (FLOAT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `tutor_schedule` Table
```
- id (INT, PK)
- tutorId (VARCHAR, FK to tutor.tutorId)
- day_of_week (ENUM: Monday-Sunday)
- start_time (TIME)
- end_time (TIME)
- status (ENUM: available, booked, unavailable)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `booking` Table
```
- bookingId (INT, PK)
- studentId (VARCHAR, FK to student.studentId)
- tutorId (VARCHAR, FK to tutor.tutorId)
- booking_date (DATE)
- booking_time (TIME)
- duration (INT)
- status (ENUM: pending, confirmed, completed, cancelled)
- payment_status (ENUM: unpaid, paid, refunded)
- amount (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `student` Table
```
- studentId (VARCHAR, PK)
- user_id (INT, FK to users.id)
- name (VARCHAR)
- level (VARCHAR)
- goals (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `feedback` Table
```
- id (INT, PK)
- bookingId (INT, FK to booking.bookingId)
- studentId (VARCHAR, FK to student.studentId)
- tutorId (VARCHAR, FK to tutor.tutorId)
- rating (TINYINT: 1-5)
- comment (TEXT)
- is_anonymous (TINYINT)
- created_at (TIMESTAMP)
```

#### `notification` Table
```
- id (INT, PK)
- recipientId (VARCHAR, FK to users.userId)
- senderId (VARCHAR, FK to users.userId)
- bookingId (INT, FK to booking.bookingId)
- text (TEXT)
- type (ENUM: booking, payment, etc.)
- is_read (BOOLEAN)
- created_at (TIMESTAMP)
```

---

## 🔄 API Endpoints by Module

### Sprint 1: Search Tutor Module
```
GET    /api/tutors              - Get all tutors
GET    /api/tutors/:id          - Get tutor details
GET    /api/tutors/:id/reviews  - Get tutor reviews
```

### Sprint 2: Schedule Availability Module
```
GET    /api/schedule/:tutorId   - Get tutor's schedule
POST   /api/schedule            - Add schedule slot
PUT    /api/schedule/:id        - Update schedule slot
DELETE /api/schedule/:id        - Delete schedule slot
```

### Sprint 3: Make Booking Module
```
GET    /api/bookings            - Get user's bookings
GET    /api/bookings/:id        - Get booking details
POST   /api/bookings            - Create new booking
PUT    /api/bookings/:id        - Update booking
DELETE /api/bookings/:id        - Cancel booking
POST   /api/bookings/:id/feedback - Submit feedback
```

### Sprint 4: Make Payment Module
```
POST   /api/payments            - Process payment
GET    /api/payments/:id        - Get payment status
POST   /api/payments/:id/refund - Request refund
```

---

## 🚀 Deployment Notes

- All modules are interdependent
- Database must be initialized before backend starts
- Frontend requires backend API server running
- Authentication required for all booking operations
- Real-time updates use Socket.IO for notifications
