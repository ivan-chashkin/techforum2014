var 
	connect = require('connect')
	, base_folder = '/public'
	, port = 8080
;

var app = connect.createServer(
    connect.static(__dirname + base_folder)
).listen(port);

var io = require('socket.io').listen(app);
var count = 0;
io.sockets.on('connection', function (socket) {
	socket.emit('test');
	socket.on('test', function (data) {
		socket.emit('test', {test: 'test '+count});
		count++;
	});
});

console.log('Listen port: ' + port);
