/* =====================================================================
   COMPONENTI: scala-energetica  e  esempi

   scala-energetica
     Diagramma orbitalico disposto per energia crescente (dal basso verso
     l'alto): ogni casella è un orbitale, ogni freccia un elettrone.
     Si riempie un elettrone alla volta seguendo le tre regole.
     Uso: <div data-componente="scala-energetica" data-elemento="K"
               data-vuoti="1" data-controlli="si"></div>
       data-vuoti      quanti sottolivelli vuoti mostrare sopra l'ultimo
       data-controlli  "si" per i pulsanti Riempi / Passo / Ricomincia

   esempi
     Schede con gli esempi guidati (H, He, Li, C, O, Ne, K...).
     I testi sono nell'HTML del modulo, dentro <template data-esempio="K">.
   ===================================================================== */
(function () {
  'use strict';
  var IM = window.IM, CH = IM.chimica;
  var B = 38, G = 5, RIGA = 54, X_COL = { s: 92, p: 202, d: 384 };

  function freccia(g, x, y, su) {
    var y1 = su ? y + 12 : y - 12, y2 = su ? y - 12 : y + 12, d = su ? -1 : 1;
    var a = IM.svg('g', { class: 'el' + (su ? ' su' : ' giu') }, g);
    IM.svg('path', { d: 'M' + x + ',' + y1 + 'V' + (y2 - d * 2), stroke: '#fff', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, a);
    IM.svg('path', { d: 'M' + (x - 5.5) + ',' + (y2 - d * 7) + 'L' + x + ',' + y2 + 'L' + (x + 5.5) + ',' + (y2 - d * 7), fill: 'none', stroke: '#fff', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, a);
    return a;
  }

  IM.scalaEnergetica = function (el, opz) {
    el.classList.add('scala');
    el.innerHTML = '';
    var svgBox = IM.h('div', { class: 'scala-svg' }, null, el);
    var riga = IM.h('div', { class: 'scala-cfg cfg', 'aria-live': 'polite' }, '', el);
    var barra = null, contatore = null;
    if (opz.controlli === 'si') {
      barra = IM.h('div', { class: 'controlli scala-ctrl' }, null, el);
      var bRiempi = IM.h('button', { class: 'btn pri', type: 'button' }, 'Riempi', barra);
      var bPasso = IM.h('button', { class: 'btn', type: 'button' }, 'Un elettrone', barra);
      var bReset = IM.h('button', { class: 'btn', type: 'button' }, 'Ricomincia', barra);
      contatore = IM.h('span', { class: 'mono piccolo scala-conta' }, '', barra);
      bRiempi.onclick = function () { anima(true); };
      bPasso.onclick = function () { ferma(); vai(Math.min(seq.length, mostrati + 1)); };
      bReset.onclick = function () { ferma(); vai(0); };
    }
    var Z, seq = [], frecce = [], caselleSotto = {}, mostrati = 0, timer = null;

    function costruisci(z) {
      Z = z;
      var conf = CH.configurazione(Z), vuoti = +(opz.vuoti || 0);
      var ultimo = conf[conf.length - 1].rango, sotto = CH.ORDINE.slice(0, ultimo + 1 + vuoti).filter(function (o) { return o.l <= 2; });
      var H = 40 + sotto.length * RIGA + 26, W = 620;
      svgBox.innerHTML = '';
      var svg = IM.svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Diagramma orbitalico ' + CH.del(CH.elemento(Z).nome) }, svgBox);
      /* asse dell'energia */
      IM.svg('path', { d: 'M22,' + (H - 18) + 'V22', stroke: '#5d6987', 'stroke-width': 1.5, 'marker-end': 'url(#freccia-asse)' }, svg);
      var defs = IM.svg('defs', null, svg), m = IM.svg('marker', { id: 'freccia-asse', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 8, markerHeight: 8, orient: 'auto' }, defs);
      IM.svg('path', { d: 'M1,1L9,5L1,9', fill: 'none', stroke: '#5d6987', 'stroke-width': 1.5 }, m);
      var et = IM.svg('text', { x: 14, y: H / 2, transform: 'rotate(-90 14 ' + H / 2 + ')', 'text-anchor': 'middle', class: 'mono', 'font-size': 12, fill: '#8d9bbd', 'letter-spacing': 2 }, svg);
      et.textContent = 'ENERGIA';
      caselleSotto = {}; frecce = [];
      sotto.forEach(function (o, i) {
        var y = H - 28 - i * RIGA - B / 2, x0 = X_COL[o.lettera];
        var g = IM.svg('g', { class: 'sotto l-' + o.lettera, 'data-sotto': o.nome }, svg);
        var lab = IM.svg('text', { x: x0 - 12, y: y + 6, 'text-anchor': 'end', class: 'mono', 'font-size': 17, 'font-weight': 600 }, g);
        lab.textContent = o.nome;
        var celle = [];
        for (var k = 0; k < o.orbitali; k++) {
          var x = x0 + k * (B + G);
          IM.svg('rect', { x: x, y: y - B / 2, width: B, height: B, rx: 5, class: 'casella' }, g);
          celle.push({ x: x, y: y });
        }
        caselleSotto[o.nome] = { g: g, celle: celle };
      });
      seq = CH.sequenza(Z);
      /* nei casi di eccezione (Cr, Cu) la sequenza segue la configurazione reale */
      seq.forEach(function (s) {
        var c = caselleSotto[s.sotto].celle[s.orbitale];
        var a = freccia(caselleSotto[s.sotto].g, c.x + (s.spin > 0 ? B * 0.34 : B * 0.66), c.y, s.spin > 0);
        frecce.push(a);
      });
    }

    function vai(n) {
      mostrati = n;
      frecce.forEach(function (a, i) { a.classList.toggle('vis', i < n); });
      var conta = {}, attuale = n > 0 ? seq[n - 1].sotto : null;
      seq.slice(0, n).forEach(function (s) { conta[s.sotto] = (conta[s.sotto] || 0) + 1; });
      Object.keys(caselleSotto).forEach(function (k) {
        caselleSotto[k].g.classList.toggle('attivo', k === attuale && n < seq.length);
        caselleSotto[k].g.classList.toggle('pieno', !!conta[k]);
      });
      var termini = CH.configurazione(Z).filter(function (t) { return conta[t.nome]; }).map(function (t) {
        var c = Object.assign({}, t); c.e = conta[t.nome]; return CH.termine(c);
      });
      riga.innerHTML = termini.length ? termini.join('') : '<span class="t piccolo">nessun elettrone</span>';
      if (contatore) contatore.textContent = 'elettroni ' + n + ' / ' + seq.length;
      if (el._cambio) el._cambio(n, seq.length);
    }
    function ferma() { clearInterval(timer); timer = null; }
    function anima(daCapo) {
      ferma();
      if (IM.ridotto) { vai(seq.length); return; }
      var i = daCapo ? 0 : mostrati; vai(i);
      var ritmo = Math.max(140, Math.min(420, 3400 / seq.length));
      timer = setInterval(function () { if (i >= seq.length) return ferma(); vai(++i); }, ritmo);
    }

    var api = {
      imposta: function (z, conAnimazione) { ferma(); costruisci(z); if (conAnimazione) anima(true); else vai(seq.length); },
      anima: anima, vai: vai
    };
    el._scala = api;
    var E = CH.elemento(opz.elemento || 'K');
    api.imposta(E.Z, false);
    /* riempimento automatico quando entra in vista per la prima volta */
    if (opz.automatico === 'si' && 'IntersectionObserver' in window) {
      vai(0);
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { anima(true); io.disconnect(); } }, { threshold: 0.5 });
      io.observe(el);
    }
    return api;
  };
  IM.componente('scala-energetica', function (el, opz) { IM.scalaEnergetica(el, opz); });

  IM.componente('esempi', function (el) {
    el.classList.add('esempi');
    var modelli = [].slice.call(el.querySelectorAll('template[data-esempio]'));
    var schede = IM.h('div', { class: 'schede esempi-schede', role: 'tablist', 'aria-label': 'Scegli un elemento' }, null, el);
    var corpo = IM.h('div', { class: 'esempi-corpo' }, null, el);
    var scheda = IM.h('div', { class: 'esempi-scheda' }, null, corpo);
    var scalaEl = IM.h('div', { class: 'esempi-scala' }, null, corpo);
    var api = null;
    function mostra(i, anima) {
      var t = modelli[i], E = CH.elemento(t.getAttribute('data-esempio'));
      [].forEach.call(schede.children, function (b, k) { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', k === i); });
      scheda.innerHTML = '<div class="es-simbolo"><span class="es-z mono">' + E.Z + '</span>' + E.simbolo + '</div>' +
        '<div class="es-nome">' + E.nome + '</div>' +
        '<dl class="es-dati"><div><dt>numero atomico</dt><dd class="mono">Z = ' + E.Z + '</dd></div><div><dt>elettroni (atomo neutro)</dt><dd class="mono">' + E.Z + '</dd></div></dl>' +
        '<div class="es-cfg cfg">' + CH.html(E.Z) + '</div>' + t.innerHTML;
      api = IM.scalaEnergetica(scalaEl, { elemento: E.simbolo, vuoti: t.getAttribute('data-vuoti') || 0, controlli: 'si' });
      api.imposta(E.Z, anima);
    }
    modelli.forEach(function (t, i) {
      var E = CH.elemento(t.getAttribute('data-esempio'));
      var b = IM.h('button', { class: 'chip es-chip', type: 'button', role: 'tab' }, '<b>' + E.simbolo + '</b><span>' + E.Z + '</span>', schede);
      b.onclick = function () { mostra(i, true); };
    });
    /* il primo esempio si riempie quando la scena entra in vista */
    mostra(0, false);
    if ('IntersectionObserver' in window && !IM.ridotto) {
      api.vai(0);
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { api.anima(true); io.disconnect(); } }, { threshold: 0.35 });
      io.observe(scalaEl);
    }
  });
})();
