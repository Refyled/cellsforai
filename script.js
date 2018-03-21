console.log('ready');



let playing = false;

	//la partie socket
	const domain = 'http://localhost:3000';

	var connectionOptions =  {
		"force new connection" : true,
    "reconnectionAttempts": "Infinity", //avoid having user reconnect manually in order to prevent dead clients after a server restart
    "timeout" : 10000, //before connect_error and connect_timeout are emitted.
    "transports" : ["websocket"]
};

const socket = io(domain,connectionOptions);
socket.on("state",function(data){
	dataArray.push(dataPrepare(data));
	if (playing == false && dataArray.length>1){
		playing = true;
		beginTime = new Date().getTime();
		draw();
	}
});

socket.on("roomSettings",function(data){
	console.log('room settings recus');
	par.size = data.size;
	roomSettings = data;
});

socket.on("players",function(data){
	console.log('list of players recu');
	console.log(data);
	par.players = ['o'].concat(data);

	var liste = document.getElementById('playersList');

	liste.innerHTML = (par.players).reduce(function(acc,player,i){return acc+'<p style=\"color:'+ colorsArray[i].slice(0,-1) + ');\">' + player + '</p>'},'');
});

//s'identifier comme view
socket.emit('view', 'coucou JE SUIS UNE VIEW');


//initialiser les valeurs
let dataArray = [];
let roomSettings = {};
let par={
	size:10,
	players:['o']
};

//initialiser le canva
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

//parametres d'affichage et couleurs
//les couleurs, par players
const colorsArray = ['rgba(40, 50, 40,','rgba(198, 34, 5,','rgba(1, 69, 106,','rgba(1, 112, 110,'],'rgba(200, 110, 110,','rgba(80, 240, 97,','rgba(76, 112, 220,','rgba(10, 10, 200,';

const textColor = '#cee6d8';
const ligneStyle = {
	lineWidth:1,
	strokeStyle:'rgba(200, 200, 200,0.2 )'
}
let canSize = 600;
let showWeight = true;
let transparency = true;

const initMaxG = 0.9
const initMinG = 0.4;

// le poid max pour les gradient
let maxW = 10;
// le gradient minimum pour un poid de 1
let minG = initMinG;
//le gradient maximum pour le poid max
let maxG = initMaxG;



//mets la couleur correcte, les mouvements en toX et toY
function dataPrepare(data){
	console.log(par.players);
	let preparedData = data;
	preparedData.descriptif = preparedData.descriptif.map(function(cell){

		cell.fillStyle = colorsArray[par.players.indexOf(cell.player)];

		cell.toX = 0;
		cell.toY = 0;
		if (cell.move == 'd'){
			cell.toY = 1
		}
		if (cell.move == 'r'){
			cell.toX = 1
		}
		if (cell.move == 'u'){
			cell.toY = -1
		}
		if (cell.move == 'l'){
			cell.toX = -1
		}
		return cell;
	})
	return preparedData;
}

/*
//test
dataArray = [
	{descriptif : 
		[{fillStyle: "rgba(255, 50.5, 50,",
								move: "r",
								player: "o",
								toWeight: 0,
								toWeight2: 1,
								toX: 0,
								toY: 0,
								weight: 0,
								x: 1,
								y: 1},
		{fillStyle: "rgba(50, 50, 255,",
								move: "l",
								player: "o",
								toWeight: 2,
								toWeight2: 2,
								toX: -1,
								toY: 0,
								weight: 1,
								x: 3,
								y: 2}],
	time:2000},
	{descriptif : 
		[{fillStyle: "rgba(190, 50, 50,",
								move: "l",
								player: "o",
								toWeight: 1,
								toWeight2: 1,
								toX: -1,
								toY: 0,
								weight: 1,
								x: 3,
								y: 2}],
	time:2000}
]

*/

let beginTime=new Date().getTime();

function draw(){
	let size = par.size;

	var ctx = document.getElementById('canvas').getContext('2d');
	//ctx.globalCompositeOperation = 'source-over';

	let cellSize = canSize/size;
	let currentData = dataArray[0];

	// effacer le canvas
	ctx.clearRect(0,0,canSize,canSize); 
	ctx.strokeStyle = ligneStyle.strokeStyle;
	ctx.lineWidth = ligneStyle.lineWidth;
  	//dessiner les lignes verticales
  	for (var i = 0; i <= size+1; i++) {
  		ctx.beginPath();
  		ctx.moveTo(i * cellSize, 0);
  		ctx.lineTo(i * cellSize, canSize);
  		ctx.stroke();
  	}
    //dessiner les lignes horizontales
    for (var i = 0; i <= size+1; i++) {
    	ctx.beginPath();
    	ctx.moveTo(0,i * cellSize);
    	ctx.lineTo(canSize,i * cellSize);
    	ctx.stroke();
    }

	//proprtion d'avancée dans le coup actuel
	let proportion = (new Date().getTime() - beginTime)/currentData.time;

	function drawCell(cell){
		let gradient = Math.min(1,(cell.weight/maxW)*(maxG-minG)+minG);
		//si c'est une nouvelle vitamine
		if (cell.weight == 0 && cell.toWeight2 == 1){gradient=proportion*maxG}

			ctx.fillStyle = ''+ cell.fillStyle + gradient + ')';
		ctx.fillRect((cell.x+cell.toX*proportion)*cellSize,(cell.y+cell.toY*proportion)*cellSize,cellSize,cellSize);
		if (showWeight == true){

			ctx.fillStyle=textColor;
			ctx.textAlign="center";
			ctx.fillText(cell.weight,(cell.x+cell.toX*proportion)*cellSize+cellSize/2,(cell.y+cell.toY*proportion)*cellSize+cellSize/2);
		}

	}


	//on dessine les cells morte en cross, si on est a moins de la moitié
	if (proportion<=0.5)
		{(currentData.descriptif.filter(function(cell){return (cell.toWeight==0 && cell.weight>0)} )).map(function(cell){drawCell(cell)});}

	//on dessine les cells morte a l'arrivée
	(currentData.descriptif.filter(function(cell){return (cell.toWeight!=0 && cell.toWeight2 == 0)} )).map(function(cell){drawCell(cell)});

	//on dessine les cells vivantes
	(currentData.descriptif.filter(function(cell){return (cell.toWeight2>0)} )).map(function(cell){drawCell(cell)});


	

	

	function nextMove(){
		console.log('nextMove');

		dataArray = dataArray.slice(1);



		beginTime = new Date().getTime();

	}

	if (proportion>1){nextMove()}

		if (playing==true){

		window.requestAnimationFrame(draw);
		}
}

