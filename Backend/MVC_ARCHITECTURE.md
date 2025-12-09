# MLT System - MVC Architecture Structure

## Project Structure

```
Backend/
├── app/                           # Main application folder (MVC)
│   ├── controllers/               # Business logic handlers
│   │   ├── AuthController.js      # Authentication & user management
│   │   ├── TutorsController.js    # Tutor management
│   │   ├── BookingsController.js  # Booking management
│   │   ├── ScheduleController.js  # Schedule management
│   │   └── (more controllers)
│   │
│   ├── routes/                    # API route definitions
│   │   ├── auth.js               # Auth endpoints
│   │   ├── tutors.js             # Tutor endpoints
│   │   ├── bookings.js           # Booking endpoints
│   │   ├── schedule.js           # Schedule endpoints
│   │   └── (more routes)
│   │
│   ├── middlewares/              # Middleware functions
│   │   └── auth.js               # Authentication middleware (verifyToken, optionalAuth)
│   │
│   ├── models/                   # Data models (to be populated)
│   │   └── (model definitions)
│   │
│   ├── utils/                    # Utility functions
│   │   └── (utility helpers)
│   │
│   └── views/                    # Response templates (if needed)
│
├── config/                        # Configuration files
│   ├── database.js               # Database connection pool
│   └── db.init.js                # Database initialization script
│
├── database/                      # Database management
│   ├── migrations/               # Migration scripts
│   └── seeders/                  # Seeding scripts
│
├── routes/                        # Original routes (being deprecated)
│   ├── auth.js
│   ├── bookings.js
│   ├── tutors.js
│   ├── schedule.js
│   ├── messages.js
│   ├── payments.js
│   ├── admin.js
│   └── reports.js
│
├── scripts/                       # Utility scripts
│   ├── seed-database.js
│   ├── verify-system.js
│   └── (other utilities)
│
├── server.js                      # Express app entry point (updated for MVC)
├── package.json                   # Dependencies
└── README.md                      # Documentation
```

## Architecture Overview

### MVC Components

**Model (app/models/)**
- Data structure definitions
- Database schemas representation
- Entity relationships

**View (app/views/)**
- Response formatting helpers
- Template responses
- Serialization logic

**Controller (app/controllers/)**
- Business logic processing
- Request handling
- Response generation
- Data transformation
- Error handling

### Routes (app/routes/)
- Express route definitions
- Endpoint mapping to controllers
- Middleware application
- Request validation

### Middlewares (app/middlewares/)
- Authentication (verifyToken, optionalAuth)
- Authorization checks
- Request validation
- Error handling

### Database Layer
- `config/database.js` - Connection pool & query helper
- `config/db.init.js` - Table creation & initialization
- `database/migrations/` - Schema changes
- `database/seeders/` - Sample data population

## Current Controllers

### AuthController
**Location:** `app/controllers/AuthController.js`
**Methods:**
- `register()` - User registration
- `login()` - User authentication
- `verify()` - Token verification
- `logout()` - User logout
- `updateProfile()` - Profile updates
- `getPendingTutors()` - List pending tutors (admin)
- `approveTutor()` - Approve tutor (admin)
- `rejectTutor()` - Reject tutor (admin)

**Routes:** `POST /api/auth/register`, `POST /api/auth/login`, etc.

### TutorsController
**Location:** `app/controllers/TutorsController.js`
**Methods:**
- `getAll()` - List all tutors
- `getById()` - Get specific tutor
- `create()` - Create new tutor
- `update()` - Update tutor info
- `delete()` - Delete tutor
- `getReviews()` - Get tutor reviews/feedback

**Routes:** `GET /api/tutors`, `POST /api/tutors`, etc.

### BookingsController
**Location:** `app/controllers/BookingsController.js`
**Methods:**
- `getAll()` - List bookings (role-based filtering)
- `getById()` - Get specific booking
- `create()` - Create new booking
- `update()` - Update booking status
- `delete()` - Cancel booking
- `submitFeedback()` - Submit booking feedback
- `getFeedback()` - Retrieve booking feedback

**Routes:** `GET /api/bookings`, `POST /api/bookings`, etc.

## Migration Status

### Fully Migrated to MVC
✅ Authentication (AuthController)
✅ Tutors (TutorsController)
✅ Bookings (BookingsController)

### Using Router Passthrough
⏳ Schedule (routes/schedule.js → app/routes/schedule.js)
⏳ Messages (routes/messages.js → app/routes/messages.js)
⏳ Admin (routes/admin.js → app/routes/admin.js)
⏳ Payments (routes/payments.js → app/routes/payments.js)
⏳ Reports (routes/reports.js → app/routes/reports.js)

### Benefits of MVC Architecture

1. **Separation of Concerns**
   - Controllers handle logic
   - Routes define endpoints
   - Middlewares handle cross-cutting concerns

2. **Scalability**
   - Easy to add new features
   - Clear file organization
   - Reduced code duplication

3. **Maintainability**
   - Business logic isolated
   - Easier to test
   - Clear dependency flow

4. **Reusability**
   - Controllers can be imported in multiple routes
   - Middleware can be shared
   - Helper functions in utils

5. **Testing**
   - Controllers can be unit tested independently
   - Mockable dependencies
   - Clear input/output contracts

## Next Steps for Full Migration

1. **Create remaining controllers**
   - ScheduleController
   - MessagesController
   - PaymentsController
   - ReportsController
   - AdminController

2. **Refactor remaining routes**
   - Extract logic from routes into controllers
   - Update app/routes/* to use controllers

3. **Create models** (optional but recommended)
   - Define data structures
   - Add validation rules
   - Improve type safety

4. **Add utilities**
   - Helper functions
   - Common calculations
   - Formatting utilities

5. **Add error handling**
   - Custom error classes
   - Centralized error handler
   - Consistent error responses

## Running the Application

```bash
# Start the server (uses new MVC structure)
npm start

# Server will load routes from app/routes/* which use controllers from app/controllers/*
```

The server automatically imports all routes from the app/routes directory and uses the appropriate controllers for handling requests.
