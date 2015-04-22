var express = require('express');
var app = express();
var path = require("path");
var MongoClient = require('mongodb').MongoClient
var bodyParser = require('body-parser');
var sha1 = require('sha1');
var autoIncrement = require ('mongodb-autoincrement');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var cookieParser = require('cookie-parser');
var LocalAPIKeyStrategy =  require('passport-localapikey').Strategy;

MongoClient.connect('mongodb://localhost:27017/anniskelupassi', function (err, db) {
	if (err) {
	    throw err;
	} else {
	    console.log("Successfully connected to the database ");
	    var collection = db.collection('anniskelupassi');
	}
	/*To use post */
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use(express.static(__dirname + '/public'));

	/*Passport use stuff for app*/
	app.use(session({
		secret: 'to51 5a1a1nen',
		resave: false,
		saveUninitialized: true
		}));
	app.use(cookieParser());
	app.use(passport.initialize());
	app.use(passport.session());

	/*Passport strategy for Admin */ 
	passport.use('admin-local', new LocalStrategy(
  		function(username, password, done) {
  			console.log("/login REQUEST : admin login data:", username, password);
			var salt = "0serj9fuhaa09suejdrawserf90hnj23490";
			var hashpassword = sha1(salt + username + password);

  			var User = db.collection("users");
    		User.findOne({ user: username }, function(err, user) {
    			if (err) { 
    			return done(err);
    			}
      			if (!user) {
        			return done(null, false, { message: 'Incorrect username.' });
      			}
      			if (user.password != hashpassword) {
        			return done(null, false, { message: 'Incorrect password.' });
      			}
      			user.group = 'admin';
      			return done(null, user);
    		});
  		}
	));

	//Passport strategy for logincodes
	passport.use(new LocalAPIKeyStrategy(
 		function(ssn, done) {
 			console.log(ssn);
 		 	var User = db.collection('exams');
    		User.findOne({loginid: ssn, endtime: 'false'}, function (err, user) {
     			if (err) {
     			 return done(err); 
     			}
      			if (!user) {
      			 return done(null, false); 
      			}
      			user.group = 'user';
      			return done(null, user);
    		});
  		}
	));
	
	/*serialize */
	passport.serializeUser(function(user, done) {
 		 done(null, user);
	});

	passport.deserializeUser(function(user, done) {
    	done(null, user);
	});

	//Check if user is authenticated
	var isAuthenticated = function(req,res,next){
		if(req.isAuthenticated()){
			return next();
		}
		res.redirect('/');
	}
	
	//check the usergroup
	var loginGroup = function(group){
		return function(req,res,next){
			if(req.user && req.user.group === group){
				next();
			}
			else{
				res.redirect('/');
			}
		}
	}

	//GET for index page
	app.get('/', function(req,res){
		res.sendFile("index.html");
	});

	//GET for control panel
	app.get('/controlpanel', isAuthenticated, loginGroup('admin'), function(req,res){
		res.sendFile("controlpanel.html",{root: __dirname + '/private'});
	});

	//GET for editquestions
	app.get('/editquestions',isAuthenticated, loginGroup('admin'), function(req,res){
		res.sendFile("editquestions.html",{root: __dirname + '/private'});
	});

	//GET for logging out
	app.get('/logout', function(req,res){
		req.logout();
		console.log("Logging out");
		res.redirect('/');
	});

	//GET for exam
	app.get('/exam', isAuthenticated, loginGroup('student'), function(req,res){
		res.sendFile("exam.html",{root: __dirname + '/private'});
	});

	//GET for examcontrol
	app.get('/examcontrol', isAuthenticated, loginGroup('admin'), function(req,res){
		res.sendFile("examcontrol.html",{root: __dirname + '/private'});
	});

	//GET for examinfo/<examid>
	app.get('/examinfo/', isAuthenticated, loginGroup('admin'), function(req,res){
		res.sendFile("examinfo.html",{root: __dirname + '/private'});
	});

	//GET for results
	app.get('/results', isAuthenticated, loginGroup('admin'), function(req,res){
		res.sendFile("results.html",{root: __dirname + '/private'});
	});

	//GET for usercontrol
	app.get('/usercontrol', isAuthenticated, loginGroup('admin'), function(req,res){
		res.sendFile("usercontrol.html",{root: __dirname + '/private'});
	});

	//GET for studentsignup
	app.get('/studentsignup', isAuthenticated, loginGroup('user'),function(req, res) {
		res.sendFile("studentsignup.html", {root : __dirname + '/private'});
	});

	/* POST /login */
	app.post('/login',
  	passport.authenticate('admin-local', { successRedirect: '/controlpanel',
                                   failureRedirect: '/?retryadmin=true'})
	);

	/* POST /loginUser */
	app.post('/login_user',
	passport.authenticate('localapikey',{ successRedirect: '/studentsignup', 
										failureRedirect: '/?retry=true'})
	); 


/* GET/create_exam  creates unique cutting edge login code for user and inserts it to database. Also administrator name must be given and starttime */

	app.get('/create_exam', isAuthenticated, loginGroup('admin'),function(req,res){

			autoIncrement.getNextSequence(db, "exams", function(err, autoIndex){
			var exams = db.collection('exams');
			var id = autoIndex;
			console.log(req.user);
			//Creates login code and ensures it doesnt do duplicaters

			var create_logincode = function(){

				var logincode = Math.floor(Math.random() * 9000) + 1000;    		
				var found = false;
				exams.count({ loginid: logincode }, function (err, count) {
     			if(count > 1){
     				found = true;
     			}
     			else{
     				found = false;
     			}
    		});
			if(found){
				create_logincode();
			}
			if(!found){
				return logincode;
			}
			};

			var loginid = create_logincode().toString();
			console.log("LoginID:" + loginid);
			console.log("Adding exam with ID : " + autoIndex);
			exams.insert( {
				_id: id,
				loginid: loginid,
				admin: req.user.user,
				starttime: new Date(),
				endtime: "false",
				students:  ""
			}, function(err, result) {
				if (err) {
					console.log(err);
					res.json({succesful: false});
				}
				else if (result) {
					console.log("Added!");
					res.json({succesful: true});
				}
				else if (!result) {
					console.log("Couldn't add exam.")
					res.json({succesful: false});
				}
			});
		});
	});
	
	// Gets questions and id's from database (answer is not sent to client)
	app.get("/get_questions",isAuthenticated, loginGroup('student'), function(req, res) {
		var questions = db.collection('questions');

	  	questions.find().toArray(function (err, items) {
	  		console.log("Sending questions and id's to client, I'll let you know if something goes wrong.");

	  		// I don't think we should send the answer to the client here -Ville
	  		var response = [];
  		  	for(var i = 0; i < items.length; i++) {
		        var obj = items[i];
		        response.push({"_id" : obj['_id'], "question" : obj['question']});
		    }
		    response = shuffle(response);
    		res.send(response);   						
		});
	});


	// Shuffle() shuffles the order of questions.
	function shuffle(shuffle_me) {
		var array = shuffle_me;

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

	app.get("/set_participantcount/:examid", isAuthenticated, loginGroup('admin'), function(req, res) {
		var students = db.collection('students');
		examid = req.params.examid;
		students.find({examid : parseInt(examid)}).toArray(function (err, items) {
			if (err) {
				console.log(err);
			} else {
				updateParticipants(examid, items.length);
				console.log("Participants updated.");
			}
		});
	});

	function updateParticipants(examid, count) {
		var exams = db.collection('exams');
	  	exams.update({_id : parseInt(examid)},  { $set:
	  	{
			students: count
		}
		}, function(err, result) {
			if (err) {
				console.log(err);
			}
			else if (result) {
				console.log("Updated participants.");
			}
			else if (!result) {
				console.log("Couldn't find a exam with that id.")
			}
		});
	}

	// Gets all exam data from database 
	app.get("/get_exams", isAuthenticated, loginGroup('admin'), function(req, res) {
		var exams = db.collection('exams');
		var examid = req.body.examid;
	
	  	exams.find().sort({ starttime: -1 }).toArray(function (err, items) {
	  		if (err) {
	  			console.log(err);
	  		}
	  		else {
	  			console.log("Sending all exam data to client (ADMIN), I'll let you know if something goes wrong.");
	 			res.send(items);
	 		}
		});
	});

	// GET - Gets exam by ID from database
	app.get("/examinfo/get_exam/:examid", isAuthenticated, loginGroup('admin'), function(req, res) {
		var exams = db.collection('exams');
		examid = req.params.examid;

	  	exams.findOne({_id : parseInt(examid)}, function(err, exam) {
	  		if (err) {
	  			console.log(err);
	  		}
	  		else {
		  		console.log("Sending exam by ID to client");
 				res.send(exam);
	  		}

		});
	});

	// GET - Gets students by exam ID from database (for examinfo.html)
	app.get("/examinfo/get_studentsbyexamid/:examid", isAuthenticated, loginGroup('admin'), function(req, res) {
		var students = db.collection('students');
		examid = req.params.examid;

		students.find({examid : parseInt(examid)}).toArray(function (err, items) {
	  		if (err) {
	  			console.log(err);
	  		}
	  		else {
				console.log("Sending students by exam ID to client");
				res.send(items);
			}
		});
	});

	app.get("/acceptanswer/:studentid", isAuthenticated, loginGroup('admin'), function(req, res) {
		var students = db.collection('students');
		studentid = req.params.studentid;
		console.log("Attempting to check ID for student ID: " + studentid)
	  	students.update({_id : parseInt(studentid)},  { 
	  		$set: {
				id_check: "true"
			}
		}, function(err, result) {
			if (err) {
				console.log(err);
				res.json({succesful: false});
			}
			else if (result) {
				console.log("Student id_check changed to 'true'.");
				res.json({succesful: true});
			}
			else if (!result) {
				console.log("Couldn't find a student with that id.")
				res.json({succesful: false});
			}
		});
	});

	app.get("/stopexam/:examid", isAuthenticated, loginGroup('admin'), function(req, res) {
			var exams = db.collection('exams');
			var examid = req.params.examid;
		  	exams.update({_id : parseInt(examid)},  { $set:
		  	{
			endtime: new Date(),
			}
		}, function(err, result) {
			if (err) {
				console.log(err);
				res.json({succesful: false});
			}
			else if (result) {
				console.log("Updated end time. Exam has now ended");
				res.json({succesful: true});
			}
			else if (!result) {
				console.log("Couldn't find a exam with that id.")
				res.json({succesful: false});
			}
		});
	});

	// Gets all question data from database 
	app.get("/get_questions_all", isAuthenticated, loginGroup('admin'), function(req, res) {
		var questions = db.collection('questions');

	  	questions.find().toArray(function (err, items) {
	  		console.log("Sending all question data to client (ADMIN), I'll let you know if something goes wrong.");
    		res.send(items);   						
		});
	});

	/* POST /check_answers */
	/* Compares keys ( user submitted values ) against database values */
	/* Is it necessary to query the whole database? Probably not, but it's working! -JH*/
	app.post('/check_answers', isAuthenticated, loginGroup('student'), function(req, res) {
		var scores = 0;
		var i = 0;
		var questions = db.collection('questions');
	
		questions.find().toArray(function (err, questions) {
			
			for (var key in req.body) {
				if (key != 'button') {
					var userValue = req.body[key];
					var databaseValue = questions[i].answer;
					i++;

					if (userValue === databaseValue) {
						scores++;
					}
				}
			}
			console.log("HOORAY, total points: " + scores);

		//ADD ANSWERS TO DATABASE
		var students = db.collection('students');
	  	students.update({_id : parseInt(req.user._id)},  { 
	  		$set: {
	  			answer_sent: "true",
				result: scores
			}
		}, function(err, result) {
			if (err) {
				console.log(err);
				res.json({succesful: false});
			}
			else if (result) {
				console.log("Added this result to the student!" + scores);
				req.logout();
				res.redirect('/');
			}
			else if (!result) {
				console.log("Couldn't find a student with that id.")
				res.json({succesful: false});
			}
		});
		//END OF ADD ANSWERS TO DATABASE

		});	
	});

	/* POST /delete_question */
	app.post('/delete_question',isAuthenticated, loginGroup('admin'), function(req,res){
		var id = parseInt(req.body._id);
		var questions = db.collection('questions');
		questions.remove({_id: id}, function(err, result){
			if(err){
				console.log(err);
				res.json({succesful: false});
			}
			else if(result){
				console.log("Deleted the question!");
				res.json({succesful: true});
			}
			else if(!result){
				console.log("Couldn't find requested question.")
				res.json({succesful: false});
			}
		});
		console.log("Got this id:" + id);
	});

	// POST /edit_question
	app.post('/edit_question',isAuthenticated, loginGroup('admin'), function(req,res) {
		var id = parseInt(req.body._id);
		var _question = String(req.body.question);
		var _answer = String(req.body.answer);

		if (_answer == "Oikein ") 
			_answer = "true";
		else if (_answer == "Väärin ")
			_answer = "false";
		else
			res.json({succesful: false});

		var questions = db.collection('questions');
		questions.update({_id: id}, {
			question: _question,
			answer: _answer,
		}, function(err, result) {
			if (err) {
				console.log(err);
				res.json({succesful: false});
			}
			else if (result) {
				console.log("Updated the question!");
				res.json({succesful: true});
			}
			else if (!result) {
				console.log("Couldn't find a question with that id.")
				res.json({succesful: false});
			}
		});
	});

	// POST /add_question
	app.post('/add_question',isAuthenticated, loginGroup('admin'), function(req,res) {
		var _question = String(req.body.question);
		var _answer = String(req.body.answer);

		if (_answer == "Oikein ") 
			_answer = "true";
		else if (_answer == "Väärin ")
			_answer = "false";
		else
			res.json({succesful: false});

		autoIncrement.getNextSequence(db, "questions", function(err, autoIndex){
			var questions = db.collection('questions');
			console.log("Adding question with autoIndex ID : " + autoIndex);
			questions.insert( {
				_id: autoIndex,
				question: _question,
				answer: _answer,
			}, function(err, result) {
				if (err) {
					console.log(err);
					res.json({succesful: false});
				}
				else if (result) {
					console.log("Added!");
					res.json({succesful: true});
				}
				else if (!result) {
					console.log("Couldn't add question.")
					res.json({succesful: false});
				}
			});
		});
	});

	// POST /studentsignup
	app.post('/studentsignup',isAuthenticated, loginGroup('user'), function(req, res) {
		
		// student's personal data
		var firstname = req.body.firstname;
		var lastname = req.body.lastname;
		var ssn = req.body.ssn;
		var email = req.body.email;
		var examid = req.user._id;
		var loginGroup = "student";
		autoIncrement.getNextSequence(db, "students", function(err, autoIndex) {
			var students = db.collection('students');
			console.log('Adding student with autoIndex ID : ' + autoIndex);
			var student = ({
				_id: autoIndex,
				signupDate: new Date(),
				firstname: firstname,
				lastname: lastname,
				ssn: ssn,
				email: email,
				answer_sent: "false",
				id_check: "false",
				examid: examid,
				result: 0,
				group: loginGroup
			});

			students.insert( student , function(err, result) {
				if (err) {
					console.log(err);
					res.json({succesful: false});
				}
				else if (result) {
					console.log("Student added!");
					req.logout();
					req.login(student,function (err){
						if(err) {
							return next(err);
						}
						res.redirect('/exam');
					});
				}
				else if (!result) {
					console.log("Couldn't add student.")
					res.json({succesful: false});
				}
			});
		});
	});

	var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Anniskelupassi: app listening at http://%s:%s', host, port)
	}) 
});