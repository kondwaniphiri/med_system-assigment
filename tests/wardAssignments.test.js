const { test } = require('node:test');
const assert = require('node:assert/strict');
const assignWard = require('../utils/wardAssignments');

function poolFor({ patient = true, ward = true, assigned = false, full = false, fail = false } = {}) {
  const events = [];
  const connection = {
    beginTransaction(cb) { events.push('begin'); cb(); },
    commit(cb) { events.push('commit'); cb(); },
    rollback(cb) { events.push('rollback'); cb(); },
    release() { events.push('release'); },
    query(sql, values, cb) {
      events.push(sql);
      if (sql.startsWith('SELECT patientId')) return cb(null, patient ? [{ patientId: 1 }] : []);
      if (sql.startsWith('SELECT wardId')) return cb(null, ward ? [{ wardId: 2, capacity: 5 }] : []);
      if (sql.startsWith('SELECT id')) return cb(null, assigned ? [{ id: 1 }] : []);
      if (sql.startsWith('SELECT COUNT')) return cb(null, [{ total: full ? 5 : 2 }]);
      if (fail) return cb(new Error('Database write failed'));
      assert.deepEqual(values, [1, 2]);
      cb(null, { insertId: 3 });
    }
  };
  return { events, getConnection(cb) { cb(null, connection); } };
}
test('ward assignment commits valid requests and releases its connection', async () => {
  const pool = poolFor();
  assert.equal((await assignWard(pool, 1, 2)).insertId, 3);
  assert.deepEqual(pool.events.slice(-2), ['commit', 'release']);
  assert.equal(pool.events.filter(s => s.includes('FOR UPDATE')).length, 2);
});
for (const [name, options, status] of [
  ['missing patient', { patient: false }, 404],
  ['missing ward', { ward: false }, 404],
  ['existing assignment', { assigned: true }, 409],
  ['full ward', { full: true }, 409],
  ['database failure', { fail: true }, undefined]
]) test(`ward assignment rolls back on ${name}`, async () => {
  const pool = poolFor(options);
  await assert.rejects(assignWard(pool, 1, 2), error => error.status === status);
  assert.deepEqual(pool.events.slice(-2), ['rollback', 'release']);
});
