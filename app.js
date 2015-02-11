var express = require('express');
var app = express();
var path = require("path");
var MongoClient = require('mongodb').MongoClient
var bodyParser = require('body-parser');


MongoClient.connect('mongodb://localhost:27017/anniskelupassi', function (err, db) {
	if (err) {
	    throw err;
	} else {
	    console.log("Successfully connected to the database ");
	}

	app.use(bodyParser.json());

	app.use(express.static(__dirname + '/public'));

	var server = app.listen(3000, function () {
		var host = server.address().address
		var port = server.address().port
		console.log('Example app listening at http://%s:%s', host, port)
	}) 
});