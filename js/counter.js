/** @format */

var Counter = function (x, y, defaultValue) {
  var currentValue = defaultValue;
  var tf_counter = game.add.text(
    x,
    y,
    defaultValue,
    fontStyles.counterFontStyle
  );
  tf_counter.anchor.set(0, 0.5);

  // Когда эта функция вызывается, она обновляет текстовый объект, чтобы показать количество неразминированных мин
  this.update = function (value) {
    tf_counter.text = currentValue - value;
  };
};
