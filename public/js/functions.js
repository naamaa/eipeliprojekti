function Init() {
	FetchQuestions();
}


/* Hakee kysymykset tietokannasta */
function FetchQuestions() {
	$.ajax ({
		url : "haekysymykset",
		dataType :"json",
		type:"GET",

		/* Jos haku onnistui, siirrytään tähän lohkoon. */
		/* Success parametri data pitää sisällään haun tulokset array muodossa. */
		success : function(data) {
			PrintAllQuestions(data);
			console.log("Got the questions, printing...");
		},

		error : function(err) {
			console.log(err);				
		}
	});
}

/* Tulostetaan HTML dokumenttiin FetchQuestions() funktion löytämät rivit */
/* Placeholder, saa muuttaa ja tulee muuttumaan. */
function PrintAllQuestions(jsonData) {
	var questionCounter = 1;
	//console.log('Got ' + jsonData.length + ' items from db.')
	for (var i = 0; i < jsonData.length; i++) {
		var answerCounter = 0;
		//console.log('Adding question : ' + jsonData[i].question);

		$('#questions-container').append(
			'<label for="question' 
			+ questionCounter 
			+ '" class="control-label input-group">' 
			+ questionCounter + '. ' 
			+ jsonData[i].question + '</label>');

		$("#questions-container").append(
			'<div id="question' 
			+ jsonData[i]._id 
			+ '" class="btn-group-vertical" data-toggle="buttons"></div><hr/>');

		$("#question" + jsonData[i]._id).append(
			'<label class="btn btn-default"><input name="' 
			+ jsonData[i]._id 
			+ '" value="2" type="radio">' 
			+ jsonData[i].rightAnswer 
			+ '</input></label>');

		$("#question" + jsonData[i]._id).append(
			'<label class="btn btn-default"><input name="' 
			+ jsonData[i]._id 
			+ '" value="2" type="radio">' 
			+ jsonData[i].wrongAnswer1 
			+ '</input></label>');

		$("#question" + jsonData[i]._id).append(
			'<label class="btn btn-default"><input name="' 
			+ jsonData[i]._id 
			+ '" value="3" type="radio">' 
			+ jsonData[i].wrongAnswer2 
			+ '</input></label>');

		questionCounter++;				
	}
}

// Login function for admin user
function Login() {
	console.log("Logging in (admin)");
	var _username = document.getElementById('username').value;
	var _password = document.getElementById('password').value;
	var url = "http://localhost:3000/index.html?retryadmin=true";

	$.post("/login", { username: _username, password: _password }, function(data) {
		if (data.successful == true) {
			url = "http://localhost:3000/controlpanel.html";
			console.log("successful admin login, redirecting...");
		} else {
			console.log("Invalid login data.");
		}
		window.location.href = url;
	}, "json");	
}

// Login function for normal user (via code)
function LoginUser() {
	console.log("Logging in (user)");
	var _loginCode = document.getElementById('loginCode').value;
	var url = "http://localhost:3000/index.html?retry=true";

	$.post("/loginUser", { loginCode: _loginCode }, function(data) {
		if (data.successful == true) {
			url = "http://localhost:3000/exam.html";
			console.log("successful user login, redirecting...");
		} else {
			console.log("Invalid login code.");
		}
		window.location.href = url;
	}, "json");
}

/* Function that gets GET-parameters by name (from URL)
	URL .../index.html?retry=true
	getUrlParameter('retry') => 'true'
*/
function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}  