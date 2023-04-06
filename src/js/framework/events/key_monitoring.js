//Key monitoring
document.body.onkeydown = function (e) {
  keys[e.keyCode] = true;

  if (e.keyCode == 17)
    map.scrollWheelZoom.disable();
};
document.body.onkeyup = function (e) {
  delete keys[e.keyCode];

  if (e.keyCode == 17)
    map.scrollWheelZoom.enable();
};
