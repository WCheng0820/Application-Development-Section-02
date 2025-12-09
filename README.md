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

| Sprint | Module Name | Frontend | Backend | Database |
|--------|----------|---------|---------|---------|
| **1**  | Search Tutor Module | 
[FindTutors.jsx](MLTSystem/src/pages/FindTutors.jsx)<br>
[TutorCard.jsx](MLTSystem/src/components/TutorCard.jsx)<br>
[TutorsController.js](MLTSystem/src/controllers/TutorsController.js) | 
[app/routes/tutors.js](Backend/app/routes/tutors.js)<br>
[app/controllers/TutorsController.js](Backend/app/controllers/TutorsController.js)<br>
[routes/tutors.js](Backend/routes/tutors.js) | tutor<br>tutor_schedule<br>feedback |
| **2**  | Schedule Availability Module | 
[ManageSchedule.jsx](MLTSystem/src/pages/ManageSchedule.jsx)<br>
[TutorSetup.jsx](MLTSystem/src/pages/TutorSetup.jsx)<br>
[ScheduleManager.jsx](MLTSystem/src/components/ScheduleManager.jsx)<br>
[ScheduleController.js](MLTSystem/src/controllers/ScheduleController.js)<br>
[dateUtils.js](MLTSystem/src/utils/dateUtils.js) | 
[app/routes/schedule.js](Backend/app/routes/schedule.js)<br>
[app/controllers/ScheduleController.js](Backend/app/controllers/ScheduleController.js)<br>
[routes/schedule.js](Backend/routes/schedule.js) | tutor_schedule |
| **3**  | Make Booking Module | 
[Bookings.jsx](MLTSystem/src/pages/Bookings.jsx)<br>
[StudentDashboard.jsx](MLTSystem/src/pages/StudentDashboard.jsx)<br>
[BookingCard.jsx](MLTSystem/src/components/BookingCard.jsx)<br>
[RoleBasedDashboard.jsx](MLTSystem/src/components/RoleBasedDashboard.jsx)<br>
[BookingsController.js](MLTSystem/src/controllers/BookingsController.js) |
[app/routes/bookings.js](Backend/app/routes/bookings.js)<br>
[app/controllers/BookingsController.js](Backend/app/controllers/BookingsController.js)<br>
[routes/bookings.js](Backend/routes/bookings.js) |
booking<br>student<br>feedback<br>sessions<br>notification |
| **4**  | Make Payment Module | 
[Payment.jsx](MLTSystem/src/pages/Payment.jsx) | 
[app/routes/payments.js](Backend/app/routes/payments.js)<br>
[routes/payments.js](Backend/routes/payments.js)<br>
[app/controllers/BookingsController.js](Backend/app/controllers/BookingsController.js) | 
booking<br>sessions |

