const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { hashPassword, verifyPassword } = require('../utils/passwords');

test('passwords use salted hashes and support legacy migration', async () => {
  const hash = await hashPassword('a long test password');
  assert.notEqual(hash, await hashPassword('a long test password'));
  assert.equal(await verifyPassword('a long test password', hash), true);
  assert.equal(await verifyPassword('wrong', hash), false);
  assert.equal(await verifyPassword('legacy', 'legacy'), true);
  assert.equal(await verifyPassword('wrong', 'legacy'), false);
  assert.equal(await verifyPassword('test', 'scrypt$broken'), false);
});

test('legacy and new APIs enforce sessions, validation, CSRF and safe queries', async t => {
  const calls = [];
  const user = { id: 1, username: 'admin', password: 'legacy password' };
  const medicine = { medicineId: 1, name: 'Test medicine', strength: '500 mg', unit: 'Tablets', quantity: 5, minimumStock: 10, expiryDate: '2028-01-31' };
  const fakeDb = {
    async queryPromise(sql, values) {
      calls.push({ sql, values });
      if (sql.startsWith('SELECT * FROM login')) return values[0] === user.username ? [user] : [];
      if (sql.startsWith('SELECT medicineId, name')) return [medicine];
      if (sql.startsWith('SELECT medicineId FROM pharmacy')) return Number(values[0]) === 1 ? [medicine] : [];
      if (sql.startsWith('UPDATE pharmacy_inventory')) {
        if (values[1] !== 1 || medicine.quantity + values[0] < 0 || medicine.quantity + values[0] > 1000000) return { affectedRows: 0 };
        medicine.quantity += values[0]; return { affectedRows: 1 };
      }
      if (sql.startsWith('INSERT INTO pharmacy_inventory')) {
        if (values[0] === medicine.name) throw Object.assign(new Error('Duplicate'), { code: 'ER_DUP_ENTRY' });
        return { insertId: 2 };
      }
      if (sql.startsWith('SELECT id, password FROM login')) return [user];
      if (sql.includes('AS unassignedPatients')) return [{ patients: 8, staff: 4, doctors: 2, nurses: 2, unassignedPatients: 3 }];
      if (sql.includes('GROUP BY w.wardId')) return [{ wardId: 1, wardName: 'ICU', capacity: 10, occupancy: 5 }];
      if (sql.startsWith('DELETE FROM')) return { affectedRows: Number(values[0]) === 2 ? 1 : 0 };
      if (sql.startsWith('UPDATE login')) { user.password = values[0]; return { affectedRows: 1 }; }
      return { insertId: 2 };
    },
    query(sql, values, callback) {
      if (typeof values === 'function') { callback = values; values = []; }
      calls.push({ sql, values });
      if (sql.includes('WHERE staffId = ? AND position')) return callback(null, []);
      if (sql.startsWith('DELETE')) return callback(null, { affectedRows: 0 });
      if (sql.startsWith('INSERT INTO patient ')) return callback(null, { insertId: 10 });
      callback(null, []);
    }
  };
  const dbPath = require.resolve('../db');
  require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: fakeDb };
  const app = require('../app');
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  let cookie = '', token = '';
  async function request(url, data, csrf = true) {
    const response = await fetch(base + url, {
      method: data ? 'POST' : 'GET', redirect: 'manual',
      headers: { Cookie: cookie, ...(data ? { 'Content-Type': 'application/json' } : {}), ...(csrf ? { 'X-CSRF-Token': token } : {}) },
      body: data ? JSON.stringify(data) : undefined
    });
    if (response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0];
    const text = await response.text();
    return { status: response.status, text, headers: response.headers };
  }
  const login = await request('/');
  token = login.text.match(/name="csrf-token" content="([^"]+)"/)[1];
  assert.equal((await request('/home')).status, 302);
  assert.equal((await request('/database/action', { action: 'fetchp' })).status, 401);
  assert.equal((await request('/api/fetch-patients', {})).status, 401);
  assert.equal((await request('/database/action', { action: 'dashboard' })).status, 401);
  assert.equal((await request('/database/action', { action: 'removep-w', id: 2 })).status, 401);
  assert.equal((await request('/api/change-password', { currentPassword: 'legacy password', newPassword: 'another long password' })).status, 401);
  assert.equal((await request('/database/action', { action: 'login' }, false)).status, 403);
  assert.equal((await request('/database/action', { action: 'login' })).status, 400);
  assert.equal((await request('/database/action', { action: 'login', username: 'admin', password: 'wrong' })).status, 401);
  const oldCookie = cookie;
  const signedIn = await request('/database/action', { action: 'login', username: 'admin', password: 'legacy password' });
  assert.equal(signedIn.status, 200);
  assert.notEqual(cookie, oldCookie);
  assert.ok(user.password.startsWith('scrypt$'));
  assert.equal(signedIn.text.includes('password'), false);
  for (const page of ['home','addp','adde','viewp','viewe','managep','managee','appointments','pharmacy']) {
    const result = await request('/' + page);
    assert.equal(result.status, 200, page);
    token = result.text.match(/name="csrf-token" content="([^"]+)"/)[1];
    for (const script of result.text.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(script[1], { filename: page });
  }
  assert.equal((await request('/database/action', { action: 'fetchp' })).status, 200);
  assert.equal((await request('/api/fetch-staff', {})).status, 200);
  assert.equal((await request('/database/action', { action: 'nonsense' })).status, 400);
  assert.equal((await request('/database/action', { action: 'addp', firstName: '<script>' })).status, 400);
  const street = '"><img src=x onerror=alert(1)>';
  assert.equal((await request('/database/action', { action: 'addp', firstName: 'Jane', surname: "O\u0027Neil", street })).status, 201);
  const insert = calls.find(c => c.sql.startsWith('INSERT INTO patient '));
  assert.equal(insert.sql.includes(street), false);
  assert.equal(insert.values.includes(street), true);
  assert.equal((await request('/database/action', { action: 'deletep', id: '1 OR 1=1' })).status, 400);
  assert.equal((await request('/database/action', { action: 'deletep', id: 999 })).status, 404);
  assert.equal((await request('/database/action', { action: 'addd-p', doctorId: 1, patientId: 1 })).status, 400);
  const dashboard = await request('/database/action', { action: 'dashboard' });
  assert.equal(dashboard.status, 200);
  assert.deepEqual(JSON.parse(dashboard.text).data.totals, { patients: 8, staff: 4, doctors: 2, nurses: 2, unassignedPatients: 3 });
  assert.equal(JSON.parse(dashboard.text).data.wards[0].occupancy, 5);
  assert.equal((await request('/api/dashboard', {})).status, 200);
  for (const action of ['removed-p', 'removen-w', 'removep-w']) {
    assert.equal((await request('/database/action', { action, id: '2 OR 1=1' })).status, 400);
    assert.equal((await request('/database/action', { action, id: 999 })).status, 404);
    assert.equal((await request('/database/action', { action, id: 2 })).status, 200);
  }
  const deleteCalls = calls.filter(call => /^DELETE FROM (doctorpatient|nurseward|patientward) /.test(call.sql));
  assert.equal(deleteCalls.length, 6);
  assert.ok(deleteCalls.every(call => call.sql.endsWith('WHERE id = ?')));
  assert.equal((await request('/database/action', { action: 'change-password', currentPassword: 'wrong', newPassword: 'a different long password' })).status, 400);
  assert.equal((await request('/database/action', { action: 'change-password', currentPassword: 'legacy password', newPassword: 'short' })).status, 400);
  assert.equal((await request('/database/action', { action: 'change-password', currentPassword: 'legacy password', newPassword: 'legacy password' })).status, 400);
  assert.equal((await request('/database/action', { action: 'change-password', currentPassword: 'legacy password', newPassword: 'a different long password' })).status, 200);
  assert.equal(await verifyPassword('a different long password', user.password), true);
  assert.equal((await request('/home')).status, 302);
  const newLogin = await request('/');
  token = newLogin.text.match(/name="csrf-token" content="([^"]+)"/)[1];
  assert.equal((await request('/database/action', { action: 'login', username: 'admin', password: 'legacy password' })).status, 401);
  assert.equal((await request('/database/action', { action: 'login', username: 'admin', password: 'a different long password' })).status, 200);
  const home = await request('/home');
  token = home.text.match(/name="csrf-token" content="([^"]+)"/)[1];
  assert.equal((await request('/database/action', { action: 'logout' })).status, 200);
  assert.equal((await request('/home')).status, 302);
  // Role comes from the stored account, never a login request parameter.
  user.username = 'test.staff'; user.role = 'Staff';
  let loginPage = await request('/');
  token = loginPage.text.match(/name="csrf-token" content="([^"]+)"/)[1];
  assert.equal((await request('/database/action', { action: 'login', username: user.username, password: 'a different long password', role: 'Doctor' })).status, 200);
  let roleHome = await request('/home'); token = roleHome.text.match(/name="csrf-token" content="([^"]+)"/)[1];
  assert.equal(roleHome.text.includes('Pharmacy Inventory'), false);
  assert.equal((await request('/pharmacy')).status, 403);
  assert.equal((await request('/database/action', { action: 'pharmacy-list' })).status, 403);
  assert.equal((await request('/api/pharmacy-adjust', { id: 1, change: 2 })).status, 403);
  await request('/database/action', { action: 'logout' });
  user.role = 'Doctor';
  loginPage = await request('/'); token = loginPage.text.match(/name="csrf-token" content="([^"]+)"/)[1];
  const doctorLogin = await request('/database/action', { action: 'login', username: user.username, password: 'a different long password' });
  assert.equal(JSON.parse(doctorLogin.text).data.position, 'Doctor');
  roleHome = await request('/home'); token = roleHome.text.match(/name="csrf-token" content="([^"]+)"/)[1];
  assert.equal(roleHome.text.includes('Pharmacy Inventory'), true);
  assert.equal((await request('/pharmacy')).status, 200);
  assert.equal((await request('/database/action', { action: 'pharmacy-list' })).status, 200);
  assert.equal((await request('/database/action', { action: 'pharmacy-adjust', id: 1, change: -6 })).status, 409);
  assert.equal(medicine.quantity, 5);
  assert.equal((await request('/database/action', { action: 'pharmacy-adjust', id: 1, change: -3 })).status, 200);
  assert.equal(medicine.quantity, 2);
  assert.equal((await request('/api/pharmacy-adjust', { id: 1, change: 10 })).status, 200);
  assert.equal(medicine.quantity, 12);
  assert.equal((await request('/database/action', { action: 'pharmacy-adjust', id: 1, change: 0 })).status, 400);
  assert.equal((await request('/database/action', { action: 'pharmacy-adjust', id: '1 OR 1=1', change: 1 })).status, 400);
  assert.equal((await request('/database/action', { action: 'pharmacy-adjust', id: 999, change: 1 })).status, 404);
  const medicinePayload = { action: 'pharmacy-add', name: 'New medicine', strength: '10 mg', unit: 'Tablets', quantity: 20, minimumStock: 5, expiryDate: '2028-01-31' };
  assert.equal((await request('/database/action', medicinePayload)).status, 201);
  assert.equal((await request('/database/action', { ...medicinePayload, quantity: -1 })).status, 400);
  assert.equal((await request('/database/action', { ...medicinePayload, expiryDate: '2028-02-31' })).status, 400);
  assert.equal((await request('/database/action', { ...medicinePayload, name: medicine.name })).status, 409);
});

test('browser source parses and escapes stored HTML', () => {
  for (const filename of fs.readdirSync(path.join(__dirname, '../public/javascripts')).filter(n => n.endsWith('.js'))) {
    const source = fs.readFileSync(path.join(__dirname, '../public/javascripts', filename), 'utf8');
    new vm.Script(source, { filename });
    assert.equal(source.includes('http://localhost:3000'), false);
  }
  const source = fs.readFileSync(path.join(__dirname, '../public/javascripts/common.js'), 'utf8').split('$.ajaxSetup')[0];
  const context = vm.createContext({});
  vm.runInContext(source, context);
  assert.equal(context.escapeHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.equal(context.escapeHtml(null), '');
});
