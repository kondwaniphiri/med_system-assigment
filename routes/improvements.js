const router = require('express').Router();
const database = require('../db');
const { isAuthenticated } = require('../middleware/auth');
const { asyncHandler, rateLimit } = require('../middleware/errorHandler');
const { hashPassword, verifyPassword } = require('../utils/passwords');
const { validateId } = require('../middleware/validation');

router.use(isAuthenticated);

router.post('/dashboard', asyncHandler(async (req, res) => {
  const [totals, wards] = await Promise.all([
    database.queryPromise(`SELECT
      (SELECT COUNT(*) FROM patient) AS patients,
      (SELECT COUNT(*) FROM staff) AS staff,
      (SELECT COUNT(*) FROM staff WHERE position = 'Doctor') AS doctors,
      (SELECT COUNT(*) FROM staff WHERE position = 'Nurse') AS nurses,
      (SELECT COUNT(*) FROM patient p WHERE NOT EXISTS
        (SELECT 1 FROM patientward pw WHERE pw.patientId=p.patientId)) AS unassignedPatients`),
    database.queryPromise(`SELECT w.wardId, w.wardName, w.capacity,
      COUNT(pw.id) AS occupancy FROM ward w LEFT JOIN patientward pw ON pw.wardId=w.wardId
      GROUP BY w.wardId, w.wardName, w.capacity ORDER BY w.wardName`)
  ]);
  res.json({ success: true, data: { totals: totals[0], wards } });
}));

router.post('/change-password', rateLimit({ max: 10, key: "password" }), asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (typeof currentPassword !== 'string' || currentPassword.length > 256 ||
      typeof newPassword !== 'string' || newPassword.length < 12 || newPassword.length > 256) {
    return res.status(400).json({ success: false, message: 'Provide your current password and a new password of 12–256 characters.' });
  }
  const users = await database.queryPromise('SELECT id, password FROM login WHERE id = ?', [req.session.userId]);
  const user = users[0];
  if (!user || !await verifyPassword(currentPassword, user.password)) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }
  if (await verifyPassword(newPassword, user.password)) {
    return res.status(400).json({ success: false, message: 'Choose a different password.' });
  }
  const result = await database.queryPromise('UPDATE login SET password = ? WHERE id = ? AND password = ?',
    [await hashPassword(newPassword), user.id, user.password]);
  if (!result.affectedRows) {
    return res.status(409).json({ success: false, message: 'Password changed in another request. Sign in again.' });
  }
  await new Promise((resolve, reject) => req.session.destroy(error => error ? reject(error) : resolve()));
  res.clearCookie('connect.sid');
  res.json({ success: true, message: 'Password changed. Please sign in again.' });
}));

// Table names are internal constants; only the numeric ID comes from the client.
for (const [route, table] of [
  ['remove-doctor-patient', 'doctorpatient'],
  ['remove-nurse-ward', 'nurseward'],
  ['remove-patient-ward', 'patientward']
]) {
  router.post('/' + route, validateId, asyncHandler(async (req, res) => {
    const result = await database.queryPromise(`DELETE FROM ${table} WHERE id = ?`, [req.body.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Assignment no longer exists. Refresh the list.' });
    res.json({ success: true, message: 'Assignment removed successfully.' });
  }));
}

module.exports = router;
