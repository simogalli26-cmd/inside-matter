/* =====================================================================
   COMPONENTI SUGLI ELETTRONI DI VALENZA
     famiglie — elementi dello stesso gruppo: stessa configurazione esterna,
                comportamento simile. I gruppi sono scritti nell'HTML (JSON).
     tavola   — i primi 36 elementi disposti come nella tavola periodica:
                tocca un elemento per vedere la sua configurazione.
   ===================================================================== */
(function () {
  'use strict';
  var IM = window.IM, CH = IM.chimica;

  /* configurazione abbreviata con il livello più esterno in evidenza */
  IM.htmlValenza = function (Z) {
    var est = CH.esterni(Z), a = CH.abbreviata(Z);
    var termini = a ? a.resto : CH.configurazione(Z);
    var html = termini.map(function (t) {
      return '<span class="t l-' + t.lettera + (t.n === est.n ? ' val' : '') + '">' + t.nome + '<sup>' + t.e + '</sup></span>';
    }).join('');
    return (a ? '<span class="t core">[' + a.gas + ']</span>' : '') + html;
  };

  IM.componente('famiglie', function (el, opz) {
    el.classList.add('famiglie');
    JSON.parse(opz.famiglie).forEach(function (f) {
      var col = IM.h('article', { class: 'famiglia' }, null, el);
      IM.h('p', { class: 'fam-gruppo mono' }, f.gruppo, col);
      IM.h('h3', null, f.titolo, col);
      var tab = IM.h('div', { class: 'fam-righe' }, null, col);
      f.elementi.forEach(function (s) {
        var E = CH.elemento(s), est = CH.esterni(E.Z);
        IM.h('div', { class: 'fam-riga' }, '<span class="fam-sim">' + E.simbolo + '</span><span class="cfg">' + IM.htmlValenza(E.Z) + '</span><span class="fam-n mono">' + est.e + '</span>', tab);
      });
      IM.h('p', { class: 'fam-esterno mono' }, f.esterno, col);
      IM.h('p', { class: 'fam-comp' }, f.comportamento, col);
    });
  });

  IM.componente('tavola', function (el, opz) {
    el.classList.add('tavola');
    var griglia = IM.h('div', { class: 'tavola-griglia', role: 'listbox', 'aria-label': 'Elementi da idrogeno a kripton' }, null, el);
    var dett = IM.h('div', { class: 'tavola-dett', 'aria-live': 'polite' }, null, el);
    var celle = {};
    for (var g = 1; g <= 18; g++) { var h = IM.h('span', { class: 'tavola-g mono', style: 'grid-column:' + (g + 1) + ';grid-row:1' }, g, griglia); void h; }
    for (var p = 1; p <= 4; p++) IM.h('span', { class: 'tavola-p mono', style: 'grid-column:1;grid-row:' + (p + 1) }, p, griglia);
    for (var Z = 1; Z <= CH.SIMBOLI.length; Z++) (function (Z) {
      var E = CH.elemento(Z);
      var b = IM.h('button', { type: 'button', role: 'option', class: 'tcella b-' + E.blocco, style: 'grid-column:' + (E.gruppo + 1) + ';grid-row:' + (E.periodo + 1), title: E.nome },
        '<span class="tz mono">' + Z + '</span><b>' + E.simbolo + '</b>', griglia);
      b.onclick = function () { scegli(Z); };
      celle[Z] = b;
    })(Z);
    IM.h('div', { class: 'tavola-leg', style: 'grid-column:5 / span 9;grid-row:2 / span 2' },
      '<span class="b-s">blocco s</span><span class="b-p">blocco p</span><span class="b-d">blocco d</span><span class="piccolo">I colori indicano l\'ultimo sottolivello che si riempie.</span>', griglia);

    var scalaEl;
    function scegli(Z) {
      var E = CH.elemento(Z), est = CH.esterni(Z);
      Object.keys(celle).forEach(function (k) { celle[k].classList.toggle('on', +k === Z); celle[k].setAttribute('aria-selected', +k === Z); });
      var valTesto;
      if (E.blocco === 'd') valTesto = 'Nel livello più esterno (n = ' + est.n + ') ' + (est.e === 1 ? 'c\'è <b>1</b> elettrone.' : 'ci sono <b>' + est.e + '</b> elettroni.') + ' Nei metalli di transizione, però, ai legami partecipano anche gli elettroni del sottolivello 3d.';
      else if (E.gasNobile) valTesto = 'Livello esterno <b>completo</b> (' + est.e + ' elettroni): per questo i gas nobili quasi non reagiscono.';
      else valTesto = '<b>' + est.e + ' ' + (est.e === 1 ? 'elettrone' : 'elettroni') + ' di valenza</b>, nel livello ' + est.n + '.';
      dett.innerHTML =
        '<div class="td-testa"><span class="td-sim">' + E.simbolo + '</span><div><b class="td-nome">' + E.nome + '</b>' +
        '<span class="mono piccolo">Z = ' + Z + ' · periodo ' + E.periodo + ' · gruppo ' + E.gruppo + '</span></div></div>' +
        '<p class="td-k mono">configurazione completa</p><p class="cfg td-cfg">' + CH.html(Z) + '</p>' +
        '<p class="td-k mono">abbreviata</p><p class="cfg td-cfg">' + IM.htmlValenza(Z) + '</p>' +
        '<p class="td-val">' + valTesto + '</p>' + (E.eccezione ? '<p class="nota">' + E.eccezione + '</p>' : '') +
        '<div class="td-scala"></div>';
      scalaEl = dett.querySelector('.td-scala');
      IM.scalaEnergetica(scalaEl, { elemento: E.simbolo, vuoti: 0 }).imposta(Z, true);
    }
    scegli(+(opz.iniziale || 19));
  });
})();
