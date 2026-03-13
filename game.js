/* ============================================================
   IRON & ALLIANCES — game.js
   Full game engine: characters, events, diplomacy, war, memory
   ============================================================ */

'use strict';

const Game = (() => {

  // ══════════════════════════════════════════════
  // STATE
  // ══════════════════════════════════════════════
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
      objective: 'Riconquista il Trono di Spade: Esercito >80 e sconfiggi il Re Reggente.',
      objectiveCheck: (s) => s.resources.army > 80 && s.decisionHistory.some(d => d.tags?.includes('defeated_king')),
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
      objective: "Mantieni il Trono: rimani sul trono al turno 60 con Tesoro >60.",
      objectiveCheck: (s) => s.turn >= 60 && s.resources.gold > 60 && s.king === 'cersei',
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
      objective: "Il Trono Spetta a Me: conquista il Trono, Fede >70, Esercito >70.",
      objectiveCheck: (s) => s.king === 'stannis' && s.resources.faith > 70 && s.resources.army > 70,
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
      objective: "Proteggi la Famiglia: tieni tutti i figli vivi (evita carte 'morte famiglia' per 50 turni).",
      objectiveCheck: (s) => s.turn >= 50 && !s.decisionHistory.some(d => d.tags?.includes('family_death')),
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
  // ══════════════════════════════════════════════
  const EVENTS = [

    // ── GENERAL EVENTS ──
    {
      id: 'tax_collect', tags: ['gold'], speaker: 'Maester Pycelle', speakerRole: 'Gran Maester',
      portrait: '📜', icon: '📜',
      text: "Vostra Grazia, le entrate mensili sono pronte. Potete tassare i commercianti pesantemente — riempirete le casse, ma il popolo mormorerà.",
      leftText: 'Tassa moderata', leftEffects: { gold: +8, people: +2 },
      rightText: 'Tassa pesante', rightEffects: { gold: +20, people: -12 },
      minTurn: 1,
    },
    {
      id: 'plague_arrives', tags: ['people', 'faith'], speaker: 'Sparrow Grigio', speakerRole: 'Messaggero della Fede',
      portrait: '⚕️', icon: '⚕️',
      text: "La pestilenza colpisce i quartieri poveri. La gente implora protezione. Possiamo usare le risorse della Fede per curare i malati, o lasciarli al loro destino.",
      leftText: "Lascia che il Signore decida", leftEffects: { people: -15, faith: +10 },
      rightText: 'Invia i guaritori', rightEffects: { people: +10, gold: -12, faith: +5 },
      minTurn: 3,
    },
    {
      id: 'tournament', tags: ['people', 'gold'], speaker: 'Ser Loras Tyrell', speakerRole: 'Cavaliere dei Fiori',
      portrait: '🏆', icon: '🏆',
      text: "Un grande torneo potrebbe esaltare il morale della gente e attirare cavalieri da tutto il regno. Ma organizzarlo costerà una fortuna.",
      leftText: 'Annulla il torneo', leftEffects: { people: -5, gold: +5 },
      rightText: 'Organizza il torneo', rightEffects: { people: +18, gold: -20, power: +5 },
      minTurn: 2,
    },
    {
      id: 'sell_swords', tags: ['army', 'gold'], speaker: 'Capitano dei Mercenari', speakerRole: 'Condottiero',
      portrait: '⚔️', icon: '⚔️',
      text: "Cinquemila spade sono in vendita. La Compagnia Dorata offre i propri servizi. Costano molto, ma rafforzerebbero notevolmente il vostro esercito.",
      leftText: 'Rifiuta', leftEffects: { gold: +5 },
      rightText: "Assoldali", leftEffects2: { gold: -25, army: +20 },
      rightEffects: { gold: -25, army: +20 },
      minTurn: 1,
    },
    {
      id: 'maesters_council', tags: ['faith', 'power'], speaker: 'Septon Cellador', speakerRole: 'Septon della Città',
      portrait: '✝️', icon: '✝️',
      text: "I Sette chiedono che il vostro governo rispetti le leggi sacre. Accettare rafforzerà la Fede, ma limiterà la vostra autonomia politica.",
      leftText: 'Rifiuta le restrizioni', leftEffects: { faith: -15, power: +10 },
      rightText: 'Accetta la Fede', rightEffects: { faith: +20, power: -8 },
      minTurn: 2,
    },
    {
      id: 'lord_rebellion', tags: ['army', 'power'], speaker: 'Lord Ignoto', speakerRole: 'Signore del Nord',
      portrait: '🏰', icon: '🏰',
      text: "Un signore minore si è ribellato nel Riverlands. Potete inviare truppe a soffocarlo subito, o negoziare e risolvere pacificamente.",
      leftText: 'Negozia la pace', leftEffects: { power: -5, people: +8 },
      rightText: 'Schiaccia la ribellione', rightEffects: { army: -10, power: +15, people: -5 },
      minTurn: 5,
    },
    {
      id: 'wildfire_plot', tags: ['army', 'power', 'gold'], speaker: 'Alchimista della Gilda', speakerRole: 'Maestro Piromante',
      portrait: '🔥', icon: '🔥',
      text: "Abbiamo preparato dieci mila giare di Fuoco Selvatico. Con esso, potreste distruggere qualsiasi flotta nemica. Ma il rischio di distruggere anche la città è reale.",
      leftText: 'Troppo pericoloso', leftEffects: { faith: +5 },
      rightText: "Prepara l'arsenale", rightEffects: { army: +25, people: -20, gold: -15 },
      minTurn: 10,
    },
    {
      id: 'night_watch_plea', tags: ['army', 'faith'], speaker: "Lord Comandante", speakerRole: "Guardiani della Notte",
      portrait: '❄️', icon: '❄️',
      text: "Il Muro ha bisogno di uomini. I Guardiani della Notte chiedono condannati e volontari. Aiutarli rafforza la Fede ma indebolisce il vostro esercito.",
      leftText: 'Ignora la richiesta', leftEffects: { faith: -8 },
      rightText: "Invia uomini al Muro", rightEffects: { army: -12, faith: +18, people: +5 },
      minTurn: 4,
    },
    {
      id: 'raven_news', tags: ['power', 'gold'], speaker: 'Corvo messaggero', speakerRole: 'Notizia da lontano',
      portrait: '🦅', icon: '🦅',
      text: "Un corvo porta notizie di un ricco mercante che chiede protezione. In cambio vi offre accesso alle rotte commerciali orientali.",
      leftText: 'Rifiuta', leftEffects: { power: -3 },
      rightText: 'Accetta il patto', rightEffects: { gold: +15, power: +8 },
      minTurn: 3,
    },
    {
      id: 'betrayal_remembered', tags: ['power', 'people'], speaker: 'Messaggero',
      speakerRole: 'Lettera sigillata', portrait: '📩', icon: '📩',
      text: "«Ricordate quando ci avete traditi? Il Nord ricorda. E ora chiediamo riparazione, o ogni accordo futuro sarà impossibile.»",
      leftText: 'Ignorali', leftEffects: { power: -10, people: -8 },
      rightText: 'Offri compensazione', rightEffects: { gold: -20, power: +12 },
      minTurn: 15, requiresTag: 'betray_ally',
    },
    {
      id: 'dragon_sighting', tags: ['army', 'faith'], speaker: 'Maester Aemon', speakerRole: 'Notizia da Meereen',
      portrait: '🐉', icon: '🐉',
      text: "Si dice che i draghi siano stati avvistati ad Est. Le casate tremano. Questa notizia aumenta il vostro potere simbolico, ma spaventa i signori fedeli.",
      leftText: "Nega le voci", leftEffects: { faith: +8, power: -5 },
      rightText: "Sfrutta la paura", rightEffects: { power: +18, faith: -12, army: +5 },
      minTurn: 8,
    },
    {
      id: 'sept_burning', tags: ['faith', 'people'], speaker: 'Sopravvissuto', speakerRole: 'Cittadino di Approdo del Re',
      portrait: '🔥', icon: '🔥',
      text: "Il Settimo di Baelor brucia. Qualcuno ha sabotato il deposito di Fuoco Selvatico. La gente accusa il trono. Dovete rispondere.",
      leftText: "Scarica la colpa", leftEffects: { faith: -20, power: +5, people: -10 },
      rightText: "Prendi la responsabilità", rightEffects: { faith: -8, people: +8, power: -5 },
      minTurn: 12,
    },
    {
      id: 'iron_bank', tags: ['gold', 'power'], speaker: 'Tycho Nestoris', speakerRole: 'Banca di Ferro di Braavos',
      portrait: '🏦', icon: '🏦',
      text: "La Banca di Ferro reclama il suo debito. Potete rinegoziare, ma a caro prezzo politico. Oppure rifiutare e subire embargo commerciale.",
      leftText: 'Rifiuta il debito', leftEffects: { gold: +10, power: -15 },
      rightText: 'Paga e rinegozia', rightEffects: { gold: -30, power: +10 },
      minTurn: 10,
    },
    {
      id: 'wedding_proposal', tags: ['power', 'faith'], speaker: 'Emissario reale', speakerRole: 'Proposta diplomatica',
      portrait: '💍', icon: '💍',
      text: "Una grande casata propone matrimonio tra le vostre famiglie. L'unione porterebbe alleanze, ma vincolerebbe la vostra libertà di manovra.",
      leftText: 'Declina', leftEffects: { power: -8, faith: +5 },
      rightText: 'Accetta le nozze', rightEffects: { power: +15, people: +10 },
      minTurn: 5, rightTags: ['royal_marriage'],
    },
    {
      id: 'spy_network', tags: ['power', 'gold'], speaker: 'Qyburn', speakerRole: 'Ex-Maester',
      portrait: '🕵️', icon: '🕵️',
      text: "Qyburn offre di costruire una rete di spie che vi darà informazioni su ogni casata. Il costo è alto, e qualcuno potrebbe scoprirlo.",
      leftText: 'Troppo rischioso', leftEffects: {},
      rightText: 'Finanzia la rete', rightEffects: { gold: -20, power: +25 },
      minTurn: 6,
    },
    {
      id: 'night_terror', tags: ['army', 'faith'], speaker: 'Vecchia di Nissa', speakerRole: 'Profezia',
      portrait: '🌙', icon: '🌙',
      text: "Sussurri parlano di morti che camminano oltre il Muro. Pochissimi ci credono. Investire nella difesa al Muro vi farà sembrare folli, ma potrebbe salvare tutti.",
      leftText: 'Ignora le voci', leftEffects: { faith: +5 },
      rightText: 'Invia rifornimenti', rightEffects: { gold: -15, army: -8, faith: +12, power: +5 },
      minTurn: 7,
    },
    {
      id: 'assassination_offer', tags: ['power', 'army'], speaker: 'Faceless Man', speakerRole: 'Messaggero dei Molti Volti',
      portrait: '🗡️', icon: '🗡️',
      text: "Un messaggero dei Molti Volti offre l'eliminazione di un vostro nemico. Il prezzo è altissimo. Ma un nemico in meno vale molto.",
      leftText: 'Rifiuta', leftEffects: { power: -3 },
      rightText: "Commissiona l'assassinio", rightEffects: { gold: -30, power: +15 },
      minTurn: 8, rightTags: ['assassination', 'poison_intrigue'],
    },
    {
      id: 'harvest_feast', tags: ['people', 'gold'], speaker: 'Steward del Castello', speakerRole: 'Responsabile delle provviste',
      portrait: '🌾', icon: '🌾',
      text: "Il raccolto è abbondante quest'anno. Potete distribuire il surplus tra la gente, aumentando la loro lealtà, oppure conservarlo per i tempi difficili.",
      leftText: 'Conserva le riserve', leftEffects: { gold: +12 },
      rightText: 'Distribuisci al popolo', rightEffects: { people: +15, gold: -5 },
      minTurn: 2,
    },
    {
      id: 'war_council', tags: ['army', 'power'], speaker: 'Ser Davos', speakerRole: 'Consigliere militare',
      portrait: '⚔️', icon: '⚔️',
      text: "Il consiglio di guerra si riunisce. Potete addestrare nuove reclute (lento ma sicuro) oppure schierare subito l'esercito in una dimostrazione di forza.",
      leftText: 'Addestra le reclute', leftEffects: { army: +10, gold: -8 },
      rightText: 'Dimostrazione di forza', rightEffects: { army: +5, power: +10, people: -5 },
      minTurn: 4,
    },
    {
      id: 'noble_feast', tags: ['people', 'faith', 'power'], speaker: 'Maestro delle Feste', speakerRole: 'Corte Reale',
      portrait: '🍷', icon: '🍷',
      text: "Un grande banchetto attirerà nobili da ogni angolo del regno. Costoso, ma un momento di gioia può unire le casate.",
      leftText: 'Annulla il banchetto', leftEffects: { power: -5 },
      rightText: 'Organizza il banchetto', rightEffects: { gold: -18, people: +12, power: +12, faith: +5 },
      minTurn: 5,
    },
    {
      id: 'traitor_in_court', tags: ['power', 'army'], speaker: 'Spia rivelata', speakerRole: 'Confessione sotto tortura',
      portrait: '🔒', icon: '🔒',
      text: "Una spia nemica è stata scoperta a corte. Potete giustiziarla pubblicamente per deterrenza, o usarla come doppio agente per diffondere disinformazione.",
      leftText: 'Giustizia pubblica', leftEffects: { power: +10, people: +5, faith: +8 },
      rightText: 'Doppio agente', rightEffects: { power: +20, gold: -5 },
      minTurn: 6,
    },
    {
      id: 'gift_to_ally', tags: ['gold', 'power'], speaker: 'Lord Alleato', speakerRole: 'Richiesta di aiuto',
      portrait: '🤝', icon: '🤝',
      text: "Un alleato è in difficoltà finanziaria. Aiutarlo ora rafforzerà il legame, ma vi costerà. Ignorarlo rischia di raffreddare la vostra alleanza.",
      leftText: "Non posso permettermi", leftEffects: { power: -8 },
      rightText: "Invia oro e rifornimenti", rightEffects: { gold: -20, power: +18 },
      minTurn: 6, rightTags: ['help_ally'],
    },
    {
      id: 'scroll_of_prophecy', tags: ['faith', 'power'], speaker: 'Meera Reed', speakerRole: 'Portavoce dei figli della foresta',
      portrait: '📜', icon: '📜',
      text: "Antichi rotoli parlano del Principe che fu Promesso. Seguire questa profezia richiede sacrifici enormi, ma potrebbe essere la chiave per salvare il regno.",
      leftText: 'Ignora le profezie', leftEffects: { faith: -5 },
      rightText: "Segui il destino", rightEffects: { faith: +25, army: -8, power: +5 },
      minTurn: 9,
    },
    // War-related
    {
      id: 'war_declaration_enemy', tags: ['army', 'power', 'war_choice'], speaker: 'Araldo', speakerRole: 'Messaggio di guerra',
      portrait: '⚔️', icon: '⚔️',
      text: "Un araldo porta sfida di guerra. La casata rivale ha mobilitato le truppe. Potete accettare la guerra aperta o cercare una via diplomatica dell'ultimo minuto.",
      leftText: 'Cerca la pace', leftEffects: { army: +5, power: -15, people: +8 },
      rightText: 'Accetta la guerra', rightEffects: { army: -10, power: +10, people: -8 },
      minTurn: 8, rightTags: ['war_choice'],
    },
  ];

  // ══════════════════════════════════════════════
  // POSSIBLE KINGS (for the starting state)
  // ══════════════════════════════════════════════
  const POSSIBLE_KINGS = [
    { id: 'joffrey', name: 'Re Joffrey Baratheon', house: 'Lannister-Baratheon', icon: '👑' },
    { id: 'stannis', name: 'Stannis Baratheon', house: 'Baratheon', icon: '🦌' },
    { id: 'robb',    name: 'Robb Stark (Re del Nord)', house: 'Stark', icon: '🐺' },
    { id: 'mace',    name: 'Mace Tyrell (Reggente)', house: 'Tyrell', icon: '🌹' },
    { id: 'tommen',  name: 'Re Tommen Baratheon', house: 'Lannister', icon: '🦁' },
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
    const king = rand(POSSIBLE_KINGS);

    const houses = {};
    HOUSES_DEF.forEach(h => {
      let status = 'neutral';
      if (char.startAllies.includes(h.id)) status = 'ally';
      if (char.startEnemies.includes(h.id)) status = 'enemy';
      houses[h.id] = {
        name: h.name, icon: h.icon, region: h.region,
        army: h.baseArmy + Math.floor(Math.random() * 20) - 10,
        status,
      };
    });

    state = {
      character: char,
      turn: 1,
      resources: { ...char.startResources },
      houses,
      king: king.id,
      kingName: king.name,
      kingHouse: king.house,
      decisionHistory: [],
      eventQueue: [],
      gameOver: false,
      ravenTarget: null,
      usedEvents: [],
    };
  }

  // ══════════════════════════════════════════════
  // PROLOGUE GENERATION
  // ══════════════════════════════════════════════
  function buildPrologue(char) {
    const king = POSSIBLE_KINGS.find(k => k.id === state.king);
    const allies = char.startAllies.join(', ') || 'nessuna';
    const enemies = char.startEnemies.join(', ') || 'nessuna';
    const alliances = HOUSES_DEF
      .filter(() => Math.random() > 0.5)
      .slice(0, 3)
      .map(h => h.name)
      .join(', ') || 'Stark e Tyrell';

    const prologues = [
      `<p>L'inverno si avvicina. Il regno è diviso da anni di guerra e intrighi. Sul Trono di Spade siede <strong>${king.name}</strong>, un sovrano contestato dalla metà delle Grandi Casate.</p><p>Le alleanze attuali vedono <strong>${alliances}</strong> unite contro le ambizioni del trono. Le casate del Nord mormorano di secessione.</p>`,
      `<p>Approdo del Re brucia di voci e tradimenti. Il re <strong>${king.name}</strong> regna con mano di ferro, ma le casse del regno sono vuote e la gente soffre.</p><p>Le Grandi Casate di <strong>${alliances}</strong> cercano alleanze nell'ombra, pronte a colpire al momento opportuno.</p>`,
      `<p>Da Approdo del Re alle Isole di Ferro, il sussurro è lo stesso: il regno crolla. <strong>${king.name}</strong> siede sul Trono di Spade, ma la sua presa si allenta ogni giorno.</p><p>In questo vuoto di potere, <strong>${alliances}</strong> forgiano patti segreti. Il momento per agire è adesso.</p>`,
    ];

    document.getElementById('prologue-title').textContent = `Il Destino di ${char.name}`;
    document.getElementById('prologue-text').innerHTML = `
      ${rand(prologues)}
      <p>Voi siete <strong>${char.name}</strong> della <strong>${char.house}</strong>. ${char.flavor}</p>
      <p>Le vostre alleanze attuali: <strong>${allies}</strong>. I vostri nemici dichiarati: <strong>${enemies}</strong>.</p>
      <p><em>Obiettivo: ${char.objective}</em></p>
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
    // Check event queue first
    if (state.eventQueue.length > 0) {
      currentCard = state.eventQueue.shift();
      renderCard(currentCard);
      return;
    }

    // Filter valid events
    const available = EVENTS.filter(e => {
      if (state.usedEvents.includes(e.id)) return false;
      if (e.minTurn && state.turn < e.minTurn) return false;
      if (e.requiresTag && !state.decisionHistory.some(d => d.tags?.includes(e.requiresTag))) return false;
      return true;
    });

    if (available.length === 0) {
      // All events used, reset used (loop)
      state.usedEvents = state.usedEvents.slice(-5);
      drawNextCard();
      return;
    }

    // Weight: prefer events not recently used
    currentCard = rand(available);
    state.usedEvents.push(currentCard.id);
    renderCard(currentCard);
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
      if (h.status === 'enemy') {
        h.status = 'neutral';
        showToast(`✉ Casa ${h.name} considera la tregua... ora è Neutrale.`);
        state.resources.power += 5;
      } else {
        h.status = 'ally';
        showToast(`🤝 Casa ${h.name} è ora vostra ALLEATA!`, 'good');
        state.resources.power += 10;
        state.decisionHistory.push({ turn: state.turn, cardId: 'raven_alliance', choice: 'alliance', tags: ['diplomacy'], target: state.ravenTarget });
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
      if (h.status !== 'ally') {
        h.status = 'neutral';
        state.resources.power += 8;
        showToast(`💰 Tributo inviato a Casa ${h.name}. Relazioni migliorate.`, 'good');
      } else {
        showToast(`Casa ${h.name} apprezza il vostro dono. Fedeltà consolidata.`);
        state.resources.power += 5;
      }
    }

    state.ravenTarget = null;
    updateHUD();
    toggleDiplomacy();
    saveGame();
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

      if (currentX < -30) { card.classList.add('hinting-left'); card.classList.remove('hinting-right'); updateEffectsPreview('left'); }
      else if (currentX > 30) { card.classList.add('hinting-right'); card.classList.remove('hinting-left'); updateEffectsPreview('right'); }
      else { card.classList.remove('hinting-left', 'hinting-right'); updateEffectsPreview(''); }
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      card.style.transform = '';
      card.classList.remove('hinting-left', 'hinting-right');

      if (currentX < -80) makeChoice('left');
      else if (currentX > 80) makeChoice('right');
      else updateEffectsPreview('');
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
  };

})();

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
