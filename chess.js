function Chess() {
  //Main Chess Game Class
  
  this.printBoard = function() {
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        var pos = this.getBoardPosition(i, j);
        el = document.getElementById(pos);
        el.innerHTML = (this.board[i][j].nickname || ' ');
        el.style.color = this.board[i][j].color;
      }
    }
  };

  this.getBoardPosition = function(y,x) {
    // returns the board position's name (a8, f5, etc)
    // yNames are only increased by 1
    var xNames = {0:'a', 1: 'b', 2: 'c', 3:'d', 4:'e', 5:'f', 6:'g', 7:'h'};
    return xNames[x] + String(y + 1);
  };

  this.getBoardCoordsFromBoardName = function(pos) {
    var xNames = {'a':0,'b':1,'c':2,'d':3,'e':4,'f':5,'g':6,'h':7};
    var j = Number(xNames[pos.slice(0,1)]);
    var i = (Number(pos.slice(1,2)) - 1);
    return [i,j];
  };

  this.getPieceFromBoardName = function(pos) {
    var xNames = {'a':0,'b':1,'c':2,'d':3,'e':4,'f':5,'g':6,'h':7};
    var j = Number(xNames[pos.slice(0,1)]);
    var i = (Number(pos.slice(1,2)) - 1);
    return this.board[i][j].name != undefined ? this.board[i][j] : 'empty';
  };

  this.getPieceFromCoords = function(y, x) {
    return this.getPieceFromBoardName(this.getBoardPosition(y,x));
  };

  this.selectPiece = function(elId) {
    // called from engine.js 
    // board square was clicked
    var piece, el, movePos = [], targetPiece = [], i;

    this.resetBoardBorderColors();
    piece = this.getPieceFromBoardName(elId);
    el = document.getElementById(elId);

    if (!this.isPieceSelected) {
      //TODO: check if piece is right color
      // Selecting a Piece 
      
      if (piece === 'empty') return;
      else {
        el.style.border = '2px solid green';
        this.showAvailableMoves(piece);
        if (this.availableMoves.length > 0) {
          this.isPieceSelected = true;
          this.selectedPiece = piece;
        }
      }  
    }
    else {
      // trying to move a piece or change selection
      for (i = 0; i < this.availableMoves.length; i++) {
        movePos.push(this.getBoardPosition(this.availableMoves[i][0][0], this.availableMoves[i][0][1]));
        targetPiece.push(this.availableMoves[i][1]);
      }
      var index = movePos.indexOf(elId);
      if (index !== -1) {
        // available move for selected piece;
        //TODO: determine if this is a special move (castle) -- this has to be handled differently by the movePiece function
        this.movePiece(this.selectedPiece, movePos[index], targetPiece[index]);
        this.isPieceSelected = false;
        this.availableMoves = [];
        this.selectedPiece = undefined;
      }
      else {
        // not an available move for selected piece
        this.isPieceSelected = false;
        this.availableMoves = [];
        if (this.selectedPiece.color == piece.color) {
          // changing selected piece
          this.selectPiece(elId);
        }
        else {
          this.selectedPiece = undefined;
        }      
      }
    }
  };

  this.movePiece = function(piece, newPos, targetPiece) {
    var oldPos = piece.pos,
        newPosCoords = this.getBoardCoordsFromBoardName(newPos);

    if (targetPiece !== undefined) {
      targetPiece.isInGame = false;
    }

    piece.pos = newPosCoords;
    this.board[oldPos[0]][oldPos[1]] = [];
    this.board[newPosCoords[0]][newPosCoords[1]] = piece;
    this.printBoard();
  };

  this.resetBoardBorderColors = function() {
    var table = document.getElementById('chess-board-table');
    for (var i = 0, row; row = table.rows[i]; i++) {
      for (var j = 0, cell; cell = row.cells[j]; j++) {
        document.getElementById(cell.id).style.border = '2px solid black';
      }
    }
  };

  this.showAvailableMoves = function(piece) {
    var availableMoves = this.getAvailableMoves(piece);
    this.availableMoves = availableMoves.slice(0);
    console.log(this.availableMoves);
    for (var i = 0; i < availableMoves.length; i++) {
      var boardName = this.getBoardPosition(availableMoves[i][0][0], availableMoves[i][0][1]);
      document.getElementById(boardName).style.border = '2px solid yellow';
    }
  };

  this.getAvailableMoves = function(piece) {
    var curPos = piece.pos.slice(0);
    var color = piece.color;
    var availableMoves = []; // [[[row,col], targetPiece], [[row,col], targetPiece]];
    var up, down, xMoves, yMoves, freq, move, potentialMove, moves, validation, i, j, iterationComplete;

    if (color == 'White') {
      up = 1,
      down = -1;
    }
    else {
      up = -1,
      down = 1;
    }

    xMoves = {'left': -1, 'right': 1};
    yMoves = {'up': up, 'down': down};

    for (i = 0; i < piece.moves.length; i++) {
      freq = piece.moves[i].split('_')[1];
      move = piece.moves[i].split('_')[0];
        if (freq == 'once') {
          potentialMove = curPos.slice(0);
          moves = move.split('-');
          for (j = 0; j < moves.length; j++) {
            if (moves[j] in xMoves) {
              potentialMove[1] += xMoves[moves[j]];
            }
            else {
              potentialMove[0] += yMoves[moves[j]];
            }          
          }
          validation = this.validateMove(potentialMove, curPos);
          if (validation.available) {
            availableMoves.push([potentialMove.slice(0), validation.targetPiece]);
          }
       }
       else if (freq == 'all') {
         moves = move.split('-');
         iterationComplete = false;
         potentialMove = curPos.slice(0);
         while (!iterationComplete) {
           for (j = 0; j < moves.length; j++) {
             if (moves[j] in xMoves) {
               potentialMove[1] += xMoves[moves[j]];
             }
             else {
               potentialMove[0] += yMoves[moves[j]];
             }
           }  
           validation = this.validateMove(potentialMove, curPos);
           if (validation.available) {
             availableMoves.push([potentialMove.slice(0), validation.targetPiece]);
           }
           if (validation.end) {
             iterationComplete = true;
           }
         }
       }
    }

    return availableMoves;

    if (piece.attackMoves == undefined) {
      //TODO: check for king's ability to castle
      return ['not pawn', piece.pos];
    }
    else {
      //TODO: Pawn special moves (first double move, en passant, attack)
      //TODO: check if opponent piece is in up-right or up-left position, add to available moves if so
      return ['pawn', piece.pos];
    }
  };

  this.validateMove = function(move, curPos) {
    // determine if move is possible (out of bounds, or blocked, or pinned) 
    var y = move[0];
    var x = move[1];
    var returnValue = {available:true, end: false, targetPiece: undefined};
    if (x < 0 || y < 0 || x >= 8 || y >= 8) {
      //out of bounds
      returnValue.available = false;
      returnValue.end = true;
    }
    else {
      //in bounds
      var curPiece = this.getPieceFromCoords(curPos[0], curPos[1]);
      var pieceInPotentialPosition = this.getPieceFromCoords(y,x);
      if (pieceInPotentialPosition !== 'empty') {
        //ran into a piece
        if (curPiece.color == pieceInPotentialPosition.color) {
          returnValue.available = false;
          returnValue.end = true;
        }
        else {
          // opponent piece
          returnValue.available = true;
          returnValue.end = true;
          returnValue.targetPiece = pieceInPotentialPosition;
        }
      }
    }
    // defaulted to original value, empty space and more available behind it
    return returnValue;
  };

  this.init = function() {
    this.board = new Array(); // Array to hold board positions
    this.availableMoves = new Array(); 
    this.isPieceSelected = false;
    this.selectedPiece = undefined;
    this.isKingInCheck = false;

    // Build the empty board array
    for (var i = 0; i < 8; i++) {
      this.board.push([]);
      for (var j = 0; j < 8; j++) {
        this.board[i].push([]);
      }
    }

    // Build board starting at top-left board position (black rook)
    for (var i = 0; i < 8; i++) {
      // One row at a time
      for (var j = 0; j < 8; j++) {
        // Build columns for this row
        if (i === 0 || i === 7) {
          // Top or bottom row
          if (j === 0 || j == 7)
            // First / Last column
            this.board[i][j] = new Piece("R", i, j);
          else if (j === 1 || j === 6)
            this.board[i][j] = new Piece("N", i, j);
          else if (j === 2 || j === 5) 
            this.board[i][j] = new Piece("B", i, j);
          else if (j === 3) 
            this.board[i][j] = new Piece("Q", i, j);
          else if (j === 4) 
            this.board[i][j] = new Piece("K", i, j);
        }
        else if (i === 1 || i === 6) {
          this.board[i][j] = new Piece("P", i, j);
        }
      }
    }
  };

}

function Piece(piece, row, col) {
  // Chess Pieces
  var chess = new Chess();
  if (row <= 2) {
    this.color = "White";
  } 
  else {
    this.color = "Black";
  }  
  this.pos = [row, col];
  this.posName = chess.getBoardPosition(row,col);
  switch (piece) {
    case "P":
      this.name = "Pawn";
      this.nickname = "P";
      this.moves = ["up_once"];
      this.attackMoves = ["up-left_once", "up-right_once"];
      this.isPinnedToKing = false;
      this.enpessantLeft = false;
      this.enpessantRight = false;
      this.isFirstMove = true;
      this.isInGame = true;
      this.isProtected = false;
      this.specialMoves = 
        {
          "double-up": {
            move: "up-up_once",
            condition: this.firstMove
          },
          "enpessant-left": {
            move: "up-left_once",
            condition: this.enpessantLeft
          },
          "enpessant-right": {
            move: "up-right_once",
            condition: this.enpessantRight
          }
        };
      break;
    case "N": 
      this.name = "Knight";
      this.nickname = "N";
      this.moves = ["up-up-left_once", "up-left-left_once", "up-up-right_once", "up-right-right_once", 
                    "down-down-left_once", "down-left-left_once", "down-down-right_once", "down-right-right_once"];
      this.isPinnedToKing = false;
      this.isInGame = true;
      this.isProtected = false;
      break;
    case "B":
      this.name = "Bishop";
      this.nickname = "B";
      this.moves = ["up-right_all", "up-left_all", "down-right_all", "down-left_all"];
      this.isPinnedToKing = false;
      this.isInGame = true;
      this.isProtected = false;
      break;
    case "R":
      this.name = "Rook";
      this.nickname = "R";
      this.moves = ["up_all", "down_all", "left_all", "right_all"];
      this.isPinnedToKing = false;
      this.isInGame = true;
      this.isProtected = false;
      this.isFirstMove = true;
      break;
    case "Q":
      this.name = "Queen";
      this.nickname = "Q";
      this.moves = ["up-right_all", "up-left_all", "down-right_all", "down-left_all", "up_all", "down_all", "left_all", "right_all"];
      this.isPinnedToKing = false;
      this.isInGame = true;
      this.isProtected = false;
      break;
    case "K":
      this.name = "King";
      this.nickname = "K";
      this.moves = ["up_once", "down_once", "left_once", "right_once", "up-right_once", "up-left_once", "down-right_once", "down-left_once"];
      this.isFirstMove = true;
      this.isInGame = true;
      break;
  }
}
