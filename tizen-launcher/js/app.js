(function () {
  "use strict";

  var KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, BACK: 10009, ESC: 27 };
  var COLS = 5;
  var ROW_H = 290;
  var isTizen = typeof window.tizen !== "undefined";

  var $ = function (id) { return document.getElementById(id); };

  /* Filas: 0 = dock, 1..n = cuadrícula en grupos de 5. */
  var rows = [LAUNCHER_CONFIG.dock];
  for (var i = 0; i < LAUNCHER_CONFIG.grid.length; i += COLS) rows.push(LAUNCHER_CONFIG.grid.slice(i, i + COLS));

  var pos = { row: 0, col: 0 };
  var inPassthrough = false;
  var tiltTimer = null, shelfTimer = null;
  var artFront = $("artA"), artBack = $("artB");
  var currentShelfId = null;

  /* ---------- Render ---------- */
  function iconBackground(item) {
    if (item.icon) return "url('" + item.icon + "')";
    var c = item.colors;
    return "radial-gradient(120% 140% at 20% 0%, " + c[2] + " 0%, transparent 55%)," +
           "linear-gradient(160deg, " + c[1] + " 0%, " + c[0] + " 100%)";
  }

  function render() {
    var home = $("home");
    rows.forEach(function (items, r) {
      var rowEl = document.createElement("div");
      rowEl.className = "row";
      items.forEach(function (item, c) {
        var cell = document.createElement("div");
        cell.className = "cell";
        cell.id = "cell-" + r + "-" + c;
        var glyph = item.icon ? "" :
          '<span class="glyph' + (item.glyph.length > 3 ? " small" : "") + '">' + item.glyph + "</span>";
        cell.innerHTML =
          '<div class="icon" style="background-image:' + iconBackground(item) + '">' +
            glyph + '<span class="gloss"></span><span class="edge"></span>' +
          '</div><div class="label">' + item.label + "</div>";
        rowEl.appendChild(cell);
      });
      home.appendChild(rowEl);
    });
  }

  /* ---------- Top shelf ---------- */
  function paintArt(el, item) {
    var c = item.colors;
    if (item.shelf) {
      el.style.backgroundImage = "url('" + item.shelf + "')";
      el.innerHTML = '<div class="grain"></div>';
      return;
    }
    el.style.backgroundImage =
      "radial-gradient(900px 700px at 78% 22%, " + c[2] + " 0%, transparent 60%)," +
      "radial-gradient(1100px 900px at 100% 100%, " + c[1] + " 0%, transparent 65%)," +
      "radial-gradient(800px 800px at 10% 0%, " + c[1] + "aa 0%, transparent 60%)," +
      "linear-gradient(180deg, " + c[0] + " 0%, #000 100%)";
    el.innerHTML = '<div class="art-glyph">' + item.glyph + '</div><div class="grain"></div>';
  }

  function setShelf(item) {
    if (currentShelfId === item.id) return;
    currentShelfId = item.id;

    // Fundido cruzado entre dos capas.
    paintArt(artBack, item);
    artBack.classList.add("visible");
    artFront.classList.remove("visible");
    var t = artFront; artFront = artBack; artBack = t;

    var info = $("shelfInfo");
    info.classList.add("swap");
    clearTimeout(shelfTimer);
    shelfTimer = setTimeout(function () {
      $("shelfKicker").textContent = item.kicker || "";
      $("shelfTitle").textContent = item.label;
      $("shelfDesc").textContent = item.desc || "";
      $("shelfAction").textContent = item.action || "Abrir";
      $("shelfMeta").textContent = item.meta || "";
      info.classList.remove("swap");
    }, 160);
  }

  /* ---------- Foco ---------- */
  function updateFocus(dir) {
    var prev = document.querySelector(".cell.focused");
    if (prev) prev.classList.remove("focused");

    var cell = $("cell-" + pos.row + "-" + pos.col);
    cell.classList.add("focused");

    // Desplazamiento vertical: el dock queda sobre el top shelf; la cuadrícula sube.
    var inGrid = pos.row > 0;
    document.body.classList.toggle("in-grid", inGrid);
    var shift = inGrid ? (560 + Math.max(0, pos.row - 1) * ROW_H) : 0;
    $("home").style.transform = "translateY(" + (-shift) + "px)";

    // Inclinación tipo parallax hacia la dirección del movimiento.
    var icon = cell.querySelector(".icon");
    var t = { left: [0, -7, -8, 0, 30], right: [0, 7, 8, 0, 70], up: [7, 0, 0, -6, 50], down: [-7, 0, 0, 6, 50] }[dir] || [0, 0, 0, 0, 50];
    icon.style.setProperty("--rx", t[0] + "deg");
    icon.style.setProperty("--ry", t[1] + "deg");
    icon.style.setProperty("--px", t[2] + "px");
    icon.style.setProperty("--py", t[3] + "px");
    icon.style.setProperty("--gloss-x", t[4] + "%");
    clearTimeout(tiltTimer);
    tiltTimer = setTimeout(function () {
      icon.style.setProperty("--rx", "0deg");
      icon.style.setProperty("--ry", "0deg");
      icon.style.setProperty("--px", "0px");
      icon.style.setProperty("--py", "0px");
      icon.style.setProperty("--gloss-x", "50%");
    }, 220);

    // En tvOS el top shelf solo cambia con la fila superior.
    if (!inGrid) setShelf(rows[0][pos.col]);
  }

  function move(dir) {
    var r = pos.row, c = pos.col;
    if (dir === "left") c = Math.max(0, c - 1);
    if (dir === "right") c = Math.min(rows[r].length - 1, c + 1);
    if (dir === "up") r = Math.max(0, r - 1);
    if (dir === "down") r = Math.min(rows.length - 1, r + 1);
    c = Math.min(c, rows[r].length - 1);
    if (r === pos.row && c === pos.col) return;
    pos.row = r; pos.col = c;
    updateFocus(dir);
  }

  /* ---------- Acciones ---------- */
  function toast(msg) {
    var el = $("toast");
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(function () { el.classList.remove("show"); }, 2600);
  }

  function launchApp(item) {
    if (!isTizen) { toast("Vista previa: abriría " + item.label); return; }
    try {
      tizen.application.launch(item.appId, function () {},
        function (e) { toast("No se pudo abrir " + item.label + " (" + e.name + ")"); });
    } catch (e) { toast("Error: " + e.message); }
  }

  function switchToHdmi(item) {
    if (!isTizen || !tizen.tvwindow) { toast("Vista previa: cambiaría a HDMI " + item.port); return; }
    var fail = function (e) { exitPassthrough(); toast("No se pudo cambiar a HDMI " + item.port + " (" + (e && e.name) + ")"); };
    try {
      tizen.tvwindow.setSource({ type: "HDMI", number: item.port }, function () {
        tizen.tvwindow.show(enterPassthrough, fail, ["0px", "0px", "1920px", "1080px"], "MAIN");
      }, fail, "MAIN");
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
    var item = rows[pos.row][pos.col];
    var icon = $("cell-" + pos.row + "-" + pos.col).querySelector(".icon");
    // Pequeño "clic" visual como en tvOS.
    icon.style.transition = "transform 90ms ease";
    icon.style.transform = "scale(1.08)";
    setTimeout(function () { icon.style.transition = ""; icon.style.transform = ""; }, 110);
    if (item.type === "hdmi") switchToHdmi(item); else launchApp(item);
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
      case KEY.BACK: case KEY.ESC:
        // Atrás en la cuadrícula vuelve al dock; en el dock no sale a Smart Hub.
        if (pos.row > 0) { pos.row = 0; pos.col = Math.min(pos.col, rows[0].length - 1); updateFocus("up"); }
        break;
      default: return;
    }
    e.preventDefault();
  }

  /* ---------- Inicio ---------- */
  render();
  updateFocus();
  document.addEventListener("keydown", onKey);
  if (isTizen) {
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && inPassthrough) exitPassthrough();
    });
  }
})();
