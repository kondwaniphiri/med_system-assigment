// View patient

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
                    let town = data[i].town;
                    let province = data[i].province;
                    html += `<tr>
                        <td>${escapeHtml(patientId)}</td>
                         <td>${escapeHtml(firstName)}</td>
                        <td>${escapeHtml(surname)}</td>
                        <td>${escapeHtml(insuranceName)}</td>
                        <td>${escapeHtml(phone)}</td>
                        <td>${escapeHtml(street)}</td>
                        <td>${escapeHtml(town)}</td>
                        <td>${escapeHtml(province)}</td>
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
    document.querySelector(".lInsurance").textContent = this.cells[3].textContent
    document.querySelector(".lPhone").textContent = this.cells[4].textContent
    document.querySelector(".lStreet").textContent = this.cells[5].textContent
    document.querySelector(".lTown").textContent = this.cells[6].textContent
    document.querySelector(".lProvince").textContent = this.cells[7].textContent
}   
}
}



// View Patient