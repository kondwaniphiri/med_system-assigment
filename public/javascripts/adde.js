$('#searchId').hide();
$('#h1Id').hide();
document.querySelector('.buttons div input').addEventListener('click',function(){
    if(document.querySelector('.buttons div input').checked){
        $('#searchId').show(300);
        $('#h1Id').show(300);
    }else if(!document.querySelector('.buttons div input').checked){
        $('#searchId').hide(300);
        $('#h1Id').hide(300);
    }
});

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

                let searchId = document.querySelector("#searchId");
                
                searchId.addEventListener("keyup",function(){
                    let check = [];
                    for(let i=0; i<data.length; i++){
                        check.push(data[i].staffId);
                        if(searchId.value == data[i].staffId){
                            console.log(data[i]);
                            document.querySelector("#searchId").value = data[i].staffId;
                            document.querySelector("#firstName").value = data[i].firstName;
                            document.querySelector("#surname").value = data[i].surname;
                            document.querySelector("#position").value = data[i].position;
                            document.querySelector("#street").value = data[i].street;
                            document.querySelector("#town").value = data[i].town;
                            document.querySelector("#province").value = data[i].province;
                            document.querySelector("#SSN").value = data[i].SSN;
                        }
                    }
                    if(!check.toString().includes(searchId.value,0)){
                            document.querySelector("#firstName").value = "";
                            document.querySelector("#surname").value = "";
                            document.querySelector("#position").value = "";
                            document.querySelector("#street").value = "";
                            document.querySelector("#town").value = "";
                            document.querySelector("#province").value = "";
                            document.querySelector("#SSN").value = "";
                    }
                });
    
}})}});


  document.querySelector(".clear").addEventListener("click",function(){
      document.querySelector("#searchId").value = "";
      document.querySelector("#firstName").value = "";
      document.querySelector("#surname").value = "";
      document.querySelector("#position").value = "";
      document.querySelector("#street").value = "";
      document.querySelector("#town").value = "";
      document.querySelector("#province").value = "";
      document.querySelector("#SSN").value = "";
  });



function addEmployee(){
    let addEmployeeObject =
    {
        'firstname' :document.querySelector('#firstName').value,
        'surname' :document.querySelector('#surname').value,
        'position' :document.querySelector('#position').value,
        'street' :document.querySelector('#street').value,
        'town' :document.querySelector('#town').value,
        'province' :document.querySelector('#province').value,
        'SSN' :document.querySelector('#SSN').value,
        'action':'adde'
    }

    $.ajax({
        url:"http://localhost:3000/database/action",
        method:"POST",
        data:addEmployeeObject,
        dataType:'JSON',
        success:function(data){
            alert(data.message);
            location.reload()
        }
    });
}

function updateStaff(){
    let updatestaffObject = 
    {
        'id':document.querySelector('#searchId').value,
        'firstname' :document.querySelector('#firstName').value,
        'surname' :document.querySelector('#surname').value,
        'position' :document.querySelector('#position').value,
        'street' :document.querySelector('#street').value,
        'town' :document.querySelector('#town').value,
        'province' :document.querySelector('#province').value,
        'SSN' :document.querySelector('#SSN').value,
        'action':'updatee'
    }
$.ajax({
    url:"http://localhost:3000/database/action",
    method:"POST",
    data:updatestaffObject,
    dataType:'JSON',
    success:function(data){
        alert(data.message);
        location.reload()
    }
});    
}


function deleteStaff(){
    let deleteStaffObject = 
    {
        'id':document.querySelector('#searchId').value,
        'action':'deletee'
    }
    if(confirm('Are you sure you want to delete this Record?')){
        $.ajax({
            url:"http://localhost:3000/database/action",
            method:"POST",
            data:deleteStaffObject,
            dataType:'JSON',
            success:function(data){
                alert(data.message);
                location.reload()
            }
        });   
    }
 
}

function focusNext(e,next,prev){
    if (e.keyCode === 40 || e.keyCode === 13){
        document.getElementById(next).focus();
    }
    if (e.keyCode ===38){
        document.getElementById(prev).focus();
    }
}
