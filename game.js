/* ============================================================
   IRON & ALLIANCES — game.js
   Full game engine: characters, events, diplomacy, war, memory
   ============================================================ */

'use strict';

const Game = (() => {

  // ══════════════════════════════════════════════
  // VERSION & CHANGELOG
  // ══════════════════════════════════════════════
  const VERSION = '1.6.0';

  const CHANGELOG = {
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
  const CHARACTERS = [
    {
      id: 'daenerys', name: 'Daenerys Targaryen', house: 'Casa Targaryen',
      icon: '🐉', emoji: '👸',
      difficulty: 'hard',
      startResources: { gold: 30, faith: 40, people: 60, army: 70, power: 30 },
      objective: 'Riconquista il Trono: siediti sul Trono di Spade sconfiggendo il Re Reggente.',
      objectiveCheck: (s) => s.king === 'daenerys',
      startAllies: [], startEnemies: ['Lannister'],
      flavor: 'Il fuoco e il sangue scorrono nelle tue vene. I draghi ti obbediscono.',
    },
    {
      id: 'jon', name: 'Jon Snow', house: 'Guardiani della Notte / Stark',
      icon: '🐺', emoji: '⚔️',
      difficulty: 'medium',
      startResources: { gold: 30, faith: 55, people: 65, army: 60, power: 25 },
      objective: "Unisci il Nord: Popolo >75, Esercito >65 e almeno 3 alleanze.",
      objectiveCheck: (s) => s.resources.people > 75 && s.resources.army > 65 && countAllies(s) >= 3,
      startAllies: ['Stark'], startEnemies: [],
      flavor: 'Sai nulla, Jon Snow. Ma forse è tempo di imparare.',
    },
    {
      id: 'cersei', name: 'Cersei Lannister', house: 'Casa Lannister',
      icon: '🦁', emoji: '👑',
      difficulty: 'medium',
      startResources: { gold: 80, faith: 25, people: 35, army: 65, power: 60 },
      objective: "Mantieni il Trono: sei (o diventa) il Re Reggente e sopravvivi al turno 60 con Tesoro >60 e Potere >60.",
      objectiveCheck: (s) => s.king === 'cersei' && s.turn >= 60 && s.resources.gold > 60 && s.resources.power > 60,
      startAllies: ['Lannister'], startEnemies: ['Stark', 'Baratheon'],
      flavor: 'Il potere è il solo dio che vale la pena adorare.',
    },
    {
      id: 'tyrion', name: 'Tyrion Lannister', house: 'Casa Lannister',
      icon: '🍷', emoji: '🧠',
      difficulty: 'easy',
      startResources: { gold: 65, faith: 35, people: 55, army: 40, power: 55 },
      objective: "Diventa Mano del Re: Potere >80 e Fede >50.",
      objectiveCheck: (s) => s.resources.power > 80 && s.resources.faith > 50,
      startAllies: ['Lannister'], startEnemies: [],
      flavor: 'Bevo e so le cose. La mente è la mia arma.',
    },
    {
      id: 'sansa', name: 'Sansa Stark', house: 'Casa Stark',
      icon: '🐺', emoji: '🌹',
      difficulty: 'easy',
      startResources: { gold: 45, faith: 60, people: 70, army: 35, power: 40 },
      objective: "Lady di Grande Inverno: Fede >75, Popolo >75 e Casa Stark alleata.",
      objectiveCheck: (s) => s.resources.faith > 75 && s.resources.people > 75 && s.houses['Stark']?.status === 'ally',
      startAllies: ['Stark'], startEnemies: [],
      flavor: 'La vita non è una canzone. Il mondo non è un libro di fiabe.',
    },
    {
      id: 'arya', name: 'Arya Stark', house: 'Casa Stark',
      icon: '🗡️', emoji: '🐺',
      difficulty: 'hard',
      startResources: { gold: 20, faith: 20, people: 45, army: 55, power: 30 },
      objective: "La Lista: elimina 3 nemici (carte 'assassinio' scelte).",
      objectiveCheck: (s) => s.decisionHistory.filter(d => d.tags?.includes('assassination')).length >= 3,
      startAllies: [], startEnemies: ['Lannister', 'Frey'],
      flavor: "Un ragazzo non ha nome. Ma ha una lista.",
    },
    {
      id: 'stannis', name: 'Stannis Baratheon', house: 'Casa Baratheon',
      icon: '🦌', emoji: '🔥',
      difficulty: 'hard',
      startResources: { gold: 45, faith: 70, people: 40, army: 65, power: 50 },
      objective: "Il Trono Spetta a Me: conquista il Trono di Spade sconfiggendo il Re Reggente.",
      objectiveCheck: (s) => s.king === 'stannis',
      startAllies: [], startEnemies: ['Lannister'],
      flavor: 'Non è la gloria che voglio. È il dovere.',
    },
    {
      id: 'robb', name: 'Robb Stark', house: 'Casa Stark',
      icon: '🐺', emoji: '⚔️',
      difficulty: 'medium',
      startResources: { gold: 40, faith: 50, people: 70, army: 75, power: 45 },
      objective: "Re del Nord: mantieni alleanza Stark + Tully, Esercito >70.",
      objectiveCheck: (s) => s.houses['Stark']?.status === 'ally' && s.houses['Tully']?.status === 'ally' && s.resources.army > 70,
      startAllies: ['Stark', 'Tully'], startEnemies: ['Lannister'],
      flavor: 'Il Nord ricorda. E il Nord si vendica.',
    },
    {
      id: 'jaime', name: 'Jaime Lannister', house: 'Casa Lannister',
      icon: '⚔️', emoji: '🦁',
      difficulty: 'medium',
      startResources: { gold: 60, faith: 30, people: 40, army: 70, power: 45 },
      objective: "Redenzione: aiuta 3 alleati in difficoltà (carte 'aiuto') e Popolo >60.",
      objectiveCheck: (s) => s.decisionHistory.filter(d => d.tags?.includes('help_ally')).length >= 3 && s.resources.people > 60,
      startAllies: ['Lannister'], startEnemies: [],
      flavor: "Sono il Sterminatore dei Re. Ma c'è ancora qualcosa che vale.",
    },
    {
      id: 'margaery', name: 'Margaery Tyrell', house: 'Casa Tyrell',
      icon: '🌹', emoji: '👸',
      difficulty: 'easy',
      startResources: { gold: 70, faith: 55, people: 75, army: 40, power: 55 },
      objective: "La Rosa del Trono: sposa il Re (diventa alleata del Re) + Tesoro >70.",
      objectiveCheck: (s) => s.decisionHistory.some(d => d.tags?.includes('royal_marriage')) && s.resources.gold > 70,
      startAllies: ['Tyrell'], startEnemies: [],
      flavor: 'Ho sempre voluto essere la Regina. Non la moglie del Re.',
    },
    {
      id: 'theon', name: 'Theon Greyjoy', house: 'Casa Greyjoy',
      icon: '🐙', emoji: '⚓',
      difficulty: 'hard',
      startResources: { gold: 35, faith: 15, people: 25, army: 50, power: 20 },
      objective: "Redenzione di Reek: riottieni il nome Greyjoy (Potere >50) e 2 alleanze.",
      objectiveCheck: (s) => s.resources.power > 50 && countAllies(s) >= 2,
      startAllies: [], startEnemies: ['Stark', 'Lannister'],
      flavor: 'Cosa mi appartiene? Il ferro paga il ferro.',
    },
    {
      id: 'littlefinger', name: 'Ditocorto', house: 'Nessuna Casa',
      icon: '🪙', emoji: '🕵️',
      difficulty: 'medium',
      startResources: { gold: 75, faith: 20, people: 40, army: 20, power: 70 },
      objective: "Signore del Nido dell'Aquila: Potere >90, Tesoro >80.",
      objectiveCheck: (s) => s.resources.power > 90 && s.resources.gold > 80,
      startAllies: [], startEnemies: [],
      flavor: 'Il caos non è un abisso. Il caos è una scala.',
    },
    {
      id: 'melisandre', name: 'Melisandre', house: "R'hllor",
      icon: '🔥', emoji: '🌹',
      difficulty: 'hard',
      startResources: { gold: 25, faith: 90, people: 30, army: 30, power: 45 },
      objective: "Il Principe Promesso: Fede >90 e porta un personaggio alla vittoria (aiuta 3 scelte di guerra).",
      objectiveCheck: (s) => s.resources.faith > 90 && s.decisionHistory.filter(d => d.tags?.includes('war_choice')).length >= 3,
      startAllies: ['Baratheon'], startEnemies: [],
      flavor: "Il Signore della Luce mostra tutto... ma la fiamma non mente mai.",
    },
    {
      id: 'baelish', name: 'Oberyn Martell', house: 'Casa Martell',
      icon: '☀️', emoji: '🐍',
      difficulty: 'medium',
      startResources: { gold: 55, faith: 40, people: 60, army: 55, power: 50 },
      objective: "Vendetta per Elia: sconfiggi Casa Lannister (status 'enemy' e vinci una guerra).",
      objectiveCheck: (s) => s.houses['Lannister']?.status === 'enemy' && s.decisionHistory.some(d => d.tags?.includes('war_victory') && d.target === 'Lannister'),
      startAllies: ['Martell'], startEnemies: ['Lannister'],
      flavor: 'Dorne ricorda Elia. E la Vipera non perdona.',
    },
    {
      id: 'ned', name: 'Eddard Stark', house: 'Casa Stark',
      icon: '🐺', emoji: '⚖️',
      difficulty: 'hard',
      startResources: { gold: 40, faith: 65, people: 75, army: 55, power: 40 },
      objective: "L'Onore del Nord: mantieni Fede >70, Popolo >70, e NON tradire nessun alleato.",
      objectiveCheck: (s) => s.resources.faith > 70 && s.resources.people > 70 && !s.decisionHistory.some(d => d.tags?.includes('betray_ally')),
      startAllies: ['Stark', 'Tully'], startEnemies: [],
      flavor: "L'onore è il fardello più pesante che un uomo possa portare.",
    },
    {
      id: 'catelyn', name: 'Catelyn Tully', house: 'Casa Tully',
      icon: '🐟', emoji: '👩',
      difficulty: 'medium',
      startResources: { gold: 45, faith: 65, people: 65, army: 45, power: 40 },
      objective: "Proteggi la Famiglia: raggiungi il turno 50 senza tradire nessun alleato, con Popolo >60 e Fede >60.",
      objectiveCheck: (s) => s.turn >= 50 && s.resources.people > 60 && s.resources.faith > 60 && !s.decisionHistory.some(d => d.tags?.includes('betray_ally')),
      startAllies: ['Stark', 'Tully'], startEnemies: ['Lannister'],
      flavor: 'Un leone non si preoccupa delle opinioni delle pecore. Ma io non sono una pecora.',
    },
    {
      id: 'bronn', name: 'Bronn', house: 'Nessuna Casa',
      icon: '🗡️', emoji: '😏',
      difficulty: 'easy',
      startResources: { gold: 55, faith: 20, people: 40, army: 60, power: 35 },
      objective: "Il Mercenario: Tesoro >85 e Esercito >70.",
      objectiveCheck: (s) => s.resources.gold > 85 && s.resources.army > 70,
      startAllies: [], startEnemies: [],
      flavor: "Non combatto per la gloria. Combatto per l'oro. E sopravvivo.",
    },
    {
      id: 'olenna', name: 'Olenna Tyrell', house: 'Casa Tyrell',
      icon: '🌹', emoji: '👵',
      difficulty: 'medium',
      startResources: { gold: 70, faith: 45, people: 65, army: 50, power: 65 },
      objective: "La Regina delle Spine: Potere >80 e elimina un nemico con intrigo (carta 'veleno').",
      objectiveCheck: (s) => s.resources.power > 80 && s.decisionHistory.some(d => d.tags?.includes('poison_intrigue')),
      startAllies: ['Tyrell'], startEnemies: ['Lannister'],
      flavor: "Ho fatto cose terribili. Ma ero io la più furba di tutti.",
    },
    {
      id: 'tormund', name: 'Tormund Gigante-di-Giant', house: 'Braccio del Re (Popolo Libero)',
      icon: '🗿', emoji: '🪓',
      difficulty: 'hard',
      startResources: { gold: 15, faith: 10, people: 50, army: 70, power: 20 },
      objective: "Oltre il Muro: sopravvivi 60 turni mantenendo Esercito >60.",
      objectiveCheck: (s) => s.turn >= 60 && s.resources.army > 60,
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
      portrait: '💰', icon: '💰',
      text: "Le entrate mensili sono pronte per essere raccolte. Potete tassare i commercianti pesantemente — riempirete le casse, ma il popolo mormorerà.",
      leftText: 'Tassa moderata', leftEffects: { gold: +8, people: +2 },
      rightText: 'Tassa pesante', rightEffects: { gold: +22, people: -14 },
      minTurn: 1,
    },
    {
      id: 'harvest_feast', tags: ['people', 'gold'],
      speaker: 'Steward', speakerRole: 'Responsabile delle provviste',
      portrait: '🌾', icon: '🌾',
      text: "Il raccolto è abbondante quest'anno. Potete distribuire il surplus tra la gente, aumentando la loro lealtà, oppure conservarlo per i tempi difficili.",
      leftText: 'Conserva le riserve', leftEffects: { gold: +12 },
      rightText: 'Distribuisci al popolo', rightEffects: { people: +15, gold: -5 },
      minTurn: 2,
    },
    {
      id: 'plague_arrives', tags: ['people', 'faith'],
      speaker: 'Septon locale', speakerRole: 'Messaggero della Fede',
      portrait: '⚕️', icon: '⚕️',
      text: "La pestilenza colpisce i quartieri poveri. La gente implora protezione. Potete usare le risorse della Fede per curare i malati, o lasciarli al loro destino.",
      leftText: "Lascia che i Sette decidano", leftEffects: { people: -15, faith: +10 },
      rightText: 'Invia i guaritori', rightEffects: { people: +10, gold: -12, faith: +5 },
      minTurn: 3,
    },
    {
      id: 'sell_swords', tags: ['army', 'gold'],
      speaker: 'Capitano dei Mercenari', speakerRole: 'Condottiero straniero',
      portrait: '⚔️', icon: '⚔️',
      text: "Cinquemila spade sono in vendita. La Compagnia Dorata offre i propri servizi. Costano molto, ma rafforzerebbero notevolmente il vostro esercito.",
      leftText: 'Rifiuta', leftEffects: { gold: +5 },
      rightText: "Assoldali", rightEffects: { gold: -25, army: +20 },
      minTurn: 1,
    },
    {
      id: 'iron_bank', tags: ['gold', 'power'],
      speaker: 'Tycho Nestoris', speakerRole: 'Banca di Ferro di Braavos',
      portrait: '🏦', icon: '🏦',
      text: "La Banca di Ferro reclama il suo debito. Potete rinegoziare, ma a caro prezzo politico. Oppure rifiutare e subire embargo commerciale.",
      leftText: 'Rifiuta il debito', leftEffects: { gold: +10, power: -15 },
      rightText: 'Paga e rinegozia', rightEffects: { gold: -30, power: +10 },
      minTurn: 10,
    },
    {
      id: 'lord_rebellion', tags: ['army', 'power'],
      speaker: 'Araldo', speakerRole: 'Notizia dal Riverlands',
      portrait: '🏰', icon: '🏰',
      text: "Un signore minore si è ribellato nei Riverlands. Potete inviare truppe a soffocarlo subito, o negoziare e risolvere pacificamente.",
      leftText: 'Negozia la pace', leftEffects: { power: -5, people: +8 },
      rightText: 'Schiaccia la ribellione', rightEffects: { army: -10, power: +15, people: -5 },
      minTurn: 5,
    },
    {
      id: 'raven_news_merchant', tags: ['power', 'gold'],
      speaker: 'Corvo messaggero', speakerRole: 'Notizia da lontano',
      portrait: '🦅', icon: '🦅',
      text: "Un corvo porta notizie di un ricco mercante che chiede protezione. In cambio vi offre accesso alle rotte commerciali orientali.",
      leftText: 'Rifiuta', leftEffects: { power: -3 },
      rightText: 'Accetta il patto', rightEffects: { gold: +15, power: +8 },
      minTurn: 3,
    },
    {
      id: 'night_watch_plea', tags: ['army', 'faith'],
      speaker: "Lord Comandante", speakerRole: "Guardiani della Notte",
      portrait: '❄️', icon: '❄️',
      text: "Il Muro ha bisogno di uomini. I Guardiani della Notte chiedono condannati e volontari. Aiutarli rafforza la Fede ma indebolisce il vostro esercito.",
      leftText: 'Ignora la richiesta', leftEffects: { faith: -8 },
      rightText: "Invia uomini al Muro", rightEffects: { army: -12, faith: +18, people: +5 },
      minTurn: 4, excludeChars: ['tormund'], // Tormund non manda uomini al Muro
    },
    {
      id: 'war_council_generic', tags: ['army', 'power'],
      speaker: 'Maester del castello', speakerRole: 'Consiglio militare',
      portrait: '⚔️', icon: '⚔️',
      text: "Il consiglio militare si riunisce. Potete addestrare nuove reclute (lento ma sicuro) oppure schierare l'esercito in una dimostrazione di forza.",
      leftText: 'Addestra le reclute', leftEffects: { army: +10, gold: -8 },
      rightText: 'Dimostrazione di forza', rightEffects: { army: +5, power: +10, people: -5 },
      minTurn: 4,
    },
    {
      id: 'traitor_in_court', tags: ['power', 'army'],
      speaker: 'Guardia della corte', speakerRole: 'Rapporto segreto',
      portrait: '🔒', icon: '🔒',
      text: "Una spia nemica è stata scoperta tra i vostri. Potete giustiziarla pubblicamente per deterrenza, o usarla come doppio agente per diffondere disinformazione.",
      leftText: 'Giustizia pubblica', leftEffects: { power: +10, people: +5, faith: +8 },
      rightText: 'Doppio agente', rightEffects: { power: +20, gold: -5 },
      minTurn: 6,
    },
    {
      id: 'night_terror', tags: ['army', 'faith'],
      speaker: 'Messaggero dal Muro', speakerRole: 'Rapporto urgente',
      portrait: '🌙', icon: '🌙',
      text: "Sussurri parlano di morti che camminano oltre il Muro. Pochissimi ci credono. Investire nella difesa al Muro vi farà sembrare folli, ma potrebbe salvare tutti.",
      leftText: 'Ignora le voci', leftEffects: { faith: +5 },
      rightText: 'Invia rifornimenti', rightEffects: { gold: -15, army: -8, faith: +12, power: +5 },
      minTurn: 7,
    },
    {
      id: 'assassination_offer', tags: ['power', 'army'],
      speaker: 'Faceless Man', speakerRole: 'Messaggero dei Molti Volti',
      portrait: '🗡️', icon: '🗡️',
      text: "Un messaggero dei Molti Volti offre l'eliminazione di un vostro nemico. Il prezzo è altissimo. Ma un nemico in meno vale molto.",
      leftText: 'Rifiuta', leftEffects: { power: -3 },
      rightText: "Commissiona l'assassinio", rightEffects: { gold: -30, power: +15 },
      minTurn: 8, rightTags: ['assassination', 'poison_intrigue'],
      excludeChars: ['arya'], // Arya fa da sola
    },
    {
      id: 'wedding_proposal', tags: ['power', 'faith'],
      speaker: 'Emissario', speakerRole: 'Proposta diplomatica',
      portrait: '💍', icon: '💍',
      text: "Una grande casata propone un'unione matrimoniale tra le vostre famiglie. Porterebbe alleanze solide, ma vincolerebbe la vostra libertà.",
      leftText: 'Declina', leftEffects: { power: -8, faith: +5 },
      rightText: 'Accetta le nozze', rightEffects: { power: +15, people: +10 },
      minTurn: 5, rightTags: ['royal_marriage'],
      excludeChars: ['arya', 'tormund', 'bronn'],
    },
    {
      id: 'gift_to_ally', tags: ['gold', 'power'],
      speaker: 'Messaggero alleato', speakerRole: 'Richiesta di aiuto',
      portrait: '🤝', icon: '🤝',
      text: "Un vostro alleato è in difficoltà. Aiutarlo ora rafforzerà il legame, ma vi costerà. Ignorarlo rischia di raffreddare l'alleanza.",
      leftText: "Non posso permettermi", leftEffects: { power: -8 },
      rightText: "Invia oro e rifornimenti", rightEffects: { gold: -20, power: +18 },
      minTurn: 6, rightTags: ['help_ally'],
    },
    {
      id: 'spy_network', tags: ['power', 'gold'],
      speaker: 'Informatore', speakerRole: 'Proposta riservata',
      portrait: '🕵️', icon: '🕵️',
      text: "Un informatore offre di costruire una rete di spie che vi darà informazioni su ogni casata. Il costo è alto, e qualcuno potrebbe scoprirlo.",
      leftText: 'Troppo rischioso', leftEffects: {},
      rightText: 'Finanzia la rete', rightEffects: { gold: -20, power: +25 },
      minTurn: 6,
    },
    {
      id: 'betrayal_remembered', tags: ['power', 'people'],
      speaker: 'Messaggero ostile', speakerRole: 'Lettera sigillata con cera nera',
      portrait: '📩', icon: '📩',
      text: "«Ricordate il vostro tradimento? Il Nord ricorda. E ora chiediamo riparazione, o ogni accordo futuro sarà impossibile.»",
      leftText: 'Ignorali', leftEffects: { power: -10, people: -8 },
      rightText: 'Offri compensazione', rightEffects: { gold: -20, power: +12 },
      minTurn: 15, requiresTag: 'betray_ally',
    },
    {
      id: 'war_declaration_enemy', tags: ['army', 'power', 'war_choice'],
      speaker: 'Araldo nemico', speakerRole: 'Sfida di guerra',
      portrait: '⚔️', icon: '⚔️',
      text: "Un araldo porta sfida di guerra. La casata rivale ha mobilitato le truppe. Potete accettare la guerra aperta o cercare una via diplomatica dell'ultimo minuto.",
      leftText: 'Cerca la pace', leftEffects: { army: +5, power: -15, people: +8 },
      rightText: 'Accetta la guerra', rightEffects: { army: -10, power: +10, people: -8 },
      minTurn: 8, rightTags: ['war_choice'],
    },
    {
      id: 'noble_feast_generic', tags: ['people', 'faith', 'power'],
      speaker: 'Castellano', speakerRole: 'Proposta di corte',
      portrait: '🍷', icon: '🍷',
      text: "Un grande banchetto attirerà nobili da ogni angolo del regno. Costoso, ma un momento di gioia può unire le casate.",
      leftText: 'Annulla il banchetto', leftEffects: { power: -5 },
      rightText: 'Organizza il banchetto', rightEffects: { gold: -18, people: +12, power: +12, faith: +5 },
      minTurn: 5, excludeChars: ['tormund', 'arya'],
    },
    {
      id: 'scroll_of_prophecy', tags: ['faith', 'power'],
      speaker: 'Meera Reed', speakerRole: 'Portavoce dei Figli della Foresta',
      portrait: '📜', icon: '📜',
      text: "Antichi rotoli parlano del Principe che fu Promesso. Seguire questa profezia richiede sacrifici enormi, ma potrebbe essere la chiave per salvare il regno.",
      leftText: 'Ignora le profezie', leftEffects: { faith: -5 },
      rightText: "Segui il destino", rightEffects: { faith: +25, army: -8, power: +5 },
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
      rightText: 'Espandi gli Immacolati', rightEffects: { gold: -20, army: +25 },
      minTurn: 1,
    },
    {
      id: 'dany_dragons', tags: ['army', 'faith'], forChars: ['daenerys'],
      speaker: 'Missandei', speakerRole: 'Consigliera e traduttrice',
      portrait: '🐉', icon: '🐉',
      text: "I draghi crescono, Khaleesi. La gente li teme e li venera. Potete sfruttare questa paura per affermare la vostra legittimità, o nasconderli per rassicurare gli alleati.",
      leftText: 'Nascondi i draghi', leftEffects: { faith: +10, army: -5 },
      rightText: 'Mostra la loro potenza', rightEffects: { power: +20, people: -8, army: +10 },
      minTurn: 2,
    },
    {
      id: 'dany_slavery', tags: ['people', 'faith'], forChars: ['daenerys'],
      speaker: 'Schiavo liberato', speakerRole: 'Portavoce degli ex-schiavi',
      portrait: '⛓️', icon: '⛓️',
      text: "Gli ex-schiavi di Meereen chiedono terra e lavoro. Aiutarli vi renderà amatissima, ma i nobili locali si ribelleranno e le casse soffriranno.",
      leftText: 'Priorità alla stabilità', leftEffects: { gold: +10, people: -10 },
      rightText: 'Libera e ricompensa', rightEffects: { people: +20, gold: -15, faith: +8 },
      minTurn: 3,
    },
    {
      id: 'dany_dothraki', tags: ['army', 'people'], forChars: ['daenerys'],
      speaker: 'Jorah Mormont', speakerRole: 'Cavaliere e consigliere',
      portrait: '🐴', icon: '🐴',
      text: "Un khalasar di cinquemila Dothraki vi offre fedeltà, Khaleesi. Ma integrarli nell'esercito richiede risorse e potrebbe spaventare le casate di Westeros.",
      leftText: 'Rifiuta i Dothraki', leftEffects: { power: +5 },
      rightText: 'Accogli il khalasar', rightEffects: { army: +22, gold: -15, people: -8 },
      minTurn: 4,
    },
    {
      id: 'dany_king_offer', tags: ['power', 'army'], forChars: ['daenerys'],
      speaker: 'Tyrion Lannister', speakerRole: 'Consigliere della Regina',
      portrait: '🍷', icon: '🍷',
      text: "Tyrion vi consiglia di proporre un'alleanza al Re Reggente prima di attaccare. «Meno sangue, più legittimità.» Ma questo significherebbe riconoscere il suo trono.",
      leftText: 'Attacca senza trattare', leftEffects: { army: +5, power: -10 },
      rightText: 'Considera la diplomazia', rightEffects: { power: +15, army: -5 },
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
      rightText: 'Integra i selvaggi', rightEffects: { army: +18, people: -10, faith: -5 },
      minTurn: 2,
    },
    {
      id: 'jon_wall_defense', tags: ['army', 'gold'], forChars: ['jon'],
      speaker: 'Sam Tarly', speakerRole: 'Maestro dei Guardiani della Notte',
      portrait: '📚', icon: '📚',
      text: "Sam ha trovato nei libri antichi le istruzioni per forgiare acciaio di drago. Serve investire molto, ma le armi contro i Non Morti potrebbero fare la differenza.",
      leftText: "Non abbiamo risorse", leftEffects: { army: +3 },
      rightText: 'Finanzia la ricerca', rightEffects: { gold: -22, army: +15, faith: +5 },
      minTurn: 5,
    },
    {
      id: 'jon_ned_honor', tags: ['faith', 'people'], forChars: ['jon'],
      speaker: 'Lady Lyanna Mormont', speakerRole: 'Lady di Orsorso',
      portrait: '🐻', icon: '🐻',
      text: "Lady Lyanna vi chiede di mantenere le tradizioni del Nord — niente compromessi con i Lannister, niente tradimenti. «Il Nord ricorda.» Ma questo isola il vostro territorio.",
      leftText: "Necessitò di pragmatismo", leftEffects: { power: +10, people: -8 },
      rightText: "L'onore prima di tutto", rightEffects: { faith: +15, people: +10, power: -5 },
      minTurn: 3,
    },
    {
      id: 'jon_lord_commanders', tags: ['power', 'army'], forChars: ['jon'],
      speaker: 'Alliser Thorne', speakerRole: 'Primo Ranger',
      portrait: '❄️', icon: '❄️',
      text: "Thorne sfida la vostra autorità davanti agli altri fratelli neri. Potete rispondergli con fermezza pubblica o ignorarlo per evitare una spaccatura nei ranghi.",
      leftText: 'Ignora la provocazione', leftEffects: { power: -8, army: +3 },
      rightText: 'Affronta il confronto', rightEffects: { power: +15, army: -5, people: +5 },
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
      rightText: "Prepara l'arsenale segreto", rightEffects: { army: +20, people: -15, gold: -12 },
      minTurn: 5,
    },
    {
      id: 'cersei_sparrows', tags: ['faith', 'power'], forChars: ['cersei'],
      speaker: 'Alto Septon', speakerRole: 'Capo della Fede dei Sette',
      portrait: '✝️', icon: '✝️',
      text: "Il Septon Supremo chiede che la Corona rispetti la legge dei Sette. Ha migliaia di fedeli armati. Cedergli potere potrebbe essere fatale nel lungo periodo.",
      leftText: 'Resisti alla Fede', leftEffects: { faith: -20, power: +10, army: -5 },
      rightText: 'Negozia con il Septon', rightEffects: { faith: +15, power: -12 },
      minTurn: 6,
    },
    {
      id: 'cersei_joffrey_advice', tags: ['people', 'power'], forChars: ['cersei'],
      speaker: 'Joffrey Baratheon', speakerRole: 'Erede al Trono',
      portrait: '👑', icon: '👑',
      text: "Joffrey vuole giustiziare pubblicamente un nobile che lo ha insultato. Farlo contenterebbe il Re, ma alienherebbe le altre casate. Fermarlo rischia uno scontro.",
      leftText: 'Ferma Joffrey', leftEffects: { power: -8, people: +10 },
      rightText: 'Lascia fare al Re', rightEffects: { power: +5, people: -15, faith: -5 },
      minTurn: 3,
    },
    {
      id: 'cersei_gold_debt', tags: ['gold', 'power'], forChars: ['cersei'],
      speaker: 'Tywin Lannister', speakerRole: 'Lettera da Castel Granito',
      portrait: '🦁', icon: '🦁',
      text: "Tywin scrive: «I Lannister pagano sempre i loro debiti. Saldare il debito con la Banca di Ferro consoliderà il trono. Rimandare è segno di debolezza.»",
      leftText: 'Rimanda il pagamento', leftEffects: { gold: +15, power: -10 },
      rightText: 'Salda il debito', rightEffects: { gold: -25, power: +15 },
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
      rightText: 'Paga per le informazioni', rightEffects: { gold: -15, power: +20 },
      minTurn: 3,
    },
    {
      id: 'tyrion_speech', tags: ['people', 'power'], forChars: ['tyrion'],
      speaker: 'Cittadini di Approdo del Re', speakerRole: 'Delegazione popolare',
      portrait: '👥', icon: '👥',
      text: "Una delegazione di cittadini vi chiede udienza. Un vostro discorso pubblico potrebbe aumentare il favore popolare, ma i nobili vi accuseranno di demagogia.",
      leftText: 'Evita il discorso', leftEffects: { power: +5 },
      rightText: 'Parla al popolo', rightEffects: { people: +18, power: -8 },
      minTurn: 2,
    },
    {
      id: 'tyrion_sister', tags: ['power', 'faith'], forChars: ['tyrion'],
      speaker: 'Cersei Lannister', speakerRole: 'Tua sorella',
      portrait: '🦁', icon: '🦁',
      text: "Cersei vi convoca: «Stai diventando troppo popolare, fratellino. Ti conviene ricordare chi comanda davvero.» Sfidarla apertamente è rischioso ma necessario.",
      leftText: 'Cedi per ora', leftEffects: { power: -10, gold: +10 },
      rightText: 'Tienile testa', rightEffects: { power: +15, faith: -8, army: -5 },
      minTurn: 5,
    },

    // ══════════════════════════════════════════
    // ── EVENTI ARYA ──
    // ══════════════════════════════════════════
    {
      id: 'arya_faceless', tags: ['power', 'army'], forChars: ['arya'],
      speaker: 'Uomo senza volto', speakerRole: 'Maestro dei Molti Volti',
      portrait: '🎭', icon: '🎭',
      text: "Il vostro addestramento ai Molti Volti è completo. Potete ora cambiare identità per avvicinarvi a un nemico dalla lista. Ma ogni uccisione ha un costo.",
      leftText: 'Non ancora', leftEffects: { power: +3 },
      rightText: "Colpisci dalla lista", rightEffects: { army: +5, power: +15, faith: -10 },
      minTurn: 1, rightTags: ['assassination'],
    },
    {
      id: 'arya_needle', tags: ['army', 'people'], forChars: ['arya'],
      speaker: 'Syrio Forel', speakerRole: 'Primo Spada di Braavos (ricordo)',
      portrait: '🗡️', icon: '🗡️',
      text: "Ricordate le lezioni di Syrio: «Non c'è niente di più importante dell'occhio e della mano.» Allenarvi ogni giorno vi renderà più letale ma vi isola dagli altri.",
      leftText: 'Equilibrio tra vita e addestramento', leftEffects: { people: +8 },
      rightText: 'Addestramento totale', rightEffects: { army: +15, people: -8 },
      minTurn: 1,
    },
    {
      id: 'arya_list', tags: ['power', 'faith'], forChars: ['arya'],
      speaker: 'Voce interiore', speakerRole: 'La tua lista',
      portrait: '📋', icon: '📋',
      text: "Ripetete i nomi ogni notte: Cersei Lannister, Walder Frey, Meryn Trant... La lista vi dà forza ma vi consuma. Potete ampliarla o iniziare a depennare nomi.",
      leftText: "Mantieni la lista com'è", leftEffects: { power: +5 },
      rightText: 'Pianifica il prossimo colpo', rightEffects: { power: +12, faith: -8, army: +5 },
      minTurn: 2, rightTags: ['assassination'],
    },
    {
      id: 'arya_stark_identity', tags: ['people', 'faith'], forChars: ['arya'],
      speaker: 'Sansa Stark', speakerRole: 'Tua sorella (messaggio)',
      portrait: '🐺', icon: '🐺',
      text: "Sansa vi scrive da Grande Inverno: «Arya, ho bisogno di te qui. Stark deve restare unito.» Tornare significherebbe abbandonare la lista — almeno per ora.",
      leftText: 'La lista viene prima', leftEffects: { power: +5, people: -10 },
      rightText: 'Torna a Grande Inverno', rightEffects: { people: +15, faith: +10, power: -8 },
      minTurn: 6, rightTags: ['help_ally'],
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
      rightText: 'Segui il Signore della Luce', rightEffects: { faith: +25, army: +15, people: -18 },
      minTurn: 2,
    },
    {
      id: 'stannis_davos', tags: ['people', 'power'], forChars: ['stannis'],
      speaker: 'Ser Davos Seaworth', speakerRole: 'Mano del Re',
      portrait: '⚓', icon: '⚓',
      text: "Davos vi chiede di moderare l'influenza di Melisandre. «La gente vi segue per giustizia, non per religione, Maestà. Non alienateli con il fuoco.»",
      leftText: "Ignora il consiglio di Davos", leftEffects: { faith: +10, people: -8 },
      rightText: 'Ascolta Davos', rightEffects: { people: +15, faith: -10, power: +5 },
      minTurn: 4,
    },
    {
      id: 'stannis_law', tags: ['power', 'faith'], forChars: ['stannis'],
      speaker: 'Maester Cressen', speakerRole: 'Consigliere reale',
      portrait: '📜', icon: '📜',
      text: "Un vostro vassallo ha violato la legge. La punizione giusta è severa — ma potrebbe alienare altri signori. Il diritto è il diritto.",
      leftText: "Clemenza politica", leftEffects: { power: -8, people: +8 },
      rightText: 'Applica la legge', rightEffects: { power: +15, faith: +8, people: -5 },
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
      rightText: 'Accetta il suo aiuto', rightEffects: { gold: +20, power: -12 },
      minTurn: 2,
    },
    {
      id: 'sansa_north_loyalty', tags: ['people', 'faith'], forChars: ['sansa'],
      speaker: 'Lady Lyanna Mormont', speakerRole: 'Lady di Orsorso',
      portrait: '🐻', icon: '🐻',
      text: "Lady Mormont vi chiede di dichiarare pubblicamente la vostra lealtà al Nord. Questo rafforzerà il popolo, ma vi renderà un bersaglio per le casate del Sud.",
      leftText: 'Mantieni l\'ambiguità', leftEffects: { power: +8 },
      rightText: 'Dichiara fedeltà al Nord', rightEffects: { people: +18, faith: +8, power: -5 },
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
      rightText: "Accetta l'accordo", rightEffects: { army: +15, people: -5, power: +5 },
      minTurn: 3,
    },
    {
      id: 'robb_tully_alliance', tags: ['army', 'power'], forChars: ['robb'],
      speaker: 'Zio Edmure Tully', speakerRole: 'Lord dei Riverlands',
      portrait: '🐟', icon: '🐟',
      text: "Edmure propone di rinforzare la difesa dei Riverlands con le truppe del Tridente. Forte ma costoso — e lascerebbe il Nord meno protetto.",
      leftText: 'Proteggi il Nord', leftEffects: { army: +5, people: +5 },
      rightText: 'Rinforza i Riverlands', rightEffects: { army: +18, gold: -15, people: -5 },
      minTurn: 2, rightTags: ['help_ally'],
    },
    {
      id: 'robb_king_north', tags: ['power', 'faith'], forChars: ['robb'],
      speaker: 'Signori del Nord', speakerRole: 'Consiglio di guerra nordico',
      portrait: '🐺', icon: '🐺',
      text: "I signori nordici si alzano in piedi: «Il Re del Nord! Il Re del Nord!» Accettare questo titolo vi darebbe immenso potere locale, ma vi renderebbe un obiettivo per il trono.",
      leftText: 'Declina il titolo per ora', leftEffects: { power: -5, people: -5 },
      rightText: 'Accetta la corona del Nord', rightEffects: { power: +22, people: +15, army: +8 },
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
      rightText: 'Racconta la verità ad Aerys', rightEffects: { people: +18, faith: +8, power: -5 },
      minTurn: 2,
    },
    {
      id: 'jaime_cersei_orders', tags: ['power', 'army'], forChars: ['jaime'],
      speaker: 'Cersei Lannister', speakerRole: 'Tua sorella e Regina',
      portrait: '🦁', icon: '🦁',
      text: "Cersei vi ordina di compiere un atto che vi ripugna — attaccare civili innocenti per punire una casata ribelle. Obbedire rafforza la vostra posizione a corte.",
      leftText: 'Rifiuta l\'ordine', leftEffects: { faith: +15, people: +10, power: -15 },
      rightText: 'Obbedisci a Cersei', rightEffects: { power: +10, people: -18, faith: -12 },
      minTurn: 4,
    },
    {
      id: 'jaime_brienne', tags: ['faith', 'army'], forChars: ['jaime'],
      speaker: 'Brienne di Tarth', speakerRole: 'Cavaliere dell\'ordine della spada',
      portrait: '🛡️', icon: '🛡️',
      text: "Brienne vi chiede di onorare un giuramento fatto a Lady Catelyn: proteggere le figlie Stark. Rispettarlo richiede risorse e rischia di mettervi contro i Lannister.",
      leftText: 'Il giuramento può aspettare', leftEffects: { faith: -12, power: +5 },
      rightText: 'Onora il tuo giuramento', rightEffects: { faith: +20, army: -8 },
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
      rightText: 'Segui i consigli di nonna', rightEffects: { power: +20, people: +8 },
      minTurn: 2,
    },
    {
      id: 'margaery_poor_quarters', tags: ['people', 'faith'], forChars: ['margaery'],
      speaker: 'Septa Nysterica', speakerRole: 'Accompagnatrice di corte',
      portrait: '🌺', icon: '🌺',
      text: "Volete visitare i quartieri poveri di Approdo del Re, distribuire pane e carne. La gente vi adorerà, ma il Re potrebbe essere geloso della vostra popolarità.",
      leftText: 'Evita i confronti col Re', leftEffects: { power: +5 },
      rightText: 'Visita i poveri', rightEffects: { people: +20, faith: +10, power: -8 },
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
      rightText: 'Sono Theon Greyjoy', rightEffects: { power: +15, faith: +10, army: -5 },
      minTurn: 1,
    },
    {
      id: 'theon_iron_islands', tags: ['army', 'power'], forChars: ['theon'],
      speaker: 'Capitano della flotta Greyjoy', speakerRole: 'Ufficiale di marina',
      portrait: '⚓', icon: '⚓',
      text: "La flotta delle Isole di Ferro è disponibile se dimostrate di essere ancora Greyjoy. Ma comandarla richiede di tornare alle Isole — e affrontare i vostri vecchi nemici.",
      leftText: 'Non ancora', leftEffects: { army: +3 },
      rightText: 'Rivendica la flotta', rightEffects: { army: +20, power: +10, gold: -12 },
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
      leftText: 'Accordo segreto con Varys', leftEffects: { power: +10, gold: -15 },
      rightText: 'Distruggi la sua reputazione', rightEffects: { power: +22, faith: -8 },
      minTurn: 3, rightTags: ['poison_intrigue'],
    },
    {
      id: 'lf_financial_web', tags: ['gold', 'power'], forChars: ['littlefinger'],
      speaker: 'Mercante di Lys', speakerRole: 'Partner commerciale segreto',
      portrait: '🪙', icon: '🪙',
      text: "Il vostro partner a Lys ha identificato un'opportunità: manipolare i mercati delle spezie prima dell'annuncio di una nuova tassa. Illegale, ma enormemente redditizio.",
      leftText: 'Troppo rischioso', leftEffects: { gold: +8 },
      rightText: 'Sfrutta l\'informazione', rightEffects: { gold: +30, power: +10, faith: -15 },
      minTurn: 2,
    },

    // ══════════════════════════════════════════
    // ── EVENTI MELISANDRE ──
    // ══════════════════════════════════════════
    {
      id: 'mel_fire_visions', tags: ['faith', 'power'], forChars: ['melisandre'],
      speaker: 'R\'hllor (visione nel fuoco)', speakerRole: 'Il Signore della Luce',
      portrait: '🔥', icon: '🔥',
      text: "Le fiamme vi mostrano il Principe Promesso. Ma il volto è ambiguo — potrebbe essere Stannis, o qualcun altro. Agire sulla profezia ora potrebbe essere prematuro.",
      leftText: 'Aspetta conferma', leftEffects: { faith: +5 },
      rightText: 'Agisci sulla visione', rightEffects: { faith: +20, power: +15, army: -8 },
      minTurn: 2,
    },
    {
      id: 'mel_resurrection', tags: ['faith', 'army'], forChars: ['melisandre'],
      speaker: 'Thoros di Myr', speakerRole: 'Sacerdote Rosso',
      portrait: '🕯️', icon: '🕯️',
      text: "Thoros vi rivela il segreto della resurrezione. Con abbastanza fede e sacrificio, anche la morte può essere reversibile. Il prezzo però è devastante per chi vi circonda.",
      leftText: 'La vita è sacra', leftEffects: { faith: -5, people: +10 },
      rightText: 'Apprendi il rito', rightEffects: { faith: +30, people: -20, army: +10 },
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
      rightText: 'Dichiara guerra ai Lannister', rightEffects: { army: +15, power: +10, people: -12 },
      minTurn: 3, rightTags: ['war_choice'],
    },
    {
      id: 'oberyn_dorne_army', tags: ['army', 'gold'], forChars: ['baelish'],
      speaker: 'Capitano della guardia dorniana', speakerRole: 'Ufficiale di Dorne',
      portrait: '🏜️', icon: '🏜️',
      text: "L'esercito di Dorne è pronto, ma i rifornimenti scarseggiano. Potete razionare e mantenere la forza militare, o spendere oro per avere truppe ben equipaggiate.",
      leftText: 'Raziona i rifornimenti', leftEffects: { army: +5, people: -5 },
      rightText: 'Equipaggia al meglio', rightEffects: { army: +18, gold: -20 },
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
      rightText: 'Accetta l\'incarico', rightEffects: { power: +20, people: -8 },
      minTurn: 1,
    },
    {
      id: 'ned_cersei_secret', tags: ['power', 'faith'], forChars: ['ned'],
      speaker: 'Littlefinger', speakerRole: 'Lord Protettore oscuro',
      portrait: '🪙', icon: '🪙',
      text: "Avete scoperto il segreto di Cersei. Littlefinger vi avvisa: «Usate questa informazione con cautela, Lord Stark. Ad Approdo del Re l'onore è una debolezza.»",
      leftText: 'Affronta Cersei direttamente', leftEffects: { faith: +15, power: -20 },
      rightText: 'Usa l\'informazione con cautela', rightEffects: { power: +15, faith: -10 },
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
      leftText: 'Usalo come leva diplomatica', leftEffects: { power: +15, people: -5 },
      rightText: 'Processalo alla Valle', rightEffects: { faith: +8, power: -10, army: -8 },
      minTurn: 3,
    },
    {
      id: 'cat_children_safety', tags: ['people', 'faith'], forChars: ['catelyn'],
      speaker: 'Maester Luwin', speakerRole: 'Maester di Grande Inverno',
      portrait: '📚', icon: '📚',
      text: "Luwin vi informa che le rotte verso il Sud sono pericolose per i figli di Stark. Potete nasconderli in luoghi sicuri — costoso e politicamente debole — o mantenerli visibili.",
      leftText: 'Tienili visibili (simbolo)', leftEffects: { power: +8, people: +5 },
      rightText: 'Metti in sicurezza i figli', rightEffects: { people: +12, gold: -15 },
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
      leftText: 'Accetta il nobile', leftEffects: { gold: +20, army: -5 },
      rightText: 'Offerta dei nemici (di più)', rightEffects: { gold: +30, army: -8, power: -5 },
      minTurn: 1,
    },
    {
      id: 'bronn_no_loyalty', tags: ['power', 'people'], forChars: ['bronn'],
      speaker: 'Tyrion Lannister', speakerRole: 'Vecchio datore di lavoro',
      portrait: '🍷', icon: '🍷',
      text: "Tyrion vi offre una somma ingente per tornare al suo servizio. Ma un altro signore vi ha offerto ancora di più. La lealtà ha un prezzo — qual è il vostro?",
      leftText: 'Vai con Tyrion (meno oro)', leftEffects: { gold: +15, power: +8 },
      rightText: 'Vai col miglior offerente', rightEffects: { gold: +28, power: -5 },
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
      rightText: 'È il momento', rightEffects: { power: +25, faith: -15 },
      minTurn: 5, rightTags: ['poison_intrigue', 'assassination'],
    },
    {
      id: 'olenna_margaery', tags: ['people', 'power'], forChars: ['olenna'],
      speaker: 'Margaery Tyrell', speakerRole: 'Tua nipote',
      portrait: '🌹', icon: '🌹',
      text: "Margaery vi chiede consiglio sul Re. Guidarla bene potrebbe consolidare la posizione dei Tyrell, ma ogni mossa sbagliata potrebbe costarle — e costarvi — tutto.",
      leftText: 'Difendila ad ogni costo', leftEffects: { people: +12, gold: -10 },
      rightText: 'Sacrificala se necessario', rightEffects: { power: +15, people: -15 },
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
      leftText: 'Unisciti al clan', leftEffects: { army: +15, people: +8 },
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
      rightText: 'Razzia i villaggi del Sud', rightEffects: { gold: +18, army: +5, faith: -15, people: -10 },
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
      speaker: 'Jaqen H\'ghar', speakerRole: 'Maestro dei Molti Volti',
      portrait: '🎭', icon: '🎭',
      text: "«Una ragazza ha imparato bene. Un nome dalla lista può essere depennato.» Le vostre abilità vi permettono di eliminare un obiettivo senza lasciare tracce.",
      leftText: 'Non ancora pronta', leftEffects: { power: +3 },
      rightText: 'Depenna il nome', rightEffects: { power: +15, faith: -10, people: +5 },
      minTurn: 8, rightTags: ['assassination'],
    },

    // MARGAERY — carte royal_marriage aggiuntive
    {
      id: 'margaery_king_proposal', tags: ['power', 'people'], forChars: ['margaery'],
      speaker: 'Re Reggente', speakerRole: 'Messaggio reale sigillato',
      portrait: '💍', icon: '💍',
      text: "Il Re vi ha notata a corte. Il messaggio è chiaro: è interessato a un'unione. Accettare vi porterebbe al cuore del potere. Rifiutare potrebbe essere pericoloso.",
      leftText: 'Declina con grazia', leftEffects: { power: -5, faith: +8 },
      rightText: 'Accetta le nozze reali', rightEffects: { power: +20, people: +10, gold: +10 },
      minTurn: 3, rightTags: ['royal_marriage'],
    },
    {
      id: 'margaery_second_chance', tags: ['power', 'gold'], forChars: ['margaery'],
      speaker: 'Olenna Tyrell', speakerRole: 'La Regina delle Spine',
      portrait: '🌹', icon: '🌹',
      text: "Nonna Olenna ha orchestrato una nuova opportunità: un secondo incontro con il Re. «Questa volta, nipote mia, non lasciare che sfugga.»",
      leftText: "Non è il momento giusto", leftEffects: { gold: +5 },
      rightText: 'Conquista il Re', rightEffects: { power: +18, gold: +12, people: +8 },
      minTurn: 10, rightTags: ['royal_marriage'],
    },

    // STANNIS — carte war_victory aggiuntive
    {
      id: 'stannis_siege', tags: ['army', 'power'], forChars: ['stannis'],
      speaker: 'Ser Davos Seaworth', speakerRole: 'Mano del Re',
      portrait: '⚓', icon: '⚓',
      text: "Davos ha identificato un punto debole nelle difese nemiche. Un assedio rapido potrebbe concludersi con una vittoria decisiva. I rischi sono alti ma la ricompensa anche.",
      leftText: 'Troppo rischioso', leftEffects: { army: +5 },
      rightText: 'Lancia il siege', rightEffects: { army: -15, power: +20, gold: -10 },
      minTurn: 6, rightTags: ['war_victory'],
    },
    {
      id: 'stannis_battle_decisive', tags: ['army', 'faith'], forChars: ['stannis'],
      speaker: 'Melisandre', speakerRole: 'Sacerdotessa Rossa',
      portrait: '🔥', icon: '🔥',
      text: "«Le fiamme mostrano la vittoria, Maestà. R\'hllor è con voi. Attaccate oggi e il nemico cadrà.» Melisandre è convinta. E di solito ha ragione.",
      leftText: 'Aspetta condizioni migliori', leftEffects: { faith: +8 },
      rightText: 'Attacca con il favore di R\'hllor', rightEffects: { army: -12, faith: +15, power: +18 },
      minTurn: 12, rightTags: ['war_victory'],
    },

    // DAENERYS — carta war_victory specifica
    {
      id: 'dany_conquest', tags: ['army', 'power'], forChars: ['daenerys'],
      speaker: 'Grigio Verme', speakerRole: 'Comandante degli Immacolati',
      portrait: '🐉', icon: '🐉',
      text: "Gli Immacolati sono in posizione. I draghi sono pronti. «Khaleesi, la città è nostra se ordinate l'attacco. Un'altra casata nemica cadrà oggi.»",
      leftText: 'Aspetta ancora', leftEffects: { army: +5 },
      rightText: 'Dracarys — attacca!', rightEffects: { army: -15, power: +22, people: -8 },
      minTurn: 10, rightTags: ['war_victory'],
    },

    // OBERYN — carta war_victory vs Lannister specifica
    {
      id: 'oberyn_lannister_strike', tags: ['army', 'power'], forChars: ['baelish'],
      speaker: 'Capitano della guardia dorniana', speakerRole: 'Rapporto dal campo',
      portrait: '🐍', icon: '🐍',
      text: "Le forze Lannister sono vulnerabili nel Westerlands. È l'occasione per cui avete aspettato. Una campagna rapida potrebbe sconfiggerli definitivamente.",
      leftText: 'Non ora', leftEffects: { army: +5 },
      rightText: 'Colpisci i Lannister', rightEffects: { army: -18, power: +20, people: -5 },
      minTurn: 8, rightTags: ['war_victory'],
    },

    // JAIME — carta help_ally aggiuntiva
    {
      id: 'jaime_riverlands_help', tags: ['army', 'people'], forChars: ['jaime'],
      speaker: 'Lord dei Riverlands', speakerRole: 'Richiesta urgente',
      portrait: '🛡️', icon: '🛡️',
      text: "Villaggi dei Riverlands bruciano. Un lord vi chiede protezione — non in nome dei Lannister, ma dell'innocente. È il momento di scegliere chi siete davvero.",
      leftText: 'Non è affar mio', leftEffects: { faith: -10 },
      rightText: 'Proteggi i civili', rightEffects: { people: +15, army: -8, faith: +12 },
      minTurn: 5, rightTags: ['help_ally'],
    },
    {
      id: 'jaime_oath_honor', tags: ['faith', 'people'], forChars: ['jaime'],
      speaker: 'Cavaliere senza padrone', speakerRole: 'Supplica',
      portrait: '⚔️', icon: '⚔️',
      text: "Un cavaliere senza padrone chiede il vostro aiuto per difendere la sua famiglia. Non c'è niente da guadagnarci — solo il peso dell'onore. O della vergogna.",
      leftText: 'Non posso permettermelo', leftEffects: { faith: -8 },
      rightText: 'Aiuta il cavaliere', rightEffects: { faith: +18, people: +10, gold: -12 },
      minTurn: 4, rightTags: ['help_ally'],
    },

    // NED — carta betray per rendere la condizione concretamente evitabile
    // (Ned ha già ned_cersei_secret che può portare a betray — aggiungiamo una trappola esplicita)
    {
      id: 'ned_littlefinger_trap', tags: ['power', 'faith'], forChars: ['ned'],
      speaker: 'Littlefinger', speakerRole: 'Consiglio avvelenato',
      portrait: '🪙', icon: '🪙',
      text: "Littlefinger vi propone di falsificare prove contro un nobile innocente per rafforzare la vostra posizione. «Solo questa volta, Lord Stark. Nessuno saprà mai.»",
      leftText: 'Mai — l\'onore prima di tutto', leftEffects: { power: -8, faith: +15 },
      rightText: 'Accetta il compromesso', rightEffects: { power: +18, faith: -20 },
      minTurn: 6, rightTags: ['betray_ally'],
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
  }

  // ══════════════════════════════════════════════
  // HUD UPDATE
  // ══════════════════════════════════════════════
  function updateHUD() {
    const r = state.resources;
    const char = state.character;

    document.getElementById('hud-char-icon').textContent = char.icon;
    document.getElementById('hud-char-name').textContent = char.name.split(' ')[0];
    document.getElementById('hud-turn').textContent = state.turn;
    document.getElementById('objective-text').textContent = char.objective;

    const bars = { gold: 'bar-gold', faith: 'bar-faith', people: 'bar-people', army: 'bar-army', power: 'bar-power' };
    const vals = { gold: 'val-gold', faith: 'val-faith', people: 'val-people', army: 'val-army', power: 'val-power' };

    Object.keys(bars).forEach(key => {
      const v = clamp(r[key]);
      document.getElementById(bars[key]).style.width = v + '%';
      document.getElementById(vals[key]).textContent = Math.round(v);
    });
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
          leftText: 'Scusarti umilmente', leftEffects: { power: -15, gold: -20 },
          rightText: 'Ignorarli', rightEffects: { army: -15, people: -10 },
          minTurn: state.turn + 10,
          tags: ['betray_consequence'],
        });
      }
    }

    // Animate card out
    const el = document.getElementById('main-card');
    el.classList.add(side === 'left' ? 'swipe-left' : 'swipe-right');

    state.turn++;

    // Check game over
    setTimeout(() => {
      el.classList.remove('swipe-left', 'swipe-right');
      checkGameOver();
      if (!state.gameOver) {
        updateHUD();
        drawNextCard();
        saveGame();
      }
    }, 350);
  }

  // ══════════════════════════════════════════════
  // GAME OVER CHECK — min (≤0) AND max (≥100)
  // ══════════════════════════════════════════════
  function checkGameOver() {
    const r = state.resources;
    const char = state.character;
    const isRuler = (state.king === char.id);

    // ── GOLD ──
    if (r.gold <= 0) {
      return triggerEnd(false, '💸', 'Le Casse Sono Vuote',
        `Il tesoro reale è esaurito fino all'ultimo Stag. I mercenari hanno abbandonato le vostre fila reclamando paghe arretrate. I signori fedeli, privati delle loro rendite, hanno ritirato i propri stendardi. ${isRuler ? 'Il Gran Consiglio si è riunito in vostro nome — e ha votato la vostra deposizione.' : 'Senza oro, la vostra influenza si è dissolta come nebbia al sole.'} Il vostro nome sarà ricordato come monito ai governanti avidi.`
      );
    }
    if (r.gold >= 100) {
      return triggerEnd(false, '🏦', 'L\'Avidità del Drago',
        `Le vostre casse traboccano di ricchezze accumulate senza distribuirne una moneta. La Banca di Ferro ha fiutato l\'opportunità e ha finanziato una coalizione di rivali assetati del vostro oro. ${isRuler ? 'Un colpo di stato ben finanziato vi ha strappato il trono nel cuore della notte.' : 'I vostri stessi alleati vi hanno tradito, attratti dalla promessa di spartirsi il bottino.'} L\'avidità è la rovina dei re.`
      );
    }

    // ── FAITH ──
    if (r.faith <= 0) {
      return triggerEnd(false, '⛪', 'La Maledizione dei Sette',
        `I Sette si sono voltati contro di voi. Il Septon Supremo ha pronunciato la scomunica dal pulpito del Grande Settario. Pellegrini scalzi marciano su Approdo del Re cantando la vostra vergogna. ${isRuler ? 'La guardia reale stessa ha rifiutato di alzare le armi in vostra difesa: combattere contro la volontà dei Sette è peccato mortale.' : 'Nessun signore osa ospitarvi, terrorizzato dalla macchia dell\'eresia.'} Siete fuggiti nella notte, soli come un lebbroso.`
      );
    }
    if (r.faith >= 100) {
      return triggerEnd(false, '🔥', 'Il Fanatismo dei Fedeli',
        `La Fede Militante, gonfia del vostro sostegno incondizionato, ha preso il controllo delle strade. Gli Sparrow Grigi arrestano chiunque non si inginocchi. ${isRuler ? 'Il Septon Supremo ha dichiarato che solo un sovrano "purificato" può regnare — e la purificazione richiede il vostro sacrificio. Siete stati condotti a piedi nudi lungo la Via delle Lacrime sotto gli occhi di tutta la città.' : 'Avete creato un mostro che non potete più controllare. I fanatici hanno rivolto le loro spade contro di voi, accusandovi di non essere abbastanza devoto.'} Il fuoco della Fede consuma tutto, anche chi lo ha acceso.`
      );
    }

    // ── PEOPLE ──
    if (r.people <= 0) {
      return triggerEnd(false, '🔥', 'La Grande Rivolta',
        `Le strade di Approdo del Re bruciano. La gente affamata e oppressa ha sfondato i cancelli del Quartiere dei Poveri. ${isRuler ? 'Le vostre guardie hanno disertato una per una, rifiutandosi di massacrare i propri padri e fratelli. Il Trono di Spade è rimasto vuoto mentre voi fuggivate dai passaggi segreti di Maegor.' : 'La folla inferocita ha assaltato la vostra dimora. Nessun alleato si è fatto avanti — nessuno vuole essere trascinato giù con voi.'} Come Aerys il Folle prima di voi, avete dimenticato che i re regnano per grazia del popolo.`
      );
    }
    if (r.people >= 100) {
      return triggerEnd(false, '🎭', 'L\'Idolo Spodestato',
        `Eravate amati come nessun sovrano prima. Troppo amati. ${isRuler ? 'Il popolo ha iniziato a venerarvi come un dio vivente — e gli dèi non governano, vengono adorati. Il Gran Consiglio, geloso del vostro potere mistico sul popolo, ha dichiarato che un essere divino non deve sporcarsi le mani con la politica. Siete stati "elevati" a simbolo sacro, privato di ogni potere reale.' : 'La vostra popolarità ha spaventato chi siede sul Trono. Un ordine silenzioso ha raggiunto un sicario dei Molti Volti.'} Anche il sole, amato da tutti, tramonta.`
      );
    }

    // ── ARMY ──
    if (r.army <= 0) {
      return triggerEnd(false, '💀', 'La Disfatta Totale',
        `Il vostro esercito non esiste più. Gli ultimi soldati sono morti, fuggiti o passati al nemico. ${isRuler ? 'Le porte di Approdo del Re sono state aperte senza combattere. Il Re conquistatore è entrato a cavallo nella Sala del Trono Maidito, trovandovi ancora seduto sul Trono di Spade — un re senza corona, senza soldati, senza futuro.' : 'Senza protezione militare, i vostri nemici hanno fatto irruzione nel vostro castello all\'alba.'} La storia ricorda solo i vincitori.`
      );
    }
    if (r.army >= 100) {
      return triggerEnd(false, '⚔', 'Il Condottiero Spodestato',
        `Il vostro esercito è diventato la forza più potente dei Sette Regni — e questo ha terrorizzato ogni casata. ${isRuler ? 'I vostri stessi generali, inebriati dal potere, si sono riuniti in un consiglio di guerra segreto. "Un re che comanda un esercito così grande è un tiranno" hanno dichiarato. All\'alba il Primo Spada vi ha presentato una scelta: abdicare o essere rimosso con la forza. Il vostro esercito vi ha abbandonato — erano soldati, non schiavi.' : 'Una coalizione di sette casate, unite dalla paura, ha lanciato un attacco preventivo coordinato. Meglio distruggere il leone adesso che aspettare di essere divorati uno per uno.'} Il potere militare assoluto è il preludio della caduta assoluta.`
      );
    }

    // ── POLITICAL POWER ──
    if (r.power <= 0) {
      return triggerEnd(false, '🕯️', 'L\'Ombra Svanita',
        `Il vostro potere politico si è dissolto. Nessun signore risponde più alle vostre lettere. Nessun corvo torna con buone notizie. ${isRuler ? 'Il Gran Maester ha convocato il Gran Consiglio senza nemmeno informarvi. Quando siete entrati nella sala del trono, i posti erano già occupati da chi vi aveva già sostituito nei fatti.' : 'Siete diventati irrilevanti. Le grandi casate vi ignorano come si ignora un servo.'} Uno spettro alla corte, senza voce e senza peso.`
      );
    }
    if (r.power >= 100) {
      return triggerEnd(false, '👁️', 'Il Tiranno Assoluto',
        `Avete accumulato un potere politico senza precedenti. Ogni casata, ogni signore, ogni septon è nelle vostre mani. ${isRuler ? 'Ma il potere assoluto genera paura assoluta. Una congiura silenziosa ha unito nemici giurati in un\'unica causa: eliminarvi prima che il vostro controllo diventi eterno. Il veleno nel calice del vino era il gesto finale di chi non aveva altra scelta.' : 'Siete diventati la minaccia che tutti temono e nessuno può affrontare da solo — quindi tutti vi hanno affrontato insieme.'} Nessun uomo può tenere il mondo intero nel pugno senza che il mondo si rivolti.`
      );
    }

    // ── WIN ──
    if (char.objectiveCheck(state)) {
      return triggerEnd(true, char.icon, `${char.name} Trionfa!`,
        `Il vostro destino si è compiuto. ${char.objective} — Dopo ${state.turn} turni di intrighi, guerre e diplomazia, il vostro nome entrerà nella storia dei Sette Regni. I maestri scriveranno di voi per generazioni.`
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

  function renderDiplomacy() {
    const container = document.getElementById('diplo-houses');
    container.innerHTML = '';
    Object.entries(state.houses).forEach(([hId, h]) => {
      const card = document.createElement('div');
      card.className = 'house-card' + (state.ravenTarget === hId ? ' selected' : '');
      card.innerHTML = `
        <span class="house-icon">${h.icon}</span>
        <span class="house-name">Casa ${h.name}</span>
        <span class="house-status status-${h.status}">${h.status === 'ally' ? '✅ Alleati' : h.status === 'enemy' ? '⚔ Nemici' : '⚪ Neutrali'}</span>
        <span class="house-army">⚔ Esercito: ${Math.round(h.army)}</span>
      `;
      card.addEventListener('click', () => selectRavenTarget(hId));
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
        <button onclick="Game.challengeKing();Game.toggleDiplomacy();" style="
          width:100%;padding:0.65rem;
          background:linear-gradient(135deg,rgba(127,29,29,0.8),rgba(153,27,27,0.9));
          border:1px solid rgba(239,68,68,0.5);border-radius:2px;
          font-family:'Cinzel',serif;font-size:0.75rem;font-weight:700;
          letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#fca5a5;
          transition:all 0.2s;
        " onmouseover="this.style.background='linear-gradient(135deg,#7f1d1d,#dc2626)';this.style.color='#fff'"
           onmouseout="this.style.background='linear-gradient(135deg,rgba(127,29,29,0.8),rgba(153,27,27,0.9))';this.style.color='#fca5a5'">
          ⚔ Sfida il Re Reggente
        </button>
        <p style="font-size:0.7rem;color:#6b5e4a;margin-top:0.35rem;font-family:'EB Garamond',serif;font-style:italic">
          ⚠ Dichiarare la sfida costa -10 Popolo
        </p>
      `;
    }

    const ravenSelect = document.getElementById('raven-select');
    ravenSelect.textContent = state.ravenTarget
      ? `Corvo destinato a Casa ${state.houses[state.ravenTarget].name}`
      : 'Seleziona una casata per inviare un corvo...';

    const ravenActions = document.getElementById('raven-actions');
    ravenActions.classList.toggle('hidden', !state.ravenTarget);
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
    const cost = { alliance: -20, war: 0, tribute: -25 };
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
          { res: 'gold',  label: 'oro',     icon: '💰', amount: Math.floor(Math.random() * 15) + 10 },
          { res: 'army',  label: 'soldati', icon: '⚔',  amount: Math.floor(Math.random() * 12) + 8  },
          { res: 'faith', label: 'sostegno alla Fede', icon: '✝', amount: Math.floor(Math.random() * 10) + 8 },
        ];
        const demand = rand(demandTypes);

        if (state.resources[demand.res] < demand.amount + 5) {
          showToast(`Casa ${h.name} chiede ${demand.icon} ${demand.amount} ${demand.label} — non ne avete abbastanza.`, 'warn');
          state.ravenTarget = null;
          updateHUD();
          toggleDiplomacy();
          return;
        }

        // Apply the cost and then roll
        state.resources[demand.res] = clamp(state.resources[demand.res] - demand.amount);
        const roll = Math.random();

        if (roll < chance) {
          h.status = h.status === 'enemy' ? 'neutral' : 'ally';
          state.resources.power = clamp(r.power + (h.status === 'ally' ? 12 : 6));
          const msg = h.status === 'ally'
            ? `🤝 Casa ${h.name} accetta! Hanno ricevuto ${demand.icon}${demand.amount} e vi riconoscono come alleati. (${pct}%)`
            : `✉ Casa ${h.name} allenta le ostilità in cambio del vostro contributo. Ora Neutrali. (${pct}%)`;
          showToast(msg, 'good');
          if (h.status === 'ally') state.decisionHistory.push({ turn: state.turn, cardId: 'raven_alliance', choice: 'alliance', tags: ['diplomacy'], target: state.ravenTarget });
        } else {
          showToast(`💰 Casa ${h.name} ha preso ${demand.icon}${demand.amount} ${demand.label} ma ha rifiutato la proposta. (${pct}% — sfiga)`, 'warn');
        }

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
        }
      }
    } else if (action === 'war') {
      if (h.status === 'ally') {
        h.status = 'enemy';
        state.decisionHistory.push({ turn: state.turn, cardId: 'raven_betray', choice: 'war', tags: ['betray_ally'], target: state.ravenTarget });
        showToast(`⚔ Hai dichiarato guerra a Casa ${h.name}! Tradimento registrato.`, 'warn');
      } else {
        h.status = 'enemy';
        showToast(`⚔ Guerra dichiarata a Casa ${h.name}!`, 'warn');
        triggerWar(state.ravenTarget);
        return;
      }
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
  // THRONE CHALLENGE SYSTEM
  // ══════════════════════════════════════════════

  function challengeKing() {
    if (state.isPlayerKing) {
      showToast('👑 Sei già il Re Reggente!', 'warn');
      return;
    }

    // Political cost: declaring intention scares people
    state.resources.people = clamp(state.resources.people - 10);
    showToast('📣 La notizia della tua sfida al Re si diffonde… il popolo è in fermento. (-10 Popolo)', 'warn');

    // Calculate forces
    const diff = state.character.difficulty;
    const diffMod = { easy: 0.80, medium: 1.0, hard: 1.25 }[diff] || 1.0;

    const kingBaseArmy = (state.kingArmy || 65) * diffMod;
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
    const won = playerForce > kingForce;
    const diff = state.character.difficulty;

    if (won) {
      // Player becomes king
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

      // Power gain + army loss from battle
      state.resources.power = clamp(state.resources.power + 20);
      state.resources.army = clamp(state.resources.army - 10);
      state.decisionHistory.push({ turn: state.turn, cardId: 'throne_victory', choice: 'attack', tags: ['war_victory', 'throne_conquest'] });

      // Queue legitimacy event in 5 turns
      setTimeout(() => {
        if (!state.gameOver && state.isPlayerKing) {
          state.eventQueue.push(THRONE_LEGITIMACY_EVENT);
        }
      }, 0);
      state._legitimacyQueued = state.turn + 5;

      showThroneResultOverlay(true, oldKingName);
    } else {
      // Defeat
      const armyLoss = { easy: 25, medium: 35, hard: 45 }[diff] || 35;
      state.resources.army = clamp(state.resources.army - armyLoss);
      state.resources.power = clamp(state.resources.power - 15);
      state.resources.people = clamp(state.resources.people - 8);
      // King declares player sworn enemy — boost king's allied houses to enemy status
      const oldKingHouseId = state.kingHouseAffiliation;
      if (state.houses[oldKingHouseId]) {
        state.houses[oldKingHouseId].status = 'enemy';
      }
      state.decisionHistory.push({ turn: state.turn, cardId: 'throne_defeat', choice: 'attack', tags: ['war_choice', 'throne_defeat'] });

      showThroneResultOverlay(false, state.kingName);
    }

    updateHUD();
    saveGame();
  }

  const THRONE_LEGITIMACY_EVENT = {
    id: 'throne_legitimacy',
    speaker: 'Gran Maester', speakerRole: 'Consigliere del Trono',
    portrait: '📜', icon: '📜',
    text: "Da quando siede sul Trono di Spade, le grandi casate osservano. Il Gran Maester si presenta con una richiesta formale: «Le casate chiedono segni di legittimità. Un grande banchetto o una campagna di favori diplomatici rafforzerebbe il vostro diritto a regnare.»",
    leftText: 'Ignora la richiesta', leftEffects: { power: -15, people: -10 },
    rightText: 'Afferma la tua legittimità', rightEffects: { gold: -20, people: +15, faith: +10, power: +10 },
    tags: ['throne_legitimacy'],
  };

  function showThroneResultOverlay(won, kingName) {
    const overlay = document.createElement('div');
    overlay.className = 'war-overlay';
    const diff = state.character.difficulty;
    const armyLoss = { easy: 25, medium: 35, hard: 45 }[diff] || 35;
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
      <button class="btn-primary" style="max-width:200px" onclick="this.parentElement.remove();Game.checkAndContinue()">Continua</button>
    `;
    document.body.appendChild(overlay);
  }

  // ══════════════════════════════════════════════
  // WAR RESOLUTION
  // ══════════════════════════════════════════════
  function triggerWar(houseId) {
    const h = state.houses[houseId];

    // Player force
    let playerForce = state.resources.army;
    const allyBonus = Object.values(state.houses)
      .filter(hh => hh.status === 'ally')
      .reduce((sum, hh) => sum + hh.army * 0.4, 0);
    playerForce += allyBonus;

    // Enemy force
    let enemyForce = h.army;
    const enemyAllyBonus = Object.entries(state.houses)
      .filter(([id, hh]) => id !== houseId && hh.status === 'enemy')
      .reduce((sum, [, hh]) => sum + hh.army * 0.3, 0);
    enemyForce += enemyAllyBonus;

    // Desertion chance
    const desertionRoll = Math.random();
    let desertNote = '';
    if (desertionRoll < 0.15) {
      const desertAmt = Math.floor(playerForce * 0.2);
      playerForce -= desertAmt;
      desertNote = `⚠ TRADIMENTO! ${Math.round(desertAmt)} soldati disertano all'ultimo momento! `;
    }

    const won = playerForce > enemyForce;
    const margin = Math.abs(playerForce - enemyForce);

    // Consequences
    if (won) {
      state.resources.army = clamp(state.resources.army - Math.floor(margin * 0.2));
      state.resources.power += 20;
      h.army = Math.floor(h.army * 0.4);
      h.status = 'enemy';
      state.decisionHistory.push({ turn: state.turn, cardId: 'war_victory', choice: 'war', tags: ['war_victory', 'war_choice'], target: houseId });
    } else {
      state.resources.army = clamp(state.resources.army - Math.floor(margin * 0.4));
      state.resources.power = clamp(state.resources.power - 15);
      state.resources.people = clamp(state.resources.people - 10);
      state.decisionHistory.push({ turn: state.turn, cardId: 'war_defeat', choice: 'war', tags: ['war_choice'], target: houseId });
    }

    // Show war overlay
    showWarOverlay(h, won, playerForce, enemyForce, desertNote);
  }

  function showWarOverlay(h, won, pf, ef, desertNote) {
    const overlay = document.createElement('div');
    overlay.className = 'war-overlay';
    overlay.innerHTML = `
      <div class="war-title">⚔ BATTAGLIA ⚔</div>
      <div class="war-log">
        <p><strong>Voi vs Casa ${h.name}</strong></p>
        <p>🗡 Vostra forza: <strong>${Math.round(pf)}</strong></p>
        <p>🛡 Forza nemica: <strong>${Math.round(ef)}</strong></p>
        ${desertNote ? `<p style="color:#f87171">${desertNote}</p>` : ''}
        <br>
        <p class="war-result ${won ? 'war-victory' : 'war-defeat'}">${won ? '🏆 VITTORIA!' : '💀 SCONFITTA!'}</p>
        <p>${won ? `Casa ${h.name} è stata sconfitta. Il vostro potere cresce.` : `Le vostre truppe si ritirano. Casa ${h.name} rimane una minaccia.`}</p>
      </div>
      <button class="btn-primary" style="max-width:200px" onclick="this.parentElement.remove();Game.checkAndContinue()">Continua</button>
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
      card.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.05}deg)`;

      // Visual tilt hint ONLY — NO effects preview during swipe
      if (currentX < -30) { card.classList.add('hinting-left'); card.classList.remove('hinting-right'); }
      else if (currentX > 30) { card.classList.add('hinting-right'); card.classList.remove('hinting-left'); }
      else { card.classList.remove('hinting-left', 'hinting-right'); }
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      card.style.transform = '';
      card.classList.remove('hinting-left', 'hinting-right');

      if (currentX < -80) makeChoice('left');
      else if (currentX > 80) makeChoice('right');
      // Effects always hidden after drag ends without a choice
      updateEffectsPreview('');
      currentX = 0;
    }

    card.addEventListener('touchstart', onStart, { passive: true });
    card.addEventListener('touchmove', onMove, { passive: true });
    card.addEventListener('touchend', onEnd);
    card.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);

    // Hover on choice buttons reveals effects
    const btnLeft  = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');

    btnLeft.addEventListener('mouseenter',  () => { if (!isDragging) updateEffectsPreview('left'); });
    btnLeft.addEventListener('mouseleave',  () => { if (!isDragging) updateEffectsPreview(''); });
    btnRight.addEventListener('mouseenter', () => { if (!isDragging) updateEffectsPreview('right'); });
    btnRight.addEventListener('mouseleave', () => { if (!isDragging) updateEffectsPreview(''); });

    // Touch press on buttons (mobile)
    btnLeft.addEventListener('touchstart',  () => updateEffectsPreview('left'),  { passive: true });
    btnLeft.addEventListener('touchend',    () => updateEffectsPreview(''),      { passive: true });
    btnRight.addEventListener('touchstart', () => updateEffectsPreview('right'), { passive: true });
    btnRight.addEventListener('touchend',   () => updateEffectsPreview(''),      { passive: true });
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
    challengeKing,
    executeThroneAttack,
  };

})();

// ── INIT on page load ──
window.addEventListener('load', () => {
  // Version badge
  const badge = document.getElementById('version-badge');
  if (badge) badge.textContent = 'v1.6.0';

  // Changelog popup check
  const VERSION = '1.6.0';
  const seen = localStorage.getItem('ia_version_seen');
  if (seen !== VERSION) {
    Game.showChangelogPopup();
  }

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});
