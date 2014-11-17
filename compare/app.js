'use strict';
/* global require, __dirname, console */

var 
	http = require('http'),
	serveStatic = require('serve-static'),
	base_folder = '/public',
	finalhandler = require('finalhandler'),
	port = 23429
;

var serve = serveStatic(__dirname + base_folder);

var server = http.createServer(function(req, res){
  var done = finalhandler(req, res);
  serve(req, res, done);
});

server.listen(port);

var io = require('socket.io').listen(server);
var count = 0;
io.sockets.on('connection', function (socket) {

	socket.emit('test');

	socket.on('test', function () {
		socket.emit('test', { test: 'test ' + count });
		count++;
	});

});

console.log('Listen port: ' + port);
