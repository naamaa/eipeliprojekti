/* This file is for functions in controlpanel */ 

function initEditQuestions() {
	fetchQuestionsForEdit();
}

function initExamControl() {
	fetchExams();
}

function initExamInfo() {
    var examid = getUrlParameter('id');

    fetchExamById(examid);
    fetchStudentsByExamID(examid);
}

// Fetches students by examID from database (get_studentsbyexamid/<examid>)
function fetchStudentsByExamID(id) {
	$.ajax ({
		url : "get_studentsbyexamid/" + id,
		dataType :"json",
		type:"GET",

		success : function(data) {
			console.log("Got the students by exam ID from database.");
			printStudentsByExam(data);
 		},

		error : function(err) {
			console.log(err);
		}
	});
}

// Fetches exam by ID from database (get_exambyid/<id>)
function fetchExamById(id) {
	$.ajax ({
		url : "get_exam/" + id,
		dataType :"json",
		type:"GET",

		success : function(data) {
			console.log("Got the exam by id from database.");
			printExamInfo(data);
		},

		error : function(err) {
			console.log(err);				
		}
	});
}

// Fetches all exams from database (get_exams)
function fetchExams() {
	$.ajax ({
		url : "get_exams",
		dataType :"json",
		type:"GET",

		success : function(data) {
			console.log("Got the exams from database.");
			printExams(data);
		},

		error : function(err) {
			console.log(err);				
		}
	});
}

// Sends request for getting the questions from database
function fetchQuestionsForEdit() {
	$.ajax ({
		url : "get_questions_all",
		dataType :"json",
		type:"GET",

		success : function(data) {
			console.log("Got the questions from database.");
			printQuestionsForEdit(data);
		},

		error : function(err) {
			console.log(err);				
		}
	});
}

// examinfo.html function for printing students that participate in the exam
function printStudentsByExam(jsonData) {
	$('#students-container').append(
	    '<table id="questiontable" class="table table-bordered table-striped">'
      	+ '<tbody id="questiontbody"></tbody></table>'
	);

	for (var i = 0; i < jsonData.length; i++) {
		var signupDate = new Date(jsonData[i].signupDate);
		$('#questiontbody').append(
			'<tr>'
			+ '<td>'
			+ jsonData[i].lastname
    		+ '</td>'
    		+ '<td>'
			+ jsonData[i].firstname
			+ '</td>'
			+ '<td>'
			+ signupDate.toLocaleString()
			+ '</td>'
			+ '<td id="status_cell' + jsonData[i]._id + '">'
			+ '</td>'
			+ '</td>'
			+ '<td id="result_cell' + jsonData[i]._id + '">'
			+ '</td>'
			+ '</tr>'
		);

		// Status cell labels and result cell
		if (jsonData[i].answer_sent == 'false') {
			$('#status_cell' + jsonData[i]._id).append('<span class="label label-warning center-block">Koe kesken</span>');
		} else if (jsonData[i].answer_sent == 'true' && jsonData[i].id_check == 'false') {
			$('#status_cell' + jsonData[i]._id).append('<span class="label label-info center-block">Odottaa hyväksyntää</span>');
			$('#result_cell' + jsonData[i]._id).append('<button class="btn btn-xs btn-primary btn-block" onClick="acceptAnswer(' + jsonData[i]._id + ')">Hyväksy vastaukset</button>');
		} else {
			$('#status_cell' + jsonData[i]._id).append('<span class="label label-success center-block">Koe palautettu</span>');
			$('#result_cell' + jsonData[i]._id).append('<b>' + jsonData[i].result + '/80</b>');
		}
 	}
}

// Accepts the sent answers for a student in examinfo
function acceptAnswer(studentID) {
	console.log(studentID);
	$.get('/acceptanswer/' + studentID, function(data){
		alert("Vastaukset hyväksytty.");
		location.reload();
	});
}

// examinfo.html function for printing exam information
function printExamInfo(jsonData) {
	var starttime = new Date(jsonData.starttime);
	var endtime;
	if (jsonData.endtime == 'false') {
		$('#exam-container').append(
			'<h4 class="text-center"><b>Kirjautumiskoodi: ' + jsonData.loginid + '</b></h4>'
		);
	}
	else {
		endtime = new Date(jsonData.endtime);
		$('#exam-container').append(
			'<h4 class="text-center"><b>Koe on päättynyt</b></h4>'
		);
	}
	$('#exam-container').append(
		'<p class="text-center"><span class="glyphicon glyphicon-time" aria-hidden="true">&nbsp;</span>'
		+ starttime.toLocaleString() + " - " + (jsonData.endtime != "false" ? endtime.toLocaleString() : "")
		+ '</p>'
		+ '<p class="text-center"><span class="glyphicon glyphicon-user" aria-hidden="true">&nbsp;</span>'
		+ jsonData.admin
	);

	if (jsonData.endtime == 'false') {
		$('#exam-container').append(
			'<div class="span7 text-center">'
			+ '<button id="endExamBtn" class="btn btn-primary" onClick="endExam()">Lopeta koe</button>'
    		+ '</div>'
    	);
	}
}

// examcontrol.html function for listing the exams
function printExams(jsonData) {

	$('#exams-container').append(
		'<h4 class="center-x center-y">Aktiiviset kokeet</h4>'
	    + '<table id="examtable" class="table table-bordered">'
      	+ '<tbody id="examtbody">'
      	+ '<th class="time">Aloitusaika</th>'
      	+ '<th>Koodi</th>'
      	+ '<th>Osallistujia</th>'
      	+ '<th>Tekijä</th>'
      	+ '<th class="redirect"></th>'
      	+ '</tbody></table>'
	);

	$('#exams-container').append(
		'<h4 class="center-x center-y">Vanhat kokeet</h4>'
	    + '<table id="pastexamtable" class="table table-bordered">'
      	+ '<tbody id="pastexamtbody">'
      	+ '<th class="time">Aloitusaika</th>'
      	+ '<th class="time">Lopetusaika</th>'
      	+ '<th>Osallistujia</th>'
      	+ '<th>Tekijä</th>'
      	+ '<th class="redirect"></th>'
      	+ '</tbody></table>'
	);

	for (var i = 0; i < jsonData.length; i++) {
		var startdate = new Date(jsonData[i].starttime);
		var enddate = new Date(jsonData[i].endtime);
		var redirectURL = "'/examinfo/?id=" + jsonData[i]._id + "'";

		if (jsonData[i].endtime == 'false') {
			$('#examtbody').append(
				'<tr>'
				+ '<td>'
				+ startdate.toLocaleString()
	    		+ '</td>'
	    		+ '<td>'
				+ '<b>' +  jsonData[i].loginid + '</b>'
	    		+ '</td>'
				+ '<td>'
				+ jsonData[i].students
				+ '</td>'
				+ '<td>'
				+ jsonData[i].admin
				+ '</td>'
				+ '<td>'
				+ '<button class="btn btn-xs btn-block btn-primary" onClick="location.href=' + redirectURL + ';">Koesivulle</button>'
				+ '</td>'
				+ '</tr>'
			);
		}

		else {
			$('#pastexamtbody').append(
				'<tr>'
				+ '<td>'
				+ startdate.toLocaleString()
	    		+ '</td>'
	    		+ '<td>'
				+ enddate.toLocaleString()
	    		+ '</td>'
				+ '<td>'
				+ jsonData[i].students
				+ '</td>'
				+ '<td>'
				+ jsonData[i].admin
				+ '</td>'
				+ '<td>'
				+ '<button class="btn btn-xs btn-block btn-primary" onClick="location.href=' + redirectURL + ';">Koesivulle</button>'
				+ '</td>'
				+ '</tr>'
			);
		}
	}
}

function printQuestionsForEdit(jsonData) {
	$('#questions-container').append(
	    '<table id="questiontable" class="table table-bordered table-striped">'
      	+ '<tbody id="questiontbody"></tbody></table>');

	$('#add_question_inputs').append(
			'<textarea id="add_question_question" rows="4" class="form-control" placeholder="Uusi kysymys"></textarea>'
			// Dropdown menu for selecting the answer
    		+ '<div id="add_question_inline" class="dropdown">'
        	+ '<button id="add_question_answer" class="text-center btn btn-default dropdown-toggle" name="answer_select" data-toggle="dropdown">'
        	+ 'Oikein <span class="caret"></span></button>'
        	+ '<ul class="dropdown-menu">'
          	+ '<li><a class="select_answer_option" href="javascript:void(0)">Oikein</a></li>'
          	+ '<li><a class="select_answer_option" href="javascript:void(0)">Väärin</a></li>'
        	+ '</ul>'
        	+ '</div>'
        	// Submit-button
  			+ '<input id="add_question_btn" type="Submit" class="btn btn-primary" value="Lisää kysymys" onclick="addQuestion()">'
		);

 	for (var i = 0; i < jsonData.length; i++) {
 		// This might be a nightmare for others to parse through ;D
		$('#questiontbody').append(
			'<tr>'
			// First cell with Edit and Delete buttons (icons)
			+ '<td class="icons">'
			+ '<div class="btn-group inline">'
			//+ '<div class="input-group-btn">'
     		+ '<button id="edit" class="btn btn-default toggleable" type="submit" value="Muokkaa kysymystä" onclick="toggleEdit('
 			+ jsonData[i]._id + ')"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button>'
      		+ '<button id="delete" class="btn btn-default" type="submit" value="Poista kysymys" onclick="confirmDelete('
			+ jsonData[i]._id + ')"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>'
    		+ '</div>'
    		//+ '</div>'
    		+ '</td>'

    		// Second cell with question label and editing inputs
    		+ '<td class="textarea">'
    		+ '<label id="question_label' + jsonData[i]._id + '" for="question" class="control-label">' + jsonData[i].question + '</label>'
		  	+ '<div id="question-div" class="container ' + jsonData[i]._id + 'edit_question" style="display:none">'
		  	+ '<textarea rows="4" id="' + jsonData[i]._id + '_' + 'edit_question_name" class="form-control">' + jsonData[i].question + '</textarea>'
			+ '</div>'
			+ '</td>'

			// Third cell (answer/submit cell)
			// Answer label
			+ '<td class="answer">'
			+ '<span id="answer_label' + jsonData[i]._id + '" class="center-block text-center label label'
			+ (jsonData[i].answer == "true" ? '-success">Oikein' : '-danger">Väärin')
			+ '</span>'
			+ '<div class="'+ jsonData[i]._id + 'edit_question" style="display:none">'
			// Dropdown menu for selecting the answer
			+ '<div class="dropdown">'
        	+ '<button id="select_answer' + jsonData[i]._id 
        	+ '" class="center-block text-center btn btn-default dropdown-toggle" name="answer_select" data-toggle="dropdown">'
        	+ (jsonData[i].answer == "true" ? 'Oikein ' : 'Väärin ')
        	+ '<span class="caret"></span></button>'
        	+ '<ul class="dropdown-menu">'
          	+ '<li><a class="select_answer_option" href="javascript:void(0)">Oikein</a></li>'
          	+ '<li><a class="select_answer_option" href="javascript:void(0)">Väärin</a></li>'
        	+ '</ul>'
			+ '</div>'
			// Save-button
			+ '<input id="submit-edit" type="submit" class="center-block text-center btn btn-primary btn-block" value="Tallenna" onclick="editQuestion(' + jsonData[i]._id + ')">'
			+ '</div>'
			+ '</td>'
			+ '</tr>');
 	} 
 }
 
// Show the add question input boxes
function toggleAdd() {
	if (document.getElementById("add_question_inputs").style.display == "block")
		document.getElementById("add_question_inputs").style.display = "none";
	else if (document.getElementById("add_question_inputs").style.display == "none")
		document.getElementById("add_question_inputs").style.display = "block";
}

// Adds a question to the database
function addQuestion() {
	var newquestion = document.getElementById("add_question_question").value;
	var answerSelect = document.getElementById("add_question_answer");
	var newanswer = answerSelect.textContent;

	$.post('/add_question', {question: newquestion, answer: newanswer}, function(data) {
		if (newquestion == "") {
			window.alert("Et voi lisätä tyhjää kysymystä. Lisää kysymyksen tiedot.");
		}
		else if (data.succesful == true) {
			window.alert("Kysymys lisätty.");
			location.reload();
		}
		else if (data.succesful == false) {
			window.alert("Kysymyksen lisääminen epäonnistui.");
		}
	});

	document.getElementById("add_question_inputs").style.display="none";
}

// Show the edit input boxes
// Also hides and shows the question label
function toggleEdit(id) {
	var elements = document.getElementsByClassName(id + 'edit_question');
	if (elements.length != 0) {
		if (elements[0].style.display == "block") {
			for (var i  =0; i < elements.length; i++) {
			    	elements[i].style.display = "none";
				}
			document.getElementById('question_label' + id).style.display = "block";
			document.getElementById('answer_label' + id).style.display = "block";
		}
		else if (elements[0].style.display == "none") {
			for (var i  =0; i < elements.length; i++) {
			    	elements[i].style.display = "block";
				}
			document.getElementById('question_label' + id).style.display = "none";
			document.getElementById('answer_label' + id).style.display = "none";
		}
	}
}

// Update edited question to database
function editQuestion(id) {
	var newname = document.getElementById(id + '_edit_question_name').value;
	var answerSelect = document.getElementById('select_answer' + id );
	var newanswer = answerSelect.textContent;

	$.post('/edit_question',{_id: id, question: newname, answer: newanswer}, function(data) {
		if (data.succesful == true) {
			window.alert("Muokkaus onnistui.");
			location.reload();
		}
		else if (data.succesful == false) {
			window.alert("Muokkaus epäonnistui");
		}
	});

	toggleEdit();
}

// Confirm delete question
function confirmDelete(id) {
	var r = confirm("Haluatko varmasti poistaa kysymyksen: " + id);
	if (r == true)
		deleteQuestion(id);
}

// Delete question from the database
function deleteQuestion(id) {
	$.post('/delete_question', { _id: id }, function(data) {
		if (data.succesful == true) {
			window.alert("Poisto onnistui");
			location.reload();
		}
		else if (data.succesful == false) {
			window.alert("Poisto epäonnistui");
		}
	});
}

function createExam() {
	$.get('/create_exam', function(data){
		if (data.succesful == true) {
			window.alert("Koekerta luotu!");
			location.reload();
		}
		else if (data.succesful == false) {
			window.alert("Koekerran luonti onnistui.");
		}
	});
}

function endExam() {
	$.get('/stopexam/' + getUrlParameter('id'), function(data){
		alert("Koe lopetettu.");
		location.reload();
	});
}

// Events
$(document).ready(function() {
	// Event for changing true/false in select_answer
	$('body').on('click', 'a.select_answer_option', function() {
	    var selText = $(this).text();
	    // This next line, if you remove the space from "selText+' <span class..."
	    // it doesn't work. If someone knows why, please tell
	    $(this).parents('.dropdown').find('.dropdown-toggle').html(selText + ' <span class="caret"></span>'); 
  	});

  	//$('.toggleable').button('toggle').addClass('active');

  	$('body').on('click', '.toggleable', function() {
  		console.log("got the toggle click");
  		$(this).blur();
  		if ($(this).hasClass('active')) {
	    	$(this).removeClass('active');
	    	$(this).css("background-color", "#FFF");
	    }
	    else {
	    	$(this).addClass('active');
	    	$(this).css("background-color", "#e6e6e6");
	    }
  	});	
});