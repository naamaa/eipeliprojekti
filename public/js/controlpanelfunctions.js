/* This file is for functions in controlpanel */ 

function initEditQuestions()
{
	fetchQuestionsForEdit();
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
		if (data.succesful == true) {
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
	console.log("CALLIN CREATEEXAM");
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