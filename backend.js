/*
 * Nosso Dia: backend independente (Firebase).
 *
 * Dentro do Claude a página usa window.claude (db, room, user, sample).
 * Fora dele, este arquivo cria um window.claude com a mesma interface:
 *   db     -> Cloud Firestore, com tudo guardado em casais/{código}/...
 *   user   -> login anônimo do Firebase (um id por aparelho/navegador)
 *   room   -> salas em tempo real feitas com Firestore (eventos + presença)
 *   sample -> IA opcional: chave da API da Anthropic guardada só neste aparelho
 *
 * A configuração do Firebase fica em firebase-config.js.
 */
(function () {
  "use strict";
  if (window.claude && window.claude.use) return; // dentro do Claude: não faz nada

  var LS_CODE = "nosso-dia-casal";
  var LS_KEY = "nosso-dia-anthropic-key";
  var TAB = Math.random().toString(36).slice(2, 10);
  var ALPHA = "abcdefghjkmnpqrstuvwxyz23456789";

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function cleanCode(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24); }
  function newCode() { var s = ""; for (var i = 0; i < 10; i++) s += ALPHA.charAt(Math.floor(Math.random() * ALPHA.length)); return s; }
  function safeId(s) { return String(s).replace(/[^A-Za-z0-9_\-]/g, "_").slice(0, 80) || "sala"; }
  function linkFor(code) { return location.origin + location.pathname + "?casal=" + code; }

  var cfg = window.NOSSO_DIA_FIREBASE || null;
  var configured = !!(cfg && cfg.apiKey && cfg.projectId && window.firebase);

  /* ---------- Estilos do portão e dos ajustes ---------- */
  var css = document.createElement("style");
  css.textContent =
    ".nd-gate{position:fixed;inset:0;z-index:50;background:var(--bg,#f1eef8);display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto}" +
    ".nd-box{width:100%;max-width:420px;background:var(--surface,#fff);color:var(--ink,#221a3b);border:1px solid var(--line,#d9d3ea);border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:14px;font-family:var(--font-body,system-ui,sans-serif)}" +
    ".nd-box h2{margin:0;font-family:Gabarito,var(--font-body,system-ui),sans-serif;font-size:1.5rem;letter-spacing:-0.02em}" +
    ".nd-box p{margin:0;color:var(--muted,#625a7e);font-size:.95rem}" +
    ".nd-box input{width:100%;font:inherit;font-size:1rem;color:var(--ink,#221a3b);background:var(--bg,#f1eef8);border:1.5px solid var(--line,#d9d3ea);border-radius:10px;padding:11px 12px}" +
    ".nd-box .code{text-transform:lowercase;letter-spacing:.18em;text-align:center;font-weight:700}" +
    ".nd-box button{font:inherit;cursor:pointer;border-radius:10px;border:1.5px solid var(--line,#d9d3ea);background:var(--bg,#f1eef8);color:var(--ink,#221a3b);padding:11px 12px;font-weight:600}" +
    ".nd-box button.main{background:var(--ink,#221a3b);color:var(--bg,#f1eef8);border-color:var(--ink,#221a3b)}" +
    ".nd-box button:focus-visible,.nd-box input:focus-visible,.nd-open:focus-visible{outline:3px solid var(--ink,#221a3b);outline-offset:2px}" +
    ".nd-box .or{text-align:center;font-size:.85rem}" +
    ".nd-box .warn{color:var(--ink,#221a3b);border-left:4px solid var(--p,#e0527a);padding:6px 10px;background:var(--bg,#f1eef8);border-radius:6px}" +
    ".nd-box .lbl{font-size:.75rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#625a7e);display:block;margin-bottom:6px}" +
    ".nd-box .big{font-family:Gabarito,var(--font-body,system-ui),sans-serif;font-weight:800;font-size:1.5rem;letter-spacing:.14em;text-align:center;color:var(--ink,#221a3b)}" +
    ".nd-foot{max-width:520px;margin:28px auto 0;text-align:center}" +
    ".nd-open{background:none;border:0;color:var(--muted,#625a7e);text-decoration:underline;font:inherit;font-size:.88rem;cursor:pointer;padding:6px}";
  document.head.appendChild(css);

  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] == null || attrs[k] === false) continue;
      if (k === "text") e.textContent = attrs[k];
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }

  function overlay(build) {
    var wrap = el("div", { class: "nd-gate", role: "dialog", "aria-modal": "true" });
    var box = el("div", { class: "nd-box" });
    wrap.appendChild(box);
    function close() { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }
    build(box, close);
    document.body.appendChild(wrap);
    var first = box.querySelector("input,button");
    if (first) first.focus();
    return close;
  }

  /* ---------- Código do casal ---------- */
  function askCode() {
    return new Promise(function (resolve) {
      overlay(function (box, close) {
        var input = el("input", { class: "code", type: "text", placeholder: "código", "aria-label": "Código do casal", autocomplete: "off", autocapitalize: "none", spellcheck: "false" });
        var msg = el("p", { class: "warn", hidden: true });
        function done(code) { close(); resolve(code); }
        box.appendChild(el("h2", { text: "Nosso Dia" }));
        box.appendChild(el("p", { text: "Um espaço só de vocês duas. Quem começa cria o espaço e manda o link para a outra." }));
        box.appendChild(el("button", { class: "main", type: "button", text: "Criar nosso espaço", onclick: function () { done(newCode()); } }));
        box.appendChild(el("p", { class: "or", text: "ou, se você recebeu um código" }));
        box.appendChild(input);
        box.appendChild(el("button", { type: "button", text: "Entrar", onclick: function () {
          var c = cleanCode(input.value);
          if (c.length < 8) { msg.hidden = false; msg.textContent = "O código tem pelo menos 8 letras e números."; return; }
          done(c);
        } }));
        box.appendChild(msg);
      });
    });
  }

  function getCode() {
    var fromUrl = null;
    try {
      var u = new URL(location.href);
      fromUrl = cleanCode(u.searchParams.get("casal"));
      if (u.searchParams.has("casal")) { u.searchParams.delete("casal"); history.replaceState(null, "", u.pathname + u.search + u.hash); }
    } catch (e) {}
    if (fromUrl && fromUrl.length >= 8) { lsSet(LS_CODE, fromUrl); return Promise.resolve(fromUrl); }
    var saved = cleanCode(lsGet(LS_CODE));
    if (saved.length >= 8) return Promise.resolve(saved);
    return askCode().then(function (c) { lsSet(LS_CODE, c); return c; });
  }

  /* ---------- Conexão ---------- */
  var ctx = null; // { fs, uid, base, code }
  var ready = (async function () {
    if (!configured) return null;
    try {
      var code = await getCode();
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      var auth = firebase.auth();
      var cred = auth.currentUser ? { user: auth.currentUser } : await auth.signInAnonymously();
      var uid = cred.user.uid;
      var fs = firebase.firestore();
      ctx = { fs: fs, uid: uid, base: "casais/" + code, code: code };
      return ctx;
    } catch (e) {
      console.error("Nosso Dia: falha ao conectar", e);
      return null;
    }
  })();

  function dbApi(c) {
    return {
      doc: function (p) { return c.fs.doc(c.base + "/" + p); },
      collection: function (p) { return c.fs.collection(c.base + "/" + p); }
    };
  }

  /* ---------- Salas em tempo real ---------- */
  function makeRoom(c, name) {
    var root = c.base + "/salas/" + safeId(name);
    var events = c.fs.collection(root + "/eventos");
    var people = c.fs.collection(root + "/pessoas");
    var handlers = {}, peerCbs = [], peerList = [], unsubs = [], myPresence = null, beat = null, left = false;
    var FV = firebase.firestore.FieldValue;
    var myDoc = people.doc(safeId(c.uid + "_" + TAB));

    // Eventos: ignora o que já existia ao entrar, entrega só os novos.
    var first = true;
    unsubs.push(events.orderBy("at", "desc").limit(25).onSnapshot(function (snap) {
      if (first) { first = false; return; }
      snap.docChanges().forEach(function (ch) {
        if (ch.type !== "added") return;
        var d = ch.doc.data() || {};
        var list = handlers[d.ev] || [];
        var m = { data: d.data, isMe: d.uid === c.uid, sameTab: d.uid === c.uid && d.tab === TAB };
        list.forEach(function (fn) { try { fn(m); } catch (e) { console.error(e); } });
      });
    }, function (e) { console.error("Nosso Dia: sala", e); }));

    // Presença: cada aba mantém um documento com "batimento" a cada 20 s.
    function recompute(snap) {
      var now = Date.now(), out = [];
      (snap ? snap.docs : []).forEach(function (d) {
        var x = d.data() || {};
        var at = x.at && x.at.toMillis ? x.at.toMillis() : now;
        if (now - at > 75000) return;
        out.push({ isMe: x.uid === c.uid, sameTab: x.uid === c.uid && x.tab === TAB, presence: x.presence || {} });
      });
      return out;
    }
    var lastPeers = null;
    function firePeers() { peerList = recompute(lastPeers); peerCbs.forEach(function (fn) { try { fn(peerList); } catch (e) {} }); }
    unsubs.push(people.onSnapshot(function (snap) { lastPeers = snap; firePeers(); }, function () {}));
    var refresh = setInterval(firePeers, 30000);

    // Limpa eventos antigos desta pessoa (mais de 1 hora).
    events.where("uid", "==", c.uid).limit(50).get().then(function (snap) {
      var cut = Date.now() - 3600000;
      snap.docs.forEach(function (d) { var at = d.data().at; if (at && at.toMillis && at.toMillis() < cut) d.ref.delete().catch(function () {}); });
    }).catch(function () {});

    function bye() { if (myPresence) myDoc.delete().catch(function () {}); }
    window.addEventListener("pagehide", bye);

    return {
      on: function (ev, fn) { (handlers[ev] = handlers[ev] || []).push(fn); },
      emit: function (ev, data) {
        if (left) return Promise.resolve();
        return events.add({ ev: String(ev), data: data == null ? null : data, uid: c.uid, tab: TAB, at: FV.serverTimestamp() });
      },
      onPeers: function (fn) { peerCbs.push(fn); },
      peers: function () { return peerList.slice(); },
      presence: function (obj) {
        myPresence = obj || {};
        var write = function () { return myDoc.set({ uid: c.uid, tab: TAB, presence: myPresence, at: FV.serverTimestamp() }); };
        if (!beat) beat = setInterval(function () { write().catch(function () {}); }, 20000);
        return write();
      },
      leave: function () {
        left = true;
        unsubs.forEach(function (u) { try { u(); } catch (e) {} });
        clearInterval(refresh); if (beat) clearInterval(beat);
        window.removeEventListener("pagehide", bye);
        bye();
      },
      join: function (other) { return Promise.resolve(makeRoom(c, other)); }
    };
  }

  /* ---------- IA opcional (chave guardada só neste aparelho) ---------- */
  function parseJson(text) {
    var t = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
    try { return JSON.parse(t); } catch (e) {}
    var a = t.search(/[\[{]/), b = Math.max(t.lastIndexOf("]"), t.lastIndexOf("}"));
    if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1));
    throw new Error("A resposta não veio em JSON.");
  }
  function sampleApi() {
    var key = lsGet(LS_KEY);
    if (!key) return null;
    return {
      json: async function (prompt) {
        var r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true"
          },
          body: JSON.stringify({ model: "claude-haiku-5-5", max_tokens: 500, messages: [{ role: "user", content: prompt }] })
        });
        if (!r.ok) throw new Error("IA indisponível (" + r.status + ")");
        var out = await r.json();
        var text = (out.content || []).filter(function (b) { return b.type === "text"; }).map(function (b) { return b.text; }).join("");
        return parseJson(text);
      }
    };
  }

  /* ---------- Interface pública (igual à do Claude) ---------- */
  var mainRoom = null;
  window.claude = {
    use: async function (name) {
      if (name === "sample") return sampleApi();
      var c = await ready;
      if (!c) return null;
      if (name === "db") return dbApi(c);
      if (name === "user") return { id: async function () { return c.uid; } };
      if (name === "room") { if (!mainRoom) mainRoom = makeRoom(c, "principal"); return mainRoom; }
      return null;
    }
  };

  /* ---------- Ajustes ---------- */
  function openSettings() {
    overlay(function (box, close) {
      box.appendChild(el("h2", { text: "Ajustes" }));
      if (!configured) {
        box.appendChild(el("p", { class: "warn", text: "O Firebase ainda não foi configurado (arquivo firebase-config.js). Por enquanto nada é salvo nem compartilhado." }));
      } else if (!ctx) {
        box.appendChild(el("p", { class: "warn", text: "Não consegui conectar ao banco de dados. Confira a internet e recarregue a página." }));
      } else {
        var copied = el("p", { hidden: true, text: "Link copiado." });
        box.appendChild(el("div", null, [el("span", { class: "lbl", text: "Código do casal" }), el("div", { class: "big", text: ctx.code })]));
        box.appendChild(el("p", { text: "Mande o link para a outra pessoa abrir no celular dela. Quem tem o código vê os dados de vocês, então guardem só entre vocês." }));
        box.appendChild(el("button", { class: "main", type: "button", text: "Copiar link para ela", onclick: function () {
          var link = linkFor(ctx.code);
          var ok = function () { copied.hidden = false; };
          if (navigator.share) navigator.share({ title: "Nosso Dia", url: link }).catch(function () {});
          else if (navigator.clipboard) navigator.clipboard.writeText(link).then(ok, function () { window.prompt("Copie o link:", link); });
          else window.prompt("Copie o link:", link);
        } }));
        box.appendChild(copied);
      }
      var key = el("input", { type: "password", placeholder: "sk-ant-…", "aria-label": "Chave da API da Anthropic", autocomplete: "off", value: lsGet(LS_KEY) || "" });
      box.appendChild(el("div", null, [
        el("span", { class: "lbl", text: "IA (opcional)" }),
        el("p", { text: "Cole uma chave da API da Anthropic para ligar as cartas e ideias com IA. Ela fica guardada só neste aparelho e cada uso é cobrado na sua conta da API." }),
      ]));
      box.appendChild(key);
      box.appendChild(el("button", { type: "button", text: "Salvar e recarregar", onclick: function () { lsSet(LS_KEY, key.value.trim() || null); location.reload(); } }));
      if (lsGet(LS_CODE)) {
        box.appendChild(el("button", { type: "button", text: "Sair deste espaço", onclick: function () {
          if (!window.confirm("Sair do espaço do casal neste aparelho? Os dados continuam salvos; para voltar, use o mesmo código.")) return;
          lsSet(LS_CODE, null); location.reload();
        } }));
      }
      box.appendChild(el("button", { type: "button", text: "Fechar", onclick: close }));
    });
  }

  function addFooter() {
    var foot = el("div", { class: "nd-foot" }, [el("button", { class: "nd-open", type: "button", text: "Ajustes do nosso espaço", onclick: openSettings })]);
    document.body.appendChild(foot);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addFooter);
  else addFooter();
})();
