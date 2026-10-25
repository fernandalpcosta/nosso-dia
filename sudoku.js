/*
 * Sudoku a dois: o mesmo tabuleiro nos dois celulares, resolvido em equipe.
 *
 * Cada número tem a cor de quem colocou, e a casa que a outra está olhando aparece marcada.
 * As anotações (numerinhos de rascunho) são de cada uma e ficam só no próprio aparelho.
 *
 * Jogo atual:   sudoku/atual                  { round, level, puzzle, solution, by, at }
 * Casas:        sudoku/atual/cells/{round}_{i} { round, idx, v, uid, at, hint }  (v = 0 apaga)
 * Onde cada uma está: sudoku/atual/cursor/{pessoa} { round, idx, at }
 */
(function () {
  "use strict";

  var root = document.getElementById("app-sudoku");
  if (!root) return;
  var LEVELS = { facil: ["Fácil", 40], medio: ["Médio", 32], dificil: ["Difícil", 26] };
  var OKROUND = /^[a-z0-9]{1,12}$/;
  var CURSOR_FRESH = 3 * 60 * 1000;
  var S = {
    ok: undefined, db: null, myKey: null, people: {}, meta: null, cells: {}, cursors: {},
    sel: null, notesMode: false, notes: {}, showErr: true, level: "facil", setup: false, busy: false, note: "", sentCursor: null
  };

  /* ---------- Utilidades ---------- */
  function safe(id) { return String(id).replace(/[^A-Za-z0-9_\-.~:@+]/g, "_").slice(0, 120); }
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
  function dur(ms) {
    var m = Math.max(1, Math.round(ms / 60000));
    if (m < 60) return m + (m === 1 ? " minuto" : " minutos");
    var hr = Math.floor(m / 60), r = m % 60;
    return hr + (hr === 1 ? " hora" : " horas") + (r ? " e " + r + (r === 1 ? " minuto" : " minutos") : "");
  }
  function nameOf(key) {
    var p = S.people[key];
    return p && p.name ? String(p.name).slice(0, 24) : "Outra pessoa";
  }
  function otherKey() {
    for (var k in S.people) if (k !== S.myKey) return k;
    return null;
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ---------- Gerador (solução única) ---------- */
  var BOX = [];
  for (var bi = 0; bi < 81; bi++) BOX.push(Math.floor(Math.floor(bi / 9) / 3) * 3 + Math.floor((bi % 9) / 3));
  function bitCount(m) { var c = 0; while (m) { m &= m - 1; c++; } return c; }
  // Resolve a grade (array de 81, 0 = vazia) e conta soluções até "limit". Com fill=true, sorteia a ordem dos dígitos.
  function solve(g, limit, fill) {
    var rows = [0, 0, 0, 0, 0, 0, 0, 0, 0], cols = rows.slice(), boxes = rows.slice(), count = 0;
    for (var i = 0; i < 81; i++) if (g[i]) { var b = 1 << g[i]; rows[Math.floor(i / 9)] |= b; cols[i % 9] |= b; boxes[BOX[i]] |= b; }
    function rec() {
      var best = -1, bestMask = 0, bestN = 10;
      for (var i = 0; i < 81; i++) {
        if (g[i]) continue;
        var m = ~(rows[Math.floor(i / 9)] | cols[i % 9] | boxes[BOX[i]]) & 0x3fe, n = bitCount(m);
        if (n < bestN) { best = i; bestMask = m; bestN = n; if (n <= 1) break; }
      }
      if (best < 0) { count++; return count >= limit; }
      if (!bestN) return false;
      var ds = [];
      for (var d = 1; d <= 9; d++) if (bestMask & (1 << d)) ds.push(d);
      if (fill) shuffle(ds);
      var r = Math.floor(best / 9), c = best % 9, bx = BOX[best];
      for (var k = 0; k < ds.length; k++) {
        var bit = 1 << ds[k];
        g[best] = ds[k]; rows[r] |= bit; cols[c] |= bit; boxes[bx] |= bit;
        if (rec()) return true;
        rows[r] &= ~bit; cols[c] &= ~bit; boxes[bx] &= ~bit;
      }
      g[best] = 0;
      return false;
    }
    rec();
    return count;
  }
  function generate(clues) {
    var full = new Array(81).fill(0);
    solve(full, 1, true);
    var puz = full.slice(), left = 81;
    shuffle(Array.from({ length: 81 }, function (_, i) { return i; })).forEach(function (i) {
      if (left <= clues) return;
      var keep = puz[i];
      puz[i] = 0;
      if (solve(puz.slice(), 2, false) !== 1) puz[i] = keep; else left--;
    });
    return { puzzle: puz.join(""), solution: full.join("") };
  }

  /* ---------- Estado do tabuleiro ---------- */
  function given(i) { return S.meta.puzzle[i] !== "0"; }
  function valueAt(i) {
    if (given(i)) return +S.meta.puzzle[i];
    var c = S.cells[i];
    return c ? c.v : 0;
  }
  function isWrong(i) { var v = valueAt(i); return v && !given(i) && v !== +S.meta.solution[i]; }
  function solved() {
    for (var i = 0; i < 81; i++) if (valueAt(i) !== +S.meta.solution[i]) return false;
    return true;
  }
  function notesKey() { return "nosso-dia-sudoku-notas:" + (S.meta ? S.meta.round : ""); }
  function loadNotes() {
    S.notes = {};
    try { var o = JSON.parse(localStorage.getItem(notesKey()) || "{}"); if (o && typeof o === "object") S.notes = o; } catch (e) {}
  }
  function saveNotes() { try { localStorage.setItem(notesKey(), JSON.stringify(S.notes)); } catch (e) {} }

  /* ---------- Ações ---------- */
  function write(i, v, hint) {
    if (!S.meta || !S.db || given(i)) return;
    var m = S.meta, prev = S.cells[i];
    var doc = { round: m.round, idx: i, v: v, uid: S.myKey, at: Date.now() };
    if (hint) doc.hint = true;
    S.cells[i] = doc; S.note = "";
    if (v && S.notes[i]) { delete S.notes[i]; saveNotes(); }
    render();
    S.db.doc("sudoku/atual/cells/" + m.round + "_" + i).set(doc).catch(function () {
      if (S.cells[i] === doc) { if (prev) S.cells[i] = prev; else delete S.cells[i]; }
      S.note = "Não consegui salvar o número. Confira a internet.";
      render();
    });
  }
  function press(d) {
    var i = S.sel;
    if (i == null) { S.note = "Toque numa casa primeiro."; render(); return; }
    if (given(i)) { S.note = "Esse número já veio no jogo."; render(); return; }
    if (S.notesMode && d) {
      if (valueAt(i)) return;
      S.notes[i] = (S.notes[i] || 0) ^ (1 << d);
      if (!S.notes[i]) delete S.notes[i];
      saveNotes(); render(); return;
    }
    if (!d && !valueAt(i) && S.notes[i]) { delete S.notes[i]; saveNotes(); render(); return; }
    write(i, d === valueAt(i) ? 0 : d);
  }
  function hint() {
    var empties = [];
    for (var i = 0; i < 81; i++) if (valueAt(i) !== +S.meta.solution[i]) empties.push(i);
    if (!empties.length) return;
    var i = S.sel != null && empties.indexOf(S.sel) >= 0 ? S.sel : empties[Math.floor(Math.random() * empties.length)];
    S.sel = i; sendCursor();
    write(i, +S.meta.solution[i], true);
  }
  function select(i) {
    S.sel = S.sel === i ? null : i; S.note = "";
    sendCursor(); render();
  }
  function sendCursor() {
    if (!S.db || !S.meta) return;
    var key = S.meta.round + ":" + S.sel;
    if (S.sentCursor === key) return;
    S.sentCursor = key;
    S.db.doc("sudoku/atual/cursor/" + S.myKey).set({ round: S.meta.round, idx: S.sel == null ? -1 : S.sel, at: Date.now() }).catch(function () {});
  }
  async function start() {
    if (!S.db || S.busy) return;
    S.busy = true; S.note = ""; render();
    await new Promise(function (r) { setTimeout(r, 30); });
    var g = generate(LEVELS[S.level][1]), round = Date.now().toString(36), old = Object.keys(S.cells).map(function (k) { return S.cells[k]; });
    try {
      await S.db.doc("sudoku/atual").set({ round: round, level: S.level, puzzle: g.puzzle, solution: g.solution, by: S.myKey, at: Date.now() });
      old.forEach(function (c) {
        if (c && OKROUND.test(String(c.round)) && typeof c.idx === "number") S.db.doc("sudoku/atual/cells/" + c.round + "_" + c.idx).delete().catch(function () {});
      });
      S.setup = false; S.sel = null; S.notesMode = false;
    } catch (e) {
      S.note = "Não consegui salvar. Confira a internet e tente de novo.";
    }
    S.busy = false; render();
  }

  /* ---------- Telas ---------- */
  function viewSetup() {
    var seg = h("div", { class: "seg", role: "group", "aria-label": "Dificuldade" });
    Object.keys(LEVELS).forEach(function (k) {
      seg.appendChild(h("button", { type: "button", "aria-pressed": S.level === k ? "true" : "false", text: LEVELS[k][0], onclick: function () { S.level = k; render(); } }));
    });
    var playing = S.meta && !solved();
    return h("div", { class: "panel" }, [
      h("div", null, [h("span", { class: "lbl", text: "Dificuldade" }), seg]),
      h("p", { class: "note", text: "Fácil começa com 40 números, médio com 32 e difícil com cerca de 26. Todo jogo tem uma única solução." }),
      playing ? h("p", { class: "note warn", text: "Começar um novo sudoku apaga o progresso do atual." }) : null,
      S.note ? h("p", { class: "note warn", role: "status", text: S.note }) : null,
      h("div", { class: "row" }, [
        h("button", { type: "button", class: "btn-main grow", disabled: S.busy, text: S.busy ? "Preparando…" : "Começar", onclick: start }),
        S.meta ? h("button", { type: "button", text: "Cancelar", onclick: function () { S.setup = false; S.note = ""; render(); } }) : null
      ])
    ]);
  }

  function viewGame() {
    var m = S.meta, done = solved(), out = [], ok = otherKey();
    var mine = 0, theirs = 0, filled = 0, last = m.at;
    for (var i = 0; i < 81; i++) {
      if (given(i)) continue;
      var c = S.cells[i];
      if (c && c.v) { if (c.at > last) last = c.at; }
      if (c && c.v && c.v === +m.solution[i]) { filled++; if (c.uid === S.myKey) mine++; else theirs++; }
    }
    var blanks = 0;
    for (var j = 0; j < 81; j++) if (!given(j)) blanks++;
    var other = null;
    Object.keys(S.cursors).forEach(function (k) {
      var x = S.cursors[k];
      if (k !== S.myKey && x.round === m.round && x.idx >= 0 && Date.now() - x.at < CURSOR_FRESH) other = { idx: x.idx, key: k };
    });

    out.push(h("div", { class: "sd-top" }, [
      h("span", { class: "chip", text: LEVELS[m.level][0] + " · " + filled + " de " + blanks }),
      h("span", { class: "legend" }, [h("i", { class: "sw a" }), "Você " + mine, h("i", { class: "sw b" }), nameOf(ok) + " " + theirs])
    ]));

    var sv = S.sel != null ? valueAt(S.sel) : 0;
    var board = h("div", { class: "sd-board" + (done ? " done" : ""), role: "grid", "aria-label": "Tabuleiro do sudoku" });
    for (var r = 0; r < 9; r++) {
      var row = h("div", { class: "sd-row", role: "row" });
      for (var col = 0; col < 9; col++) {
        (function (i, r, col) {
          var v = valueAt(i), c = S.cells[i], cls = ["sd-cell"];
          if (col % 3 === 2 && col < 8) cls.push("br");
          if (r % 3 === 2 && r < 8) cls.push("bb");
          if (given(i)) cls.push("given");
          else if (v) cls.push(c && c.uid === S.myKey ? "a" : "b");
          if (S.sel != null && !done) {
            if (i === S.sel) cls.push("sel");
            else if (Math.floor(i / 9) === Math.floor(S.sel / 9) || i % 9 === S.sel % 9 || BOX[i] === BOX[S.sel]) cls.push("peer");
            if (sv && v === sv && i !== S.sel) cls.push("same");
          }
          if (S.showErr && isWrong(i)) cls.push("wrong");
          if (other && other.idx === i && !done) cls.push("them");
          var kids = [];
          if (v) kids.push(String(v));
          else if (S.notes[i]) {
            var g = h("span", { class: "sd-notes", "aria-hidden": "true" });
            for (var d = 1; d <= 9; d++) g.appendChild(h("i", { text: S.notes[i] & (1 << d) ? String(d) : "" }));
            kids.push(g);
          }
          var label = "Linha " + (r + 1) + ", coluna " + (col + 1) + ": " + (v ? v + (given(i) ? " (do jogo)" : c && c.uid === S.myKey ? " (você)" : " (" + nameOf(c && c.uid) + ")") : "vazia") +
            (S.showErr && isWrong(i) ? ", errado" : "") + (other && other.idx === i ? ", " + nameOf(other.key) + " está aqui" : "");
          row.appendChild(h("button", {
            type: "button", class: cls.join(" "), role: "gridcell", "data-i": String(i), "aria-label": label,
            "aria-selected": i === S.sel ? "true" : "false", disabled: done,
            onclick: function () { select(i); }
          }, kids));
        })(r * 9 + col, r, col);
      }
      board.appendChild(row);
    }
    out.push(board);

    if (done) {
      if (window.NossoMundo) window.NossoMundo.grow("joaninha", "sudoku_" + m.round);
      out.push(h("div", { class: "panel pass", role: "status" }, [
        h("h2", { text: "Resolvido!" }),
        h("p", { class: "note", text: "Vocês fecharam o sudoku " + LEVELS[m.level][0].toLowerCase() + " em " + dur(last - m.at) + ". Você colocou " + mine + " e " + nameOf(ok) + " colocou " + theirs + ". Uma joaninha chegou ao mundinho de vocês." })
      ]));
    } else {
      var count = {};
      for (var q = 0; q < 81; q++) { var vv = valueAt(q); if (vv && vv === +m.solution[q]) count[vv] = (count[vv] || 0) + 1; }
      var pad = h("div", { class: "sd-pad", role: "group", "aria-label": "Números" });
      for (var d = 1; d <= 9; d++) {
        (function (d) {
          var full = count[d] === 9;
          pad.appendChild(h("button", { type: "button", class: full ? "full" : "", "aria-label": d + (full ? ", completo" : ""), onclick: function () { press(d); } }, [String(d)]));
        })(d);
      }
      out.push(h("p", { class: "note", role: "status", text: S.note || (other ? nameOf(other.key) + " está na casa marcada em coral." : S.sel == null ? "Toque numa casa e depois num número. No computador, dá para usar o teclado." : S.notesMode ? "Modo anotação: os números viram rascunho, só no seu celular." : "Toque num número para colocar. Tocar de novo no mesmo número apaga.") }));
      out.push(pad);
      out.push(h("div", { class: "row sd-tools" }, [
        h("button", { type: "button", "aria-pressed": S.notesMode ? "true" : "false", text: "Anotar", onclick: function () { S.notesMode = !S.notesMode; render(); } }),
        h("button", { type: "button", text: "Apagar", onclick: function () { press(0); } }),
        h("button", { type: "button", text: "Dica", onclick: hint }),
        h("button", { type: "button", "aria-pressed": S.showErr ? "true" : "false", text: "Mostrar erros", onclick: function () { S.showErr = !S.showErr; try { localStorage.setItem("nosso-dia-sudoku-erros", S.showErr ? "1" : "0"); } catch (e) {} render(); } })
      ]));
    }
    out.push(h("div", { class: "row" }, [h("button", { type: "button", text: "Novo sudoku", onclick: function () { S.setup = true; S.note = ""; render(); } })]));
    return out;
  }

  function render() {
    var hadFocus = root.contains(document.activeElement) && document.activeElement.getAttribute("data-i");
    var kids = [h("div", { class: "top" }, [h("div", { class: "brand" }, [h("i"), "Sudoku a dois"])])];
    kids.push(h("div", { class: "hero" }, [h("h2", { class: "pz-title", text: "Resolvam juntas" }), h("p", { text: "O mesmo tabuleiro nos dois celulares. Cada número tem a cor de quem colocou." }), window.NossoDiaPorque ? window.NossoDiaPorque.button("sudoku") : null]));
    if (S.ok === undefined) kids.push(h("p", { class: "note", text: "Abrindo o sudoku…" }));
    else if (S.ok === false) kids.push(h("p", { class: "note warn", text: "Para jogar juntas, os dados compartilhados precisam estar ligados. Veja em Ajustes, no fim da página." }));
    else if (!S.meta || S.setup) kids.push(viewSetup());
    else viewGame().forEach(function (k) { kids.push(k); });
    root.textContent = "";
    kids.forEach(function (k) { if (k) root.appendChild(k); });
    if (hadFocus && S.sel != null) { var el = root.querySelector('[data-i="' + S.sel + '"]'); if (el) el.focus(); }
  }

  // Teclado (computador): números, setas, apagar e "n" para anotar.
  document.addEventListener("keydown", function (e) {
    if (root.hidden || root.closest("[hidden]") || !S.meta || S.setup || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target && e.target.tagName;
    if (t === "INPUT" || t === "TEXTAREA" || document.querySelector(".why-sheet")) return;
    if (/^[1-9]$/.test(e.key)) { e.preventDefault(); press(+e.key); }
    else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") { e.preventDefault(); press(0); }
    else if (e.key === "n" || e.key === "N") { S.notesMode = !S.notesMode; render(); }
    else if (/^Arrow/.test(e.key)) {
      e.preventDefault();
      var i = S.sel == null ? 40 : S.sel, r = Math.floor(i / 9), c = i % 9;
      if (e.key === "ArrowUp") r = (r + 8) % 9; else if (e.key === "ArrowDown") r = (r + 1) % 9;
      else if (e.key === "ArrowLeft") c = (c + 8) % 9; else if (e.key === "ArrowRight") c = (c + 1) % 9;
      S.sel = r * 9 + c; S.note = ""; sendCursor(); render();
      var el = root.querySelector('[data-i="' + S.sel + '"]'); if (el) el.focus();
    }
  });

  try { S.showErr = localStorage.getItem("nosso-dia-sudoku-erros") !== "0"; } catch (e) {}
  render();
  // Atualiza de tempos em tempos para a marcação da outra sumir quando ela sai.
  setInterval(function () { if (S.meta && !root.closest("[hidden]")) render(); }, 60 * 1000);

  (async function () {
    var c = window.claude;
    if (!c || !c.use) { S.ok = false; render(); return; }
    try {
      var db = await c.use("db"), user = await c.use("user");
      var id = user ? await user.id() : null;
      if (!db || !id) { S.ok = false; render(); return; }
      S.db = db; S.myKey = safe(id); S.ok = true;
      var onErr = function () { S.note = "A conexão falhou. Recarregue a página."; render(); };
      var raw = [];
      function applyCells() {
        var o = {};
        if (S.meta) raw.forEach(function (x) {
          if (!x || x.round !== S.meta.round || typeof x.idx !== "number" || x.idx < 0 || x.idx > 80) return;
          var v = Math.floor(Number(x.v));
          if (!(v >= 0 && v <= 9)) return;
          if (!o[x.idx] || (+x.at || 0) >= (+o[x.idx].at || 0)) o[x.idx] = { round: x.round, idx: x.idx, v: v, uid: String(x.uid || ""), at: +x.at || 0, hint: !!x.hint };
        });
        S.cells = o;
      }
      db.doc("sudoku/atual").onSnapshot(function (snap) {
        var d = snap.exists ? snap.data() : null;
        if (d) {
          if (typeof d.round !== "string" || !OKROUND.test(d.round) || !/^[0-9]{81}$/.test(String(d.puzzle)) || !/^[1-9]{81}$/.test(String(d.solution)) || !LEVELS[d.level]) d = null;
          else d = { round: d.round, level: d.level, puzzle: d.puzzle, solution: d.solution, by: d.by, at: Number(d.at) || 0 };
        }
        var changed = !S.meta || !d || S.meta.round !== d.round;
        S.meta = d;
        if (changed) { S.sel = null; S.sentCursor = null; loadNotes(); }
        applyCells(); render();
      }, onErr);
      db.doc("sudoku/atual").collection("cells").onSnapshot(function (snap) {
        raw = snap.docs.map(function (x) { return x.data(); }); applyCells(); render();
      }, onErr);
      db.doc("sudoku/atual").collection("cursor").onSnapshot(function (snap) {
        var o = {};
        snap.docs.forEach(function (x) { var d = x.data() || {}; o[x.id] = { round: String(d.round || ""), idx: typeof d.idx === "number" ? d.idx : -1, at: +d.at || 0 }; });
        S.cursors = o; render();
      }, function () {});
      db.collection("people").onSnapshot(function (snap) {
        var o = {}; snap.docs.forEach(function (x) { o[x.id] = x.data(); }); S.people = o; render();
      }, function () {});
    } catch (e) { S.ok = false; render(); }
  })();
})();
