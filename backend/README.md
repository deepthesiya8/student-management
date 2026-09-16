# Student Management System - MERN Stack Backend

**Course**: Advance Web Technology (Advance Technology Lab)  
**Developers**: Deep Thesiya (24CEUOS155) & Deep Bhatu (23CEUBG010)  
**Instructor / Lab Incharge**: Prof. Vrund Dobariya  
**Institution**: Dharmsinh Desai University (DDU)  

---

## 📌 Technology Stack

- **Runtime**: Node.js (v24.x)
- **Framework**: Express.js
- **Database**: MongoDB (`StudentManagementDB`) with Mongoose ODM
- **Authentication**: JSON Web Token (JWT) & bcryptjs password hashing
- **Security**: Helmet, CORS, Error Handling Middleware, Role-Based Access Control (RBAC)
- **File Upload**: Multer (Profile picture/avatar upload)

---

## 🚀 Quick Start Guide

### 1. Navigate to the backend directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
A `.env` file is already provided. If needed, customize `PORT` or `MONGO_URI`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/StudentManagementDB
JWT_SECRET=student_mgmt_mern_secret_key_2026_ddu
JWT_EXPIRES_IN=7d
```

### 4. Seed Database with Sample Data
Populates the database with initial Admin, Teachers (Prof. Vrund Dobariya, Prof. Neha Sharma), Students (Deep Thesiya, Deep Bhatu, Rahul Patel), Courses, Attendance, Marks, Notifications, and Queries:
```bash
npm run seed
```

### 5. Start Server
- Development (with Nodemon):
  ```bash
  npm run dev
  ```
- Production:
  ```bash
  npm start
  ```

### 6. Run Automated API Tests
Verifies all endpoints, JWT auth, RBAC protection, and calculations:
```bash
npm run test:api
```

---

## 🔑 Default Seeded Credentials

| Role | Name | Email | Password | ID |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | System Administrator | `admin@ddu.ac.in` | `admin123` | - |
| **Teacher** | Prof. Vrund Dobariya | `vrund@ddu.ac.in` | `teacher123` | `TCH-CE-01` |
| **Teacher** | Prof. Neha Sharma | `neha@ddu.ac.in` | `teacher123` | `TCH-CE-02` |
| **Student** | Deep Thesiya | `24ceuos155@ddu.ac.in` | `student123` | `24CEUOS155` |
| **Student** | Deep Bhatu | `23ceubg010@ddu.ac.in` | `student123` | `23CEUBG010` |
| **Student** | Rahul Patel | `rahul.patel@ddu.ac.in` | `student123` | `101` |

---

## 📂 Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection logic
├── controllers/
│   ├── authController.js     # Login, Register, Profile, Password, Uploads
│   ├── userController.js     # Admin User CRUD, Search, Filter (Dept/Sem/Role)
│   ├── studentController.js  # Student CRUD & enrollment
│   ├── teacherController.js  # Teacher CRUD & assigned courses
│   ├── courseController.js   # Course CRUD, Assign Teacher & Students
│   ├── attendanceController.js # Record, update, calculate attendance %
│   ├── marksController.js    # Enter marks, calculate grades & result
│   ├── dashboardController.js# Role-specific statistics
│   ├── notificationController.js # Announcements & alerts
│   └── queryController.js    # Student-teacher query & responses
├── middleware/
│   ├── authMiddleware.js     # JWT verification & RBAC check
│   ├── errorMiddleware.js    # Centralized error handler
│   └── uploadMiddleware.js   # Multer file upload configuration
├── models/
│   ├── User.js               # User accounts (Admin/Teacher/Student)
│   ├── Student.js            # Student profile linked to User
│   ├── Teacher.js            # Teacher profile linked to User
│   ├── Course.js             # Course catalog & enrollment
│   ├── Attendance.js         # Daily attendance records
│   ├── Marks.js              # Exam marks & evaluations
│   ├── Notification.js       # Broadcast announcements & notices
│   └── Query.js              # Student query & Teacher reply
├── routes/
│   ├── authRoutes.js         # /api/auth
│   ├── userRoutes.js         # /api/users
│   ├── studentRoutes.js      # /api/students
│   ├── teacherRoutes.js      # /api/teachers
│   ├── courseRoutes.js       # /api/courses
│   ├── attendanceRoutes.js   # /api/attendance
│   ├── marksRoutes.js        # /api/marks
│   ├── dashboardRoutes.js    # /api/dashboard
│   ├── notificationRoutes.js # /api/notifications
│   └── queryRoutes.js        # /api/queries
├── seed.js                   # Seed script
├── test-api.js               # API test suite
├── server.js                 # Express server entry point
├── package.json              # NPM dependencies & scripts
└── .env                      # Environment variables
```

---

## 📡 API Endpoints Overview

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register`: Register student
- `POST /api/auth/login`: Authenticate and obtain JWT token
- `GET /api/auth/me`: Get current authenticated user profile
- `PUT /api/auth/profile`: Update user profile details
- `PUT /api/auth/change-password`: Update password
- `POST /api/auth/upload-photo`: Upload profile picture (Multipart Form `photo`)

### 2. User Management (`/api/users`) - Admin Only
- `GET /api/users?role=&department=&semester=&search=`: Filter and search users
- `POST /api/users`: Create user with specific role
- `GET /api/users/:id`: Get user details with role profile
- `PUT /api/users/:id`: Update user
- `DELETE /api/users/:id`: Delete user and cascade delete profile

### 3. Student Management (`/api/students`)
- `GET /api/students?department=&semester=&search=`: List students
- `GET /api/students/:id`: Single student with enrolled courses and attendance summary
- `POST /api/students`: Create student (Admin)
- `PUT /api/students/:id`: Update student (Admin)
- `DELETE /api/students/:id`: Delete student (Admin)

### 4. Course Management (`/api/courses`)
- `GET /api/courses`: List courses
- `GET /api/courses/:id`: Course details with teacher & enrolled students
- `POST /api/courses`: Create course (Admin)
- `PUT /api/courses/:id`: Update course (Admin)
- `DELETE /api/courses/:id`: Delete course (Admin)
- `POST /api/courses/:id/assign-teacher`: Assign teacher (Admin)
- `POST /api/courses/:id/assign-students`: Assign students (Admin/Teacher)

### 5. Attendance Management (`/api/attendance`)
- `POST /api/attendance`: Record single or batch attendance (Teacher/Admin)
- `PUT /api/attendance/:id`: Update attendance record (Teacher/Admin)
- `GET /api/attendance/course/:courseId?date=`: Course attendance sheet
- `GET /api/attendance/student/:studentId`: Student attendance history & percentage
- `GET /api/attendance/report`: Attendance statistics report

### 6. Marks & Result Management (`/api/marks`)
- `POST /api/marks`: Enter marks (Teacher/Admin)
- `PUT /api/marks/:id`: Update marks (Teacher/Admin)
- `GET /api/marks/student/:studentId`: Student marks, overall percentage, grades & pass/fail status
- `GET /api/marks/course/:courseId`: Course marks sheet
- `GET /api/marks/report`: Result reports

### 7. Dashboards (`/api/dashboard`)
- `GET /api/dashboard/admin`: System statistics (total counts, department breakdown, attendance rate)
- `GET /api/dashboard/teacher`: Assigned courses, student counts, pending queries
- `GET /api/dashboard/student`: Enrolled courses, attendance summary, latest marks, notifications

### 8. Notifications (`/api/notifications`)
- `POST /api/notifications`: Publish notification (Admin/Teacher)
- `GET /api/notifications`: View role-based notifications
- `PUT /api/notifications/:id/read`: Mark as read

### 9. Query Management (`/api/queries`)
- `POST /api/queries`: Submit query to teacher (Student)
- `GET /api/queries`: View queries (Filtered by role)
- `PUT /api/queries/:id/respond`: Respond to student query (Teacher)
