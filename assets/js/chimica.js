/* =====================================================================
   INSIDE MATTER — dati e calcoli di chimica condivisi
   ---------------------------------------------------------------------
   Elementi da H (Z = 1) a Kr (Z = 36) e calcolo della configurazione
   elettronica nello stato fondamentale.
   Potrà essere riusato dai moduli futuri (tavola periodica, legami...).
   Per estendere a più elementi: aggiungi simboli e nomi agli elenchi
   e, se servono, le eccezioni in ECCEZIONI.
   ===================================================================== */
(function () {
  'use strict';
  var IM = (window.IM = window.IM || {});

  var SIMBOLI = ['H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar',
    'K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr'];
  var NOMI = ['Idrogeno','Elio','Litio','Berillio','Boro','Carbonio','Azoto','Ossigeno','Fluoro','Neon',
    'Sodio','Magnesio','Alluminio','Silicio','Fosforo','Zolfo','Cloro','Argon',
    'Potassio','Calcio','Scandio','Titanio','Vanadio','Cromo','Manganese','Ferro','Cobalto','Nichel','Rame','Zinco',
    'Gallio','Germanio','Arsenico','Selenio','Bromo','Kripton'];

  var LETTERE = 'spdf';
  var POSTI = { s: 2, p: 6, d: 10, f: 14 };      // elettroni massimi per sottolivello
  var ORBITALI = { s: 1, p: 3, d: 5, f: 7 };     // orbitali per sottolivello
  var GAS_NOBILI = [2, 10, 18, 36, 54, 86];

  /* Ordine di riempimento (regola delle diagonali, cioè n + l crescente;
     a parità di n + l si riempie prima il sottolivello con n minore). */
  var ORDINE = [];
  for (var k = 1; k <= 8; k++)
    for (var l = Math.min(3, k - 1); l >= 0; l--) {
      var n = k - l;
      if (n > l && n <= 7) ORDINE.push({ n: n, l: l, lettera: LETTERE[l], nome: n + LETTERE[l], posti: POSTI[LETTERE[l]], orbitali: ORBITALI[LETTERE[l]] });
    }

  /* Eccezioni reali tra i primi 36 elementi: un elettrone 4s passa nel 3d */
  var ECCEZIONI = {
    24: { '4s': 1, '3d': 5,  nota: 'Il cromo è un\'eccezione: con 3d⁵ 4s¹ ogni orbitale 3d ha un elettrone, una disposizione più stabile di 3d⁴ 4s².' },
    29: { '4s': 1, '3d': 10, nota: 'Il rame è un\'eccezione: con 3d¹⁰ 4s¹ il sottolivello 3d è completo, una disposizione più stabile di 3d⁹ 4s².' }
  };

  function configurazione(Z) {
    var resto = Z, out = [];
    for (var i = 0; i < ORDINE.length && resto > 0; i++) {
      var o = ORDINE[i], e = Math.min(o.posti, resto);
      out.push({ n: o.n, l: o.l, lettera: o.lettera, nome: o.nome, posti: o.posti, orbitali: o.orbitali, e: e, rango: i });
      resto -= e;
    }
    var ecc = ECCEZIONI[Z];
    if (ecc) out.forEach(function (t) { if (ecc[t.nome] != null) t.e = ecc[t.nome]; });
    return out;
  }

  function gasNobilePrecedente(Z) {
    var g = null;
    GAS_NOBILI.forEach(function (x) { if (x < Z) g = x; });
    return g;
  }

  /* Configurazione abbreviata: [gas nobile precedente] + ciò che resta */
  function abbreviata(Z) {
    var g = gasNobilePrecedente(Z);
    if (!g) return null;
    var nucleo = {}; configurazione(g).forEach(function (t) { nucleo[t.nome] = t.e; });
    var resto = [];
    configurazione(Z).forEach(function (t) {
      var e = t.e - (nucleo[t.nome] || 0);
      if (e > 0) { var c = Object.assign({}, t); c.e = e; resto.push(c); }
    });
    return { gas: SIMBOLI[g - 1], Zgas: g, resto: resto };
  }

  /* Posizione nella tavola periodica (primi 4 periodi) */
  function posizione(Z) {
    var periodo = Z <= 2 ? 1 : Z <= 10 ? 2 : Z <= 18 ? 3 : 4;
    var inizio = [0, 1, 3, 11, 19][periodo], i = Z - inizio, gruppo;
    if (periodo === 1) gruppo = Z === 1 ? 1 : 18;
    else if (periodo === 4) gruppo = i + 1;                // K..Kr: 1..18
    else gruppo = i < 2 ? i + 1 : i + 11;                  // 1, 2, poi 13..18
    var blocco = periodo === 1 ? 's' : (gruppo <= 2 ? 's' : gruppo >= 13 ? 'p' : 'd');
    if (Z === 2) blocco = 's';
    return { periodo: periodo, gruppo: gruppo, blocco: blocco };
  }

  /* Elettroni del livello più esterno (n più alto) */
  function esterni(Z) {
    var c = configurazione(Z), nMax = 0, tot = 0;
    c.forEach(function (t) { if (t.e > 0 && t.n > nMax) nMax = t.n; });
    c.forEach(function (t) { if (t.n === nMax) tot += t.e; });
    return { n: nMax, e: tot, sottolivelli: c.filter(function (t) { return t.n === nMax; }) };
  }

  /* Disposizione negli orbitali di un sottolivello (regola di Hund):
     prima un elettrone "su" in ogni orbitale, poi gli elettroni "giù". */
  function riempiOrbitali(e, orbitali) {
    var box = []; for (var i = 0; i < orbitali; i++) box.push([]);
    for (var j = 0; j < e; j++) box[j % orbitali].push(j < orbitali ? 1 : -1);
    return box;
  }

  /* Elenco degli elettroni nell'ordine in cui "entrano" (per le animazioni) */
  function sequenza(Z) {
    var seq = [];
    configurazione(Z).forEach(function (t) {
      for (var j = 0; j < t.e; j++) seq.push({ sotto: t.nome, orbitale: j % t.orbitali, spin: j < t.orbitali ? 1 : -1, indice: j });
    });
    return seq;
  }

  /* Testo HTML di una configurazione:  1s² 2s² 2p⁶ ... */
  function termine(t) {
    return '<span class="t l-' + t.lettera + '" data-sotto="' + t.nome + '">' + t.nome + '<sup>' + t.e + '</sup></span>';
  }
  function html(Z) { return configurazione(Z).map(termine).join(''); }
  function htmlAbbreviata(Z) {
    var a = abbreviata(Z);
    if (!a) return html(Z);
    return '<span class="t core">[' + a.gas + ']</span>' + a.resto.map(termine).join('');
  }
  function testo(Z) {
    var sup = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    return configurazione(Z).map(function (t) { return t.nome + String(t.e).replace(/\d/g, function (d) { return sup[d]; }); }).join(' ');
  }

  function elemento(x) {
    var Z = typeof x === 'number' ? x : SIMBOLI.indexOf(x) + 1;
    if (Z < 1 || Z > SIMBOLI.length) return null;
    var p = posizione(Z);
    return { Z: Z, simbolo: SIMBOLI[Z - 1], nome: NOMI[Z - 1], periodo: p.periodo, gruppo: p.gruppo, blocco: p.blocco,
      gasNobile: GAS_NOBILI.indexOf(Z) >= 0, eccezione: ECCEZIONI[Z] ? ECCEZIONI[Z].nota : null };
  }

  /* preposizione articolata corretta: «del ferro», «dell'argon», «dello zinco» */
  function del_(nome) {
    var n = nome.toLowerCase();
    if (/^[aeiou]/.test(n)) return 'dell\'' + n;
    if (/^(z|s[^aeiou]|gn|ps|x)/.test(n)) return 'dello ' + n;
    return 'del ' + n;
  }

  IM.chimica = {
    SIMBOLI: SIMBOLI, NOMI: NOMI, ORDINE: ORDINE, POSTI: POSTI, ORBITALI: ORBITALI, LETTERE: LETTERE,
    elemento: elemento, configurazione: configurazione, abbreviata: abbreviata, esterni: esterni,
    riempiOrbitali: riempiOrbitali, sequenza: sequenza, html: html, htmlAbbreviata: htmlAbbreviata,
    termine: termine, testo: testo, gasNobilePrecedente: gasNobilePrecedente, del: del_
  };
})();
