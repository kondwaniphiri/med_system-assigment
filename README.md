# MedSystem - Hospital Management System# MedSystem - Hospital Management System

A secure, modern web-based hospital management system built with Node.js, Express, and MySQL for managing patients, staff, wards, and appointments.A secure, modern web-based hospital management system built with Node.js, Express, and MySQL for managing patients, staff, wards, and appointments.

## ✨ Features## ✨ Features

- **Patient Management**: Add, view, update, and delete patient records with validation- **Patient Management**: Add, view, update, and delete patient records with validation

- **Staff Management**: Manage hospital staff (doctors, nurses, administrators, technicians, receptionists)- **Staff Management**: Manage hospital staff (doctors, nurses, administrators, technicians, receptionists)

- **Ward Management**: Track ward assignments and patient locations- **Ward Management**: Track ward assignments and patient locations

- **Appointment System**: View doctor-patient and nurse-ward relationships- **Appointment System**: View doctor-patient and nurse-ward relationships

- **Session-based Authentication**: Secure login/logout functionality- **Session-based Authentication**: Secure login/logout functionality

- **Input Validation**: Comprehensive validation and sanitization of all inputs- **Input Validation**: Comprehensive validation and sanitization of all inputs

- **Database Connection Pooling**: Efficient database connection management- **Database Connection Pooling**: Efficient database connection management

- **Error Handling**: Robust error handling with detailed logging- **Error Handling**: Robust error handling with detailed logging

- **RESTful API**: Well-structured API endpoints with consistent response format- **RESTful API**: Well-structured API endpoints with consistent response format

- **Security**: SQL injection prevention with parameterized queries- **Security**: SQL injection prevention with parameterized queries

## 🆕 Recent Improvements## 🆕 Recent Improvements

### Security Enhancements### Security Enhancements

- ✅ **Parameterized Queries**: All database queries use parameterized statements to prevent SQL injection

- ✅ **Input Validation**: Express-validator middleware for all user inputs- ✅ **Parameterized Queries**: All database queries use parameterized statements to prevent SQL injection

- ✅ **Session Management**: Secure session-based authentication- ✅ **Input Validation**: Express-validator middleware for all user inputs

- ✅ **Environment Variables**: Sensitive data stored in .env files- ✅ **Session Management**: Secure session-based authentication

- ✅ **Environment Variables**: Sensitive data stored in .env files

### Performance Improvements

- ✅ **Connection Pooling**: MySQL connection pool for better scalability### Performance Improvements

- ✅ **Error Handling**: Centralized error handling with proper logging

- ✅ **Rate Limiting**: Built-in rate limiting to prevent abuse- ✅ **Connection Pooling**: MySQL connection pool for better scalability

- ✅ **Error Handling**: Centralized error handling with proper logging

### Developer Experience- ✅ **Rate Limiting**: Built-in rate limiting to prevent abuse

- ✅ **Auto Database Setup**: Automated database initialization script

- ✅ **API Documentation**: Comprehensive API documentation### Developer Experience

- ✅ **Helper Utilities**: Reusable utility functions

- ✅ **Consistent Responses**: Standardized API response format- ✅ **Auto Database Setup**: Automated database initialization script

- ✅ **API Documentation**: Comprehensive API documentation

## Prerequisites- ✅ **Helper Utilities**: Reusable utility functions

- ✅ **Consistent Responses**: Standardized API response format

Before you begin, ensure you have the following installed on your system:

## Prerequisites

- [Node.js](https://nodejs.org/) (version 14.x or higher recommended)

- [MySQL](https://www.mysql.com/) (version 5.7 or higher)Before you begin, ensure you have the following installed on your system:

- npm (comes with Node.js)

- [Node.js](https://nodejs.org/) (version 12.x or higher recommended)

## 🚀 Quick Start- [MySQL](https://www.mysql.com/) (version 5.7 or higher)

- npm (comes with Node.js)

### 1. Clone or Download the Project

## Database Setup

Navigate to the project directory:

### 1. Install MySQL

```bash

cd "c:\Users\BIG\Documents\Works\Element Tech\medsystem"If you haven't already, install MySQL on your system and ensure the MySQL service is running.

```

### 2. Create Database

### 2. Install Dependencies

Create a database named `hospital`:

Run the following command to install all required npm packages:

````sql

```bashCREATE DATABASE hospital;

npm installUSE hospital;

````

This will install all dependencies including:### 3. Create Required Tables

- express & express-session

- ejs (template engine)Execute the following SQL commands to create the necessary tables:

- mysql (database driver)

- dotenv (environment variables)```sql

- express-validator (input validation)-- Login table

- cookie-parser, morgan, http-errors, debugCREATE TABLE login (

- nodemon (dev dependency) id INT PRIMARY KEY AUTO_INCREMENT,

  username VARCHAR(50) NOT NULL,

### 3. Configure Environment Variables password VARCHAR(255) NOT NULL

);

Create a `.env` file in the root directory by copying the example:

-- Patient table

````powershellCREATE TABLE patient (

copy .env.example .env    patientId INT PRIMARY KEY AUTO_INCREMENT,

```    firstName VARCHAR(50) NOT NULL,

    surname VARCHAR(50) NOT NULL,

Edit the `.env` file with your configuration:    insuranceName VARCHAR(100),

    phone VARCHAR(20),

```env    street VARCHAR(100),

# Server Configuration    town VARCHAR(50),

PORT=3000    province VARCHAR(50)

NODE_ENV=development);



# Database Configuration-- Staff table

DB_HOST=localhostCREATE TABLE staff (

DB_USER=root    staffId INT PRIMARY KEY AUTO_INCREMENT,

DB_PASSWORD=your_mysql_password_here    firstName VARCHAR(50) NOT NULL,

DB_NAME=hospital    surname VARCHAR(50) NOT NULL,

DB_CONNECTION_LIMIT=10    position VARCHAR(50) NOT NULL,

    SSN VARCHAR(20),

# Session Configuration    street VARCHAR(100),

SESSION_SECRET=change_this_to_a_random_secret_key    town VARCHAR(50),

SESSION_MAX_AGE=3600000    province VARCHAR(50)

```);



⚠️ **Important**: -- Ward table

- Replace `your_mysql_password_here` with your actual MySQL passwordCREATE TABLE ward (

- Generate a strong random string for `SESSION_SECRET`    wardId INT PRIMARY KEY AUTO_INCREMENT,

- Never commit the `.env` file to version control    wardName VARCHAR(50) NOT NULL,

    capacity INT,

### 4. Initialize the Database    currentOccupancy INT DEFAULT 0

);

Run the automated database setup script:

-- Doctor-Patient relationship table

```bashCREATE TABLE doctorpatient (

npm run init-db    id INT PRIMARY KEY AUTO_INCREMENT,

```    doctorId INT NOT NULL,

    patientId INT NOT NULL,

This will:    FOREIGN KEY (doctorId) REFERENCES staff(staffId) ON DELETE CASCADE,

- Create the `hospital` database    FOREIGN KEY (patientId) REFERENCES patient(patientId) ON DELETE CASCADE

- Create all required tables with proper relationships and constraints);

- Insert sample data (wards and staff)

- Create a default admin user-- Nurse-Ward relationship table

CREATE TABLE nurseward (

**Default Login Credentials:**    id INT PRIMARY KEY AUTO_INCREMENT,

- Username: `admin`    nurseId INT NOT NULL,

- Password: `admin123`    wardId INT NOT NULL,

    FOREIGN KEY (nurseId) REFERENCES staff(staffId) ON DELETE CASCADE,

⚠️ **Change the default password immediately after first login!**    FOREIGN KEY (wardId) REFERENCES ward(wardId) ON DELETE CASCADE

);

### 5. Start the Application

-- Patient-Ward relationship table

For production:CREATE TABLE patientward (

```bash    id INT PRIMARY KEY AUTO_INCREMENT,

npm start    patientId INT NOT NULL,

```    wardId INT NOT NULL,

    FOREIGN KEY (patientId) REFERENCES patient(patientId) ON DELETE CASCADE,

For development with auto-restart on file changes:    FOREIGN KEY (wardId) REFERENCES ward(wardId) ON DELETE CASCADE

```bash);

npm run dev```

````

### 4. Configure Database Connection

The server will start on **http://localhost:3000** (or the port specified in .env)

Update the database credentials in `db.js`:

### 6. Access the Application

````javascript

Open your web browser and navigate to:let connection = mysql.createConnection({

  host: "localhost",

```  database: "hospital",

http://localhost:3000  user: "root",

```  password: "YOUR_PASSWORD_HERE", // Replace with your MySQL password

});

Login with the default credentials and start using the system!```



## 📁 Project Structure⚠️ **Important**: Replace `'YOUR_PASSWORD_HERE'` with your actual MySQL root password.



```## Installation

medsystem/

├── app.js                      # Main application file### 1. Clone or Download the Project

├── db.js                       # Database connection pool

├── package.json                # Project dependencies and scriptsNavigate to the project directory:

├── .env.example                # Environment variables template

├── .gitignore                  # Git ignore file```bash

├── README.md                   # This filecd "c:\Users\BIG\Documents\Works\Element Tech\medsystem"

├── API_DOCUMENTATION.md        # Detailed API documentation```

│

├── bin/### 2. Install Dependencies

│   └── www                     # Server startup script

│Run the following command to install all required npm packages:

├── middleware/

│   ├── auth.js                 # Authentication middleware```bash

│   ├── validation.js           # Input validation rulesnpm install

│   └── errorHandler.js         # Error handling middleware```

│

├── public/This will install:

│   ├── images/                 # Image assets

│   ├── javascripts/            # Client-side JavaScript- express

│   └── stylesheets/            # CSS files- ejs

│- mysql

├── routes/- cookie-parser

│   ├── index.js                # Main routes (pages)- morgan

│   ├── database.js             # Legacy API routes- http-errors

│   └── database-new.js         # Improved API routes (/api)- debug

│

├── scripts/## Running the Application

│   └── init-database.js        # Database initialization script

│### Start the Server

├── utils/

│   └── helpers.js              # Utility functionsUse the following command to start the application:

│

└── views/                      # EJS templates```bash

    ├── index.ejs               # Login pagenpm start

    ├── home.ejs                # Dashboard```

    ├── addp.ejs                # Add patient form

    ├── adde.ejs                # Add employee formThe server will start on **port 3000** by default.

    ├── viewp.ejs               # View patients

    ├── viewe.ejs               # View employees### Access the Application

    ├── managep.ejs             # Manage patients

    ├── managee.ejs             # Manage employeesOpen your web browser and navigate to:

    ├── appointments.ejs        # Appointments view

    └── error.ejs               # Error page```

```http://localhost:3000

````

## 🌐 Application Routes

## Application Routes

### Web Pages

- `/` - Login page- `/` - Login/Home page

- `/home` - Main dashboard- `/home` - Main dashboard

- `/addp` - Add new patient- `/addp` - Add new patient

- `/adde` - Add new employee/staff- `/adde` - Add new employee/staff

- `/viewp` - View all patients- `/viewp` - View all patients

- `/viewe` - View all staff- `/viewe` - View all staff

- `/managep` - Manage patients (update/delete)- `/managep` - Manage patients (update/delete)

- `/managee` - Manage staff (update/delete)- `/managee` - Manage staff (update/delete)

- `/appointments` - View appointments and relationships- `/appointments` - View appointments and relationships

### API Endpoints## API Endpoints

The application provides two sets of API endpoints:The application uses AJAX calls to `/database/action` with different action types:

#### Legacy API (`/database/action`)### Authentication

The original API endpoint that uses action-based routing.

- `login` - Fetch login credentials

#### New API (`/api/*`) - **Recommended**

Improved API with:### Patient Operations

- Parameterized queries (SQL injection prevention)

- Input validation- `fetchp` - Fetch all patients

- Standardized response format- `addp` - Add new patient

- Better error handling- `updatep` - Update patient record

- `deletep` - Delete patient

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for detailed endpoint documentation.

### Staff Operations

## 🔒 Security Features

- `fetche` - Fetch all staff

### SQL Injection Prevention- `adde` - Add new staff member

All database queries use parameterized statements:- `updatee` - Update staff record

```javascript- `deletee` - Delete staff member

const query = "SELECT \* FROM patient WHERE patientId = ?";

database.query(query, [patientId], callback);### Ward Operations

`````

- `fetchw` - Fetch all wards

### Input Validation

Express-validator middleware validates all inputs:### Relationship Operations

- Required fields check

- Length constraints- `fetchd-p` - Fetch doctor-patient relationships

- Format validation (names, phone numbers, etc.)- `fetchn-w` - Fetch nurse-ward relationships

- XSS prevention- `fetchp-w` - Fetch patient-ward relationships

- `addd-p` - Add doctor-patient assignment

### Session Management- `addn-w` - Add nurse-ward assignment

Secure session configuration:- `addp-w` - Add patient-ward assignment

- HTTP-only cookies

- Secure cookies in production (HTTPS)### Appointment Queries

- Configurable session timeout

- Session-based authentication- `appp` - Get patient appointment details

- `appd` - Get doctor appointment details

### Environment Variables- `appn` - Get nurse appointment details

Sensitive data stored securely:

- Database credentials## Project Structure

- Session secrets

- Configuration settings```

medsystem/

## 📊 Database Schema├── app.js                  # Main application file

├── db.js                   # Database connection configuration

### Tables├── package.json            # Project dependencies

├── bin/

**login**│   └── www                 # Server startup script

- `id` (Primary Key)├── public/

- `username` (Unique)│   ├── images/             # Image assets

- `password`│   ├── javascripts/        # Client-side JavaScript

- `created_at`│   └── stylesheets/        # CSS files

├── routes/

**patient**│   ├── index.js            # Main routes

- `patientId` (Primary Key)│   └── database.js         # Database API routes

- `firstName`, `surname`└── views/                  # EJS templates

- `insuranceName`, `phone`    ├── index.ejs           # Login page

- `street`, `town`, `province`    ├── home.ejs            # Dashboard

- `created_at`, `updated_at`    ├── addp.ejs            # Add patient form

    ├── adde.ejs            # Add employee form

**staff**    ├── viewp.ejs           # View patients

- `staffId` (Primary Key)    ├── viewe.ejs           # View employees

- `firstName`, `surname`    ├── managep.ejs         # Manage patients

- `position` (ENUM: Doctor, Nurse, Administrator, Technician, Receptionist)    ├── managee.ejs         # Manage employees

- `SSN`    └── appointments.ejs    # Appointments view

- `street`, `town`, `province````

- `created_at`, `updated_at`

## Troubleshooting

**ward**

- `wardId` (Primary Key)### Port Already in Use

- `wardName` (Unique)

- `capacity`, `currentOccupancy`If port 3000 is already in use, you can change it by setting the PORT environment variable:

- `created_at`, `updated_at`

**Windows PowerShell:**

**doctorpatient**

- `id` (Primary Key)```powershell

- `doctorId` (Foreign Key → staff.staffId)$env:PORT=3001; npm start

- `patientId` (Foreign Key → patient.patientId)```

- `assigned_date`

- Unique constraint on (doctorId, patientId)### Database Connection Issues



**nurseward**- Verify MySQL service is running

- `id` (Primary Key)- Check database credentials in `db.js`

- `nurseId` (Foreign Key → staff.staffId)- Ensure the `hospital` database exists

- `wardId` (Foreign Key → ward.wardId)- Verify all required tables are created

- `assigned_date`

- Unique constraint on (nurseId, wardId)### Module Not Found Errors



**patientward**If you get module errors, try:

- `id` (Primary Key)

- `patientId` (Foreign Key → patient.patientId)```bash

- `wardId` (Foreign Key → ward.wardId)npm install

- `admission_date````

- Unique constraint on (patientId, wardId)

## Security Notes

### Relationships

- CASCADE delete on all foreign keys⚠️ **Warning**: This application has several security considerations:

- Unique constraints to prevent duplicate assignments

1. **SQL Injection**: The current implementation uses string concatenation for SQL queries, which is vulnerable to SQL injection. Consider using parameterized queries.

## 🛠️ Available Scripts2. **Password Storage**: Database password is stored in plain text in `db.js`. Use environment variables for production.

3. **Input Validation**: Add proper input validation and sanitization.

```bash4. **Authentication**: Implement proper session management and authentication middleware.

# Start the application

npm start## Technologies Used



# Start with auto-reload (development)- **Backend**: Node.js, Express.js

npm run dev- **Database**: MySQL

- **Template Engine**: EJS

# Initialize database- **Frontend**: HTML, CSS, JavaScript, jQuery

npm run init-db

```## License



## 🐛 TroubleshootingThis project is private and proprietary.



### Port Already in Use## Support



If port 3000 is already in use, change it in your `.env` file:For issues or questions, please contact the development team.

```env
PORT=3001
`````

### Database Connection Issues

1. **Verify MySQL service is running:**

   ```powershell
   net start MySQL
   ```

2. **Check database credentials** in `.env` file

3. **Ensure the database exists:**

   ```bash
   npm run init-db
   ```

4. **Test connection:**
   ```powershell
   mysql -u root -p
   ```

### Module Not Found Errors

If you get module errors:

```bash
npm install
```

### Permission Errors

Run your terminal/command prompt as Administrator if you encounter permission issues.

## 🔧 Configuration

### Database Connection Pool

Adjust pool settings in `.env`:

```env
DB_CONNECTION_LIMIT=10  # Maximum number of connections
```

### Session Configuration

Configure session behavior in `.env`:

```env
SESSION_SECRET=your_secret_key
SESSION_MAX_AGE=3600000  # 1 hour in milliseconds
```

### Environment Modes

Set `NODE_ENV` for different behaviors:

```env
NODE_ENV=development  # Detailed error messages, HTTPS not required
NODE_ENV=production   # Minimal errors, HTTPS required for cookies
```

## 📚 API Usage Examples

### Login

```javascript
fetch("/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "admin",
    password: "admin123",
  }),
})
  .then((res) => res.json())
  .then((data) => console.log(data));
```

### Add Patient

```javascript
fetch("/api/add-patient", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    firstName: "John",
    surname: "Doe",
    insurance: "Blue Cross",
    phone: "555-1234",
    street: "123 Main St",
    town: "Springfield",
    province: "IL",
  }),
})
  .then((res) => res.json())
  .then((data) => console.log(data));
```

### Fetch All Patients

```javascript
fetch("/api/fetch-patients", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
})
  .then((res) => res.json())
  .then((data) => console.log(data));
```

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference.

## 🔐 Security Best Practices

1. **Change Default Credentials**: Immediately change the default admin password
2. **Use Strong Passwords**: For database and session secrets
3. **HTTPS in Production**: Always use HTTPS in production environments
4. **Regular Updates**: Keep dependencies updated
5. **Input Validation**: Never trust user input
6. **Environment Variables**: Never commit `.env` to version control
7. **Database Backups**: Regularly backup your database
8. **Error Logging**: Monitor application logs for suspicious activity

## ⚠️ Known Limitations

1. **Password Hashing**: Current implementation stores passwords in plain text. Implement bcrypt for production.
2. **File Upload**: No file upload functionality for patient documents.
3. **Pagination**: Large datasets are not paginated.
4. **Role-Based Access**: All authenticated users have full access.
5. **Email Notifications**: No email functionality for appointments.

## 🚀 Future Enhancements

- [ ] Implement bcrypt password hashing
- [ ] Add role-based access control (RBAC)
- [ ] Implement pagination for large datasets
- [ ] Add file upload for patient documents
- [ ] Email notifications for appointments
- [ ] Advanced search and filtering
- [ ] Reports and analytics dashboard
- [ ] Mobile responsive design improvements
- [ ] Real-time notifications using WebSockets
- [ ] Multi-language support

## 🤝 Contributing

This is a private project. For any issues or suggestions, please contact the development team.

## 📄 License

This project is private and proprietary.

## 👥 Support

For issues, questions, or support:

- Review the documentation in this README
- Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Review error logs in the console
- Contact the development team

## 🙏 Acknowledgments

Built with:

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)
- [EJS](https://ejs.co/)
- [Express Validator](https://express-validator.github.io/)

---
