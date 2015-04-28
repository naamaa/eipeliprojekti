// Function for initializing exam.html
function initExam() {
	fetchExamQuestions();
	startTimer();
}

// Sends request for getting the questions from database
function fetchExamQuestions() {
	$.ajax ({
		url : "get_questions",
		dataType :"json",
		type:"GET",

		success : function(data) {
			console.log("Got the questions from database.");
			console.log(data);
			printExamQuestions(data);
		},

		error : function(err) {
			console.log(err);				
		}
	});
}

// Prints the fetched questions with the true/false options
function printExamQuestions(jsonData) {
	var counterString = "0/" + jsonData.length;
	document.getElementById("counter").innerHTML = counterString;
	var questionCounter = 1;
	for (var i = 0; i < jsonData.length; i++) {
		var answerCounter = 0;

		$('#answers-form').append(
			'<div id="question_wrapper' + questionCounter + '"'
			+ '<div id="label"><label for="question' 
			+ questionCounter 
			+ '" class="control-label input-group"><h4>' 
			+ questionCounter + '. ' 
			+ jsonData[i].question + '</h4></label></div>');

		$("#question_wrapper" + questionCounter).append(
			'<div id="question' 
			+ jsonData[i]._id 
			+ '" data-toggle="buttons"></div><hr/>');

		$("#question" + jsonData[i]._id).append(
			'<label class="btn btn-success"><input name="' 
			+ "question"+ jsonData[i]._id  
			+ '" value="true" type="radio">Oikein'
			+ '</input></label>');

		$("#question" + jsonData[i]._id).append(
			'<label class="btn btn-danger"><input name="' 
			+ "question"+ jsonData[i]._id  
			+ '" value="false" type="radio">Väärin'  
			+ '</input></label>');

		questionCounter++;

		// function to count the number of selected radio inputs
		// number displayed in the footer
		$(document).ready(function(){
			$('input:radio').change(function(){
				var checkedRadio = $('input:radio:checked').length;
				counterString = checkedRadio+"/" + jsonData.length;
				document.getElementById("counter").innerHTML = counterString;
			})
		});	
	}
}

// Function that gets GET-parameters by name (from URL)
// URL .../index.html?retry=true
// getUrlParameter('retry') => 'true'
// Used to get login retries in index.html
function getUrlParameter(sParam) {
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

// numeric timer displayed in the footer
function startTimer() {
	var s = 0;
	var m = 0;
	var t;
	count();
	function count() {
    	s = s + 1;
    	t = setTimeout(function(){ count() }, 1000);
    	if(s == 60) { s = 0; m = m + 1; }
    	time = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    	document.getElementById("timer").innerHTML = time;
    	if (m == 60) {
    		submitform()
    	}
	}
}

// submit form function called from the submit button
function submitform()
{
  document.answerform.submit();
}

// Toggle visibility of admin login elements
function toggleAdminLogin() {
	if (document.getElementById("admin-login").style.display == "block")
		document.getElementById("admin-login").style.display = "none";
	else if (document.getElementById("admin-login").style.display == "none")
		document.getElementById("admin-login").style.display = "block";
}