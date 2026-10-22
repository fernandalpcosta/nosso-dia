/*
 * "Lembra quando…?": reviver juntas as memórias do casal.
 *
 * Saborear juntas os bons momentos vividos está ligado a mais satisfação e proximidade
 * (estudos de "joint savoring" e reminiscência de casais). Aqui, a cada 3 dias aparece
 * uma lembrança, a mesma para as duas; cada uma conta um detalhe que a outra talvez tenha
 * esquecido, e os dois detalhes só aparecem quando as duas escreveram.
 *
 * Lembranças vêm de:  done/*         encontros marcados como "Fizemos!"
 *                      gratitude/*    gratidões antigas (só de dias em que as duas escreveram)
 *                      lembrancas/*   lembranças que o casal guarda à mão
 * Detalhes:            relembrar/{memória}_{pessoa}
 * Lembrança da vez:    lembrar/atual  { mem, period }  (quem abre primeiro no período fixa a escolha)
 */
(function () {
  "use strict";

  var PERIOD_DAYS = 3;
  var MIN_AGE_DAYS = 7;
  var PROMPTS = [
    "Qual detalhe desse dia você lembra e acha que a outra esqueceu?",
    "O que te fez rir nesse dia?",
    "Como você estava se sentindo naquele momento?",
    "Que som, cheiro ou lugar vem à cabeça quando você lembra disso?",
    "O que você pensou sobre a outra nesse dia, e nunca contou?",
    "Se pudesse voltar a esse dia, o que faria igual e o que faria diferente?"
  ];
  var SUGGEST = ["a gente se conheceu", "foi nosso primeiro beijo", "a gente se despediu no aeroporto", "a gente riu até chorar", "a gente viajou junto pela primeira vez"];

  var host = window.NossoDiaLembra || null;
  if (!host) return;
  var S = {
    ok: undefined, db: null, myKey: null, people: {}, grat: [], done: [], mine: [], notes: [], cur: null,
    draft: "", adding: false, fTitle: "", fDate: "", fText: "", busy: false, note: "", loaded: {}
  };

  /* ---------- Utilidades ---------- */
  function safe(id) { return String(id).replace(/[^A-Za-z0-9_\-.~:@+]/g, "_").slice(0, 120); }
  function docId(s) { return String(s).replace(/[^A-Za-z0-9_\-]/g, "_").slice(0, 100); }
  function hashStr(s) { var x = 2166136261; for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
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
  function parseD(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmtLong(s) { try { return parseD(s).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return ""; } }
  function period() { return Math.floor(Date.now() / 86400000 / PERIOD_DAYS); }
  function periodStart(p) { return p * PERIOD_DAYS * 86400000; }
  function partnerKey() { for (var k in S.people) if (k !== S.myKey) return k; return null; }
  function nameOf(k) { var p = S.people[k]; return (p && p.name) ? String(p.name).slice(0, 24) : "A outra pessoa"; }
  function isoDaysAgo(n) { var d = new Date(Date.now() - n * 86400000); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }

  /* ---------- Lembranças disponíveis ---------- */
  function pool() {
    var out = [], cutoff = isoDaysAgo(MIN_AGE_DAYS);
    S.done.forEach(function (d) {
      if (!d._id) return;
      out.push({ id: "d_" + d._id, src: "done", title: String(d.title || ""), kind: String(d.kind || "Encontro"), date: String(d.date || "") });
    });
    var byDay = {};
    S.grat.forEach(function (g) { if (g.date && g.uid) (byDay[g.date] = byDay[g.date] || {})[g.uid] = g; });
    S.grat.forEach(function (g) {
      if (!g._id || !g.date || g.date > cutoff) return;
      if (Object.keys(byDay[g.date] || {}).length < 2) return;   // como no cofre: só dias em que as duas escreveram
      out.push({ id: "g_" + g._id, src: "grat", uid: g.uid, text: String(g.text || "").slice(0, 280), date: g.date });
    });
    S.mine.forEach(function (m) {
      if (!m._id) return;
      out.push({ id: "m_" + m._id, src: "mine", title: String(m.title || "").slice(0, 90), text: String(m.text || "").slice(0, 220), date: String(m.date || ""), by: m.by });
    });
    return out.sort(function (a, b) { return a.id < b.id ? -1 : 1; });
  }
  function notesFor(memId) {
    var o = {};
    S.notes.forEach(function (n) { if (n.mem === memId && n.uid) o[n.uid] = n; });
    return o;
  }
  function doneAt(memId) {
    var o = notesFor(memId), ks = Object.keys(o);
    if (ks.length < 2) return 0;
    return Math.max.apply(null, ks.map(function (k) { return +o[k].at || 0; }));
  }
  function choose(items) {
    var p = period(), start = periodStart(p);
    if (S.cur && S.cur.period === p) {
      var fixed = items.filter(function (x) { return x.id === S.cur.mem; })[0];
      if (fixed) return fixed;
    }
    var fresh = items.filter(function (x) { var t = doneAt(x.id); return !t || t >= start; });
    var list = fresh.length ? fresh : items;
    if (!list.length) return null;
    var pick = list[hashStr("p" + p) % list.length];
    // Só fixa a escolha depois que tudo chegou do banco, para não sobrescrever a da outra pessoa.
    var ready = ["grat", "done", "mine", "notes", "cur"].every(function (k) { return S.loaded[k]; });
    if (S.db && ready && (!S.cur || S.cur.period !== p)) {
      S.cur = { mem: pick.id, period: p };
      S.db.doc("lembrar/atual").set({ mem: pick.id, period: p, at: Date.now() }).catch(function () {});
    }
    return pick;
  }
  function skip(items, current) {
    var p = period(), others = items.filter(function (x) { return x.id !== current.id && !doneAt(x.id); });
    if (!others.length) others = items.filter(function (x) { return x.id !== current.id; });
    if (!others.length) return;
    var next = others[Math.floor(Math.random() * others.length)];
    S.cur = { mem: next.id, period: p }; S.draft = ""; render();
    S.db.doc("lembrar/atual").set({ mem: next.id, period: p, at: Date.now() }).catch(function () {});
  }

  /* ---------- Escritas ---------- */
  function fail() { S.note = "Não consegui salvar. Confira a internet e tente de novo."; S.busy = false; render(); }
  function saveDetail(mem) {
    var text = (S.draft || "").trim().slice(0, 500);
    if (!text || !S.db) return;
    S.busy = true; render();
    S.db.doc("relembrar/" + docId(mem.id) + "_" + docId(S.myKey)).set({ mem: mem.id, uid: S.myKey, text: text, at: Date.now() })
      .then(function () { S.draft = ""; S.busy = false; S.note = ""; render(); }).catch(fail);
  }
  function saveMemory() {
    var title = (S.fTitle || "").trim().replace(/^lembra quando\s*/i, "").replace(/[?…\s]+$/, "").slice(0, 90);
    if (!title) { S.note = "Complete a frase “Lembra quando…”."; render(); return; }
    if (!S.db) return;
    S.busy = true; render();
    S.db.collection("lembrancas").add({ title: title, date: /^\d{4}-\d{2}-\d{2}$/.test(S.fDate) ? S.fDate : "", text: (S.fText || "").trim().slice(0, 220), by: S.myKey, at: Date.now() })
      .then(function () { S.adding = false; S.fTitle = S.fDate = S.fText = ""; S.busy = false; S.note = "Lembrança guardada. Ela vai aparecer por aqui em algum momento."; render(); }).catch(fail);
  }

  /* ---------- Tela ---------- */
  function headline(m) {
    if (m.src === "done") return m.title ? "Lembra quando vocês fizeram “" + m.title + "”?" : "Lembra do nosso " + m.kind.toLowerCase() + "?";
    if (m.src === "grat") return m.uid === S.myKey ? "Lembra quando você escreveu isso sobre " + nameOf(partnerKey()) + "?" : "Lembra quando " + nameOf(m.uid) + " escreveu isso sobre você?";
    return "Lembra quando " + m.title + "?";
  }
  function addForm() {
    return h("div", { class: "lb-form" }, [
      h("label", { class: "lbl", for: "lb-title", text: "Lembra quando…" }),
      h("input", { type: "text", id: "lb-title", maxlength: "90", placeholder: "a gente se perdeu em Lisboa", value: S.fTitle, oninput: function (e) { S.fTitle = e.target.value; } }),
      h("div", { class: "chips" }, SUGGEST.map(function (s) { return h("button", { type: "button", text: s, onclick: function () { S.fTitle = s; render(); } }); })),
      h("label", { class: "lbl", for: "lb-date", text: "Quando foi (opcional)" }),
      h("input", { type: "date", id: "lb-date", value: S.fDate, oninput: function (e) { S.fDate = e.target.value; } }),
      h("label", { class: "lbl", for: "lb-text", text: "Uma frase para lembrar (opcional)" }),
      h("textarea", { id: "lb-text", maxlength: "220", rows: "2", oninput: function (e) { S.fText = e.target.value; } }, [S.fText]),
      h("div", { class: "row" }, [
        h("button", { type: "button", class: "main", disabled: S.busy, text: "Guardar lembrança", onclick: saveMemory }),
        h("button", { type: "button", text: "Cancelar", onclick: function () { S.adding = false; S.note = ""; render(); } })
      ])
    ]);
  }

  function card() {
    var kids = [h("span", { class: "tag", text: "A cada 3 dias" }), h("h2", { text: "Lembra quando…?" })];
    if (S.ok === undefined) { kids.push(h("p", { class: "empty", text: "Procurando lembranças…" })); return h("section", { class: "card m" }, kids); }
    if (S.ok === false) { kids.push(h("p", { class: "empty", text: "As lembranças aparecem quando os dados compartilhados estão ligados." })); return h("section", { class: "card m" }, kids); }
    var items = pool(), m = choose(items), pk = partnerKey();

    if (!m) {
      kids.push(h("p", { class: "sub", text: "Ainda não temos lembranças para reviver. Que tal guardar a primeira? Pode ser o dia em que vocês se conheceram." }));
      kids.push(addForm());
      if (S.note) kids.push(h("p", { class: "note", role: "status", text: S.note }));
      return h("section", { class: "card m" }, kids);
    }

    kids.push(h("p", { class: "q", text: headline(m) }));
    var meta = [];
    if (m.date) meta.push(fmtLong(m.date));
    if (m.src === "mine" && m.by) meta.push("guardada por " + (m.by === S.myKey ? "você" : nameOf(m.by)));
    if (meta.length) kids.push(h("p", { class: "sub", text: meta.join(" · ") }));
    if (m.src === "grat" && m.text) kids.push(h("div", { class: "say" }, [h("span", { class: "who", text: m.uid === S.myKey ? "Você escreveu" : nameOf(m.uid) + " escreveu" }), h("p", { text: m.text })]));
    if (m.src === "mine" && m.text) kids.push(h("p", { class: "sub", text: "“" + m.text + "”" }));

    var notes = notesFor(m.id), mine = notes[S.myKey], theirs = pk ? notes[pk] : null;
    var prompt = PROMPTS[hashStr(m.id) % PROMPTS.length];
    if (!mine) {
      kids.push(h("div", null, [
        h("label", { class: "lbl", for: "lb-detail", text: prompt }),
        h("textarea", { id: "lb-detail", maxlength: "500", oninput: function (e) { S.draft = e.target.value; } }, [S.draft])
      ]));
      kids.push(h("div", { class: "row" }, [h("button", { type: "button", class: "main", disabled: S.busy, text: "Guardar meu detalhe", onclick: function () { saveDetail(m); } })]));
      if (theirs) kids.push(h("p", { class: "wait", text: nameOf(pk) + " já contou o detalhe dela. Conte o seu para ler." }));
    } else {
      kids.push(h("div", { class: "say" }, [h("span", { class: "who", text: "Você lembrou" }), h("p", { text: mine.text })]));
      if (theirs) {
        kids.push(h("div", { class: "say" }, [h("span", { class: "who", text: nameOf(pk) + " lembrou" }), h("p", { text: theirs.text })]));
        kids.push(h("p", { class: "rule", text: "Na próxima chamada, contem essa história juntas, cada uma completando a outra. Vale ver quem lembra mais." }));
        if (window.NossoMundo) window.NossoMundo.grow("memoria", "mem_" + m.id);
      } else {
        kids.push(h("p", { class: "wait", text: pk ? "Esperando " + nameOf(pk) + " contar o detalhe dela." : "Esperando a outra pessoa entrar." }));
      }
    }

    var relived = items.filter(function (x) { return doneAt(x.id); }).length;
    if (S.note) kids.push(h("p", { class: "note", role: "status", text: S.note }));
    if (S.adding) kids.push(addForm());
    else kids.push(h("div", { class: "row" }, [
      h("button", { type: "button", class: "link", text: "Guardar uma lembrança", onclick: function () { S.adding = true; S.note = ""; render(); } }),
      !mine && items.length > 1 ? h("button", { type: "button", class: "link", text: "Outra lembrança", onclick: function () { skip(items, m); } }) : null
    ]));
    if (relived) kids.push(h("p", { class: "rule", text: "Vocês já reviveram " + relived + (relived === 1 ? " história" : " histórias") + " juntas." }));
    return h("section", { class: "card m" }, kids);
  }

  var queued = false;
  function render() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      var ae = document.activeElement, aid = ae && host.contains(ae) ? ae.id : null, ss = null, se = null;
      try { if (aid && ae.selectionStart != null) { ss = ae.selectionStart; se = ae.selectionEnd; } } catch (e) {}
      host.textContent = "";
      host.appendChild(card());
      if (aid) { var el = document.getElementById(aid); if (el) { el.focus(); try { if (ss != null) el.setSelectionRange(ss, se); } catch (e) {} } }
    });
  }
  render();

  (async function () {
    var c = window.claude;
    if (!c || !c.use) { S.ok = false; render(); return; }
    try {
      var db = await c.use("db"), user = await c.use("user");
      var id = user ? await user.id() : null;
      if (!db || !id) { S.ok = false; render(); return; }
      S.db = db; S.myKey = safe(id); S.ok = true;
      var withId = function (snap) { return snap.docs.map(function (d) { var x = d.data() || {}; x._id = d.id; return x; }); };
      db.collection("people").onSnapshot(function (snap) { var o = {}; snap.docs.forEach(function (d) { o[d.id] = d.data(); }); S.people = o; render(); }, function () {});
      db.collection("gratitude").orderBy("date", "desc").limit(1000).onSnapshot(function (snap) { S.grat = withId(snap); S.loaded.grat = true; render(); }, function () {});
      db.collection("done").orderBy("at", "desc").limit(500).onSnapshot(function (snap) { S.done = withId(snap); S.loaded.done = true; render(); }, function () {});
      db.collection("lembrancas").orderBy("at", "desc").limit(500).onSnapshot(function (snap) { S.mine = withId(snap); S.loaded.mine = true; render(); }, function () {});
      db.collection("relembrar").limit(2000).onSnapshot(function (snap) {
        S.notes = withId(snap).filter(function (n) { return typeof n.mem === "string" && typeof n.uid === "string" && typeof n.text === "string"; });
        S.loaded.notes = true; render();
      }, function () {});
      db.doc("lembrar/atual").onSnapshot(function (snap) {
        var d = snap.exists ? snap.data() : null;
        S.cur = d && typeof d.mem === "string" && typeof d.period === "number" ? { mem: d.mem, period: d.period } : null;
        S.loaded.cur = true; render();
      }, function () {});
      render();
    } catch (e) { S.ok = false; render(); }
  })();
})();
