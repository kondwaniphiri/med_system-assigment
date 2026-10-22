let safe;
let staffList;
let doctorPatient = [];
let nurseWard = [];
let searchId = document.querySelector("#searchId");
let staffId=document.querySelector(".lId");
let staffFirstName = document.querySelector(".lFirstName");
let staffSurname = document.querySelector(".lSurname");
let staffPosition = document.querySelector(".lPosition");
let wardId = document.querySelector('.wardIdSelect');
let select = document.querySelector(".wardNameSelect");
let patientId = document.querySelector('#searchId');
let patientName = document.querySelector('.patientFirstName');
let nurseWardAssign = document.querySelector(".nurseWardAssign");
let selectedOption=select.value;
$('.doctor-patient').hide();
$('.nurse-ward').hide();


// fetch staff data
$(document).ready(function(){
    loadData();
    function loadData(){
        $.ajax({
            url:"/database/action",
            method:"POST",
            data:{action:'fetche'},
            dataType :"JSON",
            success: function(data){
                data = data.data;
                staffList=data;

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
                        let id=data[i].staffId.toString().toLowerCase();
                        let SSN = String(data[i].SSN || "").toLowerCase();
    
                        if(document.querySelector("#id").checked == true){
                            if(id.includes(value)){
                                filteredData.push(data[i]);
                            }
                        }else if(document.querySelector("#name").checked == true){
                            if(name.includes(value)){
                                filteredData.push(data[i]);
                            }
                        }
                        else{
                            if(SSN.includes(value)){
                                filteredData.push(data[i]);
                            }
                        }
                    }
                    return filteredData;
                }
        
                function buildTable(data){
                let html = ``;
        
                for(let i = 0; i<data.length; i++){
                    let staffId = data[i].staffId;
                    let firstName = data[i].firstName;
                    let surname = data[i].surname;
                    let position = data[i].position;
                    let street = data[i].street;
                    let town = data[i].town;
                    let province = data[i].province;
                    let SSN = data[i].SSN;
                    html += `<tr>
                        <td>${escapeHtml(staffId)}</td>
                        <td>${escapeHtml(firstName)}</td>
                        <td>${escapeHtml(surname)}</td>
                        <td>${escapeHtml(position)}</td>
                        <td>${escapeHtml(street)}</td>
                        <td>${escapeHtml(town)}</td>
                        <td>${escapeHtml(province)}</td>
                        <td>${escapeHtml(SSN)}</td>
                        </tr>`;
                }        
                document.querySelector("#viewe").innerHTML = html;
                details();
            }

}})}});
// fetch staff data


// fetch patient data
$(document).ready(function(){
    loadData();
    function loadData(){
        $.ajax({
            url:"/database/action",
            method:"POST",
            data:{action:'fetchp'},
            dataType :"JSON",
            success: function(data){
                data = data.data;
            searchId.addEventListener("keyup",function(){
                let check = [];
            for(let i=0; i<data.length; i++){
                check.push(data[i].patientId);
                if(searchId.value == data[i].patientId){
                    document.querySelector(".patientFirstName").textContent = data[i].firstName+"  ";
                    document.querySelector(".patientSurname").textContent = data[i].surname;
                    safe=true;
                }
            }
            if(!check.some(id => String(id) === searchId.value)||searchId.value==""){
                document.querySelector(".patientFirstName").textContent = "";
                document.querySelector(".patientSurname").textContent = "";
                safe=false;
            }
        });
}})}});
// fetch patient data


// fetch ward data
$(document).ready(function(){
    loadData();
    function loadData(){
        $.ajax({
            url:"/database/action",
            method:"POST",
            data:{action:'fetchw'},
            dataType :"JSON",
            success: function(data){
                data = data.data;
                let ward = ``;
                let wardName;
                for(let i=0; i<data.length;i++){
                    wardName = data[i].wardName;
                    ward +=`<option value="${escapeHtml(wardName)}">${escapeHtml(wardName)}</option>`
                }
                select.innerHTML = ward;
                selectedOption = select.value;
                runthrough();
                function runthrough(){
                    for(let i=0; i<data.length;i++){
                        if(selectedOption == data[i].wardName){
                            wardId.textContent = data[i].wardId;
                        }
                    }
                }
                select.addEventListener("change",function(){
                    selectedOption=select.value;
                    runthrough();
                })

}})}})
// fetch ward data

// fetch doctor-patient data
$(document).ready(function(){
    loadData();
    function loadData(){
$.ajax({
    url:"/database/action",
    method:"POST",
    data:{action:'fetchd-p'},
    dataType :"JSON",
    success: function(data){
        doctorPatient = data.data;
}})}})

// fetch doctor-patient data

// fetch nurse-ward data
$(document).ready(function(){
    loadData();
    function loadData(){
$.ajax({
    url:"/database/action",
    method:"POST",
    data:{action:'fetchn-w'},
    dataType :"JSON",
    success: function(data){
        nurseWard = data.data;        
}})}});

// fetch nurse-ward data



// display table data on click
function details(){
    let table = document.querySelector("#viewe"),rIndex;
    for(let i=0;i<table.rows.length; i++){
        table.rows[i].onclick = function(){
        rIndex =this.rowIndex;
        if(this.cells[3].textContent.toLowerCase()=='doctor'){
            $('.doctor-patient').show();
            $('.nurse-ward').hide();
        }else if(this.cells[3].textContent.toLowerCase()=='nurse'){
            $('.nurse-ward').show();
            $('.doctor-patient').hide();
        }
        if (!['doctor', 'nurse'].includes(this.cells[3].textContent.toLowerCase())) { $('.doctor-patient, .nurse-ward').hide(); }
        staffId.textContent = this.cells[0].textContent;
        staffFirstName.textContent = this.cells[1].textContent;
        staffSurname.textContent = this.cells[2].textContent;
        staffPosition.textContent = this.cells[3].textContent;    }
    }
}
// display table data on click




// Doctor Assignment Code
selectDoctor();
function selectDoctor(){
    document.querySelector(".doctorPatientAssign").addEventListener('click',function(){
        let insertDoctorId = staffId.textContent;
        let insertPatientId = patientId.value;
        if(safe){
            let match = false;
            for(let i = 0; i<doctorPatient.length;i++){
                
                if(insertDoctorId == doctorPatient[i].doctorId && insertPatientId == doctorPatient[i].patientId){
                    match = true;
                    break;
                }
            }if(match){
                    alert("Doctor "+staffFirstName.textContent+' has already been assigned to '+ patientName.textContent)
                }else{
                    $.ajax({
                        url:"/database/action",
                        method:"POST",
                        data:{'doctorId':insertDoctorId,'patientId':insertPatientId,'action':"addd-p"},
                        dataType:'JSON',
                        success:function(data){
                            alert("Doctor "+staffFirstName.textContent+' has been assigned to '+ patientName.textContent+" successfully!")
                            location.reload()
                        }
                    });
            }
        }else if(searchId.value===""){
            alert("Please Select a Patient to assign a Doctor to");
        }else if(!safe){
            alert('Please Enter a Patient with a valid ID');
        }
    }
    )}
// Doctor Assignment Code


// nurse assigment code
assignNurse();
    function assignNurse(){    
        nurseWardAssign.addEventListener('click',function(){
            let match = false;
            for(let i = 0;i<nurseWard.length;i++){
                if(staffId.textContent == nurseWard[i].nurseId && wardId.textContent == nurseWard[i].wardId){
                    match = true;
                    break;
                }
            }
            if(match){
                alert("Nurse "+staffFirstName.textContent+' has already been assigned to '+select.value )
            }else{
                $.ajax({
                    url:"/database/action",
                    method:"POST",
                    data:{'nurseId':staffId.textContent,'wardId':wardId.textContent,'action':"addn-w"},
                    dataType:'JSON',
                    success:function(data){
                        alert("Nurse "+staffFirstName.textContent+' has been assigned to '+select.value + " successfully!")
                        location.reload()
                    }
                });
                }
        });
    }
// nurse assigment code
