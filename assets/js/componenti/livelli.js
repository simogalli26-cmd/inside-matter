/* =====================================================================
   COMPONENTI: livelli-atomo  e  struttura-livelli

   livelli-atomo
     Schema dei livelli di energia di un atomo, con il numero di elettroni
     in ciascun livello. Passa il mouse (o tocca) un livello per i dettagli.
     Uso: <div data-componente="livelli-atomo" data-elemento="K"></div>

   struttura-livelli
     Esploratore: scegli un livello n e vedi i suoi sottolivelli,
     quanti orbitali ha ciascuno e quanti elettroni può contenere.
     Uso: <div data-componente="struttura-livelli" data-livello="3"></div>
   ===================================================================== */
(function () {
  'use strict';
  var IM = window.IM, CH = IM.chimica;

  IM.componente('livelli-atomo', function (el, opz) {
    var E = CH.elemento(opz.elemento || 'K'), conf = CH.configurazione(E.Z), est = CH.esterni(E.Z);
    var livelli = [];
    conf.forEach(function (t) {
      var L = livelli[t.n - 1] || (livelli[t.n - 1] = { n: t.n, e: 0, termini: [] });
      L.e += t.e; L.termini.push(t);
    });
    el.classList.add('livelli-atomo');
    var S = 600, c = S / 2, N = livelli.length, passo = 250 / N;
    var svg = IM.svg('svg', { viewBox: '0 0 ' + S + ' ' + S, role: 'img', 'aria-label': 'Schema dei livelli di energia ' + CH.del(E.nome) }, el);
    var defs = IM.svg('defs', null, svg);
    var fil = IM.svg('filter', { id: 'sfoca-' + E.Z, x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
    IM.svg('feGaussianBlur', { stdDeviation: 9 }, fil);
    var gN = IM.svg('radialGradient', { id: 'nuc-' + E.Z }, defs);
    IM.svg('stop', { offset: '0', 'stop-color': '#fff4e4' }, gN); IM.svg('stop', { offset: '1', 'stop-color': '#ffb070', 'stop-opacity': '0' }, gN);

    var pannello = IM.h('div', { class: 'livelli-info', 'aria-live': 'polite' }, null, el);
    function base() {
      pannello.innerHTML = '<span class="k">' + E.nome + ' · ' + E.Z + ' elettroni</span>' +
        '<b class="cfg">' + livelli.map(function (L) { return L.e; }).join(' · ') + '</b>' +
        '<span>Passa sopra un livello per vedere come sono distribuiti i suoi elettroni.</span>';
    }
    livelli.forEach(function (L, i) {
      var r = 34 + passo * (i + 0.85), esterno = L.n === est.n;
      var col = esterno ? 'var(--val)' : ['#7cc8ff', '#7fa8ff', '#9d93ff', '#b493ff'][i];
      var g = IM.svg('g', { class: 'liv' + (esterno ? ' esterno' : ''), tabindex: 0, role: 'button', 'aria-label': 'Livello ' + L.n }, svg);
      IM.svg('circle', { cx: c, cy: c, r: r, fill: 'none', stroke: col, 'stroke-width': passo * 0.6, opacity: esterno ? 0.32 : 0.22, filter: 'url(#sfoca-' + E.Z + ')' }, g);
      IM.svg('circle', { cx: c, cy: c, r: r, fill: 'none', stroke: col, 'stroke-width': 1, 'stroke-dasharray': '2 6', opacity: 0.7 }, g);
      IM.svg('circle', { class: 'area', cx: c, cy: c, r: r, fill: 'none', stroke: 'transparent', 'stroke-width': passo * 0.9 }, g);
      var a = -Math.PI / 4 - i * 0.18, bx = c + Math.cos(a) * r, by = c + Math.sin(a) * r;
      IM.svg('circle', { cx: bx, cy: by, r: 19, fill: '#060a16', stroke: col, 'stroke-width': 1.5 }, g);
      var t = IM.svg('text', { x: bx, y: by + 6, 'text-anchor': 'middle', class: 'mono', 'font-size': 17, 'font-weight': 600, fill: esterno ? '#ffb27a' : '#eef3ff' }, g);
      t.textContent = L.e;
      var tn = IM.svg('text', { x: c - r + 6, y: c + 5, class: 'mono', 'font-size': 12, fill: '#8d9bbd' }, g);
      tn.textContent = 'n=' + L.n;
      function mostra() {
        svg.classList.add('fuoco'); [].forEach.call(svg.querySelectorAll('.liv'), function (x) { x.classList.toggle('on', x === g); });
        var max = 2 * L.n * L.n;
        pannello.innerHTML = '<span class="k">Livello ' + L.n + (esterno ? ' · il più esterno' : '') + '</span>' +
          '<b class="cfg">' + L.termini.map(CH.termine).join('') + '</b>' +
          '<span>' + L.e + (L.e === 1 ? ' elettrone' : ' elettroni') + '. Il livello ' + L.n + ' può contenerne al massimo ' + max + '.' +
          (L.e < max && !esterno && L.n === 3 ? ' Qui ce ne sono solo 8 perché, dopo il 3p, si riempie prima il 4s, che ha energia più bassa del 3d.' : '') +
          (esterno ? ' Sono gli <b>elettroni di valenza</b>: decidono il comportamento chimico.' : '') + '</span>';
      }
      g.addEventListener('mouseenter', mostra); g.addEventListener('focus', mostra); g.addEventListener('click', mostra);
      g.addEventListener('mouseleave', function () { svg.classList.remove('fuoco'); base(); });
    });
    IM.svg('circle', { cx: c, cy: c, r: 16, fill: 'url(#nuc-' + E.Z + ')' }, svg);
    IM.svg('circle', { cx: c, cy: c, r: 3.5, fill: '#fff4e4' }, svg);
    base();
  });

  IM.componente('struttura-livelli', function (el, opz) {
    el.classList.add('struttura');
    var schede = IM.h('div', { class: 'schede', role: 'tablist', 'aria-label': 'Scegli il livello' }, null, el);
    var corpo = IM.h('div', { class: 'struttura-corpo' }, null, el);
    function mostra(n) {
      [].forEach.call(schede.children, function (b, i) { b.classList.toggle('on', i + 1 === n); b.setAttribute('aria-selected', i + 1 === n); });
      var righe = '', tot = 0;
      for (var l = 0; l < n && l < 4; l++) {
        var lett = CH.LETTERE[l], orb = CH.ORBITALI[lett], max = CH.POSTI[lett]; tot += max;
        var caselle = ''; for (var k = 0; k < orb; k++) caselle += '<i></i>';
        righe += '<div class="riga l-' + lett + '" style="--i:' + l + '"><span class="sotto">' + n + lett + '</span><span class="caselle">' + caselle + '</span>' +
          '<span class="conta">' + orb + (orb === 1 ? ' orbitale' : ' orbitali') + '</span><span class="max">max ' + max + ' e⁻</span></div>';
      }
      corpo.innerHTML = '<div class="liv-testa"><span class="mono">n = ' + n + '</span><span>' + n + (n === 1 ? ' sottolivello' : ' sottolivelli') + '</span></div>' + righe +
        '<div class="liv-tot"><span>Totale del livello ' + n + '</span><b class="mono">' + tot + ' elettroni</b><span class="piccolo">= 2 × ' + n + '² </span></div>';
    }
    [1, 2, 3, 4].forEach(function (n) {
      var b = IM.h('button', { class: 'chip', type: 'button', role: 'tab' }, 'Livello ' + n, schede);
      b.onclick = function () { mostra(n); };
    });
    mostra(+(opz.livello || 3));
  });
})();
