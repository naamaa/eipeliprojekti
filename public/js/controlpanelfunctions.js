/* This file is for functions in controlpanel */ 

function initEditQuestions()
{
	fetchQuestionsForEdit();
}

// Sends request for getting the questions from database
function fetchQuestionsForEdit() {
	$.ajax ({
		url : "get_questions",
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

 	for (var i = 0; i < jsonData.length; i++) 
 	{
		$('#questiontbody').append(
			'<tr>'
			+ '<td class="center-x">'
			// Edit and Delete
     		+ '<button id="edit" class="btn btn-default" type="submit" value="Muokkaa kysymystä" onclick="toggleEdit('
 			+ jsonData[i]._id + ')"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button>'
      		+ '<button id="delete" class="btn btn-default" type="submit" value="Poista kysymys" onclick="confirmDelete('
			+ jsonData[i]._id + ')"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>'
    		+ '</td>'
    		+ '<td>'
    		// Question label
    		+ '<label for="question" class="control-label">' + jsonData[i].question + '</label>'
			// Edit question inputs
			+ '<div id="'+ jsonData[i]._id +'edit_question" style="display:none">'
			+ '<input id="' + jsonData[i]._id + '_' + 'edit_question_name" type="text" class="form-control text-edit" value="'+ jsonData[i].question +'">'
			+ '<input id="' + jsonData[i]._id + '_' + 'edit_question_option1" type="text" class="form-control text-edit" value= "' + jsonData[i].option1 + '">'
			+ '<input id="' + jsonData[i]._id + '_' + 'edit_question_option2" type="text" class="form-control text-edit" value= "' + jsonData[i].option2 + '">'
			+ '<input id="' + jsonData[i]._id + '_' + 'edit_question_option3" type="text" class="form-control text-edit" value= "' + jsonData[i].option3 + '">'
			+ '<input id="submit_edit" type="submit" class="btn btn-primary btn-block" value="Tallenna muutokset" onclick="editQuestion(' + jsonData[i]._id + ')">'
			+ '</div>'
			+ '</td>'
			+ '</tr>');
 	} 
 }
 
 /*Show the add question input boxes*/
function toggleAdd(){
	if (document.getElementById("add_question_inputs").style.display == "block")
		document.getElementById("add_question_inputs").style.display = "none";
	else if (document.getElementById("add_question_inputs").style.display == "none")
		document.getElementById("add_question_inputs").style.display = "block";
}

/*Add questions to the database*/
function addQuestion(id){
	var id = document.getElementById("question_id").value;
	var newname = document.getElementById("question").value;
	var newanswer1 = document.getElementById("option1").value;
	var newanswer2 = document.getElementById("option2").value;
	var newanswer3 = document.getElementById("option3").value;

	$.post('/add_question',{_id: id, question: newname, option1: newanswer1, option2: newanswer2, option3: newanswer3}, function(data){
		if(data.succesful == true){
			window.alert("Kysymys lisätty.");
			location.reload();
		}
		else if(data.succesful == false){
			window.alert("Kysymyksen lisääminen epäonnistui.");
		}
	});

	document.getElementById("add_question_inputs").style.display="none";
}

/*Show the edit input boxes*/
function toggleEdit(id) {
	if (document.getElementById(id + 'edit_question').style.display == "block")
		document.getElementById(id + 'edit_question').style.display = "none";
	else if (document.getElementById(id + 'edit_question').style.display == "none")
		document.getElementById(id + 'edit_question').style.display = "block";
}

/*Update questions to database*/
function editQuestion(id){

	var newname = document.getElementById(id + '_edit_question_name').value;
	var newanswer1 = document.getElementById(id + '_edit_question_option1').value;
	var newanswer2 = document.getElementById(id + '_edit_question_option2').value;
	var newanswer3 = document.getElementById(id + '_edit_question_option3').value;

	$.post('/edit_question',{_id: id, question: newname, option1: newanswer1, option2: newanswer2, option3: newanswer3}, function(data){
		if(data.succesful == true){
			window.alert("Muokkaus onnistui.");
			location.reload();
		}
		else if(data.succesful == false){
			window.alert("Muokkaus epäonnistui");
		}
	});

	document.getElementById(id+'edit_question').style.display="none";
}

/*Confirm delete question*/
 function confirmDelete(id){
	var r = confirm("Haluatko varmasti poistaa kysymyksen: " + id);
	if( r== true){
		DeleteQuestion(id);
	}
	else {
		window.alert("Kysymystä " + id + " ei poistettu")
	}
 }

/*Delete question from the database*/
function deleteQuestion(id){
	$.post('/delete_question', { _id: id }, function(data){
		if(data.succesful == true){
			window.alert("Poisto onnistui");
			location.reload();
		}
		else if(data.succesful == false){
			window.alert("Poisto epäonnistui");
		}
	});
	}