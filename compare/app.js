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
  if (req.url.match('test_close.html')) {
  	res.setHeader('Connection', 'close');
  }
  //serve(req, res, done);
});

var WebSocketServer = require('websocket').server;
var wsServer = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: true
});
var res = [];
for(var i in wsServer){
	res.push(i);
}
console.log(res.join(', '));
wsServer.on('message', function(){
	console.log('wtf');
});
wsServer.addListener('request', function(request) {
	console.log('request');

    request.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            request.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            request.sendBytes(message.binaryData);
        }
    });
    request.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

server.listen(port);
console.log('Listen port: ' + port);
