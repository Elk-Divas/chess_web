(function Engine(w) {
  this.clickPiece = function(el) {
    chess.selectPiece(el.id);
  };
  this.newGame = function() {
    this.chess = new Chess();
    this.chess.init();
    this.chess.printBoard();
  };
  this.undo = function() {
    console.log('here');
    this.chess.undo();
  };
  this.togglePieceLogging = function() {
    this.chess.isPieceLogging = !this.chess.isPieceLogging;
  };

  this.newGame();
})(window);
