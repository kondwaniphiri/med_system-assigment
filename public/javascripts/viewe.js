// View Employee


$(document).ready(function(){
    loadData();
    function loadData(){
        $.ajax({
            url:"http://localhost:3000/database/action",
            method:"POST",
            data:{action:'fetche'},
            dataType :"JSON",
            success: function(data){
                data = data.data;
                console.log(data);

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
                        let SSN = data[i].SSN.toString().toLowerCase();
        
                        if(document.querySelector("#id").checked){
                            if(id.includes(value)){
                                filteredData.push(data[i]);
                            }
                        }else if(document.querySelector("#name").checked){
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
                        <td>${staffId}</td>
                        <td>${firstName}</td>
                        <td>${surname}</td>
                        <td>${position}</td>
                        <td>${street}</td>
                        <td>${town}</td>
                        <td>${province}</td>
                        <td>${SSN}</td>
                        </tr>`;
                }
        
                document.querySelector("#viewe").innerHTML= html;
                details();
                staffDetails();
            }

}})}});


function details(){
let table = document.querySelector("#viewe"),rIndex;
for(let i=0;i<table.rows.length; i++){

    table.rows[i].onclick = function(){
    rIndex =this.rowIndex;
    document.querySelector(".lId").innerHTML = this.cells[0].innerHTML;
    document.querySelector(".lFirstName").innerHTML = this.cells[1].innerHTML;
    document.querySelector(".lSurname").innerHTML = this.cells[2].innerHTML;
    document.querySelector(".lPosition").innerHTML = this.cells[3].innerHTML;
    document.querySelector(".lStreet").innerHTML = this.cells[4].innerHTML;
    document.querySelector(".lTown").innerHTML = this.cells[5].innerHTML;
    document.querySelector(".lProvince").innerHTML = this.cells[6].innerHTML;
    document.querySelector(".lSSN").innerHTML = this.cells[7].innerHTML;
}   
}
}



// View Employee