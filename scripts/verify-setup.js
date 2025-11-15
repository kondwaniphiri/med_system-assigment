/**
 * Setup Verification Script
 * Run this to verify your MedSystem installation is correct
 *
 * Usage: node scripts/verify-setup.js
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");

console.log("\n=== MedSystem Setup Verification ===\n");

let errors = 0;
let warnings = 0;
let success = 0;

// Check functions
const check = (name, condition, errorMsg, type = "error") => {
  if (condition) {
    console.log(`✅ ${name}`);
    success++;
  } else {
    if (type === "error") {
      console.log(`❌ ${name}`);
      console.log(`   ${errorMsg}`);
      errors++;
    } else {
      console.log(`⚠️  ${name}`);
      console.log(`   ${errorMsg}`);
      warnings++;
    }
  }
};

// 1. Check Node.js version
const nodeVersion = process.version;
const nodeMajor = parseInt(nodeVersion.slice(1).split(".")[0]);
check(
  "Node.js Version",
  nodeMajor >= 14,
  `Current version: ${nodeVersion}. Recommended: v14.x or higher.`,
  nodeMajor >= 12 ? "warning" : "error"
);

// 2. Check if .env file exists
const envExists = fs.existsSync(path.join(__dirname, "..", ".env"));
check(
  ".env File Exists",
  envExists,
  "Run: copy .env.example .env and configure it"
);

// 3. Check required environment variables
if (envExists) {
  const requiredEnvVars = [
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "SESSION_SECRET",
  ];

  requiredEnvVars.forEach((varName) => {
    check(
      `Environment Variable: ${varName}`,
      process.env[varName] !== undefined,
      `${varName} is not set in .env file`
    );
  });

  // Check if using default session secret
  check(
    "Session Secret Security",
    process.env.SESSION_SECRET !==
      "your_very_secret_key_change_this_in_production" &&
      process.env.SESSION_SECRET !== "change_this_to_a_random_secret_key",
    "Using default session secret. Please change it!",
    "warning"
  );

  // Check if using default password
  check(
    "Database Password Set",
    process.env.DB_PASSWORD !== "your_password_here",
    "Using example password. Please set your actual MySQL password!"
  );
}

// 4. Check if node_modules exists
const nodeModulesExists = fs.existsSync(
  path.join(__dirname, "..", "node_modules")
);
check("Dependencies Installed", nodeModulesExists, "Run: npm install");

// 5. Check required dependencies
if (nodeModulesExists) {
  const packageJson = require("../package.json");
  const requiredDeps = [
    "express",
    "express-session",
    "express-validator",
    "dotenv",
    "mysql",
    "ejs",
  ];

  requiredDeps.forEach((dep) => {
    check(
      `Dependency: ${dep}`,
      packageJson.dependencies[dep] !== undefined,
      `${dep} is missing from package.json`
    );
  });
}

// 6. Check directory structure
const requiredDirs = [
  "middleware",
  "routes",
  "scripts",
  "utils",
  "views",
  "public",
  "bin",
];

requiredDirs.forEach((dir) => {
  const dirPath = path.join(__dirname, "..", dir);
  check(
    `Directory: ${dir}/`,
    fs.existsSync(dirPath),
    `Directory ${dir}/ is missing`
  );
});

// 7. Check required files
const requiredFiles = [
  "app.js",
  "db.js",
  "package.json",
  "README.md",
  "middleware/auth.js",
  "middleware/validation.js",
  "middleware/errorHandler.js",
  "routes/index.js",
  "routes/database.js",
  "routes/database-new.js",
  "scripts/init-database.js",
  "utils/helpers.js",
];

requiredFiles.forEach((file) => {
  const filePath = path.join(__dirname, "..", file);
  check(`File: ${file}`, fs.existsSync(filePath), `File ${file} is missing`);
});

// 8. Check documentation files
const docFiles = [
  "README.md",
  "API_DOCUMENTATION.md",
  "CHANGELOG.md",
  "QUICK_REFERENCE.md",
];

docFiles.forEach((file) => {
  const filePath = path.join(__dirname, "..", file);
  check(
    `Documentation: ${file}`,
    fs.existsSync(filePath),
    `Documentation file ${file} is missing`,
    "warning"
  );
});

// 9. Check MySQL connection (if env is set)
if (
  envExists &&
  process.env.DB_PASSWORD &&
  process.env.DB_PASSWORD !== "your_password_here"
) {
  console.log("\n--- Testing Database Connection ---");

  try {
    const mysql = require("mysql");
    const connection = mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD,
    });

    connection.connect((err) => {
      if (err) {
        console.log("❌ Database Connection");
        console.log(`   ${err.message}`);
        console.log("   Make sure MySQL is running: net start MySQL");
        errors++;
      } else {
        console.log("✅ Database Connection");
        success++;

        // Check if database exists
        const dbName = process.env.DB_NAME || "hospital";
        connection.query(`SHOW DATABASES LIKE '${dbName}'`, (err, results) => {
          if (err) {
            console.log("❌ Database Query");
            console.log(`   ${err.message}`);
            errors++;
          } else if (results.length === 0) {
            console.log(`⚠️  Database '${dbName}' does not exist`);
            console.log("   Run: npm run init-db");
            warnings++;
          } else {
            console.log(`✅ Database '${dbName}' exists`);
            success++;
          }

          connection.end();
          printSummary();
        });
        return;
      }
      printSummary();
    });
  } catch (err) {
    console.log("❌ MySQL Module");
    console.log(`   ${err.message}`);
    errors++;
    printSummary();
  }
} else {
  printSummary();
}

function printSummary() {
  console.log("\n=== Summary ===\n");
  console.log(`✅ Passed: ${success}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Errors: ${errors}`);

  if (errors === 0 && warnings === 0) {
    console.log("\n🎉 All checks passed! Your setup is complete.");
    console.log("\nNext steps:");
    console.log("1. If database doesn't exist: npm run init-db");
    console.log("2. Start the application: npm run dev");
    console.log("3. Visit: http://localhost:3000");
    console.log("4. Login with: admin / admin123");
  } else if (errors === 0) {
    console.log("\n⚠️  Setup is mostly complete, but there are warnings.");
    console.log("Review the warnings above and fix them if needed.");
  } else {
    console.log("\n❌ Setup has errors that need to be fixed.");
    console.log(
      "Review the errors above and fix them before running the application."
    );
  }

  console.log("\n");
  process.exit(errors > 0 ? 1 : 0);
}
