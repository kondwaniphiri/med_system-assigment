const { promisify } = require('util');

// Lock the patient and ward so concurrent requests cannot overbook or assign
// one patient to two wards. Occupancy is derived from assignments, not a cache.
module.exports = async function assignWard(pool, patientId, wardId) {
  const connection = await promisify(pool.getConnection).call(pool);
  const query = promisify(connection.query).bind(connection);
  try {
    await promisify(connection.beginTransaction).call(connection);
    const patients = await query('SELECT patientId FROM patient WHERE patientId = ? FOR UPDATE', [patientId]);
    const wards = await query('SELECT wardId, capacity FROM ward WHERE wardId = ? FOR UPDATE', [wardId]);
    if (!patients.length || !wards.length) throw Object.assign(new Error('Patient or ward not found'), { status: 404 });
    const existing = await query('SELECT id FROM patientward WHERE patientId = ?', [patientId]);
    if (existing.length) throw Object.assign(new Error('Patient already has a ward assignment'), { status: 409 });
    const occupancy = await query('SELECT COUNT(*) AS total FROM patientward WHERE wardId = ?', [wardId]);
    if (wards[0].capacity != null && occupancy[0].total >= wards[0].capacity) {
      throw Object.assign(new Error('This ward is full'), { status: 409 });
    }
    const result = await query('INSERT INTO patientward (patientId, wardId) VALUES (?, ?)', [patientId, wardId]);
    await promisify(connection.commit).call(connection);
    return result;
  } catch (error) {
    await promisify(connection.rollback).call(connection);
    throw error;
  } finally {
    connection.release();
  }
};
