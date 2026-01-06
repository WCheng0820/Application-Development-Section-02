# 🍊Mandarin Language Tutoring System🍊
In this project,we decided to solve the problem and challenges that are faced by the Mandarin club by designing an innovative digital platform called Mandarin Language Tutoring System that aims to help Mandarin language learners to learn Mandarin from their tutors. With the growing global demand for Mandarin lessons, our system provides a personalized, engaging, and effective language learning experience that goes beyond traditional classroom methods.

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher)
- **MySQL** installed and running
- **Google Gemini API Key** (for AI Study Assistant)

### 1. Database Setup
1. Open your MySQL client (e.g., MySQL Workbench or Command Line).
2. Create a new database named `mlt_system`:
   ```sql
   CREATE DATABASE mlt_system;
   ```

### 2. Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Rename the env.md in Backend folder to .env and add the following environment variables to the file in the Backend directory (or use the default values):
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=mlt_system
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Initialize the database schema and seeded data:
   ```bash
   npm run init-db
   ```
5. Start the backend server:
   ```bash
   npm start
   ```

### 3. Frontend Configuration
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd MLTSystem
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

---

# 🔑Authentication Subsystem
**Developer: Chong Zu Wei**
| Sprint | Module Name | Frontend | Backend | Database |
|--------|----------|---------|---------|---------|
| **1**  | Register User's Info Module | [MLTSystem/src/pages/Register.jsx](MLTSystem/src/pages/Register.jsx)<br>[MLTSystem/src/models/Role.js](MLTSystem/src/models/Role.js)<br>[MLTSystem/src/models/User.js](MLTSystem/src/models/User.js)<br>[MLTSystem/src/context/AuthContext.jsx](MLTSystem/src/context/AuthContext.jsx)  |[Backend/app/controllers/AuthController.js](Backend/app/controllers/AuthController.js)<br>[Backend/app/routes/auth.js](Backend/app/routes/auth.js)<br>[Backend/routes/auth.js](Backend/routes/auth.js)<br>[Backend/app/middlewares/auth.js](Backend/app/middlewares/auth.js)|User,student,tutor,admin,sesison |
| **2**  | Login Module | [MLTSystem/src/pages/Login.jsx](MLTSystem/src/pages/Login.jsx) <br>[MLTSystem/src/models/Role.js](MLTSystem/src/models/Role.js)<br>[MLTSystem/src/models/User.js](MLTSystem/src/models/User.js)<br>[MLTSystem/src/context/AuthContext.jsx](MLTSystem/src/context/AuthContext.jsx)|[Backend/app/controllers/AuthController.js](Backend/app/controllers/AuthController.js)<br>[Backend/app/routes/auth.js](Backend/app/routes/auth.js)<br>[Backend/routes/auth.js](Backend/routes/auth.js)<br>[Backend/app/middlewares/auth.js](Backend/app/middlewares/auth.js) |User,student,tutor,admin,sesison |
| **3**  | Edit User Profile Module | [MLTSystem/src/pages/EditProfile.jsx](MLTSystem/src/pages/EditProfile.jsx) <br>[MLTSystem/src/models/Role.js](MLTSystem/src/models/Role.js)<br>[MLTSystem/src/models/User.js](MLTSystem/src/models/User.js)<br>[MLTSystem/src/context/AuthContext.jsx](MLTSystem/src/context/AuthContext.jsx)|[Backend/app/controllers/AuthController.js](Backend/app/controllers/AuthController.js)<br>[Backend/app/routes/auth.js](Backend/app/routes/auth.js)<br>[Backend/routes/auth.js](Backend/routes/auth.js)<br>[Backend/app/middlewares/auth.js](Backend/app/middlewares/auth.js)| User,student,tutor,admin,sesison|


# 📩Communication and Feedback Subsystem
**Developer: Tay Wei Cheng**
| Sprint | Module Name | Frontend | Backend | Database |
|--------|----------|---------|---------|---------|
| **1**  | Send Message and Receive Notification Module | | | |
| **2**  | Submit Feedback Module | | | |
| **3**  | Flag Report Module | | | |


# 📚Learning Material Access Subsystem
**Developer: Teow Zi Xian**
| Sprint | Module Name | Frontend | Backend | Database |
|--------|----------|---------|---------|---------|
| **1**  | Upload and categorize Materials Module | | | |
| **2**  | Access Material Library Module | | | |
| **3**  | Manage Learning Resource Module | | | |
| **4**  | Delete Material Module | | | |


# 📅 Booking Subsystem

**Developer: Chu Cheng Qing**

| Sprint | Module Name | Frontend | Backend | Database |
|--------|----------|---------|---------|---------|
| **1**  | Search Tutor Module | [MLTSystem/src/pages/FindTutors.jsx](MLTSystem/src/pages/FindTutors.jsx)<br>[MLTSystem/src/components/TutorCard.jsx](MLTSystem/src/components/TutorCard.jsx)<br>[MLTSystem/src/controllers/TutorsController.js](MLTSystem/src/controllers/TutorsController.js) | [Backend/app/routes/tutors.js](Backend/app/routes/tutors.js)<br>[Backend/app/controllers/TutorsController.js](Backend/app/controllers/TutorsController.js)<br>[Backend/routes/tutors.js](Backend/routes/tutors.js) | tutor<br>tutor_schedule<br>feedback |
| **2**  | Schedule Availability Module | [MLTSystem/src/pages/ManageSchedule.jsx](MLTSystem/src/pages/ManageSchedule.jsx)<br>[MLTSystem/src/pages/TutorSetup.jsx](MLTSystem/src/pages/TutorSetup.jsx)<br>[MLTSystem/src/components/ScheduleManager.jsx](MLTSystem/src/components/ScheduleManager.jsx)<br>[MLTSystem/src/controllers/ScheduleController.js](MLTSystem/src/controllers/ScheduleController.js)<br>[MLTSystem/src/utils/dateUtils.js](MLTSystem/src/utils/dateUtils.js) | [Backend/app/routes/schedule.js](Backend/app/routes/schedule.js)<br>[Backend/app/controllers/ScheduleController.js](Backend/app/controllers/ScheduleController.js)<br>[Backend/routes/schedule.js](Backend/routes/schedule.js) | tutor_schedule |
| **3**  | Make Booking Module | [MLTSystem/src/pages/Bookings.jsx](MLTSystem/src/pages/Bookings.jsx)<br>[MLTSystem/src/pages/StudentDashboard.jsx](MLTSystem/src/pages/StudentDashboard.jsx)<br>[MLTSystem/src/components/BookingCard.jsx](MLTSystem/src/components/BookingCard.jsx)<br>[(MLTSystem/src/components/RoleBasedDashboard.jsx](MLTSystem/src/components/RoleBasedDashboard.jsx)<br>[(MLTSystem/src/controllers/BookingsController.js](MLTSystem/src/controllers/BookingsController.js) | [Backend/app/routes/bookings.js](Backend/app/routes/bookings.js)<br>[Backend/app/controllers/BookingsController.js](Backend/app/controllers/BookingsController.js)<br>[Backend/routes/bookings.js](Backend/routes/bookings.js) | booking<br>student<br>feedback<br>sessions<br>notification |
| **4**  | Make Payment Module | [MLTSystem/src/pages/Payment.jsx](MLTSystem/src/pages/Payment.jsx) | [Backend/app/routes/payments.js](Backend/app/routes/payments.js)<br>[Backend/routes/payments.js](Backend/routes/payments.js)<br>[Backend/app/controllers/BookingsController.js](Backend/app/controllers/BookingsController.js) | booking<br>sessions |
