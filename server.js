var httpServer = require('http-server'),
		socket = require('socket.io'),
		colors = require('colors');
		


/*** Client class ****/

function Client(socket){
	this.name = "";
	this.socket = socket;	
}

Client.prototype.sendMessage = function(message){
	this.socket.emit('message',message);	
}
Client.prototype.addEventListeners = function(webserver){
	var self=this;

	this.socket.on('disconnect',function(){
		for(var k=0;k<webserver.clients.length;k++){
			if(webserver.clients[k].socket.id===self.socket.id){
				webserver.clients.splice(k,1);
				break;
			}
		}
		console.log('bye bye '.yellow+self.name);
	});
	this.socket.on('setName',function(name){
			
		// we received the name so we can store it and say hello !	
		self.name = name;
		
		//for the record (server log)
		console.log('new client '.cyan+self.name);
		//say welcome to the new client
		self.sendMessage("welcome dear "+self.name);
		//notify everyone else
		self.socket.broadcast.emit("message","say hello to our new friend "+self.name);
	});
}


/*** WebServer class ***/
    
function WebServer(){
		
	
	this.port = 8080;
	this.root = __dirname + '/www';
	this.refreshStatusPeriod = 1000;
	this.clients = new Array();
	
	//this.refreshStatusId = null;

	//this.eventEmitter = new events.EventEmitter();
	
}

WebServer.prototype.start = function(){
	
	// create the http server object
	this.server = httpServer.createServer({
		root: this.root,
		headers: {
		  'Access-Control-Allow-Origin': '*',
		  'Access-Control-Allow-Credentials': 'true'
		}
	  });
	
	// start the socket.io
	io = socket.listen(this.server.server);
	
	// start the server
	this.server.listen(this.port);
	
	// add event listerner for new connection
	io.sockets.on('connection',onSocketConnection);	
	
	
	var self = this;
	function onSocketConnection(socket){
		
		// create a new client on the client list
		var client = new Client(socket);
		// add event listeners
		client.addEventListeners(self);
		// push the freshly created client into the client list
		self.clients.push(client);

	}
	
	/*this.refreshStatusId = setInterval(function(){
		self.eventEmitter.emit('getStatus');	
	},this.refreshStatusPeriod);*/
	
	console.log('[WebServer]'.green+' started on port '+this.port);
}

WebServer.prototype.stop = function(){
	
	//clearInterval(this.refreshStatusId);
	
	// disconnect every client of the list
	this.clients.forEach(function(client){
			client.socket.disconnect();
	});
	
	if (this.server !== undefined) this.server.close();
	console.log('[WebServer] '.red+'stoped');	
}

WebServer.prototype.sendPlayerStatus = function(status){
	this.clients.forEach(function(client){
			client.sendPlayerStatus(status);
	});
}

/**** what we do on launch *****/

var server = new WebServer();
server.start();
