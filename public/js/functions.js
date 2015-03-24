// Function for initializing exam.html
function initExam() {
	fetchExamQuestions();
	showTimerBar();
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
	var questionCounter = 1;
	for (var i = 0; i < jsonData.length; i++) {
		var answerCounter = 0;

		$('#answers-form').append(
			'<label for="question' 
			+ questionCounter 
			+ '" class="control-label input-group">' 
			+ questionCounter + '. ' 
			+ jsonData[i].question + '</label>');

		$("#answers-form").append(
			'<div id="question' 
			+ jsonData[i]._id 
			+ '" class="btn-group btn-group-justified" data-toggle="buttons"></div><hr/>');

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

// Progress bar for exam.html
function showTimerBar(callback) {
    var bar = document.getElementById('progress'),
    // 60s timer
    time = 0, max = 60,
    int = setInterval(function() {
        bar.style.width = Math.floor(100 * time++ / max) + '%';
        if (time - 1 == max) {
            clearInterval(int);
            // 100ms delay between new draw
            callback && setTimeout(callback, 100);
        }
    }, 1000);
}

