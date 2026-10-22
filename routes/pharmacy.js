const router = require('express').Router();
const database = require('../db');
const { body, validationResult } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { isAuthenticated, isDoctor } = require('../middleware/auth');

router.use(isAuthenticated, isDoctor);
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Check the medicine details.', errors: errors.array() });
  next();
};
router.post('/pharmacy-list', asyncHandler(async (req, res) => {
  const rows = await database.queryPromise('SELECT medicineId, name, strength, unit, quantity, minimumStock, DATE_FORMAT(expiryDate, "%Y-%m-%d") AS expiryDate FROM pharmacy_inventory ORDER BY name, strength');
  res.json({ success: true, data: rows });
}));
router.post('/pharmacy-add', [
  body('name').isString().trim().isLength({ min: 2, max: 100 }),
  body('strength').isString().trim().isLength({ min: 1, max: 50 }),
  body('unit').isIn(['Tablets', 'Capsules', 'Bottles', 'Vials', 'Tubes', 'Packets']),
  body('quantity').isInt({ min: 0, max: 1000000 }).toInt(),
  body('minimumStock').isInt({ min: 0, max: 1000000 }).toInt(),
  body('expiryDate').optional({ checkFalsy: true }).matches(/^\d{4}-\d{2}-\d{2}$/).isISO8601({ strict: true }),
  validate
], asyncHandler(async (req, res) => {
  const { name, strength, unit, quantity, minimumStock, expiryDate } = req.body;
  try {
    const result = await database.queryPromise('INSERT INTO pharmacy_inventory (name, strength, unit, quantity, minimumStock, expiryDate) VALUES (?, ?, ?, ?, ?, ?)',
      [name, strength, unit, quantity, minimumStock, expiryDate || null]);
    res.status(201).json({ success: true, data: { id: result.insertId }, message: 'Medicine added.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'This medicine and strength already exist. Use Restock.' });
    throw error;
  }
}));
router.post('/pharmacy-adjust', [
  body('id').isInt({ min: 1 }).toInt(),
  body('change').isInt({ min: -1000000, max: 1000000 }).toInt().custom(value => value !== 0),
  validate
], asyncHandler(async (req, res) => {
  const { id, change } = req.body;
  // One atomic update prevents negative stock under concurrent requests.
  const result = await database.queryPromise(`UPDATE pharmacy_inventory SET quantity = CAST(quantity AS SIGNED) + ?
    WHERE medicineId = ? AND CAST(quantity AS SIGNED) + ? BETWEEN 0 AND 1000000
    AND (? > 0 OR expiryDate IS NULL OR expiryDate >= CURDATE())`, [change, id, change, change]);
  if (!result.affectedRows) {
    const rows = await database.queryPromise('SELECT medicineId FROM pharmacy_inventory WHERE medicineId = ?', [id]);
    return res.status(rows.length ? 409 : 404).json({ success: false, message: rows.length ? 'Cannot update stock: check available quantity, stock limit, or expiry date.' : 'Medicine not found.' });
  }
  res.json({ success: true, message: change > 0 ? 'Stock replenished.' : 'Stock issued.' });
}));
module.exports = router;
