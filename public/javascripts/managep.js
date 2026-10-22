let selectedOption;
let patientWard=[];
let patientList;
let select = document.querySelector(".wardNameSelect");
let wardId = document.querySelector('.wardIdSelect');
let patientId=document.querySelector(".lId");
let patientName = document.querySelector(".lFirstName");
let patientSurname = document.querySelector(".lSurname");
let patientWardAssign= document.querySelector('.patientWardAssign');
let wardNom;
selectedOption=select.value;

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
                patientList=data;
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
                        let insurance = String(data[i].insuranceName || "").toLowerCase();
        
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
                let html = ``;
        
                for(let i = 0; i<data.length; i++){
                    let patientId = data[i].patientId;
                    let firstName = data[i].firstName;
                    let surname = data[i].surname;
                    let insuranceName = data[i].insuranceName;
                    let phone = data[i].phone;
                    let street = data[i].street;
                    html += `<tr>
                        <td>${escapeHtml(patientId)}</td>
                         <td>${escapeHtml(firstName)}</td>
                        <td>${escapeHtml(surname)}</td>
                        <td>${escapeHtml(insuranceName)}</td>
                        <td>${escapeHtml(phone)}</td>
                        <td>${escapeHtml(street)}</td>
                        </tr>`;
                }        
                document.querySelector("#viewp").innerHTML = html;
                details();
            }
            }
        })
    }
});

function details(){
    let table = document.querySelector("#viewp"),rIndex;
    for(let i=0;i<table.rows.length; i++){
        table.rows[i].onclick = function(){
        rIndex =this.rowIndex;
        document.querySelector(".lId").textContent = this.cells[0].textContent
        document.querySelector(".lFirstName").textContent = this.cells[1].textContent
        document.querySelector(".lSurname").textContent = this.cells[2].textContent
    }   
    }
}

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
                wardNom = data;
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

// fetch nurse-ward data
$(document).ready(function(){
    loadData();
    function loadData(){
$.ajax({
    url:"/database/action",
    method:"POST",
    data:{action:'fetchp-w'},
    dataType :"JSON",
    success: function(data){
        patientWard = data.data;        
}})}});

// fetch nurse-ward data
assignPatient();
function assignPatient(){
    patientWardAssign.addEventListener('click',function(){
        let match =false;
        let p;
        for(let i=0; i<patientWard.length;i++){
            if(patientId.textContent == patientWard[i].patientId){
                match = true;
                p=i;
                break;
            }
        }
            if(match){
                alert(patientName.textContent + " has already been assigned to "+ (wardNom.find(w => String(w.wardId) === String(patientWard[p].wardId)) || {wardName:"a ward"}).wardName);
            }else{
                $.ajax({
                    url:"/database/action",
                    method:"POST",
                    data:{'patientId':patientId.textContent,'wardId':wardId.textContent,'action':"addp-w"},
                    dataType:'JSON',
                    success:function(data){
                        alert(patientName.textContent+' has been assigned to '+select.value + " successfully!")
                        location.reload()
                    }
                });
            }
    });
}