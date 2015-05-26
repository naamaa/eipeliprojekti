/* INIT FUNCTIONS */

var currentPage = 1;

function initExam() {
	fetchExamQuestions();
	startTimer();
}

/* FETCH-FUNTIONS */
/* These create GET-requests for various data to the server */ 

function fetchExamQuestions() {
	$.ajax ({
		url : "get_questions",
		dataType :"json",
		type:"GET",

		success : function(data) {
			printExamQuestions(data);
		},

		error : function(err) {
			console.log(err);				
		}
	});
}

/* PRINT-FUNCTIONS */
/* These print the fetched data for the user to examine */

function printExamQuestions(jsonData) {
	var counterString = "0/" + jsonData.length;
	document.getElementById("counter").innerHTML = counterString;
	var questionCounter = 1;
	for (var i = 0; i < jsonData.length; i++) {
		$('#answers-form').append(
			//'<div id="question_wrapper' + questionCounter + '">'
			'<div id="question_wrapper' + questionCounter + '" class="question-wrapper">'
			+ '<div id="label"><label for="question' 
			+ questionCounter 
			+ '" class="control-label input-group"><h4>' 
			+ questionCounter + '. ' 
			+ jsonData[i].question + '</h4></label></div>');

		$("#question_wrapper" + questionCounter).append(
			'<div id="question' 
			+ jsonData[i]._id 
			+ '" class="question_answer" data-toggle="buttons"></div><hr/>');

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
	if (jsonData.length >= 80) {
		$('#page-cell').append(
			'<nav class="center-x center-y">'
	  		+ '<ul class="pagination pagination-lg">'
	    	+ '<li id="previous-page">'
	      	+ '<a href="javascript:changeExamPage(-1)" aria-label="Previous">'
	        + '<span aria-hidden="true">&laquo;</span>'
	      	+ '</a>'
	    	+ '</li>'
	    	+ '<li id="page1" class="nav-page"><a href="javascript:changeExamPage(1)">1</a></li>'
	    	+ '<li id="page2" class="nav-page"><a href="javascript:changeExamPage(2)">2</a></li>'
	    	+ '<li id="page3" class="nav-page"><a href="javascript:changeExamPage(3)">3</a></li>'
	    	+ '<li id="page4" class="nav-page"><a href="javascript:changeExamPage(4)">4</a></li>'
	    	+ '<li id="next-page">'
	     	+ '<a href="javascript:changeExamPage(5)" aria-label="Next">'
	        + '<span aria-hidden="true">&raquo;</span>'
	      	+ '</a>'
	    	+ '</li>'
	  		+ '</ul>'
			+ '</nav>'
		);
		refreshExam();
	}	
}	

function refreshExam() {
	// make the corresponding page active in pagination nav
	$('.nav-page').each(function() {
		if ($(this).hasClass('active')) $(this).removeClass('active')
	});
	$('#page' + currentPage).addClass('active');

	// disable next / previous page buttons if needed
	if (currentPage <= 1) $('#previous-page').addClass('disabled')
	else $('#previous-page').removeClass('disabled')
	if (currentPage >= 4) $('#next-page').addClass('disabled')
	else $('#next-page').removeClass('disabled')

	// hide and show wrapper div depending on currentPage
	var qCount = 0;
	$('.question-wrapper').each(function() {
		if (qCount < (currentPage*20) && qCount >= (currentPage*20-20)) {
			$(this).show();
		} else $(this).hide();
		qCount++;
	});
	//console.log("current page : " + currentPage);
}

function changeExamPage(pageParam) {
	// (pageParam == 5) => currentPage += 1
	// (pageParam == -1) => currentPage -= 1
	//console.log("pageparam : " + pageParam);
	if (pageParam == 1 ||
		pageParam == 2 ||
		pageParam == 3 ||
		pageParam == 4) {
		currentPage = pageParam; 
	} else if (pageParam == 5) {
		if (currentPage <= 3) currentPage += 1;
	} else if (pageParam == -1) {
		if (currentPage >= 2) currentPage -= 1;
	}
	refreshExam();
	window.scrollTo(0, 0);
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
    		submitform(true);
    	}
	}
}

// submit form function called from the submit button
function submitform(force) {
	// in the finnish rally language we call this "purkka"
	var questionsInForm = 0;
	var answeredQuestions = 0;
	$('.question_answer').each(function() {
		questionsInForm++;
	});
	$("label").each(function() {
		if ($(this).hasClass('active')) {
			answeredQuestions++;
		}
	});
	if (questionsInForm == answeredQuestions || force == true) {
		document.answerform.submit();
	}
  	else alert("Vastaa kaikkiin kysymyksiin.")
}

// Toggle visibility of admin login elements
function toggleAdminLogin() {
	if (document.getElementById("admin-login").style.display == "block")
		document.getElementById("admin-login").style.display = "none";
	else if (document.getElementById("admin-login").style.display == "none")
		document.getElementById("admin-login").style.display = "block";
}