/* =====================================================================
   COMPONENTI PER LEGGERE E SCRIVERE LE CONFIGURAZIONI
     anatomia      — il termine "2p⁶" scomposto: livello, sottolivello, elettroni
     leggi-config  — una configurazione intera: tocca un termine per leggerlo,
                     e la somma degli esponenti dà il numero atomico
     abbreviata    — la parte uguale al gas nobile si chiude in [Ar]
   ===================================================================== */
(function () {
  'use strict';
  var IM = window.IM, CH = IM.chimica;
  var NOMI_SOTTO = { s: 's', p: 'p', d: 'd', f: 'f' };

  IM.componente('anatomia', function (el, opz) {
    el.classList.add('anatomia');
    var n = opz.n || '2', l = opz.l || 'p', e = opz.e || '6';
    var parti = [
      ['n', n, 'livello', 'Il <b>numero</b> indica il livello di energia (n = ' + n + '). Più è alto, più l\'elettrone è in media lontano dal nucleo e ha energia maggiore.'],
      ['l', l, 'sottolivello', 'La <b>lettera</b> indica il sottolivello: s, p, d o f. Dice la forma degli orbitali e quanti sono: ' + l + ' → ' + CH.ORBITALI[l] + (CH.ORBITALI[l] === 1 ? ' orbitale.' : ' orbitali.')],
      ['e', e, 'elettroni', 'L\'<b>esponente</b> è il numero di elettroni in quel sottolivello. Qui ' + e + ': ' + (+e === CH.POSTI[l] ? 'il sottolivello ' + n + l + ' è completo.' : 'ce ne possono stare al massimo ' + CH.POSTI[l] + '.')]
    ];
    var grande = IM.h('div', { class: 'anat-grande l-' + l }, null, el);
    var info = IM.h('p', { class: 'anat-info', 'aria-live': 'polite' }, '', el);
    parti.forEach(function (p) {
      var b = IM.h('button', { type: 'button', class: 'anat-parte anat-' + p[0] }, '<span class="glifo">' + p[1] + '</span><span class="anat-et">' + p[2] + '</span>', grande);
      b.onclick = function () { scegli(p, b); };
      b.addEventListener('mouseenter', function () { scegli(p, b); });
      p.b = b;
    });
    function scegli(p, b) {
      parti.forEach(function (q) { q.b.classList.toggle('on', q === p); });
      info.innerHTML = p[3];
    }
    scegli(parti[0], parti[0].b);
  });

  IM.componente('leggi-config', function (el, opz) {
    el.classList.add('leggi');
    var lista = (opz.elementi || 'K').split(',');
    var schede = IM.h('div', { class: 'schede' }, null, el);
    var riga = IM.h('div', { class: 'leggi-riga cfg' }, '', el);
    var somma = IM.h('div', { class: 'leggi-somma mono' }, '', el);
    var info = IM.h('p', { class: 'leggi-info', 'aria-live': 'polite' }, '', el);
    function mostra(sim) {
      var E = CH.elemento(sim), conf = CH.configurazione(E.Z);
      [].forEach.call(schede.children, function (b) { b.classList.toggle('on', b.textContent === sim); });
      riga.innerHTML = conf.map(function (t) {
        return '<button type="button" class="t l-' + t.lettera + '" data-sotto="' + t.nome + '">' + t.nome + '<sup>' + t.e + '</sup></button>';
      }).join('');
      somma.innerHTML = conf.map(function (t) { return '<span class="l-' + t.lettera + '">' + t.e + '</span>'; }).join(' + ') + ' = <b>' + E.Z + '</b> <span class="piccolo">elettroni = numero atomico ' + CH.del(E.nome) + ' ✓</span>';
      info.innerHTML = 'Tocca un termine per leggerlo.';
      [].forEach.call(riga.querySelectorAll('button'), function (b, i) {
        var t = conf[i];
        var leggi = function () {
          [].forEach.call(riga.children, function (x) { x.classList.toggle('on', x === b); });
          info.innerHTML = '<b class="cfg">' + t.nome + '<sup>' + t.e + '</sup></b> → livello <b>' + t.n + '</b>, sottolivello <b>' + NOMI_SOTTO[t.lettera] + '</b>, <b>' + t.e + '</b> ' + (t.e === 1 ? 'elettrone' : 'elettroni') +
            (t.e === t.posti ? ' (completo)' : ' (su ' + t.posti + ' posti)') + '.';
        };
        b.onclick = leggi; b.addEventListener('mouseenter', leggi);
      });
    }
    lista.forEach(function (s) { var b = IM.h('button', { class: 'chip', type: 'button' }, s, schede); b.onclick = function () { mostra(s); }; });
    mostra(opz.iniziale || lista[lista.length - 1]);
  });

  IM.componente('abbreviata', function (el, opz) {
    el.classList.add('abbr');
    var lista = (opz.elementi || 'K').split(',');
    var schede = IM.h('div', { class: 'schede' }, null, el);
    var palco = IM.h('div', { class: 'abbr-palco' }, null, el);
    var spieg = IM.h('p', { class: 'abbr-spieg', 'aria-live': 'polite' }, '', el);
    var ctrl = IM.h('div', { class: 'controlli' }, null, el);
    var bTog = IM.h('button', { class: 'btn pri', type: 'button' }, 'Abbrevia', ctrl);
    var chiuso = false, attuale;
    function mostra(sim) {
      var E = CH.elemento(sim), a = CH.abbreviata(E.Z), G = CH.elemento(a.Zgas);
      attuale = sim;
      [].forEach.call(schede.children, function (b) { b.classList.toggle('on', b.textContent === sim); });
      var conf = CH.configurazione(E.Z), nGas = CH.configurazione(a.Zgas).length;
      var nucleo = conf.slice(0, nGas), resto = a.resto;
      palco.innerHTML =
        '<div class="abbr-riga"><span class="abbr-sim">' + E.simbolo + '</span><span class="cfg abbr-cfg">' +
          '<span class="abbr-core">' + nucleo.map(CH.termine).join('') + '</span>' +
          '<span class="abbr-gas t core">[' + a.gas + ']</span>' +
          '<span class="abbr-resto">' + resto.map(CH.termine).join('') + '</span></span></div>' +
        '<div class="abbr-riga abbr-ng"><span class="abbr-sim">' + G.simbolo + '</span><span class="cfg">' + CH.html(a.Zgas) + '</span><span class="piccolo">' + G.nome.toLowerCase() + ', gas nobile, Z = ' + a.Zgas + '</span></div>';
      spieg.innerHTML = 'I primi ' + a.Zgas + ' elettroni ' + CH.del(E.nome) + ' (Z = ' + E.Z + ') sono disposti esattamente come quelli ' + CH.del(G.nome).replace(G.nome.toLowerCase(), '<b>' + G.nome.toLowerCase() + '</b>') + ', il gas nobile che lo precede. ' +
        'Si scrive <b class="cfg">[' + a.gas + ']</b> e si aggiungono solo gli elettroni in più: <b class="cfg">' + resto.map(CH.termine).join('') + '</b>.';
      imposta(chiuso, true);
    }
    function imposta(v, subito) {
      chiuso = v; bTog.textContent = v ? 'Mostra per intero' : 'Abbrevia';
      var core = palco.querySelector('.abbr-core'), gas = palco.querySelector('.abbr-gas');
      if (!core) return;
      core.style.setProperty('--w', core.scrollWidth + 'px');
      if (subito) { palco.classList.add('subito'); requestAnimationFrame(function () { palco.classList.remove('subito'); }); }
      palco.classList.toggle('chiuso', v);
      void gas;
    }
    bTog.onclick = function () { imposta(!chiuso); };
    lista.forEach(function (s) { var b = IM.h('button', { class: 'chip', type: 'button' }, s, schede); b.onclick = function () { mostra(s); }; });
    mostra(opz.iniziale || lista[0]);
    addEventListener('resize', function () { mostra(attuale); });
  });
})();
