# Installation Guide - MedSystem

## Complete Step-by-Step Setup

This guide will walk you through setting up the MedSystem Hospital Management application from scratch.

---

## Prerequisites Check

Before starting, ensure you have:

- [ ] **Windows Operating System** (guide uses PowerShell commands)
- [ ] **Node.js** (v14.x or higher) - [Download](https://nodejs.org/)
- [ ] **MySQL** (v5.7 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)
- [ ] **Text Editor** (VS Code recommended)
- [ ] **Internet Connection** (for npm packages)

---

## Installation Steps

### Step 1: Verify Prerequisites

Open PowerShell and verify installations:

```powershell
# Check Node.js
node --version
# Should show v14.x.x or higher

# Check npm
npm --version
# Should show 6.x.x or higher

# Check MySQL
mysql --version
# Should show MySQL version
```

If any command fails, install the missing software.

---

### Step 2: Navigate to Project

```powershell
cd "c:\Users\BIG\Documents\Works\Element Tech\medsystem"
```

---

### Step 3: Install Dependencies

```powershell
npm install
```

This will install:

- express (web framework)
- express-session (session management)
- express-validator (input validation)
- mysql (database driver)
- dotenv (environment variables)
- ejs (templating engine)
- cookie-parser
- morgan (logging)
- http-errors
- debug
- nodemon (dev tool)

**Expected time:** 1-2 minutes

**Troubleshooting:**

- If errors occur, try: `npm install --legacy-peer-deps`
- If permission errors: Run PowerShell as Administrator

---

### Step 4: Configure Environment

Create your environment file:

```powershell
copy .env.example .env
```

Open `.env` in a text editor and update these values:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE    # ← CHANGE THIS!
DB_NAME=hospital
DB_CONNECTION_LIMIT=10

# Session Configuration
SESSION_SECRET=GENERATE_A_RANDOM_STRING_HERE    # ← CHANGE THIS!
SESSION_MAX_AGE=3600000
```

**Important Changes:**

1. **DB_PASSWORD**: Replace with your MySQL root password

   - The password you set during MySQL installation
   - Example: `DB_PASSWORD=MySecurePass123`

2. **SESSION_SECRET**: Replace with a random string
   - Use a random string generator or keyboard mashing
   - Example: `SESSION_SECRET=kj34h5k2j3h4k5j2h3k4j5h2k3j4h5k2j3h4`
   - Minimum 32 characters recommended

**Save the file** after making changes.

---

### Step 5: Start MySQL Service

Ensure MySQL is running:

```powershell
net start MySQL
```

**Possible responses:**

- "The service has already been started." - ✅ Good!
- "The service was started successfully." - ✅ Good!
- "The requested service has already been started." - ✅ Good!
- Error - MySQL needs to be installed or configured

**Troubleshooting:**

- If error: Check MySQL is installed
- Try: `net start MySQL80` (or your MySQL version)
- Or start from Services app (services.msc)

---

### Step 6: Initialize Database

Run the automated setup:

```powershell
npm run init-db
```

**What this does:**

1. Connects to MySQL
2. Creates `hospital` database
3. Creates all required tables:
   - login
   - patient
   - staff
   - ward
   - doctorpatient
   - nurseward
   - patientward
4. Adds sample wards and staff
5. Creates default admin user

**Expected output:**

```
Connected to MySQL server
Initializing database: hospital
✓ Database created successfully
✓ All tables created successfully
✓ Sample data inserted

Default credentials:
  Username: admin
  Password: admin123

⚠️  IMPORTANT: Change the default password after first login!

Database initialization complete!
```

**Troubleshooting:**

- "Error connecting to MySQL": Check MySQL is running
- "Access denied": Check DB_PASSWORD in .env
- "Database exists": That's okay, script is idempotent

---

### Step 7: Verify Setup

Run the verification script:

```powershell
npm run verify
```

This checks:

- Node.js version
- .env file exists
- All environment variables set
- Dependencies installed
- Directory structure
- Required files
- Database connection
- Database exists

**Expected output:**

```
=== MedSystem Setup Verification ===

✅ Node.js Version
✅ .env File Exists
✅ Environment Variable: DB_HOST
✅ Environment Variable: DB_USER
... (many more checks)
✅ Database Connection
✅ Database 'hospital' exists

=== Summary ===

✅ Passed: XX
⚠️  Warnings: 0
❌ Errors: 0

🎉 All checks passed! Your setup is complete.
```

**If there are errors:**

- Review each error message
- Fix the issues
- Run `npm run verify` again

---

### Step 8: Start the Application

For development (with auto-reload):

```powershell
npm run dev
```

For production:

```powershell
npm start
```

**Expected output:**

```
[nodemon] starting `node ./bin/www`
Database connected successfully
```

**The server is now running!**

---

### Step 9: Access the Application

Open your web browser and go to:

```
http://localhost:3000
```

**You should see the login page.**

---

### Step 10: Login

Use the default credentials:

- **Username:** `admin`
- **Password:** `admin123`

**⚠️ IMPORTANT:** Change this password immediately after first login!

---

### Step 11: Explore the Application

After login, you can:

1. **Dashboard** - View overview
2. **Add Patient** - Create new patient record
3. **View Patients** - See all patients
4. **Manage Patients** - Update/delete patients
5. **Add Employee** - Create new staff member
6. **View Employees** - See all staff
7. **Manage Employees** - Update/delete staff
8. **Appointments** - View relationships and assignments

---

## Quick Start (Summary)

```powershell
# 1. Install dependencies
npm install

# 2. Create and configure .env
copy .env.example .env
# Edit .env with your MySQL password

# 3. Start MySQL
net start MySQL

# 4. Initialize database
npm run init-db

# 5. Verify setup
npm run verify

# 6. Start application
npm run dev

# 7. Open browser
# http://localhost:3000
# Login: admin / admin123
```

---

## Verification Checklist

After installation, verify:

- [ ] Can access http://localhost:3000
- [ ] Can login with admin/admin123
- [ ] Can view dashboard
- [ ] Can add a new patient
- [ ] Can view patient list
- [ ] Can update a patient
- [ ] Can delete a patient
- [ ] Can add a staff member
- [ ] Can assign doctor to patient
- [ ] Can view appointments
- [ ] No errors in console
- [ ] Can logout

---

## Common Issues & Solutions

### Issue: "Cannot find module"

**Solution:**

```powershell
npm install
```

### Issue: "Port 3000 already in use"

**Solution:**
Change PORT in .env to 3001 or another port

### Issue: "Cannot connect to database"

**Solutions:**

1. Check MySQL is running: `net start MySQL`
2. Verify DB_PASSWORD in .env
3. Test MySQL connection: `mysql -u root -p`

### Issue: "Database 'hospital' does not exist"

**Solution:**

```powershell
npm run init-db
```

### Issue: "Access denied for user 'root'"

**Solution:**
Check DB_PASSWORD in .env matches your MySQL password

### Issue: "nodemon not found"

**Solution:**

```powershell
npm install
```

Or use: `npm start` instead of `npm run dev`

### Issue: ".env file not found"

**Solution:**

```powershell
copy .env.example .env
```

Then edit with your settings

---

## Development Workflow

### Making Changes

1. **Edit files** (routes, views, etc.)
2. **Save** (nodemon auto-restarts)
3. **Refresh browser** to see changes
4. **Check console** for errors

### Recommended Tools

- **VS Code** - Text editor
- **MySQL Workbench** - Database management
- **Postman** - API testing
- **Chrome DevTools** - Frontend debugging

---

## Next Steps

After successful installation:

1. **Read Documentation**

   - README.md - Overview
   - API_DOCUMENTATION.md - API reference
   - QUICK_REFERENCE.md - Quick commands

2. **Change Default Password**

   - Create a password change feature
   - Or update in database directly

3. **Add Your Data**

   - Add real patients
   - Add real staff
   - Create real appointments

4. **Customize**
   - Update branding
   - Modify styles
   - Add features

---

## Uninstallation

To completely remove:

```powershell
# 1. Stop the application (Ctrl+C)

# 2. Drop database (in MySQL)
mysql -u root -p
DROP DATABASE hospital;
exit

# 3. Remove node_modules
Remove-Item -Recurse -Force node_modules

# 4. Remove .env file
Remove-Item .env
```

---

## Getting Help

If you encounter issues:

1. **Check Documentation**

   - README.md
   - API_DOCUMENTATION.md
   - This installation guide

2. **Run Verification**

   ```powershell
   npm run verify
   ```

3. **Check Logs**

   - Console output
   - MySQL error logs

4. **Review Common Issues** (above)

5. **Contact Support**
   - Development team
   - Project maintainer

---

## Appendix: Manual Database Setup

If `npm run init-db` fails, you can create the database manually:

```sql
-- 1. Connect to MySQL
mysql -u root -p

-- 2. Create database
CREATE DATABASE hospital;
USE hospital;

-- 3. Run the SQL from scripts/init-database.js
-- (Copy the SQL statements from that file)

-- 4. Create default user
INSERT INTO login (username, password)
VALUES ('admin', 'admin123');
```

---

## Appendix: Environment Variables Reference

| Variable            | Description            | Example                |
| ------------------- | ---------------------- | ---------------------- |
| PORT                | Server port            | 3000                   |
| NODE_ENV            | Environment            | development/production |
| DB_HOST             | MySQL host             | localhost              |
| DB_USER             | MySQL user             | root                   |
| DB_PASSWORD         | MySQL password         | your_password          |
| DB_NAME             | Database name          | hospital               |
| DB_CONNECTION_LIMIT | Max connections        | 10                     |
| SESSION_SECRET      | Session encryption key | random_string          |
| SESSION_MAX_AGE     | Session timeout (ms)   | 3600000 (1 hour)       |

---
