require('dotenv').config();
const database = require('../db');
const { randomBytes } = require('crypto');
const { hashPassword } = require('../utils/passwords');

(async () => {
  try {
    const columns = await database.queryPromise("SHOW COLUMNS FROM login LIKE 'role'");
    if (!columns.length) await database.queryPromise("ALTER TABLE login ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'Staff'");
    await database.queryPromise(`CREATE TABLE IF NOT EXISTS pharmacy_inventory (
      medicineId INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      strength VARCHAR(50) NOT NULL,
      unit VARCHAR(20) NOT NULL,
      quantity INT UNSIGNED NOT NULL DEFAULT 0,
      minimumStock INT UNSIGNED NOT NULL DEFAULT 10,
      expiryDate DATE NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_medicine (name, strength)
    ) ENGINE=InnoDB`);
    if (process.argv.includes('--sample')) {
      await database.queryPromise(`INSERT IGNORE INTO pharmacy_inventory
        (name, strength, unit, quantity, minimumStock, expiryDate) VALUES
        ('Paracetamol', '500 mg', 'Tablets', 240, 50, '2028-06-30'),
        ('Amoxicillin', '250 mg', 'Capsules', 18, 30, '2028-03-31'),
        ('Oral rehydration salts', '20.5 g', 'Packets', 85, 20, '2028-08-31'),
        ('Cetirizine', '10 mg', 'Tablets', 0, 25, '2028-01-31'),
        ('Saline', '0.9% / 500 ml', 'Bottles', 42, 15, '2028-11-30')`);
      const password = process.env.DOCTOR_PASSWORD || randomBytes(15).toString('base64url');
      if (password.length < 12) throw new Error('DOCTOR_PASSWORD must be at least 12 characters');
      const result = await database.queryPromise("INSERT IGNORE INTO login (username, password, role) VALUES (?, ?, 'Doctor')", ['demo.doctor', await hashPassword(password)]);
      if (result.affectedRows) console.log('Doctor login: demo.doctor\nDoctor password:', password);
      else console.log('Existing demo.doctor account retained; its password was not changed.');
    }
    console.log('Pharmacy setup complete.');
  } catch (error) {
    console.error('Pharmacy setup failed:', error.message);
    process.exitCode = 1;
  } finally { database.end(); }
})();
