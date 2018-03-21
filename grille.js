//afficher
const verboLevel=1;
function verb(texte, lvl = 2){
	  if (lvl <= verboLevel){ console.log(texte)}
}

//constructeur de grille
function Grid(size){

	this.size = size;
	this.content = [];

	//constructeur de cell
	function Cell(x,y,player, weight, move = ['o'],toWeight,toWeight2){
		this.player=player;
		this.weight=weight;
		this.x=x;
		this.y=y;
		this.move=move;
		if (!toWeight){this.toWeight = weight;}
		else{this.toWeight=toWeight}
		if (!toWeight2){this.toWeight2 = weight;}
		else{this.toWeight2=toWeight2}
		
	}
	
	//méthode retournant une cellule ayant bougé (mvt indiv)
	Cell.prototype.moved = function(step = 1){

		if (this.move == 'u'){this.y-=step}
		if (this.move == 'd'){this.y+=step}
		if (this.move == 'r'){this.x+=step}
		if (this.move == 'l'){this.x-=step}
		return this;
	}
	Cell.prototype.moveResult = function(step = 1){
		let x = this.x;
		let y = this.y
		if (this.move == 'u'){y=this.y-step}
		if (this.move == 'd'){y=this.y+step}
		if (this.move == 'r'){x=this.x+step}
		if (this.move == 'l'){x=this.x-step}

		return {x:x,y:y};
	}
	//pour ces setters et accessers, l etape 1 est le changement au cours de cross over
	// l etape 2 est le changement a l arrivee sur la case de destination
	Cell.prototype.changeToWeight = function(toWeight,etape){
		if (etape == 1) {this.toWeight = toWeight}
		if (etape == 2) {this.toWeight2 = toWeight}
		return this;
	}
	Cell.prototype.getWeight = function(etape){
		if (etape == 1) {return this.weight}
		if (etape == 2) {return this.toWeight}
	}


	
	//ajoute une cell
	this.addCell = function(x,y,player,weight, move =['o']){

		this.content.push(new Cell(x,y,player,weight, move));
	}

	// add move sous la forme : gr.addMove(0,'player1',['u','d'])
	this.addMove = function (id, player, move){
		
			if (move.length < 1) {
				return;
			}
		
		verb('adding a move');
		verb('player : ' + player);
		verb('id : ' + id);
		verb('move : ' + move);
		let size = this.size;
		function checkWalls(moves, x, y){
			let tempMoves = moves;
			for (k=0; k<= moves.length-1;k++){
				if (moves[k] == 'u' && y == 0)
					{tempMoves = ['o'];verb('coup a l exterieur de la grille'),1}
				else if (moves[k] == 'l' && x == 0)
					{tempMoves = ['o'];verb('coup a l exterieur de la grille'),1}
				else if (moves[k] == 'd' && y == size-1)
					{tempMoves = ['o'];verb('coup a l exterieur de la grille'),1}
				else if (moves[k] == 'r' && x == size-1)
					{tempMoves = ['o'];verb('coup a l exterieur de la grille'),1}
			}
			verb(tempMoves);
			return tempMoves;
		}

		let target = this.content[id];
		if (0<=id && id <= this.content.length-1){
			target.move = (target.player == player ? checkWalls(move, target.x, target.y) : target.move)
		}
	}

	//add array de moves sous la forme gr.addMoves('player1',[{id : 0, move:['u','d']},{id : 1, move:['o','d']}]);
		this.addMoves = function (Theplayer, moves){
		verb('adding an array of moves');
		for (let move of moves){
			this.addMove(move.id, Theplayer, move.move)
		}
	}
	
	this.update = function (numberOfVitamins){
		
	
		//retourne un tableau avec les cells séparées ayant leurs mouvements unitaires
		function moveDem (grilleInit){
			let interm1 = [];
			for (let cellInit of grilleInit){
				let newWeight = Math.floor(cellInit.weight/cellInit.move.length);
				if (newWeight>0){
					for (let indivMove of cellInit.move){
							interm1.push(new Cell(cellInit.x,cellInit.y,cellInit.player,newWeight,indivMove))
					}
				} else {
					interm1.push(new Cell(cellInit.x,cellInit.y,cellInit.player,cellInit.weight,'o'))
				}
			}

			return interm1;
		}

		//parcourt une grille de cells, retourne la grille de cells, avec toWeights ou toWeights2 modifiés 
		
		//admet un array de cells qui doivent fusioner en argument, 
		//renvoie un array de cells avec toWeight modifié
		//etape 1 si croisement
		//etape 2 si sur même case finale
		function consolider(etape, cellsArrayTotal){

			let cellsArray = cellsArrayTotal.filter(function(cell){return ( cell.player != 'o')});
	
			let maxWeight = Math.max(...cellsArray.map(function (cell){return cell.getWeight(etape)}));
			let largestCellsArray = cellsArray.filter(function(cell){return (cell.getWeight(etape)==maxWeight)});
			//choisir une parmi les plus grosses
			let indexSurvivante = Math.floor(Math.random()*largestCellsArray.length);
			//mettre le newWeight à 0 pour les mortes, au total pour la survivante
			let totalWeight = cellsArrayTotal.reduce(function(current, cell){return current+cell.getWeight(etape)},0);

			largestCellsArray.map(function(cell,i){return (i==indexSurvivante ? cell.changeToWeight(totalWeight, etape) : cell.changeToWeight(0, etape))});
			//créé le tableau des plus petites, mets leur poids à 0;
			let smallerCellsArray = cellsArray.filter(function(cell){return (cell.getWeight(etape)<maxWeight )}).map(function(cell2){return cell2.changeToWeight(0, etape)});
			
			let vitaminsArray = cellsArrayTotal.filter(function(cell){return ( cell.player == 'o')});
			if (maxWeight>0 && vitaminsArray[0]){vitaminsArray[0].toWeight2=0}


			return largestCellsArray.concat(smallerCellsArray).concat(vitaminsArray);
		}

		//renvoie une coordonnée unique, projection sur une seule dimmension des coords de la cell
		var size = this.size;
		const coord = function(cell){return (cell.x *2 * size *2 + cell.y * 2)}
		
		//ggroupBy generique
		function groupBy(theArray,key) {
	  		return theArray.reduce(function(rv, cell) {
	  		  (rv[key(cell)] = rv[key(cell)] || []).push(cell);
	    	return rv;
	  		}, []);
  		}
  		//fonction qui flatten un array d'array
   		function flatten(theArray){return theArray.reduce(function(prev, curr) {
  			return prev.concat(curr);
		},[]);}
  		 
  		  		//explications des étapes:

		//contient les cells séparées
  		let interm1 = moveDem(this.content);
  	//	verb('interm1');
  	//	verb(interm1);
  		//contient un array avec les cells bougées de 0.5
  		let interm2 = interm1.map(function (cell){return cell.moved(0.5)});
  	//	verb('interm2');
  	//	verb(interm2);
  		//regroupe les cells par coordonnées (cross) dans un array d'array
  		let interm3 = groupBy(interm2, coord);
  	//	verb('interm3');
  	//	verb(interm3);
  		//consolide les fusions, et applatit
  		let interm4 = flatten(interm3.map(function(sousArray){return consolider(1,sousArray)}));
  		console.log('interm4');console.log(interm4);
  	//	verb('interm4');
  	//	verb(interm4);
  		//les bouges encore de 0.5, à leur position finale
  		let interm5 = interm4.map(function (cell){return cell.moved(0.5)});
	//	verb('interm5');
	//	verb(interm5);
		//regroupe les cells par coordonnées finales dans un array d'array
  		let interm6 = groupBy(interm5, coord);
  	//	verb('interm6');
  	//	verb(interm6);
  		//consolide les fusions, et applatit
  		let interm7 = flatten(interm6.map(function(sousArray){return consolider(2,sousArray)}));
  		console.log('interm7');console.log(interm7);
  	//	verb('interm7');
  	//	verb(interm7);
		
		let interm=interm7;
				/*

		//enchainement de la mort qui tue
		//interm contient les cells en position d'arrivée, poids 1 et 2 ajustés
  		
		let interm = flatten(groupBy(flatten(groupBy(moveDem(this.content).
			map(function (cell){return cell.moved(0.5)}), coord).
			map(function(sousArray){return consolider(1,sousArray)})).
			map(function (cell){return cell.moved(0.5)}), coord).
			map(function(sousArray){return consolider(2,sousArray)}));
		*/


		//l'array de vitamins nouvelles
		let vitaminsArray = vitamins(interm,numberOfVitamins,size);

		let interm8 = interm7.concat(vitaminsArray);

		//le descriptif, cells en positions initiales, poids ajustés;


		let descriptif = interm8.map(function (cell){let newCell = new Cell((cell.moveResult(-1)).x,(cell.moveResult(-1)).y,cell.player,cell.weight,cell.move);newCell.toWeight=cell.toWeight;newCell.toWeight2=cell.toWeight2;return newCell})
	
		//endResultInterm : cells en positions finales, vivantes uniquement.
//		let endResultInterm = interm2.filter(function (cell){return (cell.moved(1).toWeight2 != 0)});
		let endResultInterm = interm8.filter(function (cell){return (cell.toWeight2 > 0)});
		let endResult = endResultInterm.map(function(newCell){
			newCell.move=['o'];newCell.weight=newCell.toWeight2;newCell.toWeight=newCell.weight; return newCell})
			//	verb('descriptif');
			//	verb(descriptif);
	
		this.content = endResult;


		//mettre les vitamines : la méthode permet d'en mettre autant que de cases libres (assez fier d'ailleurs)
		//renvoie l'array de nouvelles vitamines
		function vitamins(currentGrid,numberOfVitamins,size){
				
				const coord2 = function(cell){
					return (cell.x *(size) + cell.y )
				}
				//créé vitamines a partir de coord2
					const uncoord2 = function(coord){
					let x = Math.floor(coord/(size));
					let y = (coord % size);
					return new Cell(x,y,'o',0,'o',0,1)
				}

			let vitaminsAdded = 0;
			let nombreDeVitaminesActuelles = (currentGrid.filter(function(cell){return (cell.player == 'o')})).length;
			let flatGrid = groupBy(currentGrid,coord2);
			
			for (let i=0;i<(numberOfVitamins-nombreDeVitaminesActuelles);i++){
				let numberOfEmptySpaces = (size)*(size)-flatGrid.filter(function (){return true}).length;
				if (numberOfEmptySpaces<1){break;}
				let step = Math.floor((numberOfEmptySpaces)*Math.random());
				let compteurTotal=0;
				let compteurDeCasesVides=0;
				while (compteurDeCasesVides<=step){
					if (!flatGrid[compteurTotal])
						{compteurDeCasesVides++}
					compteurTotal++;
				}

				flatGrid[compteurTotal-1]=uncoord2(compteurTotal-1);
				vitaminsAdded++;
				verb('VITAMINS ADDED : ' + vitaminsAdded);
			}//uniquement celles qui n'étaient pas là au départ : les nouvelles
		
			return (flatten(flatGrid)).filter(function(cell){return (cell.weight==0)});
		}



		
		return descriptif;
	}

	this.getState = function(){
		return this.content.map(function(cell,indice){return {id:indice,x:cell.x,y:cell.y,player:cell.player,weight:cell.weight}})
	}
	//place les positions initiales ; un peu du bricolage mais fonctionne bien
	this.init = function (players = ['player1','player2'] , weight = 5){
		const numberOfPlayers = players.length;
		const border = Math.floor(this.size/(numberOfPlayers+1));
		const longueur = this.size - (2*border)+2;
		const espacement = Math.floor ((longueur * 4 - 4 )/numberOfPlayers);
		let playCompt = 0;
		let compteur = espacement;
		let a = border - 1;
		let b = border - 1;
		let cellsToAdd = [];
		//juste pour éviter répétitions.. 
		function testIfAdd(){
			if (compteur == espacement){
				cellsToAdd.push( new Cell(a,b,players[playCompt],weight));
				//cteBordel.addCell(a,b,players[playCompt],weight);
				compteur = 0;
				playCompt++;
			}
		};
		for (let i = 2 ; i<= longueur ; i++){
			testIfAdd();
			a++;
			compteur ++;
		}
		for (let i = 2 ; i<= longueur; i++){
			testIfAdd();
			b++;
			compteur ++;
		}
		for (let i = 2 ; i<= longueur; i++){
			testIfAdd();
			a--;
			compteur ++;
		}
		for (let i = 2 ; i<= longueur - 1; i++){
			testIfAdd();
			b--;
			compteur ++;
		}

		let tempAccess = this.content;
		cellsToAdd.map(function(cell){tempAccess.push(cell)});

	}
	

}


module.exports = Grid;