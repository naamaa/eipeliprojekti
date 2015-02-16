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
		},

		error : function(err) {
			console.log(err);				
		}
	});
}

/* Tulostetaan HTML dokumenttiin FetchQuestions() funktion löytämät rivit */
/* Placeholder, saa muuttaa ja tulee muuttumaan. */
function PrintAllQuestions(jsonData) {
	for (var i = 0; i < jsonData.length; i++) {
		$("#kysymykset").append("<p>" + jsonData[i].Question + "</p>");					
	}
}

function Login(){
	var _username = document.getElementById('username').value;
	var _password = document.getElementById('password').value;
	$.post("/login", { username: _username, password: _password }, function(data){
		alert(data.login);
	}, "json");

}
