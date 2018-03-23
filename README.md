# CellsForAI

A game to be played by AI

-----------------------------

## Rules

Different players can fight on a grid, each controling his cells.

**Cells** - represented by squares on that grid - have a **weight** and can **move** in either direction,  stay where they are, or move in **multiple directions**. In case of multiple directions, they will be divided into multiple cells going in those directions, each having a weight that is the floored result of the division of the original weight.

When two cells cross or end up on the same square, merge. The one with the greatest weight absorbs the smaller ones, adding their weights to its own.

**Vitamins** are added and randomly placed on the grid at each turn. Those have a weight of one and can be eaten by any cell coming on their position.

---------------------------

## How To Play

----------------------------


### Install

Clone the git repository with

		

	$ git clone https://github.com/ElJew/cellsforai


Simply install while in the newly created directory with 

	npm install

----------------------------


### Start server

Your server is already good to go. Just start it with 

	node app.js

If you want to have the server running continuously, you probably should check for the _forever_ package and do :

	npm  install forever -g
	forever start app.js

#### Change domain

By default the server runs on localhost:3000; If you wanna change that to make it accesible over the internet, you'd need to change the _domain_ constant in _script.js_ to you desired address and port. Change the _port_ constant in _app.js_ if needed.

### Communication with players

An example of a fully functional player can be found on git at https://github.com/ElJew/randomplayercellsforai (or npm as _randomcellforaiplayer_ ). You should probably download it and try it out.


Just changing the makeMove function is the way to go.

#### Details

Basically the communication with the players is socket based, using _socket.io _ package

messages to be emitted by the player are of the following kind :

+ _playerID_ : having the player's name as content. If 'default' is sent, the server will automatically attribute a name to the player.
+ _move_ : shall contain an object of the following type (note move can be partial):
		{player:<playername>,move:<moveArray>}

messages received by the player are of the following kind :

+ _playerID_ : having our name as data. relevant only if we sent 'default' previously as a name.
+ _state_ : marks the beginning of a new turn and states the current position on the grid, stored as an array of cells, each being an object ressembling this :

	{	id:<id>,
		x:<x>,
		y:<y>,
		player:<player's name>,
		weight:<weight>}


The game will start as soon as the correct number of players are connected


----------------------------


### Watching the game

Using any modern browers, just open the chosen domain address and port. (by default, navigate to localhost:3000)

Note that a sliding pannel can be toogled to change the appearance

Of course custom view can be implemented. Just mimic the socket part of the _script.js_ file

### Changing the room settings

On a view from a browser, access the side pannel and modify the default settings. Clicking the 'fire' button will reset the game with the desired settings.

Of course custom settings changers can be implemented. Just mimic the sidebar.js socket behavior.


----------------------------






