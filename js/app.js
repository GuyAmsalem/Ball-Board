var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var PASSAGE = 'PASSAGE';
var STICK = 'STICK';

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var STICK_IMG =  '<img src="img/candy.png" />';
var CLLECTING_BALL_SOUND = new Audio('sound/collect.wav');

var gBoard;
var gGamerPos;
var gBallsCollected = 0;
var gBallsCreated = 2;
var gBallsInterval;
var gStickInterval;
var isStick = false;
function initGame() {
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);
	addBalls();
	addSticks();
}


function buildBoard() {
	// Create the Matrix
	// var board = createMat(10, 12)
	var board = new Array(10);
	for (var i = 0; i < board.length; i++) {
		board[i] = new Array(12);
	}

	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}
			// Place passages
			if (i === 0 && j === 5 || i === 5 && j === 11 ||
				i === 9 && j === 5 || i === 5 && j === 0) {
				cell.type = FLOOR;
				cell.gameElement = PASSAGE;
			}


			// Add created cell to The game board
			board[i][j] = cell;
		}
	}

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;

	console.log(board);
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			//Changed to short if statement
			cellClass += (currCell.type === FLOOR) ? ' floor' : ' wall';

			//TODO - Change To ES6 template string
			strHTML += '\t<td class="cell ' + cellClass +
				'"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			// TODO - change to short if statement	
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			} else if (currCell.gameElement === STICK){
				strHTML += STICK_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}
	document.querySelector('.restart').classList.add('hidden');
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
	if (isStick) return;
	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {
		//If the target cell is one of the passages
		if (targetCell.gameElement === BALL) {
			CLLECTING_BALL_SOUND.play();
			gBallsCollected++;
			document.querySelector('.balls-colected').innerText = 'Balls: ' + gBallsCollected;
			if (gBallsCollected === gBallsCreated) {
				document.querySelector('.restart').hidden = false;
				document.querySelector('.win-game').hidden = false;
				clearInterval(gBallsInterval);
				clearInterval(gStickInterval);
			}
		}
		if (targetCell.gameElement === STICK) {
			isStick = true;
			setTimeout(() => {
				isStick = false;

			}, 3000);

		}

		// MOVING from current position
		// Model:
		if (gBoard[gGamerPos.i][gGamerPos.j].gameElement === PASSAGE) {
			gBoard[gGamerPos.i][gGamerPos.j].gameElement = PASSAGE;
		} else {
			gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		}
		// Dom:
		renderCell(gGamerPos, '');
		if (targetCell.gameElement === PASSAGE) {
			switch (i) {
				case 0:
					gGamerPos.i = 8;
					gGamerPos.j = 5;
					break;
				case 9:
					gGamerPos.i = 1;
					gGamerPos.j = 5;
					break;
				case (5):
					if (j === 0) {
						gGamerPos.i = 5;
						gGamerPos.j = 10;
					} else {
						gGamerPos.i = 5;
						gGamerPos.j = 1;
					}
					break;
			}
		} else {

			// MOVING to selected position
			// Model:
			gGamerPos.i = i;
			gGamerPos.j = j;
		}
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);
	} // else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;


	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;

	}

}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

function addBalls() {
	gBallsInterval = setInterval(function () {
		var cell = getRndEmptyCell();
		cell.gameElement = BALL;
		gBallsCreated++;
		renderBoard(gBoard);
	}, 5000);
}

function addSticks() {
	console.log('here');
	
	gStickInterval = setInterval(function () {
		var cell = getRndEmptyCell();
		cell.gameElement = STICK;
		renderBoard(gBoard);
		setTimeout(() => {

			cell.gameElement = (cell.gameElement = GAMER)? GAMER : null;
			renderBoard(gBoard);
		}, 3000);

	}, 5000);
}

function getRndEmptyCell() {
	var isValidPos = false
	while (!isValidPos) {
		var posI = getRandomIntInclusive(0, 9);
		var posJ = getRandomIntInclusive(0, 11);
		var coord = gBoard[posI][posJ];
		isValidPos = (coord.type === FLOOR && !coord.gameElement);
	}
	return coord;
}

function restartGame() {
	gBallsCollected = 0;
	gBallsCreated = 2;
	initGame();
}

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}