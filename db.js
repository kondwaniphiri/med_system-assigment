require("dotenv").config();
const mysql = require("mysql");

// Create connection pool for better performance and scalability
const pool = mysql.createPool({
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "hospital",
  multipleStatements: false, // Security: prevent multiple SQL statements
  supportBigNumbers: true,
  bigNumberStrings: true,
});

// Test the connection pool
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection was closed.");
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
      console.error("Database has too many connections.");
    }
    if (err.code === "ECONNREFUSED") {
      console.error("Database connection was refused.");
    }
  } else {
    console.log("Database connected successfully");
    connection.release();
  }
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected database error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.error("Database connection lost. Will reconnect on next query.");
  } else {
    throw err;
  }
});

// Helper function for promisified queries
pool.queryPromise = (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

module.exports = pool;
