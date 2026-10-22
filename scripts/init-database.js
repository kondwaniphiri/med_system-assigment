require("dotenv").config();
const mysql = require("mysql2");
const { hashPassword } = require("../utils/passwords");
const { randomBytes } = require("crypto");

// Create connection without database selection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  multipleStatements: true,
});

const dbName = process.env.DB_NAME || "hospital";
if (!/^[a-zA-Z0-9_]+$/.test(dbName)) throw new Error("DB_NAME must contain only letters, digits, or underscores");
const adminPassword = process.env.ADMIN_PASSWORD || randomBytes(18).toString("base64url");
if (adminPassword.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");

// SQL script to create database and tables
const initSQL = `
-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS ${dbName};
USE ${dbName};

-- Login table
CREATE TABLE IF NOT EXISTS login (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patient table
CREATE TABLE IF NOT EXISTS patient (
    patientId INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    insuranceName VARCHAR(100),
    phone VARCHAR(20),
    street VARCHAR(100),
    town VARCHAR(50),
    province VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
    staffId INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    position ENUM('Doctor', 'Nurse', 'Administrator', 'Technician', 'Receptionist') NOT NULL,
    SSN VARCHAR(20),
    street VARCHAR(100),
    town VARCHAR(50),
    province VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Ward table
CREATE TABLE IF NOT EXISTS ward (
    wardId INT PRIMARY KEY AUTO_INCREMENT,
    wardName VARCHAR(50) NOT NULL UNIQUE,
    capacity INT DEFAULT 10,
    currentOccupancy INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Doctor-Patient relationship table
CREATE TABLE IF NOT EXISTS doctorpatient (
    id INT PRIMARY KEY AUTO_INCREMENT,
    doctorId INT NOT NULL,
    patientId INT NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctorId) REFERENCES staff(staffId) ON DELETE CASCADE,
    FOREIGN KEY (patientId) REFERENCES patient(patientId) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (doctorId, patientId)
);

-- Nurse-Ward relationship table
CREATE TABLE IF NOT EXISTS nurseward (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nurseId INT NOT NULL,
    wardId INT NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nurseId) REFERENCES staff(staffId) ON DELETE CASCADE,
    FOREIGN KEY (wardId) REFERENCES ward(wardId) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (nurseId, wardId)
);

-- Patient-Ward relationship table
CREATE TABLE IF NOT EXISTS patientward (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patientId INT NOT NULL,
    wardId INT NOT NULL,
    admission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES patient(patientId) ON DELETE CASCADE,
    FOREIGN KEY (wardId) REFERENCES ward(wardId) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (patientId, wardId)
);

-- Insert initial administrator with a hashed password
INSERT IGNORE INTO login (username, password) 
VALUES ('admin', ?);

-- Insert sample wards
INSERT IGNORE INTO ward (wardName, capacity) VALUES
('Emergency', 20),
('ICU', 15),
('General Ward', 30),
('Pediatrics', 25),
('Maternity', 20);

-- Insert sample staff
INSERT IGNORE INTO staff (firstName, surname, position, SSN, street, town, province) VALUES
('Chanda', 'Bwalya', 'Doctor', '420653/63/8', 'Plot 18, Kabulonga Road', 'Lusaka', 'Lusaka'),
('Thandiwe', 'Banda', 'Nurse', '362564/66/7', 'Plot 25, Chilenje South', 'Lusaka', 'Lusaka'),
('Mutinta', 'Phiri', 'Doctor', '836400/29/9', 'Plot 42, Independence Avenue', 'Ndola', 'Copperbelt'),
('Mwewa', 'Chileshe', 'Nurse', '801648/28/9', 'Plot 16, Riverside', 'Kitwe', 'Copperbelt');
`;

// Execute the initialization
connection.connect(async (err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
    process.exit(1);
  }

  console.log("Connected to MySQL server");
  console.log(`Initializing database: ${dbName}`);

  const passwordHash = await hashPassword(adminPassword);
  connection.query(initSQL, [passwordHash], (error, results) => {
    if (error) {
      console.error("Error initializing database:", error.message);
      connection.end();
      process.exit(1);
    }

    console.log("✓ Database created successfully");
    console.log("✓ All tables created successfully");
    console.log("✓ Sample data inserted");
    console.log("\nDefault credentials:");
    console.log("  Username: admin");
    console.log("  Initial admin password (only applies to newly created admin):", adminPassword);
    console.log(
      "\n⚠️  IMPORTANT: Change the default password after first login!\n"
    );

    connection.end();
    console.log("Database initialization complete!");
  });
});
