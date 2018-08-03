require('dotenv').config();

var Promise = require('bluebird');
var mysql = require('mysql');
var Polly = require('./polly');
var request = require("request");

var oldTicketsArray = [];
var newTicketsArray = [];
var ticketsForAWS = [];

function getTicketsFromAPI() {
	oldTicketsArray.splice(0, oldTicketsArray.length);
	newTicketsArray.splice(0, newTicketsArray.length);
	ticketsForAWS.splice(0, ticketsForAWS.length);
	getTicketsFromDB();
	var options = { method: 'GET',
		url: `https://${process.env.API_ADDRESS}:443/api/tickets`,
 		qs: 
			{ 'agent_id[]': '6' },
		headers: 
			{ 'Postman-Token': '1d166e12-f388-42c2-b99d-6f77521d1316',
		  	'Cache-Control': 'no-cache',
		  	'X-DeskPRO-api_key': process.env.API_KEY } 
	};
	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		var obj = JSON.parse(body);
		for (const ticket in obj.tickets) {
			newTicketsArray.push(ticket);
		}
		console.log(newTicketsArray);
		for (var i = 0; i < newTicketsArray.length; i++) {
			console.log(newTicketsArray[i]);
			console.log(oldTicketsArray.indexOf(newTicketsArray[i]));
			if (oldTicketsArray.indexOf(newTicketsArray[i]) === -1) {
				ticketsForAWS.push(newTicketsArray[i]);
				writeTicketToDB(newTicketsArray[i]);
			}
		}
		console.log(ticketsForAWS);
		var offset = 0;
		ticketsForAWS.forEach(function(element) {
			setTimeout(function() {
				getName(obj.tickets[`${element}`].person.id);
			}, 3000 + offset);
			offset += 3000;
		});
	});
}

// https://github.com/mysqljs/mysql/issues/929
// https://stackoverflow.com/questions/28485032/how-to-promisify-a-mysql-function-using-bluebird
function getTicketsFromDB() {
	const connection = mysql.createConnection({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_DATABASE
	});
	const db = Promise.promisifyAll(connection);
	db.queryAsync("SELECT ticket_id FROM ticket_log WHERE tech_id = 6").then(function(rows){
		for (var i = 0; i < rows.length; i++) {
			oldTicketsArray.push(rows[i].ticket_id);
		}
		console.log(oldTicketsArray);
		connection.end();	
	});
}

function writeTicketToDB(ticketID) {
	const connection = mysql.createConnection({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_DATABASE
	});
	const db = Promise.promisifyAll(connection);
	db.queryAsync(`INSERT INTO ticket_log (tech_id, ticket_id) VALUES (6, '${ticketID}')`).then(function(){
		console.log(`Successfully wrote ticket #${ticketID} to ticket_log.`).then(function(){
			connection.end();
		});
	});
}

function getName(id) {
	var options = { method: 'GET',
		url: `https://${process.env.API_ADDRESS}:443/api/people/${id}`,
		headers: 
			{ 'Postman-Token': '02fcc78e-95b7-453d-a030-4be4ef26d9ce',
		  	'Cache-Control': 'no-cache',
		  	'X-DeskPRO-api_key': process.env.API_KEY } 
	};

	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		var obj = JSON.parse(body)
		console.log(obj.person.name);
		Polly.Speak(`Henry has a new ticket from ${obj.person.name}.`);
	});
}

Polly.Speak('Slater is on line.');

var timeLoop = 60000;
setInterval(function() {
	getTicketsFromAPI();
}, timeLoop);
