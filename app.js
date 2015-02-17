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

	/* GET /haekysymykset */
	/* Hakee kysymykset tietokannalta ja lähettää ne clientille? Yes? No? */
	app.get("/haekysymykset", function(req, res) {
		var questions = db.collection('questions');
	  	questions.find().toArray(function (err, items) {
	  		console.log("items length : " + items.length);
    		res.send(items);   						
		});
	});

	/* POST /login */
	app.post('/login', function(req, res){
		console.log("login data:", req.body);
		/* do stuff for password */
		var salt = "0serj9fuhaa09suejdrawserf90hnj23490";
		var username = req.body.username;
		var password = req.body.password;
		var hashpassword = sha1(salt + req.body.username + req.body.password);
		var users = db.collection('users');
		console.log(hashpassword);
		/* check if username matches the database */
		users.findOne({user: username}, function(err, item){
			if (err){
				console.log(err);
			}
			/*check if username matches the password */
			if(item && item.password == hashpassword){
				console.log("Password was right!");
				res.json({login:'success'});
			}

			else{
				res.json({login:'failed'});
		}
		});
	});

	var server = app.listen(3000, function () {
		var host = server.address().address
		var port = server.address().port
		console.log('Example app listening at http://%s:%s', host, port)
	}) 
});