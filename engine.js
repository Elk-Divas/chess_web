(function Engine(w) {
  this.clickPiece = function(el) {
    chess.selectPiece(el.id);
  };
  this.newGame = function() {
    this.chess = new Chess();
    this.chess.init();
    this.chess.printBoard();
  };
  this.newGame();
})(window);
