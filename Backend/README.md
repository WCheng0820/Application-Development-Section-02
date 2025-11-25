# MLT System Backend

Backend API server for the Mandarin Language Tutoring System.

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Create a `.env` file in the Backend directory (or use the default values):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mlt_system
PORT=5000
NODE_ENV=development
```

### 3. Create MySQL Database

Make sure MySQL is running, then initialize the database:

```bash
npm run init-db
```

This will:
- Create the `mlt_system` database if it doesn't exist
- Create all necessary tables (users, sessions)
- Insert a default admin user (email: `admin@mltsystem.com`, password: `admin123`)

### 4. Start the Server

```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Check server and database status

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify session token
- `POST /api/auth/logout` - Logout user

### Example API Calls

#### Register
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "student",
  "fullName": "John Doe"
}
```

#### Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password` - Hashed password
- `role` - Enum: 'student', 'tutor', 'admin'
- `is_approved` - Boolean (tutors need approval)
- `approval_status` - Enum: 'pending', 'approved', 'rejected'
- `first_name`, `last_name` - User name
- `bio` - User biography
- `verification_documents` - JSON array (for tutors)
- `created_at`, `updated_at` - Timestamps

### Sessions Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `token` - Session token
- `expires_at` - Expiration timestamp
- `created_at` - Creation timestamp

## Notes

- Passwords are currently hashed with SHA-256 (for demo purposes)
- In production, use bcrypt for password hashing
- Session tokens expire after 24 hours
- Tutor accounts require admin approval before login

