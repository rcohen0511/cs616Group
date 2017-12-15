

var host = 'localhost';
var user = 'root';
var database = 'db';
var password = '123456';

var mysqlSync = require('sync-mysql');
var conSync = new mysqlSync({
	host: host,
	user: user,
	database: database,
	password: password
});


// ================================================================
// Setup HTTP Server and App parser 
// ================================================================
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var app = require('express')();
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use('/static', express.static('assets'))
http.createServer(app).listen(process.env.PORT || 3000, function () {
	console.log("Express server listening on port 3000");
});

app.get('/', function (req, res) {
	displayForm(res);
});

app.post('/', function (req, res) {
	setTimeout(function(){
		formSubmission(req, res);
		console.log('User Submitted Data');
	},1100);
})

app.get('/end', function (req, res) {
	getEnd(res, result);
});


// ================================================================
// jQuery Form
// ================================================================
var fs = require('fs');
var formidable = require("formidable");
var util = require('util');
var port = process.env.PORT || 3000;
var result;

function displayForm(res) {
	fs.readFile('index.html', function (err, data) {
		res.writeHead(200, {
			'Content-Type': 'text/html',
			'Content-Length': data.length
		});
		res.write(data);
		res.end();
	});
};

function formSubmission(req, res) {
	// Setting up Form
	var values = [];
	var fields = [];
	var form = new formidable.IncomingForm();
	form.on('field', function (field, value) {
		fields[field] = value;
		values.push(value);
	});
	form.on('end', function () {
		res.redirect('/end');
		res.end(util.inspect({
			fields: fields
		}));
		result = checkUser(values);
	});
	form.parse(req);
}

function checkUser(data) {
	var results = conSync.query('select * from userpass where username = ?', [data[0]]);

	if(results[0] == null){
		return "User not found"
	}

	if (results[0].password == data[1]){
		result = 'password is correct'
	} else {
		result = 'password is false'
	}
	console.log(result);
	return result;
}

function getEnd(res, result) {
	var fs = require('fs');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    var html = fs.readFileSync(__dirname + '/end.html', 'utf8');
    var message = 'Hello world...';
    html = html.replace('{Message}', result);
    res.end(html);
}

