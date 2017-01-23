(function Engine(w) {
  this.clickPiece = function(el) {
    if (!!chess.pieceToPromote) return;
    chess.selectPiece(el.id);
  };
  this.newGame = function() {
    this.chess = new Chess();
    this.chess.init();
    this.chess.resetCapturedPieces();
    this.chess.printBoard();
  };
  this.undo = function() {
    this.chess.undo();
  };
  this.togglePieceLogging = function() {
    this.chess.isPieceLogging = !this.chess.isPieceLogging;
  };
  this.choosePromotion = function(piece) {
    chess.choosePromotion(piece);
  };
  this.newGame();
  $(w).on('resize', function() {
    var height = $('#chess-board-table tbody').css('height');
    $('#captured-pieces').css({height: height});
  });
})(window);
