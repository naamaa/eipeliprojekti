var express = require('express');
var app = express();
var path = require("path");
var MongoClient = require('mongodb').MongoClient
var bodyParser = require('body-parser');
var sha1 = require('sha1');

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

	/* POST /login */
	app.post('/login', function(req, res){
		console.log("/login REQUEST : admin login data:", req.body.username, req.body.password);
		/* do stuff for password */
		var salt = "0serj9fuhaa09suejdrawserf90hnj23490";
		var username = req.body.username;
		var password = req.body.password;
		var hashpassword = sha1(salt + req.body.username + req.body.password);
		var users = db.collection('users');
		console.log(hashpassword);
		/* check if username matches the database */
		users.findOne( {user: username}, function(err, item) {
			if (err) {
				console.log(err);
				res.redirect("/index.html?retryadmin=true")
			}
			/*check if username matches the password */
			else if (item && item.password == hashpassword) {
				console.log("Correct login info, redirecting to controlpanel.html")
				res.redirect("/controlpanel.html");
			} else {
				console.log("Wrong password, redirecting to index.html")
				res.redirect("/index.html?retryadmin=true")
			}

		});
	});

	/* POST /loginUser */
	app.post('/login_user', function(req, res) {
		console.log("/loginUser REQUEST : user login code: " + req.body.loginCode);
		/* do stuff for password */
		var userlogincode = req.body.loginCode;
		var users = db.collection('logincodes');
		/* check if username matches the database */
		users.findOne( {logincode: userlogincode}, function(err, item) {
			if (err) {
				console.log(err);
			} else if (item && item.logincode == userlogincode) {
				console.log("Correct login code, redirecting to exam.html");
				res.redirect("/exam.html");
			} else {
				console.log("Wrong login code, redirecting to index.html");
				res.redirect("/index.html?retry=true");
			}
			
		});
	});

	// To be updated - still takes options
	/* POST /check_answers */
	/* Iterates through body values. IF the value is 'option1', add 1 point to total scores. */
	app.post('/check_answers', function(req, res) {
		var scores = 0;
		for (var key in req.body) {
			console.log("Key " + key + " opens: " + req.body[key]);
			var value = req.body[key];
			if (value === "option1") {
				scores++;
			}
		}
		console.log("HOORAY, total points: " + scores);
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
		var id = parseInt(req.body._id);
		var _question = String(req.body.question);
		var _answer = String(req.body.answer);

		var questions = db.collection('questions');
		questions.insert( {
			_id: id,
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

		var server = app.listen(3000, function () {
		var host = server.address().address;
		var port = server.address().port;
		console.log('Anniskelupassi: app listening at http://%s:%s', host, port)
	}) 
});