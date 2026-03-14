/* ============================================================
   IRON & ALLIANCES — game.js
   Full game engine: characters, events, diplomacy, war, memory
   ============================================================ */

'use strict';

const Game = (() => {

  // ══════════════════════════════════════════════
  // VERSION & CHANGELOG
  // ══════════════════════════════════════════════
  const VERSION = '1.9.0';

  const CHANGELOG = {
    '1.9.0': {
      date: '2026',
      title: 'Memoria, Battaglia & Diplomazia',
      notes: [
        '🎯 Icone risorse centrate correttamente nei cerchi',
        '🃏 Animazione carta: traslazione fluida senza rotazione, dissolvenza naturale',
        '🚫 Rimosso il popup "conseguenze scelta" dopo ogni decisione',
        '😤 Memoria alleanze: rifiuti ripetuti indispettiscono la casata (avviso, poi nemici)',
        '📈 Eserciti delle casate si aggiornano ogni turno (deriva casuale + ritorno al valore base)',
        '👑 Esercito del Re sempre alto — non scende mai sotto 60',
        '⚔ Nuova animazione battaglia: 2 schieramenti visibili, soldati che muoiono in tempo reale',
        '🏃 Pulsante Ritirata in battaglia — calcola i superstiti e aggiorna l\'esercito',
        '💔 Ritirata da una casata → quella casata diventa nemica permanente',
        '📦 Puoi chiedere risorse agli alleati dal pannello Diplomazia',
        '🤝 Gli alleati possono chiedere risorse a te tramite carte evento',
        '🔄 Azioni corvo dinamiche: i pulsanti cambiano in base allo stato della casata selezionata',
      ],
    },
    '1.8.0': {
      date: '2026',
      title: 'Il Grande Gioco delle Casate',
      notes: [
        '⚔️ Guerra tra casate con animazione completa stile sfida al Re',
        '🏰 Vittoria = casata conquistata, +100 cap a tutte le risorse, bottino aggiunto',
        '💀 Sconfitta = game over, annesso dalla casata nemica ed eseguito pubblicamente',
        '📈 Cap risorse dinamico: base 100, +100 per ogni casata conquistata (illimitato)',
        '👑 Badge HUD mostra cap attuale e numero di conquiste',
        '🤝 Richiedi esercito agli alleati prima di ogni guerra (da pannello Diplomazia)',
        '📜 Alleati possono chiedere compenso in risorse OPPURE patto di mutuo soccorso',
        '💔 Rompere un patto di sangue rende la casata nemica permanente per tutta la sessione',
        '⚔ Truppe prestate tornano all\'alleato dopo la battaglia (toast di notifica)',
        '🔄 Nuovo corvo: Scambio Risorse con gli alleati — nessuno è obbligato ad accettare',
        '😤 3 rifiuti reciproci allo scambio → la casata torna neutrale',
        '💰 Casate nemiche inviano ultimatum di tributo ogni tot turni (se abbastanza forti)',
        '⚠️ Rifiutare l\'ultimatum → attacco entro 3 turni con avviso preventivo',
      ],
    },
    '1.7.0': {
      date: '2026',
      title: 'Sfida il Re Reggente',
      notes: [
        '👑 Nuova meccanica: sfida il Re Reggente dalla schermata Diplomazia',
        '⚖️ Indicatore visivo delle forze in campo prima di confermare l\'attacco al Re',
      ],
    },
    '1.6.0': {
      date: '2026',
      title: 'Sfida il Re Reggente',
      notes: [
        '👑 Nuova meccanica: sfida il Re Reggente dalla schermata Diplomazia e conquista il Trono di Spade',
        '⚖️ Indicatore visivo delle forze in campo prima di confermare l\'attacco al Re',
        '📉 Costo politico immediato: dichiarare l\'intenzione costa -10 Popolo (l\'instabilità spaventa)',
        '🎲 Tradimento degli alleati: ogni alleato ha una % di restare neutrale prima della battaglia',
        '🏆 Vittoria sul Re: diventi il nuovo Reggente, le sue alleanze diventano tue nemiche',
        '💀 Sconfitta: perdita massiccia di esercito e il Re ti dichiara nemico giurato',
        '📜 Evento post-vittoria: dopo 5 turni da Re, arriva la carta "Le Casate Chiedono Legittimità"',
        '🎯 Obiettivi aggiornati per Daenerys, Stannis e Cersei: conquista del Trono ora possibile',
      ],
    },
    '1.5.1': {
      date: '2025',
      title: 'Obiettivi bilanciati',
      notes: [
        '✅ Cersei: obiettivo corretto — sopravvivi al turno 60 con Tesoro e Potere alti (non più "diventa re", meccanica non esistente)',
        '✅ Stannis: obiettivo corretto — vinci 2 guerre invece di "diventa re"',
        '✅ Daenerys: obiettivo semplificato — Esercito alto + 1 vittoria in guerra',
        '✅ Catelyn: obiettivo corretto — rimosso tag family_death inesistente, sostituito con condizione realistica',
        '🗡️ Arya: aggiunte 2 nuove carte assassination (arya_shadow, arya_braavos_skill), arya_shadow può uscire fino a 3 volte',
        '💍 Margaery: aggiunte 2 carte royal_marriage (margaery_king_proposal, margaery_second_chance)',
        '⚔️ Stannis, Daenerys, Oberyn, Jaime: aggiunte carte specifiche per i tag degli obiettivi',
        '🔁 Sistema maxUses: le carte possono ora uscire più volte se necessario',
      ],
    },
    '1.5.0': {
      date: '2025',
      title: 'Carte Contestualizzate',
      notes: [
        '🎭 Ogni personaggio ha 3-5 carte esclusive con speaker e situazioni coerenti al loro arco narrativo',
        '🚫 Le carte generiche con speaker incoerenti sono state rimosse o corrette',
        '📦 Il deck è cresciuto da 23 a oltre 70 carte totali',
      ],
    },
  };

  function checkChangelog() {
    const seen = localStorage.getItem('ia_version_seen');
    if (seen !== VERSION) {
      setTimeout(() => showChangelogPopup(), 600);
    }
  }

  function showChangelogPopup() {
    const log = CHANGELOG[VERSION];
    if (!log) return;

    const overlay = document.createElement('div');
    overlay.id = 'changelog-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:500;
      display:flex;align-items:center;justify-content:center;
      animation:fadeIn 0.3s ease;backdrop-filter:blur(4px);
    `;

    overlay.innerHTML = `
      <div style="
        background:#12121a;border:1px solid rgba(201,168,76,0.6);border-radius:6px;
        width:90%;max-width:460px;max-height:80vh;overflow-y:auto;padding:1.75rem;
        font-family:'Cinzel',serif;
      ">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;padding-bottom:0.75rem;border-bottom:1px solid rgba(201,168,76,0.2)">
          <div>
            <div style="font-family:'Cinzel Decorative',serif;color:#c9a84c;font-size:0.9rem;letter-spacing:0.05em">♛ Iron &amp; Alliances</div>
            <div style="font-size:0.7rem;color:#9a8a6a;margin-top:0.2rem;letter-spacing:0.1em;text-transform:uppercase">Versione ${VERSION} — ${log.title}</div>
          </div>
          <span style="background:rgba(201,168,76,0.15);color:#c9a84c;padding:0.2rem 0.6rem;border-radius:20px;font-size:0.7rem;border:1px solid rgba(201,168,76,0.3)">Nuovo!</span>
        </div>
        <div style="font-family:'Cinzel',serif;font-size:0.75rem;color:#9a8a6a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.75rem">Novità in questo aggiornamento</div>
        <ul style="list-style:none;display:flex;flex-direction:column;gap:0.6rem;margin-bottom:1.5rem">
          ${log.notes.map(n => `<li style="font-family:'EB Garamond',serif;font-size:0.95rem;color:#e8dcc8;line-height:1.5;padding-left:0.5rem;border-left:2px solid rgba(201,168,76,0.3)">${n}</li>`).join('')}
        </ul>
        <button onclick="document.getElementById('changelog-overlay').remove();localStorage.setItem('ia_version_seen','${VERSION}')" style="
          width:100%;padding:0.75rem;background:linear-gradient(135deg,#8b6914,#c9a84c,#8b6914);
          border:none;border-radius:2px;font-family:'Cinzel',serif;font-size:0.8rem;
          font-weight:700;letter-spacing:0.15em;text-transform:uppercase;cursor:pointer;color:#0a0a0f;
        ">Inizia a giocare</button>
      </div>
    `;

    document.body.appendChild(overlay);
  }


  let state = {
    character: null,
    turn: 1,
    resources: { gold: 50, faith: 50, people: 50, army: 50, power: 50 },
    houses: {},          // { Stark: { status: 'neutral', army: 60 }, ... }
    king: null,          // current ruler
    decisionHistory: [], // { turn, cardId, choice, tags }
    eventQueue: [],      // queued consequence cards
    gameOver: false,
    ravenTarget: null,
  };

  // ══════════════════════════════════════════════
  // DATA — CHARACTERS
  // ══════════════════════════════════════════════
  // ── ARYA'S HIT LIST (5 targets, tracked separately) ──
  const ARYA_LIST = [
    { id: 'cersei_l',  name: 'Cersei Lannister',  icon: '🦁', done: false },
    { id: 'walder_f',  name: 'Walder Frey',        icon: '🌉', done: false },
    { id: 'meryn_t',   name: 'Meryn Trant',        icon: '⚔️', done: false },
    { id: 'tywin_l',   name: 'Tywin Lannister',    icon: '🦁', done: false },
    { id: 'polliver',  name: 'Polliver',            icon: '🗡️', done: false },
  ];

  const CHARACTERS = [
    {
      id: 'daenerys', name: 'Daenerys Targaryen', house: 'Casa Targaryen',
      icon: '🐉', emoji: '👸',
      difficulty: 'hard',
      startResources: { gold: 35, faith: 40, people: 55, army: 65, power: 30 },
      objective: 'Riconquista il Trono: siediti sul Trono di Spade sconfiggendo il Re Reggente.',
      objectiveCheck: (s) => s.king === 'daenerys',
      startAllies: [], startEnemies: ['Lannister'],
      flavor: 'Il fuoco e il sangue scorrono nelle tue vene. I draghi ti obbediscono.',
    },
    {
      id: 'jon', name: 'Jon Snow', house: 'Guardiani della Notte / Stark',
      icon: '🐺', emoji: '⚔️',
      difficulty: 'medium',
      startResources: { gold: 30, faith: 50, people: 60, army: 55, power: 28 },
      objective: 'Unisci il Nord: Popolo >70, Esercito >65 e almeno 3 alleanze.',
      objectiveCheck: (s) => s.resources.people > 70 && s.resources.army > 65 && countAllies(s) >= 3,
      startAllies: ['Stark'], startEnemies: [],
      flavor: 'Sai nulla, Jon Snow. Ma forse è tempo di imparare.',
    },
    {
      id: 'cersei', name: 'Cersei Lannister', house: 'Casa Lannister',
      icon: '🦁', emoji: '👑',
      difficulty: 'medium',
      startResources: { gold: 65, faith: 28, people: 38, army: 60, power: 58 },
      objective: 'Potere Assoluto: siedi sul Trono (o sopravvivi al turno 60) con Tesoro >55 e Potere >65.',
      objectiveCheck: (s) => (s.king === 'cersei' || s.turn >= 60) && s.resources.gold > 55 && s.resources.power > 65,
      startAllies: ['Lannister'], startEnemies: ['Stark', 'Baratheon'],
      flavor: 'Il potere è il solo dio che vale la pena adorare.',
    },
    {
      id: 'tyrion', name: 'Tyrion Lannister', house: 'Casa Lannister',
      icon: '🍷', emoji: '🧠',
      difficulty: 'easy',
      startResources: { gold: 58, faith: 35, people: 52, army: 38, power: 50 },
      objective: "Mano del Re: Potere >75, Fede >50 e almeno 2 alleanze diplomatiche.",
      objectiveCheck: (s) => s.resources.power > 75 && s.resources.faith > 50 && countAllies(s) >= 2,
      startAllies: ['Lannister'], startEnemies: [],
      flavor: 'Bevo e so le cose. La mente è la mia arma.',
    },
    {
      id: 'sansa', name: 'Sansa Stark', house: 'Casa Stark',
      icon: '🐺', emoji: '🌹',
      difficulty: 'easy',
      startResources: { gold: 42, faith: 55, people: 65, army: 32, power: 38 },
      objective: 'Lady di Grande Inverno: Fede >70, Popolo >70 e Casa Stark alleata al turno 40.',
      objectiveCheck: (s) => s.turn >= 40 && s.resources.faith > 70 && s.resources.people > 70 && s.houses['Stark']?.status === 'ally',
      startAllies: ['Stark'], startEnemies: [],
      flavor: 'La vita non è una canzone. Il mondo non è un libro di fiabe.',
    },
    {
      id: 'arya', name: 'Arya Stark', house: 'Casa Stark',
      icon: '🗡️', emoji: '🐺',
      difficulty: 'hard',
      startResources: { gold: 22, faith: 22, people: 42, army: 50, power: 28 },
      objective: 'La Lista: depenna 3 nomi dalla lista di Arya.',
      objectiveCheck: (s) => (s.aryaList || ARYA_LIST).filter(t => t.done).length >= 3,
      startAllies: [], startEnemies: ['Lannister', 'Frey'],
      flavor: "Un ragazzo non ha nome. Ma ha una lista.",
    },
    {
      id: 'stannis', name: 'Stannis Baratheon', house: 'Casa Baratheon',
      icon: '🦌', emoji: '🔥',
      difficulty: 'hard',
      startResources: { gold: 42, faith: 62, people: 38, army: 60, power: 45 },
      objective: 'Il Trono Spetta a Me: conquista il Trono di Spade sconfiggendo il Re Reggente.',
      objectiveCheck: (s) => s.king === 'stannis',
      startAllies: [], startEnemies: ['Lannister'],
      flavor: 'Non è la gloria che voglio. È il dovere.',
    },
    {
      id: 'robb', name: 'Robb Stark', house: 'Casa Stark',
      icon: '🐺', emoji: '⚔️',
      difficulty: 'medium',
      startResources: { gold: 38, faith: 48, people: 65, army: 68, power: 42 },
      objective: 'Re del Nord: mantieni Stark + Tully alleati e Esercito >65 fino al turno 45.',
      objectiveCheck: (s) => s.turn >= 45 && s.houses['Stark']?.status === 'ally' && s.houses['Tully']?.status === 'ally' && s.resources.army > 65,
      startAllies: ['Stark', 'Tully'], startEnemies: ['Lannister'],
      flavor: 'Il Nord ricorda. E il Nord si vendica.',
    },
    {
      id: 'jaime', name: 'Jaime Lannister', house: 'Casa Lannister',
      icon: '⚔️', emoji: '🦁',
      difficulty: 'medium',
      startResources: { gold: 55, faith: 28, people: 38, army: 65, power: 42 },
      objective: "Redenzione: aiuta 3 alleati (carte aiuto) con Popolo >55 — senza mai scegliere tradimento.",
      objectiveCheck: (s) => s.decisionHistory.filter(d => d.tags?.includes('help_ally')).length >= 3 && s.resources.people > 55 && !s.decisionHistory.some(d => d.tags?.includes('betray_ally')),
      startAllies: ['Lannister'], startEnemies: [],
      flavor: "Sono il Sterminatore dei Re. Ma c'è ancora qualcosa che vale.",
    },
    {
      id: 'margaery', name: 'Margaery Tyrell', house: 'Casa Tyrell',
      icon: '🌹', emoji: '👸',
      difficulty: 'easy',
      startResources: { gold: 62, faith: 50, people: 68, army: 38, power: 50 },
      objective: 'La Rosa del Trono: sposa il Re e mantieni Tesoro >60 e Popolo >60.',
      objectiveCheck: (s) => s.decisionHistory.some(d => d.tags?.includes('royal_marriage')) && s.resources.gold > 60 && s.resources.people > 60,
      startAllies: ['Tyrell'], startEnemies: [],
      flavor: 'Ho sempre voluto essere la Regina. Non la moglie del Re.',
    },
    {
      id: 'theon', name: 'Theon Greyjoy', house: 'Casa Greyjoy',
      icon: '🐙', emoji: '⚓',
      difficulty: 'hard',
      startResources: { gold: 30, faith: 18, people: 28, army: 45, power: 22 },
      objective: 'Redenzione: raggiungi Potere >55 e 2 alleanze — senza mai perdere Esercito sotto 20.',
      objectiveCheck: (s) => s.resources.power > 55 && countAllies(s) >= 2 && !s.decisionHistory.some(d => d.tags?.includes('army_collapse')),
      startAllies: [], startEnemies: ['Stark', 'Lannister'],
      flavor: 'Cosa mi appartiene? Il ferro paga il ferro.',
    },
    {
      id: 'littlefinger', name: 'Ditocorto', house: 'Nessuna Casa',
      icon: '🪙', emoji: '🕵️',
      difficulty: 'medium',
      startResources: { gold: 68, faith: 22, people: 38, army: 20, power: 65 },
      objective: "Signore del Caos: Potere >85 e Tesoro >75 con almeno 2 intrighi portati a termine.",
      objectiveCheck: (s) => s.resources.power > 85 && s.resources.gold > 75 && s.decisionHistory.filter(d => d.tags?.includes('poison_intrigue')).length >= 2,
      startAllies: [], startEnemies: [],
      flavor: 'Il caos non è un abisso. Il caos è una scala.',
    },
    {
      id: 'melisandre', name: 'Melisandre', house: "R'hllor",
      icon: '🔥', emoji: '🌹',
      difficulty: 'hard',
      startResources: { gold: 25, faith: 62, people: 30, army: 28, power: 40 },
      objective: 'Il Fuoco Eterno: mantieni la Fede ≥85 per 20 turni consecutivi.',
      objectiveCheck: (s) => (s.faithHighTurns || 0) >= 20,
      startAllies: ['Baratheon'], startEnemies: [],
      flavor: "Il Signore della Luce mostra tutto... ma la fiamma non mente mai.",
    },
    {
      id: 'baelish', name: 'Oberyn Martell', house: 'Casa Martell',
      icon: '☀️', emoji: '🐍',
      difficulty: 'medium',
      startResources: { gold: 50, faith: 38, people: 55, army: 50, power: 45 },
      objective: "Vendetta per Elia: vinci una guerra contro Casa Lannister con Popolo >50.",
      objectiveCheck: (s) => s.decisionHistory.some(d => d.tags?.includes('war_victory') && d.target === 'Lannister') && s.resources.people > 50,
      startAllies: ['Martell'], startEnemies: ['Lannister'],
      flavor: 'Dorne ricorda Elia. E la Vipera non perdona.',
    },
    {
      id: 'ned', name: 'Eddard Stark', house: 'Casa Stark',
      icon: '🐺', emoji: '⚖️',
      difficulty: 'hard',
      startResources: { gold: 38, faith: 60, people: 68, army: 50, power: 38 },
      objective: "L'Onore del Nord: mantieni Fede >65 e Popolo >65 senza MAI tradire un alleato, fino al turno 50.",
      objectiveCheck: (s) => s.turn >= 50 && s.resources.faith > 65 && s.resources.people > 65 && !s.decisionHistory.some(d => d.tags?.includes('betray_ally')),
      startAllies: ['Stark', 'Tully'], startEnemies: [],
      flavor: "L'onore è il fardello più pesante che un uomo possa portare.",
    },
    {
      id: 'catelyn', name: 'Catelyn Tully', house: 'Casa Tully',
      icon: '🐟', emoji: '👩',
      difficulty: 'medium',
      startResources: { gold: 42, faith: 58, people: 60, army: 42, power: 38 },
      objective: 'Proteggi la Famiglia: turno 50, Popolo >55, Fede >55, senza tradire alleati.',
      objectiveCheck: (s) => s.turn >= 50 && s.resources.people > 55 && s.resources.faith > 55 && !s.decisionHistory.some(d => d.tags?.includes('betray_ally')),
      startAllies: ['Stark', 'Tully'], startEnemies: ['Lannister'],
      flavor: 'Un leone non si preoccupa delle opinioni delle pecore. Ma io non sono una pecora.',
    },
    {
      id: 'bronn', name: 'Bronn', house: 'Nessuna Casa',
      icon: '🗡️', emoji: '😏',
      difficulty: 'easy',
      startResources: { gold: 50, faith: 20, people: 38, army: 55, power: 32 },
      objective: "Il Mercenario d'Oro: Tesoro >80 e Esercito >65 entro il turno 50.",
      objectiveCheck: (s) => s.turn >= 1 && s.resources.gold > 80 && s.resources.army > 65,
      startAllies: [], startEnemies: [],
      flavor: "Non combatto per la gloria. Combatto per l'oro. E sopravvivo.",
    },
    {
      id: 'olenna', name: 'Olenna Tyrell', house: 'Casa Tyrell',
      icon: '🌹', emoji: '👵',
      difficulty: 'medium',
      startResources: { gold: 62, faith: 42, people: 58, army: 45, power: 60 },
      objective: "La Regina delle Spine: Potere >75 e almeno 2 intrighi (carte veleno) portati a termine.",
      objectiveCheck: (s) => s.resources.power > 75 && s.decisionHistory.filter(d => d.tags?.includes('poison_intrigue')).length >= 2,
      startAllies: ['Tyrell'], startEnemies: ['Lannister'],
      flavor: "Ho fatto cose terribili. Ma ero io la più furba di tutti.",
    },
    {
      id: 'tormund', name: 'Tormund Gigante-di-Giant', house: 'Braccio del Re (Popolo Libero)',
      icon: '🗿', emoji: '🪓',
      difficulty: 'hard',
      startResources: { gold: 18, faith: 15, people: 45, army: 65, power: 22 },
      objective: 'Oltre il Muro: sopravvivi 55 turni mantenendo Esercito >55 e Popolo >35.',
      objectiveCheck: (s) => s.turn >= 55 && s.resources.army > 55 && s.resources.people > 35,
      startAllies: [], startEnemies: ['Lannister', 'Baratheon'],
      flavor: 'Siamo liberi. Il sud non capisce cosa significa.',
    },
  ];

  // ══════════════════════════════════════════════
  // DATA — GREAT HOUSES
  // ══════════════════════════════════════════════
  const HOUSES_DEF = [
    { id: 'Stark',     name: 'Stark',    icon: '🐺', region: 'Nord',         baseArmy: 60 },
    { id: 'Lannister', name: 'Lannister',icon: '🦁', region: 'Castel Granito',baseArmy: 75 },
    { id: 'Tyrell',    name: 'Tyrell',   icon: '🌹', region: "Altogarden",   baseArmy: 65 },
    { id: 'Baratheon', name: 'Baratheon',icon: '🦌', region: "Capo della Tempesta", baseArmy: 55 },
    { id: 'Tully',     name: 'Tully',    icon: '🐟', region: 'Acque del Nera', baseArmy: 45 },
    { id: 'Martell',   name: 'Martell',  icon: '☀️', region: 'Dorne',         baseArmy: 50 },
    { id: 'Greyjoy',   name: 'Greyjoy',  icon: '🐙', region: 'Isole di Ferro', baseArmy: 55 },
    { id: 'Frey',      name: 'Frey',     icon: '🌉', region: 'Tridente',      baseArmy: 40 },
  ];

  // ══════════════════════════════════════════════
  // DATA — EVENTS
  // Filtering fields:
  //   forChars:    ['id1','id2'] → solo per questi personaggi
  //   excludeChars:['id1','id2'] → mai per questi personaggi
  //   forHouses:   ['Stark']     → solo se player ha questa casa alleata o è di questa casa
  //   requiresTag: 'tag'         → solo se nella decisionHistory
  //   minTurn / maxTurn
  // ══════════════════════════════════════════════
  const EVENTS = [

    // ══════════════════════════════════════════
    // ── EVENTI UNIVERSALI (speaker neutri) ──
    // ══════════════════════════════════════════

    {
      id: 'tax_collect', tags: ['gold'],
      speaker: 'Mastro delle Monete', speakerRole: 'Corte Reale',
      excludeChars: ['arya','tormund','jaime','bronn','theon','littlefinger','catelyn','sansa','melisandre','jon','baelish'],
      portrait: '💰', icon: '💰',
      text: "Le entrate mensili sono pronte per essere raccolte. Potete tassare i commercianti pesantemente — riempirete le casse, ma il popolo mormorerà.",
      leftText: 'Tassa moderata', leftEffects: { gold: +8, people: +2 },
      rightText: 'Tassa pesante', rightEffects: { gold: +14, people: -14 },
      minTurn: 1,
    },
    {
      id: 'harvest_feast', tags: ['people', 'gold'],
      speaker: 'Steward', speakerRole: 'Responsabile delle provviste',
      excludeChars: ['arya','tormund','melisandre'],
      portrait: '🌾', icon: '🌾',
      text: "Il raccolto è abbondante quest'anno. Potete distribuire il surplus tra la gente, aumentando la loro lealtà, oppure conservarlo per i tempi difficili.",
      leftText: 'Conserva le riserve', leftEffects: { gold: +12 },
      rightText: 'Distribuisci al popolo', rightEffects: { people: +14, gold: -5 },
      minTurn: 2,
    },
    {
      id: 'plague_arrives', tags: ['people', 'faith'],
      speaker: 'Septon locale', speakerRole: 'Messaggero della Fede',
      excludeChars: ['arya','tormund','bronn'],
      portrait: '⚕️', icon: '⚕️',
      text: "La pestilenza colpisce i quartieri poveri. La gente implora protezione. Potete usare le risorse della Fede per curare i malati, o lasciarli al loro destino.",
      leftText: "Lascia che i Sette decidano", leftEffects: { people: -14, faith: +10 },
      rightText: 'Invia i guaritori', rightEffects: { people: +10, gold: -12, faith: +5 },
      minTurn: 3,
    },
    {
      id: 'sell_swords', tags: ['army', 'gold'],
      speaker: 'Capitano dei Mercenari', speakerRole: 'Condottiero straniero',
      excludeChars: ['arya','melisandre'],
      portrait: '⚔️', icon: '⚔️',
      text: "Cinquemila spade sono in vendita. La Compagnia Dorata offre i propri servizi. Costano molto, ma rafforzerebbero notevolmente il vostro esercito.",
      leftText: 'Rifiuta', leftEffects: { gold: +5 },
      rightText: "Assoldali", rightEffects: { gold: -14, army: +14 },
      minTurn: 1,
    },
    {
      id: 'iron_bank', tags: ['gold', 'power'],
      speaker: 'Tycho Nestoris', speakerRole: 'Banca di Ferro di Braavos',
      excludeChars: ['arya','tormund','jaime','bronn','theon','melisandre'],
      portrait: '🏦', icon: '🏦',
      text: "La Banca di Ferro reclama il suo debito. Potete rinegoziare, ma a caro prezzo politico. Oppure rifiutare e subire embargo commerciale.",
      leftText: 'Rifiuta il debito', leftEffects: { gold: +10, power: -14 },
      rightText: 'Paga e rinegozia', rightEffects: { gold: -14, power: +10 },
      minTurn: 10,
    },
    {
      id: 'lord_rebellion', tags: ['army', 'power'],
      speaker: 'Araldo', speakerRole: 'Notizia dal Riverlands',
      excludeChars: ['arya','tormund','jaime','bronn','theon','littlefinger','catelyn','sansa','melisandre','baelish'],
      portrait: '🏰', icon: '🏰',
      text: "Un signore minore si è ribellato nei Riverlands. Potete inviare truppe a soffocarlo subito, o negoziare e risolvere pacificamente.",
      leftText: 'Negozia la pace', leftEffects: { power: -5, people: +8 },
      rightText: 'Schiaccia la ribellione', rightEffects: { army: -10, power: +14, people: -5 },
      minTurn: 5,
    },
    {
      id: 'raven_news_merchant', tags: ['power', 'gold'],
      speaker: 'Corvo messaggero', speakerRole: 'Notizia da lontano',
      portrait: '🦅', icon: '🦅',
      text: "Un corvo porta notizie di un ricco mercante che chiede protezione. In cambio vi offre accesso alle rotte commerciali orientali.",
      leftText: 'Rifiuta', leftEffects: { power: -3 },
      rightText: 'Accetta il patto', rightEffects: { gold: +14, power: +8 },
      minTurn: 3,
    },
    {
      id: 'night_watch_plea', tags: ['army', 'faith'],
      speaker: "Lord Comandante", speakerRole: "Guardiani della Notte",
      portrait: '❄️', icon: '❄️',
      text: "Il Muro ha bisogno di uomini. I Guardiani della Notte chiedono condannati e volontari. Aiutarli rafforza la Fede ma indebolisce il vostro esercito.",
      leftText: 'Ignora la richiesta', leftEffects: { faith: -8 },
      rightText: "Invia uomini al Muro", rightEffects: { army: -12, faith: +14, people: +5 },
      minTurn: 4, excludeChars: ['tormund'], // Tormund non manda uomini al Muro
    },
    {
      id: 'war_council_generic', tags: ['army', 'power'],
      speaker: 'Maester del castello', speakerRole: 'Consiglio militare',
      excludeChars: ['arya','littlefinger','sansa','melisandre'],
      portrait: '⚔️', icon: '⚔️',
      text: "Il consiglio militare si riunisce. Potete addestrare nuove reclute (lento ma sicuro) oppure schierare l'esercito in una dimostrazione di forza.",
      leftText: 'Addestra le reclute', leftEffects: { army: +10, gold: -8 },
      rightText: 'Dimostrazione di forza', rightEffects: { army: +5, power: +10, people: -5 },
      minTurn: 4,
    },
    {
      id: 'traitor_in_court', tags: ['power', 'army'],
      speaker: 'Guardia della corte', speakerRole: 'Rapporto segreto',
      excludeChars: ['arya','tormund','bronn'],
      portrait: '🔒', icon: '🔒',
      text: "Una spia nemica è stata scoperta tra i vostri. Potete giustiziarla pubblicamente per deterrenza, o usarla come doppio agente per diffondere disinformazione.",
      leftText: 'Giustizia pubblica', leftEffects: { power: +10, people: +5, faith: +8 },
      rightText: 'Doppio agente', rightEffects: { power: +14, gold: -5 },
      minTurn: 6,
    },
    {
      id: 'night_terror', tags: ['army', 'faith'],
      speaker: 'Messaggero dal Muro', speakerRole: 'Rapporto urgente',
      portrait: '🌙', icon: '🌙',
      text: "Sussurri parlano di morti che camminano oltre il Muro. Pochissimi ci credono. Investire nella difesa al Muro vi farà sembrare folli, ma potrebbe salvare tutti.",
      leftText: 'Ignora le voci', leftEffects: { faith: +5 },
      rightText: 'Invia rifornimenti', rightEffects: { gold: -14, army: -8, faith: +12, power: +5 },
      minTurn: 7,
    },
    {
      id: 'assassination_offer', tags: ['power', 'army'],
      speaker: 'Faceless Man', speakerRole: 'Messaggero dei Molti Volti',
      excludeChars: ['arya','tormund'],
      portrait: '🗡️', icon: '🗡️',
      text: "Un messaggero dei Molti Volti offre l'eliminazione di un vostro nemico. Il prezzo è altissimo. Ma un nemico in meno vale molto.",
      leftText: 'Rifiuta', leftEffects: { power: -3 },
      rightText: "Commissiona l'assassinio", rightEffects: { gold: -14, power: +14 },
      minTurn: 8, rightTags: ['assassination', 'poison_intrigue'],
      excludeChars: ['arya'], // Arya fa da sola
    },
    {
      id: 'wedding_proposal', tags: ['power', 'faith'],
      speaker: 'Emissario', speakerRole: 'Proposta diplomatica',
      portrait: '💍', icon: '💍',
      text: "Una grande casata propone un'unione matrimoniale tra le vostre famiglie. Porterebbe alleanze solide, ma vincolerebbe la vostra libertà.",
      leftText: 'Declina', leftEffects: { power: -8, faith: +5 },
      rightText: 'Accetta le nozze', rightEffects: { power: +14, people: +10 },
      minTurn: 5, rightTags: ['royal_marriage'],
      excludeChars: ['arya','tormund','bronn','theon','melisandre','jaime'],
    },
    {
      id: 'gift_to_ally', tags: ['gold', 'power'],
      speaker: 'Messaggero alleato', speakerRole: 'Richiesta di aiuto',
      portrait: '🤝', icon: '🤝',
      text: "Un vostro alleato è in difficoltà. Aiutarlo ora rafforzerà il legame, ma vi costerà. Ignorarlo rischia di raffreddare l'alleanza.",
      leftText: "Non posso permettermi", leftEffects: { power: -8 },
      rightText: "Invia oro e rifornimenti", rightEffects: { gold: -14, power: +14 },
      minTurn: 6, rightTags: ['help_ally'],
    },
    {
      id: 'spy_network', tags: ['power', 'gold'],
      speaker: 'Informatore', speakerRole: 'Proposta riservata',
      excludeChars: ['tormund'],
      portrait: '🕵️', icon: '🕵️',
      text: "Un informatore offre di costruire una rete di spie che vi darà informazioni su ogni casata. Il costo è alto, e qualcuno potrebbe scoprirlo.",
      leftText: 'Troppo rischioso', leftEffects: {},
      rightText: 'Finanzia la rete', rightEffects: { gold: -14, power: +14 },
      minTurn: 6,
    },
    {
      id: 'betrayal_remembered', tags: ['power', 'people'],
      speaker: 'Messaggero ostile', speakerRole: 'Lettera sigillata con cera nera',
      portrait: '📩', icon: '📩',
      text: "«Ricordate il vostro tradimento? Il Nord ricorda. E ora chiediamo riparazione, o ogni accordo futuro sarà impossibile.»",
      leftText: 'Ignorali', leftEffects: { power: -10, people: -8 },
      rightText: 'Offri compensazione', rightEffects: { gold: -14, power: +12 },
      minTurn: 15, requiresTag: 'betray_ally',
    },
    {
      id: 'war_declaration_enemy', tags: ['army', 'power', 'war_choice'],
      speaker: 'Araldo nemico', speakerRole: 'Sfida di guerra',
      portrait: '⚔️', icon: '⚔️',
      text: "Un araldo porta sfida di guerra. La casata rivale ha mobilitato le truppe. Potete accettare la guerra aperta o cercare una via diplomatica dell'ultimo minuto.",
      leftText: 'Cerca la pace', leftEffects: { army: +5, power: -14, people: +8 },
      rightText: 'Accetta la guerra', rightEffects: { army: -10, power: +10, people: -8 },
      minTurn: 8, rightTags: ['war_choice'],
    },
    {
      id: 'noble_feast_generic', tags: ['people', 'faith', 'power'],
      speaker: 'Castellano', speakerRole: 'Proposta di corte',
      excludeChars: ['arya','tormund','bronn','theon','melisandre','jaime'],
      portrait: '🍷', icon: '🍷',
      text: "Un grande banchetto attirerà nobili da ogni angolo del regno. Costoso, ma un momento di gioia può unire le casate.",
      leftText: 'Annulla il banchetto', leftEffects: { power: -5 },
      rightText: 'Organizza il banchetto', rightEffects: { gold: -14, people: +12, power: +12, faith: +5 },
      minTurn: 5, excludeChars: ['tormund', 'arya'],
    },
    {
      id: 'scroll_of_prophecy', tags: ['faith', 'power'],
      speaker: 'Meera Reed', speakerRole: 'Portavoce dei Figli della Foresta',
      portrait: '📜', icon: '📜',
      text: "Antichi rotoli parlano del Principe che fu Promesso. Seguire questa profezia richiede sacrifici enormi, ma potrebbe essere la chiave per salvare il regno.",
      leftText: 'Ignora le profezie', leftEffects: { faith: -5 },
      rightText: "Segui il destino", rightEffects: { faith: +14, army: -8, power: +5 },
      minTurn: 9,
    },

    // ══════════════════════════════════════════
    // ── EVENTI DAENERYS ──
    // ══════════════════════════════════════════
    {
      id: 'dany_unsullied', tags: ['army', 'gold'], forChars: ['daenerys'],
      speaker: 'Grigio Verme', speakerRole: 'Comandante degli Immacolati',
      portrait: '🗡️', icon: '🗡️',
      text: "Gli Immacolati sono pronti, Khaleesi. Ma addestrarli e nutrirli richiede risorse. Volete espandere le nostre fila o mantenere l'attuale forza?",
      leftText: 'Mantieni le fila', leftEffects: { army: +5 },
      rightText: 'Espandi gli Immacolati', rightEffects: { gold: -14, army: +14 },
      minTurn: 1,
    },
    {
      id: 'dany_dragons', tags: ['army', 'faith'], forChars: ['daenerys'],
      speaker: 'Missandei', speakerRole: 'Consigliera e traduttrice',
      portrait: '🐉', icon: '🐉',
      text: "I draghi crescono, Khaleesi. La gente li teme e li venera. Potete sfruttare questa paura per affermare la vostra legittimità, o nasconderli per rassicurare gli alleati.",
      leftText: 'Nascondi i draghi', leftEffects: { faith: +10, army: -5 },
      rightText: 'Mostra la loro potenza', rightEffects: { power: +14, people: -8, army: +10 },
      minTurn: 2,
    },
    {
      id: 'dany_slavery', tags: ['people', 'faith'], forChars: ['daenerys'],
      speaker: 'Schiavo liberato', speakerRole: 'Portavoce degli ex-schiavi',
      portrait: '⛓️', icon: '⛓️',
      text: "Gli ex-schiavi di Meereen chiedono terra e lavoro. Aiutarli vi renderà amatissima, ma i nobili locali si ribelleranno e le casse soffriranno.",
      leftText: 'Priorità alla stabilità', leftEffects: { gold: +10, people: -10 },
      rightText: 'Libera e ricompensa', rightEffects: { people: +14, gold: -14, faith: +8 },
      minTurn: 3,
    },
    {
      id: 'dany_dothraki', tags: ['army', 'people'], forChars: ['daenerys'],
      speaker: 'Jorah Mormont', speakerRole: 'Cavaliere e consigliere',
      portrait: '🐴', icon: '🐴',
      text: "Un khalasar di cinquemila Dothraki vi offre fedeltà, Khaleesi. Ma integrarli nell'esercito richiede risorse e potrebbe spaventare le casate di Westeros.",
      leftText: 'Rifiuta i Dothraki', leftEffects: { power: +5 },
      rightText: 'Accogli il khalasar', rightEffects: { army: +14, gold: -14, people: -8 },
      minTurn: 4,
    },
    {
      id: 'dany_king_offer', tags: ['power', 'army'], forChars: ['daenerys'],
      speaker: 'Tyrion Lannister', speakerRole: 'Consigliere della Regina',
      portrait: '🍷', icon: '🍷',
      text: "Tyrion vi consiglia di proporre un'alleanza al Re Reggente prima di attaccare. «Meno sangue, più legittimità.» Ma questo significherebbe riconoscere il suo trono.",
      leftText: 'Attacca senza trattare', leftEffects: { army: +5, power: -10 },
      rightText: 'Considera la diplomazia', rightEffects: { power: +14, army: -5 },
      minTurn: 8, rightTags: ['defeated_king'],
    },

    // ══════════════════════════════════════════
    // ── EVENTI JON SNOW ──
    // ══════════════════════════════════════════
    {
      id: 'jon_wildlings', tags: ['army', 'people'], forChars: ['jon'],
      speaker: 'Tormund', speakerRole: 'Capo del Popolo Libero',
      portrait: '🗿', icon: '🗿',
      text: "Tormund vi chiede di integrare il Popolo Libero nelle difese del Nord. I signori nordici non sono contenti, ma gli Oltre-Muro sono guerrieri feroci.",
      leftText: 'Troppo controverso', leftEffects: { people: +8, army: -5 },
      rightText: 'Integra i selvaggi', rightEffects: { army: +14, people: -10, faith: -5 },
      minTurn: 2,
    },
    {
      id: 'jon_wall_defense', tags: ['army', 'gold'], forChars: ['jon'],
      speaker: 'Sam Tarly', speakerRole: 'Maestro dei Guardiani della Notte',
      portrait: '📚', icon: '📚',
      text: "Sam ha trovato nei libri antichi le istruzioni per forgiare acciaio di drago. Serve investire molto, ma le armi contro i Non Morti potrebbero fare la differenza.",
      leftText: "Non abbiamo risorse", leftEffects: { army: +3 },
      rightText: 'Finanzia la ricerca', rightEffects: { gold: -14, army: +14, faith: +5 },
      minTurn: 5,
    },
    {
      id: 'jon_ned_honor', tags: ['faith', 'people'], forChars: ['jon'],
      speaker: 'Lady Lyanna Mormont', speakerRole: 'Lady di Orsorso',
      portrait: '🐻', icon: '🐻',
      text: "Lady Lyanna vi chiede di mantenere le tradizioni del Nord — niente compromessi con i Lannister, niente tradimenti. «Il Nord ricorda.» Ma questo isola il vostro territorio.",
      leftText: "Necessitò di pragmatismo", leftEffects: { power: +10, people: -8 },
      rightText: "L'onore prima di tutto", rightEffects: { faith: +14, people: +10, power: -5 },
      minTurn: 3,
    },
    {
      id: 'jon_lord_commanders', tags: ['power', 'army'], forChars: ['jon'],
      speaker: 'Alliser Thorne', speakerRole: 'Primo Ranger',
      portrait: '❄️', icon: '❄️',
      text: "Thorne sfida la vostra autorità davanti agli altri fratelli neri. Potete rispondergli con fermezza pubblica o ignorarlo per evitare una spaccatura nei ranghi.",
      leftText: 'Ignora la provocazione', leftEffects: { power: -8, army: +3 },
      rightText: 'Affronta il confronto', rightEffects: { power: +14, army: -5, people: +5 },
      minTurn: 4,
    },

    // ══════════════════════════════════════════
    // ── EVENTI CERSEI ──
    // ══════════════════════════════════════════
    {
      id: 'cersei_wildfire', tags: ['army', 'power', 'gold'], forChars: ['cersei'],
      speaker: 'Qyburn', speakerRole: 'Consigliere speciale della Regina',
      portrait: '🔥', icon: '🔥',
      text: "Qyburn ha preparato un nuovo deposito di Fuoco Selvatico sotto la città. «Un'assicurazione, Vostra Maestà.» Rischioso ma devastante se necessario.",
      leftText: 'Troppo pericoloso', leftEffects: { faith: +5 },
      rightText: "Prepara l'arsenale segreto", rightEffects: { army: +14, people: -14, gold: -12 },
      minTurn: 5,
    },
    {
      id: 'cersei_sparrows', tags: ['faith', 'power'], forChars: ['cersei'],
      speaker: 'Alto Septon', speakerRole: 'Capo della Fede dei Sette',
      portrait: '✝️', icon: '✝️',
      text: "Il Septon Supremo chiede che la Corona rispetti la legge dei Sette. Ha migliaia di fedeli armati. Cedergli potere potrebbe essere fatale nel lungo periodo.",
      leftText: 'Resisti alla Fede', leftEffects: { faith: -14, power: +10, army: -5 },
      rightText: 'Negozia con il Septon', rightEffects: { faith: +14, power: -12 },
      minTurn: 6,
    },
    {
      id: 'cersei_joffrey_advice', tags: ['people', 'power'], forChars: ['cersei'],
      speaker: 'Joffrey Baratheon', speakerRole: 'Erede al Trono',
      portrait: '👑', icon: '👑',
      text: "Joffrey vuole giustiziare pubblicamente un nobile che lo ha insultato. Farlo contenterebbe il Re, ma alienherebbe le altre casate. Fermarlo rischia uno scontro.",
      leftText: 'Ferma Joffrey', leftEffects: { power: -8, people: +10 },
      rightText: 'Lascia fare al Re', rightEffects: { power: +5, people: -14, faith: -5 },
      minTurn: 3,
    },
    {
      id: 'cersei_gold_debt', tags: ['gold', 'power'], forChars: ['cersei'],
      speaker: 'Tywin Lannister', speakerRole: 'Lettera da Castel Granito',
      portrait: '🦁', icon: '🦁',
      text: "Tywin scrive: «I Lannister pagano sempre i loro debiti. Saldare il debito con la Banca di Ferro consoliderà il trono. Rimandare è segno di debolezza.»",
      leftText: 'Rimanda il pagamento', leftEffects: { gold: +14, power: -10 },
      rightText: 'Salda il debito', rightEffects: { gold: -14, power: +14 },
      minTurn: 4,
    },

    // ══════════════════════════════════════════
    // ── EVENTI TYRION ──
    // ══════════════════════════════════════════
    {
      id: 'tyrion_wine', tags: ['people', 'faith'], forChars: ['tyrion'],
      speaker: 'Bronn', speakerRole: 'Guardia del corpo e amico',
      portrait: '🍷', icon: '🍷',
      text: "Bronn vi avvisa: la vostra reputazione da bevitore inizia a danneggiare la vostra immagine politica. «Non è la bottiglia il problema, milord, è che tutti vi guardano.»",
      leftText: 'Continua come sempre', leftEffects: { people: -8, faith: -5 },
      rightText: 'Cura la tua immagine pubblica', rightEffects: { people: +12, power: +8 },
      minTurn: 2,
    },
    {
      id: 'tyrion_knowledge', tags: ['power', 'gold'], forChars: ['tyrion'],
      speaker: 'Varys', speakerRole: 'Maestro dei Sussurri',
      portrait: '🕵️', icon: '🕵️',
      text: "Varys vi offre informazioni riservate su un complotto contro di voi. «Le conoscenze hanno un prezzo, Lord Tyrion. Ma l'ignoranza costa di più.»",
      leftText: 'Non mi fido di Varys', leftEffects: { power: -5 },
      rightText: 'Paga per le informazioni', rightEffects: { gold: -14, power: +14 },
      minTurn: 3,
    },
    {
      id: 'tyrion_speech', tags: ['people', 'power'], forChars: ['tyrion'],
      speaker: 'Cittadini di Approdo del Re', speakerRole: 'Delegazione popolare',
      portrait: '👥', icon: '👥',
      text: "Una delegazione di cittadini vi chiede udienza. Un vostro discorso pubblico potrebbe aumentare il favore popolare, ma i nobili vi accuseranno di demagogia.",
      leftText: 'Evita il discorso', leftEffects: { power: +5 },
      rightText: 'Parla al popolo', rightEffects: { people: +14, power: -8 },
      minTurn: 2,
    },
    {
      id: 'tyrion_sister', tags: ['power', 'faith'], forChars: ['tyrion'],
      speaker: 'Cersei Lannister', speakerRole: 'Tua sorella',
      portrait: '🦁', icon: '🦁',
      text: "Cersei vi convoca: «Stai diventando troppo popolare, fratellino. Ti conviene ricordare chi comanda davvero.» Sfidarla apertamente è rischioso ma necessario.",
      leftText: 'Cedi per ora', leftEffects: { power: -10, gold: +10 },
      rightText: 'Tienile testa', rightEffects: { power: +14, faith: -8, army: -5 },
      minTurn: 5,
    },

    // ══════════════════════════════════════════
    // ── EVENTI ARYA ──
    // ══════════════════════════════════════════
    {
      id: 'arya_needle', tags: ['army', 'people'], forChars: ['arya'],
      speaker: 'Syrio Forel', speakerRole: 'Primo Spada di Braavos (ricordo)',
      portrait: '🗡️', icon: '🗡️',
      text: "Ricordate le lezioni di Syrio: «Non c'è niente di più importante dell'occhio e della mano.» Allenarvi ogni giorno vi renderà più letale ma vi isola dagli altri.",
      leftText: 'Equilibrio tra vita e addestramento', leftEffects: { people: +7 },
      rightText: 'Addestramento totale', rightEffects: { army: +12, people: -7 },
      minTurn: 1,
    },
    {
      id: 'arya_stark_identity', tags: ['people', 'faith'], forChars: ['arya'],
      speaker: 'Sansa Stark', speakerRole: 'Tua sorella (messaggio)',
      portrait: '🐺', icon: '🐺',
      text: "Sansa vi scrive da Grande Inverno: «Arya, ho bisogno di te qui. Stark deve restare unito.» Tornare significherebbe abbandonare la lista — almeno per ora.",
      leftText: 'La lista viene prima', leftEffects: { power: +5, people: -8 },
      rightText: 'Torna a Grande Inverno', rightEffects: { people: +12, faith: +8, power: -7 },
      minTurn: 6, rightTags: ['help_ally'],
    },
    // ARYA HIT LIST CARDS — one per target, triggers kill confirmation overlay
    {
      id: 'arya_kill_cersei', tags: ['power', 'army'], forChars: ['arya'],
      speaker: 'Cersei Lannister', speakerRole: 'Obiettivo: Sulla Lista',
      portrait: '🦁', icon: '🦁',
      text: "L'avete trovata. Cersei Lannister è sola, in un momento di vulnerabilità. Anni di allenamento si sono preparati per questo istante. Il momento è adesso — o aspettate ancora?",
      leftText: 'Non ancora — la lista può aspettare', leftEffects: { power: +3 },
      rightText: '⚔ Elimina Cersei Lannister', rightEffects: { power: +12, army: +5, faith: -8 },
      minTurn: 5, rightTags: ['assassination'], listTarget: 'cersei_l',
    },
    {
      id: 'arya_kill_walder', tags: ['faith', 'people'], forChars: ['arya'],
      speaker: 'Walder Frey', speakerRole: 'Obiettivo: Sulla Lista',
      portrait: '🌉', icon: '🌉',
      text: "Walder Frey banchetta nel suo castello sul Tridente, ignaro. Il sangue dei vostri cugini grida vendetta. Una maschera, un calice avvelenato — e il nome è depennato.",
      leftText: 'Non oggi — troppo rischioso', leftEffects: { faith: +5 },
      rightText: '⚔ Elimina Walder Frey', rightEffects: { people: +10, faith: -7, power: +8 },
      minTurn: 3, rightTags: ['assassination', 'poison_intrigue'], listTarget: 'walder_f',
    },
    {
      id: 'arya_kill_meryn', tags: ['army', 'faith'], forChars: ['arya'],
      speaker: 'Meryn Trant', speakerRole: 'Obiettivo: Sulla Lista',
      portrait: '⚔️', icon: '⚔️',
      text: "Meryn Trant — il cavaliere che ha ucciso Syrio davanti ai vostri occhi. Lo avete trovato a Braavos. Un'abilità acquisita a caro prezzo. Lo sguardo di Syrio vi guida.",
      leftText: 'Aspetta il momento giusto', leftEffects: { army: +3 },
      rightText: '⚔ Elimina Meryn Trant', rightEffects: { army: +8, faith: +5, people: -5 },
      minTurn: 2, rightTags: ['assassination'], listTarget: 'meryn_t',
    },
    {
      id: 'arya_kill_tywin', tags: ['power', 'gold'], forChars: ['arya'],
      speaker: 'Tywin Lannister', speakerRole: 'Obiettivo: Sulla Lista',
      portrait: '🦁', icon: '🦁',
      text: "Tywin Lannister — l'artefice della Rossa Nuziale, la mente dietro ogni disgrazia Stark. Lo avete trovato. Una sola occasione, forse l'ultima.",
      leftText: 'Troppo pericoloso', leftEffects: { power: +4 },
      rightText: '⚔ Elimina Tywin Lannister', rightEffects: { power: +14, gold: +8, faith: -10 },
      minTurn: 8, rightTags: ['assassination'], listTarget: 'tywin_l',
    },
    {
      id: 'arya_kill_polliver', tags: ['army', 'people'], forChars: ['arya'],
      speaker: 'Polliver', speakerRole: 'Obiettivo: Sulla Lista',
      portrait: '🗡️', icon: '🗡️',
      text: "Polliver — il soldato che ha preso Ago e ucciso Lommy. Lo avete incontrato in una locanda. Il momento è propizio. E Ago vuole tornare al suo posto.",
      leftText: 'Non ora', leftEffects: { army: +3 },
      rightText: '⚔ Elimina Polliver (recupera Ago)', rightEffects: { army: +10, people: +5, faith: -5 },
      minTurn: 1, rightTags: ['assassination'], listTarget: 'polliver',
    },

    // ══════════════════════════════════════════
    // ── EVENTI STANNIS ──
    // ══════════════════════════════════════════
    {
      id: 'stannis_melisandre', tags: ['faith', 'army'], forChars: ['stannis'],
      speaker: 'Melisandre', speakerRole: 'Sacerdotessa Rossa',
      portrait: '🔥', icon: '🔥',
      text: "Melisandre vi mostra nelle fiamme la vittoria. «R'hllor vi guida, Vostra Maestà. Sacrificate i prigionieri al Signore della Luce e l'esercito sarà invincibile.»",
      leftText: 'Rifiuta il sacrificio', leftEffects: { faith: -10, army: +5 },
      rightText: 'Segui il Signore della Luce', rightEffects: { faith: +14, army: +14, people: -14 },
      minTurn: 2,
    },
    {
      id: 'stannis_davos', tags: ['people', 'power'], forChars: ['stannis'],
      speaker: 'Ser Davos Seaworth', speakerRole: 'Mano del Re',
      portrait: '⚓', icon: '⚓',
      text: "Davos vi chiede di moderare l'influenza di Melisandre. «La gente vi segue per giustizia, non per religione, Maestà. Non alienateli con il fuoco.»",
      leftText: "Ignora il consiglio di Davos", leftEffects: { faith: +10, people: -8 },
      rightText: 'Ascolta Davos', rightEffects: { people: +14, faith: -10, power: +5 },
      minTurn: 4,
    },
    {
      id: 'stannis_law', tags: ['power', 'faith'], forChars: ['stannis'],
      speaker: 'Maester Cressen', speakerRole: 'Consigliere reale',
      portrait: '📜', icon: '📜',
      text: "Un vostro vassallo ha violato la legge. La punizione giusta è severa — ma potrebbe alienare altri signori. Il diritto è il diritto.",
      leftText: "Clemenza politica", leftEffects: { power: -8, people: +8 },
      rightText: 'Applica la legge', rightEffects: { power: +14, faith: +8, people: -5 },
      minTurn: 3,
    },

    // ══════════════════════════════════════════
    // ── EVENTI SANSA ──
    // ══════════════════════════════════════════
    {
      id: 'sansa_littlefinger', tags: ['power', 'gold'], forChars: ['sansa'],
      speaker: 'Ditocorto', speakerRole: 'Lord Protettore della Valle',
      portrait: '🪙', icon: '🪙',
      text: "Ditocorto vi offre protezione e risorse — in cambio di fiducia. «Il mondo è duro per le giovani donne sole, Lady Sansa.» Il suo prezzo potrebbe essere la vostra libertà.",
      leftText: 'Rifiuta la sua protezione', leftEffects: { gold: -8, power: +8 },
      rightText: 'Accetta il suo aiuto', rightEffects: { gold: +14, power: -12 },
      minTurn: 2,
    },
    {
      id: 'sansa_north_loyalty', tags: ['people', 'faith'], forChars: ['sansa'],
      speaker: 'Lady Lyanna Mormont', speakerRole: 'Lady di Orsorso',
      portrait: '🐻', icon: '🐻',
      text: "Lady Mormont vi chiede di dichiarare pubblicamente la vostra lealtà al Nord. Questo rafforzerà il popolo, ma vi renderà un bersaglio per le casate del Sud.",
      leftText: "Mantieni l'ambiguità", leftEffects: { power: +8 },
      rightText: "Dichiara fedeltà al Nord", rightEffects: { people: +14, faith: +8, power: -5 },
      minTurn: 3,
    },
    {
      id: 'sansa_bolton', tags: ['army', 'power'], forChars: ['sansa'],
      speaker: 'Servitore segreto', speakerRole: 'Messaggio cifrato',
      portrait: '🔐', icon: '🔐',
      text: "Un messaggio cifrato vi avvisa di un movimento dei Bolton. Potete mobilitare le forze leali degli Stark per un contrattacco, o attendere e raccogliere più informazioni.",
      leftText: 'Attendi e osserva', leftEffects: { power: +5 },
      rightText: 'Mobilitati subito', rightEffects: { army: +10, gold: -12, power: +8 },
      minTurn: 5, rightTags: ['war_choice'],
    },

    // ══════════════════════════════════════════
    // ── EVENTI ROBB STARK ──
    // ══════════════════════════════════════════
    {
      id: 'robb_frey_deal', tags: ['power', 'people'], forChars: ['robb'],
      speaker: 'Lord Walder Frey', speakerRole: 'Lord del Tridente',
      portrait: '🌉', icon: '🌉',
      text: "Walder Frey vi concede il passaggio al Tridente — ma chiede in cambio un matrimonio con una delle sue figlie. Rifiutare blocca il vostro avanzamento militare.",
      leftText: 'Rifiuta il matrimonio', leftEffects: { army: -10, power: -8 },
      rightText: "Accetta l'accordo", rightEffects: { army: +14, people: -5, power: +5 },
      minTurn: 3,
    },
    {
      id: 'robb_tully_alliance', tags: ['army', 'power'], forChars: ['robb'],
      speaker: 'Zio Edmure Tully', speakerRole: 'Lord dei Riverlands',
      portrait: '🐟', icon: '🐟',
      text: "Edmure propone di rinforzare la difesa dei Riverlands con le truppe del Tridente. Forte ma costoso — e lascerebbe il Nord meno protetto.",
      leftText: 'Proteggi il Nord', leftEffects: { army: +5, people: +5 },
      rightText: 'Rinforza i Riverlands', rightEffects: { army: +14, gold: -14, people: -5 },
      minTurn: 2, rightTags: ['help_ally'],
    },
    {
      id: 'robb_king_north', tags: ['power', 'faith'], forChars: ['robb'],
      speaker: 'Signori del Nord', speakerRole: 'Consiglio di guerra nordico',
      portrait: '🐺', icon: '🐺',
      text: "I signori nordici si alzano in piedi: «Il Re del Nord! Il Re del Nord!» Accettare questo titolo vi darebbe immenso potere locale, ma vi renderebbe un obiettivo per il trono.",
      leftText: 'Declina il titolo per ora', leftEffects: { power: -5, people: -5 },
      rightText: 'Accetta la corona del Nord', rightEffects: { power: +14, people: +14, army: +8 },
      minTurn: 4,
    },

    // ══════════════════════════════════════════
    // ── EVENTI JAIME ──
    // ══════════════════════════════════════════
    {
      id: 'jaime_kingslayer', tags: ['faith', 'people'], forChars: ['jaime'],
      speaker: 'Cittadino di Approdo del Re', speakerRole: 'Voce della folla',
      portrait: '⚔️', icon: '⚔️',
      text: "La gente vi chiama ancora «Sterminatore dei Re». Potete spiegare pubblicamente perché avete ucciso Aerys — un atto che ha salvato migliaia di vite — o continuare a portare il peso in silenzio.",
      leftText: 'Il silenzio è la tua armatura', leftEffects: { power: +5 },
      rightText: 'Racconta la verità ad Aerys', rightEffects: { people: +14, faith: +8, power: -5 },
      minTurn: 2,
    },
    {
      id: 'jaime_cersei_orders', tags: ['power', 'army'], forChars: ['jaime'],
      speaker: 'Cersei Lannister', speakerRole: 'Tua sorella e Regina',
      portrait: '🦁', icon: '🦁',
      text: "Cersei vi ordina di compiere un atto che vi ripugna — attaccare civili innocenti per punire una casata ribelle. Obbedire rafforza la vostra posizione a corte.",
      leftText: "Rifiuta l'ordine", leftEffects: { faith: +14, people: +10, power: -14 },
      rightText: "Obbedisci a Cersei", rightEffects: { power: +10, people: -14, faith: -12 },
      minTurn: 4,
    },
    {
      id: 'jaime_brienne', tags: ['faith', 'army'], forChars: ['jaime'],
      speaker: 'Brienne di Tarth', speakerRole: "Cavaliere dell'ordine della spada",
      portrait: '🛡️', icon: '🛡️',
      text: "Brienne vi chiede di onorare un giuramento fatto a Lady Catelyn: proteggere le figlie Stark. Rispettarlo richiede risorse e rischia di mettervi contro i Lannister.",
      leftText: 'Il giuramento può aspettare', leftEffects: { faith: -12, power: +5 },
      rightText: 'Onora il tuo giuramento', rightEffects: { faith: +14, army: -8 },
      minTurn: 3, rightTags: ['help_ally'],
    },

    // ══════════════════════════════════════════
    // ── EVENTI MARGAERY ──
    // ══════════════════════════════════════════
    {
      id: 'margaery_king_charm', tags: ['power', 'people'], forChars: ['margaery'],
      speaker: 'Olenna Tyrell', speakerRole: 'Tua nonna, la Regina delle Spine',
      portrait: '🌹', icon: '🌹',
      text: "Nonna Olenna vi consiglia: «Fa' capire al Re che hai bisogno di lui. Gli uomini sono più facili da gestire quando credono di comandare.» È cinico ma efficace.",
      leftText: 'Sii diretta e onesta', leftEffects: { faith: +8, power: -5 },
      rightText: 'Segui i consigli di nonna', rightEffects: { power: +14, people: +8 },
      minTurn: 2,
    },
    {
      id: 'margaery_poor_quarters', tags: ['people', 'faith'], forChars: ['margaery'],
      speaker: 'Septa Nysterica', speakerRole: 'Accompagnatrice di corte',
      portrait: '🌺', icon: '🌺',
      text: "Volete visitare i quartieri poveri di Approdo del Re, distribuire pane e carne. La gente vi adorerà, ma il Re potrebbe essere geloso della vostra popolarità.",
      leftText: 'Evita i confronti col Re', leftEffects: { power: +5 },
      rightText: 'Visita i poveri', rightEffects: { people: +14, faith: +10, power: -8 },
      minTurn: 2,
    },

    // ══════════════════════════════════════════
    // ── EVENTI THEON ──
    // ══════════════════════════════════════════
    {
      id: 'theon_identity', tags: ['people', 'faith'], forChars: ['theon'],
      speaker: 'Yara Greyjoy', speakerRole: 'Tua sorella',
      portrait: '🐙', icon: '🐙',
      text: "Yara vi trova: «Sei ancora mio fratello o sei diventato Reek per sempre?» Per riconquistare il nome Greyjoy dovete affrontare il vostro passato — e i Bolton.",
      leftText: 'Non sono ancora pronto', leftEffects: { power: -5, people: -5 },
      rightText: 'Sono Theon Greyjoy', rightEffects: { power: +14, faith: +10, army: -5 },
      minTurn: 1,
    },
    {
      id: 'theon_iron_islands', tags: ['army', 'power'], forChars: ['theon'],
      speaker: 'Capitano della flotta Greyjoy', speakerRole: 'Ufficiale di marina',
      portrait: '⚓', icon: '⚓',
      text: "La flotta delle Isole di Ferro è disponibile se dimostrate di essere ancora Greyjoy. Ma comandarla richiede di tornare alle Isole — e affrontare i vostri vecchi nemici.",
      leftText: 'Non ancora', leftEffects: { army: +3 },
      rightText: 'Rivendica la flotta', rightEffects: { army: +14, power: +10, gold: -12 },
      minTurn: 3,
    },

    // ══════════════════════════════════════════
    // ── EVENTI LITTLEFINGER ──
    // ══════════════════════════════════════════
    {
      id: 'lf_chaos_ladder', tags: ['power', 'gold'], forChars: ['littlefinger'],
      speaker: 'Varys', speakerRole: 'Maestro dei Sussurri',
      portrait: '🕷️', icon: '🕷️',
      text: "Varys vi sfida apertamente in consiglio. Sa troppo. Potete farlo eliminare discretamente, rovinare la sua reputazione con false prove, o trovare un accordo segreto.",
      leftText: 'Accordo segreto con Varys', leftEffects: { power: +10, gold: -14 },
      rightText: 'Distruggi la sua reputazione', rightEffects: { power: +14, faith: -8 },
      minTurn: 3, rightTags: ['poison_intrigue'],
    },
    {
      id: 'lf_financial_web', tags: ['gold', 'power'], forChars: ['littlefinger'],
      speaker: 'Mercante di Lys', speakerRole: 'Partner commerciale segreto',
      portrait: '🪙', icon: '🪙',
      text: "Il vostro partner a Lys ha identificato un'opportunità: manipolare i mercati delle spezie prima dell'annuncio di una nuova tassa. Illegale, ma enormemente redditizio.",
      leftText: 'Troppo rischioso', leftEffects: { gold: +8 },
      rightText: "Sfrutta l'informazione", rightEffects: { gold: +14, power: +10, faith: -14 },
      minTurn: 2,
    },

    // ══════════════════════════════════════════
    // ── EVENTI MELISANDRE ──
    // ══════════════════════════════════════════
    {
      id: 'mel_fire_visions', tags: ['faith', 'power'], forChars: ['melisandre'],
      speaker: "R'hllor (visione nel fuoco)", speakerRole: 'Il Signore della Luce',
      portrait: '🔥', icon: '🔥',
      text: "Le fiamme vi mostrano il Principe Promesso. Ma il volto è ambiguo — potrebbe essere Stannis, o qualcun altro. Agire sulla profezia ora potrebbe essere prematuro.",
      leftText: 'Aspetta conferma', leftEffects: { faith: +5 },
      rightText: 'Agisci sulla visione', rightEffects: { faith: +14, power: +14, army: -8 },
      minTurn: 2,
    },
    {
      id: 'mel_resurrection', tags: ['faith', 'army'], forChars: ['melisandre'],
      speaker: 'Thoros di Myr', speakerRole: 'Sacerdote Rosso',
      portrait: '🕯️', icon: '🕯️',
      text: "Thoros vi rivela il segreto della resurrezione. Con abbastanza fede e sacrificio, anche la morte può essere reversibile. Il prezzo però è devastante per chi vi circonda.",
      leftText: 'La vita è sacra', leftEffects: { faith: -5, people: +10 },
      rightText: 'Apprendi il rito', rightEffects: { faith: +14, people: -14, army: +10 },
      minTurn: 5, rightTags: ['war_choice'],
    },

    // ══════════════════════════════════════════
    // ── EVENTI OBERYN MARTELL ──
    // ══════════════════════════════════════════
    {
      id: 'oberyn_elia', tags: ['power', 'army'], forChars: ['baelish'],
      speaker: 'Ellaria Sand', speakerRole: 'Compagna del Principe',
      portrait: '☀️', icon: '☀️',
      text: "Ellaria vi chiede di portare la guerra ai Lannister adesso, non domani. «Elia Martell. Ricordi il suo nome ogni giorno? Allora agisci.» Ma la guerra aperta ha costi enormi.",
      leftText: 'Pazienza strategica', leftEffects: { power: +5, army: +3 },
      rightText: 'Dichiara guerra ai Lannister', rightEffects: { army: +14, power: +10, people: -12 },
      minTurn: 3, rightTags: ['war_choice'],
    },
    {
      id: 'oberyn_dorne_army', tags: ['army', 'gold'], forChars: ['baelish'],
      speaker: 'Capitano della guardia dorniana', speakerRole: 'Ufficiale di Dorne',
      portrait: '🏜️', icon: '🏜️',
      text: "L'esercito di Dorne è pronto, ma i rifornimenti scarseggiano. Potete razionare e mantenere la forza militare, o spendere oro per avere truppe ben equipaggiate.",
      leftText: 'Raziona i rifornimenti', leftEffects: { army: +5, people: -5 },
      rightText: 'Equipaggia al meglio', rightEffects: { army: +14, gold: -14 },
      minTurn: 2,
    },

    // ══════════════════════════════════════════
    // ── EVENTI NED STARK ──
    // ══════════════════════════════════════════
    {
      id: 'ned_kings_hand', tags: ['power', 'faith'], forChars: ['ned'],
      speaker: 'Re Robert Baratheon', speakerRole: 'Tuo vecchio amico e Re',
      portrait: '🦌', icon: '🦌',
      text: "Robert vi chiede di diventare Mano del Re ad Approdo del Re. «Ho bisogno di qualcuno di cui fidarmi, Ned.» Ma la capitale è un nido di vipere lontano dal Nord.",
      leftText: 'Il Nord ha bisogno di me', leftEffects: { people: +10, faith: +5 },
      rightText: "Accetta l'incarico", rightEffects: { power: +14, people: -8 },
      minTurn: 1,
    },
    {
      id: 'ned_cersei_secret', tags: ['power', 'faith'], forChars: ['ned'],
      speaker: 'Littlefinger', speakerRole: 'Lord Protettore oscuro',
      portrait: '🪙', icon: '🪙',
      text: "Avete scoperto il segreto di Cersei. Littlefinger vi avvisa: «Usate questa informazione con cautela, Lord Stark. Ad Approdo del Re l'onore è una debolezza.»",
      leftText: 'Affronta Cersei direttamente', leftEffects: { faith: +14, power: -14 },
      rightText: "Usa l'informazione con cautela", rightEffects: { power: +14, faith: -10 },
      minTurn: 5,
    },

    // ══════════════════════════════════════════
    // ── EVENTI CATELYN ──
    // ══════════════════════════════════════════
    {
      id: 'cat_tyrion_prisoner', tags: ['power', 'army'], forChars: ['catelyn'],
      speaker: 'Tyrion Lannister', speakerRole: 'Prigioniero',
      portrait: '🍷', icon: '🍷',
      text: "Avete catturato Tyrion Lannister. Potete usarlo come pedina negoziale per liberare le figlie, o consegnarlo alla Valle per il processo. Ogni scelta ha conseguenze.",
      leftText: 'Usalo come leva diplomatica', leftEffects: { power: +14, people: -5 },
      rightText: 'Processalo alla Valle', rightEffects: { faith: +8, power: -10, army: -8 },
      minTurn: 3,
    },
    {
      id: 'cat_children_safety', tags: ['people', 'faith'], forChars: ['catelyn'],
      speaker: 'Maester Luwin', speakerRole: 'Maester di Grande Inverno',
      portrait: '📚', icon: '📚',
      text: "Luwin vi informa che le rotte verso il Sud sono pericolose per i figli di Stark. Potete nasconderli in luoghi sicuri — costoso e politicamente debole — o mantenerli visibili.",
      leftText: 'Tienili visibili (simbolo)', leftEffects: { power: +8, people: +5 },
      rightText: 'Metti in sicurezza i figli', rightEffects: { people: +12, gold: -14 },
      minTurn: 2,
    },

    // ══════════════════════════════════════════
    // ── EVENTI BRONN ──
    // ══════════════════════════════════════════
    {
      id: 'bronn_contract', tags: ['gold', 'army'], forChars: ['bronn'],
      speaker: 'Nobile in cerca di protezione', speakerRole: 'Cliente pagante',
      portrait: '💰', icon: '💰',
      text: "Un nobile vi offre un contratto lucroso per proteggere i suoi commerci. Il lavoro è pericoloso ma ben pagato. C'è anche un contratto rivale offerto dai suoi nemici.",
      leftText: 'Accetta il nobile', leftEffects: { gold: +14, army: -5 },
      rightText: 'Offerta dei nemici (di più)', rightEffects: { gold: +14, army: -8, power: -5 },
      minTurn: 1,
    },
    {
      id: 'bronn_no_loyalty', tags: ['power', 'people'], forChars: ['bronn'],
      speaker: 'Tyrion Lannister', speakerRole: 'Vecchio datore di lavoro',
      portrait: '🍷', icon: '🍷',
      text: "Tyrion vi offre una somma ingente per tornare al suo servizio. Ma un altro signore vi ha offerto ancora di più. La lealtà ha un prezzo — qual è il vostro?",
      leftText: 'Vai con Tyrion (meno oro)', leftEffects: { gold: +14, power: +8 },
      rightText: 'Vai col miglior offerente', rightEffects: { gold: +14, power: -5 },
      minTurn: 3,
    },

    // ══════════════════════════════════════════
    // ── EVENTI OLENNA TYRELL ──
    // ══════════════════════════════════════════
    {
      id: 'olenna_poison', tags: ['power', 'faith'], forChars: ['olenna'],
      speaker: 'Dontos Hollard', speakerRole: 'Tramite discreto',
      portrait: '💜', icon: '💜',
      text: "L'opportunità si presenta: il veleno è pronto, il momento è perfetto. «Sarà veloce e indolore.» Un colpo risolve molti problemi — ma se veniste scoperta, tutto crolla.",
      leftText: 'Troppo rischioso ora', leftEffects: { power: +5 },
      rightText: 'È il momento', rightEffects: { power: +14, faith: -14 },
      minTurn: 5, rightTags: ['poison_intrigue', 'assassination'],
    },
    {
      id: 'olenna_margaery', tags: ['people', 'power'], forChars: ['olenna'],
      speaker: 'Margaery Tyrell', speakerRole: 'Tua nipote',
      portrait: '🌹', icon: '🌹',
      text: "Margaery vi chiede consiglio sul Re. Guidarla bene potrebbe consolidare la posizione dei Tyrell, ma ogni mossa sbagliata potrebbe costarle — e costarvi — tutto.",
      leftText: 'Difendila ad ogni costo', leftEffects: { people: +12, gold: -10 },
      rightText: 'Sacrificala se necessario', rightEffects: { power: +14, people: -14 },
      minTurn: 4,
    },

    // ══════════════════════════════════════════
    // ── EVENTI TORMUND ──
    // ══════════════════════════════════════════
    {
      id: 'tormund_beyond_wall', tags: ['army', 'people'], forChars: ['tormund'],
      speaker: 'Capo clan del Popolo Libero', speakerRole: 'Guerriero anziano',
      portrait: '🗿', icon: '🗿',
      text: "Un clan del Popolo Libero si è separato dal gruppo. Potete unirvi a loro — aumentando la forza — o eliminarli prima che diventino una minaccia interna.",
      leftText: 'Unisciti al clan', leftEffects: { army: +14, people: +8 },
      rightText: 'Elimina la minaccia interna', rightEffects: { army: +5, people: -12, faith: -8 },
      minTurn: 1,
    },
    {
      id: 'tormund_crow_deal', tags: ['power', 'army'], forChars: ['tormund'],
      speaker: 'Jon Snow', speakerRole: 'Lord Comandante dei Guardiani',
      portrait: '❄️', icon: '❄️',
      text: "Jon Snow vi offre di far passare il Popolo Libero attraverso il Muro in cambio di una tregua. I vostri guerrieri non si fidano dei Corvi Neri. Ma è l'unica via sicura.",
      leftText: 'Rifiuta i Corvi', leftEffects: { army: +5, people: +5 },
      rightText: 'Accetta la tregua con Jon', rightEffects: { army: +10, power: +12, people: -8 },
      minTurn: 3,
    },
    {
      id: 'tormund_survival', tags: ['gold', 'army'], forChars: ['tormund'],
      speaker: 'Guerriero del Popolo Libero', speakerRole: 'Tuo luogotenente',
      portrait: '🪓', icon: '🪓',
      text: "L'inverno si fa più duro. Le provviste scarseggiano. Potete razionare e perdere guerrieri per la fame, oppure razziare villaggi a sud del Muro.",
      leftText: 'Raziona — niente razzie', leftEffects: { army: -8, people: +8 },
      rightText: 'Razzia i villaggi del Sud', rightEffects: { gold: +14, army: +5, faith: -14, people: -10 },
      minTurn: 2,
    },

    // ══════════════════════════════════════════
    // ── CARTE EXTRA PER OBIETTIVI ──
    // (garantiscono che ogni obiettivo sia raggiungibile)
    // ══════════════════════════════════════════

    // ARYA — 3a carta assassination (+ repeatable via arya_shadow)
    {
      id: 'arya_shadow', tags: ['power', 'army'], forChars: ['arya'],
      speaker: 'Vittima ignara', speakerRole: 'Dalla lista',
      portrait: '🌑', icon: '🌑',
      text: "Avete riconosciuto uno dei nomi dalla lista. È solo, distratto. Il momento è adesso — ma agire in fretta aumenta il rischio di essere scoperti.",
      leftText: 'Aspetta il momento giusto', leftEffects: { power: +5 },
      rightText: 'Colpisci adesso', rightEffects: { power: +12, army: +5, faith: -8 },
      minTurn: 3, rightTags: ['assassination'],
      maxUses: 3, // può uscire più volte
    },
    {
      id: 'arya_braavos_skill', tags: ['army', 'faith'], forChars: ['arya'],
      speaker: "Jaqen H'ghar", speakerRole: 'Maestro dei Molti Volti',
      portrait: '🎭', icon: '🎭',
      text: "«Una ragazza ha imparato bene. Un nome dalla lista può essere depennato.» Le vostre abilità vi permettono di eliminare un obiettivo senza lasciare tracce.",
      leftText: 'Non ancora pronta', leftEffects: { power: +3 },
      rightText: 'Depenna il nome', rightEffects: { power: +14, faith: -10, people: +5 },
      minTurn: 8, rightTags: ['assassination'],
    },

    // MARGAERY — carte royal_marriage aggiuntive
    {
      id: 'margaery_king_proposal', tags: ['power', 'people'], forChars: ['margaery'],
      speaker: 'Re Reggente', speakerRole: 'Messaggio reale sigillato',
      portrait: '💍', icon: '💍',
      text: "Il Re vi ha notata a corte. Il messaggio è chiaro: è interessato a un'unione. Accettare vi porterebbe al cuore del potere. Rifiutare potrebbe essere pericoloso.",
      leftText: 'Declina con grazia', leftEffects: { power: -5, faith: +8 },
      rightText: 'Accetta le nozze reali', rightEffects: { power: +14, people: +10, gold: +10 },
      minTurn: 3, rightTags: ['royal_marriage'],
    },
    {
      id: 'margaery_second_chance', tags: ['power', 'gold'], forChars: ['margaery'],
      speaker: 'Olenna Tyrell', speakerRole: 'La Regina delle Spine',
      portrait: '🌹', icon: '🌹',
      text: "Nonna Olenna ha orchestrato una nuova opportunità: un secondo incontro con il Re. «Questa volta, nipote mia, non lasciare che sfugga.»",
      leftText: "Non è il momento giusto", leftEffects: { gold: +5 },
      rightText: 'Conquista il Re', rightEffects: { power: +14, gold: +12, people: +8 },
      minTurn: 10, rightTags: ['royal_marriage'],
    },

    // STANNIS — carte war_victory aggiuntive
    {
      id: 'stannis_siege', tags: ['army', 'power'], forChars: ['stannis'],
      speaker: 'Ser Davos Seaworth', speakerRole: 'Mano del Re',
      portrait: '⚓', icon: '⚓',
      text: "Davos ha identificato un punto debole nelle difese nemiche. Un assedio rapido potrebbe concludersi con una vittoria decisiva. I rischi sono alti ma la ricompensa anche.",
      leftText: 'Troppo rischioso', leftEffects: { army: +5 },
      rightText: 'Lancia il siege', rightEffects: { army: -14, power: +14, gold: -10 },
      minTurn: 6, rightTags: ['war_victory'],
    },
    {
      id: 'stannis_battle_decisive', tags: ['army', 'faith'], forChars: ['stannis'],
      speaker: 'Melisandre', speakerRole: 'Sacerdotessa Rossa',
      portrait: '🔥', icon: '🔥',
      text: "«Le fiamme mostrano la vittoria, Maestà. R'hllor è con voi. Attaccate oggi e il nemico cadrà.» Melisandre è convinta. E di solito ha ragione.",
      leftText: "Aspetta condizioni migliori", leftEffects: { faith: +8 },
      rightText: "Attacca con il favore di R'hllor", rightEffects: { army: -12, faith: +14, power: +14 },
      minTurn: 12, rightTags: ['war_victory'],
    },

    // DAENERYS — carta war_victory specifica
    {
      id: 'dany_conquest', tags: ['army', 'power'], forChars: ['daenerys'],
      speaker: 'Grigio Verme', speakerRole: 'Comandante degli Immacolati',
      portrait: '🐉', icon: '🐉',
      text: "Gli Immacolati sono in posizione. I draghi sono pronti. «Khaleesi, la città è nostra se ordinate l'attacco. Un'altra casata nemica cadrà oggi.»",
      leftText: 'Aspetta ancora', leftEffects: { army: +5 },
      rightText: 'Dracarys — attacca!', rightEffects: { army: -14, power: +14, people: -8 },
      minTurn: 10, rightTags: ['war_victory'],
    },

    // OBERYN — carta war_victory vs Lannister specifica
    {
      id: 'oberyn_lannister_strike', tags: ['army', 'power'], forChars: ['baelish'],
      speaker: 'Capitano della guardia dorniana', speakerRole: 'Rapporto dal campo',
      portrait: '🐍', icon: '🐍',
      text: "Le forze Lannister sono vulnerabili nel Westerlands. È l'occasione per cui avete aspettato. Una campagna rapida potrebbe sconfiggerli definitivamente.",
      leftText: 'Non ora', leftEffects: { army: +5 },
      rightText: 'Colpisci i Lannister', rightEffects: { army: -14, power: +14, people: -5 },
      minTurn: 8, rightTags: ['war_victory'],
    },

    // JAIME — carta help_ally aggiuntiva
    {
      id: 'jaime_riverlands_help', tags: ['army', 'people'], forChars: ['jaime'],
      speaker: 'Lord dei Riverlands', speakerRole: 'Richiesta urgente',
      portrait: '🛡️', icon: '🛡️',
      text: "Villaggi dei Riverlands bruciano. Un lord vi chiede protezione — non in nome dei Lannister, ma dell'innocente. È il momento di scegliere chi siete davvero.",
      leftText: 'Non è affar mio', leftEffects: { faith: -10 },
      rightText: 'Proteggi i civili', rightEffects: { people: +14, army: -8, faith: +12 },
      minTurn: 5, rightTags: ['help_ally'],
    },
    {
      id: 'jaime_oath_honor', tags: ['faith', 'people'], forChars: ['jaime'],
      speaker: 'Cavaliere senza padrone', speakerRole: 'Supplica',
      portrait: '⚔️', icon: '⚔️',
      text: "Un cavaliere senza padrone chiede il vostro aiuto per difendere la sua famiglia. Non c'è niente da guadagnarci — solo il peso dell'onore. O della vergogna.",
      leftText: 'Non posso permettermelo', leftEffects: { faith: -8 },
      rightText: 'Aiuta il cavaliere', rightEffects: { faith: +14, people: +10, gold: -12 },
      minTurn: 4, rightTags: ['help_ally'],
    },

    // NED — carta betray per rendere la condizione concretamente evitabile
    // (Ned ha già ned_cersei_secret che può portare a betray — aggiungiamo una trappola esplicita)
    {
      id: 'ned_littlefinger_trap', tags: ['power', 'faith'], forChars: ['ned'],
      speaker: 'Littlefinger', speakerRole: 'Consiglio avvelenato',
      portrait: '🪙', icon: '🪙',
      text: "Littlefinger vi propone di falsificare prove contro un nobile innocente per rafforzare la vostra posizione. «Solo questa volta, Lord Stark. Nessuno saprà mai.»",
      leftText: "Mai — l'onore prima di tutto", leftEffects: { power: -8, faith: +14 },
      rightText: "Accetta il compromesso", rightEffects: { power: +14, faith: -14 },
      minTurn: 6, rightTags: ['betray_ally'],
    },

    // ══════════════════════════════════════════
    // ── GRUPPO B — COMBATTENTI / AVVENTURIERI ──
    // (jaime, bronn, theon + alcuni specifici)
    // ══════════════════════════════════════════

    {
      id: 'fighter_ambush', tags: ['army', 'gold'], forChars: ['jaime','bronn','theon','arya'],
      speaker: "Compagno d'armi", speakerRole: 'Voce dal campo',
      portrait: '⚔️', icon: '⚔️',
      text: "Un gruppo di uomini vi tende un agguato. Potete combatterli apertamente e rischiare ferite, o trovare una via di fuga intelligente risparmiando le forze.",
      leftText: 'Combatti — non ti pieghi a nessuno', leftEffects: { army: +8, gold: +6, people: -5 },
      rightText: 'Ritirati e scegli il momento', rightEffects: { army: -4, power: +5 },
      minTurn: 2,
    },
    {
      id: 'fighter_reputation', tags: ['people', 'power'], forChars: ['jaime','bronn','theon'],
      speaker: 'Bardo itinerante', speakerRole: 'Voce del popolo',
      portrait: '🎶', icon: '🎶',
      text: "Un bardo canta le vostre gesta nelle taverne. La vostra reputazione come guerriero si diffonde. Incoraggiarlo costa oro ma aumenta il vostro nome.",
      leftText: 'Lascia che parlino da soli', leftEffects: { power: +3 },
      rightText: 'Paga il bardo — che canti forte', rightEffects: { gold: -8, people: +10, power: +7 },
      minTurn: 3,
    },
    {
      id: 'fighter_wound', tags: ['army', 'faith'], forChars: ['jaime','bronn','theon','arya'],
      speaker: 'Cerusico', speakerRole: 'Medico del campo',
      portrait: '🩹', icon: '🩹',
      text: "Una ferita di battaglia si è infettata. Curarla richiede riposo e risorse, ma ignorarla rischia di aggravarsi nel momento peggiore.",
      leftText: 'Combatti con la ferita', leftEffects: { army: -6, power: +5 },
      rightText: 'Curati e riposati', rightEffects: { army: +8, gold: -7, faith: +5 },
      minTurn: 4,
    },
    {
      id: 'fighter_local_lord', tags: ['gold', 'power'], forChars: ['jaime','bronn','theon'],
      speaker: 'Lord locale', speakerRole: 'Signore del feudo',
      portrait: '🏰', icon: '🏰',
      text: "Un lord locale vi offre ospitalità e oro in cambio di protezione per la stagione. È un accordo semplice — ma vi lega a questo luogo per un po'.",
      leftText: 'Rifiuta — sei libero di muoverti', leftEffects: { power: +3 },
      rightText: "Accetta l'accordo", rightEffects: { gold: +12, army: +5, power: -5 },
      minTurn: 2,
    },
    {
      id: 'bronn_arya_contact', tags: ['gold', 'army'], forChars: ['bronn','arya'],
      speaker: "Mercante d'armi", speakerRole: 'Commerciante itinerante',
      portrait: '🗡️', icon: '🗡️',
      text: "Un mercante offre armi di qualità a un prezzo onesto. Con attrezzatura migliore i vostri colpi saranno più letali — ma le risorse scarseggiano.",
      leftText: 'Non ne ho bisogno', leftEffects: { power: +3 },
      rightText: 'Acquista le armi', rightEffects: { gold: -9, army: +10 },
      minTurn: 1,
    },

    // ══════════════════════════════════════════
    // ── GRUPPO C — INTRIGANTI / DIPLOMATICI ──
    // (littlefinger, catelyn, sansa)
    // ══════════════════════════════════════════

    {
      id: 'schemer_rumor', tags: ['power', 'people'], forChars: ['littlefinger','catelyn','sansa'],
      speaker: 'Cortigiana di corte', speakerRole: 'Fonte confidenziale',
      portrait: '🗨️', icon: '🗨️',
      text: "Una voce circola: un vostro avversario ha commesso un'azione imbarazzante. Potete diffonderla discretamente per indebolirlo, ma se vi scoprono il ritorno sarà duro.",
      leftText: 'Troppo rischioso per ora', leftEffects: { power: +3 },
      rightText: 'Diffondi la voce', rightEffects: { power: +10, people: -6, faith: -5 },
      minTurn: 2,
    },
    {
      id: 'schemer_letter', tags: ['power', 'faith'], forChars: ['littlefinger','catelyn','sansa','ned'],
      speaker: 'Messaggero di fiducia', speakerRole: 'Lettera cifrata',
      portrait: '📜', icon: '📜',
      text: "Una lettera intercettata rivela i piani di un rivale. Potete usarla come leva diplomatica o farla recapitare al destinatario originale per guadagnarne la fiducia.",
      leftText: 'Usa la lettera come ricatto', leftEffects: { power: +11, faith: -8 },
      rightText: 'Consegna la lettera — gesto di buona fede', rightEffects: { power: -4, faith: +10, people: +6 },
      minTurn: 3,
    },
    {
      id: 'schemer_alliance_secret', tags: ['power', 'gold'], forChars: ['littlefinger','sansa','catelyn'],
      speaker: 'Agente segreto', speakerRole: 'Incontro in privato',
      portrait: '🤫', icon: '🤫',
      text: "Vi viene proposta un'alleanza segreta — non registrata, non dichiarata. Nessuno lo saprà. I benefici sono reali ma tradirla sarebbe devastante.",
      leftText: 'Rifiuta — le alleanze devono essere oneste', leftEffects: { faith: +8 },
      rightText: "Accetta l'accordo in segreto", rightEffects: { power: +12, gold: +8 },
      minTurn: 4,
    },
    {
      id: 'schemer_court_favor', tags: ['people', 'power'], forChars: ['littlefinger','sansa','catelyn','tyrion'],
      speaker: 'Nobile influente', speakerRole: 'Favore di corte',
      portrait: '🏛️', icon: '🏛️',
      text: "Un nobile influente ha bisogno di un favore discreto. Aiutarlo vi mette in debito con lui — ma crea un alleato potente nelle stanze del potere.",
      leftText: 'Declina — non voglio debiti', leftEffects: { power: -4 },
      rightText: 'Aiuta il nobile', rightEffects: { power: +10, gold: -8, people: +6 },
      minTurn: 3,
    },

    // ══════════════════════════════════════════
    // ── MELISANDRE — carte specifiche extra ──
    // ══════════════════════════════════════════

    {
      id: 'mel_sermon', tags: ['faith', 'people'], forChars: ['melisandre'],
      speaker: 'Folla di fedeli', speakerRole: 'Raduno al fuoco',
      portrait: '🕯️', icon: '🕯️',
      text: "Centinaia di persone si radunano ad ascoltare le vostre parole su R'hllor. Un sermone potente può convertire molti — ma spingere troppo alienherà chi non crede.",
      leftText: 'Sermone moderato', leftEffects: { faith: +9, people: +5 },
      rightText: 'Predica il fuoco eterno', rightEffects: { faith: +14, people: -8 },
      minTurn: 1,
    },
    {
      id: 'mel_sacrifice_ritual', tags: ['faith', 'army'], forChars: ['melisandre'],
      speaker: 'Sacerdote Rosso', speakerRole: 'Rito sacro',
      portrait: '🔥', icon: '🔥',
      text: "Un rituale di fuoco potrebbe rafforzare il legame con R'hllor. I soldati lo temono e venerano insieme. Ma il fumo dei roghi spaventa il popolo.",
      leftText: 'Rito silenzioso e privato', leftEffects: { faith: +8 },
      rightText: 'Rito pubblico e spettacolare', rightEffects: { faith: +12, army: +7, people: -9 },
      minTurn: 2,
    },
    {
      id: 'mel_doubt', tags: ['faith', 'power'], forChars: ['melisandre'],
      speaker: 'Voce interiore', speakerRole: 'Momento di dubbio',
      portrait: '🌒', icon: '🌒',
      text: "Le fiamme mostrano immagini contraddittorie. Forse avete interpretato male il volere di R'hllor. Ammettere il dubbio vi rende umani — ma scuote la fede di chi vi segue.",
      leftText: 'La fede non conosce dubbi', leftEffects: { faith: +10, people: -5 },
      rightText: 'Rifletti e ricalibra', rightEffects: { faith: -8, power: +9, people: +7 },
      minTurn: 5,
    },
    {
      id: 'mel_convert_lord', tags: ['faith', 'power'], forChars: ['melisandre'],
      speaker: 'Lord scettico', speakerRole: 'Udienza privata',
      portrait: '🕯️', icon: '🕯️',
      text: "Un lord potente è curioso di R'hllor ma non ancora convinto. Convertirlo porterebbe enormi benefici politici — ma fallire potrebbe costarvi un alleato.",
      leftText: 'Non forzare la conversione', leftEffects: { power: +5 },
      rightText: 'Tenta la conversione', rightEffects: { faith: +10, power: +10, army: -5 },
      minTurn: 4,
    },

    // ══════════════════════════════════════════
    // ── JON SNOW — carte extra specifiche ──
    // ══════════════════════════════════════════

    {
      id: 'jon_dragonglass', tags: ['army', 'faith'], forChars: ['jon'],
      speaker: 'Sam Tarly', speakerRole: 'Ricercatore della Confraternita',
      portrait: '🗿', icon: '🗿',
      text: "Sam ha trovato un deposito di ossidiana (dragonglass) nelle caverne di Dragonstone. Raccoglierlo richiede risorse e rischia di irritare Daenerys — ma è l'unica arma contro i Non Morti.",
      leftText: 'Aspetta il permesso', leftEffects: { faith: +5 },
      rightText: 'Preleva il dragonglass', rightEffects: { army: +13, gold: -10, power: -5 },
      minTurn: 5,
    },
    {
      id: 'jon_crow_discipline', tags: ['army', 'people'], forChars: ['jon'],
      speaker: 'Fratello Nero', speakerRole: 'Guardiano della Notte',
      portrait: '❄️', icon: '❄️',
      text: "Due fratelli neri litigano violentemente. Come comandante dovete intervenire — punire duramente mantiene la disciplina, ma clemenza guadagna lealtà.",
      leftText: 'Punizione esemplare', leftEffects: { army: +8, people: -7 },
      rightText: 'Risolvi con clemenza', rightEffects: { people: +10, faith: +6, army: -3 },
      minTurn: 2,
    },

    // ══════════════════════════════════════════
    // ── OBERYN — carte extra specifiche ──
    // ══════════════════════════════════════════

    {
      id: 'oberyn_poison_expertise', tags: ['army', 'power'], forChars: ['baelish'],
      speaker: 'Ellaria Sand', speakerRole: 'Compagna e alleata',
      portrait: '🐍', icon: '🐍',
      text: "Le Sabbie del Serpente hanno preparato un veleno raro. Usarlo contro un comandante nemico indebolirebbe le sue truppe prima della battaglia. Morale e politica però potrebbero soffrirne.",
      leftText: 'Troppo disonorevole', leftEffects: { faith: +8 },
      rightText: 'Usa il veleno', rightEffects: { army: +11, power: +8, faith: -10 },
      minTurn: 3, rightTags: ['poison_intrigue'],
    },
    {
      id: 'oberyn_spear_training', tags: ['army', 'people'], forChars: ['baelish'],
      speaker: 'Capitano dorniano', speakerRole: 'Addestramento delle truppe',
      portrait: '🏜️', icon: '🏜️',
      text: "I vostri guerrieri di Dorne sono veloci ma mancano di coordinazione. Un mese di addestramento intensivo li renderà formidabili — ma li terrete lontani dai loro villaggi.",
      leftText: 'Addestramento leggero', leftEffects: { army: +5, people: +3 },
      rightText: 'Addestramento duro — dorniani implacabili', rightEffects: { army: +13, people: -7, gold: -8 },
      minTurn: 2,
    },

    // ══════════════════════════════════════════
    // ── UNIVERSALI NUOVI — neutri per tutti ──
    // (rimpiazzano le carte regnanti che erano troppo specifiche)
    // ══════════════════════════════════════════

    {
      id: 'universal_winter_supply', tags: ['gold', 'army'],
      speaker: 'Mercante', speakerRole: 'Approvvigionamento invernale',
      portrait: '❄️', icon: '❄️',
      text: "L'inverno avanza e i rifornimenti scarseggiano. Potete pagare ora a prezzi alti per assicurare provviste, oppure rischiare la penuria nelle settimane più dure.",
      leftText: 'Risparmia ora, rischi dopo', leftEffects: { army: -5, people: -4 },
      rightText: 'Acquista i rifornimenti', rightEffects: { gold: -11, army: +8, people: +6 },
      minTurn: 1,
    },
    {
      id: 'universal_stranger_help', tags: ['people', 'faith'],
      speaker: 'Viandante ferito', speakerRole: 'Incontro sulla strada',
      portrait: '🛤️', icon: '🛤️',
      text: "Un viandante ferito chiede aiuto. Potete fermarvі a soccorrerlo — perdendo tempo e risorse — oppure continuare per la vostra strada.",
      leftText: 'Non puoi fermarti', leftEffects: { faith: -7 },
      rightText: 'Aiuta il viandante', rightEffects: { people: +9, faith: +9, gold: -5 },
      minTurn: 1,
    },
    {
      id: 'universal_deserter', tags: ['army', 'power'],
      speaker: 'Ufficiale', speakerRole: 'Rapporto militare',
      portrait: '🏃', icon: '🏃',
      text: "Tre soldati sono disertati. Potete inseguirli e punirli duramente come deterrente, o lasciarli andare e concentrarvi su chi è rimasto.",
      leftText: 'Lasciali andare', leftEffects: { army: -4, people: +5 },
      rightText: 'Punisci la diserzione', rightEffects: { army: +7, people: -6, power: +5 },
      minTurn: 3,
    },
    {
      id: 'universal_old_enemy', tags: ['power', 'faith'],
      speaker: 'Vecchio rivale', speakerRole: 'Incontro inaspettato',
      portrait: '👁️', icon: '👁️',
      text: "Un vecchio nemico vi incrocia in un momento inaspettato. Potete tentare una riconciliazione — rischiosa ma potenzialmente preziosa — o tenerlo a distanza.",
      leftText: 'Mantieni le distanze', leftEffects: { power: +4, army: +3 },
      rightText: 'Tendi la mano della pace', rightEffects: { power: +9, people: +7, faith: +5 },
      minTurn: 5,
    },
    {
      id: 'universal_spy_caught', tags: ['power', 'army'],
      speaker: 'Guardia fidata', speakerRole: 'Arresto',
      portrait: '🔍', icon: '🔍',
      text: "Avete sorpreso qualcuno a spiarvi. Non sapete ancora per chi lavori. Potete interrogarlo — ottenendo informazioni preziose — o eliminarlo immediatamente.",
      leftText: 'Elimina la minaccia', leftEffects: { power: +5, faith: -5 },
      rightText: 'Interroga e sfrutta', rightEffects: { power: +12, army: +5, gold: -6 },
      minTurn: 4,
    },
    {
      id: 'universal_dream_omen', tags: ['faith', 'power'],
      speaker: 'Sogno', speakerRole: 'Visione notturna',
      portrait: '🌙', icon: '🌙',
      text: "Un sogno vivido vi sveglia nel cuore della notte. Interpretarlo come presagio positivo dà forza ai vostri uomini. Ignorarlo mantiene la razionalità.",
      leftText: 'Era solo un sogno', leftEffects: { power: +4 },
      rightText: "Annuncia l'omen ai tuoi", rightEffects: { faith: +11, people: +6, power: -4 },
      minTurn: 2,
    },
  ];

  // ══════════════════════════════════════════════
  // POSSIBLE KINGS (for the starting state)
  // Each king has a houseAffiliation = which HOUSES_DEF id they belong to
  // so we can avoid giving them as king when the player IS that character
  // ══════════════════════════════════════════════
  const POSSIBLE_KINGS = [
    { id: 'joffrey', name: 'Re Joffrey Baratheon', house: 'Lannister-Baratheon', icon: '👑', houseAffiliation: 'Lannister', army: 70 },
    { id: 'stannis', name: 'Stannis Baratheon',     house: 'Baratheon',           icon: '🦌', houseAffiliation: 'Baratheon', army: 65 },
    { id: 'robb',    name: 'Robb Stark',            house: 'Stark',               icon: '🐺', houseAffiliation: 'Stark',     army: 75 },
    { id: 'mace',    name: 'Mace Tyrell (Reggente)',house: 'Tyrell',               icon: '🌹', houseAffiliation: 'Tyrell',    army: 60 },
    { id: 'tommen',  name: 'Re Tommen Baratheon',   house: 'Lannister',           icon: '🦁', houseAffiliation: 'Lannister', army: 65 },
    { id: 'balon',   name: 'Balon Greyjoy',         house: 'Greyjoy',             icon: '🐙', houseAffiliation: 'Greyjoy',   army: 55 },
    { id: 'doran',   name: 'Doran Martell',         house: 'Martell',             icon: '☀️', houseAffiliation: 'Martell',   army: 50 },
  ];

  // Characters who can stage a coup mid-game and become new king
  const COUP_PRETENDERS = [
    { id: 'daenerys_coup', name: 'Daenerys Targaryen', icon: '🐉', house: 'Targaryen',
      flavor: 'I draghi hanno bruciato le porte di Approdo del Re. Daenerys Targaryen siede sul Trono di Spade.',
      allies: ['Tyrell'], enemies: ['Lannister', 'Baratheon'] },
    { id: 'cersei_coup',   name: 'Cersei Lannister',   icon: '🦁', house: 'Lannister',
      flavor: 'Con Fuoco Selvatico e veleno, Cersei ha eliminato ogni rivale e incoronato sé stessa Regina.',
      allies: ['Lannister', 'Frey'], enemies: ['Stark', 'Baratheon', 'Tyrell'] },
    { id: 'stannis_coup',  name: 'Stannis Baratheon',  icon: '🦌', house: 'Baratheon',
      flavor: 'Stannis ha marciato su Approdo del Re. Il diritto è il diritto: il Trono spetta a lui.',
      allies: ['Baratheon'], enemies: ['Lannister', 'Tyrell'] },
    { id: 'robb_coup',     name: 'Robb Stark',         icon: '🐺', house: 'Stark',
      flavor: 'Il Re del Nord ha sfondato le porte del Sud. I Lannister sono stati spodestati.',
      allies: ['Stark', 'Tully'], enemies: ['Lannister', 'Frey'] },
    { id: 'margaery_coup', name: 'Margaery Tyrell',    icon: '🌹', house: 'Tyrell',
      flavor: 'Con intrighi e oro, la Rosa ha scalato il trono. I Tyrell reggono ora i Sette Regni.',
      allies: ['Tyrell'], enemies: ['Lannister'] },
    { id: 'balon_coup',    name: 'Balon Greyjoy',      icon: '🐙', house: 'Greyjoy',
      flavor: 'Le Isole di Ferro hanno invaso il continente. Balon Greyjoy si proclama Re di tutti.',
      allies: ['Greyjoy'], enemies: ['Stark', 'Lannister', 'Tully'] },
  ];

  // ══════════════════════════════════════════════
  // HOUSE ARMY TICK — armies grow/shrink each turn
  // ══════════════════════════════════════════════
  function tickHouseArmies() {
    if (!state.turn || state.turn % 1 !== 0) return; // every turn
    const BASE_ARMIES = { Stark: 60, Lannister: 75, Tyrell: 65, Baratheon: 55, Tully: 45, Martell: 50, Greyjoy: 55, Frey: 40 };
    Object.entries(state.houses).forEach(([hId, h]) => {
      if (h.suppressed) return;
      const base = BASE_ARMIES[hId] || 50;
      // Small random drift: ±1 to ±3 each turn, mean-reverting toward base
      const drift = (Math.random() * 4 - 2); // -2 to +2
      const pull  = (base - h.army) * 0.04;  // gentle pull back to base
      h.army = Math.max(15, Math.min(120, Math.round(h.army + drift + pull)));
    });

    // King army also drifts upward (always stays strong)
    if (!state.isPlayerKing) {
      const kingBase = 75;
      const kingDrift = (Math.random() * 3 - 0.5); // slight positive bias
      const kingPull  = (kingBase - (state.kingArmy || 75)) * 0.05;
      state.kingArmy = Math.max(60, Math.min(140, Math.round((state.kingArmy || 75) + kingDrift + kingPull)));
    }
  }

  // ══════════════════════════════════════════════
  // ALLIANCE REJECTION MEMORY
  // Tracks repeated alliance requests to same house
  // ══════════════════════════════════════════════
  function recordAllianceRejection(hId) {
    if (!state.allianceRejections) state.allianceRejections = {};
    if (!state.allianceRejections[hId]) {
      state.allianceRejections[hId] = { count: 0, lastTurn: 0 };
    }
    const rec = state.allianceRejections[hId];
    rec.count++;
    rec.lastTurn = state.turn;
    const h = state.houses[hId];
    if (!h) return;

    // 1st rejection: no extra effect (normal)
    // 2nd rejection within 10 turns: annoyed toast warning
    // 3rd+ rejection: becomes enemy
    if (rec.count === 2 && (state.turn - rec.lastTurn) <= 12) {
      showToast(`😤 Casa ${h.name} è irritata dalle vostre continue richieste. Un altro tentativo potrebbe renderli nemici.`, 'warn');
      state.eventQueue.unshift({
        id: 'alliance_annoyance_' + hId,
        speaker: `Casa ${h.name}`,
        speakerRole: 'Messaggero indispettito',
        portrait: h.icon, icon: h.icon,
        text: `«Avete già bussato alla nostra porta. Questa insistenza è offensiva. Smettetela, o vi considereremo un fastidio da eliminare.»`,
        leftText: 'Ci scusiamo', leftEffects: { power: -5 },
        rightText: 'Ignoriamo l\'avvertimento', rightEffects: { power: +3 },
        tags: ['alliance_annoyance'],
        // No house change yet — just a warning
      });
    } else if (rec.count >= 3) {
      if (state.turn - rec.lastTurn <= 20) {
        h.status = 'enemy';
        showToast(`⚔ Casa ${h.name} vi ha dichiarato nemici per la vostra insistenza!`, 'warn');
        rec.count = 0; // reset after becoming enemy
      }
    }
  }

  function checkAllianceRejectionAnger() {
    // Nothing to check — handled reactively in ravenAction
  }

  // ══════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════
  function countAllies(s) {
    return Object.values(s.houses).filter(h => h.status === 'ally').length;
  }

  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  // clamp does NOT prevent 0 or 100 — those trigger game over
  function clamp(v, min = 0, max = 100) { return Math.max(min, Math.min(max, Math.round(v))); }

  function showToast(msg, type = '') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show' + (type ? ' toast-' + type : '');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.className = 'toast hidden'; }, 2800);
  }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.style.display = 'none';
      s.style.opacity = '0';
    });
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = 'flex';
    requestAnimationFrame(() => {
      el.classList.add('active');
      el.style.opacity = '1';
    });
  }

  // ══════════════════════════════════════════════
  // SCREEN: CHARACTER SELECT
  // ══════════════════════════════════════════════
  function showCharacterSelect() {
    showScreen('screen-char-select');
    const grid = document.getElementById('char-grid');
    grid.innerHTML = '';
    CHARACTERS.forEach(c => {
      const card = document.createElement('div');
      card.className = 'char-card';
      card.innerHTML = `
        <span class="char-card-icon">${c.icon}</span>
        <span class="char-card-name">${c.name}</span>
        <span class="char-card-house">${c.house}</span>
        <span class="char-card-diff diff-${c.difficulty}">${c.difficulty === 'easy' ? 'Facile' : c.difficulty === 'medium' ? 'Medio' : 'Difficile'}</span>
      `;
      card.addEventListener('click', () => selectCharacter(c.id));
      grid.appendChild(card);
    });
  }

  function selectCharacter(charId) {
    const char = CHARACTERS.find(c => c.id === charId);
    if (!char) return;
    initState(char);
    buildPrologue(char);
    showScreen('screen-prologue');
  }

  // ══════════════════════════════════════════════
  // STATE INIT
  // ══════════════════════════════════════════════
  function initState(char) {
    // Pick a king whose house doesn't overlap with the player's own house
    // Also exclude the player character themselves if they appear as a king
    const validKings = POSSIBLE_KINGS.filter(k => {
      // Don't pick a king from the player's allied houses (would be incoherent)
      if (char.startAllies.includes(k.houseAffiliation)) return false;
      // Don't pick if king id matches player char id
      if (k.id === char.id) return false;
      return true;
    });
    const king = rand(validKings.length > 0 ? validKings : POSSIBLE_KINGS);

    const houses = {};
    HOUSES_DEF.forEach(h => {
      let status = 'neutral';
      if (char.startAllies.includes(h.id)) status = 'ally';
      if (char.startEnemies.includes(h.id)) status = 'enemy';

      // If a house is affiliated with the king, make it lean enemy
      // unless the player already has it as ally
      if (king.houseAffiliation === h.id && status === 'neutral') {
        status = 'enemy';
      }

      houses[h.id] = {
        name: h.name, icon: h.icon, region: h.region,
        army: h.baseArmy + Math.floor(Math.random() * 20) - 10,
        status,
      };
    });

    // Generate world alliances between other houses (not involving player)
    // 1-2 random neutral houses secretly allied with each other (flavor only, stored for prologue)
    const neutralHouses = HOUSES_DEF.filter(h =>
      !char.startAllies.includes(h.id) &&
      !char.startEnemies.includes(h.id) &&
      h.id !== king.houseAffiliation
    );
    const worldAlliances = [];
    if (neutralHouses.length >= 2) {
      const shuffled = neutralHouses.sort(() => Math.random() - 0.5).slice(0, 3);
      worldAlliances.push(...shuffled.map(h => h.name));
    }

    state = {
      character: char,
      turn: 1,
      resources: { ...char.startResources },
      houses,
      king: king.id,
      kingName: king.name,
      kingHouse: king.house,
      kingHouseAffiliation: king.houseAffiliation,
      kingArmy: king.army + Math.floor(Math.random() * 15),
      isPlayerKing: false,
      playerBecameKingTurn: null,
      worldAlliances,
      decisionHistory: [],
      eventQueue: [],
      gameOver: false,
      ravenTarget: null,
      usedEvents: [],
      coupScheduled: false,
      aryaList: char.id === 'arya' ? JSON.parse(JSON.stringify(ARYA_LIST)) : null,
      faithHighTurns: 0,
    };
  }

  // ══════════════════════════════════════════════
  // PROLOGUE GENERATION
  // ══════════════════════════════════════════════
  function buildPrologue(char) {
    const king = POSSIBLE_KINGS.find(k => k.id === state.king);
    const playerAllies = char.startAllies.length > 0
      ? char.startAllies.join(', ')
      : 'nessuna casata — siete soli';
    const playerEnemies = char.startEnemies.length > 0
      ? char.startEnemies.join(', ')
      : 'nessun nemico dichiarato';

    // World alliances = houses that backed the king + other neutral pacts
    const kingAllies = HOUSES_DEF
      .filter(h => h.id === state.kingHouseAffiliation)
      .map(h => h.name);
    const otherPacts = state.worldAlliances || [];
    const worldPactText = [...kingAllies, ...otherPacts].slice(0, 3).join(', ') || 'le casate minori';

    const prologues = [
      `<p>L'inverno si avvicina. Il regno è diviso da anni di guerra e intrighi. Sul Trono di Spade siede <strong>${king.name}</strong>, sostenuto da <strong>${worldPactText}</strong>.</p><p>Le casate del Nord mormorano di secessione. Le voci di tradimento si moltiplicano ogni giorno che passa.</p>`,
      `<p>Approdo del Re brucia di voci e complotti. <strong>${king.name}</strong> regna con mano di ferro, con l'appoggio di <strong>${worldPactText}</strong>. Ma le casse del regno si svuotano e il popolo soffre.</p><p>In questo clima di crisi, chi saprà muoversi nell'ombra potrà cambiare il destino dei Sette Regni.</p>`,
      `<p>Da Approdo del Re alle Isole di Ferro, il sussurro è lo stesso: il regno vacilla. <strong>${king.name}</strong> siede sul Trono di Spade, affiancato da <strong>${worldPactText}</strong>, ma la sua presa si allenta ogni giorno.</p><p>In questo vuoto di potere, il momento per agire è adesso.</p>`,
    ];

    document.getElementById('prologue-title').textContent = `Il Destino di ${char.name}`;
    document.getElementById('prologue-text').innerHTML = `
      ${rand(prologues)}
      <p>Voi siete <strong>${char.name}</strong> della <strong>${char.house}</strong>. ${char.flavor}</p>
      <p>Le vostre alleanze: <strong>${playerAllies}</strong>. I vostri nemici: <strong>${playerEnemies}</strong>.</p>
      <p><em>📜 Obiettivo: ${char.objective}</em></p>
    `;
  }

  // ══════════════════════════════════════════════
  // GAME START
  // ══════════════════════════════════════════════
  function startGame() {
    showScreen('screen-game');
    updateHUD();
    drawNextCard();
    initSwipe();
    saveGame();
    if (typeof AudioManager !== 'undefined') AudioManager.playMain();
  }

  // ══════════════════════════════════════════════
  // HUD UPDATE
  // ══════════════════════════════════════════════
  function updateHUD() {
    const r = state.resources;
    const char = state.character;
    const cap = getResourceCap();

    document.getElementById('hud-char-icon').textContent = char.icon;
    document.getElementById('hud-char-name').textContent = char.name.split(' ')[0];
    document.getElementById('hud-turn').textContent = state.turn;
    if (char.id === 'arya') {
      renderAryaListInObjective();
    } else if (char.id === 'melisandre') {
      const turns = state.faithHighTurns || 0;
      document.getElementById('objective-text').textContent =
        `Il Fuoco Eterno: Fede ≥85 per ${turns}/20 turni consecutivi (attuale: ${state.resources.faith})`;
    } else {
      document.getElementById('objective-text').textContent = char.objective;
    }

    // Circumference of gauge circle: 2 * π * 18 ≈ 113.1
    const CIRC = 113.1;
    const gauges = {
      gold:   'bar-gold',
      faith:  'bar-faith',
      people: 'bar-people',
      army:   'bar-army',
      power:  'bar-power',
    };
    const vals = {
      gold:   'val-gold',
      faith:  'val-faith',
      people: 'val-people',
      army:   'val-army',
      power:  'val-power',
    };

    Object.keys(gauges).forEach(key => {
      const raw = Math.max(0, Math.min(cap, r[key]));
      const pct = raw / cap;
      const offset = CIRC - pct * CIRC;

      const arc = document.getElementById(gauges[key]);
      if (arc) arc.style.strokeDashoffset = offset.toFixed(2);

      const loanNote = key === 'army' && state.loanedArmy ? `+${state.loanedArmy}` : '';
      const valEl = document.getElementById(vals[key]);
      if (valEl) valEl.textContent = loanNote
        ? `${Math.round(raw)}(${loanNote})/${cap}`
        : `${Math.round(raw)}/${cap}`;
    });

    // Show cap badge if expanded
    if ((state.conquests || 0) > 0) {
      let capBadge = document.getElementById('cap-badge');
      if (!capBadge) {
        capBadge = document.createElement('div');
        capBadge.id = 'cap-badge';
        capBadge.style.cssText = 'position:fixed;top:4.5rem;right:0.5rem;background:rgba(74,222,128,0.15);border:1px solid rgba(74,222,128,0.4);border-radius:4px;font-family:Cinzel,serif;font-size:0.62rem;color:#4ade80;padding:0.2rem 0.4rem;z-index:50;letter-spacing:0.05em';
        document.body.appendChild(capBadge);
      }
      capBadge.textContent = `🏰 Cap: ${cap} (×${(state.conquests||0)+1})`;
    }
  }

  // ══════════════════════════════════════════════
  // CARD LOGIC
  // ══════════════════════════════════════════════
  let currentCard = null;

  function drawNextCard() {
    // ── Queue throne legitimacy event if player became king ──
    if (state.isPlayerKing && state._legitimacyQueued && state.turn >= state._legitimacyQueued
        && !state.usedEvents.includes('throne_legitimacy')) {
      state.eventQueue.push({ ...THRONE_LEGITIMACY_EVENT });
      state.usedEvents.push('throne_legitimacy');
      state._legitimacyQueued = null;
    }

    // ── Check for random coup every turn after turn 15 ──
    if (state.turn >= 15 && !state.coupScheduled) {
      // ~4% chance per turn of a coup happening, higher if player is weak
      const coupBase = 0.04;
      const weakBonus = state.resources.power < 30 ? 0.03 : 0;
      if (Math.random() < coupBase + weakBonus) {
        state.coupScheduled = true;
        scheduleCoup();
      }
    }

    // ── Check enemy tribute demands & pact calls each turn ──
    checkEnemyTributeDemands();
    checkActivePactCalls();
    checkAllyResourceRequests();

    // ── Update house armies each turn (slow drift) ──
    tickHouseArmies();

    // ── Check alliance rejection anger ──
    checkAllianceRejectionAnger();

    // ── Update threat banners if active ──
    if (state.activeThreats) {
      Object.entries(state.activeThreats).forEach(([hId, threat]) => {
        const h = state.houses[hId];
        if (h) {
          const remaining = threat.attackTurn - state.turn;
          if (remaining > 0) showThreatBanner(h, remaining);
        }
      });
    }

    // Check event queue first
    if (state.eventQueue.length > 0) {
      currentCard = state.eventQueue.shift();
      renderCard(currentCard);
      return;
    }

    // Filter valid events
    const charId = state.character.id;
    const available = EVENTS.filter(e => {
      // maxUses: carta può uscire N volte invece di 1
      const timesUsed = state.decisionHistory.filter(d => d.eventId === e.id).length;
      const maxUses = e.maxUses || 1;
      if (timesUsed >= maxUses) return false;
      // carte one-shot già usate
      if (maxUses === 1 && state.usedEvents.includes(e.id)) return false;
      if (e.minTurn && state.turn < e.minTurn) return false;
      if (e.maxTurn && state.turn > e.maxTurn) return false;
      if (e.requiresTag && !state.decisionHistory.some(d => d.tags?.includes(e.requiresTag))) return false;
      // Character whitelist: if forChars is set, only show to those characters
      if (e.forChars && !e.forChars.includes(charId)) return false;
      // Character blacklist: never show to these characters
      if (e.excludeChars && e.excludeChars.includes(charId)) return false;
      return true;
    });

    if (available.length === 0) {
      // Reset only generic (non-character-specific) used events
      const genericIds = EVENTS.filter(e => !e.forChars).map(e => e.id);
      state.usedEvents = state.usedEvents.filter(id => !genericIds.includes(id));
      drawNextCard();
      return;
    }

    currentCard = rand(available);
    state.usedEvents.push(currentCard.id);
    renderCard(currentCard);
  }

  function scheduleCoup() {
    // Pick a pretender that is NOT the current king and NOT the player
    const validPretenders = COUP_PRETENDERS.filter(p => {
      if (p.id.replace('_coup','') === state.king) return false;
      if (p.id.replace('_coup','') === state.character.id) return false;
      return true;
    });
    if (validPretenders.length === 0) { state.coupScheduled = false; return; }
    const pretender = rand(validPretenders);

    // Queue a warning card first
    state.eventQueue.push({
      id: 'coup_warning_' + state.turn,
      speaker: 'Spia di corte',
      speakerRole: 'Notizia urgente',
      portrait: '🔔', icon: '🔔',
      text: `Voci sempre più insistenti parlano di un piano di rovesciamento. ${pretender.name} sta radunando forze nell'ombra e potrebbe presto sfidare il trono. Volete prendere misure preventive?`,
      leftText: 'Ignora le voci', leftEffects: {},
      rightText: 'Allerta le guardie', rightEffects: { gold: -10, army: +5 },
      tags: ['coup_warning'],
      onResolve: () => triggerCoup(pretender),
    });
  }

  function triggerCoup(pretender) {
    const oldKingName = state.kingName;
    const char = state.character;

    // Update world state — new king
    state.king = pretender.id.replace('_coup', '');
    state.kingName = pretender.name;
    state.kingHouse = pretender.house;
    state.kingHouseAffiliation = pretender.house;
    state.coupScheduled = false;

    // Update house relationships based on new king's alliances
    pretender.allies.forEach(hId => {
      if (state.houses[hId]) state.houses[hId].status = 'ally'; // ally of king = dangerous
    });
    pretender.enemies.forEach(hId => {
      if (state.houses[hId] && state.houses[hId].status !== 'ally') {
        state.houses[hId].status = 'enemy';
      }
    });

    // If the player had "defeat the king" as objective and new king was their ally → now enemy
    const playerWantedThrone = char.objectiveCheck.toString().includes('defeated_king') ||
                               char.objectiveCheck.toString().includes('king');
    if (playerWantedThrone && pretender.allies.some(a => state.houses[a]?.status === 'ally')) {
      // New king's house was player's ally → now rival for the throne
      const newKingHouse = pretender.allies[0];
      if (state.houses[newKingHouse]) {
        state.houses[newKingHouse].status = 'enemy';
      }
      state.resources.power = clamp(state.resources.power - 10);
    }

    // Show dramatic overlay
    showCoupOverlay(oldKingName, pretender);
  }

  function showCoupOverlay(oldKing, pretender) {
    const overlay = document.createElement('div');
    overlay.className = 'war-overlay';
    overlay.style.background = 'rgba(20, 10, 5, 0.96)';
    overlay.innerHTML = `
      <div style="font-size:3rem">${pretender.icon}</div>
      <div class="war-title" style="font-size:1.4rem">Rovesciamento del Trono!</div>
      <div class="war-log">
        <p><strong>${pretender.name}</strong> ha spodestato <strong>${oldKing}</strong>.</p>
        <br>
        <p style="font-style:italic;color:#e8dcc8">${pretender.flavor}</p>
        <br>
        <p style="font-size:0.85rem;color:#9a8a6a">Le alleanze nel regno si ridisegnano. Verificate la vostra posizione diplomatica.</p>
      </div>
      <button class="btn-primary" style="max-width:220px"
        onclick="this.parentElement.remove();Game.checkAndContinue()">
        Valuta la situazione
      </button>
    `;
    document.body.appendChild(overlay);
  }

  function renderCard(card) {
    const el = document.getElementById('main-card');
    el.className = 'main-card entering';

    document.getElementById('card-speaker-icon').textContent = card.icon || '📜';
    document.getElementById('card-speaker-name').textContent = card.speaker;
    document.getElementById('card-speaker-role').textContent = card.speakerRole;
    document.getElementById('card-portrait').textContent = card.portrait || '📜';
    document.getElementById('card-text').textContent = card.text;

    document.getElementById('choice-left-text').textContent = card.leftText || 'Rifiuta';
    document.getElementById('choice-right-text').textContent = card.rightText || 'Accetta';

    // Effects hidden until player interacts
    updateEffectsPreview('');
  }

  function updateEffectsPreview(side) {
    const container = document.getElementById('card-effects-preview');
    container.innerHTML = '';
    if (!side || !currentCard) return;

    const effects = side === 'left' ? currentCard.leftEffects : currentCard.rightEffects;
    if (!effects) return;

    const labels = { gold: '💰', faith: '✝', people: '👥', army: '⚔', power: '👑' };
    Object.entries(effects).forEach(([key, val]) => {
      if (!labels[key]) return;
      const tag = document.createElement('span');
      tag.className = 'effect-tag ' + (val > 0 ? 'effect-pos' : 'effect-neg');
      tag.textContent = labels[key] + ' ' + (val > 0 ? '+' : '') + val;
      container.appendChild(tag);
    });
  }

  // ══════════════════════════════════════════════
  // CHOICE LOGIC
  // ══════════════════════════════════════════════
  function makeChoice(side) {
    if (state.gameOver || !currentCard) return;

    const effects = side === 'left' ? currentCard.leftEffects : currentCard.rightEffects;
    const tags = side === 'left' ? (currentCard.leftTags || currentCard.tags || []) : (currentCard.rightTags || currentCard.tags || []);

    // Apply effects
    if (effects) {
      Object.entries(effects).forEach(([key, val]) => {
        if (state.resources[key] !== undefined) {
          state.resources[key] = clamp(state.resources[key] + val);
        }
      });
    }

    // Record decision
    state.decisionHistory.push({
      turn: state.turn,
      cardId: currentCard.id,
      eventId: currentCard.id, // for maxUses tracking
      choice: side,
      tags: Array.isArray(tags) ? tags : [tags],
      target: currentCard.target || null,
    });

    // Handle dynamic card callbacks
    if (side === 'left'  && currentCard.onLeftChoose)  currentCard.onLeftChoose();
    if (side === 'right' && currentCard.onRightChoose) currentCard.onRightChoose();
    if (currentCard.onResolve) currentCard.onResolve();

    // Handle Arya hit list kills
    if (currentCard.listTarget && tags.includes('assassination')) {
      const listTarget = currentCard.listTarget;
      // Mark target as done in state
      if (!state.aryaList) state.aryaList = JSON.parse(JSON.stringify(ARYA_LIST));
      const target = state.aryaList.find(t => t.id === listTarget);
      if (target && !target.done) {
        target.done = true;
        // Show kill confirmation overlay after card animates out
        setTimeout(() => showKillConfirmation(target), 400);
      }
    }

    // Check for betrayal
    if (tags.includes('betray_ally')) {
      const betrayedHouses = Object.keys(state.houses).filter(h => state.houses[h].status === 'ally');
      if (betrayedHouses.length > 0) {
        const betrayed = rand(betrayedHouses);
        state.houses[betrayed].status = 'enemy';
        showToast(`⚠ Casa ${betrayed} ti considera ora un traditore!`, 'warn');
        // Queue a consequence card in ~10-20 turns
        state.eventQueue.push({
          id: 'betrayal_consequence_' + state.turn,
          speaker: `Portavoce di Casa ${betrayed}`,
          speakerRole: 'Messaggero arrabbiato',
          portrait: '📩', icon: '📩',
          text: `«Avevamo fiducia in voi. Al turno ${state.turn} ci avete tradito. Ora subirete le conseguenze.»`,
          leftText: 'Scusarti umilmente', leftEffects: { power: -14, gold: -14 },
          rightText: 'Ignorarli', rightEffects: { army: -14, people: -10 },
          minTurn: state.turn + 10,
          tags: ['betray_consequence'],
        });
      }
    }

    // Animate card out
    const el = document.getElementById('main-card');
    el.classList.add(side === 'left' ? 'swipe-left' : 'swipe-right');

    state.turn++;

    // Melisandre tracker: count consecutive turns with faith >= 85
    if (state.character.id === 'melisandre') {
      if (state.resources.faith >= 85) {
        state.faithHighTurns = (state.faithHighTurns || 0) + 1;
      } else {
        state.faithHighTurns = 0;
      }
    }

    // Wait for swipe-out transition (0.38s), then load next card
    setTimeout(() => {
      el.style.transition = 'none';
      el.classList.remove('swipe-left', 'swipe-right');
      el.style.transform = '';
      el.style.opacity = '1';
      // Force reflow before re-enabling transitions
      void el.offsetWidth;
      el.style.transition = '';

      checkGameOver();
      if (!state.gameOver) {
        updateHUD();
        drawNextCard();
        saveGame();
      }
    }, 420);
  }

  // ══════════════════════════════════════════════
  // CHOICE EFFECTS POPUP
  // ══════════════════════════════════════════════
  function showChoiceEffectsPopup(side, effects) {
    if (!effects || Object.keys(effects).length === 0) return;

    const labels = { gold: 'Tesoro', faith: 'Fede', people: 'Popolo', army: 'Esercito', power: 'Potere' };
    const icons  = { gold: '💰', faith: '✝', people: '👥', army: '⚔', power: '👑' };
    const choiceLabel = side === 'left'
      ? (currentCard?.leftText  || 'Rifiuta')
      : (currentCard?.rightText || 'Accetta');

    const entries = Object.entries(effects).filter(([k]) => labels[k]);
    if (entries.length === 0) return;

    const rows = entries.map(([k, v]) => {
      const pos   = v > 0;
      const color = pos ? '#4ade80' : '#f87171';
      const bg    = pos ? 'rgba(74,222,128,0.10)' : 'rgba(248,113,113,0.10)';
      const border= pos ? 'rgba(74,222,128,0.35)' : 'rgba(248,113,113,0.35)';
      const arrow = pos ? '▲' : '▼';
      return `
        <div style="
          display:flex;align-items:center;justify-content:space-between;
          padding:0.7rem 1rem;margin-bottom:0.4rem;
          background:${bg};border:1px solid ${border};border-radius:5px;
        ">
          <span style="font-family:'Cinzel',serif;font-size:0.95rem;color:#e8dcc8;letter-spacing:0.04em">
            ${icons[k]}&nbsp;&nbsp;${labels[k]}
          </span>
          <span style="font-family:'Cinzel Decorative',serif;font-size:1.2rem;font-weight:900;color:${color}">
            ${arrow}&nbsp;${pos ? '+' : ''}${v}
          </span>
        </div>`;
    }).join('');

    // Inject keyframes once
    if (!document.getElementById('popup-anim-style')) {
      const s = document.createElement('style');
      s.id = 'popup-anim-style';
      s.textContent = `
        @keyframes popupIn {
          0%   { opacity:0; transform:translateY(18px) scale(0.93); }
          70%  { transform:translateY(-3px) scale(1.01); }
          100% { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes popupOut {
          from { opacity:1; transform:scale(1); }
          to   { opacity:0; transform:scale(0.94) translateY(10px); }
        }
        @keyframes progressBar {
          from { width:100%; }
          to   { width:0%; }
        }
      `;
      document.head.appendChild(s);
    }

    const existing = document.getElementById('choice-effects-popup');
    if (existing) existing.remove();

    const DISPLAY_MS = 3200;

    const popup = document.createElement('div');
    popup.id = 'choice-effects-popup';
    popup.style.cssText = `
      position:fixed;inset:0;z-index:400;
      display:flex;align-items:center;justify-content:center;
      background:rgba(0,0,0,0.55);
      backdrop-filter:blur(2px);
    `;
    popup.innerHTML = `
      <div style="
        background:rgba(10,8,16,0.98);
        border:2px solid rgba(201,168,76,0.55);
        border-radius:8px;
        width:90%;max-width:370px;
        padding:1.6rem 1.4rem 1.2rem;
        font-family:'Cinzel',serif;
        box-shadow:0 12px 60px rgba(0,0,0,0.85), 0 0 30px rgba(201,168,76,0.12);
        animation:popupIn 0.32s cubic-bezier(.22,.68,0,1.2) forwards;
      ">
        <!-- Header -->
        <div style="
          font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;
          color:#9a8a6a;margin-bottom:0.45rem;
        ">Conseguenze della scelta</div>

        <!-- Choice label -->
        <div style="
          font-family:'EB Garamond',serif;font-size:1rem;color:#c9a84c;
          font-style:italic;line-height:1.4;
          border-bottom:1px solid rgba(201,168,76,0.25);
          padding-bottom:0.7rem;margin-bottom:0.9rem;
        ">«${choiceLabel}»</div>

        <!-- Resource rows -->
        ${rows}

        <!-- Progress bar + hint -->
        <div style="margin-top:1rem">
          <div style="height:2px;background:rgba(201,168,76,0.15);border-radius:2px;overflow:hidden">
            <div style="
              height:100%;background:rgba(201,168,76,0.5);border-radius:2px;
              animation:progressBar ${DISPLAY_MS}ms linear forwards;
            "></div>
          </div>
          <div style="text-align:center;margin-top:0.45rem;font-size:0.62rem;color:#4a3f2e;letter-spacing:0.08em">
            Tocca per continuare
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    const dismiss = () => {
      const inner = popup.querySelector('div');
      if (inner) inner.style.animation = 'popupOut 0.18s ease forwards';
      setTimeout(() => popup.remove(), 180);
    };
    const timer = setTimeout(dismiss, DISPLAY_MS);
    popup.addEventListener('click', () => { clearTimeout(timer); dismiss(); });
  }

  // ══════════════════════════════════════════════
  // RESOURCE CAP — dynamic, grows +100 per conquest
  // ══════════════════════════════════════════════
  function getResourceCap() {
    return 100 + (state.conquests || 0) * 100;
  }

  // clamp using dynamic cap
  function clampRes(v) {
    return Math.max(0, Math.min(getResourceCap(), Math.round(v)));
  }

  // ══════════════════════════════════════════════
  // GAME OVER CHECK — min (≤0) AND max (≥cap)
  // ══════════════════════════════════════════════
  function checkGameOver() {
    const r    = state.resources;
    const char = state.character;
    const cap  = getResourceCap();
    const id   = char.id;

    // ── Categorie ────────────────────────────────────────────
    // Regnanti / pretendenti al trono
    const isRuler     = ['daenerys','cersei','stannis','robb'].includes(id) || state.isPlayerKing;
    // Nobili di casata
    const isNoble     = ['tyrion','ned','catelyn','sansa','margaery','olenna','jaime'].includes(id);
    // Assassini / intriganti
    const isShadow    = ['arya','littlefinger'].includes(id);
    // Mistici / religiosi
    const isReligious = ['melisandre'].includes(id);
    // Guerrieri / mercenari / popolo libero
    const isFighter   = ['bronn','theon','tormund','baelish'].includes(id); // baelish = Oberyn

    // Seleziona testo per categoria (fallback su noble)
    function byRole(ruler, noble, shadow, religious, fighter) {
      if (isRuler)     return ruler;
      if (isNoble)     return noble;
      if (isShadow)    return shadow;
      if (isReligious) return religious;
      if (isFighter)   return fighter;
      return noble;
    }

    // ── TESORO a 0 ───────────────────────────────────────────
    if (r.gold <= 0) {
      return triggerEnd(false, '💸', 'Le Casse Sono Vuote',
        byRole(
          `Il tesoro reale è esaurito fino all'ultimo Stag. I mercenari hanno abbandonato le file reclamando paghe arretrate. Il Gran Consiglio ha votato la deposizione: un regnante senza oro non regna. Il vostro nome resterà come monito ai sovrani avidi.`,
          `Le finanze della casata sono collassate. ${char.name} non può più pagare cavalieri né servitori. I creditori bussano alla porta, le alleanze si sciolgono. Senza oro, un nobile non è che un uomo con un titolo vuoto.`,
          `Senza oro non si comprano informatori, veleni né passaggi sicuri. ${char.name} si ritrova esposta e vulnerabile. Il nemico che aspettava il momento giusto l'ha trovato — la lista è rimasta incompiuta.`,
          `L'oro è terra, non spirito. Eppure senza di esso nemmeno la profezia può nutrire i fedeli di R'hllor. I convertiti si disperdono, le fiamme si spengono. Il Signore della Luce non parla ai sacerdoti in miseria.`,
          `${char.name} ha vissuto come se l'oro crescesse sugli alberi. I compagni si sono venduti al miglior offerente. Soli e al verde, il viaggio finisce in un vicolo buio, senza gloria né memoria.`
        )
      );
    }

    // ── TESORO al massimo ────────────────────────────────────
    if (r.gold >= cap) {
      return triggerEnd(false, '🏦', "L'Avidità del Drago",
        byRole(
          `Le casse traboccano ma non avete ridistribuito nulla. La Banca di Ferro ha finanziato una coalizione di rivali. Un colpo di stato ben orchestrato vi ha strappato il trono — pagato con il vostro stesso oro.`,
          `Avete accumulato ricchezze senza reinvestirle. La vostra avidità ha convinto i signori vicini a formare una coalizione. Vi hanno spogliati di tutto ciò che avevate radunato, lasciandovi soltanto i debiti.`,
          `Troppo oro lascia tracce. Le operazioni di ${char.name} erano finanziate in modo sospetto e qualcuno ha seguito il filo. Ora è il bersaglio più ricercato dei Sette Regni — ricca, sì, ma braccata.`,
          `L'oro corrode la fede. Chi accumula tesori terreni perde il favore di R'hllor. La profezia non si compie con le monete. Il Signore della Luce ha abbandonato la sua sacerdotessa all'oscurità.`,
          `Ricco e solo. ${char.name} aveva abbastanza oro da comprare un esercito, ma ha aspettato troppo. Un avversario più rapido e meno avido l'ha neutralizzato prima che lo spendesse.`
        )
      );
    }

    // ── FEDE a 0 ─────────────────────────────────────────────
    if (r.faith <= 0) {
      return triggerEnd(false, '⛪', 'La Maledizione dei Sette',
        byRole(
          `I Sette si sono voltati contro di voi. Il Septon Supremo ha pronunciato la scomunica pubblica. La guardia reale si è rifiutata di combattere per un sovrano maledetto — nessun soldato muore per chi ha perso la grazia divina.`,
          `Casa ${char.house.replace('Casa ','')} ha perso ogni sostegno della Fede. Il Septon locale ha scomunicato il casato. Nessun signore osa allearsi con chi porta la maledizione dei Sette sopra il proprio tetto.`,
          `${char.name} non aveva mai avuto bisogno dei Sette — ma il popolo sì. Senza la benedizione della Fede ogni porta è chiusa, ogni rifugio negato. Le ombre in cui si nascondeva si sono fatte troppo pericolose.`,
          `Una sacerdotessa di R'hllor che perde la fede è già morta. Le visioni sono cessate. Il fuoco non risponde più. Il Signore della Luce ha voltato il volto altrove, e l'oscurità ha inghiottito tutto ciò che restava.`,
          `${char.name} ha ignorato la Fede una volta di troppo. I predicatori dei Sette hanno convinto le folle che porta sventura. Nessuno combatte al fianco di un uomo che persino gli dei rinnegano.`
        )
      );
    }

    // ── FEDE al massimo ──────────────────────────────────────
    if (r.faith >= cap) {
      return triggerEnd(false, '🔥', 'Il Fanatismo dei Fedeli',
        byRole(
          `La Fede Militante ha preso il controllo delle strade. Il Septon Supremo ha dichiarato che la purificazione del regno richiede il vostro sacrificio. Anche i re possono essere bruciati sul rogo della devozione cieca.`,
          `Il fanatismo religioso ha travolto la casata. I Fedeli Combattenti occupano le terre dichiarandole territorio sacro. ${char.name} è stato processato da un tribunale della Fede — e non ne è uscito.`,
          `Troppa devozione attira l'attenzione sbagliata. I fanatici vedono ${char.name} come uno strumento della volontà divina — e gli strumenti non scelgono il proprio destino. È rinchiusa in un tempio, prigioniera adorata.`,
          `Melisandre ha alimentato la fiamma troppo a lungo. I convertiti ora la venerano come una dea mortale. Le hanno tolto ogni potere reale, lasciandole solo la veste rossa e il ricordo delle visioni perdute.`,
          `${char.name} ha lasciato che i predicatori si infiltrassero nelle proprie file. I soldati pregano invece di combattere e ubbidiscono al Septon invece che al comandante. Un esercito di fedeli non è un esercito.`
        )
      );
    }

    // ── POPOLO a 0 ───────────────────────────────────────────
    if (r.people <= 0) {
      return triggerEnd(false, '🔥', 'La Grande Rivolta',
        byRole(
          `Le strade bruciano. La gente affamata ha sfondato i cancelli del palazzo. Le guardie hanno disertato rifiutandosi di massacrare i propri fratelli. I re regnano per grazia del popolo — e il popolo ha revocato la sua grazia.`,
          `Il popolo si è rivoltato. Anni di soprusi hanno trasformato i contadini in ribelli armati. ${char.name} è fuggito nella notte mentre la dimora della casata andava a fuoco sullo sfondo del tramonto.`,
          `${char.name} ha mosso le proprie pedine ignorando le sofferenze di chi non conta. Ma anche le pedine si ribellano quando hanno fame. La folla ha scoperto dove si nascondeva e non ha mostrato misericordia.`,
          `Il popolo non crede nelle profezie quando ha lo stomaco vuoto. I fedeli di R'hllor si sono dispersi. Le fiamme sacre non scaldano chi trema per il freddo e la fame nelle strade.`,
          `${char.name} ha sempre combattuto per chi pagava, non per chi soffriva. Quando la gente è insorta, nessuno era disposto a difendere un mercenario che aveva sempre guardato dall'altra parte.`
        )
      );
    }

    // ── POPOLO al massimo ────────────────────────────────────
    if (r.people >= cap) {
      return triggerEnd(false, '🎭', "L'Idolo Spodestato",
        byRole(
          `Eravate troppo amati dal popolo. Il Gran Consiglio vi ha "elevato" a simbolo sacro, privandovi di ogni potere reale. Un re adorato come un dio non governa — viene esposto come una reliquia preziosa e inerte.`,
          `La popolarità di ${char.name} ha spaventato il Trono e le altre casate. Troppo amato per essere tollerato al potere, è stato rimosso con un sorriso e una cerimonia pubblica — e relegato all'irrilevanza dorata.`,
          `${char.name} è diventata una leggenda — e le leggende non possono agire nell'ombra. Ogni suo movimento viene osservato, cantato e celebrato. Nell'adorazione pubblica ha perso la cosa più preziosa: l'invisibilità.`,
          `Troppi fedeli si sono radunati attorno alla sacerdotessa. Il Trono ha dichiarato Melisandre una pericolosa agitatore di folle. Il suo culto è stato disperso con la forza, lei arrestata nelle ore piccole.`,
          `${char.name} è diventato un eroe del popolo. Ma gli eroi sono scomodi — fanno sperare chi non dovrebbe. Il Trono ha deciso che era più sicuro eliminarlo che lasciarlo diventare uno stendardo di rivolta.`
        )
      );
    }

    // ── ESERCITO a 0 ─────────────────────────────────────────
    if (r.army <= 0) {
      return triggerEnd(false, '💀', 'La Disfatta Totale',
        byRole(
          `Il vostro esercito non esiste più. Le porte della capitale sono state aperte senza combattere — nessuno è rimasto a difenderle. Il Re conquistatore è entrato a cavallo nella Sala del Trono mentre voi fuggite per vie secondarie.`,
          `${char.name} ha perso ogni uomo capace di combattere. I nemici hanno fatto irruzione nel castello all'alba, incontrando solo servitori e porte spalancate. La casata cade senza opporre la minima resistenza.`,
          `${char.name} opera nell'ombra — ma anche le ombre hanno bisogno di protezione. Senza nessuno a guardarle le spalle, i nemici hanno colpito in pieno giorno quando era più vulnerabile.`,
          `Il Signore della Luce protegge chi ha la forza per combattere la sua guerra. Senza esercito la profezia rimane incompiuta. Melisandre è stata catturata dai nemici della Fede e condotta in catene lontano dal fuoco sacro.`,
          `Un guerriero senza soldati è solo un uomo con una spada. ${char.name} ha combattuto fino all'ultimo respiro, ma uno contro molti non bastava. Cade con onore — ma cade comunque.`
        )
      );
    }

    // ── ESERCITO al massimo ──────────────────────────────────
    if (r.army >= cap) {
      return triggerEnd(false, '⚔', 'Il Condottiero Spodestato',
        byRole(
          `Il vostro esercito ha terrorizzato ogni casata del regno. I vostri stessi generali vi hanno presentato una scelta: abdicare o essere rimosso con la forza. Un esercito invincibile non ha più bisogno del suo re — e lo sa.`,
          `${char.name} ha reclutato così tanti soldati da spaventare persino gli alleati. Una coalizione preventiva ha colpito prima che l'esercito potesse essere schierato. La guerra è finita prima ancora di iniziare.`,
          `Un esercito privato di quella portata non passa inosservato. Il Trono ha dichiarato ${char.name} ribelle e traditore. Ogni casata ha risposto alla chiamata — e tutte si sono schierate contro di lei.`,
          `Le fiamme di R'hllor bruciano i nemici, ma un esercito di fanatici armati spaventa anche gli alleati. Una rivolta interna ha spazzato via tutto ciò che Melisandre aveva costruito in anni di profezie e sacrifici.`,
          `${char.name} aveva l'esercito più temuto dei Sette Regni. Ma un mercenario con troppi soldati è un invasore, non un alleato. Tutte le casate si sono unite per fermarlo prima che fosse troppo tardi.`
        )
      );
    }

    // ── POTERE a 0 ───────────────────────────────────────────
    if (r.power <= 0) {
      return triggerEnd(false, '🕯️', "L'Ombra Svanita",
        byRole(
          `Il vostro potere politico si è dissolto completamente. Il Gran Maester ha convocato il Gran Consiglio senza nemmeno informarvi. Siete ancora seduti sul trono — ma è già vuoto. Il regno non vi ascolta più.`,
          `${char.name} ha perso ogni influenza politica. Le grandi casate non rispondono ai corvi. Le piccole casate non si presentano alle convocazioni. Un nobile senza potere è un fantasma nei propri stessi saloni.`,
          `${char.name} si muove nell'ombra — ma senza influenza l'ombra non serve a nulla. Nessuno onora i debiti di favore, nessuno risponde ai messaggi cifrati. Invisibile e irrilevante, è stata dimenticata mentre era ancora viva.`,
          `Il fuoco profetico richiede credibilità per ardere. Senza potere politico le parole di Melisandre suonano come delirio. I re smettono di consultarla, i fedeli la abbandonano nel silenzio di una stanza fredda.`,
          `${char.name} ha vissuto di spada, non di parole. Senza connessioni politiche è rimasto completamente isolato. Nessuna casata lo supporta, nessun lord lo ospita. Un guerriero senza nome è solo un vagabondo armato.`
        )
      );
    }

    // ── POTERE al massimo ────────────────────────────────────
    if (r.power >= cap) {
      return triggerEnd(false, '👁️', 'Il Tiranno Assoluto',
        byRole(
          `Avete accumulato potere senza precedenti nella storia dei Sette Regni. Una congiura silenziosa — finanziata da ogni casata che temeva il vostro controllo — vi ha eliminati nell'oscurità, prima che diventasse eterno.`,
          `${char.name} ha concentrato troppo potere nelle proprie mani. Le grandi casate si sono riunite in segreto e hanno deciso all'unanimità: meglio agire ora che aspettare di essere ridotte a vassalli. La casata è caduta in una notte.`,
          `Il potere assoluto è il peggior nemico di chi vive nell'ombra. ${char.name} è diventata la minaccia più temuta dei Sette Regni — e le minacce si eliminano. Ogni casata aveva un motivo. Nessuna aveva un alibi.`,
          `Melisandre ha convinto troppe persone. Il Trono, le casate e persino la Fede dei Sette si sono alleati contro di lei. Quando il potere di una sacerdotessa supera quello dei re, i re si uniscono per spezzarlo.`,
          `${char.name} è salito troppo in alto per qualcuno nato senza titolo né casato. I nobili non perdonano chi li supera partendo dal nulla. Una lama nel buio, un veleno nel vino — e la scalata si è conclusa.`
        )
      );
    }

    // ── VITTORIA ─────────────────────────────────────────────
    if (char.objectiveCheck(state)) {
      return triggerEnd(true, char.icon, `${char.name} Trionfa!`,
        `Il vostro destino si è compiuto. ${char.objective} — Dopo ${state.turn} turni di intrighi, guerre e diplomazia, il vostro nome entrerà nella storia dei Sette Regni.`
      );
    }
  }


  function triggerEnd(won, icon, title, text) {
    state.gameOver = true;
    const r = state.resources;

    document.getElementById('ending-icon').textContent = icon;
    document.getElementById('ending-title').textContent = title;
    document.getElementById('ending-text').textContent = text;

    const statsEl = document.getElementById('ending-stats');
    statsEl.innerHTML = [
      `<span class="stat-pill">⏱ Turni: ${state.turn}</span>`,
      `<span class="stat-pill">💰 ${Math.round(r.gold)}</span>`,
      `<span class="stat-pill">⚔ ${Math.round(r.army)}</span>`,
      `<span class="stat-pill">👥 ${Math.round(r.people)}</span>`,
      `<span class="stat-pill">🤝 Alleanze: ${countAllies(state)}</span>`,
      `<span class="stat-pill">${won ? '🏆 Vittoria' : '💀 Sconfitta'}</span>`,
    ].join('');

    localStorage.removeItem('ia_save');
    showScreen('screen-ending');
  }

  // ══════════════════════════════════════════════
  // ARYA KILL LIST OVERLAY
  // ══════════════════════════════════════════════
  function showKillConfirmation(target) {
    const done = (state.aryaList || ARYA_LIST).filter(t => t.done).length;
    const overlay = document.createElement('div');
    overlay.className = 'war-overlay';
    overlay.style.background = 'rgba(10,5,5,0.97)';
    overlay.innerHTML = `
      <div style="font-size:2.5rem">🗡️</div>
      <div class="war-title" style="font-size:1.2rem;color:#dc2626">Nome Depennato</div>
      <div class="war-log" style="text-align:center">
        <p style="font-size:1.1rem;color:#e8dcc8;font-family:'Cinzel',serif">
          <span style="text-decoration:line-through;color:#6b5e4a">${target.icon} ${target.name}</span>
        </p>
        <p style="color:#9a8a6a;font-size:0.85rem;margin-top:0.5rem;font-style:italic">
          «${target.name}» — il nome è stato depennato dalla lista.
        </p>
        <div style="margin-top:1rem;padding:0.75rem;background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:4px">
          <div style="font-family:'Cinzel',serif;font-size:0.7rem;letter-spacing:0.1em;color:#c9a84c;text-transform:uppercase;margin-bottom:0.5rem">La Lista — ${done}/3 eliminati</div>
          ${(state.aryaList || ARYA_LIST).map(t => `
            <div style="display:flex;align-items:center;gap:0.4rem;font-family:'EB Garamond',serif;font-size:0.9rem;color:${t.done ? '#6b5e4a' : '#e8dcc8'};margin:0.2rem 0">
              ${t.done ? '☑' : '☐'} ${t.icon} <span style="${t.done ? 'text-decoration:line-through' : ''}">${t.name}</span>
            </div>`).join('')}
        </div>
      </div>
      <button class="btn-primary" style="max-width:200px" onclick="this.parentElement.remove()">Continua</button>
    `;
    document.body.appendChild(overlay);
  }

  function renderAryaListInObjective() {
    if (state.character?.id !== 'arya') return;
    const list = state.aryaList || ARYA_LIST;
    const done = list.filter(t => t.done).length;
    const el = document.getElementById('objective-text');
    if (el) {
      el.innerHTML = `La Lista: <strong style="color:#dc2626">${done}/3</strong> nemici eliminati — ` +
        list.map(t => `<span style="${t.done ? 'text-decoration:line-through;opacity:0.45' : ''}">${t.icon}${t.name.split(' ')[0]}</span>`).join(' · ');
    }
  }

  // ══════════════════════════════════════════════
  // DIPLOMACY PANEL
  // ══════════════════════════════════════════════
  function toggleDiplomacy() {
    const panel = document.getElementById('diplomacy-panel');
    if (panel.classList.contains('hidden')) {
      renderDiplomacy();
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  }

  function buildChallengeButton() {
    const canChallenge = state.resources.army > 70 &&
      Object.values(state.houses).filter(h => h.status === 'ally').length >= 2;
    if (canChallenge) {
      return '<button onclick="Game.challengeKing();Game.toggleDiplomacy();" style="width:100%;padding:0.65rem;background:linear-gradient(135deg,rgba(127,29,29,0.8),rgba(153,27,27,0.9));border:1px solid rgba(239,68,68,0.5);border-radius:2px;font-family:Cinzel,serif;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#fca5a5;transition:all 0.2s">⚔ Sfida il Re Reggente</button><p style="font-size:0.7rem;color:#6b5e4a;margin-top:0.35rem;font-family:EB Garamond,serif;font-style:italic">⚠ Dichiararla costa -12 Popolo · serve Esercito >70 e 2+ alleati</p>';
    }
    const armyVal = Math.round(state.resources.army);
    const allyCount = Object.values(state.houses).filter(h => h.status === 'ally').length;
    return '<div style="padding:0.6rem;background:rgba(100,80,50,0.1);border:1px solid rgba(201,168,76,0.2);border-radius:4px;font-family:EB Garamond,serif;font-size:0.82rem;color:#6b5e4a;line-height:1.6">' +
      '\uD83D\uDD12 Per sfidare il Re devi avere:<br>' +
      '\u2694 Esercito >70 (attuale: ' + armyVal + (armyVal > 70 ? ' \u2713' : ' \u2717') + ')<br>' +
      '\uD83E\uDD1D Almeno 2 casate alleate (attuale: ' + allyCount + (allyCount >= 2 ? ' \u2713' : ' \u2717') + ')</div>';
  }

  function renderDiplomacy() {
    const container = document.getElementById('diplo-houses');
    container.innerHTML = '';
    Object.entries(state.houses).forEach(([hId, h]) => {
      const isSuppressed = h.suppressed;
      const isPendingWar = state.pendingWarTarget === hId;
      const hasLoan = state.allyLoans && state.allyLoans[hId];
      const card = document.createElement('div');
      card.className = 'house-card' + (state.ravenTarget === hId ? ' selected' : '');
      card.style.opacity = isSuppressed ? '0.4' : '1';

      let statusLabel = h.status === 'ally' ? '✅ Alleati' : h.status === 'enemy' ? '⚔ Nemici' : '⚪ Neutrali';
      if (isSuppressed) statusLabel = '💀 Conquistata';
      if (hasLoan) statusLabel += ` (⚔ +${state.allyLoans[hId].amount} prestati)`;

      const allyArmyBtn = (h.status === 'ally' && !isSuppressed && state.pendingWarTarget)
        ? `<button onclick="Game.requestAllyArmy('${hId}')" style="margin-top:0.4rem;width:100%;padding:0.3rem;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.35);border-radius:3px;font-family:'Cinzel',serif;font-size:0.68rem;color:#4ade80;cursor:pointer;letter-spacing:0.05em">⚔ Richiedi Rinforzi</button>`
        : '';

      card.innerHTML = `
        <span class="house-icon">${h.icon}</span>
        <span class="house-name">Casa ${h.name}</span>
        <span class="house-status status-${isSuppressed ? 'suppressed' : h.status}">${statusLabel}</span>
        <span class="house-army">⚔ Esercito: ${isSuppressed ? '—' : Math.round(h.army)}</span>
        ${allyArmyBtn}
      `;
      if (!isSuppressed) card.addEventListener('click', (e) => { if (e.target.tagName !== 'BUTTON') selectRavenTarget(hId); });
      container.appendChild(card);
    });

    // King challenge section
    const diploActions = document.querySelector('.diplo-actions');
    let throneSection = document.getElementById('throne-challenge-section');
    if (!throneSection) {
      throneSection = document.createElement('div');
      throneSection.id = 'throne-challenge-section';
      throneSection.style.cssText = 'margin-top:1rem;padding-top:1rem;border-top:1px solid rgba(201,168,76,0.2)';
      diploActions.parentNode.insertBefore(throneSection, diploActions);
    }

    if (state.isPlayerKing) {
      throneSection.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.5rem;padding:0.6rem 0.75rem;background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.3);border-radius:4px;font-family:'Cinzel',serif;font-size:0.8rem;color:#c9a84c">
          👑 Sei il Re Reggente dei Sette Regni
        </div>
      `;
    } else {
      const diff = state.character.difficulty;
      const diffMod = { easy: 0.80, medium: 1.0, hard: 1.25 }[diff] || 1.0;
      const kingForceEst = Math.round((state.kingArmy || 65) * diffMod);
      const playerForceEst = Math.round(state.resources.army + Object.values(state.houses).filter(h => h.status === 'ally').reduce((s, h) => s + h.army * 0.4, 0));
      const winPct = Math.round(Math.min(95, Math.max(5, (playerForceEst / (playerForceEst + kingForceEst)) * 100)));
      const diffLabel = { easy: '🟢 Facile', medium: '🟡 Medio', hard: '🔴 Difficile' }[diff];
      throneSection.innerHTML = `
        <h4 style="font-family:'Cinzel',serif;font-size:0.8rem;letter-spacing:0.1em;text-transform:uppercase;color:#c9a84c;margin-bottom:0.6rem">
          👑 Trono di Spade
        </h4>
        <div style="font-family:'EB Garamond',serif;font-size:0.85rem;color:#9a8a6a;margin-bottom:0.5rem;line-height:1.4">
          Il Re Reggente è <strong style="color:#e8dcc8">${state.kingName}</strong> ${POSSIBLE_KINGS.find(k=>k.id===state.king)?.icon||'👑'}<br>
          <span style="font-size:0.8rem">Forze stimate: Re ${kingForceEst} vs Tue ${playerForceEst} (prob. ~${winPct}%)</span><br>
          <span style="font-size:0.75rem;color:#c9a84c">Difficoltà: ${diffLabel}</span>
        </div>
        ${buildChallengeButton()}
      `;
    }

    const ravenSelect = document.getElementById('raven-select');
    ravenSelect.textContent = state.ravenTarget
      ? `Corvo destinato a Casa ${state.houses[state.ravenTarget].name}`
      : 'Seleziona una casata per inviare un corvo...';

    const ravenActions = document.getElementById('raven-actions');
    ravenActions.classList.toggle('hidden', !state.ravenTarget);

    // Dynamic buttons based on target house status
    if (state.ravenTarget) {
      const tgt = state.houses[state.ravenTarget];
      const isAlly = tgt?.status === 'ally';
      const isEnemy = tgt?.status === 'enemy';
      ravenActions.innerHTML = `
        ${!isAlly ? `<button class="btn-raven" onclick="Game.ravenAction('alliance')">🤝 Proponi Alleanza</button>` : ''}
        ${isAlly ? `<button class="btn-raven" onclick="Game.ravenAction('request_resources')">📦 Chiedi Risorse</button>` : ''}
        ${isAlly ? `<button class="btn-raven" onclick="Game.ravenAction('resource_exchange')">🔄 Scambio Risorse</button>` : ''}
        ${isAlly && state.pendingWarTarget ? `<button class="btn-raven" onclick="Game.requestAllyArmy('${state.ravenTarget}')">⚔ Richiedi Rinforzi</button>` : ''}
        <button class="btn-raven" onclick="Game.ravenAction('war')">⚔ Dichiara Guerra</button>
        ${!isEnemy ? `<button class="btn-raven" onclick="Game.ravenAction('tribute')">💰 Invia Tributo</button>` : ''}
        <button class="btn-raven btn-cancel" onclick="Game.clearRaven()">Annulla</button>
      `;
    }
  }

  function selectRavenTarget(hId) {
    state.ravenTarget = state.ravenTarget === hId ? null : hId;
    renderDiplomacy();
  }

  function clearRaven() {
    state.ravenTarget = null;
    renderDiplomacy();
  }

  function buildRefusalReason(s, h, hId) {
    if (s.decisionHistory.some(d => d.tags?.includes('betray_ally')))
      return '«La voce del vostro tradimento è arrivata anche a noi.»';
    if (h.status === 'enemy')
      return '«Non dimentichiamo i torti subiti.»';
    if (s.resources.power < 30)
      return '«Non siete abbastanza influenti per meritare la nostra fiducia.»';
    if (s.resources.gold < 30)
      return '«Un alleato povero è un peso, non un vantaggio.»';
    return '«Il momento non è propizio per nuove alleanze.»';
  }

  function ravenAction(action) {
    if (!state.ravenTarget) return;
    const h = state.houses[state.ravenTarget];
    const cost = { alliance: 0, war: 0, tribute: -25 };
    const goldCost = cost[action] || 0;

    if (goldCost !== 0 && state.resources.gold + goldCost < 0) {
      showToast('Non hai abbastanza oro!', 'warn');
      return;
    }

    state.resources.gold = clamp(state.resources.gold + goldCost);

    if (action === 'alliance') {
      if (h.status === 'ally') { showToast(`Casa ${h.name} è già vostra alleata.`); return; }

      // ── Calculate acceptance probability ──
      const diffBase = { easy: 0.70, medium: 0.50, hard: 0.30 };
      let chance = diffBase[state.character.difficulty] || 0.50;

      const r = state.resources;
      if (r.power > 60)  chance += 0.15;
      if (r.gold  > 60)  chance += 0.10;
      if (h.status === 'enemy') chance -= 0.25;
      if (state.decisionHistory.some(d => d.tags?.includes('betray_ally'))) chance -= 0.20;
      if (countAllies(state) > 3) chance += 0.10;
      // Common enemy with the king = bonus
      if (state.houses[state.kingHouseAffiliation]?.status === 'enemy' &&
          state.houses[state.kingHouseAffiliation]) chance += 0.15;

      // Apply hostility penalty from past refusals
      if (state.houseHostility && state.houseHostility[state.ravenTarget]) {
        chance -= (state.houseHostility[state.ravenTarget] / 100);
      }
      chance = Math.max(0.05, Math.min(0.95, chance));
      const pct = Math.round(chance * 100);

      // ── Determine if they demand resources ──
      // Harder chars + lower power = higher chance of demand
      const demandChance = { easy: 0.20, medium: 0.40, hard: 0.60 }[state.character.difficulty] || 0.35;
      const demandRoll = Math.random();
      const hasDemand = demandRoll < demandChance && h.status !== 'ally';

      if (hasDemand) {
        // Pick a random demand type and amount
        const demandTypes = [
          { res: 'gold',  label: 'oro',     icon: '💰', amount: Math.floor(Math.random() * 12) + 8 },
          { res: 'army',  label: 'soldati', icon: '⚔',  amount: Math.floor(Math.random() * 10) + 6  },
          { res: 'faith', label: 'sostegno alla Fede', icon: '✝', amount: Math.floor(Math.random() * 8) + 6 },
        ];
        const demand = rand(demandTypes);
        const hId = state.ravenTarget;

        // Show proposal overlay BEFORE taking resources
        showAllianceDemandOverlay(h, demand, chance, pct, hId);
        // Don't call toggleDiplomacy here — overlay handles it
        return;

      } else {
        // No demand — pure roll
        const roll = Math.random();
        const reasons = buildRefusalReason(state, h, state.ravenTarget);

        if (roll < chance) {
          h.status = h.status === 'enemy' ? 'neutral' : 'ally';
          state.resources.power = clamp(r.power + (h.status === 'ally' ? 12 : 6));
          const msg = h.status === 'ally'
            ? `🤝 Casa ${h.name} accetta l'alleanza! (${pct}%)`
            : `✉ Casa ${h.name} accetta la tregua. Ora Neutrali. (${pct}%)`;
          showToast(msg, 'good');
          if (h.status === 'ally') state.decisionHistory.push({ turn: state.turn, cardId: 'raven_alliance', choice: 'alliance', tags: ['diplomacy'], target: state.ravenTarget });
        } else {
          showToast(`❌ Casa ${h.name} rifiuta. ${reasons} (${pct}%)`, 'warn');
          recordAllianceRejection(state.ravenTarget);
        }
      }
    } else if (action === 'request_resources') {
      // Player requests resources from an ally
      if (h.status !== 'ally') { showToast('Solo gli alleati possono inviarti risorse.', 'warn'); state.ravenTarget = null; toggleDiplomacy(); return; }
      showRequestResourcesOverlay(state.ravenTarget, h);
      return;
    } else if (action === 'war') {
      const warTargetId = state.ravenTarget;
      if (h.status === 'ally') {
        h.status = 'enemy';
        state.decisionHistory.push({ turn: state.turn, cardId: 'raven_betray', choice: 'war', tags: ['betray_ally'], target: warTargetId });
        showToast(`⚔ Hai tradito Casa ${h.name}! Sono ora tuoi nemici.`, 'warn');
      } else {
        h.status = 'enemy';
        state.ravenTarget = null;
        updateHUD();
        toggleDiplomacy();
        saveGame();
        triggerWar(warTargetId);
        return;
      }
    } else if (action === 'resource_exchange') {
      // Ally sends you resources, you send back proportionally
      const exchangeAmt = Math.floor(8 + Math.random() * 10);
      const resTypes = ['gold', 'people', 'faith'];
      const res = rand(resTypes);
      if (h.status !== 'ally') { showToast('Solo gli alleati accettano scambi di risorse.', 'warn'); state.ravenTarget = null; toggleDiplomacy(); return; }
      showAllyResourceExchangeOverlay(state.ravenTarget, h, res, exchangeAmt);
    } else if (action === 'tribute') {
      // Probability of improving relations based on character difficulty
      const diffMap = { easy: 0.75, medium: 0.50, hard: 0.25 };
      const baseChance = diffMap[state.character.difficulty] || 0.5;
      const roll = Math.random();

      if (h.status === 'enemy') {
        // Enemy → chance to become Neutral
        if (roll < baseChance) {
          h.status = 'neutral';
          state.resources.power = clamp(state.resources.power + 8);
          showToast(`💰 Casa ${h.name} accetta il tributo e abbassa le armi. Ora è Neutrale.`, 'good');
        } else {
          showToast(`💰 Casa ${h.name} trattiene l'oro ma ignora il gesto. Rimangono Nemici.`, 'warn');
        }
      } else if (h.status === 'neutral') {
        // Neutral → chance to become Ally
        if (roll < baseChance) {
          h.status = 'ally';
          state.resources.power = clamp(state.resources.power + 12);
          showToast(`🤝 Casa ${h.name} è colpita dalla vostra generosità. Ora è vostra Alleata!`, 'good');
          state.decisionHistory.push({ turn: state.turn, cardId: 'tribute_alliance', choice: 'tribute', tags: ['diplomacy'], target: state.ravenTarget });
        } else {
          state.resources.power = clamp(state.resources.power + 4);
          showToast(`💰 Casa ${h.name} apprezza il tributo ma rimane Neutrale per ora.`);
        }
      } else {
        // Already ally → loyalty boost
        state.resources.power = clamp(state.resources.power + 6);
        showToast(`💰 Casa ${h.name} rafforza la sua lealtà. Fedeltà consolidata.`);
      }

      // Show the roll odds in toast after a short delay
      const pct = Math.round(baseChance * 100);
      setTimeout(() => showToast(`🎲 Probabilità successo (diff. ${state.character.difficulty}): ${pct}%`), 2200);
    }

    state.ravenTarget = null;
    updateHUD();
    toggleDiplomacy();
    saveGame();
  }

  // ══════════════════════════════════════════════
  // ALLIANCE DEMAND OVERLAY
  // ══════════════════════════════════════════════
  function showAllianceDemandOverlay(h, demand, chance, pct, hId) {
    const existing = document.getElementById('alliance-demand-overlay');
    if (existing) existing.remove();

    const canAfford = state.resources[demand.res] >= demand.amount;
    const diffLabel = state.character.difficulty;
    // Hostility increase on refusal: easy +5, medium +10, hard +20
    const hostilityIncrease = { easy: 5, medium: 10, hard: 20 }[diffLabel] || 10;

    const overlay = document.createElement('div');
    overlay.id = 'alliance-demand-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.90);z-index:600;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;backdrop-filter:blur(4px);';
    overlay.innerHTML = `
      <div style="background:#12121a;border:1px solid rgba(201,168,76,0.5);border-radius:6px;width:92%;max-width:440px;padding:1.75rem;font-family:'Cinzel',serif;">
        <div style="font-family:'Cinzel Decorative',serif;color:#c9a84c;font-size:0.95rem;margin-bottom:0.4rem">
          ${h.icon} Casa ${h.name}
        </div>
        <div style="font-size:0.7rem;color:#9a8a6a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:1rem">
          Condizioni per l'alleanza
        </div>
        <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:4px;padding:0.85rem;margin-bottom:1rem;font-family:'EB Garamond',serif;font-size:0.95rem;color:#e8dcc8;line-height:1.6">
          «Prima di stringere questa alleanza, esigiamo un contributo: 
          <strong style="color:#c9a84c">${demand.icon} ${demand.amount} ${demand.label}</strong>.
          Soddisfate questa condizione e valuteremo la vostra proposta.»
          <div style="margin-top:0.5rem;font-size:0.82rem;color:#9a8a6a">
            Voi avete: ${demand.icon} ${Math.round(state.resources[demand.res])} — 
            ${canAfford ? '<span style="color:#4ade80">✓ sufficiente</span>' : '<span style="color:#f87171">✗ insufficiente</span>'}
          </div>
        </div>
        <div style="font-size:0.75rem;color:#6b5e4a;font-family:'EB Garamond',serif;margin-bottom:1rem;font-style:italic">
          ⚠ Rifiutare aumenterà l'ostilità di Casa ${h.name} (${hostilityIncrease > 0 ? '+' : ''}${hostilityIncrease}% difficoltà alleanza futura)
        </div>
        <div style="display:flex;gap:0.75rem">
          ${canAfford
            ? `<button onclick="Game.acceptAllianceDemand('${hId}','${demand.res}',${demand.amount},${chance},${pct})" style="flex:1;padding:0.7rem;background:linear-gradient(135deg,#14532d,#16a34a);border:none;border-radius:2px;font-family:'Cinzel',serif;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#fff;">✓ Paga e proponi</button>`
            : `<button disabled style="flex:1;padding:0.7rem;background:rgba(100,100,100,0.2);border:1px solid rgba(100,100,100,0.3);border-radius:2px;font-family:'Cinzel',serif;font-size:0.75rem;color:#6b5e4a;cursor:not-allowed;">✗ Non puoi permettertelo</button>`
          }
          <button onclick="Game.rejectAllianceDemand('${hId}',${hostilityIncrease})" style="flex:1;padding:0.7rem;background:transparent;border:1px solid rgba(201,168,76,0.4);border-radius:2px;font-family:'Cinzel',serif;font-size:0.75rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#c9a84c;">Rifiuta le condizioni</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function acceptAllianceDemand(hId, res, amount, chance, pct) {
    document.getElementById('alliance-demand-overlay')?.remove();
    const h = state.houses[hId];
    if (!h) return;
    const r = state.resources;

    // Take resources
    state.resources[res] = clamp(state.resources[res] - amount);

    // Roll for alliance
    const roll = Math.random();
    if (roll < chance) {
      h.status = h.status === 'enemy' ? 'neutral' : 'ally';
      state.resources.power = clamp(r.power + (h.status === 'ally' ? 10 : 5));
      const msg = h.status === 'ally'
        ? `🤝 Casa ${h.name} accetta! Siete ora alleati. (${pct}%)`
        : `✉ Casa ${h.name} allenta le ostilità. Ora Neutrali. (${pct}%)`;
      showToast(msg, 'good');
      if (h.status === 'ally') state.decisionHistory.push({ turn: state.turn, cardId: 'raven_alliance', choice: 'alliance', tags: ['diplomacy'], target: hId });
    } else {
      showToast(`💰 Casa ${h.name} ha preso le risorse ma ha rifiutato la proposta. (${pct}% — sfortuna)`, 'warn');
    }

    state.ravenTarget = null;
    updateHUD();
    saveGame();
  }

  function rejectAllianceDemand(hId, hostilityIncrease) {
    document.getElementById('alliance-demand-overlay')?.remove();
    const h = state.houses[hId];
    if (!h) return;
    if (!state.houseHostility) state.houseHostility = {};
    state.houseHostility[hId] = (state.houseHostility[hId] || 0) + hostilityIncrease;
    showToast(`😠 Casa ${h.name} ricorda il vostro rifiuto. Ostilità aumentata (−${hostilityIncrease}% chance alleanza futura).`, 'warn');
    state.ravenTarget = null;
    updateHUD();
    saveGame();
  }

  // ── Ally resource exchange ──
  function showAllyResourceExchangeOverlay(hId, h, res, amount) {
    const resLabels = { gold: 'oro 💰', faith: 'fede ✝', people: 'popolo 👥' };
    const costRes = rand(['gold', 'army'].filter(r => r !== res));
    const costAmt = Math.floor(amount * 0.6 + 3);
    const canAfford = state.resources[costRes] >= costAmt;

    const existing = document.getElementById('ally-exchange-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'ally-exchange-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.90);z-index:620;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;backdrop-filter:blur(4px);';
    overlay.innerHTML = `
      <div style="background:#12121a;border:1px solid rgba(201,168,76,0.5);border-radius:6px;width:92%;max-width:400px;padding:1.6rem;font-family:'Cinzel',serif;">
        <div style="font-family:'Cinzel Decorative',serif;color:#c9a84c;font-size:0.9rem;margin-bottom:0.35rem">${h.icon} Scambio con Casa ${h.name}</div>
        <div style="font-size:0.7rem;color:#9a8a6a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.85rem">Proposta di scambio risorse</div>
        <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:4px;padding:0.8rem;margin-bottom:0.85rem;font-family:'EB Garamond',serif;font-size:0.92rem;color:#e8dcc8;line-height:1.6">
          <p>Casa ${h.name} vi offre <strong style="color:#4ade80">${amount} ${resLabels[res]}</strong> in cambio di <strong style="color:#f87171">${costAmt} ${resLabels[costRes] || costRes}</strong>.</p>
          <p style="font-size:0.82rem;color:#9a8a6a;margin-top:0.4rem">Avete: ${Math.round(state.resources[costRes])} — ${canAfford ? '<span style="color:#4ade80">✓</span>' : '<span style="color:#f87171">✗ insufficiente</span>'}</p>
        </div>
        <div style="display:flex;gap:0.75rem">
          ${canAfford
            ? `<button onclick="Game.acceptResourceExchange('${hId}','${res}',${amount},'${costRes}',${costAmt})" style="flex:1;padding:0.65rem;background:linear-gradient(135deg,#14532d,#16a34a);border:none;border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;color:#fff">✓ Accetta lo scambio</button>`
            : `<button disabled style="flex:1;padding:0.65rem;background:rgba(80,80,80,0.2);border:1px solid #444;border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;color:#555;cursor:not-allowed">✗ Risorse insufficienti</button>`
          }
          <button onclick="Game.rejectResourceExchange('${hId}');document.getElementById('ally-exchange-overlay').remove()" style="flex:1;padding:0.65rem;background:transparent;border:1px solid rgba(201,168,76,0.4);border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;color:#c9a84c">Rifiuta</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  function acceptResourceExchange(hId, gainRes, gainAmt, costRes, costAmt) {
    document.getElementById('ally-exchange-overlay')?.remove();
    const h = state.houses[hId];
    if (!h) return;
    state.resources[gainRes] = Math.min(getResourceCap(), state.resources[gainRes] + gainAmt);
    state.resources[costRes] = Math.max(0, state.resources[costRes] - costAmt);
    if (!state.exchangeCount) state.exchangeCount = {};
    state.exchangeCount[hId] = 0; // reset refusal count on success
    showToast(`🤝 Scambio completato con Casa ${h.name}!`, 'good');
    updateHUD(); saveGame();
  }

  function rejectResourceExchange(hId) {
    const h = state.houses[hId];
    if (!h) return;
    if (!state.exchangeCount) state.exchangeCount = {};
    state.exchangeCount[hId] = (state.exchangeCount[hId] || 0) + 1;
    // After 3 mutual refusals → back to neutral
    if (state.exchangeCount[hId] >= 3) {
      h.status = 'neutral';
      state.exchangeCount[hId] = 0;
      showToast(`😤 Casa ${h.name} si stanca dei vostri rifiuti e torna neutrale.`, 'warn');
    } else {
      showToast(`Casa ${h.name} nota il vostro rifiuto (${state.exchangeCount[hId]}/3 prima che tornino neutrali).`);
    }
    updateHUD(); saveGame();
  }

  // ══════════════════════════════════════════════
  // PLAYER REQUESTS RESOURCES FROM ALLY
  // ══════════════════════════════════════════════
  function showRequestResourcesOverlay(hId, h) {
    const existing = document.getElementById('req-resources-overlay');
    if (existing) existing.remove();

    const resOptions = [
      { res: 'gold',   label: 'Oro',     icon: '💰' },
      { res: 'army',   label: 'Soldati', icon: '⚔'  },
      { res: 'people', label: 'Popolo',  icon: '👥'  },
      { res: 'faith',  label: 'Fede',    icon: '✝'   },
    ];

    // Ally decides how much they're willing to give (based on their army/relations)
    const generosity = 0.15 + Math.random() * 0.20; // 15-35% of a base 50
    const baseGift = Math.floor(50 * generosity);
    const gift = Math.max(5, Math.min(25, baseGift));

    // Random resource they can offer
    const offered = rand(resOptions);

    // What do they want in return? (50% chance of asking for something)
    const wantsReturn = Math.random() < 0.55;
    const returnRes = wantsReturn ? rand(resOptions.filter(r => r.res !== offered.res)) : null;
    const returnAmt = returnRes ? Math.floor(gift * 0.6 + 3) : 0;
    const canAffordReturn = returnRes ? state.resources[returnRes.res] >= returnAmt : true;

    const conditionHtml = returnRes
      ? `<p>«Vi manderemo <strong style="color:#4ade80">${offered.icon} ${gift} ${offered.label}</strong>, ma in cambio vogliamo <strong style="color:#f87171">${returnRes.icon} ${returnAmt} ${returnRes.label}</strong>.</p>
         <p style="font-size:0.82rem;color:#9a8a6a;margin-top:0.4rem">Avete: ${returnRes.icon} ${Math.round(state.resources[returnRes.res])} — ${canAffordReturn ? '<span style="color:#4ade80">✓ sufficiente</span>' : '<span style="color:#f87171">✗ insufficiente</span>'}</p>`
      : `<p>«Siete nostri alleati. Vi mandiamo <strong style="color:#4ade80">${offered.icon} ${gift} ${offered.label}</strong> senza chiedere nulla in cambio. Per ora.»</p>`;

    const acceptBtn = canAffordReturn || !returnRes
      ? `<button onclick="Game.acceptAllyResourceGift('${hId}','${offered.res}',${gift},'${returnRes?.res||''}',${returnAmt})" style="flex:1;padding:0.7rem;background:linear-gradient(135deg,#14532d,#16a34a);border:none;border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;color:#fff">✓ Accetta</button>`
      : `<button disabled style="flex:1;padding:0.7rem;background:rgba(80,80,80,0.2);border:1px solid #444;border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;color:#555;cursor:not-allowed">✗ Non puoi permettertelo</button>`;

    const overlay = document.createElement('div');
    overlay.id = 'req-resources-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:625;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;backdrop-filter:blur(4px);';
    overlay.innerHTML = `
      <div style="background:#12121a;border:1px solid rgba(201,168,76,0.5);border-radius:6px;width:92%;max-width:420px;padding:1.6rem;font-family:'Cinzel',serif;">
        <div style="font-family:'Cinzel Decorative',serif;color:#c9a84c;font-size:0.9rem;margin-bottom:0.35rem">${h.icon} Richiesta a Casa ${h.name}</div>
        <div style="font-size:0.7rem;color:#9a8a6a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.85rem">Richiesta di risorse</div>
        <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:4px;padding:0.85rem;margin-bottom:1rem;font-family:'EB Garamond',serif;font-size:0.92rem;color:#e8dcc8;line-height:1.6">
          ${conditionHtml}
        </div>
        <div style="display:flex;gap:0.75rem">
          ${acceptBtn}
          <button onclick="document.getElementById('req-resources-overlay').remove()" style="flex:1;padding:0.7rem;background:transparent;border:1px solid rgba(201,168,76,0.4);border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;color:#c9a84c">Annulla</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  function acceptAllyResourceGift(hId, gainRes, gainAmt, costRes, costAmt) {
    document.getElementById('req-resources-overlay')?.remove();
    const h = state.houses[hId];
    if (!h) return;
    state.resources[gainRes] = Math.min(getResourceCap(), state.resources[gainRes] + gainAmt);
    if (costRes && costAmt > 0) {
      state.resources[costRes] = Math.max(0, state.resources[costRes] - costAmt);
    }
    state.resources.power = clamp(state.resources.power + 3);
    showToast(`📦 Casa ${h.name} vi invia le risorse richieste.`, 'good');
    updateHUD(); saveGame();
    toggleDiplomacy();
  }

  // Ally proactively asks YOU for resources (called periodically)
  function checkAllyResourceRequests() {
    if (!state.turn || state.turn < 10) return;
    const allies = Object.entries(state.houses).filter(([, h]) => h.status === 'ally' && !h.suppressed);
    if (allies.length === 0) return;
    if (!state.allyResourceRequestCooldown) state.allyResourceRequestCooldown = {};

    allies.forEach(([hId, h]) => {
      const lastReq = state.allyResourceRequestCooldown[hId] || 0;
      if (state.turn - lastReq < 12) return; // max once every 12 turns per ally
      if (Math.random() > 0.06) return; // ~6% chance per turn
      state.allyResourceRequestCooldown[hId] = state.turn;

      const resOptions = [
        { res: 'gold',   label: 'Oro',    icon: '💰', amount: Math.floor(8 + Math.random() * 10) },
        { res: 'army',   label: 'Soldati',icon: '⚔',  amount: Math.floor(6 + Math.random() * 8)  },
        { res: 'faith',  label: 'Fede',   icon: '✝',  amount: Math.floor(5 + Math.random() * 8)  },
      ];
      const req = rand(resOptions);

      state.eventQueue.push({
        id: 'ally_resource_request_' + hId + '_' + state.turn,
        speaker: `Casa ${h.name}`,
        speakerRole: 'Richiesta di aiuto dall\'alleato',
        portrait: h.icon, icon: h.icon,
        text: `Casa ${h.name} è in difficoltà e vi chiede ${req.icon} ${req.amount} ${req.label}. Aiutarli rafforza il vostro patto; rifiutare indebolisce la fiducia.`,
        leftText: 'Non possiamo permettercelo',
        leftEffects: { power: -6 },
        rightText: `Invia ${req.icon} ${req.amount} ${req.label}`,
        rightEffects: { [req.res]: -req.amount, power: +10 },
        tags: ['help_ally'],
        onLeftChoose: () => {
          if (!state.exchangeCount) state.exchangeCount = {};
          state.exchangeCount[hId] = (state.exchangeCount[hId] || 0) + 1;
          if (state.exchangeCount[hId] >= 3) {
            h.status = 'neutral';
            showToast(`😤 Casa ${h.name} è stanca dei vostri rifiuti. Tornano neutrali.`, 'warn');
          }
        },
      });
    });
  }

  // ══════════════════════════════════════════════
  // THRONE CHALLENGE SYSTEM
  // ══════════════════════════════════════════════

  function challengeKing() {
    if (state.isPlayerKing) {
      showToast('👑 Sei già il Re Reggente!', 'warn');
      return;
    }

    // Hard requirement checks
    const activeAlliesCount = Object.values(state.houses).filter(h => h.status === 'ally').length;
    if (state.resources.army <= 70) {
      showToast('⚔ Devi avere Esercito >70 per sfidare il Re!', 'warn');
      return;
    }
    if (activeAlliesCount < 2) {
      showToast('🤝 Devi avere almeno 2 casate alleate per sfidare il Re!', 'warn');
      return;
    }

    // Political cost: declaring intention scares people
    state.resources.people = clamp(state.resources.people - 12);
    showToast('📣 La notizia della tua sfida al Re si diffonde… il popolo è in fermento. (-12 Popolo)', 'warn');

    // Calculate forces — king is MUCH stronger now
    const diff = state.character.difficulty;
    // King baseline is stronger: easy 1.2x, medium 1.6x, hard 2.0x
    const diffMod = { easy: 1.20, medium: 1.60, hard: 2.00 }[diff] || 1.60;

    const kingBaseArmy = (state.kingArmy || 75) * diffMod;
    const kingAllyBonus = Object.entries(state.houses)
      .filter(([id, h]) => h.status === 'enemy' && id === state.kingHouseAffiliation)
      .reduce((sum, [, h]) => sum + h.army * 0.3, 0)
      + Object.entries(state.houses)
        .filter(([id, h]) => id !== state.kingHouseAffiliation && h.status === 'enemy')
        .reduce((sum, [, h]) => sum + h.army * 0.15, 0);
    const kingForce = kingBaseArmy + kingAllyBonus;

    // Ally betrayal mechanic: each ally has a chance to go neutral
    const allyHouses = Object.entries(state.houses).filter(([, h]) => h.status === 'ally');
    const betrayalChance = { easy: 0.10, medium: 0.20, hard: 0.35 }[diff] || 0.20;
    const neutralizedAllies = [];
    allyHouses.forEach(([id, h]) => {
      if (Math.random() < betrayalChance) {
        neutralizedAllies.push(h.name);
      }
    });

    const activeAllies = allyHouses.filter(([, h]) => !neutralizedAllies.includes(h.name));
    const playerAllyBonus = activeAllies.reduce((sum, [, h]) => sum + h.army * 0.4, 0);
    const playerForce = state.resources.army + playerAllyBonus;

    // Show pre-battle confirmation overlay
    showThroneConfirmation(playerForce, kingForce, neutralizedAllies, diffMod);
  }

  function showThroneConfirmation(playerForce, kingForce, neutralizedAllies, diffMod) {
    const existing = document.getElementById('throne-confirm-overlay');
    if (existing) existing.remove();

    const winPct = Math.round(Math.min(95, Math.max(5, (playerForce / (playerForce + kingForce)) * 100)));
    const barWidth = Math.round((playerForce / Math.max(playerForce, kingForce)) * 100);
    const enemyBarWidth = Math.round((kingForce / Math.max(playerForce, kingForce)) * 100);
    const diffLabel = { easy: 'Facile (-20% Re)', medium: 'Medio', hard: 'Difficile (+25% Re)' }[state.character.difficulty] || 'Medio';
    const betrayalNote = neutralizedAllies.length > 0
      ? `<p style="color:#f87171;margin-top:0.5rem">⚠ Casa ${neutralizedAllies.join(', ')} resta neutrale — troppo rischioso schierarsi.</p>`
      : `<p style="color:#4ade80;margin-top:0.5rem">✅ Tutti i tuoi alleati sono pronti a combattere.</p>`;

    const overlay = document.createElement('div');
    overlay.id = 'throne-confirm-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:600;
      display:flex;align-items:center;justify-content:center;
      animation:fadeIn 0.3s ease;backdrop-filter:blur(4px);
    `;
    overlay.innerHTML = `
      <div style="
        background:#12121a;border:2px solid rgba(201,168,76,0.6);border-radius:6px;
        width:92%;max-width:460px;padding:1.75rem;font-family:'Cinzel',serif;
      ">
        <div style="text-align:center;margin-bottom:1.25rem">
          <div style="font-family:'Cinzel Decorative',serif;color:#c9a84c;font-size:1.1rem">⚔ Sfida al Trono</div>
          <div style="font-size:0.72rem;color:#9a8a6a;margin-top:0.3rem;letter-spacing:0.08em;text-transform:uppercase">Difficoltà: ${diffLabel}</div>
        </div>

        <div style="margin-bottom:1.25rem">
          <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:#e8dcc8;margin-bottom:0.4rem">
            <span>🗡 Le tue forze: <strong style="color:#4ade80">${Math.round(playerForce)}</strong></span>
            <span>🛡 Forze del Re: <strong style="color:#f87171">${Math.round(kingForce)}</strong></span>
          </div>
          <div style="display:flex;gap:3px;height:14px;border-radius:4px;overflow:hidden;background:rgba(255,255,255,0.05)">
            <div style="width:${barWidth}%;background:linear-gradient(90deg,#166534,#4ade80);transition:width 0.5s;border-radius:4px 0 0 4px"></div>
            <div style="width:${enemyBarWidth}%;background:linear-gradient(90deg,#991b1b,#f87171);transition:width 0.5s;border-radius:0 4px 4px 0;margin-left:auto"></div>
          </div>
          <div style="text-align:center;font-size:0.75rem;color:#c9a84c;margin-top:0.5rem">
            Probabilità di vittoria stimata: <strong>${winPct}%</strong>
          </div>
          ${betrayalNote}
        </div>

        <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:4px;padding:0.75rem;margin-bottom:1.25rem;font-family:'EB Garamond',serif;font-size:0.9rem;color:#e8dcc8;line-height:1.6">
          <strong style="color:#c9a84c">Se vinci:</strong> diventi il nuovo Re Reggente. Le alleanze del vecchio re diventano tue nemiche.<br>
          <strong style="color:#f87171">Se perdi:</strong> perdi ${state.character.difficulty === 'easy' ? '-25' : state.character.difficulty === 'medium' ? '-35' : '-45'} Esercito e il Re ti dichiarerà nemico giurato.
        </div>

        <div style="display:flex;gap:0.75rem">
          <button onclick="document.getElementById('throne-confirm-overlay').remove();Game.executeThroneAttack(${Math.round(playerForce)},${Math.round(kingForce)})" style="
            flex:1;padding:0.75rem;background:linear-gradient(135deg,#7f1d1d,#dc2626);
            border:none;border-radius:2px;font-family:'Cinzel',serif;font-size:0.75rem;
            font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#fff;
          ">⚔ Attacca il Trono</button>
          <button onclick="document.getElementById('throne-confirm-overlay').remove()" style="
            flex:1;padding:0.75rem;background:transparent;
            border:1px solid rgba(201,168,76,0.4);border-radius:2px;font-family:'Cinzel',serif;font-size:0.75rem;
            font-weight:600;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#c9a84c;
          ">Ritira l'Offensiva</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function executeThroneAttack(playerForce, kingForce) {
    showThroneAttackAnimation(playerForce, kingForce, (won, survived) => {
      _resolveThroneAttack(won, playerForce, kingForce, survived);
    });
  }

  // ══════════════════════════════════════════════
  // THRONE BATTLE — animazione epica dedicata
  // ══════════════════════════════════════════════
  function showThroneAttackAnimation(playerForce, kingForce, onComplete) {
    if (typeof AudioManager !== 'undefined') AudioManager.playWar();

    const kingName = state.kingName || 'Il Re';
    const kingIcon = (window.POSSIBLE_KINGS || []).find ? '👑' : '👑';
    const charIcon = state.character?.icon || '⚔️';

    // CSS keyframes iniettati una volta sola
    if (!document.getElementById('throne-battle-style')) {
      const s = document.createElement('style');
      s.id = 'throne-battle-style';
      s.textContent = `
        @keyframes tb-flicker {
          0%,100%{opacity:1} 45%{opacity:0.7} 55%{opacity:0.9} 70%{opacity:0.6}
        }
        @keyframes tb-ember {
          0%   { transform:translateY(0) translateX(0) scale(1);   opacity:0.9; }
          100% { transform:translateY(-120px) translateX(var(--dx)) scale(0.2); opacity:0; }
        }
        @keyframes tb-shake {
          0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)}
          40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)}
        }
        @keyframes tb-pulse-gold {
          0%,100%{text-shadow:0 0 20px rgba(201,168,76,0.4)}
          50%{text-shadow:0 0 60px rgba(201,168,76,1),0 0 100px rgba(201,168,76,0.5)}
        }
        @keyframes tb-pulse-red {
          0%,100%{text-shadow:0 0 20px rgba(220,38,38,0.4)}
          50%{text-shadow:0 0 60px rgba(220,38,38,1),0 0 100px rgba(220,38,38,0.5)}
        }
        @keyframes tb-fadeup {
          from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)}
        }
        @keyframes tb-crown-drop {
          0%  {opacity:0;transform:translateY(-40px) scale(0.6) rotate(-15deg)}
          60% {transform:translateY(6px) scale(1.15) rotate(4deg)}
          100%{opacity:1;transform:translateY(0) scale(1) rotate(0deg)}
        }
        @keyframes tb-skull-drop {
          0%  {opacity:0;transform:scale(0.3) rotate(20deg)}
          70% {transform:scale(1.2) rotate(-5deg)}
          100%{opacity:1;transform:scale(1) rotate(0deg)}
        }
        @keyframes tb-bg-pulse {
          0%,100%{background-position:0% 50%} 50%{background-position:100% 50%}
        }
        .tb-ember-particle {
          position:absolute; font-size:0.7rem; pointer-events:none;
          animation: tb-ember 1.8s ease-out forwards;
        }
      `;
      document.head.appendChild(s);
    }

    const overlay = document.createElement('div');
    overlay.id = 'throne-battle-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:750;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      font-family:'Cinzel',serif;overflow:hidden;
      background: linear-gradient(135deg,#0d0208 0%,#1a0510 25%,#0a0005 50%,#1a0a00 75%,#0d0208 100%);
      background-size:400% 400%;
      animation: tb-bg-pulse 8s ease infinite;
    `;

    // Particelle brace/fuoco di sfondo
    function spawnEmbers(container, count) {
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          if (!document.getElementById('throne-battle-overlay')) return;
          const e = document.createElement('span');
          e.className = 'tb-ember-particle';
          const embers = ['🔥','✨','💥','⚡','🌟'];
          e.textContent = embers[Math.floor(Math.random() * embers.length)];
          const dx = (Math.random() - 0.5) * 80;
          e.style.cssText = `left:${10 + Math.random()*80}%;bottom:${5 + Math.random()*30}%;--dx:${dx}px;animation-duration:${1.4+Math.random()*1.2}s;animation-delay:0s;`;
          container.appendChild(e);
          setTimeout(() => e.remove(), 2800);
        }, i * 180);
      }
    }

    // Costruisci truppe (più grandi e drammatiche per il trono)
    const playerCount = Math.min(12, Math.max(4, Math.floor(playerForce / 7)));
    const enemyCount  = Math.min(12, Math.max(4, Math.floor(kingForce  / 7)));
    const playerIcons = ['⚔️','🗡️','🛡️','🏹','⚔️','🗡️'];
    const enemyIcons  = ['👑','🏹','🛡️','⚔️','🗡️','🏹'];

    function makeTroops(count, icons, side) {
      let html = '';
      for (let i = 0; i < count; i++) {
        html += `<span class="troop-unit" id="th-${side}-t${i}" style="font-size:1.3rem;transition:opacity 0.5s ease ${i*25}ms">${icons[i % icons.length]}</span>`;
      }
      return html;
    }

    overlay.innerHTML = `
      <!-- Sfondo drammatico con vignette -->
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 30%,rgba(0,0,0,0.7) 100%);pointer-events:none;z-index:1"></div>

      <!-- Linee decorative orizzontali -->
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.6),transparent);z-index:2"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.6),transparent);z-index:2"></div>

      <!-- Contenuto principale -->
      <div style="position:relative;z-index:10;width:100%;max-width:540px;padding:0 1rem;display:flex;flex-direction:column;align-items:center;gap:0.6rem" id="throne-main">

        <!-- Titolo epico -->
        <div id="tb-headline" style="font-family:'Cinzel Decorative',serif;font-size:1.05rem;color:#c9a84c;letter-spacing:0.12em;text-align:center;animation:tb-pulse-gold 2.5s ease infinite">
          ⚔ SFIDA AL TRONO DI SPADE ⚔
        </div>

        <!-- Contendenti -->
        <div style="display:flex;align-items:center;justify-content:space-between;width:100%;margin:0.3rem 0">
          <div style="text-align:center;flex:1">
            <div style="font-size:2.2rem;animation:tb-pulse-gold 2s ease infinite">${charIcon}</div>
            <div style="font-size:0.68rem;color:#4ade80;letter-spacing:0.08em;margin-top:0.2rem">${state.character?.name?.split(' ')[0] || 'Tu'}</div>
            <div style="font-size:0.62rem;color:#9a8a6a">Forze: <strong style="color:#4ade80" id="tb-player-num">${Math.round(playerForce)}</strong></div>
          </div>
          <div style="text-align:center;flex:0 0 auto;padding:0 0.5rem">
            <div style="font-family:'Cinzel Decorative',serif;font-size:1.4rem;color:#c9a84c;animation:tb-flicker 1.5s ease infinite">VS</div>
          </div>
          <div style="text-align:center;flex:1">
            <div style="font-size:2.2rem;animation:tb-pulse-red 2s ease infinite">👑</div>
            <div style="font-size:0.68rem;color:#f87171;letter-spacing:0.08em;margin-top:0.2rem">${kingName.split(' ').slice(-1)[0]}</div>
            <div style="font-size:0.62rem;color:#9a8a6a">Forze: <strong style="color:#f87171" id="tb-enemy-num">${Math.round(kingForce)}</strong></div>
          </div>
        </div>

        <!-- Barre forze (più alte e drammatiche) -->
        <div style="display:flex;width:100%;gap:3px;height:10px;border-radius:5px;overflow:hidden;background:rgba(255,255,255,0.04);border:1px solid rgba(201,168,76,0.15)">
          <div id="tb-player-bar" style="height:100%;width:50%;background:linear-gradient(90deg,#166534,#4ade80);border-radius:5px 0 0 5px;transition:width 0.9s ease;box-shadow:0 0 8px rgba(74,222,128,0.5)"></div>
          <div id="tb-enemy-bar"  style="height:100%;width:50%;background:linear-gradient(90deg,#991b1b,#f87171);border-radius:0 5px 5px 0;transition:width 0.9s ease;box-shadow:0 0 8px rgba(248,113,113,0.5);margin-left:auto"></div>
        </div>

        <!-- Campo di battaglia -->
        <div style="width:100%;background:linear-gradient(180deg,#1a0a08 0%,#100604 60%,#1a0e06 100%);border:1px solid rgba(201,168,76,0.25);border-radius:4px;padding:0.5rem 0.4rem;min-height:70px;position:relative;overflow:hidden" id="tb-field">
          <!-- Fiamme di sfondo -->
          <div style="position:absolute;bottom:0;left:0;right:0;height:16px;background:linear-gradient(0deg,rgba(220,60,0,0.25),transparent);pointer-events:none"></div>
          <!-- Truppe giocatore -->
          <div style="display:flex;flex-wrap:wrap;gap:1px;margin-bottom:4px" id="tb-player-troops">
            ${makeTroops(playerCount, playerIcons, 'p')}
          </div>
          <!-- Divisore -->
          <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent);margin:2px 0"></div>
          <!-- Truppe nemiche (invertite) -->
          <div style="display:flex;flex-wrap:wrap;gap:1px;justify-content:flex-end;margin-top:4px" id="tb-enemy-troops">
            ${makeTroops(enemyCount, enemyIcons, 'e')}
          </div>
          <!-- Flash scontro -->
          <div id="tb-clash-flash" style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(255,140,0,0.6) 0%,transparent 70%);opacity:0;pointer-events:none;transition:opacity 0.15s"></div>
        </div>

        <!-- Log narrativo -->
        <div id="tb-log" style="min-height:2.8rem;font-family:'EB Garamond',serif;font-size:0.95rem;color:#e8dcc8;font-style:italic;text-align:center;line-height:1.55;animation:tb-fadeup 0.4s ease"></div>

        <!-- Pulsanti -->
        <div id="tb-btns" style="display:flex;gap:0.75rem;margin-top:0.2rem">
          <button id="tb-retreat-btn" onclick="Game._battleRetreat()" style="padding:0.6rem 1.3rem;background:transparent;border:1px solid rgba(201,168,76,0.45);border-radius:3px;font-family:'Cinzel',serif;font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#c9a84c">
            🏃 Ritirata
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Lancia le prime braci
    spawnEmbers(overlay, 12);

    // ── simulazione battaglia ──────────────────────────────
    let pForce = playerForce;
    let eForce = kingForce;
    let pAlive = playerCount;
    let eAlive = enemyCount;
    let round  = 0;
    const MAX_ROUNDS = 7;

    const throneLogs = [
      `Le vostre armate avanzano su Approdo del Re. Il Trono di Spade è in vista.`,
      `${kingName} manda i suoi cavalieri d'élite — gli scontri sono brutali.`,
      `Le mura della Fortezza Rossa risuonano di acciaio e grida di guerra.`,
      `La Guardia Reale protegge il Re con ferocia disperata. Ogni passo costa sangue.`,
      `${kingName} stesso scende in campo — la battaglia raggiunge il suo apice.`,
      `Il fumo oscura il cielo sopra Approdo del Re. Il destino si decide ora.`,
      `Un ultimo assalto. Il Trono di Spade appartiene a chi sopravvive.`,
    ];

    // Ritirata per battaglia trono
    Game._battleRetreatFn = () => {
      clearTimeout(Game._battleTimer);
      const btn = document.getElementById('tb-retreat-btn');
      if (btn) btn.disabled = true;
      const survivorPct = 0.35 + Math.random() * 0.20;
      const survived = Math.max(5, Math.round(pForce * survivorPct));
      document.getElementById('tb-headline').textContent = '🏃 RITIRATA DALLA CAPITALE!';
      document.getElementById('tb-log').textContent = `Le truppe si ritirano sotto una pioggia di frecce. Superstiti: ${survived}`;
      document.getElementById('tb-btns').innerHTML = `
        <button onclick="if(typeof AudioManager!=='undefined')AudioManager.playMainFromWar();document.getElementById('throne-battle-overlay').remove();Game._battleRetreatFinish(${survived})"
          style="padding:0.65rem 1.8rem;background:linear-gradient(135deg,#78350f,#c9a84c);border:none;border-radius:3px;font-family:'Cinzel',serif;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#0a0a0f">
          Continua
        </button>`;
      for (let i = Math.floor(pAlive * survivorPct); i < pAlive; i++) {
        const t = document.getElementById(`th-p-t${i}`);
        if (t) t.classList.add('dying');
      }
    };
    Game._battleRetreat = Game._battleRetreatFn;

    function killTroops(side, count) {
      const prefix = side === 'player' ? 'th-p' : 'th-e';
      const alive   = side === 'player' ? pAlive : eAlive;
      for (let i = alive - 1; i >= Math.max(0, alive - count); i--) {
        const t = document.getElementById(`${prefix}-t${i}`);
        if (t) {
          t.classList.add('dying');
          setTimeout(() => { if (t) t.style.display = 'none'; }, 500);
        }
      }
      if (side === 'player') pAlive = Math.max(0, pAlive - count);
      else                   eAlive = Math.max(0, eAlive - count);
    }

    function runRound() {
      if (round >= MAX_ROUNDS || pForce <= 0 || eForce <= 0) {
        finalizeThroneBattle();
        return;
      }

      // Danni più intensi in battaglia al trono
      const pDmg = eForce * (0.10 + Math.random() * 0.12);
      const eDmg = pForce * (0.10 + Math.random() * 0.12);
      pForce = Math.max(0, pForce - pDmg);
      eForce = Math.max(0, eForce - eDmg);

      // Barre
      const pPct = Math.round((pForce / playerForce) * 100);
      const ePct = Math.round((eForce / kingForce)   * 100);
      const pb = document.getElementById('tb-player-bar');
      const eb = document.getElementById('tb-enemy-bar');
      if (pb) pb.style.width = pPct + '%';
      if (eb) eb.style.width = ePct + '%';
      const pn = document.getElementById('tb-player-num');
      const en = document.getElementById('tb-enemy-num');
      if (pn) pn.textContent = Math.round(pForce);
      if (en) en.textContent = Math.round(eForce);

      // Uccidi truppe
      const pKill = Math.max(0, Math.min(pAlive, Math.round((pDmg / playerForce) * playerCount)));
      const eKill = Math.max(0, Math.min(eAlive, Math.round((eDmg / kingForce)   * enemyCount)));
      if (pKill > 0) killTroops('player', pKill);
      if (eKill > 0) killTroops('enemy',  eKill);

      // Flash scontro più intenso
      const flash = document.getElementById('tb-clash-flash');
      if (flash) {
        flash.style.opacity = '1';
        setTimeout(() => { if (flash) flash.style.opacity = '0'; }, 350);
      }

      // Trema lo schermo nei round finali
      if (round >= 4) {
        const field = document.getElementById('tb-field');
        if (field) {
          field.style.animation = 'tb-shake 0.4s ease';
          setTimeout(() => { if (field) field.style.animation = ''; }, 400);
        }
      }

      // Log narrativo
      const logEl = document.getElementById('tb-log');
      if (logEl) {
        logEl.style.animation = 'none';
        void logEl.offsetWidth;
        logEl.textContent = throneLogs[round] || '…';
        logEl.style.animation = 'tb-fadeup 0.4s ease';
      }

      // Nuove braci ogni round
      spawnEmbers(overlay, 5);

      round++;
      Game._battleTimer = setTimeout(runRound, 1800);
    }

    function finalizeThroneBattle() {
      const btn = document.getElementById('tb-retreat-btn');
      if (btn) btn.remove();

      const won      = pForce > eForce;
      const survived = won
        ? Math.max(5, Math.round(pForce * 0.85))
        : Math.max(5, Math.round(pForce * 0.30));

      // Spawn massiccio di braci nel risultato
      spawnEmbers(overlay, 25);

      const headline = document.getElementById('tb-headline');
      const log      = document.getElementById('tb-log');
      if (headline) {
        headline.style.animation = won ? 'tb-crown-drop 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards, tb-pulse-gold 2s ease 0.8s infinite' : 'tb-skull-drop 0.6s ease forwards, tb-pulse-red 2s ease 0.6s infinite';
        headline.style.fontSize = '1.3rem';
        headline.textContent = won ? '👑 IL TRONO È TUO!' : '💀 LA RIBELLIONE FALLISCE';
        headline.style.color  = won ? '#c9a84c' : '#dc2626';
      }
      if (log) {
        setTimeout(() => {
          if (log) {
            log.style.animation = 'tb-fadeup 0.5s ease';
            log.textContent = won
              ? `${kingName} è caduto. Il Trono di Spade è vostro. Superstiti: ${survived}.`
              : `Le vostre truppe sono sopraffatte. La ribellione è soffocata. Superstiti: ${survived}.`;
          }
        }, 600);
      }

      const btns = document.getElementById('tb-btns');
      if (btns) {
        setTimeout(() => {
          btns.innerHTML = `
            <button onclick="${won
              ? `document.getElementById('throne-battle-overlay').remove();Game._battleCompleteFn(${survived})`
              : `if(typeof AudioManager!=='undefined')AudioManager.playMainFromWar();document.getElementById('throne-battle-overlay').remove();Game._battleCompleteFn(${survived})`
            }" style="padding:0.7rem 2rem;background:linear-gradient(135deg,${won ? '#78350f,#c9a84c' : '#7f1d1d,#dc2626'});border:none;border-radius:3px;font-family:'Cinzel Decorative',serif;font-size:0.8rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;color:${won ? '#0a0a0f' : '#fff'};box-shadow:0 4px 20px rgba(${won ? '201,168,76' : '220,38,38'},0.4)">
              ${won ? '👑 Prendi il Trono' : '💀 Continua'}
            </button>`;
        }, 900);
      }

      Game._battleCompleteFn = (survived) => onComplete(won, survived);
    }

    Game._battleCompleteFn = (survived) => onComplete(playerForce > kingForce, survived);
    Game._battleTimer = setTimeout(runRound, 1000);
  }

  function showBattleAnimation(playerForce, kingForce, onComplete, retreatCallback) {
    // onComplete(survived) — survived = player army remaining after battle
    // retreatCallback(survived) — called if player retreats
    if (typeof AudioManager !== 'undefined') AudioManager.playWar();

    const overlay = document.createElement('div');
    overlay.id = 'battle-anim-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(5,2,2,0.97);z-index:700;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      font-family:'Cinzel',serif;overflow:hidden;
    `;

    // --- build troop icons ---
    const playerCount = Math.min(16, Math.max(4, Math.floor(playerForce / 6)));
    const enemyCount  = Math.min(16, Math.max(4, Math.floor(kingForce  / 6)));
    const playerIcons = ['🗡️','⚔️','🛡️','🏹','⚔️','🗡️','🛡️','🏹'];
    const enemyIcons  = ['🏹','🛡️','⚔️','🗡️','🏹','🛡️','⚔️','🗡️'];

    function makeTroops(count, icons, side) {
      let html = '';
      for (let i = 0; i < count; i++) {
        const icon = icons[i % icons.length];
        html += `<span class="troop-unit" id="${side}-t${i}" style="transition:opacity 0.5s ease ${i*30}ms">${icon}</span>`;
      }
      return html;
    }

    overlay.innerHTML = `
      <div style="text-align:center;margin-bottom:0.8rem">
        <div style="font-family:'Cinzel Decorative',serif;font-size:1rem;color:#c9a84c;letter-spacing:0.1em" id="battle-headline">⚔ LA BATTAGLIA HA INIZIO</div>
        <div style="font-size:0.75rem;color:#9a8a6a;margin-top:0.3rem" id="battle-subline">Le armate si preparano allo scontro…</div>
      </div>

      <!-- BATTLEFIELD -->
      <div class="battle-canvas-wrap">
        <div class="battle-field" id="battle-field">
          <div class="battle-ground"></div>
          <div class="battle-clash-flash" id="clash-flash"></div>
          <!-- Player troops (left) -->
          <div class="battle-troops player-side" id="player-troops" style="left:6px">
            ${makeTroops(playerCount, playerIcons, 'p')}
          </div>
          <!-- Enemy troops (right) -->
          <div class="battle-troops enemy-side" id="enemy-troops" style="right:6px">
            ${makeTroops(enemyCount, enemyIcons, 'e')}
          </div>
        </div>

        <!-- Force bars -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.5rem;gap:0.5rem">
          <div style="flex:1">
            <div style="font-size:0.65rem;color:#4ade80;letter-spacing:0.08em;margin-bottom:0.2rem">⚔ TUE FORZE: <strong id="player-force-label">${Math.round(playerForce)}</strong></div>
            <div style="height:6px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden">
              <div id="player-bar" style="height:100%;width:100%;background:linear-gradient(90deg,#166534,#4ade80);border-radius:3px;transition:width 0.8s ease"></div>
            </div>
          </div>
          <div style="font-size:1.1rem;color:#c9a84c">⚔</div>
          <div style="flex:1;text-align:right">
            <div style="font-size:0.65rem;color:#f87171;letter-spacing:0.08em;margin-bottom:0.2rem">FORZE NEMICHE: <strong id="enemy-force-label">${Math.round(kingForce)}</strong></div>
            <div style="height:6px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden">
              <div id="enemy-bar" style="height:100%;width:100%;background:linear-gradient(90deg,#f87171,#991b1b);border-radius:3px;transition:width 0.8s ease;margin-left:auto"></div>
            </div>
          </div>
        </div>

        <!-- Battle log -->
        <div id="battle-log" style="margin-top:0.75rem;min-height:2.8rem;font-family:'EB Garamond',serif;font-size:0.88rem;color:#e8dcc8;font-style:italic;text-align:center;line-height:1.5"></div>
      </div>

      <!-- Action buttons -->
      <div id="battle-btns" style="display:flex;gap:0.75rem;margin-top:0.9rem">
        <button id="btn-retreat" onclick="Game._battleRetreat()" style="padding:0.65rem 1.4rem;background:transparent;border:1px solid rgba(201,168,76,0.5);border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#c9a84c">
          🏃 Ritirata
        </button>
      </div>
    `;
    document.body.appendChild(overlay);

    // --- battle simulation ---
    let pForce = playerForce;
    let eForce = kingForce;
    let pAlive = playerCount;
    let eAlive = enemyCount;
    let round   = 0;
    const maxRounds = 6;
    const battleLogs = [
      'La cavalleria carica — ferro contro ferro!',
      'Le frecce oscurano il cielo. Gli uomini cadono.',
      'Lo scontro si fa brutale. Nessuno cede.',
      'I comandanti si sfidano in prima linea.',
      'Le riserve entrano in campo — il destino si decide.',
      'Un ultimo scontro — chi sopravviverà?',
    ];

    // Store retreat callback on Game for button access
    Game._battleRetreatFn = () => {
      clearTimeout(Game._battleTimer);
      document.getElementById('btn-retreat').disabled = true;
      // Survivors: 40-65% of remaining player force
      const survivorPct = 0.40 + Math.random() * 0.25;
      const survived = Math.max(5, Math.round(pForce * survivorPct));
      document.getElementById('battle-headline').textContent = '🏃 RITIRATA!';
      document.getElementById('battle-subline').textContent = `Le truppe si ritirano in ordine. Superstiti: ${survived}`;
      document.getElementById('battle-btns').innerHTML = `
        <button onclick="if(typeof AudioManager!=='undefined')AudioManager.playMainFromWar();document.getElementById('battle-anim-overlay').remove();Game._battleRetreatFinish(${survived})" style="padding:0.65rem 1.8rem;background:linear-gradient(135deg,#78350f,#c9a84c);border:none;border-radius:3px;font-family:'Cinzel',serif;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#0a0a0f">
          Continua
        </button>`;
      // Animate surviving troops fading out
      for (let i = Math.floor(pAlive * survivorPct); i < pAlive; i++) {
        const t = document.getElementById(`p-t${i}`);
        if (t) t.classList.add('dying');
      }
    };

    Game._battleRetreat = Game._battleRetreatFn;

    function killTroops(side, count) {
      const prefix = side === 'player' ? 'p' : 'e';
      const alive = side === 'player' ? pAlive : eAlive;
      for (let i = alive - 1; i >= Math.max(0, alive - count); i--) {
        const t = document.getElementById(`${prefix}-t${i}`);
        if (t) {
          t.classList.add('dying');
          setTimeout(() => { if (t) t.style.display = 'none'; }, 500);
        }
      }
      if (side === 'player') pAlive = Math.max(0, pAlive - count);
      else                   eAlive = Math.max(0, eAlive - count);
    }

    function runRound() {
      if (round >= maxRounds || pForce <= 0 || eForce <= 0) {
        finalizeBattle();
        return;
      }

      // Each side deals ~12-20% of the other's force
      const pDmg = eForce * (0.12 + Math.random() * 0.10);
      const eDmg = pForce * (0.12 + Math.random() * 0.10);
      pForce = Math.max(0, pForce - pDmg);
      eForce = Math.max(0, eForce - eDmg);

      // Update bars
      const pPct = Math.round((pForce / playerForce) * 100);
      const ePct = Math.round((eForce / kingForce) * 100);
      document.getElementById('player-bar').style.width = pPct + '%';
      document.getElementById('enemy-bar').style.width  = ePct + '%';
      document.getElementById('player-force-label').textContent = Math.round(pForce);
      document.getElementById('enemy-force-label').textContent  = Math.round(eForce);

      // Kill troop units proportionally
      const pKill = Math.max(0, Math.min(pAlive, Math.round((pDmg / playerForce) * playerCount)));
      const eKill = Math.max(0, Math.min(eAlive, Math.round((eDmg / kingForce)   * enemyCount)));
      if (pKill > 0) killTroops('player', pKill);
      if (eKill > 0) killTroops('enemy',  eKill);

      // Clash flash
      const flash = document.getElementById('clash-flash');
      flash.classList.add('flash');
      setTimeout(() => flash.classList.remove('flash'), 400);

      // Log
      document.getElementById('battle-log').textContent = battleLogs[round] || '…';
      round++;

      Game._battleTimer = setTimeout(runRound, 1600);
    }

    function finalizeBattle() {
      document.getElementById('btn-retreat')?.remove();
      const won = pForce > eForce;
      const survived = won
        ? Math.max(5, Math.round(pForce * 0.85))
        : Math.max(5, Math.round(pForce * 0.30));

      document.getElementById('battle-headline').style.fontFamily = "'Cinzel Decorative',serif";
      document.getElementById('battle-headline').style.fontSize = '1.2rem';
      document.getElementById('battle-headline').textContent = won ? '🏆 VITTORIA!' : '💀 SCONFITTA!';
      document.getElementById('battle-headline').style.color  = won ? '#c9a84c' : '#dc2626';
      document.getElementById('battle-subline').textContent = won
        ? `Il nemico è in rotta. Superstiti: ${survived} soldati.`
        : `Le vostre truppe cedono. Superstiti: ${survived} soldati.`;

      document.getElementById('battle-btns').innerHTML = `
        <button onclick="if(typeof AudioManager!=='undefined')AudioManager.playMainFromWar();document.getElementById('battle-anim-overlay').remove();Game._battleCompleteFn(${survived})" style="padding:0.65rem 1.8rem;background:linear-gradient(135deg,${won ? '#14532d,#16a34a' : '#7f1d1d,#dc2626'});border:none;border-radius:3px;font-family:'Cinzel',serif;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#fff">
          Continua
        </button>`;

      Game._battleCompleteFn = (survived) => onComplete(won, survived);
    }

    // Save complete callback reference on Game
    Game._battleCompleteFn = (survived) => onComplete(playerForce > kingForce, survived);

    // Start after a short delay
    Game._battleTimer = setTimeout(runRound, 900);
  }

  function _resolveThroneAttack(won, playerForce, kingForce, survived) {
    const diff = state.character.difficulty;

    if (won) {
      // Player becomes king — set army to survivors
      const oldKingName = state.kingName;
      const charId = state.character.id;
      state.isPlayerKing = true;
      state.playerBecameKingTurn = state.turn;
      state.king = charId;
      state.kingName = state.character.name;

      // Old king's allies become enemies
      const oldKingHouseId = state.kingHouseAffiliation;
      Object.entries(state.houses).forEach(([id, h]) => {
        if (id === oldKingHouseId && h.status !== 'enemy') {
          h.status = 'enemy';
        }
      });

      // Army set to survivors + power boost
      state.resources.army = clamp(survived ?? Math.max(5, state.resources.army - 10));
      state.resources.power = clamp(state.resources.power + 20);
      state.decisionHistory.push({ turn: state.turn, cardId: 'throne_victory', choice: 'attack', tags: ['war_victory', 'throne_conquest'] });

      state._legitimacyQueued = state.turn + 5;
      showThroneResultOverlay(true, oldKingName, survived);
    } else {
      // Sconfitta contro il Re → fine partita
      state.decisionHistory.push({ turn: state.turn, cardId: 'throne_defeat', choice: 'attack', tags: ['war_choice', 'throne_defeat'] });
      if (typeof AudioManager !== 'undefined') AudioManager.playMainFromWar();
      triggerEnd(
        false,
        '💀',
        'La Ribellione è Soffocata',
        `${state.kingName} ha respinto la vostra ribellione con forza devastante. Le vostre truppe sono state annientate sul campo di battaglia. Come traditore catturato, siete stato condotto in catene ad Approdo del Re. La vostra testa ornò le mura della città come monito a chiunque osi sfidare il Trono di Spade.`
      );
    }

    updateHUD();
    saveGame();
  }

  // Retreat from throne battle
  Game._battleRetreatFinish = function(survived) {
    // Attacked and fled → king's house becomes enemy, army = survivors
    state.resources.army = clamp(survived);
    const oldKingHouseId = state.kingHouseAffiliation;
    if (state.houses[oldKingHouseId]) {
      state.houses[oldKingHouseId].status = 'enemy';
    }
    state.resources.power = clamp(state.resources.power - 8);
    state.decisionHistory.push({ turn: state.turn, cardId: 'throne_retreat', choice: 'retreat', tags: ['retreat'] });
    showToast(`🏃 Vi siete ritirati. Casa ${state.houses[oldKingHouseId]?.name || ''} vi considera ora nemici. Superstiti: ${survived}`, 'warn');
    updateHUD();
    saveGame();
    checkGameOver();
    if (!state.gameOver) drawNextCard();
  };

  const THRONE_LEGITIMACY_EVENT = {
    id: 'throne_legitimacy',
    speaker: 'Gran Maester', speakerRole: 'Consigliere del Trono',
    portrait: '📜', icon: '📜',
    text: "Da quando siede sul Trono di Spade, le grandi casate osservano. Il Gran Maester si presenta con una richiesta formale: «Le casate chiedono segni di legittimità. Un grande banchetto o una campagna di favori diplomatici rafforzerebbe il vostro diritto a regnare.»",
    leftText: 'Ignora la richiesta', leftEffects: { power: -14, people: -10 },
    rightText: 'Afferma la tua legittimità', rightEffects: { gold: -14, people: +14, faith: +10, power: +10 },
    tags: ['throne_legitimacy'],
  };

  function showThroneResultOverlay(won, kingName) {
    const overlay = document.createElement('div');
    overlay.className = 'war-overlay';
    const diff = state.character.difficulty;
    const armyLoss = { easy: 25, medium: 35, hard: 45 }[diff] || 35;

    // Vittoria sul Re → track-2 resta (sei Re, tensione alta)
    // Sconfitta       → torna track-1 (rientri nel gioco normale)
    const continuaOnclick = won
      ? `this.parentElement.remove();Game.checkAndContinue()`
      : `if(typeof AudioManager!=='undefined')AudioManager.playMainFromWar();this.parentElement.remove();Game.checkAndContinue()`;

    overlay.innerHTML = `
      <div class="war-title">${won ? '👑 IL TRONO È TUO' : '💀 LA RIBELLIONE FALLISCE'}</div>
      <div class="war-log">
        ${won ? `
          <p class="war-result war-victory">🏆 VITTORIA SUL RE!</p>
          <p><strong>${kingName}</strong> è stato spodestato. Sei il nuovo Re Reggente dei Sette Regni.</p>
          <p style="color:#fbbf24">⚠ Le casate fedeli al vecchio re sono ora tue nemiche.</p>
          <p style="color:#c9a84c">📜 Dopo 5 turni le casate chiederanno legittimità…</p>
        ` : `
          <p class="war-result war-defeat">💀 SCONFITTA!</p>
          <p><strong>${kingName}</strong> ha respinto la tua ribellione. Il tuo esercito ha subito perdite devastanti (−${armyLoss}).</p>
          <p style="color:#f87171">⚔ Il Re ti ha dichiarato nemico giurato.</p>
        `}
      </div>
      <button class="btn-primary" style="max-width:200px" onclick="${continuaOnclick}">Continua</button>
    `;
    document.body.appendChild(overlay);
  }

  // ══════════════════════════════════════════════
  // ALLY ARMY REQUEST SYSTEM
  // ══════════════════════════════════════════════

  // state.pendingWarTarget: houseId we are about to fight (set before ally request phase)
  // state.loanedArmy: total army loaned by allies for current war (reset after)
  // state.allyLoans: { houseId: { amount, pact } } — tracks who lent what

  function requestAllyArmy(hId) {
    // Called from diplomacy panel when player clicks "Richiedi Esercito" on an ally
    const h = state.houses[hId];
    if (!h || h.status !== 'ally') { showToast('Solo le casate alleate possono prestarti truppe.', 'warn'); return; }
    if (!state.pendingWarTarget) { showToast('Devi prima dichiarare guerra a una casata.', 'warn'); return; }
    if (state.allyLoans && state.allyLoans[hId]) { showToast(`Casa ${h.name} ha già risposto alla tua richiesta.`); return; }

    // How much can they lend? 20–50% of their army
    const lendPct = 0.2 + Math.random() * 0.3;
    const lendAmount = Math.floor(h.army * lendPct);

    // Decide: compenso in risorse OR patto di mutuo soccorso (50/50 weighted by house army)
    const wantsPact = Math.random() < 0.45;
    showAllyArmyRequestOverlay(hId, h, lendAmount, wantsPact);
  }

  function showAllyArmyRequestOverlay(hId, h, lendAmount, wantsPact) {
    const existing = document.getElementById('ally-army-overlay');
    if (existing) existing.remove();

    let conditionHtml, acceptBtn;
    if (wantsPact) {
      conditionHtml = `
        <p>«Vi presteremo <strong style="color:#4ade80">⚔ ${lendAmount} soldati</strong>, ma in cambio vogliamo un patto di sangue: se avremo bisogno del vostro esercito in futuro, dovrete rispondere senza esitare. Rompere il patto ci renderà vostri nemici per sempre.»</p>
        <p style="color:#f87171;font-size:0.82rem;margin-top:0.5rem">⚠ Se rifiuti quando ti chiedono aiuto → Casa ${h.name} diventa nemica permanente.</p>`;
      acceptBtn = `<button onclick="Game.acceptAllyLoan('${hId}',${lendAmount},true)" style="flex:1;padding:0.7rem;background:linear-gradient(135deg,#14532d,#16a34a);border:none;border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;color:#fff">⚔ Accetta il Patto</button>`;
    } else {
      // Resource compensation
      const resTypes = [
        { res: 'gold', label: 'oro', icon: '💰', amount: Math.floor(lendAmount * 0.3 + 5) },
        { res: 'people', label: 'popolo', icon: '👥', amount: Math.floor(lendAmount * 0.2 + 4) },
      ];
      const comp = resTypes[Math.floor(Math.random() * resTypes.length)];
      const canAfford = state.resources[comp.res] >= comp.amount;
      conditionHtml = `
        <p>«Vi presteremo <strong style="color:#4ade80">⚔ ${lendAmount} soldati</strong> in cambio di <strong style="color:#c9a84c">${comp.icon} ${comp.amount} ${comp.label}</strong> immediatamente.»</p>
        <p style="color:#9a8a6a;font-size:0.82rem;margin-top:0.4rem">Voi avete: ${comp.icon} ${Math.round(state.resources[comp.res])} — ${canAfford ? '<span style="color:#4ade80">✓ sufficiente</span>' : '<span style="color:#f87171">✗ insufficiente</span>'}</p>`;
      acceptBtn = canAfford
        ? `<button onclick="Game.acceptAllyLoan('${hId}',${lendAmount},false,'${comp.res}',${comp.amount})" style="flex:1;padding:0.7rem;background:linear-gradient(135deg,#14532d,#16a34a);border:none;border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;color:#fff">💰 Paga e Ottieni Truppe</button>`
        : `<button disabled style="flex:1;padding:0.7rem;background:rgba(80,80,80,0.2);border:1px solid #444;border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;color:#555;cursor:not-allowed">✗ Non puoi permettertelo</button>`;
    }

    const overlay = document.createElement('div');
    overlay.id = 'ally-army-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:650;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;backdrop-filter:blur(4px);';
    overlay.innerHTML = `
      <div style="background:#12121a;border:1px solid rgba(201,168,76,0.5);border-radius:6px;width:92%;max-width:430px;padding:1.75rem;font-family:'Cinzel',serif;">
        <div style="font-family:'Cinzel Decorative',serif;color:#c9a84c;font-size:0.95rem;margin-bottom:0.4rem">${h.icon} Casa ${h.name}</div>
        <div style="font-size:0.7rem;color:#9a8a6a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:1rem">Richiesta di rinforzi</div>
        <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:4px;padding:0.85rem;margin-bottom:1rem;font-family:'EB Garamond',serif;font-size:0.92rem;color:#e8dcc8;line-height:1.6">
          ${conditionHtml}
        </div>
        <div style="display:flex;gap:0.75rem">
          ${acceptBtn}
          <button onclick="document.getElementById('ally-army-overlay').remove()" style="flex:1;padding:0.7rem;background:transparent;border:1px solid rgba(201,168,76,0.4);border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;color:#c9a84c">Rifiuta</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  function acceptAllyLoan(hId, amount, isPact, resKey, resCost) {
    document.getElementById('ally-army-overlay')?.remove();
    const h = state.houses[hId];
    if (!h) return;

    if (!state.allyLoans) state.allyLoans = {};
    state.allyLoans[hId] = { amount, pact: isPact };
    state.loanedArmy = (state.loanedArmy || 0) + amount;

    if (!isPact && resKey && resCost) {
      state.resources[resKey] = clamp(state.resources[resKey] - resCost);
    }
    if (isPact) {
      if (!state.activePacts) state.activePacts = {};
      state.activePacts[hId] = true;
    }

    showToast(`⚔ Casa ${h.name} ti presta ${amount} soldati${isPact ? ' (patto di sangue)' : ''}!`, 'good');
    updateHUD();
    saveGame();
  }

  function returnLoanedArmies() {
    if (!state.loanedArmy || state.loanedArmy === 0) return;
    const total = state.loanedArmy;
    state.loanedArmy = 0;
    state.allyLoans = {};
    showToast(`⚔ Le truppe prestate (${total} soldati) sono tornate alle loro casate.`);
  }

  function checkActivePactCalls() {
    if (!state.activePacts) return;
    Object.keys(state.activePacts).forEach(hId => {
      const h = state.houses[hId];
      if (!h || h.suppressed || h.status !== 'ally') return;
      if (!state.pactCallCooldown) state.pactCallCooldown = {};
      if (state.pactCallCooldown[hId] && state.turn < state.pactCallCooldown[hId]) return;
      // ~8% chance per turn that the pact house needs help
      if (Math.random() > 0.08) return;
      state.pactCallCooldown[hId] = state.turn + 10;
      triggerPactCall(hId);
    });
  }

  // Called from pact house when THEY need help
  function triggerPactCall(hId) {
    const h = state.houses[hId];
    if (!h) return;
    state.eventQueue.unshift({
      id: 'pact_call_' + hId,
      speaker: `Casa ${h.name}`,
      speakerRole: 'Patto di Sangue — chiamata alle armi',
      portrait: h.icon, icon: h.icon,
      text: `Casa ${h.name} richiama il patto di sangue. Le loro terre sono sotto attacco e vi chiedono di inviare immediatamente parte del vostro esercito in loro difesa. Rifiutare rompe il patto per sempre.`,
      leftText: `Rifiuta — rompi il patto`, leftEffects: { power: -10 },
      rightText: `Onora il patto — invia truppe`, rightEffects: { army: -15, power: +10 },
      tags: ['pact_response'],
      pactHouseId: hId,
      onLeftChoose: () => {
        h.status = 'enemy';
        h.pactBroken = true;
        showToast(`💔 Casa ${h.name} vi considera traditori. Sono ora vostri nemici permanenti.`, 'warn');
      },
    });
  }

  // ══════════════════════════════════════════════
  // ENEMY TRIBUTE DEMAND SYSTEM
  // ══════════════════════════════════════════════
  // Called each turn from drawNextCard tick
  function checkEnemyTributeDemands() {
    // Never before turn 7 — player needs time to settle
    if (state.turn < 7) return;

    const playerArmy = state.resources.army + (state.loanedArmy || 0);

    Object.entries(state.houses).forEach(([hId, h]) => {
      if (h.status !== 'enemy') return;
      if (h.suppressed) return;
      // Already have an active threat from this house → don't stack
      if (state.activeThreats && state.activeThreats[hId]) return;
      // Only demand if their army is at least 65% of player's (significantly threatening)
      if (h.army < playerArmy * 0.65) return;
      // ~5% chance per turn — rare
      if (Math.random() > 0.05) return;

      state.eventQueue.push(buildTributeDemandCard(hId, h));
    });

    // Check if any active threat has expired (3 cards passed) → trigger battle
    if (state.activeThreats) {
      Object.entries(state.activeThreats).forEach(([hId, threat]) => {
        if (state.turn >= threat.attackTurn) {
          delete state.activeThreats[hId];
          const h = state.houses[hId];
          if (h && !h.suppressed) {
            // Queue the attack card immediately
            state.eventQueue.unshift(buildHouseAttackCard(hId, h));
          }
        }
      });
    }
  }

  function buildTributeDemandCard(hId, h) {
    // Importo proporzionale all'esercito della casata, al turno e alla difficoltà
    // Base: 30–50% dell'esercito nemico come "valore equivalente"
    // Scalato per difficoltà: easy 0.7×, medium 1.0×, hard 1.35×
    const diffMult = { easy: 0.70, medium: 1.00, hard: 1.35 }[state.character?.difficulty] || 1.0;
    const turnBonus = Math.floor(state.turn / 5);          // +1 ogni 5 turni
    const base = Math.floor(h.army * (0.30 + Math.random() * 0.20)); // 30–50% esercito nemico
    const demandAmt = Math.max(18, Math.round((base + turnBonus) * diffMult));

    const demandRes = rand(['gold', 'army', 'people']);
    const resLabels = { gold: 'oro 💰', army: 'soldati ⚔', people: 'popolo 👥' };
    return {
      id: 'tribute_demand_' + hId + '_' + Date.now(),
      speaker: `Casa ${h.name}`,
      speakerRole: 'Ultimatum — avete 3 turni',
      portrait: h.icon, icon: h.icon,
      text: `${h.icon} Casa ${h.name} invia un ultimatum: «Pagate ${demandAmt} ${resLabels[demandRes]} come tributo o preparatevi alla guerra entro tre turni. Aprite il pannello Diplomazia per richiedere rinforzi agli alleati.»`,
      leftText: `Rifiuta l'ultimatum`,
      leftEffects: {},
      rightText: `Paga subito il tributo (−${demandAmt} ${resLabels[demandRes]})`,
      rightEffects: { [demandRes]: -demandAmt },
      tags: ['tribute_demand'],
      tributeHouseId: hId,
      tributeRes: demandRes,
      tributeAmt: demandAmt,
      onLeftChoose: () => {
        // START 3-turn grace period — no immediate attack
        if (!state.activeThreats) state.activeThreats = {};
        state.activeThreats[hId] = { attackTurn: state.turn + 3, houseName: h.name, houseIcon: h.icon };
        showThreatBanner(h, 3);
      },
      onRightChoose: () => {
        // Paid — house stays calm for a good while
        if (!state.tributeCooldowns) state.tributeCooldowns = {};
        state.tributeCooldowns[hId] = state.turn + 18;
        showToast(`💰 Casa ${h.name} ha ricevuto il tributo. Staranno tranquilli per un po'.`, 'good');
      },
    };
  }

  function buildHouseAttackCard(hId, h) {
    return {
      id: 'house_attack_final_' + hId,
      speaker: `Casa ${h.name}`,
      speakerRole: '⚔ ATTACCO IN CORSO',
      portrait: '⚔️', icon: '⚔️',
      text: `${h.icon} Il tempo è scaduto. Casa ${h.name} ha lanciato l'offensiva — le loro armate sono alle vostre porte. La battaglia inizia ora. Non potete evitarla.`,
      leftText: 'Combatti!',
      leftEffects: {},
      rightText: 'Combatti!',
      rightEffects: {},
      tags: ['house_attack_final'],
      onResolve: () => triggerHouseBattle(hId, false),
    };
  }

  function showThreatBanner(h, turnsLeft) {
    const existing = document.getElementById('threat-banner');
    if (existing) existing.remove();
    const banner = document.createElement('div');
    banner.id = 'threat-banner';
    banner.style.cssText = `
      position:fixed;bottom:4.5rem;left:50%;transform:translateX(-50%);
      background:rgba(127,29,29,0.95);border:1px solid rgba(239,68,68,0.6);
      border-radius:5px;padding:0.55rem 1rem;z-index:300;
      font-family:'Cinzel',serif;font-size:0.75rem;color:#fca5a5;
      letter-spacing:0.06em;text-align:center;
      box-shadow:0 4px 20px rgba(239,68,68,0.3);
      animation:fadeIn 0.3s ease;
    `;
    banner.innerHTML = `⚔ ${h.icon} Casa ${h.name} attaccherà tra <strong>${turnsLeft}</strong> ${turnsLeft === 1 ? 'turno' : 'turni'} — apri Diplomazia per organizzarti`;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 5000);
  }

  function scheduleHouseAttack(hId, inTurns) {
    // Legacy — now replaced by activeThreats system, kept for compatibility
    const h = state.houses[hId];
    if (!h || h.suppressed) return;
    if (!state.activeThreats) state.activeThreats = {};
    state.activeThreats[hId] = { attackTurn: state.turn + inTurns, houseName: h.name, houseIcon: h.icon };
    showThreatBanner(h, inTurns);
  }

  // ══════════════════════════════════════════════
  // HOUSE BATTLE — full animated, replaces old triggerWar
  // ══════════════════════════════════════════════
  function triggerWar(houseId) {
    // Old entry point from raven "war" action — now routes to confirmation
    const h = state.houses[houseId];
    if (!h) return;
    state.pendingWarTarget = houseId;
    showWarConfirmation(houseId);
  }

  function showWarConfirmation(houseId) {
    const h = state.houses[houseId];
    const existingLoan = state.loanedArmy || 0;
    const playerForce = state.resources.army + existingLoan;
    const enemyForce = h.army;
    const winPct = Math.round(Math.min(95, Math.max(5, playerForce / (playerForce + enemyForce) * 100)));
    const allies = Object.entries(state.houses).filter(([, hh]) => hh.status === 'ally');

    const existing = document.getElementById('war-confirm-overlay');
    if (existing) existing.remove();

    // Avvia la musica di guerra già dalla schermata di pianificazione
    if (typeof AudioManager !== 'undefined') AudioManager.playWar();

    const allyRows = allies.length > 0
      ? allies.map(([id, hh]) => `<button onclick="Game.requestAllyArmy('${id}');document.getElementById('war-confirm-overlay').remove();Game.showWarConfirmation('${houseId}')" style="width:100%;text-align:left;padding:0.45rem 0.65rem;margin-bottom:0.3rem;background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.25);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#e8dcc8;cursor:pointer">${hh.icon} Casa ${hh.name} — ⚔ ${Math.round(hh.army)} <span style="color:#c9a84c;float:right">Chiedi rinforzi →</span></button>`).join('')
      : '<p style="color:#6b5e4a;font-size:0.82rem;font-style:italic">Nessuna casata alleata disponibile.</p>';

    const loanNote = existingLoan > 0 ? `<p style="color:#4ade80;font-size:0.82rem">⚔ Rinforzi ottenuti: +${existingLoan} (verranno restituiti dopo la battaglia)</p>` : '';

    const overlay = document.createElement('div');
    overlay.id = 'war-confirm-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:640;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;backdrop-filter:blur(4px);';
    overlay.innerHTML = `
      <div style="background:#12121a;border:2px solid rgba(239,68,68,0.5);border-radius:6px;width:92%;max-width:450px;max-height:90vh;overflow-y:auto;padding:1.75rem;font-family:'Cinzel',serif;">
        <div style="font-family:'Cinzel Decorative',serif;color:#f87171;font-size:1rem;margin-bottom:0.3rem">⚔ Guerra a Casa ${h.name}</div>
        <div style="font-size:0.7rem;color:#9a8a6a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:1rem">Pianificazione bellica</div>

        <div style="display:flex;justify-content:space-between;font-size:0.82rem;color:#e8dcc8;margin-bottom:0.4rem">
          <span>🗡 Tue forze: <strong style="color:#4ade80">${Math.round(playerForce)}</strong></span>
          <span>🛡 Forze nemiche: <strong style="color:#f87171">${Math.round(enemyForce)}</strong></span>
        </div>
        <div style="height:10px;border-radius:4px;overflow:hidden;background:rgba(255,255,255,0.05);margin-bottom:0.4rem;display:flex">
          <div style="width:${Math.round(playerForce/(playerForce+enemyForce)*100)}%;background:linear-gradient(90deg,#166534,#4ade80)"></div>
          <div style="flex:1;background:linear-gradient(90deg,#991b1b,#f87171)"></div>
        </div>
        <div style="text-align:center;font-size:0.75rem;color:#c9a84c;margin-bottom:0.75rem">Probabilità vittoria: <strong>${winPct}%</strong></div>
        ${loanNote}

        <div style="background:rgba(74,222,128,0.04);border:1px solid rgba(74,222,128,0.2);border-radius:4px;padding:0.75rem;margin-bottom:0.75rem">
          <div style="font-size:0.72rem;color:#4ade80;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem">🤝 Chiedi rinforzi agli alleati</div>
          ${allyRows}
        </div>

        <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.15);border-radius:4px;padding:0.65rem;margin-bottom:1rem;font-family:'EB Garamond',serif;font-size:0.88rem;color:#e8dcc8;line-height:1.5">
          <strong style="color:#4ade80">Se vinci:</strong> Casa ${h.name} viene conquistata. +100 al cap di tutte le risorse. Le loro risorse vengono aggiunte alle tue.<br>
          <strong style="color:#f87171">Se perdi:</strong> vieni annesso a Casa ${h.name}. Fine della partita.
        </div>

        <div style="display:flex;gap:0.75rem">
          <button onclick="document.getElementById('war-confirm-overlay').remove();Game.triggerHouseBattle('${houseId}',true)" style="flex:1;padding:0.75rem;background:linear-gradient(135deg,#7f1d1d,#dc2626);border:none;border-radius:2px;font-family:'Cinzel',serif;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#fff">⚔ Attacca!</button>
          <button onclick="if(typeof AudioManager!=='undefined')AudioManager.playMainFromWar();document.getElementById('war-confirm-overlay').remove();Game.cancelWar()" style="flex:1;padding:0.75rem;background:transparent;border:1px solid rgba(201,168,76,0.4);border-radius:2px;font-family:'Cinzel',serif;font-size:0.75rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#c9a84c">Ritira le truppe</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  function cancelWar() {
    state.pendingWarTarget = null;
    state.loanedArmy = 0;
    state.allyLoans = {};
    updateHUD();
    saveGame();
  }

  function triggerHouseBattle(houseId, playerInitiated) {
    const h = state.houses[houseId];
    if (!h) return;

    // Calculate forces
    const loanedArmy = state.loanedArmy || 0;
    let playerForce = state.resources.army + loanedArmy;
    let enemyForce = h.army;

    // Enemy gets support from other enemy houses
    const enemyBonus = Object.entries(state.houses)
      .filter(([id, hh]) => id !== houseId && hh.status === 'enemy' && !hh.suppressed)
      .reduce((s, [, hh]) => s + hh.army * 0.2, 0);
    enemyForce += enemyBonus;

    // Desertion roll (player side)
    let desertNote = '';
    if (Math.random() < 0.12) {
      const d = Math.floor(playerForce * 0.15);
      playerForce -= d;
      desertNote = `⚠ DISERZIONE: ${d} soldati fuggono all'ultimo momento! `;
    }

    showBattleAnimation(playerForce, enemyForce, (won, survived) => {
      _resolveHouseBattle(houseId, h, won, survived, playerForce, enemyForce, desertNote, playerInitiated);
    });

    // Set retreat callback for house battle
    const originalRetreat = Game._battleRetreatFn;
    Game._battleRetreat = () => {
      if (Game._battleRetreatFn) Game._battleRetreatFn();
    };
    Game._battleRetreatFinish = function(survived) {
      // Retreating: attacked house becomes enemy, army = survivors
      returnLoanedArmies();
      state.pendingWarTarget = null;
      state.resources.army = clamp(survived);
      h.status = 'enemy'; // attacked and fled → enemy
      state.resources.power = clamp(state.resources.power - 10);
      state.decisionHistory.push({ turn: state.turn, cardId: 'house_retreat_' + houseId, choice: 'retreat', tags: ['retreat'], target: houseId });
      showToast(`🏃 Vi siete ritirati da Casa ${h.name}. Sono ora vostri nemici. Superstiti: ${survived}.`, 'warn');
      updateHUD(); saveGame();
      checkGameOver();
      if (!state.gameOver) drawNextCard();
    };
  }

  function _resolveHouseBattle(houseId, h, won, survived, playerForce, enemyForce, desertNote, playerInitiated) {
    const margin = Math.abs(playerForce - enemyForce);

    // Return loaned armies regardless of outcome
    returnLoanedArmies();
    state.pendingWarTarget = null;

    if (won) {
      // ── CONQUEST ──
      const bonusGold   = Math.floor(h.army * 0.3 + 10);
      const bonusArmy   = Math.floor(h.army * 0.5);
      const bonusPeople = Math.floor(10 + Math.random() * 15);
      const bonusPower  = Math.floor(10 + Math.random() * 10);

      // Expand cap first
      state.conquests = (state.conquests || 0) + 1;
      const newCap = getResourceCap();

      // Army set to survivors + bonus from conquered house
      state.resources.army   = Math.min(newCap, (survived ?? Math.max(5, state.resources.army - Math.floor(margin * 0.15))) + bonusArmy);
      state.resources.gold   = Math.min(newCap, state.resources.gold   + bonusGold);
      state.resources.people = Math.min(newCap, state.resources.people + bonusPeople);
      state.resources.power  = Math.min(newCap, state.resources.power  + bonusPower + 20);
      state.resources.faith  = Math.min(newCap, state.resources.faith  + 5);

      // Suppress house
      h.status = 'suppressed';
      h.suppressed = true;
      h.army = 0;

      state.decisionHistory.push({ turn: state.turn, cardId: 'house_conquest', choice: 'war', tags: ['war_victory', 'war_choice', 'conquest'], target: houseId });

      showHouseBattleResult(true, h, bonusGold, bonusArmy, bonusPeople, bonusPower, newCap, desertNote, survived);

    } else {
      // ── ANNEXATION / GAME OVER ──
      state.decisionHistory.push({ turn: state.turn, cardId: 'house_defeat', choice: 'war', tags: ['war_choice'], target: houseId });
      triggerEnd(false, h.icon, `Annesso da Casa ${h.name}`,
        `Le vostre truppe sono state sbaragliate sul campo. Casa ${h.name} ha marciato sulle vostre terre e le ha annesse. Come leader sconfitto, siete stato condotto davanti al Signore della casata. Per dimostrare la loro dominanza ai vassalli, la vostra esecuzione è stata pubblica e spietata. Il vostro nome sopravvive solo come monito ai ribelli.`
      );
    }

    if (!state.gameOver) {
      updateHUD();
      saveGame();
    }
  }

  function showHouseBattleResult(won, h, bonusGold, bonusArmy, bonusPeople, bonusPower, newCap, desertNote, survived) {
    const overlay = document.createElement('div');
    overlay.className = 'war-overlay';
    overlay.innerHTML = `
      <div class="war-title" style="color:#c9a84c">🏰 CASA ${h.name.toUpperCase()} CONQUISTATA</div>
      <div class="war-log">
        <p class="war-result war-victory">🏆 VITTORIA!</p>
        ${desertNote ? `<p style="color:#f87171;font-size:0.85rem">${desertNote}</p>` : ''}
        <p style="margin-top:0.5rem">Casa ${h.name} è stata soppressa. Le sue terre e risorse sono ora vostre.</p>
        ${survived != null ? `<p style="color:#4ade80;font-size:0.85rem">⚔ Superstiti del tuo esercito: ${survived}</p>` : ''}
        <div style="margin-top:0.75rem;padding:0.65rem;background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:4px;font-family:'EB Garamond',serif;font-size:0.9rem;line-height:1.7">
          <div style="font-family:'Cinzel',serif;font-size:0.7rem;letter-spacing:0.1em;color:#c9a84c;margin-bottom:0.4rem">BOTTINO DI GUERRA</div>
          <div>💰 +${bonusGold} Oro</div>
          <div>⚔ +${bonusArmy} Esercito (al netto delle perdite)</div>
          <div>👥 +${bonusPeople} Popolo</div>
          <div>👑 +${bonusPower + 20} Potere</div>
        </div>
        <div style="margin-top:0.65rem;padding:0.5rem 0.65rem;background:rgba(74,222,128,0.07);border:1px solid rgba(74,222,128,0.25);border-radius:4px;font-family:'Cinzel',serif;font-size:0.75rem;color:#4ade80;letter-spacing:0.05em">
          📈 Nuovo cap risorse: <strong>${newCap}</strong> (ogni casata conquistata aggiunge +100)
        </div>
      </div>
      <button class="btn-primary" style="max-width:200px" onclick="if(typeof AudioManager!=='undefined')AudioManager.playMainFromWar();this.parentElement.remove();Game.checkAndContinue()">Continua</button>
    `;
    document.body.appendChild(overlay);
  }

  function checkAndContinue() {
    checkGameOver();
    if (!state.gameOver) {
      updateHUD();
      saveGame();
    }
  }

  // ══════════════════════════════════════════════
  // SWIPE GESTURE
  // ══════════════════════════════════════════════
  function initSwipe() {
    const card = document.getElementById('main-card');
    let startX = 0, isDragging = false, currentX = 0;

    function onStart(e) {
      if (state.gameOver) return;
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      isDragging = true;
    }

    function onMove(e) {
      if (!isDragging) return;
      currentX = (e.touches ? e.touches[0].clientX : e.clientX) - startX;
      // Smooth drag — no rotation, slight resistance at edges
      const drag = currentX * 0.85;
      card.style.transition = 'none';
      card.style.transform = `translateX(${drag}px)`;

      // Glow hint only — no tilt
      if (currentX < -30) { card.classList.add('hinting-left'); card.classList.remove('hinting-right'); }
      else if (currentX > 30) { card.classList.add('hinting-right'); card.classList.remove('hinting-left'); }
      else { card.classList.remove('hinting-left', 'hinting-right'); }
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      card.classList.remove('hinting-left', 'hinting-right');

      if (currentX < -80) {
        makeChoice('left');
      } else if (currentX > 80) {
        makeChoice('right');
      } else {
        // Fade out then fade back in
        card.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
        card.style.opacity = '0';
        card.style.transform = 'translateX(0) scale(0.97)';
        setTimeout(() => {
          card.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
          card.style.opacity = '1';
          card.style.transform = '';
          setTimeout(() => { card.style.transition = ''; }, 220);
        }, 180);
      }
      updateEffectsPreview('');
      currentX = 0;
    }

    card.addEventListener('touchstart', onStart, { passive: true });
    card.addEventListener('touchmove', onMove, { passive: true });
    card.addEventListener('touchend', onEnd);
    card.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);

    // Effects are shown ONLY after a choice is made — no hover preview
  }

  // ══════════════════════════════════════════════
  // SAVE / LOAD
  // ══════════════════════════════════════════════
  function saveGame() {
    try {
      localStorage.setItem('ia_save', JSON.stringify(state));
    } catch(e) {}
  }

  function loadGame() {
    try {
      const saved = localStorage.getItem('ia_save');
      if (!saved) { showToast('Nessuna partita salvata trovata.', 'warn'); return; }
      state = JSON.parse(saved);
      state.character = CHARACTERS.find(c => c.id === state.character.id);
      showScreen('screen-game');
      updateHUD();
      drawNextCard();
      initSwipe();
      showToast('Partita caricata!', 'good');
      if (typeof AudioManager !== 'undefined') AudioManager.playMain();
    } catch(e) {
      showToast('Errore nel caricamento.', 'warn');
    }
  }

  function restart() {
    localStorage.removeItem('ia_save');
    state = {};
    showScreen('screen-splash');
  }

  // ══════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════
  return {
    showCharacterSelect,
    startGame,
    makeChoice,
    toggleDiplomacy,
    selectRavenTarget,
    ravenAction,
    clearRaven,
    loadGame,
    restart,
    checkAndContinue,
    showChangelogPopup,
    cancelWar,
    requestAllyArmy,
    acceptAllyLoan,
    showWarConfirmation,
    triggerHouseBattle,
    acceptResourceExchange,
    rejectResourceExchange,
    challengeKing,
    executeThroneAttack,
    showBattleAnimation,
    acceptAllianceDemand,
    rejectAllianceDemand,
    acceptAllyResourceGift,
    _battleRetreat: null,
    _battleRetreatFn: null,
    _battleRetreatFinish: null,
    _battleCompleteFn: null,
    _battleTimer: null,
  };

})();

// ── INIT on page load ──
window.addEventListener('load', () => {
  // Version badge
  const badge = document.getElementById('version-badge');
  if (badge) badge.textContent = 'v1.9.0';

  // Changelog popup check
  const seen = localStorage.getItem('ia_version_seen');
  if (seen !== '1.9.0') {
    Game.showChangelogPopup();
  }

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // Audio system
  AudioManager.init();
});

// ══════════════════════════════════════════════════════════════
// AUDIO MANAGER
// Gestisce track-1.mp3 (musica base) e track-2.mp3 (guerra)
// con fade in / fade out fluidi, senza scatti.
//
// Posiziona i file nella stessa cartella di index.html:
//   track-1.mp3  →  musica principale (loop)
//   track-2.mp3  →  musica battaglia / guerra (loop)
//
// Cambio di stato:
//   startGame / loadGame      → playMain()
//   showWarConfirmation       → playWar()      (già dalla pianificazione)
//   showBattleAnimation       → playWar()      (ridondante ma sicuro)
//   Continua post-battaglia   → playMainFromWar()
//   Ritira le truppe          → playMainFromWar()
//   Ritirata in battle        → playMainFromWar()
//   Coup overlay              → nessun cambio (non è guerra)
// ══════════════════════════════════════════════════════════════
const AudioManager = (() => {

  const FADE_IN_MS  = 1800;   // durata fade in  (ms)
  const FADE_OUT_MS = 1200;   // durata fade out (ms)
  const MAIN_VOL    = 0.55;   // volume massimo track-1
  const WAR_VOL     = 0.70;   // volume massimo track-2

  let track1    = null;
  let track2    = null;
  let _warActive = false;
  let _muted     = false;

  // ── Crea elemento Audio ────────────────────────────────────
  function createAudio(src) {
    const a = new Audio();
    a.src     = src;
    a.loop    = true;
    a.volume  = 0;
    a.preload = 'auto';
    a._fadeTimer = null;
    return a;
  }

  // ── Fade in: porta il volume da 0 a targetVol in durationMs ─
  function fadeIn(audio, targetVol, durationMs, onDone) {
    if (!audio || _muted) { if (onDone) onDone(); return; }
    clearInterval(audio._fadeTimer);
    audio.volume = 0;

    const tryPlay = audio.play();
    if (tryPlay !== undefined) tryPlay.catch(() => {});

    const STEPS   = 40;
    const stepMs  = durationMs / STEPS;
    const stepVol = targetVol  / STEPS;
    let step = 0;

    audio._fadeTimer = setInterval(() => {
      step++;
      audio.volume = Math.min(targetVol, +(step * stepVol).toFixed(5));
      if (step >= STEPS) {
        clearInterval(audio._fadeTimer);
        audio.volume = targetVol;
        if (onDone) onDone();
      }
    }, stepMs);
  }

  // ── Fade out: porta il volume a 0 in durationMs, poi pause ──
  function fadeOut(audio, durationMs, onDone) {
    if (!audio) { if (onDone) onDone(); return; }
    clearInterval(audio._fadeTimer);

    const startVol = audio.volume;
    if (startVol <= 0.001) {
      audio.pause();
      audio.currentTime = 0;
      if (onDone) onDone();
      return;
    }

    const STEPS  = 40;
    const stepMs = durationMs / STEPS;
    const stepVol = startVol / STEPS;
    let step = 0;

    audio._fadeTimer = setInterval(() => {
      step++;
      audio.volume = Math.max(0, +(startVol - step * stepVol).toFixed(5));
      if (step >= STEPS) {
        clearInterval(audio._fadeTimer);
        audio.volume = 0;
        audio.pause();
        audio.currentTime = 0;
        if (onDone) onDone();
      }
    }, stepMs);
  }

  // ── Pulsante mute (🔊/🔇) in basso a sinistra ─────────────
  function buildMuteButton() {
    if (document.getElementById('audio-toggle')) return;
    const btn = document.createElement('button');
    btn.id        = 'audio-toggle';
    btn.title     = 'Attiva / Disattiva musica';
    btn.textContent = '🔊';
    btn.style.cssText = [
      'position:fixed', 'bottom:0.6rem', 'left:0.75rem', 'z-index:200',
      'background:transparent', 'border:none', 'font-size:1rem',
      'cursor:pointer', 'opacity:0.45', 'transition:opacity 0.2s',
      'user-select:none', '-webkit-tap-highlight-color:transparent',
    ].join(';');

    btn.addEventListener('mouseenter', () => { btn.style.opacity = '0.85'; });
    btn.addEventListener('mouseleave', () => { btn.style.opacity = _muted ? '0.25' : '0.45'; });

    btn.addEventListener('click', () => {
      _muted = !_muted;
      btn.textContent   = _muted ? '🔇' : '🔊';
      btn.style.opacity = _muted ? '0.25' : '0.45';

      if (_muted) {
        // Silenzia subito entrambe le tracce
        [track1, track2].forEach(t => {
          if (!t) return;
          clearInterval(t._fadeTimer);
          t.volume = 0;
          t.pause();
        });
      } else {
        // Riprendi la traccia corretta
        if (_warActive) fadeIn(track2, WAR_VOL, FADE_IN_MS);
        else            fadeIn(track1, MAIN_VOL, FADE_IN_MS);
      }
    });

    document.body.appendChild(btn);
  }

  // ══════════════════════════════════════════════
  // API PUBBLICA
  // ══════════════════════════════════════════════

  /** Chiamato una volta al caricamento pagina */
  function init() {
    track1 = createAudio('track-1.mp3');
    track2 = createAudio('track-2.mp3');
    // Precarica entrambe in silenzio
    track1.load();
    track2.load();
    buildMuteButton();
  }

  /** Avvia la musica principale (startGame / loadGame) */
  function playMain() {
    if (_muted || _warActive) return;
    // Se track2 stava suonando per qualche motivo, spegnila prima
    if (track2 && !track2.paused) {
      fadeOut(track2, FADE_OUT_MS, () => fadeIn(track1, MAIN_VOL, FADE_IN_MS));
    } else {
      fadeIn(track1, MAIN_VOL, FADE_IN_MS);
    }
  }

  /** Passa alla musica di guerra (showWarConfirmation / showBattleAnimation) */
  function playWar() {
    if (_warActive) return;   // già in modalità guerra — nessun doppio fade
    _warActive = true;
    if (_muted) return;
    fadeOut(track1, FADE_OUT_MS, () => fadeIn(track2, WAR_VOL, FADE_IN_MS));
  }

  /** Torna alla musica principale dopo la guerra (Continua / Ritira) */
  function playMainFromWar() {
    if (!_warActive) return;  // non eravamo in guerra — non fare nulla
    _warActive = false;
    if (_muted) return;
    fadeOut(track2, FADE_OUT_MS, () => fadeIn(track1, MAIN_VOL, FADE_IN_MS));
  }

  return { init, playMain, playWar, playMainFromWar };
})();
