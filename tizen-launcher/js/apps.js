/*
 * Configuración del launcher. Edita este archivo para cambiar fichas.
 *
 * type "hdmi": cambia la entrada del televisor (número de puerto HDMI 1-4).
 * type "app":  abre una app instalada en Tizen por su App ID.
 *
 * Los App ID provienen de listas públicas de la comunidad y pueden cambiar
 * entre regiones o versiones de firmware. Si una ficha no abre, revisa el
 * README para obtener el ID correcto de tu televisor.
 */
var LAUNCHER_CONFIG = {
  rows: [
    {
      title: "Juegos",
      items: [
        { id: "ps5",    type: "hdmi", port: 1, label: "PlayStation 5",   glyph: "PS5", sub: "HDMI 1 · 4K 120 Hz · VRR",  colors: ["#0b1d4a", "#2457d6"] },
        { id: "switch", type: "hdmi", port: 2, label: "Nintendo Switch 2", glyph: "S2",  sub: "HDMI 2 · Dock",            colors: ["#5a0d12", "#e5222c"] },
        { id: "pc",     type: "hdmi", port: 3, label: "PC Gamer",        glyph: "PC",  sub: "HDMI 3 · Formd T1 · 4:4:4", colors: ["#121212", "#4b4b52"] }
      ]
    },
    {
      title: "Apps",
      items: [
        { id: "appletv", type: "app", appId: "3201807016597", label: "Apple TV",    glyph: "tv",  sub: "Series y películas", colors: ["#1c1c1e", "#3a3a3c"] },
        { id: "netflix", type: "app", appId: "3201907018807", label: "Netflix",     glyph: "N",   sub: "Streaming",          colors: ["#141414", "#b20710"] },
        { id: "youtube", type: "app", appId: "111299001912",  label: "YouTube",     glyph: "▶",   sub: "Videos",             colors: ["#2a0000", "#ff0033"] },
        { id: "disney",  type: "app", appId: "3201901017640", label: "Disney+",     glyph: "D+",  sub: "Streaming",          colors: ["#04103a", "#1a3fae"] },
        { id: "prime",   type: "app", appId: "3201910019365", label: "Prime Video", glyph: "PV",  sub: "Streaming",          colors: ["#04202e", "#00a8e1"] },
        { id: "spotify", type: "app", appId: "3201606009684", label: "Spotify",     glyph: "♫",   sub: "Música",             colors: ["#06240f", "#1db954"] },
        { id: "plex",    type: "app", appId: "3201512006963", label: "Plex",        glyph: "›",   sub: "Biblioteca local",   colors: ["#1f1f1f", "#e5a00d"] }
      ]
    }
  ]
};
