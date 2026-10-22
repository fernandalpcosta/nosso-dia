/*
 * "Por que isso?": o que está por trás de cada atividade do app.
 * Cada atividade chama NossoDiaPorque.button("chave") e ganha um botão que abre um painel
 * com a ideia, o que a pesquisa diz, os limites e as referências.
 * Quando não há pesquisa direta (regra 2-2-2, mundinho), o texto diz isso.
 */
(function () {
  "use strict";

  var INFO = {
    gratidao: {
      title: "Uma coisa que eu valorizo em você",
      idea: "Todo dia, cada uma escreve algo que valoriza na outra. Notar o que a outra pessoa faz de bom, e dizer isso a ela, é um dos jeitos mais simples de alimentar o carinho.",
      research: [
        "Num estudo de diário com casais que moravam juntos, nos dias em que havia mais gratidão nas interações, tanto quem agradecia quanto quem recebia o agradecimento se sentiam mais conectados e satisfeitos com a relação no dia seguinte (Algoe, Gable e Maisel, 2010).",
        "A teoria \"encontrar, lembrar e unir\" propõe que a gratidão ajuda a perceber o valor da outra pessoa, lembra o quanto ela importa e aproxima as duas (Algoe, 2012).",
        "Ler a resposta da outra só depois de escrever a sua é uma escolha nossa: evita responder por obrigação ou só repetir o que a outra disse."
      ],
      limits: "Os estudos são correlacionais (mostram associação, não causa) e foram feitos com casais que moram juntos.",
      refs: [
        ["Algoe, S. B., Gable, S. L., & Maisel, N. C. (2010). It's the little things: Everyday gratitude as a booster shot for romantic relationships. Personal Relationships, 17, 217–233.", "https://labs.psych.ucsb.edu/gable/shelly/publications/414"],
        ["Algoe, S. B. (2012). Find, remind, and bind: The functions of gratitude in everyday relationships. Social and Personality Psychology Compass, 6(6), 455–469.", ""]
      ]
    },
    escuta: {
      title: "5 minutos de escuta",
      idea: "Uma fala, a outra só ouve, sem conselho, sem interromper, sem mudar de assunto. Depois trocam. O objetivo é que cada uma se sinta realmente ouvida.",
      research: [
        "No modelo de intimidade de Reis e Shaver (1988), a intimidade nasce quando alguém se abre e sente que a resposta do outro foi de compreensão, validação e cuidado. Estudos de diário deram apoio a essa ideia (Laurenceau, Barrett e Pietromonaco, 1998).",
        "A técnica \"falante e ouvinte\", do programa PREP de educação para casais, também organiza a conversa em turnos para que cada pessoa se sinta escutada antes de responder (Markman, Stanley e Blumberg, 2010).",
        "Num estudo de diário, casais à distância relataram mais intimidade que casais que moravam perto, em parte porque se abriam mais nas conversas (Jiang e Hancock, 2013)."
      ],
      limits: "A regra \"sem conselho\" e o tempo de 3 ou 5 minutos são adaptações nossas. O PREP foi pensado para conversas difíceis, e não está claro qual parte da técnica é a que mais ajuda.",
      refs: [
        ["Reis, H. T., & Shaver, P. (1988). Intimacy as an interpersonal process. In S. Duck (Ed.), Handbook of personal relationships (pp. 367–389). Wiley.", ""],
        ["Laurenceau, J.-P., Barrett, L. F., & Pietromonaco, P. R. (1998). Intimacy as an interpersonal process: The importance of self-disclosure, partner disclosure, and perceived partner responsiveness in interpersonal exchanges. Journal of Personality and Social Psychology, 74(5), 1238–1251.", "https://www.affective-science.org/pubs/1998/LaurenFBPl1998.pdf"],
        ["Markman, H. J., Stanley, S. M., & Blumberg, S. L. (2010). Fighting for your marriage (ed. rev.). Jossey-Bass.", ""],
        ["Jiang, L. C., & Hancock, J. T. (2013). Absence makes the communication grow fonder: Geographic separation, interpersonal media, and intimacy in dating relationships. Journal of Communication, 63(3), 556–577.", "https://academic.oup.com/joc/article/63/3/556/4085877"]
      ]
    },
    plano: {
      title: "Regra 2-2-2",
      idea: "Um encontro só de vocês a cada 2 semanas, uma escapada a cada 2 meses e uma viagem grande a cada 2 anos, com a próxima data sempre marcada.",
      research: [
        "A regra 2-2-2 em si não vem de pesquisa: ela surgiu num post do Reddit, por volta de 2015, e ficou popular como um lembrete prático.",
        "O que a pesquisa apoia é o princípio: casais que fazem juntos atividades novas e empolgantes sentem menos tédio e avaliam melhor a relação do que os que repetem só atividades agradáveis e conhecidas (Aron et al., 2000). Por isso vale variar os encontros.",
        "Para casais à distância, um estudo encontrou que intervalos mais longos sem se ver pessoalmente estavam ligados a mais instabilidade quando o casal voltava a morar perto (Stafford e Merolla, 2007). Ter os próximos encontros marcados ajuda a não deixar esse intervalo crescer."
      ],
      limits: "Os números 2-2-2 são arbitrários: o importante é ter um ritmo que caiba na vida de vocês.",
      refs: [
        ["Aron, A., Norman, C. C., Aron, E. N., McKenna, C., & Heyman, R. E. (2000). Couples' shared participation in novel and arousing activities and experienced relationship quality. Journal of Personality and Social Psychology, 78(2), 273–284.", ""],
        ["Stafford, L., & Merolla, A. J. (2007). Idealization, reunions, and stability in long-distance dating relationships. Journal of Social and Personal Relationships, 24(1), 37–54. doi:10.1177/0265407507072578", "https://doi.org/10.1177/0265407507072578"]
      ]
    },
    lembra: {
      title: "Lembra quando…?",
      idea: "De tempos em tempos, uma lembrança de vocês volta. Cada uma conta um detalhe, e depois vocês recontam a história juntas.",
      research: [
        "Num estudo de laboratório, casais satisfeitos mostraram mais afeto positivo e intimidade ao relembrar momentos bons da relação (Osgarby e Halford, 2013).",
        "Casais que riram juntos enquanto contavam como se conheceram relataram mais qualidade na relação, proximidade e apoio (Kurtz e Algoe, 2015).",
        "Pesquisas sobre saborear juntos os bons momentos (\"joint savoring\") associam esse hábito a mais satisfação, menos conflito e mais confiança no futuro, principalmente em fases de estresse."
      ],
      limits: "São estudos correlacionais ou de laboratório. Em casais em crise, relembrar o passado às vezes trouxe mais tristeza do que alegria (Osgarby e Halford, 2013).",
      refs: [
        ["Osgarby, S. M., & Halford, W. K. (2013). Couple relationship distress and observed expression of intimacy during reminiscence about positive relationship events. Behavior Therapy, 44(4), 686–700.", ""],
        ["Kurtz, L. E., & Algoe, S. B. (2015). Putting laughter in context: Shared laughter as behavioral indicator of relationship well-being. Personal Relationships, 22(4), 573–590.", "https://pubmed.ncbi.nlm.nih.gov/26957946/"],
        ["Universidade de Illinois (notícia): Savoring pleasurable moments strengthens couples' bonds.", "https://news.illinois.edu/savoring-pleasurable-moments-strengthens-couples-bonds/"]
      ]
    },
    maisprovavel: {
      title: "Mais Provável",
      idea: "Um jogo bobo e rápido para rir juntas e descobrir como cada uma enxerga a outra.",
      research: [
        "Rir ao mesmo tempo com o parceiro está associado a uma avaliação melhor da relação, mais proximidade e mais apoio, mesmo descontando o quanto cada pessoa ri sozinha (Kurtz e Algoe, 2015).",
        "Adultos mais brincalhões tendem a relatar um pouco mais de satisfação no relacionamento (Proyer, 2014); estudos posteriores do mesmo grupo, com casais, encontraram resultados mais mistos, que dependem do tipo de brincadeira."
      ],
      limits: "Os efeitos encontrados são pequenos e os estudos são correlacionais: rir junto pode ser tanto causa quanto consequência de uma boa relação.",
      refs: [
        ["Kurtz, L. E., & Algoe, S. B. (2015). Putting laughter in context: Shared laughter as behavioral indicator of relationship well-being. Personal Relationships, 22(4), 573–590.", "https://pubmed.ncbi.nlm.nih.gov/26957946/"],
        ["Proyer, R. T. (2014). To love and play: Testing the association of adult playfulness with the relationship personality and relationship satisfaction. Current Psychology.", ""],
        ["Society for Personality and Social Psychology (resumo): Proyer e Brauer sobre brincadeira em relacionamentos.", "https://www.spsp.org/news-center/blog/proyer-brauer-playfulness"]
      ]
    },
    quebracabeca: {
      title: "Quebra-cabeça a quatro mãos",
      idea: "Montar juntas a mesma imagem, ao mesmo tempo, cada uma no seu celular. É um projeto pequeno e novo, feito em equipe.",
      research: [
        "Fazer juntas algo novo e um pouco desafiador está associado a menos tédio e a uma relação avaliada como melhor (Aron et al., 2000). A teoria por trás, da \"autoexpansão\", diz que crescer e descobrir coisas junto com a outra pessoa faz a relação parecer viva.",
        "Brincar junto também está ligado, em média, a um pouco mais de satisfação no relacionamento (Proyer, 2014)."
      ],
      limits: "Não há estudo sobre quebra-cabeças especificamente: a atividade aplica uma ideia geral sobre fazer coisas novas juntos.",
      refs: [
        ["Aron, A., Norman, C. C., Aron, E. N., McKenna, C., & Heyman, R. E. (2000). Couples' shared participation in novel and arousing activities and experienced relationship quality. Journal of Personality and Social Psychology, 78(2), 273–284.", ""],
        ["Proyer, R. T. (2014). To love and play: Testing the association of adult playfulness with the relationship personality and relationship satisfaction. Current Psychology.", ""]
      ]
    },
    vod: {
      title: "Verdade ou desafio",
      idea: "Perguntas que convidam a se abrir e desafios para fazer pela câmera, em três níveis. Passar a vez é sempre permitido.",
      research: [
        "Perguntas que vão ficando mais pessoais aos poucos aumentaram a sensação de proximidade num estudo clássico, o das \"36 perguntas\" (Aron et al., 1997).",
        "No modelo de intimidade, abrir-se e receber uma resposta acolhedora é o que aproxima as pessoas (Reis e Shaver, 1988). À distância, essa abertura parece ter um papel especial (Jiang e Hancock, 2013).",
        "Os desafios trazem novidade e um pouco de adrenalina, o tipo de atividade associada a menos tédio na relação (Aron et al., 2000)."
      ],
      limits: "O estudo das 36 perguntas foi feito com pessoas que não se conheciam; para casais, as perguntas funcionam como roteiro de conversa. O nível picante é para diversão e flerte: só vale o que as duas quiserem.",
      refs: [
        ["Aron, A., Melinat, E., Aron, E. N., Vallone, R. D., & Bator, R. J. (1997). The experimental generation of interpersonal closeness. Personality and Social Psychology Bulletin, 23(4), 363–377.", "https://ggia.berkeley.edu/practice/practice_as_pdf/36_questions_for_increasing_closeness"],
        ["Reis, H. T., & Shaver, P. (1988). Intimacy as an interpersonal process. In S. Duck (Ed.), Handbook of personal relationships (pp. 367–389). Wiley.", ""],
        ["Jiang, L. C., & Hancock, J. T. (2013). Absence makes the communication grow fonder: Geographic separation, interpersonal media, and intimacy in dating relationships. Journal of Communication, 63(3), 556–577.", "https://academic.oup.com/joc/article/63/3/556/4085877"],
        ["Aron, A., Norman, C. C., Aron, E. N., McKenna, C., & Heyman, R. E. (2000). Couples' shared participation in novel and arousing activities and experienced relationship quality. Journal of Personality and Social Psychology, 78(2), 273–284.", ""]
      ]
    },
    mundo: {
      title: "Nosso mundo",
      idea: "Cada coisa que vocês fazem juntas no app vira flor, árvore, bicho ou paisagem. O mundinho mostra, de um jeito bonito, o quanto vocês já cultivaram.",
      research: [
        "Aqui não há uma pesquisa direta: não existem estudos sobre florestas virtuais de casal. O mundinho é uma escolha de design para tornar visíveis os pequenos momentos que costumam passar despercebidos.",
        "De propósito, o mundo só cresce: nada murcha nem morre quando vocês ficam uns dias sem abrir o app. Muitos apps usam a culpa para prender o usuário; aqui a ideia é celebrar, nunca cobrar.",
        "As atividades que fazem o mundo crescer são as que têm base na pesquisa: veja o \"Por que isso?\" de cada uma."
      ],
      limits: "É um incentivo leve, não um termômetro da relação: um mundo menor não significa um amor menor.",
      refs: []
    }
  };

  /* ---------- Estilos ---------- */
  var css = document.createElement("style");
  css.textContent =
    "#hoje button.why,#jogos button.why,#mundo button.why,button.why{align-self:flex-start;display:inline-flex;align-items:center;gap:6px;background:none;border:0;padding:2px 0;margin:0;color:var(--muted,#625a7e);font:inherit;font-size:.85rem;font-weight:600;text-decoration:underline;text-underline-offset:3px;cursor:pointer;border-radius:6px}" +
    "button.why .i{display:inline-grid;place-items:center;width:17px;height:17px;border-radius:50%;border:1.5px solid currentColor;font-size:.7rem;font-weight:800;text-decoration:none;font-style:normal}" +
    "button.why:focus-visible{outline:3px solid var(--ink,#221a3b);outline-offset:2px}" +
    ".why-back{position:fixed;inset:0;z-index:60;background:rgba(15,10,35,.45);display:flex;align-items:flex-end;justify-content:center}" +
    "@media (min-width:640px){.why-back{align-items:center;padding:16px}}" +
    ".why-sheet{width:100%;max-width:560px;max-height:88vh;overflow-y:auto;background:var(--surface,#fff);color:var(--ink,#221a3b);border-radius:20px 20px 0 0;padding:20px 20px calc(24px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:14px;font-family:var(--font-body,system-ui,sans-serif);line-height:1.5}" +
    "@media (min-width:640px){.why-sheet{border-radius:20px}}" +
    ".why-sheet h2{margin:0;font-family:Gabarito,var(--font-body,system-ui),sans-serif;font-size:1.4rem;letter-spacing:-.02em}" +
    ".why-sheet h3{margin:0;font-size:.75rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#625a7e)}" +
    ".why-sheet p{margin:0}" +
    ".why-sheet ul,.why-sheet ol{margin:0;padding-left:1.2em;display:flex;flex-direction:column;gap:8px}" +
    ".why-sheet .lim{background:var(--bg,#f1eef8);border-left:4px solid var(--g,#f2a93b);border-radius:8px;padding:10px 12px;font-size:.92rem}" +
    ".why-sheet .refs li{font-size:.85rem;color:var(--muted,#625a7e)}" +
    ".why-sheet .refs a{color:var(--ink,#221a3b)}" +
    ".why-sheet .top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}" +
    ".why-sheet .x{font:inherit;font-weight:700;border:1.5px solid var(--line,#d9d3ea);background:var(--bg,#f1eef8);color:var(--ink,#221a3b);border-radius:999px;width:36px;height:36px;cursor:pointer;flex:none}" +
    ".why-sheet .x:focus-visible{outline:3px solid var(--ink,#221a3b);outline-offset:2px}";
  document.head.appendChild(css);

  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "text") e.textContent = v;
      else if (k === "class") e.className = v;
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    (kids || []).forEach(function (c) { if (c != null && c !== false) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }

  var openEl = null, lastFocus = null;
  function close() {
    if (!openEl) return;
    openEl.remove(); openEl = null;
    document.removeEventListener("keydown", onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function onKey(e) {
    if (e.key === "Escape") { close(); return; }
    if (e.key === "Tab" && openEl) {
      var f = openEl.querySelectorAll("button,a[href]");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  function open(key) {
    var d = INFO[key];
    if (!d) return;
    close();
    lastFocus = document.activeElement;
    var sheet = el("div", { class: "why-sheet", role: "dialog", "aria-modal": "true", "aria-labelledby": "why-title" }, [
      el("div", { class: "top" }, [
        el("div", null, [el("h3", { text: "Por que isso?" }), el("h2", { id: "why-title", text: d.title })]),
        el("button", { type: "button", class: "x", "aria-label": "Fechar", text: "✕", onclick: close })
      ]),
      el("p", { text: d.idea }),
      el("h3", { text: "O que a pesquisa diz" }),
      el("ul", null, d.research.map(function (r) { return el("li", { text: r }); })),
      el("p", { class: "lim" }, [el("strong", { text: "Limites: " }), d.limits]),
      d.refs.length ? el("h3", { text: "Referências" }) : null,
      d.refs.length ? el("ol", { class: "refs" }, d.refs.map(function (r) {
        return el("li", null, [r[0], r[1] ? " " : null, r[1] ? el("a", { href: r[1], target: "_blank", rel: "noopener noreferrer", text: "Ver fonte" }) : null]);
      })) : null
    ]);
    var back = el("div", { class: "why-back", onclick: function (e) { if (e.target === back) close(); } }, [sheet]);
    document.body.appendChild(back);
    openEl = back;
    document.addEventListener("keydown", onKey);
    sheet.querySelector(".x").focus();
  }
  function button(key) {
    if (!INFO[key]) return null;
    return el("button", { type: "button", class: "why", "aria-haspopup": "dialog", onclick: function () { open(key); } }, [el("i", { class: "i", "aria-hidden": "true", text: "i" }), "Por que isso?"]);
  }

  window.NossoDiaPorque = { open: open, button: button, keys: Object.keys(INFO) };
})();
