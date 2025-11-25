# Database Setup Guide

## Quick Start

1. **Make sure MySQL is running**
   ```bash
   # Windows (if MySQL is installed as service)
   # MySQL should start automatically
   
   # Or start manually
   net start MySQL
   ```

2. **Install dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Initialize the database**
   ```bash
   npm run init-db
   ```
   
   This will:
   - Create the `mlt_system` database
   - Create all necessary tables
   - Insert default admin user

4. **Start the server**
   ```bash
   npm start
   ```

## Manual Database Setup (Alternative)

If you prefer to set up the database manually:

1. **Connect to MySQL**
   ```bash
   mysql -u root -p
   ```

2. **Create the database**
   ```sql
   CREATE DATABASE mlt_system;
   USE mlt_system;
   ```

3. **Run the initialization script**
   ```bash
   npm run init-db
   ```

## Configuration

Create a `.env` file in the Backend directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=mlt_system
PORT=5000
```

If you don't create a `.env` file, the default values will be used:
- Host: localhost
- User: root
- Password: (empty)
- Database: mlt_system

## Testing the Connection

1. **Test the health endpoint**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Test registration**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "test123",
       "role": "student",
       "fullName": "Test User"
     }'
   ```

3. **Test login**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@mltsystem.com",
       "password": "admin123"
     }'
   ```

## Troubleshooting

### Error: "Can't connect to MySQL server"
- Make sure MySQL server is running
- Check if the host, user, and password are correct
- Verify MySQL is listening on the default port (3306)

### Error: "Access denied for user"
- Check MySQL username and password
- Make sure the user has privileges to create databases

### Error: "Database doesn't exist"
- Run `npm run init-db` to create the database and tables

### Error: "Table already exists"
- This is normal if you run init-db multiple times
- The script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run again

## Default Admin Account

After initialization, you can login with:
- Email: `admin@mltsystem.com`
- Password: `admin123`

**⚠️ Important:** Change the admin password in production!

