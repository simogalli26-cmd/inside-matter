# INSIDE MATTER · Dentro la materia

Progetto di Scienze Naturali per il liceo scientifico: viaggi visivi e interattivi dentro la struttura della materia, un modulo alla volta. Il sito cresce durante l'anno, sempre allo stesso indirizzo.

**Moduli pubblicati**

| N.  | Modulo | Cartella |
|-----|--------|----------|
| 01  | La configurazione elettronica | `moduli/01-configurazione-elettronica/` |

---

## Avviare il progetto

Il sito è fatto solo di HTML, CSS e JavaScript: **non serve installare nulla e non c'è nessuna compilazione**.

- **Il modo più semplice:** doppio clic su `index.html`. Si apre nel browser e funziona anche senza internet (i caratteri sono nella cartella `assets/fonts`).
- **Con un piccolo server locale** (consigliato mentre modifichi, comportamento identico al sito online): apri la cartella in VS Code e usa l'estensione *Live Server*, oppure da terminale:

  ```bash
  python -m http.server 8000
  ```
  e apri `http://localhost:8000`.

## Come è organizzato

```
inside-matter/
├── index.html                 home: si costruisce da catalogo.js
├── catalogo.js                ELENCO DEI MODULI (l'unico file da toccare per aggiungerne uno)
├── assets/
│   ├── css/
│   │   ├── base.css           colori, caratteri, impaginazione, barra: comuni a tutto il sito
│   │   ├── componenti.css     aspetto dei componenti interattivi
│   │   └── home.css           aspetto della home
│   ├── js/
│   │   ├── core.js            motore: barra dei capitoli, avanzamento, comparsa, avvio componenti
│   │   ├── chimica.js         dati e calcoli (elementi H–Kr, configurazioni, gas nobili)
│   │   └── componenti/        un file per ogni componente interattivo, riusabile in ogni modulo
│   └── fonts/                 caratteri (licenza SIL OFL, file di licenza inclusi)
├── moduli/
│   └── 01-configurazione-elettronica/
│       ├── index.html         le scene del modulo
│       └── modulo.css         piccole personalizzazioni del modulo
└── _modello-modulo/           punto di partenza per un modulo nuovo (commentato)
```

Ogni modulo è una pagina a sé dentro `moduli/`. Le parti comuni (stile, motore, componenti) stanno in `assets/` e sono condivise: migliorare un componente migliora tutti i moduli che lo usano.

## Aggiungere un nuovo argomento

1. **Copia** la cartella `_modello-modulo` dentro `moduli/` e rinominala, per esempio `moduli/02-tavola-periodica`.
2. Nel file `index.html` appena copiato, scrivi lo stesso nome in `data-modulo="02-tavola-periodica"` e cambia il `<title>`.
3. **Apri `catalogo.js`** e cambia (o aggiungi) la voce del modulo con `stato: 'pubblicato'`. Gli stati possibili sono:
   - `'pubblicato'`: visibile in home e cliccabile;
   - `'in-preparazione'`: visibile in home come «in preparazione», non cliccabile;
   - `'nascosto'`: non compare.
4. **Scrivi le scene**: ogni `<section class="scena" data-titolo="...">` diventa un capitolo nella barra in alto. Il modello spiega nei commenti le impaginazioni e i componenti pronti.
5. Salva, poi fai commit e push (vedi sotto): il sito online si aggiorna da solo.

La home e i collegamenti «modulo successivo» si aggiornano automaticamente dal catalogo.

### Componenti già pronti

Si inseriscono con un solo attributo, per esempio `<div data-componente="tavola"></div>`.

| Componente | Che cosa fa | Opzioni |
|---|---|---|
| `viaggio` | viaggio guidato dallo scorrimento, dalla materia all'atomo | — |
| `livelli-atomo` | livelli di energia di un atomo, con dettagli al passaggio del mouse | `data-elemento="K"` |
| `struttura-livelli` | livello → sottolivelli → orbitali | `data-livello="3"` |
| `nube-orbitale` | forma 3D degli orbitali s, p, d, ruotabile | `data-iniziale="2p"` |
| `aufbau` | schema delle diagonali animato | — |
| `pauli`, `hund` | esercizi interattivi sulle due regole | — |
| `confronto` | esempi giusto/sbagliato di caselle con frecce | `data-casi='[...]'` |
| `scala-energetica` | diagramma orbitalico che si riempie un elettrone alla volta | `data-elemento`, `data-vuoti`, `data-controlli="si"` |
| `esempi` | schede di esempi guidati | `<template data-esempio="C">` |
| `anatomia`, `leggi-config` | lettura di una configurazione | `data-n`, `data-l`, `data-e` / `data-elementi` |
| `abbreviata` | passaggio alla forma [gas nobile] | `data-elementi="K,Na"` |
| `famiglie`, `tavola` | elettroni di valenza, elementi H–Kr | `data-famiglie='[...]'`, `data-iniziale="19"` |
| `quiz` | domande a scelta multipla | JSON dentro `<script type="application/json">` |

Per crearne uno nuovo: un file in `assets/js/componenti/` con

```js
IM.componente('nome', function (elemento, opzioni) {
  // opzioni contiene gli attributi data-* dell'elemento
});
```

e il suo `<script>` in fondo alla pagina del modulo. I dati chimici comuni sono in `IM.chimica` (vedi `chimica.js`).

## Pubblicarlo e tenerlo aggiornato

Il repository GitHub è la **fonte di verità**: il sito pubblicato è sempre la copia del ramo `main`.

### GitHub Pages (consigliato, già pronto)

1. Carica il progetto nel repository (ramo `main`).
2. Su GitHub: **Settings → Pages → Build and deployment**: Source **Deploy from a branch**, Branch **main**, cartella **/ (root)**, **Save**.
3. Dopo un paio di minuti l'indirizzo compare in alto nella stessa pagina, nella forma `https://NOME-UTENTE.github.io/NOME-REPOSITORY/`.

Da quel momento **ogni push su `main` aggiorna il sito da solo**, sullo stesso indirizzo. Il file `.nojekyll` dice a GitHub di pubblicare i file così come sono.

### In alternativa: Vercel

Su vercel.com: *Add New → Project → Import* il repository, Framework Preset **Other**, nessun comando di build, cartella di output la radice. Ogni push su `main` ripubblica il sito.

### Il flusso di lavoro di ogni aggiornamento

```bash
git pull                        # prendi l'ultima versione
# ... modifica o aggiungi un modulo ...
git add .
git commit -m "Modulo 02: tavola periodica"
git push                        # il sito online si aggiorna in un paio di minuti
```

Senza terminale: con **GitHub Desktop** (Fetch → modifica → Commit → Push), oppure direttamente su github.com con **Add file → Upload files** e poi **Commit changes**.

## Note sui contenuti

- I contenuti seguono il programma del liceo scientifico. Quando il sito va oltre il libro, la parte è segnata come **Precisazione** (riquadro ambra).
- Le configurazioni sono calcolate da `chimica.js` con l'ordine delle diagonali (n + l crescente), incluse le due eccezioni del quarto periodo (cromo e rame).
- Le nubi degli orbitali sono campionate dalle funzioni d'onda dell'atomo di idrogeno: le forme sono reali, le dimensioni da un orbitale all'altro non sono in scala.
- Lo schema dei livelli del potassio è una rappresentazione: le distanze non sono in scala e gli elettroni non percorrono orbite.
