/*
 * Nosso mundo: uma florestinha que cresce com o que o casal faz no app.
 *
 * O mundo não é salvo como imagem. Ele é redesenhado a partir de:
 *   gratitude/*  -> uma flor por gratidão escrita
 *   done/*       -> um animal por encontro marcado como "Fizemos!"
 *   mundo/*      -> sementes registradas pelas outras atividades (ids fixos, sem duplicar):
 *                   arvore (escuta completa), canto (quebra-cabeça completo),
 *                   borboleta (verdade ou desafio cumprido), passaro (sintonia no Mais Provável)
 * As posições vêm de sorteios com semente fixa, então o mundo é igual nos dois celulares.
 */
(function () {
  "use strict";

  var KINDS = { arvore: 1, canto: 1, borboleta: 1, passaro: 1, memoria: 1 };
  var ANIMALS = ["coelho", "raposa", "capivara", "veado", "tartaruga", "esquilo", "ouriço", "coruja"];
  var ANIMAL_TXT = { coelho: "um coelho", raposa: "uma raposa", capivara: "uma capivara", veado: "um veado", tartaruga: "uma tartaruga", esquilo: "um esquilo", "ouriço": "um ouriço", coruja: "uma coruja" };
  var SPECIALS = ["cogumelos", "pedras com musgo", "um banco", "um balanço", "uma fogueira", "uma casinha de passarinho", "uma rede", "lanternas"];
  var MILESTONES = [
    { t: 5, name: "Riacho" }, { t: 12, name: "Ponte" }, { t: 20, name: "Cachoeira" },
    { t: 35, name: "Lago com patos" }, { t: 50, name: "Arco-íris" }, { t: 75, name: "Cabana" }, { t: 100, name: "Árvore da vida" }
  ];
  var CAP = { flower: 110, tree: 40, animal: 16, special: 8, butterfly: 12, bird: 10, memory: 18 };

  var S = { ok: undefined, db: null, myKey: null, people: {}, grat: [], done: [], ev: [], known: {}, sent: {} };
  var mainHost = document.getElementById("app-mundo");
  var miniHost = window.NossoDiaMini || null;

  /* ---------- Utilidades ---------- */
  function safe(id) { return String(id).replace(/[^A-Za-z0-9_\-.~:@+]/g, "_").slice(0, 120); }
  function docId(s) { return String(s).replace(/[^A-Za-z0-9_\-]/g, "_").slice(0, 100); }
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v === false || v == null) continue;
      if (k === "class") el.className = v;
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
      else if (k === "text") el.textContent = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    (kids || []).forEach(function (c) {
      if (c == null || c === false) return;
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return el;
  }
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function n1(x) { return Math.round(x * 10) / 10; }
  function fmtDay(ms) { try { return new Date(ms).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }); } catch (e) { return ""; } }
  function nameOf(uid) {
    if (uid === S.myKey) return "você";
    var p = S.people[uid];
    return p && p.name ? String(p.name).slice(0, 24) : "alguém";
  }

  /* ---------- Geografia fixa do mundo (viewBox 1000 × 600) ---------- */
  var HORIZON = 300;
  var CTRL = [[792, 300], [735, 338], [640, 372], [560, 410], [505, 455], [420, 505], [300, 548], [170, 600], [120, 640]];
  function catmull(pts, seg) {
    var out = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (var s = 0; s < seg; s++) {
        var t = s / seg, t2 = t * t, t3 = t2 * t;
        out.push([
          0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
        ]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  var RIVER = catmull(CTRL, 14);
  function hw(y) { return 6 + Math.max(0, y - HORIZON) / 300 * 30; }
  var LAKE = { x: 150, y: 562, rx: 155, ry: 50 };
  var CABIN = { x: 112, y: 405 };
  var BIGTREE = { x: 318, y: 372 };
  var SAPLING = { x: 470, y: 440 };
  var BRIDGE_I = 46;

  function blocked(x, y, margin) {
    if (x > 690 && y < 350) return true;                                   // penhasco
    var dx = (x - LAKE.x) / (LAKE.rx + margin), dy = (y - LAKE.y) / (LAKE.ry + margin * 0.6);
    if (dx * dx + dy * dy < 1) return true;                                // lago
    if (Math.hypot(x - CABIN.x, y - CABIN.y) < 95) return true;
    if (Math.hypot(x - BIGTREE.x, y - BIGTREE.y) < 85) return true;
    if (Math.hypot(x - SAPLING.x, y - SAPLING.y) < 30) return true;
    for (var i = 0; i < RIVER.length; i++) {
      var p = RIVER[i];
      if (Math.abs(p[1] - y) > 80) continue;
      if (Math.hypot(p[0] - x, p[1] - y) < hw(p[1]) + margin) return true;
    }
    return false;
  }
  function pool(seed, n, ymin, ymax, spacing, margin) {
    var r = rng(seed), out = [], tries = 0;
    while (out.length < n && tries < 6000) {
      tries++;
      var x = 30 + r() * 940, y = ymin + r() * (ymax - ymin);
      if (blocked(x, y, margin)) continue;
      var sp = spacing * (0.55 + (y - HORIZON) / 300 * 0.7), ok = true;
      for (var j = 0; j < out.length; j++) if (Math.hypot(out[j].x - x, out[j].y - y) < sp) { ok = false; break; }
      if (ok) out.push({ x: x, y: y, r: r(), f: r() < 0.5 });
    }
    return out;
  }
  var P = {
    tree: pool(11, CAP.tree, HORIZON + 18, 470, 46, 26),
    flower: pool(23, CAP.flower, 362, 596, 17, 10),
    animal: pool(37, CAP.animal, 405, 585, 62, 18),
    special: pool(41, CAP.special, 410, 580, 70, 20),
    bush: pool(53, 7, 330, 560, 60, 14),
    tuft: pool(67, 46, 315, 598, 22, 6),
    fly: pool(79, CAP.butterfly * 2, 330, 520, 40, 0)
  };
  function scaleAt(y) { return 0.42 + Math.max(0, y - HORIZON) / 300 * 0.78; }

  /* ---------- Desenhos (origem nos pés do elemento) ---------- */
  function g(x, y, s, flip, inner, cls) {
    return '<g transform="translate(' + n1(x) + " " + n1(y) + ") scale(" + (flip ? -s : s).toFixed(3) + " " + s.toFixed(3) + ')"' + (cls ? ' class="' + cls + '"' : "") + ">" + inner + "</g>";
  }
  function c(x, y, r, fill, extra) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '"' + (extra || "") + "/>"; }
  function e(x, y, rx, ry, fill, extra) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"' + (extra || "") + "/>"; }
  function pth(d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '"' + (extra || "") + "/>"; }
  function shadow(w) { return e(0, 0, w, w * 0.22, "rgba(20,40,20,0.18)"); }

  var TREE_KINDS = ["round", "pine", "pink", "round2", "ipe", "pine"];
  function tree(kind, delay) {
    var sway = ' style="animation-delay:' + delay + 's"';
    var trunk = pth("M-5 0 L-4 -34 L4 -34 L5 0 Z", "#7a4b2a");
    if (kind === "pine") {
      return shadow(22) + pth("M-4 0 L-3 -16 L3 -16 L4 0 Z", "#6b4226") +
        '<g class="w-sway"' + sway + ">" +
        pth("M0 -72 L-28 -14 L28 -14 Z", "#2e7d4f") + pth("M0 -92 L-22 -44 L22 -44 Z", "#379a5c") + pth("M0 -110 L-15 -72 L15 -72 Z", "#46b06c") + "</g>";
    }
    var cols = kind === "pink" ? ["#f48fb1", "#f7a8c4", "#fbc4d8"] : kind === "ipe" ? ["#f2b705", "#f9cf3a", "#ffe07a"] : kind === "round2" ? ["#3f9e57", "#55b56a", "#71c77e"] : ["#4caf50", "#66bb6a", "#81c784"];
    var dots = kind === "pink" || kind === "ipe" ? c(-10, -50, 2.4, "#fff8") + c(8, -62, 2.4, "#fff8") + c(14, -44, 2, "#fff8") : "";
    return shadow(26) + trunk + '<g class="w-sway"' + sway + ">" +
      c(-17, -44, 20, cols[0]) + c(17, -46, 20, cols[0]) + c(0, -64, 24, cols[1]) + c(-6, -70, 12, cols[2]) + dots + "</g>";
  }
  function sapling() {
    return shadow(10) + pth("M-1.5 0 L-1 -22 L1 -22 L1.5 0 Z", "#7a4b2a") + pth("M0 -18 C-14 -22 -14 -34 -2 -30 Z", "#66bb6a") + pth("M0 -22 C12 -28 14 -38 2 -34 Z", "#4caf50");
  }
  function bush(i) {
    var col = ["#4f9d4a", "#5fb158", "#3f8c45"][i % 3];
    return shadow(16) + c(-10, -8, 10, col) + c(8, -9, 11, col) + c(0, -15, 11, "#6cc164");
  }
  var FLOWER_COLS = ["#ff6f91", "#ffc75f", "#f9f871", "#c493ff", "#ffffff", "#ff9671", "#6ec6ff"];
  function flower(i, r) {
    var col = FLOWER_COLS[(i + Math.floor(r * 7)) % FLOWER_COLS.length], out = '<line x1="0" y1="0" x2="0" y2="-13" stroke="#3e8e41" stroke-width="1.6"/>';
    out += pth("M0 -6 C-6 -9 -7 -4 0 -4 Z", "#4caf50");
    for (var k = 0; k < 5; k++) { var a = k / 5 * Math.PI * 2; out += c(n1(Math.cos(a) * 3.6), n1(-16 + Math.sin(a) * 3.6), 3, col); }
    return out + c(0, -16, 2, "#ffb300");
  }
  function animal(kind) {
    var eye = function (x, y) { return c(x, y, 1.2, "#222"); };
    switch (kind) {
      case "coelho": return shadow(12) + e(0, -9, 11, 8, "#f1e4d6") + e(7, -27, 2.2, 7, "#f1e4d6") + e(11, -26, 2.2, 7, "#ead7c3") + c(10, -17, 6.2, "#f1e4d6") + c(-11, -10, 3.4, "#fff") + eye(12.5, -18) + c(15.5, -16, 1, "#f48fb1");
      case "raposa": return shadow(15) + e(-17, -12, 10, 5, "#e8743b", ' transform="rotate(-18 -17 -12)"') + c(-25, -15, 3.5, "#fff") + e(0, -10, 13, 7, "#e8743b") + e(2, -6, 7, 3, "#fbe3cf") +
        pth("M9 -20 L11 -30 L15 -21 Z", "#d4622b") + pth("M14 -20 L18 -29 L20 -19 Z", "#d4622b") + c(14, -15, 6.5, "#e8743b") + pth("M18 -15 L25 -12 L18 -10 Z", "#fbe3cf") + c(25, -12, 1.2, "#222") + eye(15, -17) +
        '<rect x="-8" y="-5" width="2.6" height="5" fill="#6b3a1e"/><rect x="6" y="-5" width="2.6" height="5" fill="#6b3a1e"/>';
      case "capivara": return shadow(17) + e(0, -11, 16, 9, "#a07850") + '<rect x="9" y="-22" width="15" height="11" rx="5" fill="#a07850"/>' + c(12, -22, 2.4, "#8a6440") + eye(17, -18) + c(23, -16, 1, "#4a3424") +
        '<rect x="-10" y="-4" width="4" height="4" fill="#7d5c3c"/><rect x="7" y="-4" width="4" height="4" fill="#7d5c3c"/>';
      case "veado": return shadow(15) + '<g fill="#8b5a2b"><rect x="-10" y="-15" width="2.4" height="15"/><rect x="-5" y="-15" width="2.4" height="15"/><rect x="6" y="-15" width="2.4" height="15"/><rect x="10" y="-15" width="2.4" height="15"/></g>' +
        e(0, -19, 15, 7, "#b07a45") + c(-5, -21, 1.3, "#f3e3cc") + c(2, -22, 1.3, "#f3e3cc") + pth("M10 -22 L14 -36 L19 -35 L15 -21 Z", "#b07a45") + e(19, -37, 6, 4.2, "#b07a45") + eye(20, -38) + c(25, -36, 1.1, "#3a2414") +
        '<path d="M15 -40 L13 -48 M13 -45 L10 -48 M19 -40 L21 -48 M21 -45 L24 -47" stroke="#6b4423" stroke-width="1.3" fill="none"/>';
      case "tartaruga": return shadow(13) + c(13, -5, 3.6, "#8bc34a") + eye(14.5, -6) + e(-8, -1.5, 3, 2, "#8bc34a") + e(8, -1.5, 3, 2, "#8bc34a") + pth("M-12 -2 C-12 -16 12 -16 12 -2 Z", "#4c9a4f") +
        '<path d="M-6 -3 L-3 -10 L3 -10 L6 -3 M-3 -10 L0 -13 L3 -10" stroke="#2e6b35" stroke-width="1" fill="none"/>';
      case "esquilo": return shadow(10) + pth("M-4 -4 C-20 -6 -20 -30 -8 -28 C-14 -22 -10 -14 -4 -10 Z", "#b5653a") + e(0, -9, 7, 6.5, "#a0522d") + c(6, -16, 4.8, "#a0522d") + pth("M4 -20 L5 -25 L8 -20 Z", "#8b4513") + eye(8, -17) + e(2, -7, 3, 3.5, "#e8c8a8");
      case "ouriço": return shadow(12) + pth("M-12 0 L-14 -5 L-10 -7 L-11 -12 L-6 -11 L-5 -16 L0 -13 L3 -17 L6 -12 L10 -13 L9 -8 L12 0 Z", "#6d4c41") + e(10, -4, 5, 3.5, "#e3c4a0") + c(15, -4, 1.3, "#222") + eye(11, -5.5);
      case "coruja": return '<rect x="-9" y="-6" width="18" height="6" rx="2" fill="#7a4b2a"/>' + e(0, -18, 9, 12, "#8d6e63") + e(0, -14, 5.5, 7, "#d7ccc8") + pth("M-8 -27 L-6 -33 L-3 -28 Z", "#8d6e63") + pth("M8 -27 L6 -33 L3 -28 Z", "#8d6e63") +
        c(-3.6, -23, 3.3, "#fff") + c(3.6, -23, 3.3, "#fff") + c(-3.6, -23, 1.6, "#222") + c(3.6, -23, 1.6, "#222") + pth("M-1 -20 L1 -20 L0 -18 Z", "#f9a825");
    }
    return "";
  }
  function duck() { return e(0, -4, 9, 5, "#fffbea") + c(7, -10, 4, "#fffbea") + pth("M10 -10 L15 -9 L10 -8 Z", "#ff9800") + c(8, -11, 0.9, "#222") + e(0, 1, 11, 2, "rgba(255,255,255,0.35)"); }
  function special(i, night) {
    switch (i % SPECIALS.length) {
      case 0: return shadow(14) + [[-9, 0, 1], [3, 2, 1.3], [12, -1, 0.9]].map(function (m) {
        return '<g transform="translate(' + m[0] + " " + m[1] + ") scale(" + m[2] + ')">' + '<rect x="-2" y="-9" width="4" height="9" fill="#f3e9dc"/>' + pth("M-8 -8 C-8 -18 8 -18 8 -8 Z", "#e53935") + c(-3, -12, 1.4, "#fff") + c(3, -13, 1.2, "#fff") + "</g>";
      }).join("");
      case 1: return shadow(18) + e(-8, -6, 12, 7, "#9e9e9e") + e(9, -5, 9, 6, "#bdbdbd") + e(-6, -11, 7, 3, "#7cb342") + e(10, -9, 4, 2, "#8bc34a");
      case 2: return shadow(18) + '<g fill="#8d5a33"><rect x="-17" y="-12" width="34" height="4" rx="1.5"/><rect x="-17" y="-20" width="34" height="3.5" rx="1.5"/><rect x="-14" y="-12" width="3" height="12"/><rect x="11" y="-12" width="3" height="12"/></g>';
      case 3: return shadow(18) + '<path d="M-16 0 L-10 -40 L-4 0 M16 0 L10 -40 L4 0 M-12 -40 L12 -40" stroke="#8d5a33" stroke-width="3" fill="none"/>' +
        '<g class="w-swing"><path d="M-4 -40 L-4 -12 M4 -40 L4 -12" stroke="#5d4037" stroke-width="1"/><rect x="-6" y="-12" width="12" height="3" fill="#a1887f"/></g>';
      case 4: return '<g fill="#6d4c41"><rect x="-12" y="-4" width="24" height="4" rx="2" transform="rotate(14)"/><rect x="-12" y="-4" width="24" height="4" rx="2" transform="rotate(-14)"/></g>' +
        '<g class="w-flicker">' + pth("M0 -24 C8 -14 7 -4 0 -4 C-7 -4 -8 -14 0 -24 Z", "#ff9800") + pth("M0 -16 C4 -10 3 -5 0 -5 C-3 -5 -4 -10 0 -16 Z", "#ffeb3b") + "</g>" + (night ? c(0, -10, 26, "url(#glow)") : "");
      case 5: return shadow(8) + '<rect x="-1.5" y="-34" width="3" height="34" fill="#8d5a33"/><rect x="-8" y="-46" width="16" height="13" fill="#ffcc80"/>' + pth("M-11 -45 L0 -54 L11 -45 Z", "#e57373") + c(0, -40, 2.6, "#5d4037");
      case 6: return shadow(22) + '<rect x="-24" y="-30" width="3" height="30" fill="#8d5a33"/><rect x="21" y="-30" width="3" height="30" fill="#8d5a33"/>' +
        '<path d="M-21 -26 Q0 -6 21 -26" stroke="#e57373" stroke-width="5" fill="none"/><path d="M-21 -26 Q0 -8 21 -26" stroke="#ffcdd2" stroke-width="1.5" fill="none"/>';
      default: return '<rect x="-28" y="-34" width="2.5" height="34" fill="#8d5a33"/><rect x="26" y="-34" width="2.5" height="34" fill="#8d5a33"/><path d="M-26 -32 Q0 -18 26 -32" stroke="#5d4037" stroke-width="0.8" fill="none"/>' +
        [-16, -5, 6, 17].map(function (x, k) { var y = -32 + 14 * (1 - Math.pow(x / 26, 2)) - 1; return '<rect x="' + (x - 3) + '" y="' + n1(y) + '" width="6" height="8" rx="2" fill="' + ["#ffb74d", "#f06292", "#ffd54f", "#81d4fa"][k] + '"/>' + (night ? c(x, n1(y + 4), 9, "url(#glow)") : ""); }).join("");
    }
  }
  function cabin(night) {
    return shadow(48) + '<rect x="-38" y="-40" width="76" height="40" fill="#a1683a"/><g stroke="#8a5530" stroke-width="2">' +
      [-32, -24, -16, -8].map(function (y) { return '<line x1="-38" y1="' + y + '" x2="38" y2="' + y + '"/>'; }).join("") + "</g>" +
      pth("M-46 -38 L0 -72 L46 -38 Z", "#c0504d") + '<rect x="18" y="-80" width="8" height="18" fill="#795548"/>' +
      '<rect x="-8" y="-24" width="14" height="24" fill="#5d4037"/><rect x="-30" y="-30" width="14" height="12" fill="' + (night ? "#ffd54f" : "#bbdefb") + '"/><rect x="18" y="-30" width="14" height="12" fill="' + (night ? "#ffd54f" : "#bbdefb") + '"/>' +
      (night ? c(-23, -24, 30, "url(#glow)") + c(25, -24, 30, "url(#glow)") : "") +
      '<g class="w-smoke">' + c(22, -88, 4, "#eee", ' opacity="0.7"') + c(26, -98, 5, "#eee", ' opacity="0.5"') + c(22, -110, 6, "#eee", ' opacity="0.3"') + "</g>";
  }
  function bigTree() {
    return shadow(60) + pth("M-12 0 C-10 -30 -14 -60 -8 -90 L8 -90 C14 -60 10 -30 12 0 Z", "#6d4426") + pth("M-12 0 L-26 4 L-10 -6 Z M12 0 L26 4 L10 -6 Z", "#6d4426") +
      '<g class="w-sway slow">' + c(-40, -100, 36, "#2e7d4f") + c(40, -104, 36, "#2e7d4f") + c(0, -136, 44, "#388e3c") + c(-26, -140, 26, "#43a047") + c(28, -142, 26, "#4caf50") + c(0, -168, 26, "#66bb6a") +
      c(-20, -110, 3, "#ffeb3b") + c(18, -130, 3, "#ffeb3b") + c(-4, -156, 3, "#ffeb3b") + c(32, -100, 3, "#ffeb3b") + "</g>";
  }

  function memoryTree() {
    return shadow(40) + pth("M-8 0 C-7 -24 -10 -48 -5 -70 L5 -70 C10 -48 7 -24 8 0 Z", "#7a4b2a") +
      '<g class="w-sway slow">' + c(-30, -82, 28, "#f48fb1") + c(30, -84, 28, "#f48fb1") + c(0, -108, 34, "#f7a8c4") + c(-18, -112, 18, "#fbc4d8") + c(20, -114, 18, "#fbc4d8") + "</g>";
  }
  // Corações pendurados: um por história relembrada (posições fixas, as mesmas nos dois celulares).
  var HEART_SPOTS = (function () {
    var r = rng(131), out = [];
    while (out.length < CAP.memory) {
      var a = r() * Math.PI * 2, d = Math.sqrt(r());
      out.push([n1(Math.cos(a) * d * 46), n1(-102 + Math.sin(a) * d * 34)]);
    }
    return out;
  })();
  function hearts(n, big) {
    var s = big ? 1.25 : 1, out = "";
    HEART_SPOTS.slice(0, Math.min(n, CAP.memory)).forEach(function (p, i) {
      var x = p[0] * s, y = p[1] * s - (big ? 30 : 0);
      out += '<line x1="' + x + '" y1="' + n1(y - 9) + '" x2="' + x + '" y2="' + n1(y - 3) + '" stroke="#8d5a33" stroke-width="0.8"/>' +
        '<g class="w-heart" style="animation-delay:' + n1(i * 0.37 % 3) + 's"><path transform="translate(' + x + " " + y + ')" d="M0 6 C-8 0 -7 -6 -3.5 -6 C-1.5 -6 0 -4.5 0 -3 C0 -4.5 1.5 -6 3.5 -6 C7 -6 8 0 0 6 Z" fill="#e53965" stroke="#fff" stroke-width="0.8"/></g>';
    });
    return out;
  }

  /* ---------- Cena completa ---------- */
  function counts() {
    var ev = { arvore: [], canto: [], borboleta: [], passaro: [], memoria: [] };
    S.ev.forEach(function (x) { if (ev[x.kind]) ev[x.kind].push(x); });
    var o = { flower: S.grat.length, animal: S.done.length, tree: ev.arvore.length, special: ev.canto.length, butterfly: ev.borboleta.length, bird: ev.passaro.length, memory: ev.memoria.length };
    o.total = o.flower + o.animal + o.tree + o.special + o.butterfly + o.bird + o.memory;
    return o;
  }
  function phase() {
    var hr = new Date().getHours();
    if (hr >= 20 || hr < 6) return "night";
    if (hr < 8 || hr >= 17) return "golden";
    return "day";
  }

  function scene(k, ph) {
    var T = k.total, night = ph === "night", out = [];
    var sky = night ? ["#0b1033", "#1c2a63", "#3a4f8c"] : ph === "golden" ? ["#ffb88c", "#ffd3a5", "#fde8c8"] : ["#79c3f3", "#a8daf9", "#dff3ff"];
    out.push('<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + sky[0] + '"/><stop offset="0.6" stop-color="' + sky[1] + '"/><stop offset="1" stop-color="' + sky[2] + '"/></linearGradient>' +
      '<linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd16a"/><stop offset="1" stop-color="#5fae4b"/></linearGradient>' +
      '<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd0f5"/><stop offset="1" stop-color="#3f9ad8"/></linearGradient>' +
      '<linearGradient id="fall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bfe9ff"/><stop offset="0.5" stop-color="#ffffff"/><stop offset="1" stop-color="#9ad8f7"/></linearGradient>' +
      '<radialGradient id="glow"><stop offset="0" stop-color="#fff3b0" stop-opacity="0.85"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient></defs>');
    out.push('<rect width="1000" height="600" fill="url(#sky)"/>');
    if (night) {
      var rs = rng(5);
      for (var i = 0; i < 70; i++) out.push(c(n1(rs() * 1000), n1(rs() * 260), n1(rs() * 1.4 + 0.4), "#fff", ' class="w-twinkle" style="animation-delay:' + n1(rs() * 4) + 's"'));
      out.push(c(150, 80, 30, "#fdf6d8") + c(162, 72, 27, sky[0]));
    } else {
      out.push(c(ph === "golden" ? 820 : 160, ph === "golden" ? 210 : 86, 38, ph === "golden" ? "#ffcf6b" : "#fff3b0"));
      [[180, 70, 1], [520, 110, 0.8], [820, 60, 1.1]].forEach(function (cl, j) {
        out.push('<g class="w-cloud" style="animation-delay:-' + (j * 22) + 's"><g transform="translate(' + cl[0] + " " + cl[1] + ") scale(" + cl[2] + ')" opacity="0.92">' + e(0, 0, 46, 16, "#fff") + c(-18, -8, 16, "#fff") + c(12, -14, 20, "#fff") + "</g></g>");
      });
    }
    // montanhas e colinas ao fundo
    out.push(pth("M0 300 L0 210 L90 160 L170 205 L260 140 L350 200 L430 170 L520 230 L600 175 L690 220 L760 190 L1000 240 L1000 300 Z", "#9db8d6"));
    out.push(pth("M0 300 L0 250 C120 225 220 270 330 250 C440 232 560 270 680 255 C780 244 880 262 1000 250 L1000 300 Z", "#a8d88a"));
    if (T >= 50 && !night) out.push('<g opacity="0.45">' + ["#ff5252", "#ffb74d", "#fff176", "#81c784", "#64b5f6", "#9575cd"].map(function (col, j) { return '<path d="M650 300 A' + (150 - j * 9) + " " + (130 - j * 9) + ' 0 0 1 ' + (950 - j * 18) + ' 300" stroke="' + col + '" stroke-width="9" fill="none"/>'; }).join("") + "</g>");
    // penhasco e cachoeira
    if (T >= 20) {
      out.push(pth("M690 345 L700 250 L740 190 L800 150 L880 170 L960 200 L1000 230 L1000 345 Z", "#8a9a7b"));
      out.push(pth("M700 250 L740 190 L800 150 L880 170 L960 200 L1000 230 L1000 250 L930 225 L860 200 L800 182 L750 215 Z", "#6fa860"));
      out.push('<rect x="778" y="175" width="28" height="128" fill="url(#fall)"/><g class="w-fall"><path d="M784 175 L784 303 M792 175 L792 303 M800 175 L800 303" stroke="#fff" stroke-width="2" stroke-dasharray="10 14" opacity="0.8"/></g>');
      out.push(c(792, 304, 16, "#fff", ' opacity="0.55"') + c(778, 300, 10, "#fff", ' opacity="0.5"') + c(808, 300, 11, "#fff", ' opacity="0.5"'));
    }
    // chão
    out.push('<rect x="0" y="295" width="1000" height="305" fill="url(#grass)"/>');
    out.push(pth("M0 300 C150 290 300 312 500 302 C700 292 850 308 1000 298 L1000 312 L0 312 Z", "#9ad977", ' opacity="0.7"'));
    P.tuft.forEach(function (p) { var s = scaleAt(p.y); out.push('<path d="M' + n1(p.x - 4 * s) + " " + n1(p.y) + " l" + n1(2 * s) + " " + n1(-7 * s) + " l" + n1(2 * s) + " " + n1(7 * s) + " l" + n1(2 * s) + " " + n1(-9 * s) + " l" + n1(2 * s) + " " + n1(9 * s) + '" stroke="#4e9a3f" stroke-width="' + n1(1.2 * s + 0.4) + '" fill="none"/>'); });
    // lago
    if (T >= 35) {
      out.push(e(LAKE.x, LAKE.y, LAKE.rx + 8, LAKE.ry + 6, "#c8b28a") + e(LAKE.x, LAKE.y, LAKE.rx, LAKE.ry, "url(#water)"));
      out.push('<g class="w-ripple">' + e(LAKE.x - 40, LAKE.y - 6, 30, 5, "none", ' stroke="#fff" stroke-opacity="0.5"') + e(LAKE.x + 50, LAKE.y + 12, 24, 4, "none", ' stroke="#fff" stroke-opacity="0.4"') + "</g>");
      [[LAKE.x - 70, LAKE.y + 8, 1.4, false], [LAKE.x + 30, LAKE.y - 10, 1.2, true], [LAKE.x + 85, LAKE.y + 16, 1.3, false]].forEach(function (d, j) { out.push('<g class="w-bob" style="animation-delay:' + j * 0.7 + 's">' + g(d[0], d[1], d[2], d[3], duck()) + "</g>"); });
    }
    // rio
    if (T >= 5) {
      var L = [], R = [];
      for (var q = 0; q < RIVER.length; q++) {
        var a = RIVER[Math.max(0, q - 1)], b = RIVER[Math.min(RIVER.length - 1, q + 1)], tx = b[0] - a[0], ty = b[1] - a[1], len = Math.hypot(tx, ty) || 1;
        var nx = -ty / len, ny = tx / len, w = hw(RIVER[q][1]);
        L.push(n1(RIVER[q][0] + nx * w) + " " + n1(RIVER[q][1] + ny * w));
        R.unshift(n1(RIVER[q][0] - nx * w) + " " + n1(RIVER[q][1] - ny * w));
      }
      out.push(pth("M" + L.join(" L") + " L" + R.join(" L") + " Z", "url(#water)", ' stroke="#c8b28a" stroke-width="3"'));
      out.push('<path class="w-flow" d="M' + RIVER.map(function (p) { return n1(p[0]) + " " + n1(p[1]); }).join(" L") + '" stroke="#e6f7ff" stroke-width="2.5" fill="none" stroke-dasharray="14 22" opacity="0.8"/>');
      if (T < 20) out.push(e(796, 300, 16, 6, "#9e9e9e") + e(780, 298, 8, 4, "#bdbdbd"));
      if (T >= 12) {
        var bp = RIVER[BRIDGE_I], bq = RIVER[BRIDGE_I + 1], ang = Math.atan2(bq[1] - bp[1], bq[0] - bp[0]) * 180 / Math.PI + 90, bw = hw(bp[1]) + 12;
        var deck = "M" + (-bw) + " 0 Q0 -10 " + bw + " 0";
        out.push('<g transform="translate(' + n1(bp[0]) + " " + n1(bp[1]) + ") rotate(" + n1(ang) + ')">' +
          '<path d="' + deck + '" transform="translate(0 6)" stroke="#6d4426" stroke-width="3" fill="none"/>' +
          '<path d="' + deck + '" stroke="#c99a63" stroke-width="16" fill="none"/>' +
          '<path d="' + deck + '" stroke="#8d5a33" stroke-width="16" stroke-dasharray="2 5" fill="none"/>' +
          '<path d="' + deck + '" transform="translate(0 -9)" stroke="#6d4426" stroke-width="2.5" fill="none"/>' +
          [-0.85, -0.3, 0.3, 0.85].map(function (f) { var x = n1(f * bw), y = n1(-10 * (1 - f * f) - 9); return '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + n1(y + 9) + '" stroke="#6d4426" stroke-width="2.5"/>'; }).join("") + "</g>");
      }
    }
    // elementos com profundidade
    var items = [];
    P.bush.forEach(function (p, i) { items.push({ y: p.y, s: g(p.x, p.y, scaleAt(p.y), p.f, bush(i)) }); });
    if (!k.tree) items.push({ y: SAPLING.y, s: g(SAPLING.x, SAPLING.y, scaleAt(SAPLING.y) * 1.2, false, sapling()) });
    P.tree.slice(0, Math.min(k.tree, CAP.tree)).forEach(function (p, i) { items.push({ y: p.y, s: g(p.x, p.y, scaleAt(p.y) * (0.85 + p.r * 0.35), p.f, tree(TREE_KINDS[(i + Math.floor(p.r * 3)) % TREE_KINDS.length], n1(p.r * 3))) }); });
    P.flower.slice(0, Math.min(k.flower, CAP.flower)).forEach(function (p, i) { items.push({ y: p.y, s: g(p.x, p.y, scaleAt(p.y), false, flower(i, p.r)) }); });
    P.animal.slice(0, Math.min(k.animal, CAP.animal)).forEach(function (p, i) { items.push({ y: p.y, s: '<g class="w-breathe" style="animation-delay:' + n1(p.r * 3) + 's">' + g(p.x, p.y, scaleAt(p.y) * 1.15, p.f, animal(ANIMALS[i % ANIMALS.length])) + "</g>" }); });
    P.special.slice(0, Math.min(k.special, CAP.special)).forEach(function (p, i) { items.push({ y: p.y, s: g(p.x, p.y, scaleAt(p.y) * 1.1, p.f, special(i, night)) }); });
    if (T >= 75) items.push({ y: CABIN.y, s: g(CABIN.x, CABIN.y, scaleAt(CABIN.y) * 1.25, false, cabin(night)) });
    // A árvore das lembranças nasce com a primeira história relembrada e vira a árvore da vida aos 100.
    if (T >= 100) items.push({ y: BIGTREE.y, s: g(BIGTREE.x, BIGTREE.y, scaleAt(BIGTREE.y) * 1.1, false, bigTree() + hearts(k.memory, true), "") });
    else if (k.memory) items.push({ y: BIGTREE.y, s: g(BIGTREE.x, BIGTREE.y, scaleAt(BIGTREE.y) * 1.1, false, memoryTree() + hearts(k.memory, false)) });
    items.sort(function (a, b) { return a.y - b.y; }).forEach(function (it) { out.push(it.s); });
    // luz do momento do dia
    if (night) out.push('<rect width="1000" height="600" fill="#0b1640" opacity="0.42"/>');
    else if (ph === "golden") out.push('<rect width="1000" height="600" fill="#ff9e57" opacity="0.1"/>');
    if (night) {
      if (T >= 75) out.push(c(CABIN.x - 18, CABIN.y - 30, 34, "url(#glow)") + c(CABIN.x + 22, CABIN.y - 30, 34, "url(#glow)"));
      P.fly.slice(0, Math.min(k.butterfly, CAP.butterfly) * 2).forEach(function (p) { out.push('<g class="w-firefly" style="animation-delay:' + n1(p.r * 3) + 's">' + c(n1(p.x), n1(p.y - 20), 7, "url(#glow)") + c(n1(p.x), n1(p.y - 20), 1.8, "#fff7a8") + "</g>"); });
    } else {
      P.fly.slice(0, Math.min(k.butterfly, CAP.butterfly)).forEach(function (p, i) {
        var col = ["#ff8a65", "#ba68c8", "#4fc3f7", "#fff176"][i % 4], s = scaleAt(p.y);
        out.push('<g class="w-drift" style="animation-delay:-' + n1(p.r * 8) + 's"><g transform="translate(' + n1(p.x) + " " + n1(p.y - 26) + ") scale(" + s.toFixed(2) + ')"><g class="w-flap" style="animation-delay:' + n1(p.r) + 's">' + e(-4, -2, 4.5, 3.5, col) + e(4, -2, 4.5, 3.5, col) + e(-3, 2.5, 3, 2.5, col) + e(3, 2.5, 3, 2.5, col) + '</g><rect x="-0.6" y="-4" width="1.2" height="8" fill="#333"/></g></g>');
      });
      var rb = rng(91);
      for (var bi = 0; bi < Math.min(k.bird, CAP.bird); bi++) {
        var bx = 80 + rb() * 820, by = 40 + rb() * 170, bs = 0.7 + rb() * 0.6;
        out.push('<g class="w-bird" style="animation-delay:-' + n1(rb() * 30) + 's"><g transform="translate(' + n1(bx) + " " + n1(by) + ") scale(" + bs.toFixed(2) + ')"><path class="w-wing" d="M-9 -2 Q-4 -7 0 0 Q4 -7 9 -2" stroke="#37474f" stroke-width="2" fill="none" stroke-linecap="round"/></g></g>');
      }
    }
    return out.join("");
  }

  /* ---------- Interface ---------- */
  function nextMilestone(T) {
    for (var i = 0; i < MILESTONES.length; i++) if (T < MILESTONES[i].t) return { m: MILESTONES[i], prev: i ? MILESTONES[i - 1].t : 0 };
    return null;
  }
  // Cada desenho recebe ids próprios para os degradês: a miniatura e a aba Mundo coexistem na página,
  // e um degradê definido dentro de um SVG escondido não pinta o outro.
  function svg(k, ph, view, label, uid) {
    var box = h("div", { class: "w-frame", role: "img", "aria-label": label });
    var art = scene(k, ph).replace(/id="(\w+)"/g, 'id="' + uid + '-$1"').replace(/url\(#(\w+)\)/g, "url(#" + uid + "-$1)");
    box.innerHTML = '<svg viewBox="' + view + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + art + "</svg>";
    return box;
  }
  function describe(k) {
    return "Nosso mundo: " + k.flower + " flores, " + k.tree + " árvores, " + k.animal + " animais, " + k.special + " cantinhos especiais, " + k.butterfly + " borboletas, " + k.bird + " passarinhos e " + k.memory + " lembranças na árvore das lembranças.";
  }
  function journal() {
    var list = [];
    S.grat.forEach(function (x) { list.push({ at: +x.at || 0, icon: "🌸", text: "Nasceu uma flor: " + (x.uid === S.myKey ? "sua gratidão" : "gratidão de " + nameOf(x.uid)) }); });
    S.done.slice().sort(function (a, b) { return (+a.at || 0) - (+b.at || 0); }).forEach(function (x, i) {
      list.push({ at: +x.at || 0, icon: "🦊", text: "Chegou " + ANIMAL_TXT[ANIMALS[i % ANIMALS.length]] + ": " + String(x.kind || "encontro").slice(0, 40) + (x.title ? " (" + String(x.title).slice(0, 40) + ")" : "") });
    });
    var sp = 0;
    S.ev.slice().sort(function (a, b) { return a.at - b.at; }).forEach(function (x) {
      if (x.kind === "arvore") list.push({ at: x.at, icon: "🌳", text: "Uma árvore cresceu: 5 minutos de escuta" });
      else if (x.kind === "canto") list.push({ at: x.at, icon: "🍄", text: "Cantinho novo, " + SPECIALS[(sp++) % SPECIALS.length] + ": quebra-cabeça completo" });
      else if (x.kind === "borboleta") list.push({ at: x.at, icon: "🦋", text: "Borboletas: " + nameOf(x.by) + " cumpriu uma carta do verdade ou desafio" });
      else if (x.kind === "passaro") list.push({ at: x.at, icon: "🐦", text: "Um passarinho: sintonia no Mais Provável" });
      else if (x.kind === "memoria") list.push({ at: x.at, icon: "💞", text: "Um coração na árvore das lembranças: vocês reviveram uma história" });
    });
    return list.sort(function (a, b) { return b.at - a.at; }).slice(0, 10);
  }

  function renderMain(k, ph) {
    if (!mainHost) return;
    var kids = [h("div", { class: "w-head" }, [h("h1", { text: "Nosso mundo" }), h("p", { class: "sub", text: "Cada coisa que vocês fazem juntas no app vira natureza aqui. As duas veem o mesmo mundinho." })])];
    if (S.ok === false) kids.push(h("p", { class: "note", text: "O mundo cresce quando os dados compartilhados estão ligados. Veja em Ajustes, no fim da página." }));
    kids.push(svg(k, ph, "0 0 1000 600", describe(k), "wm"));
    kids.push(h("div", { class: "w-chips" }, [
      ["🌸", k.flower, "flores"], ["🌳", k.tree, "árvores"], ["🦊", k.animal, "animais"], ["🍄", k.special, "cantinhos"], ["🦋", k.butterfly, "borboletas"], ["🐦", k.bird, "passarinhos"], ["💞", k.memory, "lembranças"]
    ].map(function (x) { return h("span", { class: "w-chip" }, [h("span", { "aria-hidden": "true", text: x[0] }), h("b", { text: String(x[1]) }), " " + x[2]]); })));
    var nm = nextMilestone(k.total);
    kids.push(h("section", { class: "w-card" }, nm ? [
      h("span", { class: "lbl", text: "Próxima surpresa" }),
      h("p", { class: "w-next" }, [h("b", { text: nm.m.name }), " em " + (nm.m.t - k.total) + (nm.m.t - k.total === 1 ? " atividade" : " atividades")]),
      h("div", { class: "w-bar", role: "progressbar", "aria-valuemin": String(nm.prev), "aria-valuemax": String(nm.m.t), "aria-valuenow": String(k.total) }, [h("i", { style: "width:" + Math.round((k.total - nm.prev) / (nm.m.t - nm.prev) * 100) + "%" })]),
      h("p", { class: "sub", text: "Já apareceram: " + (MILESTONES.filter(function (m) { return k.total >= m.t; }).map(function (m) { return m.name.toLowerCase(); }).join(", ") || "ainda nada, mas a mudinha está esperando") + "." })
    ] : [h("span", { class: "lbl", text: "Mundo completo" }), h("p", { class: "w-next", text: "Todas as surpresas apareceram. Continuem plantando!" })]));
    kids.push(h("section", { class: "w-card" }, [
      h("span", { class: "lbl", text: "Como o mundo cresce" }),
      h("ul", { class: "w-how" }, [
        ["🌸", "Cada gratidão escrita vira uma flor"],
        ["🌳", "Cada 5 minutos de escuta completos (as duas falaram) vira uma árvore"],
        ["🦊", "Cada encontro marcado como “Fizemos!” traz um animal"],
        ["🍄", "Cada quebra-cabeça completo cria um cantinho especial"],
        ["🦋", "Cada verdade ou desafio cumprido solta borboletas (vaga-lumes à noite)"],
        ["🐦", "Cada sintonia no Mais Provável chama um passarinho"],
        ["💞", "Cada “Lembra quando…?” revivido pelas duas pendura um coração na árvore das lembranças"],
        ["✨", "Com o total de atividades aparecem riacho, ponte, cachoeira, lago, arco-íris, cabana e a árvore da vida"]
      ].map(function (x) { return h("li", null, [h("span", { "aria-hidden": "true", text: x[0] }), x[1]]); }))
    ]));
    var j = journal();
    kids.push(h("section", { class: "w-card" }, [h("span", { class: "lbl", text: "Diário do mundo" })].concat(j.length
      ? [h("ul", { class: "w-log" }, j.map(function (x) { return h("li", null, [h("span", { "aria-hidden": "true", text: x.icon }), h("span", { text: x.text }), h("small", { text: x.at ? fmtDay(x.at) : "" })]); }))]
      : [h("p", { class: "sub", text: "Ainda está tudo quietinho. Escrevam uma gratidão na aba Hoje para nascer a primeira flor." })])));
    mainHost.textContent = "";
    kids.forEach(function (x) { mainHost.appendChild(x); });
  }

  function renderMini(k, ph) {
    if (!miniHost) return;
    var nm = nextMilestone(k.total);
    miniHost.textContent = "";
    miniHost.appendChild(h("button", { type: "button", class: "w-mini", "aria-label": "Abrir nosso mundo. " + describe(k), onclick: function () { if (window.NossoDiaTabs) window.NossoDiaTabs.show("mundo", true); } }, [
      svg(k, ph, "0 170 1000 430", "", "wn"),
      h("span", { class: "w-mini-cap" }, [
        h("b", { text: "Nosso mundo" }),
        h("span", { text: k.total + (k.total === 1 ? " coisa viva" : " coisas vivas") + (nm ? " · " + nm.m.name.toLowerCase() + " em " + (nm.m.t - k.total) : "") }),
        h("span", { class: "w-go", "aria-hidden": "true", text: "Visitar →" })
      ])
    ]));
  }

  var queued = false;
  function render() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      var k = counts(), ph = phase();
      renderMain(k, ph); renderMini(k, ph);
    });
  }

  /* ---------- API usada pelos outros pedaços do app ---------- */
  var pending = [];
  function write(kind, id) {
    var key = docId(id);
    if (!key || S.known[key] || S.sent[key]) return;
    S.sent[key] = true;
    S.db.doc("mundo/" + key).set({ kind: kind, at: Date.now(), by: S.myKey }).catch(function () { delete S.sent[key]; });
  }
  window.NossoMundo = {
    grow: function (kind, id) {
      if (!KINDS[kind] || !id) return;
      if (S.db) write(kind, id); else if (S.ok !== false) pending.push([kind, id]);
    }
  };

  render();
  setInterval(render, 10 * 60 * 1000);

  (async function () {
    var cl = window.claude;
    if (!cl || !cl.use) { S.ok = false; render(); return; }
    try {
      var db = await cl.use("db"), user = await cl.use("user");
      var id = user ? await user.id() : null;
      if (!db || !id) { S.ok = false; render(); return; }
      S.db = db; S.myKey = safe(id); S.ok = true;
      pending.splice(0).forEach(function (p) { write(p[0], p[1]); });
      db.collection("people").onSnapshot(function (snap) { var o = {}; snap.docs.forEach(function (d) { o[d.id] = d.data(); }); S.people = o; render(); }, function () {});
      db.collection("gratitude").orderBy("date", "desc").limit(1000).onSnapshot(function (snap) {
        S.grat = snap.docs.map(function (d) { return d.data() || {}; }); render();
      }, function () {});
      db.collection("done").orderBy("at", "desc").limit(500).onSnapshot(function (snap) {
        S.done = snap.docs.map(function (d) { return d.data() || {}; }); render();
      }, function () {});
      db.collection("mundo").limit(2000).onSnapshot(function (snap) {
        var known = {}, ev = [];
        snap.docs.forEach(function (d) {
          var x = d.data() || {};
          known[d.id] = true;
          if (KINDS[x.kind]) ev.push({ kind: x.kind, at: +x.at || 0, by: typeof x.by === "string" ? x.by : "" });
        });
        S.known = known; S.ev = ev; render();
      }, function () {});
    } catch (e) { S.ok = false; render(); }
  })();
})();
