// Fictional assignment data. Replaces patient/staff/ward records only.
require('dotenv').config();
const mysql = require('mysql2/promise');

const staff = [
  ['Chanda', 'Bwalya', 'Doctor', '304133/47/3', 'Plot 18, Kabulonga Road', 'Lusaka', 'Lusaka'],
  ['Mutinta', 'Phiri', 'Doctor', '623265/62/7', 'Plot 42, Independence Avenue', 'Ndola', 'Copperbelt'],
  ['Mwila', 'Mulenga', 'Doctor', '360839/85/7', 'Plot 7, Livingstone Road', 'Choma', 'Southern'],
  ['Thandiwe', 'Banda', 'Nurse', '119728/96/2', 'Plot 25, Chilenje South', 'Lusaka', 'Lusaka'],
  ['Mwewa', 'Chileshe', 'Nurse', '946176/35/7', 'Plot 16, Riverside', 'Kitwe', 'Copperbelt'],
  ['Bupe', 'Tembo', 'Nurse', '557294/56/4', 'Plot 9, Highridge', 'Kabwe', 'Central'],
  ['Luyando', 'Mwanza', 'Nurse', '677245/77/7', 'Plot 31, Maramba', 'Livingstone', 'Southern'],
  ['Natasha', 'Zulu', 'Administrator', '670099/56/7', 'Plot 12, Woodlands', 'Lusaka', 'Lusaka'],
  ['Musonda', 'Sakala', 'Technician', '652183/59/8', 'Plot 20, Kapata', 'Chipata', 'Eastern'],
  ['Mapalo', 'Kabwe', 'Receptionist', '205000/43/8', 'Plot 14, Chalala', 'Lusaka', 'Lusaka']
];
const patients = [
  ['Kondwani', 'Banda', 'NHIMA', '+260970000101', 'Plot 24, Kamwala South', 'Lusaka', 'Lusaka'],
  ['Tendai', 'Phiri', 'NHIMA', '+260970000102', 'Plot 8, Kansenshi', 'Ndola', 'Copperbelt'],
  ['Chisomo', 'Mwale', 'Self-paying', '+260970000103', 'Plot 36, Parklands', 'Kitwe', 'Copperbelt'],
  ['Mubanga', 'Chanda', 'NHIMA', '+260970000104', 'Plot 11, Makululu', 'Kabwe', 'Central'],
  ['Misozi', 'Tembo', 'Private insurance', '+260970000105', 'Plot 19, Moth', 'Livingstone', 'Southern'],
  ['Sitali', 'Imasiku', 'NHIMA', '+260970000106', 'Plot 28, Chisonga', 'Mongu', 'Western'],
  ['Memory', 'Nyirenda', 'Self-paying', '+260970000107', 'Plot 15, Little Bombay', 'Chipata', 'Eastern'],
  ['Mwamba', 'Musonda', 'NHIMA', '+260970000108', 'Plot 6, Chiba', 'Kasama', 'Northern'],
  ['Lombe', 'Chilufya', 'NHIMA', '+260970000109', 'Plot 33, Senama', 'Mansa', 'Luapula'],
  ['Chipo', 'Sakala', 'Private insurance', '+260970000110', 'Plot 10, Kyawama', 'Solwezi', 'North-Western'],
  ['Namukolo', 'Simumba', 'NHIMA', '+260970000111', 'Plot 17, Ndeke', 'Choma', 'Southern'],
  ['Taonga', 'Mbewe', 'Self-paying', '+260970000112', 'Plot 21, Mpika Township', 'Mpika', 'Muchinga']
];

(async () => {
  if (!process.argv.includes('--replace')) throw new Error('Use --replace to explicitly replace existing patient, staff, ward and assignment records.');
  const connection = await mysql.createConnection({ host: process.env.DB_HOST || 'localhost', user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD, database: process.env.DB_NAME || 'hospital' });
  try {
    await connection.beginTransaction();
    // Delete child records first; retain login accounts and pharmacy stock.
    for (const table of ['doctorpatient', 'nurseward', 'patientward', 'patient', 'staff', 'ward']) await connection.query(`DELETE FROM ${table}`);
    const staffIds = [], patientIds = [], wardIds = [];
    for (const row of staff) {
      const [result] = await connection.execute('INSERT INTO staff (firstName, surname, position, SSN, street, town, province) VALUES (?, ?, ?, ?, ?, ?, ?)', row);
      staffIds.push(result.insertId);
    }
    for (const row of patients) {
      const [result] = await connection.execute('INSERT INTO patient (firstName, surname, insuranceName, phone, street, town, province) VALUES (?, ?, ?, ?, ?, ?, ?)', row);
      patientIds.push(result.insertId);
    }
    for (const [name, capacity] of [['Emergency', 20], ['Intensive Care Unit', 10], ['General Medical Ward', 30], ['Paediatric Ward', 20], ['Maternity Ward', 25]]) {
      const [result] = await connection.execute('INSERT INTO ward (wardName, capacity) VALUES (?, ?)', [name, capacity]);
      wardIds.push(result.insertId);
    }
    for (let i = 0; i < patientIds.length; i++) {
      await connection.execute('INSERT INTO doctorpatient (doctorId, patientId) VALUES (?, ?)', [staffIds[i % 3], patientIds[i]]);
      // Leave two patients awaiting admission for the dashboard overview.
      if (i < 10) await connection.execute('INSERT INTO patientward (patientId, wardId) VALUES (?, ?)', [patientIds[i], wardIds[i % 5]]);
    }
    for (let i = 0; i < wardIds.length; i++) await connection.execute('INSERT INTO nurseward (nurseId, wardId) VALUES (?, ?)', [staffIds[3 + i % 4], wardIds[i]]);
    await connection.query('UPDATE ward w SET currentOccupancy = (SELECT COUNT(*) FROM patientward pw WHERE pw.wardId=w.wardId)');
    await connection.commit();
    console.log('Replaced records with fictional Zambian data: 12 patients, 10 staff, 5 wards, 12 doctor assignments, 10 admissions and 5 nurse assignments. Logins and pharmacy retained.');
  } catch (error) {
    await connection.rollback(); throw error;
  } finally { await connection.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
