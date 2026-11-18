/* =====================================================================
   COMPONENTE: quiz
   Domande a scelta multipla, una alla volta, con spiegazione.
   Le domande stanno nell'HTML del modulo, dentro:
     <div data-componente="quiz">
       <script type="application/json"> [ {domanda, opzioni, giusta, spiegazione}, ... ] </script>
     </div>
   "giusta" è l'indice (da 0) dell'opzione corretta.
   ===================================================================== */
(function () {
  'use strict';
  var IM = window.IM;

  IM.componente('quiz', function (el) {
    var dati = JSON.parse(el.querySelector('script[type="application/json"]').textContent);
    el.classList.add('quiz');
    var testa = IM.h('div', { class: 'quiz-testa' }, null, el);
    var punti = IM.h('div', { class: 'quiz-punti', 'aria-hidden': 'true' }, dati.map(function () { return '<i></i>'; }).join(''), testa);
    var conta = IM.h('span', { class: 'mono piccolo' }, '', testa);
    var corpo = IM.h('div', { class: 'quiz-corpo' }, null, el);
    var i = 0, giuste = 0, risposte = [];

    function domanda() {
      var d = dati[i];
      conta.textContent = 'domanda ' + (i + 1) + ' di ' + dati.length;
      corpo.innerHTML = '<p class="quiz-dom">' + d.domanda + '</p>';
      var op = IM.h('div', { class: 'quiz-opz' }, null, corpo);
      var spieg = IM.h('div', { class: 'quiz-spieg', 'aria-live': 'polite' }, null, corpo);
      d.opzioni.forEach(function (o, k) {
        var b = IM.h('button', { type: 'button', class: 'quiz-o' }, '<span class="mono">' + 'ABCD'[k] + '</span><span>' + o + '</span>', op);
        b.onclick = function () {
          if (op.classList.contains('fatto')) return;
          op.classList.add('fatto');
          var ok = k === d.giusta; if (ok) giuste++;
          risposte[i] = ok;
          punti.children[i].className = ok ? 'ok' : 'no';
          b.classList.add(ok ? 'ok' : 'no');
          op.children[d.giusta].classList.add('ok');
          spieg.innerHTML = '<p><b>' + (ok ? 'Giusto.' : 'Non proprio.') + '</b> ' + d.spiegazione + '</p>';
          var avanti = IM.h('button', { class: 'btn pri', type: 'button' }, i < dati.length - 1 ? 'Domanda successiva' : 'Vedi il risultato', spieg);
          avanti.onclick = function () { i++; i < dati.length ? domanda() : fine(); };
          avanti.focus({ preventScroll: true });
        };
      });
    }
    function fine() {
      conta.textContent = 'risultato';
      var msg = giuste === dati.length ? 'Tutto corretto: sei pronto per l\'interrogazione.' :
        giuste >= dati.length - 2 ? 'Ottimo. Rivedi solo le domande sbagliate.' : 'Ripassa le tre regole e la scrittura delle configurazioni, poi riprova.';
      corpo.innerHTML = '<p class="quiz-ris"><b>' + giuste + '</b> / ' + dati.length + '</p><p class="quiz-dom">' + msg + '</p>';
      var b = IM.h('button', { class: 'btn pri', type: 'button' }, 'Ricomincia', corpo);
      b.onclick = function () { i = 0; giuste = 0; [].forEach.call(punti.children, function (p) { p.className = ''; }); domanda(); };
    }
    domanda();
  });
})();
