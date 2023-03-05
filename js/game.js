/** @format */

var gameProperties = {
  screenWidth: window.innerWidth,
  screenHeight: window.innerWidth,

  tileWidth: 28,
  tileHeight: 28,

  boardWidth: 16,
  boardHeight: 16,

  totalMines: 40,
};

var states = {
  game: "game",
};

var graphicAssets = {
  tiles: { URL: "assets/tiles.png", name: "tiles", frames: 14 },
};

var fontStyles = {
  counterFontStyle: { font: "20px Arial", fill: "#FFFFFF" },
};

var gameState = function (game) {
  this.boardTop;
  this.boardLeft;
  this.board;
  this.timer;
  this.counter;
  this.tf_replay;
};

gameState.prototype = {
  // в основном используется для сброса всех переменных и запускается непосредственно перед вызовом функции create
  init: function () {
    var boardHeight = gameProperties.tileHeight * gameProperties.boardHeight;
    this.boardTop = (gameProperties.screenHeight - boardHeight) * 0.2;
    var boardWidth = gameProperties.tileWidth * gameProperties.boardWidth;
    this.boardLeft = (gameProperties.screenWidth - boardWidth) * 0.5;
  },

  preload: function () {
    game.load.spritesheet(
      graphicAssets.tiles.name,
      graphicAssets.tiles.URL,
      gameProperties.tileWidth,
      gameProperties.tileHeight,
      graphicAssets.tiles.frames
    );
    game.canvas.oncontextmenu = function (e) {
      e.preventDefault();
    };
  },

  create: function () {
    this.initBoard();
    this.initUI();
  },

  update: function () {},

  initBoard: function () {
    this.board = new Board(
      gameProperties.boardWidth,
      gameProperties.boardHeight,
      gameProperties.totalMines
    );
    this.board.moveTo(this.boardLeft, this.boardTop);
    this.board.onTileClicked.addOnce(this.startGame, this);
    this.board.onEndGame.addOnce(this.endGame, this);
    this.board.onTileFlagged.add(this.updateMines, this);
  },

  // Функция initUI будет использоваться для добавления объекта Timer на игровое поле
  initUI: function () {
    var top = this.boardTop - 20;
    var left = this.boardLeft;
    var right = left + gameProperties.boardWidth * gameProperties.tileWidth;

    this.timer = new Timer(right, top);
    this.counter = new Counter(left, top, gameProperties.totalMines);

    this.tf_replay = game.add.text(
      game.stage.width * 0.5,
      top,
      "Повтор?",
      fontStyles.counterFontStyle
    );
    this.tf_replay.anchor.set(0.5, 0.5);
    this.tf_replay.inputEnabled = true;
    this.tf_replay.input.useHandCursor = true;
    this.tf_replay.events.onInputDown.add(this.restartGame, this);
    this.tf_replay.visible = false;
  },

  startGame: function () {
    this.timer.start();
  },
  endGame: function () {
    this.timer.stop();
    this.tf_replay.visible = true;
  },

  restartGame: function () {
    game.state.start(states.game);
  },

  updateMines: function (value) {
    this.counter.update(value);
  },
};

var game = new Phaser.Game(
  gameProperties.screenWidth,
  gameProperties.screenHeight,
  Phaser.AUTO,
  "wrapper"
);
game.state.add(states.game, gameState);
game.state.start(states.game);
