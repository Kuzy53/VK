/** @format */

var Board = function (columns, rows, mines) {
  this.onTileClicked = new Phaser.Signal();
  this.onTileFlagged = new Phaser.Signal();
  this.onEndGame = new Phaser.Signal();
  var self = this;
  var flaggedTiles = [];
  var mineList = [];
  var board = [];
  var group = game.add.group();
  var tilesLeft = columns * rows - mines;

  var init = function () {
    for (var y = 0; y < rows; y++) {
      var row = [];

      for (var x = 0; x < columns; x++) {
        var tile = new Tile(x, y, group);
        tile.onRevealed.add(onReveal, this);
        tile.onFlagged.add(onFlag, this); // слушатель для проверки маркировки тайла
        row.push(tile);
      }

      board.push(row);
    }
    setMines();
  };

  this.moveTo = function (x, y) {
    group.x = x;
    group.y = y;
  };

  var getRandomTile = function () {
    var randomRow = Math.floor(Math.random() * rows);
    var randomColumn = Math.floor(Math.random() * columns);
    return board[randomRow][randomColumn];
  };
  var setMines = function () {
    var tile = getRandomTile();

    for (var i = 0; i < mines; i++) {
      while (tile.getValue() == tile.states.MINE) {
        tile = getRandomTile();
      }
      mineList.push(tile);
      tile.setValue(tile.states.MINE);
      updateSurroundingTiles(tile);
    }
  };

  var updateSurroundingTiles = function (tile) {
    var targetTile;
    var surroundingTiles = getSurroundingTiles(tile); // вызывается функция getSurroundingTiles для получения списка окружающих тайлов.
    for (var i = 0; i < surroundingTiles.length; i++) {
      targetTile = surroundingTiles[i];
      if (targetTile.getValue() == tile.states.MINE) {
        continue;
      }
      targetTile.setValue(targetTile.getValue() + 1);
    }
  };

  // код слушателя, который срабатывает, когда свойство onRevealed отправляет событие из объекта Tile
  var onReveal = function (tile) {
    self.onTileClicked.dispatch();
    switch (tile.getValue()) {
      case tile.states.ZERO:
        revealEmptyTiles(tile);
        break;
      case tile.states.MINE:
        revealAll();
        break;
    }

    tilesLeft--;
    if (!tilesLeft) {
      self.onEndGame.dispatch();
    }
  };

  // вызывается, когда тайл будет промаркирован флагом
  var onFlag = function (tile) {
    endGame();

    if (tile.getState() == tile.states.FLAG) {
      flaggedTiles.push(tile);
    } else {
      for (var i = 0; i < flaggedTiles.length; i++) {
        if (flaggedTiles[i] == tile) {
          flaggedTiles.splice(i, 1);
        }
      }
    }
    self.onTileFlagged.dispatch(flaggedTiles.length);
  };

  // с помощью цикла будет происходить обход массива board и раскрытие всех тайлов
  var revealAll = function () {
    endGame(); // оно будет отправлено, когда будут показаны все тайлы
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < columns; x++) {
        var tile = board[y][x];
        if (tile.isRevealed()) {
          continue;
        }
        tile.onRevealed.remove(onReveal, this);
        tile.reveal();
      }
    }
  };

  // Функция getSurroundingTiles будет использоваться для получения всех окружающих тайлов
  var getSurroundingTiles = function (tile) {
    var tileList = [];
    var targetTile;
    var column;
    var row;
    for (var y = -1; y <= 1; y++) {
      for (var x = -1; x <= 1; x++) {
        if (!x && !y) {
          continue;
        }
        column = tile.column + x;
        row = tile.row + y;
        if (row < 0 || row >= rows || column < 0 || column >= columns) {
          continue;
        }
        targetTile = board[row][column];
        tileList.push(targetTile);
      }
    }
    return tileList;
  };

  var revealEmptyTiles = function (tile) {
    var tileList = [tile];
    var surroundingTiles;
    var currentTile;

    while (tileList.length) {
      currentTile = tileList[0];
      surroundingTiles = getSurroundingTiles(currentTile);

      while (surroundingTiles.length) {
        currentTile = surroundingTiles.shift();

        if (currentTile.isRevealed()) {
          // проверяется является ли currentTile раскрытым тайлом
          continue;
        }

        tilesLeft--;
        currentTile.onRevealed.remove(onReveal, this);
        currentTile.reveal();
        if (currentTile.getValue() == currentTile.states.ZERO) {
          tileList.push(currentTile);
        }
      }
      tileList.shift();
    }

    if (!tilesLeft) {
      endGame();
    }
  };

  var endGame = function () {
    for (var i = 0; i < mineList.length; i++) {
      var tile = mineList[i];
      tile.enable(false);
    }
    self.onEndGame.dispatch();
  };

  init();
};
