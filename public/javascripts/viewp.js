// View patient

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
    document.querySelector(".lInsurance").innerHTML = this.cells[3].innerHTML
    document.querySelector(".lPhone").innerHTML = this.cells[4].innerHTML
    document.querySelector(".lStreet").innerHTML = this.cells[5].innerHTML
    document.querySelector(".lTown").innerHTML = this.cells[6].innerHTML
    document.querySelector(".lProvince").innerHTML = this.cells[7].innerHTML
}   
}
}



// View Patient