(function Engine(w) {
  this.chess = new Chess();
  this.chess.init();
  this.chess.printBoard();

  this.clickPiece = function(el) {
    chess.selectPiece(el.id);
  };

})(window);
