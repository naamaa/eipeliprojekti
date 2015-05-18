var express = require('express');
var app = express();
var path = require("path");
var MongoClient = require('mongodb').MongoClient
var bodyParser = require('body-parser');
var sha1 = require('sha1');
var autoIncrement = require('mongodb-autoincrement');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var cookieParser = require('cookie-parser');
var LocalAPIKeyStrategy = require('passport-localapikey').Strategy;
MongoClient.connect('mongodb://localhost:27017/anniskelupassi', function(err, db) {
    if (err) {
        throw err;
    } else {
        console.log("Successfully connected to the database ");
        var collection = db.collection('anniskelupassi');
    }
    /*To use post */
    app.use(bodyParser.urlencoded({
        extended: true
    }));
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
    passport.use('admin-local', new LocalStrategy(function(username, password, done) {
        console.log("/login REQUEST : admin login data:", username, password);
        var salt = "0serj9fuhaa09suejdrawserf90hnj23490";
        var hashpassword = sha1(salt + username + password);
        var User = db.collection("users");
        User.findOne({
            user: username
        }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {
                    message: 'Incorrect username.'
                });
            }
            if (user.password != hashpassword) {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
            user.group = 'admin';
            return done(null, user);
        });
    }));
    //Passport strategy for logincodes
    passport.use(new LocalAPIKeyStrategy(function(code, done) {
        var User = db.collection('exams');
        User.findOne({
            loginid: code,
            endtime: 'false'
        }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }
            user.group = 'user';
            return done(null, user);
        });
    }));
    /*serialize */
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    //Check if user is authenticated
    var isAuthenticated = function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    }
    //check the usergroup
    var loginGroup = function(group) {
        return function(req, res, next) {
            if (req.user && req.user.group === group) {
                next();
            } else {
                res.redirect('/');
            }
        }
    }
    //GET for index page
    app.get('/', function(req, res) {
        res.sendFile("index.html");
    });
    //GET for control panel
    app.get('/controlpanel', isAuthenticated, loginGroup('admin'), function(req, res) {
        res.sendFile("controlpanel.html", {
            root: __dirname + '/private'
        });
    });
    //GET for editquestions
    app.get('/editquestions', isAuthenticated, loginGroup('admin'), function(req, res) {
        res.sendFile("editquestions.html", {
            root: __dirname + '/private'
        });
    });
    //GET for logging out
    app.get('/logout', function(req, res) {
        req.logout();
        console.log("Logging out");
        res.redirect('/');
    });
    //GET for exam
    app.get('/exam', isAuthenticated, loginGroup('student'), function(req, res) {
        res.sendFile("exam.html", {
            root: __dirname + '/private'
        });
    });
    //GET for examcontrol
    app.get('/examcontrol', isAuthenticated, loginGroup('admin'), function(req, res) {
        res.sendFile("examcontrol.html", {
            root: __dirname + '/private'
        });
    });
    //GET for examinfo/<examid>
    app.get('/examinfo/', isAuthenticated, loginGroup('admin'), function(req, res) {
        res.sendFile("examinfo.html", {
            root: __dirname + '/private'
        });
    });
	//GET for studentresult
	app.get('/studentresult/', isAuthenticated, loginGroup('admin'), function(req,res){
		res.sendFile("studentresult.html",{root: __dirname + '/private'});
	});
    //GET for results
    app.get('/results', isAuthenticated, loginGroup('admin'), function(req, res) {
        res.sendFile("results.html", {
            root: __dirname + '/private'
        });
    });
    //GET for usercontrol
    app.get('/usercontrol', isAuthenticated, loginGroup('admin'), function(req, res) {
        res.sendFile("usercontrol.html", {
            root: __dirname + '/private'
        });
    });
    //GET for studentsignup
    app.get('/studentsignup', isAuthenticated, loginGroup('user'), function(req, res) {
        res.sendFile("studentsignup.html", {
            root: __dirname + '/private'
        });
    });
    //GET for complete
    app.get('/complete', function(req, res) {
        res.sendFile("complete.html", {
            root: __dirname + '/private'
        });
    });
    //GET FOR CREATE ADMIN
    app.get('/createadmin', isAuthenticated, loginGroup('admin'), function(req,res){
        res.sendFile("createadmin.html",{
            root: __dirname +'/private'
        });
    });
    //GET FOR DELETE ADMIN
    app.post('/deleteadmin',isAuthenticated, loginGroup('admin'), function(req,res){
        var id = parseInt(req.body._id);
        console.log(id);
                var User = db.collection("users");
                    console.log("Removing admin-user with ID : " + id);
                        User.remove({
                            _id: id,
                        }, function(err, result) {
                            if (err) {
                                console.log(err);
                                res.json({
                                    succesful: false
                                });
                            } else if (result) {
                                console.log("Removed");
                                res.json({
                                    succesful: true
                                });
                            } else if (!result) {
                                console.log("Couldn't remove admin")
                                res.json({
                                    succesful: false
                                });
                            }
                        });
    });

    /* POST /login */
    app.post('/login', passport.authenticate('admin-local', {
        successRedirect: '/controlpanel',
        failureRedirect: '/?retryadmin=true'
    }));
    /* POST /loginUser */
    app.post('/login_user', passport.authenticate('localapikey', {
        successRedirect: '/studentsignup',
        failureRedirect: '/?retry=true'
    }));

    app.post("/adminsignup", isAuthenticated, loginGroup('admin'), function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var password2 = req.body.password;

        var salt = "0serj9fuhaa09suejdrawserf90hnj23490";
        var hashpassword = sha1(salt + username + password);
        
        
        getAdmin(username, function (userFound) {
            
            if (userFound) {
                res.send("Käyttäjätunnus " + "'" +username+"'" + " on jo olemassa");
            }
            else {
                autoIncrement.getNextSequence(db, "questions", function(err, autoIndex) {
                    var User = db.collection("users");
                    console.log("Adding admin-user with autoIndex ID : " + autoIndex);
                        User.insert({
                            _id: autoIndex,
                            user: username,
                            password: hashpassword,
                        }, function(err, result) {
                            if (err) {
                                console.log(err);
                                res.json({
                                    succesful: false
                                });
                            } else if (result) {
                                console.log("Added!");
                                res.json({
                                    succesful: true
                                });
                            } else if (!result) {
                                console.log("Couldn't add admin-user.")
                                res.json({
                                    succesful: false
                                });
                            }
                        });
                    });
                }
        });
    });

    // If admin is found : return true
    // else : return false
    function getAdmin(username, callback) {
        var User = db.collection("users");
        var found;
       

        User.findOne({
            user: username
        }, function(err, usernamedb) {
            if (err) {
                console.log(err);
            } 
            else if (usernamedb != null) {
                found = true;
                callback(found);
            }
            else {
                found = false;
                callback(found);
            }
        });
        

    }

    /* GET/create_exam  creates unique cutting edge login code for user and inserts it to database. Also administrator name must be given and starttime */
    app.get('/create_exam', isAuthenticated, loginGroup('admin'), function(req, res) {
        autoIncrement.getNextSequence(db, "exams", function(err, autoIndex) {
            var exams = db.collection('exams');
            var id = autoIndex;
            console.log(req.user);
            // Creates login code and ensures it doesnt do duplicates

            getQuestions(function(shuffled_questions) {
                var create_logincode = function() {
                    var logincode = Math.floor(Math.random() * 9000) + 1000;
                    var found = false;
                    exams.count({
                        loginid: logincode
                    }, function(err, count) {
                        if (count > 1) {
                            found = true;
                        } else {
                            found = false;
                        }
                    });
                    if (found) {
                        create_logincode();
                    }
                    if (!found) {
                        return logincode;
                    }
                };

                var loginid = create_logincode().toString();
                console.log("LoginID: " + loginid);
                console.log("Adding exam with ID : " + autoIndex);
                exams.insert({
                    _id: id,
                    loginid: loginid,
                    admin: req.user.user,
                    starttime: new Date(),
                    endtime: "false",
                    students: "",
                    questions: shuffled_questions
                }, function(err, result) {
                    if (err) {
                        console.log(err);
                        res.json({
                            succesful: false
                        });
                    } else if (result) {
                        console.log("Exam added!");
                        res.json({
                            succesful: true
                        });
                    } else if (!result) {
                        console.log("Couldn't add exam.")
                        res.json({
                            succesful: false
                        });
                    }
                });
            });
        });
    });

    // Gets questions and id's from database (answer is not sent to client)
    app.get("/get_questions", isAuthenticated, loginGroup('student'), function(req, res) {
        var questions = db.collection('questions');
        questions.find().toArray(function(err, items) {;
            // I don't think we should send the answer to the client here -Ville
            var response = [];
            for (var i = 0; i < items.length; i++) {
                var obj = items[i];
                response.push({
                    "_id": obj['_id'],
                    "question": obj['question']
                });
            }
            response = shuffle(response);
            res.send(response);
        });
    });

    function getQuestions(callback) {
        var questions = db.collection('questions');
        var exams = db.collection('exams');
        var response = [];
        questions.find().toArray(function(err, items) {
            if (err) {
                console.log(err);
            } else if (items) {
                for (var i = 0; i < items.length; i++) {
                    var obj = items[i];
                    response.push({
                        "_id": obj['_id'],
                        "question": obj['question']
                    });
                }
                response = shuffle(response);
                callback(response);
            }
        });
    }
    // Shuffle() shuffles the order of questions.
    // Used in app.get(get_questions)
    function shuffle(shuffle_me) {
        var array = shuffle_me;
        var final_array = [];
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
        // Picking out 80 questions from shuffled array
        for (var i = 0; i < 80; i++) {
            final_array.push(array[i]);
        }
        return final_array;
    }
	app.get("/get_students", isAuthenticated, loginGroup('admin'), function(req, res) {
		var students = db.collection('students');

	  	students.find().sort({lastname : 1, firstname : 1}).toArray(function (err, items) {
	  		if (err) {
	  			console.log(err);
	  		}
	  		else if (items) {
	  			console.log("Students sent to client.");
	  			res.send(items);
	  		}
	  		else {
				console.log("Couldn't get students from database");	
	  		}				
		});
	});

    app.get("/set_participantcount/:examid", isAuthenticated, loginGroup('admin'), function(req, res) {
        var students = db.collection('students');
        examid = req.params.examid;
        students.find({
            examid: parseInt(examid)
        }).toArray(function(err, items) {
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
        exams.update({
            _id: parseInt(examid)
        }, {
            $set: {
                students: count
            }
        }, function(err, result) {
            if (err) {
                console.log(err);
            } else if (result) {
                console.log("Updated participants.");
            } else if (!result) {
                console.log("Couldn't find a exam with that id.")
            }
        });
    }
    // Gets all exam data from database 
    app.get("/get_exams", isAuthenticated, loginGroup('admin'), function(req, res) {
        var exams = db.collection('exams');
        var examid = req.body.examid;
        exams.find().sort({
            starttime: -1
        }).toArray(function(err, items) {
            if (err) {
                console.log(err);
            } else {
                console.log("Exam data sent to client.");
                res.send(items);
            }
        });
    });
    // GET - Gets exam by ID from database
    app.get("/examinfo/get_exam/:examid", isAuthenticated, loginGroup('admin'), function(req, res) {
        var exams = db.collection('exams');
        examid = req.params.examid;
        exams.findOne({
            _id: parseInt(examid)
        }, function(err, exam) {
            if (err) {
                console.log(err);
            } else {
                console.log("Sending exam (by ID) to client");
                res.send(exam);
            }
        });
    });
    // GET - Gets student by ID from database
    app.get("/studentresult/get_student/:studentid", isAuthenticated, loginGroup('admin'), function(req, res) {
        var students = db.collection('students');
        studentid = req.params.studentid;
        students.findOne({
            _id: parseInt(studentid)
        }, function(err, student) {
            if (err) {
                console.log(err);
            } else {
                console.log("Sending student (by ID) to client");
                res.send(student);
            }
        });
    });
    // GET - Gets students by exam ID from database
    app.get("/examinfo/get_studentsbyexamid/:examid", isAuthenticated, loginGroup('admin'), function(req, res) {
        var students = db.collection('students');
        examid = req.params.examid;
        students.find({examid: parseInt(examid)})
        .sort({lastname : 1, firstname : 1})
        .toArray(function(err, items) {
            if (err) {
                console.log(err);
            } else {
                console.log("Sending students (by exam ID) to client");
                res.send(items);
            }
        });
    });
    app.get("/acceptanswer/:studentid", isAuthenticated, loginGroup('admin'), function(req, res) {
        var students = db.collection('students');
        studentid = req.params.studentid;
        students.update({
            _id: parseInt(studentid)
        }, {
            $set: {
                id_check: "true"
            }
        }, function(err, result) {
            if (err) {
                console.log(err);
                res.json({
                    succesful: false
                });
            } else if (result) {
                console.log("Student id_check changed to 'true'.");
                res.json({
                    succesful: true
                });
            } else if (!result) {
                console.log("Couldn't find a student with that id.")
                res.json({
                    succesful: false
                });
            }
        });
    });
    app.get("/stopexam/:examid", isAuthenticated, loginGroup('admin'), function(req, res) {
        var exams = db.collection('exams');
        var examid = req.params.examid;
        exams.update({
            _id: parseInt(examid)
        }, {
            $set: {
                endtime: new Date(),
            }
        }, function(err, result) {
            if (err) {
                console.log(err);
                res.json({
                    succesful: false
                });
            } else if (result) {
                console.log("Updated end time. Exam has now ended");
                res.json({
                    succesful: true
                });
            } else if (!result) {
                console.log("Couldn't find a exam with that id.")
                res.json({
                    succesful: false
                });
            }
        });
    });
    // Gets all question data from database 
    app.get("/get_questions_all", isAuthenticated, loginGroup('admin'), function(req, res) {
        var questions = db.collection('questions');
        questions.find().toArray(function(err, items) {
            console.log("Question data sent to client.");
            res.send(items);
        });
    });

    app.get("/get_admins_all", isAuthenticated, loginGroup('admin'), function(req, res) {
        var questions = db.collection('users');
        questions.find().toArray(function(err, items) {
            console.log("Admins sent to client.");
            res.send(items);
        });
    });
    /* POST /check_answers */
    /* Compares keys ( user submitted values ) against database values */
    app.post('/check_answers', isAuthenticated, loginGroup('student'), function(req, res) {
        var scores = 0;
        var i = 0;
        var questions = db.collection('questions');
        questions.find().toArray(function(err, questions) {
        	var studentAnswers = []; // used in saving the questions and answers to student
            for (var key in req.body) {
                if (key != 'button') {
                    var userValue = req.body[key];
                    var databaseValue = questions[i].answer;
                    var correct = "";
					if (userValue != "true" && userValue != "false") {
						userValue = "empty";
					}
					if (userValue === databaseValue) {
						scores++;
						correct = "true";
					} else {
						correct = "false";
					}
					studentAnswers.push({ 
        				"question" : questions[i].question,
        				"userAnswer" : userValue,
        				"correct"  : correct
    				});
                    i++;
                }
            }
            console.log("Exam completed, points: " + scores);
            // Adding scores to database
            var students = db.collection('students');
            students.update({
                _id: parseInt(req.user._id)
            }, {
                $set: {
                	endDate: new Date(),
                    answer_sent: "true",
                    result: scores,
                    student_answers: studentAnswers
                }
            }, function(err, result) {
                if (err) {
					console.log(err);
					res.json({succesful: false});
				}
				else if (result) {
					console.log("Added scores and student answer data to student document!");
					req.logout();
					res.redirect('/complete');
				}
				else if (!result) {
					console.log("Couldn't find a student with that id.");
					res.json({succesful: false});
				}
            });
        });
    });
    /* POST /delete_question */
    app.post('/delete_question', isAuthenticated, loginGroup('admin'), function(req, res) {
        var id = parseInt(req.body._id);
        var questions = db.collection('questions');
        questions.remove({
            _id: id
        }, function(err, result) {
            if (err) {
                console.log(err);
                res.json({
                    succesful: false
                });
            } else if (result) {
                console.log("Deleted the question!");
                res.json({
                    succesful: true
                });
            } else if (!result) {
                console.log("Couldn't find requested question.")
                res.json({
                    succesful: false
                });
            }
        });
    });
    // POST /edit_question
    app.post('/edit_question', isAuthenticated, loginGroup('admin'), function(req, res) {
        var id = parseInt(req.body._id);
        var _question = String(req.body.question);
        var _answer = String(req.body.answer);
        if (_answer == "Oikein ") _answer = "true";
        else if (_answer == "Väärin ") _answer = "false";
        else res.json({
            succesful: false
        });
        var questions = db.collection('questions');
        questions.update({
            _id: id
        }, {
            question: _question,
            answer: _answer,
        }, function(err, result) {
            if (err) {
                console.log(err);
                res.json({
                    succesful: false
                });
            } else if (result) {
                console.log("Updated the question!");
                res.json({
                    succesful: true
                });
            } else if (!result) {
                console.log("Couldn't find a question with that id.")
                res.json({
                    succesful: false
                });
            }
        });
    });
    // POST /add_question
    app.post('/add_question', isAuthenticated, loginGroup('admin'), function(req, res) {
        var _question = String(req.body.question);
        var _answer = String(req.body.answer);
        if (_answer == "Oikein ") _answer = "true";
        else if (_answer == "Väärin ") _answer = "false";
        else res.json({
            succesful: false
        });
        autoIncrement.getNextSequence(db, "questions", function(err, autoIndex) {
            var questions = db.collection('questions');
            console.log("Adding question with autoIndex ID : " + autoIndex);
            questions.insert({
                _id: autoIndex,
                question: _question,
                answer: _answer,
            }, function(err, result) {
                if (err) {
                    console.log(err);
                    res.json({
                        succesful: false
                    });
                } else if (result) {
                    console.log("Added!");
                    res.json({
                        succesful: true
                    });
                } else if (!result) {
                    console.log("Couldn't add question.")
                    res.json({
                        succesful: false
                    });
                }
            });
        });
    });
    // POST /studentsignup
    app.post('/studentsignup', isAuthenticated, loginGroup('user'), function(req, res) {
        // student's personal data
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
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
                email: email,
                answer_sent: "false",
                id_check: "false",
                examid: examid,
                result: "",
                group: loginGroup
            });
            students.insert(student, function(err, result) {
                if (err) {
                    console.log(err);
                    res.json({
                        succesful: false
                    });
                } else if (result) {
                    console.log("Student added!");
                    req.logout();
                    req.login(student, function(err) {
                        if (err) {
                            return next(err);
                        }
                        res.redirect('/exam');
                    });
                } else if (!result) {
                    console.log("Couldn't add student.")
                    res.json({
                        succesful: false
                    });
                }
            });
        });
    });
    var server = app.listen(3000, function() {
        var host = server.address().address;
        var port = server.address().port;
        console.log('Anniskelupassi: app listening at http://%s:%s', host, port);
    });
});