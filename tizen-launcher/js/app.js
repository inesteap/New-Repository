(function () {
  "use strict";

  var KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, BACK: 10009, ESC: 27 };
  var isTizen = typeof window.tizen !== "undefined";

  var rows = LAUNCHER_CONFIG.rows;
  var pos = { row: 0, col: 0 };
  var colMemory = rows.map(function () { return 0; });
  var inPassthrough = false;
  var tiltTimer = null;

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- Render ---------- */
  function render() {
    var container = $("rows");
    rows.forEach(function (row, r) {
      var rowEl = document.createElement("section");
      rowEl.className = "row";
      rowEl.innerHTML = '<div class="row-title">' + row.title + '</div><div class="track"></div>';
      var track = rowEl.querySelector(".track");
      row.items.forEach(function (item, c) {
        var wrap = document.createElement("div");
        wrap.className = "tile-wrap";
        wrap.dataset.r = r; wrap.dataset.c = c;
        wrap.innerHTML =
          '<div class="tile" style="background:linear-gradient(135deg,' + item.colors[0] + ',' + item.colors[1] + ')">' +
            '<span class="glyph">' + item.glyph + '</span><span class="shine"></span>' +
          '</div><div class="tile-label">' + item.label + '</div>';
        track.appendChild(wrap);
      });
      container.appendChild(rowEl);
    });
  }

  function tileEl(r, c) {
    return document.querySelector('.tile-wrap[data-r="' + r + '"][data-c="' + c + '"]');
  }

  /* ---------- Focus ---------- */
  function updateFocus(dir) {
    var prev = document.querySelector(".tile-wrap.focused");
    if (prev) prev.classList.remove("focused");
    var rowEls = document.querySelectorAll(".row");
    for (var i = 0; i < rowEls.length; i++) rowEls[i].classList.toggle("active", i === pos.row);

    var el = tileEl(pos.row, pos.col);
    el.classList.add("focused");

    // Desplaza la fila para mantener la ficha visible.
    var track = rowEls[pos.row].querySelector(".track");
    var shift = Math.max(0, pos.col - 3) * 340;
    track.style.transform = "translateX(" + (-shift) + "px)";

    // Inclinación breve en la dirección del movimiento (efecto parallax).
    var tile = el.querySelector(".tile");
    var tilt = { left: [0, -6], right: [0, 6], up: [6, 0], down: [-6, 0] }[dir] || [0, 0];
    tile.style.setProperty("--rx", tilt[0] + "deg");
    tile.style.setProperty("--ry", tilt[1] + "deg");
    tile.style.setProperty("--gx", (50 + tilt[1] * 5) + "%");
    tile.style.setProperty("--gy", (30 - tilt[0] * 3) + "%");
    clearTimeout(tiltTimer);
    tiltTimer = setTimeout(function () {
      tile.style.setProperty("--rx", "0deg");
      tile.style.setProperty("--ry", "0deg");
    }, 180);

    // Top shelf.
    var item = rows[pos.row].items[pos.col];
    $("shelfKicker").textContent = rows[pos.row].title;
    $("shelfTitle").textContent = item.label;
    $("shelfSub").textContent = item.sub || "";
    var bd = $("backdrop");
    bd.style.setProperty("--c1", item.colors[0]);
    bd.style.setProperty("--c2", item.colors[1]);
  }

  function move(dir) {
    var r = pos.row, c = pos.col;
    if (dir === "left") c = Math.max(0, c - 1);
    if (dir === "right") c = Math.min(rows[r].items.length - 1, c + 1);
    if (dir === "up" || dir === "down") {
      colMemory[r] = c;
      r = dir === "up" ? Math.max(0, r - 1) : Math.min(rows.length - 1, r + 1);
      c = Math.min(colMemory[r], rows[r].items.length - 1);
    }
    if (r === pos.row && c === pos.col) return;
    pos.row = r; pos.col = c;
    updateFocus(dir);
  }

  /* ---------- Acciones ---------- */
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  function launchApp(item) {
    if (!isTizen) { toast("Vista previa: abriría " + item.label); return; }
    try {
      tizen.application.launch(item.appId,
        function () {},
        function (e) { toast("No se pudo abrir " + item.label + " (" + e.name + ")"); });
    } catch (e) {
      toast("Error: " + e.message);
    }
  }

  function switchToHdmi(item) {
    if (!isTizen || !tizen.tvwindow) { toast("Vista previa: cambiaría a HDMI " + item.port); return; }
    var fail = function (e) { exitPassthrough(); toast("No se pudo cambiar a HDMI " + item.port + " (" + (e && e.name) + ")"); };
    try {
      tizen.tvwindow.getAvailableWindows(function () {
        tizen.tvwindow.setSource({ type: "HDMI", number: item.port }, function () {
          tizen.tvwindow.show(function () { enterPassthrough(); }, fail,
            ["0px", "0px", "1920px", "1080px"], "MAIN");
        }, fail, "MAIN");
      }, fail);
    } catch (e) { fail(e); }
  }

  function enterPassthrough() {
    inPassthrough = true;
    document.body.classList.add("passthrough");
  }

  function exitPassthrough() {
    inPassthrough = false;
    document.body.classList.remove("passthrough");
    if (isTizen && tizen.tvwindow) {
      try { tizen.tvwindow.hide(function () {}, function () {}, "MAIN"); } catch (e) {}
    }
  }

  function activate() {
    var item = rows[pos.row].items[pos.col];
    if (item.type === "hdmi") switchToHdmi(item);
    else launchApp(item);
  }

  /* ---------- Teclas ---------- */
  function onKey(e) {
    if (inPassthrough) {
      if (e.keyCode === KEY.BACK || e.keyCode === KEY.ESC) { exitPassthrough(); e.preventDefault(); }
      return;
    }
    switch (e.keyCode) {
      case KEY.LEFT: move("left"); break;
      case KEY.RIGHT: move("right"); break;
      case KEY.UP: move("up"); break;
      case KEY.DOWN: move("down"); break;
      case KEY.ENTER: activate(); break;
      case KEY.BACK:
        // En la pantalla de inicio, "Atrás" no sale hacia Smart Hub.
        break;
      default: return;
    }
    e.preventDefault();
  }

  /* ---------- Reloj ---------- */
  function tick() {
    var d = new Date();
    var h = d.getHours(), m = d.getMinutes();
    $("clock").textContent = (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }

  /* ---------- Inicio ---------- */
  function init() {
    render();
    updateFocus();
    tick(); setInterval(tick, 10000);
    document.addEventListener("keydown", onKey);

    if (isTizen) {
      try {
        tizen.tvinputdevice.registerKeyBatch(["MediaPlayPause", "ColorF0Red", "ColorF1Green"]);
      } catch (e) {}
      // Al volver a la app (por ejemplo, desde Netflix), regresa a la pantalla de inicio.
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden && inPassthrough) exitPassthrough();
      });
    }
  }

  init();
})();
