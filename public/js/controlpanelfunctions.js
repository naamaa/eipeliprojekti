/* This file is for functions in controlpanel */ 

/* INIT FUNCTIONS */

function initEditQuestions() {
	fetchQuestionsForEdit();
}

function initEditAdmins() {
	fetchAdminsForEdit();
}


function initExamControl() {
	fetchExams();
}

function initExamInfo() {
    var examid = getUrlParameter('id');
    fetchExamById(examid);
    fetchStudentsByExamID(examid);
}

function initResults() {
	fetchStudents();
}

function initStudentResult() {
    var studentid = getUrlParameter('id');
    fetchStudentById(studentid);
    var examid = getUrlParameter('examid');
    if (parseInt(examid)) {
    	$("#backbtn").attr("onclick","window.location='/examinfo/?id=" + examid + "';");
    		
    }
}

/* FETCH-FUNTIONS */
/* These create GET-requests for various data to the server */ 

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

function fetchStudents() {
	$.ajax ({
		url : "get_students",
		dataType : "json",
		type: "GET",

		success : function(data) {
			console.log("Got the students from database.");
			console.log(data)
			printStudents(data);
		},

		error : function(err) {
			console.log(err);				
		}
	});
}

function fetchStudentById(id) {
	$.ajax ({
		url : "get_student/" + id,
		dataType : "json",
		type: "GET",

		success : function(data) {
			console.log("Got the student from database.");
			printStudentInfo(data);
		},

		error : function(err) {
			console.log(err);				
		}
	});
}

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

function fetchAdminsForEdit() {
	$.ajax ({
		url : "get_admins_all",
		dataType :"json",
		type:"GET",

		success : function(data) {
			console.log("Got admins from database.");
			printAdminsForEdit(data);
		},

		error : function(err) {
			console.log(err);				
		}
	});
}
/* PRINT-FUNCTIONS */
/* These print the fetched data for the user to examine */
function printAdminsForEdit(jsonData) {
	if (jsonData.length != 0) {
		$('#exams-container').append(
			'<h4 class="center-x center-y">Admin tunnukset</h4>'
		    + '<table id="pastexamtable" class="table table-bordered">'
	      	+ '<tbody id="pastexamtbody">'
	      	+ '<th>Tunnus</th>'
	      	+ '<th class="redirect"></th>'
	      	+ '</tbody></table>'
		);
	}

	for (var i = 0; i < jsonData.length; i++) {
		var redirectURL = "'/deleteadmin/" + jsonData[i]._id + "'";

			$('#pastexamtbody').append(
				'<tr>'
				+ '<td>'
				+ jsonData[i].user
				+ '</td>'
				+ '<td>'
				+ '<button class="btn btn-xs btn-block btn-primary" onClick="deleteAdmin('+jsonData[i]._id+');">Poista tunnus</button>'
				+ '</td>'
				+ '</tr>'
			);
		}
}
// Prints student data for results.html
function printStudents(jsonData) {
	$('#students-container').append(
	    '<table id="studenttable" class="table table-bordered">'
      	+ '<tbody id="studenttbody">'
      	+ '<th>Nimi</th>'
      	+ '<th>Aloitti kokeen</th>'
      	+ '<th>Lopetti kokeen</th>'
      	+ '<th>Tulos</th>'
      	+ '</tbody></table>'
	);

	for (var i = 0; i < jsonData.length; i++) {
		if (jsonData[i].id_check == "true") {
			var signupDate = new Date(jsonData[i].signupDate);
			var endDate = new Date(jsonData[i].endDate);
			var redirectURL = "'/studentresult/?id=" + jsonData[i]._id + "'";
			$('#studenttbody').append(
				'<tr>'
				+ '<td class="searchable">'
				+ jsonData[i].lastname + " " + jsonData[i].firstname
	    		+ '</td>'
				+ '<td class="searchabletime">'
				+ signupDate.toLocaleString()
				+ '</td>'
				+ '<td>'
				+ endDate.toLocaleString()
				+ '</td>'
				+ '<td>'
				+ jsonData[i].result + '/' + jsonData[i].student_answers.length
				+ '</td>'
				+ '<td id="redirectcell">'
				+ '<button id="redirectbtn" class="btn btn-xs btn btn-primary" onClick="location.href=' 
				+ redirectURL 
				+ ';">Suoritukseen</button>'
				+ '</td>'
				+ '</tr>'
			);
		}		
	}
}

// Prints student info (general info and answers) for studentresult.html
function printStudentInfo(jsonData) {
	var signupDate = new Date(jsonData.signupDate);
	var endDate = new Date(jsonData.endDate)

	$('#print').append('Tulostusystävällinen versio');
	$('#print-answers').append('Tulostusystävällinen versio vastauksilla');

	// general student information
	$('#student-info-container').append(
		'<p class="text-center"><span class="glyphicon glyphicon-user" aria-hidden="true">&nbsp;</span><b>Kokeen tekijä: </b>'
		+ jsonData.lastname + ', ' + jsonData.firstname
		+ '<p class="text-center"><span class="glyphicon glyphicon-time" aria-hidden="true">&nbsp;</span><b>Aloitti kokeen: </b>'
		+ signupDate.toLocaleString()
		+ '<p class="text-center"><span class="glyphicon glyphicon-time" aria-hidden="true">&nbsp;</span><b>Lopetti kokeen: </b>'
		+ endDate.toLocaleString()
		+ '<p class="text-center"><span class="glyphicon glyphicon-envelope" aria-hidden="true">&nbsp;</span><b>Sähköposti: </b>'
		+ jsonData.email
		+ '<p class="text-center"><span class="glyphicon glyphicon-stats" aria-hidden="true">&nbsp;</span><b>Tulos: </b>'
		+ jsonData.result + '/' + jsonData.student_answers.length
	);

	$('#student-answers-container').append(	
		'<hr/>'
		+ '<h4 class="center-x center-y">Vastaukset</h4>'
		+ '<table id="answerstable" class="table table-bordered">'
		+ '<tbody id="answerstbody">'
      	+ '<th>Kysymys</th>'
      	+ '<th id="answer">Tekijän vastaus</th>'
      	+ '</tbody></table>'
	);

	for (var i = 0; i < jsonData.student_answers.length; i++) {
		$('#answerstbody').append(
			'<tr '
			+ (jsonData.student_answers[i].correct == "true" ? 'class="success">' : 'class="danger">')
			+ '<td><b>'
			+ (jsonData.student_answers[i].correct == "true" ? 'O: </b>' : 'V: </b>')
			+ jsonData.student_answers[i].question
			+ '</td>'
			+ '<td>'
			+ (jsonData.student_answers[i].userAnswer == "true" 
				? '<span class="label label-success center-block">Oikein</span>' 
				: '<span class="label label-danger center-block">Väärin</span>')
			+ '</td>'
			+ '</tr>'
		);
	}
}

// Prints students that participate in the exam in examinfo.html.
function printStudentsByExam(jsonData) {
	$('#students-container').append(
	    '<table id="questiontable" class="table table-bordered table-striped">'
      	+ '<tbody id="questiontbody"></tbody></table>'
	);

	for (var i = 0; i < jsonData.length; i++) {
		var signupDate = new Date(jsonData[i].signupDate);
		var redirectURL = "'/studentresult/?id=" + jsonData[i]._id + "&examid=" + jsonData[i].examid + "'";
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
			//$('#result_cell' + jsonData[i]._id).append('<b>' + jsonData[i].result + '/' + jsonData[i].student_answers.length + '</b>');
			$('#result_cell' + jsonData[i]._id).append(
				'<button id="redirectbtn" class="btn btn-xs btn btn-primary btn-block" onClick="location.href=' 
				+ redirectURL 
				+ ';">Suoritukseen</button>'
				+ '</td>'
			);
		}
 	}
}

// Prints exam information, examinfo.html 
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
		$('#print').append('Tulostusystävällinen versio');
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

// Prints exam data for examcontrol.html
function printExams(jsonData) {
	if (jsonData.length != 0) {
		$('#exams-container').append(
			'<h4 class="center-x center-y">Aktiiviset kokeet</h4>'
		    + '<table id="examtable" class="table table-bordered">'
	      	+ '<tbody id="examtbody">'
	      	+ '<th class="time">Aloitusaika</th>'
	      	+ '<th class="time">Koodi</th>'
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
	}

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

// Prints questions for editing, editquestions.html
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

// Accepts the sent answers for a student in examinfo
function acceptAnswer(studentID) {
	$.get('/acceptanswer/' + studentID, function(data){
		alert("Vastaukset hyväksytty.");
		location.reload();
	});
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

// Creates a request for a new exam
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

// Creates request for ending an exam by id
function endExam() {
	$.get('/stopexam/' + getUrlParameter('id'), function(data){
		alert("Koe lopetettu.");
	});
	$.get('/set_participantcount/' + getUrlParameter('id'), function(data){
		console.log("Participants updated.")
	});
	location.reload();
}

/* Printer friendly page functions */

function printStudentResultPage(printAnswers) {
	var disp_setting = "toolbar=yes,location=yes,directories=yes,menubar=yes,"; 
	disp_setting += "scrollbars=yes,width=800, height=900, left=100, top=25"; 

	var content_vlue = $('#student-info-container').html(); //document.getElementById("print_content").innerHTML; 
	//console.log(content_vlue);
	if (printAnswers) {
		content_vlue += $('#student-answers-container').html(); 
	}

	var docprint = window.open("", "", disp_setting); 
	docprint.document.open(); 
	docprint.document.write('<html><head><title>Koekertatuloste</title>'); 
	docprint.document.write('</head><body onLoad="self.print()"><center>');          
	docprint.document.write(content_vlue);
	docprint.document.write('</center></body></html>'); 
	docprint.document.close(); 
	docprint.focus();
}

// Prints exam page, removes buttons
function printExamPage() { 
	//console.log("printing");
	var disp_setting = "toolbar=yes,location=yes,directories=yes,menubar=yes,"; 
	disp_setting += "scrollbars=yes,width=800, height=900, left=100, top=25"; 

	var content_vlue = $('#exam-container').html(); //document.getElementById("print_content").innerHTML; 
	content_vlue += $('#students-container').html();  
	//console.log(content_vlue);
	content_vlue = content_vlue.replace(/(<button)(.*?<\/button>)/ig, "");

	var docprint = window.open("", "", disp_setting); 
	docprint.document.open(); 
	docprint.document.write('<html><head><title>Koekertatuloste</title>'); 
	docprint.document.write('</head><body onLoad="self.print()"><center>');          
	docprint.document.write(content_vlue);
	docprint.document.write('</center></body></html>'); 
	docprint.document.close(); 
	docprint.focus();
}

function createAdmin(){
	location.href = "/createadmin";
}

function addAdmin() {
	var username = $('#username').val();
	var password = $("#password").val();
	var password2 = $("#password2").val();

	$.post('/adminsignup', {username: username, password: password}, function(data) {
		if (data.succesful == true) {
			window.alert("Tunnus lisätty.");
			location.reload();
		}
		else if (data.succesful == false) {
			window.alert("Tunnuksen lisääminen epäonnistui.");
		}
	});
}

function deleteAdmin(id) {
	$.post('/deleteadmin', { _id: id }, function(data) {
		if (data.succesful == true) {
			window.alert("Poisto onnistui");
			location.reload();
		}
		else if (data.succesful == false) {
			window.alert("Poisto epäonnistui");
		}
	});
}

/* JQuery events */
$(document).ready(function() {
	// Event for changing true/false in select_answer
	$('body').on('click', 'a.select_answer_option', function() {
	    var selText = $(this).text();
	    // This next line, if you remove the space from "selText+' <span class..."
	    // it doesn't work. If someone knows why, please tell
	    $(this).parents('.dropdown').find('.dropdown-toggle').html(selText + ' <span class="caret"></span>'); 
  	});

  	$('body').on('click', '.toggleable', function() {
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

  	// Search in results.html using regular expressions
  	$( '#searchtext' ).change(function() {
  		$('td.searchable').each(function() {
  			// Creating the regex pattern
  			var pattern = $( '#searchtext' ).val()
  			//console.log(pattern);
  			if (pattern.indexOf(" ") > -1) {
  				pattern = pattern.replace(/\s+/g,' ').trim();
  				var words = pattern.split(" ");
  				pattern = ".*";
  				for (var i = 0; i < words.length; i++) {
  					words[i] = "(?=.*" + words[i] + ")";
  					pattern += words[i];
  				}
  				pattern += ".*";
  			}
  			//console.log(pattern);
  			var regex = new RegExp(pattern, "i");

  			if ( regex.test($(this).text()) || regex.test($(this).nextAll('.searchabletime').text()) ) {
  				$(this).closest('tr').show();
  			} else {
  				$(this).closest('tr').hide();
  			}
  		});
	});
});