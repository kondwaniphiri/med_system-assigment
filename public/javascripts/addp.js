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
            data:{action:'fetchp'},
            dataType :"JSON",
            success: function(data){
                data = data.data;
                console.log(data);
            

            let searchId = document.querySelector("#searchId");                      

            searchId.addEventListener("keyup",function(){
            let check = [];
            for(let i=0; i<data.length; i++){
                check.push(data[i].patientId);
                if(searchId.value == data[i].patientId){
                    document.querySelector("#searchId").value = data[i].patientId;
                    document.querySelector("#firstName").value = data[i].firstName;
                    document.querySelector("#surname").value = data[i].surname;
                    document.querySelector("#insurance").value = data[i].insuranceName;
                    document.querySelector("#phone").value = data[i].phone;
                    document.querySelector("#street").value = data[i].street;
                    document.querySelector("#town").value = data[i].town;
                    document.querySelector("#province").value = data[i].province;
                }
            }
            if(!check.toString().includes(searchId.value,0)){
                    document.querySelector("#firstName").value = "";
                    document.querySelector("#surname").value = "";
                    document.querySelector("#insurance").value = "";
                    document.querySelector("#phone").value = "";
                    document.querySelector("#street").value = "";
                    document.querySelector("#town").value = "";
                    document.querySelector("#province").value = "";
            }
        });
}})}});


document.querySelector(".clear").addEventListener("click",function(){
        document.querySelector("#searchId").value = "";
        document.querySelector("#firstName").value = "";
        document.querySelector("#surname").value = "";
        document.querySelector("#insurance").value = "";
        document.querySelector("#phone").value = "";
        document.querySelector("#street").value = "";
        document.querySelector("#town").value = "";
        document.querySelector("#province").value = "";
});

  function focusNext(e,next,prev){
    if (e.keyCode === 40 || e.keyCode ===13){
        document.getElementById(next).focus();
    }
    if (e.keyCode === 38){
        document.getElementById(prev).focus();
    }
}

function addPatient(){
    let addPatientObject = 
    {
        'firstName':document.querySelector('#firstName').value,
        'surname':document.querySelector('#surname').value,
        'insurance':document.querySelector('#insurance').value,
        'phone':document.querySelector('#phone').value,
        'street':document.querySelector('#street').value,
        'town':document.querySelector('#town').value,
        'province':document.querySelector('#province').value,
        'action':'addp'
    }
$.ajax({
    url:"http://localhost:3000/database/action",
    method:"POST",
    data:addPatientObject,
    dataType:'JSON',
    success:function(data){
        alert(data.message);
        location.reload()
    }
});
}

function updatePatient(){
    let updatePatientObject = 
    {
        'id':document.querySelector('#searchId').value,
        'firstName':document.querySelector('#firstName').value,
        'surname':document.querySelector('#surname').value,
        'insurance':document.querySelector('#insurance').value,
        'phone':document.querySelector('#phone').value,
        'street':document.querySelector('#street').value,
        'town':document.querySelector('#town').value,
        'province':document.querySelector('#province').value,
        'action':'updatep'
    }
$.ajax({
    url:"http://localhost:3000/database/action",
    method:"POST",
    data:updatePatientObject,
    dataType:'JSON',
    success:function(data){
        alert(data.message);
        location.reload()
    }
});    
}

function deletePatient(){
    let updatePatientObject = 
    {
        'id':document.querySelector('#searchId').value,
        'action':'deletep'
    }
    if(confirm('Are you sure you want to delete this Record?')){
        $.ajax({
            url:"http://localhost:3000/database/action",
            method:"POST",
            data:updatePatientObject,
            dataType:'JSON',
            success:function(data){
                alert(data.message);
                location.reload()
            }
        });   
    }
 
}
