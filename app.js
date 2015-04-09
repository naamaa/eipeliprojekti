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
	passport.use(new LocalStrategy(
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
 		function(apikey, done) {
 		 	var User = db.collection('logincodes');
    		User.findOne({ logincode: apikey }, function (err, user) {
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
	app.get('/exam', isAuthenticated, loginGroup('user'), function(req,res){
		res.sendFile("exam.html",{root: __dirname + '/private'});
	});

	//GET for examcontrol
	app.get('/examcontrol', isAuthenticated, loginGroup('admin'), function(req,res){
		res.sendFile("examcontrol.html",{root: __dirname + '/private'});
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
	app.get('/studentsignup', function(req, res) {
		res.sendFile("studentsignup.html", {root : __dirname + '/private'});
	});

	/* POST /login */
	app.post('/login',
  	passport.authenticate('local', { successRedirect: '/controlpanel',
                                   failureRedirect: '/?retryadmin=true'})
	);

	/* POST /loginUser */
	app.post('/login_user',
	passport.authenticate('localapikey',{ successRedirect: '/exam', 
										failureRedirect: '/?retry=true'})
	); 

/* POST/create_exam  creates unique cutting edge login code for user and inserts it to database. Also administrator name must be given and starttime */

	app.post('/create_exam', function(req,res){

			autoIncrement.getNextSequence(db, "exams", function(err, autoIndex){
			var exams = db.collection('exams');
			var id = autoIndex;

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

			var loginid = create_logincode();
			console.log("LoginID:" + loginid);
			console.log("Adding exam with ID : " + autoIndex);
			exams.insert( {
				_id: id,
				loginid: loginid,
				admin: req.body.admin,
				starttime: req.body.starttime,
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
	app.get("/get_questions", function(req, res) {
		var questions = db.collection('questions');

	  	questions.find().toArray(function (err, items) {
	  		console.log("Sending questions and id's to client, I'll let you know if something goes wrong.");

	  		// I don't think we should send the answer to the client here -Ville
	  		var response = [];
  		  	for(var i = 0; i < items.length; i++) {
		        var obj = items[i];
		        response.push({"_id" : obj['_id'], "question" : obj['question']});
		    }
    		res.send(response);   						
		});
	});

	// Gets all question data from database 
	app.get("/get_questions_all", function(req, res) {
		var questions = db.collection('questions');

	  	questions.find().toArray(function (err, items) {
	  		console.log("Sending all question data to client (ADMIN), I'll let you know if something goes wrong.");
    		res.send(items);   						
		});
	});

	/* POST /check_answers */
	/* Compares keys ( user submitted values ) against database values */
	/* Is it necessary to query the whole database? Probably not, but it's working! -JH*/
	app.post('/check_answers', function(req, res) {
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
		});	
	});

	/* POST /delete_question */
	app.post('/delete_question', function(req,res){
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
	app.post('/edit_question', function(req,res) {
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
	app.post('/add_question', function(req,res) {
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
	app.post('/studentsignup', function(req, res) {
		
		// student's personal data
		var firstname = req.body.firstname;
		var lastname = req.body.lastname;
		var ssn = req.body.ssn;
		var email = req.body.email;
	

		autoIncrement.getNextSequence(db, "students", function(err, autoIndex) {
			var students = db.collection('students');
			console.log('Adding student with autoIndex ID : ' + autoIndex);
			students.insert( {
				_id: autoIndex,
				signupDate: new Date(),
				firstname: firstname,
				lastname: lastname,
				ssn: ssn,
				email: email
			}, function(err, result) {
				if (err) {
					console.log(err);
					res.json({succesful: false});
				}
				else if (result) {
					console.log("Student added!");
					res.json({succesful: true});
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