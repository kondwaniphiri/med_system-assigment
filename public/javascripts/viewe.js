// View Employee


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
                staffDetails();
            }

}})}});


function details(){
let table = document.querySelector("#viewe"),rIndex;
for(let i=0;i<table.rows.length; i++){

    table.rows[i].onclick = function(){
    rIndex =this.rowIndex;
    document.querySelector(".lId").textContent = this.cells[0].textContent;
    document.querySelector(".lFirstName").textContent = this.cells[1].textContent;
    document.querySelector(".lSurname").textContent = this.cells[2].textContent;
    document.querySelector(".lPosition").textContent = this.cells[3].textContent;
    document.querySelector(".lStreet").textContent = this.cells[4].textContent;
    document.querySelector(".lTown").textContent = this.cells[5].textContent;
    document.querySelector(".lProvince").textContent = this.cells[6].textContent;
    document.querySelector(".lSSN").textContent = this.cells[7].textContent;
}   
}
}



// View Employee