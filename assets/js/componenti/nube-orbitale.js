/* =====================================================================
   COMPONENTE: nube-orbitale
   Forma tridimensionale degli orbitali come "nube di punti".
   Ogni punto è estratto a caso con probabilità proporzionale a |ψ|²
   (funzioni d'onda dell'atomo di idrogeno): dove i punti sono fitti
   è più probabile trovare l'elettrone.

   Uso:  <div data-componente="nube-orbitale" data-iniziale="2px"></div>
   Si ruota trascinando con il mouse o con il dito.
   ===================================================================== */
(function () {
  'use strict';
  var IM = window.IM;

  /* densità di probabilità (non normalizzata) e raggio del cubo di campionamento */
  var ORB = {
    '1s':   { d: function (x, y, z, r) { return Math.exp(-2 * r); }, B: 4.5, l: 's', nome: '1s' },
    '2s':   { d: function (x, y, z, r) { return (2 - r) * (2 - r) * Math.exp(-r); }, B: 15, l: 's', nome: '2s' },
    '2px':  { d: function (x, y, z, r) { return x * x * Math.exp(-r); }, B: 13, l: 'p', soglia: 0.1, nome: '2p<sub>x</sub>' },
    '2py':  { d: function (x, y, z, r) { return y * y * Math.exp(-r); }, B: 13, l: 'p', soglia: 0.1, nome: '2p<sub>y</sub>' },
    '2pz':  { d: function (x, y, z, r) { return z * z * Math.exp(-r); }, B: 13, l: 'p', soglia: 0.1, nome: '2p<sub>z</sub>' },
    '3dxy': { d: function (x, y, z, r) { return x * x * y * y * Math.exp(-2 * r / 3); }, B: 24, l: 'd', soglia: 0.08, nome: '3d<sub>xy</sub>' },
    '3dz2': { d: function (x, y, z, r) { var a = 3 * z * z - r * r; return a * a * Math.exp(-2 * r / 3); }, B: 26, l: 'd', soglia: 0.05, nome: '3d<sub>z²</sub>' }
  };
  var SCELTE = [
    ['1s', '1s', 'Forma <b>sferica</b>. È l\'orbitale a energia più bassa e il più vicino al nucleo.'],
    ['2s', '2s', 'Anche il 2s è <b>sferico</b>, ma più grande: in media l\'elettrone sta più lontano dal nucleo. Tra la parte interna e quella esterna c\'è una zona in cui non si trova mai.'],
    ['2px', '2p<sub>x</sub>', 'Due <b>lobi</b> ai lati del nucleo, lungo l\'asse x. Sul nucleo la probabilità è zero.'],
    ['2py', '2p<sub>y</sub>', 'Stessa forma del 2p<sub>x</sub>, orientato lungo l\'asse y.'],
    ['2pz', '2p<sub>z</sub>', 'Stessa forma, lungo l\'asse z. I tre orbitali 2p hanno <b>la stessa energia</b>: si dicono degeneri.'],
    ['2p', 'tre 2p insieme', 'I tre orbitali p sono <b>perpendicolari</b> tra loro. Insieme formano il sottolivello 2p: 3 orbitali, fino a 6 elettroni.'],
    ['3dxy', '3d<sub>xy</sub>', 'Gli orbitali d hanno forme più complesse, spesso a <b>quattro lobi</b>. Ogni sottolivello d ne ha cinque.'],
    ['3dz2', '3d<sub>z²</sub>', 'Uno dei cinque orbitali 3d: due lobi lungo z e un anello attorno al nucleo.']
  ];
  var COL = { s: [92, 214, 255], p: [164, 147, 255], d: [255, 179, 92] };
  var cache = {};

  function campiona(id, N, sogliaForzata) {
    var chiave = id + '|' + (sogliaForzata || '');
    if (cache[chiave]) return cache[chiave];
    var o = ORB[id], B = o.B, max = 0, i, x, y, z, r, v, pts = [];
    for (i = 0; i < 30000; i++) {
      x = (Math.random() * 2 - 1) * B; y = (Math.random() * 2 - 1) * B; z = (Math.random() * 2 - 1) * B;
      r = Math.sqrt(x * x + y * y + z * z); v = o.d(x, y, z, r); if (v > max) max = v;
    }
    max *= 1.25;
    var tentativi = 0;
    while (pts.length < N && tentativi < 6e6) {
      tentativi++;
      x = (Math.random() * 2 - 1) * B; y = (Math.random() * 2 - 1) * B; z = (Math.random() * 2 - 1) * B;
      r = Math.sqrt(x * x + y * y + z * z);
      var dv = o.d(x, y, z, r);
      if (dv >= (sogliaForzata || o.soglia || 0) * max / 1.25 && Math.random() * max < dv) pts.push([x, z, y]);   // y in alto sullo schermo = asse z
    }
    /* raggio che contiene il 92% dei punti, per adattare la nube alla finestra */
    var rr = pts.map(function (q) { return Math.hypot(q[0], q[1], q[2]); }).sort(function (a, b) { return a - b; });
    cache[chiave] = { pts: pts, R: rr[Math.floor(rr.length * 0.92)] || B };
    return cache[chiave];
  }

  IM.campionaOrbitale = campiona;

  /* COMPONENTE: copertina — nube decorativa che ruota da sola (usata nella home) */
  IM.componente('copertina', function (el) {
    var cv = IM.h('canvas', { 'aria-hidden': 'true' }, null, el), C = IM.canvas(cv), ctx = C.ctx; IM.osserva(cv);
    var parti = [['2px', [164, 147, 255]], ['2pz', [92, 190, 255]], ['1s', [92, 214, 255]]].map(function (q) { return { c: campiona(q[0], q[0] === '1s' ? 1400 : 4200), col: q[1] }; });
    var R = parti[0].c.R, yaw = 0.6, ultimo = 0;
    function ciclo(ts) {
      requestAnimationFrame(ciclo);
      if (!cv._visibile) return;
      var dt = Math.min(50, ts - ultimo || 16); ultimo = ts; if (!IM.ridotto) yaw += dt * 0.00012;
      var W = C.w, H = C.h, cx = W * 0.5, cy = H * 0.5, k = Math.min(W, H) * 0.44 / R, cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(0.42), sp = Math.sin(0.42);
      ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
      parti.forEach(function (p, j) {
        var s = j === 2 ? R / p.c.R * 0.16 : 1, c = p.col;
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',.16)';
        p.c.pts.forEach(function (q) {
          var x = q[0] * s, y = q[1] * s, z = q[2] * s, x1 = x * cyw + z * syw, z1 = -x * syw + z * cyw, y1 = y * cp - z1 * sp;
          ctx.fillRect(cx + x1 * k - 1, cy - y1 * k - 1, 2, 2);
        });
      });
    }
    requestAnimationFrame(ciclo);
  });

  IM.componente('nube-orbitale', function (el, opz) {
    el.classList.add('nube');
    var palco = IM.h('div', { class: 'nube-palco' }, null, el);
    var cv = IM.h('canvas', { 'aria-label': 'Orbitale rappresentato come nube di punti; trascina per ruotarlo' }, null, palco);
    IM.h('div', { class: 'nube-aiuto' }, 'trascina per ruotare', palco);
    var lato = IM.h('div', { class: 'nube-lato' }, null, el);
    var schede = IM.h('div', { class: 'schede' }, null, lato);
    var titolo = IM.h('div', { class: 'nube-nome' }, '', lato);
    var info = IM.h('p', { class: 'nube-info' }, '', lato);
    IM.h('p', { class: 'piccolo' }, 'Ogni punto è una posizione possibile dell\'elettrone: dove i punti sono più fitti, è più probabile trovarlo. Le dimensioni non sono in scala da un orbitale all\'altro.', lato);

    var C = IM.canvas(cv), ctx = C.ctx; IM.osserva(cv);
    var yaw = 0.7, pitch = 0.32, auto = true, scelta = null, nubi = [];

    SCELTE.forEach(function (s) {
      var b = IM.h('button', { class: 'chip', type: 'button' }, s[1], schede);
      b.onclick = function () { scegli(s[0]); };
      s.btn = b;
    });

    function scegli(id) {
      scelta = id;
      SCELTE.forEach(function (s) { s.btn.classList.toggle('on', s[0] === id); if (s[0] === id) { info.innerHTML = s[2]; titolo.innerHTML = s[1].indexOf('insieme') > 0 ? '2p<sub>x</sub> · 2p<sub>y</sub> · 2p<sub>z</sub>' : s[1]; } });
      var ids = id === '2p' ? ['2px', '2py', '2pz'] : [id];
      var tinte = id === '2p' ? [[164, 147, 255], [92, 214, 255], [255, 134, 173]] : null;
      nubi = ids.map(function (k, i) { var c = id === '2p' ? campiona(k, 2400, 0.42) : campiona(k, 5200); return { c: c, col: tinte ? tinte[i] : COL[ORB[k].l] }; });
      el.style.setProperty('--tinta', 'var(--' + ORB[ids[0]].l + ')');
    }

    /* trascinamento */
    var trascina = null;
    cv.addEventListener('pointerdown', function (e) { trascina = [e.clientX, e.clientY, yaw, pitch]; auto = false; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) {
      if (!trascina) return;
      yaw = trascina[2] + (e.clientX - trascina[0]) * 0.01;
      pitch = Math.max(-1.3, Math.min(1.3, trascina[3] + (e.clientY - trascina[1]) * 0.01));
    });
    cv.addEventListener('pointerup', function () { trascina = null; });

    function disegna() {
      var W = C.w, H = C.h, cx = W / 2, cy = H / 2;
      ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, W, H);
      var cy1 = Math.cos(yaw), sy1 = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      var Rmax = 0; nubi.forEach(function (n) { Rmax = Math.max(Rmax, n.c.R); });
      var k = Math.min(W, H) * 0.4 / (Rmax || 1);
      function proietta(x, y, z) {
        var x1 = x * cy1 + z * sy1, z1 = -x * sy1 + z * cy1, y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
        var pr = 1 / (1 - z2 / (Rmax * 6)); return [cx + x1 * k * pr, cy - y1 * k * pr, z2];
      }
      /* assi */
      ctx.font = '500 13px ' + getComputedStyle(document.body).getPropertyValue('--mono');
      [['x', Rmax * 1.25, 0, 0], ['y', 0, 0, Rmax * 1.25], ['z', 0, Rmax * 1.25, 0]].forEach(function (a) {
        var A = proietta(-a[1], -a[2], -a[3]), B = proietta(a[1], a[2], a[3]);
        ctx.strokeStyle = 'rgba(160,180,230,.22)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
        ctx.fillStyle = 'rgba(190,205,240,.7)'; ctx.fillText(a[0], B[0] + 6, B[1] + 4);
      });
      ctx.globalCompositeOperation = 'lighter';
      nubi.forEach(function (n) {
        var c = n.col, pts = n.c.pts;
        for (var i = 0; i < pts.length; i++) {
          var P = proietta(pts[i][0], pts[i][1], pts[i][2]), prof = 0.35 + 0.65 * (P[2] / Rmax + 1) / 2;
          ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (0.3 * prof + 0.12).toFixed(3) + ')';
          ctx.fillRect(P[0] - 1, P[1] - 1, 2, 2);
        }
      });
      /* nucleo */
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#fff1dc'; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 7); ctx.fill();
    }

    var ultimo = 0;
    function ciclo(ts) {
      requestAnimationFrame(ciclo);
      if (!cv._visibile) return;
      var dt = Math.min(50, ts - ultimo || 16); ultimo = ts;
      if (auto && !IM.ridotto) yaw += dt * 0.00016;
      disegna();
    }
    scegli(opz.iniziale || '2px');
    requestAnimationFrame(ciclo);
  });
})();
