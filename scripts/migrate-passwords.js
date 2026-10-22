// Upgrade all legacy passwords without changing credentials or table layout.
require('dotenv').config();
const database = require('../db');
const { hashPassword } = require('../utils/passwords');
(async () => {
  try {
    const users = await database.queryPromise('SELECT id, password FROM login');
    let updated = 0;
    for (const user of users) {
      if (user.password.startsWith('scrypt$')) continue;
      // Compare the old value to avoid overwriting a concurrent password change.
      const result = await database.queryPromise(
        'UPDATE login SET password = ? WHERE id = ? AND password = ?',
        [await hashPassword(user.password), user.id, user.password]
      );
      updated += result.affectedRows;
    }
    console.log(`Upgraded ${updated} password(s). Credentials remain the same.`);
  } catch (error) {
    console.error('Password migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    database.end();
  }
})();
