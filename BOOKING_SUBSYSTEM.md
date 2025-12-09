# 📅 Booking Subsystem

**Developer: Chu Cheng Qing**

| Sprint | Module Name | Frontend | Backend | Database |
|--------|----------|---------|---------|---------|
| **1**  | Search Tutor Module | [MLTSystem/src/pages/FindTutors.jsx](MLTSystem/src/pages/FindTutors.jsx)<br>[MLTSystem/src/components/TutorCard.jsx](MLTSystem/src/components/TutorCard.jsx)<br>[MLTSystem/src/controllers/TutorsController.js](MLTSystem/src/controllers/TutorsController.js) | [Backend/app/routes/tutors.js](Backend/app/routes/tutors.js)<br>[Backend/app/controllers/TutorsController.js](Backend/app/controllers/TutorsController.js)<br>[Backend/routes/tutors.js](Backend/routes/tutors.js) | tutor<br>tutor_schedule<br>feedback |
| **2**  | Schedule Availability Module | [MLTSystem/src/pages/ManageSchedule.jsx](MLTSystem/src/pages/ManageSchedule.jsx)<br>[MLTSystem/src/pages/TutorSetup.jsx](MLTSystem/src/pages/TutorSetup.jsx)<br>[MLTSystem/src/components/ScheduleManager.jsx](MLTSystem/src/components/ScheduleManager.jsx)<br>[MLTSystem/src/controllers/ScheduleController.js](MLTSystem/src/controllers/ScheduleController.js)<br>[MLTSystem/src/utils/dateUtils.js](MLTSystem/src/utils/dateUtils.js) | [Backend/app/routes/schedule.js](Backend/app/routes/schedule.js)<br>[Backend/app/controllers/ScheduleController.js](Backend/app/controllers/ScheduleController.js)<br>[Backend/routes/schedule.js](Backend/routes/schedule.js) | tutor_schedule |
| **3**  | Make Booking Module | [MLTSystem/src/pages/Bookings.jsx](MLTSystem/src/pages/Bookings.jsx)<br>[MLTSystem/src/pages/StudentDashboard.jsx](MLTSystem/src/pages/StudentDashboard.jsx)<br>[MLTSystem/src/components/BookingCard.jsx](MLTSystem/src/components/BookingCard.jsx)<br>[(MLTSystem/src/components/RoleBasedDashboard.jsx](MLTSystem/src/components/RoleBasedDashboard.jsx)<br>[(MLTSystem/src/controllers/BookingsController.js](MLTSystem/src/controllers/BookingsController.js) | [Backend/app/routes/bookings.js](Backend/app/routes/bookings.js)<br>[Backend/app/controllers/BookingsController.js](Backend/app/controllers/BookingsController.js)<br>[Backend/routes/bookings.js](Backend/routes/bookings.js) | booking<br>student<br>feedback<br>sessions<br>notification |
| **4**  | Make Payment Module | [MLTSystem/src/pages/Payment.jsx](MLTSystem/src/pages/Payment.jsx) | [Backend/app/routes/payments.js](Backend/app/routes/payments.js)<br>[Backend/routes/payments.js](Backend/routes/payments.js)<br>[Backend/app/controllers/BookingsController.js](Backend/app/controllers/BookingsController.js) | booking<br>sessions |

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

## 🗄️ Comprehensive Database Schema

📖 **See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for complete documentation of all 11 tables with:**
- Detailed attribute descriptions
- Data types and constraints
- Business rules and workflows
- Entity relationships
- Performance optimization notes
- Query examples
- Data integrity rules

### Quick Reference - Tables Used in Booking Subsystem

| Table | Attributes | Purpose |
|-------|-----------|---------|
| **users** | id, userId, username, email, password, role, status | Authentication & core user data |
| **tutor** | tutorId, user_id, name, yearsOfExperience, rating, rating_count, price, specialization, bio | Tutor profiles & ratings |
| **student** | studentId, user_id, yearOfStudy, programme, faculty | Student profiles |
| **tutor_schedule** | schedule_id, tutorId, schedule_date, start_time, end_time, status (free/reserved/booked) | Availability slots with 3-state machine |
| **booking** | bookingId, tutorId, studentId, booking_date, start_time, end_time, subject, status | Confirmed bookings |
| **feedback** | id, bookingId, studentId, tutorId, rating (1-5), comment, is_anonymous | Student reviews (1:1 per booking) |
| **message** | id, bookingId, senderId, recipientId, content, attachment_* | Direct messaging with file support |
| **notification** | id, recipientId, senderId, type (message/booking/feedback/report), is_read | In-app notifications |
| **sessions** | id, user_id, token, expires_at | Active session management |
| **admin** | adminId, user_id, name | Admin accounts |
| **reports** | id, reporter_id, reported_id, category, status | Incident reporting |

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
