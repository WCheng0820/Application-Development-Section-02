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


# 📅 Booking Subsystem

**Developer: Chu Cheng Qing**

| Sprint | Module Name | Frontend | Backend | Database |
|--------|----------|---------|---------|---------|
| **1**  | Search Tutor Module | [MLTSystem/src/pages/FindTutors.jsx](MLTSystem/src/pages/FindTutors.jsx)<br>[MLTSystem/src/components/TutorCard.jsx](MLTSystem/src/components/TutorCard.jsx)<br>[MLTSystem/src/controllers/TutorsController.js](MLTSystem/src/controllers/TutorsController.js) | [Backend/app/routes/tutors.js](Backend/app/routes/tutors.js)<br>[Backend/app/controllers/TutorsController.js](Backend/app/controllers/TutorsController.js)<br>[Backend/routes/tutors.js](Backend/routes/tutors.js) | tutor<br>tutor_schedule<br>feedback |
| **2**  | Schedule Availability Module | [MLTSystem/src/pages/ManageSchedule.jsx](MLTSystem/src/pages/ManageSchedule.jsx)<br>[MLTSystem/src/pages/TutorSetup.jsx](MLTSystem/src/pages/TutorSetup.jsx)<br>[MLTSystem/src/components/ScheduleManager.jsx](MLTSystem/src/components/ScheduleManager.jsx)<br>[MLTSystem/src/controllers/ScheduleController.js](MLTSystem/src/controllers/ScheduleController.js)<br>[MLTSystem/src/utils/dateUtils.js](MLTSystem/src/utils/dateUtils.js) | [Backend/app/routes/schedule.js](Backend/app/routes/schedule.js)<br>[Backend/app/controllers/ScheduleController.js](Backend/app/controllers/ScheduleController.js)<br>[Backend/routes/schedule.js](Backend/routes/schedule.js) | tutor_schedule |
| **3**  | Make Booking Module | [MLTSystem/src/pages/Bookings.jsx](MLTSystem/src/pages/Bookings.jsx)<br>[MLTSystem/src/pages/StudentDashboard.jsx](MLTSystem/src/pages/StudentDashboard.jsx)<br>[MLTSystem/src/components/BookingCard.jsx](MLTSystem/src/components/BookingCard.jsx)<br>[(MLTSystem/src/components/RoleBasedDashboard.jsx](MLTSystem/src/components/RoleBasedDashboard.jsx)<br>[(MLTSystem/src/controllers/BookingsController.js](MLTSystem/src/controllers/BookingsController.js) | [Backend/app/routes/bookings.js](Backend/app/routes/bookings.js)<br>[Backend/app/controllers/BookingsController.js](Backend/app/controllers/BookingsController.js)<br>[Backend/routes/bookings.js](Backend/routes/bookings.js) | booking<br>student<br>feedback<br>sessions<br>notification |
| **4**  | Make Payment Module | [MLTSystem/src/pages/Payment.jsx](MLTSystem/src/pages/Payment.jsx) | [Backend/app/routes/payments.js](Backend/app/routes/payments.js)<br>[Backend/routes/payments.js](Backend/routes/payments.js)<br>[Backend/app/controllers/BookingsController.js](Backend/app/controllers/BookingsController.js) | booking<br>sessions |
