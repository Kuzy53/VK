/** @format */

var Tile = function (column, row, group) {
  this.states = {
    ZERO: 0,
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
    SIX: 6,
    SEVEN: 7,
    EIGHT: 8,
    DEFAULT: 9,
    FLAG: 10,
    WRONG_FLAG: 11,
    UNKNOWN: 12,
    MINE: 13,
    SMILEY: 14,
    VICTORY: 15,
  };

  this.column = column;
  this.row = row;
  this.x = column * gameProperties.tileWidth;
  this.y = row * gameProperties.tileHeight;
  this.onRevealed = new Phaser.Signal(); // механизм диспетчеризации событий, который поддерживает вещание на нескольких слушателей и транслирует им события.
  this.onFlagged = new Phaser.Signal(); // ещё один объект сигнала, через который слушателю будет отправляться событие, когда тайл будет маркирован.
  var tile = this;

  var currentState = this.states.DEFAULT;
  var currentValue = this.states.ZERO;

  var sprite = game.add.sprite(
    this.x,
    this.y,
    graphicAssets.tiles.name,
    currentState,
    group
  );

  var init = function () {
    sprite.inputEnabled = true; //взаимодействие с мышью
    sprite.input.useHandCursor = true; //изменение курсора мыши с иконки стрелки, используемый по умолчанию, на курсор в виде руки
    sprite.events.onInputOut.add(rollOut, this); //обработчик срабатывает, когда курсор появляется над тайлом.
    sprite.events.onInputOver.add(rollOver, this); //обработчик срабатывает, когда курсор исчезает из области над тайлом
    sprite.events.onInputDown.add(click, this); //обработчик срабатывает, когда происходит клик по тайлу
  };

  var rollOver = function () {
    // анимация движения тайла
    var tween = game.add.tween(sprite);
    tween.to(
      { x: tile.x - 3, y: tile.y - 3 },
      100,
      Phaser.Easing.Exponential.easeOut
    );
    tween.start();
  };

  var rollOut = function () {
    // возвращает тайл в исходное положение
    var tween = game.add.tween(sprite);
    tween.to({ x: tile.x, y: tile.y }, 100, Phaser.Easing.Exponential.easeOut);
    tween.start();
  };

  var click = function () {
    if (game.input.activePointer.rightButton.isDown) {
      tile.flag();
    } else if (currentState == tile.states.DEFAULT) {
      tile.reveal();
    }
  };

  this.reveal = function () {
    sprite.animations.frame = currentValue;
    sprite.inputEnabled = false;
    tile.onRevealed.dispatch(tile);
  };

  this.flag = function () {
    switch (currentState) {
      case tile.states.DEFAULT:
        currentState = tile.states.FLAG;
        break;
      case tile.states.FLAG:
        currentState = tile.states.UNKNOWN;
        break;
      case tile.states.UNKNOWN:
        currentState = tile.states.DEFAULT;
        break;
    }
    tile.onFlagged.dispatch(tile); // Это позволит транслировать событие, которое сможет получить функция-слушатель в объекте Board
    sprite.animations.frame = currentState;
  };

  this.setValue = function (value) {
    currentValue = value;
  };

  this.getValue = function () {
    return currentValue;
  };

  //Функция isRevealed сравнивает номер текущего кадра анимации со свойством тайла currentValue. Если оба значения совпадают, значит тайл уже раскрыт.
  this.isRevealed = function () {
    return sprite.animations.frame == currentValue;
  };

  this.getState = function () {
    return currentState;
  };

  this.enable = function (enable) {
    sprite.inputEnabled = enable;
  };

  init();
};
