let patientAppointmentData = [];
let doctorAppointment = [];
let nurseAppointment = [];
$('.nurse').hide();
$(document).ready(patientStaff());
function patientStaff(){
    if(document.querySelector("#staff").checked){
        $('.staffTable').show();
        $('.patientTable').hide();
        $('.patient').hide();
        $('.doctor').show();
    }
    else if(document.querySelector("#patient").checked){
        $('.patientTable').show();
        $('.patient').show();
        $('.staffTable').hide();
        $('.doctor').hide();
        $('.nurse').hide();
    }
};


$(document).ready(function(){
    loadData();
    function loadData(){
        $.ajax({
            url:"http://localhost:3000/database/action",
            method:"POST",
            data:{action:'fetchp'},
            dataType :"JSON",
            success: function(data){
                data = data.data;
                
                document.querySelector("#search").addEventListener("keyup",function(){
                    let value = this.value;
                    let filteredData = searchTable(value,data);
                    buildTable(filteredData);
                });
                
                buildTable(data);
        
                function searchTable(value, data){
                    let filteredData=[]
        
                    for(let i =0; i<data.length;i++){
                        value = value.toLowerCase();
                        let name=data[i].firstName.toLowerCase();
                        let id=data[i].patientId.toString().toLowerCase();
                        let insurance = data[i].insuranceName.toLowerCase();
        
                        if(document.querySelector("#id").checked == true){
                            if(id.toString().includes(value)){
                                filteredData.push(data[i]);
                            }
                        }else if(document.querySelector("#name").checked == true){
                            if(name.includes(value)){
                                filteredData.push(data[i]);
                            }
                        }
                        else{
                            if(insurance.includes(value)){
                                filteredData.push(data[i]);
                            }
                        }
                    }
                    return filteredData
                }
        
                function buildTable(data){
                    console.log(data);
                let html = ``;
        
                for(let i = 0; i<data.length; i++){
                    let patientId = data[i].patientId;
                    let firstName = data[i].firstName;
                    let surname = data[i].surname;
                    let insuranceName = data[i].insuranceName;
                    let phone = data[i].phone;
                    let street = data[i].street;
                    let town = data[i].town;
                    let province = data[i].province;
                    html += `<tr>
                        <td>${patientId}</td>
                         <td>${firstName}</td>
                        <td>${surname}</td>
                        <td>${insuranceName}</td>
                        <td>${phone}</td>
                        <td>${street}</td>
                        <td>${town}</td>
                        <td>${province}</td>
                        </tr>`;
                }
                document.querySelector("#viewp").innerHTML= html;
                patientDetails();   
}}})}});
$(document).ready(function(){
    loadData();
    function loadData(){
        $.ajax({
            url:"http://localhost:3000/database/action",
            method:"POST",
            data:{action:'appp'},
            dataType :"JSON",
            success: function(data){
                patientAppointmentData = data.data;
}})}})
$(document).ready(function(){
    loadData();
    function loadData(){
        $.ajax({
            url:"http://localhost:3000/database/action",
            method:"POST",
            data:{action:'appd'},
            dataType :"JSON",
            success: function(data){
                doctorAppointment = data.data;
                console.log(doctorAppointment);
}})}})
$(document).ready(function(){
    loadData();
    function loadData(){
        $.ajax({
            url:"http://localhost:3000/database/action",
            method:"POST",
            data:{action:'appn'},
            dataType :"JSON",
            success: function(data){
                nurseAppointment = data.data;
                console.log(nurseAppointment);
}})}})
function staffDetails(){
    let table = document.querySelector("#viewe"),rIndex;
    for(let i=0;i<table.rows.length; i++){
        table.rows[i].onclick = function(){
            document.querySelector('.staffId').innerHTML=this.cells[0].innerHTML;
            document.querySelector('.staffName').innerHTML=this.cells[1].innerHTML;
            document.querySelector('.staffId1').innerHTML=this.cells[0].innerHTML;
            document.querySelector('.staffName1').innerHTML=this.cells[1].innerHTML;
            if(this.cells[3].innerHTML=='Doctor'){
                $('.doctor').show();
                $('.nurse').hide();    
                let patients=  ``;
                for(let i=0; i<doctorAppointment.length;i++){
                    if(doctorAppointment[i].doctorId==this.cells[0].innerHTML){
                        patients+= `<span>${(doctorAppointment[i].firstName)} ${(doctorAppointment[i].surname)}, </span><span>${(doctorAppointment[i].patientId)} </span><button>Delete</button><br><br>`
                    }                    
                }
                document.querySelector('.patients').innerHTML = patients;
            }else if(this.cells[3].innerHTML=='Nurse'){
                $('.doctor').hide();
                $('.nurse').show();
                let patients=  ``;
                let wards=``;
                for(let i=0; i<nurseAppointment.length;i++){
                    if(nurseAppointment[i].nurseId==this.cells[0].innerHTML){
                        patients+= `<span>${(nurseAppointment[i].firstName)} ${(nurseAppointment[i].surname)}, </span><span>${(nurseAppointment[i].patientId)} </span><button>Delete</button><br><br>`
                        wards+= `<span>${(nurseAppointment[i].wardName)}, </span><span>${(nurseAppointment[i].wardId)} </span><button>Delete</button><br><br>`
                    }                    
                }
                console.log(patients);
                document.querySelector('.nursePatients').innerHTML = patients;
                document.querySelector('.wards').innerHTML = wards;
            }else{
                document.querySelector('.patients').innerHTML = ``;
                document.querySelector('.wards').innerHTML = ``;
            }
        }
    }
}
function patientDetails(){
    let table = document.querySelector("#viewp"),rIndex;
    for(let i=0;i<table.rows.length; i++){
        table.rows[i].onclick = function(){
        let doctor=[];
        let docId=[]
        let nurse = [];
        let nurId = [];
        let ward = [''];
        let doc = ``;
        let nur =``;
        rIndex =this.rowIndex;
        document.querySelector(".patientId").innerHTML = this.cells[0].innerHTML;
        document.querySelector(".patientName").innerHTML = `${this.cells[1].innerHTML} ${this.cells[2].innerHTML}`;
        for(let i=0; i<patientAppointmentData.length;i++){
            if(patientAppointmentData[i].patientId == document.querySelector(".patientId").innerHTML && patientAppointmentData[i].position=='Doctor'){
                doctor.push(patientAppointmentData[i].staffName);
                docId.push(patientAppointmentData[i].staffId)
                ward[0]=patientAppointmentData[i].wardName;
            }else if(patientAppointmentData[i].patientId == document.querySelector(".patientId").innerHTML && patientAppointmentData[i].position=='Nurse'){
                nurse.push(patientAppointmentData[i].staffName);
                nurId.push(patientAppointmentData[i].staffId)
                ward[0]=patientAppointmentData[i].wardName;
            }
        }
        for(let i=0; i<doctor.length;i++){
            doc += `<span>Dr. </span><span>${doctor[i]} </span><span>ID: ${docId[i]} </span><button>Delete</button><br><br>`
        }
        for(let i=0; i<nurse.length;i++){
            nur += `<span>Nurse. </span><span>${nurse[i]} </span><span>ID: ${nurId[i]} </span><button>Delete</button><br><br>`
        }
        document.querySelector('.doctors').innerHTML = doc;
        document.querySelector('.nurses').innerHTML = nur;
        document.querySelector('.ward').innerHTML = ward[0];



    }
    
}
}


