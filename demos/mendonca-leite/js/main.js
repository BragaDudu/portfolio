/* Mendonça & Leite Engenharia · comportamento do site (base Revosys + animações do nicho).
   Sem biblioteca. Tudo respeita prefers-reduced-motion. */
(function () {
  "use strict";

  var cfg = window.SITE || {};
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Links de WhatsApp: todo elemento com data-whats vira wa.me com a mensagem pronta.
  //    data-whats="texto" usa uma mensagem específica.
  document.querySelectorAll("[data-whats]").forEach(function (a) {
    var msg = a.getAttribute("data-whats") || cfg.mensagem || "Olá! Vi o site e gostaria de mais informações.";
    a.href = "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(msg);
    a.target = "_blank";
    a.rel = "noopener";
  });

  // 1b. "Enviar para o síndico": o morador compartilha o site com quem quiser no WhatsApp.
  document.querySelectorAll("[data-compartilhar]").forEach(function (a) {
    var url = location.protocol.indexOf("http") === 0 ? location.href.split("#")[0] : "https://mendoncaleiteeng.com/";
    var txt = "Olha essa empresa de manutenção de bombas e sistemas de água e esgoto para condomínios: Mendonça & Leite Engenharia. " + url;
    a.href = "https://wa.me/?text=" + encodeURIComponent(txt);
    a.target = "_blank";
    a.rel = "noopener";
  });

  // 2. Menu mobile
  var botao = document.querySelector(".topo__menu");
  var nav = document.getElementById("nav");
  if (botao && nav) {
    var fechar = function () {
      botao.setAttribute("aria-expanded", "false");
      botao.setAttribute("aria-label", "Abrir menu");
      document.body.classList.remove("menu-aberto");
    };
    botao.addEventListener("click", function () {
      var aberto = botao.getAttribute("aria-expanded") === "true";
      botao.setAttribute("aria-expanded", String(!aberto));
      botao.setAttribute("aria-label", aberto ? "Abrir menu" : "Fechar menu");
      document.body.classList.toggle("menu-aberto", !aberto);
    });
    nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", fechar); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") fechar(); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 1080) fechar(); });
  }

  // 3. Topo muda de fundo ao rolar + cano de progresso enche de água
  var topo = document.getElementById("topo");
  var cano = document.querySelector(".cano-progresso");
  var aoRolar = function () {
    var y = window.scrollY;
    if (topo) topo.classList.toggle("rolou", y > 40);
    if (cano) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      cano.style.setProperty("--progresso", max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
    }
  };

  // 4. Revelar ao rolar
  var itens = document.querySelectorAll(".revelar");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visivel"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    itens.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  } else {
    itens.forEach(function (el) { el.classList.add("visivel"); });
  }

  // 5. Destaca o dia de hoje nos horários (data-dias="1,2,3", 0 = domingo)
  var hoje = new Date().getDay();
  document.querySelectorAll(".horarios [data-dias]").forEach(function (li) {
    if (li.getAttribute("data-dias").split(",").map(Number).indexOf(hoje) !== -1) {
      li.classList.add("hoje");
      li.setAttribute("aria-current", "date");
    }
  });

  // 6. Ano atual no rodapé
  document.querySelectorAll("[data-ano]").forEach(function (s) { s.textContent = new Date().getFullYear(); });

  // 7. Link ativo no menu conforme a seção na tela
  var links = {};
  document.querySelectorAll('.nav a[href^="#"]').forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var ioMenu = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var a = links[e.target.id];
        if (a) a.classList.toggle("ativo", e.isIntersecting);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) ioMenu.observe(s); });
  }

  // 8. Gotas d'água no vidro (como o painel escuro do folheto)
  var gotas = (function () {
    var cv = document.querySelector(".hero__gotas");
    if (!cv || !cv.getContext) return { ligar: function () {}, desligar: function () {} };
    var ctx = cv.getContext("2d");
    var hero = cv.parentElement;
    var W = 0, H = 0, fixas = [], moveis = [], rastro = [], raf = 0, ultimo = 0, rodando = false;
    var TAU = Math.PI * 2;

    function rnd(a, b) { return a + Math.random() * (b - a); }
    function novaFixa() {
      return { x: rnd(0, W), y: rnd(0, H), r: Math.random() < .8 ? rnd(.6, 2.2) : rnd(2.4, 5.4), a: rnd(.4, 1) };
    }
    function novaMovel(doTopo) {
      return { x: rnd(0, W), y: doTopo ? rnd(-60, -10) : rnd(0, H * .9), r: rnd(4, 8), v: 0, espera: Math.round(rnd(20, 420)) };
    }
    function limiteFixas() { return Math.round(Math.min(320, W * H / 3200)); }

    function medir() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fixas = []; rastro = []; moveis = [];
      for (var i = 0, n = limiteFixas(); i < n; i++) fixas.push(novaFixa());
      for (var j = 0, m = Math.max(5, Math.min(22, Math.round(W * H / 48000))); j < m; j++) moveis.push(novaMovel(false));
    }

    function gota(x, y, r, a) {
      var g = ctx.createRadialGradient(x - r * .25, y - r * .3, r * .1, x, y, r);
      g.addColorStop(0, "rgba(205,242,255," + (.3 * a) + ")");
      g.addColorStop(.7, "rgba(120,200,240," + (.1 * a) + ")");
      g.addColorStop(1, "rgba(190,236,255," + (.45 * a) + ")");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      ctx.strokeStyle = "rgba(0,12,28," + (.35 * a) + ")";
      ctx.lineWidth = Math.max(.7, r * .16);
      ctx.beginPath(); ctx.arc(x, y + r * .06, r * .9, .25, 2.9); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255," + (.85 * a) + ")";
      ctx.beginPath(); ctx.arc(x - r * .34, y - r * .38, Math.max(.6, r * .2), 0, TAU); ctx.fill();
    }
    function gotinha(x, y, r, a) {
      ctx.fillStyle = "rgba(170,225,250," + (.2 * a) + ")";
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255," + (.65 * a) + ")";
      ctx.beginPath(); ctx.arc(x - r * .3, y - r * .35, Math.max(.35, r * .34), 0, TAU); ctx.fill();
    }

    function passo() {
      for (var i = 0; i < moveis.length; i++) {
        var m = moveis[i];
        if (m.espera > 0) { m.espera--; continue; }
        m.v = Math.min(m.v + .04 + m.r * .004, 4);
        m.y += m.v;
        m.x += Math.sin((m.y + i * 41) * .045) * .3;
        if (Math.random() < .4) rastro.push({ x: m.x + rnd(-1.2, 1.2), y: m.y - m.r * .9, r: rnd(.6, m.r * .3), a: 1 });
        for (var k = fixas.length - 1; k >= 0; k--) {
          var f = fixas[k], dx = f.x - m.x, dy = f.y - m.y, s = m.r + f.r;
          if (dx * dx + dy * dy < s * s) { fixas.splice(k, 1); m.r = Math.min(m.r + f.r * .06, 9.5); }
        }
        if (m.y - m.r * 2 > H) moveis[i] = novaMovel(true);
      }
      for (var p = rastro.length - 1; p >= 0; p--) { rastro[p].a -= .005; if (rastro[p].a <= 0) rastro.splice(p, 1); }
      if (rastro.length > 360) rastro.splice(0, rastro.length - 360);
      if (fixas.length < limiteFixas() && Math.random() < .5) fixas.push(novaFixa());
    }

    function desenhar() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < fixas.length; i++) {
        var f = fixas[i];
        if (f.r > 2.2) gota(f.x, f.y, f.r, f.a); else gotinha(f.x, f.y, f.r, f.a);
      }
      for (var p = 0; p < rastro.length; p++) gotinha(rastro[p].x, rastro[p].y, rastro[p].r, rastro[p].a);
      for (var j = 0; j < moveis.length; j++) {
        var m = moveis[j];
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.scale(1 - m.v * .03, 1 + m.v * .07);
        gota(0, 0, m.r, 1);
        ctx.restore();
      }
    }

    function quadro(t) {
      raf = requestAnimationFrame(quadro);
      if (t - ultimo < 33) return; // ~30 quadros por segundo bastam
      ultimo = t;
      passo();
      desenhar();
    }

    var espera;
    window.addEventListener("resize", function () {
      clearTimeout(espera);
      espera = setTimeout(function () {
        if (Math.abs(hero.clientWidth - W) > 40 || Math.abs(hero.clientHeight - H) > 120) { medir(); desenhar(); }
      }, 200);
    });

    medir();
    desenhar();
    return {
      ligar: function () {
        if (reduz || rodando) return;
        rodando = true; raf = requestAnimationFrame(quadro);
      },
      desligar: function () { rodando = false; cancelAnimationFrame(raf); }
    };
  })();

  // 9. Janelas do prédio acendem e apagam: tem gente vivendo ali
  var heroVisivel = true;
  var janelas = document.querySelectorAll(".c-janela");
  if (janelas.length && !reduz) {
    setInterval(function () {
      if (!heroVisivel || document.hidden) return;
      janelas[Math.floor(Math.random() * janelas.length)].classList.toggle("acesa");
    }, 1300);
  }

  // 10. Seções com animação contínua só animam quando estão na tela
  var cenas = document.querySelectorAll("[data-cena]");
  if ("IntersectionObserver" in window) {
    var ioCena = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        e.target.classList.toggle("em-cena", e.isIntersecting);
        if (e.target.classList.contains("hero")) {
          heroVisivel = e.isIntersecting;
          if (heroVisivel && !document.hidden) gotas.ligar(); else gotas.desligar();
        }
      });
    }, { rootMargin: "60px 0px" });
    cenas.forEach(function (c) { ioCena.observe(c); });
  } else {
    cenas.forEach(function (c) { c.classList.add("em-cena"); });
    gotas.ligar();
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) gotas.desligar(); else if (heroVisivel) gotas.ligar();
  });

  // 11. "Como trabalhamos": o tubo enche conforme a rolagem e abre cada registro
  var processo = document.querySelector(".processo");
  var atualizarProcesso = function () {};
  if (processo) {
    var tubo = processo.querySelector(".processo__tubo");
    var etapas = processo.querySelectorAll(".etapa");
    var valvulas = processo.querySelectorAll(".valvula");
    var horizontal = false, limiares = [];
    var medirProcesso = function () {
      horizontal = window.matchMedia("(min-width: 1000px)").matches;
      processo.classList.toggle("processo--horizontal", horizontal);
      var p = processo.getBoundingClientRect();
      var pos = Array.prototype.map.call(valvulas, function (v) { return v.getBoundingClientRect(); });
      var a = pos[0], b = pos[pos.length - 1];
      if (horizontal) {
        tubo.style.cssText = "left:" + (a.left - p.left + a.width / 2) + "px;top:" + (a.top - p.top + a.height / 2 - 6) +
          "px;width:" + (b.left - a.left) + "px;height:12px";
        limiares = pos.map(function (r) { return (r.left - a.left) / ((b.left - a.left) || 1); });
      } else {
        tubo.style.cssText = "left:" + (a.left - p.left + a.width / 2 - 6) + "px;top:" + (a.top - p.top + a.height / 2) +
          "px;height:" + (b.top - a.top) + "px;width:12px";
        limiares = pos.map(function (r) { return (r.top - a.top) / ((b.top - a.top) || 1); });
      }
      atualizarProcesso();
    };
    atualizarProcesso = function () {
      var vh = window.innerHeight, r = processo.getBoundingClientRect();
      var inicio = vh * .8, fim = horizontal ? vh * .3 : vh * .55 - r.height;
      var f = Math.max(0, Math.min(1, (inicio - r.top) / (inicio - fim)));
      processo.style.setProperty("--fluxo", f.toFixed(4));
      etapas.forEach(function (e, i) { e.classList.toggle("ativa", i === 0 ? f > .005 : f >= limiares[i] - .01); });
    };
    medirProcesso();
    var tProc;
    window.addEventListener("resize", function () { clearTimeout(tProc); tProc = setTimeout(medirProcesso, 150); });
    window.addEventListener("load", medirProcesso);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medirProcesso);
  }

  var agendado = false;
  window.addEventListener("scroll", function () {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(function () { agendado = false; aoRolar(); atualizarProcesso(); });
  }, { passive: true });
  aoRolar();

  // 12. Toque/clique vira uma pequena onda na água
  if (!reduz) {
    document.addEventListener("pointerdown", function (e) {
      if (e.button > 0) return;
      var s = document.createElement("span");
      s.className = "respingo";
      s.style.left = e.clientX + "px";
      s.style.top = e.clientY + "px";
      document.body.appendChild(s);
      setTimeout(function () { s.remove(); }, 900);
    }, { passive: true });
  }

  // 13. Formulário de contato: monta a mensagem e abre o WhatsApp
  var form = document.getElementById("form-contato");
  if (form) {
    var nota = document.getElementById("form-nota");
    var notaPadrao = nota ? nota.textContent : "";
    var campoNome = form.elements.nome;
    campoNome.addEventListener("input", function () {
      campoNome.parentElement.classList.remove("erro");
      if (nota) { nota.textContent = notaPadrao; nota.classList.remove("erro"); }
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = campoNome.value.trim();
      if (!nome) {
        campoNome.parentElement.classList.add("erro");
        campoNome.setAttribute("aria-invalid", "true");
        campoNome.focus();
        if (nota) { nota.textContent = "Escreva seu nome para a gente saber com quem está falando."; nota.classList.add("erro"); }
        return;
      }
      campoNome.removeAttribute("aria-invalid");
      var local = form.elements.local.value.trim();
      var assunto = form.elements.assunto.value;
      var msg = form.elements.mensagem.value.trim();
      var linhas = ["Olá! Vim pelo site da Mendonça & Leite.", "Nome: " + nome];
      if (local) linhas.push("Condomínio/empresa: " + local);
      linhas.push("Assunto: " + assunto);
      if (msg) linhas.push("Mensagem: " + msg);
      window.open("https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(linhas.join("\n")), "_blank", "noopener");
    });
  }
})();
