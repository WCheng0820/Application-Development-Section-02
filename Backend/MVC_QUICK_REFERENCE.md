# MVC File Structure Quick Reference

## 📂 Directory Tree

```
Backend/
│
├── 📁 app/                              ← MVC APPLICATION ROOT
│   │
│   ├── 📁 controllers/                  ← BUSINESS LOGIC
│   │   ├── AuthController.js            (Handles: register, login, verify, logout, profile, etc.)
│   │   ├── BookingsController.js        (Handles: CRUD bookings, feedback, ratings)
│   │   ├── TutorsController.js          (Handles: tutor CRUD, reviews)
│   │   └── ScheduleController.js        (Handles: schedule management)
│   │
│   ├── 📁 routes/                       ← HTTP ROUTE DEFINITIONS
│   │   ├── auth.js                      → AuthController methods
│   │   ├── bookings.js                  → BookingsController methods
│   │   ├── tutors.js                    → TutorsController methods
│   │   ├── schedule.js                  → Legacy routes (passthrough)
│   │   ├── messages.js                  → Legacy routes (passthrough)
│   │   ├── admin.js                     → Legacy routes (passthrough)
│   │   ├── payments.js                  → Legacy routes (passthrough)
│   │   └── reports.js                   → Legacy routes (passthrough)
│   │
│   ├── 📁 middlewares/                  ← CROSS-CUTTING CONCERNS
│   │   └── auth.js                      (verifyToken, optionalAuth)
│   │
│   ├── 📁 models/                       ← DATA MODELS (Prepared for future)
│   ├── 📁 utils/                        ← UTILITY FUNCTIONS (Prepared for future)
│   └── 📁 views/                        ← RESPONSE TEMPLATES (Prepared for future)
│
├── 📁 config/                           ← CONFIGURATION
│   ├── database.js                      (Connection pool, query helper)
│   └── db.init.js                       (Table creation, initialization)
│
├── 📁 database/                         ← DATABASE MANAGEMENT
│   ├── migrations/                      (Schema changes - prepared)
│   └── seeders/                         (Sample data - prepared)
│
├── 📁 routes/                           ← LEGACY ROUTES (Maintained for compatibility)
│   └── (auth.js, bookings.js, etc.)
│
├── 📁 scripts/                          ← UTILITY SCRIPTS
│   ├── seed-database.js
│   ├── verify-system.js
│   └── (other utilities)
│
├── server.js                            ← EXPRESS APP ENTRY POINT (UPDATED)
├── package.json
├── .env (if configured)
│
├── 📄 MVC_ARCHITECTURE.md              ← DETAILED ARCHITECTURE GUIDE
├── 📄 MVC_REFACTORING_SUMMARY.md       ← IMPLEMENTATION SUMMARY
└── 📄 README.md                         ← UPDATED PROJECT DOCS

```

---

## 🎯 How Requests Flow Through MVC

```
HTTP Request
    ↓
server.js (Express setup + Socket.io)
    ↓
app/routes/*.js (Route matching)
    ↓
app/middlewares/*.js (Authentication, validation)
    ↓
app/controllers/*.js (Business logic execution)
    ↓
config/database.js (Database queries)
    ↓
MySQL Database
    ↓
Response JSON
```

---

## 📋 Controller Methods Reference

### AuthController.js
```javascript
POST   /api/auth/register              → AuthController.register()
POST   /api/auth/login                 → AuthController.login()
GET    /api/auth/verify                → AuthController.verify()
POST   /api/auth/logout                → AuthController.logout()
PUT    /api/auth/profile               → AuthController.updateProfile()
GET    /api/auth/pending-tutors        → AuthController.getPendingTutors()
POST   /api/auth/approve-tutor         → AuthController.approveTutor()
POST   /api/auth/reject-tutor          → AuthController.rejectTutor()
```

### BookingsController.js
```javascript
GET    /api/bookings                   → BookingsController.getAll()
GET    /api/bookings/:id               → BookingsController.getById()
POST   /api/bookings                   → BookingsController.create()
PUT    /api/bookings/:id               → BookingsController.update()
DELETE /api/bookings/:id               → BookingsController.delete()
POST   /api/bookings/:id/feedback      → BookingsController.submitFeedback()
GET    /api/bookings/:id/feedback      → BookingsController.getFeedback()
```

### TutorsController.js
```javascript
GET    /api/tutors                     → TutorsController.getAll()
GET    /api/tutors/:id                 → TutorsController.getById()
POST   /api/tutors                     → TutorsController.create()
PUT    /api/tutors/:id                 → TutorsController.update()
DELETE /api/tutors/:id                 → TutorsController.delete()
GET    /api/tutors/:id/reviews         → TutorsController.getReviews()
```

---

## 🔐 Middleware Usage

### verifyToken (Required Auth)
Used on protected endpoints:
```javascript
router.get('/:id', verifyToken, BookingsController.getById);
// User must provide valid Bearer token
```

### optionalAuth (Optional Auth)
Used on public endpoints with optional filtering:
```javascript
router.get('/', optionalAuth, BookingsController.getAll);
// Works with or without token, filters based on presence
```

---

## 📝 File Naming Convention

| Type | Location | Format | Example |
|------|----------|--------|---------|
| Controller | `app/controllers/` | `{Feature}Controller.js` | `AuthController.js` |
| Route | `app/routes/` | `{feature}.js` | `auth.js` |
| Middleware | `app/middlewares/` | `{function}.js` | `auth.js` |
| Model | `app/models/` | `{Entity}.js` | `User.js` |
| Utility | `app/utils/` | `{function}.js` | `validation.js` |

---

## 🚀 Starting Development

### 1. Create New Feature

**Step 1: Create Controller**
```javascript
// app/controllers/NewController.js
class NewController {
    static async getAll(req, res) {
        // Logic here
        res.json({ success: true, data: [] });
    }
    static async create(req, res) {
        // Logic here
        res.status(201).json({ success: true, data: {} });
    }
}
module.exports = NewController;
```

**Step 2: Create Routes**
```javascript
// app/routes/new.js
const router = require('express').Router();
const NewController = require('../controllers/NewController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', NewController.getAll);
router.post('/', verifyToken, NewController.create);

module.exports = router;
```

**Step 3: Register Routes**
```javascript
// In server.js, add:
const newRoutes = require('./app/routes/new');
app.use('/api/new', newRoutes);
```

### 2. Test Your Feature

```bash
npm start
# Server runs on http://localhost:5000
# Test endpoints: GET http://localhost:5000/api/new
```

---

## 🔄 Migration Progress

| Component | Status | Notes |
|-----------|--------|-------|
| AuthController | ✅ Complete | All auth methods implemented |
| BookingsController | ✅ Complete | Full CRUD + feedback |
| TutorsController | ✅ Complete | Full CRUD + reviews |
| Auth Routes | ✅ Refactored | Uses AuthController |
| Bookings Routes | ✅ Refactored | Uses BookingsController |
| Tutors Routes | ✅ Refactored | Uses TutorsController |
| Schedule Routes | ⏳ Passthrough | Working, awaiting full refactor |
| Messages Routes | ⏳ Passthrough | Working, awaiting full refactor |
| Admin Routes | ⏳ Passthrough | Working, awaiting full refactor |
| Payments Routes | ⏳ Passthrough | Working, awaiting full refactor |
| Reports Routes | ⏳ Passthrough | Working, awaiting full refactor |

---

## ✨ Best Practices

### In Controllers
- ✅ Keep logic clean and focused
- ✅ Use async/await for clarity
- ✅ Handle errors with try/catch
- ✅ Return consistent JSON responses
- ✅ Validate input data

### In Routes
- ✅ Keep route definitions minimal
- ✅ Use middleware for auth/validation
- ✅ Map endpoints to controller methods
- ✅ Use appropriate HTTP methods
- ✅ Set correct status codes

### In Middlewares
- ✅ Focus on cross-cutting concerns
- ✅ Use next() to pass control
- ✅ Handle errors before next()
- ✅ Make them reusable
- ✅ Document expected behavior

---

## 🐛 Debugging Tips

1. **Check Server Startup**
   ```bash
   npm start
   # Should see: ✅ Database ready
   ```

2. **Test Endpoint**
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Check Logs**
   - Watch server console for errors
   - Check database connection logs
   - Monitor Socket.io events

4. **Verify Route Mapping**
   - Check that controller import is correct
   - Verify method names match
   - Ensure middleware order is correct

---

## 📚 Documentation Files

- **MVC_ARCHITECTURE.md** - Detailed architecture explanation
- **MVC_REFACTORING_SUMMARY.md** - Implementation details
- **README.md** - Setup and running instructions
- **Controller files** - Inline method documentation

---

## 🎓 Understanding MVC

**Model (M)**: Data structure
- Currently: Database queries in controllers
- Future: Dedicated model classes

**View (V)**: Response formatting
- Currently: Direct JSON responses
- Future: Dedicated view/serializer classes

**Controller (C)**: Business logic
- Current: ✅ AuthController, BookingsController, TutorsController
- Handles requests → processes → sends responses

---

## ✅ Verification Checklist

- [x] MVC folders created
- [x] Controllers implemented
- [x] Routes refactored
- [x] Middleware extracted
- [x] Server updated
- [x] Database working
- [x] All endpoints functional
- [x] Backward compatible
- [x] Documentation complete

---

**Status: MVC Architecture Successfully Implemented** ✨
