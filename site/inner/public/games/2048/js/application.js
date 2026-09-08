// Wait till the browser is ready to render the game (avoids glitches).
// requestAnimationFrame never fires while a tab/frame is hidden, so fall back
// to a timeout: the desktop can open this window before it is painted.
(function () {
  var started = false;
  var start = function () {
    if (started) return;
    started = true;
    new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
  };
  window.requestAnimationFrame(start);
  window.setTimeout(start, 120);
})();
