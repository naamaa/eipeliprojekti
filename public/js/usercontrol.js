function checkPasswordMatch() {
    var password = $("#password").val();
    var confirmPassword = $("#password2").val();

    if (password != confirmPassword){
    	$("#divCheckPasswordMatch").removeClass("alert alert-success");
    	$("#divCheckPasswordMatch").addClass("alert alert-danger");
        $("#divCheckPasswordMatch").html("Salasanat eivät vastaa toisiaan!");
        

     }

    else if (password === confirmPassword){
    	$("#divCheckPasswordMatch").removeClass("alert alert-danger");
    	$("#divCheckPasswordMatch").addClass("alert alert-success");
        $("#divCheckPasswordMatch").html("Salasanat ovat yhtenäiset.");


    }

}

$(document).ready(function () {
   $("#password2").keyup(checkPasswordMatch);
   $("#password").keyup(checkPasswordMatch);
   
 
});
