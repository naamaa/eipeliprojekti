/* This file is for functions in controlpanel */ 

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

function PrintAllQuestions(jsonData) {
	var questionCounter = 1;
	console.log('Got ' + jsonData.length + ' items from db.')
 	for (var i = 0; i < jsonData.length; i++) {					
		var answerCounter = 0;
		console.log('Adding question : ' + jsonData[i].question);

		$('#questions-container').append(
			'<label for="question' 
			+ questionCounter 
			+ '" class="control-label input-group">' 
			+ questionCounter + '. ' 
			+ jsonData[i].question + '</label>'
			+ '<input id="delete" type="submit" value="Poista kysymys" onclick="ConfirmDelete('
			+ jsonData[i]._id + ')">'
			+ '<input id="edit" type="submit" value="Muokkaa kysymystä" onclick="RevealEdit('+jsonData[i]._id+')">'
			/*Edit question inputs*/
			+ '<div id="'+ jsonData[i]._id +'edit_question" style="display:none"><input id="' + jsonData[i]._id + '_' + 'edit_question_name" type="text"  value="'+ jsonData[i].question +'">'
			+ '<input id="' + jsonData[i]._id + '_' + 'edit_question_rightAnswer" type="text" value= "' + jsonData[i].rightAnswer + '">'
			+ '<input id="' + jsonData[i]._id + '_' + 'edit_question_wrongAnswer1" type="text" value= "' + jsonData[i].wrongAnswer1 + '">'
			+ '<input id="' + jsonData[i]._id + '_' + 'edit_question_wrongAnswer2" type="text" value= "' + jsonData[i].wrongAnswer2 + '">'
			+ '<input id="submit_edit" type="submit" value="Tallenna muutokset" onclick="EditQuestion('
			+ jsonData[i]._id + ')"></div>');

		$("#questions-container").append(
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
 
 /*Show the add question input boxes*/
function RevealAdd(){
	document.getElementById("add_question_inputs").style.display = "block";
}

/*Add questions to the database*/
function AddQuestion(id){
	var id = document.getElementById("question_id").value;
	var newname = document.getElementById("question").value;
	var newanswer1 = document.getElementById("rightAnswer").value;
	var newanswer2 = document.getElementById("wrongAnswer1").value;
	var newanswer3 = document.getElementById("wrongAnswer2").value;

	$.post('/add_question',{_id: id, question: newname, rightAnswer: newanswer1, wrongAnswer1: newanswer2, wrongAnswer2: newanswer3}, function(data){
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
function RevealEdit(id){
	document.getElementById(id + 'edit_question').style.display = "block";
}

/*Update questions to database*/
function EditQuestion(id){

	var newname = document.getElementById(id + '_edit_question_name').value;
	var newanswer1 = document.getElementById(id + '_edit_question_rightAnswer').value;
	var newanswer2 = document.getElementById(id + '_edit_question_wrongAnswer1').value;
	var newanswer3 = document.getElementById(id + '_edit_question_wrongAnswer2').value;

	$.post('/edit_question',{_id: id, question: newname, rightAnswer: newanswer1, wrongAnswer1: newanswer2, wrongAnswer2: newanswer3}, function(data){
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
 function ConfirmDelete(id){
	var r = confirm("Haluatko varmasti poistaa kysymyksen: " + id);
	if( r== true){
		DeleteQuestion(id);
	}
	else {
		window.alert("Kysymystä " + id + " ei poistettu")
	}
 }

/*Delete question from the database*/
function DeleteQuestion(id){
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