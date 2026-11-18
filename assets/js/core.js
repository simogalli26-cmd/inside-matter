/* =====================================================================
   INSIDE MATTER — motore comune a tutti i moduli
   ---------------------------------------------------------------------
   Cosa fa questo file:
   - costruisce la barra superiore (marchio, titolo del modulo, capitoli)
   - mostra la barra di avanzamento
   - fa comparire gradualmente gli elementi con  data-rivela
   - avvia i componenti interattivi: ogni elemento HTML con
       data-componente="nome"
     viene passato alla funzione registrata con  IM.componente('nome', ...)

   Non serve modificarlo per aggiungere un modulo: basta l'HTML del modulo.
   ===================================================================== */
(function () {
  'use strict';
  var IM = (window.IM = window.IM || {});
  var registro = {};
  IM.ridotto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- registro dei componenti ---------- */
  IM.componente = function (nome, avvia) { registro[nome] = avvia; };

  /* ---------- piccoli aiuti per creare elementi ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  IM.svg = function (tag, attr, padre) {
    var e = document.createElementNS(NS, tag);
    for (var k in attr || {}) if (attr[k] != null) e.setAttribute(k, attr[k]);
    if (padre) padre.appendChild(e);
    return e;
  };
  IM.h = function (tag, attr, html, padre) {
    var e = document.createElement(tag);
    for (var k in attr || {}) if (attr[k] != null) e.setAttribute(k, attr[k]);
    if (html != null) e.innerHTML = html;
    if (padre) padre.appendChild(e);
    return e;
  };

  /* Osserva se un elemento è sullo schermo (per fermare le animazioni fuori vista) */
  var ioVis = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target._visibile = e.isIntersecting; });
  }, { rootMargin: '120px' }) : null;
  IM.osserva = function (el) { el._visibile = true; if (ioVis) ioVis.observe(el); return el; };

  /* Canvas nitido sugli schermi ad alta densità */
  IM.canvas = function (cv) {
    var ctx = cv.getContext('2d'), st = { ctx: ctx, w: 0, h: 0, dpr: 1 };
    function misura() {
      st.dpr = Math.min(window.devicePixelRatio || 1, 2);
      st.w = cv.clientWidth; st.h = cv.clientHeight;
      cv.width = Math.round(st.w * st.dpr); cv.height = Math.round(st.h * st.dpr);
      ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
    }
    misura(); window.addEventListener('resize', misura);
    st.misura = misura;
    return st;
  };

  /* ---------- barra superiore, capitoli, avanzamento ---------- */
  function costruisciBarra() {
    var body = document.body, radice = body.getAttribute('data-radice') || '';
    var idMod = body.getAttribute('data-modulo');
    var cat = window.IM_CATALOGO || [];
    var mod = null;
    for (var i = 0; i < cat.length; i++) if (cat[i].id === idMod) mod = cat[i];
    if (mod && mod.colore) document.documentElement.style.setProperty('--acc', mod.colore);

    var barra = IM.h('header', { class: 'barra' });
    IM.h('a', { class: 'marchio', href: radice + 'index.html', title: 'Torna all\'indice dei moduli' }, 'INSIDE <b>MATTER</b>', barra);
    if (mod) IM.h('span', { class: 'titolo-mod' }, mod.numero + ' · ' + mod.titolo, barra);
    var nav = IM.h('nav', { 'aria-label': 'Capitoli del modulo' }, null, barra);
    body.insertBefore(barra, body.firstChild);
    var prog = IM.h('div', { class: 'progresso', 'aria-hidden': 'true' });
    body.insertBefore(prog, barra.nextSibling);

    var scene = [].slice.call(document.querySelectorAll('.scena[data-titolo]'));
    scene.forEach(function (s, i) {
      if (!s.id) s.id = 'scena-' + (i + 1);
      var a = IM.h('a', { href: '#' + s.id, title: s.getAttribute('data-titolo') }, s.getAttribute('data-breve') || String(i).padStart(2, '0'), nav);
      s._link = a;
    });

    function aggiorna() {
      var max = document.documentElement.scrollHeight - innerHeight;
      prog.style.width = (max > 0 ? Math.min(100, scrollY / max * 100) : 0) + '%';
      var att = null, y = innerHeight * 0.38;
      scene.forEach(function (s) { if (s.getBoundingClientRect().top <= y) att = s; });
      scene.forEach(function (s) { s._link.classList.toggle('on', s === att); });
    }
    addEventListener('scroll', aggiorna, { passive: true });
    addEventListener('resize', aggiorna);
    aggiorna();

    /* frecce della tastiera: scena precedente / successiva */
    addEventListener('keydown', function (e) {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key !== 'PageDown' && e.key !== 'PageUp') return;
      var y = 70, i = 0;
      for (var k = 0; k < scene.length; k++) if (scene[k].getBoundingClientRect().top <= y + 2) i = k;
      var dest = e.key === 'PageDown' ? scene[Math.min(scene.length - 1, i + 1)] : scene[Math.max(0, i - (scene[i].getBoundingClientRect().top < y - 4 ? 0 : 1))];
      if (dest) { e.preventDefault(); dest.scrollIntoView(); }
    });

    /* piede con il modulo successivo */
    if (mod) {
      var pubblicati = cat.filter(function (m) { return m.stato === 'pubblicato'; });
      var idx = pubblicati.indexOf(mod), succ = pubblicati[idx + 1];
      var piede = IM.h('footer', { class: 'piede' });
      var d = IM.h('div', { class: 'dentro' }, null, piede);
      IM.h('p', null, 'INSIDE MATTER · progetto di Scienze Naturali · modulo ' + mod.numero, d);
      if (succ) IM.h('a', { class: 'prossimo', href: radice + 'moduli/' + succ.id + '/index.html' }, '<span>Modulo successivo</span><b>' + succ.numero + ' · ' + succ.titolo + '</b>', d);
      else IM.h('a', { class: 'prossimo', href: radice + 'index.html' }, '<span>Fine del modulo</span><b>Torna all\'indice</b>', d);
      body.appendChild(piede);
    }
  }

  /* ---------- comparsa progressiva ---------- */
  function rivela() {
    var els = document.querySelectorAll('[data-rivela]');
    if (!('IntersectionObserver' in window) || IM.ridotto) return;
    document.documentElement.classList.add('js-rivela');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    [].forEach.call(els, function (el) { io.observe(el); });
    /* se la pagina viene stampata o la finestra è molto alta, mostra comunque tutto */
    addEventListener('beforeprint', function () { [].forEach.call(els, function (el) { el.classList.add('visto'); }); });
  }

  /* ---------- avvio dei componenti ---------- */
  function avviaComponenti() {
    [].forEach.call(document.querySelectorAll('[data-componente]'), function (el) {
      var nome = el.getAttribute('data-componente'), fn = registro[nome];
      if (!fn) { console.warn('Componente non trovato:', nome); return; }
      try { fn(el, el.dataset); }
      catch (err) {
        console.error('Errore nel componente ' + nome, err);
        el.innerHTML = '<p class="piccolo">Questa animazione non è riuscita a partire su questo browser.</p>';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.hasAttribute('data-modulo')) costruisciBarra();
    rivela();
    avviaComponenti();
  });
})();
