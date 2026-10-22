const express = require("express");
const router = express.Router();
const database = require("../db");
const {
  validatePatient,
  validateStaff,
  validateId,
  validateDoctorPatient,
  validateNurseWard,
  validatePatientWard,
} = require("../middleware/validation");

// Helper function to send standardized responses
const sendResponse = (
  res,
  success,
  data = null,
  message = null,
  statusCode = 200
) => {
  const response = { success };
  if (message) response.message = message;
  if (data) response.data = data;
  res.status(statusCode).json(response);
};

// Helper function to handle database errors
const handleDatabaseError = (
  res,
  error,
  customMessage = "Database operation failed"
) => {
  console.error("Database error:", error);

  // Handle specific MySQL errors
  if (error.code === "ER_DUP_ENTRY") {
    return sendResponse(
      res,
      false,
      null,
      "Duplicate entry. Record already exists.",
      409
    );
  }
  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return sendResponse(
      res,
      false,
      null,
      "Referenced record does not exist.",
      400
    );
  }
  if (error.code === "ER_ROW_IS_REFERENCED_2") {
    return sendResponse(
      res,
      false,
      null,
      "Cannot delete. Record is referenced by other records.",
      400
    );
  }

  sendResponse(res, false, null, customMessage, 500);
};

// ==================== AUTHENTICATION ====================

const { isAuthenticated } = require('../middleware/auth');
const { hashPassword, verifyPassword } = require('../utils/passwords');
const { rateLimit, asyncHandler } = require('../middleware/errorHandler');
router.post('/login', rateLimit({max:15, key: "login"}), asyncHandler(async (req,res)=>{
 const {username,password}=req.body;
 if(typeof username!=='string'||typeof password!=='string'||!username.trim()||username.length>50||!password||password.length>256) return sendResponse(res,false,null,'Valid username and password are required',400);
 const users=await database.queryPromise('SELECT * FROM login WHERE username = ? LIMIT 1',[username.trim()]);
 const user=users[0];
 if(!user || !await verifyPassword(password,user.password)) return sendResponse(res,false,null,'Invalid username or password',401);
 if(!user.password.startsWith('scrypt$')) await database.queryPromise('UPDATE login SET password = ? WHERE id = ?',[await hashPassword(password),user.id]);
 await new Promise((resolve,reject)=>req.session.regenerate(err=>err?reject(err):resolve()));
 req.session.userId=user.id;req.session.username=user.username;
 req.session.position=user.username.toLowerCase()==='admin'?'admin':user.role==='Doctor'?'Doctor':'Staff';
 await new Promise((resolve,reject)=>req.session.save(err=>err?reject(err):resolve()));
 sendResponse(res,true,{id:user.id,username:user.username,position:req.session.position},'Login successful');
}));
router.use(isAuthenticated);
router.post('/logout',(req,res)=>req.session.destroy(err=>{
 if(err) return sendResponse(res,false,null,'Logout failed',500);
 res.clearCookie('connect.sid');sendResponse(res,true,null,'Logged out successfully');
}));
router.post('/add-user',asyncHandler(async(req,res)=>{
 if(req.session.position!=='admin') return sendResponse(res,false,null,'Administrator access required',403);
 const {username,password}=req.body;
 if(typeof username!=='string'||! /^[a-zA-Z0-9_.-]{3,50}$/.test(username)||typeof password!=='string'||password.length<12||password.length>256) return sendResponse(res,false,null,'Use a 3–50 character username and a password of 12–256 characters',400);
 const role=req.body.role || 'Staff';
 if(!['Staff','Doctor'].includes(role)) return sendResponse(res,false,null,'Choose Staff or Doctor',400);
 try {await database.queryPromise('INSERT INTO login (username,password,role) VALUES (?,?,?)',[username,await hashPassword(password),role]);sendResponse(res,true,null,'User added successfully',201);}catch(err){handleDatabaseError(res,err);}
}));

// ==================== FETCH OPERATIONS ====================

// Fetch all patients
router.post("/fetch-patients", (req, res) => {
  const query = "SELECT * FROM patient ORDER BY patientId DESC";

  database.query(query, (error, data) => {
    if (error) {
      return handleDatabaseError(res, error, "Failed to fetch patients");
    }
    sendResponse(res, true, data);
  });
});

// Fetch all staff
router.post("/fetch-staff", (req, res) => {
  const query = "SELECT * FROM staff ORDER BY staffId DESC";

  database.query(query, (error, data) => {
    if (error) {
      return handleDatabaseError(res, error, "Failed to fetch staff");
    }
    sendResponse(res, true, data);
  });
});

// Fetch all wards
router.post("/fetch-wards", (req, res) => {
  const query = "SELECT w.*, (SELECT COUNT(*) FROM patientward pw WHERE pw.wardId=w.wardId) AS currentOccupancy FROM ward w ORDER BY w.wardId";

  database.query(query, (error, data) => {
    if (error) {
      return handleDatabaseError(res, error, "Failed to fetch wards");
    }
    sendResponse(res, true, data);
  });
});

// Fetch doctor-patient relationships
router.post("/fetch-doctor-patient", (req, res) => {
  const query = "SELECT * FROM doctorpatient ORDER BY id DESC";

  database.query(query, (error, data) => {
    if (error) {
      return handleDatabaseError(
        res,
        error,
        "Failed to fetch doctor-patient relationships"
      );
    }
    sendResponse(res, true, data);
  });
});

// Fetch nurse-ward relationships
router.post("/fetch-nurse-ward", (req, res) => {
  const query = "SELECT * FROM nurseward ORDER BY id DESC";

  database.query(query, (error, data) => {
    if (error) {
      return handleDatabaseError(
        res,
        error,
        "Failed to fetch nurse-ward relationships"
      );
    }
    sendResponse(res, true, data);
  });
});

// Fetch patient-ward relationships
router.post("/fetch-patient-ward", (req, res) => {
  const query = "SELECT * FROM patientward ORDER BY id DESC";

  database.query(query, (error, data) => {
    if (error) {
      return handleDatabaseError(
        res,
        error,
        "Failed to fetch patient-ward relationships"
      );
    }
    sendResponse(res, true, data);
  });
});

// ==================== ADD OPERATIONS ====================

// Add patient
router.post("/add-patient", validatePatient, (req, res) => {
  const { firstName, surname, insurance, phone, street, town, province } =
    req.body;

  const query = `INSERT INTO patient (firstName, surname, insuranceName, phone, street, town, province)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;

  database.query(
    query,
    [firstName, surname, insurance, phone, street, town, province],
    (error, result) => {
      if (error) {
        return handleDatabaseError(res, error, "Failed to add patient");
      }
      sendResponse(
        res,
        true,
        { id: result.insertId },
        "Patient added successfully",
        201
      );
    }
  );
});

// Add staff
router.post("/add-staff", validateStaff, (req, res) => {
  const { firstname, surname, position, SSN, street, town, province } =
    req.body;

  const query = `INSERT INTO staff (firstName, surname, position, SSN, street, town, province)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;

  database.query(
    query,
    [firstname, surname, position, SSN, street, town, province],
    (error, result) => {
      if (error) {
        return handleDatabaseError(res, error, "Failed to add staff");
      }
      sendResponse(
        res,
        true,
        { id: result.insertId },
        "Staff member added successfully",
        201
      );
    }
  );
});

// Add doctor-patient relationship
router.post("/add-doctor-patient", validateDoctorPatient, (req, res) => {
  const { doctorId, patientId } = req.body;

  database.query('SELECT staffId FROM staff WHERE staffId = ? AND position = ?', [doctorId, 'Doctor'], (error, rows) => {
    if (error) return handleDatabaseError(res, error);
    if (!rows.length) return sendResponse(res, false, null, 'Select a valid doctor', 400);
  const query = `INSERT INTO doctorpatient (doctorId, patientId) VALUES (?, ?)`;

  database.query(query, [doctorId, patientId], (error, result) => {
    if (error) {
      return handleDatabaseError(
        res,
        error,
        "Failed to assign doctor to patient"
      );
    }
    sendResponse(
      res,
      true,
      { id: result.insertId },
      "Doctor-patient relationship created successfully",
      201
    );
  });
  });
});

// Add nurse-ward relationship
router.post("/add-nurse-ward", validateNurseWard, (req, res) => {
  const { nurseId, wardId } = req.body;

  database.query('SELECT staffId FROM staff WHERE staffId = ? AND position = ?', [nurseId, 'Nurse'], (error, rows) => {
    if (error) return handleDatabaseError(res, error);
    if (!rows.length) return sendResponse(res, false, null, 'Select a valid nurse', 400);
  const query = `INSERT INTO nurseward (nurseId, wardId) VALUES (?, ?)`;

  database.query(query, [nurseId, wardId], (error, result) => {
    if (error) {
      return handleDatabaseError(res, error, "Failed to assign nurse to ward");
    }
    sendResponse(
      res,
      true,
      { id: result.insertId },
      "Nurse-ward relationship created successfully",
      201
    );
  });
  });
});

// Add patient-ward relationship
router.post('/add-patient-ward', validatePatientWard, asyncHandler(async(req,res)=>{
 try {
  const result=await require('../utils/wardAssignments')(database,req.body.patientId,req.body.wardId);
  sendResponse(res,true,{id:result.insertId},'Patient-ward relationship created successfully',201);
 } catch(error) {
  if(error.status) return sendResponse(res,false,null,error.message,error.status);
  handleDatabaseError(res,error,'Failed to assign patient to ward');
 }
}));

// ==================== UPDATE OPERATIONS ====================

// Update patient
router.post(
  "/update-patient",
  [...validateId, ...validatePatient],
  (req, res) => {
    const { id, firstName, surname, insurance, phone, street, town, province } =
      req.body;

    const query = `UPDATE patient SET 
                   firstName = ?, surname = ?, insuranceName = ?, phone = ?, 
                   street = ?, town = ?, province = ?
                   WHERE patientId = ?`;

    database.query(
      query,
      [firstName, surname, insurance, phone, street, town, province, id],
      (error, result) => {
        if (error) {
          return handleDatabaseError(res, error, "Failed to update patient");
        }

        if (result.affectedRows === 0) {
          return sendResponse(res, false, null, "Patient not found", 404);
        }

        sendResponse(res, true, null, "Patient updated successfully");
      }
    );
  }
);

// Update staff
router.post("/update-staff", [...validateId, ...validateStaff], (req, res) => {
  const { id, firstname, surname, position, SSN, street, town, province } =
    req.body;

  const query = `UPDATE staff SET 
                   firstName = ?, surname = ?, position = ?, SSN = ?, 
                   street = ?, town = ?, province = ?
                   WHERE staffId = ?`;

  database.query(
    query,
    [firstname, surname, position, SSN, street, town, province, id],
    (error, result) => {
      if (error) {
        return handleDatabaseError(res, error, "Failed to update staff");
      }

      if (result.affectedRows === 0) {
        return sendResponse(res, false, null, "Staff member not found", 404);
      }

      sendResponse(res, true, null, "Staff member updated successfully");
    }
  );
});

// ==================== DELETE OPERATIONS ====================

// Delete patient
router.post("/delete-patient", validateId, (req, res) => {
  const { id } = req.body;

  const query = `DELETE FROM patient WHERE patientId = ?`;

  database.query(query, [id], (error, result) => {
    if (error) {
      return handleDatabaseError(res, error, "Failed to delete patient");
    }

    if (result.affectedRows === 0) {
      return sendResponse(res, false, null, "Patient not found", 404);
    }

    sendResponse(res, true, null, "Patient deleted successfully");
  });
});

// Delete staff
router.post("/delete-staff", validateId, (req, res) => {
  const { id } = req.body;

  const query = `DELETE FROM staff WHERE staffId = ?`;

  database.query(query, [id], (error, result) => {
    if (error) {
      return handleDatabaseError(res, error, "Failed to delete staff");
    }

    if (result.affectedRows === 0) {
      return sendResponse(res, false, null, "Staff member not found", 404);
    }

    sendResponse(res, true, null, "Staff member deleted successfully");
  });
});

// ==================== APPOINTMENT QUERIES ====================

// Get patient appointment details
router.post("/appointments-patient", (req, res) => {
  const query = `SELECT p.patientId, p.firstName, p.surname, w.wardName,
 s.position, s.firstName AS staffName, s.staffId
 FROM patient p JOIN doctorpatient dp ON dp.patientId=p.patientId
 JOIN staff s ON s.staffId=dp.doctorId
 LEFT JOIN patientward pw ON pw.patientId=p.patientId
 LEFT JOIN ward w ON w.wardId=pw.wardId
 UNION
 SELECT p.patientId, p.firstName, p.surname, w.wardName,
 s.position, s.firstName AS staffName, s.staffId
 FROM patient p JOIN patientward pw ON pw.patientId=p.patientId
 JOIN ward w ON w.wardId=pw.wardId
 JOIN nurseward nw ON nw.wardId=w.wardId
 JOIN staff s ON s.staffId=nw.nurseId ORDER BY patientId`;

  database.query(query, (error, data) => {
    if (error) {
      return handleDatabaseError(
        res,
        error,
        "Failed to fetch patient appointments"
      );
    }
    sendResponse(res, true, data);
  });
});

// Get doctor appointment details
router.post("/appointments-doctor", (req, res) => {
  const query = `SELECT dp.doctorId, s.position, s.firstName AS doctorName, 
                   p.patientId, p.firstName, p.surname
                   FROM patient AS p
                   JOIN staff AS s
                   JOIN doctorpatient AS dp
                   ON s.staffId = dp.doctorId AND p.patientId = dp.patientId
                   ORDER BY s.staffId`;

  database.query(query, (error, data) => {
    if (error) {
      return handleDatabaseError(
        res,
        error,
        "Failed to fetch doctor appointments"
      );
    }
    sendResponse(res, true, data);
  });
});

// Get nurse appointment details
router.post("/appointments-nurse", (req, res) => {
  const query = `SELECT DISTINCT nw.nurseId, s.firstName AS nurseName, 
                   pw.patientId, p.surname, p.firstName, w.wardName, w.wardId
                   FROM nurseward AS nw
                   JOIN staff AS s
                   JOIN ward AS w
                   JOIN patientward AS pw
                   JOIN patient AS p
                   ON (s.staffId = nw.nurseId AND w.wardId = nw.wardId)
                   AND (p.patientId = pw.patientId AND w.wardId = pw.wardId)`;

  database.query(query, (error, data) => {
    if (error) {
      return handleDatabaseError(
        res,
        error,
        "Failed to fetch nurse appointments"
      );
    }
    sendResponse(res, true, data);
  });
});

router.use(require('./improvements'));
router.use(require('./pharmacy'));

module.exports = router;
