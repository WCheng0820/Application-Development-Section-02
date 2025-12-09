# 🍊Mandarin Language Tutoring System🍊
In this project,we decided to solve the problem and challenges that are faced by the Mandarin club by designing an innovative digital platform called Mandarin Language Tutoring System that aims to help Mandarin language learners to learn Mandarin from their tutors. With the growing global demand for Mandarin lessons, our system provides a personalized, engaging, and effective language learning experience that goes beyond traditional classroom methods.

# 🔑Authentication Subsystem
**Developer: Chong Zu Wei**
| Sprint | Module Name | Frontend | Backend | Database |
|--------|----------|---------|---------|---------|
| **1**  | Register User's Info Module | | | |
| **2**  | Login Module | | | |
| **3**  | Edit User Profile Module | | | |


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


**Developer: Chu Cheng Qing**

| Sprint | Module Name | Frontend Files | Backend Files | Database Tables |
|--------|-------------|----------------|----------------|------------------|
| **1** | **Search Tutor Module** | 
- [FindTutors.jsx](MLTSystem/src/pages/FindTutors.jsx)  
- [TutorCard.jsx](MLTSystem/src/components/TutorCard.jsx)  
- [TutorsController.js](MLTSystem/src/controllers/TutorsController.js) | 
- [tutors.js (app routes)](Backend/app/routes/tutors.js)  
- [TutorsController.js (app controllers)](Backend/app/controllers/TutorsController.js)  
- [tutors.js (root routes)](Backend/routes/tutors.js) | 
- tutor  
- tutor_schedule  
- feedback |
| **2** | **Schedule Availability Module** | 
- [ManageSchedule.jsx](MLTSystem/src/pages/ManageSchedule.jsx)  
- [TutorSetup.jsx](MLTSystem/src/pages/TutorSetup.jsx)  
- [ScheduleManager.jsx](MLTSystem/src/components/ScheduleManager.jsx)  
- [ScheduleController.js](MLTSystem/src/controllers/ScheduleController.js)  
- [dateUtils.js](MLTSystem/src/utils/dateUtils.js) | 
- [schedule.js (app routes)](Backend/app/routes/schedule.js)  
- [ScheduleController.js (app controllers)](Backend/app/controllers/ScheduleController.js)  
- [schedule.js (root routes)](Backend/routes/schedule.js) | 
- tutor_schedule |
| **3** | **Make Booking Module** | 
- [Bookings.jsx](MLTSystem/src/pages/Bookings.jsx)  
- [StudentDashboard.jsx](MLTSystem/src/pages/StudentDashboard.jsx)  
- [BookingCard.jsx](MLTSystem/src/components/BookingCard.jsx)  
- [RoleBasedDashboard.jsx](MLTSystem/src/components/RoleBasedDashboard.jsx)  
- [BookingsController.js](MLTSystem/src/controllers/BookingsController.js) | 
- [bookings.js (app routes)](Backend/app/routes/bookings.js)  
- [BookingsController.js (app controllers)](Backend/app/controllers/BookingsController.js)  
- [bookings.js (root routes)](Backend/routes/bookings.js) | 
- booking  
- student  
- feedback  
- sessions  
- notification |
| **4** | **Make Payment Module** | 
- [Payment.jsx](MLTSystem/src/pages/Payment.jsx) | 
- [payments.js (app routes)](Backend/app/routes/payments.js)  
- [payments.js (root routes)](Backend/routes/payments.js)  
- [BookingsController.js](Backend/app/controllers/BookingsController.js) | 
- booking  
- sessions |

