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
  console.log(req.url);
  if (req.url.match('test_close.html')) {
  	res.setHeader('Connection', 'close');
  }
  serve(req, res, done);
});

server.listen(port);

var io = require('socket.io').listen(server);
var count = 0;
io.sockets.on('connection', function (socket) {

	socket.emit('test');

	socket.on('message', function (data) {
		console.log('message: ' + data);
	});
	socket.on('test', function () {
		console.log('test message');
		socket.emit('test', { test: 'test ' + count });
		count++;
	});

});

console.log('Listen port: ' + port);
