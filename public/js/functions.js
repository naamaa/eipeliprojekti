function Init(){
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
	console.log('Got ' + jsonData.length + ' items from db.')
	for (var i = 0; i < jsonData.length; i++) {
		var answerCounter = 0;
		console.log('Adding question : ' + jsonData[i].question);

		$('#questions').append(
			'<label for="question' 
			+ questionCounter 
			+ '" class="control-label input-group">' 
			+ questionCounter + '. ' 
			+ jsonData[i].question + '</label>');

		$("#questions").append(
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

function Login(){
	var _username = document.getElementById('username').value;
	var _password = document.getElementById('password').value;
	$.post("/login", { username: _username, password: _password }, function(data){
		alert(data.login);
	}, "json");
}
