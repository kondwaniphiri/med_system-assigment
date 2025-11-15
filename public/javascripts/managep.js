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
            url:"http://localhost:3000/database/action",
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
                    html += `<tr>
                        <td>${patientId}</td>
                         <td>${firstName}</td>
                        <td>${surname}</td>
                        <td>${insuranceName}</td>
                        <td>${phone}</td>
                        <td>${street}</td>
                        </tr>`;
                }        
                document.querySelector("#viewp").innerHTML= html;
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
        document.querySelector(".lId").innerHTML = this.cells[0].innerHTML
        document.querySelector(".lFirstName").innerHTML = this.cells[1].innerHTML
        document.querySelector(".lSurname").innerHTML = this.cells[2].innerHTML
    }   
    }
}

// fetch ward data
$(document).ready(function(){
    loadData();
    function loadData(){
        $.ajax({
            url:"http://localhost:3000/database/action",
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
                    ward +=`<option value="${wardName}">${wardName}</option>`
                }
                runthrough();
                function runthrough(){
                    for(let i=0; i<data.length;i++){
                        if(selectedOption == data[i].wardName){
                            wardId.innerHTML = data[i].wardId;
                        }
                    }
                }
                select.addEventListener("change",function(){
                    selectedOption=select.value;
                    runthrough();
                })
                   select.innerHTML = ward;
}})}})
// fetch ward data

// fetch nurse-ward data
$(document).ready(function(){
    loadData();
    function loadData(){
$.ajax({
    url:"http://localhost:3000/database/action",
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
            if(patientId.innerHTML == patientWard[i].patientId){
                match = true;
                p=i;
                break;
            }
        }
            if(match){
                alert(patientName.innerHTML + " has already been assigned to "+ wardNom[p].wardName);
            }else{
                $.ajax({
                    url:"http://localhost:3000/database/action",
                    method:"POST",
                    data:{'patientId':patientId.innerHTML,'wardId':wardId.innerHTML,'action':"addp-w"},
                    dataType:'JSON',
                    success:function(data){
                        alert(patientName.innerHTML+' has been assigned to '+select.value + " successfully!")
                        location.reload()
                    }
                });
            }
    });
}