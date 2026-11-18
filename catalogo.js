/* =====================================================================
   CATALOGO DEI MODULI — INSIDE MATTER
   ---------------------------------------------------------------------
   Questo è l'unico elenco dei capitoli del sito.
   La home e la navigazione tra moduli si costruiscono da qui.

   PER AGGIUNGERE UN NUOVO MODULO
   1. Copia la cartella  _modello-modulo  dentro  moduli/
      e rinominala, per esempio  moduli/02-tavola-periodica
   2. Aggiungi qui sotto una voce con  stato: 'pubblicato'
   3. Salva, fai commit e push: il sito online si aggiorna da solo.

   Campi:
     id          nome della cartella in moduli/
     numero      numero mostrato in home ("01", "02"...)
     titolo      titolo del modulo
     sottotitolo una riga che spiega di cosa parla
     materia     'Chimica', 'Biologia', 'Scienze della Terra'...
     colore      colore d'accento del modulo (esadecimale)
     stato       'pubblicato'  → visibile e cliccabile
                 'in-preparazione' → visibile in home, non cliccabile
                 'nascosto'    → non compare da nessuna parte
   ===================================================================== */

window.IM_CATALOGO = [
  {
    id: '01-configurazione-elettronica',
    numero: '01',
    titolo: 'La configurazione elettronica',
    sottotitolo: 'Come si dispongono gli elettroni negli orbitali, e perché questo decide il comportamento chimico di un elemento.',
    materia: 'Chimica',
    colore: '#5cd6ff',
    stato: 'pubblicato'
  },
  {
    id: '02-tavola-periodica',
    numero: '02',
    titolo: 'La tavola periodica',
    sottotitolo: 'Gruppi, periodi e blocchi letti attraverso la configurazione elettronica.',
    materia: 'Chimica',
    colore: '#9a8cff',
    stato: 'in-preparazione'
  },
  {
    id: '03-proprieta-periodiche',
    numero: '03',
    titolo: 'Le proprietà periodiche',
    sottotitolo: 'Raggio atomico, energia di ionizzazione, elettronegatività.',
    materia: 'Chimica',
    colore: '#ffa65c',
    stato: 'in-preparazione'
  },
  {
    id: '04-legami-chimici',
    numero: '04',
    titolo: 'I legami chimici',
    sottotitolo: 'Perché gli atomi si uniscono: legame ionico, covalente, metallico.',
    materia: 'Chimica',
    colore: '#5ce0b8',
    stato: 'in-preparazione'
  }
];
