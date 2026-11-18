/* =====================================================================
   COMPONENTI DELLE TRE REGOLE
     aufbau  — schema delle diagonali, con l'ordine di riempimento animato
     pauli   — un orbitale da riempire: massimo 2 elettroni, spin opposti
     hund    — tre orbitali 2p da sistemare (azoto, 3 elettroni)
   Aiuto condiviso: IM.orbitaleHTML([1,-1]) disegna una casella con frecce.
   ===================================================================== */
(function () {
  'use strict';
  var IM = window.IM, CH = IM.chimica;

  var SU = '<svg class="fr" viewBox="0 0 12 30" aria-hidden="true"><path d="M6 28V3M1.2 8.5L6 2.5l4.8 6"/></svg>';
  var GIU = '<svg class="fr" viewBox="0 0 12 30" aria-hidden="true"><path d="M6 2v25M1.2 21.5L6 27.5l4.8-6"/></svg>';
  IM.orbitaleHTML = function (el, cls) {
    return '<span class="orb ' + (cls || '') + '">' + (el || []).map(function (s) { return s > 0 ? SU : GIU; }).join('') + '</span>';
  };
  var descr = function (arr) { return arr.length ? arr.map(function (s) { return s > 0 ? 'su' : 'giù'; }).join(' e ') : 'vuoto'; };

  /* ---------------- AUFBAU: le diagonali ---------------- */
  IM.componente('aufbau', function (el) {
    el.classList.add('aufbau');
    var vista = IM.h('div', { class: 'aufbau-svg' }, null, el);
    var lato = IM.h('div', { class: 'aufbau-lato' }, null, el);
    var DX = 112, DY = 54, X0 = 60, Y0 = 44, W = X0 + 3 * DX + 90, H = Y0 + 6 * DY + 56;
    var svg = IM.svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Schema delle diagonali per l\'ordine di riempimento' }, vista);
    var defs = IM.svg('defs', null, svg), mk = IM.svg('marker', { id: 'punta-diag', viewBox: '0 0 10 10', refX: 6, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs);
    IM.svg('path', { d: 'M0,0L10,5L0,10z', fill: '#6f7fa6' }, mk);
    var pos = function (n, l) { return [X0 + l * DX, Y0 + (n - 1) * DY]; };
    var diag = {}, celle = {};
    /* diagonali: n + l costante, dall'alto a destra verso il basso a sinistra */
    for (var k = 1; k <= 8; k++) {
      var membri = CH.ORDINE.filter(function (o) { return o.n + o.l === k; });
      if (!membri.length) continue;
      var a = pos(membri[0].n, membri[0].l), b = pos(membri[membri.length - 1].n, membri[membri.length - 1].l);
      var ux = -DX, uy = DY, L = Math.hypot(ux, uy); ux /= L; uy /= L;
      diag[k] = IM.svg('path', { class: 'diag', d: 'M' + (a[0] - ux * 40) + ',' + (a[1] - uy * 40) + 'L' + (b[0] + ux * 40) + ',' + (b[1] + uy * 40), 'marker-end': 'url(#punta-diag)' }, svg);
    }
    CH.ORDINE.forEach(function (o, i) {
      var p = pos(o.n, o.l), g = IM.svg('g', { class: 'cella l-' + o.lettera }, svg);
      IM.svg('rect', { x: p[0] - 26, y: p[1] - 17, width: 52, height: 34, rx: 17 }, g);
      var t = IM.svg('text', { x: p[0], y: p[1] + 6, 'text-anchor': 'middle', class: 'mono', 'font-size': 17, 'font-weight': 600 }, g);
      t.textContent = o.nome;
      celle[o.nome] = g; o._i = i;
    });
    ['s', 'p', 'd', 'f'].forEach(function (l, i) {
      var t = IM.svg('text', { x: X0 + i * DX, y: 16, 'text-anchor': 'middle', class: 'mono', 'font-size': 12, fill: '#8d9bbd' }, svg); t.textContent = l;
    });

    lato.innerHTML = '<p class="aufbau-k mono">Ordine di riempimento</p>';
    var elenco = IM.h('ol', { class: 'aufbau-ordine' }, null, lato);
    var voci = CH.ORDINE.map(function (o) { return IM.h('li', { class: 'l-' + o.lettera }, o.nome, elenco); });
    var nota = IM.h('p', { class: 'aufbau-nota', 'aria-live': 'polite' }, 'Segui le frecce dall\'alto: ogni diagonale si percorre dall\'alto a destra verso il basso a sinistra.', lato);
    var ctrl = IM.h('div', { class: 'controlli' }, null, lato);
    var bGo = IM.h('button', { class: 'btn pri', type: 'button' }, 'Segui le diagonali', ctrl);
    var bP = IM.h('button', { class: 'btn', type: 'button' }, 'Passo', ctrl);
    var bR = IM.h('button', { class: 'btn', type: 'button' }, 'Ricomincia', ctrl);
    var i = -1, tm = null;
    var NOTE = {
      '1s': 'Si parte dal sottolivello a energia più bassa: 1s.',
      '2p': 'Dopo 2s viene 2p: la diagonale successiva.',
      '4s': '<b>Attenzione:</b> il 4s viene prima del 3d. Ha energia più bassa, quindi si riempie prima.',
      '3d': 'Solo ora tocca al 3d, e subito dopo al 4p.',
      '4f': 'Il 4f arriva tardi: dopo il 6s.'
    };
    function vai(k) {
      i = k;
      CH.ORDINE.forEach(function (o, j) {
        celle[o.nome].classList.toggle('fatto', j < k); celle[o.nome].classList.toggle('ora', j === k);
        voci[j].classList.toggle('fatto', j < k); voci[j].classList.toggle('ora', j === k);
      });
      Object.keys(diag).forEach(function (d) { diag[d].classList.toggle('ora', k >= 0 && k < CH.ORDINE.length && +d === CH.ORDINE[k].n + CH.ORDINE[k].l); });
      if (k >= 0 && k < CH.ORDINE.length && NOTE[CH.ORDINE[k].nome]) nota.innerHTML = NOTE[CH.ORDINE[k].nome];
      if (k >= CH.ORDINE.length) nota.innerHTML = 'Questo è l\'ordine di energia crescente: gli elettroni occupano i sottolivelli in questa sequenza.';
    }
    function stop() { clearInterval(tm); tm = null; bGo.textContent = 'Segui le diagonali'; }
    bGo.onclick = function () {
      if (tm) return stop();
      if (i >= CH.ORDINE.length - 1) vai(-1);
      bGo.textContent = 'Pausa';
      tm = setInterval(function () { if (i >= CH.ORDINE.length) return stop(); vai(i + 1); }, 900);
    };
    bP.onclick = function () { stop(); vai(Math.min(CH.ORDINE.length, i + 1)); };
    bR.onclick = function () { stop(); vai(-1); nota.innerHTML = 'Segui le frecce dall\'alto: ogni diagonale si percorre dall\'alto a destra verso il basso a sinistra.'; };
    vai(-1);
  });

  /* ---------------- PAULI ---------------- */
  IM.componente('pauli', function (el) {
    el.classList.add('pauli');
    var stato = [];
    var box = IM.h('div', { class: 'pauli-box' }, null, el);
    var ctrl = IM.h('div', { class: 'controlli' }, null, el);
    var bSu = IM.h('button', { class: 'btn', type: 'button' }, 'Aggiungi ↑', ctrl);
    var bGiu = IM.h('button', { class: 'btn', type: 'button' }, 'Aggiungi ↓', ctrl);
    var bVia = IM.h('button', { class: 'btn', type: 'button' }, 'Svuota', ctrl);
    var esito = IM.h('p', { class: 'esito', 'aria-live': 'polite' }, '', el);
    function giudica() {
      var ok = true, msg;
      if (stato.length === 0) msg = 'Un orbitale vuoto. Aggiungi un elettrone.';
      else if (stato.length === 1) msg = 'Un elettrone, spin ' + (stato[0] > 0 ? 'su' : 'giù') + '. C\'è posto per un secondo elettrone.';
      else if (stato.length > 2) { ok = false; msg = '<b>Non è possibile.</b> Un orbitale contiene al massimo due elettroni.'; }
      else if (stato[0] === stato[1]) { ok = false; msg = '<b>Non è possibile.</b> Due elettroni nello stesso orbitale devono avere spin opposto.'; }
      else msg = '<b>Orbitale completo:</b> due elettroni con spin opposto. Il principio di Pauli è rispettato.';
      box.innerHTML = IM.orbitaleHTML(stato, 'grande ' + (ok ? '' : 'errore'));
      box.setAttribute('aria-label', 'Orbitale: ' + descr(stato));
      esito.innerHTML = msg; esito.className = 'esito ' + (ok ? (stato.length === 2 ? 'ok' : '') : 'no');
    }
    bSu.onclick = function () { if (stato.length < 3) stato.push(1); giudica(); };
    bGiu.onclick = function () { if (stato.length < 3) stato.push(-1); giudica(); };
    bVia.onclick = function () { stato = []; giudica(); };
    giudica();
  });

  /* ---------------- HUND ---------------- */
  IM.componente('hund', function (el) {
    el.classList.add('hund');
    var stati = [[], [1], [1, -1], [-1]], scelta = [0, 0, 0];
    IM.h('p', { class: 'hund-k mono' }, 'Azoto · sottolivello 2p · 3 elettroni', el);
    var riga = IM.h('div', { class: 'hund-riga' }, null, el);
    var bottoni = [0, 1, 2].map(function (k) {
      var b = IM.h('button', { type: 'button', class: 'hund-orb', 'aria-label': 'Orbitale 2p numero ' + (k + 1) + ': tocca per cambiare' }, '', riga);
      b.onclick = function () { scelta[k] = (scelta[k] + 1) % 4; disegna(); esito.innerHTML = ''; esito.className = 'esito'; };
      return b;
    });
    IM.h('p', { class: 'piccolo' }, 'Tocca un orbitale per cambiarne il contenuto: vuoto → ↑ → ↑↓ → ↓.', el);
    var ctrl = IM.h('div', { class: 'controlli' }, null, el);
    var bV = IM.h('button', { class: 'btn pri', type: 'button' }, 'Verifica', ctrl);
    var bS = IM.h('button', { class: 'btn', type: 'button' }, 'Mostra la soluzione', ctrl);
    var esito = IM.h('p', { class: 'esito', 'aria-live': 'polite' }, '', el);
    function disegna() { bottoni.forEach(function (b, k) { b.innerHTML = IM.orbitaleHTML(stati[scelta[k]]); }); }
    bV.onclick = function () {
      var arr = scelta.map(function (s) { return stati[s]; }), tot = 0, coppie = 0, su = 0, giu = 0;
      arr.forEach(function (o) { tot += o.length; if (o.length === 2) coppie++; o.forEach(function (x) { x > 0 ? su++ : giu++; }); });
      var ok = false, msg;
      if (tot !== 3) msg = 'Hai sistemato ' + tot + (tot === 1 ? ' elettrone' : ' elettroni') + ': nel 2p dell\'azoto ce ne sono <b>3</b>.';
      else if (coppie) msg = 'Due elettroni sono appaiati mentre un orbitale è ancora vuoto. Per la regola di Hund gli elettroni occupano prima <b>orbitali diversi</b>.';
      else if (su && giu) msg = 'Ogni orbitale ha un elettrone, ma gli spin non sono paralleli. Devono puntare tutti <b>nello stesso verso</b>.';
      else { ok = true; msg = '<b>Corretto.</b> Tre elettroni spaiati, uno per orbitale, con spin parallelo.' + (giu ? ' Per convenzione si disegnano verso l\'alto.' : ''); }
      esito.innerHTML = msg; esito.className = 'esito ' + (ok ? 'ok' : 'no');
    };
    bS.onclick = function () { scelta = [1, 1, 1]; disegna(); bV.onclick(); };
    disegna();
  });

  /* esempi statici giusto/sbagliato:  <div data-componente="confronto" data-casi='[...]'> */
  IM.componente('confronto', function (el, opz) {
    el.classList.add('confronto');
    JSON.parse(opz.casi).forEach(function (c) {
      var d = IM.h('figure', { class: 'caso ' + (c.ok ? 'ok' : 'no') }, null, el);
      IM.h('div', { class: 'caso-orb' }, c.orb.map(function (o) { return IM.orbitaleHTML(o); }).join(''), d);
      IM.h('figcaption', null, '<span class="segno">' + (c.ok ? '✓' : '✗') + '</span>' + c.testo, d);
    });
  });
})();
