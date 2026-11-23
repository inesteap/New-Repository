/*
 * Configuración del launcher.
 *
 * dock: fila superior (sobre el "top shelf"). Pon aquí lo que más usas.
 * grid: el resto de las apps, en filas de 5.
 *
 * Campos de cada ficha:
 *   type    "hdmi" (cambia la entrada) o "app" (abre una app de Tizen)
 *   port    número de HDMI (solo hdmi)
 *   appId   App ID de Tizen (solo app; ver README para obtener los tuyos)
 *   label   nombre que aparece bajo el ícono enfocado
 *   glyph   texto del ícono si no hay imagen
 *   logo    (automático) se usa img/logos/<id>.png si existe: PNG transparente,
 *           de preferencia blanco, centrado sobre el color del ícono.
 *           Puedes indicar otra ruta con logo: "img/logos/archivo.png".
 *   icon    (opcional) imagen 400x240 en img/icons/ que reemplaza todo el ícono
 *   shelf   (opcional) imagen 1920x1080 en img/shelf/, fondo del top shelf
 *   colors  [oscuro, medio, brillo] para el ícono y el fondo generado
 *   kicker, desc, action, meta: textos del top shelf
 */
var LAUNCHER_CONFIG = {
  dock: [
    { id: "ps5", type: "hdmi", port: 1, label: "PlayStation 5", glyph: "PS5",
      colors: ["#030a1f", "#0f3bb5", "#4f8bff"],
      kicker: "Consola", desc: "Retoma tus juegos justo donde los dejaste.",
      action: "Jugar", meta: "HDMI 1 · 4K · 120 Hz · VRR" },
    { id: "switch", type: "hdmi", port: 2, label: "Nintendo Switch 2", glyph: "S2",
      colors: ["#1a0204", "#c4121c", "#ff5a5f"],
      kicker: "Consola", desc: "Modo TV desde el dock.",
      action: "Jugar", meta: "HDMI 2 · 4K · HDR" },
    { id: "pc", type: "hdmi", port: 3, label: "PC Gamer", glyph: "PC",
      colors: ["#050507", "#2a2d36", "#8a93a6"],
      kicker: "Computadora", desc: "Formd T1. Steam Big Picture en pantalla completa.",
      action: "Abrir", meta: "HDMI 3 · 4:4:4 · G-Sync Compatible" },
    { id: "appletv", type: "app", appId: "3201807016597", label: "Apple TV", glyph: "tv",
      colors: ["#000000", "#1d1d1f", "#5b5b60"],
      kicker: "App", desc: "Series, películas y deportes.", action: "Abrir", meta: "" },
    { id: "netflix", type: "app", appId: "3201907018807", label: "Netflix", glyph: "N",
      colors: ["#000000", "#0b0b0b", "#2a2a2a"],
      kicker: "App", desc: "Series y películas.", action: "Abrir", meta: "" }
  ],
  grid: [
    { id: "youtube", type: "app", appId: "111299001912", label: "YouTube", glyph: "▶",
      colors: ["#140000", "#c4001f", "#ff3b4f"], kicker: "App", desc: "Videos.", action: "Abrir" },
    { id: "disney", type: "app", appId: "3201901017640", label: "Disney+", glyph: "D+",
      colors: ["#020616", "#10287a", "#3c74e0"], kicker: "App", desc: "Streaming.", action: "Abrir" },
    { id: "prime", type: "app", appId: "3201910019365", label: "Prime Video", glyph: "prime",
      colors: ["#00111a", "#00597a", "#1fb6e8"], kicker: "App", desc: "Streaming.", action: "Abrir" },
    { id: "applemusic", type: "app", appId: "3201908019041", label: "Apple Music", glyph: "♪",
      colors: ["#1a0208", "#c4153a", "#ff4e6b"], kicker: "App", desc: "Música, radio y letras.", action: "Abrir" },
    { id: "spotify", type: "app", appId: "3201606009684", label: "Spotify", glyph: "♫",
      colors: ["#010d05", "#117a37", "#1ed760"], kicker: "App", desc: "Música y podcasts.", action: "Abrir" },
    { id: "plex", type: "app", appId: "3201512006963", label: "Plex", glyph: "›",
      colors: ["#0d0a02", "#5a4106", "#e5a00d"], kicker: "App", desc: "Tu biblioteca local.", action: "Abrir" }
  ]
};
