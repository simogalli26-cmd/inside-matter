/* =====================================================================
   COMPONENTE: viaggio
   Il viaggio iniziale guidato dallo scorrimento:
   frammento di potassio → tuffo nella superficie → reticolo di atomi
   → un atomo → nucleo → elettroni organizzati in livelli.

   Uso nell'HTML del modulo:
     <section class="scena viaggio" ...>
       <div class="viaggio-palco" data-componente="viaggio"> <canvas></canvas> ... </div>
       <div class="battuta"> ... </div>   (una per ogni "inquadratura")
     </section>
   Tutto è disegnato con Canvas 2D: nessun video, nessuna libreria.
   I dati fisici (potassio) sono in alto: modificali qui se cambi elemento.
   ===================================================================== */
(function () {
  'use strict';
  var IM = window.IM;

  /* --- dati fisici del potassio --- */
  var PASSO_RETICOLO = 0.533e-9;   // m, cella cubica a corpo centrato
  var RAGGIO_ATOMO = 0.25e-9;      // m, schematico (≈ mezzo nanometro di diametro)
  var LIVELLI = [                  // elettroni per livello: 2 · 8 · 8 · 1
    { n: 1, e: 2, r: 0.13, sig: 0.035, punti: 900,  col: [120, 210, 255] },
    { n: 2, e: 8, r: 0.34, sig: 0.06,  punti: 2600, col: [110, 165, 255] },
    { n: 3, e: 8, r: 0.6,  sig: 0.085, punti: 3200, col: [160, 140, 255] },
    { n: 4, e: 1, r: 1.0,  sig: 0.15,  punti: 1800, col: [255, 154, 82] }
  ];

  var liscio = function (a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  var mix = function (a, b, t) { return a + (b - a) * t; };

  /* larghezza del campo visivo in unità leggibili, con virgola decimale */
  function misura(m) {
    var u = [['cm', 1e-2], ['mm', 1e-3], ['µm', 1e-6], ['nm', 1e-10]];
    for (var i = 0; i < u.length; i++) if (m >= u[i][1] * 0.999) {
      var v = m / (u[i][0] === 'nm' ? 1e-9 : u[i][1]);
      return (v < 10 ? v.toFixed(1).replace('.', ',') : Math.round(v)) + ' ' + u[i][0];
    }
    return '—';
  }

  /* sfera pre-disegnata, poi ridimensionata (più veloce di un gradiente per atomo) */
  function sprite(colA, colB, morbido) {
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var x = c.getContext('2d'), g = x.createRadialGradient(46, 42, 4, 64, 64, 62);
    g.addColorStop(0, colA); g.addColorStop(morbido ? 0.35 : 0.55, colB); g.addColorStop(1, 'rgba(10,18,40,0)');
    x.fillStyle = g; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill();
    return c;
  }

  IM.componente('viaggio', function (palco) {
    var sezione = palco.closest('.viaggio'), cv = palco.querySelector('canvas');
    var C = IM.canvas(cv), ctx = C.ctx;
    var etichetta = palco.querySelector('.v-misura'), cosa = palco.querySelector('.v-cosa');
    var battute = [].slice.call(sezione.querySelectorAll('.battuta'));
    IM.osserva(cv);

    var atomoSp = sprite('#f4f8ff', '#8fa6c8', false), atomoTarget = sprite('#ffffff', '#9ec8ff', false);

    /* reticolo cubico a corpo centrato: solo lo strato superficiale e alcuni strati sotto */
    var R = 12, STRATI = 4, reticolo = [];
    for (var k = 0; k > -STRATI; k--)
      for (var i = -R; i <= R; i++) for (var j = -R; j <= R; j++) {
        reticolo.push([i, j, k]);
        if (k > -STRATI + 1 && i < R && j < R) reticolo.push([i + 0.5, j + 0.5, k - 0.5]);
      }

    /* nube elettronica: punti distribuiti nei quattro livelli */
    var nube = [];
    LIVELLI.forEach(function (L, li) {
      for (var q = 0; q < L.punti; q++) {
        var u = Math.random() * 2 - 1, f = Math.random() * 6.2832, s = Math.sqrt(1 - u * u);
        var g = Math.sqrt(-2 * Math.log(Math.random() + 1e-9)) * Math.cos(6.2832 * Math.random());
        var r = Math.max(0.02, L.r + g * L.sig);
        nube.push({ x: r * s * Math.cos(f), y: r * u, z: r * s * Math.sin(f), l: li, a: 0.35 + Math.random() * 0.65 });
      }
    });

    /* rumore della superficie metallica per il "tuffo" */
    var grana = document.createElement('canvas'); grana.width = grana.height = 256;
    (function () {
      var x = grana.getContext('2d'), d = x.createImageData(256, 256);
      for (var p = 0; p < d.data.length; p += 4) { var v = 150 + Math.random() * 70; d.data[p] = v * 0.9; d.data[p + 1] = v * 0.95; d.data[p + 2] = v * 1.05; d.data[p + 3] = 255; }
      x.putImageData(d, 0, 0);
    })();

    var progresso = 0, tempo = 0, ultimo = 0, fermo = false;
    function calcolaProgresso() {
      var r = sezione.getBoundingClientRect(), corsa = r.height - innerHeight;
      progresso = corsa > 0 ? Math.max(0, Math.min(1, -r.top / corsa)) : 0;
      battute.forEach(function (b) {
        var rb = b.getBoundingClientRect(), c = (rb.top + rb.height / 2 - innerHeight / 2) / innerHeight;
        var o = 1 - Math.min(1, Math.max(0, Math.abs(c) - 0.12) / 0.32);
        b.style.setProperty('--o', o.toFixed(3));
      });
    }
    addEventListener('scroll', calcolaProgresso, { passive: true });
    addEventListener('resize', calcolaProgresso);
    calcolaProgresso();

    /* scala (pixel per metro) in funzione dello scorrimento: zoom logaritmico continuo */
    function scala(p, W, H) {
      var D = Math.min(H, W * 1.1), stretto = W < 760;   /* D: lato utile dell'inquadratura */
      var kf = [
        [0.00, (stretto ? 0.2 : 0.24) * W / 0.01],
        [0.17, (stretto ? 0.24 : 0.30) * W / 0.01],
        [0.22, 2.2 * W / 0.01],
        [0.33, W / 14e-9],
        [0.52, 0.5 * D / (2 * RAGGIO_ATOMO)],
        [0.58, 0.84 * D / (2 * RAGGIO_ATOMO)],
        [1.00, 0.94 * D / (2 * RAGGIO_ATOMO)]
      ];
      for (var i = 1; i < kf.length; i++) if (p <= kf[i][0]) {
        var t = (p - kf[i - 1][0]) / (kf[i][0] - kf[i - 1][0]);
        t = t * t * (3 - 2 * t);
        return Math.exp(mix(Math.log(kf[i - 1][1]), Math.log(kf[i][1]), t));
      }
      return kf[kf.length - 1][1];
    }

    function disegna() {
      var W = C.w, H = C.h, p = progresso, s = scala(p, W, H);
      var cx = W > 1000 ? W * 0.63 : W * 0.5, cy = H * (W > 1000 ? 0.52 : W > 760 ? 0.4 : 0.24);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      ctx.fillStyle = '#04060d'; ctx.fillRect(0, 0, W, H);
      var alone = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
      alone.addColorStop(0, 'rgba(40,70,140,.22)'); alone.addColorStop(1, 'rgba(4,6,13,0)');
      ctx.fillStyle = alone; ctx.fillRect(0, 0, W, H);

      /* 1 · frammento di potassio (proiezione ortografica: lo zoom entra nella faccia frontale) */
      var aBlocco = 1 - liscio(0.235, 0.255, p);
      if (aBlocco > 0) blocco(s * 0.01, cx, cy, p, aBlocco);

      /* 2 · tuffo nella superficie: grana metallica e scie radiali */
      var aTuffo = liscio(0.215, 0.245, p) * (1 - liscio(0.3, 0.335, p));
      if (aTuffo > 0) tuffo(cx, cy, W, H, p, aTuffo);

      /* 3 · reticolo di atomi */
      var aRet = liscio(0.295, 0.335, p) * (1 - liscio(0.5, 0.57, p));
      if (aRet > 0) reticoloDisegna(s, cx, cy, W, p, aRet, liscio(0.47, 0.56, p));

      /* 4 · l'atomo: nube elettronica, nucleo, livelli */
      var aAt = liscio(0.5, 0.56, p);
      if (aAt > 0) atomo(s, cx, cy, p, aAt);

      /* campo visivo */
      if (etichetta) etichetta.textContent = misura(W / s);
      if (cosa) cosa.textContent = p < 0.215 ? 'frammento di potassio' : p < 0.31 ? 'superficie del metallo' : p < 0.53 ? 'reticolo di atomi' : p < 0.62 ? 'un atomo di potassio' : p < 0.76 ? 'nucleo ed elettroni' : 'livelli di energia';
    }

    function blocco(lato, cx, cy, p, a) {
      var frontale = liscio(0.15, 0.225, p);
      var yaw = mix(-0.62 + Math.sin(tempo * 0.25) * 0.08, 0, frontale), pitch = mix(0.42, 0, frontale);
      var cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      var h = lato / 2, v = [], quote = [-1, 1];
      quote.forEach(function (X) { quote.forEach(function (Y) { quote.forEach(function (Z) {
        var x = X * h, y = Y * h * 0.82, z = Z * h;
        var x1 = x * cyw + z * syw, z1 = -x * syw + z * cyw, y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
        v.push([cx + x1, cy + y1 - mix(0, 0, frontale), z2]);
      }); }); });
      /* facce: indici dei vertici e normale per l'ombreggiatura */
      var facce = [[[0, 1, 3, 2], 'x-'], [[4, 6, 7, 5], 'x+'], [[0, 4, 5, 1], 'y-'], [[2, 3, 7, 6], 'y+'], [[0, 2, 6, 4], 'z-'], [[1, 5, 7, 3], 'z+']];
      ctx.globalAlpha = a;
      /* ombra */
      if (frontale < 1) {
        ctx.save(); ctx.globalAlpha = a * 0.5 * (1 - frontale);
        var g = ctx.createRadialGradient(cx, cy + h * 1.15, 0, cx, cy + h * 1.15, h * 1.6);
        g.addColorStop(0, 'rgba(0,0,0,.8)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy + h * 1.1, h * 1.6, h * 0.35, 0, 0, 7); ctx.fill(); ctx.restore(); ctx.globalAlpha = a;
      }
      facce.map(function (f) {
        var z = 0; f[0].forEach(function (i) { z += v[i][2]; }); return { f: f, z: z / 4 };
      }).sort(function (A, B) { return A.z - B.z; }).forEach(function (o) {
        var f = o.f, P = f[0].map(function (i) { return v[i]; });
        var area = (P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1]);
        if (area >= 0) return;
        var luce = { 'y-': 1, 'z-': 0.7, 'x+': 0.52, 'x-': 0.45, 'z+': 0.6, 'y+': 0.3 }[f[1]];
        var g = ctx.createLinearGradient(P[0][0], P[0][1], P[2][0], P[2][1]);
        var c1 = Math.round(120 + 120 * luce), c2 = Math.round(80 + 110 * luce);
        g.addColorStop(0, 'rgb(' + (c1 - 8) + ',' + c1 + ',' + (c1 + 12) + ')');
        g.addColorStop(1, 'rgb(' + (c2 - 10) + ',' + c2 + ',' + (c2 + 16) + ')');
        ctx.fillStyle = g; ctx.beginPath();
        P.forEach(function (q, i) { i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(230,240,255,' + (0.25 * luce) + ')'; ctx.lineWidth = 1; ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }

    function tuffo(cx, cy, W, H, p, a) {
      ctx.save(); ctx.globalAlpha = a;
      var z = Math.pow(10, (p - 0.215) * 14), lato = 256 * (1 + (z % 10) / 3);
      ctx.translate(cx, cy); ctx.rotate(p * 2);
      var pat = ctx.createPattern(grana, 'repeat'); ctx.fillStyle = pat;
      ctx.scale(lato / 256, lato / 256); ctx.fillRect(-W / (lato / 256), -H / (lato / 256), 2 * W / (lato / 256), 2 * H / (lato / 256));
      ctx.restore();
      ctx.save(); ctx.globalAlpha = a * 0.55;
      ctx.fillStyle = 'rgba(8,14,30,1)'; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < 90; i++) {
        var ang = i * 2.39996, r0 = ((i * 97 + p * 9000) % 700) / 700, r1 = r0 + 0.08;
        var R = Math.max(W, H) * 0.75;
        ctx.strokeStyle = 'rgba(160,200,255,' + (0.05 + 0.12 * r0) + ')'; ctx.lineWidth = 1 + r0 * 2;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * R * r0, cy + Math.sin(ang) * R * r0); ctx.lineTo(cx + Math.cos(ang) * R * r1, cy + Math.sin(ang) * R * r1); ctx.stroke();
      }
      ctx.restore();
    }

    function reticoloDisegna(s, cx, cy, W, p, a, fuoriAltri) {
      var f = 0.9 * W, pxUnita = s * PASSO_RETICOLO, camZ = f / pxUnita;
      var th = mix(0.55, 0.12, liscio(0.3, 0.55, p)) + Math.sin(tempo * 0.2) * 0.03, ph = mix(-0.5, -0.18, liscio(0.3, 0.55, p));
      var ct = Math.cos(th), st = Math.sin(th), cph = Math.cos(ph), sph = Math.sin(ph);
      var lista = [];
      for (var i = 0; i < reticolo.length; i++) {
        var q = reticolo[i], x = q[0], y = q[1], z = q[2];
        var x1 = x * ct + z * st, z1 = -x * st + z * ct, y1 = y * cph - z1 * sph, z2 = y * sph + z1 * cph;
        var d = camZ - z2; if (d < 0.3) continue;
        var k = f / d, sx = cx + x1 * k, sy = cy + y1 * k, r = 0.36 * k;
        if (sx < -r || sx > C.w + r || sy < -r || sy > C.h + r) continue;
        lista.push([d, sx, sy, r, i === 0 || (x === 0 && y === 0 && z === 0)]);
      }
      lista.sort(function (A, B) { return B[0] - A[0]; });
      for (var n = 0; n < lista.length; n++) {
        var L = lista[n], nebbia = Math.max(0.12, Math.min(1, 1.6 - (L[0] - camZ) * 0.22));
        var al = a * nebbia * (L[4] ? 1 : 1 - fuoriAltri);
        if (al <= 0.01) continue;
        ctx.globalAlpha = al;
        if (L[3] < 1.3) { ctx.fillStyle = '#a9bbd8'; ctx.fillRect(L[1] - 1, L[2] - 1, 2, 2); }
        else ctx.drawImage(L[4] ? atomoTarget : atomoSp, L[1] - L[3] * 1.35, L[2] - L[3] * 1.35, L[3] * 2.7, L[3] * 2.7);
      }
      ctx.globalAlpha = 1;
    }

    function atomo(s, cx, cy, p, a) {
      var Rpx = s * RAGGIO_ATOMO, ang = tempo * 0.18 + p * 2.2, ca = Math.cos(ang), sa = Math.sin(ang), incl = 0.35;
      var ci = Math.cos(incl), si = Math.sin(incl);
      var colora = liscio(0.74, 0.82, p), valenza = liscio(0.9, 0.97, p), nucleo = liscio(0.6, 0.66, p) * (1 - liscio(0.8, 0.86, p));
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < nube.length; i++) {
        var q = nube[i], x = q.x * ca + q.z * sa, z = -q.x * sa + q.z * ca, y = q.y * ci - z * si, z2 = q.y * si + z * ci;
        var k = 1 / (1 - z2 * 0.18), L = LIVELLI[q.l];
        var r = Math.round(mix(200, L.col[0], colora)), g = Math.round(mix(220, L.col[1], colora)), b = Math.round(mix(255, L.col[2], colora));
        var al = a * q.a * (0.35 + 0.25 * (z2 + 1));
        if (q.l < 3) al *= 1 - 0.45 * valenza; else al *= 1 + 0.9 * valenza;
        ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + Math.min(1, al * 0.7).toFixed(3) + ')';
        var dim = q.l === 3 ? 2.2 : 1.7;
        ctx.fillRect(cx + x * Rpx * k - dim / 2, cy + y * Rpx * k - dim / 2, dim, dim);
      }
      ctx.restore();
      /* nucleo: un punto (in scala sarebbe invisibile) */
      ctx.save();
      var gN = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10);
      gN.addColorStop(0, 'rgba(255,240,220,' + a + ')'); gN.addColorStop(1, 'rgba(255,200,150,0)');
      ctx.fillStyle = gN; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, 7); ctx.fill();
      if (nucleo > 0) {
        ctx.globalAlpha = nucleo; ctx.strokeStyle = 'rgba(255,214,170,.9)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(cx, cy, 22, 0, 7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 16, cy - 16); ctx.lineTo(cx + Rpx * 0.55, cy - Rpx * 0.42); ctx.lineTo(cx + Rpx * 0.55 + 18, cy - Rpx * 0.42); ctx.stroke();
        ctx.fillStyle = '#ffe2c4'; ctx.font = '500 14px ' + getComputedStyle(document.body).getPropertyValue('--mono');
        ctx.fillText('nucleo · 19 protoni', cx + Rpx * 0.55 + 24, cy - Rpx * 0.42 + 5);
      }
      /* anelli ed etichette dei livelli: linee orizzontali verso una colonna a destra */
      var lab = liscio(0.78, 0.84, p);
      if (lab > 0) {
        ctx.font = '500 14px ' + getComputedStyle(document.body).getPropertyValue('--mono');
        LIVELLI.forEach(function (L, i) {
          var r = L.r * Rpx, dy = (i - 1.5) * 30, ey = cy + dy, px = cx + Math.sqrt(Math.max(0, r * r - dy * dy));
          var ex = Math.min(cx + Rpx * 1.12, C.w - 250), est = i === 3;
          if (C.w < 760) return;
          ctx.globalAlpha = lab * (est ? 1 : 1 - 0.45 * valenza);
          ctx.strokeStyle = est ? 'rgba(255,154,82,.75)' : 'rgba(180,200,255,.35)'; ctx.lineWidth = 1;
          ctx.setLineDash([2, 5]); ctx.beginPath(); ctx.ellipse(cx, cy, r, r * Math.cos(incl) * 0.98, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]);
          ctx.strokeStyle = est ? 'rgba(255,154,82,.9)' : 'rgba(200,215,255,.6)';
          ctx.beginPath(); ctx.arc(px, ey, 2.5, 0, 7); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(px + 3, ey); ctx.lineTo(ex - 10, ey); ctx.stroke();
          ctx.fillStyle = est ? '#ffb27a' : '#dbe6ff';
          ctx.fillText('livello ' + L.n + ' · ' + L.e + (L.e === 1 ? ' elettrone' : ' elettroni') + (est && valenza > 0.5 ? '  · valenza' : ''), ex, ey + 5);
        });
      }
      ctx.restore();
    }

    function ciclo(ts) {
      requestAnimationFrame(ciclo);
      if (!cv._visibile) return;
      var dt = Math.min(50, ts - ultimo || 16); ultimo = ts;
      if (!IM.ridotto && !fermo) tempo += dt / 1000;
      disegna();
    }
    requestAnimationFrame(ciclo);
    disegna();
    IM.viaggio = { ferma: function (v) { fermo = v; } };
  });
})();
