require("dotenv").config();
const mysql = require("mysql");

// Create connection without database selection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  multipleStatements: true,
});

const dbName = process.env.DB_NAME || "hospital";

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

-- Insert default admin user (password: admin123 - CHANGE THIS!)
INSERT IGNORE INTO login (username, password) 
VALUES ('admin', 'admin123');

-- Insert sample wards
INSERT IGNORE INTO ward (wardName, capacity) VALUES
('Emergency', 20),
('ICU', 15),
('General Ward', 30),
('Pediatrics', 25),
('Maternity', 20);

-- Insert sample staff
INSERT IGNORE INTO staff (firstName, surname, position, SSN, street, town, province) VALUES
('John', 'Smith', 'Doctor', '123-45-6789', '123 Main St', 'Springfield', 'IL'),
('Sarah', 'Johnson', 'Nurse', '234-56-7890', '456 Oak Ave', 'Springfield', 'IL'),
('Michael', 'Brown', 'Doctor', '345-67-8901', '789 Elm St', 'Springfield', 'IL'),
('Emily', 'Davis', 'Nurse', '456-78-9012', '321 Pine Rd', 'Springfield', 'IL');
`;

// Execute the initialization
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
    process.exit(1);
  }

  console.log("Connected to MySQL server");
  console.log(`Initializing database: ${dbName}`);

  connection.query(initSQL, (error, results) => {
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
    console.log("  Password: admin123");
    console.log(
      "\n⚠️  IMPORTANT: Change the default password after first login!\n"
    );

    connection.end();
    console.log("Database initialization complete!");
  });
});
