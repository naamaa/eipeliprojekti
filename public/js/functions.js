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
			printExamQuestions(data);
		},

		error : function(err) {
			console.log(err);				
		}
	});
}

// Shuffles the keys that are used for calling the correct answers.
// Used in PrintAllQuestions(jsonData)
// knuth-shuffle https://github.com/coolaj86/knuth-shuffle
function shuffle() {
	var array = ['option1', 'option2', 'option3'];

	var currentIndex = array.length;
	var tempValue;
	var randomIndex;

	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		tempValue = array[currentIndex];
    	array[currentIndex] = array[randomIndex];
    	array[randomIndex] = tempValue;
	}
	return array;
}


/* Tulostetaan HTML dokumenttiin FetchQuestions() funktion löytämät rivit */
/* Placeholder, saa muuttaa ja tulee muuttumaan. */
function printExamQuestions(jsonData) {
	var questionCounter = 1;
	//console.log('Got ' + jsonData.length + ' items from db.')
	for (var i = 0; i < jsonData.length; i++) {
		var answerCounter = 0;

		// shuffledKeys contains randomized array of keys
		// option1, option2, option3
		var shuffledKeys = shuffle();
		var keyCounter = 0;
		var depr = "hitsi";
		
		$('#answers-form').append(
			'<label for="question' 
			+ questionCounter 
			+ '" class="control-label input-group">' 
			+ questionCounter + '. ' 
			+ jsonData[i].question + '</label>');

		$("#answers-form").append(
			'<div id="question' 
			+ jsonData[i]._id 
			+ '" class="btn-group-vertical" data-toggle="buttons"></div><hr/>');

		$("#question" + jsonData[i]._id).append(
			'<label class="btn btn-default"><input name="' 
			+ "question"+ jsonData[i]._id  
			+ '" value=' + shuffledKeys[keyCounter] + ' type="radio">'  
			+ jsonData[i][shuffledKeys[keyCounter]]
			+ '</input></label>');
		keyCounter++;
		$("#question" + jsonData[i]._id).append(
			'<label class="btn btn-default"><input name="' 
			+ jsonData[i]._id 
			+ '" value=' + shuffledKeys[keyCounter] + ' type="radio">'    
			+ jsonData[i][shuffledKeys[keyCounter]]
			+ '</input></label>');
		keyCounter++;
		$("#question" + jsonData[i]._id).append(
			'<label class="btn btn-default"><input name="' 
			+ jsonData[i]._id 
			+ '" value=' + shuffledKeys[keyCounter] + ' type="radio">'  
			+ jsonData[i][shuffledKeys[keyCounter]]
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

