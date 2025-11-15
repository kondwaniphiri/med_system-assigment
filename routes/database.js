const { response } = require('express');
let express = require('express');

let router = express.Router();

let database = require('../db');

// router.get('/',function(request, response, next){

// });

router.post("/action",function(req,res,next){

    let action = req.body.action;


    if(action == 'login'){
        let query = "SELECT * FROM login";
        database.query(query,function(error,data){
            res.json({
                   data:data
                });
        });
        }

// fetch data//////////////////
    // fetch patient data
    if(action == 'fetchp'){
    let query = "SELECT * FROM patient";
    database.query(query,function(error,data){
        res.json({
            data:data
        });
    });
    }
    // fetchpatientdata

    // fetch employee data
    if(action == 'fetche'){
        let query = "SELECT * FROM staff";
        database.query(query,function(error,data){
            res.json({
                data:data
            });
        });
        }
    // fetch employee data
    
    // fetch ward data
        if(action == 'fetchw'){
            let query = "SELECT * FROM ward";
            database.query(query,function(error,data){
                res.json({
                    data:data
                });
            });
            }
    // fetch ward data
    
    // fetch doctor-patient
    if(action == 'fetchd-p'){
        let query = "SELECT * FROM doctorpatient";
        database.query(query,function(error,data){
            res.json({
                data:data
            });
        });
        }
    // fetch doctor-patient

    // fetch nurse-ward details
    if(action == 'fetchn-w'){
        let query = "SELECT * FROM nurseward";
        database.query(query,function(error,data){
            res.json({
                data:data
            });
        });
        }
    // fetch nurse-ward details

    // fetch patient-ward details
    if(action == 'fetchp-w'){
        let query = "SELECT * FROM patientward";
        database.query(query,function(error,data){
            res.json({
                data:data
            });
        });
        }
    // fetch patient-ward details


// fetch ward data/////////////////


// add data /////////////////////
    // add staff data
    if(action == 'adde'){
        let firstName = req.body.firstname;
        let surname = req.body.surname;
        let position = req.body.position;
        let SSN = req.body.SSN;
        let street = req.body.street;
        let town = req.body.town;
        let province = req.body.province;
        let query = `INSERT INTO staff(firstName, surname, position, SSN, street, town, province)
        VALUES ("${firstName}", "${surname}", "${position}", "${SSN}", "${street}", "${town}", "${province}")`;
        database.query(query,function(error,data){
            res.json({
                message:"Record Added Sucessfully!"
            });
        });
        }
    // add staff data


    // add patient data
    if(action == 'addp'){
        let firstName = req.body.firstName;
        let surname = req.body.surname;
        let insuranceName = req.body.insurance;
        let phone = req.body.phone;
        let street = req.body.street;
        let town = req.body.town;
        let province = req.body.province;
        let query = `INSERT INTO patient(firstName, surname, insuranceName, phone, street, town, province)
        VALUES ("${firstName}", "${surname}", "${insuranceName}", "${phone}", "${street}", "${town}", "${province}")`;
        database.query(query,function(error,data){
            res.json({
                message:"Record Added Sucessfully!"
            });
        });
        }
    // add staff data


    // add nurse-ward details
    if(action == 'addn-w'){
        let nurseId = req.body.nurseId;
        let wardId = req.body.wardId;
        let query = `INSERT INTO nurseward(nurseId, wardId)
        VALUES ("${nurseId}", "${wardId}")`;
        database.query(query,function(error,data){
            res.json({
                message:"Record Added Sucessfully!"
            });
        });
        }
        //add nurse-ward details

        //add doctor-patient
        if(action == 'addd-p'){
            let doctorId = req.body.doctorId;
            let patientId = req.body.patientId;
            let query = `INSERT INTO doctorpatient(doctorId, patientId)
            VALUES ("${doctorId}", "${patientId}")`;
            database.query(query,function(error,data){
                console.log(error)
                res.json({
                    message:"Record Added Sucessfully!"
                });
            });
            }
        //add doctor-patient
        
        //add doctor-patient
        if(action == 'addp-w'){
            let patientId = req.body.patientId;
            let wardId = req.body.wardId;
            let query = `INSERT INTO patientward(patientId, wardId)
            VALUES ("${patientId}", "${wardId}")`;
            database.query(query,function(error,data){
                console.log(error)
                res.json({
                    message:"Record Added Sucessfully!"
                });
            });
            }
        //add doctor-patient

// add data /////////////////////



//update data ///////////////////////

if(action == 'updatep'){
    let patientId = req.body.id;
    let firstName = req.body.firstName;
    let surname = req.body.surname;
    let insuranceName = req.body.insurance;
    let phone = req.body.phone;
    let street = req.body.street;
    let town = req.body.town;
    let province = req.body.province;
    let query = `UPDATE patient SET 
    firstName ="${firstName}", surname ="${surname}", 
    insuranceName ="${insuranceName}", phone ="${phone}", street ="${street}", town ="${town}", province ="${province}"
    WHERE patientId ="${patientId}"`;
    database.query(query,function(error,data){
        res.json({
            message:"Record Updated Successfully!"
        });
    });
}

if(action == 'updatee'){
    let staffId = req.body.id;
    let firstName = req.body.firstname;
    let surname = req.body.surname;
    let position = req.body.position;
    let SSN = req.body.SSN;
    let street = req.body.street;
    let town = req.body.town;
    let province = req.body.province;
    let query = `UPDATE staff SET 
    firstName ="${firstName}", surname ="${surname}", 
    position ="${position}", SSN ="${SSN}", street ="${street}", town ="${town}", province ="${province}"
    WHERE staffId ="${staffId}"`;
    database.query(query,function(error,data){
        res.json({
            message:"Record Updated Successfully!"
        });
    });
}

//update data ///////////////////////



// delete data //////////////////////

if(action == 'deletep'){
    let patientId = req.body.id;
    let query = `Delete FROM patient WHERE patientId ="${patientId}"`;
    database.query(query,function(error,data){
    res.json({
        message:"Record Deleted Successfully!"
    });
});
}


// delete staff

if(action == 'deletee'){
    let staffId = req.body.id;
    let query = `Delete FROM staff WHERE staffId ="${staffId}"`;
    database.query(query,function(error,data){
    res.json({
        message:"Record Deleted Successfully!"
    });
});
}
// delete data //////////////////////

// appointments queries //////////////////

if(action == 'appp'){
    let query = `select distinct p.patientId, p.firstName, p.surname,w.wardName,s.position, s.firstName as staffName,s.staffId
    from patient as p
    join staff as s
    join doctorpatient as dp
    join ward as w
    join patientward as pw
    join nurseward as nw
    on p.patientId=pw.patientId and p.patientId=dp.patientId and pw.wardId=w.wardId and (dp.doctorId=s.staffId or nw.nurseId=s.staffId) 
    order by p.patientId`;
    database.query(query,function(error,data){
    res.json({
        data: data
    });
});
}
if(action == 'appd'){
    let query = `select dp.doctorId, s.position,s.firstName as doctorName, p.patientId, p.firstName, p.surname
    from patient as p
    join staff as s
    join doctorpatient as dp
    on s.staffId=dp.doctorId and p.patientId=dp.patientId
    order by s.staffId
    ;`;
    database.query(query,function(error,data){
    res.json({
        data: data
    });
});
}



if(action == 'appn'){
    let query = `select distinct nw.nurseId, s.firstName as nurseName,pw.patientId,p.surname, p.firstName, w.wardName,w.wardId
    from nurseward as nw
    join staff as s
    join ward as w
    join patientward as pw
    join patient as p
    on (s.staffId=nw.nurseId and w.wardId=nw.wardId)and(p.patientId=pw.patientId and w.wardId=pw.wardId);`;
    database.query(query,function(error,data){
    res.json({
        data: data
    });
});
}

});

module.exports = router;
