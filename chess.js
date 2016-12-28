function Chess() {
  //Main Chess Game Class
  
  //TODO: Add castling functionality
  //TODO: Add en passant functionality
  //TODO: Add list of moves to a moveHistory array 
  //TODO: Add undo functionality

  this.printBoard = function() {
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        var pos = this.getBoardPosition(i, j);
        el = document.getElementById(pos);
        if (this.board[i][j] instanceof Piece) {
          el.style.backgroundImage = this.board[i][j].color == 'White' ? "url('" + this.board[i][j].lightImage + "')": "url('" + this.board[i][j].darkImage + "')";
          el.style.backgroundRepeat = 'no-repeat';
          el.style.backgroundPosition = 'center center';
        }
        else {
          el.style.backgroundImage = '';
        }
      }
    }
  };

  this.changeTurns = function() {
    this.colorTurn = this.colorTurn == 'White' ? 'Black' : 'White';
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
    return this.board[i][j] instanceof Piece ? this.board[i][j] : 'empty';
  };

  this.getPieceFromCoords = function(y, x) {
    return this.getPieceFromBoardName(this.getBoardPosition(y,x));
  };

  this.selectPiece = function(elId) {
    // called from engine.js 
    // board square was clicked
    var piece, el, movePos = [], targetPiece = [], i, specialMove = [];
    piece = this.getPieceFromBoardName(elId);
    this.resetBoardBorderColors();
    el = document.getElementById(elId);

    if (!this.isPieceSelected && piece.color != this.colorTurn) return;
    
    if (!this.isPieceSelected) {
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
        specialMove.push(this.availableMoves[i][2]);
      }
      var index = movePos.indexOf(elId);
      if (index !== -1) {
        // available move for selected piece;
        //TODO: determine if this is a special move (castle) -- this has to be handled differently by the movePiece function
        this.movePiece(this.selectedPiece, movePos[index], targetPiece[index], specialMove[index]);
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

  this.movePiece = function(piece, newPos, targetPiece, specialMove) {
    var oldPos = piece.pos,
        newPosCoords = this.getBoardCoordsFromBoardName(newPos);

    if (targetPiece !== undefined) {
      targetPiece.isInGame = false;
    }

    piece.pos = newPosCoords;
    piece.posName = newPos;
    this.board[oldPos[0]][oldPos[1]] = [];
    this.board[newPosCoords[0]][newPosCoords[1]] = piece;
    this.printBoard();
    this.changeTurns();

    switch(piece.nickname) {
      case 'P':
        if (specialMove != undefined) this.handleSpecialMove(piece, specialMove);
        piece.isFirstMove = false;
        break;
      case 'R':
        piece.isFirstMove = false;
        break;
      case 'K':
        piece.isFirstMove = false;
        break;
    }
  };

  this.handleSpecialMove = function(piece, specialMove) {
    var moveName = specialMove.name,
        pieceType = piece.nickname,
        pos = piece.pos.slice(0),
        tempPos = [], tempPiece;

    switch(pieceType) {
      case 'P': 
        if (moveName == 'double-up'){
          tempPos = [pos[0],pos[1]+1];
          if (tempPos[1] >= 0 && tempPos[1] < 8) {
            tempPiece = this.getPieceFromCoords(tempPos[0], tempPos[1]);
            if (tempPiece instanceof Piece && tempPiece.nickname == 'P')
              tempPiece.enpassantLeft = true;
              console.log(tempPiece);
          }
          tempPos = [pos[0],pos[1]-1];
          if (tempPos[1] >= 0 && tempPos[1] < 8) {
            tempPiece = this.getPieceFromCoords(tempPos[0], tempPos[1]);
            if (tempPiece instanceof Piece && tempPiece.nickname == 'P')
              tempPiece.enpassantRight = true;
              console.log(tempPiece);
          }
        }
    }
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
    for (var i = 0; i < availableMoves.length; i++) {
      var boardName = this.getBoardPosition(availableMoves[i][0][0], availableMoves[i][0][1]);
      document.getElementById(boardName).style.border = '2px solid yellow';
    }
  };

  this.getAvailableMoves = function(piece) {
    var curPos = piece.pos.slice(0);
    var color = piece.color;
    var availableMoves = []; // [[[row,col], targetPiece], [[row,col], targetPiece]];
    var up, down, xMoves, yMoves, freq, move, potentialMove, moves, validation, i, j, iterationComplete, specialMove;

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

       else if (freq == 'special' || freq == 'attack') {
         potentialMove = curPos.slice(0);
         specialMove = piece.specialMoves[move];
         moves = specialMove.move.split('_')[0].split('-');
         for (j = 0; j < moves.length; j++) {
           if (moves[j] in xMoves) {
             potentialMove[1] += xMoves[moves[j]];
            }
           else {
             potentialMove[0] += yMoves[moves[j]];
            }
          }
         validation = this.validateMove(potentialMove, curPos, freq);
         var validationPack = {piece: piece, specialMove: specialMove, potentialMove: potentialMove.slice(0), validation: validation};
         if (validation.available && this.checkSpecialCondition(validationPack)) {
           availableMoves.push([potentialMove.slice(0), validation.targetPiece, specialMove]);
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
      return ['pawn', piece.pos];
    }
  };

  this.checkSpecialCondition = function(obj) {
    var pieceType = obj.piece.nickname;
    switch(pieceType) {
      case "P":
        if(obj.specialMove.condition(obj.piece, obj.validation.targetPiece)) {
          return true;
          break;
        }
    }
  };

  this.validateMove = function(move, curPos, moveType) {
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
          if (curPiece.nickname !== 'P' || moveType == 'attack') {
            returnValue.available = true;
            returnValue.end = true;
            returnValue.targetPiece = pieceInPotentialPosition;
          }
          else if (moveType == 'special') {
            returnValue.available = false;
            returnValue.end = true;
            returnValue.targetPiece = pieceInPotentialPosition;
          }
          else if (curPiece.nickname == 'P' && moveType != 'attack') {
            returnValue.available = false;
            returnValue.end = true;
            returnValue.targetPiece = pieceInPotentialPosition;
          }
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
    this.colorTurn = 'White';

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
        var posName = this.getBoardPosition(i, j);
        if (i === 0 || i === 7) {
          // Top or bottom row
          if (j === 0 || j == 7)
            // First / Last column
            this.board[i][j] = new Piece("R", i, j, posName);
          else if (j === 1 || j === 6)
            this.board[i][j] = new Piece("N", i, j, posName);
          else if (j === 2 || j === 5) 
            this.board[i][j] = new Piece("B", i, j, posName);
          else if (j === 3) 
            this.board[i][j] = new Piece("Q", i, j, posName);
          else if (j === 4) 
            this.board[i][j] = new Piece("K", i, j, posName);
        }
        else if (i === 1 || i === 6) {
          this.board[i][j] = new Piece("P", i, j, posName);
        }
      }
    }
  };

}

function Piece(piece, row, col, posName) {
  // Chess Pieces
  if (row <= 2) {
    this.color = "White";
  } 
  else {
    this.color = "Black";
  }  
  this.pos = [row, col];
  this.posName = posName;
  switch (piece) {
    case "P":
      this.name = "Pawn";
      this.nickname = "P";
      this.moves = ["up_once", "double-up_special", "attack-left_attack", "attack-right_attack", "enpassant-left_special", "enpassant-right_special"];
      this.isPinnedToKing = false;
      this.enpassantLeft = false;
      this.enpassantRight = false;
      this.isFirstMove = true;
      this.isInGame = true;
      this.isProtected = false;
      this.specialMoves = 
        {
          "double-up": {
            name: "double-up",
            move: "up-up_once",
            condition: function(self, otherPiece) {
              return self.isFirstMove;
            }
          },
          "attack-left": {
            name: "attack-left",
            move: "up-left_once",
            condition: function(self, otherPiece) {
              return otherPiece instanceof Piece && self.color !== otherPiece.color;
            }
          },
          "attack-right": {
            name: "attack-right",
            move: "up-right_once",
            condition: function(self, otherPiece) {
              return otherPiece instanceof Piece && self.color !== otherPiece.color;            
            }
          },
          "enpassant-left": {
            name: "enpassant-left",
            move: "up-left_once",
            condition: function() {
              return this.enpassantLeft;
            }
          },
          "enpassant-right": {
            name: "enpassant-right",
            move: "up-right_once",
            condition: function() {
              return this.enpassantRight;
            }
          }
        };
      this.darkImage = "images/Chess_pdt60.png";
      this.lightImage = "images/Chess_plt60.png";
      break;
    case "N": 
      this.name = "Knight";
      this.nickname = "N";
      this.moves = ["up-up-left_once", "up-left-left_once", "up-up-right_once", "up-right-right_once", 
                    "down-down-left_once", "down-left-left_once", "down-down-right_once", "down-right-right_once"];
      this.isPinnedToKing = false;
      this.isInGame = true;
      this.isProtected = false;
      this.darkImage = "images/Chess_ndt60.png";
      this.lightImage = "images/Chess_nlt60.png";
      break;
    case "B":
      this.name = "Bishop";
      this.nickname = "B";
      this.moves = ["up-right_all", "up-left_all", "down-right_all", "down-left_all"];
      this.isPinnedToKing = false;
      this.isInGame = true;
      this.isProtected = false;
      this.darkImage = "images/Chess_bdt60.png";
      this.lightImage = "images/Chess_blt60.png";
      break;
    case "R":
      this.name = "Rook";
      this.nickname = "R";
      this.moves = ["up_all", "down_all", "left_all", "right_all"];
      this.isPinnedToKing = false;
      this.isInGame = true;
      this.isProtected = false;
      this.isFirstMove = true;
      this.darkImage = "images/Chess_rdt60.png";
      this.lightImage = "images/Chess_rlt60.png";
      break;
    case "Q":
      this.name = "Queen";
      this.nickname = "Q";
      this.moves = ["up-right_all", "up-left_all", "down-right_all", "down-left_all", "up_all", "down_all", "left_all", "right_all"];
      this.isPinnedToKing = false;
      this.isInGame = true;
      this.isProtected = false;
      this.darkImage = "images/Chess_qdt60.png";
      this.lightImage = "images/Chess_qlt60.png";
      break;
    case "K":
      this.name = "King";
      this.nickname = "K";
      this.moves = ["up_once", "down_once", "left_once", "right_once", "up-right_once", "up-left_once", "down-right_once", "down-left_once"];
      this.isFirstMove = true;
      this.isInGame = true;
      this.darkImage = "images/Chess_kdt60.png";
      this.lightImage = "images/Chess_klt60.png";
      break;
  }
}
