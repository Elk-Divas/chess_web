function Chess() {
  //Main Chess Game Class
  
  //TODO: Finalize Check and checkmate
  //TODO: Fill and empty Captured Pieces container while playing and undoing
  //TODO: Build AI

  this.printBoard = function() {
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        var pos = this.getBoardPosition(i, j);
        el = document.getElementById(pos);
        el.style.border = '2px solid black';
        if (this.board[i][j] instanceof Piece && this.board[i][j].isInGame) {
          el.style.backgroundImage = this.board[i][j].color == 'White' ? "url('" + this.board[i][j].lightImage + "')": "url('" + this.board[i][j].darkImage + "')";
          $(el).addClass(function(index, currentClass) {
            var addClass;
            if (currentClass !== 'game-piece') {
              addClass = 'game-piece';
            };
            return addClass;
          });
        }
        else {
          el.style.backgroundImage = '';
          this.board[i][j] = [];
          $(el).removeClass(function(index, currentClass) {
            var removeClass;
            if (currentClass === 'game-piece') {
              removeClass = 'game-piece';
            }
            return removeClass;
          });
        }
      }
    }
    if (this.isKingInCheck) { 
      var colors = ['blue', 'red', 'green', 'yellow', 'pink', 'white', 'purple'];
      $('#messages').css({fontSize:'1px'});
      $('#messages').html('CHECK!'); 
      $('#messages').show();
      $('#messages').animate({fontSize:'80px', color: colors[Math.floor(Math.random() * 7)]}, 200, "swing", function() {
        console.log('Animation complete');
      });
    }
    else $('#messages').animate({opacity:'0.0', fontSize:'1px'}, 200, "swing", function() {
      $(this).hide();
      $(this).css({opacity: 1.0});
    }); 
    $('#captured-pieces').css({height: $('#chess-board-table tbody').css('height')});
  };

  this.changeTurns = function() {
    this.colorTurn = this.colorTurn == 'White' ? 'Black' : 'White';
  };

  this.getBoardPosition = function(y,x) {
    // returns the board position's name (a8, f5, etc)
    // yNames are only increased by 1
    if (Object.prototype.toString.call(y) === '[object Array]' && x == undefined) {
      // if an array was given
      x = y[1], y = y[0];
    }
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
    if (Object.prototype.toString.call(y) === '[object Array]' && x == undefined) {
      // if an array was given
      x = y[1], y = y[0]
    }
    return this.getPieceFromBoardName(this.getBoardPosition(y,x));
  };

  this.selectPiece = function(elId) {
    // called from engine.js 
    // board square was clicked
    var piece, el, movePos = [], targetPiece = [], i, specialMove = [];
    piece = this.getPieceFromBoardName(elId);
    this.resetBoardBorderColors();
    el = document.getElementById(elId);

    if (this.isPieceLogging) console.log(piece);
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
          el.style.border = '2px solid green';
          this.showAvailableMoves(piece);
          if (this.availableMoves.length > 0) {
            this.isPieceSelected = true;
            this.selectedPiece = piece;
          }
        }
        else {
          this.selectedPiece = undefined;
        }      
      }
    }
  };

  this.resetEnpassant = function() {
    this.isEnpassant = false;
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        var piece = this.getPieceFromCoords([i, j]);
        if (piece.nickname == 'P') {
          piece.enpassantRight = false;
          piece.enpassantLeft = false;
        }
      }
    }
  };

  this.capturePiece = function(piece) {
    if (piece == undefined) return;
    piece.isInGame = false;
    if (piece.color == 'White') {
      this.capturedWhite++;
      var el = 'wcp' + String(this.capturedWhite);
      $('#'+el).html('<img src='+piece.lightImage+'/>');
    }
    else {
      this.capturedBlack++;
      var el = 'bcp' + String(this.capturedBlack);
      $('#'+el).html('<img src='+piece.darkImage+'/>');
    } 
    return el;
  };

  this.movePiece = function(piece, newPos, targetPiece, specialMove) {
    var oldPos = piece.pos,
        newPosCoords = this.getBoardCoordsFromBoardName(newPos),
        isFirstMove, specialMoveResults, historyState = {};

    if (targetPiece !== undefined) {
      var capturedEl = this.capturePiece(targetPiece);
    }
    if (this.isEnpassant) {
      historyState.isEnpassant = true;
      this.resetEnpassant();
    }
    
    piece.pos = newPosCoords;
    piece.posName = newPos;
    this.board[oldPos[0]][oldPos[1]] = [];
    this.board[newPosCoords[0]][newPosCoords[1]] = piece;

    switch(piece.nickname) {
      case 'P':
        if (specialMove != undefined) { 
          specialMoveResults = this.handleSpecialMove(piece, specialMove);
          if (Object.prototype.toString.call(specialMoveResults) == '[object Array]') {
            specialMoveResults.forEach(function(piece) {
              if (!!piece && piece.enpassantRight) {
                historyState.enpassantRight = {bool: true, piece: piece};
              }
              if (!!piece && piece.enpassantLeft) {
                historyState.enpassantLeft = {bool: true, piece: piece};
              }
            });
          }
          else {
            var capturedEl = this.capturePiece(specialMoveResults);
          }
        }
        isFirstMove = piece.isFirstMove;
        piece.isFirstMove = false;
        if (piece.pos[0] == (piece.color == 'White' ? 7 : 0)) {
          this.promotePawn(piece);
        }
        break;
      case 'R':
        isFirstMove = piece.isFirstMove;
        piece.isFirstMove = false;
        break;
      case 'K':
        if (specialMove != undefined) {
          specialMoveResults = this.handleSpecialMove(piece, specialMove, oldPos);
          historyState[specialMove.name] = {bool:true, rook: specialMoveResults, king: piece};
        }
        isFirstMove = piece.isFirstMove;
        piece.isFirstMove = false;
        break;
      default: 
        isFirstMove = piece.isFirstMove;
        break;
    }

    this.gameState.addToMoveHistory({
      from:                 oldPos, 
      to:                   newPosCoords, 
      isFirstMove:          isFirstMove,
      specialMove:          specialMove,
      specialMoveResults:   specialMoveResults,
      historyState:         historyState,
      piece:                piece,
      targetPiece:          targetPiece,
      capturedElement:      capturedEl,
      colorTurn:            this.colorTurn
    });

    this.changeTurns();
    this.evaluateBoard();
    this.printBoard();
  };

  this.promotePawn = function(piece) {
    var chosenPromotion, el;
    el = document.getElementById('promotion');
    el.style.display = 'block';
    this.pieceToPromote = piece;
  };

  this.choosePromotion = function(newPiece) {
    var piece = this.pieceToPromote, pos = this.pieceToPromote.pos.slice(0);
    this.board[pos[0]][pos[1]] = new Piece(newPiece, pos[0], pos[1], piece.posName, piece.color);

    el = document.getElementById('promotion');
    el.style.display = 'none';
    console.log(piece);
    this.pieceToPromote = undefined;

    this.evaluateBoard();
    this.printBoard();
  };

  this.handleSpecialMove = function(piece, specialMove, oldPos) {
    var moveName = specialMove.name,
        pieceType = piece.nickname,
        color = piece.color,
        pos = piece.pos.slice(0),
        tempPos = [], tempPiece, tempPiece2,
        upDown = piece.color == 'White' ? {up:1, down:-1} : {up:-1, down:1};

    switch(pieceType) {
      case 'P': 
        if (moveName == 'double-up'){
          // checking if opponent can En Passant Left
          tempPos = [pos[0],pos[1]+1];
          if (tempPos[1] >= 0 && tempPos[1] < 8) {
            tempPiece = this.getPieceFromCoords(tempPos[0], tempPos[1]);
            if (tempPiece instanceof Piece && tempPiece.nickname == 'P' && tempPiece.color !== color) {
              this.isEnpassant = true;
              tempPiece.enpassantLeft = true;
            }
          }
          // checking if opponent can En Passant Right
          tempPos = [pos[0],pos[1]-1];
          if (tempPos[1] >= 0 && tempPos[1] < 8) {
            tempPiece2 = this.getPieceFromCoords(tempPos[0], tempPos[1]);
            if (tempPiece2 instanceof Piece && tempPiece2.nickname == 'P' && tempPiece2.color !== color) {
              this.isEnpassant = true;
              tempPiece2.enpassantRight = true;
            }
          }
          return (tempPiece !== undefined && tempPiece.enpassantLeft) || (tempPiece2 !== undefined && tempPiece2.enpassantRight) ? [tempPiece,tempPiece2] : undefined;
        }
        else if (moveName == 'enpassant-right' || moveName == 'enpassant-left') {
          // handling En Passant attack
          tempPos = [pos[0]+upDown.down,pos[1]];
          if (tempPos[0] >= 0 && tempPos[0] < 8) {
            tempPiece = this.getPieceFromCoords(tempPos[0], tempPos[1]);
            if (tempPiece instanceof Piece && tempPiece.nickname == 'P') {
              tempPiece.isInGame = false;
              this.board[tempPos[0]][tempPos[1]] = [];
              this.isEnpassant = false;
              piece.enpassantRight = false;
              piece.enpassantLeft = false;
            }
          }
          return tempPiece;
        }
        break;
      case 'K':
        if (moveName == 'kingside-castle') {
          tempPos = [oldPos[0], oldPos[1]+3];
          if (tempPos[1] >= 0 && tempPos[1] < 8) {
            tempPiece = this.getPieceFromCoords(tempPos[0], tempPos[1]);
            if (tempPiece instanceof Piece && tempPiece.nickname == 'R') {
              this.board[tempPos[0]][tempPos[1]] = [];
              this.board[oldPos[0]][oldPos[1]+1] = tempPiece;
              tempPiece.isFirstMove = false;
              tempPiece.pos = [oldPos[0], oldPos[1]+1];
              tempPiece.posName = this.getBoardPosition(oldPos[0],oldPos[1]+1);
            }
          }
        }
        else if (moveName == 'queenside-castle') {
          tempPos = [oldPos[0], oldPos[1]-4];
          if (tempPos[1] >= 0 && tempPos[1] < 8) {
            tempPiece = this.getPieceFromCoords(tempPos[0], tempPos[1]);
            if (tempPiece instanceof Piece && tempPiece.nickname == 'R') {
              this.board[tempPos[0]][tempPos[1]] = [];
              this.board[oldPos[0]][oldPos[1]-1] = tempPiece;
              tempPiece.isFirstMove = false;
              tempPiece.pos = [oldPos[0],oldPos[1]-1];
              tempPiece.posName = this.getBoardPosition(oldPos[0],oldPos[1]-1);
            }
          }
        }
        return tempPiece;
        break;
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

  this.getAvailableMoves = function(piece, attackThreatsOnly) {
    var curPos = piece.pos.slice(0);
    var color = piece.color;
    var availableMoves = []; // [[[row,col], targetPiece], [[row,col], targetPiece]];
    var up, down, xMoves, yMoves, freq, move, potentialMove, moves, validation, i, j, iterationComplete, specialMove;
    if (attackThreatsOnly == undefined) attackThreatsOnly = false;

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
         if (validation.available) {
           if (freq == 'special') {
             if (!attackThreatsOnly && this.checkSpecialCondition(validationPack)) {
               availableMoves.push([potentialMove.slice(0), validation.targetPiece, specialMove]);
             }
           }
           else if (freq == 'attack') {
             if (this.checkSpecialCondition(validationPack))
               availableMoves.push([potentialMove.slice(0), validation.targetPiece, specialMove]);
           }
         }
       }
    }
    return availableMoves;
  };

  this.checkSpecialCondition = function(obj) {
    var pieceType = obj.piece.nickname;
    switch(pieceType) {
      case "P":
        return obj.specialMove.condition(obj.piece, obj.validation.targetPiece, this);
        break;
      case "K":
        return obj.specialMove.condition(obj.piece, this);
        break;
      default: 
        console.log('defaulted in checkSpecialCondition');
        return true;
        break;
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

  this.checkForThreat = function(coords, color) {
    var returnValue = {threatBool: false, attacker: [], piece: [], kingCheck: false};
    if (!!coords) { 
      console.log(coords);
      var pieceInPos = this.getPieceFromCoords(coords);
        for (var i = 0; i < 8; i++) {
          for (var j = 0; j < 8; j++) {
            var attackingPiece = this.getPieceFromCoords([i,j]);
            if (attackingPiece == 'empty' || attackingPiece.color == color) continue;
            else {
              var moves;
              moves = this.getAvailableMoves(attackingPiece, true);
              moves.forEach(function(move) {
                if (String(move[0]) == String(coords)) {
                  returnValue.threatBool = true;
                  returnValue.attacker.push(attackingPiece);
                  returnValue.piece.push(pieceInPos);
                }
              });
            }
          }
        }
    }
    else {
      for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
          var attackingPiece = this.getPieceFromCoords([i,j]);
          if (attackingPiece == 'empty' || attackingPiece.color == color) continue;
          else {
            var moves;
            moves = this.getAvailableMoves(attackingPiece, true);
            moves.forEach(function(move) {
              if (move[1] !== undefined && move[1].color === color && move[1].nickname == 'K') {
                returnValue.attacker.push(attackingPiece);
                returnValue.piece.push(move[1]);
                returnValue.kingCheck = true;
              }
              else if (move[1] !== undefined && move[1].color === color) {
                returnValue.attacker.push(attackingPiece);
                returnValue.piece.push(move[1]);
              }
            });
          }
        }
      }
    }
    return returnValue;
  };

  this.evaluateBoard = function() {
    var results;
    results = this.checkForThreat(null, this.colorTurn);
    if (results.kingCheck) {
      this.isKingInCheck = true;
      console.log(results);
    }
    else {
      this.isKingInCheck = false;
      console.log("for " + this.colorTurn + ':',  results);
    }  
  };
  
  this.undo = function() {
    if (this.gameState.moveHistory.length <= 0) return;
    this.selectedPiece = undefined;
    this.isPieceSelected = false;
    var lastMove = this.gameState.moveHistory.pop();

    lastMove.piece.pos = lastMove.from;
    lastMove.piece.posName = this.getBoardPosition(lastMove.from);
    lastMove.piece.isFirstMove = lastMove.isFirstMove;

    this.board[lastMove.from[0]][lastMove.from[1]] = lastMove.piece;
    this.board[lastMove.to[0]][lastMove.to[1]] = [];
    this.colorTurn = lastMove.colorTurn;

    if (lastMove.targetPiece != undefined) {
      lastMove.targetPiece.isInGame = true;
      this.board[lastMove.targetPiece.pos[0]][lastMove.targetPiece.pos[1]] = lastMove.targetPiece;
      this.removeLastFromCapturedList(lastMove.colorTurn);
    }

    if (!!lastMove.historyState.isEnpassant) {
      this.isEnpassant = true;
      var historyState = this.gameState.moveHistory[this.gameState.moveHistory.length - 1].historyState;
      for (p in historyState) {
        var obj = historyState[p];
        var objPiece = obj.piece;
        objPiece[p] = historyState[p].bool;
      }
    }

    else if (!!lastMove.historyState.enpassantRight || !!lastMove.historyState.enpassantLeft) {
      this.resetEnpassant();
    }

    if (lastMove.specialMove !== undefined && (lastMove.specialMove.name == 'enpassant-left' || lastMove.specialMove.name == 'enpassant-right')) {
      this.board[lastMove.specialMoveResults.pos[0]][lastMove.specialMoveResults.pos[1]] = lastMove.specialMoveResults;
      lastMove.specialMoveResults.isInGame = true;
      this.removeLastFromCapturedList(lastMove.colorTurn);
      if (lastMove.specialMove.name == 'enpassant-left') {
        lastMove.piece.enpassantLeft = true; 
        var tempCoords = lastMove.from;
        var checkCoords = this.validateCoords(tempCoords[0], tempCoords[1] - 2);
        if (checkCoords) {
          var tempPiece = this.getPieceFromCoords(checkCoords);
          if (tempPiece instanceof Piece && tempPiece.nickname == 'P' && tempPiece.color == lastMove.piece.color) {
            tempPiece.enpassantRight = true;
          }
        }
      }    
      else {
        lastMove.piece.enpassantRight = true;
        var tempCoords = lastMove.from;
        var checkCoords = this.validateCoords(tempCoords[0], tempCoords[1] + 2);
        if (checkCoords) {
          var tempPiece = this.getPieceFromCoords(checkCoords);
          if (tempPiece instanceof Piece && tempPiece.nickname == 'P' && tempPiece.color == lastMove.piece.color) {
            tempPiece.enpassantLeft = true;
          }
        }
      }
    }

    if (!!lastMove.historyState['kingside-castle'] || !!lastMove.historyState['queenside-castle']) {
      var rookDisplace = lastMove.historyState['kingside-castle'] !== undefined ? 2 : -3,
          king, rook, last;
      for (var p in lastMove.historyState) {
        last = lastMove.historyState[p];
        rook = last.rook;
        king = last.king;
        king.isFirstMove = true;
        rook.isFirstMove = true;
        this.board[rook.pos[0]][rook.pos[1]] = [];
        rook.pos = [rook.pos[0], rook.pos[1]+rookDisplace]; 
        rook.posName = this.getBoardPosition(rook.pos[0], rook.pos[1]);
        this.board[rook.pos[0]][rook.pos[1]] = rook;
      }
    }

    this.printBoard();
  };

  this.validateCoords = function(y, x) {
    return y >= 0 && y < 8 && x >= 0 && x < 8 ? [y, x] : undefined;
  };
  this.removeLastFromCapturedList = function(color) {
    var capturedColor = color == 'White' ? 'Black' : 'White';
    if (capturedColor == 'White') {
      $('#wcp'+String(this.capturedWhite)).html('');
      this.capturedWhite--;
    }
    else {
      $('#bcp'+String(this.capturedBlack)).html('');
      this.capturedBlack--;
    }
  };
  this.resetCapturedPieces = function() {
    var white = document.getElementById('captured-pieces-white');
    var black = document.getElementById('captured-pieces-black');
    for (var i = 0, row; row = white.rows[i]; i++) {
      for (var j = 0, cell; cell = row.cells[j]; j++) {
        $('#'+cell.id).html('');
      }
    }
    for (var i = 0, row; row = black.rows[i]; i++) {
      for (var j = 0, cell; cell = row.cells[j]; j++) {
        $('#'+cell.id).html('');
      }
    }
  };

  this.init = function() {
    this.board = new Array(); // Array to hold board positions
    this.availableMoves = new Array(); 
    this.isPieceSelected = false;
    this.selectedPiece = undefined;
    this.isKingInCheck = false;
    this.isEnpassant = false;
    this.colorTurn = 'White';
    this.isPieceLogging = false;
    this.capturedWhite = 0;
    this.capturedBlack = 0;
    this.pieceToPromote = undefined;
    this.gameState = {
      moveHistory: [], 
      addToMoveHistory: function(moveHistory) {
        this.moveHistory.push(moveHistory);
      }
    };

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

function Piece(piece, row, col, posName, promotionColor) {
  // Chess Pieces
  if (promotionColor == undefined) promotionColor = false;
  if (row <= 2 && !promotionColor) {
    this.color = "White";
  } 
  else if (row > 2 && !promotionColor) {
    this.color = "Black";
  }  
  else if (!!promotionColor) {
    this.color = promotionColor;
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
            condition: function(self, otherPiece, chess) {
              var upDown = self.color == 'White' ? {up:1, down:-1} : {up:-1, down:1};
              return self.isFirstMove && (chess.getPieceFromCoords(self.pos[0]+upDown.up, self.pos[1]) == 'empty') && (chess.getPieceFromCoords(self.pos[0]+upDown.up+upDown.up, self.pos[1]) == 'empty');
            }
          },
          "attack-left": {
            name: "attack-left",
            move: "up-left_once",
            condition: function(self, otherPiece, chess) {
              return otherPiece instanceof Piece && self.color !== otherPiece.color;
            }
          },
          "attack-right": {
            name: "attack-right",
            move: "up-right_once",
            condition: function(self, otherPiece, chess) {
              return otherPiece instanceof Piece && self.color !== otherPiece.color;            
            }
          },
          "enpassant-left": {
            name: "enpassant-left",
            move: "up-left_once",
            condition: function(self, otherPiece, chess) {
              return self.enpassantLeft;
            }
          },
          "enpassant-right": {
            name: "enpassant-right",
            move: "up-right_once",
            condition: function(self, otherPiece, chess) {
              return self.enpassantRight;
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
      this.moves = ["up_once", "down_once", "left_once", "right_once", "up-right_once", "up-left_once", "down-right_once", 
      "down-left_once", "kingside-castle_special", "queenside-castle_special"];
      this.isFirstMove = true;
      this.isInGame = true;
      this.darkImage = "images/Chess_kdt60.png";
      this.lightImage = "images/Chess_klt60.png";
      this.specialMoves = 
      {
        "kingside-castle": {
          name: "kingside-castle",
          move: "right-right_once",
          condition: function(self, chess) {
            if (self.pos[1] + 3 <= 7 && self.pos[1] - 4 >= 0) {
              var rook = chess.getPieceFromCoords(self.pos[0], self.pos[1]+3);          
              return (self.isFirstMove && !chess.isKingInCheck && (chess.getPieceFromCoords(self.pos[0],self.pos[1]+1) == 'empty') && (chess.getPieceFromCoords(self.pos[0],self.pos[1]+2) == 'empty') && (!chess.checkForThreat([self.pos[0],self.pos[1]+1], self.color).threatBool) && (!chess.checkForThreat([self.pos[0],self.pos[1]+2], self.color).threatBool) && rook.isFirstMove && rook.name == 'Rook');
            }
            else {
              return false;
            }
          }
        },
        "queenside-castle": {
          name: "queenside-castle",
          move: "left-left_once",
          condition: function(self, chess) {
            if (self.pos[1] + 3 <= 7 && self.pos[1] - 4 >= 0) {
              var rook = chess.getPieceFromCoords(self.pos[0], self.pos[1]-4);          
              return (self.isFirstMove && !chess.isKingInCheck && (chess.getPieceFromCoords(self.pos[0],self.pos[1]-1) == 'empty') && (chess.getPieceFromCoords(self.pos[0],self.pos[1]-2) == 'empty') && (chess.getPieceFromCoords(self.pos[0],self.pos[1]-3) == 'empty') && (!chess.checkForThreat([self.pos[0],self.pos[1]-1], self.color).threatBool) && (!chess.checkForThreat([self.pos[0],self.pos[1]-2], self.color).threatBool) && (!chess.checkForThreat([self.pos[0],self.pos[1]-3], self.color).threatBool) && rook.isFirstMove && rook.name == 'Rook');
            }
            else {
              return false;
            }
          }
        }
      };
      break;
  }
}
