// Preserve legacy actions while sharing validated, parameterized handlers.
const router = require('express').Router();
const handlers = require('./database-new');
const actions = {
  "pharmacy-list": "pharmacy-list",
  "pharmacy-add": "pharmacy-add",
  "pharmacy-adjust": "pharmacy-adjust",
  "dashboard": "dashboard",
  "change-password": "change-password",
  "removed-p": "remove-doctor-patient",
  "removen-w": "remove-nurse-ward",
  "removep-w": "remove-patient-ward",
  "login": "login",
  "logout": "logout",
  "add-user": "add-user",
  "fetchp": "fetch-patients",
  "fetche": "fetch-staff",
  "fetchw": "fetch-wards",
  "fetchd-p": "fetch-doctor-patient",
  "fetchn-w": "fetch-nurse-ward",
  "fetchp-w": "fetch-patient-ward",
  "addp": "add-patient",
  "adde": "add-staff",
  "updatep": "update-patient",
  "updatee": "update-staff",
  "deletep": "delete-patient",
  "deletee": "delete-staff",
  "addd-p": "add-doctor-patient",
  "addn-w": "add-nurse-ward",
  "addp-w": "add-patient-ward",
  "appp": "appointments-patient",
  "appd": "appointments-doctor",
  "appn": "appointments-nurse"
};
router.post('/action', (req,res,next)=>{
 const action=req.body && req.body.action;
 if (!Object.hasOwn(actions,action)) return res.status(400).json({success:false,message:'Unknown action'});
 const original=req.url;
 req.url='/'+actions[action];
 handlers.handle(req,res,err=>{req.url=original;next(err);});
});
module.exports=router;
