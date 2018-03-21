#!/usr/bin/env node

const port = 3000;
let defaultRoom = {
	size			:50,
	numberOfPlayers: 1,
	weight         :50,
	timer          :1000,
	numberOfVitamins:25
}

const express = require('express');  
const app = express();  
const server = require('http').createServer(app);  

app.use(express.static(__dirname + '/node_modules'));  
app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/index.html');
});
app.get('/style.css', function(req, res,next) {  
    res.sendFile(__dirname + '/style.css');
});
app.get('/script.js', function(req, res,next) {  
    res.sendFile(__dirname + '/script.js');
});
app.get('/sidebar.js', function(req, res,next) {  
    res.sendFile(__dirname + '/sidebar.js');
});

// Chargement de socket.io
const io = require('socket.io').listen(server);
//Allow Cross Domain Requests
//io.set('transports', [ 'websocket' ]);

io.on('connection', function(socket){
	console.log('someone just connected');
	//si un player s'identifie, on le met dans la room
	socket.on('playerID', function(alias) {
        room.add({alias:alias,socket:socket});
        socket.join('playersRoom');
    });

	socket.on('move', function(data) {
		room.addMove(data.player,data.move)
    });

   socket.on('new', function(data) {
    	room.stop();
		defaultRoom=data;
		room = new Room;

    });

     socket.on('view', function(message) {
        socket.join('viewersRoom');
        console.log(message);
    io.to(socket.id).emit('roomSettings', defaultRoom);
	io.to('viewersRoom').emit('players',room.getAliases());
	console.log('list of players sent');
    });
});

const Grid = require('./grille');

function Room(){
	//let that=this;
	this.players = [];
	this.getAliases = function(){return this.players.map(function(player){return player.alias})}

	this.numberOfVitamins = defaultRoom.numberOfVitamins;
	this.size = defaultRoom.size;
	this.weight = defaultRoom.weight;
	this.grid=0;
	this.descriptif=0;
	this.timer = defaultRoom.timer;
	this.numberOfPlayers = defaultRoom.numberOfPlayers;
	//add a player to the room
	this.add = function(ID){
		if (ID.alias == 'default'){
			ID.alias = 'player' + (this.players.length+1)}
		if (this.players.every(function(player){return (player.alias != ID.alias)})){
				this.players.push(ID);
		}
		
		console.log(ID.alias +' just connected');
		io.to(ID.socket.id).emit('handshake', ID.alias);
		io.to(ID.socket.id).emit('roomSettings', defaultRoom);
		io.to('viewersRoom').emit('players',this.getAliases());

		console.log('handshaked and settings sent');

		if (this.players.length==this.numberOfPlayers){
			this.start();
		}

	}
	//starts the room
	this.start = function (){
		console.log('starting to play');
		if (this.grid == 0){
			this.init();
		}
		io.to('viewersRoom').emit('roomSettings', defaultRoom);
		io.to('viewersRoom').emit('players',room.getAliases());

		this.timeLastSent = (new Date()).getTime();
		this.move(this);
	}
	//initialise la room
	this.init = function(){
		this.grid = new Grid(defaultRoom.size);
		this.grid.init(this.players.map(function(player){return player.alias}),this.weight)
		this.moveTimer = null;
		this.timeLastSent = null;
		this.newTimeSent = null;
	}

	this.moveTimer = null;
	this.timeLastSent = null;
	this.newTimeSent = null;
	//make move
	this.move = function(){
		console.log('------------');
		this.descriptif=this.grid.update(this.numberOfVitamins);
		io.to('playersRoom').emit('state',this.grid.getState());
		this.newTimeSent = (new Date()).getTime();
		io.to('viewersRoom').emit('state',{descriptif:this.descriptif, time:(this.newTimeSent-this.timeLastSent)});

		this.timeLastSent = (new Date()).getTime();

		if (this.timer){
			let that=this;
			this.moveTimer = setTimeout(function(){that.move()},this.timer)
		}
	}

	//add move
	this.playerWhoSentTheirMoves = [];
	this.addMove = function(Theplayer, moves){
		this.grid.addMoves(Theplayer, moves);
		if (this.playerWhoSentTheirMoves.every(function(player){return (player != Theplayer)})){
				this.playerWhoSentTheirMoves.push(Theplayer);
		}
		if (this.timer == 0 && this.playerWhoSentTheirMoves.length){
			this.playerWhoSentTheirMoves=[];
			this.move();
		}
	}

	this.stop = function(){
		this.addMove=function(){};
		this.move=function(){};
		clearTimeout(this.moveTimer);
	}



}

let room = new Room();


//const test = setInterval(testFunc,1000)

server.listen(port, () => console.log('Cells Server is listening on port ' + port));