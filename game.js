/* ============================================================
   IRON & ALLIANCES — game.js
   Full game engine: characters, events, diplomacy, war, memory
   ============================================================ */

'use strict';

const Game = (() => {

  // ══════════════════════════════════════════════
  // VERSION & CHANGELOG
  // ══════════════════════════════════════════════
  const VERSION = '2.9.0';

  const CHANGELOG = {
    '2.9.0': {
      date: '2026',
      title: 'Stemmi delle Casate',
      notes: [
        '🛡 Supporto stemmi: carica Stark.png, Lannister.png ecc. nella cartella del progetto e vengono mostrati automaticamente',
        '🎨 Stemmi visibili in: card diplomazia, popup casata, schermata VS pre-battaglia, overlay giuramento fedeltà',
        '🔄 Fallback automatico: casate senza stemma mostrano l\'emoji come prima',
        '🛡 Stark e Lannister già configurati — aggiungi gli altri file PNG per abilitarli',
      ],
    },
    '2.8.0': {
      date: '2026',
      title: 'Bilanciamento Obiettivi',
      notes: [
        '🔥 Melisandre: obiettivo abbassato da Fede ≥85×20 turni a Fede ≥75×15 turni — era quasi impossibile con cap fisso a 100',
        '🗡️ Bronn: obiettivo corretto da Oro >75 / Esercito >55 a Oro >65 / Esercito >50 — l\'oro ha flusso netto negativo nel deck',
        '😈 Ramsay: rimossa la condizione Esercito >55 post-guerra — le guerre abbassano l\'esercito, era contraddittorio. Ora basta 2 vittorie + Potere >50',
      ],
    },
    '2.7.0': {
      date: '2026',
      title: 'Anti-Snowball — La Guerra Logora',
      notes: [
        '🏰 Cap risorse FISSO a 100 — le conquiste non espandono più il cap (rimosso +100 per conquista)',
        '⚔ Bottino di guerra ricalibrato: esercito cappato a 75 post-vittoria, oro max +15, potere +8, popolo -6 (la guerra logora)',
        '📉 Rendimento decrescente: ogni conquista successiva rende meno (decayFactor -15% per conquista)',
        '😨 Effetto paura: dopo ogni conquista 30–65% delle casate neutrali diventano diffidenti — ti temono, non ti amano',
        '🏴 Guarnigioni: ogni casata conquistata costa -4 oro ogni 5 turni — mantenere territori ha un costo reale',
        '📊 Badge HUD rinnovato: mostra territori conquistati e costo guarnigioni totale invece del cap',
        '👑 Vittoria sul Re: esercito a max 65, potere +12, popolo -8 — il trono si prende a caro prezzo',
        '🤝 La diplomazia diventa cruciale: con le casate diffidenti ovunque, allearsi prima di attaccare è strategico',
      ],
    },
    '2.6.0': {
      date: '2026',
      title: 'Il Regno Diviso — Fase da Re',
      notes: [
        '⚖ Banner prominente in Diplomazia: casate non giurate visibili con tasto diretto per ogni casata',
        '👑 Tasto "⚖ chiedi" diretto nel pannello — senza dover aprire ogni scheda',
        '⚠ Urgenza crescente: dopo 10 turni da Re il banner diventa rosso',
        '⏱ Pressione temporale: ogni 8 turni casata neutrale non giurata → 25% diventa nemica con carta evento',
        '🕊 Seconda chance al rifiuto: 40% di riportarla neutrale con ultimo messaggio',
        '🃏 6 nuove carte post-Re legate al regno diviso: corvi sospetti, coordinamento nemici, minaccia straniera, pretendente, rapporto Gran Maester, torneo diplomatico',
        '✨ Banner verde "Tutte le casate fedeli" quando il regno è unificato',
      ],
    },
    '2.5.0': {
      date: '2026',
      title: 'Intrighi di Corte & Scandali',
      notes: [
        '🕯️ 5 nuove carte generiche: scandali, tentazioni nobili, segreti notturni, matrimoni d\'interesse, visite clandestine',
        '🍷 5 nuove carte Tyrion: fonte discreta, ricatto elegante, matrimonio combinato, dossier segreti, voci tra i cuscini',
        '🪙 6 nuove carte Ditocorto: dame di corte, rete bordelli, lord vedovo, segreti di Cersei, Sansa come pedina, incarico pericoloso',
        '✍️ Tono allusivo ed elegante — tutto sottinteso, niente di esplicito',
        '🚫 excludeChars calibrati: Arya, Tormund, Ned, Catelyn esclusi dove non ha senso narrativo',
      ],
    },
    '2.4.0': {
      date: '2026',
      title: 'Carte Ribilanciate & Nuovi Eventi',
      notes: [
        '🃏 Ribilanciate 15 carte con scelta sinistra inutile (power -3/4 → vera alternativa con effetti reali)',
        '🗡️ Carte Arya: le scelte "aspetta" ora offrono vantaggi tattici (intelligence, infiltrazione) invece di niente',
        '🤝 dany_dothraki: rifiutare ora costruisce consenso e fede invece di non fare nulla',
        '⛏️ gold_mine_found, tournament_proposal: entrambe le scelte ora hanno senso strategico diverso',
        '🌹 Olenna: aggiunte 4 nuove carte esclusive (accordo Lannister, rete spie, raccolto, concilio Fede)',
        '🆕 8 nuove carte generiche: tradimento di corte, inverno in arrivo, crisi successione, pestilenza, ambasciatore straniero, alluvione, raid notturno, debito Banca di Ferro',
        '📊 Olenna: da 2 a 6 carte esclusive — finalmente giocabile con profondità',
      ],
    },
    '2.1.0': {
      date: '2026',
      title: 'Guerre, Diplomazia & Bilanciamento',
      notes: [
        '⚔ BUGFIX: La battaglia contro il Re ora parte correttamente (fix al timer di fase)',
        '🛡 BUGFIX: La ritirata dalla battaglia salva correttamente l\'esercito e scatena conseguenze',
        '👑 La casata del Re non può mai diventare alleata del giocatore',
        '⚖ Turno 1 guerra (attacco giocatore): scelta diplomatica — chiedi tributo o guerra senza tregua',
        '📜 Turno 2 guerra: le alleanze nemiche si rivelano; alleati del giocatore possono vacillare e tornare neutrali',
        '⚔ Turno 3 guerra: la battaglia inizia automaticamente dopo la carta (no più blocchi)',
        '🔄 Ritirata da casata → quella casata diventa nemica permanente, le neutrali si ridisegnano',
        '🏃 Ritirata dal Re → il Re ti dichiara nemico, le casate neutrali si schierano',
        '⚔ Bilanciamento eserciti: personaggi 12–48 (da 20–68), casate 60–110 (da 40–75), Re 80–110 (da 50–75)',
        '🎯 Sfida al Re ora richiede Esercito >80 (era >70) — proporzionale ai nuovi valori',
        '🔘 Pulsante "Richiedi Rinforzi": grigio con stato (forniti/rifiutato) dopo risposta alleato',
        '🔄 Reset pulsanti rinforzi dopo ogni battaglia (truppe tornano alle casate)',
      ],
    },
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
      startResources: { gold: 35, faith: 40, people: 55, army: 40, power: 30 },
      objective: 'Riconquista il Trono: siediti sul Trono di Spade sconfiggendo il Re Reggente.',
      objectiveCheck: (s) => s.king === 'daenerys',
      startAllies: ['Targaryen'], startEnemies: ['Lannister'],
      flavor: 'Il fuoco e il sangue scorrono nelle tue vene. I draghi ti obbediscono.',
      houseBonus: { res: [['army',2],['power',2]], label: '🐉 Sangue del Drago: +2 Esercito +2 Potere ogni 5 turni' },
    },
    {
      id: 'viserys', name: 'Viserys Targaryen', house: 'Casa Targaryen',
      icon: '🐉', emoji: '👑',
      difficulty: 'medium',
      startResources: { gold: 32, faith: 38, people: 42, army: 32, power: 55 },
      objective: 'Il Re Mendicante: siedi sul Trono — oppure ottieni 3 alleanze tenendo sempre Popolo >35 e non perdendo MAI tutte le risorse militari (Esercito non può toccare 0).',
      objectiveCheck: (s) => s.king === 'viserys' || (countAllies(s) >= 3 && s.resources.people > 35 && !s.decisionHistory.some(d => d.tags?.includes('army_zero'))),
      startAllies: ['Targaryen'], startEnemies: ['Lannister', 'Baratheon'],
      flavor: 'Sono Viserys Targaryen, primo del suo nome. Il drago non può essere calpestato.',
      houseBonus: { res: [['power',3]], label: '🐉 Sangue del Drago: +3 Potere ogni 5 turni' },
    },
    {
      id: 'rhaenyra', name: 'Rhaenyra Targaryen', house: 'Casa Targaryen',
      icon: '🐉', emoji: '🔥',
      difficulty: 'hard',
      startResources: { gold: 45, faith: 30, people: 48, army: 42, power: 60 },
      objective: 'La Regina del Trono: siedi sul Trono di Spade e mantieni Potere >65 e Popolo >45.',
      objectiveCheck: (s) => s.king === 'rhaenyra' && s.resources.power > 65 && s.resources.people > 45,
      startAllies: ['Targaryen'], startEnemies: ['Lannister'],
      flavor: 'Mio padre mi ha designata erede. Nessun uomo mi toglierà ciò che è mio.',
      houseBonus: { res: [['army',2],['power',2]], label: '🐉 Sangue del Drago: +2 Esercito +2 Potere ogni 5 turni' },
    },
    {
      id: 'aegon_t', name: 'Aegon il Conquistatore', house: 'Casa Targaryen',
      icon: '🐉', emoji: '⚔️',
      difficulty: 'hard',
      startResources: { gold: 50, faith: 35, people: 38, army: 65, power: 55 },
      objective: 'La Conquista: domina tutte le casate — conquista 3, ottieni 4 alleanze, o siedi sul Trono di Spade.',
      objectiveCheck: (s) => {
        const conquered = Object.values(s.houses).filter(h => h.suppressed).length;
        return conquered >= 3 || countAllies(s) >= 4 || s.king === 'aegon_t';
      },
      startAllies: ['Targaryen'], startEnemies: ['Stark', 'Lannister'],
      flavor: 'I Sette Regni saranno uno solo. Con il fuoco o con la diplomazia — preferibilmente entrambi.',
      houseBonus: { res: [['army',3],['power',1]], label: '🐉 Sangue del Drago: +3 Esercito +1 Potere ogni 5 turni' },
    },
    {
      id: 'jon', name: 'Jon Snow', house: 'Guardiani della Notte / Stark',
      icon: '🐺', emoji: '⚔️',
      difficulty: 'medium',
      startResources: { gold: 30, faith: 50, people: 60, army: 35, power: 28 },
      objective: 'Unisci il Nord: Popolo >70, Esercito >55 e almeno 3 alleanze al turno 45 — o siedi sul Trono di Spade.',
      objectiveCheck: (s) => s.king === 'jon' || (s.turn >= 45 && s.resources.people > 70 && s.resources.army > 55 && countAllies(s) >= 3),
      startAllies: ['Stark'], startEnemies: [],
      flavor: 'Sai nulla, Jon Snow. Ma forse è tempo di imparare.',
      houseBonus: { res: [['faith',2],['people',2]], label: '🐺 Onore del Nord: +2 Fede +2 Popolo ogni 5 turni' },
    },
    {
      id: 'cersei', name: 'Cersei Lannister', house: 'Casa Lannister',
      icon: '🦁', emoji: '👑',
      difficulty: 'medium',
      startResources: { gold: 65, faith: 28, people: 38, army: 38, power: 58 },
      objective: "Potere Assoluto: siedi sul Trono — oppure sopravvivi al turno 55 con Tesoro >55 senza MAI perdere un'alleanza per tradimento e tenendo Popolo >25 (non puoi perdere il popolo completamente).",
      objectiveCheck: (s) => s.king === 'cersei' || (s.turn >= 55 && s.resources.gold > 55 && s.resources.people > 25 && !s.decisionHistory.some(d => d.tags?.includes('betray_ally'))),
      startAllies: ['Lannister'], startEnemies: ['Stark', 'Baratheon'],
      flavor: 'Il potere è il solo dio che vale la pena adorare.',
      houseBonus: { res: [['gold',3]], label: '🦁 Ricchezza Lannister: +3 Oro ogni 5 turni' },
    },
    {
      id: 'tyrion', name: 'Tyrion Lannister', house: 'Casa Lannister',
      icon: '🍷', emoji: '🧠',
      difficulty: 'easy',
      startResources: { gold: 58, faith: 35, people: 52, army: 22, power: 50 },
      objective: "Mano del Re: diventa Re — oppure raggiunge turno 50 con 3 alleanze, Popolo >60, senza MAI aver mandato soldati alla guerra (la mente batte la spada).",
      objectiveCheck: (s) => s.king === 'tyrion' || (s.turn >= 50 && countAllies(s) >= 3 && s.resources.people > 60 && !s.decisionHistory.some(d => d.tags?.includes('war_victory'))),
      startAllies: ['Lannister'], startEnemies: [],
      flavor: 'Bevo e so le cose. La mente è la mia arma.',
      houseBonus: { res: [['gold',3]], label: '🦁 Ricchezza Lannister: +3 Oro ogni 5 turni' },
    },
    {
      id: 'sansa', name: 'Sansa Stark', house: 'Casa Stark',
      icon: '🐺', emoji: '🌹',
      difficulty: 'easy',
      startResources: { gold: 42, faith: 55, people: 65, army: 32, power: 38 },
      objective: 'Lady di Grande Inverno: Fede >70, Popolo >70, Potere >45 e Casa Stark alleata al turno 40.',
      objectiveCheck: (s) => s.turn >= 40 && s.resources.faith > 70 && s.resources.people > 70 && s.resources.power > 45 && s.houses['Stark']?.status === 'ally',
      startAllies: ['Stark'], startEnemies: [],
      flavor: 'La vita non è una canzone. Il mondo non è un libro di fiabe.',
      houseBonus: { res: [['faith',2],['people',2]], label: '🐺 Onore del Nord: +2 Fede +2 Popolo ogni 5 turni' },
    },
    {
      id: 'arya', name: 'Arya Stark', house: 'Casa Stark',
      icon: '🗡️', emoji: '🐺',
      difficulty: 'hard',
      startResources: { gold: 22, faith: 22, people: 42, army: 28, power: 28 },
      objective: 'La Lista: depenna 3 nomi dalla lista di Arya.',
      objectiveCheck: (s) => (s.aryaList || ARYA_LIST).filter(t => t.done).length >= 3,
      startAllies: [], startEnemies: ['Lannister', 'Frey'],
      flavor: "Un ragazzo non ha nome. Ma ha una lista.",
      houseBonus: { res: [['faith',2],['people',2]], label: '🐺 Onore del Nord: +2 Fede +2 Popolo ogni 5 turni' },
    },
    {
      id: 'stannis', name: 'Stannis Baratheon', house: 'Casa Baratheon',
      icon: '🦌', emoji: '🔥',
      difficulty: 'hard',
      startResources: { gold: 42, faith: 62, people: 38, army: 45, power: 45 },
      objective: 'Il Trono Spetta a Me: conquista il Trono di Spade sconfiggendo il Re Reggente.',
      objectiveCheck: (s) => s.king === 'stannis',
      startAllies: ['Baratheon'], startEnemies: ['Lannister'],
      houseBonus: { res: [['army',2]], label: '🦌 Tradizione Militare: +2 Esercito ogni 5 turni' },
    },
    {
      id: 'robb', name: 'Robb Stark', house: 'Casa Stark',
      icon: '🐺', emoji: '⚔️',
      difficulty: 'medium',
      startResources: { gold: 38, faith: 48, people: 65, army: 48, power: 42 },
      objective: 'Re del Nord: mantieni Stark + Tully alleati, Esercito >55 e vinci almeno 1 guerra al turno 45 — o conquista il Trono di Spade.',
      objectiveCheck: (s) => (s.king === 'robb') || (s.turn >= 45 && s.houses['Stark']?.status === 'ally' && s.houses['Tully']?.status === 'ally' && s.resources.army > 55 && s.decisionHistory.some(d => d.tags?.includes('war_victory'))),
      startAllies: ['Stark', 'Tully'], startEnemies: ['Lannister'],
      flavor: 'Il Nord ricorda. E il Nord si vendica.',
      houseBonus: { res: [['faith',2],['people',2]], label: '🐺 Onore del Nord: +2 Fede +2 Popolo ogni 5 turni' },
    },
    {
      id: 'jaime', name: 'Jaime Lannister', house: 'Casa Lannister',
      icon: '⚔️', emoji: '🦁',
      difficulty: 'medium',
      startResources: { gold: 55, faith: 28, people: 38, army: 42, power: 42 },
      objective: "Redenzione: aiuta 3 alleati (carte aiuto) con Popolo >55 — senza mai scegliere tradimento.",
      objectiveCheck: (s) => s.decisionHistory.filter(d => d.tags?.includes('help_ally')).length >= 3 && s.resources.people > 55 && !s.decisionHistory.some(d => d.tags?.includes('betray_ally')),
      startAllies: ['Lannister'], startEnemies: [],
      flavor: "Sono il Sterminatore dei Re. Ma c'è ancora qualcosa che vale.",
      houseBonus: { res: [['gold',3]], label: '🦁 Ricchezza Lannister: +3 Oro ogni 5 turni' },
    },
    {
      id: 'margaery', name: 'Margaery Tyrell', house: 'Casa Tyrell',
      icon: '🌹', emoji: '👸',
      difficulty: 'easy',
      startResources: { gold: 62, faith: 50, people: 68, army: 25, power: 50 },
      objective: 'La Rosa del Trono: sposa il Re e mantieni Tesoro >60 e Popolo >60.',
      objectiveCheck: (s) => s.decisionHistory.some(d => d.tags?.includes('royal_marriage')) && s.resources.gold > 60 && s.resources.people > 60,
      startAllies: ['Tyrell'], startEnemies: [],
      flavor: 'Ho sempre voluto essere la Regina. Non la moglie del Re.',
      houseBonus: { res: [['people',2],['gold',1]], label: '🌹 Prosperità Tyrell: +2 Popolo +1 Oro ogni 5 turni' },
    },
    {
      id: 'theon', name: 'Theon Greyjoy', house: 'Casa Greyjoy',
      icon: '🐙', emoji: '⚓',
      difficulty: 'medium',
      startResources: { gold: 35, faith: 22, people: 35, army: 38, power: 28 },
      objective: 'Redenzione di Ferro: riscatta il tuo nome — ottieni 2 alleanze (una deve essere Stark), vinci 1 guerra, e non tradire mai un alleato.',
      objectiveCheck: (s) => countAllies(s) >= 2 && s.houses['Stark']?.status === 'ally' && s.decisionHistory.some(d => d.tags?.includes('war_victory')) && !s.decisionHistory.some(d => d.tags?.includes('betray_ally')),
      startAllies: ['Greyjoy'], startEnemies: ['Stark', 'Lannister'],
      flavor: 'Cosa mi appartiene? Il ferro paga il ferro.',
      houseBonus: { res: [['army',3]], label: '🐙 Predatori del Mare: +3 Esercito ogni 5 turni' },
    },
    {
      id: 'littlefinger', name: 'Ditocorto', house: 'Nessuna Casa',
      icon: '🪙', emoji: '🕷',
      difficulty: 'medium',
      startResources: { gold: 68, faith: 22, people: 38, army: 20, power: 65 },
      objective: "Signore del Caos: Potere >80 e Tesoro >70 con almeno 2 intrighi portati a termine.",
      objectiveCheck: (s) => s.resources.power > 80 && s.resources.gold > 70 && s.decisionHistory.filter(d => d.tags?.includes('poison_intrigue')).length >= 2,
      startAllies: [], startEnemies: [],
      flavor: 'Il caos non è un abisso. Il caos è una scala.',
      houseBonus: { res: [['gold',2],['power',1]], label: '🪙 Rete di Contatti: +2 Oro +1 Potere ogni 5 turni' },
    },
    {
      id: 'melisandre', name: 'Melisandre', house: "R'hllor",
      icon: '🔥', emoji: '🌹',
      difficulty: 'hard',
      startResources: { gold: 25, faith: 62, people: 30, army: 25, power: 40 },
      objective: 'Il Fuoco Eterno: mantieni la Fede ≥75 per 15 turni consecutivi.',
      objectiveCheck: (s) => (s.faithHighTurns || 0) >= 15,
      startAllies: ['Baratheon'], startEnemies: [],
      flavor: "Il Signore della Luce mostra tutto... ma la fiamma non mente mai.",
      houseBonus: { res: [['faith',3]], label: "🔥 Fuoco di R'hllor: +3 Fede ogni 5 turni" },
    },
    {
      id: 'oberyn', name: 'Oberyn Martell', house: 'Casa Martell',
      icon: '☀️', emoji: '🐍',
      difficulty: 'medium',
      startResources: { gold: 50, faith: 38, people: 55, army: 35, power: 45 },
      objective: "Vendetta per Elia: vinci una guerra contro Casa Lannister con Popolo >50.",
      objectiveCheck: (s) => s.decisionHistory.some(d => d.tags?.includes('war_victory') && d.target === 'Lannister') && s.resources.people > 50,
      startAllies: ['Martell'], startEnemies: ['Lannister'],
      flavor: 'Dorne ricorda Elia. E la Vipera non perdona.',
      houseBonus: { res: [['power',2]], label: '☀️ Diplomazia di Dorne: +2 Potere ogni 5 turni' },
    },
    {
      id: 'ned', name: 'Eddard Stark', house: 'Casa Stark',
      icon: '🐺', emoji: '⚖️',
      difficulty: 'hard',
      startResources: { gold: 38, faith: 60, people: 68, army: 32, power: 38 },
      objective: "L'Onore del Nord: sopravvivi fino al turno 45 (ogni turno con Potere >70 sei in pericolo), con Fede >60 e Popolo >60, senza mai tradire. Chi è troppo onorevole in questo mondo rischia la testa.",
      objectiveCheck: (s) => s.turn >= 45 && s.resources.faith > 60 && s.resources.people > 60 && !s.decisionHistory.some(d => d.tags?.includes('betray_ally')) && s.resources.power < 70,
      startAllies: ['Stark', 'Tully'], startEnemies: [],
      flavor: "L'onore è il fardello più pesante che un uomo possa portare.",
      houseBonus: { res: [['faith',2],['people',2]], label: '🐺 Onore del Nord: +2 Fede +2 Popolo ogni 5 turni' },
    },
    {
      id: 'catelyn', name: 'Catelyn Tully', house: 'Casa Tully',
      icon: '🐟', emoji: '👩',
      difficulty: 'medium',
      startResources: { gold: 42, faith: 58, people: 60, army: 28, power: 38 },
      objective: "Madre del Nord: proteggi i tuoi figli — mantieni Stark e Tully alleati fino al turno 50, non perdere mai Popolo <30, e non subire mai una sconfitta in guerra. La famiglia è tutto.",
      objectiveCheck: (s) => s.turn >= 50 && s.houses['Stark']?.status === 'ally' && s.houses['Tully']?.status === 'ally' && !s.decisionHistory.some(d => d.tags?.includes('war_defeat')) && s.resources.people > 30,
      startAllies: ['Stark', 'Tully'], startEnemies: ['Lannister'],
      flavor: 'Un leone non si preoccupa delle opinioni delle pecore. Ma io non sono una pecora.',
      houseBonus: { res: [['faith',2],['people',1]], label: '🐟 Fede dei Fiumi: +2 Fede +1 Popolo ogni 5 turni' },
    },
    {
      id: 'bronn', name: 'Bronn', house: 'Nessuna Casa',
      icon: '🗡️', emoji: '😏',
      difficulty: 'easy',
      startResources: { gold: 52, faith: 20, people: 40, army: 40, power: 32 },
      objective: "Il Mercenario d'Oro: vinci 2 guerre, non stringere alleanze (sei un mercenario, non un nobile) e arriva al turno 45 con Tesoro >55. L'oro è l'unica lealtà.",
      objectiveCheck: (s) => s.turn >= 45 && s.decisionHistory.filter(d => d.tags?.includes('war_victory')).length >= 2 && s.resources.gold > 55 && countAllies(s) === 0,
      startAllies: [], startEnemies: [],
      flavor: "Non combatto per la gloria. Combatto per l'oro. E sopravvivo.",
      houseBonus: { res: [['gold',2],['army',1]], label: '🗡️ Istinto di Sopravvivenza: +2 Oro +1 Esercito ogni 5 turni' },
    },
    {
      id: 'olenna', name: 'Olenna Tyrell', house: 'Casa Tyrell',
      icon: '🌹', emoji: '👵',
      difficulty: 'medium',
      startResources: { gold: 62, faith: 42, people: 58, army: 28, power: 60 },
      objective: "La Regina delle Spine: Potere >75 e almeno 2 intrighi (carte veleno) portati a termine.",
      objectiveCheck: (s) => s.resources.power > 75 && s.decisionHistory.filter(d => d.tags?.includes('poison_intrigue')).length >= 2,
      startAllies: ['Tyrell'], startEnemies: ['Lannister'],
      flavor: "Ho fatto cose terribili. Ma ero io la più furba di tutti.",
      houseBonus: { res: [['people',2],['gold',1]], label: '🌹 Prosperità Tyrell: +2 Popolo +1 Oro ogni 5 turni' },
    },
    {
      id: 'tormund', name: 'Tormund Gigante-di-Giant', house: 'Braccio del Re (Popolo Libero)',
      icon: '🗿', emoji: '🪓',
      difficulty: 'hard',
      startResources: { gold: 18, faith: 15, people: 45, army: 45, power: 22 },
      objective: "Oltre il Muro: guida il Popolo Libero — sopravvivi 45 turni, vinci 1 guerra, e tieni Esercito >45 e Popolo >40. Il sud non vi spezzerà.",
      objectiveCheck: (s) => s.turn >= 45 && s.resources.army > 45 && s.resources.people > 40 && s.decisionHistory.some(d => d.tags?.includes('war_victory')),
      startAllies: [], startEnemies: ['Lannister', 'Baratheon'],
      flavor: 'Siamo liberi. Il sud non capisce cosa significa.',
      houseBonus: { res: [['army',2],['people',1]], label: '🗿 Popolo Libero: +2 Esercito +1 Popolo ogni 5 turni' },
    },
    {
      id: 'roose', name: 'Roose Bolton', house: 'Casa Bolton',
      icon: '🩸', emoji: '🐴',
      difficulty: 'medium',
      startResources: { gold: 48, faith: 20, people: 30, army: 55, power: 52 },
      objective: 'Guardiano del Nord: conquista Casa Stark, Esercito >60 e Potere >60 al turno 50 — o siedi sul Trono di Spade.',
      objectiveCheck: (s) => s.king === 'roose' || (s.turn >= 50 && s.houses['Stark']?.status === 'suppressed' && s.resources.army > 60 && s.resources.power > 60),
      startAllies: ['Bolton'], startEnemies: ['Stark'],
      houseBonus: { res: [['army',2],['people',-1]], label: '🩸 Terrore Bolton: +2 Esercito −1 Popolo ogni 5 turni' },
    },
    {
      id: 'ramsay', name: 'Ramsay Bolton', house: 'Casa Bolton',
      icon: '🗡️', emoji: '😈',
      difficulty: 'hard',
      startResources: { gold: 35, faith: 10, people: 25, army: 55, power: 45 },
      objective: 'Il Bastardo Spietato: vinci 2 guerre con Potere >50 — oppure siedi sul Trono di Spade.',
      objectiveCheck: (s) => s.king === 'ramsay' || (s.decisionHistory.filter(d => d.tags?.includes('war_victory')).length >= 2 && s.resources.power > 50),
      startAllies: ['Bolton'], startEnemies: ['Stark', 'Baratheon'],
      flavor: 'Se pensate che questo abbia un lieto fine, non avete prestato attenzione.',
      houseBonus: { res: [['army',3]], label: '🩸 Terrore Bolton: +3 Esercito ogni 5 turni' },
    },
    {
      id: 'ygritte', name: 'Ygritte', house: 'Popolo Libero',
      icon: '🏹', emoji: '❄️',
      difficulty: 'medium',
      startResources: { gold: 28, faith: 32, people: 58, army: 42, power: 28 },
      objective: "Figlia del Vento: il Popolo Libero non si piega — sopravvivi 40 turni con Esercito >40 e Popolo >55, senza MAI stringere un'alleanza con Lannister o Baratheon (nemici per natura).",
      objectiveCheck: (s) => s.turn >= 40 && s.resources.army > 40 && s.resources.people > 55 && s.houses['Lannister']?.status !== 'ally' && s.houses['Baratheon']?.status !== 'ally',
      startAllies: [], startEnemies: ['Lannister'],
      flavor: 'Sai nulla, Jon Snow. Ma io sì.',
      houseBonus: { res: [['army',2],['people',1]], label: '🏹 Arcieri del Nord: +2 Esercito +1 Popolo ogni 5 turni' },
    },
    {
      id: 'jorah', name: 'Jorah Mormont', house: 'Esilio / Casa Mormont',
      icon: '🐻', emoji: '⚔️',
      difficulty: 'easy',
      startResources: { gold: 38, faith: 42, people: 48, army: 40, power: 35 },
      objective: "Cavaliere Esiliato: riscatta l'onore perduto — ottieni 3 alleanze senza mai tradire, vinci 1 guerra, e raggiungi Fede >55 (la lealtà si guadagna con i fatti).",
      objectiveCheck: (s) => countAllies(s) >= 3 && !s.decisionHistory.some(d => d.tags?.includes('betray_ally')) && s.decisionHistory.some(d => d.tags?.includes('war_victory')) && s.resources.faith > 55,
      startAllies: [], startEnemies: [],
      flavor: 'Sono stato esiliato. Ma servire con onore è tutto ciò che mi rimane.',
      houseBonus: { res: [['faith',2],['power',1]], label: '🐻 Redenzione Mormont: +2 Fede +1 Potere ogni 5 turni' },
    },
    {
      id: 'sandor', name: 'Sandor Clegane (Il Mastino)', house: 'Senza Casa',
      icon: '🐕', emoji: '🔥',
      difficulty: 'medium',
      startResources: { gold: 45, faith: 18, people: 38, army: 55, power: 32 },
      objective: "Il Mastino sopravvive: arriva al turno 50 con Esercito >50 e Tesoro >40 — ma senza stringere più di 1 alleanza formale. Nessuno ti deve niente.",
      objectiveCheck: (s) => s.turn >= 50 && s.resources.army > 50 && s.resources.gold > 40 && countAllies(s) <= 1,
      startAllies: [], startEnemies: [],
      flavor: 'Odio i fuochi. E odio chi si crede un eroe.',
      houseBonus: { res: [['army',2],['gold',1]], label: '🐕 Istinto del Mastino: +2 Esercito +1 Oro ogni 5 turni' },
    },
    {
      id: 'tywin', name: 'Tywin Lannister', house: 'Casa Lannister',
      icon: '🦁', emoji: '⚖️',
      difficulty: 'hard',
      startResources: { gold: 75, faith: 25, people: 32, army: 55, power: 70 },
      objective: 'Signore di Castel Granito: Tesoro >70, Potere >70 senza tradire alleati al turno 55 — o siedi sul Trono di Spade.',
      objectiveCheck: (s) => s.king === 'tywin' || (s.turn >= 55 && s.resources.gold > 70 && s.resources.power > 70 && !s.decisionHistory.some(d => d.tags?.includes('betray_ally'))),
      startAllies: ['Lannister'], startEnemies: ['Stark', 'Baratheon'],
      flavor: 'Un Lannister paga sempre i suoi debiti. E non dimentica mai i torti.',
      houseBonus: { res: [['gold',3]], label: '🦁 Ricchezza Lannister: +3 Oro ogni 5 turni' },
    },
    {
      id: 'brienne', name: 'Brienne di Tarth', house: 'Casa Tarth',
      icon: '🛡️', emoji: '⚔️',
      difficulty: 'medium',
      startResources: { gold: 35, faith: 60, people: 55, army: 38, power: 30 },
      objective: 'Giuramento Sacro: onora tutti i patti (mai tradire), ottieni 2 alleanze e Fede >70 al turno 45.',
      objectiveCheck: (s) => s.turn >= 45 && !s.decisionHistory.some(d => d.tags?.includes('betray_ally')) && countAllies(s) >= 2 && s.resources.faith > 70,
      startAllies: [], startEnemies: [],
      flavor: 'Ho fatto un giuramento. E lo manterrò — qualunque cosa accada.',
      houseBonus: { res: [['faith',2],['army',1]], label: '🛡️ Onore di Tarth: +2 Fede +1 Esercito ogni 5 turni' },
    },
    {
      id: 'davos', name: 'Davos Seaworth', house: 'Casa Baratheon',
      icon: '✋', emoji: '⚓',
      difficulty: 'easy',
      startResources: { gold: 45, faith: 48, people: 62, army: 30, power: 38 },
      objective: "Il Cavaliere della Cipolla: onora ogni patto — raggiungi turno 45 con 3 alleanze, Popolo >65, senza MAI tradire e senza aver dichiarato guerra tu per primo.",
      objectiveCheck: (s) => s.turn >= 45 && countAllies(s) >= 3 && s.resources.people > 65 && !s.decisionHistory.some(d => d.tags?.includes('betray_ally')) && !s.decisionHistory.some(d => d.tags?.includes('war_declaration')),
      startAllies: ['Baratheon'], startEnemies: [],
      flavor: "Sono un figlio di pescatori. Ma so cosa è giusto.",
      houseBonus: { res: [['people',2],['faith',1]], label: '✋ Voce del Popolo: +2 Popolo +1 Fede ogni 5 turni' },
    },
    {
      id: 'otto', name: 'Otto Hightower', house: 'Casa Hightower',
      icon: '🕯️', emoji: '📜',
      difficulty: 'medium',
      startResources: { gold: 60, faith: 58, people: 42, army: 30, power: 65 },
      objective: "La Mano del Re: controlla il regno senza sporcarti le mani — siediti sul Trono, oppure raggiungi turno 50 con 3 alleanze, Fede >60 e senza MAI aver perso una guerra. Il potere vero è invisibile.",
      objectiveCheck: (s) => s.king === 'otto' || (s.turn >= 50 && countAllies(s) >= 3 && s.resources.faith > 60 && !s.decisionHistory.some(d => d.tags?.includes('war_defeat'))),
      startAllies: ['Hightower'], startEnemies: ['Targaryen'],
      flavor: "Il potere non si conquista con le spade. Si conquista stando sempre un passo avanti.",
      houseBonus: { res: [['gold',2],['faith',2]], label: '🕯️ Saggezza di Oldtown: +2 Oro +2 Fede ogni 5 turni' },
    },
    {
      id: 'alicent', name: 'Alicent Hightower', house: 'Casa Hightower',
      icon: '🕯️', emoji: '👸',
      difficulty: 'hard',
      startResources: { gold: 55, faith: 65, people: 50, army: 28, power: 60 },
      objective: 'La Regina Reggente: siedi sul Trono di Spade mantenendo Fede >70 e Potere >65.',
      objectiveCheck: (s) => s.king === 'alicent' && s.resources.faith > 70 && s.resources.power > 65,
      startAllies: ['Hightower', 'Lannister'], startEnemies: ['Targaryen'],
      flavor: "Ho servito il Re. Ho protetto i miei figli. Ora è tempo di proteggere il regno.",
      houseBonus: { res: [['faith',2],['power',1]], label: '🕯️ Grazia di Oldtown: +2 Fede +1 Potere ogni 5 turni' },
    },
  ];

  // ══════════════════════════════════════════════
  // DATA — GREAT HOUSES
  // ══════════════════════════════════════════════
  const HOUSES_DEF = [
    { id: 'Stark',     name: 'Stark',    icon: '🐺', crest: 'images/houses/Stark.png',     region: 'Nord',               baseArmy: 90,
      allianceReq: { people: 55, faith: 45 },
      allianceHint: 'Gli Stark valorizzano l\'onore e la lealtà del popolo. Non si fidano di chi ha le mani sporche di sangue o il favore dei nobili senza quello del popolo.' },
    { id: 'Lannister', name: 'Lannister',icon: '🦁', crest: 'images/houses/Lannister.png', region: 'Castel Granito',     baseArmy: 95,
      allianceReq: { gold: 70, power: 55 },
      allianceHint: 'I Lannister pagano i loro debiti, e si aspettano ricchezza da chi cerca la loro alleanza. Senza oro e influenza politica, la proposta non vale nemmeno la pergamena su cui è scritta.' },
    { id: 'Tyrell',    name: 'Tyrell',   icon: '🌹', crest: 'images/houses/Tyrell.png',    region: 'Altogarden',         baseArmy: 95,
      allianceReq: { gold: 55, people: 60 },
      allianceHint: 'I Tyrell cercano alleati prosperi e amati dal popolo. Una casata povera o impopolare non porta nulla al tavolo delle trattative di Altogarden.' },
    { id: 'Baratheon', name: 'Baratheon',icon: '🦌', crest: 'images/houses/Baratheon.png', region: 'Capo della Tempesta',baseArmy: 80,
      allianceReq: { army: 50, power: 45 },
      allianceHint: 'I Baratheon rispettano la forza militare e l\'autorità politica. Chi non ha truppe sufficienti né influenza reale è considerato troppo debole per essere un alleato affidabile.' },
    { id: 'Tully',     name: 'Tully',    icon: '🐟', crest: 'images/houses/Tully.png',    region: 'Acque del Nera',     baseArmy: 70,
      allianceReq: { faith: 50, people: 50 },
      allianceHint: 'I Tully credono nella Fede e nel bene del popolo. Chi ha perso il favore della gente o della chiesa difficilmente otterrà la loro fiducia.' },
    { id: 'Martell',   name: 'Martell',  icon: '☀️', crest: 'images/houses/Martell.png',  region: 'Dorne',              baseArmy: 75,
      allianceReq: { power: 50, army: 45 },
      allianceHint: 'Dorne non dimentica i torti e non si allea con i deboli. Serve influenza e una forza militare rispettabile per sedere al tavolo dei Martell.' },
    { id: 'Greyjoy',   name: 'Greyjoy',  icon: '🐙', crest: 'images/houses/Greyjoy.png',  region: 'Isole di Ferro',     baseArmy: 78,
      allianceReq: { army: 55 },
      allianceHint: 'Gli uomini del Ferro rispettano solo la forza. Un alleato con pochi soldati non merita nemmeno una risposta dal Castello Pyke.' },
    { id: 'Frey',      name: 'Frey',     icon: '🌉', crest: 'images/houses/Frey.png',     region: 'Tridente',           baseArmy: 60,
      allianceReq: { gold: 45 },
      allianceHint: 'I Frey sono venali e pragmatici. Senza un adeguato compenso in oro, Walder Frey non muoverà un dito per nessuno.' },
    { id: 'Bolton',    name: 'Bolton',    icon: '🩸', crest: 'images/houses/Bolton.png',   region: 'Il Nord (Forte Terrore)',  baseArmy: 85,
      allianceReq: { army: 60, power: 50 },
      allianceHint: 'I Bolton rispettano solo la forza bruta e il terrore. Senza un esercito temibile e influenza politica solida, non considerano nessuno degno di alleanza.' },
    { id: 'Targaryen', name: 'Targaryen', icon: '🐉', crest: 'images/houses/Targaryen.png', region: 'Dragonstone / Esilio',       baseArmy: 95,
      allianceReq: { army: 55, power: 60 },
      allianceHint: "I Targaryen riconoscono solo chi ha potere e forza militare degni del Trono di Spade. Senza entrambi, la proposta è un insulto al sangue del drago." },
    { id: 'Hightower', name: 'Hightower', icon: '🕯️', crest: 'images/houses/Hightower.png', region: 'Vecchia Città (Oldtown)',    baseArmy: 85,
      allianceReq: { gold: 60, faith: 55 },
      allianceHint: "Gli Hightower sono signori di Oldtown e protettori della Cittadella. Rispettano oro e fede — senza entrambi non aprono nemmeno le porte della loro alta torre." },
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
      excludeChars: ['arya','tormund','jaime','bronn','theon','littlefinger','catelyn','sansa','melisandre','jon','oberyn'],
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
      rightText: 'Invia i guaritori', rightEffects: { people: +10, gold: -10, faith: +5 },
      minTurn: 3,
    },
    {
      id: 'sell_swords', tags: ['army', 'gold'],
      speaker: 'Capitano dei Mercenari', speakerRole: 'Condottiero straniero',
      excludeChars: ['arya','melisandre'],
      portrait: '⚔️', icon: '⚔️',
      text: "Cinquemila spade sono in vendita. La Compagnia Dorata offre i propri servizi. Costano molto, ma rafforzerebbero notevolmente il vostro esercito.",
      leftText: 'Rifiuta', leftEffects: { gold: +5 },
      rightText: "Assoldali", rightEffects: { gold: -10, army: +14 },
      minTurn: 1,
    },
    {
      id: 'iron_bank', tags: ['gold', 'power'],
      speaker: 'Tycho Nestoris', speakerRole: 'Banca di Ferro di Braavos',
      excludeChars: ['arya','tormund','jaime','bronn','theon','melisandre'],
      portrait: '🏦', icon: '🏦',
      text: "La Banca di Ferro reclama il suo debito. Potete rinegoziare, ma a caro prezzo politico. Oppure rifiutare e subire embargo commerciale.",
      leftText: 'Rifiuta il debito', leftEffects: { gold: +8, power: -10 },
      rightText: 'Paga e rinegozia', rightEffects: { gold: -10, power: +2 },
      minTurn: 10,
    },
    {
      id: 'lord_rebellion', tags: ['army', 'power'],
      speaker: 'Araldo', speakerRole: 'Notizia dal Riverlands',
      excludeChars: ['arya','tormund','jaime','bronn','theon','littlefinger','catelyn','sansa','melisandre','oberyn'],
      portrait: '🏰', icon: '🏰',
      text: "Un signore minore si è ribellato nei Riverlands. Potete inviare truppe a soffocarlo subito, o negoziare e risolvere pacificamente.",
      leftText: 'Negozia la pace', leftEffects: { power: -5, people: +8 },
      rightText: 'Schiaccia la ribellione', rightEffects: { army: -10, power: +2, people: -8 },
      minTurn: 5,
    },
    {
      id: 'raven_news_merchant', tags: ['power', 'gold'],
      speaker: 'Corvo messaggero', speakerRole: 'Notizia da lontano',
      portrait: '🦅', icon: '🦅',
      text: "Un ricco mercante delle Città Libere chiede protezione in cambio di accesso alle rotte commerciali orientali. Ma i vostri nobili sussurrano che stringere patti con stranieri indebolisce la vostra immagine.",
      leftText: 'Rifiuta — i nobili approvano', leftEffects: { power: +3, faith: +5 },
      rightText: 'Accetta il patto commerciale', rightEffects: { gold: +14, people: +5, power: -8 },
      minTurn: 3,
    },
    {
      id: 'night_watch_plea', tags: ['army', 'faith'],
      speaker: "Lord Comandante", speakerRole: "Guardiani della Notte",
      portrait: '❄️', icon: '❄️',
      text: "Il Muro ha bisogno di uomini. I Guardiani della Notte chiedono condannati e volontari. Aiutarli rafforza la Fede ma indebolisce il vostro esercito.",
      leftText: 'Ignora la richiesta', leftEffects: { faith: -8 },
      rightText: "Invia uomini al Muro", rightEffects: { army: -12, faith: +10, people: +6 },
      minTurn: 4, excludeChars: ['tormund'], // Tormund non manda uomini al Muro
    },
    {
      id: 'war_council_generic', tags: ['army', 'power'],
      speaker: 'Maester del castello', speakerRole: 'Consiglio militare',
      excludeChars: ['arya','littlefinger','sansa','melisandre'],
      portrait: '⚔️', icon: '⚔️',
      text: "Il consiglio militare si riunisce. Potete addestrare nuove reclute (lento ma sicuro) oppure schierare l'esercito in una dimostrazione di forza.",
      leftText: 'Addestra le reclute', leftEffects: { army: +10, gold: -8 },
      rightText: 'Dimostrazione di forza', rightEffects: { army: +8, people: -5 },
      minTurn: 4,
    },
    {
      id: 'traitor_in_court', tags: ['power', 'army'],
      speaker: 'Guardia della corte', speakerRole: 'Rapporto segreto',
      excludeChars: ['arya','tormund','bronn'],
      portrait: '🔒', icon: '🔒',
      text: "Una spia nemica è stata scoperta tra i vostri. Potete giustiziarla pubblicamente per deterrenza, o usarla come doppio agente per diffondere disinformazione.",
      leftText: 'Giustizia pubblica', leftEffects: { power: +3, faith: +6 },
      rightText: 'Doppio agente', rightEffects: { gold: -6, army: +3 },
      minTurn: 6,
    },
    {
      id: 'night_terror', tags: ['army', 'faith'],
      speaker: 'Messaggero dal Muro', speakerRole: 'Rapporto urgente',
      portrait: '🌙', icon: '🌙',
      text: "Sussurri parlano di morti che camminano oltre il Muro. Pochissimi ci credono. Investire nella difesa al Muro vi farà sembrare folli, ma potrebbe salvare tutti.",
      leftText: 'Ignora le voci', leftEffects: { faith: +5 },
      rightText: 'Invia rifornimenti', rightEffects: { gold: -10, army: -6, faith: +10 },
      minTurn: 7,
    },
    {
      id: 'assassination_offer', tags: ['power', 'army'],
      speaker: 'Faceless Man', speakerRole: 'Messaggero dei Molti Volti',
      excludeChars: ['arya','tormund'],
      portrait: '🗡️', icon: '🗡️',
      text: "Un messaggero dei Molti Volti offre l'eliminazione di un vostro nemico. Il prezzo è altissimo in oro. Rifiutare potrebbe però far circolare la notizia che avete avuto questa opportunità — e non l'avete colta.",
      leftText: 'Rifiuta e denuncia la cosa', leftEffects: { faith: +10, people: +8, power: -6 },
      rightText: "Commissiona l'assassinio", rightEffects: { gold: -10, power: +2 },
      minTurn: 8, rightTags: ['assassination', 'poison_intrigue'],
      onRightChoose: () => {
        // Kill a random enemy house commander — reduces their army significantly
        const enemies = Object.entries(state.houses).filter(([, h]) => h.status === 'enemy' && !h.suppressed);
        if (enemies.length === 0) {
          showToast(`🗡️ Il Faceless Man ha completato il contratto. Il vostro nemico è più debole.`, 'good');
          return;
        }
        const [, target] = enemies[Math.floor(Math.random() * enemies.length)];
        const armyLost = Math.floor(target.army * (0.15 + Math.random() * 0.15));
        target.army = Math.max(10, target.army - armyLost);
        setTimeout(() => {
          showToast(`🗡️ Il Faceless Man ha ucciso il comandante di Casa ${target.name}. Il loro esercito perde ${armyLost} uomini nel caos della successione.`, 'good');
          updateHUD(); saveGame();
        }, 600);
      },
    },
    {
      id: 'wedding_proposal', tags: ['power', 'faith'],
      speaker: 'Emissario', speakerRole: 'Proposta diplomatica',
      portrait: '💍', icon: '💍',
      text: "Una grande casata propone un'unione matrimoniale tra le vostre famiglie. Porterebbe alleanze solide, ma vincolerebbe la vostra libertà.",
      leftText: 'Declina', leftEffects: { power: -8, faith: +5 },
      rightText: 'Accetta le nozze', rightEffects: { power: +2, people: +8, gold: -6 },
      minTurn: 5, rightTags: ['royal_marriage'],
      excludeChars: ['arya','tormund','bronn','theon','melisandre','jaime'],
    },
    {
      id: 'gift_to_ally', tags: ['gold', 'power'],
      speaker: 'Messaggero alleato', speakerRole: 'Richiesta di aiuto',
      portrait: '🤝', icon: '🤝',
      text: "Un vostro alleato è in difficoltà. Aiutarlo non vi darà nulla in cambio — ma ignorarlo rischia di raffreddare l'alleanza e renderla fragile.",
      leftText: "Non posso permettermi", leftEffects: { power: -8 },
      rightText: "Invia oro e rifornimenti", rightEffects: { gold: -10 },
      minTurn: 6, rightTags: ['help_ally'],
    },
    {
      id: 'spy_network', tags: ['power', 'gold'],
      speaker: 'Informatore', speakerRole: 'Proposta riservata',
      excludeChars: ['tormund'],
      portrait: '🕷', icon: '🕷',
      text: "Un informatore offre di costruire una rete di spie che vi darà informazioni su ogni casata. Il costo è alto, e qualcuno potrebbe scoprirlo.",
      leftText: 'Troppo rischioso', leftEffects: {},
      rightText: 'Finanzia la rete', rightEffects: { gold: -10, power: +3 },
      minTurn: 6,
      onRightChoose: () => {
        // Reveal loyalty intel on a random neutral/enemy house
        const targets = Object.entries(state.houses).filter(([, h]) => !h.suppressed && h.status !== 'ally');
        if (targets.length === 0) return;
        const [hId, h] = targets[Math.floor(Math.random() * targets.length)];
        const loyalty = Math.random();
        let intel, consequence;
        if (loyalty < 0.35) {
          intel = `Le spie riportano: Casa ${h.name} sta segretamente cercando alleati contro di voi. Non fidatevi.`;
          consequence = () => { if (h.status === 'neutral') h.status = 'enemy'; };
        } else if (loyalty < 0.65) {
          intel = `Le spie riportano: Casa ${h.name} è indebolita da conflitti interni. Potrebbe accettare un'alleanza a condizioni favorevoli.`;
          consequence = () => { if (!state.allianceCooldowns) state.allianceCooldowns = {}; state.allianceCooldowns[hId] = 0; };
        } else {
          intel = `Le spie riportano: Casa ${h.name} ha risorse nascoste — stanno accumulando oro in segreto. Un accordo commerciale li convincerebbe.`;
          consequence = () => { h.army = Math.round(h.army * 1.05); };
        }
        setTimeout(() => {
          consequence();
          showToast(`🕷 ${intel}`, 'good');
          updateHUD(); saveGame();
        }, 600);
      },
    },
    {
      id: 'betrayal_remembered', tags: ['power', 'people'],
      speaker: 'Messaggero ostile', speakerRole: 'Lettera sigillata con cera nera',
      portrait: '📩', icon: '📩',
      text: "«Ricordate il vostro tradimento? Il Nord ricorda. E ora chiediamo riparazione, o ogni accordo futuro sarà impossibile.»",
      leftText: 'Ignorali', leftEffects: { power: -10, people: -8 },
      rightText: 'Offri compensazione', rightEffects: { gold: -10, power: +3 },
      minTurn: 15, requiresTag: 'betray_ally',
    },
    {
      id: 'war_declaration_enemy', tags: ['army', 'power', 'war_choice'],
      speaker: 'Araldo nemico', speakerRole: 'Sfida di guerra',
      portrait: '⚔️', icon: '⚔️',
      text: "Un araldo porta sfida di guerra. La casata rivale ha mobilitato le truppe. Potete accettare la guerra aperta o cercare una via diplomatica dell'ultimo minuto.",
      leftText: 'Cerca la pace', leftEffects: { army: +3, power: -8, people: +6 },
      rightText: 'Accetta la guerra', rightEffects: { army: -10, power: +2, people: -8 },
      minTurn: 8, rightTags: ['war_choice'],
    },
    {
      id: 'noble_feast_generic', tags: ['people', 'faith', 'power'],
      speaker: 'Castellano', speakerRole: 'Proposta di corte',
      excludeChars: ['arya','tormund','bronn','theon','melisandre','jaime'],
      portrait: '🍷', icon: '🍷',
      text: "Un grande banchetto attirerà nobili da ogni angolo del regno. Costoso, ma un momento di gioia può unire le casate.",
      leftText: 'Annulla il banchetto', leftEffects: { power: -5 },
      rightText: 'Organizza il banchetto', rightEffects: { gold: -10, people: +10, power: +3, faith: +4 },
      minTurn: 5, excludeChars: ['tormund', 'arya'],
    },
    {
      id: 'scroll_of_prophecy', tags: ['faith', 'power'],
      speaker: 'Meera Reed', speakerRole: 'Portavoce dei Figli della Foresta',
      portrait: '📜', icon: '📜',
      text: "Antichi rotoli parlano del Principe che fu Promesso. Seguire questa profezia richiede sacrifici enormi, ma potrebbe essere la chiave per salvare il regno.",
      leftText: 'Ignora le profezie', leftEffects: { faith: -5 },
      rightText: "Segui il destino", rightEffects: { faith: +10, army: -8, power: +2 },
      minTurn: 9,
    },

    // ══════════════════════════════════════════
    // ── NUOVE CARTE UNIVERSALI ──
    // ══════════════════════════════════════════

    {
      id: 'drought_lands', tags: ['people', 'gold'],
      speaker: 'Steward dei campi', speakerRole: 'Rapporto dalle terre',
      portrait: '🌵', icon: '🌵',
      text: "Una siccità prolungata ha devastato i raccolti. Il popolo è affamato e il tesoro soffre. Potete aprire i granai di riserva oppure importare grano dall'Est a caro prezzo.",
      leftText: 'Apri i granai', leftEffects: { people: +12, gold: -8 },
      rightText: 'Importa grano da Essos', rightEffects: { people: +8, gold: -10 },
      minTurn: 3,
    },
    {
      id: 'tournament_proposal', tags: ['people', 'power', 'gold'],
      speaker: 'Castellano', speakerRole: 'Corte reale',
      excludeChars: ['arya','tormund','bronn','melisandre'],
      portrait: '🏇', icon: '🏇',
      text: "Un grande torneo attirerebbe cavalieri da ogni casata, aumentando il vostro prestigio. Ma il popolo soffre — l'oro speso per lo spettacolo potrebbe invece sfamare villaggi interi.",
      leftText: "Usa l'oro per il popolo", leftEffects: { people: +14, gold: -8, faith: +6 },
      rightText: 'Indici il torneo', rightEffects: { gold: -10, people: +5, power: +3 },
      minTurn: 4,
    },
    {
      id: 'maester_report', tags: ['faith', 'power'],
      speaker: 'Gran Maester', speakerRole: 'Consigliere del castello',
      excludeChars: ['arya','tormund','bronn'],
      portrait: '📚', icon: '📚',
      text: "Il Gran Maester ha scoperto documenti antichi che rivelano un segreto imbarazzante sulla vostra stirpe. Potete bruciare le prove e dormire tranquilli — o usarle come leva su chi già lo sa.",
      leftText: 'Brucia i documenti — il passato muoia', leftEffects: { faith: +8, power: -6, people: +5 },
      rightText: 'Diffondili con la tua versione dei fatti', rightEffects: { power: +3, people: +6, faith: -10 },
      minTurn: 5,
    },
    {
      id: 'smugglers_port', tags: ['gold', 'power'],
      speaker: 'Capitano del porto', speakerRole: 'Rapporto riservato',
      excludeChars: ['melisandre','sansa'],
      portrait: '⚓', icon: '⚓',
      text: "I contrabbandieri controllano il porto ombra. Potete eliminare la rete — rischiando ritorsioni — oppure tassarla in silenzio e riempire le casse senza fare rumore.",
      leftText: 'Elimina i contrabbandieri', leftEffects: { army: -5, gold: +5, people: +8 },
      rightText: 'Tassa in silenzio', rightEffects: { gold: +14, power: -8 },
      minTurn: 4,
    },
    {
      id: 'wildfire_cache', tags: ['army', 'gold', 'faith'],
      speaker: 'Alchimista', speakerRole: 'Gilda degli Alchimisti',
      excludeChars: ['arya','tormund','jon','sansa','catelyn','melisandre'],
      portrait: '🔥', icon: '🔥',
      text: "Gli alchimisti hanno scoperto un deposito dimenticato di fuoco selvatico sotto la città. Potrebbero renderlo una risorsa letale, ma il rischio di incidente è reale.",
      leftText: 'Sigillalo e dimentica', leftEffects: { faith: +8, people: +5 },
      rightText: "Tienilo come deterrente", rightEffects: { army: +10, people: -10, gold: -8 },
      minTurn: 6,
    },
    {
      id: 'septon_blessing', tags: ['faith', 'people'],
      speaker: 'Alto Septon', speakerRole: 'Capo della Fede dei Sette',
      excludeChars: ['arya','tormund','bronn','theon','daenerys'],
      portrait: '✝️', icon: '✝️',
      text: "L'Alto Septon offre una benedizione pubblica in cambio di un contributo alla Fede. Il popolo vedrà la vostra devozione, ma i cinici la chiameranno compravendita di favori.",
      leftText: 'Declina la benedizione', leftEffects: { faith: -6 },
      rightText: 'Accetta la benedizione', rightEffects: { faith: +10, people: +8, gold: -10 },
      minTurn: 3,
    },
    {
      id: 'prisoners_dilemma', tags: ['power', 'faith', 'people'],
      speaker: 'Carceriere', speakerRole: 'Prigioni del castello',
      portrait: '⛓️', icon: '⛓️',
      text: "Le prigioni sono sovraffollate di nemici politici, vecchi signori e ladri comuni. Potete liberare i meno pericolosi per guadagnare il favore del popolo, o tenerli per sicurezza.",
      leftText: 'Tienili imprigionati', leftEffects: { people: -8, gold: +4 },
      rightText: 'Libera i meno pericolosi', rightEffects: { people: +12, faith: +6, power: -8 },
      minTurn: 5,
    },
    {
      id: 'flood_riverlands', tags: ['gold', 'people', 'army'],
      speaker: 'Messaggero dei Riverlands', speakerRole: 'Notizia di calamità',
      portrait: '🌊', icon: '🌊',
      text: "Le inondazioni hanno distrutto villaggi e strade nei Riverlands. I rifugiati marciano verso le vostre terre. Accoglierli vi costerà, ma guadagnerete la loro eterna lealtà.",
      leftText: 'Chiudi i confini', leftEffects: { gold: +6, people: -10, power: -6 },
      rightText: 'Accogli i rifugiati', rightEffects: { people: +12, gold: -10, army: +3 },
      minTurn: 4,
    },
    {
      id: 'blackmail_letter', tags: ['power', 'gold'],
      speaker: 'Mittente sconosciuto', speakerRole: 'Lettera anonima sigillata',
      portrait: '✉️', icon: '✉️',
      text: "Una lettera anonima rivela un segreto compromettente su un vostro rivale. Potete usarlo come ricatto — rischioso ma efficace — oppure ignorarlo per mantenere la vostra onorabilità.",
      leftText: 'Brucia la lettera', leftEffects: { faith: +8, power: -5 },
      rightText: 'Usa il segreto', rightEffects: { power: +2, gold: +6, faith: -10 },
      minTurn: 7, rightTags: ['poison_intrigue'],
      onRightChoose: () => {
        // Ricatto: forza una casata nemica a diventare neutrale, o riduce il suo esercito
        const targets = Object.entries(state.houses).filter(([, h]) => (h.status === 'enemy' || h.status === 'neutral') && !h.suppressed);
        if (targets.length === 0) return;
        const [, h] = targets[Math.floor(Math.random() * targets.length)];
        const wasEnemy = h.status === 'enemy';
        if (wasEnemy) {
          h.status = 'neutral';
          setTimeout(() => showToast(`✉️ Il segreto ha funzionato. Casa ${h.name} — sotto minaccia di rivelazione — si ritira. Ora neutrali.`, 'good'), 500);
        } else {
          const loss = Math.floor(h.army * 0.10);
          h.army = Math.max(10, h.army - loss);
          setTimeout(() => showToast(`✉️ Casa ${h.name} paga in silenzio per il vostro silenzio. −${loss} soldati dismessi per coprire le tracce.`, 'good'), 500);
        }
        setTimeout(() => { updateHUD(); saveGame(); }, 700);
      },
    },
    {
      id: 'foreign_dignitary', tags: ['power', 'gold', 'people'],
      speaker: 'Ciambellano', speakerRole: 'Arrivo di ospiti illustri',
      excludeChars: ['arya','tormund','bronn'],
      portrait: '🎖️', icon: '🎖️',
      text: "Un dignitario straniero è arrivato a corte. Impressionarlo con ricchezza e pompa potrebbe aprire nuove rotte commerciali. Ma ogni moneta spesa è sottratta al popolo.",
      leftText: 'Accoglienza sobria', leftEffects: { power: -5, gold: +5 },
      rightText: 'Accoglienza sfarzosa', rightEffects: { power: +3, gold: -10, people: -5 },
      minTurn: 6,
    },
    {
      id: 'deserters_caught', tags: ['army', 'faith', 'people'],
      speaker: 'Capitano della guardia', speakerRole: 'Rapporto militare',
      excludeChars: ['arya','littlefinger','melisandre'],
      portrait: '⚔️', icon: '⚔️',
      text: "Dodici soldati sono stati catturati mentre disertavano. La legge prevede la morte. Ma graziare i disertori manda un segnale di clemenza che potrebbe fermare le diserzioni future.",
      leftText: 'Eseguili come previsto', leftEffects: { army: +6, faith: +5, people: -8 },
      rightText: 'Grazia e reintegra', rightEffects: { army: -5, people: +10, faith: -5 },
      minTurn: 5,
    },
    {
      id: 'wildfire_rumor', tags: ['faith', 'people', 'power'],
      speaker: 'Cittadino agitato', speakerRole: 'Voce di piazza',
      portrait: '👥', icon: '👥',
      text: "Una voce si diffonde tra il popolo: qualcuno ha visto luci verdi sotto la città. Il panico potrebbe degenerare in rivolte se non viene gestito subito.",
      leftText: 'Nega e sopprimi le voci', leftEffects: { people: +6, power: -8 },
      rightText: 'Indaga pubblicamente', rightEffects: { people: -6, faith: +10 },
      minTurn: 8,
    },
    {
      id: 'bridge_toll', tags: ['gold', 'people'],
      speaker: 'Custode del ponte', speakerRole: 'Proposta commerciale',
      portrait: '🌉', icon: '🌉',
      text: "Il ponte principale è in rovina. Potete ricostruirlo con fondi pubblici — aumentando il commercio ma svuotando il tesoro — o imporre un pedaggio che lo ripaghi lentamente.",
      leftText: 'Imponi il pedaggio', leftEffects: { gold: +10, people: -8 },
      rightText: 'Ricostruisci con fondi pubblici', rightEffects: { gold: -10, people: +10, power: +2 },
      minTurn: 4,
    },
    {
      id: 'religious_schism', tags: ['faith', 'people', 'power'],
      speaker: 'Septon dissidente', speakerRole: 'Rottura nella Fede',
      excludeChars: ['arya','tormund','bronn','daenerys'],
      portrait: '✝️', icon: '✝️',
      text: "Un septon carismatico predica una dottrina alternativa che sta conquistando i poveri. Sopprimerlo rafforza l'ordine ma crea martiri. Lasciarlo predicare divide la Fede.",
      leftText: 'Sopprimi la dissidenza', leftEffects: { faith: +8, people: -10 },
      rightText: 'Lascialo predicare', rightEffects: { faith: -8, people: +12 },
      minTurn: 6,
    },
    {
      id: 'trade_embargo', tags: ['gold', 'power'],
      speaker: 'Mastro delle Monete', speakerRole: 'Crisi commerciale',
      excludeChars: ['arya','tormund','bronn'],
      portrait: '📊', icon: '📊',
      text: "Una casata rivale ha imposto un embargo commerciale sulle vostre rotte. Potete rispondere con un contro-embargo, danneggiando entrambi, oppure cercare nuovi partner commerciali.",
      leftText: 'Contro-embargo', leftEffects: { gold: -8, power: +3, people: -6 },
      rightText: 'Trova nuove rotte', rightEffects: { gold: +8, power: -5 },
      minTurn: 8,
    },
    {
      id: 'orphan_army', tags: ['army', 'people', 'faith'],
      speaker: 'Septon', speakerRole: 'Notizia dal campo',
      portrait: '⚔️', icon: '⚔️',
      text: "Centinaia di orfani di guerra vagano per le strade. Potete arruolarli nell'esercito — cibo e uno scopo in cambio di fedeltà — oppure affidarli alla Fede per essere nutriti.",
      leftText: 'Affidali alla Fede', leftEffects: { faith: +6, people: +6 },
      rightText: 'Arruolali', rightEffects: { army: +10, gold: -6, faith: -8 },
      minTurn: 4,
    },
    {
      id: 'shadow_council', tags: ['power', 'gold'],
      speaker: 'Emissario riservato', speakerRole: 'Proposta in segreto',
      excludeChars: ['arya','tormund','jon','ned','sansa'],
      portrait: '🕯️', icon: '🕯️',
      text: "Un consiglio segreto di nobili vi offre sostegno politico in cambio di favori futuri non specificati. Un accordo pericoloso — ma il potere che ne deriva potrebbe essere decisivo.",
      leftText: 'Rifiuta accordi oscuri', leftEffects: { faith: +6, power: -5 },
      rightText: 'Accetta il sostegno', rightEffects: { power: +3, gold: +6 },
      minTurn: 10, rightTags: ['poison_intrigue'],
      onRightChoose: () => {
        // Il consiglio trasforma una casata nemica in neutrale (il loro appoggio ha peso)
        const enemies = Object.entries(state.houses).filter(([, h]) => h.status === 'enemy' && !h.suppressed);
        if (enemies.length > 0) {
          const [, h] = enemies[Math.floor(Math.random() * enemies.length)];
          h.status = 'neutral';
          setTimeout(() => showToast(`🕯️ Il consiglio ha convinto Casa ${h.name} a ritirare la sua ostilità. Ora neutrali — per ora.`, 'good'), 500);
        }
        // Schedula una carta "il favore viene riscosso" tra 10-15 turni
        const dueIn = 10 + Math.floor(Math.random() * 6);
        state.eventQueue.push({
          id: 'shadow_council_debt_' + state.turn,
          speaker: 'Emissario del Consiglio',
          speakerRole: '🕯️ Il favore viene riscosso',
          portrait: '🕯️', icon: '🕯️',
          text: `Il consiglio segreto si fa vivo. È tempo di restituire il favore. Vogliono risorse — e non accettano un rifiuto.`,
          leftText: 'Paga il debito', leftEffects: { gold: -10, army: -8 },
          rightText: 'Rifiuta — rompi il patto', rightEffects: { power: -14, faith: -8 },
          tags: ['shadow_debt'],
          minTurn: state.turn + dueIn,
        });
        setTimeout(() => { updateHUD(); saveGame(); }, 700);
      },
    },
    {
      id: 'fire_in_city', tags: ['people', 'gold', 'army'],
      speaker: 'Capitano della guardia cittadina', speakerRole: 'Emergenza',
      portrait: '🔥', icon: '🔥',
      text: "Un incendio divampa nel quartiere povero. Le guardie faticano a contenerlo. Potete inviare truppe per spegnerlo o attendere che si spenga da solo rischiando una catastrofe.",
      leftText: 'Attendi e controlla', leftEffects: { people: -10, gold: +4 },
      rightText: 'Invia truppe e secchi', rightEffects: { army: -5, people: +12, gold: -6 },
      minTurn: 3,
    },
    {
      id: 'wandering_knight', tags: ['army', 'power'],
      speaker: 'Cavaliere errante', speakerRole: 'Udienza di corte',
      excludeChars: ['arya','melisandre'],
      portrait: '🗡️', icon: '🗡️',
      text: "Un cavaliere senza casa chiede servizio. Ha combattuto per tre casate diverse — la sua lealtà è in vendita, ma il suo valore in battaglia è indiscutibile.",
      leftText: 'Rifiuta i traditori', leftEffects: { faith: +5 },
      rightText: 'Assoldalo', rightEffects: { army: +10, gold: -8 },
      minTurn: 2,
    },
    {
      id: 'ancient_debt', tags: ['gold', 'power', 'faith'],
      speaker: 'Vecchio nobile', speakerRole: 'Credito antico',
      excludeChars: ['arya','tormund','bronn','theon'],
      portrait: '📜', icon: '📜',
      text: "Un nobile anziano reclama un debito contratto dai vostri antenati. Il debito è legalmente valido. Pagarlo mostrerebbe onore; contestarlo potrebbe trascinarvi in una disputa lunga anni.",
      leftText: 'Contesta il debito', leftEffects: { power: -10, gold: +12 },
      rightText: "Onora il debito degli antenati", rightEffects: { gold: -10, power: +3, faith: +10 },
      minTurn: 7,
    },
    {
      id: 'court_jester', tags: ['people', 'power'],
      speaker: 'Buffone di corte', speakerRole: 'Intrattenimento reale',
      excludeChars: ['arya','tormund','melisandre','ned'],
      portrait: '🃏', icon: '🃏',
      text: "Il buffone di corte ha offeso pubblicamente un potente nobile con una battuta. Il popolo ride. Il nobile chiede la sua testa. Come vi comportate?",
      leftText: 'Punisci il buffone', leftEffects: { power: +3, people: -10 },
      rightText: "È solo uno scherzo — lascialo stare", rightEffects: { people: +12, power: -8 },
      minTurn: 3,
    },
    {
      id: 'ravens_intercepted', tags: ['power', 'army'],
      speaker: 'Maestro delle spie', speakerRole: 'Comunicazione intercettata',
      portrait: '🦅', icon: '🦅',
      text: "I vostri uomini hanno intercettato un corvo con messaggi cifrati tra due casate. I messaggi rivelano un piano di guerra. Smascherarle pubblicamente o usare questa leva in privato?",
      leftText: 'Smascherale pubblicamente', leftEffects: { people: +8, army: -5 },
      rightText: 'Usale come leva privata', rightEffects: { gold: +8, army: +3 },
      minTurn: 8, rightTags: ['poison_intrigue'],
      onLeftChoose: () => {
        // Smascherarle: una casata nemica perde credibilità e armata
        const enemies = Object.entries(state.houses).filter(([, h]) => h.status === 'enemy' && !h.suppressed);
        if (enemies.length === 0) return;
        const [, h] = enemies[Math.floor(Math.random() * enemies.length)];
        const loss = Math.floor(h.army * 0.12);
        h.army = Math.max(10, h.army - loss);
        setTimeout(() => showToast(`📢 Casa ${h.name} è smascherata davanti al regno. Perdono ${loss} soldati per defezioni e vergogna.`, 'good'), 500);
      },
      onRightChoose: () => {
        // Leva privata: una casata nemica diventa neutrale (intimidita)
        const enemies = Object.entries(state.houses).filter(([, h]) => h.status === 'enemy' && !h.suppressed);
        if (enemies.length === 0) return;
        const [, h] = enemies[Math.floor(Math.random() * enemies.length)];
        h.status = 'neutral';
        setTimeout(() => {
          showToast(`🤫 Casa ${h.name} sa che avete il loro segreto. Per ora si ritirano nell'ombra — neutrali.`, 'good');
          updateHUD(); saveGame();
        }, 500);
      },
    },
    {
      id: 'militia_request', tags: ['army', 'people'],
      speaker: 'Sindaco di una città minore', speakerRole: 'Petizione dal basso',
      portrait: '🏘️', icon: '🏘️',
      text: "Una città minore chiede il permesso di formare una milizia civica per difendersi dai briganti. Potete autorizzarla — aumentando le difese — oppure vietarla per evitare che armi il popolo.",
      leftText: 'Vietate le milizie', leftEffects: { power: +3, people: -8 },
      rightText: 'Autorizzate la milizia', rightEffects: { army: +8, people: +10, power: -5 },
      minTurn: 3,
    },
    {
      id: 'eclipse_omen', tags: ['faith', 'people', 'power'],
      speaker: 'Septon del tempio', speakerRole: 'Presagio divino',
      portrait: '🌑', icon: '🌑',
      text: "Un'eclissi totale ha terrorizzato il popolo. I settoni la interpretano come un segno dei Sette. Potete sfruttare il clima di devozione oppure rassicurare il popolo con razionalità.",
      leftText: 'Calma il popolo', leftEffects: { faith: -8, people: +10 },
      rightText: "Sfrutta l'omen divino", rightEffects: { faith: +10, power: +3, people: -8 },
      minTurn: 5,
    },
    {
      id: 'gold_mine_found', tags: ['gold', 'army'],
      speaker: 'Esploratore', speakerRole: 'Scoperta nelle colline',
      portrait: '⛏️', icon: '⛏️',
      text: "Gli esploratori hanno trovato una vena d'oro nelle colline. Sfruttarla subito richiede uomini e indebolisce i villaggi — ma rivenderla segretamente a un mercante straniero potrebbe essere più prudente.",
      leftText: "Vendi la concessione in segreto", leftEffects: { gold: +10, power: +3, faith: -6 },
      rightText: 'Sfrutta la miniera direttamente', rightEffects: { gold: +14, army: -8, people: -5 },
      minTurn: 6,
    },
    {
      id: 'rival_heir', tags: ['power', 'army', 'faith'],
      speaker: 'Consigliere fidato', speakerRole: 'Notizia delicata',
      excludeChars: ['arya','tormund','bronn','theon'],
      portrait: '👑', icon: '👑',
      text: "Un erede rivale ha iniziato a raccogliere consensi tra i signori minori, avanzando pretese sul vostro territorio. Potete agire subito in modo aggressivo o attendere che si scopra.",
      leftText: 'Attendi — non alimentare la cosa', leftEffects: { power: -6 },
      rightText: 'Agisci prima che sia tardi', rightEffects: { army: -8, power: +3, people: -6 },
      minTurn: 10,
    },
    {
      id: 'longship_raid', tags: ['army', 'people', 'gold'],
      speaker: 'Capitano costiero', speakerRole: 'Allarme dalle coste',
      portrait: '🚢', icon: '🚢',
      text: "Incursori delle Isole di Ferro hanno saccheggiato un villaggio costiero. Potete inviare truppe per una rappresaglia immediata o rafforzare le difese per prevenire future incursioni.",
      leftText: 'Rafforza le difese', leftEffects: { army: -5, gold: -8, people: +8 },
      rightText: 'Rappresaglia immediata', rightEffects: { army: -10, power: +3, people: -5 },
      minTurn: 4,
    },
    {
      id: 'famous_bard', tags: ['people', 'power'],
      speaker: 'Bardo celebre', speakerRole: 'Arrivo a corte',
      excludeChars: ['arya','tormund','bronn'],
      portrait: '🎶', icon: '🎶',
      text: "Un bardo famoso in tutto il regno ha chiesto di suonare a corte. Le sue canzoni parlano di voi — sia di glorie che di voci scomode. Fate in modo che canti solo le glorie.",
      leftText: 'Lascialo cantare liberamente', leftEffects: { people: +12, power: -8 },
      rightText: 'Censura le canzoni', rightEffects: { power: +3, people: -8, gold: -5 },
      minTurn: 3,
    },
    {
      id: 'rogue_maester', tags: ['power', 'faith', 'gold'],
      speaker: 'Citadel di Vecchia Città', speakerRole: 'Avviso ufficiale',
      excludeChars: ['arya','tormund','bronn','theon'],
      portrait: '⚗️', icon: '⚗️',
      text: "La Cittadella vi avvisa che un Maester è stato espulso per aver praticato arti proibite. Si dice si trovi nelle vostre terre. Consegnarlo alla Cittadella vi guadagnerà favore; assoldarlo vi darà conoscenze pericolose.",
      leftText: 'Consegnalo alla Cittadella', leftEffects: { faith: +8, power: +2 },
      rightText: 'Assoldalo in segreto', rightEffects: { gold: +8, faith: -12 },
      minTurn: 8,
    },
    {
      id: 'grain_shortage', tags: ['people', 'gold', 'faith'],
      speaker: 'Steward delle provviste', speakerRole: 'Crisi alimentare',
      portrait: '🌾', icon: '🌾',
      text: "Le riserve di grano stanno per esaurirsi prima dell'inverno. Potete razionare rigorosamente — impopolare ma necessario — oppure acquistare grano da Essos a prezzi di speculazione.",
      leftText: 'Raziona il grano', leftEffects: { people: -10, faith: +3, gold: +8 },
      rightText: 'Acquista a caro prezzo', rightEffects: { people: +10, gold: -10 },
      minTurn: 5,
    },
    {
      id: 'secret_passage', tags: ['power', 'army'],
      speaker: 'Capomastro del castello', speakerRole: 'Scoperta architettonica',
      portrait: '🏰', icon: '🏰',
      text: "I muratori hanno scoperto un passaggio segreto sotto il castello, probabilmente usato da spie. Potete sigillarlo o usarlo per i vostri scopi. Ma chi lo ha costruito — e perché?",
      leftText: 'Sigilla il passaggio', leftEffects: { faith: +5 },
      rightText: "Usalo a vostro vantaggio", rightEffects: { power: +3, army: +5 },
      minTurn: 6,
    },
    {
      id: 'winter_preparation', tags: ['gold', 'people', 'army'],
      speaker: 'Maestro dei rifornimenti', speakerRole: 'Pianificazione invernale',
      portrait: '❄️', icon: '❄️',
      text: "L'inverno si avvicina. I vecchi consiglieri ripetono: «L'inverno sta arrivando.» Potete iniziare a stoccare risorse ora, sacrificando l'esercito, o rimandare confidando che l'estate duri.",
      leftText: 'Rinvia — l\'estate continua', leftEffects: { army: +5, gold: +6 },
      rightText: 'Inizia i preparativi ora', rightEffects: { gold: -10, people: +10, army: -5 },
      minTurn: 7,
    },
    {
      id: 'letter_from_east', tags: ['gold', 'power'],
      speaker: 'Mercante di Qarth', speakerRole: 'Proposta commerciale da Essos',
      portrait: '📦', icon: '📦',
      text: "Un ricco mercante di Qarth offre un accordo commerciale esclusivo: seta, spezie e pietre preziose in cambio di grano e legname. Ma accettare potrebbe irritare i commercianti locali.",
      leftText: 'Proteggi i commercianti locali', leftEffects: { people: +8, gold: +4 },
      rightText: "Accetta l'accordo orientale", rightEffects: { gold: +14, power: +3, people: -8 },
      minTurn: 5,
    },
    {
      id: 'wolf_sighting', tags: ['faith', 'people'],
      speaker: 'Cacciatore', speakerRole: 'Rapporto dal bosco',
      portrait: '🐺', icon: '🐺',
      text: "Un branco di enormi lupi ha attaccato un villaggio al confine. Il popolo vuole una caccia; i vecchi saggi dicono che i lupi portano presagi. Come interpretate l'accaduto?",
      leftText: "Organizza la caccia", leftEffects: { people: +10, faith: -8, army: -4 },
      rightText: 'Interpreta il presagio', rightEffects: { faith: +12, people: -5 },
      minTurn: 2,
    },
    {
      id: 'duel_request', tags: ['army', 'power', 'faith'],
      speaker: 'Cavaliere rivale', speakerRole: 'Sfida personale',
      excludeChars: ['arya','sansa','melisandre','catelyn','margaery'],
      portrait: '⚔️', icon: '⚔️',
      text: "Un cavaliere di una casata rivale vi sfida a duello singolo per risolvere una disputa territoriale. Accettare è rischioso ma glorioso; rifiutare è prudente ma umiliante.",
      leftText: 'Rifiuta — manda un campione', leftEffects: { power: -8, army: -4 },
      rightText: 'Accetta il duello', rightEffects: { power: +2, people: +8, army: -8 },
      minTurn: 5,
    },
    {
      id: 'tax_exemption', tags: ['gold', 'people', 'power'],
      speaker: 'Rappresentanza nobiliare', speakerRole: 'Petizione dei signori',
      excludeChars: ['arya','tormund','bronn'],
      portrait: '📜', icon: '📜',
      text: "I grandi signori chiedono l'esenzione fiscale per i loro feudi, lamentando raccolti magri. Concederla vi farà guadagnare lealtà nobiliare; rifiutarla riempirà le casse ma creerà risentimento.",
      leftText: 'Rifiuta — tutti pagano', leftEffects: { gold: +12, power: -10 },
      rightText: "Concedi l'esenzione", rightEffects: { gold: -8, power: +3 },
      minTurn: 6,
    },
    {
      id: 'night_watch_deserter', tags: ['army', 'faith', 'power'],
      speaker: 'Lord Comandante del Muro', speakerRole: 'Richiesta urgente',
      excludeChars: ['tormund'],
      portrait: '❄️', icon: '❄️',
      text: "Un disertore dei Guardiani della Notte è stato catturato nelle vostre terre. La legge dice che deve morire. Ma ha portato con sé informazioni su ciò che si muove oltre il Muro.",
      leftText: 'Giustizialo secondo la legge', leftEffects: { faith: +10, power: +2 },
      rightText: 'Interroga e poi grazia', rightEffects: { army: +6, faith: -8, power: -5 },
      minTurn: 4,
    },

    // ══════════════════════════════════════════
    // ── NUOVE CARTE GENERICHE ──
    // ══════════════════════════════════════════
    // ══════════════════════════════════════════
    // ── INTRIGHI DI CORTE & SCANDALI ──
    // ══════════════════════════════════════════
    {
      id: 'court_whisper_scandal', tags: ['power', 'people', 'faith'],
      speaker: 'Dama di compagnia', speakerRole: 'Voce della corte',
      excludeChars: ['arya','tormund','ygritte'],
      portrait: '🌹', icon: '🌹',
      text: "Una voce circola nei corridoi del castello — uno scandalo che coinvolge un vostro rivale politico e una presenza notturna assai poco consona al suo rango. Potete soffiare sulla brace, oppure fingere di non aver sentito nulla.",
      leftText: 'Ignora — non ti sporcare', leftEffects: { faith: +10, people: +6 },
      rightText: 'Alimenta la voce con discrezione', rightEffects: { power: +2, people: -8, faith: -8 },
      minTurn: 4, rightTags: ['poison_intrigue'],
    },
    {
      id: 'court_noble_temptation', tags: ['gold', 'faith', 'power'],
      speaker: 'Nobile straniero', speakerRole: 'Ospite di passaggio',
      excludeChars: ['arya','tormund','ygritte','ned','catelyn'],
      portrait: '🕯️', icon: '🕯️',
      text: "Un nobile straniero di grande fascino e risorse è ospite a corte. La sua compagnia è gradita — forse troppo. Mantenerla potrebbe aprire porte preziose, ma certe porte, una volta aperte, non si richiudono.",
      leftText: 'Mantieni le distanze con grazia', leftEffects: { faith: +8, power: +2 },
      rightText: 'Coltiva questa frequentazione', rightEffects: { gold: +10, power: +3, people: +5, faith: -10 },
      minTurn: 3,
    },
    {
      id: 'court_servant_secret', tags: ['power', 'faith'],
      speaker: 'Servo fidato', speakerRole: 'Confessione notturna',
      excludeChars: ['arya','tormund'],
      portrait: '🪔', icon: '🪔',
      text: "Un servo di lungo corso vi confessa di aver assistito a qualcosa che non avrebbe dovuto vedere — qualcosa che riguarda un vostro alleato. Il segreto è un peso. Ma è anche un'arma.",
      leftText: 'Dimenticalo — la fedeltà vale di più', leftEffects: { faith: +10, people: +8, power: -5 },
      rightText: 'Conserva l\'informazione con cura', rightEffects: { power: +2, gold: +6, faith: -8 },
      minTurn: 5, rightTags: ['poison_intrigue'],
    },
    {
      id: 'court_marriage_intrigue', tags: ['gold', 'power', 'people'],
      speaker: 'Intermediario matrimoniale', speakerRole: 'Proposta riservata',
      excludeChars: ['arya','tormund','bronn','theon'],
      portrait: '💍', icon: '💍',
      text: "Un matrimonio tra due famiglie rivali è in trattativa — e la vostra benedizione o il vostro ostacolo potrebbero fare la differenza. Chi dei due sposi preferite vedere avvantaggiato?",
      leftText: 'Favorisci la famiglia più debole', leftEffects: { people: +12, faith: +8, gold: -6 },
      rightText: 'Favorisci chi ti offre di più', rightEffects: { gold: +12, power: +3, people: -8 },
      minTurn: 6, rightTags: ['royal_marriage'],
    },
    {
      id: 'court_night_visitor', tags: ['power', 'gold'],
      speaker: 'Agente di fiducia', speakerRole: 'Rapporto mattutino',
      excludeChars: ['arya','tormund','ned','catelyn','sansa'],
      portrait: '🌙', icon: '🌙',
      text: "Il vostro agente vi informa che un alto ufficiale ha ricevuto una visita notturna non registrata — e che l'ospite è partito prima dell'alba portando con sé qualcosa. Indagare potrebbe rivelare molto. O potrebbe aprire un vaso di Pandora.",
      leftText: 'Lascia perdere — fatti tuoi', leftEffects: { faith: +8, power: +2 },
      rightText: 'Fai indagare in silenzio', rightEffects: { power: +2, gold: +8, people: -6, faith: -6 },
      minTurn: 5, rightTags: ['poison_intrigue'],
    },

    {
      id: 'court_traitor_discovered', tags: ['power', 'faith', 'army'],
      speaker: 'Capitano della guardia', speakerRole: 'Rapporto urgente',
      excludeChars: ['arya','tormund'],
      portrait: '🔍', icon: '🔍',
      text: "Un membro fidato della vostra corte è stato scoperto a passare informazioni a una casata rivale. Giustiziarlo pubblicamente manda un messaggio forte. Farlo sparire in silenzio evita lo scandalo — ma chi lo sa già potrebbe parlare.",
      leftText: 'Giustizialo pubblicamente', leftEffects: { power: +2, faith: +8, people: -8 },
      rightText: 'Fallo sparire in silenzio', rightEffects: { power: +3, gold: -8, faith: -6 },
      minTurn: 6, rightTags: ['poison_intrigue'],
    },
    {
      id: 'winter_is_coming', tags: ['gold', 'people', 'army'],
      speaker: 'Maestro delle riserve', speakerRole: 'Avviso stagionale',
      portrait: '❄️', icon: '❄️',
      text: "I corvi dal Nord portano una notizia: l'inverno arriverà prima del previsto. Potete iniziare a fare scorte adesso — costoso ma prudente — oppure ignorare i segnali e sperare in un autunno lungo.",
      leftText: 'Accumula scorte subito', leftEffects: { gold: -10, people: +10, army: +5, faith: +5 },
      rightText: 'Aspetta — forse i segnali sono falsi', rightEffects: { gold: +10, power: +2, people: -8 },
      minTurn: 8,
    },
    {
      id: 'succession_crisis', tags: ['power', 'faith', 'people'],
      speaker: 'Consiglio ristretto', speakerRole: 'Questione di successione',
      excludeChars: ['arya','tormund','bronn','theon'],
      portrait: '👑', icon: '👑',
      text: "Un signore vicino è morto senza eredi chiari. Due pretendenti rivendicano il feudo. Sostenerne uno vi crea un alleato fedele — ma vi fa un nemico dell'altro. Rimanere neutrali vi mantiene fuori dai conflitti, ma perdete influenza.",
      leftText: 'Sostieni il pretendente più debole', leftEffects: { power: +3, people: +8, gold: -8 },
      rightText: 'Rimani neutrale e media', rightEffects: { faith: +10, power: +2, people: +5 },
      minTurn: 7,
    },
    {
      id: 'plague_outbreak', tags: ['people', 'faith', 'gold'],
      speaker: 'Maester del villaggio', speakerRole: 'Emergenza sanitaria',
      portrait: '🏥', icon: '🏥',
      text: "Una pestilenza ha colpito un villaggio dei vostri territori. Isolare l'area evita il contagio ma condanna chi è dentro. Inviare medici e risorse può salvare vite — ma se la malattia si diffonde, è catastrofe.",
      leftText: 'Isola il villaggio — proteggi il resto', leftEffects: { gold: +6, people: -12, faith: -8 },
      rightText: 'Invia medici e risorse', rightEffects: { people: +10, gold: -10, faith: +10, army: -5 },
      minTurn: 5,
    },
    {
      id: 'foreign_ambassador', tags: ['gold', 'power', 'faith'],
      speaker: 'Ambasciatore di Essos', speakerRole: 'Delegazione straniera',
      excludeChars: ['tormund','arya'],
      portrait: '🏛️', icon: '🏛️',
      text: "Un ambasciatore delle Città Libere propone un trattato commerciale esclusivo. L'accordo è ricco — ma richiede di ospitare permanentemente mercanti stranieri a corte. I nobili locali mormorano di influenza esterna.",
      leftText: 'Accetta con clausole restrittive', leftEffects: { gold: +10, power: +3, faith: -5 },
      rightText: 'Rifiuta — Westeros basta a se stessa', rightEffects: { power: +3, faith: +8, people: +5, gold: -5 },
      minTurn: 4,
    },
    {
      id: 'flood_disaster', tags: ['people', 'gold', 'army'],
      speaker: 'Lord dei Riverlands', speakerRole: 'Richiesta di soccorso',
      portrait: '🌊', icon: '🌊',
      text: "Le piogge torrenziali hanno distrutto tre villaggi lungo il Tridente. Le famiglie sono senza casa. Potete inviare truppe per aiutare nella ricostruzione — o mandare oro e non sprecare soldati.",
      leftText: 'Invia truppe a ricostruire', leftEffects: { army: -8, people: +14, faith: +8 },
      rightText: 'Manda oro e vai avanti', rightEffects: { gold: -10, people: +8, power: +3 },
      minTurn: 3,
    },
    {
      id: 'night_raid_border', tags: ['army', 'power', 'people'],
      speaker: 'Comandante di confine', speakerRole: 'Incidente notturno',
      portrait: '🌙', icon: '🌙',
      text: "Un gruppo armato senza bandiera ha attaccato un vostro avamposto di notte. Potrebbero essere banditi, o potrebbe essere una provocazione di una casata rivale sotto falsa bandiera. Come rispondete?",
      leftText: 'Rappresaglia immediata — mostra i muscoli', leftEffects: { army: -8, power: +3, people: -6 },
      rightText: 'Indaga prima di agire', rightEffects: { power: +3, faith: +8, gold: -5 },
      minTurn: 4,
    },
    {
      id: 'old_debt_recalled', tags: ['gold', 'power', 'people'],
      speaker: 'Emissario della Banca di Ferro', speakerRole: 'Riscossione del debito',
      excludeChars: ['tormund','arya','bronn'],
      portrait: '📜', icon: '📜',
      text: "La Banca di Ferro di Braavos vi informa che un vecchio debito di guerra è scaduto. Pagate ora con interessi altissimi. Oppure proponete un nuovo accordo — la Banca apprezza chi tratta da una posizione di forza.",
      leftText: 'Paga immediatamente — chiudi il debito', leftEffects: { gold: -10, power: +2, faith: +6 },
      rightText: 'Rinegozia con fermezza', rightEffects: { gold: -6, power: +3, people: +6 },
      minTurn: 10,
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
      rightText: 'Espandi gli Immacolati', rightEffects: { gold: -10, army: +14 },
      minTurn: 1,
    },
    {
      id: 'dany_dragons', tags: ['army', 'faith'], forChars: ['daenerys'],
      speaker: 'Missandei', speakerRole: 'Consigliera e traduttrice',
      portrait: '🐉', icon: '🐉',
      text: "I draghi crescono, Khaleesi. La gente li teme e li venera. Potete sfruttare questa paura per affermare la vostra legittimità, o nasconderli per rassicurare gli alleati.",
      leftText: 'Nascondi i draghi', leftEffects: { faith: +10, army: -5 },
      rightText: 'Mostra la loro potenza', rightEffects: { power: +2, people: -8, army: +10 },
      minTurn: 2,
    },
    {
      id: 'dany_slavery', tags: ['people', 'faith'], forChars: ['daenerys'],
      speaker: 'Schiavo liberato', speakerRole: 'Portavoce degli ex-schiavi',
      portrait: '⛓️', icon: '⛓️',
      text: "Gli ex-schiavi di Meereen chiedono terra e lavoro. Aiutarli vi renderà amatissima, ma i nobili locali si ribelleranno e le casse soffriranno.",
      leftText: 'Priorità alla stabilità', leftEffects: { gold: +10, people: -10 },
      rightText: 'Libera e ricompensa', rightEffects: { people: +14, gold: -10, faith: +8 },
      minTurn: 3,
    },
    {
      id: 'dany_dothraki', tags: ['army', 'people'], forChars: ['daenerys'],
      speaker: 'Jorah Mormont', speakerRole: 'Cavaliere e consigliere',
      portrait: '🐴', icon: '🐴',
      text: "Un khalasar di cinquemila Dothraki vi offre fedeltà, Khaleesi. Ma integrarli nell'esercito richiede risorse e potrebbe spaventare le casate di Westeros. Jorah avverte: «La vostra forza deve venire dalla vostra gente, non dalla paura.»",
      leftText: 'Rifiuta — costruisci consenso, non terrore', leftEffects: { people: +12, faith: +8, power: +2 },
      rightText: 'Accogli il khalasar', rightEffects: { army: +14, gold: -10, people: -8 },
      minTurn: 4,
    },
    {
      id: 'dany_king_offer', tags: ['power', 'army'], forChars: ['daenerys'],
      speaker: 'Tyrion Lannister', speakerRole: 'Consigliere della Regina',
      portrait: '🍷', icon: '🍷',
      text: "Tyrion vi consiglia di proporre un'alleanza al Re Reggente prima di attaccare. «Meno sangue, più legittimità.» Ma questo significherebbe riconoscere il suo trono.",
      leftText: 'Attacca senza trattare', leftEffects: { army: +5, power: -10 },
      rightText: 'Considera la diplomazia', rightEffects: { power: +2, army: -5 },
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
      text: "Sam ha trovato nei libri antichi le istruzioni per forgiare acciaio di drago. Serve investire molto oro, ma le armi contro i Non Morti potrebbero cambiare le sorti della guerra. Senza fondi, dovreste addestrare il doppio degli uomini.",
      leftText: "Addestra più uomini invece", leftEffects: { army: +10, people: +8, gold: -6 },
      rightText: 'Finanzia la ricerca sull\'acciaio', rightEffects: { gold: -10, army: +14, faith: +5 },
      minTurn: 5,
    },
    {
      id: 'jon_ned_honor', tags: ['faith', 'people'], forChars: ['jon'],
      speaker: 'Lady Lyanna Mormont', speakerRole: 'Lady di Orsorso',
      portrait: '🐻', icon: '🐻',
      text: "Lady Lyanna vi chiede di mantenere le tradizioni del Nord — niente compromessi con i Lannister, niente tradimenti. «Il Nord ricorda.» Ma questo isola il vostro territorio.",
      leftText: "Necessitò di pragmatismo", leftEffects: { power: +2, people: -8 },
      rightText: "L'onore prima di tutto", rightEffects: { faith: +14, people: +10, power: -5 },
      minTurn: 3,
    },
    {
      id: 'jon_lord_commanders', tags: ['power', 'army'], forChars: ['jon'],
      speaker: 'Alliser Thorne', speakerRole: 'Primo Ranger',
      portrait: '❄️', icon: '❄️',
      text: "Thorne sfida la vostra autorità davanti agli altri fratelli neri. Potete rispondergli con fermezza pubblica o ignorarlo per evitare una spaccatura nei ranghi.",
      leftText: 'Ignora la provocazione', leftEffects: { power: -8, army: +3 },
      rightText: 'Affronta il confronto', rightEffects: { power: +2, army: -5, people: +5 },
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
      rightText: "Prepara l'arsenale segreto", rightEffects: { army: +14, people: -14, gold: -10 },
      minTurn: 5,
    },
    {
      id: 'cersei_sparrows', tags: ['faith', 'power'], forChars: ['cersei'],
      speaker: 'Alto Septon', speakerRole: 'Capo della Fede dei Sette',
      portrait: '✝️', icon: '✝️',
      text: "Il Septon Supremo chiede che la Corona rispetti la legge dei Sette. Ha migliaia di fedeli armati. Cedergli potere potrebbe essere fatale nel lungo periodo.",
      leftText: 'Resisti alla Fede', leftEffects: { faith: -14, power: +2, army: -5 },
      rightText: 'Negozia con il Septon', rightEffects: { faith: +14, power: -12 },
      minTurn: 6,
    },
    {
      id: 'cersei_joffrey_advice', tags: ['people', 'power'], forChars: ['cersei'],
      speaker: 'Joffrey Baratheon', speakerRole: 'Erede al Trono',
      portrait: '👑', icon: '👑',
      text: "Joffrey vuole giustiziare pubblicamente un nobile che lo ha insultato. Farlo contenterebbe il Re, ma alienherebbe le altre casate. Fermarlo rischia uno scontro.",
      leftText: 'Ferma Joffrey', leftEffects: { power: -8, people: +10 },
      rightText: 'Lascia fare al Re', rightEffects: { power: +2, people: -14, faith: -5 },
      minTurn: 3,
    },
    {
      id: 'cersei_gold_debt', tags: ['gold', 'power'], forChars: ['cersei'],
      speaker: 'Tywin Lannister', speakerRole: 'Lettera da Castel Granito',
      portrait: '🦁', icon: '🦁',
      text: "Tywin scrive: «I Lannister pagano sempre i loro debiti. Saldare il debito con la Banca di Ferro consoliderà il trono. Rimandare è segno di debolezza.»",
      leftText: 'Rimanda il pagamento', leftEffects: { gold: +14, power: -10 },
      rightText: 'Salda il debito', rightEffects: { gold: -10, power: +2 },
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
      rightText: 'Cura la tua immagine pubblica', rightEffects: { people: +12, power: +3 },
      minTurn: 2,
    },
    {
      id: 'tyrion_knowledge', tags: ['power', 'gold'], forChars: ['tyrion'],
      speaker: 'Varys', speakerRole: 'Maestro dei Sussurri',
      portrait: '🕷', icon: '🕷',
      text: "Varys vi offre informazioni riservate su un complotto contro di voi. «Le conoscenze hanno un prezzo, Lord Tyrion. Ma l'ignoranza costa di più.»",
      leftText: 'Non mi fido di Varys', leftEffects: { power: -5 },
      rightText: 'Paga per le informazioni', rightEffects: { gold: -10, power: +2 },
      minTurn: 3,
    },
    {
      id: 'tyrion_speech', tags: ['people', 'power'], forChars: ['tyrion'],
      speaker: 'Cittadini di Approdo del Re', speakerRole: 'Delegazione popolare',
      portrait: '👥', icon: '👥',
      text: "Una delegazione di cittadini vi chiede udienza. Un vostro discorso pubblico potrebbe aumentare il favore popolare, ma i nobili vi accuseranno di demagogia.",
      leftText: 'Evita il discorso', leftEffects: { power: +2 },
      rightText: 'Parla al popolo', rightEffects: { people: +14, power: -8 },
      minTurn: 2,
    },
    {
      id: 'tyrion_sister', tags: ['power', 'faith'], forChars: ['tyrion'],
      speaker: 'Cersei Lannister', speakerRole: 'Tua sorella',
      portrait: '🦁', icon: '🦁',
      text: "Cersei vi convoca: «Stai diventando troppo popolare, fratellino. Ti conviene ricordare chi comanda davvero.» Sfidarla apertamente è rischioso ma necessario.",
      leftText: 'Cedi per ora', leftEffects: { power: -10, gold: +10 },
      rightText: 'Tienile testa', rightEffects: { power: +2, faith: -8, army: -5 },
      minTurn: 5,
    },
    {
      id: 'tyrion_courtesan_info', tags: ['gold', 'power'], forChars: ['tyrion'],
      speaker: 'Shae', speakerRole: 'Presenza discreta a corte',
      portrait: '🕯️', icon: '🕯️',
      text: "Una vostra conoscenza dai quartieri bassi vi porta notizie che circolano tra le ombre della corte — cose che le guardie non riferirebbero mai. Il prezzo del silenzio è discreto ma costante.",
      leftText: 'Ringrazia e mantieni la distanza', leftEffects: { power: +3, faith: +6 },
      rightText: 'Coltiva la fonte — vale ogni denaro', rightEffects: { gold: -8, power: +2, people: +6 },
      minTurn: 3,
    },
    {
      id: 'tyrion_lords_scandal', tags: ['power', 'people'], forChars: ['tyrion'],
      speaker: 'Bronn', speakerRole: 'Sempre ben informato',
      portrait: '🍷', icon: '🍷',
      text: "Bronn vi porta una storia succulenta: un alto lord ha trascorso la notte in compagnia assai poco raccomandabile — e qualcuno ne ha le prove. «Certe informazioni, milord, hanno un valore inestimabile.»",
      leftText: 'Non sporcarti le mani', leftEffects: { faith: +8, people: +5 },
      rightText: 'Usa le prove come leva', rightEffects: { power: +2, gold: +8, faith: -10 },
      minTurn: 4, rightTags: ['poison_intrigue'],
    },
    {
      id: 'tyrion_arranged_marriage', tags: ['gold', 'faith'], forChars: ['tyrion'],
      speaker: 'Tywin Lannister', speakerRole: 'Tuo padre',
      portrait: '🦁', icon: '🦁',
      text: "Vostro padre ha organizzato per voi un matrimonio con una nobildonna ricca e rispettabile. «È un accordo vantaggioso, non un sentimento.» Accettare rafforza le alleanze. Rifiutare vi mantiene liberi — ma a caro prezzo.",
      leftText: 'Rifiuta — conosci già il tuo cuore', leftEffects: { people: +8, faith: +6, gold: -10 },
      rightText: 'Accetta — il potere prima di tutto', rightEffects: { gold: +12, power: +3, people: -8 },
      minTurn: 6, rightTags: ['royal_marriage'],
    },
    {
      id: 'tyrion_pillow_secrets', tags: ['power', 'faith'], forChars: ['tyrion'],
      speaker: 'Varys', speakerRole: 'Maestro dei Sussurri',
      portrait: '🕷', icon: '🕷',
      text: "Varys sorride: «Sapete, Lord Tyrion, che le notti dei potenti raramente sono solitarie — e raramente silenziose.» Vi offre un dossier su un consigliere reale. Ciò che contiene potrebbe cambiare gli equilibri del Piccolo Consiglio.",
      leftText: 'Restituiscilo senza leggerlo', leftEffects: { faith: +10, power: -5 },
      rightText: 'Leggilo e conservalo', rightEffects: { power: +2, gold: +6, faith: -8 },
      minTurn: 7, rightTags: ['poison_intrigue'],
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
      leftText: 'La lista viene prima', leftEffects: { power: +2, people: -8 },
      rightText: 'Torna a Grande Inverno', rightEffects: { people: +12, faith: +8, power: -7 },
      minTurn: 6, rightTags: ['help_ally'],
    },
    // ARYA HIT LIST CARDS — one per target, triggers kill confirmation overlay
    {
      id: 'arya_kill_cersei', tags: ['power', 'army'], forChars: ['arya'],
      speaker: 'Cersei Lannister', speakerRole: 'Obiettivo: Sulla Lista',
      portrait: '🦁', icon: '🦁',
      text: "L'avete trovata. Cersei Lannister è sola, in un momento di vulnerabilità. Anni di addestramento si sono preparati per questo istante. Ma una voce dentro di voi ricorda: uccidere per vendetta vi consuma.",
      leftText: 'Non ancora — osserva e raccogli informazioni', leftEffects: { power: +3, gold: +6, faith: -5 },
      rightText: '⚔ Elimina Cersei Lannister', rightEffects: { power: +3, army: +5, faith: -8 },
      minTurn: 5, rightTags: ['assassination'], listTarget: 'cersei_l',
    },
    {
      id: 'arya_kill_walder', tags: ['faith', 'people'], forChars: ['arya'],
      speaker: 'Walder Frey', speakerRole: 'Obiettivo: Sulla Lista',
      portrait: '🌉', icon: '🌉',
      text: "Walder Frey banchetta nel suo castello sul Tridente, ignaro. Il sangue dei vostri cugini grida vendetta. Una maschera, un calice avvelenato — e il nome è depennato.",
      leftText: 'Non oggi — infiltrati prima tra i suoi', leftEffects: { power: +3, faith: +6, gold: +5 },
      rightText: '⚔ Elimina Walder Frey', rightEffects: { people: +10, faith: -7, power: +3 },
      minTurn: 3, rightTags: ['assassination', 'poison_intrigue'], listTarget: 'walder_f',
    },
    {
      id: 'arya_kill_meryn', tags: ['army', 'faith'], forChars: ['arya'],
      speaker: 'Meryn Trant', speakerRole: 'Obiettivo: Sulla Lista',
      portrait: '⚔️', icon: '⚔️',
      text: "Meryn Trant — il cavaliere che ha ucciso Syrio davanti ai vostri occhi. Lo avete trovato a Braavos. Potete colpire adesso, o seguirlo per scoprire i suoi complici e fare ancora più danno.",
      leftText: 'Seguilo — scopri i suoi complici', leftEffects: { army: +8, power: +3, faith: +5 },
      rightText: '⚔ Elimina Meryn Trant ora', rightEffects: { army: +8, faith: +5, people: -5 },
      minTurn: 2, rightTags: ['assassination'], listTarget: 'meryn_t',
    },
    {
      id: 'arya_kill_tywin', tags: ['power', 'gold'], forChars: ['arya'],
      speaker: 'Tywin Lannister', speakerRole: 'Obiettivo: Sulla Lista',
      portrait: '🦁', icon: '🦁',
      text: "Tywin Lannister — l'artefice della Rossa Nuziale. Lo avete trovato. Ma è circondato da guardie. Potete tentare comunque, oppure avvicinarvi alla sua cerchia per entrare nel castello senza rischi.",
      leftText: 'Infiltrati nel castello prima', leftEffects: { power: +3, gold: +8, army: +5 },
      rightText: '⚔ Elimina Tywin Lannister', rightEffects: { power: +2, gold: +8, faith: -10 },
      minTurn: 8, rightTags: ['assassination'], listTarget: 'tywin_l',
    },
    {
      id: 'arya_kill_polliver', tags: ['army', 'people'], forChars: ['arya'],
      speaker: 'Polliver', speakerRole: 'Obiettivo: Sulla Lista',
      portrait: '🗡️', icon: '🗡️',
      text: "Polliver — il soldato che ha preso Ago e ucciso Lommy. Lo avete incontrato in una locanda. Il momento è propizio. Ma fermarsi a raccogliere informazioni sui movimenti dell'esercito Lannister potrebbe valere di più.",
      leftText: 'Raccogli informazioni sull\'esercito', leftEffects: { army: +8, power: +3, people: +5 },
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
      rightText: 'Ascolta Davos', rightEffects: { people: +14, faith: -10, power: +2 },
      minTurn: 4,
    },
    {
      id: 'stannis_law', tags: ['power', 'faith'], forChars: ['stannis'],
      speaker: 'Maester Cressen', speakerRole: 'Consigliere reale',
      portrait: '📜', icon: '📜',
      text: "Un vostro vassallo ha violato la legge. La punizione giusta è severa — ma potrebbe alienare altri signori. Il diritto è il diritto.",
      leftText: "Clemenza politica", leftEffects: { power: -8, people: +8 },
      rightText: 'Applica la legge', rightEffects: { power: +2, faith: +8, people: -5 },
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
      leftText: 'Rifiuta la sua protezione', leftEffects: { gold: -8, power: +3 },
      rightText: 'Accetta il suo aiuto', rightEffects: { gold: +14, power: -12 },
      minTurn: 2,
    },
    {
      id: 'sansa_north_loyalty', tags: ['people', 'faith'], forChars: ['sansa'],
      speaker: 'Lady Lyanna Mormont', speakerRole: 'Lady di Orsorso',
      portrait: '🐻', icon: '🐻',
      text: "Lady Mormont vi chiede di dichiarare pubblicamente la vostra lealtà al Nord. Questo rafforzerà il popolo, ma vi renderà un bersaglio per le casate del Sud.",
      leftText: "Mantieni l'ambiguità", leftEffects: { power: +3 },
      rightText: "Dichiara fedeltà al Nord", rightEffects: { people: +14, faith: +8, power: -5 },
      minTurn: 3,
    },
    {
      id: 'sansa_bolton', tags: ['army', 'power'], forChars: ['sansa'],
      speaker: 'Servitore segreto', speakerRole: 'Messaggio cifrato',
      portrait: '🔐', icon: '🔐',
      text: "Un messaggio cifrato vi avvisa di un movimento dei Bolton. Potete mobilitare le forze leali degli Stark per un contrattacco, o attendere e raccogliere più informazioni.",
      leftText: 'Attendi e osserva', leftEffects: { power: +2 },
      rightText: 'Mobilitati subito', rightEffects: { army: +10, gold: -10, power: +3 },
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
      rightText: "Accetta l'accordo", rightEffects: { army: +14, people: -5, power: +2 },
      minTurn: 3,
    },
    {
      id: 'robb_tully_alliance', tags: ['army', 'power'], forChars: ['robb'],
      speaker: 'Zio Edmure Tully', speakerRole: 'Lord dei Riverlands',
      portrait: '🐟', icon: '🐟',
      text: "Edmure propone di rinforzare la difesa dei Riverlands con le truppe del Tridente. Forte ma costoso — e lascerebbe il Nord meno protetto.",
      leftText: 'Proteggi il Nord', leftEffects: { army: +5, people: +5 },
      rightText: 'Rinforza i Riverlands', rightEffects: { army: +14, gold: -10, people: -5 },
      minTurn: 2, rightTags: ['help_ally'],
    },
    {
      id: 'robb_king_north', tags: ['power', 'faith'], forChars: ['robb'],
      speaker: 'Signori del Nord', speakerRole: 'Consiglio di guerra nordico',
      portrait: '🐺', icon: '🐺',
      text: "I signori nordici si alzano in piedi: «Il Re del Nord! Il Re del Nord!» Accettare questo titolo vi darebbe immenso potere locale, ma vi renderebbe un obiettivo per il trono.",
      leftText: 'Declina il titolo per ora', leftEffects: { power: -5, people: -5 },
      rightText: 'Accetta la corona del Nord', rightEffects: { power: +2, people: +14, army: +8 },
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
      leftText: 'Il silenzio è la tua armatura', leftEffects: { power: +2 },
      rightText: 'Racconta la verità ad Aerys', rightEffects: { people: +14, faith: +8, power: -5 },
      minTurn: 2,
    },
    {
      id: 'jaime_cersei_orders', tags: ['power', 'army'], forChars: ['jaime'],
      speaker: 'Cersei Lannister', speakerRole: 'Tua sorella e Regina',
      portrait: '🦁', icon: '🦁',
      text: "Cersei vi ordina di compiere un atto che vi ripugna — attaccare civili innocenti per punire una casata ribelle. Obbedire rafforza la vostra posizione a corte.",
      leftText: "Rifiuta l'ordine", leftEffects: { faith: +14, people: +10, power: -14 },
      rightText: "Obbedisci a Cersei", rightEffects: { power: +2, people: -14, faith: -12 },
      minTurn: 4,
    },
    {
      id: 'jaime_brienne', tags: ['faith', 'army'], forChars: ['jaime'],
      speaker: 'Brienne di Tarth', speakerRole: "Cavaliere dell'ordine della spada",
      portrait: '🛡️', icon: '🛡️',
      text: "Brienne vi chiede di onorare un giuramento fatto a Lady Catelyn: proteggere le figlie Stark. Rispettarlo richiede risorse e rischia di mettervi contro i Lannister.",
      leftText: 'Il giuramento può aspettare', leftEffects: { faith: -12, power: +2 },
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
      rightText: 'Segui i consigli di nonna', rightEffects: { power: +2, people: +8 },
      minTurn: 2,
    },
    {
      id: 'margaery_poor_quarters', tags: ['people', 'faith'], forChars: ['margaery'],
      speaker: 'Septa Nysterica', speakerRole: 'Accompagnatrice di corte',
      portrait: '🌺', icon: '🌺',
      text: "Volete visitare i quartieri poveri di Approdo del Re, distribuire pane e carne. La gente vi adorerà, ma il Re potrebbe essere geloso della vostra popolarità.",
      leftText: 'Evita i confronti col Re', leftEffects: { power: +2 },
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
      rightText: 'Sono Theon Greyjoy', rightEffects: { power: +2, faith: +6, army: -5 },
      minTurn: 1,
    },
    {
      id: 'theon_iron_islands', tags: ['army', 'power'], forChars: ['theon'],
      speaker: 'Capitano della flotta Greyjoy', speakerRole: 'Ufficiale di marina',
      portrait: '⚓', icon: '⚓',
      text: "La flotta delle Isole di Ferro è disponibile se dimostrate di essere ancora Greyjoy. Comandarla richiede di tornare alle Isole. Ma potreste anche mandare un messaggero per negoziare supporto a distanza, senza esporre la vostra posizione.",
      leftText: 'Negozia supporto da lontano', leftEffects: { army: +8, gold: +8, power: +2 },
      rightText: 'Torna e rivendica la flotta', rightEffects: { army: +14, power: +2, gold: -10 },
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
      leftText: 'Accordo segreto con Varys', leftEffects: { power: +2, gold: -10 },
      rightText: 'Distruggi la sua reputazione', rightEffects: { power: +2, faith: -8 },
      minTurn: 3, rightTags: ['poison_intrigue'],
    },
    {
      id: 'lf_financial_web', tags: ['gold', 'power'], forChars: ['littlefinger'],
      speaker: 'Mercante di Lys', speakerRole: 'Partner commerciale segreto',
      portrait: '🪙', icon: '🪙',
      text: "Il vostro partner a Lys ha identificato un'opportunità: manipolare i mercati delle spezie prima dell'annuncio di una nuova tassa. Illegale, ma enormemente redditizio.",
      leftText: 'Troppo rischioso', leftEffects: { gold: +8 },
      rightText: "Sfrutta l'informazione", rightEffects: { gold: +14, power: +2, faith: -14 },
      minTurn: 2,
    },
    {
      id: 'lf_lady_of_court', tags: ['power', 'gold'], forChars: ['littlefinger'],
      speaker: 'Dama di corte anonima', speakerRole: 'Voce tra i cuscini',
      portrait: '🕯️', icon: '🕯️',
      text: "Una dama di corte — moglie di un lord rivale — vi fa capire che la sua discrezione ha un prezzo, e che in cambio potrebbe condividere certi segreti del marito. Il caos, come sempre, offre opportunità.",
      leftText: 'Declines con eleganza — troppo pericoloso', leftEffects: { faith: +8, people: +6 },
      rightText: 'Coltiva questa alleanza silenziosa', rightEffects: { power: +2, gold: +10, faith: -12 },
      minTurn: 3, rightTags: ['poison_intrigue'],
    },
    {
      id: 'lf_mockingbird_network', tags: ['power', 'people'], forChars: ['littlefinger'],
      speaker: 'Agente dei Bordelli', speakerRole: 'Informatore della rete',
      portrait: '🪙', icon: '🪙',
      text: "La vostra rete di case d'intrattenimento ad Approdo del Re è una miniera d'oro — non solo di monete, ma di segreti. Un nobile ha detto cose imprudenti. Potete usarle subito, oppure aspettare il momento più propizio.",
      leftText: 'Aspetta — il momento giusto vale di più', leftEffects: { power: +3, gold: +8 },
      rightText: 'Usa le informazioni adesso', rightEffects: { power: +2, people: -8, faith: -6 },
      minTurn: 2, rightTags: ['poison_intrigue'],
    },
    {
      id: 'lf_widow_lord', tags: ['gold', 'faith'], forChars: ['littlefinger'],
      speaker: 'Agente fidato', speakerRole: 'Rapporto riservato',
      portrait: '🪙', icon: '🪙',
      text: "Un lord anziano e molto ricco è vedovo da poco. La sua solitudine è nota a corte — e la sua fiducia è in vendita, se sapete come conquistarla. Un investimento di tempo e attenzione potrebbe rendere enormemente.",
      leftText: 'Non ti abbassare a questo', leftEffects: { faith: +10, power: +2 },
      rightText: 'Insinuati nella sua cerchia', rightEffects: { gold: +14, power: +3, faith: -10 },
      minTurn: 5,
    },
    {
      id: 'lf_queen_whisper', tags: ['power', 'faith'], forChars: ['littlefinger'],
      speaker: 'Cersei Lannister', speakerRole: 'Regina madre',
      portrait: '🦁', icon: '🦁',
      text: "Cersei vi convoca in privato — senza testimoni. «Ditocorto, ho bisogno di qualcuno che sappia tenere una cosa in silenzio.» Quello che vi chiede riguarda un segreto che vale più di qualsiasi trono.",
      leftText: 'Rifiuta — Cersei non si controlla', leftEffects: { power: +3, faith: +6, gold: -5 },
      rightText: 'Accetta e diventa indispensabile', rightEffects: { power: +2, gold: +10, people: -10 },
      minTurn: 6, rightTags: ['poison_intrigue'],
    },
    {
      id: 'lf_catspaw', tags: ['gold', 'power'], forChars: ['littlefinger'],
      speaker: 'Intermediario anonimo', speakerRole: 'Messaggio senza firma',
      portrait: '🪙', icon: '🪙',
      text: "Vi arriva un messaggio cifrato: qualcuno di alto rango vorrebbe che una certa persona scomparisse dalla scena — discreta sistemazione inclusa. Il compenso è straordinario. Il rischio, altrettanto.",
      leftText: 'Troppo esposto — declina', leftEffects: { faith: +8, gold: +6 },
      rightText: 'Organizza la faccenda con cura', rightEffects: { gold: +14, power: +3, faith: -12, army: -5 },
      minTurn: 8, rightTags: ['poison_intrigue', 'assassination'],
    },
    {
      id: 'lf_sansa_guardian', tags: ['people', 'power'], forChars: ['littlefinger'],
      speaker: 'Sansa Stark', speakerRole: 'Sotto la tua tutela',
      portrait: '🐺', icon: '🐺',
      text: "Sansa vi guarda con occhi che hanno imparato a non fidarsi di nessuno. Potreste usare la sua posizione per guadagni politici, oppure — per una volta — agire nel suo interesse senza secondi fini.",
      leftText: 'Proteggila davvero — nessun tornaconto', leftEffects: { people: +14, faith: +10, power: -6 },
      rightText: 'Usala come pedina diplomatica', rightEffects: { power: +2, gold: +8, people: -12 },
      minTurn: 4,
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
      rightText: 'Agisci sulla visione', rightEffects: { faith: +14, power: +2, army: -8 },
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
      id: 'oberyn_elia', tags: ['power', 'army'], forChars: ['oberyn'],
      speaker: 'Ellaria Sand', speakerRole: 'Compagna del Principe',
      portrait: '☀️', icon: '☀️',
      text: "Ellaria vi chiede di portare la guerra ai Lannister adesso, non domani. «Elia Martell. Ricordi il suo nome ogni giorno? Allora agisci.» Ma la guerra aperta ha costi enormi.",
      leftText: 'Pazienza strategica', leftEffects: { power: +2, army: +3 },
      rightText: 'Dichiara guerra ai Lannister', rightEffects: { army: +14, power: +2, people: -12 },
      minTurn: 3, rightTags: ['war_choice'],
    },
    {
      id: 'oberyn_dorne_army', tags: ['army', 'gold'], forChars: ['oberyn'],
      speaker: 'Capitano della guardia dorniana', speakerRole: 'Ufficiale di Dorne',
      portrait: '🏜️', icon: '🏜️',
      text: "L'esercito di Dorne è pronto, ma i rifornimenti scarseggiano. Potete razionare e mantenere la forza militare, o spendere oro per avere truppe ben equipaggiate.",
      leftText: 'Raziona i rifornimenti', leftEffects: { army: +5, people: -5 },
      rightText: 'Equipaggia al meglio', rightEffects: { army: +14, gold: -10 },
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
      rightText: "Accetta l'incarico", rightEffects: { power: +2, people: -8 },
      minTurn: 1,
    },
    {
      id: 'ned_cersei_secret', tags: ['power', 'faith'], forChars: ['ned'],
      speaker: 'Ditocorto', speakerRole: 'Lord Protettore oscuro',
      portrait: '🪙', icon: '🪙',
      text: "Avete scoperto il segreto di Cersei. Ditocorto vi avvisa: «Usate questa informazione con cautela, Lord Stark. Ad Approdo del Re l'onore è una debolezza.»",
      leftText: 'Affronta Cersei direttamente', leftEffects: { faith: +14, power: -14 },
      rightText: "Usa l'informazione con cautela", rightEffects: { power: +2, faith: -10 },
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
      leftText: 'Usalo come leva diplomatica', leftEffects: { power: +2, people: -5 },
      rightText: 'Processalo alla Valle', rightEffects: { faith: +8, power: -10, army: -8 },
      minTurn: 3,
    },
    {
      id: 'cat_children_safety', tags: ['people', 'faith'], forChars: ['catelyn'],
      speaker: 'Maester Luwin', speakerRole: 'Maester di Grande Inverno',
      portrait: '📚', icon: '📚',
      text: "Luwin vi informa che le rotte verso il Sud sono pericolose per i figli di Stark. Potete nasconderli in luoghi sicuri — costoso e politicamente debole — o mantenerli visibili.",
      leftText: 'Tienili visibili (simbolo)', leftEffects: { power: +3, people: +5 },
      rightText: 'Metti in sicurezza i figli', rightEffects: { people: +12, gold: -10 },
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
      leftText: 'Vai con Tyrion (meno oro)', leftEffects: { gold: +14, power: +3 },
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
      leftText: 'Troppo rischioso ora', leftEffects: { power: +2 },
      rightText: 'È il momento', rightEffects: { power: +2, faith: -14 },
      minTurn: 5, rightTags: ['poison_intrigue', 'assassination'],
    },
    {
      id: 'olenna_margaery', tags: ['people', 'power'], forChars: ['olenna'],
      speaker: 'Margaery Tyrell', speakerRole: 'Tua nipote',
      portrait: '🌹', icon: '🌹',
      text: "Margaery vi chiede consiglio sul Re. Guidarla bene potrebbe consolidare la posizione dei Tyrell, ma ogni mossa sbagliata potrebbe costarle — e costarvi — tutto.",
      leftText: 'Difendila ad ogni costo', leftEffects: { people: +12, gold: -10 },
      rightText: 'Sacrificala se necessario', rightEffects: { power: +2, people: -14 },
      minTurn: 4,
    },
    {
      id: 'olenna_lannister_deal', tags: ['gold', 'power'], forChars: ['olenna'],
      speaker: 'Tywin Lannister', speakerRole: 'Signore di Castel Granito',
      portrait: '🦁', icon: '🦁',
      text: "Tywin Lannister propone un accordo commerciale tra i Tyrell e i Lannister. Alle vostre condizioni sarebbe vantaggioso — ma rafforzare i Lannister potrebbe ritorcersi contro di voi.",
      leftText: 'Rifiuta — i Lannister non si fidano mai', leftEffects: { power: +3, faith: +8, gold: -5 },
      rightText: "Accetta alle tue condizioni", rightEffects: { gold: +14, power: +3, people: -8 },
      minTurn: 5,
    },
    {
      id: 'olenna_spy_network', tags: ['power', 'faith'], forChars: ['olenna'],
      speaker: 'Agente dei Tyrell', speakerRole: 'Informatore fidato',
      portrait: '🌹', icon: '🌹',
      text: "La vostra rete di spie ha scoperto che un alto nobile sta tramando contro Margaery. Potete usare questa informazione per ricattarlo, oppure rivelarne il tradimento pubblicamente e distruggerlo.",
      leftText: 'Ricattalo in segreto — diventa tuo debitore', leftEffects: { power: +2, gold: +10, faith: -8 },
      rightText: 'Rivelalo pubblicamente — esemplarità', rightEffects: { power: +3, people: +10, faith: +5, gold: -6 },
      minTurn: 6, rightTags: ['poison_intrigue'],
    },
    {
      id: 'olenna_smallfolk', tags: ['people', 'gold'], forChars: ['olenna'],
      speaker: 'Castellano di Altogarden', speakerRole: 'Amministratore del feudo',
      portrait: '🌾', icon: '🌾',
      text: "Un raccolto eccezionale ha riempito i granai di Altogarden. Potete vendere il surplus a prezzi alti — oppure donare al popolo e guadagnare un consenso che vale più dell'oro.",
      leftText: 'Vendi a prezzo pieno — il profitto viene prima', leftEffects: { gold: +14, people: -8, power: +2 },
      rightText: 'Dona al popolo — la loro fedeltà vale oro', rightEffects: { people: +14, faith: +8, gold: -5 },
      minTurn: 3,
    },
    {
      id: 'olenna_highgarden_court', tags: ['faith', 'power'], forChars: ['olenna'],
      speaker: 'Septa di corte', speakerRole: 'Consigliera spirituale',
      portrait: '⚜️', icon: '⚜️',
      text: "La Septa di corte chiede di ospitare ad Altogarden un grande concilio religioso. Porterebbe pellegrini — e oro — ma vi esporrebbe all'influenza della Fede Militante.",
      leftText: 'Rifiuta — la Fede non governa qui', leftEffects: { power: +3, people: +6, faith: -8 },
      rightText: 'Ospita il concilio — controlla la Fede dall\'interno', rightEffects: { faith: +12, people: +8, gold: +6, power: -8 },
      minTurn: 7,
    },

    // ══════════════════════════════════════════
    // ── EVENTI TORMUND ──
    // ══════════════════════════════════════════
    {
      id: 'tormund_beyond_wall', tags: ['army', 'people'], forChars: ['tormund'],
      speaker: 'Capo clan del Popolo Libero', speakerRole: 'Guerriero anziano',
      portrait: '🗿', icon: '🗿',
      text: "Un clan del Popolo Libero si è separato dal gruppo. Potete unirvi a loro — aumentando la forza — o eliminarli prima che diventino una minaccia interna.",
      leftText: 'Unisciti al clan', leftEffects: { army: +10, people: +5, gold: -6 },
      rightText: 'Elimina la minaccia interna', rightEffects: { army: +5, people: -12, faith: -8 },
      minTurn: 1,
    },
    {
      id: 'tormund_crow_deal', tags: ['power', 'army'], forChars: ['tormund'],
      speaker: 'Jon Snow', speakerRole: 'Lord Comandante dei Guardiani',
      portrait: '❄️', icon: '❄️',
      text: "Jon Snow vi offre di far passare il Popolo Libero attraverso il Muro in cambio di una tregua. I vostri guerrieri non si fidano dei Corvi Neri. Ma è l'unica via sicura.",
      leftText: 'Rifiuta i Corvi', leftEffects: { army: +5, people: +5 },
      rightText: 'Accetta la tregua con Jon', rightEffects: { army: +10, power: +3, people: -8 },
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
      leftText: 'Aspetta il momento giusto', leftEffects: { power: +2 },
      rightText: 'Colpisci adesso', rightEffects: { power: +3, army: +5, faith: -8 },
      minTurn: 3, rightTags: ['assassination'],
      maxUses: 3, // può uscire più volte
    },
    {
      id: 'arya_braavos_skill', tags: ['army', 'faith'], forChars: ['arya'],
      speaker: "Jaqen H'ghar", speakerRole: 'Maestro dei Molti Volti',
      portrait: '🎭', icon: '🎭',
      text: "«Una ragazza ha imparato bene. Un nome dalla lista può essere depennato.» Le vostre abilità vi permettono di eliminare un obiettivo senza lasciare tracce.",
      leftText: 'Non ancora pronta', leftEffects: { power: +3 },
      rightText: 'Depenna il nome', rightEffects: { power: +2, faith: -10, people: +4 },
      minTurn: 8, rightTags: ['assassination'],
    },

    // MARGAERY — carte royal_marriage aggiuntive
    {
      id: 'margaery_king_proposal', tags: ['power', 'people'], forChars: ['margaery'],
      speaker: 'Re Reggente', speakerRole: 'Messaggio reale sigillato',
      portrait: '💍', icon: '💍',
      text: "Il Re vi ha notata a corte. Il messaggio è chiaro: è interessato a un'unione. Accettare vi porterebbe al cuore del potere. Rifiutare potrebbe essere pericoloso.",
      leftText: 'Declina con grazia', leftEffects: { power: -5, faith: +8 },
      rightText: 'Accetta le nozze reali', rightEffects: { power: +2, people: +8, gold: +6 },
      minTurn: 3, rightTags: ['royal_marriage'],
    },
    {
      id: 'margaery_second_chance', tags: ['power', 'gold'], forChars: ['margaery'],
      speaker: 'Olenna Tyrell', speakerRole: 'La Regina delle Spine',
      portrait: '🌹', icon: '🌹',
      text: "Nonna Olenna ha orchestrato una nuova opportunità: un secondo incontro con il Re. «Questa volta, nipote mia, non lasciare che sfugga.»",
      leftText: "Non è il momento giusto", leftEffects: { gold: +5 },
      rightText: 'Conquista il Re', rightEffects: { power: +2, gold: +8, people: +5 },
      minTurn: 10, rightTags: ['royal_marriage'],
    },

    // STANNIS — carte war_victory aggiuntive
    {
      id: 'stannis_siege', tags: ['army', 'power'], forChars: ['stannis'],
      speaker: 'Ser Davos Seaworth', speakerRole: 'Mano del Re',
      portrait: '⚓', icon: '⚓',
      text: "Davos ha identificato un punto debole nelle difese nemiche. Un assedio rapido potrebbe concludersi con una vittoria decisiva. I rischi sono alti ma la ricompensa anche.",
      leftText: 'Troppo rischioso', leftEffects: { army: +5 },
      rightText: 'Lancia il siege', rightEffects: { army: -14, power: +2, gold: -10 },
      minTurn: 6, rightTags: ['war_victory'],
    },
    {
      id: 'stannis_battle_decisive', tags: ['army', 'faith'], forChars: ['stannis'],
      speaker: 'Melisandre', speakerRole: 'Sacerdotessa Rossa',
      portrait: '🔥', icon: '🔥',
      text: "«Le fiamme mostrano la vittoria, Maestà. R'hllor è con voi. Attaccate oggi e il nemico cadrà.» Melisandre è convinta. E di solito ha ragione.",
      leftText: "Aspetta condizioni migliori", leftEffects: { faith: +8 },
      rightText: "Attacca con il favore di R'hllor", rightEffects: { army: -12, faith: +10, power: +3 },
      minTurn: 12, rightTags: ['war_victory'],
    },

    // DAENERYS — carta war_victory specifica
    {
      id: 'dany_conquest', tags: ['army', 'power'], forChars: ['daenerys'],
      speaker: 'Grigio Verme', speakerRole: 'Comandante degli Immacolati',
      portrait: '🐉', icon: '🐉',
      text: "Gli Immacolati sono in posizione. I draghi sono pronti. «Khaleesi, la città è nostra se ordinate l'attacco. Un'altra casata nemica cadrà oggi.»",
      leftText: 'Aspetta ancora', leftEffects: { army: +5 },
      rightText: 'Dracarys — attacca!', rightEffects: { army: -14, power: +2, people: -8 },
      minTurn: 10, rightTags: ['war_victory'],
    },

    // ══════════════════════════════════════════
    // ── VISERYS TARGARYEN ──
    // ══════════════════════════════════════════
    {
      id: 'viserys_crown', tags: ['power', 'people'], forChars: ['viserys'],
      speaker: 'Illyrio Mopatis', speakerRole: 'Mercante di Pentos',
      portrait: '🪙', icon: '🪙',
      text: "Illyrio vi offre ospitalità e un piano per riconquistare il trono usando un esercito dothraki. In cambio vuole favori commerciali. La dipendenza è rischiosa ma le alternative sono poche.",
      leftText: 'Rifiuta — hai altri piani', leftEffects: { power: +2, gold: -4 },
      rightText: 'Accetta l\'ospitalità e il piano', rightEffects: { power: +3, gold: +8, army: +8, people: -8 },
      minTurn: 1,
    },
    {
      id: 'viserys_anger', tags: ['people', 'power'], forChars: ['viserys'],
      speaker: 'Daenerys Targaryen', speakerRole: 'Sorella',
      portrait: '🐉', icon: '🐉',
      text: "La vostra ira si è riversa sulla gente sbagliata ancora una volta. Daenerys vi avverte: «I Dothraki non si piegano alla paura, fratello. Serve rispetto, non urla.»",
      leftText: 'Il rispetto si prende, non si chiede', leftEffects: { power: +2, people: -10, army: -5 },
      rightText: 'Ascolta Daenerys — modifica il tuo approccio', rightEffects: { people: +10, power: -6, army: +5 },
      minTurn: 2,
    },
    {
      id: 'viserys_dothraki_deal', tags: ['army', 'gold'], forChars: ['viserys'],
      speaker: 'Khal Drogo', speakerRole: 'Khal dei Dothraki',
      portrait: '🐴', icon: '🐴',
      text: "Khal Drogo ha accettato di fornirvi un esercito in cambio della mano di Daenerys. È il piano che avete sempre avuto. Ma usare vostra sorella come merce ha un costo morale.",
      leftText: 'Non puoi vendere tua sorella', leftEffects: { faith: +10, power: -8 },
      rightText: 'È il prezzo del trono', rightEffects: { army: +14, power: +3, faith: -12, people: -6 },
      minTurn: 3,
    },
    {
      id: 'viserys_mendico_re', tags: ['power', 'faith'], forChars: ['viserys'],
      speaker: 'Nobile di Essos', speakerRole: 'Incontro di corte',
      portrait: '👑', icon: '👑',
      text: "Vi chiamano il Re Mendicante alle spalle. Il soprannome brucia, ma potete usarlo — la gente ama chi parte dal basso e risorge — oppure sopprimere chiunque lo pronunci.",
      leftText: 'Fai tacere chi ti deride', leftEffects: { power: +3, people: -8, gold: -6 },
      rightText: 'Abbraccia la storia — risorgerai', rightEffects: { people: +10, faith: +8, power: +2 },
      minTurn: 4,
    },
    {
      id: 'viserys_targaryen_legacy', tags: ['faith', 'power'], forChars: ['viserys'],
      speaker: 'Storico di Essos', speakerRole: 'Archivi di Pentos',
      portrait: '📜', icon: '📜',
      text: "Un antico studioso vi mostra prove che la profezia del Principe Promesso riguarda la vostra casata. Potete usare questa profezia per raccogliere fedeli, o tenerla segreta come vantaggio politico.",
      leftText: 'Tienila segreta — è un\'arma', leftEffects: { power: +2, gold: +4 },
      rightText: 'Annuncia la profezia — raduna i fedeli', rightEffects: { faith: +12, people: +8, power: +3, army: +5 },
      minTurn: 5,
    },

    // ══════════════════════════════════════════
    // ── RHAENYRA TARGARYEN ──
    // ══════════════════════════════════════════
    {
      id: 'rhaenyra_heir', tags: ['power', 'people'], forChars: ['rhaenyra'],
      speaker: 'Re Viserys I', speakerRole: 'Padre e Re',
      portrait: '👑', icon: '👑',
      text: "Vostro padre ha proclamato pubblicamente la vostra successione. I lord si inchinano — ma i loro occhi dicono altro. Dovete consolidare il consenso prima che la corte trami contro di voi.",
      leftText: 'La proclamazione basta', leftEffects: { power: +3 },
      rightText: 'Rafforza la posizione con oro e diplomazia', rightEffects: { gold: -10, power: +3, people: +10 },
      minTurn: 1,
    },
    {
      id: 'rhaenyra_dragon', tags: ['army', 'power'], forChars: ['rhaenyra'],
      speaker: 'Dragoniere', speakerRole: 'Dragonstone',
      portrait: '🐉', icon: '🐉',
      text: "Il vostro drago Syrax è cresciuto. Mostrarla pubblicamente intimidisce i nemici ma attira anche chi vuole rubare le uova rimaste. Usarla in combattimento riduce la paura — ma a rischio.",
      leftText: 'Tieni Syrax nascosta per ora', leftEffects: { power: +2 },
      rightText: 'Vola sopra la corte — dimostrazione di forza', rightEffects: { army: +10, power: +3, people: -6 },
      minTurn: 2,
    },
    {
      id: 'rhaenyra_greens_conflict', tags: ['power', 'faith'], forChars: ['rhaenyra'],
      speaker: 'Lord Lyonel Strong', speakerRole: 'Mano del Re',
      portrait: '🟢', icon: '🟢',
      text: "La fazione dei Verdi — guidata da Alicent Hightower — sta costruendo consenso contro di voi. Una mossa diplomatica potrebbe neutralizzarli. O potete aspettare che si espongano.",
      leftText: 'Aspetta — lascia che si scoprano', leftEffects: { power: +2 },
      rightText: 'Smantella la fazione con diplomazia', rightEffects: { gold: -10, power: +3, people: +8, faith: +6 },
      minTurn: 3,
    },
    {
      id: 'rhaenyra_sons_claim', tags: ['people', 'power'], forChars: ['rhaenyra'],
      speaker: 'Consigliere di fiducia', speakerRole: 'Questione di legittimità',
      portrait: '⚖️', icon: '⚖️',
      text: "I vostri figli vengono chiamati bastardi dalla fazione avversaria. La questione della legittimità mina la vostra posizione. Affrontarla apertamente è rischioso ma necessario.",
      leftText: 'Ignora le voci — sono diffamazione', leftEffects: { power: -6, faith: -5 },
      rightText: 'Affronta la questione pubblicamente', rightEffects: { people: +12, power: +3, gold: -8 },
      minTurn: 4,
    },
    {
      id: 'rhaenyra_dragonstone', tags: ['army', 'gold'], forChars: ['rhaenyra'],
      speaker: 'Ammiraglio della flotta', speakerRole: 'Porto di Dragonstone',
      portrait: '🏰', icon: '🏰',
      text: "Dragonstone è la vostra fortezza. Rafforzarla richiede risorse ingenti ma la renderebbe inespugnabile. Oppure potete investire in una rete diplomatica più ampia.",
      leftText: 'Rafforza Dragonstone', rightEffects2: {},
      leftEffects: { gold: -10, army: +10, power: +3 },
      rightText: 'Investi in diplomazia', rightEffects: { power: +3, people: +8, gold: -8 },
      minTurn: 5,
    },

    // ══════════════════════════════════════════
    // ── AEGON IL CONQUISTATORE ──
    // ══════════════════════════════════════════
    {
      id: 'aegon_balerion', tags: ['army', 'power'], forChars: ['aegon_t'],
      speaker: 'Orys Baratheon', speakerRole: 'Generale e fratellastro',
      portrait: '🐉', icon: '🐉',
      text: "Balerion il Terrore Nero è la vostra arma definitiva. Usarlo in battaglia risolve ogni scontro ma terrorizza anche i potenziali alleati. La conquista richiede equilibrio.",
      leftText: 'Riserva Balerion per il momento giusto', leftEffects: { army: +8, power: +2 },
      rightText: 'Scatena il Terrore Nero — fine immediata', rightEffects: { army: -8, power: +2, people: -10 },
      minTurn: 1, rightTags: ['war_victory'],
    },
    {
      id: 'aegon_seven_kingdoms', tags: ['power', 'people'], forChars: ['aegon_t'],
      speaker: 'Visenya Targaryen', speakerRole: 'Sorella e consigliera',
      portrait: '🐉', icon: '🐉',
      text: "Visenya vi consiglia: «Fuoco e sangue uniscono, Aegon. Ma è la diplomazia che mantiene unito un regno.» Rhaenys aggiunge: «I re si ricordano come hanno trattato i vinti.»",
      leftText: 'Fuoco e sangue — la conquista parla da sola', leftEffects: { army: +10, power: +3, people: -12 },
      rightText: 'La diplomazia costruisce ciò che il fuoco non può', rightEffects: { power: +3, people: +10, gold: -8 },
      minTurn: 2,
    },
    {
      id: 'aegon_faith_militant', tags: ['faith', 'power'], forChars: ['aegon_t'],
      speaker: 'Alto Septon', speakerRole: 'Grande Settone di Baelor',
      portrait: '⛪', icon: '⛪',
      text: "La Fede dei Sette si oppone al vostro matrimonio poligamo con le sorelle. Potete scontrarvi con la chiesa o fare concessioni per garantire la pace religiosa nel regno unificato.",
      leftText: 'Il Re non risponde alla Fede', leftEffects: { power: +3, faith: -12, people: -8 },
      rightText: 'Concedi privilegi alla Fede — pace religiosa', rightEffects: { faith: +12, people: +8, power: -6, gold: -8 },
      minTurn: 3,
    },
    {
      id: 'aegon_first_king', tags: ['power', 'people'], forChars: ['aegon_t'],
      speaker: 'Gran Maester', speakerRole: 'Archivi della Cittadella',
      portrait: '📜', icon: '📜',
      text: "Siete il primo Re dei Sette Regni unificati. Le casate che si sono arrese attendono di vedere come governerete. Ogni decisione ora stabilisce un precedente per secoli.",
      leftText: 'Governare con pugno di ferro', leftEffects: { power: +2, army: +5, people: -8, faith: -5 },
      rightText: "Costruire un'eredità di giustizia", rightEffects: { people: +12, faith: +8, power: +3, gold: -10 },
      minTurn: 4,
    },
    {
      id: 'aegon_dragonpit', tags: ['army', 'faith'], forChars: ['aegon_t'],
      speaker: 'Architetto reale', speakerRole: 'Progetto di Approdo del Re',
      portrait: '🏗️', icon: '🏗️',
      text: "Costruire il Dragonpit ad Approdo del Re darebbe ai draghi una casa permanente e simboleggerebbe il potere Targaryen per generazioni. Richiede un investimento enorme.",
      leftText: 'Posticipa — prima consolida il potere', leftEffects: { gold: +8, power: +2 },
      rightText: 'Costruisci il Dragonpit', rightEffects: { gold: -10, army: +8, faith: +8, power: +2 },
      minTurn: 6,
    },
    {
      id: 'oberyn_lannister_strike', tags: ['army', 'power'], forChars: ['oberyn'],
      speaker: 'Capitano della guardia dorniana', speakerRole: 'Rapporto dal campo',
      portrait: '🐍', icon: '🐍',
      text: "Le forze Lannister sono vulnerabili nel Westerlands. È l'occasione per cui avete aspettato. Una campagna rapida potrebbe sconfiggerli definitivamente.",
      leftText: 'Non ora', leftEffects: { army: +5 },
      rightText: 'Colpisci i Lannister', rightEffects: { army: -14, power: +2, people: -5 },
      minTurn: 8, rightTags: ['war_victory'],
    },

    // JAIME — carta help_ally aggiuntiva
    {
      id: 'jaime_riverlands_help', tags: ['army', 'people'], forChars: ['jaime'],
      speaker: 'Lord dei Riverlands', speakerRole: 'Richiesta urgente',
      portrait: '🛡️', icon: '🛡️',
      text: "Villaggi dei Riverlands bruciano. Un lord vi chiede protezione — non in nome dei Lannister, ma dell'innocente. È il momento di scegliere chi siete davvero.",
      leftText: 'Non è affar mio', leftEffects: { faith: -10 },
      rightText: 'Proteggi i civili', rightEffects: { people: +12, army: -8, faith: +8 },
      minTurn: 5, rightTags: ['help_ally'],
    },
    {
      id: 'jaime_oath_honor', tags: ['faith', 'people'], forChars: ['jaime'],
      speaker: 'Cavaliere senza padrone', speakerRole: 'Supplica',
      portrait: '⚔️', icon: '⚔️',
      text: "Un cavaliere senza padrone chiede il vostro aiuto per difendere la sua famiglia. Non c'è niente da guadagnarci — solo il peso dell'onore. O della vergogna.",
      leftText: 'Non posso permettermelo', leftEffects: { faith: -8 },
      rightText: 'Aiuta il cavaliere', rightEffects: { faith: +10, people: +8, gold: -10 },
      minTurn: 4, rightTags: ['help_ally'],
    },

    // NED — carta betray per rendere la condizione concretamente evitabile
    // (Ned ha già ned_cersei_secret che può portare a betray — aggiungiamo una trappola esplicita)
    {
      id: 'ned_littlefinger_trap', tags: ['power', 'faith'], forChars: ['ned'],
      speaker: 'Ditocorto', speakerRole: 'Consiglio avvelenato',
      portrait: '🪙', icon: '🪙',
      text: "Ditocorto vi propone di falsificare prove contro un nobile innocente per rafforzare la vostra posizione. «Solo questa volta, Lord Stark. Nessuno saprà mai.»",
      leftText: "Mai — l'onore prima di tutto", leftEffects: { power: -8, faith: +10 },
      rightText: "Accetta il compromesso", rightEffects: { power: +2, faith: -14 },
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
      rightText: 'Ritirati e scegli il momento', rightEffects: { army: -4, power: +2 },
      minTurn: 2,
    },
    {
      id: 'fighter_reputation', tags: ['people', 'power'], forChars: ['jaime','bronn','theon'],
      speaker: 'Bardo itinerante', speakerRole: 'Voce del popolo',
      portrait: '🎶', icon: '🎶',
      text: "Un bardo canta le vostre gesta nelle taverne. Incoraggiarlo costa oro — ma c'è chi dice che la reputazione di un guerriero dovrebbe parlare da sola, non essere comprata.",
      leftText: 'Lascia che le gesta parlino da sole', leftEffects: { army: +8, faith: +6, power: +2 },
      rightText: 'Paga il bardo — che canti forte', rightEffects: { gold: -8, people: +10, power: +3 },
      minTurn: 3,
    },
    {
      id: 'fighter_wound', tags: ['army', 'faith'], forChars: ['jaime','bronn','theon','arya'],
      speaker: 'Cerusico', speakerRole: 'Medico del campo',
      portrait: '🩹', icon: '🩹',
      text: "Una ferita di battaglia si è infettata. Curarla richiede riposo e risorse, ma ignorarla rischia di aggravarsi nel momento peggiore.",
      leftText: 'Combatti con la ferita', leftEffects: { army: -6, power: +2 },
      rightText: 'Curati e riposati', rightEffects: { army: +8, gold: -7, faith: +5 },
      minTurn: 4,
    },
    {
      id: 'fighter_local_lord', tags: ['gold', 'power'], forChars: ['jaime','bronn','theon'],
      speaker: 'Lord locale', speakerRole: 'Signore del feudo',
      portrait: '🏰', icon: '🏰',
      text: "Un lord locale vi offre ospitalità e oro in cambio di protezione per la stagione. Accettare vi lega a questo luogo — rifiutare e sfidarLo apertamente potrebbe guadagnarvi rispetto tra i soldati del territorio.",
      leftText: 'Rifiuta e tieniti le mani libere', leftEffects: { army: +8, people: +6, power: +2 },
      rightText: "Accetta l'accordo", rightEffects: { gold: +12, army: +5, power: -5 },
      minTurn: 2,
    },
    {
      id: 'bronn_arya_contact', tags: ['gold', 'army'], forChars: ['bronn','arya'],
      speaker: "Mercante d'armi", speakerRole: 'Commerciante itinerante',
      portrait: '🗡️', icon: '🗡️',
      text: "Un mercante offre armi di qualità a un prezzo onesto. Con attrezzatura migliore i vostri colpi saranno più letali. Potreste anche rubargli i piani di distribuzione e rivenderli.",
      leftText: 'Ruba i piani di distribuzione', leftEffects: { gold: +10, power: +3, faith: -8 },
      rightText: 'Acquista le armi onestamente', rightEffects: { gold: -9, army: +10 },
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
      rightText: 'Diffondi la voce', rightEffects: { power: +2, people: -6, faith: -5 },
      minTurn: 2,
    },
    {
      id: 'schemer_letter', tags: ['power', 'faith'], forChars: ['littlefinger','catelyn','sansa','ned'],
      speaker: 'Messaggero di fiducia', speakerRole: 'Lettera cifrata',
      portrait: '📜', icon: '📜',
      text: "Una lettera intercettata rivela i piani di un rivale. Potete usarla come leva diplomatica o farla recapitare al destinatario originale per guadagnarne la fiducia.",
      leftText: 'Usa la lettera come ricatto', leftEffects: { power: +2, faith: -8 },
      rightText: 'Consegna la lettera — gesto di buona fede', rightEffects: { power: -4, faith: +10, people: +6 },
      minTurn: 3,
    },
    {
      id: 'schemer_alliance_secret', tags: ['power', 'gold'], forChars: ['littlefinger','sansa','catelyn'],
      speaker: 'Agente segreto', speakerRole: 'Incontro in privato',
      portrait: '🤫', icon: '🤫',
      text: "Vi viene proposta un'alleanza segreta — non registrata, non dichiarata. Nessuno lo saprà. I benefici sono reali ma tradirla sarebbe devastante.",
      leftText: 'Rifiuta — le alleanze devono essere oneste', leftEffects: { faith: +8 },
      rightText: "Accetta l'accordo in segreto", rightEffects: { power: +2, gold: +6, faith: -5 },
      minTurn: 4,
    },
    {
      id: 'schemer_court_favor', tags: ['people', 'power'], forChars: ['littlefinger','sansa','catelyn','tyrion'],
      speaker: 'Nobile influente', speakerRole: 'Favore di corte',
      portrait: '🏛️', icon: '🏛️',
      text: "Un nobile influente ha bisogno di un favore discreto. Aiutarlo vi mette in debito con lui — ma crea un alleato potente nelle stanze del potere.",
      leftText: 'Declina — non voglio debiti', leftEffects: { power: -4 },
      rightText: 'Aiuta il nobile', rightEffects: { power: +2, gold: -8, people: +6 },
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
      leftText: 'Sermone moderato', leftEffects: { faith: +6, people: +5 },
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
      leftText: 'La fede non conosce dubbi', leftEffects: { faith: +7, people: -5 },
      rightText: 'Rifletti e ricalibra', rightEffects: { faith: -8, power: +3, people: +7 },
      minTurn: 5,
    },
    {
      id: 'mel_convert_lord', tags: ['faith', 'power'], forChars: ['melisandre'],
      speaker: 'Lord scettico', speakerRole: 'Udienza privata',
      portrait: '🕯️', icon: '🕯️',
      text: "Un lord potente è curioso di R'hllor ma non ancora convinto. Convertirlo porterebbe enormi benefici politici — ma fallire potrebbe costarvi un alleato.",
      leftText: 'Non forzare la conversione', leftEffects: { power: +2 },
      rightText: 'Tenta la conversione', rightEffects: { faith: +10, army: -5 },
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
      id: 'oberyn_poison_expertise', tags: ['army', 'power'], forChars: ['oberyn'],
      speaker: 'Ellaria Sand', speakerRole: 'Compagna e alleata',
      portrait: '🐍', icon: '🐍',
      text: "Le Sabbie del Serpente hanno preparato un veleno raro. Usarlo contro un comandante nemico indebolirebbe le sue truppe prima della battaglia. Morale e politica però potrebbero soffrirne.",
      leftText: 'Troppo disonorevole', leftEffects: { faith: +8 },
      rightText: 'Usa il veleno', rightEffects: { army: +11, power: +3, faith: -10 },
      minTurn: 3, rightTags: ['poison_intrigue'],
    },
    {
      id: 'oberyn_spear_training', tags: ['army', 'people'], forChars: ['oberyn'],
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
      rightText: 'Acquista i rifornimenti', rightEffects: { gold: -10, army: +8, people: +6 },
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
      rightText: 'Punisci la diserzione', rightEffects: { army: +7, people: -6 },
      minTurn: 3,
    },
    {
      id: 'universal_old_enemy', tags: ['power', 'faith'],
      speaker: 'Vecchio rivale', speakerRole: 'Incontro inaspettato',
      portrait: '👁️', icon: '👁️',
      text: "Un vecchio nemico vi incrocia in un momento inaspettato. Potete tentare una riconciliazione — rischiosa ma potenzialmente preziosa — o tenerlo a distanza.",
      leftText: 'Mantieni le distanze', leftEffects: { army: +3 },
      rightText: 'Tendi la mano della pace', rightEffects: { power: +3, people: +7 },
      minTurn: 5,
    },
    {
      id: 'universal_spy_caught', tags: ['power', 'army'],
      speaker: 'Guardia fidata', speakerRole: 'Arresto',
      portrait: '🔍', icon: '🔍',
      text: "Avete sorpreso qualcuno a spiarvi. Non sapete ancora per chi lavori. Potete interrogarlo — ottenendo informazioni preziose — o eliminarlo immediatamente.",
      leftText: 'Elimina la minaccia', leftEffects: { power: +2, faith: -5 },
      rightText: 'Interroga e sfrutta', rightEffects: { power: +3, army: +5, gold: -6 },
      minTurn: 4,
    },
    {
      id: 'universal_dream_omen', tags: ['faith', 'power'],
      speaker: 'Sogno', speakerRole: 'Visione notturna',
      portrait: '🌙', icon: '🌙',
      text: "Un sogno vivido vi sveglia nel cuore della notte. Interpretarlo come presagio positivo dà forza ai vostri uomini. Ignorarlo mantiene la razionalità.",
      leftText: 'Era solo un sogno', leftEffects: { power: +2 },
      rightText: "Annuncia l'omen ai tuoi", rightEffects: { faith: +11, people: +6, power: -4 },
      minTurn: 2,
    },

    // ══════════════════════════════════════════
    // ══════════════════════════════════════════
    // ── OTTO HIGHTOWER ──
    // ══════════════════════════════════════════
    {
      id: 'otto_hand', tags: ['power', 'gold'], forChars: ['otto'],
      speaker: 'Re Viserys I', speakerRole: 'Corte Reale — Grande Sala',
      portrait: '👑', icon: '👑',
      text: "Il Re vi ha nominato Mano. Il potere è nelle vostre mani — ma con esso arriva la responsabilità di ogni decisione sbagliata. Come intendete usare questa posizione?",
      leftText: 'Proteggere il Re sopra ogni cosa', leftEffects: { power: +2, faith: +6, gold: -6 },
      rightText: 'Proteggere Oldtown e i Hightower', rightEffects: { power: +3, gold: +8, people: -8 },
      minTurn: 1,
    },
    {
      id: 'otto_rhaenyra_threat', tags: ['power', 'people'], forChars: ['otto'],
      speaker: 'Consiglio privato', speakerRole: 'Riunione segreta',
      portrait: '🕯️', icon: '🕯️',
      text: "Rhaenyra è stata nominata erede ma non è accettata dai lord. Potete manovrare in segreto per delegittimarla — rischioso ma efficace — o agire apertamente nel Gran Consiglio.",
      leftText: 'Manovra in segreto', leftEffects: { power: +2, faith: -6 },
      rightText: 'Agisci nel Gran Consiglio', rightEffects: { power: +3, people: +8, gold: -8 },
      minTurn: 3,
    },
    {
      id: 'otto_alicent_marriage', tags: ['power', 'faith'], forChars: ['otto'],
      speaker: 'Gran Maester', speakerRole: 'Questione matrimoniale',
      portrait: '📜', icon: '📜',
      text: "Alicent è entrata nelle grazie del Re. Un matrimonio tra vostra figlia e Viserys I consoliderebbe il potere Hightower per generazioni — ma vi espone all'accusa di manipolazione.",
      leftText: 'Troppo rischioso — aspetta', leftEffects: { gold: +6, power: -4 },
      rightText: 'Organizza il matrimonio', rightEffects: { power: +2, faith: +8, people: -8 },
      minTurn: 4,
    },
    {
      id: 'otto_cittadella', tags: ['faith', 'gold'], forChars: ['otto'],
      speaker: 'Arcimestro della Cittadella', speakerRole: 'Oldtown',
      portrait: '📖', icon: '📖',
      text: "La Cittadella vi chiede supporto per ricerche costose. In cambio, i Maestri potrebbero favorire la vostra casata in questioni di legittimità e successione.",
      leftText: 'Non è il momento di spendere', leftEffects: { power: +2 },
      rightText: 'Finanzia la Cittadella', rightEffects: { gold: -10, faith: +12, power: +3 },
      minTurn: 5,
    },
    {
      id: 'otto_succession_plan', tags: ['power', 'people'], forChars: ['otto'],
      speaker: 'Consigliere fidato', speakerRole: 'Questione di successione',
      portrait: '⚖️', icon: '⚖️',
      text: "Il Re invecchia. La successione è incerta. Dovete preparare un piano — sostenere Rhaenyra e guadagnare la sua fiducia, o puntare su Aegon II e una fazione alternativa.",
      leftText: 'Sostieni Rhaenyra — pragmatismo', leftEffects: { power: +3, faith: +6 },
      rightText: 'Punta su Aegon II — il vero piano', rightEffects: { power: +3, gold: -8, people: -6 },
      minTurn: 6,
    },

    // ══════════════════════════════════════════
    // ── ALICENT HIGHTOWER ──
    // ══════════════════════════════════════════
    {
      id: 'alicent_queen', tags: ['power', 'people'], forChars: ['alicent'],
      speaker: 'Re Viserys I', speakerRole: 'Camera reale',
      portrait: '👑', icon: '👑',
      text: "Siete Regina. Ma Rhaenyra è ancora l'erede designata e i lord la rispettano. Ogni vostra mossa viene osservata e giudicata. Come costruite la vostra posizione?",
      leftText: 'Con pazienza e grazia', leftEffects: { faith: +10, people: +8, power: -4 },
      rightText: 'Con alleanze e oro', rightEffects: { power: +3, gold: -10, people: -5 },
      minTurn: 1,
    },
    {
      id: 'alicent_green_faction', tags: ['power', 'faith'], forChars: ['alicent'],
      speaker: 'Larys Strong', speakerRole: 'Consigliere dei Verdi',
      portrait: '🟢', icon: '🟢',
      text: "La fazione dei Verdi cresce attorno a voi. Larys Strong vi offre informazioni preziose — ma ha sempre un prezzo. Accettare il suo aiuto vi vincola a lui.",
      leftText: 'Non fidarti di Larys', leftEffects: { power: +2, faith: +6 },
      rightText: 'Usa Larys — le informazioni valgono', rightEffects: { power: +2, gold: -8, faith: -6 },
      minTurn: 2,
    },
    {
      id: 'alicent_faith_weapon', tags: ['faith', 'people'], forChars: ['alicent'],
      speaker: 'Alto Septon', speakerRole: 'Grande Settone di Baelor',
      portrait: '⛪', icon: '⛪',
      text: "L'Alto Septon è vostro alleato. La Fede può legittimare Aegon II come Re di diritto dei Sette Regni. Coinvolgere la chiesa nella politica è rischioso ma potente.",
      leftText: 'La Fede deve restare fuori dalla politica', leftEffects: { faith: +8, power: -6 },
      rightText: 'Usa la Fede come arma politica', rightEffects: { faith: +12, power: +2, people: +6, gold: -8 },
      minTurn: 3,
    },
    {
      id: 'alicent_rhaenyra_peace', tags: ['people', 'power'], forChars: ['alicent'],
      speaker: 'Rhaenyra Targaryen', speakerRole: 'Riunione privata',
      portrait: '🐉', icon: '🐉',
      text: "Rhaenyra vi chiede un incontro privato. Eravate amiche. Ora siete rivali. Potete cercare una pace — dolorosa ma possibile — oppure rifiutare e consolidare la frattura.",
      leftText: 'Rifiuta — la guerra è inevitabile', leftEffects: { power: +2, army: +5, people: -10 },
      rightText: 'Cerca la pace con Rhaenyra', rightEffects: { people: +12, faith: +8, power: -8 },
      minTurn: 4,
    },
    {
      id: 'alicent_aegon_crown', tags: ['power', 'army'], forChars: ['alicent'],
      speaker: 'Criston Cole', speakerRole: 'Comandante della Guardia Reale',
      portrait: '⚔️', icon: '⚔️',
      text: "Il Re è morente. Criston Cole vi informa che i Verdi sono pronti ad agire. Potete incoronare Aegon II prima che la notizia si diffonda — o aspettare e rischiare che Rhaenyra agisca prima.",
      leftText: 'Aspetta — non è ancora il momento', leftEffects: { power: -8, faith: +6 },
      rightText: 'Incoronalo subito — agisci ora', rightEffects: { power: +2, army: +8, people: -10, faith: -6 },
      minTurn: 6, rightTags: ['war_choice'],
    },

    // ── ROOSE BOLTON ──
    // ══════════════════════════════════════════
    {
      id: 'roose_flaying', tags: ['power', 'people'], forChars: ['roose'],
      speaker: 'Capitano delle guardie', speakerRole: 'Forte Terrore',
      portrait: '🩸', icon: '🩸',
      text: "Un signore minore ha osato resistere all'autorità di Casa Bolton. I vostri uomini chiedono il permesso di usare metodi... persuasivi. Il terrore mantiene l'ordine, ma a un costo.",
      leftText: 'Metodi tradizionali — troppo brutali', leftEffects: { people: +6, power: -8 },
      rightText: 'Scorticatelo — il terrore è ordine', rightEffects: { power: +2, people: -14, army: +5 },
      minTurn: 1,
    },
    {
      id: 'roose_stark_betrayal', tags: ['power', 'army'], forChars: ['roose'],
      speaker: 'Walder Frey', speakerRole: 'Signore di Castello dei Gemelli',
      portrait: '🌉', icon: '🌉',
      text: "Frey vi propone un accordo: tradire Robb Stark durante un banchetto. Il guadagno sarebbe enorme — ma un simile tradimento macchierà il nome Bolton per sempre.",
      leftText: 'Il tradimento ha un prezzo troppo alto', leftEffects: { power: -6, faith: +8 },
      rightText: 'Il Nord cadrà — il potere vale tutto', rightEffects: { power: +2, army: +8, faith: -14, people: -10 },
      minTurn: 5, rightTags: ['betray_ally', 'war_victory'],
    },
    {
      id: 'roose_north_control', tags: ['army', 'gold'], forChars: ['roose'],
      speaker: 'Mastro del castello', speakerRole: 'Forte Terrore',
      portrait: '🏰', icon: '🏰',
      text: "Il Nord è vasto e difficile da controllare. Potete istituire presidi armati in ogni villaggio — costoso ma efficace — oppure affidarvi alla reputazione di crudeltà che già vi precede.",
      leftText: 'La reputazione basta', leftEffects: { power: +3, people: -8 },
      rightText: 'Presidi in ogni villaggio', rightEffects: { gold: -10, army: -8, power: +2 },
      minTurn: 3,
    },
    {
      id: 'roose_ramsay_problem', tags: ['power', 'people'], forChars: ['roose'],
      speaker: 'Consigliere privato', speakerRole: 'Questione di famiglia',
      portrait: '😈', icon: '😈',
      text: "Vostro figlio Ramsay ha commesso un'altra atrocità — questa volta su un nobile ospite. Il popolo mormora, le casate si preoccupano. Dovete gestire la situazione.",
      leftText: 'Copri la cosa — è mio figlio', leftEffects: { gold: -8, power: -6, people: -6 },
      rightText: 'Punisci Ramsay pubblicamente', rightEffects: { people: +10, faith: +8, power: -10 },
      minTurn: 6,
    },
    {
      id: 'roose_guardian_north', tags: ['power', 'faith'], forChars: ['roose'],
      speaker: 'Araldo reale', speakerRole: 'Decreto della Corona',
      portrait: '📜', icon: '📜',
      text: "La Corona offre il titolo di Guardiano del Nord in cambio di lealtà e tributi. Accettare legittima il vostro potere ma vi vincola alla volontà del Re.",
      leftText: 'Il Nord non si inginocchia', leftEffects: { power: +3, army: +5, people: +5 },
      rightText: 'Accetta il titolo dalla Corona', rightEffects: { power: +2, gold: +10, army: -8 },
      minTurn: 4,
    },

    // ══════════════════════════════════════════
    // ── RAMSAY BOLTON ──
    // ══════════════════════════════════════════
    {
      id: 'ramsay_hunt', tags: ['army', 'people'], forChars: ['ramsay'],
      speaker: 'Capitano dei cani', speakerRole: 'Divertimento del Bastardo',
      portrait: '🐕', icon: '🐕',
      text: "Ramsay organizza una caccia all'uomo con i suoi cani. Il popolo vive nel terrore, ma i soldati lo temono e obbediscono ciecamente. La crudeltà ha i suoi usi.",
      leftText: 'Troppo — anche per me', leftEffects: { people: +8, power: -8 },
      rightText: 'Lascia scorrere i cani', rightEffects: { army: +10, people: -14, power: +3 },
      minTurn: 1,
    },
    {
      id: 'ramsay_reek', tags: ['power', 'army'], forChars: ['ramsay'],
      speaker: 'Prigioniero', speakerRole: 'Forte Terrore — Dungeon',
      portrait: '⛓️', icon: '⛓️',
      text: "Avete un prigioniero di valore. Potete spezzarlo psicologicamente e farne un'arma di obbedienza totale, oppure usarlo come merce di scambio diplomatica.",
      leftText: 'Usalo come leva diplomatica', leftEffects: { power: +2, gold: +8 },
      rightText: 'Spezzalo — diventerà il tuo strumento', rightEffects: { army: +8, power: +3, faith: -10, people: -8 },
      minTurn: 2,
    },
    {
      id: 'ramsay_bastard', tags: ['people', 'faith'], forChars: ['ramsay'],
      speaker: 'Septon locale', speakerRole: 'Questione di legittimità',
      portrait: '⚖️', icon: '⚖️',
      text: "La vostra nascita bastarda è ancora usata dai nemici per delegittimarvi. Potete comprare il riconoscimento legale — costoso — o eliminare chi solleva la questione.",
      leftText: 'Elimina chi dubita di te', leftEffects: { power: +3, people: -12, faith: -8 },
      rightText: 'Compra la legittimità legale', rightEffects: { gold: -10, power: +3, faith: +6 },
      minTurn: 3,
    },
    {
      id: 'ramsay_bolton_name', tags: ['power', 'people'], forChars: ['ramsay'],
      speaker: 'Roose Bolton', speakerRole: 'Lord Padre',
      portrait: '🩸', icon: '🩸',
      text: "Vostro padre vi offre il nome Bolton ufficialmente — ma in cambio chiede moderazione e una parvenza di controllo. Accettare porta legittimità. Rifiutare mantiene la libertà.",
      leftText: 'Rifiuta — sei abbastanza solo', leftEffects: { army: +8, power: -8 },
      rightText: 'Accetta il nome Bolton', rightEffects: { power: +2, people: +8, gold: +8, army: -5 },
      minTurn: 4,
    },
    {
      id: 'ramsay_terror_policy', tags: ['army', 'gold'], forChars: ['ramsay'],
      speaker: 'Capitano delle guardie', speakerRole: 'Rapporto militare',
      portrait: '⚔️', icon: '⚔️',
      text: "I soldati vi obbediscono per paura, non per fedeltà. Funziona — finché vinco. Un comandante propone di sostituire il terrore con la disciplina e la paga regolare.",
      leftText: 'La paura funziona — mantieni il terrore', leftEffects: { army: +8, people: -8 },
      rightText: 'Paga e disciplina le truppe', rightEffects: { gold: -10, army: +10, people: +5 },
      minTurn: 5,
    },

    // ══════════════════════════════════════════
    // ── YGRITTE ──
    // ══════════════════════════════════════════
    {
      id: 'ygritte_bow', tags: ['army', 'people'], forChars: ['ygritte'],
      speaker: 'Mance Rayder', speakerRole: 'Re Oltre il Muro',
      portrait: '🏹', icon: '🏹',
      text: "Mance chiede alle arciere del Popolo Libero di guidare l'avanguardia. Le vostre frecce possono fare la differenza, ma esporre le migliori guerriere è un rischio.",
      leftText: 'Proteggi le arciere — sono preziose', leftEffects: { army: +5, people: +8 },
      rightText: 'Guida l\'avanguardia', rightEffects: { army: +12, people: -8, power: +3 },
      minTurn: 1,
    },
    {
      id: 'ygritte_crow_love', tags: ['people', 'faith'], forChars: ['ygritte'],
      speaker: 'Jon Snow', speakerRole: 'Guardiano della Notte',
      portrait: '🐺', icon: '🐺',
      text: "Jon Snow è un nemico ma anche qualcosa di più. Potete usare questo legame per ottenere informazioni sui Guardiani della Notte, oppure rifiutare ogni forma di debolezza.",
      leftText: 'Il sentimento è una debolezza', leftEffects: { power: +3, people: -6 },
      rightText: 'Il legame può essere utile', rightEffects: { power: +2, people: +10, army: -5 },
      minTurn: 2,
    },
    {
      id: 'ygritte_cave', tags: ['faith', 'people'], forChars: ['ygritte'],
      speaker: 'Tormund', speakerRole: 'Guerriero del Popolo Libero',
      portrait: '🗿', icon: '🗿',
      text: "Il Popolo Libero si divide: alcuni vogliono attraversare il Muro con la forza, altri preferiscono negoziare. La vostra posizione influenzerà l'unità del gruppo.",
      leftText: 'Il Muro va abbattuto con la forza', leftEffects: { army: +10, people: -8, faith: +5 },
      rightText: 'La negoziazione salva vite', rightEffects: { people: +12, power: +3, army: -5 },
      minTurn: 3,
    },
    {
      id: 'ygritte_south_knowledge', tags: ['power', 'gold'], forChars: ['ygritte'],
      speaker: 'Esploratrice', speakerRole: 'Rapporto di ricognizione',
      portrait: '🗺️', icon: '🗺️',
      text: "Avete informazioni sui movimenti delle casate del Sud. Potete venderle a un intermediario per oro, usarle per costruire alleanze tattiche, oppure conservarle.",
      leftText: 'Vendi le informazioni', leftEffects: { gold: +12, power: -6 },
      rightText: 'Usa le informazioni diplomaticamente', rightEffects: { power: +3, people: +6, gold: -4 },
      minTurn: 4,
    },

    // ══════════════════════════════════════════
    // ── JORAH MORMONT ──
    // ══════════════════════════════════════════
    {
      id: 'jorah_exile_past', tags: ['faith', 'people'], forChars: ['jorah'],
      speaker: 'Mercante di schiavi', speakerRole: 'Passato vergognoso',
      portrait: '⛓️', icon: '⛓️',
      text: "Qualcuno ha scoperto che avete venduto schiavi in passato — il crimine che vi ha portato all'esilio. Potete pagare per far tacere la voce o affrontare la verità pubblicamente.",
      leftText: 'Paga per il silenzio', leftEffects: { gold: -10, power: +2 },
      rightText: 'Confessa e chiedi perdono', rightEffects: { faith: +12, people: +8, power: -10 },
      minTurn: 1,
    },
    {
      id: 'jorah_honor_redeem', tags: ['army', 'faith'], forChars: ['jorah'],
      speaker: 'Comandante alleato', speakerRole: 'Proposta di servizio',
      portrait: '🐻', icon: '🐻',
      text: "Un lord vi offre la possibilità di guidare le sue truppe in una campagna rischiosa. Riabilitarsi come comandante onorevole potrebbe restaurare la vostra reputazione.",
      leftText: 'Troppo rischioso per te ora', leftEffects: { power: +2 },
      rightText: 'Guida la campagna — redenzione sul campo', rightEffects: { army: +12, faith: +10, power: +3, gold: -8 },
      minTurn: 3,
    },
    {
      id: 'jorah_bear_island', tags: ['people', 'power'], forChars: ['jorah'],
      speaker: 'Lyanna Mormont', speakerRole: 'Lady di Orso Isola',
      portrait: '🐻', icon: '🐻',
      text: "Lyanna Mormont vi offre di riconciliarvi con Casa Mormont e tornare ad Orso Isola. Il prezzo è umiltà pubblica — ma la famiglia è ancora lì.",
      leftText: 'Orso Isola non fa per me ora', leftEffects: { power: +2 },
      rightText: 'Torna alla famiglia', rightEffects: { people: +12, faith: +8, power: +2, gold: +6 },
      minTurn: 5,
    },
    {
      id: 'jorah_greyscale', tags: ['army', 'faith'], forChars: ['jorah'],
      speaker: 'Medico di Essos', speakerRole: 'Diagnosi urgente',
      portrait: '🏥', icon: '🏥',
      text: "Un medico vi informa che state sviluppando i primi segni di Scagliapietra. La cura è dolorosa e costosa. Ignorarla potrebbe essere fatale a lungo termine.",
      leftText: 'Ignora — non hai tempo per questo', leftEffects: { army: -5, faith: -8 },
      rightText: 'Cura la malattia a qualunque costo', rightEffects: { gold: -10, faith: +12, army: +5 },
      minTurn: 8,
    },

    // ══════════════════════════════════════════
    // ── SANDOR CLEGANE ──
    // ══════════════════════════════════════════
    {
      id: 'sandor_fire_fear', tags: ['faith', 'army'], forChars: ['sandor'],
      speaker: 'Prete del fuoco', speakerRole: 'Predicatore di strada',
      portrait: '🔥', icon: '🔥',
      text: "Un predicatore di R'hllor predica il fuoco purificatore davanti alle vostre truppe. Il fuoco vi terrorizza — ma i soldati sembrano ispirati. Potete farlo smettere o lasciarlo parlare.",
      leftText: 'Fallo smettere — odi il fuoco', leftEffects: { faith: -8, army: -5, power: +2 },
      rightText: 'Lascialo parlare — morale alto', rightEffects: { faith: +10, army: +8, people: +5 },
      minTurn: 1,
    },
    {
      id: 'sandor_no_hero', tags: ['people', 'power'], forChars: ['sandor'],
      speaker: 'Arya Stark', speakerRole: 'Incontro inaspettato',
      portrait: '🗡️', icon: '🗡️',
      text: "Arya Stark vi incontra sul cammino. Potete usare l'incontro a vostro vantaggio — lei è preziosa — oppure lasciarla andare e guadagnare qualcosa di raro: rispetto.",
      leftText: 'Lasciala andare — non sei un mostro', leftEffects: { faith: +8, people: +10, power: -5 },
      rightText: 'Usala come leva', leftEffects2: {},
      rightEffects: { gold: +12, power: +3, faith: -10 },
      minTurn: 3,
    },
    {
      id: 'sandor_brother_monster', tags: ['power', 'army'], forChars: ['sandor'],
      speaker: 'Messagiero', speakerRole: 'Notizie da Grande Approdo',
      portrait: '💀', icon: '💀',
      text: "Ser Gregor Clegane — vostra fratello — è stato trasformato in qualcosa di orribile. C'è un modo per sfidarlo e togliersi un peso enorme, ma il rischio è mortale.",
      leftText: 'Evita lo scontro — per ora', leftEffects: { power: -5, army: +5 },
      rightText: 'Sfida il mostro — è il tuo destino', rightEffects: { power: +2, army: +8, faith: +8, people: +6 },
      minTurn: 6, rightTags: ['war_victory'],
    },
    {
      id: 'sandor_quiet_life', tags: ['gold', 'people'], forChars: ['sandor'],
      speaker: 'Contadino anziano', speakerRole: 'Villaggio sperduto',
      portrait: '🌾', icon: '🌾',
      text: "Un gruppo di contadini vi offre rifugio in cambio di protezione. Una vita tranquilla lontano dalla guerra. Potete accettare e ricaricare le forze, oppure continuare a combattere.",
      leftText: 'Continua a muoverti — niente riposo', leftEffects: { army: +5, power: +2 },
      rightText: 'Resta e proteggi il villaggio', rightEffects: { people: +12, gold: +8, faith: +8, army: -6 },
      minTurn: 4,
    },

    // ══════════════════════════════════════════
    // ── TYWIN LANNISTER ──
    // ══════════════════════════════════════════
    {
      id: 'tywin_gold_mines', tags: ['gold', 'power'], forChars: ['tywin'],
      speaker: 'Mastro delle Miniere', speakerRole: 'Rapporto da Castel Granito',
      portrait: '⛏️', icon: '⛏️',
      text: "Le miniere d'oro di Castel Granito rendono sempre meno. Il segreto è tenuto nascosto, ma prima o poi emergerà. Potete accelerare lo sfruttamento ora o investire in nuove vene.",
      leftText: 'Sfrutta al massimo — subito', leftEffects: { gold: +14, army: -6, people: -8 },
      rightText: 'Investi in nuove vene', rightEffects: { gold: -10, power: +3, gold2: +6 },
      minTurn: 1,
    },
    {
      id: 'tywin_legacy', tags: ['power', 'people'], forChars: ['tywin'],
      speaker: 'Gran Maester Pycelle', speakerRole: 'Corte Reale',
      portrait: '📜', icon: '📜',
      text: "Il Gran Maester vi ricorda che la grandezza di Casa Lannister dipende dall'eredità che lascerete. Ogni azione deve essere misurata in secoli, non in anni. Cosa farete oggi che durerà?",
      leftText: 'L\'immediato viene prima', leftEffects: { gold: +10, power: -6 },
      rightText: 'Costruisci per i posteri', rightEffects: { power: +3, people: +8, gold: -10 },
      minTurn: 3,
    },
    {
      id: 'tywin_children', tags: ['power', 'faith'], forChars: ['tywin'],
      speaker: 'Cersei Lannister', speakerRole: 'Figlia — Questione di famiglia',
      portrait: '🦁', icon: '🦁',
      text: "I vostri figli vi deludono continuamente. Cersei è imprevedibile, Jaime ha sprecato il suo talento, Tyrion è un imbarazzo. Ma il sangue Lannister scorre in loro. Come li gestite?",
      leftText: 'La famiglia viene prima di tutto', leftEffects: { people: +8, faith: +6, power: -8 },
      rightText: 'La Casa Lannister viene prima dei singoli', rightEffects: { power: +2, gold: +6, people: -10 },
      minTurn: 5,
    },
    {
      id: 'tywin_red_wedding', tags: ['army', 'power'], forChars: ['tywin'],
      speaker: 'Walder Frey', speakerRole: 'Messaggio cifrato',
      portrait: '🌉', icon: '🌉',
      text: "Frey propone di eliminare Robb Stark durante un banchetto nuziale. L'onore sarebbe distrutto per sempre — ma la guerra del Nord finirebbe in un solo colpo.",
      leftText: 'Troppo disonore — anche per un Lannister', leftEffects: { faith: +8, power: -8 },
      rightText: 'Un Lannister paga i suoi debiti — in sangue', rightEffects: { army: +10, power: +3, faith: -14, people: -10 },
      minTurn: 6, rightTags: ['betray_ally', 'war_victory'],
    },
    {
      id: 'tywin_iron_fist', tags: ['army', 'people'], forChars: ['tywin'],
      speaker: 'Comandante Lannister', speakerRole: 'Rapporto militare',
      portrait: '⚔️', icon: '⚔️',
      text: "Le truppe Lannister sono le più disciplinate dei Sette Regni. Ma mantenerle richiede risorse e durezza. Un generale propone di allentare la disciplina per risparmiare — errore fatale.",
      leftText: 'Allenta la disciplina — risparmia', leftEffects: { gold: +8, army: -8 },
      rightText: 'Mantieni il pugno di ferro', rightEffects: { gold: -8, army: +12, power: +3 },
      minTurn: 2,
    },

    // ══════════════════════════════════════════
    // ── BRIENNE DI TARTH ──
    // ══════════════════════════════════════════
    {
      id: 'brienne_oath_catelyn', tags: ['faith', 'people'], forChars: ['brienne'],
      speaker: 'Catelyn Tully', speakerRole: 'Ricordo del giuramento',
      portrait: '🐟', icon: '🐟',
      text: "Il vostro giuramento a Catelyn Stark vi vincolava alla protezione dei suoi figli. Sansa è viva ma lontana, Arya introvabile. Come onorate questo impegno?",
      leftText: 'Il giuramento è morto con lei', leftEffects: { power: +3, faith: -10 },
      rightText: 'Cerca Sansa — il giuramento vale ancora', rightEffects: { faith: +12, people: +10, army: -6 },
      minTurn: 1,
    },
    {
      id: 'brienne_woman_warrior', tags: ['people', 'power'], forChars: ['brienne'],
      speaker: 'Lord del Consiglio', speakerRole: 'Riunione dei signori',
      portrait: '⚖️', icon: '⚖️',
      text: "I lord vi deridono apertamente — una donna che combatte non è accettata nelle corti di Westeros. Potete ignorarli e continuare, oppure usare questa discriminazione come arma politica.",
      leftText: 'Ignora le voci — conta solo l\'azione', leftEffects: { army: +8, power: -6 },
      rightText: 'Usa il pregiudizio a tuo favore', rightEffects: { people: +12, power: +2, gold: -6 },
      minTurn: 2,
    },
    {
      id: 'brienne_jaime_bond', tags: ['faith', 'power'], forChars: ['brienne'],
      speaker: 'Jaime Lannister', speakerRole: 'Incontro inatteso',
      portrait: '⚔️', icon: '⚔️',
      text: "Jaime Lannister vi ha salvato la vita — e voi avete salvato la sua. Un legame strano lega due persone tanto diverse. Come usate questa connessione?",
      leftText: 'Il debito è saldato — niente di più', leftEffects: { power: +3 },
      rightText: 'L\'alleanza con Jaime può essere potente', rightEffects: { power: +3, army: +8, faith: +6, gold: -6 },
      minTurn: 4,
    },
    {
      id: 'brienne_peach', tags: ['people', 'gold'], forChars: ['brienne'],
      speaker: 'Contadino del Riverlands', speakerRole: 'Terre desolate dalla guerra',
      portrait: '🌾', icon: '🌾',
      text: "Attraversate terre devastate dalla guerra. La gente ha fame e paura. Potete condividere le vostre riserve — impoverendovi — oppure continuare la missione senza deviazioni.",
      leftText: 'La missione viene prima', leftEffects: { power: +2, army: +3 },
      rightText: 'Aiuta i civili — è ciò che si fa', rightEffects: { people: +14, faith: +10, gold: -10, army: -4 },
      minTurn: 3,
    },

    // ══════════════════════════════════════════
    // ── DAVOS SEAWORTH ──
    // ══════════════════════════════════════════
    {
      id: 'davos_onion_knight', tags: ['people', 'faith'], forChars: ['davos'],
      speaker: 'Pescatore del porto', speakerRole: 'Porto di Capo della Tempesta',
      portrait: '⚓', icon: '⚓',
      text: "La vostra origine umile vi rende amato dalla gente comune ma disprezzato dai nobili. Potete abbracciare questa identità — costruendo consenso popolare — o tentare di adattarvi alla nobiltà.",
      leftText: 'Sii chi sei — figlio del popolo', leftEffects: { people: +14, faith: +8, power: -8 },
      rightText: 'Adottare i modi nobili è necessario', rightEffects: { power: +2, gold: +6, people: -8 },
      minTurn: 1,
    },
    {
      id: 'davos_stannis_counsel', tags: ['power', 'faith'], forChars: ['davos'],
      speaker: 'Stannis Baratheon', speakerRole: 'Consigliere del Re',
      portrait: '🦌', icon: '🦌',
      text: "Stannis vuole bruciare un ostaggio innocente per soddisfare le profezie di Melisandre. Come suo consigliere più fidato, avete la possibilità di fermarlo — o lasciarlo fare.",
      leftText: 'Impediscilo — è sbagliato', leftEffects: { faith: +12, people: +8, power: -12 },
      rightText: 'Stannis ha il diritto di scegliere', rightEffects: { power: +2, army: +5, faith: -12, people: -8 },
      minTurn: 3,
    },
    {
      id: 'davos_smuggler_past', tags: ['gold', 'power'], forChars: ['davos'],
      speaker: 'Vecchio complice', speakerRole: 'Incontro dal passato',
      portrait: '🚢', icon: '🚢',
      text: "Un vecchio complice di contrabbando vi contatta. Ha una rete commerciale che potrebbe arricchirvi rapidamente — ma usarla significherebbe tornare alla vita illegale che avete abbandonato.",
      leftText: 'Rifiuta — hai lasciato quel mondo', leftEffects: { faith: +8, power: +2 },
      rightText: 'Una volta sola — per buona causa', rightEffects: { gold: +14, power: -8, faith: -8 },
      minTurn: 4,
    },
    {
      id: 'davos_shireen_teach', tags: ['faith', 'people'], forChars: ['davos'],
      speaker: 'Shireen Baratheon', speakerRole: 'Principessa di Capo della Tempesta',
      portrait: '📖', icon: '📖',
      text: "Shireen vi ha insegnato a leggere — e ora vi chiede di aiutarla a proteggere i bambini del castello da qualcosa di oscuro. Il vostro debito con lei è profondo.",
      leftText: 'Proteggi Shireen a qualunque costo', leftEffects: { faith: +12, people: +10, army: -6 },
      rightText: 'La guerra non aspetta i sentimenti', leftEffects2: {},
      rightEffects: { army: +8, power: +3, faith: -12, people: -10 },
      minTurn: 5,
    },

    // ══════════════════════════════════════════
    // ── CARTE DI GRUPPO — STARK ──
    // ══════════════════════════════════════════
    {
      id: 'stark_honor_test', tags: ['faith', 'power'], forChars: ['ned','robb','sansa','arya','jon'],
      speaker: 'Lord del Consiglio del Nord', speakerRole: 'Assemblea dei Signori',
      portrait: '🐺', icon: '🐺',
      text: "I lord del Nord vi chiedono di fare una scelta che mette a dura prova il vostro onore. Cedervi significherebbe deludere chi vi rispetta per i vostri principi — ma la scelta pragmatica è più conveniente.",
      leftText: 'Mantieni l\'onore degli Stark', leftEffects: { faith: +12, people: +8, power: -8 },
      rightText: 'Scegli il pragmatismo', rightEffects: { power: +2, gold: +6, faith: -10 },
      minTurn: 5,
    },
    {
      id: 'winterfell_memories', tags: ['people', 'faith'], forChars: ['ned','robb','sansa','arya','jon'],
      speaker: 'Maester Luwin', speakerRole: 'Ricordo di Grande Inverno',
      portrait: '❄️', icon: '❄️',
      text: "Un messaggio da Grande Inverno vi riporta alla mente i valori della vostra famiglia. L'onore Stark è un peso e un dono. Come portate questo fardello nelle vostre decisioni?",
      leftText: 'Il passato deve guidare il futuro', leftEffects: { faith: +10, people: +8, army: +3 },
      rightText: 'Il futuro non aspetta il passato', rightEffects: { power: +3, gold: +5, faith: -6 },
      minTurn: 8,
    },

    // ══════════════════════════════════════════
    // ── CARTE DI GRUPPO — LANNISTER ──
    // ══════════════════════════════════════════
    {
      id: 'lannister_debt_called', tags: ['gold', 'power'], forChars: ['cersei','tyrion','jaime','tywin'],
      speaker: 'Banchiere della Corona', speakerRole: 'Questione finanziaria',
      portrait: '🦁', icon: '🦁',
      text: "Un vecchio debito Lannister viene reclamato da un lord che aveva finanziato la casata anni fa. Pagare mantiene la reputazione. Rifiutare è rischioso ma i Lannister non amano cedere.",
      leftText: 'Paga il debito — onore della casata', leftEffects: { gold: -10, power: +3, faith: +4 },
      rightText: 'Rifiuta — che vengano a reclamarlo', rightEffects: { power: -8, gold: +6, army: +4 },
      minTurn: 6,
    },
    {
      id: 'lannister_mines_secret', tags: ['gold', 'power'], forChars: ['cersei','tyrion','jaime','tywin'],
      speaker: 'Maestro delle miniere', speakerRole: 'Rapporto riservato',
      portrait: '⛏️', icon: '⛏️',
      text: "Le miniere di Castel Granito rendono meno del dichiarato. La ricchezza Lannister è mito più che realtà. Potete mantenere il segreto — o usarlo politicamente prima che emerga da solo.",
      leftText: 'Mantieni il segreto ad ogni costo', leftEffects: { power: +3, gold: -5 },
      rightText: 'Usa il segreto come leva politica ora', rightEffects: { power: +3, gold: +8, faith: -8 },
      minTurn: 10,
    },

    // ══════════════════════════════════════════
    // ── CARTE DI GRUPPO — COMBATTENTI ──
    // ══════════════════════════════════════════
    {
      id: 'warrior_challenge', tags: ['army', 'power'], forChars: ['jaime','bronn','sandor','brienne','ramsay','roose','aegon_t'],
      speaker: 'Cavaliere sfidante', speakerRole: 'Sfida d\'onore',
      portrait: '⚔️', icon: '⚔️',
      text: "Un cavaliere famoso vi sfida a duello pubblicamente — la vostra reputazione militare è in gioco. Vincere rafforza il vostro prestigio. Rifiutare è vigliacco agli occhi di tutti. Farsi sostituire è astuto ma poco glorioso.",
      leftText: 'Accetta il duello personalmente', leftEffects: { army: +5, power: +2, people: +6 },
      rightText: 'Manda un campione al posto tuo', rightEffects: { power: -5, gold: -6, army: +5 },
      minTurn: 5,
    },
    {
      id: 'veterans_advice', tags: ['army', 'faith'], forChars: ['jaime','bronn','sandor','brienne','davos','tormund','jorah'],
      speaker: 'Veterano di mille battaglie', speakerRole: 'Consiglio militare',
      portrait: '🪖', icon: '🪖',
      text: "Un veterano delle guerre passate vi offre un consiglio tattico prezioso basato sulla sua esperienza. La sua saggezza potrebbe salvare vite in battaglia — o rivelarsi obsoleta contro tattiche moderne.",
      leftText: 'Applica il consiglio del veterano', leftEffects: { army: +10, faith: +5, gold: -4 },
      rightText: 'Le tattiche vecchie non servono più', rightEffects: { power: +2, army: -3 },
      minTurn: 4,
    },

    // ══════════════════════════════════════════
    // ── CARTE DI GRUPPO — ESILIO E REDENZIONE ──
    // ══════════════════════════════════════════
    {
      id: 'exile_return', tags: ['power', 'people'], forChars: ['jorah','theon','jaime','viserys','daenerys'],
      speaker: 'Messaggero del regno', speakerRole: 'Notizia da Westeros',
      portrait: '📜', icon: '📜',
      text: "Giungono voci dal vostro passato — chi avete lasciato indietro ricorda. C'è chi vi aspetta ancora, e chi non vi perdonerà mai. Come vi rapportate al vostro ritorno o alla vostra condizione?",
      leftText: 'Il passato è il passato — guarda avanti', leftEffects: { power: +3, gold: +4 },
      rightText: 'Cerca riconciliazione col passato', rightEffects: { people: +10, faith: +8, power: -5 },
      minTurn: 6,
    },
    {
      id: 'second_chance', tags: ['faith', 'people'], forChars: ['jorah','theon','jaime','sandor','davos'],
      speaker: 'Testimone del cambiamento', speakerRole: 'Incontro inaspettato',
      portrait: '🕊️', icon: '🕊️',
      text: "Qualcuno che avevate deluso in passato vi offre una seconda possibilità. Non la meritavate allora. Forse la meritate ora. Come rispondete a questa generosità inaspettata?",
      leftText: 'Accetta con gratitudine e umiltà', leftEffects: { faith: +12, people: +10, power: -4 },
      rightText: 'La gratitudine è debolezza — sfrutta l\'occasione', rightEffects: { power: +3, gold: +6, faith: -10 },
      minTurn: 8,
    },

    // ══════════════════════════════════════════
    // ── CARTE DI GRUPPO — TARGARYEN ──
    // ══════════════════════════════════════════
    {
      id: 'targaryen_lineage', tags: ['power', 'faith'], forChars: ['daenerys','viserys','rhaenyra','aegon_t'],
      speaker: 'Storico di corte', speakerRole: 'Archivi di Dragonstone',
      portrait: '🐉', icon: '🐉',
      text: "Le cronache ricordano che i Targaryen hanno governato i Sette Regni per trecento anni. Questo peso storico è sia un privilegio che una responsabilità. Come usate questa eredità?",
      leftText: 'L\'eredità è tutto — è legittimità', leftEffects: { power: +3, faith: +6, people: -5 },
      rightText: 'L\'eredità è un peso — costruisci il futuro', rightEffects: { people: +10, power: +2, faith: -4 },
      minTurn: 5,
    },
    {
      id: 'dragonlore', tags: ['faith', 'army'], forChars: ['daenerys','rhaenyra','aegon_t'],
      speaker: 'Dragoniere di Dragonstone', speakerRole: 'Sapere antico',
      portrait: '📚', icon: '📚',
      text: "Antichi testi rivelano che i draghi rispondono al sangue Targaryen — ma il legame richiede cura e comprensione profonda. Investire tempo nel drago indebolisce le operazioni politiche.",
      leftText: 'La politica viene prima dei draghi', leftEffects: { power: +3, gold: +4 },
      rightText: 'Approfondisci il legame col drago', rightEffects: { army: +12, faith: +8, gold: -8, power: -4 },
      minTurn: 4,
    },

    // ══════════════════════════════════════════
    // ── CARTE DI GRUPPO — HIGHTOWER ──
    // ══════════════════════════════════════════
    {
      id: 'citadel_influence', tags: ['faith', 'power', 'gold'], forChars: ['otto','alicent'],
      speaker: 'Arcimestro', speakerRole: 'Cittadella di Oldtown',
      portrait: '🏛️', icon: '🏛️',
      text: "La Cittadella vi riconosce come protettori del sapere. I Maestri possono essere strumenti preziosi — o ostacoli insidiosi. Come intendete gestire questo rapporto privilegiato?",
      leftText: 'Usali come strumenti politici', leftEffects: { power: +2, gold: -8, faith: +5 },
      rightText: 'Rispetta la loro autonomia — sono alleati non servi', rightEffects: { faith: +12, people: +6, power: -4 },
      minTurn: 5,
    },
    {
      id: 'oldtown_port', tags: ['gold', 'people'], forChars: ['otto','alicent'],
      speaker: 'Capitano del porto', speakerRole: 'Porto di Oldtown',
      portrait: '⚓', icon: '⚓',
      text: "Il porto di Oldtown è il più trafficato dei Sette Regni. Aumentare le tasse portuali riempirebbe le casse ma gli armatori protesterebbero. Abbassarle attirerebbe più commercio.",
      leftText: 'Aumenta le tasse portuali', leftEffects: { gold: +12, people: -8, power: -4 },
      rightText: 'Abbassa le tasse — attrai commercio', rightEffects: { gold: +6, people: +8, power: +2 },
      minTurn: 3,
    },

    // ══════════════════════════════════════════
    // ── NUOVE CARTE COMUNI ──
    // ══════════════════════════════════════════

    {
      id: 'broken_bridge', tags: ['gold', 'people'],
      speaker: 'Prefetto dei lavori', speakerRole: 'Rapporto infrastrutturale',
      portrait: '🌉', icon: '🌉',
      text: "Il ponte principale sul fiume è crollato dopo le piogge. I mercanti sono bloccati e il commercio soffre. Ripararlo costa oro ma ripristina la fiducia del popolo.",
      leftText: 'Posticipa — le casse sono scarse', leftEffects: { people: -8, gold: +4 },
      rightText: 'Ripara subito', rightEffects: { gold: -10, people: +10 },
      minTurn: 3,
    },
    {
      id: 'tournament_announcement', tags: ['people', 'power'],
      speaker: 'Araldo reale', speakerRole: 'Proclama del torneo',
      excludeChars: ['arya', 'tormund', 'melisandre'],
      portrait: '🏆', icon: '🏆',
      text: "Un grande torneo porterebbe cavalieri da tutto il regno. Il popolo ama gli spettacoli, ma organizzarlo è costoso e i cavalieri stranieri potrebbero spiare le vostre difese.",
      leftText: 'Troppo rischioso', leftEffects: { people: -5 },
      rightText: 'Indici il torneo', rightEffects: { gold: -10, people: +14, power: +3 },
      minTurn: 5,
    },
    {
      id: 'grain_shortage', tags: ['people', 'gold'],
      speaker: 'Steward dei granai', speakerRole: 'Rapporto sulle riserve',
      portrait: '🌾', icon: '🌾',
      text: "Le riserve di grano si stanno esaurendo prima del previsto. Potete acquistarne d'emergenza a prezzi gonfiati, o razionare e rischiare malcontento.",
      leftText: 'Raziona — il popolo capirà', leftEffects: { people: -10, gold: +6 },
      rightText: 'Compra grano d\'emergenza', rightEffects: { gold: -10, people: +8 },
      minTurn: 4,
    },
    {
      id: 'wandering_maester', tags: ['faith', 'gold'],
      speaker: 'Maester itinerante', speakerRole: 'Ospite inatteso',
      portrait: '📜', icon: '📜',
      text: "Un maester senza casa bussa alle vostre porte con antiche mappe e conoscenze rare. Assumerlo costa oro ma porta valore diplomatico e conoscenze preziose.",
      leftText: 'Congedalo', leftEffects: { faith: -4 },
      rightText: 'Assumi il maester', rightEffects: { gold: -10, power: +3, faith: +6 },
      minTurn: 6,
    },
    {
      id: 'border_dispute', tags: ['power', 'army'],
      speaker: 'Signore di confine', speakerRole: 'Disputa territoriale',
      excludeChars: ['arya', 'tormund', 'bronn'],
      portrait: '⚖️', icon: '⚖️',
      text: "Due signori minori si contendono un villaggio di confine. Entrambi chiedono il vostro intervento. Schierarsi porta fedeltà di uno ma inimicizia dell'altro.",
      leftText: 'Dai ragione al primo', leftEffects: { power: +3, people: -5 },
      rightText: 'Proponi una divisione equa', rightEffects: { power: +2, people: +8, gold: -6 },
      minTurn: 5,
    },
    {
      id: 'refugees_from_war', tags: ['people', 'gold'],
      speaker: 'Capitano della guardia', speakerRole: 'Alle porte della città',
      portrait: '🏚️', icon: '🏚️',
      text: "Migliaia di rifugiati fuggono dai conflitti nelle terre vicine. Accoglierli aumenta la manodopera ma pesa sulle riserve. Respingerli preserva l'ordine ma macchia la reputazione.",
      leftText: 'Chiudi i cancelli', leftEffects: { people: -8, gold: +5, faith: -6 },
      rightText: 'Apri le porte', rightEffects: { people: +10, gold: -10, army: +4 },
      minTurn: 7,
    },
    {
      id: 'young_knight_pledge', tags: ['army', 'power'],
      speaker: 'Ser sconosciuto', speakerRole: 'Cavaliere errante',
      excludeChars: ['arya', 'melisandre', 'littlefinger'],
      portrait: '⚔️', icon: '⚔️',
      text: "Un giovane cavaliere di nome sconosciuto chiede di servire sotto il vostro stendardo. Non ha casato né storia, ma il suo entusiasmo è evidente. Potrebbe essere una risorsa — o una spia.",
      leftText: 'Rifiuta — troppo rischioso', leftEffects: { power: -3 },
      rightText: 'Accettalo al servizio', rightEffects: { army: +8, power: +2, gold: -4 },
      minTurn: 4,
    },
    {
      id: 'pirate_raid', tags: ['gold', 'army'],
      speaker: 'Ammiraglio', speakerRole: 'Notizia dal porto',
      portrait: '⚓', icon: '⚓',
      text: "Pirati delle Isole di Ferro assaltano le navi mercantili lungo la costa. Potete rispondere con una flottiglia — costoso ma efficace — o pagare una protezione informale.",
      leftText: 'Paga la protezione', leftEffects: { gold: -10, people: +4 },
      rightText: 'Invia la flotta', rightEffects: { gold: -8, army: -6, power: +2 },
      minTurn: 6,
    },
    {
      id: 'ancient_prophecy', tags: ['faith', 'power'],
      speaker: 'Gran Maester', speakerRole: 'Archivi della Cittadella',
      portrait: '📖', icon: '📖',
      text: "Il Gran Maester ha trovato nei registri una profezia antica che sembra descrivere il vostro regno. Renderla pubblica ispirerà i fedeli ma attirerà anche fanatici pericolosi.",
      leftText: 'Tieni la profezia segreta', leftEffects: { power: +3 },
      rightText: 'Rendi la profezia pubblica', rightEffects: { faith: +12, people: +8, power: -6 },
      minTurn: 8,
    },
    {
      id: 'plague_doctor', tags: ['people', 'faith'],
      speaker: 'Medico della città', speakerRole: 'Rapporto sanitario',
      portrait: '🏥', icon: '🏥',
      text: "Un medico straniero offre una cura per la febbre che miete vittime nei quartieri poveri. I suoi metodi sono insoliti e la Fede li guarda con sospetto.",
      leftText: 'Vieta le cure — rispetta la Fede', leftEffects: { faith: +8, people: -10 },
      rightText: 'Autorizza le cure', rightEffects: { people: +12, faith: -8, gold: -6 },
      minTurn: 5,
    },
    {
      id: 'spy_network_expansion', tags: ['power', 'gold'],
      speaker: 'Varys', speakerRole: 'Maestro dei sussurri',
      excludeChars: ['arya', 'tormund', 'bronn', 'oberyn'],
      portrait: '🕷️', icon: '🕷️',
      text: "Varys propone di espandere la rete di informatori in tutte le casate. Costa molto ma ogni alleanza e ogni tradimento vi sarà noto in anticipo.",
      leftText: 'Troppo costoso', leftEffects: { power: -4 },
      rightText: 'Finanzia la rete', rightEffects: { gold: -10, power: +2 },
      minTurn: 9,
    },
    {
      id: 'winter_preparation', tags: ['gold', 'people'],
      speaker: 'Steward dei granai', speakerRole: 'Preparativi invernali',
      portrait: '❄️', icon: '❄️',
      text: "L'inverno si avvicina. Stoccare risorse ora è saggio ma impoverisce le casse. Rimandare i preparativi mantiene il flusso di oro ma rischia una crisi quando arriverà il gelo.",
      leftText: 'Rimanda — l\'inverno è lontano', leftEffects: { gold: +10, people: -6 },
      rightText: 'Prepara le riserve', rightEffects: { gold: -10, people: +10, army: +3 },
      minTurn: 6,
    },
    {
      id: 'foreign_ambassador', tags: ['power', 'gold'],
      speaker: 'Ambasciatore di Essos', speakerRole: 'Delegazione straniera',
      excludeChars: ['tormund', 'bronn'],
      portrait: '🌍', icon: '🌍',
      text: "Un ambasciatore delle città libere di Essos offre un accordo commerciale. In cambio vuole informazioni sulle casate del regno — informazioni che potrebbero finire nelle mani sbagliate.",
      leftText: 'Rifiuta l\'accordo', leftEffects: { power: -4 },
      rightText: 'Accetta l\'accordo', rightEffects: { gold: +12, power: +3, faith: -5 },
      minTurn: 8,
    },

    // ══════════════════════════════════════════
    // ── CARTE STAGIONI E INVERNO ──
    // ══════════════════════════════════════════
    {
      id: 'winter_is_coming_warning', tags: ['gold', 'army', 'people'],
      speaker: 'Mastro del castello', speakerRole: 'Rapporto sulle scorte',
      portrait: '❄️', icon: '❄️',
      text: "Le riserve di grano per l'inverno sono insufficienti. Potete acquistare scorte ora a caro prezzo oppure razionare i rifornimenti — il popolo soffrirà ma le casse reggeranno.",
      leftText: 'Raziona — le casse prima', leftEffects: { gold: +8, people: -12, faith: -5 },
      rightText: 'Compra scorte', rightEffects: { gold: -10, people: +10, faith: +5 },
      minTurn: 5,
    },
    {
      id: 'early_snow', tags: ['army', 'people'],
      speaker: 'Capitano della guardia', speakerRole: 'Rapporto meteorologico',
      portrait: '🌨️', icon: '🌨️',
      text: "Una neve precoce ha bloccato i passi di montagna. Le truppe stazionate al confine nord sono isolate. Potete inviare rifornimenti a caro prezzo oppure richiamarle prima che la situazione peggiori.",
      leftText: 'Invia rifornimenti', leftEffects: { gold: -10, army: +5 },
      rightText: 'Richiama le truppe', rightEffects: { army: -8, people: +5, gold: +4 },
      minTurn: 10,
    },
    {
      id: 'ice_harvest', tags: ['gold', 'people'],
      speaker: 'Mercante del porto', speakerRole: 'Opportunità commerciale',
      portrait: '🧊', icon: '🧊',
      text: "Il gelo ha permesso di raccogliere ghiaccio dal fiume in grandi quantità. I nobili del sud pagano profumatamente per il ghiaccio nei mesi caldi. Un commercio insolito ma redditizio.",
      leftText: 'Non perdere tempo con il ghiaccio', leftEffects: { power: +3 },
      rightText: 'Vendi il ghiaccio', rightEffects: { gold: +10, people: +6 },
      minTurn: 3,
    },
    {
      id: 'long_winter_toll', tags: ['people', 'faith', 'army'],
      speaker: 'Septon locale', speakerRole: 'Villaggio del Nord',
      portrait: '⛪', icon: '⛪',
      text: "Il lungo inverno ha devastato i villaggi del Nord. La gente chiede pane e preghiere. Potete aprire i granai di stato o lasciare che la Fede gestisca la crisi con le sue elemosine.",
      leftText: 'Apri i granai — è tuo dovere', leftEffects: { gold: -10, people: +14, faith: +5 },
      rightText: 'Lascia gestire la Fede', rightEffects: { faith: +10, people: +4, power: -5 },
      minTurn: 15, excludeChars: ['tormund'],
    },
    {
      id: 'spring_harvest', tags: ['gold', 'people'],
      speaker: 'Intendente delle terre', speakerRole: 'Rapporto agricolo',
      portrait: '🌾', icon: '🌾',
      text: "Il disgelo ha portato un raccolto abbondante — inaspettatamente, dopo anni di magro. Potete vendere il surplus ai mercanti del sud o distribuirlo ai contadini per consolidare il loro favore.",
      leftText: 'Vendi ai mercanti', leftEffects: { gold: +14, people: -5 },
      rightText: 'Distribuisci ai contadini', rightEffects: { people: +14, faith: +6, gold: -4 },
      minTurn: 8,
    },

    // ══════════════════════════════════════════
    // ── CARTE RELIGIONE E FEDE ──
    // ══════════════════════════════════════════
    {
      id: 'sept_construction', tags: ['faith', 'people', 'gold'],
      speaker: 'Alto Septon', speakerRole: 'Grande Settone',
      portrait: '⛪', icon: '⛪',
      text: "La Fede chiede fondi per costruire un nuovo Settone nella capitale. L'edificio rafforzerebbe la devozione popolare ma prosciugherebbe le casse — e la Fede vi sarà debitrice.",
      leftText: 'Rifiuta — le casse vengono prima', leftEffects: { faith: -8, gold: +4 },
      rightText: 'Finanzia il Settone', rightEffects: { gold: -10, faith: +14, people: +8 },
      minTurn: 5, excludeChars: ['tormund', 'bronn', 'ramsay'],
    },
    {
      id: 'heretic_preacher', tags: ['faith', 'people', 'power'],
      speaker: 'Comandante della guardia', speakerRole: 'Rapporto di ordine pubblico',
      portrait: '🔥', icon: '🔥',
      text: "Un predicatore eretico attira folle crescenti con messaggi contro l'autorità e la nobiltà. Sopprimerlo potrebbe creare un martire. Ignorarlo alimenta il disordine. Potete invece cooptarlo.",
      leftText: 'Fallo arrestare', leftEffects: { power: +3, people: -10, faith: -5 },
      rightText: 'Cooptalo — dagli una parrocchia', rightEffects: { faith: +8, people: +6, power: -4 },
      minTurn: 6, excludeChars: ['melisandre', 'tormund'],
    },
    {
      id: 'rhlor_missionaries', tags: ['faith', 'people'],
      speaker: 'Sacerdote del fuoco', speakerRole: 'Missione da Essos',
      portrait: '🔥', icon: '🔥',
      text: "Sacerdoti di R'hllor sono arrivati in città predicando il Signore della Luce. Alcuni guariscono i malati gratuitamente. Il popolo li ascolta. La Fede dei Sette protesta.",
      leftText: 'Caccia i predicatori stranieri', leftEffects: { faith: +8, people: -6 },
      rightText: 'Permetti loro di restare', rightEffects: { people: +10, faith: -8, power: +2 },
      minTurn: 7, excludeChars: ['melisandre', 'tormund', 'ramsay', 'roose'],
    },
    {
      id: 'pilgrimage_miracle', tags: ['faith', 'people', 'power'],
      speaker: 'Septon pellegrino', speakerRole: 'Notizia dal viaggio',
      portrait: '✝️', icon: '✝️',
      text: "Un miracolo è stato segnalato lungo la via del pellegrinaggio — un malato guarito, un morto resuscitato, i resoconti variano. Le folle convergono. Potete sfruttare l'evento o trattarlo con scetticismo pubblico.",
      leftText: 'Scetticismo pubblico — è superstizione', leftEffects: { faith: -6, power: +2 },
      rightText: 'Incoraggia il pellegrinaggio', rightEffects: { faith: +12, people: +8, gold: -6 },
      minTurn: 10, excludeChars: ['tormund', 'bronn', 'ramsay'],
    },

    // ══════════════════════════════════════════
    // ── CARTE ECONOMIA E COMMERCIO ──
    // ══════════════════════════════════════════
    {
      id: 'iron_bank_loan', tags: ['gold', 'power'],
      speaker: 'Rappresentante di Braavos', speakerRole: 'Banca di Ferro di Braavos',
      portrait: '🏦', icon: '🏦',
      text: "La Banca di Ferro offre un prestito generoso con tassi ragionevoli — per ora. Il denaro potrebbe cambiare le vostre sorti, ma i banchieri di Braavos non dimenticano mai i debitori.",
      leftText: 'Rifiuta — niente debiti con Braavos', leftEffects: { power: +2 },
      rightText: 'Accetta il prestito', rightEffects: { gold: +18, power: -6 },
      minTurn: 5, excludeChars: ['tormund', 'arya'],
    },
    {
      id: 'trade_route_disrupted', tags: ['gold', 'people', 'army'],
      speaker: 'Mercante del porto', speakerRole: 'Crisi commerciale',
      portrait: '🚢', icon: '🚢',
      text: "Pirati hanno interrotto la principale via commerciale marittima. I mercanti perdono profitti, i prezzi salgono, il popolo mormora. Potete inviare navi da guerra o negoziare con i pirati.",
      leftText: 'Manda navi da guerra', leftEffects: { army: -8, gold: +10, people: +5 },
      rightText: 'Negozia coi pirati — pagali', rightEffects: { gold: -10, people: +8, power: -5 },
      minTurn: 8, excludeChars: ['tormund'],
    },
    {
      id: 'silk_road_offer', tags: ['gold', 'power'],
      speaker: 'Mercante di Qarth', speakerRole: 'Delegazione commerciale',
      portrait: '🧵', icon: '🧵',
      text: "Un mercante di Qarth offre seta e spezie in cambio di ferro e legname. L'accordo è vantaggioso economicamente, ma stabilire relazioni con Essos potrebbe insospettire il Re Reggente.",
      leftText: 'Troppo rischioso politicamente', leftEffects: { power: +2 },
      rightText: 'Accetta l\'accordo', rightEffects: { gold: +12, power: -5, people: +4 },
      minTurn: 6, excludeChars: ['tormund', 'bronn', 'arya'],
    },
    {
      id: 'counterfeit_coin', tags: ['gold', 'faith', 'power'],
      speaker: 'Mastro della Moneta', speakerRole: 'Rapporto al Consiglio',
      portrait: '🪙', icon: '🪙',
      text: "Monete false circolano nel regno — il valore reale del tesoro è incerto. Potete avviare un'indagine costosa e pubblica, oppure svalutare silenziosamente la moneta per ammortizzare il danno.",
      leftText: 'Indaga pubblicamente', leftEffects: { gold: -10, faith: +8, power: -4 },
      rightText: 'Svaluta in silenzio', rightEffects: { gold: +6, faith: -8, power: -6, people: -5 },
      minTurn: 10, excludeChars: ['tormund', 'arya', 'bronn'],
    },
    {
      id: 'guild_strike', tags: ['people', 'gold', 'power'],
      speaker: 'Capogilda dei fabbri', speakerRole: 'Richiesta dei lavoratori',
      portrait: '⚒️', icon: '⚒️',
      text: "Le gilde dei fabbri e dei carpentieri hanno scioperato chiedendo condizioni di lavoro migliori. Le forniture militari rischiano di fermarsi. Potete cedere alle richieste o usare la forza per riprendere i lavori.",
      leftText: 'Cedi alle richieste — giusto', leftEffects: { gold: -10, people: +12, army: +3 },
      rightText: 'Usa la forza — lavorate!', rightEffects: { people: -10, army: +6, power: -5 },
      minTurn: 8, excludeChars: ['tormund', 'ramsay'],
    },

    // ══════════════════════════════════════════
    // ── CARTE INTRIGHI E POLITICA ──
    // ══════════════════════════════════════════
    {
      id: 'letter_intercepted', tags: ['power', 'army', 'faith'],
      speaker: 'Capo delle spie', speakerRole: 'Rapporto riservato',
      portrait: '📜', icon: '📜',
      text: "Le vostre spie hanno intercettato una lettera compromettente tra due casate che tramano contro di voi. Potete usarla come leva politica oppure rivelarla pubblicamente per distruggerne la reputazione.",
      leftText: 'Usa la lettera come leva privata', leftEffects: { power: +3, gold: -6 },
      rightText: 'Rivelala pubblicamente', rightEffects: { power: +3, faith: +6, people: +5 },
      minTurn: 8,
    },
    {
      id: 'false_prophecy', tags: ['faith', 'power', 'people'],
      speaker: 'Veggente di corte', speakerRole: 'Profezia urgente',
      portrait: '🔮', icon: '🔮',
      text: "Un veggente annuncia che una profezia parla di voi come salvatore del regno. Potete abbracciare la profezia per raccogliere fedeli — sapendo che è falsa — o smentirla con l'onestà.",
      leftText: 'Smentisci — è menzogna', leftEffects: { faith: +8, power: -6, people: -4 },
      rightText: 'Abbraccia la profezia', rightEffects: { faith: -5, power: +3, people: +8 },
      minTurn: 10, excludeChars: ['melisandre', 'ned', 'jon'],
    },
    {
      id: 'succession_crisis', tags: ['power', 'people', 'faith'],
      speaker: 'Gran Maester', speakerRole: 'Questione di successione',
      portrait: '📜', icon: '📜',
      text: "Una disputa sulla successione di un lord minore rischia di scatenare una guerra locale. Potete intervenire come arbitri — guadagnando influenza — oppure lasciare che si risolvano tra loro.",
      leftText: 'Non sono affari tuoi', leftEffects: { power: -4 },
      rightText: 'Intervieni come arbitro', rightEffects: { power: +2, gold: -8, faith: +4 },
      minTurn: 6,
    },
    {
      id: 'spy_double_agent', tags: ['power', 'army'],
      speaker: 'Capo delle spie', speakerRole: 'Operazione segreta',
      portrait: '🕵️', icon: '🕵️',
      text: "Una delle vostre spie vi offre di passare al nemico come doppio agente — fingendo di tradirvi per raccogliere informazioni. Il rischio è enorme ma le informazioni potrebbero valere oro.",
      leftText: 'Troppo rischioso', leftEffects: { power: +2 },
      rightText: 'Autorizza l\'operazione', rightEffects: { power: +3, army: +5, gold: -8 },
      minTurn: 12,
    },
    {
      id: 'marriage_proposal', tags: ['power', 'people', 'gold'],
      speaker: 'Messaggero nobiliare', speakerRole: 'Proposta matrimoniale',
      portrait: '💍', icon: '💍',
      text: "Un lord di buona famiglia propone un'alleanza matrimoniale con uno dei vostri. Le nozze rafforzerebbero i legami politici ma vincolerebbero la vostra autonomia decisionale.",
      leftText: 'Rifiuta elegantemente', leftEffects: { power: -5 },
      rightText: 'Accetta l\'alleanza matrimoniale', rightEffects: { power: +2, people: +6, gold: +8 },
      minTurn: 8, excludeChars: ['arya', 'tormund', 'ramsay'], rightTags: ['royal_marriage'],
    },
    {
      id: 'castellan_betrayal', tags: ['army', 'power', 'gold'],
      speaker: 'Guardia fedele', speakerRole: 'Scoperta urgente',
      portrait: '🗗', icon: '🏰',
      text: "Il castellano di un vostro avamposto ha iniziato a trattare segretamente con un'altra casata. Non ha ancora agito ma la rete è pronta. Potete arrestarlo ora — perdendo l'avamposto — o usarlo come esca.",
      leftText: 'Arrestalo subito', leftEffects: { army: -5, power: +3 },
      rightText: 'Usalo come esca', rightEffects: { power: +3, army: -3, gold: -6 },
      minTurn: 10,
    },

    // ══════════════════════════════════════════
    // ── CARTE MILITARI E GUERRA ──
    // ══════════════════════════════════════════
    {
      id: 'mercenary_company', tags: ['army', 'gold'],
      speaker: 'Capitano di ventura', speakerRole: 'Offerta di servizio',
      portrait: '⚔️', icon: '⚔️',
      text: "Una compagnia di mercenari — veterani delle Guerre delle Compagnie in Essos — offre i propri servizi. Costosi ma efficaci, combattono per chi paga. Niente lealtà, solo contratto.",
      leftText: 'Non fidarti dei mercenari', leftEffects: { power: +3 },
      rightText: 'Ingaggia la compagnia', rightEffects: { gold: -10, army: +14 },
      minTurn: 5,
    },
    {
      id: 'siege_engines', tags: ['army', 'gold', 'power'],
      speaker: 'Mastro ingegnere', speakerRole: 'Proposta militare',
      portrait: '🏗️', icon: '🏗️',
      text: "Un ingegnere di Volantis offre di costruire macchine d'assedio avanzate — trabucchi e catapulte. Richiede risorse e tempo, ma renderebbe le vostre campagne militari notevolmente più efficaci.",
      leftText: 'Non ora — troppo costoso', leftEffects: { gold: +4 },
      rightText: 'Costruisci le macchine', rightEffects: { gold: -10, army: +10, power: +2 },
      minTurn: 8, excludeChars: ['tormund', 'arya', 'littlefinger'],
    },
    {
      id: 'war_veterans_return', tags: ['army', 'people', 'faith'],
      speaker: 'Veterano di guerra', speakerRole: 'Ritorno dal fronte',
      portrait: '🪖', icon: '🪖',
      text: "Centinaia di veterani tornano dalle campagne — molti menomati, tutti segnati. Potete integrarli nell'esercito come comandanti esperti o sostenerli economicamente per guadagnare il favore popolare.",
      leftText: 'Integra nell\'esercito', leftEffects: { army: +10, gold: -6 },
      rightText: 'Sostienili economicamente', rightEffects: { people: +12, faith: +6, gold: -10 },
      minTurn: 12,
    },
    {
      id: 'night_raid', tags: ['army', 'power'],
      speaker: 'Capitano della guarnigione', speakerRole: 'Rapporto notturno',
      portrait: '🌙', icon: '🌙',
      text: "Un gruppo di razziatori ha attaccato un villaggio di confine stanotte. Potete punire esemplarmente i responsabili per mostrare forza, oppure rinforzare i confini preventivamente.",
      leftText: 'Punizione esemplare', leftEffects: { army: -5, power: +3, people: -5 },
      rightText: 'Rinforza i confini', rightEffects: { army: +5, gold: -8, power: +2 },
      minTurn: 5,
    },
    {
      id: 'deserters_mass', tags: ['army', 'faith', 'power'],
      speaker: 'Sergente di battaglione', speakerRole: 'Rapporto urgente',
      portrait: '⚠️', icon: '⚠️',
      text: "Cinquanta soldati sono fuggiti nella notte. Il morale è basso. Potete eseguire una punizione pubblica per scoraggiare altri — brutale ma efficace — o affrontare le cause del malessere.",
      leftText: 'Punizione pubblica — disciplina', leftEffects: { army: -5, power: +3, people: -8 },
      rightText: 'Indaga e migliora le condizioni', rightEffects: { army: +5, people: +8, gold: -8 },
      minTurn: 7,
    },

    // ══════════════════════════════════════════
    // ── CARTE NATURA E EVENTI STRAORDINARI ──
    // ══════════════════════════════════════════
    {
      id: 'great_storm', tags: ['gold', 'army', 'people'],
      speaker: 'Ammiraglio della flotta', speakerRole: 'Disastro marittimo',
      portrait: '⛈️', icon: '⛈️',
      text: "Una tempesta violentissima ha distrutto parte della flotta e allagato i magazzini costieri. I danni sono ingenti. Ricostruire richiederà oro — ma mostrare prontezza guadagna rispetto.",
      leftText: 'Ricostruisci rapidamente', leftEffects: { gold: -10, army: +5, power: +3, people: +5 },
      rightText: 'Rimanda — le casse non reggono', leftEffects2: {},
      rightEffects: { gold: +4, army: -8, people: -8 },
      minTurn: 8,
    },
    {
      id: 'volcano_omen', tags: ['faith', 'people', 'power'],
      speaker: 'Arcimestro della Cittadella', speakerRole: 'Fenomeno naturale',
      portrait: '🌋', icon: '🌋',
      text: "Un vulcano a Valyria ha ripreso attività — le ceneri hanno oscurato il cielo per giorni. La gente interpreta l'evento come presagio. Potete rassicurare o alimentare la paura per i vostri scopi.",
      leftText: 'Rassicura il popolo', leftEffects: { faith: +6, people: +8, power: -4 },
      rightText: 'Alimenta il timore — le profezie ti favoriscono', rightEffects: { power: +2, faith: -8, people: -6 },
      minTurn: 10, excludeChars: ['ned', 'jon', 'sansa'],
    },
    {
      id: 'comet_sighting', tags: ['faith', 'power', 'people'],
      speaker: 'Astrologo reale', speakerRole: 'Osservazione celeste',
      portrait: '☄️', icon: '☄️',
      text: "Una cometa rossa ha attraversato i cieli per tre notti. Tutti la interpretano diversamente — draghi, sangue, guerra, fortuna. Potete dichiarare ufficialmente il suo significato.",
      leftText: 'Presagio di gloria — il cielo vi sostiene', leftEffects: { power: +2, faith: +6, people: +4 },
      rightText: 'Ignora le superstizioni', leftEffects2: {},
      rightEffects: { power: -4, faith: -4, people: +4 },
      minTurn: 5,
    },
    {
      id: 'great_hunt', tags: ['people', 'gold', 'army'],
      speaker: 'Mastro della caccia', speakerRole: 'Evento reale',
      portrait: '🦌', icon: '🦌',
      text: "Organizzare una grande caccia reale può rafforzare i legami con i lord locali e mostrare potere. Ma toglie truppe dalla guardia e richiede denaro. Potete anche rifiutare — meno spettacolo, più pratica.",
      leftText: 'Salta la caccia — troppo dispendioso', leftEffects: { gold: +4 },
      rightText: 'Organizza la grande caccia', rightEffects: { gold: -10, people: +8, power: +3, army: -4 },
      minTurn: 6, excludeChars: ['arya', 'tormund', 'melisandre'],
    },
    {
      id: 'plague_outbreak', tags: ['people', 'faith', 'gold'],
      speaker: 'Maestro Citadel', speakerRole: 'Emergenza sanitaria',
      portrait: '💀', icon: '💀',
      text: "Una malattia si sta diffondendo nei quartieri bassi della città. Se non contenuta rapidamente diventerà epidemia. I rimedi costano oro; quarantene forzate alienano il popolo.",
      leftText: 'Quarantena forzata — brutale ma efficace', leftEffects: { people: -10, faith: -5, army: -3 },
      rightText: 'Finanzia i medici', rightEffects: { gold: -10, people: +8, faith: +8 },
      minTurn: 8,
    },

    // ══════════════════════════════════════════
    // ── CARTE DRAGO (rarissime) ──
    // ══════════════════════════════════════════

    {
      id: 'dragon_shadow_sky', tags: ['power', 'faith', 'army'],
      speaker: 'Viandante del Nord', speakerRole: 'Testimonianza',
      portrait: '🐉', icon: '🐉',
      text: "Un viandante giura di aver visto un'ombra immensa planare sul Neck al tramonto — troppo grande per un'aquila. Pochi ci credono. Ma chi l'ha visto trema ancora.",
      leftText: 'Delirio di un pazzo', leftEffects: { power: +3 },
      rightText: 'Investigare in segreto', rightEffects: { gold: -8, power: +2, faith: +6 },
      minTurn: 12,
      maxUses: 1,
    },
    {
      id: 'dragon_egg_rumor', tags: ['gold', 'power'],
      speaker: 'Mercante di Qarth', speakerRole: 'Voce di mercato',
      portrait: '🥚', icon: '🥚',
      text: "Un mercante di Qarth sostiene di avere in vendita un uovo di drago pietrificato — forse vero, forse una truffa elaborata. Il prezzo è esorbitante ma l'oggetto sarebbe di inestimabile valore simbolico.",
      leftText: 'È una truffa — non comprare', leftEffects: { power: +3 },
      rightText: 'Acquista l\'uovo', rightEffects: { gold: -10, power: +2, faith: +5 },
      minTurn: 10,
      maxUses: 1,
    },
    {
      id: 'dragon_bones_found', tags: ['faith', 'people'],
      speaker: 'Studioso della Cittadella', speakerRole: 'Scoperta archeologica',
      portrait: '🦴', icon: '🦴',
      text: "Scavatori hanno trovato ossa immense sotto Approdo del Re — resti di un drago Targaryen. La scoperta può diventare un simbolo di potere o essere soppressa per evitare rivendicazioni.",
      leftText: 'Sopprimi la notizia', leftEffects: { power: +2, faith: -5 },
      rightText: 'Rendi pubblica la scoperta', rightEffects: { people: +10, faith: +8, power: -6 },
      minTurn: 8,
      maxUses: 1,
    },
    {
      id: 'dragon_sighting_east', tags: ['faith', 'army', 'power'],
      speaker: 'Capitano mercantile', speakerRole: 'Notizie da Essos',
      portrait: '🐉', icon: '🐉',
      text: "Corvi da Essos parlano di tre draghi visti sopra le Città Libere. Se le voci sono vere, chiunque li controlli ha un'arma capace di cambiare ogni equilibrio di potere conosciuto.",
      leftText: 'Informazione inaffidabile', leftEffects: { power: +2 },
      rightText: 'Invia una delegazione a Essos', rightEffects: { gold: -10, power: +3, army: +5 },
      minTurn: 15,
      maxUses: 1,
    },

    // ══════════════════════════════════════════
    // ── CARTE RE (solo quando isPlayerKing) ──
    // ══════════════════════════════════════════

    {
      id: 'king_tax_revolt', tags: ['people', 'gold', 'power'],
      requiresState: (s) => s.isPlayerKing,
      speaker: 'Gran Maester', speakerRole: 'Consiglio della Corona',
      portrait: '👑', icon: '👑',
      text: "Tre regioni rifiutano di pagare le tasse della Corona. I lord locali dicono che il nuovo regno non ha ancora dimostrato di meritare lealtà. Imporre la riscossione con la forza è rapido ma brutale.",
      leftText: 'Negozia — concedi sgravi', leftEffects: { gold: -8, people: +10, power: -6 },
      rightText: 'Imponi la riscossione', rightEffects: { gold: +12, people: -12, army: -6, power: +3 },
      minTurn: 1,
      maxUses: 2,
    },
    {
      id: 'king_succession_question', tags: ['power', 'people', 'faith'],
      requiresState: (s) => s.isPlayerKing,
      speaker: 'Septon Supremo', speakerRole: 'Grande Settone di Baelor',
      portrait: '⛪', icon: '⛪',
      text: "Le casate chiedono chi erediterà il trono. Senza un erede designato, ogni signore si sente libero di nutrire ambizioni. La Fede chiede una risposta ufficiale prima che le voci diventino pericolose.",
      leftText: 'Rimanda la questione', leftEffects: { power: -10, faith: -6 },
      rightText: 'Designa un erede simbolico', rightEffects: { faith: +10, people: +8, power: +3, gold: -8 },
      minTurn: 1,
      maxUses: 1,
    },
    {
      id: 'king_small_council_dispute', tags: ['power', 'gold'],
      requiresState: (s) => s.isPlayerKing,
      speaker: 'Piccolo Consiglio', speakerRole: 'Sessione di consiglio',
      portrait: '🪑', icon: '🪑',
      text: "Il Mastro delle Monete e il Lord Comandante si scontrano sul budget militare. Uno vuole ridurre le spese per ricostruire il tesoro, l'altro teme un attacco imminente. Non potete accontentarli entrambi.",
      leftText: 'Dai ragione al Mastro — economia', leftEffects: { gold: +10, army: -8, power: -4 },
      rightText: 'Dai ragione al Comandante — difesa', rightEffects: { army: +10, gold: -8, power: +2 },
      minTurn: 2,
      maxUses: 3,
    },
    {
      id: 'king_rebel_lord', tags: ['army', 'power', 'people'],
      requiresState: (s) => s.isPlayerKing,
      speaker: 'Araldo urgente', speakerRole: 'Notizia dal Westerland',
      portrait: '🏴', icon: '🏴',
      text: "Un lord del Westerland si è autoproclamato indipendente e ha alzato il suo stendardo. Non è abbastanza forte da minacciarvi militarmente, ma la sua sfida aperta potrebbe ispirare altri.",
      leftText: 'Lascialo sfogare — non è una minaccia', leftEffects: { power: -10, people: +5 },
      rightText: 'Schiaccia subito la ribellione', rightEffects: { army: -10, power: +3, people: -8 },
      minTurn: 2,
      maxUses: 2,
    },
    {
      id: 'king_foreign_marriage', tags: ['power', 'people', 'gold'],
      requiresState: (s) => s.isPlayerKing,
      speaker: 'Lord del Consiglio', speakerRole: 'Proposta diplomatica',
      excludeChars: ['arya', 'tormund'],
      portrait: '💍', icon: '💍',
      text: "Una casata straniera propone un matrimonio con la famiglia reale per sigillare un'alleanza. L'unione porterebbe oro e stabilità ma svincolerebbe la vostra politica estera dalle decisioni altrui.",
      leftText: 'Rifiuta — siamo autosufficienti', leftEffects: { power: -6, people: +4 },
      rightText: 'Accetta il matrimonio', rightEffects: { gold: +12, power: +3, people: +6, faith: +5 },
      minTurn: 3,
      maxUses: 1,
    },
    {
      id: 'king_unrest_capital', tags: ['people', 'power', 'faith'],
      requiresState: (s) => s.isPlayerKing,
      speaker: 'Comandante della Guardia', speakerRole: 'Rapporto da Approdo del Re',
      portrait: '🔥', icon: '🔥',
      text: "I quartieri poveri di Approdo del Re ribollono. La gente non è abituata al nuovo volto sul trono. I predicatori della Fede fomentano il malcontento nelle strade. Serve un gesto concreto.",
      leftText: 'Invia la guardia — ristabilisci l\'ordine', leftEffects: { army: -5, people: -8, power: +3, faith: -8 },
      rightText: 'Distribuisci pane e spettacolo', rightEffects: { gold: -10, people: +14, faith: +6 },
      minTurn: 2,
      maxUses: 2,
    },
    {
      id: 'king_casate_tribute', tags: ['power', 'gold'],
      requiresState: (s) => s.isPlayerKing,
      speaker: 'Mastro delle Monete', speakerRole: 'Rendiconto della Corona',
      portrait: '💰', icon: '💰',
      text: "Le casate che non hanno ancora giurato fedeltà trattengono i tributi dovuti alla Corona. La Banca di Ferro chiede quando verranno pagati i debiti del vecchio re. La situazione finanziaria è critica.",
      leftText: 'Sollecita con diplomazia', leftEffects: { gold: +6, power: -8 },
      rightText: 'Invia esattori con scorta armata', rightEffects: { gold: +12, army: -6, power: +2, people: -8 },
      minTurn: 3,
      maxUses: 2,
    },
    {
      id: 'king_faith_militant', tags: ['faith', 'army', 'power'],
      requiresState: (s) => s.isPlayerKing,
      speaker: 'Septon Supremo', speakerRole: 'Ultimatum della Fede',
      portrait: '⚔️', icon: '⚔️',
      text: "La Fede Militante marcia per le strade chiedendo che la Corona si conformi ai precetti dei Sette. Ignorarli infiamma il popolo; scioglierli con la forza crea martiri. C'è una terza via: la negoziazione.",
      leftText: 'Sciogli la Fede Militante', leftEffects: { faith: -14, army: -8, people: -6, power: +3 },
      rightText: 'Negozia — concedi privilegi alla Fede', rightEffects: { faith: +12, people: +8, gold: -10, power: -6 },
      minTurn: 4,
      maxUses: 1,
    },
    {
      id: 'king_whispers_betrayal', tags: ['power', 'army'],
      requiresState: (s) => s.isPlayerKing,
      speaker: 'Varys', speakerRole: 'Rapporto riservato',
      portrait: '🕷️', icon: '🕷️',
      text: "Varys vi porta prove che uno dei vostri consiglieri più fidati ha incontrato in segreto rappresentanti di una casata che non ha giurato fedeltà. Non sappiamo ancora cosa abbiano detto.",
      leftText: 'Sorveglialo in segreto', leftEffects: { power: +3, gold: -6 },
      rightText: 'Arrestalo subito — tolleranza zero', leftEffects2: {},
      rightEffects: { power: +2, army: +5, people: -8, faith: -5 },
      minTurn: 4,
      maxUses: 1,
    },
    {
      id: 'king_seven_kingdoms_unity', tags: ['power', 'people', 'faith'],
      requiresState: (s) => s.isPlayerKing,
      speaker: 'Gran Maester', speakerRole: 'Seduta plenaria del Consiglio',
      portrait: '🗺️', icon: '🗺️',
      text: "Il Gran Maester vi ricorda: un re non regna veramente finché tutte e sette le regioni non riconoscono la sua sovranità. Alcune casate aspettano di vedere se siete abbastanza forti. Altre aspettano di vedere se siete abbastanza saggi.",
      leftText: 'La forza parla più delle parole', leftEffects: { army: +8, power: +3, people: -8 },
      rightText: 'Convoca una grande assemblea di pace', rightEffects: { gold: -10, people: +12, power: +2, faith: +6 },
      minTurn: 5,
      maxUses: 1,
    },
    {
      id: 'king_border_war_threat', tags: ['army', 'power'],
      requiresState: (s) => s.isPlayerKing,
      speaker: 'Lord del Confine', speakerRole: 'Dispaccio urgente',
      portrait: '🗡️', icon: '🗡️',
      text: "Due casate che non hanno ancora giurato fedeltà alla Corona si stanno armando lungo il confine comune. Potrebbe essere una guerra tra loro — o una mossa coordinata contro di voi.",
      leftText: 'Osserva e aspetta', leftEffects: { power: -6 },
      rightText: 'Schiera truppe di confine come deterrente', rightEffects: { army: -8, power: +2, gold: -6 },
      minTurn: 5,
      maxUses: 2,
    },
    {
      id: 'king_grand_tournament', tags: ['people', 'power', 'gold'],
      requiresState: (s) => s.isPlayerKing,
      speaker: 'Lord del Torneo', speakerRole: 'Proposta al Piccolo Consiglio',
      portrait: '🏆', icon: '🏆',
      text: "Organizzare un grande torneo a nome della Corona è il modo più veloce per far affluire lord da tutto il regno. Le casate che non hanno giurato potrebbero venire — e durante i banchetti, la diplomazia fluisce più facilmente del vino.",
      leftText: 'Troppo costoso in questo momento', leftEffects: { people: -6, power: -4 },
      rightText: 'Indici il Grande Torneo', rightEffects: { gold: -10, people: +14, power: +2, faith: +4 },
      minTurn: 6,
      maxUses: 1,
    },

    // ── CARTE REGNO DIVISO (post-trono, casate non ancora fedeli) ──
    {
      id: 'king_divided_ravens', tags: ['power', 'people'],
      requiresState: (s) => s.isPlayerKing && Object.values(s.houses).some(h => !h.suppressed && !h.kingAlly && h.status !== 'enemy'),
      speaker: 'Varys', speakerRole: 'Sussurri dalla rete di spie',
      portrait: '🕷️', icon: '🕷️',
      text: "Le casate che non hanno ancora giurato si scambiano corvi di notte. Varys ha intercettato messaggi che parlano di un «patto di riserva» — aspettano di vedere se la Corona è stabile o vacillante. La vostra risposta ai prossimi eventi determinerà il loro giudizio.",
      leftText: 'Ignora — si adatteranno', leftEffects: { power: -8, people: -5 },
      rightText: 'Invia ambasciatori con doni', rightEffects: { gold: -10, power: +3, people: +6 },
      minTurn: 2,
      maxUses: 2,
    },
    {
      id: 'king_civil_war_rumor', tags: ['army', 'power', 'people'],
      requiresState: (s) => s.isPlayerKing && Object.values(s.houses).filter(h => !h.suppressed && h.status === 'enemy').length >= 2,
      speaker: 'Lord Comandante', speakerRole: 'Rapporto militare urgente',
      portrait: '🏴', icon: '🏴',
      text: "Due o più casate nemiche stanno coordinando i movimenti. Il vostro Lord Comandante è chiaro: «Se le lasciamo agire liberamente ancora tre turni, si troveranno una linea difensiva che non possiamo rompere facilmente. Dobbiamo agire adesso o prepararci a una guerra lunga.»",
      leftText: 'Prepara una campagna diplomatica', leftEffects: { gold: -10, power: -5, people: +8 },
      rightText: 'Prepara l\'offensiva militare', rightEffects: { army: +8, gold: -8, power: +3, people: -8 },
      minTurn: 3,
      maxUses: 3,
    },
    {
      id: 'king_foreign_threat_divided', tags: ['army', 'power', 'gold'],
      requiresState: (s) => s.isPlayerKing && Object.values(s.houses).some(h => !h.suppressed && !h.kingAlly),
      speaker: 'Maestro delle Navi', speakerRole: 'Dispaccio da Porto Reale',
      portrait: '⚓', icon: '⚓',
      text: "Una flotta straniera è stata avvistata oltre il Passo del Re. Normalmente non sarebbe una minaccia, ma le casate che non hanno giurato fedeltà potrebbero interpretarla come un'opportunità. Un regno diviso attira i predatori.",
      leftText: 'Invia la flotta — mostra forza', leftEffects: { army: -8, gold: -6, power: +2 },
      rightText: 'Offri accordi commerciali per pacificare', rightEffects: { gold: -8, people: +8, power: -4 },
      minTurn: 4,
      maxUses: 1,
    },
    {
      id: 'king_pretender_rises', tags: ['army', 'power', 'people'],
      requiresState: (s) => s.isPlayerKing && (s.turn - (s.playerBecameKingTurn || s.turn)) >= 6,
      speaker: 'Araldo urgente', speakerRole: 'Notizia da oltre il Mare Stretto',
      portrait: '👑', icon: '👑',
      text: "Un pretendente al trono — un discendente dell'antico re — si è fatto avanti con il sostegno di tre casate d'oltremare. Non ha ancora eserciti sul suolo di Westeros, ma il suo nome comincia a circolare anche tra le casate che non vi hanno ancora giurato fedeltà.",
      leftText: 'Delegittimalo pubblicamente', leftEffects: { power: +3, people: -6, faith: -5 },
      rightText: 'Prepara le difese costiere', rightEffects: { army: +6, gold: -10, power: +2 },
      minTurn: 6,
      maxUses: 1,
    },
    {
      id: 'king_maester_unity_report', tags: ['power', 'faith', 'people'],
      requiresState: (s) => s.isPlayerKing,
      speaker: 'Gran Maester', speakerRole: 'Rapporto annuale sul regno',
      portrait: '📜', icon: '📜',
      text: "Il Gran Maester vi presenta il rendiconto: ogni casata che non ha giurato fedeltà riduce le entrate della Corona del 12% e indebolisce la legittimità del Trono agli occhi del popolo. «Ogni luna che passa senza unità,» dice, «è una luna che il vostro nemico usa per prepararsi.»",
      leftText: 'Prenderne atto — agire diplomaticamente', leftEffects: { power: +2, gold: +6 },
      rightText: 'Convocare un Consiglio Generale delle Casate', rightEffects: { gold: -10, people: +10, power: +3, faith: +6 },
      minTurn: 5,
      maxUses: 2,
    },

  ];

  // ══════════════════════════════════════════════
  // POSSIBLE KINGS (for the starting state)
  // Each king has a houseAffiliation = which HOUSES_DEF id they belong to
  // so we can avoid giving them as king when the player IS that character
  // ══════════════════════════════════════════════
  const POSSIBLE_KINGS = [
    { id: 'joffrey',  name: 'Re Joffrey Baratheon',    house: 'Lannister-Baratheon', icon: '👑', houseAffiliation: 'Lannister',  army: 110,
      desc: 'Crudele e capriccioso, Joffrey regna con terrore e arroganza. La sua corte è un teatro di paura dove nessuno osa contraddirlo. La Guardia del Re e i Lannister ne garantiscono il potere assoluto.' },
    { id: 'stannis',  name: 'Stannis Baratheon',        house: 'Baratheon',           icon: '🦌', houseAffiliation: 'Baratheon',  army: 95,
      desc: 'Duro come la pietra e giusto come la spada, Stannis non conosce compromessi. Guidato dalla fede in R\'hllor attraverso Melisandre, considera il Trono un suo diritto assoluto — non una conquista, ma una certezza.' },
    { id: 'robb',     name: 'Robb Stark',               house: 'Stark',               icon: '🐺', houseAffiliation: 'Stark',      army: 105,
      desc: 'Il Re del Nord, mai sconfitto in battaglia. Robb ha guidato il Nord alla ribellione con onore e coraggio. Ma la politica è un campo di battaglia diverso dalla guerra — e i lupi raramente sopravvivono a corte.' },
    { id: 'mace',     name: 'Mace Tyrell (Reggente)',   house: 'Tyrell',              icon: '🌹', houseAffiliation: 'Tyrell',     army: 90,
      desc: 'Vanitoso e ambizioso, Mace Tyrell regge il trono forte della ricchezza di Altogarden. La sua forza non è il genio militare ma l\'oro — e le alleanze comprate con esso. Dietro di lui, la vera mente è la Septa Olenna.' },
    { id: 'tommen',   name: 'Re Tommen Baratheon',      house: 'Lannister',           icon: '🦁', houseAffiliation: 'Lannister',  army: 100,
      desc: 'Giovane e mite, Tommen è un re buono in un mondo spietato. Facilmente influenzato dalla madre Cersei e dalla Fede dei Sette, il suo regno è conteso da forze molto più grandi di lui.' },
    { id: 'balon',    name: 'Balon Greyjoy',            house: 'Greyjoy',             icon: '🐙', houseAffiliation: 'Greyjoy',    army: 85,
      desc: 'Il Vecchio Kraken delle Isole di Ferro non chiede — prende. Balon ha tentato la conquista una volta e fallito; ora la tenta di nuovo con lo stesso orgoglio e la stessa determinazione di ferro.' },
    { id: 'doran',    name: 'Doran Martell',            house: 'Martell',             icon: '☀️', houseAffiliation: 'Martell',    army: 80,
      desc: 'Paziente come il sole di Dorne, Doran Martell tesse trame nel silenzio. La sua forza non è nell\'esercito ma nella diplomazia — e in segreti che custodisce da decenni. Chi lo sottovaluta lo fa a proprio rischio.' },
    { id: 'viserys1', name: 'Re Viserys I Targaryen',   house: 'Targaryen',           icon: '🐉', houseAffiliation: 'Targaryen',  army: 100,
      desc: 'Il Re dell\'Unità, ultimo grande drago-re di Westeros. Viserys regna su una corte divisa dalla guerra di successione che sta per esplodere. Amato dal popolo, temuto dai grandi, il suo trono traballa sul bordo del precipizio.' },
    { id: 'aegon2',   name: 'Re Aegon II Targaryen',    house: 'Targaryen',           icon: '🐉', houseAffiliation: 'Targaryen',  army: 95,
      desc: 'Incoronato in fretta e furia dai Verdi, Aegon II è un re di guerra — spietato, determinato, con un drago al suo comando. La sua legittimità è contestata ma la sua volontà di regnare è assoluta.' },
    { id: 'otto_k',   name: 'Otto Hightower (Reggente)', house: 'Hightower',          icon: '🕯️', houseAffiliation: 'Hightower', army: 88,
      desc: 'La Mano che muove il regno nell\'ombra del trono. Otto Hightower ha sacrificato tutto — famiglia, lealtà, onore — per portare il sangue Hightower al potere. Un uomo di pura ambizione travestita da servizio.' },
    { id: 'rowan',    name: 'Lord Rowan (Reggente)',    house: 'Baratheon',           icon: '🌳', houseAffiliation: 'Baratheon',  army: 82,
      desc: 'Reggente di circostanza in tempi di crisi, Lord Rowan tiene il trono per conto di forze più grandi. Non è un re di natura — ma difenderà il suo potere con tutta la determinazione di chi sa che potrebbe perderlo da un momento all\'altro.' },
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
    { id: 'rhaenyra_coup', name: 'Rhaenyra Targaryen', icon: '🐉', house: 'Targaryen',
      flavor: 'Rhaenyra Targaryen ha reclamato il trono con fuoco e draghi. La Regina che il regno aveva sempre temuto.',
      allies: ['Targaryen', 'Tully'], enemies: ['Hightower', 'Lannister'] },
    { id: 'otto_coup',     name: 'Otto Hightower',     icon: '🕯️', house: 'Hightower',
      flavor: 'Con astuzia e manovre politiche, Otto Hightower ha posto il suo sangue sul trono. Oldtown governa ora i Sette Regni.',
      allies: ['Hightower', 'Lannister'], enemies: ['Targaryen', 'Stark'] },
  ];

  // ══════════════════════════════════════════════
  // HOUSE ARMY TICK — armies grow/shrink each turn
  // ══════════════════════════════════════════════
  function tickHouseArmies() {
    if (!state.turn || state.turn % 1 !== 0) return; // every turn
    const BASE_ARMIES = { Stark: 105, Lannister: 125, Tyrell: 110, Baratheon: 95, Tully: 85, Martell: 90, Greyjoy: 92, Frey: 75, Bolton: 90, Targaryen: 100, Hightower: 88 };
    Object.entries(state.houses).forEach(([hId, h]) => {
      if (h.suppressed) return;
      const base = BASE_ARMIES[hId] || 75;
      // Small random drift: ±1 to ±3 each turn, mean-reverting toward base
      const drift = (Math.random() * 4 - 2); // -2 to +2
      const pull  = (base - h.army) * 0.04;  // gentle pull back to base
      h.army = Math.max(20, Math.min(160, Math.round(h.army + drift + pull)));
    });

    // King army also drifts upward (always stays strong)
    if (!state.isPlayerKing) {
      const kingBase = 100;
      const kingDrift = (Math.random() * 3 - 0.5); // slight positive bias
      const kingPull  = (kingBase - (state.kingArmy || 100)) * 0.05;
      state.kingArmy = Math.max(80, Math.min(180, Math.round((state.kingArmy || 100) + kingDrift + kingPull)));
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
  // Restituisce l'ID della casata PRINCIPALE del personaggio (es. 'Stark' per Robb Stark).
  // Si basa sul campo char.house (es. 'Casa Stark') estraendo la parola dopo 'Casa '.
  // Solo questa casata viene trattata come "di appartenenza" e non può fornire truppe.
  // Le altre startAllies sono alleate normali.
  function _getPrimaryHouseId(char) {
    if (!char) return null;
    const house = char.house || '';
    // Mappatura esplicita per casi speciali (doppio nome, nessuna casa, ecc.)
    const EXPLICIT = {
      'Guardiani della Notte / Stark': 'Stark',
      "R'hllor": null,
      'Nessuna Casa': null,
      'Senza Casa': null,
      'Braccio del Re (Popolo Libero)': null,
      'Popolo Libero': null,
      'Esilio / Casa Mormont': 'Mormont',
      'Casa Tarth': 'Tarth',
    };
    if (house in EXPLICIT) return EXPLICIT[house];
    // Caso generico: "Casa Stark" → "Stark"
    const match = house.match(/^Casa\s+(\S+)/);
    if (match) return match[1];
    return null;
  }

  function countAllies(s) {
    return Object.values(s.houses).filter(h => h.status === 'ally').length;
  }

  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  // clamp does NOT prevent 0 or 100 — those trigger game over
  function clamp(v, min = 0, max = 100) { return Math.max(min, Math.min(max, Math.round(v))); }

  // ── houseIcon: returns <img> stem if crest exists, emoji fallback otherwise ──
  // size: css size string e.g. '2rem' or '28px'. Used in house cards, popups, battle overlays.
  function houseIcon(h, size = '1.8rem') {
    if (!h) return '';
    if (h.crest) {
      return `<img src="${h.crest}" alt="${h.name}" style="width:${size};height:${size};object-fit:contain;display:inline-block;vertical-align:middle;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.6))" onerror="this.style.display='none';this.insertAdjacentText('afterend','${h.icon}')">`;
    }
    return `<span style="font-size:${size}">${h.icon}</span>`;
  }

  function showModal(title, body, icon, btnLabel, onClose) {
    document.getElementById('game-modal')?.remove();
    const m = document.createElement('div');
    m.id = 'game-modal';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:800;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);animation:fadeIn 0.3s ease;';
    m.innerHTML = `
      <div style="background:#12121a;border:1px solid rgba(201,168,76,0.45);border-radius:8px;width:92%;max-width:420px;padding:1.75rem 1.5rem;font-family:'Cinzel',serif;text-align:center">
        ${icon ? `<div style="font-size:2.6rem;margin-bottom:0.75rem">${icon}</div>` : ''}
        <div style="font-family:'Cinzel Decorative',serif;font-size:1rem;color:#c9a84c;margin-bottom:0.6rem;line-height:1.3">${title}</div>
        <div style="font-family:'EB Garamond',serif;font-size:0.95rem;color:#e8dcc8;line-height:1.65;margin-bottom:1.25rem">${body}</div>
        <button id="modal-ok" style="padding:0.7rem 2.5rem;background:linear-gradient(135deg,#78350f,#c9a84c);border:none;border-radius:3px;font-family:'Cinzel',serif;font-size:0.78rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;color:#0a0a0f">${btnLabel||'OK'}</button>
      </div>`;
    document.body.appendChild(m);
    document.getElementById('modal-ok').addEventListener('click', () => {
      m.remove();
      if (onClose) onClose();
    });
  }

  function _payAttackCompensation(hId, amount) {
    const h = state.houses[hId];
    if (!h) return;
    state.resources.gold = clampRes(state.resources.gold - amount);
    h.status = 'neutral';
    h.attackedByPlayer = false;
    _recordDipEvent(hId, 'paid_tribute');
    showToast(`💰 Casa ${h.icon} ${h.name} ha accettato il risarcimento e torna neutrale.`, 'good');
    updateHUD(); saveGame(); renderDiplomacy?.();
  }

  function setHouseStatus(h, newStatus) {
    if (!h || h.status === newStatus) return;
    const old = h.status;
    h.status = newStatus;
    notifyDiplomaticChange(h, newStatus, old);
  }

  function notifyDiplomaticChange(h, newStatus, oldStatus) {
    if (!h || newStatus === oldStatus) return;
    const labels = {
      ally:       '🤝 Alleata',
      neutral:    '⚪ Neutrale',
      enemy:      '⚔ Nemica',
      diffidente: '🕷 Diffidente',
      suppressed: '💀 Conquistata',
    };
    const icons = { ally:'🤝', neutral:'⚪', enemy:'⚔', diffidente:'🕷', suppressed:'💀' };
    const newLabel = labels[newStatus] || newStatus;
    const icon = icons[newStatus] || '📜';
    showToast(`${h.icon} Casa ${h.name} → ${newLabel}`, newStatus === 'ally' ? 'good' : newStatus === 'enemy' ? 'warn' : '');
  }

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
    if (typeof AudioManager !== 'undefined') AudioManager.playMain();
    showScreen('screen-char-select');
    _showHouseSelect();
  }

  function _showHouseSelect() {
    const grid = document.getElementById('char-grid');
    grid.innerHTML = '';

    // Update header text
    const sub = document.querySelector('#screen-char-select .section-sub');
    if (sub) sub.textContent = 'Scegli una Casata';

    // Back to splash button — spans full grid width
    const backWrapper = document.createElement('div');
    backWrapper.style.cssText = 'width:100%;grid-column:1/-1;padding:0 0.25rem;margin-bottom:0.5rem;box-sizing:border-box;';
    backWrapper.innerHTML = `
      <button onclick="Game.goBackToSplash()" style="width:100%;background:transparent;border:1px solid rgba(201,168,76,0.3);border-radius:3px;padding:0.55rem 1rem;font-family:'Cinzel',serif;font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#9a8a6a;text-align:left;transition:all 0.2s">
        ◄ Menu Principale
      </button>`;
    grid.appendChild(backWrapper);

    const HOUSE_GROUPS = [
      { id: 'Stark',     name: 'Casa Stark',       icon: '🐺', crest: 'images/houses/Stark.png',     region: 'Il Nord',              chars: ['jon','sansa','arya','robb','ned'],              color: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.4)' },
      { id: 'Lannister', name: 'Casa Lannister',   icon: '🦁', crest: 'images/houses/Lannister.png', region: 'Castel Granito',        chars: ['cersei','tyrion','jaime','tywin'],             color: 'rgba(201,168,76,0.12)',  border: 'rgba(201,168,76,0.45)' },
      { id: 'Targaryen', name: 'Casa Targaryen',   icon: '🐉', crest: 'images/houses/Targaryen.png', region: 'Esilio / Dragonstone',  chars: ['daenerys','viserys','rhaenyra','aegon_t'],     color: 'rgba(220,38,38,0.12)',   border: 'rgba(220,38,38,0.45)'  },
      { id: 'Baratheon', name: 'Casa Baratheon',   icon: '🦌', crest: 'images/houses/Baratheon.png', region: 'Capo della Tempesta',   chars: ['stannis','melisandre','davos'],                color: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.4)'  },
      { id: 'Tyrell',    name: 'Casa Tyrell',      icon: '🌹', crest: 'images/houses/Tyrell.png',    region: 'Altogarden',            chars: ['margaery','olenna'],                           color: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.4)'  },
      { id: 'Martell',   name: 'Casa Martell',     icon: '☀️', crest: 'images/houses/Martell.png',   region: 'Dorne',                 chars: ['oberyn'],                                     color: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.4)'  },
      { id: 'Greyjoy',   name: 'Casa Greyjoy',     icon: '🐙', crest: 'images/houses/Greyjoy.png',   region: 'Isole di Ferro',        chars: ['theon'],                                      color: 'rgba(99,102,241,0.1)',   border: 'rgba(99,102,241,0.4)'  },
      { id: 'Tully',     name: 'Casa Tully',       icon: '🐟', crest: 'images/houses/Tully.png',     region: 'Acque del Nera',        chars: ['catelyn'],                                    color: 'rgba(59,130,246,0.1)',   border: 'rgba(59,130,246,0.4)'  },
      { id: 'Bolton',    name: 'Casa Bolton',      icon: '🩸', crest: 'images/houses/Bolton.png',    region: 'Forte Terrore',         chars: ['roose','ramsay'],                             color: 'rgba(127,29,29,0.15)',   border: 'rgba(239,68,68,0.4)'   },
      { id: 'Hightower', name: 'Casa Hightower',   icon: '🕯️', crest: 'images/houses/Hightower.png', region: 'Oldtown',               chars: ['otto','alicent'],                             color: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.35)' },
      { id: 'None',      name: 'Senza Casa',       icon: '🪙', crest: null,            region: 'Westeros',              chars: ['littlefinger','bronn','tormund','jorah','sandor','ygritte','brienne'], color: 'rgba(120,120,120,0.1)', border: 'rgba(120,120,120,0.35)'},
    ];

    HOUSE_GROUPS.forEach(group => {
      const charCount = group.chars.filter(id => CHARACTERS.find(c => c.id === id)).length;
      const card = document.createElement('div');
      card.className = 'char-card';
      card.style.cssText = `background:${group.color};border-color:${group.border};cursor:pointer;`;
      const iconHtml = group.crest
        ? `<img src="${group.crest}" alt="${group.name}" style="width:2.8rem;height:2.8rem;object-fit:contain;filter:drop-shadow(0 1px 4px rgba(0,0,0,0.7))" onerror="this.outerHTML='<span style=\\'font-size:2.2rem\\'>${group.icon}</span>'">`
        : `<span style="font-size:2.2rem">${group.icon}</span>`;
      card.innerHTML = `
        <span class="char-card-icon" style="display:flex;align-items:center;justify-content:center;height:3rem">${iconHtml}</span>
        <span class="char-card-name" style="font-size:0.78rem">${group.name}</span>
        <span class="char-card-house" style="font-size:0.6rem;color:#9a8a6a">${group.region}</span>
        <span style="font-family:'Cinzel',serif;font-size:0.6rem;color:#6b5e4a;margin-top:0.2rem">${charCount} ${charCount === 1 ? 'personaggio' : 'personaggi'}</span>
      `;
      card.addEventListener('click', () => _showHouseCharacters(group));
      grid.appendChild(card);
    });
  }

  function _showHouseCharacters(group) {
    const grid = document.getElementById('char-grid');
    grid.innerHTML = '';

    // Update header
    const sub = document.querySelector('#screen-char-select .section-sub');
    if (sub) sub.textContent = `${group.name} — Scegli il tuo personaggio`;

    // Single back button — full width, above the cards
    const backWrapper = document.createElement('div');
    backWrapper.style.cssText = 'width:100%;grid-column:1/-1;padding:0 0.25rem;margin-bottom:0.5rem;box-sizing:border-box;';
    backWrapper.innerHTML = `
      <button onclick="Game._showHouseSelect()" style="width:100%;background:transparent;border:1px solid rgba(201,168,76,0.3);border-radius:3px;padding:0.55rem 1rem;font-family:'Cinzel',serif;font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#9a8a6a;text-align:left;transition:all 0.2s">
        ◄ Torna alle Casate
      </button>`;
    grid.appendChild(backWrapper);

    // Characters for this house
    const chars = group.chars.map(id => CHARACTERS.find(c => c.id === id)).filter(Boolean);
    chars.forEach(c => {
      const card = document.createElement('div');
      card.className = 'char-card';
      card.dataset.charId = c.id;
      card.style.cssText = `background:${group.color};border-color:${group.border};position:relative;`;
      const diffLabel = c.difficulty === 'easy' ? 'Facile' : c.difficulty === 'medium' ? 'Medio' : 'Difficile';
      const p = _getProgress();
      const locked = isCharLocked(c.id);
      const completed = p.completed?.[c.id];
      // Character portrait: try <id>.png, fallback to ? if missing
      const iconHtml = `
        <div style="width:3rem;height:3rem;border-radius:50%;overflow:hidden;border:2px solid rgba(201,168,76,0.35);display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.3);margin:0 auto" class="${completed ? 'icon-gold-border' : ''}">
          <img src="images/characters/${c.id}.png" alt="${c.name}"
            style="width:100%;height:100%;object-fit:cover"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <span style="display:none;font-size:1.6rem;width:100%;height:100%;align-items:center;justify-content:center">❓</span>
        </div>`;
      card.innerHTML = `
        <span class="char-card-icon" style="display:flex;align-items:center;justify-content:center;height:3.2rem">${iconHtml}</span>
        <span class="char-card-name ${completed ? 'char-name-gold' : ''}" data-house="${group.id}">${c.name}</span>
        <span class="char-card-house">${c.house}</span>
        <span class="char-card-diff diff-${c.difficulty}">${diffLabel}</span>
      `;
      if (locked) {
        const lockDiv = document.createElement('div');
        lockDiv.className = 'char-locked-overlay';
        lockDiv.innerHTML = '🔒';
        lockDiv.onclick = (e) => { e.stopPropagation(); _showLockPopup(c.id); };
        card.appendChild(lockDiv);
        card.addEventListener('click', () => _showLockPopup(c.id));
      } else {
        card.addEventListener('click', () => showCharacterDetail(c.id));
      }
      grid.appendChild(card);
    });
  }

  function showCharacterDetail(charId) {
    const char = CHARACTERS.find(c => c.id === charId);
    if (!char) return;

    const existing = document.getElementById('char-detail-overlay');
    if (existing) existing.remove();

    const diffLabel = char.difficulty === 'easy' ? 'Facile' : char.difficulty === 'medium' ? 'Medio' : 'Difficile';
    const diffColor = char.difficulty === 'easy' ? '#27ae60' : char.difficulty === 'medium' ? '#c9a84c' : '#c0392b';

    // Starting resources mini-bars
    const resKeys = [
      { key: 'gold',   icon: '💰', label: 'Tesoro'   },
      { key: 'faith',  icon: '✝',  label: 'Fede'     },
      { key: 'people', icon: '👥', label: 'Popolo'   },
      { key: 'army',   icon: '⚔',  label: 'Esercito' },
      { key: 'power',  icon: '👑', label: 'Potere'   },
    ];
    const resHtml = resKeys.map(r => {
      const val = char.startResources[r.key] || 0;
      const pct = Math.round(val);
      const barColor = r.key === 'gold' ? '#c9a84c' : r.key === 'faith' ? '#8b5cf6' : r.key === 'people' ? '#4ade80' : r.key === 'army' ? '#ef4444' : '#60a5fa';
      return `
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.35rem">
          <span style="font-size:0.85rem;width:1.2rem;text-align:center;flex-shrink:0">${r.icon}</span>
          <span style="font-family:'Cinzel',serif;font-size:0.62rem;color:#9a8a6a;width:3.5rem;flex-shrink:0">${r.label}</span>
          <div style="flex:1;height:5px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${barColor};border-radius:3px;transition:width 0.8s ease"></div>
          </div>
          <span style="font-family:'Cinzel',serif;font-size:0.62rem;color:#6b5e4a;width:1.8rem;text-align:right;flex-shrink:0">${val}</span>
        </div>`;
    }).join('');

    // Allies/enemies flavor
    const resolveHouseName = (id) => {
      if (id === 'custom_house' && char.customHouseName) return 'Casa ' + char.customHouseName;
      const hDef = HOUSES_DEF.find(h => h.id === id);
      return hDef ? hDef.name : id;
    };
    const allyHtml = char.startAllies.length
      ? char.startAllies.map(a => `<span style="background:rgba(74,222,128,0.12);color:#4ade80;border:1px solid rgba(74,222,128,0.3);border-radius:12px;padding:0.1rem 0.5rem;font-size:0.68rem;font-family:'Cinzel',serif">${resolveHouseName(a)}</span>`).join(' ')
      : `<span style="color:#6b5e4a;font-size:0.72rem;font-style:italic">Nessuno</span>`;
    const enemyHtml = char.startEnemies.length
      ? char.startEnemies.map(a => `<span style="background:rgba(239,68,68,0.12);color:#f87171;border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:0.1rem 0.5rem;font-size:0.68rem;font-family:'Cinzel',serif">${resolveHouseName(a)}</span>`).join(' ')
      : `<span style="color:#6b5e4a;font-size:0.72rem;font-style:italic">Nessuno</span>`;

    const overlay = document.createElement('div');
    overlay.id = 'char-detail-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:400;
      display:flex;align-items:center;justify-content:center;
      background:rgba(0,0,0,0.82);backdrop-filter:blur(6px);
      animation:charDetailIn 0.28s cubic-bezier(0.34,1.26,0.64,1) forwards;
    `;

    // Inject animation if not present
    if (!document.getElementById('char-detail-style')) {
      const s = document.createElement('style');
      s.id = 'char-detail-style';
      s.textContent = `
        @keyframes charDetailIn {
          from { opacity:0; transform:scale(0.88) translateY(18px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes charDetailOut {
          from { opacity:1; transform:scale(1) translateY(0); }
          to   { opacity:0; transform:scale(0.92) translateY(10px); }
        }
        #char-detail-overlay.closing {
          animation: charDetailOut 0.18s ease forwards;
        }
      `;
      document.head.appendChild(s);
    }

    function closeDetail() {
      overlay.classList.add('closing');
      setTimeout(() => overlay.remove(), 180);
    }

    overlay.innerHTML = `
      <div style="
        position:relative;
        background:linear-gradient(160deg,#1e1a14 0%,#14120e 100%);
        border:1px solid rgba(201,168,76,0.55);
        border-radius:8px;
        width:92%;max-width:400px;
        max-height:92vh;overflow-y:auto;
        box-shadow:0 20px 80px rgba(0,0,0,0.9),0 0 0 1px rgba(201,168,76,0.12);
        font-family:'Cinzel',serif;
      ">
        <!-- Linea decorativa top -->
        <div style="height:2px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.7),transparent);border-radius:8px 8px 0 0"></div>

        <!-- Pulsante chiudi -->
        <button id="char-detail-close" style="
          position:absolute;top:0.75rem;right:0.75rem;z-index:10;
          background:rgba(255,255,255,0.06);border:1px solid rgba(201,168,76,0.3);
          border-radius:50%;width:2rem;height:2rem;
          display:flex;align-items:center;justify-content:center;
          font-size:1rem;color:#9a8a6a;cursor:pointer;
          transition:all 0.15s;font-family:sans-serif;line-height:1;
        ">✕</button>

        <div style="padding:1.5rem 1.5rem 1.2rem">

          <!-- Ritratto + nome -->
          <div style="text-align:center;margin-bottom:1.2rem">
            <div style="line-height:1;margin-bottom:0.6rem;display:flex;align-items:center;justify-content:center">
              <img id="char-portrait-img-${char.id}" src="images/characters/${char.id}.png" alt="${char.name}"
                style="width:5rem;height:5rem;object-fit:cover;border-radius:50%;border:2px solid rgba(201,168,76,0.4);filter:drop-shadow(0 0 16px rgba(201,168,76,0.35))"
                onerror="this.style.display='none';document.getElementById('char-portrait-fallback-${char.id}').style.display='flex'">
              <span id="char-portrait-fallback-${char.id}" style="display:none;width:5rem;height:5rem;border-radius:50%;border:2px solid rgba(201,168,76,0.2);align-items:center;justify-content:center;font-size:2.5rem;background:rgba(201,168,76,0.06)">❓</span>
            </div>
            <div style="font-family:'Cinzel Decorative',serif;font-size:1.05rem;
              color:#e8c96a;letter-spacing:0.06em;line-height:1.2">${char.name}</div>
            <div style="font-size:0.72rem;color:#9a8a6a;margin-top:0.3rem;
              font-style:italic">${char.house}</div>
            <span style="
              display:inline-block;margin-top:0.5rem;
              font-size:0.65rem;font-family:'Cinzel',serif;letter-spacing:0.06em;
              text-transform:uppercase;padding:0.2rem 0.7rem;border-radius:20px;
              background:${char.difficulty === 'easy' ? 'rgba(39,174,96,0.2)' : char.difficulty === 'medium' ? 'rgba(201,168,76,0.2)' : 'rgba(192,57,43,0.2)'};
              color:${diffColor};
              border:1px solid ${diffColor}
            ">${diffLabel}</span>
          </div>

          <!-- Citazione flavor -->
          <div style="
            background:rgba(201,168,76,0.05);
            border-left:2px solid rgba(201,168,76,0.4);
            border-radius:0 4px 4px 0;
            padding:0.65rem 0.85rem;
            margin-bottom:1.1rem;
            font-family:'EB Garamond',serif;
            font-size:0.95rem;color:#c9b887;
            font-style:italic;line-height:1.55;
          ">«${char.flavor}»</div>

          <!-- Obiettivo -->
          <div style="margin-bottom:1.1rem">
            <div style="font-size:0.65rem;color:#9a8a6a;letter-spacing:0.1em;
              text-transform:uppercase;margin-bottom:0.45rem">📜 Obiettivo</div>
            <div style="font-family:'EB Garamond',serif;font-size:0.9rem;
              color:#e8dcc8;line-height:1.55">${char.objective}</div>
          </div>

          <!-- Bonus di casata -->
          ${char.houseBonus ? `
          <div style="margin-bottom:1.1rem;background:rgba(74,222,128,0.07);border:1px solid rgba(74,222,128,0.25);border-radius:4px;padding:0.6rem 0.8rem">
            <div style="font-size:0.62rem;color:#4ade80;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.3rem">⚜ Bonus di Casata (ogni 5 turni)</div>
            <div style="font-family:'EB Garamond',serif;font-size:0.88rem;color:#a7f3d0;line-height:1.45">${char.houseBonus.label}</div>
          </div>` : ''}

          <!-- Risorse iniziali -->
          <div style="margin-bottom:1.1rem">
            <div style="font-size:0.65rem;color:#9a8a6a;letter-spacing:0.1em;
              text-transform:uppercase;margin-bottom:0.55rem">⚖ Risorse iniziali</div>
            ${resHtml}
          </div>

          <!-- Alleati / Nemici -->
          <div style="display:flex;gap:1rem;margin-bottom:1.4rem">
            <div style="flex:1">
              <div style="font-size:0.62rem;color:#9a8a6a;letter-spacing:0.08em;
                text-transform:uppercase;margin-bottom:0.35rem">🤝 Alleati</div>
              <div style="display:flex;flex-wrap:wrap;gap:0.25rem">${allyHtml}</div>
            </div>
            <div style="flex:1">
              <div style="font-size:0.62rem;color:#9a8a6a;letter-spacing:0.08em;
                text-transform:uppercase;margin-bottom:0.35rem">⚔ Nemici</div>
              <div style="display:flex;flex-wrap:wrap;gap:0.25rem">${enemyHtml}</div>
            </div>
          </div>

          <!-- Pulsante Inizia -->
          <button id="char-detail-start" style="
            width:100%;padding:0.85rem;
            background:linear-gradient(135deg,#8b6914,#c9a84c,#8b6914);
            border:none;border-radius:3px;
            font-family:'Cinzel Decorative',serif;font-size:0.82rem;
            font-weight:700;letter-spacing:0.15em;text-transform:uppercase;
            cursor:pointer;color:#0a0a0f;
            box-shadow:0 4px 20px rgba(201,168,76,0.3);
            transition:box-shadow 0.2s;
          ">⚔ Inizia la partita</button>

        </div>

        <!-- Linea decorativa bottom -->
        <div style="height:2px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent);border-radius:0 0 8px 8px"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Event listeners
    document.getElementById('char-detail-close').addEventListener('click', closeDetail);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeDetail(); });
    document.getElementById('char-detail-start').addEventListener('click', () => {
      overlay.remove();
      selectCharacter(charId);
    });

    // Hover on close button
    const closeBtn = document.getElementById('char-detail-close');
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'rgba(255,255,255,0.12)';
      closeBtn.style.color = '#e8dcc8';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'rgba(255,255,255,0.06)';
      closeBtn.style.color = '#9a8a6a';
    });

    // Tutorial hook — if tutorial active, show step after overlay renders
    if (_tutorialActive) setTimeout(_tutOnCharDetail, 500);
  }

  function selectCharacter(charId) {
    const char = CHARACTERS.find(c => c.id === charId);
    if (!char) return;
    initState(char);
    buildPrologue(char);
    showScreen('screen-prologue');
    if (_tutorialActive && _tutorialPendingStep === 'prologue') {
      setTimeout(_tutStep_prologue, 600);
    }
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

      // King's house is NOT automatically enemy — it's neutral but flagged as kingAlly
      // The player can still try to ally with them (though it's harder)
      const isKingHouse = (king.houseAffiliation === h.id);

      // Generate inter-house relations (visible as border hints in diplomacy)
      // 1-2 random houses are secretly aligned with the king
      houses[h.id] = {
        name: h.name, icon: h.icon, crest: h.crest || null, region: h.region,
        army: h.baseArmy + Math.floor(Math.random() * 20) - 10,
        status,
        kingAlly: isKingHouse,
        startingEnemy: char.startEnemies.includes(h.id), // flag: started as enemy — uses passive tribute logic
      };
    });

    // ── Assign betrayal chances to all houses ──
    // One high (40-55%), one very low (2-6%), rest distributed 8-30%
    // These represent hidden loyalty — actual betrayal in battle is much rarer (chance/100 roll)
    const houseIds = Object.keys(houses).filter(id =>
      id !== king.houseAffiliation &&
      !char.startAllies.includes(id)
    );
    const shuffledForBetrayal = [...houseIds].sort(() => Math.random() - 0.5);
    const betrayalPool = [];
    if (shuffledForBetrayal.length > 0) {
      betrayalPool.push({ id: shuffledForBetrayal[0], val: 40 + Math.floor(Math.random() * 16) }); // 40-55% — one risky house
      if (shuffledForBetrayal.length > 1) {
        betrayalPool.push({ id: shuffledForBetrayal[1], val: 2 + Math.floor(Math.random() * 5) }); // 2-6% — one very loyal
      }
      for (let i = 2; i < shuffledForBetrayal.length; i++) {
        betrayalPool.push({ id: shuffledForBetrayal[i], val: 8 + Math.floor(Math.random() * 23) }); // 8-30%
      }
    }
    // Starting allies: very trustworthy (3-10%)
    char.startAllies.forEach(id => {
      if (houses[id]) betrayalPool.push({ id, val: 3 + Math.floor(Math.random() * 8) });
    });
    betrayalPool.forEach(({ id, val }) => {
      if (houses[id]) {
        houses[id].betrayalChance = val;
        houses[id].betrayalReduction = 0;
      }
    });
    if (houses[king.houseAffiliation]) {
      houses[king.houseAffiliation].betrayalChance = 0;
      houses[king.houseAffiliation].betrayalReduction = 0;
    }
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
      // Mark these houses as kingAlly — they are described in the prologue as backing the king
      shuffled.forEach(h => {
        if (houses[h.id]) houses[h.id].kingAlly = true;
      });
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
      // ── Memoria diplomatica: le casate ricordano cosa ha fatto il giocatore ──
      // { houseId: { brokenAlliance: bool, refusedPact: int, betrayedUs: bool, unpaidTributes: int } }
      diplomaticMemory: {},
    };
  }

  // ══════════════════════════════════════════════
  // MEMORIA DIPLOMATICA
  // ══════════════════════════════════════════════
  function _dipMemory(hId) {
    if (!state.diplomaticMemory) state.diplomaticMemory = {};
    if (!state.diplomaticMemory[hId]) state.diplomaticMemory[hId] = {};
    return state.diplomaticMemory[hId];
  }

  function _recordDipEvent(hId, event) {
    const m = _dipMemory(hId);
    switch (event) {
      case 'broken_alliance':  m.brokenAlliance = (m.brokenAlliance || 0) + 1; break;
      case 'refused_pact':     m.refusedPact    = (m.refusedPact    || 0) + 1; break;
      case 'betrayed_us':      m.betrayedUs     = true; break;
      case 'unpaid_tribute':   m.unpaidTribute  = (m.unpaidTribute  || 0) + 1; break;
      case 'honored_pact':     m.honoredPact    = (m.honoredPact    || 0) + 1; break;
      case 'paid_tribute':     m.paidTribute    = (m.paidTribute    || 0) + 1; break;
      case 'offered_tribute':  m.offeredTribute = (m.offeredTribute || 0) + 1; break;
    }
  }

  // Returns a diplomacy penalty score (0 = clean, higher = more hostile)
  function _dipPenalty(hId) {
    const m = _dipMemory(hId);
    let penalty = 0;
    if (m.brokenAlliance) penalty += m.brokenAlliance * 30;
    if (m.refusedPact)    penalty += m.refusedPact    * 15;
    if (m.betrayedUs)     penalty += 50;
    if (m.unpaidTribute)  penalty += m.unpaidTribute  * 10;
    if (m.honoredPact)    penalty -= m.honoredPact    * 10;
    if (m.paidTribute)    penalty -= m.paidTribute    *  8;
    if (m.offeredTribute) penalty -= m.offeredTribute *  5;
    return Math.max(-30, penalty); // negative = bonus (trusted ally)
  }

  // Returns a flavor line for the house popup based on memory
  function _dipMemoryLabel(hId) {
    const m = _dipMemory(hId);
    if (m.betrayedUs)                        return `<span style="color:#f87171;font-size:0.7rem">💔 Ricordano il tuo tradimento</span>`;
    if (m.brokenAlliance >= 2)               return `<span style="color:#f87171;font-size:0.7rem">⚠ Hai rotto l'alleanza più volte</span>`;
    if (m.brokenAlliance === 1)              return `<span style="color:#fb923c;font-size:0.7rem">⚠ Ricordano l'alleanza spezzata</span>`;
    if (m.refusedPact >= 2)                  return `<span style="color:#fb923c;font-size:0.7rem">😒 Hai rifiutato i loro patti più volte</span>`;
    if (m.unpaidTribute >= 2)               return `<span style="color:#fb923c;font-size:0.7rem">💰 Ti considerano inaffidabile sui tributi</span>`;
    if (m.honoredPact >= 1 && !m.betrayedUs) return `<span style="color:#4ade80;font-size:0.7rem">🤝 Ricordano che hai onorato i patti</span>`;
    if (m.offeredTribute >= 2)              return `<span style="color:#4ade80;font-size:0.7rem">🎁 Apprezzano i tuoi tributi passati</span>`;
    return '';
  }

  // ══════════════════════════════════════════════
  // PROLOGUE GENERATION
  // ══════════════════════════════════════════════
  function buildPrologue(char) {
    const king = POSSIBLE_KINGS.find(k => k.id === state.king);

    // Resolve ally names — replace 'custom_house' with actual house name
    const resolveAllyName = (id) => {
      if (id === 'custom_house' && char.customHouseName) return 'Casa ' + char.customHouseName;
      const hDef = HOUSES_DEF.find(h => h.id === id);
      return hDef ? 'Casa ' + hDef.name : id;
    };

    const playerAllies = char.startAllies.length > 0
      ? char.startAllies.map(resolveAllyName).join(', ')
      : 'nessuna casata — siete soli';
    const playerEnemies = char.startEnemies.length > 0
      ? char.startEnemies.map(resolveAllyName).join(', ')
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

    // ── Costruisci header visivo: re in alto, casate alleate sotto, prologo sotto ──
    const kingH = state.houses[state.kingHouseAffiliation] || null;

    // Casate alleate al re — con stemmi PNG
    const kingAlliesArr = Object.entries(state.houses)
      .filter(([, h]) => h.kingAlly && !h.suppressed);

    const kingAlliesHtml = kingAlliesArr.map(([, h]) => `
      <div style="display:flex;flex-direction:column;align-items:center;gap:0.15rem">
        <div style="width:2.2rem;height:2.2rem;border-radius:50%;overflow:hidden;border:1px solid rgba(201,168,76,0.4);background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center">
          ${h.crest
            ? `<img src="${h.crest}" style="width:1.7rem;height:1.7rem;object-fit:contain" onerror="this.outerHTML='<span style=\\'font-size:1.1rem\\'>${h.icon}</span>'">`
            : `<span style="font-size:1.1rem">${h.icon}</span>`}
        </div>
        <span style="font-size:0.5rem;color:#6b5e4a;font-family:'Cinzel',serif;text-align:center;max-width:2.5rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h.name}</span>
      </div>`).join('');

    const prologueHeaderHtml = `
      <div style="position:relative;width:100%;margin-bottom:0.5rem;border-radius:5px;overflow:hidden;border:1px solid rgba(192,132,252,0.3);background:rgba(10,8,20,0.9);">
        ${kingH?.crest ? `<img src="${kingH.crest}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:0.05;pointer-events:none;filter:blur(2px)">` : ''}
        <div style="position:relative;padding:0.7rem 0.75rem;display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <!-- Riga: ritratto re + nome -->
          <div style="display:flex;align-items:center;gap:0.65rem;width:100%">
            <div style="width:3.2rem;height:3.2rem;border-radius:50%;overflow:hidden;border:2px solid rgba(192,132,252,0.6);box-shadow:0 0 10px rgba(192,132,252,0.2);background:rgba(0,0,0,0.5);flex-shrink:0">
              <img src="images/characters/${king.id}.png" alt="${king.name}"
                style="width:100%;height:100%;object-fit:cover;object-position:top"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
              <span style="display:none;font-size:1.5rem;width:100%;height:100%;align-items:center;justify-content:center">${king.icon}</span>
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-family:'Cinzel Decorative',serif;font-size:0.72rem;color:#c084fc;letter-spacing:0.03em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${king.name}</div>
              <div style="font-size:0.58rem;color:#6b5e4a;font-family:'EB Garamond',serif;font-style:italic">👑 Re Reggente dei Sette Regni</div>
            </div>
          </div>
          <!-- Casate alleate con stemmi -->
          ${kingAlliesHtml ? `
            <div style="width:100%;border-top:1px solid rgba(201,168,76,0.12);padding-top:0.4rem">
              <div style="font-family:'Cinzel',serif;font-size:0.48rem;color:#6b5e4a;letter-spacing:0.1em;text-transform:uppercase;text-align:center;margin-bottom:0.35rem">Casate fedeli alla Corona</div>
              <div style="display:flex;justify-content:center;gap:0.5rem;flex-wrap:wrap">${kingAlliesHtml}</div>
            </div>` : ''}
        </div>
      </div>`;

    document.getElementById('prologue-text').innerHTML = `
      ${prologueHeaderHtml}
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
    _maybeTutGame();
  }

  // ══════════════════════════════════════════════
  // HUD UPDATE
  // ══════════════════════════════════════════════
  function updateHUD() {
    const r = state.resources;
    const char = state.character;
    const cap = getResourceCap();

    const hudIcon = document.getElementById('hud-char-icon');
    if (hudIcon) {
      hudIcon.innerHTML = `<img src="images/characters/${char.id}.png" alt="${char.name}"
        style="width:1.8rem;height:1.8rem;object-fit:cover;border-radius:50%;border:1px solid rgba(201,168,76,0.4);vertical-align:middle"
        onerror="this.outerHTML='<span style=\\'font-size:1.4rem\\'>${char.icon}</span>'">`;
    }
    document.getElementById('hud-char-name').textContent = char.name.split(' ')[0];
    document.getElementById('hud-turn').textContent = state.turn;
    if (char.id === 'arya') {
      renderAryaListInObjective();
    } else if (char.id === 'melisandre') {
      const turns = state.faithHighTurns || 0;
      document.getElementById('objective-text').textContent =
        `Il Fuoco Eterno: Fede ≥75 per ${turns}/15 turni consecutivi (attuale: ${state.resources.faith})`;
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

    // Show garrison badge if player has conquered territories
    const garrisonCount = Object.keys(state.garrisons || {}).length;
    const capBadgeEl = document.getElementById('cap-badge');
    if (garrisonCount > 0) {
      let capBadge = capBadgeEl;
      if (!capBadge) {
        capBadge = document.createElement('div');
        capBadge.id = 'cap-badge';
        capBadge.style.cssText = 'position:fixed;top:4.5rem;right:0.5rem;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.35);border-radius:4px;font-family:Cinzel,serif;font-size:0.62rem;color:#fca5a5;padding:0.2rem 0.4rem;z-index:50;letter-spacing:0.05em';
        document.body.appendChild(capBadge);
      }
      const totalCost = Object.values(state.garrisons || {}).reduce((s, g) => s + g.costPerCycle, 0);
      capBadge.textContent = `🏰 ${garrisonCount} ${garrisonCount===1?'territorio':'territori'} (-${totalCost}💰/5t)`;
    } else if (capBadgeEl) {
      capBadgeEl.remove();
    }
  }

  // ══════════════════════════════════════════════
  // CARD LOGIC
  // ══════════════════════════════════════════════
  let currentCard = null;

  function drawNextCard() {
    // ── New house: notify when diplomatic cooldown expires ──
    if (state.newHouseAllianceFreeFrom && state.turn === state.newHouseAllianceFreeFrom) {
      state.newHouseAllianceFreeFrom = null;
      showToast(`🏰 La tua casata si è fatta un nome. Puoi ora proporre alleanze alle grandi casate.`, 'good');
    }

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
    // Skip all card injections during active war prep or king challenge — no interruptions allowed
    const _inActiveWar = state.pendingWarTarget || state.pendingWarDeclaration || state.pendingKingChallenge;
    if (!_inActiveWar) {
      checkEnemyTributeDemands();
      checkActivePactCalls();
      checkAllyResourceRequests();
      checkKingDemands();
    }

    // ── Update house armies each turn (slow drift) ──
    // Skip tick during active wars/king challenge — prevents enemy armies from
    // regenerating mid-battle or between declaration and actual combat
    if (!_inActiveWar) tickHouseArmies();

    // ── Costo guarnigioni casate conquistate — ogni 5 turni ──
    if (!_inActiveWar && state.turn % 5 === 0 && state.garrisons && Object.keys(state.garrisons).length > 0) {
      let totalGarrisonCost = 0;
      const garrisonNames = [];
      Object.entries(state.garrisons).forEach(([id, g]) => {
        const h = state.houses[id];
        if (!h || !h.suppressed) { delete state.garrisons[id]; return; } // casata non più soppressa
        totalGarrisonCost += g.costPerCycle;
        garrisonNames.push(`${g.icon} ${g.name}`);
      });
      if (totalGarrisonCost > 0) {
        state.resources.gold = Math.max(0, state.resources.gold - totalGarrisonCost);
        setTimeout(() => showToast(`🏰 Guarnigioni (${garrisonNames.join(', ')}): -${totalGarrisonCost} oro per mantenere i territori conquistati.`, 'warn'), 300);
        updateHUD(); saveGame();
      }
    }

    // ── House bonus passivo del personaggio — ogni 5 turni ──
    // Il bonus deriva dalla casata del personaggio scelto, non dalle alleanze dinamiche
    if (!_inActiveWar && state.turn % 5 === 0 && state.character?.houseBonus) {
      const cap = getResourceCap();
      const bonus = state.character.houseBonus;
      bonus.res.forEach(([res, val]) => {
        state.resources[res] = Math.max(0, Math.min(cap, state.resources[res] + val));
      });
      setTimeout(() => showToast(`⚜ ${bonus.label}`, 'good'), 200);
      updateHUD(); saveGame();
    }

    // ── POST-TRONO: pressione giuramenti — casate neutrali si agitano ──
    if (state.isPlayerKing && !_inActiveWar) {
      const turnsSinceKing = state.turn - (state.playerBecameKingTurn || state.turn);
      if (turnsSinceKing > 0 && turnsSinceKing % 8 === 0) {
        const kingHouseId = state.kingHouseAffiliation;
        Object.entries(state.houses).forEach(([id, h]) => {
          if (id === kingHouseId || h.suppressed || h.kingAlly || h.status === 'enemy') return;
          // Casata neutrale da troppo tempo → diventa nemica (25% chance ogni 8 turni)
          if (Math.random() < 0.25) {
            h.status = 'enemy';
            if (state.pendingLoyaltyPledges) {
              state.pendingLoyaltyPledges = state.pendingLoyaltyPledges.filter(pid => pid !== id);
            }
            state.eventQueue.unshift({
              id: 'king_pledge_refused_drift_' + id + '_' + state.turn,
              speaker: `${h.icon} Casa ${h.name}`,
              speakerRole: 'Sfida aperta alla Corona',
              portrait: h.icon, icon: h.icon,
              text: `«Non riconosceremo mai chi ha preso il trono col sangue.» Casa ${h.name} ha alzato i suoi stendardi contro la Corona. La vostra mancanza di azione diplomatica ha dato loro il tempo di organizzarsi.`,
              leftText: 'Accetta la sfida — prepara la guerra', leftEffects: { power: +2 },
              rightText: 'Tenta un ultimo messaggio', rightEffects: { gold: -8, power: -5 },
              tags: ['post_king_rebellion', 'war_choice'],
              onRightChoose: () => {
                // Last chance: 40% they accept and return to neutral
                if (Math.random() < 0.40) {
                  h.status = 'neutral';
                  showToast(`📜 ${h.icon} Casa ${h.name} ha accettato di riaprire i negoziati.`, 'good');
                } else {
                  showToast(`⚔ ${h.icon} Casa ${h.name} ha respinto il messaggero. La guerra è inevitabile.`, 'warn');
                }
                updateHUD(); saveGame(); renderDiplomacy?.();
              },
            });
            showToast(`⚔ ${h.icon} Casa ${h.name} si ribella alla Corona — troppo tempo senza giuramento!`, 'warn');
          }
        });
      }
    }

    // ── Check alliance rejection anger ──
    if (!_inActiveWar) checkAllianceRejectionAnger();

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

    // During active war prep or king challenge — if queue is empty, show a neutral waiting card
    // instead of drawing a random deck card that could apply effects
    if (state.pendingWarTarget || state.pendingWarDeclaration || state.pendingKingChallenge) {
      currentCard = {
        id: 'war_wait',
        speaker: 'Maestro dei Sussurri', speakerRole: 'In attesa di sviluppi',
        portrait: '🕯', icon: '🕯',
        text: 'Le truppe sono in marcia. I corvi volano tra le casate. Il prossimo turno porterà nuove informazioni dal fronte.',
        leftText: 'Attendi', leftEffects: {},
        rightText: 'Attendi', rightEffects: {},
        tags: ['war_pending'],
      };
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
      // State condition — function that receives state and returns bool
      if (e.requiresState && !e.requiresState(state)) return false;
      // Character whitelist: if forChars is set, only show to those characters
      if (e.forChars && !e.forChars.includes(charId)) return false;
      // Character blacklist: never show to these characters
      if (e.excludeChars && e.excludeChars.includes(charId)) return false;
      // Custom character card role filtering
      if (charId === 'custom' && state.customCardRole) {
        // Shadow cards (arya/littlefinger specific) excluded for nobles and vice versa
        if (state.customCardRole === 'noble' && e.forChars && e.forChars.every(c => ['arya','littlefinger','bronn','theon','tormund','oberyn','ygritte','sandor','jorah','brienne','davos'].includes(c))) return false;
        if (state.customCardRole === 'shadow' && e.forChars && e.forChars.every(c => ['tyrion','ned','catelyn','sansa','margaery','olenna','jaime','daenerys','cersei','stannis','robb','roose','ramsay','tywin','viserys','rhaenyra','aegon_t'].includes(c))) return false;
      }
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
    const validPretenders = COUP_PRETENDERS.filter(p => {
      if (p.id.replace('_coup','') === state.king) return false;
      if (p.id.replace('_coup','') === state.character.id) return false;
      return true;
    });
    if (validPretenders.length === 0) { state.coupScheduled = false; return; }
    const pretender = rand(validPretenders);

    state.eventQueue.push({
      id: 'coup_warning_' + state.turn,
      speaker: 'Spia di corte',
      speakerRole: 'Notizia urgente — Complotto al Trono',
      portrait: '🔔', icon: '🔔',
      text: `Voci sempre più insistenti parlano di un piano di rovesciamento. ${pretender.name} sta radunando forze nell'ombra e potrebbe presto sfidare il trono. Volete prendere misure preventive?`,
      leftText: 'Ignora le voci', leftEffects: {},
      rightText: 'Allerta le guardie', rightEffects: { gold: -10, army: +5 },
      tags: ['coup_warning'],
      onLeftChoose:  () => _resolveCoup(pretender, false),
      onRightChoose: () => _resolveCoup(pretender, true),
    });
  }

  function _resolveCoup(pretender, playerAlerted) {
    // Coup success probability based on player's strength and whether they acted
    const playerArmy  = state.resources.army;
    const playerPower = state.resources.power;
    const kingArmy    = state.kingArmy || 70;

    // Base coup chance depends on pretender's strength vs current king
    let coupChance = 0.70; // base: 70% coup succeeds

    // Player acting reduces coup chance
    if (playerAlerted) coupChance -= 0.20;

    // If player is strong and allied with the king → more likely to stop it
    const playerAlliedWithKing = state.houses[state.kingHouseAffiliation]?.status === 'ally';
    if (playerAlliedWithKing) coupChance -= 0.15;

    // High player army also deters the coup
    if (playerArmy > 70) coupChance -= 0.10;
    if (playerPower > 70) coupChance -= 0.10;

    coupChance = Math.max(0.15, Math.min(0.90, coupChance));
    const coupSucceeds = Math.random() < coupChance;

    if (coupSucceeds) {
      triggerCoup(pretender);
    } else {
      // Coup failed — pretender flees, current king is grateful
      showCoupFailedOverlay(pretender, playerAlerted);
      // Reward: if player alerted, king is more favorable
      if (playerAlerted) {
        state.resources.power = clampRes(state.resources.power + 8);
        // King's house becomes less hostile
        const kh = state.houses[state.kingHouseAffiliation];
        if (kh && kh.status === 'neutral') {
          showToast(`👑 ${state.kingName} vi è grato per l'avvertimento. La Corona vi guarda con meno sospetto.`, 'good');
        }
      }
    }
  }

  function showCoupFailedOverlay(pretender, playerAlerted) {
    // Pretender's house loses troops in the failed attempt
    const ph = state.houses[pretender.house];
    let armyLostNote = '';
    if (ph && !ph.suppressed) {
      const lostPct  = 0.20 + Math.random() * 0.20; // 20–40% army lost
      const armyLost = Math.max(5, Math.floor(ph.army * lostPct));
      ph.army        = Math.max(5, ph.army - armyLost);
      armyLostNote   = `<p style="font-size:0.82rem;color:#f87171;margin-top:0.4rem">⚔ Casa ${pretender.name} ha perso ${armyLost} soldati nel tentativo fallito.</p>`;
    }
    const overlay = document.createElement('div');
    overlay.className = 'war-overlay';
    overlay.style.background = 'rgba(10, 20, 10, 0.96)';
    overlay.innerHTML = `
      <div style="font-size:3rem">🛡</div>
      <div class="war-title" style="font-size:1.3rem;color:#4ade80">Complotto Sventato!</div>
      <div class="war-log">
        <p><strong>${pretender.name}</strong> ha tentato di rovesciare il Trono, ma il piano è fallito.</p>
        <br>
        <p style="font-style:italic;color:#e8dcc8">${playerAlerted ? `Le guardie allertate hanno intercettato le forze ribelli prima che raggiungessero Approdo del Re.` : `Le spie del Re hanno scoperto il complotto in tempo. ${pretender.name} è fuggito nell'ombra.`}</p>
        ${armyLostNote}
        <br>
        <p style="font-size:0.85rem;color:#9a8a6a">${pretender.name} è ancora in libertà. Potrebbe ritentare.</p>
      </div>
      <button class="btn-primary" style="max-width:220px"
        onclick="this.parentElement.remove();Game.checkAndContinue()">
        Continua
      </button>
    `;
    document.body.appendChild(overlay);
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

    // Reset king demand state for new king
    state.kingDemandRefusals = 0;
    state.kingAllyBlocked = false;
    state.kingDemandCooldown = 0;

    // Update kingAlly flags — clear all, then set for new king's house
    Object.keys(state.houses).forEach(hId => {
      if (state.houses[hId]) state.houses[hId].kingAlly = false;
    });
    if (state.houses[pretender.house]) {
      state.houses[pretender.house].kingAlly = true;
    }

    // Update house relationships based on new king's alliances
    pretender.allies.forEach(hId => {
      if (state.houses[hId]) {
        state.houses[hId].status = 'neutral'; // allied to new king but not necessarily enemy of player
        state.houses[hId].kingAlly = true;
      }
    });
    pretender.enemies.forEach(hId => {
      if (state.houses[hId] && state.houses[hId].status !== 'ally') {
        state.houses[hId].status = 'enemy';
      }
    });

    // If the player had "defeat the king" as objective and new king was their ally → now rival
    const playerWantedThrone = char.objectiveCheck.toString().includes('defeated_king') ||
                               char.objectiveCheck.toString().includes('king');
    if (playerWantedThrone && pretender.allies.some(a => state.houses[a]?.status === 'ally')) {
      const newKingHouse = pretender.allies[0];
      if (state.houses[newKingHouse]) {
        state.houses[newKingHouse].status = 'enemy';
      }
      state.resources.power = clampRes(state.resources.power - 10);
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

    // ── Tag theme: applica SOLO alle carte con badge speciale ──
    el.classList.remove('tag-gold','tag-army','tag-faith','tag-people','tag-power');
    document.getElementById('card-tag-layer')?.remove();
    document.getElementById('card-badge-emoji')?.remove();
    const hasSpecialBadge = card.tags?.includes('tribute_demand') || card.tags?.includes('house_attack_final') ||
      card.tags?.includes('king_decree') || card.tags?.includes('pact_response') ||
      card.tags?.includes('coup_warning') || card.tags?.includes('war_pending') ||
      card.tags?.includes('war_start') || card.tags?.includes('king_challenge_pending') ||
      card.tags?.includes('king_challenge_battle') || card.tags?.includes('throne_legitimacy') ||
      card.tags?.includes('betray_consequence') || card.id?.startsWith('ally_resource_request');
    if (hasSpecialBadge) {
      // Prima cerca un tag risorsa nella carta, altrimenti assegna colore in base al tipo badge
      const TAG_PRIORITY = ['army', 'faith', 'people', 'power', 'gold'];
      let primaryTag = TAG_PRIORITY.find(t => card.tags?.includes(t));
      if (!primaryTag) {
        // Fallback: mappa tipo badge → colore tematico
        if (card.tags?.includes('king_decree') || card.tags?.includes('king_challenge_pending') ||
            card.tags?.includes('king_challenge_battle') || card.tags?.includes('throne_legitimacy')) {
          primaryTag = 'power';   // viola/corona per tutto ciò che riguarda il re
        } else if (card.tags?.includes('war_pending') || card.tags?.includes('war_start') ||
                   card.tags?.includes('tribute_demand') || card.tags?.includes('house_attack_final') ||
                   card.tags?.includes('betray_consequence')) {
          primaryTag = 'army';    // rosso/spade per guerra e tradimento
        } else if (card.tags?.includes('pact_response')) {
          primaryTag = 'faith';   // ambra per i patti
        } else if (card.tags?.includes('coup_warning')) {
          primaryTag = 'power';   // viola per i colpi di stato
        } else if (card.id?.startsWith('ally_resource_request')) {
          primaryTag = 'people';  // verde per richieste alleati
        }
      }
      if (primaryTag) {
        el.classList.add('tag-' + primaryTag);
        const layer = document.createElement('div');
        layer.id = 'card-tag-layer';
        layer.className = 'card-tag-layer card-tag-' + primaryTag;
        el.insertBefore(layer, el.firstChild);

        // Emoji animata in basso a destra
        document.getElementById('card-badge-emoji')?.remove();
        const BADGE_EMOJI = {
          army:   '⚔',
          power:  '👑',
          gold:   '💰',
          people: '👥',
          faith:  '✝',
        };
        const BADGE_COLOR = {
          army:   'rgba(239,68,68,0.55)',
          power:  'rgba(139,92,246,0.55)',
          gold:   'rgba(201,168,76,0.55)',
          people: 'rgba(74,222,128,0.5)',
          faith:  'rgba(251,191,36,0.5)',
        };
        const emoji = document.createElement('div');
        emoji.id = 'card-badge-emoji';
        emoji.textContent = BADGE_EMOJI[primaryTag] || '✦';
        emoji.style.cssText = `
          position:absolute; bottom:48px; right:10px;
          font-size:2.2rem;
          opacity:0.22;
          pointer-events:none;
          z-index:2;
          filter: drop-shadow(0 0 8px ${BADGE_COLOR[primaryTag]});
          animation: badge-emoji-float 2.8s ease-in-out infinite;
          transform-origin: center;
        `;
        el.appendChild(emoji);

        // Inietta keyframe se non esiste
        if (!document.getElementById('badge-emoji-style')) {
          const s2 = document.createElement('style');
          s2.id = 'badge-emoji-style';
          s2.textContent = `
            @keyframes badge-emoji-float {
              0%,100% { transform: scale(1) rotate(-4deg);   opacity:0.18; }
              50%     { transform: scale(1.12) rotate(4deg); opacity:0.30; }
            }
          `;
          document.head.appendChild(s2);
        }
      }
    }

    // Inject shared card-badge CSS once
    if (!document.getElementById('ultimatum-style')) {
      const s = document.createElement('style');
      s.id = 'ultimatum-style';
      s.textContent = `
        @keyframes ultimatum-pulse { 0%,100%{opacity:0.35} 50%{opacity:1} }
        @keyframes ally-req-pulse  { 0%,100%{opacity:0.3}  50%{opacity:0.9} }
      `;
      document.head.appendChild(s);
    }

    // Detect card type
    const isUltimatum       = card.tags?.includes('tribute_demand') || card.tags?.includes('house_attack_final');
    const isAllyReq         = card.id?.startsWith('ally_resource_request');
    const isKingDecree      = card.tags?.includes('king_decree');
    const isPactResponse    = card.tags?.includes('pact_response');
    const isCoupWarning     = card.tags?.includes('coup_warning');
    const isWarPending      = card.tags?.includes('war_pending') || card.tags?.includes('war_start');
    const isKingChallenge   = card.tags?.includes('king_challenge_pending') || card.tags?.includes('king_challenge_battle');
    const isThroneLegit     = card.tags?.includes('throne_legitimacy');
    const isBetrayConsq     = card.tags?.includes('betray_consequence');

    // Extract houseId from ally request card id (format: ally_resource_request_HID_turn)
    let allyReqHouseId = null;
    let refusalCount   = 0;
    if (isAllyReq) {
      // id is: ally_resource_request_Stark_12 → split by _
      const parts = card.id.split('_');
      // parts: ['ally','resource','request', hId, turn]
      allyReqHouseId = parts[3] || null;
      refusalCount   = allyReqHouseId ? ((state.exchangeCount || {})[allyReqHouseId] || 0) : 0;
    }
    const allyNearBreak = isAllyReq && refusalCount >= 2; // 2 rifiuti → prossimo rompe

    // Apply border + shadow
    if (isUltimatum) {
      el.style.borderColor = 'rgba(239,68,68,0.85)';
      el.style.boxShadow   = '0 10px 60px rgba(0,0,0,0.8),0 0 0 1px rgba(239,68,68,0.4),0 0 24px rgba(239,68,68,0.2)';
    } else if (isKingDecree || isKingChallenge) {
      el.style.borderColor = 'rgba(251,191,36,0.9)';
      el.style.boxShadow   = '0 10px 60px rgba(0,0,0,0.85),0 0 0 1px rgba(201,168,76,0.5),0 0 28px rgba(201,168,76,0.25)';
    } else if (isAllyReq) {
      el.style.borderColor = allyNearBreak ? 'rgba(251,191,36,0.85)' : 'rgba(74,222,128,0.7)';
      el.style.boxShadow   = allyNearBreak
        ? '0 10px 60px rgba(0,0,0,0.8),0 0 0 1px rgba(251,191,36,0.3),0 0 18px rgba(251,191,36,0.15)'
        : '0 10px 60px rgba(0,0,0,0.8),0 0 0 1px rgba(74,222,128,0.3),0 0 16px rgba(74,222,128,0.12)';
    } else if (isPactResponse) {
      el.style.borderColor = 'rgba(167,139,250,0.8)';
      el.style.boxShadow   = '0 10px 60px rgba(0,0,0,0.8),0 0 0 1px rgba(167,139,250,0.35),0 0 20px rgba(167,139,250,0.15)';
    } else if (isCoupWarning) {
      el.style.borderColor = 'rgba(192,132,252,0.85)';
      el.style.boxShadow   = '0 10px 60px rgba(0,0,0,0.85),0 0 0 1px rgba(192,132,252,0.4),0 0 22px rgba(192,132,252,0.2)';
    } else if (isWarPending) {
      el.style.borderColor = 'rgba(251,146,60,0.8)';
      el.style.boxShadow   = '0 10px 60px rgba(0,0,0,0.8),0 0 0 1px rgba(251,146,60,0.35),0 0 18px rgba(251,146,60,0.15)';
    } else if (isThroneLegit) {
      el.style.borderColor = 'rgba(201,168,76,0.9)';
      el.style.boxShadow   = '0 10px 60px rgba(0,0,0,0.85),0 0 0 2px rgba(201,168,76,0.5),0 0 32px rgba(201,168,76,0.3)';
    } else if (isBetrayConsq) {
      el.style.borderColor = 'rgba(239,68,68,0.7)';
      el.style.boxShadow   = '0 10px 60px rgba(0,0,0,0.8),0 0 0 1px rgba(239,68,68,0.3),0 0 16px rgba(239,68,68,0.12)';
    } else {
      el.style.borderColor = '';
      el.style.boxShadow   = '';
    }

    // Flash overlay
    let flashEl = document.getElementById('card-special-flash');
    const hasSpecial = isUltimatum || isAllyReq || isKingDecree || isKingChallenge ||
                       isPactResponse || isCoupWarning || isWarPending || isThroneLegit || isBetrayConsq;
    if (hasSpecial) {
      if (!flashEl) {
        flashEl = document.createElement('div');
        flashEl.id = 'card-special-flash';
        flashEl.style.cssText = 'position:absolute;inset:0;border-radius:8px;pointer-events:none;z-index:5;';
        el.appendChild(flashEl);
      }
      if (isKingDecree || isKingChallenge || isThroneLegit) {
        flashEl.style.background = 'linear-gradient(135deg,rgba(201,168,76,0.09) 0%,transparent 55%)';
        flashEl.style.animation  = 'ultimatum-pulse 2.5s ease-in-out infinite';
      } else if (isUltimatum || isBetrayConsq) {
        flashEl.style.background = 'linear-gradient(135deg,rgba(239,68,68,0.07) 0%,transparent 55%)';
        flashEl.style.animation  = 'ultimatum-pulse 2s ease-in-out infinite';
      } else if (allyNearBreak) {
        flashEl.style.background = 'linear-gradient(135deg,rgba(251,191,36,0.08) 0%,transparent 55%)';
        flashEl.style.animation  = 'ultimatum-pulse 1.6s ease-in-out infinite';
      } else if (isAllyReq) {
        flashEl.style.background = 'linear-gradient(135deg,rgba(74,222,128,0.06) 0%,transparent 55%)';
        flashEl.style.animation  = 'ally-req-pulse 2.2s ease-in-out infinite';
      } else if (isPactResponse) {
        flashEl.style.background = 'linear-gradient(135deg,rgba(167,139,250,0.07) 0%,transparent 55%)';
        flashEl.style.animation  = 'ally-req-pulse 2.5s ease-in-out infinite';
      } else if (isCoupWarning) {
        flashEl.style.background = 'linear-gradient(135deg,rgba(192,132,252,0.08) 0%,transparent 55%)';
        flashEl.style.animation  = 'ultimatum-pulse 2.8s ease-in-out infinite';
      } else if (isWarPending) {
        flashEl.style.background = 'linear-gradient(135deg,rgba(251,146,60,0.07) 0%,transparent 55%)';
        flashEl.style.animation  = 'ultimatum-pulse 2s ease-in-out infinite';
      }
    } else {
      if (flashEl) flashEl.remove();
    }

    // Top badge
    let badge = document.getElementById('card-special-badge');
    if (hasSpecial) {
      if (!badge) {
        badge = document.createElement('div');
        badge.id = 'card-special-badge';
        badge.style.cssText = `
          position:absolute;bottom:10px;top:auto;left:50%;transform:translateX(-50%);
          color:#fff;font-family:'Cinzel',serif;font-size:0.6rem;font-weight:700;
          letter-spacing:0.12em;text-transform:uppercase;
          padding:0.18rem 0.65rem;border-radius:20px;z-index:10;white-space:nowrap;
        `;
        el.appendChild(badge);
      }
      const refusals = state.kingDemandRefusals || 0;
      if (isKingDecree) {
        badge.textContent      = refusals === 0 ? '👑 DECRETO REALE' : refusals === 1 ? '⚠ SECONDO AVVISO — CORONA' : '⚠ ULTIMO AVVISO — CORONA';
        badge.style.background = refusals === 0 ? 'linear-gradient(135deg,#78350f,#c9a84c)' : 'linear-gradient(135deg,#7f1d1d,#f59e0b)';
        badge.style.boxShadow  = refusals === 0 ? '0 2px 10px rgba(201,168,76,0.6)' : '0 2px 10px rgba(245,158,11,0.6)';
      } else if (isKingChallenge) {
        badge.textContent      = '⚔ SFIDA AL TRONO';
        badge.style.background = 'linear-gradient(135deg,#7f1d1d,#c9a84c)';
        badge.style.boxShadow  = '0 2px 10px rgba(201,168,76,0.5)';
      } else if (isThroneLegit) {
        badge.textContent      = '👑 LEGITTIMITÀ DEL TRONO';
        badge.style.background = 'linear-gradient(135deg,#78350f,#c9a84c)';
        badge.style.boxShadow  = '0 2px 12px rgba(201,168,76,0.7)';
      } else if (isUltimatum) {
        badge.textContent      = card.tags?.includes('house_attack_final') ? '⚔ ATTACCO IMMINENTE' : '⚠ ULTIMATUM';
        badge.style.background = 'linear-gradient(135deg,#7f1d1d,#dc2626)';
        badge.style.boxShadow  = '0 2px 8px rgba(239,68,68,0.55)';
      } else if (isBetrayConsq) {
        badge.textContent      = '💔 CONSEGUENZA DEL TRADIMENTO';
        badge.style.background = 'linear-gradient(135deg,#7f1d1d,#dc2626)';
        badge.style.boxShadow  = '0 2px 8px rgba(239,68,68,0.45)';
      } else if (isWarPending) {
        badge.textContent      = card.tags?.includes('war_start') ? '⚔ GUERRA DICHIARATA' : '⚔ PREPARAZIONE ALLA GUERRA';
        badge.style.background = 'linear-gradient(135deg,#7c2d12,#ea580c)';
        badge.style.boxShadow  = '0 2px 8px rgba(251,146,60,0.5)';
      } else if (isPactResponse) {
        badge.textContent      = '🩸 PATTO DI SANGUE';
        badge.style.background = 'linear-gradient(135deg,#4c1d95,#7c3aed)';
        badge.style.boxShadow  = '0 2px 8px rgba(167,139,250,0.5)';
      } else if (isCoupWarning) {
        badge.textContent      = '🟣 COMPLOTTO AL TRONO';
        badge.style.background = 'linear-gradient(135deg,#3b0764,#7e22ce)';
        badge.style.boxShadow  = '0 2px 8px rgba(192,132,252,0.5)';
      } else if (allyNearBreak) {
        badge.textContent      = `⚠ ULTIMO AVVISO — ${card.speaker}`;
        badge.style.background = 'linear-gradient(135deg,#78350f,#f59e0b)';
        badge.style.boxShadow  = '0 2px 8px rgba(251,191,36,0.5)';
      } else {
        badge.textContent      = '🤝 RICHIESTA ALLEATO';
        badge.style.background = 'linear-gradient(135deg,#14532d,#16a34a)';
        badge.style.boxShadow  = '0 2px 8px rgba(74,222,128,0.4)';
      }
    } else {
      if (badge) badge.remove();
    }

    document.getElementById('card-speaker-icon').textContent = card.icon || '📜';
    document.getElementById('card-speaker-name').textContent = card.speaker;
    document.getElementById('card-speaker-role').textContent = card.speakerRole;
    document.getElementById('card-portrait').textContent = card.portrait || '📜';
    document.getElementById('card-text').textContent = card.text;

    document.getElementById('choice-left-text').textContent = card.leftText || 'Rifiuta';
    document.getElementById('choice-right-text').textContent = card.rightText || 'Accetta';

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
    // Tutorial hook — if waiting for a card choice, advance tutorial
    if (_tutorialActive && _tutorialPendingStep === 'wait_choice') _tutOnChoice();

    const effects = side === 'left' ? currentCard.leftEffects : currentCard.rightEffects;
    const tags = side === 'left' ? (currentCard.leftTags || currentCard.tags || []) : (currentCard.rightTags || currentCard.tags || []);

    // Apply effects — use clampRes so dynamic cap from conquests is respected
    if (effects) {
      Object.entries(effects).forEach(([key, val]) => {
        if (state.resources[key] !== undefined) {
          state.resources[key] = clampRes(state.resources[key] + val);
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
        _resetBetrayalReduction(betrayed);
        showToast(`⚠ Casa ${betrayed} ti considera ora un traditore!`, 'warn');
        // Queue a consequence card in ~10-20 turns
        state.eventQueue.push({
          id: 'betrayal_consequence_' + state.turn,
          speaker: `Portavoce di Casa ${betrayed}`,
          speakerRole: 'Messaggero arrabbiato',
          portrait: '📩', icon: '📩',
          text: `«Avevamo fiducia in voi. Al turno ${state.turn} ci avete tradito. Ora subirete le conseguenze.»`,
          leftText: 'Scusarti umilmente', leftEffects: { power: -10, gold: -10 },
          rightText: 'Ignorarli', rightEffects: { army: -14, people: -10 },
          minTurn: state.turn + 10,
          tags: ['betray_consequence'],
        });
      }
    }

    // Animate card out — slide + rotate like Reigns
    const el = document.getElementById('main-card');
    el.style.transition = '';
    el.style.transform = '';
    void el.offsetWidth;
    // Se la carta è già inclinata per swipe lascia fare al CSS,
    // altrimenti aggiungi rotazione iniziale leggera per i bottoni
    const currentTransform = el.style.transform || '';
    if (!currentTransform.includes('rotate')) {
      el.style.transform = side === 'left' ? 'rotate(-3deg)' : 'rotate(3deg)';
      void el.offsetWidth;
    }
    el.classList.add(side === 'left' ? 'swipe-left' : 'swipe-right');

    state.turn++;

    // Melisandre tracker
    if (state.character.id === 'melisandre') {
      if (state.resources.faith >= 75) {
        state.faithHighTurns = (state.faithHighTurns || 0) + 1;
      } else {
        state.faithHighTurns = 0;
      }
    }

    // Check if this card wants to pause flow (e.g. diplomacy overlay opens)
    const pauseFlow = currentCard._pauseAfterChoice === side || currentCard._pauseAfterChoice === 'both';

    setTimeout(() => {
      el.style.transition = 'none';
      el.classList.remove('swipe-left', 'swipe-right');
      el.style.transform = '';
      el.style.opacity = '1';
      void el.offsetWidth;
      el.style.transition = '';

      checkGameOver();
      if (!state.gameOver && !pauseFlow) {
        updateHUD();
        drawNextCard();
        saveGame();
      } else if (!state.gameOver && pauseFlow) {
        // Flow paused — HUD and save still happen, card draw resumes via resumeCardFlow()
        updateHUD();
        saveGame();
      }
    }, 420);
  }

  // Called to resume card flow after a pause (e.g. after diplomacy overlay closes)
  function resumeCardFlow() {
    checkGameOver();
    if (!state.gameOver) {
      updateHUD();
      drawNextCard();
      saveGame();
    }
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
    return 100; // Cap fisso — le conquiste non espandono il cap (anti-snowball)
  }

  // clamp using dynamic cap
  function clampRes(v) {
    return Math.max(0, Math.min(getResourceCap(), Math.round(v)));
  }

  // ══════════════════════════════════════════════
  // GAME OVER CHECK — min (≤0) AND max (≥cap)
  // ══════════════════════════════════════════════
  function checkGameOver() {
    if (state._skipGameOverThisTurn) {
      state._skipGameOverThisTurn = false;
      return;
    }
    const r    = state.resources;
    const char = state.character;
    const cap  = getResourceCap();
    const id   = char.id;

    // ── Categorie ────────────────────────────────────────────
    // Regnanti / pretendenti al trono
    const isRuler     = ['daenerys','cersei','stannis','robb'].includes(id) || state.isPlayerKing;
    // Nobili di casata
    const isNoble     = ['tyrion','ned','catelyn','sansa','margaery','olenna','jaime'].includes(id)
                     || (id === 'custom' && state.customCardRole === 'noble');
    // Assassini / intriganti
    const isShadow    = ['arya','littlefinger'].includes(id)
                     || (id === 'custom' && state.customCardRole === 'shadow');
    // Mistici / religiosi
    const isReligious = ['melisandre'].includes(id);
    // Guerrieri / mercenari / popolo libero
    const isFighter   = ['bronn','theon','tormund','oberyn'].includes(id);

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

    // ── Banner VITTORIA / SCONFITTA prominente ──
    const bannerEl = document.getElementById('ending-banner');
    if (bannerEl) {
      bannerEl.textContent = won ? '✦ VITTORIA ✦' : '✦ SCONFITTA ✦';
      bannerEl.style.color = won ? '#4ade80' : '#f87171';
      bannerEl.style.borderColor = won ? 'rgba(74,222,128,0.4)' : 'rgba(239,68,68,0.4)';
      bannerEl.style.background = won ? 'rgba(74,222,128,0.08)' : 'rgba(239,68,68,0.08)';
      bannerEl.style.textShadow = won ? '0 0 30px rgba(74,222,128,0.6)' : '0 0 30px rgba(239,68,68,0.6)';
    }

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
      // Tutorial hook — if waiting for diplomacy open, advance tutorial
      if (_tutorialActive && _tutorialPendingStep === 'wait_diplo') _tutOnDiplo();
    } else {
      panel.classList.add('hidden');
      document.getElementById('house-popup')?.remove();
      state.ravenTarget = null;
    }
  }

  function buildChallengeButton() {
    // If already declared, show countdown
    if (state.pendingKingChallenge) {
      const turnsLeft = Math.max(0, state.pendingKingChallenge.battleTurn - state.turn);
      return `<div style="padding:0.65rem 0.75rem;background:rgba(127,29,29,0.3);border:1px solid rgba(239,68,68,0.4);border-radius:4px;font-family:'Cinzel',serif;font-size:0.78rem;color:#fca5a5;text-align:center;letter-spacing:0.06em">
        ⚔ Guerra al Re dichiarata — mancano <strong>${turnsLeft}</strong> ${turnsLeft === 1 ? 'turno' : 'turni'}<br>
        <span style="font-size:0.7rem;font-family:'EB Garamond',serif;color:#9a8a6a;font-style:italic">Apri Diplomazia per richiedere rinforzi</span>
      </div>`;
    }

    const canChallenge = state.resources.army > 80 &&
      Object.values(state.houses).filter(h => h.status === 'ally').length >= 2;
    if (canChallenge) {
      return '<button onclick="Game.challengeKing();Game.toggleDiplomacy();" style="width:100%;padding:0.65rem;background:linear-gradient(135deg,rgba(127,29,29,0.8),rgba(153,27,27,0.9));border:1px solid rgba(239,68,68,0.5);border-radius:2px;font-family:Cinzel,serif;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#fca5a5;transition:all 0.2s">⚔ Sfida il Re Reggente</button><p style="font-size:0.7rem;color:#6b5e4a;margin-top:0.35rem;font-family:EB Garamond,serif;font-style:italic">⚠ Irreversibile · costa -12 Popolo · serve Esercito >80 e 2+ alleati</p>';
    }
    const armyVal = Math.round(state.resources.army);
    const allyCount = Object.values(state.houses).filter(h => h.status === 'ally').length;
    return '<div style="padding:0.6rem;background:rgba(100,80,50,0.1);border:1px solid rgba(201,168,76,0.2);border-radius:4px;font-family:EB Garamond,serif;font-size:0.82rem;color:#6b5e4a;line-height:1.6">' +
      '\uD83D\uDD12 Per sfidare il Re devi avere:<br>' +
      '\u2694 Esercito >80 (attuale: ' + armyVal + (armyVal > 80 ? ' \u2713' : ' \u2717') + ')<br>' +
      '\uD83E\uDD1D Almeno 2 casate alleate (attuale: ' + allyCount + (allyCount >= 2 ? ' \u2713' : ' \u2717') + ')</div>';
  }

  function renderDiplomacy() {
    const container = document.getElementById('diplo-houses');
    container.innerHTML = '';

    // ── War prep banner ──
    const warPrep  = state.pendingWarDeclaration;
    const kingPrep = state.pendingKingChallenge;
    if (warPrep || kingPrep) {
      const banner = document.createElement('div');
      banner.style.cssText = 'margin-bottom:0.85rem;padding:0.65rem 0.75rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.4);border-radius:4px;font-family:\'Cinzel\',serif;font-size:0.72rem;color:#fca5a5;line-height:1.6';
      if (warPrep) {
        const h = state.houses[warPrep.houseId];
        const t = Math.max(1, warPrep.revealTurn - state.turn);
        banner.innerHTML = `⚔ <strong>Guerra a Casa ${h?.name||'?'}</strong> — mancano <strong>${t}</strong> ${t===1?'turno':'turni'}<br><span style="font-family:'EB Garamond',serif;font-size:0.82rem;color:#e8dcc8">Clicca un alleato per chiedergli rinforzi.</span>`;
      } else {
        const t = Math.max(1, kingPrep.battleTurn - state.turn);
        banner.innerHTML = `👑 <strong>Sfida al Re</strong> — mancano <strong>${t}</strong> ${t===1?'turno':'turni'}<br><span style="font-family:'EB Garamond',serif;font-size:0.82rem;color:#e8dcc8">Clicca un alleato per chiedergli rinforzi.</span>`;
      }
      container.appendChild(banner);
    }

    // ── Throne section — Casa Regnante in primo piano ──
    const kingHouseId = state.kingHouseAffiliation;
    const kingH = state.houses[kingHouseId];
    if (kingH) {
      const sec = document.createElement('div');
      sec.style.cssText = 'margin-bottom:1rem;';

      const diff = state.character.difficulty;
      const diffMod = { easy:0.80, medium:1.0, hard:1.25 }[diff] || 1.0;
      const kingForceEst = Math.round((state.kingArmy||65)*diffMod);
      const playerForceEst = Math.round(state.resources.army + Object.values(state.houses).filter(h=>h.status==='ally').reduce((s,h)=>s+h.army*0.4,0));
      const winPct = Math.round(Math.min(95,Math.max(5,(playerForceEst/(playerForceEst+kingForceEst))*100)));

      const armyVal = Math.round(state.resources.army);
      const allyCount = Object.values(state.houses).filter(h=>h.status==='ally').length;
      const canChallenge = armyVal > 80 && allyCount >= 2 && !state.pendingKingChallenge && !state.isPlayerKing;

      sec.innerHTML = `
        <div style="font-family:'Cinzel',serif;font-size:0.62rem;color:#c084fc;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.4rem">👑 Casa Regnante</div>
        <div style="background:rgba(192,132,252,0.06);border:2px solid rgba(192,132,252,0.5);border-radius:6px;padding:0.8rem;cursor:pointer;position:relative;overflow:hidden"
             onclick="Game._openKingDetailPopup()">
          <!-- Sfondo stemma -->
          ${kingH?.crest ? `<img src="${kingH.crest}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:0.05;pointer-events:none;filter:blur(1px)">` : ''}
          <div style="position:relative;display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem">
            <!-- Ritratto re -->
            <div style="width:3rem;height:3rem;border-radius:50%;overflow:hidden;border:2px solid rgba(192,132,252,0.6);flex-shrink:0;background:rgba(0,0,0,0.5)">
              <img src="images/characters/${state.king}.png" alt="${state.kingName}"
                style="width:100%;height:100%;object-fit:cover;object-position:top"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
              <span style="display:none;font-size:1.5rem;width:100%;height:100%;align-items:center;justify-content:center">${POSSIBLE_KINGS.find(k=>k.id===state.king)?.icon||'👑'}</span>
            </div>
            <!-- Stemma casata -->
            <span style="width:2rem;height:2rem;display:flex;align-items:center;justify-content:center;flex-shrink:0">${houseIcon(kingH,'1.8rem')}</span>
            <div style="flex:1;min-width:0">
              <div style="font-family:'Cinzel',serif;font-size:0.82rem;color:#c084fc;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${state.kingName}</div>
              <div style="font-size:0.68rem;color:#9a8a6a;font-family:'EB Garamond',serif">Casa ${kingH.name} · ⚔ ${Math.round(kingH.army)} truppe</div>
            </div>
            <span style="font-size:0.65rem;color:#c084fc;font-family:'Cinzel',serif;flex-shrink:0">→</span>
          </div>
          <div style="position:relative">
            ${state.isPlayerKing
              ? `<div style="font-family:'Cinzel',serif;font-size:0.72rem;color:#c9a84c;background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.3);border-radius:3px;padding:0.4rem 0.6rem;text-align:center">👑 Sei il Re Reggente</div>`
              : `<div style="font-family:'EB Garamond',serif;font-size:0.8rem;color:#9a8a6a;line-height:1.5;margin-bottom:0.5rem">
                  <span style="${armyVal>80?'color:#4ade80':'color:#f87171'}">⚔ Esercito >80: ${armyVal} ${armyVal>80?'✓':'✗'}</span> &nbsp;·&nbsp;
                  <span style="${allyCount>=2?'color:#4ade80':'color:#f87171'}">🤝 Alleati ≥2: ${allyCount} ${allyCount>=2?'✓':'✗'}</span> &nbsp;·&nbsp;
                  <span style="color:#9a8a6a">~${winPct}% vittoria</span>
                </div>
                ${canChallenge
                  ? `<div style="font-family:'Cinzel',serif;font-size:0.68rem;color:#f87171;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:3px;padding:0.35rem 0.5rem;text-align:center">⚔ Requisiti soddisfatti — tocca per sfidare il Re</div>`
                  : state.pendingKingChallenge
                    ? `<div style="font-family:'Cinzel',serif;font-size:0.68rem;color:#fca5a5;text-align:center">⚔ Sfida dichiarata — mancano ${Math.max(0,state.pendingKingChallenge.battleTurn-state.turn)} turni</div>`
                    : `<div style="font-family:'Cinzel',serif;font-size:0.68rem;color:#6b5e4a;text-align:center">🔒 Requisiti non soddisfatti — tocca per dettagli</div>`
                }`
            }
          </div>
        </div>`;
      container.appendChild(sec);
    }

    // ── Helper: build one house card ──
    function buildHouseCard(hId, h, section) {
      const isSuppressed = h.suppressed;
      const hasLoan = state.allyLoans && state.allyLoans[hId];
      const intelLevel = (state.spyIntel||{})[hId] || 0;

      let statusLabel = h.status==='ally' ? '✅ Alleata' : h.status==='enemy' ? '⚔ Nemica' : h.status==='diffidente' ? '🕷 Diffidente' : '⚪ Neutrale';
      if (isSuppressed) statusLabel = '💀 Conquistata';
      if (hasLoan) statusLabel += ` (+${state.allyLoans[hId].amount}⚔)`;

      const borderColor = hId===kingHouseId ? 'rgba(192,132,252,0.6)' :
                          h.status==='diffidente' ? 'rgba(251,146,60,0.6)' :
                          h.kingAlly ? 'rgba(251,191,36,0.4)' :
                          h.status==='ally' ? 'rgba(74,222,128,0.5)' :
                          h.status==='enemy' ? 'rgba(239,68,68,0.45)' :
                          'rgba(201,168,76,0.2)';

      const spyDots = intelLevel > 0
        ? `<span style="position:absolute;top:4px;right:5px;display:flex;gap:2px">${Array.from({length:intelLevel}).map(()=>`<span style="width:6px;height:6px;border-radius:50%;background:#fbbf24;box-shadow:0 0 4px rgba(251,191,36,0.7);display:inline-block"></span>`).join('')}</span>`
        : '';

      const card = document.createElement('div');
      card.style.cssText = `position:relative;display:flex;align-items:center;gap:0.55rem;padding:0.5rem 0.6rem;background:#12121a;border:1px solid ${borderColor};border-radius:5px;margin-bottom:0.35rem;cursor:${isSuppressed?'default':'pointer'};opacity:${isSuppressed?'0.4':'1'};transition:background 0.15s;`;
      const nameColor = hId===kingHouseId      ? '#c084fc' :
                        h.status==='ally'      ? '#4ade80' :
                        h.status==='enemy'     ? '#f87171' :
                        h.status==='diffidente'? '#fb923c' :
                        h.suppressed           ? '#4a3f2e' :
                        '#e8dcc8';

      const passiveLabel = '';  // bonus passivo ora legato al personaggio, non alle alleanze

      card.innerHTML = `
        ${spyDots}
        <span style="width:1.8rem;height:1.8rem;display:flex;align-items:center;justify-content:center;flex-shrink:0">${houseIcon(h,'1.6rem')}</span>
        <div style="flex:1;min-width:0">
          <div style="font-family:'Cinzel',serif;font-size:0.75rem;color:${nameColor};font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Casa ${h.name}</div>
          <div style="font-family:'EB Garamond',serif;font-size:0.72rem;color:#9a8a6a">${statusLabel} · ⚔ ${isSuppressed?'—':Math.round(h.army)}</div>
          ${passiveLabel}
        </div>
        ${!isSuppressed ? `<span style="font-size:0.7rem;color:#6b5e4a;font-family:'Cinzel',serif">›</span>` : ''}
      `;
      if (!isSuppressed) {
        card.addEventListener('mouseenter', ()=>{ card.style.background='rgba(201,168,76,0.06)'; });
        card.addEventListener('mouseleave', ()=>{ card.style.background='#12121a'; });
        card.addEventListener('click', ()=> Game._openHousePopup(hId));
      }
      section.appendChild(card);
    }

    // ── POST-TRONO: Banner giuramenti pendenti ──
    if (state.isPlayerKing) {
      const pendingHouses = Object.entries(state.houses).filter(([id, h]) =>
        id !== kingHouseId && !h.suppressed && !h.kingAlly && h.status !== 'enemy'
      );
      const enemyCount = Object.entries(state.houses).filter(([id, h]) =>
        id !== kingHouseId && !h.suppressed && h.status === 'enemy'
      ).length;
      const turnsSinceKing = state.turn - (state.playerBecameKingTurn || state.turn);

      if (pendingHouses.length > 0) {
        const urgency = turnsSinceKing >= 10 ? 'rgba(239,68,68,0.15)' : 'rgba(201,168,76,0.08)';
        const urgencyBorder = turnsSinceKing >= 10 ? 'rgba(239,68,68,0.5)' : 'rgba(201,168,76,0.4)';
        const urgencyColor = turnsSinceKing >= 10 ? '#f87171' : '#c9a84c';
        const banner = document.createElement('div');
        banner.style.cssText = `margin-bottom:0.85rem;padding:0.75rem;background:${urgency};border:1px solid ${urgencyBorder};border-radius:5px;font-family:'Cinzel',serif;`;
        banner.innerHTML = `
          <div style="font-size:0.72rem;color:${urgencyColor};letter-spacing:0.08em;margin-bottom:0.35rem">
            ⚖ ${pendingHouses.length} ${pendingHouses.length===1?'CASATA NON HA':'CASATE NON HANNO'} GIURATO FEDELTÀ
            ${turnsSinceKing >= 10 ? '<span style="font-size:0.65rem;color:#f87171"> — Il ritardo alimenta la ribellione</span>' : ''}
          </div>
          <div style="font-family:\'EB Garamond\',serif;font-size:0.82rem;color:#9a8a6a;margin-bottom:0.5rem">
            Ogni casata che non riconosce il tuo regno è un focolaio di instabilità. Chiedi il loro giuramento — o prepara la guerra.
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:0.4rem">
            ${pendingHouses.map(([id, h]) => {
              const turnsWaiting = turnsSinceKing;
              const isHostile = turnsWaiting >= 8 && Math.random() < 0.3; // just visual hint
              return `<button onclick="Game.requestLoyaltyPledge('${id}');document.getElementById('loyalty-pledge-overlay')" 
                style="padding:0.3rem 0.6rem;background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.35);border-radius:12px;font-family:'EB Garamond',serif;font-size:0.82rem;color:#e8dcc8;cursor:pointer;display:flex;align-items:center;gap:0.3rem">
                ${h.icon} <span>${h.name}</span>
                <span style="font-size:0.65rem;color:#9a8a6a;font-family:'Cinzel',serif">⚖ chiedi</span>
              </button>`;
            }).join('')}
          </div>
        `;
        container.appendChild(banner);
      } else if (enemyCount === 0) {
        // All pledged and no enemies — show unity achieved hint
        const allPledged = document.createElement('div');
        allPledged.style.cssText = 'margin-bottom:0.85rem;padding:0.65rem;background:rgba(74,222,128,0.07);border:1px solid rgba(74,222,128,0.3);border-radius:5px;font-family:\'Cinzel\',serif;font-size:0.72rem;color:#4ade80;text-align:center';
        allPledged.textContent = '✨ Tutte le casate hanno giurato fedeltà alla Corona';
        container.appendChild(allPledged);
      }
    }

    // ── King allies section ──
    const kingAllies = Object.entries(state.houses).filter(([id,h])=> id!==kingHouseId && h.kingAlly && !h.suppressed);
    if (kingAllies.length > 0) {
      const sec = document.createElement('div');
      sec.style.cssText = 'margin-bottom:0.9rem;';
      sec.innerHTML = `<div style="font-family:'Cinzel',serif;font-size:0.6rem;color:#fbbf24;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.4rem">🛡 Fedeli al Re</div>`;
      kingAllies.forEach(([id,h])=> buildHouseCard(id, h, sec));
      container.appendChild(sec);
    }

    // ── Allies section ──
    const allies = Object.entries(state.houses).filter(([id,h])=> id!==kingHouseId && !h.kingAlly && h.status==='ally');
    if (allies.length > 0) {
      const sec = document.createElement('div');
      sec.style.cssText = 'margin-bottom:0.9rem;';
      sec.innerHTML = `<div style="font-family:'Cinzel',serif;font-size:0.6rem;color:#4ade80;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.4rem">🤝 Tuoi Alleati</div>`;
      allies.forEach(([id,h])=> buildHouseCard(id, h, sec));
      container.appendChild(sec);
    }

    // ── Others (neutral, enemy, diffidente, suppressed) ──
    const others = Object.entries(state.houses).filter(([id,h])=> id!==kingHouseId && !h.kingAlly && h.status!=='ally');
    if (others.length > 0) {
      const sec = document.createElement('div');
      sec.style.cssText = 'margin-bottom:0.9rem;';
      sec.innerHTML = `<div style="font-family:'Cinzel',serif;font-size:0.6rem;color:#9a8a6a;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.4rem">⚪ Altre Casate</div>`;
      others.forEach(([id,h])=> buildHouseCard(id, h, sec));
      container.appendChild(sec);
    }

    // ── Legend ──
    const legend = document.createElement('div');
    legend.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.35rem;padding:0.5rem 0;border-top:1px solid rgba(201,168,76,0.12);margin-top:0.4rem;';
    legend.innerHTML = `
      <span style="font-size:0.62rem;font-family:'EB Garamond',serif;color:#4ade80">🟢 Alleata</span> <span style="color:#6b5e4a">·</span>
      <span style="font-size:0.62rem;font-family:'EB Garamond',serif;color:#f87171">🔴 Nemica</span> <span style="color:#6b5e4a">·</span>
      <span style="font-size:0.62rem;font-family:'EB Garamond',serif;color:#c084fc">🟣 Regnante</span> <span style="color:#6b5e4a">·</span>
      <span style="font-size:0.62rem;font-family:'EB Garamond',serif;color:#fbbf24">🟡 Fedele al Re</span> <span style="color:#6b5e4a">·</span>
      <span style="font-size:0.62rem;font-family:'EB Garamond',serif;color:#fb923c">🟠 Diffidente</span>
    `;
    container.appendChild(legend);

    // Hide old raven-select/raven-actions (no longer needed)
    const rs = document.getElementById('raven-select');
    const ra = document.getElementById('raven-actions');
    if (rs) rs.style.display = 'none';
    if (ra) ra.style.display = 'none';
  }

  function _openHousePopup(hId) {
    document.getElementById('house-popup')?.remove();
    state.ravenTarget = hId;
    const h = state.houses[hId];
    if (!h) return;

    const isAlly       = h.status === 'ally';
    const isEnemy      = h.status === 'enemy';
    const isDiffidente = h.status === 'diffidente';
    const isKingHouse  = hId === state.kingHouseAffiliation;
    const isCivilWar   = !!state.civilWar;
    const isSuppressed = h.suppressed;
    const intelLevel   = (state.spyIntel||{})[hId] || 0; // declared here — used both in actions and spyDotsHtml

    // Build action buttons
    let actions = '';

    if (isSuppressed) {
      actions = `<div style="font-family:'EB Garamond',serif;font-size:0.85rem;color:#6b5e4a;font-style:italic;padding:0.5rem 0">💀 Casata conquistata — nessuna azione disponibile.</div>`;
    } else if (isKingHouse) {
      // King house: only challenge or status
      if (!state.isPlayerKing) {
        actions += buildChallengeButton();
      } else {
        actions += `<div style="font-family:'Cinzel',serif;font-size:0.78rem;color:#c9a84c;padding:0.5rem;text-align:center">👑 Sei il Re Reggente dei Sette Regni</div>`;
      }
    } else if (isCivilWar) {
      actions = `<div style="font-family:'EB Garamond',serif;font-size:0.82rem;color:#f87171;font-style:italic;margin-bottom:0.6rem">⚔ Guerra Civile — solo la guerra decide.</div>`;
      if (!isAlly) {
        const isPendingWar = state.pendingWarDeclaration?.houseId === hId;
        actions += isPendingWar
          ? `<button class="btn-raven" disabled style="opacity:0.4;cursor:not-allowed">⚔ Guerra dichiarata — ${Math.max(0,state.pendingWarDeclaration.revealTurn-state.turn)} turni</button>`
          : `<button class="btn-raven" onclick="Game.ravenAction('war');document.getElementById('house-popup')?.remove()" style="border-color:rgba(239,68,68,0.5)">⚔ Dichiara Guerra</button>`;
      }
    } else if (isDiffidente) {
      const pardonCost = (state.diffidentePardonCost||{})[hId] || 20;
      const canAfford  = state.resources.gold >= pardonCost;
      actions = `<div style="font-family:'EB Garamond',serif;font-size:0.82rem;color:#fbbf24;font-style:italic;margin-bottom:0.6rem">🕷 Diffidente — spia scoperta. Paga il perdono per ripristinare i contatti.</div>`;
      actions += canAfford
        ? `<button class="btn-raven" onclick="Game.payDiffidentePardon('${hId}');document.getElementById('house-popup')?.remove()" style="border-color:rgba(251,191,36,0.6);color:#fbbf24">🕷 Paga perdono — 💰${pardonCost} oro</button>`
        : `<button class="btn-raven" disabled style="opacity:0.4">🕷 Perdono: 💰${pardonCost} oro (fondi insufficienti)</button>`;
      actions += `<button class="btn-raven" onclick="Game.ravenAction('war');document.getElementById('house-popup')?.remove()" style="border-color:rgba(239,68,68,0.5)">⚔ Dichiara Guerra</button>`;
    } else {
      // Normal diplomacy
      // Alliance
      if (!isAlly && !isEnemy) {
        const isNewHouseCooldown = state.newHouseAllianceFreeFrom && state.turn < state.newHouseAllianceFreeFrom;
        const cooldown = Math.max(0, ((state.allianceCooldowns||{})[hId]||0) - state.turn);
        if (isNewHouseCooldown) {
          const turnsLeft = state.newHouseAllianceFreeFrom - state.turn;
          actions += `<button class="btn-raven" disabled style="opacity:0.4;font-size:0.68rem">🏰 Casata sconosciuta — alleanze disponibili tra ${turnsLeft} turni</button>`;
        } else {
          actions += cooldown > 0
            ? `<button class="btn-raven" disabled style="opacity:0.4">🤝 Proponi Alleanza (tra ${cooldown} turni)</button>`
            : `<button class="btn-raven" onclick="Game.ravenAction('alliance');document.getElementById('house-popup')?.remove()">🤝 Proponi Alleanza</button>`;
        }
      }
      // Truce
      if (isEnemy) {
        const truceCooldown = Math.max(0, ((state.truceCooldowns||{})[hId]||0) - state.turn);
        const truceRef = (state.truceRefusals||{})[hId] || 0;
        const _attackPenaltyPopup = h.attackedByPlayer
          ? Math.round((20 + h.army * 0.4) * ({ easy:0.7, medium:1.0, hard:1.3 }[state.character?.difficulty] || 1.0))
          : 0;
        const truceCost = 10 + truceRef * 6 + _attackPenaltyPopup;
        actions += truceCooldown > 0
          ? `<button class="btn-raven" disabled style="opacity:0.4">🕊 Tregua (tra ${truceCooldown} turni)</button>`
          : `<button class="btn-raven" onclick="Game.ravenAction('truce');document.getElementById('house-popup')?.remove()" style="border-color:rgba(251,191,36,0.5);color:#fbbf24">🕊 Chiedi Tregua — 💰${truceCost} oro${truceRef>0?' (rifiuto '+truceRef+'×)':''}</button>`;
      }
      // Resources
      if (isAlly) {
        const reqCooldown = Math.max(0, ((state.resourceRequestCooldowns||{})[hId]||0) - state.turn);
        actions += reqCooldown > 0
          ? `<button class="btn-raven" disabled style="opacity:0.4">📦 Risorse (tra ${reqCooldown} turni)</button>`
          : `<button class="btn-raven" onclick="Game.ravenAction('request_resources');document.getElementById('house-popup')?.remove()">📦 Chiedi Risorse</button>`;
        // Tribute offer
        const offered = (state.tributeOffered||{})[hId] || 0;
        const canTrib = state.resources.gold>=10||state.resources.army>=10||state.resources.people>=10||state.resources.faith>=10;
        actions += canTrib
          ? `<button class="btn-raven" onclick="Game.showTributeOfferOverlay('${hId}');document.getElementById('house-popup')?.remove()" style="border-color:rgba(74,222,128,0.45);color:#4ade80">🎁 Offri Tributo${offered>0?' (×'+offered+')':''}</button>`
          : `<button class="btn-raven" disabled style="opacity:0.4">🎁 Offri Tributo (fondi insufficienti)</button>`;
        // Reinforce during war
        const isWarPending = state.pendingWarTarget || state.pendingWarDeclaration?.houseId || state.pendingKingChallenge;
        if (isWarPending) {
          const hasLoan     = state.allyLoans && state.allyLoans[hId];
          const refusalState = (state.allyLoanRefusals || {})[hId];
          if (hasLoan) {
            actions += `<button class="btn-raven" disabled style="opacity:0.5;border-color:rgba(74,222,128,0.3);color:#4ade80">⚔ Rinforzi inviati: +${state.allyLoans[hId].amount}</button>`;
          } else if (refusalState === 'neutral') {
            actions += `<button class="btn-raven" disabled style="opacity:0.5;border-color:rgba(120,120,120,0.3);color:#6b5e4a">🕊 Resta neutrale in questo scontro</button>`;
          } else if (refusalState === 'comp_refused') {
            actions += `<button class="btn-raven" disabled style="opacity:0.5;border-color:rgba(120,120,120,0.3);color:#6b5e4a">✗ Compenso rifiutato</button>`;
          } else {
            actions += `<button class="btn-raven" onclick="Game.requestAllyArmy('${hId}');document.getElementById('house-popup')?.remove()" style="border-color:rgba(74,222,128,0.5);color:#4ade80">⚔ Richiedi Rinforzi</button>`;
          }
        }
      }
      // Loyalty pledge — only when player is king and house hasn't pledged yet
      if (state.isPlayerKing && !isSuppressed && !isKingHouse) {
        const hasPledged = h.kingAlly;
        if (!hasPledged) {
          actions += `<button class="btn-raven" onclick="Game.requestLoyaltyPledge('${hId}');document.getElementById('house-popup')?.remove()" style="border-color:rgba(201,168,76,0.6);color:#c9a84c;background:rgba(201,168,76,0.06)">👑 Chiedi Fedeltà alla Corona</button>`;
        } else {
          actions += `<button class="btn-raven" disabled style="opacity:0.6;border-color:rgba(74,222,128,0.3);color:#4ade80">🛡 Fedele alla Corona</button>`;
        }
      }

      // Spy
      if (intelLevel >= 2) {
        const bc = h.betrayalChance||0, red = h.betrayalReduction||0;
        actions += `<button class="btn-raven" disabled style="opacity:0.65;border-color:rgba(251,191,36,0.4);color:#fbbf24;font-size:0.68rem">🕷 Fedeltà nota: ${Math.max(0,bc-red)}% tradimento</button>`;
      } else {
        const spyCost = intelLevel===0 ? 12 : 18;
        const canSpy  = state.resources.gold >= spyCost;
        actions += canSpy
          ? `<button class="btn-raven" onclick="Game.sendSpy('${hId}');document.getElementById('house-popup')?.remove()" style="border-color:rgba(251,191,36,0.45);color:#fbbf24">🕷 Invia spia (💰${spyCost} — ${intelLevel===0?'info vaga':'info precisa'})</button>`
          : `<button class="btn-raven" disabled style="opacity:0.4">🕷 Spia (💰${spyCost} — fondi insuf.)</button>`;
      }
      // War
      if (!isAlly) {
        const isWarPending2 = state.pendingWarDeclaration?.houseId === hId;
        actions += isWarPending2
          ? `<button class="btn-raven" disabled style="opacity:0.4;font-size:0.7rem">⚔ Guerra in preparazione — ${Math.max(0,state.pendingWarDeclaration.revealTurn-state.turn)} turni</button>`
          : `<button class="btn-raven" onclick="Game.ravenAction('war');document.getElementById('house-popup')?.remove()" style="border-color:rgba(239,68,68,0.5)">⚔ Dichiara Guerra</button>`;
      }
    }

    // Build popup
    const spyDotsHtml = intelLevel > 0
      ? `<span style="display:inline-flex;gap:3px;vertical-align:middle;margin-left:0.4rem">${Array.from({length:intelLevel}).map(()=>`<span style="width:7px;height:7px;border-radius:50%;background:#fbbf24;box-shadow:0 0 4px rgba(251,191,36,0.7);display:inline-block"></span>`).join('')}</span>`
      : '';

    const nameColor = isKingHouse      ? '#c084fc' :
                      h.status==='ally'        ? '#4ade80' :
                      h.status==='enemy'       ? '#f87171' :
                      h.status==='diffidente'  ? '#fb923c' :
                      '#c9a84c';

    const popup = document.createElement('div');
    popup.id = 'house-popup';
    popup.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(3px);';
    popup.innerHTML = `
      <div style="background:#0e0e16;border:1px solid rgba(201,168,76,0.4);border-radius:10px 10px 0 0;width:100%;max-width:480px;padding:1.2rem 1.1rem 1.4rem;animation:tut-pop 0.25s ease;max-height:80vh;overflow-y:auto">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.85rem">
          <div style="display:flex;align-items:center;gap:0.6rem">
            <span style="width:2.4rem;height:2.4rem;display:flex;align-items:center;justify-content:center;flex-shrink:0">${houseIcon(h,'2.2rem')}</span>
            <div>
              <div style="font-family:'Cinzel Decorative',serif;font-size:0.88rem;color:${nameColor};font-weight:700">Casa ${h.name}${spyDotsHtml}</div>
              <div style="font-family:'EB Garamond',serif;font-size:0.75rem;color:#9a8a6a">⚔ ${isSuppressed?'—':Math.round(h.army)} truppe${h.region?' · '+h.region:''}</div>
              ${_dipMemoryLabel(hId) ? `<div style="margin-top:0.2rem">${_dipMemoryLabel(hId)}</div>` : ''}
              ${(() => {
                const PASSIVES = {
                  Stark:'⚜ Alleanza: +2 Fede +2 Popolo ogni 5 turni', Lannister:'⚜ Alleanza: +3 Oro ogni 5 turni',
                  Tyrell:'⚜ Alleanza: +2 Popolo +1 Oro ogni 5 turni', Baratheon:'⚜ Alleanza: +2 Esercito ogni 5 turni',
                  Tully:'⚜ Alleanza: +2 Fede +1 Popolo ogni 5 turni', Martell:'⚜ Alleanza: +2 Potere ogni 5 turni',
                  Greyjoy:'⚜ Alleanza: +3 Esercito ogni 5 turni', Frey:'⚜ Alleanza: +2 Oro −1 Fede ogni 5 turni',
                  Bolton:'⚜ Alleanza: +2 Esercito −1 Popolo ogni 5 turni',
                  Targaryen:'⚜ Alleanza: +2 Esercito +2 Potere ogni 5 turni',
                  Hightower:'⚜ Alleanza: +2 Oro +2 Fede ogni 5 turni',
                };
                const p = PASSIVES[hId];
                return p ? `<div style="font-family:'Cinzel',serif;font-size:0.6rem;color:${isAlly?'#4ade80':'#6b5e4a'};margin-top:0.2rem">${p}</div>` : '';
              })()}
            </div>
          </div>
          <button onclick="document.getElementById('house-popup').remove();Game.clearRaven()" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:50%;width:28px;height:28px;font-size:0.9rem;cursor:pointer;color:#9a8a6a;display:flex;align-items:center;justify-content:center;flex-shrink:0">✕</button>
        </div>
        <div id="popup-actions" style="display:flex;flex-direction:column;gap:0.4rem">
          ${actions}
        </div>
      </div>`;

    // Close on backdrop click
    popup.addEventListener('click', e => { if (e.target === popup) { popup.remove(); Game.clearRaven(); } });
    document.body.appendChild(popup);
  }

  function selectRavenTarget(hId) {
    // Legacy — now handled by _openHousePopup
    Game._openHousePopup(hId);
  }

  function clearRaven() {
    state.ravenTarget = null;
    document.getElementById('house-popup')?.remove();
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

  function showAlliancePrereqFailOverlay(h, hint, failedResNames) {
    const existing = document.getElementById('prereq-fail-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'prereq-fail-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:650;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;backdrop-filter:blur(4px);';
    overlay.innerHTML = `
      <div style="background:#12121a;border:1px solid rgba(201,168,76,0.4);border-radius:6px;width:90%;max-width:420px;padding:1.6rem;font-family:'Cinzel',serif;">
        <div style="font-family:'Cinzel Decorative',serif;color:#c9a84c;font-size:0.9rem;margin-bottom:0.3rem;display:flex;align-items:center;gap:0.5rem">${houseIcon(h,'1.6rem')} Casa ${h.name}</div>
        <div style="font-size:0.68rem;color:#9a8a6a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.9rem">Proposta di alleanza rifiutata</div>
        <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.18);border-radius:4px;padding:0.85rem;margin-bottom:0.85rem;font-family:'EB Garamond',serif;font-size:0.95rem;color:#e8dcc8;line-height:1.65;font-style:italic">
          «${hint}»
        </div>
        <div style="font-family:'EB Garamond',serif;font-size:0.85rem;color:#9a8a6a;margin-bottom:1rem;line-height:1.5">
          Le vostre risorse non soddisfano le aspettative di Casa ${h.name}.<br>
          <span style="color:#f87171">Risorsa/e insufficiente: <strong>${failedResNames.join(', ')}</strong></span>
        </div>
        <button onclick="document.getElementById('prereq-fail-overlay').remove()" style="width:100%;padding:0.65rem;background:transparent;border:1px solid rgba(201,168,76,0.35);border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#c9a84c">Capito</button>
      </div>`;
    document.body.appendChild(overlay);
  }

  function showTruceOverlay(hId, h, truceCost, truceRefusals, wasAttacked) {
    const existing = document.getElementById('truce-overlay');
    if (existing) existing.remove();

    const playerForce = state.resources.army + (state.loanedArmy || 0);
    const ratio = playerForce / Math.max(1, h.army);
    // Lower accept chance if player attacked — house is resentful
    const baseAccept = Math.min(0.75, Math.max(0.10, (wasAttacked ? 0.15 : 0.30) + ratio * 0.20));
    const acceptPct = Math.round(baseAccept * 100);

    const refusalNote = truceRefusals > 0
      ? `<div style="margin-bottom:0.6rem;padding:0.45rem 0.65rem;background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.25);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.82rem;color:#fbbf24">
          ⚠ Hai già rifiutato ${truceRefusals} volta. Il prezzo è aumentato.
        </div>`
      : '';

    const attackNote = wasAttacked
      ? `<div style="margin-bottom:0.6rem;padding:0.45rem 0.65rem;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.82rem;color:#f87171">
          ⚔ Hai attaccato questa casata e ti sei ritirato. Il prezzo della tregua è molto alto.
        </div>`
      : '';

    const narrative = wasAttacked
      ? `«Le vostre armate hanno invaso le nostre terre. Sangue è stato versato. Se volete la pace, pagate <strong style="color:#f87171">💰 ${truceCost} oro</strong> come risarcimento per i danni causati.»`
      : `Offrite <strong style="color:#fbbf24">💰 ${truceCost} oro</strong> come compensazione per i torti del passato. In cambio, Casa ${h.name} si impegna alla neutralità.`;

    const overlay = document.createElement('div');
    overlay.id = 'truce-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:650;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;backdrop-filter:blur(4px);';
    overlay.innerHTML = `
      <div style="background:#12121a;border:1px solid rgba(251,191,36,0.5);border-radius:6px;width:92%;max-width:420px;padding:1.6rem;font-family:'Cinzel',serif;">
        <div style="font-family:'Cinzel Decorative',serif;color:#fbbf24;font-size:0.9rem;margin-bottom:0.25rem">🕊 Patto di Non Aggressione</div>
        <div style="font-size:0.68rem;color:#9a8a6a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.85rem">Trattativa con ${h.icon} Casa ${h.name}</div>
        ${attackNote}${refusalNote}
        <div style="background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.15);border-radius:4px;padding:0.8rem;margin-bottom:0.85rem;font-family:'EB Garamond',serif;font-size:0.92rem;color:#e8dcc8;line-height:1.6">
          ${narrative}
          <div style="margin-top:0.5rem;font-size:0.8rem;color:#9a8a6a">Probabilità di accettazione: <strong style="color:#c9a84c">~${acceptPct}%</strong></div>
        </div>
        <div style="font-size:0.72rem;color:#9a8a6a;margin-bottom:1rem;font-family:'EB Garamond',serif;font-style:italic">
          Avete: 💰 ${Math.round(state.resources.gold)} oro
        </div>
        <div style="display:flex;gap:0.65rem">
          <button onclick="Game.acceptTruce('${hId}',${truceCost},${baseAccept},${!!wasAttacked})" style="flex:1;padding:0.7rem;background:linear-gradient(135deg,#78350f,#c9a84c);border:none;border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#0a0a0f">
            💰 Paga ${truceCost} oro
          </button>
          <button onclick="Game.refuseTruce('${hId}');document.getElementById('truce-overlay').remove()" style="flex:1;padding:0.7rem;background:transparent;border:1px solid rgba(201,168,76,0.4);border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#c9a84c">
            Non ora
          </button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  function ravenAction(action) {
    if (!state.ravenTarget) return;
    const hId = state.ravenTarget;
    const h = state.houses[hId];
    const cost = { alliance: 0, war: 0, tribute: -25 };
    const goldCost = cost[action] || 0;

    if (goldCost !== 0 && state.resources.gold + goldCost < 0) {
      showToast('Non hai abbastanza oro!', 'warn');
      return;
    }

    state.resources.gold = clampRes(state.resources.gold + goldCost);

    if (action === 'alliance') {
      if (h.status === 'ally') { showToast(`Casa ${h.name} è già vostra alleata.`); return; }

      // Enemies must negotiate a truce first
      if (h.status === 'enemy') {
        showToast(`⚔ Casa ${h.name} è vostra nemica. Prima dovete stabilire una tregua.`, 'warn');
        state.ravenTarget = null; toggleDiplomacy(); return;
      }

      // King's house never allies
      if (hId === state.kingHouseAffiliation) {
        showToast(`👑 Casa ${h.name} governa i Sette Regni e non cerca alleanze — si aspetta obbedienza.`, 'warn');
        state.ravenTarget = null; toggleDiplomacy(); return;
      }

      // Block alliance with king-allied houses after 1st king decree refusal
      if (state.kingAllyBlocked && h.kingAlly) {
        const kingName = state.kingName || 'Il Re';
        showToast(`👑 ${kingName} ha vietato questa alleanza. Casa ${h.name} è fedele alla Corona e non può essere vostra alleata.`, 'warn');
        state.ravenTarget = null; toggleDiplomacy(); return;
      }

      // ── Check house prerequisites (hidden — only hint shown on failure) ──
      const houseDef = HOUSES_DEF.find(hd => hd.id === state.ravenTarget);
      if (houseDef?.allianceReq) {
        const resNames = { gold: 'Tesoro', faith: 'Fede', people: 'Popolo', army: 'Esercito', power: 'Potere' };
        const failed = Object.entries(houseDef.allianceReq).filter(([res, val]) => state.resources[res] < val);
        if (failed.length > 0) {
          showAlliancePrereqFailOverlay(h, houseDef.allianceHint, failed.map(([res]) => resNames[res]));
          state.ravenTarget = null;
          return;
        }
      }
      const diffBase = { easy: 0.70, medium: 0.50, hard: 0.30 };
      let chance = diffBase[state.character.difficulty] || 0.50;

      // ── Se il giocatore ha attaccato questa casata e si è ritirato, chiede compenso alto in oro ──
      if (h.attackedByPlayer) {
        const armyScale = Math.max(1.5, h.army / 40);
        const compensation = Math.round((25 + Math.random() * 20) * armyScale); // 37-67+ oro
        const canAfford = state.resources.gold >= compensation;
        const hId = state.ravenTarget;
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:600;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;backdrop-filter:blur(4px);';
        overlay.innerHTML = `
          <div style="background:#12121a;border:2px solid rgba(239,68,68,0.5);border-radius:8px;width:92%;max-width:430px;padding:1.6rem;font-family:'Cinzel',serif;text-align:center">
            <div style="font-size:2rem;margin-bottom:0.5rem">${h.icon}</div>
            <div style="font-family:'Cinzel Decorative',serif;color:#f87171;font-size:0.9rem;margin-bottom:0.6rem">Richiesta di Risarcimento</div>
            <div style="font-family:'EB Garamond',serif;font-size:0.95rem;color:#e8dcc8;line-height:1.6;margin-bottom:0.9rem">
              «Avete attaccato le nostre terre e poi vi siete ritirati come codardi. Per deporre le armi e tornare alla neutralità, esigiamo un risarcimento di <strong style="color:#f87171">💰 ${compensation} oro</strong>. Non negoziamo.»
            </div>
            <div style="font-size:0.75rem;color:${canAfford?'#4ade80':'#f87171'};margin-bottom:0.9rem;font-family:'Cinzel',serif">
              ${canAfford ? `✓ Hai ${Math.round(state.resources.gold)} oro — puoi pagare` : `✗ Hai ${Math.round(state.resources.gold)} oro — insufficiente`}
            </div>
            <div style="display:flex;gap:0.65rem">
              ${canAfford
                ? `<button onclick="Game._payAttackCompensation('${hId}',${compensation});this.closest('[style]').remove()" style="flex:1;padding:0.65rem;background:linear-gradient(135deg,#78350f,#c9a84c);border:none;border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#0a0a0f">💰 Paga ${compensation} oro</button>`
                : `<button disabled style="flex:1;padding:0.65rem;background:rgba(80,80,80,0.2);border:1px solid #333;border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;color:#555;cursor:not-allowed">Oro insufficiente</button>`
              }
              <button onclick="this.closest('[style]').remove()" style="flex:1;padding:0.65rem;background:transparent;border:1px solid rgba(201,168,76,0.3);border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;color:#9a8a6a">Rifiuta</button>
            </div>
          </div>`;
        document.body.appendChild(overlay);
        state.ravenTarget = null;
        return;
      }

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
      // Apply diplomatic memory penalty/bonus
      const dipPen = _dipPenalty(state.ravenTarget);
      chance -= dipPen / 100; // penalty 30 → -0.30, bonus -30 → +0.30
      chance = Math.max(0.05, Math.min(0.95, chance));
      const pct = Math.round(chance * 100);

      // ── Determine if they demand resources — proportional to their army ──
      const demandChance = { easy: 0.20, medium: 0.40, hard: 0.60 }[state.character.difficulty] || 0.35;
      const demandRoll = Math.random();
      const hasDemand = demandRoll < demandChance && h.status !== 'ally';

      if (hasDemand) {
        // Demand proportional to house army and importance
        const armyScale = Math.max(1, h.army / 50);
        const demandTypes = [
          { res: 'gold',  label: 'oro',     icon: '💰', amount: Math.floor((Math.random() * 10 + 12) * armyScale) },
          { res: 'army',  label: 'soldati', icon: '⚔',  amount: Math.floor((Math.random() * 8  + 8)  * armyScale) },
          { res: 'faith', label: 'sostegno alla Fede', icon: '✝', amount: Math.floor((Math.random() * 8 + 8) * armyScale) },
        ];
        const demand = rand(demandTypes);
        const hId = state.ravenTarget;

        // Show proposal overlay BEFORE taking resources
        showAllianceDemandOverlay(h, demand, chance, pct, hId);
        return;

      } else {
        // No demand — pure roll
        const roll = Math.random();
        const reasons = buildRefusalReason(state, h, state.ravenTarget);

        if (roll < chance) {
          h.status = h.status === 'enemy' ? 'neutral' : 'ally';
          state.resources.power = clampRes(r.power + (h.status === 'ally' ? 4 : 0));
          const msg = h.status === 'ally'
            ? `🤝 Casa ${h.name} accetta l'alleanza!`
            : `✉ Casa ${h.name} accetta la tregua. Ora Neutrali.`;
          showToast(msg, 'good');
          if (h.status === 'ally') state.decisionHistory.push({ turn: state.turn, cardId: 'raven_alliance', choice: 'alliance', tags: ['diplomacy'], target: state.ravenTarget });
        } else {
          showToast(`❌ Casa ${h.name} rifiuta. ${reasons}`, 'warn');
          recordAllianceRejection(state.ravenTarget);
          if (!state.allianceCooldowns) state.allianceCooldowns = {};
          state.allianceCooldowns[state.ravenTarget] = state.turn + 7;
        }
        state.ravenTarget = null;
        updateHUD(); saveGame(); renderDiplomacy?.();
      }
    } else if (action === 'request_resources') {
      // Player requests resources from an ally — check spam cooldown
      if (h.status !== 'ally') { showToast('Solo gli alleati possono inviarti risorse.', 'warn'); state.ravenTarget = null; toggleDiplomacy(); return; }
      
      // Spam check: cooldown after each request
      if (!state.resourceRequestCooldowns) state.resourceRequestCooldowns = {};
      if (!state.resourceRequestCount) state.resourceRequestCount = {};
      const cooldown = state.resourceRequestCooldowns[state.ravenTarget] || 0;
      if (cooldown > state.turn) {
        showToast(`📦 Casa ${h.name} non è pronta ad aiutarti di nuovo. Aspetta ${cooldown - state.turn} turni.`, 'warn');
        state.ravenTarget = null; toggleDiplomacy(); return;
      }

      // Set cooldown (proportional to request frequency — longer if spam)
      const reqCount = state.resourceRequestCount[state.ravenTarget] || 0;
      state.resourceRequestCount[state.ravenTarget] = reqCount + 1;
      const cooldownDuration = Math.min(8 + reqCount * 3, 20); // 8, 11, 14... up to 20
      state.resourceRequestCooldowns[state.ravenTarget] = state.turn + cooldownDuration;

      // If requested too many times in a short window, ally feels exploited
      if (reqCount >= 3) {
        // Check if we've been spamming (>3 requests)
        const totalRecent = reqCount;
        if (totalRecent >= 5) {
          h.status = 'neutral';
          state.resourceRequestCount[state.ravenTarget] = 0;
          _recordDipEvent(state.ravenTarget, 'broken_alliance');
          showToast(`😤 Casa ${h.name} vi ritiene dipendenti e deboli. Hanno sciolto l'alleanza.`, 'warn');
          // 7-turn cooldown before alliance can be re-proposed
          if (!state.allianceCooldowns) state.allianceCooldowns = {};
          state.allianceCooldowns[state.ravenTarget] = state.turn + 7;
          state.ravenTarget = null; toggleDiplomacy(); saveGame(); updateHUD(); return;
        }
      }

      showRequestResourcesOverlay(state.ravenTarget, h);
      return;
    } else if (action === 'war') {
      const warTargetId = state.ravenTarget;
      if (h.status === 'ally') {
        h.status = 'enemy';
        state.decisionHistory.push({ turn: state.turn, cardId: 'raven_betray', choice: 'war', tags: ['betray_ally'], target: warTargetId });
        showToast(`⚔ Hai tradito Casa ${h.name}! Sono ora tuoi nemici.`, 'warn');
        state.ravenTarget = null; updateHUD(); toggleDiplomacy(); saveGame();
        return;
      } else {
        // Turno 1 (diplomatico): chiedi se vuoi chiedere tributo o guerra diretta
        if (state.pendingWarDeclaration) {
          showToast('⚔ Hai già una guerra in corso di preparazione.', 'warn');
          state.ravenTarget = null; toggleDiplomacy(); return;
        }
        state.ravenTarget = null;
        toggleDiplomacy();
        showWarDiplomacyChoice(warTargetId, h);
        return;
      }
    } else if (action === 'truce') {
      // Non-aggression pact with an enemy house — player pays, house becomes neutral
      if (h.status !== 'enemy') { showToast('La tregua si propone solo a casate nemiche.', 'warn'); state.ravenTarget = null; toggleDiplomacy(); return; }
      if (hId === state.kingHouseAffiliation) {
        showToast(`👑 Casa ${h.name} governa i Sette Regni — non tratta patti di non aggressione.`, 'warn');
        state.ravenTarget = null; toggleDiplomacy(); return;
      }

      const truceRefusals = (state.truceRefusals || {})[hId] || 0;
      // Costo base tregua — molto più alto se il giocatore ha attaccato questa casata
      const attackPenalty = h.attackedByPlayer
        ? Math.round((20 + h.army * 0.4) * ({ easy:0.7, medium:1.0, hard:1.3 }[state.character.difficulty] || 1.0))
        : 0;
      const truceCost = 10 + truceRefusals * 6 + attackPenalty;

      if (state.resources.gold < truceCost) {
        showToast(`💰 Non hai abbastanza oro. Servono ${truceCost} oro per questa tregua.`, 'warn');
        state.ravenTarget = null; toggleDiplomacy(); return;
      }

      showTruceOverlay(hId, h, truceCost, truceRefusals, h.attackedByPlayer);
      return; // overlay handles the rest

    } else if (action === 'resource_exchange') {
      // Removed — use "Chiedi Risorse" instead
      state.ravenTarget = null; toggleDiplomacy(); return;
    }

    state.ravenTarget = null;
    updateHUD();
    toggleDiplomacy();
    saveGame();
  }

  // ══════════════════════════════════════════════
  // GUERRA — TURNO 1: SCELTA DIPLOMATICA
  // Prima di dichiarare guerra il giocatore può
  // chiedere tributo oppure dichiarare guerra senza
  // via di scampo.
  // ══════════════════════════════════════════════
  function showWarDiplomacyChoice(houseId, h) {
    const existing = document.getElementById('war-diplo-overlay');
    if (existing) existing.remove();

    const TRIBUTE_AMT = 20;
    const resOptions = [
      { res: 'gold',   label: 'Oro',     icon: '💰' },
      { res: 'army',   label: 'Soldati', icon: '⚔'  },
      { res: 'people', label: 'Popolo',  icon: '👥'  },
      { res: 'faith',  label: 'Fede',    icon: '✝'   },
    ];

    const resBtns = resOptions.map(opt => `
      <button onclick="Game.warDiploTribute('${houseId}','${opt.res}',${TRIBUTE_AMT})" style="
        display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.5rem 0.75rem;
        background:rgba(201,168,76,0.07);border:1px solid rgba(201,168,76,0.25);
        border-radius:3px;font-family:'EB Garamond',serif;font-size:0.92rem;color:#e8dcc8;
        cursor:pointer;transition:background 0.15s;text-align:left;margin-bottom:0.3rem;"
        onmouseover="this.style.background='rgba(201,168,76,0.16)'"
        onmouseout="this.style.background='rgba(201,168,76,0.07)'">
        <span style="font-size:1.1rem">${opt.icon}</span>
        <span>${opt.label} — <strong style="color:#c9a84c">20 unità</strong></span>
        <span style="margin-left:auto;font-size:0.72rem;color:#9a8a6a">(hai: ${Math.round(state.resources[opt.res])})</span>
      </button>`).join('');

    const overlay = document.createElement('div');
    overlay.id = 'war-diplo-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:640;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;backdrop-filter:blur(4px);';
    overlay.innerHTML = `
      <div style="background:#12121a;border:2px solid rgba(239,68,68,0.5);border-radius:6px;width:92%;max-width:450px;padding:1.75rem;font-family:'Cinzel',serif;">
        <div style="font-family:'Cinzel Decorative',serif;color:#f87171;font-size:1rem;margin-bottom:0.3rem">⚔ Guerra a Casa ${h.name}</div>
        <div style="font-size:0.7rem;color:#9a8a6a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:1rem">Turno 1 — Scelta Diplomatica</div>
        <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:4px;padding:0.85rem;margin-bottom:1rem;font-family:'EB Garamond',serif;font-size:0.9rem;color:#e8dcc8;line-height:1.6">
          Prima di dichiarare guerra ufficialmente, potete inviare un ultimatum a Casa ${h.icon} ${h.name}.<br>
          <span style="color:#c9a84c">⚖ Chiedi tributo:</span> scegli la risorsa da richiedere (importo fisso: 20). La casata potrebbe accettare o rifiutare in base ai rapporti di forza.
        </div>
        <div style="font-size:0.7rem;color:#4ade80;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem">Scegli cosa richiedere come tributo:</div>
        ${resBtns}
        <div style="height:1px;background:rgba(201,168,76,0.15);margin:0.75rem 0"></div>
        <button onclick="Game.warDiploDirectWar('${houseId}')" style="width:100%;padding:0.75rem;background:linear-gradient(135deg,#7f1d1d,#dc2626);border:none;border-radius:2px;font-family:'Cinzel',serif;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#fff;margin-bottom:0.4rem">
          ⚔ Guerra Senza Tregua — Nessuna Via d'Uscita
        </button>
        <button onclick="document.getElementById('war-diplo-overlay').remove()" style="width:100%;padding:0.65rem;background:transparent;border:1px solid rgba(201,168,76,0.35);border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;color:#c9a84c">
          Annulla — Non ancora
        </button>
      </div>`;
    document.body.appendChild(overlay);
  }

  // Giocatore sceglie di chiedere tributo — la casata risponde
  function warDiploTribute(houseId, tributeRes, tributeAmt) {
    document.getElementById('war-diplo-overlay')?.remove();
    const h = state.houses[houseId];
    if (!h) return;

    // Probabilità che la casata accetti: basata su differenza di forze
    const playerForce = state.resources.army + (state.loanedArmy || 0);
    const ratio = playerForce / (h.army || 1);
    const acceptChance = Math.min(0.75, Math.max(0.10, (ratio - 0.8) * 0.5));
    const accepts = Math.random() < acceptChance;

    if (accepts) {
      const resLabels = { gold: 'oro 💰', army: 'soldati ⚔', people: 'popolo 👥' };
      state.resources[tributeRes] = clampRes(state.resources[tributeRes] + tributeAmt);
      showToast(`💰 Casa ${h.name} ha accettato di pagare ${tributeAmt} ${resLabels[tributeRes]} per evitare la guerra. Rimangono ${h.status === 'enemy' ? 'nemici' : 'neutrali'}.`, 'good');
      updateHUD(); saveGame();
    } else {
      showToast(`⚔ Casa ${h.name} rifiuta l'ultimatum! La guerra inizierà tra 2 turni.`, 'warn');
      h.status = 'enemy';
      state.pendingWarDeclaration = { houseId, revealTurn: state.turn + 2, declaredTurn: state.turn };
      if (typeof AudioManager !== 'undefined') AudioManager.playWar();
      _scheduleWarDeclarationCards(houseId, h, true);
      updateHUD(); saveGame();
    }
  }

  // Giocatore sceglie guerra diretta senza via di scampo
  function warDiploDirectWar(houseId) {
    document.getElementById('war-diplo-overlay')?.remove();
    const h = state.houses[houseId];
    if (!h) return;
    h.status = 'enemy';
    state.pendingWarDeclaration = { houseId, revealTurn: state.turn + 3, declaredTurn: state.turn };
    if (typeof AudioManager !== 'undefined') AudioManager.playWar();
    _scheduleWarDeclarationCards(houseId, h, false);
    showToast(`⚔ Guerra dichiarata a Casa ${h.name}! Nessuna tregua. La battaglia inizierà tra 3 turni.`, 'warn');
    updateHUD(); saveGame();
  }

  // ══════════════════════════════════════════════
  // ALLIANCE DEMAND OVERLAY
  // ══════════════════════════════════════════════
  function acceptTruce(hId, cost, acceptChance, wasAttacked) {
    document.getElementById('truce-overlay')?.remove();
    const h = state.houses[hId];
    if (!h) return;

    state.resources.gold = clampRes(state.resources.gold - cost);

    const accepted = Math.random() < acceptChance;
    if (accepted) {
      h.status = 'neutral';
      h.startingEnemy = false;
      h.attackedByPlayer = false; // tregua accettata — risarcimento pagato
      if (state.startingEnemyRefusals) delete state.startingEnemyRefusals[hId];
      if (state.startingEnemyCooldown) delete state.startingEnemyCooldown[hId];
      if (state.activeThreats) delete state.activeThreats[hId];
      if (!state.allianceCooldowns) state.allianceCooldowns = {};
      state.allianceCooldowns[hId] = state.turn + 8;
      if (state.truceRefusals) state.truceRefusals[hId] = 0;
      _recordDipEvent(hId, 'paid_tribute');
      const msg = wasAttacked
        ? `🕊 Casa ${h.name} accetta il risarcimento. I danni di guerra sono stati ripagati — ora neutrali.`
        : `🕊 Casa ${h.name} accetta il patto. L'oro ha smussato i rancori — ora neutrali. Potete proporre alleanza tra 8 turni.`;
      showToast(msg, 'good');
    } else {
      // Rejected — cooldown and price goes up next time
      if (!state.truceCooldowns) state.truceCooldowns = {};
      state.truceCooldowns[hId] = state.turn + 6;
      if (!state.truceRefusals) state.truceRefusals = {};
      state.truceRefusals[hId] = (state.truceRefusals[hId] || 0) + 1;
      showToast(`❌ Casa ${h.name} rifiuta il patto. L'oro è stato restituito in parte — rancore troppo profondo. Riprovate tra 6 turni (prezzo aumentato).`, 'warn');
      // Partial refund (50%)
      state.resources.gold = clampRes(state.resources.gold + Math.floor(cost * 0.5));
    }
    updateHUD(); saveGame();
    toggleDiplomacy();
  }

  function refuseTruce(hId) {
    // Player cancels — no cost, no cooldown
    state.ravenTarget = null;
    toggleDiplomacy();
  }

  // ══════════════════════════════════════════════
  // SPY INTEL SYSTEM
  // ══════════════════════════════════════════════
  function sendSpy(hId) {
    const h = state.houses[hId];
    if (!h) return;
    if (!state.spyIntel) state.spyIntel = {};
    const currentLevel = state.spyIntel[hId] || 0;
    if (currentLevel >= 2) { showToast('Hai già le informazioni complete su questa casata.'); return; }

    const cost = currentLevel === 0 ? 12 : 18;
    if (state.resources.gold < cost) {
      showToast('Non hai abbastanza oro per finanziare la spia.', 'warn');
      return;
    }
    state.resources.gold = clampRes(state.resources.gold - cost);
    updateHUD();
    toggleDiplomacy();

    // ── Animazione attesa ──
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'spy-loading-overlay';
    loadingOverlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:660;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);';
    loadingOverlay.innerHTML = `
      <div style="text-align:center;font-family:'Cinzel',serif;">
        <div style="font-size:2.5rem;margin-bottom:1rem;animation:spy-spider-spin 2s linear infinite;display:inline-block">🕷</div>
        <div style="font-size:0.85rem;color:#fbbf24;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:0.5rem">Spia in missione</div>
        <div id="spy-dots" style="font-size:1.4rem;color:#c9a84c;letter-spacing:0.3em;min-width:3rem;display:inline-block">.</div>
        <div style="font-size:0.72rem;color:#6b5e4a;margin-top:0.8rem;font-family:'EB Garamond',serif;font-style:italic">${h.icon} Infiltrazione in Casa ${h.name}...</div>
      </div>`;
    if (!document.getElementById('spy-anim-style')) {
      const s = document.createElement('style');
      s.id = 'spy-anim-style';
      s.textContent = '@keyframes spy-spider-spin { 0%{transform:rotate(0deg) scale(1)} 50%{transform:rotate(180deg) scale(1.2)} 100%{transform:rotate(360deg) scale(1)} }';
      document.head.appendChild(s);
    }
    document.body.appendChild(loadingOverlay);
    let dotCount = 1;
    const dotInterval = setInterval(() => {
      const dotsEl = document.getElementById('spy-dots');
      if (dotsEl) dotsEl.textContent = '.'.repeat(dotCount = (dotCount % 3) + 1);
    }, 400);

    setTimeout(() => {
      clearInterval(dotInterval);
      loadingOverlay.remove();

      const captureCount  = (state.spyCaptureCount || {})[hId] || 0;
      const discoveryBase = 0.15 + (h.status === 'enemy' ? 0.10 : 0) + currentLevel * 0.08;
      const discovered    = Math.random() < discoveryBase;

      if (discovered) {
        if (!state.spyCaptureCount) state.spyCaptureCount = {};
        state.spyCaptureCount[hId] = captureCount + 1;
        _resetBetrayalReduction(hId);

        if (captureCount === 0) {
          // Prima cattura → diffidente
          const wasPrevStatus = h.status;
          h.status = 'diffidente';
          const pardonCost = wasPrevStatus === 'ally' ? 30 : wasPrevStatus === 'enemy' ? 25 : 20;
          if (!state.diffidentePardonCost) state.diffidentePardonCost = {};
          state.diffidentePardonCost[hId] = pardonCost;
          _showSpyDiscoveredOverlay(h, hId, pardonCost, wasPrevStatus, false);
        } else {
          // Seconda cattura → nemica
          h.status = 'enemy';
          _showSpyDiscoveredOverlay(h, hId, 0, h.status, true);
          if (typeof AudioManager !== 'undefined') AudioManager.playWar();
        }
        updateHUD(); saveGame();
        return;
      }

      // Successo
      state.spyIntel[hId] = currentLevel + 1;
      const base      = h.betrayalChance || 0;
      const red       = h.betrayalReduction || 0;
      const effective = Math.max(0, base - red);

      if (currentLevel === 0) {
        const bracket   = effective >= 60 ? 'molto alta ⚠' : effective >= 35 ? 'moderata — attenzione' : effective < 15 ? 'molto bassa ✅' : 'bassa';
        const narrative = effective >= 60
          ? `I corvi di Varys riportano segnali inquietanti. Casa ${h.name} intrattiene contatti segreti con altre casate. La fedeltà è ${bracket}.`
          : effective >= 35
            ? `La rete di Varys ha fatto il suo lavoro. Casa ${h.name} gioca su più tavoli. Fedeltà ${bracket}.`
            : `Varys non ha trovato nulla di preoccupante. Casa ${h.name} sembra genuinamente fedele. Probabilità di tradimento ${bracket}.`;
        _showSpyReportOverlay(h, hId, narrative, false, effective);
      } else {
        const narrative = `Rapporto completo di Varys: Casa ${h.name} ha una probabilità di tradimento del ${effective}%. ${effective >= 60 ? '⚠ Non affidatele i vostri segreti militari.' : effective >= 30 ? 'Procedete con cautela in guerra.' : '✅ Casata affidabile — potete fidarvi dei loro rinforzi.'}`;
        _showSpyReportOverlay(h, hId, narrative, true, effective);
      }
      updateHUD(); saveGame();
    }, 1800);
  }

  function _showSpyReportOverlay(h, hId, narrative, isPrecise, effective) {
    const existing = document.getElementById('spy-report-overlay');
    if (existing) existing.remove();
    const loyalty = Math.max(0, 100 - effective);
    const barColor = loyalty >= 70 ? '#4ade80' : loyalty >= 40 ? '#fbbf24' : '#f87171';
    const overlay = document.createElement('div');
    overlay.id = 'spy-report-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:660;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;backdrop-filter:blur(6px);';
    overlay.innerHTML = `
      <div style="background:#12121a;border:1px solid rgba(251,191,36,0.45);border-radius:6px;width:92%;max-width:400px;padding:1.6rem;font-family:'Cinzel',serif;">
        <div style="font-family:'Cinzel Decorative',serif;color:#fbbf24;font-size:0.88rem;margin-bottom:0.2rem">🕷 Rapporto di Varys</div>
        <div style="font-size:0.65rem;color:#9a8a6a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.85rem">${h.icon} Casa ${h.name} — ${isPrecise ? 'Analisi completa' : 'Prima ricognizione'}</div>
        <div style="background:rgba(251,191,36,0.05);border:1px solid rgba(251,191,36,0.15);border-radius:4px;padding:0.8rem;margin-bottom:0.9rem;font-family:'EB Garamond',serif;font-size:0.95rem;color:#e8dcc8;line-height:1.6;font-style:italic">
          «${narrative}»
        </div>
        ${isPrecise ? `
          <div style="margin-bottom:0.9rem">
            <div style="font-size:0.65rem;color:#9a8a6a;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.4rem">Indice di fedeltà</div>
            <div style="height:8px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden;margin-bottom:0.25rem">
              <div style="height:100%;width:${loyalty}%;background:${barColor};border-radius:4px;transition:width 0.8s ease"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.68rem;color:#6b5e4a">
              <span>Tradimento ${effective}%</span><span>Fedeltà ${loyalty}%</span>
            </div>
          </div>` : ''}
        <button onclick="document.getElementById('spy-report-overlay').remove()" style="width:100%;padding:0.6rem;background:transparent;border:1px solid rgba(201,168,76,0.35);border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#c9a84c">Capito</button>
      </div>`;
    document.body.appendChild(overlay);
  }

  function _showSpyDiscoveredOverlay(h, hId, pardonCost, prevStatus, isSecondCapture) {
    const existing = document.getElementById('spy-discovered-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'spy-discovered-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:660;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;backdrop-filter:blur(6px);';

    if (isSecondCapture) {
      overlay.innerHTML = `
        <div style="background:#12121a;border:2px solid rgba(239,68,68,0.7);border-radius:6px;width:92%;max-width:400px;padding:1.6rem;font-family:'Cinzel',serif;">
          <div style="font-family:'Cinzel Decorative',serif;color:#f87171;font-size:0.88rem;margin-bottom:0.2rem">🕷 Seconda Spia Catturata!</div>
          <div style="font-size:0.65rem;color:#9a8a6a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.85rem">${h.icon} Casa ${h.name} — Stato: Nemica</div>
          <div style="background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.25);border-radius:4px;padding:0.8rem;margin-bottom:0.9rem;font-family:'EB Garamond',serif;font-size:0.95rem;color:#e8dcc8;line-height:1.6">
            Un secondo agente catturato è la goccia che ha fatto traboccare il vaso. Casa ${h.name} considera questo un atto di guerra aperta contro di loro. Hanno tagliato ogni legame diplomatico e mobilitato le loro forze.
          </div>
          <div style="font-family:'EB Garamond',serif;font-size:0.82rem;color:#f87171;margin-bottom:0.9rem">
            ⚔ Casa ${h.name} è ora vostra <strong>nemica permanente</strong>. Non ci sono più possibilità di riconciliazione senza una tregua formale.
          </div>
          <button onclick="document.getElementById('spy-discovered-overlay').remove()" style="width:100%;padding:0.6rem;background:transparent;border:1px solid rgba(239,68,68,0.5);border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#f87171">Capito</button>
        </div>`;
    } else {
      overlay.innerHTML = `
        <div style="background:#12121a;border:2px solid rgba(251,146,60,0.6);border-radius:6px;width:92%;max-width:400px;padding:1.6rem;font-family:'Cinzel',serif;">
          <div style="font-family:'Cinzel Decorative',serif;color:#fb923c;font-size:0.88rem;margin-bottom:0.2rem">🕷 Spia Scoperta!</div>
          <div style="font-size:0.65rem;color:#9a8a6a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.85rem">${h.icon} Casa ${h.name} — Stato: Diffidente</div>
          <div style="background:rgba(251,146,60,0.06);border:1px solid rgba(251,146,60,0.2);border-radius:4px;padding:0.8rem;margin-bottom:0.9rem;font-family:'EB Garamond',serif;font-size:0.95rem;color:#e8dcc8;line-height:1.6">
            I vostri agenti sono stati catturati e interrogati. Casa ${h.name} è furiosa — ha tagliato ogni contatto diplomatico. Finché non pagherete <strong style="color:#fb923c">💰 ${pardonCost} oro</strong> come risarcimento, questa casata non risponderà ad alcun corvo.
          </div>
          <div style="font-family:'EB Garamond',serif;font-size:0.8rem;color:#fbbf24;margin-bottom:0.9rem">
            ⚠ Attenzione: se inviate un'altra spia e viene catturata, Casa ${h.name} diventerà vostra <strong>nemica permanente</strong>.
          </div>
          <button onclick="document.getElementById('spy-discovered-overlay').remove()" style="width:100%;padding:0.6rem;background:transparent;border:1px solid rgba(251,146,60,0.4);border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#fb923c">Capito</button>
        </div>`;
    }
    document.body.appendChild(overlay);
  }

  function payDiffidentePardon(hId) {
    const h = state.houses[hId];
    if (!h || h.status !== 'diffidente') return;
    const cost = (state.diffidentePardonCost || {})[hId] || 20;
    if (state.resources.gold < cost) {
      showToast(`💰 Non hai abbastanza oro. Servono ${cost} oro per il perdono.`, 'warn');
      return;
    }
    state.resources.gold = clampRes(state.resources.gold - cost);
    h.status = 'neutral';
    if (state.diffidentePardonCost) delete state.diffidentePardonCost[hId];
    showToast(`🕷 Casa ${h.name} accetta il risarcimento. I rapporti diplomatici sono ripristinati — ora neutrali.`, 'good');
    updateHUD(); saveGame();
    toggleDiplomacy();
  }

  // ══════════════════════════════════════════════
  // TRIBUTE OFFERING — riduce % tradimento
  // ══════════════════════════════════════════════
  function showTributeOfferOverlay(hId) {
    const h = state.houses[hId];
    if (!h || h.status !== 'ally') return;

    const existing = document.getElementById('tribute-offer-overlay');
    if (existing) existing.remove();

    const base      = h.betrayalChance || 0;
    const red       = h.betrayalReduction || 0;
    const effective = Math.max(0, base - red);
    const intelLevel = (state.spyIntel || {})[hId] || 0;

    // What the player knows about betrayal chance
    const loyaltyInfo = intelLevel >= 2
      ? `<div style="margin-bottom:0.6rem;font-family:'Cinzel',serif;font-size:0.7rem;color:#fbbf24">🕷 Fedeltà attuale: <strong>${100 - effective}%</strong> (tradimento: ${effective}%)</div>`
      : intelLevel === 1
        ? `<div style="margin-bottom:0.6rem;font-family:'Cinzel',serif;font-size:0.7rem;color:#9a8a6a">🕷 Hai informazioni vaghe sulla fedeltà di questa casata.</div>`
        : `<div style="margin-bottom:0.6rem;font-family:'Cinzel',serif;font-size:0.7rem;color:#6b5e4a">🕷 Non hai informazioni sulla fedeltà di questa casata.</div>`;

    const resOptions = [
      { res: 'gold',   label: 'Oro',     icon: '💰', val: Math.round(state.resources.gold)   },
      { res: 'army',   label: 'Soldati', icon: '⚔',  val: Math.round(state.resources.army)   },
      { res: 'people', label: 'Popolo',  icon: '👥', val: Math.round(state.resources.people) },
      { res: 'faith',  label: 'Fede',    icon: '✝',  val: Math.round(state.resources.faith)  },
    ];

    const resBtns = resOptions.map(opt => {
      const canAfford = state.resources[opt.res] >= 10;
      return canAfford
        ? `<button onclick="Game.acceptTributeOffer('${hId}','${opt.res}')" style="
            display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.45rem 0.7rem;
            background:rgba(74,222,128,0.07);border:1px solid rgba(74,222,128,0.25);
            border-radius:3px;font-family:'EB Garamond',serif;font-size:0.9rem;color:#e8dcc8;
            cursor:pointer;margin-bottom:0.3rem;transition:background 0.15s;"
            onmouseover="this.style.background='rgba(74,222,128,0.14)'"
            onmouseout="this.style.background='rgba(74,222,128,0.07)'">
            <span style="font-size:1.1rem">${opt.icon}</span>
            <span>${opt.label} — <strong style="color:#4ade80">10 unità</strong></span>
            <span style="margin-left:auto;font-size:0.72rem;color:#9a8a6a">(hai: ${opt.val})</span>
          </button>`
        : `<button disabled style="
            display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.45rem 0.7rem;
            background:rgba(80,80,80,0.08);border:1px solid rgba(120,120,120,0.2);
            border-radius:3px;font-family:'EB Garamond',serif;font-size:0.9rem;color:#4a4a4a;
            cursor:not-allowed;margin-bottom:0.3rem;">
            <span style="font-size:1.1rem">${opt.icon}</span>
            <span>${opt.label} — 10 unità</span>
            <span style="margin-left:auto;font-size:0.72rem">(hai: ${opt.val})</span>
          </button>`;
    }).join('');

    const overlay = document.createElement('div');
    overlay.id = 'tribute-offer-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:650;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;backdrop-filter:blur(4px);';
    overlay.innerHTML = `
      <div style="background:#12121a;border:1px solid rgba(74,222,128,0.45);border-radius:6px;width:92%;max-width:420px;padding:1.6rem;font-family:'Cinzel',serif;">
        <div style="font-family:'Cinzel Decorative',serif;color:#4ade80;font-size:0.9rem;margin-bottom:0.25rem">🎁 Offri Tributo</div>
        <div style="font-size:0.68rem;color:#9a8a6a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.85rem">${h.icon} Casa ${h.name} — rafforza la fedeltà</div>
        ${loyaltyInfo}
        <div style="background:rgba(74,222,128,0.05);border:1px solid rgba(74,222,128,0.15);border-radius:4px;padding:0.75rem;margin-bottom:0.85rem;font-family:'EB Garamond',serif;font-size:0.88rem;color:#9a8a6a;line-height:1.5">
          Un dono generoso rafforza i legami di fedeltà. Ogni tributo riduce la probabilità che Casa ${h.name} vi tradisca in battaglia. L'effetto dura finché restano vostri alleati.
        </div>
        <div style="font-size:0.7rem;color:#4ade80;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem">Scegli cosa offrire (10 unità):</div>
        ${resBtns}
        <button onclick="document.getElementById('tribute-offer-overlay').remove()" style="width:100%;margin-top:0.5rem;padding:0.55rem;background:transparent;border:1px solid rgba(201,168,76,0.3);border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;color:#9a8a6a">Annulla</button>
      </div>`;
    document.body.appendChild(overlay);
  }

  function acceptTributeOffer(hId, resKey) {
    document.getElementById('tribute-offer-overlay')?.remove();
    const h = state.houses[hId];
    if (!h || h.status !== 'ally') return;
    if (state.resources[resKey] < 10) { showToast('Risorse insufficienti.', 'warn'); return; }

    state.resources[resKey] = clampRes(state.resources[resKey] - 10);
    if (!state.tributeOffered) state.tributeOffered = {};
    state.tributeOffered[hId] = (state.tributeOffered[hId] || 0) + 1;
    _recordDipEvent(hId, 'offered_tribute');

    // Each tribute reduces betrayal by 8–12 points (diminishing: less effective over time)
    const alreadyReduced = h.betrayalReduction || 0;
    const diminish       = Math.max(3, 10 - Math.floor(alreadyReduced / 15)); // diminishing returns
    h.betrayalReduction  = Math.min(h.betrayalChance || 0, alreadyReduced + diminish); // can't go below 0%

    const newEffective = Math.max(0, (h.betrayalChance || 0) - h.betrayalReduction);
    const intelLevel   = (state.spyIntel || {})[hId] || 0;
    const feedbackNote = intelLevel >= 2
      ? ` Fedeltà ora al ${100 - newEffective}%.`
      : intelLevel === 1
        ? ` La vostra spia nota un miglioramento nei rapporti.`
        : '';

    const resLabels = { gold: 'oro', army: 'soldati', people: 'popolo', faith: 'fede' };
    showToast(`🎁 Casa ${h.name} apprezza il dono di 10 ${resLabels[resKey]}.${feedbackNote}`, 'good');
    updateHUD(); saveGame();
    toggleDiplomacy();
  }

  // Call this whenever a house leaves ally status to reset betrayalReduction
  function _resetBetrayalReduction(hId) {
    const h = state.houses[hId];
    if (h) h.betrayalReduction = 0;
    if (state.tributeOffered) delete state.tributeOffered[hId];
  }

  // ══════════════════════════════════════════════
  // LOYALTY PLEDGE SYSTEM — player as king
  // ══════════════════════════════════════════════
  function requestLoyaltyPledge(hId) {
    const h = state.houses[hId];
    if (!h || h.suppressed || h.kingAlly) return;

    const existing = document.getElementById('loyalty-pledge-overlay');
    if (existing) existing.remove();

    // Each house has a random response: refuse (become enemy), demand a price, or accept
    const roll = Math.random();
    const army = h.army || 50;
    const diff = state.character.difficulty;
    const diffMult = { easy: 0.7, medium: 1.0, hard: 1.35 }[diff] || 1.0;

    // Price based on house strength and difficulty
    const goldCost   = Math.round((20 + army * 0.3) * diffMult);
    const armyCost   = Math.round((10 + army * 0.15) * diffMult);
    const peopleCost = Math.round((15 + army * 0.2) * diffMult);
    const costs = [
      { res: 'gold',   icon: '💰', label: 'oro',     amount: goldCost   },
      { res: 'army',   icon: '⚔',  label: 'soldati', amount: armyCost   },
      { res: 'people', icon: '👥', label: 'popolo',  amount: peopleCost },
    ];
    const cost = costs[Math.floor(Math.random() * costs.length)];
    const canAfford = state.resources[cost.res] >= cost.amount;

    // Refuse chance: 20-35% based on betrayalChance
    const betrayal     = Math.max(0, (h.betrayalChance||0) - (h.betrayalReduction||0));
    const refuseChance = Math.min(0.40, 0.15 + betrayal / 200);

    const overlay = document.createElement('div');
    overlay.id = 'loyalty-pledge-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:660;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;backdrop-filter:blur(6px);';

    if (Math.random() < refuseChance) {
      // House refuses and becomes enemy
      overlay.innerHTML = `
        <div style="background:#12121a;border:2px solid rgba(239,68,68,0.5);border-radius:8px;width:92%;max-width:420px;padding:1.6rem;font-family:'Cinzel',serif;text-align:center">
          <div style="font-size:2rem;margin-bottom:0.6rem;display:flex;align-items:center;justify-content:center;height:2.8rem">${houseIcon(h,'2.4rem')}</div>
          <div style="font-family:'Cinzel Decorative',serif;color:#f87171;font-size:0.9rem;margin-bottom:0.6rem">Fedeltà Rifiutata</div>
          <div style="font-family:'EB Garamond',serif;font-size:0.95rem;color:#e8dcc8;line-height:1.6;margin-bottom:1.1rem">
            «Non riconosciamo la vostra legittimità sul Trono di Spade. Casa ${h.name} non si inchina a chi ha preso il potere con la forza.»
          </div>
          <button onclick="Game._loyaltyRefused('${hId}');document.getElementById('loyalty-pledge-overlay').remove()" style="width:100%;padding:0.65rem;background:linear-gradient(135deg,#7f1d1d,#dc2626);border:none;border-radius:3px;font-family:'Cinzel',serif;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#fff">Nemici della Corona</button>
        </div>`;
    } else {
      // House demands a price
      overlay.innerHTML = `
        <div style="background:#12121a;border:2px solid rgba(201,168,76,0.5);border-radius:8px;width:92%;max-width:420px;padding:1.6rem;font-family:'Cinzel',serif;text-align:center">
          <div style="font-size:2rem;margin-bottom:0.6rem;display:flex;align-items:center;justify-content:center;height:2.8rem">${houseIcon(h,'2.4rem')}</div>
          <div style="font-family:'Cinzel Decorative',serif;color:#c9a84c;font-size:0.9rem;margin-bottom:0.6rem">👑 Condizioni per la Fedeltà</div>
          <div style="font-family:'EB Garamond',serif;font-size:0.95rem;color:#e8dcc8;line-height:1.6;margin-bottom:0.9rem">
            «Riconosceremo il vostro diritto a regnare sui Sette Regni. Ma i giuramenti di fedeltà hanno un prezzo: volete la nostra lealtà? Pagate <strong style="color:#c9a84c">${cost.icon} ${cost.amount} ${cost.label}</strong>.»
          </div>
          <div style="font-size:0.75rem;color:${canAfford?'#4ade80':'#f87171'};margin-bottom:0.9rem;font-family:'Cinzel',serif">
            ${canAfford ? `✓ Hai ${Math.round(state.resources[cost.res])} ${cost.label} — puoi pagare` : `✗ Hai ${Math.round(state.resources[cost.res])} ${cost.label} — insufficiente`}
          </div>
          <div style="display:flex;gap:0.65rem">
            ${canAfford
              ? `<button onclick="Game._loyaltyAccepted('${hId}','${cost.res}',${cost.amount});document.getElementById('loyalty-pledge-overlay').remove()" style="flex:1;padding:0.65rem;background:linear-gradient(135deg,#78350f,#c9a84c);border:none;border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#0a0a0f">Paga ${cost.icon} ${cost.amount} — Giura Fedeltà</button>`
              : `<button disabled style="flex:1;padding:0.65rem;background:rgba(80,80,80,0.2);border:1px solid #333;border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;color:#555;cursor:not-allowed">Fondi Insufficienti</button>`
            }
            <button onclick="document.getElementById('loyalty-pledge-overlay').remove()" style="flex:1;padding:0.65rem;background:transparent;border:1px solid rgba(201,168,76,0.3);border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;color:#9a8a6a">Non ora</button>
          </div>
        </div>`;
    }

    document.body.appendChild(overlay);
  }

  function _loyaltyAccepted(hId, resKey, cost) {
    const h = state.houses[hId];
    if (!h) return;
    state.resources[resKey] = clampRes(state.resources[resKey] - cost);
    h.kingAlly = true;
    h.status   = 'ally';
    // Remove from pending list
    if (state.pendingLoyaltyPledges) {
      state.pendingLoyaltyPledges = state.pendingLoyaltyPledges.filter(id => id !== hId);
    }
    showToast(`👑 ${h.icon} Casa ${h.name} giura fedeltà alla Corona!`, 'good');
    updateHUD(); saveGame();
    renderDiplomacy();
    checkUnityVictory();
  }

  function _loyaltyRefused(hId) {
    const h = state.houses[hId];
    if (!h) return;
    h.status = 'enemy';
    if (state.pendingLoyaltyPledges) {
      state.pendingLoyaltyPledges = state.pendingLoyaltyPledges.filter(id => id !== hId);
    }
    showToast(`⚔ ${h.icon} Casa ${h.name} rifiuta la Corona — nemici giurati!`, 'warn');
    updateHUD(); saveGame();
    renderDiplomacy();
  }

  function checkUnityVictory() {
    if (!state.isPlayerKing) return;
    // Victory if ALL non-suppressed houses are kingAlly (fedeli alla Corona)
    const nonSuppressed = Object.entries(state.houses).filter(([,h]) => !h.suppressed);
    const allFedeli = nonSuppressed.every(([,h]) => h.kingAlly);
    if (allFedeli && nonSuppressed.length > 0) {
      state.gameOver = true;
      showUnityVictoryOverlay();
    }
  }

  function showUnityVictoryOverlay() {
    if (!document.getElementById('unity-style')) {
      const s = document.createElement('style');
      s.id = 'unity-style';
      s.textContent = `
        @keyframes unity-crown { 0%{transform:translateY(-80px) scale(0.3) rotate(-20deg);opacity:0} 60%{transform:translateY(8px) scale(1.15) rotate(3deg);opacity:1} 100%{transform:translateY(0) scale(1) rotate(0);opacity:1} }
        @keyframes unity-glow  { 0%,100%{text-shadow:0 0 30px rgba(201,168,76,0.4)} 50%{text-shadow:0 0 80px rgba(201,168,76,1),0 0 160px rgba(201,168,76,0.5)} }
        @keyframes unity-star  { 0%{transform:scale(0) rotate(0);opacity:0} 50%{opacity:1} 100%{transform:scale(1) rotate(360deg);opacity:0.8} }
        @keyframes unity-rise  { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes unity-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        #unity-stars span { display:inline-block; animation: unity-star 1.2s ease-out forwards; font-size:1.2rem; }
      `;
      document.head.appendChild(s);
    }

    const char = state.character;
    const overlay = document.createElement('div');
    overlay.id = 'unity-victory-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:900;
      background:radial-gradient(ellipse at center, #1a0e00 0%, #0a0a0f 60%);
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      font-family:'Cinzel',serif;overflow:hidden;
    `;

    // Generate star particles
    const stars = Array.from({length:12}, (_,i) =>
      `<span style="animation-delay:${i*0.15}s">${['✨','⭐','🌟','💫'][i%4]}</span>`
    ).join('');

    overlay.innerHTML = `
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%,rgba(201,168,76,0.15) 0%,transparent 70%);pointer-events:none"></div>

      <div style="font-size:5rem;animation:unity-crown 1.2s cubic-bezier(0.34,1.56,0.64,1) forwards;margin-bottom:0.5rem">👑</div>

      <div id="unity-stars" style="margin-bottom:1rem;letter-spacing:0.5rem">${stars}</div>

      <div style="font-family:'Cinzel Decorative',serif;font-size:1.4rem;color:#c9a84c;text-align:center;line-height:1.3;animation:unity-rise 0.8s ease 0.6s both;animation-name:unity-rise,unity-glow;animation-duration:0.8s,3s;animation-delay:0.6s,1.4s;animation-iteration-count:1,infinite;margin-bottom:0.5rem">
        I Sette Regni Sono Uniti
      </div>

      <div style="font-size:2.5rem;animation:unity-float 2.5s ease-in-out 1.2s infinite;margin-bottom:0.75rem">${char.icon}</div>

      <div style="font-family:'Cinzel Decorative',serif;font-size:0.9rem;color:#e8dcc8;text-align:center;animation:unity-rise 0.8s ease 0.9s both;margin-bottom:0.4rem">
        ${char.name}
      </div>
      <div style="font-family:'EB Garamond',serif;font-size:0.78rem;color:#9a8a6a;letter-spacing:0.1em;text-transform:uppercase;animation:unity-rise 0.8s ease 1s both;margin-bottom:1.5rem">
        Re dei Sette Regni
      </div>

      <div style="font-family:'EB Garamond',serif;font-size:0.95rem;color:#c9a84c;text-align:center;max-width:340px;line-height:1.7;font-style:italic;animation:unity-rise 0.8s ease 1.2s both;margin-bottom:1.75rem;padding:0 1.5rem">
        «Ogni casata ha giurato fedeltà. Per la prima volta nella storia dei Sette Regni, non vi è guerra né divisione. Il tuo nome sarà ricordato per sempre.»
      </div>

      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;justify-content:center;margin-bottom:1.5rem;animation:unity-rise 0.8s ease 1.4s both">
        ${Object.values(state.houses).filter(h=>!h.suppressed).map(h=>`<span style="font-size:1.4rem">${h.icon}</span>`).join('')}
      </div>

      <div style="font-family:'EB Garamond',serif;font-size:0.8rem;color:#6b5e4a;margin-bottom:1.25rem;animation:unity-rise 0.8s ease 1.6s both">
        Turno ${state.turn} · ${Object.values(state.houses).filter(h=>!h.suppressed).length} casate unite
      </div>

      <button onclick="Game.restart()" style="padding:0.85rem 2.5rem;background:linear-gradient(135deg,#78350f,#c9a84c,#78350f);border:none;border-radius:3px;font-family:'Cinzel Decorative',serif;font-size:0.85rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;cursor:pointer;color:#0a0a0f;animation:unity-rise 0.8s ease 1.8s both">
        ♛ Nuova Partita
      </button>
    `;
    document.body.appendChild(overlay);
    if (typeof AudioManager !== 'undefined') AudioManager.playMainFromWar();
  }

  function _continueAfterRetreat() { drawNextCard(); }

  function _showRetreatSummaryPopup(h, survived, armyLost, becameDiffidente, becameAlly) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:700;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.4s ease;backdrop-filter:blur(6px);overflow-y:auto;';

    const diffHtml = becameDiffidente.length > 0
      ? `<div style="margin-top:0.8rem;padding:0.7rem;background:rgba(251,146,60,0.07);border:1px solid rgba(251,146,60,0.3);border-radius:4px">
          <div style="font-family:'Cinzel',serif;font-size:0.65rem;color:#fb923c;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.4rem">🟠 Casate Diventate Diffidenti</div>
          ${becameDiffidente.map(d => `
            <div style="font-family:'EB Garamond',serif;font-size:0.88rem;color:#e8dcc8;margin:0.2rem 0">
              ${d.icon} Casa ${d.name} — <span style="color:#fb923c">ha perso fiducia in voi</span>
              <span style="color:#9a8a6a;font-size:0.78rem"> · perdono: 💰${d.cost} oro</span>
            </div>`).join('')}
          <div style="font-family:'EB Garamond',serif;font-size:0.8rem;color:#9a8a6a;font-style:italic;margin-top:0.4rem">Le casate diffidenti non vi attaccheranno, ma bloccano ogni contatto diplomatico finché non pagate il perdono.</div>
        </div>`
      : '';

    const allyHtml = becameAlly.length > 0
      ? `<div style="margin-top:0.8rem;padding:0.7rem;background:rgba(74,222,128,0.07);border:1px solid rgba(74,222,128,0.25);border-radius:4px">
          <div style="font-family:'Cinzel',serif;font-size:0.65rem;color:#4ade80;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.4rem">🟢 Casate Che Vi Rispettano</div>
          ${becameAlly.map(a => `<div style="font-family:'EB Garamond',serif;font-size:0.88rem;color:#e8dcc8;margin:0.2rem 0">${a.icon} Casa ${a.name} — <span style="color:#4ade80">rispettano la vostra sopravvivenza</span></div>`).join('')}
        </div>`
      : '';

    overlay.innerHTML = `
      <div style="background:linear-gradient(160deg,#1a1508,#12100a);border:2px solid rgba(239,68,68,0.45);border-radius:8px;width:92%;max-width:460px;padding:1.75rem 1.5rem;font-family:'Cinzel',serif;max-height:90vh;overflow-y:auto">
        <div style="text-align:center;margin-bottom:1rem">
          <div style="font-size:2rem;margin-bottom:0.4rem">🏃</div>
          <div style="font-family:'Cinzel Decorative',serif;color:#f87171;font-size:1rem;letter-spacing:0.05em">Ritirata dal Campo di Battaglia</div>
        </div>

        <div style="padding:0.7rem;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.3);border-radius:4px;margin-bottom:0.5rem">
          <div style="font-family:'Cinzel',serif;font-size:0.65rem;color:#f87171;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.4rem">🔴 Casata Attaccata — Ora Nemica</div>
          <div style="font-family:'EB Garamond',serif;font-size:0.9rem;color:#e8dcc8;line-height:1.5">
            ${h.icon} <strong>Casa ${h.name}</strong> non dimentica l'aggressione. Sono ora vostri nemici dichiarati.
            <br><span style="color:#9a8a6a;font-size:0.8rem">Per tornare neutrali sarà necessario un risarcimento in oro molto alto.</span>
          </div>
        </div>

        <div style="padding:0.65rem;background:rgba(60,60,60,0.2);border:1px solid rgba(100,100,100,0.2);border-radius:4px;margin-bottom:0.5rem;font-family:'EB Garamond',serif;font-size:0.85rem;color:#9a8a6a">
          ⚔ Soldati persi in battaglia: <strong style="color:#f87171">${armyLost}</strong> &nbsp;·&nbsp; Superstiti: <strong style="color:#4ade80">${survived}</strong>
        </div>

        ${diffHtml}${allyHtml}

        <button onclick="this.parentElement.parentElement.remove();Game._continueAfterRetreat()" style="width:100%;margin-top:1.2rem;padding:0.8rem;background:linear-gradient(135deg,#78350f,#c9a84c);border:none;border-radius:3px;font-family:'Cinzel Decorative',serif;font-size:0.78rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;color:#0a0a0f">
          Continua →
        </button>
      </div>`;
    document.body.appendChild(overlay);
  }

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
    state.resources[res] = clampRes(state.resources[res] - amount);

    // Once tribute is paid, the house MUST honor the deal (higher base chance)
    // They asked for tribute — the player paid — no "take money and refuse"
    const honoredChance = Math.min(0.95, chance + 0.25); // tribute paid = significant bonus
    const roll = Math.random();
    if (roll < honoredChance) {
      h.status = h.status === 'enemy' ? 'neutral' : 'ally';
      state.resources.power = clampRes(r.power + (h.status === 'ally' ? 4 : 0));
      const msg = h.status === 'ally'
        ? `🤝 Casa ${h.name} accetta! Siete ora alleati. (${pct}%)`
        : `✉ Casa ${h.name} allenta le ostilità. Ora Neutrali. (${pct}%)`;
      showToast(msg, 'good');
      if (h.status === 'ally') state.decisionHistory.push({ turn: state.turn, cardId: 'raven_alliance', choice: 'alliance', tags: ['diplomacy'], target: hId });
    } else {
      // Very rare case: they took the tribute but still refused (bad faith)
      showToast(`😤 Casa ${h.name} ha accettato il tributo ma poi ha cambiato idea. Un insulto! (sfortuna rara)`, 'warn');
      // Record a 7-turn cooldown as penalty
      if (!state.allianceCooldowns) state.allianceCooldowns = {};
      state.allianceCooldowns[hId] = state.turn + 7;
    }

    state.ravenTarget = null;
    updateHUD();
    saveGame();
    renderDiplomacy?.();
  }

  function rejectAllianceDemand(hId, hostilityIncrease) {
    document.getElementById('alliance-demand-overlay')?.remove();
    const h = state.houses[hId];
    if (!h) return;
    _recordDipEvent(hId, 'broken_alliance');
    if (!state.houseHostility) state.houseHostility = {};
    state.houseHostility[hId] = (state.houseHostility[hId] || 0) + hostilityIncrease;
    // 7-turn cooldown before you can propose alliance again
    if (!state.allianceCooldowns) state.allianceCooldowns = {};
    state.allianceCooldowns[hId] = state.turn + 7;
    showToast(`😠 Casa ${h.name} ricorda il vostro rifiuto. Dovrete aspettare 7 turni prima di riproporre un'alleanza.`, 'warn');
    state.ravenTarget = null;
    updateHUD();
    saveGame();
    renderDiplomacy?.();
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
      _recordDipEvent(hId, 'broken_alliance');
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
      { res: 'power',  label: 'Potere',  icon: '👑'   },
    ];
    const AMOUNT = 5; // Fixed 5 units per request

    // Build resource choice buttons
    const choiceBtns = resOptions.map(opt => `
      <button onclick="Game.requestSpecificResource('${hId}','${opt.res}',${AMOUNT})" style="
        display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.55rem 0.75rem;
        margin-bottom:0.35rem;background:rgba(201,168,76,0.06);
        border:1px solid rgba(201,168,76,0.25);border-radius:3px;
        font-family:'EB Garamond',serif;font-size:0.95rem;color:#e8dcc8;cursor:pointer;
        transition:background 0.15s;text-align:left;
      " onmouseover="this.style.background='rgba(201,168,76,0.14)'" onmouseout="this.style.background='rgba(201,168,76,0.06)'">
        <span style="font-size:1.1rem">${opt.icon}</span>
        <span>${opt.label} — <strong style="color:#c9a84c">5 unità</strong></span>
        <span style="margin-left:auto;font-size:0.75rem;color:#6b5e4a">→</span>
      </button>
    `).join('');

    const reqCount = (state.resourceRequestCount || {})[hId] || 0;
    const warningHtml = reqCount >= 2
      ? `<div style="padding:0.5rem 0.65rem;background:rgba(220,38,38,0.08);border:1px solid rgba(220,38,38,0.25);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.82rem;color:#f87171;margin-bottom:0.85rem">
          ⚠ Hai già chiesto risorse ${reqCount} volte. Se continui a chiedere troppo spesso, Casa ${h.name} potrebbe considerarti debole e sciogliere l'alleanza.
         </div>` : '';

    const overlay = document.createElement('div');
    overlay.id = 'req-resources-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:625;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;backdrop-filter:blur(4px);';
    overlay.innerHTML = `
      <div style="background:#12121a;border:1px solid rgba(201,168,76,0.5);border-radius:6px;width:92%;max-width:420px;padding:1.6rem;font-family:'Cinzel',serif;">
        <div style="font-family:'Cinzel Decorative',serif;color:#c9a84c;font-size:0.9rem;margin-bottom:0.35rem">${h.icon} Richiesta a Casa ${h.name}</div>
        <div style="font-size:0.7rem;color:#9a8a6a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.85rem">Scegli cosa chiedere (5 unità)</div>
        ${warningHtml}
        <div style="background:rgba(201,168,76,0.04);border:1px solid rgba(201,168,76,0.15);border-radius:4px;padding:0.75rem;margin-bottom:1rem;font-family:'EB Garamond',serif;font-size:0.88rem;color:#9a8a6a;line-height:1.5">
          Casa ${h.name} deciderà se darti le risorse <strong style="color:#e8dcc8">gratuitamente</strong> o in <strong style="color:#c9a84c">cambio</strong> di qualcosa. Scegli la risorsa che ti serve:
        </div>
        <div>${choiceBtns}</div>
        <button onclick="document.getElementById('req-resources-overlay').remove()" style="width:100%;margin-top:0.5rem;padding:0.6rem;background:transparent;border:1px solid rgba(201,168,76,0.3);border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;color:#9a8a6a">Annulla</button>
      </div>`;
    document.body.appendChild(overlay);
  }

  function requestSpecificResource(hId, resKey, amount) {
    document.getElementById('req-resources-overlay')?.remove();
    const h = state.houses[hId];
    if (!h || h.status !== 'ally') return;

    const resLabels = { gold: 'Oro 💰', army: 'Soldati ⚔', people: 'Popolo 👥', faith: 'Fede ✝', power: 'Potere 👑' };
    const label = resLabels[resKey] || resKey;

    // Allies are much less generous — 80% chance they want something back, 15% outright refuse
    const outright = Math.random() < 0.15;
    if (outright) {
      const refusals = [
        `«Non siamo in grado di aiutarvi in questo momento.»`,
        `«Le nostre riserve sono scarse. Non possiamo permetterci di cedere risorse.»`,
        `«Le condizioni non sono favorevoli per questo tipo di accordo.»`,
      ];
      showToast(`${h.icon} ${rand(refusals)}`, 'warn');
      return;
    }

    // 80% want exchange (was 55%), and the cost is higher (amount * 0.8–1.2)
    const wantExchange = Math.random() < 0.80;
    if (wantExchange) {
      const otherRes = ['gold','army','people','faith','power'].filter(r => r !== resKey);
      const costResKey = rand(otherRes);
      const costAmt = Math.max(3, Math.floor(amount * (0.8 + Math.random() * 0.4)));
      const costLabel = resLabels[costResKey] || costResKey;
      const canAfford = state.resources[costResKey] >= costAmt;

      const existing2 = document.getElementById('req-resources-overlay2');
      if (existing2) existing2.remove();
      const overlay2 = document.createElement('div');
      overlay2.id = 'req-resources-overlay2';
      overlay2.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:626;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;backdrop-filter:blur(4px);';
      overlay2.innerHTML = `
        <div style="background:#12121a;border:1px solid rgba(201,168,76,0.5);border-radius:6px;width:92%;max-width:400px;padding:1.6rem;font-family:'Cinzel',serif;">
          <div style="font-family:'Cinzel Decorative',serif;color:#c9a84c;font-size:0.9rem;margin-bottom:0.35rem">${h.icon} Casa ${h.name} risponde</div>
          <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:4px;padding:0.85rem;margin-bottom:1rem;font-family:'EB Garamond',serif;font-size:0.95rem;color:#e8dcc8;line-height:1.6">
            <p>«Vi mandiamo <strong style="color:#4ade80">${amount} ${label}</strong>, ma vogliamo in cambio <strong style="color:#f87171">${costAmt} ${costLabel}</strong>.»</p>
            <p style="font-size:0.82rem;color:#9a8a6a;margin-top:0.5rem">Avete: ${Math.round(state.resources[costResKey])} — ${canAfford ? '<span style="color:#4ade80">✓ sufficiente</span>' : '<span style="color:#f87171">✗ insufficiente</span>'}</p>
          </div>
          <div style="display:flex;gap:0.75rem">
            ${canAfford
              ? `<button onclick="Game.acceptAllyResourceGift('${hId}','${resKey}',${amount},'${costResKey}',${costAmt});document.getElementById('req-resources-overlay2')?.remove()" style="flex:1;padding:0.7rem;background:linear-gradient(135deg,#14532d,#16a34a);border:none;border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;color:#fff">✓ Accetta</button>`
              : `<button disabled style="flex:1;padding:0.7rem;background:rgba(80,80,80,0.2);border:1px solid #444;border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;color:#555;cursor:not-allowed">✗ Risorse insufficienti</button>`
            }
            <button onclick="document.getElementById('req-resources-overlay2').remove()" style="flex:1;padding:0.7rem;background:transparent;border:1px solid rgba(201,168,76,0.4);border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;color:#c9a84c">Rifiuta</button>
          </div>
        </div>`;
      document.body.appendChild(overlay2);
    } else {
      // Rare free gift — they really like you
      state.resources[resKey] = Math.min(getResourceCap(), state.resources[resKey] + amount);
      showToast(`📦 Casa ${h.name} vi invia ${amount} ${label} come segno di stima.`, 'good');
      updateHUD(); saveGame();
      toggleDiplomacy();
    }
  }

  function acceptAllyResourceGift(hId, gainRes, gainAmt, costRes, costAmt) {
    document.getElementById('req-resources-overlay')?.remove();
    const h = state.houses[hId];
    if (!h) return;
    state.resources[gainRes] = Math.min(getResourceCap(), state.resources[gainRes] + gainAmt);
    if (costRes && costAmt > 0) {
      state.resources[costRes] = Math.max(0, state.resources[costRes] - costAmt);
    }
    showToast(`📦 Casa ${h.name} vi invia le risorse richieste.`, 'good');
    updateHUD(); saveGame();
    toggleDiplomacy();
  }

  // ══════════════════════════════════════════════
  // KING DEMANDS — Il Re chiede risorse al giocatore
  // ══════════════════════════════════════════════
  function checkKingDemands() {
    if (state.isPlayerKing || state.gameOver) return;
    if (state.turn < 5) return;
    if (!state.kingDemandCooldown) state.kingDemandCooldown = 0;
    if (state.turn - state.kingDemandCooldown < 10) return;
    if (Math.random() > 0.08) return;
    if (state.eventQueue.some(c => c.tags?.includes('king_decree'))) return;
    state.kingDemandCooldown = state.turn;
    state.eventQueue.push(buildKingDecreeCard());
  }

  function buildKingDecreeCard() {
    const kingName = state.kingName || 'Il Re Reggente';
    const kingIcon = POSSIBLE_KINGS.find(k => k.id === state.king)?.icon || '👑';
    const refusals = state.kingDemandRefusals || 0;

    const demands = [
      { res: 'gold',   label: 'oro',     icon: '💰', amount: 15, text: `«I costi della Corona sono insostenibili. Contribuirete con 15 oro al tesoro reale.»` },
      { res: 'gold',   label: 'oro',     icon: '💰', amount: 18, text: `«${kingName} impone una tassa straordinaria di 18 oro a tutte le grandi casate del regno.»` },
      { res: 'army',   label: 'soldati', icon: '⚔',  amount: 12, text: `«La Corona richiede 12 soldati per difendere i confini. I vostri uomini serviranno sotto stendardo reale.»` },
      { res: 'army',   label: 'soldati', icon: '⚔',  amount: 10, text: `«${kingName} chiede un contingente di 10 soldati. È un obbligo feudale, non una richiesta.»` },
      { res: 'people', label: 'popolo',  icon: '👥', amount: 12, text: `«Il Re decreta il trasferimento di 12 famiglie dai vostri territori alle terre della Corona.»` },
      { res: 'faith',  label: 'fede',    icon: '✝',  amount: 10, text: `«${kingName} vi invita a sostenere la Fede dei Sette con 10 punti di devozione alla causa della Corona.»` },
    ];
    const d = rand(demands);

    const warningNote = refusals === 1
      ? ` Un vostro precedente rifiuto è già stato registrato. Un altro affronto alla Corona non sarà tollerato.`
      : refusals >= 2
        ? ` Avete già sfidato la Corona due volte. Questo è il vostro ultimo avvertimento prima di conseguenze irreversibili.`
        : '';

    const refuseLabel = refusals === 0
      ? 'Rifiuta il decreto'
      : refusals === 1
        ? '⚠ Rifiuta ancora (Re e alleati Corona → nemici)'
        : '⚠ Rifiuta (conseguenze gravi)';

    return {
      id: 'king_decree_' + state.turn,
      speaker: kingName,
      speakerRole: `Decreto Reale — Trono di Spade`,
      portrait: kingIcon, icon: '👑',
      text: d.text + warningNote,
      leftText: refuseLabel,
      leftEffects: {},
      rightText: `Obbedisci — Invia ${d.icon} ${d.amount} ${d.label}`,
      rightEffects: { [d.res]: -d.amount },
      tags: ['king_decree'],
      onLeftChoose: () => {
        if (!state.kingDemandRefusals) state.kingDemandRefusals = 0;
        state.kingDemandRefusals++;
        state.kingConsecutiveTributes = 0; // reset consecutive tribute counter

        if (state.kingDemandRefusals === 1) {
          state.kingAllyBlocked = true;
          // Existing allies that are kingAlly lose the alliance → neutral
          const demotedAllies = [];
          Object.entries(state.houses).forEach(([id, h]) => {
            if (h.kingAlly && h.status === 'ally' && !h.suppressed) {
              h.status = 'neutral';
              _resetBetrayalReduction(id);
              demotedAllies.push(`${h.icon} Casa ${h.name}`);
            }
          });
          const demotedNote = demotedAllies.length > 0
            ? `<br><br>${demotedAllies.join(', ')} ${demotedAllies.length===1?'ha':'hanno'} sciolto l'alleanza con voi per fedeltà alla Corona.`
            : '';
          showModal(
            '👑 Decreto Reale Ignorato',
            `${kingName} non ha gradito il vostro rifiuto. Non potete più stringere alleanze con le casate fedeli alla Corona.${demotedNote}<br><br><em>Pagate i prossimi 2 tributi consecutivi per placare gli animi.</em>`,
            '👑', 'Capito', () => { updateHUD(); saveGame(); }
          );
        } else {
          // 2° rifiuto: all kingAlly → enemy
          state.kingAllyBlocked = true;
          const affectedHouses = [];
          Object.entries(state.houses).forEach(([, h]) => {
            if (h.kingAlly && h.status !== 'ally' && !h.suppressed) {
              h.status = 'enemy';
              affectedHouses.push(`${h.icon} Casa ${h.name}`);
            }
          });
          if (state.houses[state.kingHouseAffiliation]) {
            state.houses[state.kingHouseAffiliation].status = 'enemy';
          }
          const houseList = affectedHouses.length > 0 ? `<br><br>${affectedHouses.join(', ')} sono ora vostri nemici.` : '';
          showModal(
            '👑 Traditori della Corona!',
            `${kingName} vi dichiara nemici della Corona.${houseList}`,
            '⚔', 'Prepararsi alla guerra', () => { state.resources.power = clampRes(state.resources.power - 10); updateHUD(); saveGame(); }
          );
        }
      },
      onRightChoose: () => {
        // Obbedisci — track consecutive tributes
        if (!state.kingConsecutiveTributes) state.kingConsecutiveTributes = 0;
        state.kingConsecutiveTributes++;

        if (state.kingDemandRefusals >= 1 && state.kingConsecutiveTributes >= 2) {
          // 2 consecutive tributes after refusal → restore blocked status
          state.kingAllyBlocked = false;
          state.kingConsecutiveTributes = 0;
          showModal(
            '👑 Gli Animi si Placano',
            `Dopo due contributi consecutivi, ${kingName} ha dimenticato il passato affronto. Potete di nuovo cercare alleanze con le casate fedeli alla Corona.`,
            '🕊', 'Ottimo', () => { updateHUD(); saveGame(); }
          );
        } else if (state.kingDemandRefusals === 1) {
          showToast(`👑 ${kingName} accetta il vostro contributo. Ancora un tributo per placare del tutto gli animi.`, 'good');
          updateHUD(); saveGame();
        } else {
          showToast(`👑 ${kingName} accetta il vostro contributo con soddisfazione.`, 'good');
          updateHUD(); saveGame();
        }
      },
    };
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
        text: `Casa ${h.name} attraversa un momento difficile e vi chiede ${req.icon} ${req.amount} ${req.label}. Non riceverete nulla in cambio — ma rifiutare indebolisce il vostro patto.`,
        leftText: 'Non possiamo permettercelo',
        leftEffects: { power: -6 },
        rightText: `Invia ${req.icon} ${req.amount} ${req.label}`,
        rightEffects: { [req.res]: -req.amount },
        tags: ['help_ally'],
        onLeftChoose: () => {
          if (!state.exchangeCount) state.exchangeCount = {};
          state.exchangeCount[hId] = (state.exchangeCount[hId] || 0) + 1;
          if (state.exchangeCount[hId] >= 3) {
            h.status = 'neutral';
            _resetBetrayalReduction(hId);
            _recordDipEvent(hId, 'broken_alliance');
            showToast(`😤 Casa ${h.name} è stanca dei vostri rifiuti. Tornano neutrali.`, 'warn');
          }
        },
      });
    });
  }

  // ══════════════════════════════════════════════
  // THRONE CHALLENGE SYSTEM
  // ══════════════════════════════════════════════

  function _openKingDetailPopup() {
    document.getElementById('king-detail-popup')?.remove();
    const king = POSSIBLE_KINGS.find(k => k.id === state.king);
    const kingH = state.houses[state.kingHouseAffiliation];
    if (!king || !kingH) return;

    const armyVal   = Math.round(state.resources.army);
    const allyCount = Object.values(state.houses).filter(h => h.status === 'ally').length;
    const canChallenge = armyVal > 80 && allyCount >= 2 && !state.pendingKingChallenge && !state.isPlayerKing;

    const diff = state.character.difficulty;
    const diffMod = { easy:0.80, medium:1.0, hard:1.25 }[diff] || 1.0;
    const kingForceEst   = Math.round((state.kingArmy||65)*diffMod);
    const playerForceEst = Math.round(state.resources.army + Object.values(state.houses).filter(h=>h.status==='ally').reduce((s,h)=>s+h.army*0.4,0));
    const winPct = Math.round(Math.min(95,Math.max(5,(playerForceEst/(playerForceEst+kingForceEst))*100)));

    const req1ok = armyVal > 80;
    const req2ok = allyCount >= 2;
    const req3ok = !state.pendingKingChallenge && !state.isPlayerKing;

    const popup = document.createElement('div');
    popup.id = 'king-detail-popup';
    popup.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:700;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);animation:fadeIn 0.25s ease';

    popup.innerHTML = `
      <div style="
        width:92%;max-width:420px;max-height:88vh;overflow-y:auto;
        background:linear-gradient(160deg,#0e0b1a,#0a0810);
        border:2px solid rgba(192,132,252,0.5);border-radius:8px;
        position:relative;overflow:hidden;
      ">
        <!-- Sfondo stemma grande -->
        ${kingH.crest ? `<img src="${kingH.crest}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:0.06;pointer-events:none;filter:blur(3px)">` : ''}

        <div style="position:relative;padding:1.5rem 1.25rem">
          <!-- Ritratto grande -->
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.6rem;margin-bottom:1rem">
            <div style="width:6rem;height:6rem;border-radius:50%;overflow:hidden;border:2px solid rgba(192,132,252,0.7);box-shadow:0 0 24px rgba(192,132,252,0.25);background:rgba(0,0,0,0.5)">
              <img src="images/characters/${king.id}.png" alt="${king.name}"
                style="width:100%;height:100%;object-fit:cover;object-position:top"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
              <span style="display:none;font-size:2.8rem;width:100%;height:100%;align-items:center;justify-content:center">${king.icon}</span>
            </div>
            <div style="text-align:center">
              <div style="font-family:'Cinzel Decorative',serif;font-size:0.95rem;color:#c084fc;letter-spacing:0.05em">${king.name}</div>
              <div style="font-size:0.68rem;color:#6b5e4a;font-family:'EB Garamond',serif;font-style:italic;margin-top:0.15rem">Casa ${kingH.name} · ⚔ ${Math.round(kingH.army)} truppe stimate</div>
            </div>
          </div>

          <!-- Descrizione -->
          <div style="font-family:'EB Garamond',serif;font-size:0.9rem;color:#c8b89a;line-height:1.7;margin-bottom:1rem;font-style:italic;padding:0.75rem;background:rgba(192,132,252,0.04);border:1px solid rgba(192,132,252,0.15);border-radius:4px">
            ${king.desc || 'Il Re governa con pugno di ferro sui Sette Regni.'}
          </div>

          <!-- Requisiti sfida -->
          <div style="margin-bottom:1rem">
            <div style="font-family:'Cinzel',serif;font-size:0.65rem;color:#c084fc;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.6rem">⚔ Requisiti per Sfidare il Re</div>
            <div style="display:flex;flex-direction:column;gap:0.4rem">
              <div style="display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0.65rem;background:${req1ok?'rgba(74,222,128,0.08)':'rgba(239,68,68,0.06)'};border:1px solid ${req1ok?'rgba(74,222,128,0.3)':'rgba(239,68,68,0.25)'};border-radius:4px">
                <span style="font-size:1rem">${req1ok?'✅':'❌'}</span>
                <div style="flex:1">
                  <div style="font-family:'Cinzel',serif;font-size:0.72rem;color:${req1ok?'#4ade80':'#f87171'}">Esercito superiore a 80</div>
                  <div style="font-size:0.68rem;color:#9a8a6a;font-family:'EB Garamond',serif">Il tuo esercito attuale: <strong>${armyVal}</strong></div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0.65rem;background:${req2ok?'rgba(74,222,128,0.08)':'rgba(239,68,68,0.06)'};border:1px solid ${req2ok?'rgba(74,222,128,0.3)':'rgba(239,68,68,0.25)'};border-radius:4px">
                <span style="font-size:1rem">${req2ok?'✅':'❌'}</span>
                <div style="flex:1">
                  <div style="font-family:'Cinzel',serif;font-size:0.72rem;color:${req2ok?'#4ade80':'#f87171'}">Almeno 2 casate alleate</div>
                  <div style="font-size:0.68rem;color:#9a8a6a;font-family:'EB Garamond',serif">Le tue alleanze attuali: <strong>${allyCount}</strong></div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0.65rem;background:${req3ok?'rgba(74,222,128,0.08)':'rgba(239,68,68,0.06)'};border:1px solid ${req3ok?'rgba(74,222,128,0.3)':'rgba(239,68,68,0.25)'};border-radius:4px">
                <span style="font-size:1rem">${req3ok?'✅':'❌'}</span>
                <div style="flex:1">
                  <div style="font-family:'Cinzel',serif;font-size:0.72rem;color:${req3ok?'#4ade80':'#f87171'}">Nessuna sfida già dichiarata</div>
                  <div style="font-size:0.68rem;color:#9a8a6a;font-family:'EB Garamond',serif">${state.pendingKingChallenge?`Sfida in corso — mancano ${Math.max(0,state.pendingKingChallenge.battleTurn-state.turn)} turni`:'Nessuna sfida in corso'}</div>
                </div>
              </div>
            </div>
            <div style="margin-top:0.5rem;font-family:'EB Garamond',serif;font-size:0.78rem;color:#9a8a6a;text-align:center">
              Probabilità di vittoria stimata: <strong style="color:${winPct>=50?'#4ade80':'#f87171'}">${winPct}%</strong>
            </div>
          </div>

          <!-- Bottoni -->
          <div style="display:flex;flex-direction:column;gap:0.5rem">
            ${canChallenge ? `
              <button onclick="document.getElementById('king-detail-popup').remove();Game.challengeKing();Game.toggleDiplomacy();" style="
                width:100%;padding:0.75rem;
                background:linear-gradient(135deg,#7f1d1d,#dc2626);
                border:none;border-radius:4px;
                font-family:'Cinzel',serif;font-size:0.78rem;font-weight:700;
                letter-spacing:0.1em;text-transform:uppercase;
                cursor:pointer;color:#fff;
                box-shadow:0 4px 15px rgba(220,38,38,0.4);
              ">⚔ Sfida il Re Reggente</button>` : ''}
            <button onclick="document.getElementById('king-detail-popup').remove()" style="
              width:100%;padding:0.6rem;
              background:transparent;border:1px solid rgba(192,132,252,0.3);border-radius:4px;
              font-family:'Cinzel',serif;font-size:0.72rem;font-weight:600;
              letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;color:#9a8a6a;
            ">← Chiudi</button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(popup);
  }

  function challengeKing() {
    if (state.isPlayerKing) { showToast('👑 Sei già il Re Reggente!', 'warn'); return; }
    if (state.pendingKingChallenge) { showToast('⚔ La sfida al Re è già stata dichiarata!', 'warn'); return; }

    const activeAlliesCount = Object.values(state.houses).filter(h => h.status === 'ally').length;
    if (state.resources.army <= 80) { showToast('⚔ Devi avere Esercito >80 per sfidare il Re!', 'warn'); return; }
    if (activeAlliesCount < 2) { showToast('🤝 Devi avere almeno 2 casate alleate per sfidare il Re!', 'warn'); return; }

    // Costo politico — non si torna indietro
    state.resources.people = clampRes(state.resources.people - 12);
    state.pendingKingChallenge = { declaredTurn: state.turn, battleTurn: state.turn + 3 };
    state.pendingWarTarget = '__king__';
    if (typeof AudioManager !== 'undefined') AudioManager.playWar();

    showToast('📣 La sfida al Re è dichiarata. Non si torna indietro. Prepara i tuoi alleati — la battaglia inizierà tra 3 turni.', 'warn');
    _scheduleKingChallengeCards();
  }

  function _scheduleKingChallengeCards() {
    // King challenge cards take PRIORITY — unshift in reverse order so queue = t1 → t2 → t3 → existing

    // Turno 3 — la battaglia è inevitabile, entrambe le scelte avviano lo scontro
    state.eventQueue.unshift({
      id: 'king_ch_t3',
      speaker: `👑 ${state.kingName}`,
      speakerRole: '⚔ LA BATTAGLIA PER IL TRONO HA INIZIO',
      portrait: '⚔️', icon: '⚔️',
      text: `Le armate del Re sono schierate fuori Approdo del Re. Le casate hanno deciso da che parte stare. Le vostre truppe attendono il segnale. Questo è il momento per cui avete combattuto, intrigato e sacrificato tutto. Il Trono di Spade appartiene a chi sopravvive.`,
      leftText: '⚔ Per il Trono!', leftEffects: {},
      rightText: '⚔ Per il Trono!', rightEffects: {},
      tags: ['king_challenge_battle'],
      onLeftChoose:  () => { setTimeout(() => _startKingBattle(), 450); },
      onRightChoose: () => { setTimeout(() => _startKingBattle(), 450); },
    });

    // Turno 2 — "chiedi rinforzi" apre diplomazia e pausa, "mobilita" avanza normalmente
    state.eventQueue.unshift({
      id: 'king_ch_t2',
      speaker: 'Varys',
      speakerRole: 'Maestro dei Sussurri — rapporto segreto',
      portrait: '🕷', icon: '🕷',
      text: `Le spie riportano: ${state.kingName} ha mobilitato tutte le casate a lui fedeli. Le casate si stanno organizzando — alcune si uniranno al Re, altre valuteranno i propri interessi. Anche qualche vostro alleato potrebbe vacillare. Aprite la Diplomazia per garantirvi rinforzi prima della battaglia.`,
      leftText: 'Mobilita le riserve', leftEffects: { army: +6, gold: -8 },
      rightText: '🤝 Chiedi rinforzi agli alleati', rightEffects: {},
      tags: ['king_challenge_pending'],
      onLeftChoose:  () => _revealKingAlliances(),
      onRightChoose: () => {
        _revealKingAlliances();
        setTimeout(() => _openKingChallengeDiplomacy(), 400);
      },
      _pauseAfterChoice: 'right', // pausa solo se sceglie "chiedi rinforzi"
    });

    // Turno 1 — introduzione narrativa
    state.eventQueue.unshift({
      id: 'king_ch_t1',
      speaker: 'Corvo Reale',
      speakerRole: 'La notizia si diffonde in tutto il regno',
      portrait: '📜', icon: '📜',
      text: `La vostra sfida al Trono di Spade è nota a tutti. Le casate valutano le proprie posizioni. Aprite il pannello Diplomazia per chiedere rinforzi ai vostri alleati prima che la guerra inizi. Non potete più ritirare la dichiarazione.`,
      leftText: 'Prepariamo le difese', leftEffects: { army: +3 },
      rightText: 'Chiediamo aiuto agli alleati', rightEffects: { power: +2 },
      tags: ['king_challenge_pending'],
    });

    // Sostituisci immediatamente la carta in schermo con la t1
    _forceShowFirstWarCard();
  }

  // Overlay diplomazia per la sfida al Re (uguale a _openWarDiplomacy ma per il Re)
  function _openKingChallengeDiplomacy() {
    const existing = document.getElementById('war-diplo-reinf-overlay');
    if (existing) existing.remove();

    // Home houses (startAllies still ally and pact not broken) do NOT auto-provide troops.
    // They are shown as a disabled grey button — they belong to the player's house.
    const char = state.character;

    const allies = Object.entries(state.houses).filter(([, hh]) => hh.status === 'ally' && !hh.suppressed);
    const loanedArmy = state.loanedArmy || 0;
    const playerForce = state.resources.army + loanedArmy;
    const diff = state.character.difficulty;
    const kingBaseArmy = (state.kingArmy || 75);
    const kingAllyBonus = Object.entries(state.houses)
      .filter(([, h]) => h.status === 'enemy' && !h.suppressed)
      .reduce((sum, [, h]) => sum + h.army * 0.35, 0);
    const kingForce = Math.round(kingBaseArmy + kingAllyBonus);
    const winPct = Math.round(Math.min(95, Math.max(5, playerForce / (playerForce + kingForce) * 100)));

    const allyRows = allies.length > 0
      ? allies.map(([id, hh]) => {
          const hasLoan      = state.allyLoans && state.allyLoans[id];
          // isHome = SOLO la casata principale del personaggio (non tutte le startAllies)
          const primaryHouseId = _getPrimaryHouseId(char);
          const isHome       = primaryHouseId && id === primaryHouseId && !hh.pactBroken;
          const refusalState = (state.allyLoanRefusals || {})[id];

          // Casata principale → tasto grigio disabilitato (non fornisce truppe)
          if (isHome) {
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.65rem;margin-bottom:0.3rem;background:rgba(80,80,80,0.1);border:1px solid rgba(120,120,120,0.25);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#6b6b6b;opacity:0.6">
              <span>${hh.icon} Casa ${hh.name} <span style="font-size:0.68rem;font-family:'Cinzel',serif;color:#555">— casata di appartenenza</span></span>
              <span style="font-family:'Cinzel',serif;font-size:0.68rem;color:#555">🏰 Non disponibile</span>
            </div>`;
          }
          if (hasLoan) {
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.65rem;margin-bottom:0.3rem;background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.25);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#4ade80">
              <span>${hh.icon} Casa ${hh.name} — ⚔ ${Math.round(hh.army)}</span>
              <span style="font-family:'Cinzel',serif;font-size:0.68rem">⚔ +${state.allyLoans[id].amount} forniti</span>
            </div>`;
          }
          if (refusalState === 'neutral') {
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.65rem;margin-bottom:0.3rem;background:rgba(60,60,60,0.15);border:1px solid rgba(100,100,100,0.25);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#6b5e4a">
              <span>${hh.icon} Casa ${hh.name} — ⚔ ${Math.round(hh.army)}</span>
              <span style="font-family:'Cinzel',serif;font-size:0.65rem">🕊 Resta neutrale</span>
            </div>`;
          }
          if (refusalState === 'comp_refused') {
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.65rem;margin-bottom:0.3rem;background:rgba(60,60,60,0.15);border:1px solid rgba(100,100,100,0.25);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#6b5e4a">
              <span>${hh.icon} Casa ${hh.name} — ⚔ ${Math.round(hh.army)}</span>
              <span style="font-family:'Cinzel',serif;font-size:0.65rem">✗ Compenso rifiutato</span>
            </div>`;
          }
          return `<button onclick="Game.requestAllyArmy('${id}');document.getElementById('war-diplo-reinf-overlay').remove();setTimeout(()=>Game._openKingChallengeDiplomacy(),200)" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.65rem;margin-bottom:0.3rem;background:rgba(74,222,128,0.07);border:1px solid rgba(74,222,128,0.28);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#e8dcc8;cursor:pointer;text-align:left">
            <span>${hh.icon} Casa ${hh.name} — ⚔ ${Math.round(hh.army)}</span>
            <span style="color:#4ade80;font-family:'Cinzel',serif;font-size:0.68rem">Chiedi rinforzi →</span>
          </button>`;
        }).join('')
      : `<p style="font-family:'EB Garamond',serif;font-size:0.88rem;color:#6b5e4a;font-style:italic;margin:0">Nessuna casata alleata disponibile.</p>`;

    const loanNote = loanedArmy > 0
      ? `<div style="margin-bottom:0.5rem;font-family:'Cinzel',serif;font-size:0.72rem;color:#4ade80">⚔ Rinforzi ottenuti finora: +${loanedArmy}</div>`
      : '';

    const overlay = document.createElement('div');
    overlay.id = 'war-diplo-reinf-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:640;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;backdrop-filter:blur(4px);';
    overlay.innerHTML = `
      <div style="background:#12121a;border:2px solid rgba(201,168,76,0.6);border-radius:6px;width:92%;max-width:450px;max-height:90vh;overflow-y:auto;padding:1.75rem;font-family:'Cinzel',serif;">
        <div style="font-family:'Cinzel Decorative',serif;color:#c9a84c;font-size:0.95rem;margin-bottom:0.25rem">⚔ Sfida al Trono — Preparazione</div>
        <div style="font-size:0.68rem;color:#9a8a6a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.9rem">Chiedi rinforzi agli alleati prima della battaglia</div>

        <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:#e8dcc8;margin-bottom:0.35rem">
          <span>🗡 Tue forze: <strong style="color:#4ade80">${Math.round(playerForce)}</strong></span>
          <span>👑 Forze del Re (stimate): <strong style="color:#f87171">${kingForce}</strong></span>
        </div>
        <div style="height:8px;border-radius:4px;overflow:hidden;background:rgba(255,255,255,0.05);margin-bottom:0.3rem;display:flex">
          <div style="width:${Math.round(playerForce/(playerForce+kingForce)*100)}%;background:linear-gradient(90deg,#166534,#4ade80)"></div>
          <div style="flex:1;background:linear-gradient(90deg,#991b1b,#f87171)"></div>
        </div>
        <div style="text-align:center;font-size:0.72rem;color:#c9a84c;margin-bottom:0.85rem">Probabilità di vittoria stimata: <strong>${winPct}%</strong></div>
        ${loanNote}
        <div style="background:rgba(74,222,128,0.04);border:1px solid rgba(74,222,128,0.2);border-radius:4px;padding:0.75rem;margin-bottom:1rem">
          <div style="font-size:0.7rem;color:#4ade80;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.55rem">🤝 Casate alleate — chiedi rinforzi</div>
          ${allyRows}
        </div>
        <div style="display:flex;gap:0.65rem">
          <button onclick="document.getElementById('war-diplo-reinf-overlay').remove();Game.resumeCardFlow()" style="flex:1;padding:0.7rem;background:linear-gradient(135deg,#7f1d1d,#dc2626);border:none;border-radius:2px;font-family:'Cinzel',serif;font-size:0.73rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#fff">
            ⚔ Sono pronto — Continua
          </button>
        </div>
        <p style="font-family:'EB Garamond',serif;font-size:0.78rem;color:#6b5e4a;margin-top:0.65rem;line-height:1.5;font-style:italic">
          Chiudi quando hai finito. La prossima carta sarà l'inizio della battaglia.
        </p>
      </div>`;
    document.body.appendChild(overlay);
  }

  function _revealKingAlliances() {
    const supporters = [];
    const allyDefectors = [];

    Object.entries(state.houses).forEach(([, h]) => {
      if (h.suppressed) return;

      if (h.status === 'ally') {
        // Un alleato può vacillare di fronte alla guerra contro il Re — rischio alto
        const defectChance = 0.18; // 18% di base per la guerra al Re
        if (Math.random() < defectChance) {
          h.status = 'neutral';
          allyDefectors.push(`${h.icon} Casa ${h.name}`);
        }
        return;
      }

      // Casate nemiche si schierano col Re
      if (h.status !== 'enemy') return;
      const contribution = Math.floor(h.army * (0.25 + Math.random() * 0.20));
      if (contribution > 0) supporters.push(`${h.icon} Casa ${h.name} (+${contribution})`);
    });

    if (allyDefectors.length > 0) {
      showToast(`😤 ${allyDefectors.join(', ')} ${allyDefectors.length === 1 ? 'ha deciso' : 'hanno deciso'} di non sfidare il Re — ${allyDefectors.length === 1 ? 'torna' : 'tornano'} neutrale.`, 'warn');
    }
    if (supporters.length > 0) {
      showToast(`⚔ Alleati del Re: ${supporters.join(', ')} si schierano con lui!`, 'warn');
    } else {
      showToast('✅ Nessuna casata si è schierata con il Re. La battaglia è più equilibrata.', 'good');
    }
  }

  function _startKingBattle() {
    state.pendingKingChallenge = null;
    state.pendingWarTarget = null;

    const diff = state.character.difficulty;
    const kingBaseArmy = state.kingArmy || 100;

    // Re: tutti i suoi alleati (casate nemiche al giocatore), con possibilità di tradimento verso il Re
    const kingBetrayalChance = { easy: 0.15, medium: 0.10, hard: 0.05 }[diff] || 0.10;
    let kingAllyBonus = 0;
    const kingAlliesCommitted = [];
    const kingAlliesBetray = [];
    Object.entries(state.houses).forEach(([, h]) => {
      if (h.suppressed || h.status !== 'enemy') return;
      if (Math.random() < kingBetrayalChance) { kingAlliesBetray.push(h.name); return; }
      const contrib = h.army * 0.35;
      kingAllyBonus += contrib;
      kingAlliesCommitted.push(`${h.icon}${Math.round(contrib)}`);
    });
    const kingForce = Math.round(kingBaseArmy + kingAllyBonus);

    // Giocatore: esercito proprio + prestiti già richiesti
    const loanedArmy = state.loanedArmy || 0;
    let playerForce = state.resources.army + loanedArmy;

    // Alleati del giocatore che tradiscono all'ultimo (non quelli con prestito già confermato)
    const playerBetrayalChance = { easy: 0.08, medium: 0.18, hard: 0.28 }[diff] || 0.18;
    const playerBetray = [];
    Object.entries(state.houses).forEach(([id, h]) => {
      if (h.status !== 'ally' || h.suppressed) return;
      if (state.allyLoans && state.allyLoans[id]) return; // già impegnati — non possono tradire
      if (Math.random() < playerBetrayalChance) playerBetray.push(h.name);
    });

    // Casate NEUTRALI che si schierano in base ai propri interessi al momento della battaglia
    const neutralJoinKing = [], neutralJoinPlayer = [];
    Object.entries(state.houses).forEach(([, h]) => {
      if (h.status !== 'neutral' || h.suppressed) return;
      const roll = Math.random();
      // Tendono a schierarsi col più forte
      const kingStronger = kingForce > playerForce;
      if (kingStronger) {
        if (roll < 0.55) { kingAllyBonus += h.army * 0.15; neutralJoinKing.push(h.name); }
        else if (roll < 0.70) { playerForce += h.army * 0.15; neutralJoinPlayer.push(h.name); }
      } else {
        if (roll < 0.55) { playerForce += h.army * 0.15; neutralJoinPlayer.push(h.name); }
        else if (roll < 0.70) { kingAllyBonus += h.army * 0.15; neutralJoinKing.push(h.name); }
      }
    });

    // Notifiche tradimenti e schieramenti
    if (kingAlliesBetray.length > 0) showToast(`😲 Casa ${kingAlliesBetray.join(', ')} ha abbandonato il Re all'ultimo momento!`, 'good');
    if (playerBetray.length > 0) showToast(`💔 Casa ${playerBetray.join(', ')} si ritira — troppo rischioso sfidare il Trono.`, 'warn');
    if (neutralJoinPlayer.length > 0) showToast(`🤝 Casa ${neutralJoinPlayer.join(', ')} si schiera con te vedendo la tua forza!`, 'good');
    if (neutralJoinKing.length > 0) showToast(`⚔ Casa ${neutralJoinKing.join(', ')} si schiera con il Re.`, 'warn');

    const finalKingForce = Math.round(kingBaseArmy + kingAllyBonus);
    const finalPlayerForce = Math.round(playerForce);

    executeThroneAttack(finalPlayerForce, finalKingForce);
  }

  function executeThroneAttack(playerForce, kingForce) {
    // Clear any stale battle timer before starting new battle
    if (Game._battleTimer) { clearTimeout(Game._battleTimer); Game._battleTimer = null; }
    if (Game._throneStartPhase0) { Game._throneStartPhase0 = null; }

    // Set retreat handler specifically for king battle
    Game._battleRetreatFinish = function(survived) {
      // Subtract loaned troops before saving own survivors
      const ownSurvivedKingRetreat = Math.max(1, survived - (state.loanedArmy || 0));
      returnLoanedArmies();
      state.resources.army = ownSurvivedKingRetreat;
      state.pendingKingChallenge = null;

      // Casa del Re diventa nemica ufficiale
      const kingHouseId = state.kingHouseAffiliation;
      if (kingHouseId && state.houses[kingHouseId]) {
        state.houses[kingHouseId].status = 'enemy';
      }

      // ── GUERRA CIVILE — tutte le casate prendono posizione ──
      state.civilWar = true; // da ora niente diplomazia, solo guerra
      const joinedKing = [], joinedPlayer = [];

      Object.entries(state.houses).forEach(([hId, h]) => {
        if (hId === kingHouseId || h.suppressed) return;

        if (h.status === 'ally') {
          // Gli alleati attuali rimangono col giocatore — a meno che tradimento alto
          const betrayal = Math.max(0, (h.betrayalChance || 0) - (h.betrayalReduction || 0));
          if (Math.random() * 100 < betrayal) {
            h.status = 'enemy';
            joinedKing.push(`${h.icon} Casa ${h.name}`);
          }
          // altrimenti restano alleati — già segnati
          return;
        }

        if (h.status === 'enemy') {
          // I nemici si schierano col Re quasi sempre (90%)
          if (Math.random() < 0.90) joinedKing.push(`${h.icon} Casa ${h.name}`);
          // altrimenti rimangono nemici generici ma non si allineano al Re
          return;
        }

        // Casate neutrali/diffidenti: valutano in base agli interessi
        // Fattori: army del giocatore vs casa del Re, kingAlly, betrayalChance
        const playerStrength = state.resources.army;
        const kingStrength   = state.kingArmy || 70;
        const prefersStrong  = playerStrength > kingStrength;
        const isKingAlly     = h.kingAlly;

        let kingProb = 0.50; // base 50/50
        if (isKingAlly)     kingProb += 0.30; // fedeli al Re → tendono al Re
        if (prefersStrong)  kingProb -= 0.20; // giocatore forte → qualcuno lo preferisce
        if (h.status === 'diffidente') kingProb += 0.15; // diffidenti di noi → Re

        kingProb = Math.max(0.10, Math.min(0.90, kingProb));

        if (Math.random() < kingProb) {
          h.status = 'enemy';
          joinedKing.push(`${h.icon} Casa ${h.name}`);
        } else {
          h.status = 'ally';
          joinedPlayer.push(`${h.icon} Casa ${h.name}`);
        }
      });

      // Toast drammatico
      const kList = joinedKing.length   > 0 ? `\n⚔ Con il Re: ${joinedKing.join(', ')}` : '';
      const pList = joinedPlayer.length > 0 ? `\n🤝 Con voi: ${joinedPlayer.join(', ')}` : '';
      setTimeout(() => showToast(`🏃 Ritirata dichiarata. La guerra civile è iniziata. Le casate si schierano.${kList}${pList}`, 'warn'), 300);
      setTimeout(() => showToast(`⚔ Da ora nessuna tregua, nessun trattato. Solo la guerra deciderà il destino dei Sette Regni.`, 'warn'), 3500);

      updateHUD(); saveGame(); checkGameOver();
      if (!state.gameOver) drawNextCard();
    };

    showThroneAttackAnimation(playerForce, kingForce, (won, survived, enemySurvived) => {
      _resolveThroneAttack(won, playerForce, kingForce, survived, enemySurvived);
    });
  }

  // ══════════════════════════════════════════════
  // THRONE BATTLE — animazione epica 5 fasi, lenta e intensa
  // ══════════════════════════════════════════════
  function showThroneAttackAnimation(playerForce, kingForce, onComplete) {
    if (typeof AudioManager !== 'undefined') AudioManager.playWar();

    const kingName = state.kingName || 'Il Re';
    const charIcon = state.character?.icon || '⚔️';
    const _tbCharId = state.character?.id || '';
    const _tbCharFirstName = state.character?.name?.split(' ')[0] || 'Tu';
    // Split bg for throne battle: player left, king right
    const _tbKingId = state.king || (state.kingHouseAffiliation || '').toLowerCase();
    const _tbKingHouseCrest = state.houses[state.kingHouseAffiliation]?.crest || null;
    const _tbSplitBg = `
      <div style="position:absolute;inset:0;z-index:0;overflow:hidden;">
        <!-- Player side left -->
        <div style="position:absolute;inset:0;width:50%;left:0;">
          <img src="images/characters/${_tbCharId}_bg.png" style="width:100%;height:100%;object-fit:cover;object-position:top center;opacity:0.55"
               onerror="this.src='images/characters/${_tbCharId}.png';this.onerror=null">
          <div style="position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.85) 100%)"></div>
        </div>
        <!-- King side right -->
        <div style="position:absolute;inset:0;width:50%;right:0;left:auto;">
          <img src="images/characters/${_tbKingId}_bg.png" style="width:100%;height:100%;object-fit:cover;object-position:top center;opacity:0.55"
               onerror="this.src='images/characters/${_tbKingId}.png';this.onerror=this.src='${_tbKingHouseCrest||''}';this.style.objectFit='contain';this.style.opacity='0.35';this.onerror=null">
          <div style="position:absolute;inset:0;background:linear-gradient(to left,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.85) 100%)"></div>
        </div>
        <!-- Central fade -->
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 8% 100% at 50% 50%,rgba(0,0,0,0.97) 0%,transparent 100%)"></div>
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.5)"></div>
      </div>`;
    const _tbPlayerPortrait = `
      <div style="width:3rem;height:3rem;border-radius:50%;border:2px solid rgba(74,222,128,0.5);overflow:hidden;display:inline-flex;align-items:center;justify-content:center;background:rgba(74,222,128,0.06);animation:tb-pulse-gold 2s ease infinite">
        <img id="tb-portrait-player" src="images/characters/${_tbCharId}.png" alt="${_tbCharFirstName}"
          style="width:100%;height:100%;object-fit:cover"
          onerror="this.style.display='none';document.getElementById('tb-portrait-fb').style.display='flex'">
        <span id="tb-portrait-fb" style="display:none;font-size:1.8rem;animation:tb-pulse-gold 2s ease infinite">${charIcon}</span>
      </div>`;

    if (!document.getElementById('throne-battle-style')) {
      const s = document.createElement('style');
      s.id = 'throne-battle-style';
      s.textContent = `
        @keyframes tb-flicker {
          0%,100%{opacity:1} 30%{opacity:0.6} 55%{opacity:0.9} 75%{opacity:0.5}
        }
        @keyframes tb-ember {
          0%   { transform:translateY(0) translateX(0) scale(1);   opacity:1; }
          100% { transform:translateY(-140px) translateX(var(--dx)) scale(0.1); opacity:0; }
        }
        @keyframes tb-shake {
          0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)}
          35%{transform:translateX(8px)} 55%{transform:translateX(-6px)} 75%{transform:translateX(6px)}
        }
        @keyframes tb-pulse-gold {
          0%,100%{text-shadow:0 0 20px rgba(201,168,76,0.4)}
          50%{text-shadow:0 0 80px rgba(201,168,76,1),0 0 140px rgba(201,168,76,0.6)}
        }
        @keyframes tb-pulse-red {
          0%,100%{text-shadow:0 0 20px rgba(220,38,38,0.4)}
          50%{text-shadow:0 0 80px rgba(220,38,38,1),0 0 140px rgba(220,38,38,0.6)}
        }
        @keyframes tb-fadeup {
          from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)}
        }
        @keyframes tb-crown-drop {
          0%  {opacity:0;transform:translateY(-60px) scale(0.5) rotate(-20deg)}
          60% {transform:translateY(10px) scale(1.2) rotate(5deg)}
          100%{opacity:1;transform:translateY(0) scale(1) rotate(0deg)}
        }
        @keyframes tb-skull-drop {
          0%  {opacity:0;transform:scale(0.2) rotate(30deg)}
          70% {transform:scale(1.3) rotate(-8deg)}
          100%{opacity:1;transform:scale(1) rotate(0deg)}
        }
        @keyframes tb-bg-pulse {
          0%,100%{background-position:0% 50%} 50%{background-position:100% 50%}
        }
        @keyframes tb-event-pop {
          0%{opacity:0;transform:scale(0.8) translateY(10px)}
          60%{transform:scale(1.05) translateY(-3px)}
          100%{opacity:1;transform:scale(1) translateY(0)}
        }
        .tb-ember-particle {
          position:absolute; pointer-events:none;
          animation: tb-ember 2.2s ease-out forwards;
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
      animation: tb-bg-pulse 6s ease infinite;
    `;

    function spawnEmbers(container, count) {
      const embers = ['🔥','✨','💥','⚡','🌟','🩸','💫','🔴'];
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          if (!document.getElementById('throne-battle-overlay')) return;
          const e = document.createElement('span');
          e.className = 'tb-ember-particle';
          e.textContent = embers[Math.floor(Math.random() * embers.length)];
          e.style.fontSize = (0.6 + Math.random() * 0.6) + 'rem';
          const dx = (Math.random() - 0.5) * 100;
          e.style.cssText += `left:${5 + Math.random()*90}%;bottom:${3 + Math.random()*40}%;--dx:${dx}px;animation-duration:${1.8+Math.random()*1.4}s;`;
          container.appendChild(e);
          setTimeout(() => e.remove(), 3500);
        }, i * 140);
      }
    }

    const TROOP_COUNT_TH = 10;
    const playerIcons = ['⚔️','⚔️','⚔️','⚔️','⚔️','⚔️','⚔️','⚔️','⚔️','⚔️'];
    const enemyIcons  = ['🛡️','🛡️','🛡️','🛡️','🛡️','🛡️','🛡️','🛡️','🛡️','🛡️'];

    function makeTroops(icons, side) {
      let html = '';
      for (let i = 0; i < TROOP_COUNT_TH; i++) {
        html += `<span class="troop-unit" id="th-${side}-t${i}" style="font-size:1.1rem;transition:opacity 0.6s ease,transform 0.4s ease" title="${side==='p'?'Tue truppe':'Truppe del Re'}">${icons[0]}</span>`;
      }
      return html;
    }

    // 5 fasi narrative per il trono
    const THRONE_PHASES = [
      {
        title: '⚔ FASE I — L\'AVANZATA',
        logs: [
          `Le vostre armate marciavano verso Approdo del Re. Le strade erano silenziose — troppo silenziose.`,
          `I tamburi di guerra rimbombano oltre le mura. ${kingName} ha schierato la Guardia Reale in prima linea.`,
          `Il vostro stendardo sventola davanti alle truppe. I soldati gridano il vostro nome.`,
        ],
        event: { label: '🌅 Alba della Guerra', note: 'Le prime luci illuminano il campo di battaglia.', fx: (p, e) => ({ p, e }) },
      },
      {
        title: '🔥 FASE II — IL PRIMO SCONTRO',
        logs: [
          `La cavalleria si scontra — il fragore del ferro risuona per miglia.`,
          `Le frecce oscurano il cielo. Gli uomini cadono sui campi di Approdo del Re.`,
          `${kingName} osserva dalla Fortezza Rossa. Le sue guardie d'élite avanzano.`,
        ],
        event: null, // revealed dynamically
      },
      {
        title: '💀 FASE III — LA MISCHIA',
        logs: [
          `Lo scontro diventa brutale — non c'è più tattica, solo sopravvivenza.`,
          `La Guardia Reale protegge il Re con ferocia disperata. Ogni passo costa sangue.`,
          `I comandanti cadono, le linee si spezzano e si ricompattano. Il campo è un inferno.`,
        ],
        event: null,
      },
      {
        title: '👑 FASE IV — IL CUORE DELLA BATTAGLIA',
        logs: [
          `${kingName} stesso scende in campo — la sua presenza rilancia il morale delle sue truppe.`,
          `Le riserve sono esaurite su entrambi i fronti. Si combatte con ciò che resta.`,
          `Le mura della Fortezza Rossa sono ormai a portata. O ci arriverete come re, o non ci arriverete.`,
        ],
        event: null,
      },
      {
        title: '⚡ FASE V — LO SCONTRO FINALE',
        logs: [
          `Un ultimo, disperato assalto verso il Trono di Spade. Il destino si decide ora.`,
          `I sopravvissuti combattono con la forza della disperazione — per gloria o per morte.`,
          `Il cielo sopra Approdo del Re è rosso. Chi siederà sul Trono di Spade al tramonto?`,
        ],
        event: null,
      },
    ];

    // Phase events pool for phases 2-5
    const THRONE_EVENTS = [
      { label:'🏔 Posizione Difensiva',  note:'Le vostre truppe sfruttano le mura esterne (−15% forze nemiche).', fx:(p,e)=>({p, e:e*0.85}) },
      { label:'🐉 Il Drago Urla',        note:'Il drago vola sopra il campo — il terrore paralizza il nemico (−18%).', fx:(p,e)=>({p, e:e*0.82}) },
      { label:'💔 Tradimento in Campo',  note:'Un capitano passa al nemico con duecento uomini (−14% tue forze).', fx:(p,e)=>({p:p*0.86, e}) },
      { label:'🏇 Cavalleria d\'Élite',  note:'La cavalleria reale travolge il vostro fianco sinistro (−16% tue forze).', fx:(p,e)=>({p:p*0.84, e}) },
      { label:'🔥 Fuoco Selvatico',      note:'Barili di fuoco selvatico esplodono tra le vostre file (−20% tue, −10% nemiche).', fx:(p,e)=>({p:p*0.80, e:e*0.90}) },
      { label:'⚡ Grido di battaglia',   note:'Il vostro comandante spinge il nemico indietro (−16% forze nemiche).', fx:(p,e)=>({p, e:e*0.84}) },
      { label:'🌫 Nebbia di Guerra',     note:'La nebbia sul fiume confonde entrambi gli schieramenti.', fx:(p,e)=>{const r=0.90+Math.random()*0.20; const eR=Math.min(1.0,2-r); return{p:p*r,e:e*eR};} },
      { label:'🏹 Arcieri della Torre',  note:'Gli arcieri dalla Torre di Maegor decimano le vostre file (−12% tue forze).', fx:(p,e)=>({p:p*0.88, e}) },
      { label:'🗡️ Duello Epico',         note:'Il vostro campione batte il campione del Re in duello (−12% forze nemiche).', fx:(p,e)=>({p, e:e*0.88}) },
      { label:'📜 Accordo Segreto',      note:'Una casata nemica si arrende in segreto (−15% forze nemiche).', fx:(p,e)=>({p, e:e*0.85}) },
    ];

    overlay.innerHTML = `
      ${_tbSplitBg}
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 25%,rgba(0,0,0,0.75) 100%);pointer-events:none;z-index:1"></div>
      <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.8),transparent);z-index:2"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.8),transparent);z-index:2"></div>

      <div style="position:relative;z-index:10;width:100%;max-width:540px;padding:0 1rem;display:flex;flex-direction:column;align-items:center;gap:0.5rem" id="throne-main">

        <div id="tb-headline" style="font-family:'Cinzel Decorative',serif;font-size:1rem;color:#c9a84c;letter-spacing:0.12em;text-align:center;animation:tb-pulse-gold 2s ease infinite">
          ⚔ SFIDA AL TRONO DI SPADE ⚔
        </div>
        <div id="tb-phase-label" style="font-size:0.7rem;color:#9a8a6a;letter-spacing:0.1em;text-transform:uppercase">Fase 1 di 5</div>

        <div style="display:flex;align-items:center;justify-content:space-between;width:100%;margin:0.2rem 0">
          <div style="text-align:center;flex:1">
            ${_tbPlayerPortrait}
            <div style="font-size:0.65rem;color:#4ade80;letter-spacing:0.08em;margin-top:0.2rem">${_tbCharFirstName}</div>
            <div style="font-size:0.6rem;color:#9a8a6a">Forze: <strong style="color:#4ade80" id="tb-player-num">${Math.round(playerForce)}</strong></div>
          </div>
          <div style="text-align:center;flex:0 0 auto;padding:0 0.5rem">
            <div style="font-family:'Cinzel Decorative',serif;font-size:1.5rem;color:#c9a84c;animation:tb-flicker 1.2s ease infinite">VS</div>
          </div>
          <div style="text-align:center;flex:1">
            <div style="font-size:2.4rem;animation:tb-pulse-red 2s ease infinite">👑</div>
            <div style="font-size:0.65rem;color:#f87171;letter-spacing:0.08em;margin-top:0.2rem">${kingName}</div>
            <div style="font-size:0.6rem;color:#9a8a6a">Forze: <strong style="color:#f87171" id="tb-enemy-num">${Math.round(kingForce)}</strong></div>
          </div>
        </div>

        <div style="display:flex;width:100%;gap:3px;height:12px;border-radius:6px;overflow:hidden;background:rgba(255,255,255,0.04);border:1px solid rgba(201,168,76,0.2)">
          <div id="tb-player-bar" style="height:100%;width:50%;background:linear-gradient(90deg,#166534,#4ade80);border-radius:6px 0 0 6px;transition:width 1.2s ease;box-shadow:0 0 10px rgba(74,222,128,0.6)"></div>
          <div id="tb-enemy-bar"  style="height:100%;width:50%;background:linear-gradient(90deg,#991b1b,#f87171);border-radius:0 6px 6px 0;transition:width 1.2s ease;box-shadow:0 0 10px rgba(248,113,113,0.6);margin-left:auto"></div>
        </div>

        <div style="width:100%;background:linear-gradient(180deg,#1a0a08 0%,#0d0403 60%,#1a0e06 100%);border:1px solid rgba(201,168,76,0.3);border-radius:4px;padding:0.6rem 0.5rem;min-height:80px;position:relative;overflow:hidden" id="tb-field">
          <div style="position:absolute;bottom:0;left:0;right:0;height:20px;background:linear-gradient(0deg,rgba(220,60,0,0.35),transparent);pointer-events:none"></div>
          <div style="position:absolute;top:3px;left:6px;font-family:'Cinzel',serif;font-size:0.5rem;color:#4ade80;letter-spacing:0.05em;opacity:0.85">⚔ TUOI</div>
          <div style="position:absolute;top:3px;right:6px;font-family:'Cinzel',serif;font-size:0.5rem;color:#f87171;letter-spacing:0.05em;opacity:0.85">RE 🛡</div>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:3px;margin-bottom:5px;width:120px" id="tb-player-troops">${makeTroops(playerIcons, 'p')}</div>
          <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.5),transparent);margin:3px 0"></div>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:3px;justify-items:end;margin-top:5px;width:120px;margin-left:auto" id="tb-enemy-troops">${makeTroops(enemyIcons, 'e')}</div>
          <div id="tb-clash-flash" style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(255,140,0,0.7) 0%,transparent 70%);opacity:0;pointer-events:none;transition:opacity 0.12s"></div>
        </div>

        <!-- Event banner -->
        <div id="tb-event-banner" style="min-height:2rem;width:100%"></div>

        <div id="tb-log" style="min-height:3rem;font-family:'EB Garamond',serif;font-size:1rem;color:#e8dcc8;font-style:italic;text-align:center;line-height:1.6;animation:tb-fadeup 0.5s ease"></div>

        <div id="tb-btns" style="display:flex;gap:0.6rem;margin-top:0.3rem;align-items:center;justify-content:center">
          <button id="tb-speed-btn" onclick="Game._battleToggleSpeed()" style="padding:0.45rem 0.8rem;background:rgba(201,168,76,0.12);border:1px solid rgba(201,168,76,0.4);border-radius:3px;font-family:'Cinzel',serif;font-size:0.65rem;font-weight:700;letter-spacing:0.08em;cursor:pointer;color:#c9a84c">
            🐢 x1
          </button>
          <button id="tb-retreat-btn" onclick="Game._battleRetreat()" style="padding:0.65rem 1.4rem;background:transparent;border:1px solid rgba(201,168,76,0.5);border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#c9a84c">
            🏃 Ritirata
          </button>
        </div>
        <!-- Round delta -->
        <div id="tb-round-delta" style="min-height:1.2rem;font-family:'Cinzel',serif;font-size:0.65rem;text-align:center;letter-spacing:0.05em;opacity:0;transition:opacity 0.3s;margin-top:0.15rem"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    spawnEmbers(overlay, 18);

    let pForce = playerForce;
    let eForce = kingForce;
    let pAlive = TROOP_COUNT_TH;
    let eAlive = TROOP_COUNT_TH;
    let phase  = 0;
    const ROUNDS_PER_PHASE = 2;
    const usedEventIds = new Set();

    // Speed state per throne battle (shared via closure)
    const THRONE_SPEED_CONFIG = {
      1: { roundDelay: 3500, phaseStartDelay: 1800, flashDuration: 600, showDelta: true  },
      2: { roundDelay: 900,  phaseStartDelay: 600,  flashDuration: 180, showDelta: false },
    };
    let _tSpeed = 1;

    Game._battleToggleSpeed = function() {
      _tSpeed = _tSpeed === 1 ? 2 : 1;
      const btn = document.getElementById('tb-speed-btn');
      if (btn) {
        btn.textContent = _tSpeed === 1 ? '🐢 x1' : '⚡ x2';
        btn.style.background = _tSpeed === 2 ? 'rgba(239,68,68,0.18)' : 'rgba(201,168,76,0.12)';
        btn.style.borderColor = _tSpeed === 2 ? 'rgba(239,68,68,0.5)' : 'rgba(201,168,76,0.4)';
        btn.style.color = _tSpeed === 2 ? '#f87171' : '#c9a84c';
      }
    };

    // Ritirata — i neutrali si schierano all'ultimo momento
    Game._battleRetreatFn = () => {
      clearTimeout(Game._battleTimer);
      const btn = document.getElementById('tb-retreat-btn');
      if (btn) btn.disabled = true;

      // Neutrali si schierano quando il Re sembra ancora forte
      const neutralSwitches = [];
      const kingWinning = eForce >= pForce * 0.9;
      Object.entries(state.houses).forEach(([, h]) => {
        if (h.status !== 'neutral' || h.suppressed) return;
        if (kingWinning && Math.random() < 0.60) {
          h.status = 'enemy';
          neutralSwitches.push(`${h.icon} Casa ${h.name} → Re`);
        } else if (!kingWinning && Math.random() < 0.45) {
          // restano neutrali — non si schierano nemmeno con chi si ritira
        }
      });

      const survivorPct = 0.30 + Math.random() * 0.20;
      const survived = Math.max(5, Math.round(pForce * survivorPct));
      const headline = document.getElementById('tb-headline');
      const log = document.getElementById('tb-log');
      if (headline) { headline.textContent = '🏃 RITIRATA DALLA CAPITALE!'; headline.style.color = '#c9a84c'; }
      if (log) log.textContent = `Le truppe si ritirano sotto una pioggia di frecce. Superstiti: ${survived}.${neutralSwitches.length > 0 ? ` ${neutralSwitches.join(', ')} si schierano con il Re.` : ''}`;

      document.getElementById('tb-btns').innerHTML = `
        <button onclick="if(typeof AudioManager!=='undefined')AudioManager.playMainFromWar();document.getElementById('throne-battle-overlay').remove();Game._battleRetreatFinish(${survived})"
          style="padding:0.7rem 2rem;background:linear-gradient(135deg,#78350f,#c9a84c);border:none;border-radius:3px;font-family:'Cinzel',serif;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#0a0a0f">
          Continua
        </button>`;

      for (let i = Math.round(pAlive * survivorPct); i < pAlive; i++) {
        const t = document.getElementById(`th-p-t${i}`);
        if (t) { t.textContent = '💀'; t.style.opacity = '0.35'; t.classList.add('dying'); }
      }
    };
    Game._battleRetreat = Game._battleRetreatFn;

    function killTroops(side, _unused, _unused2) {
      const pPct = Math.max(0, pForce / playerForce);
      const ePct = Math.max(0, eForce / kingForce);
      const pShouldBeAlive = Math.round(pPct * TROOP_COUNT_TH);
      const eShouldBeAlive = Math.round(ePct * TROOP_COUNT_TH);

      // Player: dies from right (far from center) inward
      for (let i = TROOP_COUNT_TH - 1; i >= pShouldBeAlive; i--) {
        const t = document.getElementById(`th-p-t${i}`);
        if (t && !t.classList.contains('dying')) {
          t.textContent = '💀'; t.style.opacity = '0.35'; t.style.transform = 'scale(0.75)'; t.classList.add('dying');
        }
      }
      // Enemy: row-reverse means kill from highest index for left-to-right visual effect
      for (let i = TROOP_COUNT_TH - 1; i >= eShouldBeAlive; i--) {
        const t = document.getElementById(`th-e-t${i}`);
        if (t && !t.classList.contains('dying')) {
          t.textContent = '💀'; t.style.opacity = '0.35'; t.style.transform = 'scale(0.75)'; t.classList.add('dying');
        }
      }
      pAlive = pShouldBeAlive;
      eAlive = eShouldBeAlive;
    }

    function updateBars() {
      const pPct = Math.max(0, Math.round((pForce / playerForce) * 100));
      const ePct = Math.max(0, Math.round((eForce / kingForce)   * 100));
      const pb = document.getElementById('tb-player-bar');
      const eb = document.getElementById('tb-enemy-bar');
      if (pb) pb.style.width = pPct + '%';
      if (eb) eb.style.width = ePct + '%';
      const pn = document.getElementById('tb-player-num');
      const en = document.getElementById('tb-enemy-num');
      if (pn) pn.textContent = Math.round(Math.max(0, pForce));
      if (en) en.textContent = Math.round(Math.max(0, eForce));
    }

    function showEventBanner(evt, note) {
      const banner = document.getElementById('tb-event-banner');
      if (!banner) return;
      banner.innerHTML = `
        <div style="padding:0.4rem 0.7rem;background:rgba(201,168,76,0.12);border:1px solid rgba(201,168,76,0.4);border-radius:4px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#c9a84c;text-align:center;animation:tb-event-pop 0.5s ease forwards">
          <strong>${evt.label}</strong><br><span style="color:#e8dcc8;font-size:0.84rem">${note}</span>
        </div>`;
    }

    function runPhaseRound(roundsLeft, cb) {
      if (roundsLeft <= 0 || pForce <= 0 || eForce <= 0) { cb(); return; }

      const tcfg = THRONE_SPEED_CONFIG[_tSpeed];

      // Danni per round
      const _ratio = pForce > 0 && eForce > 0 ? pForce / eForce : 1;
      const _underdogBonus = _ratio < 0.6 ? 0.06 : 0;
      const pDmg = eForce * (0.08 + Math.random() * 0.09 + _underdogBonus);
      const eDmg = pForce * (0.08 + Math.random() * 0.09);
      const prevP = pForce, prevE = eForce;
      pForce = Math.max(0, pForce - pDmg);
      eForce = Math.max(0, eForce - eDmg);
      updateBars();

      const pKill = pForce < prevP ? prevP - pForce : 0;
      const eKill = eForce < prevE ? prevE - eForce : 0;
      if (pKill > 0) killTroops('player', pKill, playerForce);
      if (eKill > 0) killTroops('enemy',  eKill, kingForce);

      const flash = document.getElementById('tb-clash-flash');
      if (flash) { flash.style.opacity = '1'; setTimeout(() => { if(flash) flash.style.opacity='0'; }, tcfg.flashDuration); }

      // Round delta a x1
      const deltaEl = document.getElementById('tb-round-delta');
      if (deltaEl) {
        if (tcfg.showDelta) {
          const pLost = Math.round(prevP - pForce);
          const eLost = Math.round(prevE - eForce);
          deltaEl.innerHTML = `<span style="color:#f87171">−${pLost} tue forze</span> &nbsp;|&nbsp; <span style="color:#4ade80">−${eLost} forze del Re</span>`;
          deltaEl.style.opacity = '1';
          setTimeout(() => { if (deltaEl) deltaEl.style.opacity = '0'; }, tcfg.roundDelay * 0.7);
        } else {
          deltaEl.style.opacity = '0';
        }
      }

      // Trema il campo da fase 3 in poi
      if (phase >= 2) {
        const field = document.getElementById('tb-field');
        if (field) { field.style.animation = 'tb-shake 0.5s ease'; setTimeout(() => { if(field) field.style.animation=''; }, 500); }
      }

      const logEl = document.getElementById('tb-log');
      if (logEl) {
        const logs = THRONE_PHASES[phase]?.logs || [];
        logEl.style.animation = 'none'; void logEl.offsetWidth;
        logEl.textContent = logs[Math.floor(Math.random() * logs.length)] || '…';
        logEl.style.animation = 'tb-fadeup 0.5s ease';
      }

      spawnEmbers(overlay, phase >= 3 ? 9 : 6);

      Game._battleTimer = setTimeout(() => runPhaseRound(roundsLeft - 1, cb), tcfg.roundDelay);
    }

    function startPhase(phaseNum) {
      phase = phaseNum;
      if (pForce <= 0 || eForce <= 0) { finalizeThroneBattle(); return; }

      const phaseData = THRONE_PHASES[phaseNum] || THRONE_PHASES[THRONE_PHASES.length - 1];
      const headline = document.getElementById('tb-headline');
      const phaseLabel = document.getElementById('tb-phase-label');
      if (headline) { headline.textContent = phaseData.title; }
      if (phaseLabel) phaseLabel.textContent = `Fase ${phaseNum + 1}`;

      // Evento di fase
      let evt = phaseData.event;
      if (!evt) {
        // Scegli evento non ancora usato
        const pool = THRONE_EVENTS.filter(e => !usedEventIds.has(e.label));
        evt = pool[Math.floor(Math.random() * pool.length)] || THRONE_EVENTS[0];
      }
      usedEventIds.add(evt.label);
      const result = evt.fx(pForce, eForce);
      const prevP = pForce, prevE = eForce;
      pForce = Math.max(1, result.p);
      eForce = Math.max(1, result.e);
      updateBars();
      showEventBanner(evt, evt.note || '');

      if (result.p < prevP * 0.88) killTroops('player', prevP - result.p, playerForce);
      if (result.e < prevE * 0.88) killTroops('enemy',  prevE - result.e, kingForce);

      spawnEmbers(overlay, 10);

      Game._battleTimer = setTimeout(() => {
        runPhaseRound(ROUNDS_PER_PHASE, () => showThronePhaseBreak(phaseNum));
      }, THRONE_SPEED_CONFIG[_tSpeed].phaseStartDelay);
    }

    function showThronePhaseBreak(completedPhase) {
      // La battaglia NON finisce per numero di fasi — solo quando un esercito arriva a 0
      if (pForce <= 0 || eForce <= 0) { finalizeThroneBattle(); return; }

      const pPct = Math.round((pForce / playerForce) * 100);
      const ePct = Math.round((eForce / kingForce) * 100);
      const adv = pForce > eForce * 1.1 ? '🟢 In vantaggio' : pForce < eForce * 0.85 ? '🔴 In svantaggio grave' : '🟡 Equilibrio incerto';

      const btns = document.getElementById('tb-btns');
      if (btns) btns.innerHTML = `
        <div style="text-align:center;width:100%">
          <div style="font-family:'EB Garamond',serif;font-size:0.9rem;color:#9a8a6a;margin-bottom:0.7rem;font-style:italic;line-height:1.5">
            Fine Fase ${completedPhase + 1} — ${adv}<br>
            <span style="font-size:0.8rem">Tue forze: ${pPct}% · Forze del Re: ${ePct}%</span>
          </div>
          <div style="display:flex;gap:0.6rem;justify-content:center;align-items:center">
            <button id="tb-speed-btn" onclick="Game._battleToggleSpeed()" style="padding:0.45rem 0.8rem;background:${_tSpeed===2?'rgba(239,68,68,0.18)':'rgba(201,168,76,0.12)'};border:1px solid ${_tSpeed===2?'rgba(239,68,68,0.5)':'rgba(201,168,76,0.4)'};border-radius:3px;font-family:'Cinzel',serif;font-size:0.65rem;font-weight:700;letter-spacing:0.08em;cursor:pointer;color:${_tSpeed===2?'#f87171':'#c9a84c'}">${_tSpeed===2?'⚡ x2':'🐢 x1'}</button>
            <button onclick="Game._battleRetreat()" style="padding:0.65rem 1.2rem;background:transparent;border:1px solid rgba(201,168,76,0.5);border-radius:3px;font-family:'Cinzel',serif;font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;color:#c9a84c">🏃 Ritirata</button>
            <button onclick="Game._throneNextPhase()" style="padding:0.65rem 1.5rem;background:linear-gradient(135deg,#7f1d1d,#dc2626);border:none;border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#fff">⚔ Continua →</button>
          </div>
        </div>`;
    }

    Game._throneNextPhase = function() {
      const btns = document.getElementById('tb-btns');
      if (btns) btns.innerHTML = `
        <button id="tb-speed-btn" onclick="Game._battleToggleSpeed()" style="padding:0.45rem 0.8rem;background:${_tSpeed===2?'rgba(239,68,68,0.18)':'rgba(201,168,76,0.12)'};border:1px solid ${_tSpeed===2?'rgba(239,68,68,0.5)':'rgba(201,168,76,0.4)'};border-radius:3px;font-family:'Cinzel',serif;font-size:0.65rem;font-weight:700;letter-spacing:0.08em;cursor:pointer;color:${_tSpeed===2?'#f87171':'#c9a84c'}">${_tSpeed===2?'⚡ x2':'🐢 x1'}</button>
        <button id="tb-retreat-btn" onclick="Game._battleRetreat()" style="padding:0.65rem 1.4rem;background:transparent;border:1px solid rgba(201,168,76,0.5);border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#c9a84c">🏃 Ritirata</button>`;
      const banner = document.getElementById('tb-event-banner');
      if (banner) banner.innerHTML = '';
      startPhase(phase + 1);
    };

    function finalizeThroneBattle() {
      clearTimeout(Game._battleTimer);
      const btn = document.getElementById('tb-retreat-btn');
      if (btn) btn.remove();

      const won = pForce > eForce;
      // survived = forze rimaste post-battaglia (pForce già ridotto dai danni — no moltiplicatore extra)
      const survived = Math.max(1, Math.round(pForce));

      spawnEmbers(overlay, 30);

      const headline = document.getElementById('tb-headline');
      const log      = document.getElementById('tb-log');
      const phaseLabel = document.getElementById('tb-phase-label');

      if (headline) {
        headline.style.animation = won
          ? 'tb-crown-drop 1s cubic-bezier(0.34,1.56,0.64,1) forwards, tb-pulse-gold 2s ease 1s infinite'
          : 'tb-skull-drop 0.8s ease forwards, tb-pulse-red 2s ease 0.8s infinite';
        headline.style.fontSize = '1.4rem';
        headline.textContent = won ? '👑 IL TRONO È TUO!' : '💀 LA RIBELLIONE FALLISCE';
        headline.style.color  = won ? '#c9a84c' : '#dc2626';
      }
      if (phaseLabel) phaseLabel.textContent = won ? `${state.character?.name?.split(' ')[0]} regna!` : 'La lotta è finita.';

      setTimeout(() => {
        if (log) {
          log.style.animation = 'tb-fadeup 0.6s ease';
          log.textContent = won
            ? `${kingName} è caduto. Il Trono di Spade è vostro. Superstiti: ${survived} soldati.`
            : `Le vostre truppe sono sopraffatte. La ribellione è soffocata nel sangue. Superstiti: ${survived}.`;
        }
      }, 800);

      const btns = document.getElementById('tb-btns');
      if (btns) {
        setTimeout(() => {
          btns.innerHTML = `
            <button onclick="${won
              ? `document.getElementById('throne-battle-overlay').remove();Game._battleCompleteFn(${survived})`
              : `if(typeof AudioManager!=='undefined')AudioManager.playMainFromWar();document.getElementById('throne-battle-overlay').remove();Game._battleCompleteFn(${survived})`
            }" style="padding:0.75rem 2.2rem;background:linear-gradient(135deg,${won ? '#78350f,#c9a84c' : '#7f1d1d,#dc2626'});border:none;border-radius:3px;font-family:'Cinzel Decorative',serif;font-size:0.82rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;color:${won ? '#0a0a0f' : '#fff'};box-shadow:0 6px 30px rgba(${won ? '201,168,76' : '220,38,38'},0.5)">
              ${won ? '👑 Prendi il Trono' : '💀 Continua'}
            </button>`;
        }, 1200);
      }

      Game._battleCompleteFn = (survived) => onComplete(won, survived, Math.max(0, Math.round(eForce)));
    }

    Game._battleCompleteFn = (survived) => onComplete(playerForce > kingForce, survived, Math.max(0, Math.round(eForce)));
    // Start phase 0 — timer is inside the closure so THRONE_SPEED_CONFIG and _tSpeed are accessible
    const _initialDelay = THRONE_SPEED_CONFIG[_tSpeed].phaseStartDelay;
    Game._battleTimer = setTimeout(() => startPhase(0), _initialDelay);
  }

  function showBattleAnimation(playerForce, kingForce, onComplete, allowRetreat, bgConfig) {
    // bgConfig: { playerSrc, playerBgSrc, enemySrc, enemyBgSrc, enemyLabel }
    // onComplete(won, survived)
    if (typeof AudioManager !== 'undefined') AudioManager.playWar();

    // ── Split background ──
    const _bg = bgConfig || {};
    const _splitBgHtml = (_bg.playerSrc || _bg.enemySrc) ? `
      <div style="position:absolute;inset:0;z-index:0;overflow:hidden;">
        <div style="position:absolute;inset:0;width:50%;left:0;">
          <img src="${_bg.playerBgSrc||''}" style="width:100%;height:100%;object-fit:cover;object-position:top center;opacity:0.55"
               onerror="this.src='${_bg.playerSrc||''}';this.onerror=null">
          <div style="position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,0.05) 0%,rgba(0,0,0,0.88) 100%)"></div>
        </div>
        <div style="position:absolute;inset:0;width:50%;right:0;left:auto;">
          <img src="${_bg.enemyBgSrc||''}" style="width:100%;height:100%;object-fit:cover;object-position:top center;opacity:0.55"
               onerror="this.src='${_bg.enemySrc||''}';this.style.objectFit='contain';this.style.opacity='0.35';this.onerror=null">
          <div style="position:absolute;inset:0;background:linear-gradient(to left,rgba(0,0,0,0.05) 0%,rgba(0,0,0,0.88) 100%)"></div>
        </div>
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 6% 100% at 50% 50%,rgba(0,0,0,0.97) 0%,transparent 100%)"></div>
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.45)"></div>
      </div>` : '';

    // ── Phase random events ──
    const PHASE_EVENTS = [
      // Player advantage events — player gains, enemy loses
      { id:'terrain', label:'🏔 Vantaggio del Terreno', desc:'Le vostre truppe sfruttano una posizione elevata.', effect: (p,e) => ({ p, e: e * 0.85, note:'Le vostre forze infliggono +15% danni grazie al terreno!' }) },
      { id:'rally',   label:'⚡ Grido di battaglia',    desc:'Il comandante alza il morale delle truppe.', effect: (p,e) => ({ p, e: e * 0.88, note:'Le truppe nemiche si sbandano sotto la pressione (+12% danni)!' }) },
      { id:'flank',   label:'🎯 Manovra di Fiancheggio', desc:'Un gruppo di cavalieri sfonda il fianco nemico.', effect: (p,e) => ({ p, e: e * 0.80, note:'Il fianco nemico è esposto (−20% forze nemiche)!' }) },
      { id:'supply',  label:'📦 Rifornimenti Intercettati', desc:'I vostri esploratori rubano i rifornimenti avversari.', effect: (p,e) => ({ p, e: e * 0.90, note:'I nemici restano senza rifornimenti (−10% forze nemiche)!' }) },
      // Enemy advantage events — enemy gains, player loses
      { id:'ambush',  label:'⚠ Imboscata Nemica', desc:'Un contingente nemico attacca dal fianco.', effect: (p,e) => ({ p: p * 0.82, e, note:"L'imboscata coglie le truppe di sorpresa (−18% forze tue)!" }) },
      { id:'betray2', label:'💔 Defezione', desc:'Un comandante passa al nemico con i suoi uomini.', effect: (p,e) => ({ p: p * 0.88, e, note:'Una defezione inaspettata indebolisce le vostre file (−12%)!' }) },
      { id:'weather', label:'⛈ Tempesta in Battaglia', desc:'Una tempesta improvvisa svantaggia le vostre posizioni.', effect: (p,e) => ({ p: p * 0.90, e, note:"L'avanzata nemica sfrutta il maltempo (−10% tue forze)." }) },
      { id:'reinf',   label:'🏇 Rinforzi Nemici', desc:'Un distaccamento nemico arriva sul campo.', effect: (p,e) => ({ p: p * 0.88, e, note:'Rinforzi nemici si aggiungono alla mischia (−12% tue forze)!' }) },
      // Neutral/balanced events — both sides lose equally
      { id:'archers', label:'🏹 Scambio di Arcieri', desc:'Le due formazioni di arcieri si neutralizzano a vicenda.', effect: (p,e) => ({ p: p * 0.95, e: e * 0.95, note:'Gli arcieri delle due fazioni si annullano a vicenda.' }) },
      { id:'fog',     label:'🌫 Nebbia di Guerra', desc:'La nebbia rende incerto il campo di battaglia.', effect: (p,e) => {
        const r = 0.88 + Math.random() * 0.24; // 0.88-1.12
        const eR = Math.min(1.0, 2 - r); // never let enemy force increase above starting value
        return { p: p * r, e: e * eR, note: r > 1 ? 'La nebbia avvantaggia le vostre truppe!' : 'La nebbia favorisce il nemico.' };
      }},
    ];

    const PHASE_LOGS = [
      [ // Phase 1
        'Le avanguardie si scontrano — ferro contro ferro sui campi di battaglia.',
        'I soldati avanzano lentamente sotto una pioggia di frecce.',
        'Il primo scontro è brutale — i feriti sono portati fuori dal campo.',
        'Entrambi gli schieramenti combattono con ferocia nei primi assalti.',
      ],
      [ // Phase 2
        'La battaglia si intensifica — le riserve entrano in campo.',
        'I comandanti si sfidano in prima linea mentre gli stendardi cadono.',
        'Lo scontro raggiunge il suo apice — ogni passo è conteso nel sangue.',
        'Né l\'uno né l\'altro lato cede — la battaglia si decide ora.',
      ],
      [ // Phase 3
        'Un ultimo, disperato assalto — il destino si decide in questo momento.',
        'Le linee si spezzano qua e là — il crollo è vicino per qualcuno.',
        'I sopravvissuti combattono con la forza della disperazione.',
        'Il campo di battaglia è silenzioso tra una carica e l\'altra — poi tutto riprende.',
      ],
    ];

    // CSS keyframes
    if (!document.getElementById('battle-anim-style')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'battle-anim-style';
      styleEl.textContent = `
        @keyframes bat-particle {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.9; }
          100% { transform: translateY(-100px) translateX(var(--px)) scale(0.2); opacity: 0; }
        }
        @keyframes bat-shake {
          0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)}
          40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)}
        }
        @keyframes bat-fadeup {
          from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)}
        }
        @keyframes bat-event-pop {
          0%{opacity:0;transform:scale(0.85) translateY(8px)}
          60%{transform:scale(1.04) translateY(-2px)}
          100%{opacity:1;transform:scale(1) translateY(0)}
        }
        .bat-particle { position:absolute; font-size:0.75rem; pointer-events:none; animation: bat-particle 1.6s ease-out forwards; }
        .troop-unit { display:inline-block; transition: opacity 0.4s ease, transform 0.3s ease; }
        .troop-unit.dying { opacity:0; transform:scale(0.3) rotate(20deg); }
      `;
      document.head.appendChild(styleEl);
    }

    const overlay = document.createElement('div');
    overlay.id = 'battle-anim-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(5,2,2,0.97);z-index:700;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      font-family:'Cinzel',serif;overflow:hidden;
    `;

    const TROOP_COUNT = 10; // fixed per side
    const playerIcons = ['⚔️','⚔️','⚔️','⚔️','⚔️','⚔️','⚔️','⚔️','⚔️','⚔️'];
    const enemyIcons  = ['🛡️','🛡️','🛡️','🛡️','🛡️','🛡️','🛡️','🛡️','🛡️','🛡️'];

    function makeTroops(icons, side) {
      let html = '';
      for (let i = 0; i < TROOP_COUNT; i++) {
        html += `<span class="troop-unit" id="${side}-t${i}" style="font-size:1.1rem;transition:opacity 0.4s ease,transform 0.3s ease" title="${side==='p'?'Tue truppe':'Truppe nemiche'}">${icons[0]}</span>`;
      }
      return html;
    }

    overlay.innerHTML = `
      ${_splitBgHtml}
      <div style="position:relative;z-index:1;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 1rem;">
      <div style="text-align:center;margin-bottom:0.8rem">
        <div style="font-family:'Cinzel Decorative',serif;font-size:1rem;color:#c9a84c;letter-spacing:0.1em" id="battle-headline">⚔ LA BATTAGLIA HA INIZIO</div>
        <div style="font-size:0.72rem;color:#9a8a6a;margin-top:0.25rem;letter-spacing:0.06em" id="battle-phase-label">Fase 1</div>
      </div>

      <div class="battle-canvas-wrap">
        <div class="battle-field" id="battle-field">
          <div class="battle-ground"></div>
          <div class="battle-clash-flash" id="clash-flash"></div>
          <div style="position:absolute;top:2px;left:6px;font-family:'Cinzel',serif;font-size:0.52rem;color:#4ade80;letter-spacing:0.05em;opacity:0.8">⚔ TUOI</div>
          <div style="position:absolute;top:2px;right:6px;font-family:'Cinzel',serif;font-size:0.52rem;color:#f87171;letter-spacing:0.05em;opacity:0.8">NEMICI 🛡</div>
          <div class="battle-troops player-side" id="player-troops" style="left:6px">
            ${makeTroops(playerIcons, 'p')}
          </div>
          <div class="battle-troops enemy-side" id="enemy-troops" style="right:6px">
            ${makeTroops(enemyIcons, 'e')}
          </div>
        </div>

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

        <!-- Phase event banner -->
        <div id="battle-event-banner" style="min-height:2.2rem;margin-top:0.5rem"></div>

        <!-- Battle log -->
        <div id="battle-log" style="margin-top:0.4rem;min-height:2.5rem;font-family:'EB Garamond',serif;font-size:0.9rem;color:#e8dcc8;font-style:italic;text-align:center;line-height:1.5"></div>

        <!-- Round delta (casualties this round) — visible at x1 -->
        <div id="battle-round-delta" style="min-height:1.4rem;margin-top:0.2rem;font-family:'Cinzel',serif;font-size:0.68rem;text-align:center;letter-spacing:0.06em;opacity:0;transition:opacity 0.3s"></div>
      </div>

      <!-- Speed toggle + Retreat -->
      <div id="battle-btns" style="display:flex;gap:0.6rem;margin-top:0.9rem;align-items:center;justify-content:center">
        <button id="btn-speed" onclick="Game._battleToggleSpeed()" style="padding:0.5rem 0.9rem;background:rgba(201,168,60,0.12);border:1px solid rgba(201,168,76,0.4);border-radius:3px;font-family:'Cinzel',serif;font-size:0.68rem;font-weight:700;letter-spacing:0.08em;cursor:pointer;color:#c9a84c;transition:background 0.2s">
          🐢 x1
        </button>
        ${allowRetreat
          ? `<button id="btn-retreat" onclick="Game._battleRetreat()" style="padding:0.65rem 1.4rem;background:transparent;border:1px solid rgba(201,168,76,0.5);border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#c9a84c">🏃 Ritirata</button>`
          : `<button disabled style="padding:0.65rem 1.4rem;background:transparent;border:1px solid rgba(120,60,60,0.4);border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:not-allowed;color:rgba(248,113,113,0.4);opacity:0.5" title="Non hai dichiarato tu questa guerra">⛔ Ritirata non ammessa</button>`
        }
      </div>
      </div><!-- /z-index wrapper -->
    `;
    document.body.appendChild(overlay);

    // ── Speed state ──
    let _speed = 1; // 1 = slow (x1), 2 = fast (x2)
    const SPEED_CONFIG = {
      1: { roundDelay: 3500, phaseStartDelay: 1800, flashDuration: 500, particles: 8,  showDelta: true  },
      2: { roundDelay: 900,  phaseStartDelay: 600,  flashDuration: 200, particles: 3,  showDelta: false },
    };
    Game._battleToggleSpeed = function() {
      _speed = _speed === 1 ? 2 : 1;
      const btn = document.getElementById('btn-speed');
      if (btn) {
        btn.textContent = _speed === 1 ? '🐢 x1' : '⚡ x2';
        btn.style.background = _speed === 2 ? 'rgba(239,68,68,0.18)' : 'rgba(201,168,76,0.12)';
        btn.style.borderColor = _speed === 2 ? 'rgba(239,68,68,0.5)' : 'rgba(201,168,76,0.4)';
        btn.style.color = _speed === 2 ? '#f87171' : '#c9a84c';
      }
    };

    // ── Particle spawner ──
    function spawnParticles(count) {
      const field = document.getElementById('battle-field');
      if (!field) return;
      const emojis = ['⚔️','🩸','💥','✨','🗡️','⚡','🔥'];
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          if (!document.getElementById('battle-anim-overlay')) return;
          const p = document.createElement('span');
          p.className = 'bat-particle';
          p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
          const dx = (Math.random() - 0.5) * 70;
          p.style.cssText = `left:${15+Math.random()*70}%;bottom:${10+Math.random()*40}%;--px:${dx}px;animation-duration:${1.2+Math.random()*0.8}s;`;
          field.appendChild(p);
          setTimeout(() => p.remove(), 2000);
        }, i * 120);
      }
    }

    // ── Battle state ──
    let pForce = playerForce;
    let eForce = kingForce;
    let pAlive = TROOP_COUNT;  // always 10 visual units
    let eAlive = TROOP_COUNT;
    let phase = 0;
    const ROUNDS_PER_PHASE = 2;

    // Retreat callback
    Game._battleRetreatFn = () => {
      clearTimeout(Game._battleTimer);
      const btn = document.getElementById('btn-retreat');
      if (btn) btn.disabled = true;
      const survivorPct = 0.40 + Math.random() * 0.25;
      const survived = Math.max(5, Math.round(pForce * survivorPct));
      document.getElementById('battle-headline').textContent = '🏃 RITIRATA!';
      document.getElementById('battle-phase-label').textContent = `Superstiti: ${survived}`;
      document.getElementById('battle-btns').innerHTML = `
        <button onclick="if(typeof AudioManager!=='undefined')AudioManager.playMainFromWar();document.getElementById('battle-anim-overlay').remove();Game._battleRetreatFinish(${survived})" style="padding:0.65rem 1.8rem;background:linear-gradient(135deg,#78350f,#c9a84c);border:none;border-radius:3px;font-family:'Cinzel',serif;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#0a0a0f">
          Continua
        </button>`;
      // Kill proportional troops on retreat
      const deadCount = TROOP_COUNT - Math.max(0, Math.round(pAlive * survivorPct));
      for (let i = pAlive - 1; i >= Math.max(0, pAlive - deadCount); i--) {
        const t = document.getElementById(`p-t${i}`);
        if (t) { t.textContent = '💀'; t.style.opacity = '0.35'; t.classList.add('dying'); }
      }
    };
    Game._battleRetreat = Game._battleRetreatFn;

    function killTroops(side, _unused, _unused2) {
      // Recompute from current force state — always reflects real army percentage
      const pPct = Math.max(0, pForce / playerForce);
      const ePct = Math.max(0, eForce / kingForce);
      const pShouldBeAlive = Math.round(pPct * TROOP_COUNT);
      const eShouldBeAlive = Math.round(ePct * TROOP_COUNT);

      // Player side — dies from right (far from center) inward: index TROOP_COUNT-1 → pShouldBeAlive
      for (let i = TROOP_COUNT - 1; i >= pShouldBeAlive; i--) {
        const t = document.getElementById(`p-t${i}`);
        if (t && !t.classList.contains('dying')) {
          t.textContent = '💀'; t.style.opacity = '0.35'; t.style.transform = 'scale(0.75)'; t.classList.add('dying');
        }
      }
      // Enemy side — flex-direction:row-reverse means index 0 is rightmost visually
      // To kill left-to-right visually, kill from highest index down
      for (let i = TROOP_COUNT - 1; i >= eShouldBeAlive; i--) {
        const t = document.getElementById(`e-t${i}`);
        if (t && !t.classList.contains('dying')) {
          t.textContent = '💀'; t.style.opacity = '0.35'; t.style.transform = 'scale(0.75)'; t.classList.add('dying');
        }
      }
      pAlive = pShouldBeAlive;
      eAlive = eShouldBeAlive;
    }

    function updateBars() {
      const pPct = Math.round((pForce / playerForce) * 100);
      const ePct = Math.round((eForce / kingForce) * 100);
      const pb = document.getElementById('player-bar');
      const eb = document.getElementById('enemy-bar');
      if (pb) pb.style.width = Math.max(0, pPct) + '%';
      if (eb) eb.style.width = Math.max(0, ePct) + '%';
      const pn = document.getElementById('player-force-label');
      const en = document.getElementById('enemy-force-label');
      if (pn) pn.textContent = Math.round(Math.max(0, pForce));
      if (en) en.textContent = Math.round(Math.max(0, eForce));
    }

    function showEventBanner(evt, note) {
      const banner = document.getElementById('battle-event-banner');
      if (!banner) return;
      banner.innerHTML = `
        <div style="padding:0.4rem 0.65rem;background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.35);border-radius:4px;font-family:'EB Garamond',serif;font-size:0.85rem;color:#c9a84c;text-align:center;animation:bat-event-pop 0.4s ease forwards">
          <strong>${evt.label}</strong><br><span style="color:#e8dcc8;font-size:0.82rem">${note}</span>
        </div>`;
    }

    function runPhaseRounds(roundsLeft, phaseEvtApplied, afterRoundsCallback) {
      if (roundsLeft <= 0 || pForce <= 0 || eForce <= 0) {
        afterRoundsCallback();
        return;
      }

      const cfg = SPEED_CONFIG[_speed];

      // Each round: each side deals ~13-20% of the other's force
      // Underdog mechanic: if one side is at <60% of the other's force, damage is slightly equalised
      const ratio = pForce > 0 && eForce > 0 ? pForce / eForce : 1;
      const underdogBonus = ratio < 0.6 ? 0.06 : ratio > 1.67 ? 0 : 0; // player gets +6% dmg when badly outnumbered
      const pDmg = eForce * (0.13 + Math.random() * 0.09 + underdogBonus);
      const eDmg = pForce * (0.13 + Math.random() * 0.09);
      const prevP = pForce, prevE = eForce;
      pForce = Math.max(0, pForce - pDmg);
      eForce = Math.max(0, eForce - eDmg);

      updateBars();

      const pKill = pForce < prevP ? prevP - pForce : 0;
      const eKill = eForce < prevE ? prevE - eForce : 0;
      if (pKill > 0) killTroops('player', pKill, playerForce);
      if (eKill > 0) killTroops('enemy',  eKill, kingForce);

      // Clash flash
      const flash = document.getElementById('clash-flash');
      if (flash) { flash.style.opacity = '1'; setTimeout(() => { if (flash) flash.style.opacity = '0'; }, cfg.flashDuration); }

      // Round delta — perdite questo round (solo a x1)
      const deltaEl = document.getElementById('battle-round-delta');
      if (deltaEl) {
        if (cfg.showDelta) {
          const pLost = Math.round(prevP - pForce);
          const eLost = Math.round(prevE - eForce);
          deltaEl.innerHTML = `<span style="color:#f87171">−${pLost} tue forze</span> &nbsp;|&nbsp; <span style="color:#4ade80">−${eLost} forze nemiche</span>`;
          deltaEl.style.opacity = '1';
          setTimeout(() => { if (deltaEl) deltaEl.style.opacity = '0'; }, cfg.roundDelay * 0.7);
        } else {
          deltaEl.style.opacity = '0';
        }
      }

      // Shake on last round of phase
      if (roundsLeft === 1) {
        const field = document.getElementById('battle-field');
        if (field) { field.style.animation = 'bat-shake 0.4s ease'; setTimeout(() => { if (field) field.style.animation = ''; }, 400); }
      }

      const logEl = document.getElementById('battle-log');
      if (logEl) {
        const logs = PHASE_LOGS[phase] || PHASE_LOGS[0];
        logEl.style.animation = 'none'; void logEl.offsetWidth;
        logEl.textContent = logs[Math.floor(Math.random() * logs.length)];
        logEl.style.animation = 'bat-fadeup 0.4s ease';
      }

      spawnParticles(cfg.particles);

      Game._battleTimer = setTimeout(() => runPhaseRounds(roundsLeft - 1, phaseEvtApplied, afterRoundsCallback), cfg.roundDelay);
    }

    function startPhase(phaseNum) {
      phase = phaseNum;
      if (pForce <= 0 || eForce <= 0) { finalizeBattle(); return; }

      const phaseLabel = document.getElementById('battle-phase-label');
      const phaseNames = ['⚔ FASE 1 — PRIMO SCONTRO', '🔥 FASE 2 — MISCHIA TOTALE', '💀 FASE 3 — SCONTRO FINALE'];
      if (phaseLabel) phaseLabel.textContent = `Fase ${phaseNum + 1}`;

      const headline = document.getElementById('battle-headline');
      if (headline) headline.textContent = phaseNames[phaseNum] || `⚔ FASE ${phaseNum + 1} — LO SCONTRO CONTINUA`;

      // Pick a phase event — each pool balanced 2 player-favour / 2 enemy-favour / 1 neutral
      const evtPool = phaseNum === 0
        ? PHASE_EVENTS.filter(e => ['terrain','rally','ambush','weather','archers'].includes(e.id))
        : phaseNum === 1
          ? PHASE_EVENTS.filter(e => ['flank','supply','betray2','reinf','fog'].includes(e.id))
          : PHASE_EVENTS.filter(e => ['rally','flank','ambush','betray2','archers'].includes(e.id));

      const evt = rand(evtPool);
      const result = evt.effect(pForce, eForce);
      const prevP = pForce, prevE = eForce;
      pForce = Math.max(0, result.p);
      eForce = Math.max(0, result.e);
      updateBars();
      showEventBanner(evt, result.note);

      if (result.p < prevP * 0.9) killTroops('player', prevP - result.p, playerForce);
      if (result.e < prevE * 0.9) killTroops('enemy',  prevE - result.e, kingForce);

      spawnParticles(6);

      // Run 2 rounds — if either army hits 0 during rounds, battle ends immediately
      Game._battleTimer = setTimeout(() => {
        runPhaseRounds(ROUNDS_PER_PHASE, true, () => {
          // After rounds: if either army is at 0, end immediately — otherwise pause for player
          if (pForce <= 0 || eForce <= 0) {
            finalizeBattle();
          } else {
            showPhaseBreak(phaseNum);
          }
        });
      }, SPEED_CONFIG[_speed].phaseStartDelay);
    }

    function showPhaseBreak(completedPhase) {
      if (pForce <= 0 || eForce <= 0) { finalizeBattle(); return; }

      const pPct = Math.round((pForce / playerForce) * 100);
      const ePct = Math.round((eForce / kingForce) * 100);
      const advantage = pForce > eForce ? '🟢 Vantaggio tuo' : pForce < eForce * 0.85 ? '🔴 Svantaggio pesante' : '🟡 Equilibrio';

      const btns = document.getElementById('battle-btns');
      if (btns) {
        const retreatBtnHtml = allowRetreat
          ? `<button onclick="Game._battlePhaseRetreating=true;Game._battleRetreat()" style="padding:0.65rem 1.2rem;background:transparent;border:1px solid rgba(201,168,76,0.5);border-radius:3px;font-family:'Cinzel',serif;font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;color:#c9a84c">🏃 Ritirata</button>`
          : `<button disabled style="padding:0.65rem 1.2rem;background:transparent;border:1px solid rgba(120,60,60,0.3);border-radius:3px;font-family:'Cinzel',serif;font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:not-allowed;color:rgba(248,113,113,0.35)">⛔ Ritirata</button>`;
        btns.innerHTML = `
          <div style="text-align:center;width:100%">
            <div style="font-family:'EB Garamond',serif;font-size:0.88rem;color:#9a8a6a;margin-bottom:0.6rem;font-style:italic">
              Fine Fase ${completedPhase + 1} — ${advantage}<br>
              <span style="font-size:0.8rem">Tue forze: ${pPct}% · Nemiche: ${ePct}%</span>
            </div>
            <div style="display:flex;gap:0.65rem;justify-content:center">
              ${retreatBtnHtml}
              <button onclick="Game._battleContinuePhase(${completedPhase + 1})" style="padding:0.65rem 1.4rem;background:linear-gradient(135deg,#7f1d1d,#dc2626);border:none;border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#fff">
                ⚔ Continua →
              </button>
            </div>
          </div>`;
      }
    }

    Game._battleContinuePhase = function(nextPhase) {
      const btns = document.getElementById('battle-btns');
      if (btns) btns.innerHTML = `
        <button id="btn-speed" onclick="Game._battleToggleSpeed()" style="padding:0.5rem 0.9rem;background:${_speed===2?'rgba(239,68,68,0.18)':'rgba(201,168,76,0.12)'};border:1px solid ${_speed===2?'rgba(239,68,68,0.5)':'rgba(201,168,76,0.4)'};border-radius:3px;font-family:'Cinzel',serif;font-size:0.68rem;font-weight:700;letter-spacing:0.08em;cursor:pointer;color:${_speed===2?'#f87171':'#c9a84c'}">
          ${_speed===2?'⚡ x2':'🐢 x1'}
        </button>
        ${allowRetreat
          ? `<button id="btn-retreat" onclick="Game._battleRetreat()" style="padding:0.65rem 1.4rem;background:transparent;border:1px solid rgba(201,168,76,0.5);border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#c9a84c">🏃 Ritirata</button>`
          : `<button disabled style="padding:0.65rem 1.4rem;background:transparent;border:1px solid rgba(120,60,60,0.3);border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:not-allowed;color:rgba(248,113,113,0.35)">⛔ Ritirata</button>`
        }`;
      const banner = document.getElementById('battle-event-banner');
      if (banner) banner.innerHTML = '';
      startPhase(nextPhase);
    };

    function finalizeBattle() {
      const btn = document.getElementById('btn-retreat');
      if (btn) btn.remove();

      const won = pForce > eForce;
      // survived = forze rimaste dopo la battaglia (già ridotte dai danni)
      // Non moltiplichiamo ulteriormente — pForce è già il valore reale post-scontro
      const survived     = Math.max(1, Math.round(pForce));
      const enemySurvived = Math.max(0, Math.round(eForce));

      spawnParticles(10);

      const headline = document.getElementById('battle-headline');
      const logEl    = document.getElementById('battle-log');
      const phaseLabel = document.getElementById('battle-phase-label');

      if (headline) {
        headline.textContent = won ? '🏆 VITTORIA!' : '💀 SCONFITTA';
        headline.style.color = won ? '#4ade80' : '#dc2626';
      }
      if (phaseLabel) phaseLabel.textContent = `Superstiti: ${survived}`;

      if (logEl) {
        setTimeout(() => {
          if (logEl) {
            logEl.style.animation = 'bat-fadeup 0.5s ease';
            logEl.textContent = won
              ? `Il campo di battaglia è vostro. Tuoi superstiti: ${survived}. Nemici rimasti: ${enemySurvived}.`
              : `Le vostre truppe sono sopraffatte. Superstiti: ${survived}.`;
          }
        }, 400);
      }

      const btns = document.getElementById('battle-btns');
      if (btns) {
        setTimeout(() => {
          btns.innerHTML = `
            <button onclick="${won ? "if(typeof AudioManager!=='undefined')AudioManager.playMainFromWar();" : ''}document.getElementById('battle-anim-overlay').remove();Game._battleResolveFn(${won},${survived},${enemySurvived})"
              style="padding:0.7rem 2rem;background:linear-gradient(135deg,${won ? '#14532d,#4ade80' : '#7f1d1d,#dc2626'});border:none;border-radius:3px;font-family:'Cinzel Decorative',serif;font-size:0.78rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:${won ? '#0a0a0f' : '#fff'};box-shadow:0 4px 20px rgba(${won ? '74,222,128' : '220,38,38'},0.35)">
              ${won ? '🏆 Raccogli la Vittoria' : '💀 Continua'}
            </button>`;
        }, 700);
      }

      Game._battleResolveFn = (won, survived, enemySurvived) => onComplete(won, survived, enemySurvived);
    }

    // Start phase 0
    Game._battleTimer = setTimeout(() => startPhase(0), SPEED_CONFIG[_speed].phaseStartDelay);
  }

  function _resolveThroneAttack(won, playerForce, kingForce, survived, enemySurvived) {
    const diff = state.character.difficulty;

    if (won) {
      const oldKingName = state.kingName;
      const charId      = state.character.id;

      state.isPlayerKing          = true;
      state.playerBecameKingTurn  = state.turn;
      state.king                  = charId;
      state.kingName              = state.character.name;
      state.kingHouseAffiliation  = state.character.house; // player's house is now the ruling house

      // ── Trono conquistato — nessun aumento di cap ──
      state.conquests = (state.conquests || 0) + 1;

      returnLoanedArmies();

      // ── Old king's house → suppressed (grey, annexed) ──
      const oldKingHouseId = state.kingHouseAffiliation !== state.character.house
        ? state.kingHouseAffiliation : null;
      // Find old king house before reassigning
      const realOldKingHouseId = Object.keys(state.houses).find(id =>
        state.houses[id].kingAlly && id !== state.character.house
      ) || oldKingHouseId;

      // ── Allies who lent troops → kingAlly (fedeli al nuovo Re) ──
      const throneAllies = Object.keys(state.allyLoans || {});

      Object.entries(state.houses).forEach(([id, h]) => {
        h.kingAlly    = false;
        h.suppressed  = false;

        if (id === realOldKingHouseId) {
          // Old king's house → suppressed and annexed
          h.status     = 'suppressed';
          h.suppressed = true;
          h.army       = 0;
        } else if (throneAllies.includes(id)) {
          // Helped in battle → fedele al Re
          h.status  = 'ally';
          h.kingAlly = true;
        } else {
          // Everyone else → neutral, fresh start
          h.status  = 'neutral';
          h.kingAlly = false;
        }
      });

      // Track which houses still need to pledge loyalty
      state.pendingLoyaltyPledges = Object.keys(state.houses).filter(id => {
        const h = state.houses[id];
        return !h.suppressed && !h.kingAlly && id !== realOldKingHouseId;
      });

      // ── Clear king demand state ──
      state.kingDemandRefusals   = 0;
      state.kingAllyBlocked      = false;
      state.kingDemandCooldown   = 0;

      // ── Apply resources — cap FISSO a 100, nessun aumento per conquista trono ──
      const cap = 100;
      Object.keys(state.resources).forEach(k => {
        state.resources[k] = Math.min(cap - 1, Math.max(1, state.resources[k]));
      });
      // Esercito: superstiti propri + piccolo reintegro, cappato a 65
      const ownThroneSwrvived = Math.max(5, (survived ?? state.resources.army) - (state.loanedArmy || 0));
      returnLoanedArmies();
      state.resources.army  = Math.min(65, Math.min(cap - 1, ownThroneSwrvived + 8));
      state.resources.power = Math.min(cap - 1, state.resources.power + 12);
      // Popolo cala — la guerra civile lascia ferite
      state.resources.people = Math.max(1, state.resources.people - 8);

      // ── Effetto paura trono: casate neutrali diventano diffidenti ──
      // Hai appena spodestato il Re — le casate ti temono ma non ti rispettano ancora
      Object.entries(state.houses).forEach(([id, nh]) => {
        if (id === realOldKingHouseId || nh.suppressed || nh.kingAlly) return;
        if (nh.status === 'neutral' && Math.random() < 0.35) {
          nh.status = 'diffidente';
          if (!state.diffidentePardonCost) state.diffidentePardonCost = {};
          state.diffidentePardonCost[id] = Math.round(15 + (nh.army || 50) * 0.2);
        }
      });

      state.decisionHistory.push({ turn: state.turn, cardId: 'throne_victory', choice: 'attack', tags: ['war_victory', 'throne_conquest'] });
      state._legitimacyQueued = state.turn + 5;

      showThroneResultOverlay(true, oldKingName, survived, throneAllies);
    } else {
      // Sconfitta contro il Re → fine partita
      // Il Re ha subito perdite — aggiorna il suo esercito (passa come terzo arg da showThroneAttackAnimation)
      returnLoanedArmies();
      if (typeof enemySurvived === 'number' && enemySurvived >= 0) {
        state.kingArmy = Math.max(30, enemySurvived);
      }
      state.decisionHistory.push({ turn: state.turn, cardId: 'throne_defeat', choice: 'attack', tags: ['war_choice', 'throne_defeat'] });
      // Track-2 keeps playing — stops only when player returns to home
      triggerEnd(
        false, '💀', 'La Ribellione è Soffocata',
        `${state.kingName} ha respinto la vostra ribellione con forza devastante. Le vostre truppe sono state annientate sul campo di battaglia. Come traditore catturato, siete stato condotto in catene ad Approdo del Re. La vostra testa ornò le mura della città come monito a chiunque osi sfidare il Trono di Spade.`
      );
    }

    updateHUD();
    saveGame();
  }

  const THRONE_LEGITIMACY_EVENT = {
    id: 'throne_legitimacy',
    speaker: 'Gran Maester', speakerRole: 'Consigliere del Trono',
    portrait: '📜', icon: '📜',
    text: "Da quando siede sul Trono di Spade, le grandi casate osservano. Il Gran Maester si presenta con una richiesta formale: «Le casate chiedono segni di legittimità. Un grande banchetto o una campagna di favori diplomatici rafforzerebbe il vostro diritto a regnare.»",
    leftText: 'Ignora la richiesta', leftEffects: { power: -10, people: -8 },
    rightText: 'Afferma la tua legittimità', rightEffects: { gold: -10, people: +14, faith: +10, power: +2 },
    tags: ['throne_legitimacy'],
  };

  function showThroneResultOverlay(won, kingName, survived, throneAllies) {
    const overlay = document.createElement('div');
    overlay.className = 'war-overlay';

    const continuaOnclick = won
      ? `this.parentElement.remove();Game.checkAndContinue()`
      : `if(typeof AudioManager!=='undefined')AudioManager.playMainFromWar();this.parentElement.remove();Game.checkAndContinue()`;

    const allyNote = throneAllies && throneAllies.length > 0
      ? `<p style="color:#fbbf24;margin-top:0.5rem">🛡 ${throneAllies.map(id => state.houses[id]?.icon || '').join(' ')} Fedeli al nuovo Re</p>`
      : '';

    const pendingCount = (state.pendingLoyaltyPledges || []).length;

    overlay.innerHTML = `
      <div class="war-title">${won ? '👑 IL TRONO È TUO' : '💀 LA RIBELLIONE FALLISCE'}</div>
      <div class="war-log">
        ${won ? `
          <p class="war-result war-victory">🏆 VITTORIA SUL RE!</p>
          <p><strong>${kingName}</strong> è stato spodestato e la sua casata annessa. Sei il nuovo Re Reggente dei Sette Regni.</p>
          ${allyNote}
          <p style="color:#c9a84c;margin-top:0.5rem">📜 Il regno è tuo — ma le casate ti osservano. Inizia a chiedere giuramenti di fedeltà.</p>
          <p style="color:#e8dcc8;margin-top:0.5rem">⚔ <strong>${pendingCount} casate</strong> devono ancora giurare fedeltà alla nuova Corona. Vai in Diplomazia e chiedi la loro lealtà.</p>
          <p style="color:#4ade80;font-size:0.85rem;margin-top:0.4rem">✨ Unisci tutti i regni per la vittoria finale!</p>
        ` : `
          <p class="war-result war-defeat">💀 SCONFITTA!</p>
          <p><strong>${kingName}</strong> ha respinto la tua ribellione.</p>
        `}
      </div>
      <button class="btn-primary" style="max-width:220px" onclick="${continuaOnclick}">Continua</button>
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
    const h = state.houses[hId];
    if (!h || h.status !== 'ally') { showToast('Solo le casate alleate possono prestarti truppe.', 'warn'); return; }

    // Solo la casata PRINCIPALE del personaggio non può fornire truppe (non tutte le startAllies)
    const char = state.character;
    const isHomeHouse = _getPrimaryHouseId(char) === hId && !h.pactBroken;
    if (isHomeHouse) { showToast(`🏰 Casa ${h.name} è la tua casata — non può essere chiamata a fornire truppe.`, 'warn'); return; }

    const hasActiveWar = state.pendingWarTarget ||
      (state.pendingWarDeclaration && state.pendingWarDeclaration.houseId) ||
      state.pendingKingChallenge;
    if (!hasActiveWar) { showToast('Devi prima dichiarare guerra o sfidare il Re.', 'warn'); return; }

    if (state.allyLoans && state.allyLoans[hId]) { showToast(`Casa ${h.name} ha già inviato truppe.`); return; }
    if (state.allyLoanRefusals && state.allyLoanRefusals[hId]) { showToast(`Casa ${h.name} ha già risposto.`); return; }

    // ── Betrayal check — rare event, scaled down significantly ──
    const baseBetrayal = h.betrayalChance || 0;
    const reduction    = h.betrayalReduction || 0;
    // Divide by 4 to make betrayal much rarer — a 40% house now has ~10% actual chance
    const effectiveBetrayal = Math.max(0, baseBetrayal - reduction) / 400;

    if (effectiveBetrayal > 0 && Math.random() < effectiveBetrayal) {
      h.status = 'enemy';
      if (!state.allyLoanRefusals) state.allyLoanRefusals = {};
      state.allyLoanRefusals[hId] = true;

      const betrayalContrib = Math.floor(h.army * (0.20 + Math.random() * 0.20));
      const warTarget = state.pendingWarDeclaration?.houseId || state.pendingWarTarget;
      if (warTarget && warTarget !== '__king__') {
        if (!state.warAllianceBonus) state.warAllianceBonus = {};
        state.warAllianceBonus[warTarget] = (state.warAllianceBonus[warTarget] || 0) + betrayalContrib;
      }

      const intelLevel = (state.spyIntel || {})[hId] || 0;
      const intelNote = intelLevel >= 2
        ? `Le vostre spie lo avevano segnalato — la percentuale di tradimento era elevata.`
        : intelLevel === 1
          ? `Avevate sentore che non fosse del tutto affidabile.`
          : `Nessuna vostra spia aveva segnalato questo pericolo.`;

      _resetBetrayalReduction(hId);
      showModal(
        '💔 Tradimento!',
        `${h.icon} <strong>Casa ${h.name}</strong> ha abbandonato la vostra causa e si è schierata con il nemico, portando con sé ${betrayalContrib} soldati.<br><br><em>${intelNote}</em>`,
        '⚔',
        'Maledetti traditori!',
        () => { updateHUD(); saveGame(); renderDiplomacy?.(); }
      );
      return;
    }

    // Allies are cautious — check if they want to participate
    const hostility = (state.houseHostility || {})[hId] || 0;
    const dipPen    = _dipPenalty(hId);
    const refusalChance = Math.min(0.65, 0.20 + hostility / 200 + (h.army < 60 ? 0.10 : 0) + dipPen / 200);
    if (Math.random() < refusalChance) {
      // House prefers to stay neutral in this conflict — remains ally but won't send troops
      const refusalMsgs = [
        `«Le nostre truppe sono impegnate a difendere i nostri confini. Non possiamo rischiare in questo conflitto.»`,
        `«Una guerra è un affare rischioso. Casa ${h.name} preferisce restare fuori da questa battaglia.»`,
        `«I tempi sono incerti. Non possiamo indebolire le nostre difese in questo momento.»`,
        `«Siamo vostri alleati, ma questa guerra non ci riguarda. Non invieremo soldati.»`,
      ];
      // Mark as refused for this war only — but do NOT permanently block
      if (!state.allyLoanRefusals) state.allyLoanRefusals = {};
      state.allyLoanRefusals[hId] = 'neutral'; // house stays out, final decision
      showModal(
        `${h.icon} Casa ${h.name} Rifiuta`,
        rand(refusalMsgs) + `<br><br>Casa ${h.name} rimane vostra alleata ma non parteciperà a questa guerra.`,
        '🕊', 'Capito',
        () => { renderDiplomacy(); }
      );
      return;
    }

    // How much do they lend? 20–50% of their army (restored original range)
    const lendPct = 0.20 + Math.random() * 0.30;
    const lendAmount = Math.max(5, Math.floor(h.army * lendPct));

    // Higher chance they want a pact (60% — they want something back)
    const wantsPact = Math.random() < 0.60;
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
          <button onclick="Game._refuseAllyLoan('${hId}')" style="flex:1;padding:0.7rem;background:transparent;border:1px solid rgba(201,168,76,0.4);border-radius:2px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;color:#c9a84c">Rifiuta</button>
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
    // Rimuovi eventuale rifiuto precedente
    if (state.allyLoanRefusals) delete state.allyLoanRefusals[hId];

    if (!isPact && resKey && resCost) {
      state.resources[resKey] = clampRes(state.resources[resKey] - resCost);
    }
    if (isPact) {
      if (!state.activePacts) state.activePacts = {};
      state.activePacts[hId] = true;
    }

    showToast(`⚔ Casa ${h.name} ti presta ${amount} soldati${isPact ? ' (patto di sangue)' : ''}!`, 'good');
    updateHUD();
    saveGame();
    // Always reopen war diplomacy overlay with updated data
    document.getElementById('war-diplo-reinf-overlay')?.remove();
    const panel = document.getElementById('diplomacy-panel');
    if (panel && !panel.classList.contains('hidden')) renderDiplomacy();
    setTimeout(() => {
      const warTarget = state.pendingWarDeclaration?.houseId || state.pendingWarTarget;
      if (state.pendingKingChallenge) Game._openKingChallengeDiplomacy();
      else if (warTarget && warTarget !== '__king__') Game._openWarDiplomacy(warTarget);
    }, 200);
  }

  function _refuseAllyLoan(hId) {
    document.getElementById('ally-army-overlay')?.remove();
    if (!state.allyLoanRefusals) state.allyLoanRefusals = {};
    state.allyLoanRefusals[hId] = 'comp_refused';
    const panel = document.getElementById('diplomacy-panel');
    if (panel && !panel.classList.contains('hidden')) renderDiplomacy();
    setTimeout(() => {
      const warTarget = state.pendingWarDeclaration?.houseId || state.pendingWarTarget;
      if (state.pendingKingChallenge) Game._openKingChallengeDiplomacy();
      else if (warTarget && warTarget !== '__king__') Game._openWarDiplomacy(warTarget);
    }, 200);
  }

  function returnLoanedArmies() {
    if (!state.loanedArmy || state.loanedArmy === 0) return;
    const total = state.loanedArmy;
    state.loanedArmy = 0;
    state.allyLoans = {};
    state.allyLoanRefusals = {}; // reset risposte — pronti per la prossima guerra
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
      rightText: `Onora il patto — invia truppe`, rightEffects: { army: -12, power: +3 },
      tags: ['pact_response'],
      pactHouseId: hId,
      onRightChoose: () => {
        _recordDipEvent(hId, 'honored_pact');
      },
      onLeftChoose: () => {
        h.status = 'enemy';
        h.pactBroken = true;
        _recordDipEvent(hId, 'refused_pact');
        _recordDipEvent(hId, 'betrayed_us');
        _resetBetrayalReduction(hId);
        showToast(`💔 Casa ${h.name} vi considera traditori. Sono ora vostri nemici permanenti.`, 'warn');
      },
    });
  }

  // ══════════════════════════════════════════════
  // ENEMY TRIBUTE DEMAND SYSTEM
  // ══════════════════════════════════════════════
  // Called each turn from drawNextCard tick
  function checkEnemyTributeDemands() {
    if (state.turn < 7) return;

    const playerArmy   = state.resources.army + (state.loanedArmy || 0);
    const playerPower  = state.resources.power;
    const playerGold   = state.resources.gold;
    // "Threat score" — how dangerous the player looks to a watching house
    const threatScore  = playerArmy * 0.5 + playerPower * 0.3 + playerGold * 0.2;

    Object.entries(state.houses).forEach(([hId, h]) => {
      if (h.status !== 'enemy' || h.suppressed) return;
      if (state.activeThreats && state.activeThreats[hId]) return;
      if (state.eventQueue.some(c => c.tributeHouseId === hId)) return;

      if (h.startingEnemy) {
        // ── STARTING ENEMIES: passive "watch and demand" logic ──
        // They won't attack first, but they'll demand tribute when player gets strong
        // Threshold: player threat score > 60% of this house's strength
        const houseStrength = h.army * 0.6 + 20;
        if (threatScore < houseStrength) return; // not dangerous enough yet — keep watching
        // Cooldown: don't spam — at most once every 14 turns per house
        if (!state.startingEnemyCooldown) state.startingEnemyCooldown = {};
        const lastDemand = state.startingEnemyCooldown[hId] || 0;
        if (state.turn - lastDemand < 14) return;
        // ~7% chance per turn once threshold crossed
        if (Math.random() > 0.07) return;

        state.startingEnemyCooldown[hId] = state.turn;
        state.eventQueue.push(buildStartingEnemyTributeCard(hId, h, threatScore));

      } else {
        // ── OTHER ENEMIES: evaluate force balance before demanding or attacking ──
        // These became enemies during the game — they check if odds are favorable first
        const playerTotalForce = state.resources.army +
          Object.values(state.houses).filter(hh => hh.status === 'ally' && !hh.suppressed)
            .reduce((s, hh) => s + hh.army * 0.4, 0);
        const enemyTotalForce = h.army +
          Object.entries(state.houses)
            .filter(([id2, hh]) => id2 !== hId && hh.status === 'enemy' && !hh.suppressed)
            .reduce((s, [, hh]) => s + hh.army * 0.3, 0);
        // Only demand/attack if enemy coalition has at least 70% of player's force
        if (enemyTotalForce < playerTotalForce * 0.70) return;
        if (Math.random() > 0.05) return;
        state.eventQueue.push(buildTributeDemandCard(hId, h));
      }
    });

    // Check active threats — if expired, trigger attack card
    if (state.activeThreats) {
      Object.entries(state.activeThreats).forEach(([hId, threat]) => {
        if (state.turn >= threat.attackTurn) {
          delete state.activeThreats[hId];
          const h = state.houses[hId];
          if (h && !h.suppressed) {
            state.eventQueue.unshift(buildHouseAttackCard(hId, h));
          }
        }
      });
    }
  }

  function buildStartingEnemyTributeCard(hId, h, threatScore) {
    // Tribute proportional to how threatening the player has become
    // The more powerful the player, the more the enemy demands
    const diffMult = { easy: 0.55, medium: 0.80, hard: 1.05 }[state.character?.difficulty] || 0.80;
    const base = Math.floor(threatScore * (0.10 + Math.random() * 0.08));
    const demandAmt = Math.max(8, Math.round(base * diffMult));
    const demandRes = rand(['gold', 'army', 'people']);
    const resLabels  = { gold: 'oro 💰', army: 'soldati ⚔', people: 'popolo 👥' };

    // How many times have they already been refused?
    const refusals = (state.startingEnemyRefusals || {})[hId] || 0;
    const warningNote = refusals >= 1
      ? ` Questa è la ${refusals + 1}ª richiesta. Ignorarla di nuovo potrebbe spingere Casa ${h.name} ad agire.`
      : '';

    return {
      id: 'starting_enemy_tribute_' + hId + '_' + state.turn,
      speaker: `Casa ${h.name}`,
      speakerRole: '👁 Osservatori da lontano — Richiesta di tributo',
      portrait: h.icon, icon: h.icon,
      text: `${h.icon} Casa ${h.name} vi osserva da lontano. La vostra crescente potenza non è passata inosservata. Inviano un messaggero: «Pagate ${demandAmt} ${resLabels[demandRes]} come segno di rispetto, o potreste attirare la nostra attenzione nel modo sbagliato.»${warningNote}`,
      leftText: `Rifiuta — non ci spaventi`,
      leftEffects: {},
      rightText: `Paga il tributo (−${demandAmt} ${resLabels[demandRes]})`,
      rightEffects: { [demandRes]: -demandAmt },
      tags: ['tribute_demand', 'starting_enemy_tribute'],
      tributeHouseId: hId,
      tributeRes: demandRes,
      tributeAmt: demandAmt,
      onRightChoose: () => {
        // Pagamento: la casata aggiunge le risorse ricevute al proprio esercito
        const armyBonus = demandRes === 'army'
          ? demandAmt
          : Math.floor(demandAmt * 0.4); // oro e popolo convertiti in soldati (parzialmente)
        h.army = Math.round(h.army + armyBonus);
        if (!state.startingEnemyCooldown) state.startingEnemyCooldown = {};
        state.startingEnemyCooldown[hId] = state.turn + 18; // lungo cooldown dopo pagamento
        // Reset refusals on payment
        if (state.startingEnemyRefusals) state.startingEnemyRefusals[hId] = 0;
        showToast(`${h.icon} Casa ${h.name} riceve il tributo. Le loro armate crescono (+${armyBonus} soldati). Staranno quieti per ora.`, 'warn');
      },
      onLeftChoose: () => {
        // Rifiuto: la casata valuta se conviene attaccare in base alle forze in campo
        if (!state.startingEnemyRefusals) state.startingEnemyRefusals = {};
        state.startingEnemyRefusals[hId] = (state.startingEnemyRefusals[hId] || 0) + 1;
        const refusals = state.startingEnemyRefusals[hId];

        // Stima forze: casata + potenziali alleati vs giocatore + suoi alleati
        const playerTotalForce = state.resources.army +
          Object.values(state.houses).filter(hh => hh.status === 'ally' && !hh.suppressed)
            .reduce((s, hh) => s + hh.army * 0.4, 0);
        const enemyTotalForce = h.army +
          Object.entries(state.houses)
            .filter(([id2, hh]) => id2 !== hId && hh.status === 'enemy' && !hh.suppressed)
            .reduce((s, [, hh]) => s + hh.army * 0.3, 0);
        const favorableOdds = enemyTotalForce >= playerTotalForce * 0.75;

        // Probabilità di attacco cresce con i rifiuti: 30% → 55% → 80%, ma solo se odds favorevoli
        const baseAttackChance = Math.min(0.80, 0.30 + (refusals - 1) * 0.25);
        const attackChance = favorableOdds ? baseAttackChance : baseAttackChance * 0.35;
        if (Math.random() < attackChance) {
          if (!state.activeThreats) state.activeThreats = {};
          const attackIn = Math.max(2, 4 - refusals);
          state.activeThreats[hId] = { attackTurn: state.turn + attackIn, houseName: h.name, houseIcon: h.icon };
          showThreatBanner(h, attackIn);
          showToast(`⚠ ${h.icon} Casa ${h.name} non ha gradito il rifiuto. Stanno mobilitando le truppe — attacco in ${attackIn} turni.`, 'warn');
        } else if (!favorableOdds) {
          showToast(`${h.icon} Casa ${h.name} valuta le forze in campo e decide di non attaccare ancora — per ora.`, 'warn');
        } else {
          showToast(`${h.icon} Casa ${h.name} non è ancora pronta ad attaccare, ma ricorderà questo affronto.`, 'warn');
        }
      },
    };
  }

  function buildTributeDemandCard(hId, h) {
    // Importo più basso: 15–30% dell'esercito nemico (era 30–50%)
    // Scalato per difficoltà: easy 0.6×, medium 0.85×, hard 1.1×
    const diffMult = { easy: 0.60, medium: 0.85, hard: 1.10 }[state.character?.difficulty] || 0.85;
    const turnBonus = Math.floor(state.turn / 8);          // +1 ogni 8 turni (era ogni 5)
    const base = Math.floor(h.army * (0.15 + Math.random() * 0.15)); // 15–30% esercito nemico
    const demandAmt = Math.max(10, Math.round((base + turnBonus) * diffMult));

    const demandRes = rand(['gold', 'army', 'people']);
    const resLabels = { gold: 'oro 💰', army: 'soldati ⚔', people: 'popolo 👥' };
    return {
      id: 'tribute_demand_' + hId + '_' + Date.now(),
      speaker: `Casa ${h.name}`,
      speakerRole: '⚠ Ultimatum — avete 3 turni per decidere',
      portrait: h.icon, icon: h.icon,
      text: `${h.icon} Casa ${h.name} invia un ultimatum: «Pagate ${demandAmt} ${resLabels[demandRes]} come tributo o preparatevi alla guerra. Avete tempo fino alla terza carta — poi le nostre armate marceranno.»`,
      leftText: `Rifiuta l'ultimatum`,
      leftEffects: {},
      rightText: `Paga subito il tributo (−${demandAmt} ${resLabels[demandRes]})`,
      rightEffects: { [demandRes]: -demandAmt },
      tags: ['tribute_demand'],
      tributeHouseId: hId,
      tributeRes: demandRes,
      tributeAmt: demandAmt,
      onLeftChoose: () => {
        // Rifiuto → 3 carte di preparazione alla guerra in testa alla coda
        _recordDipEvent(hId, 'unpaid_tribute');
        h.status = 'enemy';
        state.pendingWarDeclaration = { houseId: hId, revealTurn: state.turn + 2, declaredTurn: state.turn };
        if (typeof AudioManager !== 'undefined') AudioManager.playWar();
        // t3 e t2 in unshift inverso, poi t1 narrativa (non diplomatica)
        state.eventQueue.unshift({
          id: 'war_decl_t3_' + hId,
          speaker: `${h.icon} Casa ${h.name}`,
          speakerRole: '⚔ LA BATTAGLIA INIZIA',
          portrait: '⚔️', icon: '⚔️',
          text: `Le armate di Casa ${h.name} sono alle vostre porte. Il tempo della diplomazia è finito. Combattete!`,
          leftText: '⚔ Combatti!', leftEffects: {},
          rightText: '⚔ Combatti!', rightEffects: {},
          tags: ['war_start'],
          onLeftChoose:  () => { state.pendingWarDeclaration = null; setTimeout(() => triggerHouseBattle(hId, false), 450); },
          onRightChoose: () => { state.pendingWarDeclaration = null; setTimeout(() => triggerHouseBattle(hId, false), 450); },
        });
        state.eventQueue.unshift({
          id: 'war_decl_t2_' + hId,
          speaker: 'Varys',
          speakerRole: 'Maestro dei Sussurri',
          portrait: '🕷', icon: '🕷',
          text: `Casa ${h.name} ha rifiutato ogni trattativa e sta mobilitando i suoi alleati. Le spie riportano rinforzi in marcia. Aprite la Diplomazia per chiedere aiuto alle vostre casate alleate prima che la battaglia inizi.`,
          leftText: 'Prepariamo le difese', leftEffects: { army: +3 },
          rightText: '🤝 Chiedi rinforzi agli alleati', rightEffects: {},
          tags: ['war_pending'],
          onRightChoose: () => {
            _revealEnemyAlliances(hId, h);
            setTimeout(() => _openWarDiplomacy(hId), 400);
          },
          onLeftChoose: () => _revealEnemyAlliances(hId, h),
          _pauseAfterChoice: 'right',
        });
        state.eventQueue.unshift({
          id: 'war_decl_t1_' + hId,
          speaker: 'Araldo di guerra',
          speakerRole: `Casa ${h.name} — guerra dichiarata`,
          portrait: '📯', icon: '📯',
          text: `Avete rifiutato l'ultimatum di Casa ${h.name}. Il loro araldo ha lasciato la corte sbattendo le porte. La guerra è inevitabile — preparatevi. Aprite la Diplomazia per organizzare i rinforzi.`,
          leftText: 'Ci prepariamo alla guerra', leftEffects: { army: +3 },
          rightText: 'Rafforziamo le difese', rightEffects: { power: +3 },
          tags: ['war_pending'],
        });
        showThreatBanner(h, 3);
        showToast(`⚔ Avete rifiutato l'ultimatum di Casa ${h.name}. La guerra inizierà tra 3 carte.`, 'warn');
      },
      onRightChoose: () => {
        _recordDipEvent(hId, 'paid_tribute');
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
      onLeftChoose:  () => { setTimeout(() => showPreBattleOverlay(hId, false), 450); },
      onRightChoose: () => { setTimeout(() => showPreBattleOverlay(hId, false), 450); },
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
          <strong style="color:#4ade80">Se vinci:</strong> Casa ${h.name} viene conquistata. Bottino di guerra (oro, truppe, potere). Le casate neutrali si spaventano.<br>
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
    state.pendingWarDeclaration = null;
    state.loanedArmy = 0;
    state.allyLoans = {};
    updateHUD();
    saveGame();
  }

  // ── War declaration: 3-turn delay + alliance reveal ──
  // skipFirstTurn=true quando la casata ha rifiutato un ultimatum (solo 2 turni rimasti)
  function _scheduleWarDeclarationCards(houseId, h, skipFirstTurn) {
    // War cards take PRIORITY over existing queued cards — insert at front in reverse order
    // so the final queue order is: t1 → t2 → t3 → existing cards

    // Turno 3 — La battaglia inizia (entrambe le scelte avviano lo scontro)
    state.eventQueue.unshift({
      id: 'war_decl_t3_' + houseId,
      speaker: `${h.icon} Casa ${h.name}`,
      speakerRole: `⚔ LA BATTAGLIA INIZIA`,
      portrait: '⚔️', icon: '⚔️',
      text: `Il tempo è scaduto. Le armate di Casa ${h.name} sono schierate. Le casate alleate hanno deciso il loro sostegno. La battaglia per il dominio comincia ora!`,
      leftText: '⚔ Attacca!', leftEffects: {},
      rightText: '⚔ Attacca!', rightEffects: {},
      tags: ['war_start'],
      onLeftChoose:  () => { state.pendingWarDeclaration = null; setTimeout(() => showPreBattleOverlay(houseId), 450); },
      onRightChoose: () => { state.pendingWarDeclaration = null; setTimeout(() => showPreBattleOverlay(houseId), 450); },
    });

    // Turno 2 — Varys avvisa: "attacca subito" avanza a t3, "chiedi rinforzi" apre diplomazia e pausa
    state.eventQueue.unshift({
      id: 'war_decl_t2_' + houseId,
      speaker: `Varys`,
      speakerRole: `Maestro dei Sussurri`,
      portrait: '🕷', icon: '🕷',
      text: `I miei uccelli cantano, Vostra Grazia. Casa ${h.name} ha inviato corvi a tutte le casate del regno chiedendo sostegno militare. Alcune risponderanno. Potreste fare altrettanto con i vostri alleati — o attaccare subito, prima che i rinforzi nemici arrivino.`,
      leftText: '⚔ Attacca subito!', leftEffects: {},
      rightText: '🤝 Chiedi rinforzi agli alleati', rightEffects: {},
      tags: ['war_pending'],
      // Scegli "attacca subito" → rivela alleanze, rimuovi t3 dalla coda e avvia battaglia
      onLeftChoose: () => {
        _revealEnemyAlliances(houseId, h);
        state.eventQueue = state.eventQueue.filter(c => c.id !== 'war_decl_t3_' + houseId);
        state.pendingWarDeclaration = null;
        setTimeout(() => showPreBattleOverlay(houseId), 500);
      },
      // Scegli "chiedi rinforzi" → apre diplomazia, flusso carte in pausa fino a chiusura overlay
      // NON riveliamo le alleanze nemiche ora — il giocatore deve prima poter chiedere rinforzi
      onRightChoose: () => {
        setTimeout(() => _openWarDiplomacy(houseId), 400);
      },
      _pauseAfterChoice: 'right', // pausa solo se sceglie "chiedi rinforzi"
    });

    if (!skipFirstTurn) {
      // Turno 1 — carta narrativa guerra
      state.eventQueue.unshift({
        id: 'war_decl_t1_' + houseId,
        speaker: `Messaggero di guerra`,
        speakerRole: `Corvi inviati a tutte le casate`,
        portrait: '📜', icon: '📜',
        text: `La dichiarazione di guerra a Casa ${h.name} si è diffusa in tutto il regno. Le altre casate stanno ora valutando le proprie posizioni. Nel prossimo turno scoprirete chi si schiera con loro. Aprite la Diplomazia per chiedere rinforzi agli alleati.`,
        leftText: 'Ritira la dichiarazione', leftEffects: { power: -8 },
        rightText: 'Siamo pronti alla guerra', rightEffects: {},
        tags: ['war_pending'],
        onLeftChoose: () => {
          state.pendingWarDeclaration = null;
          // Rimuovi le carte di preparazione guerra dalla coda
          state.eventQueue = state.eventQueue.filter(c =>
            c.id !== 'war_decl_t2_' + houseId && c.id !== 'war_decl_t3_' + houseId
          );
          // La casata diventa diffidente (non nemica, ma non più neutrale)
          state.houses[houseId].status = 'diffidente';
          const pardonCost = 12 + Math.floor(Math.random() * 8);
          if (!state.diffidentePardonCost) state.diffidentePardonCost = {};
          state.diffidentePardonCost[houseId] = pardonCost;
          // Torna alla musica normale
          if (typeof AudioManager !== 'undefined') AudioManager.playMainFromWar();
          showToast(`✉ Avete ritirato la dichiarazione di guerra. Casa ${h.name} vi osserva con sospetto — ora diffidente.`, 'warn');
        },
      });
    }

    // Se c'è già una carta in schermo, sostituiscila immediatamente con la t1 (o t2 se skipFirstTurn)
    _forceShowFirstWarCard();
  }

  // Sostituisce immediatamente la carta in schermo con la prima carta di guerra in coda
  function _forceShowFirstWarCard() {
    const nextWarCard = state.eventQueue[0];
    if (!nextWarCard) return;
    // Rimuovila dalla coda e rendila la carta corrente
    state.eventQueue.shift();
    currentCard = nextWarCard;
    const el = document.getElementById('main-card');
    if (!el) return;
    // Animazione rapida di sostituzione
    el.style.transition = 'opacity 0.2s ease';
    el.style.opacity = '0';
    setTimeout(() => {
      renderCard(currentCard);
      el.style.opacity = '0';
      void el.offsetWidth;
      el.style.transition = 'opacity 0.25s ease';
      el.style.opacity = '1';
      setTimeout(() => { el.style.transition = ''; }, 250);
    }, 200);
  }

  function _openWarDiplomacy(houseId) {
    const h = state.houses[houseId];
    if (!h) return;
    const existing = document.getElementById('war-diplo-reinf-overlay');
    if (existing) existing.remove();

    // Home houses (startAllies still ally and pact not broken) do NOT auto-provide troops.
    // They are shown as a disabled grey button — they belong to the player's house.
    const char = state.character;

    const allies = Object.entries(state.houses).filter(([, hh]) => hh.status === 'ally' && !hh.suppressed);
    const loanedArmy = state.loanedArmy || 0;
    const playerForce = state.resources.army + loanedArmy;
    const enemyForce = h.army + ((state.warAllianceBonus || {})[houseId] || 0);
    const winPct = Math.round(Math.min(95, Math.max(5, playerForce / (playerForce + enemyForce) * 100)));

    const allyRows = allies.length > 0
      ? allies.map(([id, hh]) => {
          const hasLoan      = state.allyLoans && state.allyLoans[id];
          // isHome = SOLO la casata principale del personaggio (non tutte le startAllies)
          const primaryHouseId = _getPrimaryHouseId(char);
          const isHome       = primaryHouseId && id === primaryHouseId && !hh.pactBroken;
          const refusalState = (state.allyLoanRefusals || {})[id];

          // Casata principale → tasto grigio disabilitato (non fornisce truppe)
          if (isHome) {
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.65rem;margin-bottom:0.3rem;background:rgba(80,80,80,0.1);border:1px solid rgba(120,120,120,0.25);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#6b6b6b;opacity:0.6">
              <span>${hh.icon} Casa ${hh.name} <span style="font-size:0.68rem;font-family:'Cinzel',serif;color:#555">— casata di appartenenza</span></span>
              <span style="font-family:'Cinzel',serif;font-size:0.68rem;color:#555">🏰 Non disponibile</span>
            </div>`;
          }
          if (hasLoan) {
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.65rem;margin-bottom:0.3rem;background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.25);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#4ade80">
              <span>${hh.icon} Casa ${hh.name} — ⚔ ${Math.round(hh.army)}</span>
              <span style="font-family:'Cinzel',serif;font-size:0.68rem">⚔ +${state.allyLoans[id].amount} forniti</span>
            </div>`;
          }
          if (refusalState === 'neutral') {
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.65rem;margin-bottom:0.3rem;background:rgba(60,60,60,0.15);border:1px solid rgba(100,100,100,0.25);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#6b5e4a">
              <span>${hh.icon} Casa ${hh.name} — ⚔ ${Math.round(hh.army)}</span>
              <span style="font-family:'Cinzel',serif;font-size:0.65rem">🕊 Resta neutrale</span>
            </div>`;
          }
          if (refusalState === 'comp_refused') {
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.65rem;margin-bottom:0.3rem;background:rgba(60,60,60,0.15);border:1px solid rgba(100,100,100,0.25);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#6b5e4a">
              <span>${hh.icon} Casa ${hh.name} — ⚔ ${Math.round(hh.army)}</span>
              <span style="font-family:'Cinzel',serif;font-size:0.65rem">✗ Compenso rifiutato</span>
            </div>`;
          }
          return `<button onclick="Game.requestAllyArmy('${id}');document.getElementById('war-diplo-reinf-overlay').remove();setTimeout(()=>Game._openWarDiplomacy('${houseId}'),200)" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.65rem;margin-bottom:0.3rem;background:rgba(74,222,128,0.07);border:1px solid rgba(74,222,128,0.28);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#e8dcc8;cursor:pointer;text-align:left">
            <span>${hh.icon} Casa ${hh.name} — ⚔ ${Math.round(hh.army)}</span>
            <span style="color:#4ade80;font-family:'Cinzel',serif;font-size:0.68rem">Chiedi rinforzi →</span>
          </button>`;
        }).join('')
      : `<p style="font-family:'EB Garamond',serif;font-size:0.88rem;color:#6b5e4a;font-style:italic;margin:0">Nessuna casata alleata disponibile.</p>`;

    const loanNote = loanedArmy > 0
      ? `<div style="margin-bottom:0.5rem;font-family:'Cinzel',serif;font-size:0.72rem;color:#4ade80">⚔ Rinforzi ottenuti finora: +${loanedArmy}</div>`
      : '';

    const overlay = document.createElement('div');
    overlay.id = 'war-diplo-reinf-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:640;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;backdrop-filter:blur(4px);';
    overlay.innerHTML = `
      <div style="background:#12121a;border:2px solid rgba(239,68,68,0.4);border-radius:6px;width:92%;max-width:450px;max-height:90vh;overflow-y:auto;padding:1.75rem;font-family:'Cinzel',serif;">
        <div style="font-family:'Cinzel Decorative',serif;color:#f87171;font-size:0.95rem;margin-bottom:0.25rem">🕷 Rapporto di Varys</div>
        <div style="font-size:0.68rem;color:#9a8a6a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.9rem">Preparazione alla guerra contro Casa ${h.name}</div>

        <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:#e8dcc8;margin-bottom:0.35rem">
          <span>🗡 Tue forze: <strong style="color:#4ade80">${Math.round(playerForce)}</strong></span>
          <span>🛡 Forze nemiche (stimate): <strong style="color:#f87171">${Math.round(enemyForce)}</strong></span>
        </div>
        <div style="height:8px;border-radius:4px;overflow:hidden;background:rgba(255,255,255,0.05);margin-bottom:0.3rem;display:flex">
          <div style="width:${Math.round(playerForce/(playerForce+enemyForce)*100)}%;background:linear-gradient(90deg,#166534,#4ade80)"></div>
          <div style="flex:1;background:linear-gradient(90deg,#991b1b,#f87171)"></div>
        </div>
        <div style="text-align:center;font-size:0.72rem;color:#c9a84c;margin-bottom:0.85rem">Probabilità di vittoria stimata: <strong>${winPct}%</strong></div>

        ${loanNote}

        <div style="background:rgba(74,222,128,0.04);border:1px solid rgba(74,222,128,0.2);border-radius:4px;padding:0.75rem;margin-bottom:1rem">
          <div style="font-size:0.7rem;color:#4ade80;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.55rem">🤝 Casate alleate</div>
          ${allyRows}
        </div>

        <div style="display:flex;gap:0.65rem">
          <button onclick="document.getElementById('war-diplo-reinf-overlay').remove();Game.resumeCardFlow()" style="flex:1;padding:0.7rem;background:linear-gradient(135deg,#7f1d1d,#dc2626);border:none;border-radius:2px;font-family:'Cinzel',serif;font-size:0.73rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#fff">
            ⚔ Sono pronto — Alla Battaglia
          </button>
        </div>
        <p style="font-family:'EB Garamond',serif;font-size:0.78rem;color:#6b5e4a;margin-top:0.65rem;line-height:1.5;font-style:italic">
          Chiudi questa schermata quando hai finito. La battaglia partirà alla prossima carta.
        </p>
      </div>`;
    document.body.appendChild(overlay);
  }

  function _revealEnemyAlliances(houseId, h) {
    const supporters = [];       // casate nemiche/neutrali che si uniscono al nemico
    const allyDefectors = [];    // alleati del giocatore che si tirano indietro (→ neutrali)

    Object.entries(state.houses).forEach(([id, hh]) => {
      if (id === houseId) return;
      if (hh.suppressed) return;

      if (hh.status === 'ally') {
        // Un alleato del giocatore può decidere di NON schierarsi — diventa neutrale
        // Chance: 15% base. Più alta se la casata nemica è molto forte.
        const enemyStrengthFactor = (h.army / (state.resources.army + 1));
        const defectChance = Math.min(0.35, 0.10 + enemyStrengthFactor * 0.08);
        if (Math.random() < defectChance) {
          hh.status = 'neutral';
          allyDefectors.push(`${hh.icon} Casa ${hh.name}`);
        }
        return; // gli alleati rimasti non aiutano il nemico
      }

      // Casate nemiche o neutrali valutano se unirsi al nemico
      const supportChance = hh.status === 'enemy' ? 0.60 : 0.25;
      if (Math.random() < supportChance) {
        const contribution = Math.floor(hh.army * (0.15 + Math.random() * 0.20));
        if (contribution > 0) {
          supporters.push({ name: hh.name, icon: hh.icon, contribution });
          if (!state.warAllianceBonus) state.warAllianceBonus = {};
          state.warAllianceBonus[houseId] = (state.warAllianceBonus[houseId] || 0) + contribution;
          // Salva i dettagli per casata per mostrarli nell'overlay pre-battaglia
          if (!state.warAllianceSupporters) state.warAllianceSupporters = {};
          if (!state.warAllianceSupporters[houseId]) state.warAllianceSupporters[houseId] = [];
          state.warAllianceSupporters[houseId].push({ name: hh.name, icon: hh.icon, contribution });
        }
      }
    });

    // Notifica alleati che si tirano indietro
    if (allyDefectors.length > 0) {
      showToast(`😤 ${allyDefectors.join(', ')} ha deciso di non schierarsi — tornano neutrali di fronte a questa guerra.`, 'warn');
    }

    // Notifica rinforzi nemici
    if (supporters.length > 0) {
      const list = supporters.map(s => `${s.icon} Casa ${s.name} (+${s.contribution})`).join(', ');
      showToast(`⚔ Alleanze nemiche rivelate: ${list} si uniscono a Casa ${h.name}!`, 'warn');
    } else {
      showToast(`✅ Le spie confermano: nessuna casata nemica si unirà a Casa ${h.name}.`, 'good');
    }
  }

  function showPreBattleOverlay(houseId, playerInitiated = true) {
    const h = state.houses[houseId];
    if (!h) return;

    const existing = document.getElementById('pre-battle-overlay');
    if (existing) existing.remove();

    // Reveal enemy alliances NOW so the overlay shows the real final forces — no surprises after
    if (!(state.warAllianceBonus && state.warAllianceBonus[houseId])) {
      _revealEnemyAlliances(houseId, h);
    }

    // Calculate forces — now includes the just-revealed alliance bonus
    const loanedArmy = state.loanedArmy || 0;
    const playerForce = state.resources.army + loanedArmy;
    const allianceBonus = (state.warAllianceBonus || {})[houseId] || 0;
    const enemyBonus = Object.entries(state.houses)
      .filter(([id, hh]) => id !== houseId && hh.status === 'enemy' && !hh.suppressed)
      .reduce((s, [, hh]) => s + hh.army * 0.2, 0);
    const enemyForce = h.army + enemyBonus + allianceBonus;
    const winPct = Math.round(Math.min(95, Math.max(5, playerForce / (playerForce + enemyForce) * 100)));

    // Ally contributions — show ALL allied houses with their status
    const allyContribs = Object.entries(state.houses)
      .filter(([, ah]) => ah.status === 'ally' && !ah.suppressed)
      .map(([id, ah]) => {
        const loan = (state.allyLoans || {})[id];
        const refusal = (state.allyLoanRefusals || {})[id];
        const primaryHouseId = _getPrimaryHouseId(state.character);
        const isHome = primaryHouseId && id === primaryHouseId && !ah.pactBroken;
        if (isHome) {
          return `<div style="font-size:0.78rem;color:#6b6b6b;font-family:'EB Garamond',serif;opacity:0.55">${ah.icon} Casa ${ah.name} <span style="font-size:0.7rem">🏰 casata di appartenenza</span></div>`;
        }
        if (loan) {
          return `<div style="font-size:0.78rem;color:#4ade80;font-family:'EB Garamond',serif">${ah.icon} Casa ${ah.name} <strong>+${loan.amount}⚔</strong></div>`;
        }
        if (refusal === 'neutral') {
          return `<div style="font-size:0.78rem;color:#6b5e4a;font-family:'EB Garamond',serif">${ah.icon} Casa ${ah.name} <span style="font-size:0.7rem">🕊 resta neutrale</span></div>`;
        }
        if (refusal === 'comp_refused') {
          return `<div style="font-size:0.78rem;color:#6b5e4a;font-family:'EB Garamond',serif">${ah.icon} Casa ${ah.name} <span style="font-size:0.7rem">✗ compenso rifiutato</span></div>`;
        }
        if (refusal) {
          return `<div style="font-size:0.78rem;color:#6b5e4a;font-family:'EB Garamond',serif">${ah.icon} Casa ${ah.name} <span style="font-size:0.7rem">— nessuna risposta</span></div>`;
        }
        return `<div style="font-size:0.78rem;color:#9a8a6a;font-family:'EB Garamond',serif">${ah.icon} Casa ${ah.name} <span style="font-size:0.7rem;font-style:italic">— non contattata</span></div>`;
      }).join('');

    // Enemy supporter contributions — real values from enemy houses
    const enemySupportRows = Object.entries(state.houses)
      .filter(([id, hh]) => id !== houseId && hh.status === 'enemy' && !hh.suppressed)
      .map(([, hh]) => {
        const contrib = Math.floor(hh.army * 0.2);
        return contrib > 0 ? `<div style="font-size:0.78rem;color:#f87171;font-family:'EB Garamond',serif">${hh.icon} Casa ${hh.name} <strong>+${contrib}⚔</strong></div>` : '';
      }).join('');
    // Also show warAllianceSupporters contributors (from declaration phase) — one row per house
    const allianceSupporters = (state.warAllianceSupporters || {})[houseId] || [];
    const allianceBonusRow = allianceSupporters.length > 0
      ? allianceSupporters.map(s =>
          `<div style="font-size:0.78rem;color:#f87171;font-family:'EB Garamond',serif">${s.icon} Casa ${s.name} <strong>+${s.contribution}⚔</strong> <span style="font-size:0.68rem;color:#c87070">alleanza rivelata</span></div>`
        ).join('')
      : (allianceBonus > 0
          ? `<div style="font-size:0.78rem;color:#f87171;font-family:'EB Garamond',serif">⚔ Alleanze rivelate: <strong>+${Math.round(allianceBonus)}⚔</strong></div>`
          : '');
    const enemySupporters = enemySupportRows + allianceBonusRow;

    const charId = state.character?.id || '';
    const charFirstName = state.character?.name?.split(' ')[0] || 'Tu';
    const charFallbackIcon = state.character?.icon || '⚔️';
    const winColor = winPct >= 60 ? '#4ade80' : winPct >= 40 ? '#fbbf24' : '#f87171';

    // ── Sfondi cinematografici ──
    // Lato giocatore: <charId>_bg.png → fallback <charId>.png
    // Lato nemico casata: <houseId>_bg.png → fallback stemma casata
    const playerBgId  = `images/characters/${charId}_bg.png`;
    const playerPortraitSrc = `images/characters/${charId}.png`;
    const enemyBgSrc  = `images/houses/${houseId}_bg.png`;
    const enemyCrestSrc = h.crest || null;

    // Split background: left = player, right = enemy, center fade
    const splitBg = `
      <div id="pbo-bg" style="position:absolute;inset:0;z-index:0;overflow:hidden;border-radius:6px;">
        <!-- Player side -->
        <div style="position:absolute;inset:0;width:50%;left:0;">
          <img src="${playerBgId}" style="width:100%;height:100%;object-fit:cover;object-position:top center;opacity:0.55"
               onerror="this.src='${playerPortraitSrc}';this.onerror=null">
          <div style="position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.85) 100%)"></div>
        </div>
        <!-- Enemy side -->
        <div style="position:absolute;inset:0;width:50%;right:0;left:auto;">
          <img src="${enemyBgSrc}" style="width:100%;height:100%;object-fit:cover;object-position:top center;opacity:0.55"
               onerror="this.src='${enemyCrestSrc || ''}';this.style.objectFit='contain';this.style.opacity='0.35';this.onerror=null">
          <div style="position:absolute;inset:0;background:linear-gradient(to left,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.85) 100%)"></div>
        </div>
        <!-- Central fade line -->
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 8% 100% at 50% 50%,rgba(0,0,0,0.95) 0%,transparent 100%)"></div>
        <!-- Global dark vignette -->
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.45)"></div>
      </div>`;

    // Player portrait
    const playerPortrait = `
      <div style="width:3.8rem;height:3.8rem;border-radius:50%;border:2px solid rgba(74,222,128,0.5);overflow:hidden;display:flex;align-items:center;justify-content:center;background:rgba(74,222,128,0.06);flex-shrink:0">
        <img id="vs-portrait-player" src="${playerPortraitSrc}" alt="${charFirstName}"
          style="width:100%;height:100%;object-fit:cover"
          onerror="this.style.display='none';document.getElementById('vs-portrait-player-fb').style.display='flex'">
        <span id="vs-portrait-player-fb" style="display:none;font-size:2rem">${charFallbackIcon}</span>
      </div>`;

    const overlay = document.createElement('div');
    overlay.id = 'pre-battle-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:680;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;backdrop-filter:blur(6px);font-family:Cinzel,serif;';
    overlay.innerHTML = `
      <div style="position:relative;width:92%;max-width:460px;padding:1.75rem;background:#0d0208;border:1px solid rgba(201,168,76,0.4);border-radius:6px;overflow:hidden;">
        ${splitBg}
        <div style="position:relative;z-index:1">
        <div style="text-align:center;margin-bottom:1.2rem">
          <div style="font-family:'Cinzel Decorative',serif;font-size:0.85rem;color:#c9a84c;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:0.6rem">⚔ Scontro Imminente</div>
          <div style="display:flex;align-items:center;justify-content:center;gap:1.5rem;margin-bottom:0.8rem">
            <div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:0.2rem">
              ${playerPortrait}
              <div style="font-size:0.65rem;color:#4ade80;letter-spacing:0.08em;margin-top:0.2rem">${charFirstName}</div>
              <div style="font-size:1rem;color:#4ade80;font-weight:700;margin-top:0.15rem">${Math.round(playerForce)}</div>
            </div>
            <div style="font-family:'Cinzel Decorative',serif;font-size:1.8rem;color:#c9a84c">VS</div>
            <div style="text-align:center">
              <div style="font-size:2.8rem;display:flex;align-items:center;justify-content:center;height:3.2rem">${houseIcon(h,'2.8rem')}</div>
              <div style="font-size:0.65rem;color:#f87171;letter-spacing:0.08em;margin-top:0.2rem">Casa ${h.name}</div>
              <div style="font-size:1rem;color:#f87171;font-weight:700;margin-top:0.15rem">${Math.round(enemyForce)}</div>
            </div>
          </div>
          <div style="height:8px;border-radius:4px;overflow:hidden;background:rgba(255,255,255,0.05);display:flex;margin-bottom:0.4rem">
            <div style="width:${Math.round(playerForce/(playerForce+enemyForce)*100)}%;background:linear-gradient(90deg,#166534,#4ade80);transition:width 0.6s ease"></div>
            <div style="flex:1;background:linear-gradient(90deg,#991b1b,#f87171)"></div>
          </div>
          <div style="font-size:0.75rem;color:${winColor};letter-spacing:0.05em">Probabilità vittoria: <strong>${winPct}%</strong></div>
        </div>

        ${allyContribs ? `
        <div style="background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.2);border-radius:4px;padding:0.6rem 0.75rem;margin-bottom:0.75rem">
          <div style="font-size:0.65rem;color:#4ade80;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.35rem">🤝 Casate alleate</div>
          ${allyContribs}
        </div>` : ''}

        ${enemySupporters ? `
        <div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);border-radius:4px;padding:0.6rem 0.75rem;margin-bottom:0.75rem">
          <div style="font-size:0.65rem;color:#f87171;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.35rem">⚔ Supporto nemico (stimato)</div>
          ${enemySupporters}
        </div>` : ''}

        <div style="display:flex;gap:0.75rem;margin-top:0.5rem">
          <button onclick="document.getElementById('pre-battle-overlay').remove();Game._startHouseBattleFromOverlay('${houseId}',${playerInitiated})"
            style="flex:2;padding:0.8rem;background:linear-gradient(135deg,#7f1d1d,#dc2626);border:none;border-radius:3px;font-family:'Cinzel',serif;font-size:0.78rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#fff">
            ⚔ ${playerInitiated ? 'Attacca!' : 'Combatti!'}
          </button>
          ${playerInitiated ? `<button onclick="document.getElementById('pre-battle-overlay').remove();Game._cancelFromPreBattle('${houseId}')"
            style="flex:1;padding:0.8rem;background:transparent;border:1px solid rgba(201,168,76,0.4);border-radius:3px;font-family:'Cinzel',serif;font-size:0.75rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;color:#c9a84c">
            🏃 Ritirati
          </button>` : ''}
        </div>
        ${playerInitiated ? `<div style="text-align:center;margin-top:0.5rem;font-family:'EB Garamond',serif;font-size:0.75rem;color:#6b5e4a;font-style:italic">
          Ritirarsi ora costerà Potere e renderà Casa ${h.name} diffidente
        </div>` : ''}
        </div><!-- /z-index wrapper -->
      </div>`;
    document.body.appendChild(overlay);
  }

  function triggerHouseBattle(houseId, playerInitiated) {
    const h = state.houses[houseId];
    if (!h) return;

    // Note: _revealEnemyAlliances already called in showPreBattleOverlay
    // so warAllianceBonus is already set before we get here

    // Calculate forces
    const loanedArmy = state.loanedArmy || 0;
    let playerForce = state.resources.army + loanedArmy;
    let enemyForce = h.army;

    // Enemy gets support from other enemy houses (base 20% each)
    const enemyBonus = Object.entries(state.houses)
      .filter(([id, hh]) => id !== houseId && hh.status === 'enemy' && !hh.suppressed)
      .reduce((s, [, hh]) => s + hh.army * 0.2, 0);
    // Plus the pre-revealed alliance bonus from war declaration
    const allianceBonus = (state.warAllianceBonus || {})[houseId] || 0;
    enemyForce += enemyBonus + allianceBonus;
    if (state.warAllianceBonus) delete state.warAllianceBonus[houseId];
    if (state.warAllianceSupporters) delete state.warAllianceSupporters[houseId];

    let desertNote = '';

    // Set retreat handler for this specific house battle
    Game._battleRetreatFinish = function(survived) {
      // Subtract loaned troops before saving own survivors
      const ownSurvivedHouseRetreat = Math.max(1, survived - (state.loanedArmy || 0));
      returnLoanedArmies();
      state.pendingWarTarget = null;
      const armyLost = Math.max(0, state.resources.army - ownSurvivedHouseRetreat);
      state.resources.army = ownSurvivedHouseRetreat;
      h.status = 'enemy';
      h.attackedByPlayer = true;

      // Casate neutrali — diventano diffidenti (non nemiche) per la vigliaccheria della ritirata
      const becameDiffidente = [];
      const stayedNeutral    = [];
      const becameAlly       = [];
      Object.entries(state.houses).forEach(([id, nh]) => {
        if (nh.status !== 'neutral' || nh.suppressed || id === houseId) return;
        const roll = Math.random();
        if (roll < 0.35) {
          // Diventano diffidenti — non ti attaccano ma non si fidano
          nh.status = 'diffidente';
          const pardonCost = 10 + Math.floor(Math.random() * 6);
          if (!state.diffidentePardonCost) state.diffidentePardonCost = {};
          state.diffidentePardonCost[id] = pardonCost;
          becameDiffidente.push({ icon: nh.icon, name: nh.name, cost: pardonCost });
        } else if (roll < 0.45) {
          // Rara: diventano alleate (rispettano la sopravvivenza)
          nh.status = 'ally';
          becameAlly.push({ icon: nh.icon, name: nh.name });
        } else {
          stayedNeutral.push({ icon: nh.icon, name: nh.name });
        }
      });

      updateHUD(); saveGame(); checkGameOver();
      if (state.gameOver) return;

      // Mostra popup riepilogo post-ritirata
      _showRetreatSummaryPopup(h, survived, armyLost, becameDiffidente, becameAlly);
    };

    const _charId = state.character?.id || '';
    const _houseBgConfig = {
      playerSrc:    `images/characters/${_charId}.png`,
      playerBgSrc:  `images/characters/${_charId}_bg.png`,
      enemySrc:     h.crest || '',
      enemyBgSrc:   `images/houses/${houseId}_bg.png`,
    };
    showBattleAnimation(playerForce, enemyForce, (won, survived, enemySurvived) => {
      _resolveHouseBattle(houseId, h, won, survived, enemySurvived, playerForce, enemyForce, desertNote, playerInitiated);
    }, playerInitiated, _houseBgConfig);
  }

  function _resolveHouseBattle(houseId, h, won, survived, enemySurvived, playerForce, enemyForce, desertNote, playerInitiated) {
    const margin = Math.abs(playerForce - enemyForce);

    state.pendingWarTarget = null;

    // ── Civil war faction drift: after each battle, allies with high betrayal may switch ──
    if (state.civilWar) {
      Object.entries(state.houses).forEach(([hId, nh]) => {
        if (hId === houseId || nh.suppressed || nh.status !== 'ally') return;
        const betrayal = Math.max(0, (nh.betrayalChance || 0) - (nh.betrayalReduction || 0));
        // Each battle has a small chance proportional to betrayal% to switch sides
        const switchChance = (betrayal / 100) * 0.08; // max 8% per battle even at 100% betrayal
        if (Math.random() < switchChance) {
          nh.status = 'enemy';
          setTimeout(() => showModal(
            '💔 Cambio di Fazione',
            `${nh.icon} <strong>Casa ${nh.name}</strong> ha abbandonato la vostra causa durante la guerra civile e si è schierata con il Re.`,
            '⚔', 'Capito', () => { updateHUD(); saveGame(); }
          ), 800);
        }
      });
    }

    if (won) {
      // ── CONQUEST ──
      // Bottino ricalibrato: la guerra logora — premi moderati, nuovi problemi aperti
      const diff = state.character?.difficulty || 'medium';
      const diffMult = { easy: 1.15, medium: 1.0, hard: 0.85 }[diff] || 1.0;
      const conquestCount = (state.conquests || 0); // numero conquiste PRIMA di questa

      // Rendimento decrescente: ogni conquista aggiuntiva rende meno
      const decayFactor = Math.max(0.5, 1 - conquestCount * 0.15);

      // Oro: bottino proporzionale ma cappato — la guerra non fa ricchi
      const bonusGold = Math.round(Math.min(15, Math.floor(h.army * 0.12 + 5)) * diffMult * decayFactor);

      // Esercito: i superstiti restano, ma aggiungiamo solo una quota modesta di reintegro
      // (non 50% dell'esercito nemico — quello era il bottino eccessivo)
      const bonusArmy = Math.round(Math.min(12, Math.floor(h.army * 0.10)) * diffMult * decayFactor);

      // Popolo: la guerra devasta — costo fisso
      const bonusPeople = -6;

      // Potere: vittoria militare dà prestigio, ma meno di prima
      const bonusPower = Math.round((8 + Math.random() * 4) * diffMult * decayFactor);

      // Fede: invariata, piccola
      const bonusFaith = 3;

      // ── NESSUN aumento del cap — il cap rimane 100 (o valore corrente senza conquiste) ──
      // Rimuoviamo state.conquests++ qui — lo usiamo solo per tracciare guarnigioni
      state.conquests = conquestCount + 1;
      // NON chiamiamo getResourceCap() con +100 — cap rimane invariato
      const cap = 100; // cap fisso

      // Survived includes loaned troops — subtract them before crediting player's own army
      const ownSurvived = Math.max(1, survived - (state.loanedArmy || 0));
      returnLoanedArmies();

      // Esercito: superstiti + piccolo reintegro, ma cappato a 75 massimo post-battaglia
      // (il giocatore deve essere in forma ma non inarrestabile)
      state.resources.army   = Math.min(75, Math.min(cap, ownSurvived + bonusArmy));
      state.resources.gold   = Math.min(cap - 1, state.resources.gold   + bonusGold);
      state.resources.people = Math.max(1, Math.min(cap - 1, state.resources.people + bonusPeople));
      state.resources.power  = Math.min(cap - 1, state.resources.power  + bonusPower);
      state.resources.faith  = Math.min(cap - 1, state.resources.faith  + bonusFaith);

      // ── EFFETTO PAURA sulle casate neutrali ──
      // Le casate osservano la conquista e si spaventano — alcune diventano diffidenti
      const kingHouseId = state.kingHouseAffiliation;
      let fearCount = 0;
      Object.entries(state.houses).forEach(([id, nh]) => {
        if (id === houseId || id === kingHouseId || nh.suppressed || nh.status !== 'neutral') return;
        // 30% chance per casata neutrale di diventare diffidente dopo ogni conquista
        const fearChance = 0.30 + conquestCount * 0.10; // cresce con le conquiste
        if (Math.random() < Math.min(0.65, fearChance)) {
          nh.status = 'diffidente';
          if (!state.diffidentePardonCost) state.diffidentePardonCost = {};
          state.diffidentePardonCost[id] = Math.round(15 + nh.army * 0.2);
          fearCount++;
        }
      });
      if (fearCount > 0) {
        setTimeout(() => showToast(`😨 ${fearCount} ${fearCount===1?'casata si è fatta diffidente':'casate si sono fatte diffidenti'} dopo la conquista — ti temono, non ti amano.`, 'warn'), 800);
      }

      // ── REGISTRA GUARNIGIONE ──
      // Ogni casata conquistata costerà oro ogni 5 turni (vedi drawNextCard)
      if (!state.garrisons) state.garrisons = {};
      state.garrisons[houseId] = { name: h.name, icon: h.icon, costPerCycle: 4 };

      // Suppress house — army to 0
      h.status = 'suppressed';
      h.suppressed = true;
      h.army = 0;

      state.decisionHistory.push({ turn: state.turn, cardId: 'house_conquest', choice: 'war', tags: ['war_victory', 'war_choice', 'conquest'], target: houseId });

      state._skipGameOverThisTurn = true;
      showHouseBattleResult(true, h, bonusGold, bonusArmy, bonusPeople, bonusPower, cap, desertNote, survived, fearCount);

    } else {
      // ── SCONFITTA ──
      // Subtract loaned troops before saving survivors (they return to allies)
      const ownSurvivedDefeat = Math.max(1, survived - (state.loanedArmy || 0));
      returnLoanedArmies();
      state.resources.army = ownSurvivedDefeat;
      // La casata nemica ha subito perdite — aggiorna il suo esercito
      if (typeof enemySurvived === 'number' && enemySurvived >= 0) {
        h.army = Math.max(1, enemySurvived);
      }

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

  function showHouseBattleResult(won, h, bonusGold, bonusArmy, bonusPeople, bonusPower, cap, desertNote, survived, fearCount) {
    const overlay = document.createElement('div');
    overlay.className = 'war-overlay';
    const garrisonCost = (state.garrisons || {})[Object.keys(state.houses).find(id => state.houses[id] === h)] || { costPerCycle: 4 };
    overlay.innerHTML = `
      <div class="war-title" style="color:#c9a84c">🏰 CASA ${h.name.toUpperCase()} CONQUISTATA</div>
      <div class="war-log">
        <p class="war-result war-victory">🏆 VITTORIA!</p>
        ${desertNote ? `<p style="color:#f87171;font-size:0.85rem">${desertNote}</p>` : ''}
        <p style="margin-top:0.5rem">Casa ${h.name} è stata soppressa. Le sue terre sono ora vostre — ma mantenerle ha un costo.</p>
        ${survived != null ? `<p style="color:#4ade80;font-size:0.85rem">⚔ Superstiti del tuo esercito: ${survived}</p>` : ''}
        <div style="margin-top:0.75rem;padding:0.65rem;background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:4px;font-family:'EB Garamond',serif;font-size:0.9rem;line-height:1.8">
          <div style="font-family:'Cinzel',serif;font-size:0.7rem;letter-spacing:0.1em;color:#c9a84c;margin-bottom:0.4rem">BOTTINO DI GUERRA</div>
          <div style="color:#4ade80">💰 +${bonusGold} Oro (saccheggio)</div>
          <div style="color:#4ade80">⚔ +${bonusArmy} Reintegro truppe</div>
          <div style="color:#f87171">👥 ${bonusPeople} Popolo (la guerra logora)</div>
          <div style="color:#4ade80">👑 +${bonusPower} Potere</div>
          <div style="color:#4ade80">⛪ +3 Fede</div>
        </div>
        <div style="margin-top:0.65rem;padding:0.5rem 0.65rem;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.25);border-radius:4px;font-family:'EB Garamond',serif;font-size:0.85rem;line-height:1.6">
          <div style="font-family:'Cinzel',serif;font-size:0.68rem;letter-spacing:0.1em;color:#f87171;margin-bottom:0.3rem">⚠ COSTI RICORRENTI</div>
          <div style="color:#fca5a5">🏰 Guarnigione Casa ${h.name}: <strong>-4 oro ogni 5 turni</strong></div>
          ${fearCount > 0 ? `<div style="color:#fbbf24;margin-top:0.3rem">😨 ${fearCount} ${fearCount===1?'casata':'casate'} ora ti temono — diplomaticamente più costoso</div>` : ''}
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
      // Rotazione proporzionale allo spostamento — max ±18deg come Reigns
      const drag = currentX * 0.88;
      const rot  = Math.max(-18, Math.min(18, currentX * 0.07));
      card.style.transition = 'none';
      card.style.transform = `translateX(${drag}px) rotate(${rot}deg)`;

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
        // Rimbalzo elastico al centro
        card.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease';
        card.style.transform = 'translateX(0) rotate(0deg)';
        card.style.opacity = '1';
        setTimeout(() => { card.style.transition = ''; }, 350);
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

  // ══════════════════════════════════════════════
  // TUTORIAL SYSTEM
  // ══════════════════════════════════════════════

  let _tutorialActive = false;

  function _injectTutorialButton() {
    if (document.getElementById('btn-tutorial')) return;
    const splash = document.getElementById('screen-splash');
    if (!splash) return;
    const btn = document.createElement('button');
    btn.id = 'btn-tutorial';
    btn.className = 'btn-secondary';
    btn.textContent = '📖 Tutorial';
    btn.style.cssText = 'margin-top:0.5rem;border-color:rgba(201,168,76,0.5);color:#c9a84c;';
    btn.addEventListener('click', startTutorial);
    // Insert after the load button
    const content = splash.querySelector('.splash-content');
    if (content) content.appendChild(btn);
  }

  function startTutorial() {
    _tutorialActive = true;
    // Go to char select with tutorial popup
    showScreen('screen-char-select');
    _buildCharGrid();
    setTimeout(() => _tutStep_charSelect(), 350);
  }

  function _buildCharGrid() {
    // same as showCharacterSelect inner logic
    const grid = document.getElementById('char-grid');
    if (!grid || grid.children.length > 0) return;
    CHARACTERS.forEach(c => {
      const card = document.createElement('div');
      card.className = 'char-card';
      const diffLabel = c.difficulty === 'easy' ? 'Facile' : c.difficulty === 'medium' ? 'Medio' : 'Difficile';
      card.innerHTML = `
        <span class="char-card-icon">${c.icon}</span>
        <span class="char-card-name">${c.name}</span>
        <span class="char-card-house">${c.house}</span>
        <span class="char-card-diff diff-${c.difficulty}">${diffLabel}</span>`;
      card.addEventListener('click', () => showCharacterDetail(c.id));
      grid.appendChild(card);
    });
  }

  // ── Tutorial step helpers ──

  function _tutPopup(anchorId, text, arrowDir, onNext, nextLabel) {
    _clearTutOverlay();
    if (!document.getElementById('tut-style')) {
      const s = document.createElement('style');
      s.id = 'tut-style';
      s.textContent = `
        #tut-overlay { pointer-events:none; position:fixed; inset:0; z-index:900; }
        .tut-popup {
          pointer-events:all;
          position:absolute;
          background:linear-gradient(135deg,#1a1508,#12100a);
          border:2px solid #c9a84c;
          border-radius:8px;
          padding:1rem 1.1rem;
          max-width:280px;
          font-family:'Cinzel',serif;
          box-shadow:0 8px 40px rgba(0,0,0,0.9),0 0 0 1px rgba(201,168,76,0.2);
          animation:tut-pop 0.3s cubic-bezier(0.34,1.26,0.64,1);
        }
        @keyframes tut-pop { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        .tut-arrow {
          position:absolute;
          font-size:2.2rem;
          animation:tut-bounce 0.7s ease-in-out infinite alternate;
          filter:drop-shadow(0 0 8px #c9a84c);
          pointer-events:none;
        }
        @keyframes tut-bounce {
          from{transform:translateX(0) translateY(0)}
          to{transform:translateX(var(--tx,0)) translateY(var(--ty,0))}
        }
        .tut-dim { position:absolute; inset:0; background:rgba(0,0,0,0.55); pointer-events:none; }
        .tut-highlight {
          position:absolute;
          border-radius:6px;
          box-shadow:0 0 0 3px #c9a84c, 0 0 0 6000px rgba(0,0,0,0.55);
          pointer-events:none;
          transition:all 0.3s;
        }
      `;
      document.head.appendChild(s);
    }

    const overlay = document.createElement('div');
    overlay.id = 'tut-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:900;pointer-events:none;';
    document.body.appendChild(overlay);

    // Defer positioning to after browser layout — popup starts invisible
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        _positionTutPopup(overlay, anchorId, text, arrowDir, nextLabel);
      });
    });

    Game._tutNext = onNext || _clearTutOverlay;
  }

  function _positionTutPopup(overlay, anchorId, text, arrowDir, nextLabel) {
    const btnHtml = nextLabel !== null
      ? `<button onclick="Game._tutNext()" style="width:100%;padding:0.5rem;background:linear-gradient(135deg,#78350f,#c9a84c);border:none;border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#0a0a0f">${nextLabel||'Capito →'}</button>`
      : '';
    const innerHtml = `
      <div style="font-size:0.7rem;color:#fbbf24;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.4rem">📖 Tutorial</div>
      <div style="font-family:'EB Garamond',serif;font-size:0.95rem;color:#e8dcc8;line-height:1.55;margin-bottom:${btnHtml?'0.75rem':'0'}">${text}</div>
      ${btnHtml}`;

    if (anchorId) {
      const anchor = document.getElementById(anchorId) || document.querySelector(anchorId);
      if (anchor) {
        const r = anchor.getBoundingClientRect();

        // Highlight
        const hl = document.createElement('div');
        hl.className = 'tut-highlight';
        hl.style.cssText = `top:${r.top + window.scrollY - 4}px;left:${r.left - 4}px;width:${r.width + 8}px;height:${r.height + 8}px;`;
        overlay.appendChild(hl);

        // Arrow
        const dirs = {
          up:    { text:'⬇', tx:'0px', ty:'-8px', top: r.top - 52,  left: r.left + r.width/2 - 18 },
          down:  { text:'⬆', tx:'0px', ty: '8px', top: r.bottom+10, left: r.left + r.width/2 - 18 },
          left:  { text:'➡', tx:'-8px',ty:'0px',  top: r.top + r.height/2 - 18, left: r.left - 55 },
          right: { text:'⬅', tx: '8px',ty:'0px',  top: r.top + r.height/2 - 18, left: r.right + 10 },
        };
        const d = dirs[arrowDir] || dirs.down;
        const arrow = document.createElement('div');
        arrow.className = 'tut-arrow';
        arrow.textContent = d.text;
        arrow.style.cssText = `top:${d.top + window.scrollY}px;left:${d.left}px;--tx:${d.tx};--ty:${d.ty};color:#fbbf24;`;
        overlay.appendChild(arrow);

        // Build popup off-screen to measure real height
        const popup = document.createElement('div');
        popup.className = 'tut-popup';
        popup.style.cssText = 'visibility:hidden;top:-9999px;left:-9999px;max-width:280px;';
        popup.innerHTML = innerHtml;
        overlay.appendChild(popup);

        // Measure then position in one frame — no jump
        const pH = popup.offsetHeight;
        const pW = popup.offsetWidth;
        const vw = window.innerWidth, vh = window.innerHeight;

        let top = arrowDir === 'up'   ? r.top - pH - 16 :
                  arrowDir === 'down'  ? r.bottom + 60   :
                  r.top - 20;
        let left = r.left + r.width / 2 - pW / 2;

        // Clamp to viewport
        top  = Math.max(8, Math.min(vh - pH - 8, top));
        left = Math.max(8, Math.min(vw - pW - 8, left));

        popup.style.cssText = `top:${top + window.scrollY}px;left:${left}px;max-width:280px;visibility:visible;`;
        return;
      }
    }

    // Centered popup with dim
    const dim = document.createElement('div');
    dim.className = 'tut-dim';
    overlay.appendChild(dim);
    const popup = document.createElement('div');
    popup.className = 'tut-popup';
    popup.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);max-width:320px;width:90%;';
    popup.innerHTML = innerHtml;
    overlay.appendChild(popup);
  }

  function _clearTutOverlay() {
    const el = document.getElementById('tut-overlay');
    if (el) el.remove();
  }

  // ── Tutorial steps ──

  function _tutStep_charSelect() {
    _tutPopup(
      'char-grid',
      'Scegli il tuo personaggio. Ogni eroe ha risorse di partenza, alleati, nemici e un obiettivo unico da raggiungere per vincere.',
      'up',
      () => {
        _clearTutOverlay();
        _tutorialPendingStep = 'char_detail';
      },
      'Scegli un personaggio →'
    );
  }

  let _tutorialPendingStep = null;

  // Called by showCharacterDetail when tutorial is active
  function _tutOnCharDetail() {
    if (!_tutorialActive || _tutorialPendingStep !== 'char_detail') return;
    _tutorialPendingStep = null;
    setTimeout(() => {
      _tutPopup(
        'char-detail-start',
        'Qui vedi tutto sul tuo personaggio: obiettivo, risorse iniziali, alleati e nemici di partenza. Premi <strong>"Inizia la partita"</strong> quando sei pronto!',
        'up',
        () => {
          _clearTutOverlay();
          _tutorialPendingStep = 'prologue';
        },
        'Ho capito, inizio!'
      );
    }, 400);
  }

  function _tutStep_prologue() {
    _tutPopup(
      null,
      'Questo è il <strong>Prologo</strong>: descrive il mondo in cui giochi, chi è il Re regnante e quali casate ti sono amiche o nemiche. Leggilo con attenzione — contiene informazioni utili!',
      null,
      () => {
        _clearTutOverlay();
        _tutorialPendingStep = 'game_start';
      },
      'Leggo il prologo →'
    );
  }

  // Steps shown during the actual game — called from startGame
  let _tutGameSteps = [];
  let _tutGameIdx   = 0;

  // ── Tutorial input blocker ──
  function _tutBlock(allowIds) {
    document.getElementById('tut-blocker')?.remove();
    const ids = Array.isArray(allowIds) ? allowIds : (allowIds ? [allowIds] : []);

    const blocker = document.createElement('div');
    blocker.id = 'tut-blocker';
    blocker.style.cssText = 'position:fixed;inset:0;z-index:899;';

    const handler = (e) => {
      // Always allow clicks inside tut-overlay (Capito button, etc.)
      if (e.target.closest('#tut-overlay')) return;
      // Allow clicks on explicitly allowed elements
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && (el === e.target || el.contains(e.target))) return;
      }
      e.stopPropagation();
      e.preventDefault();
      _tutShakePopup();
    };

    blocker.addEventListener('click',      handler, true);
    blocker.addEventListener('touchstart', handler, { capture: true, passive: false });
    blocker.style.pointerEvents = 'all';
    document.body.appendChild(blocker);
  }

  function _tutShakePopup() {
    const popup = document.querySelector('.tut-popup');
    if (!popup) return;
    if (!document.getElementById('tut-shake-style')) {
      const s = document.createElement('style');
      s.id = 'tut-shake-style';
      s.textContent = '@keyframes tut-shake{0%,100%{transform:translateX(-50%) translateY(0)}25%{transform:translateX(calc(-50% - 6px))}75%{transform:translateX(calc(-50% + 6px))}}' +
        '.tut-popup.centered-shake{animation:tut-shake 0.3s ease!important}';
      document.head.appendChild(s);
    }
    popup.style.animation = 'none';
    void popup.offsetWidth;
    popup.style.animation = 'tut-shake 0.3s ease';
  }

  function _tutUnblock() { document.getElementById('tut-blocker')?.remove(); }

  function _tutPulse(...ids) {
    if (!document.getElementById('tut-diplo-style')) {
      const s = document.createElement('style');
      s.id = 'tut-diplo-style';
      s.textContent = '@keyframes tut-pulse-diplo{0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,0.8)}50%{box-shadow:0 0 0 10px rgba(201,168,76,0)}}';
      document.head.appendChild(s);
    }
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.style.animation = 'tut-pulse-diplo 0.9s ease-in-out infinite'; });
  }

  function _tutUnpulse(...ids) { ids.forEach(id => { const el = document.getElementById(id); if (el) el.style.animation = ''; }); }

  function _tutStep_game() {
    _tutGameSteps = [

      // 0 — Risorse
      () => _tutPopup(null,
        '🎯 <strong>Le tue risorse</strong> sono i 5 cerchi colorati in cima allo schermo.<br>💰 Oro · ✝ Fede · 👥 Popolo · ⚔ Esercito · 👑 Potere.<br><strong style="color:#f87171">Attenzione:</strong> se una tocca 0 <em>o</em> 100 — è game over!',
        null, _tutGameNext, 'Capito →'),

      // 1 — Carta
      () => _tutPopup('main-card',
        '🃏 <strong>Le carte</strong> arrivano ogni turno. Mostrano eventi, richieste di casate o decreti del Re.<br>Passa sopra i pulsanti per vedere come cambiano le risorse <em>prima</em> di scegliere.',
        'up', _tutGameNext, 'Capito →'),

      // 2 — Scelta
      () => {
        _tutPulse('btn-left', 'btn-right');
        const preview = document.getElementById('card-effects-preview');
        if (preview) {
          preview.innerHTML = `<div id="tut-choice-hint" style="pointer-events:none;text-align:center;padding:0.5rem 0.75rem;background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.4);border-radius:6px;font-family:'Cinzel',serif;font-size:0.68rem;color:#c9a84c;letter-spacing:0.06em;line-height:1.5">
            📖 TUTORIAL — <span style="font-family:'EB Garamond',serif;font-size:0.85rem;color:#e8dcc8">◄► <strong>Fai una scelta!</strong> Premi un pulsante o swipa la carta.</span>
          </div>`;
        }
        _tutorialPendingStep = 'wait_choice';
      },

      // 3 — Badge colori carte
      () => _tutPopup(null,
        '🎨 <strong>Carte colorate</strong> — riconoscile subito:<br>🔴 Rosso = pericolo/attacco · 🟡 Oro = Decreto del Re · 🟢 Verde = richiesta alleato · 🟣 Viola = complotto · 🟠 Arancione = guerra in preparazione',
        null, _tutGameNext, 'Capito →'),

      // 4 — Obiettivo
      () => _tutPopup('objective-bar',
        '📜 <strong>Obiettivo personaggio</strong>: mostrato in basso. Ogni personaggio ha una missione unica.<br>Raggiungerla è <em>uno dei modi per vincere</em> — ma non l\'unico.',
        'up', _tutGameNext, 'Capito →'),

      // 5 — Diplomazia
      () => {
        _tutPulse('btn-diplo');
        _tutPopup('btn-diplo',
          '⚔ <strong>Apri la Diplomazia!</strong> Premi il pulsante evidenziato qui sopra.<br><span style="color:#fbbf24">Il tutorial continuerà quando apri il pannello.</span>',
          'up', null, null);
        _tutorialPendingStep = 'wait_diplo';
      },

      // 6 — Casate
      () => {
        const panel = document.getElementById('diplomacy-panel');
        if (panel && !panel.classList.contains('hidden')) panel.classList.add('hidden');
        _tutPopup(null,
          '🏰 <strong>Le casate</strong> nel pannello:<br>🟢 Tuoi alleati · 🔴 Nemici · 🟣 Casa Regnante · 🟡 Fedeli al Re · 🟠 Diffidenti<br><br>Clicca una casata per vedere tutte le azioni: alleanza, guerra, spie, tributi.',
          null, _tutGameNext, 'Capito →');
      },

      // 7 — Spie
      () => _tutPopup(null,
        '🕷 <strong>Spie di Varys</strong>: clicca una casata → "Invia spia".<br>• 💰12 = info vaga · 💰18 = % precisa di tradimento<br><strong style="color:#fb923c">Rischio:</strong> la spia può essere scoperta — la casata diventa diffidente o nemica!',
        null, _tutGameNext, 'Capito →'),

      // 8 — Sfidare il Re
      () => _tutPopup(null,
        '⚔ <strong>Sfidare il Re</strong> — serve:<br>1. Esercito <strong>&gt;80</strong><br>2. Almeno <strong>2 alleati</strong><br>3. Diplomazia → Casa Regnante → "Sfida il Re"<br><br>Prima della battaglia puoi chiedere rinforzi agli alleati.',
        null, _tutGameNext, 'Capito →'),

      // 9 — Finale
      () => _tutPopup(null,
        '👑 <strong>Come vincere</strong>:<br>1. Raggiungi l\'obiettivo del personaggio<br>2. Conquista il trono e ottieni la fedeltà di <em>tutte</em> le casate vive<br><br><div style="margin-top:0.75rem;padding:0.6rem 0.75rem;background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.35);border-radius:4px;font-style:italic;color:#c9a84c;font-family:\'EB Garamond\',serif;font-size:1rem;line-height:1.5">«Bene — ora che sai le regole, decidi il tuo destino.<br>E ricorda: nel gioco del trono, o vinci o muori.»</div>',
        null,
        () => { _clearTutOverlay(); _tutorialActive = false; _tutorialPendingStep = null; },
        '⚔ Inizia la tua storia'),
    ];
    _tutGameIdx = 0;
    _tutGameSteps[0]();
  }

  function _tutGameNext() {
    _tutUnblock(); _clearTutOverlay();
    _tutGameIdx++;
    if (_tutGameIdx < _tutGameSteps.length) {
      setTimeout(() => _tutGameSteps[_tutGameIdx](), 280);
    } else {
      _tutorialActive = false; _tutorialPendingStep = null;
    }
  }

  function _tutOnChoice() {
    if (!_tutorialActive || _tutorialPendingStep !== 'wait_choice') return;
    _tutorialPendingStep = null;
    _tutUnblock(); _tutUnpulse('btn-left','btn-right'); _clearTutOverlay();
    // Clear the inline hint
    const hint = document.getElementById('tut-choice-hint');
    if (hint) hint.remove();
    setTimeout(_tutGameNext, 400);
  }

  function _tutOnDiplo() {
    if (!_tutorialActive || _tutorialPendingStep !== 'wait_diplo') return;
    _tutorialPendingStep = null;
    _tutUnblock(); _tutUnpulse('btn-diplo'); _clearTutOverlay();
    setTimeout(_tutGameNext, 500);
  }

  // Called from startGame to trigger game tutorial steps
  function _maybeTutGame() {
    if (!_tutorialActive) return;
    if (_tutorialPendingStep === 'game_start') {
      _tutorialPendingStep = null;
      setTimeout(_tutStep_game, 800);
    }
  }

  // ══════════════════════════════════════════════
  // CUSTOM CHARACTER SYSTEM — "Crea il Tuo Destino"
  // ══════════════════════════════════════════════
  function showCustomCharScreen() {
    const existing = document.getElementById('custom-char-screen');
    if (existing) existing.remove();

    if (!document.getElementById('custom-char-style')) {
      const s = document.createElement('style');
      s.id = 'custom-char-style';
      s.textContent = `
        #custom-char-screen {
          position:fixed;inset:0;background:#0a0a0f;z-index:300;
          display:flex;flex-direction:column;align-items:center;
          overflow-y:auto;padding:1.5rem 1rem 2rem;
          animation:fadeIn 0.3s ease;
        }
        .ccs-title { font-family:'Cinzel Decorative',serif;font-size:1.1rem;color:#c084fc;margin-bottom:0.25rem;text-align:center; }
        .ccs-sub   { font-family:'EB Garamond',serif;font-size:0.85rem;color:#9a8a6a;margin-bottom:1.5rem;text-align:center;font-style:italic; }
        .ccs-section { font-family:'Cinzel',serif;font-size:0.65rem;color:#6b5e4a;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.5rem;width:100%;max-width:420px; }
        .ccs-input {
          width:100%;max-width:420px;padding:0.7rem 0.9rem;
          background:#12121a;border:1px solid rgba(201,168,76,0.3);
          border-radius:4px;font-family:'Cinzel',serif;font-size:0.88rem;
          color:#e8dcc8;outline:none;margin-bottom:1rem;box-sizing:border-box;
        }
        .ccs-input:focus { border-color:rgba(201,168,76,0.7); }
        .ccs-origin-btn {
          width:100%;max-width:420px;padding:0.75rem 1rem;
          background:#12121a;border:1px solid rgba(201,168,76,0.2);
          border-radius:5px;cursor:pointer;transition:all 0.2s;
          font-family:'Cinzel',serif;font-size:0.78rem;color:#e8dcc8;
          text-align:left;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.8rem;
        }
        .ccs-origin-btn:hover,.ccs-origin-btn.selected { border-color:rgba(192,132,252,0.7);background:rgba(192,132,252,0.08); }
        .ccs-origin-btn.selected { border-color:#c084fc; }
        .ccs-house-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:0.4rem;width:100%;max-width:420px;margin-bottom:1rem; }
        .ccs-house-btn {
          padding:0.55rem 0.5rem;background:#12121a;border:1px solid rgba(201,168,76,0.2);
          border-radius:4px;cursor:pointer;font-family:'Cinzel',serif;font-size:0.72rem;
          color:#e8dcc8;transition:all 0.2s;display:flex;align-items:center;gap:0.4rem;
        }
        .ccs-house-btn:hover,.ccs-house-btn.selected { border-color:#c084fc;background:rgba(192,132,252,0.08); }
        .ccs-emoji-grid { display:flex;flex-wrap:wrap;gap:0.4rem;width:100%;max-width:420px;margin-bottom:1rem; }
        .ccs-emoji-btn {
          width:42px;height:42px;font-size:1.4rem;background:#12121a;
          border:1px solid rgba(201,168,76,0.2);border-radius:5px;cursor:pointer;
          transition:all 0.2s;display:flex;align-items:center;justify-content:center;
        }
        .ccs-emoji-btn:hover,.ccs-emoji-btn.selected { border-color:#c084fc;background:rgba(192,132,252,0.1);transform:scale(1.1); }
        #ccs-start-btn {
          width:100%;max-width:420px;padding:0.85rem;margin-top:1rem;
          background:linear-gradient(135deg,#4c1d95,#7c3aed);
          border:none;border-radius:4px;font-family:'Cinzel Decorative',serif;
          font-size:0.85rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;
          cursor:pointer;color:#fff;opacity:0.4;transition:opacity 0.2s;
        }
        #ccs-start-btn.ready { opacity:1; }
      `;
      document.head.appendChild(s);
    }

    const AVAILABLE_EMOJIS = ['🐴','🦅','🐻','🐯','🦊','🐗','🦋','🐬','🦁','🌊','🌙','⚡','🔥','❄️','🌿','💎','🗡️','🛡️','🏹','⚓','🌺','🍄','🦂','🐲'];
    const USED_EMOJIS = new Set(HOUSES_DEF.map(h => h.icon).concat(['🐺','🦁','🌹','🦌','🐟','☀️','🐙','🌉']));
    const freeEmojis = AVAILABLE_EMOJIS.filter(e => !USED_EMOJIS.has(e));

    let selectedOrigin = null; // 'house' | 'none' | 'new'
    let selectedHouseId = null;
    let customHouseName = '';
    let customHouseEmoji = '';
    let playerName = '';

    const screen = document.createElement('div');
    screen.id = 'custom-char-screen';

    screen.innerHTML = `
      <button onclick="document.getElementById('custom-char-screen').remove()" style="align-self:flex-start;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:50%;width:32px;height:32px;font-size:0.9rem;cursor:pointer;color:#9a8a6a;margin-bottom:1rem">✕</button>

      <div class="ccs-title">⚜ Crea il Tuo Destino</div>
      <div class="ccs-sub">Scrivi la tua storia nei Sette Regni</div>

      <!-- Nome -->
      <div class="ccs-section">Il tuo nome</div>
      <input id="ccs-name" class="ccs-input" type="text" placeholder="Come ti chiami?" maxlength="24">

      <!-- Origine -->
      <div class="ccs-section">La tua origine</div>

      <button class="ccs-origin-btn" id="ccs-origin-house" onclick="Game._ccsSetOrigin('house')">
        <span style="font-size:1.5rem">🏰</span>
        <div>
          <div style="font-weight:700;color:#c084fc">Membro di una Casata</div>
          <div style="font-size:0.72rem;color:#9a8a6a;font-family:'EB Garamond',serif;margin-top:0.15rem">Parti alleato di una delle grandi casate. Accesso alle carte dei nobili.</div>
        </div>
      </button>

      <button class="ccs-origin-btn" id="ccs-origin-none" onclick="Game._ccsSetOrigin('none')">
        <span style="font-size:1.5rem">🌑</span>
        <div>
          <div style="font-weight:700;color:#c084fc">Senza Casata</div>
          <div style="font-size:0.72rem;color:#9a8a6a;font-family:'EB Garamond',serif;margin-top:0.15rem">Un individuo libero, fuori dagli schemi. Carte dei non-nobili e dell'ombra.</div>
        </div>
      </button>

      <button class="ccs-origin-btn" id="ccs-origin-new" onclick="Game._ccsSetOrigin('new')">
        <span style="font-size:1.5rem">✨</span>
        <div>
          <div style="font-weight:700;color:#c084fc">Fonda una Nuova Casata</div>
          <div style="font-size:0.72rem;color:#9a8a6a;font-family:'EB Garamond',serif;margin-top:0.15rem">Crea la tua casata da zero. Parti alleato di essa. Carte dei nobili.</div>
        </div>
      </button>

      <!-- Sezione casa esistente -->
      <div id="ccs-house-section" style="display:none;width:100%;max-width:420px">
        <div class="ccs-section" style="margin-top:0.5rem">Scegli la casata</div>
        <div class="ccs-house-grid">
          ${HOUSES_DEF.map(h => `
            <button class="ccs-house-btn" id="ccs-house-${h.id}" onclick="Game._ccsSetHouse('${h.id}')">
              <span style="font-size:1.2rem">${h.icon}</span>
              <span>${h.name}</span>
            </button>`).join('')}
        </div>
      </div>

      <!-- Sezione nuova casata -->
      <div id="ccs-new-section" style="display:none;width:100%;max-width:420px">
        <div class="ccs-section" style="margin-top:0.5rem">Nome della casata</div>
        <input id="ccs-house-name" class="ccs-input" type="text" placeholder="Casa ..." maxlength="20">
        <div class="ccs-section">Emblema della casata</div>
        <div class="ccs-emoji-grid">
          ${freeEmojis.map(e => `<button class="ccs-emoji-btn" id="ccs-emoji-${e.codePointAt(0)}" onclick="Game._ccsSetEmoji('${e}')">${e}</button>`).join('')}
        </div>
      </div>

      <button id="ccs-start-btn" onclick="Game._ccsStart()">⚔ Inizia la tua storia</button>
    `;

    document.body.appendChild(screen);

    // Live validation
    document.getElementById('ccs-name').addEventListener('input', e => {
      playerName = e.target.value.trim();
      _ccsValidate();
    });
    const houseNameInput = document.getElementById('ccs-house-name');
    if (houseNameInput) {
      houseNameInput.addEventListener('input', e => {
        customHouseName = e.target.value.trim();
        _ccsValidate();
      });
    }

    function _ccsValidate() {
      const btn = document.getElementById('ccs-start-btn');
      if (!btn) return;
      const nameOk = playerName.length >= 2;
      const originOk = selectedOrigin !== null;
      const houseOk = selectedOrigin === 'house' ? selectedHouseId !== null :
                      selectedOrigin === 'new' ? (customHouseName.length >= 2 && customHouseEmoji !== '') :
                      true;
      btn.classList.toggle('ready', nameOk && originOk && houseOk);
    }

    // Expose helpers on Game for onclick handlers
    Game._ccsSetOrigin = (origin) => {
      selectedOrigin = origin;
      ['house','none','new'].forEach(o => {
        document.getElementById('ccs-origin-' + o)?.classList.toggle('selected', o === origin);
      });
      document.getElementById('ccs-house-section').style.display = origin === 'house' ? 'block' : 'none';
      document.getElementById('ccs-new-section').style.display = origin === 'new' ? 'block' : 'none';
      if (origin !== 'house') selectedHouseId = null;
      if (origin !== 'new') { customHouseName = ''; customHouseEmoji = ''; }
      _ccsValidate();
    };

    Game._ccsSetHouse = (hId) => {
      selectedHouseId = hId;
      HOUSES_DEF.forEach(h => {
        document.getElementById('ccs-house-' + h.id)?.classList.toggle('selected', h.id === hId);
      });
      _ccsValidate();
    };

    Game._ccsSetEmoji = (emoji) => {
      customHouseEmoji = emoji;
      document.querySelectorAll('.ccs-emoji-btn').forEach(b => b.classList.remove('selected'));
      document.getElementById('ccs-emoji-' + emoji.codePointAt(0))?.classList.add('selected');
      _ccsValidate();
    };

    Game._ccsStart = () => {
      const btn = document.getElementById('ccs-start-btn');
      if (!btn?.classList.contains('ready')) return;

      // Build custom character object
      const diff = 'medium';
      const baseRes = { gold: 38, faith: 38, people: 42, army: 32, power: 35 };

      // Small random variance ±8
      const startRes = {};
      Object.entries(baseRes).forEach(([k,v]) => {
        startRes[k] = Math.max(10, v + Math.floor(Math.random() * 17) - 8);
      });

      let startAllies = [], startEnemies = [], charHouse = '';
      let cardRole = 'noble'; // 'noble' or 'shadow'
      let houseIcon = '⚜';
      let houseName = '';

      if (selectedOrigin === 'house') {
        const hDef = HOUSES_DEF.find(h => h.id === selectedHouseId);
        startAllies = [selectedHouseId];
        charHouse = 'Casa ' + hDef.name;
        houseIcon = hDef.icon;
        houseName = hDef.name;
        cardRole = 'noble';
        // Boost army a bit if member of a house
        startRes.army = Math.min(60, startRes.army + 10);
      } else if (selectedOrigin === 'new') {
        charHouse = 'Casa ' + customHouseName;
        houseIcon = customHouseEmoji;
        houseName = customHouseName;
        cardRole = 'noble';
        startAllies = ['custom_house'];
        // Casata sconosciuta: esercito basso, compensato da oro e potere (intrighi > forza bruta)
        startRes.army = Math.max(10, 12 + Math.floor(Math.random() * 8)); // 12-19
        startRes.gold  = Math.min(80, startRes.gold  + 15); // più risorse economiche
        startRes.power = Math.min(80, startRes.power + 10); // qualche influenza
      } else {
        charHouse = 'Senza Casata';
        houseIcon = '🌑';
        houseName = '';
        cardRole = 'shadow';
        startRes.gold += 8; // vagabond has more gold
        startRes.army = Math.max(10, startRes.army - 5);
      }

      const customChar = {
        id: 'custom',
        name: playerName,
        house: charHouse,
        icon: houseIcon,
        difficulty: diff,
        flavor: `«${playerName} — una figura destinata a lasciare il segno nei Sette Regni.»`,
        objective: 'Spodesta il Re e unisci tutti i Sette Regni sotto la tua Corona.',
        objectiveCheck: (s) => false, // win only via throne + unity
        startResources: startRes,
        startAllies,
        startEnemies,
        cardRole, // 'noble' or 'shadow'
        customHouseIcon: houseIcon,
        customHouseName: houseName,
        isCustom: true,
        customOrigin: selectedOrigin,
      };

      document.getElementById('custom-char-screen').remove();
      _startCustomGame(customChar);
    };
  }

  function _startCustomGame(customChar) {
    // If new house, inject it into HOUSES_DEF temporarily
    if (customChar.customOrigin === 'new' && customChar.customHouseName) {
      const newHouseDef = {
        id: 'custom_house',
        name: customChar.customHouseName,
        icon: customChar.customHouseIcon,
        region: 'Terre Libere',
        baseArmy: 55 + Math.floor(Math.random() * 20),
        allianceReq: {},
        allianceHint: `Casa ${customChar.customHouseName} è una casata emergente, ambiziosa e difficile da inquadrare.`,
      };
      // Only add if not already there
      if (!HOUSES_DEF.find(h => h.id === 'custom_house')) {
        HOUSES_DEF.push(newHouseDef);
      } else {
        // Update existing
        Object.assign(HOUSES_DEF.find(h => h.id === 'custom_house'), newHouseDef);
      }
    }

    initState(customChar);
    buildPrologue(customChar);
    showScreen('screen-prologue');
    // Mark card role for drawNextCard filtering
    state.customCardRole = customChar.cardRole;

    // New house: diplomatic cooldown — too unknown to be taken seriously for 8 turns
    if (customChar.customOrigin === 'new') {
      state.newHouseAllianceFreeFrom = 8;
      if (!state.allianceCooldowns) state.allianceCooldowns = {};
      HOUSES_DEF.forEach(h => {
        state.allianceCooldowns[h.id] = state.newHouseAllianceFreeFrom;
      });
    }
  }

  function abandonGame() {
    const existing = document.getElementById('abandon-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'abandon-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:800;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);animation:fadeIn 0.25s ease';
    overlay.innerHTML = `
      <div style="background:linear-gradient(160deg,#1a1508,#12100a);border:2px solid rgba(239,68,68,0.45);border-radius:8px;width:92%;max-width:380px;padding:1.75rem 1.5rem;font-family:'Cinzel',serif;text-align:center">
        <div style="font-size:2.2rem;margin-bottom:0.6rem">⚔</div>
        <div style="font-family:'Cinzel Decorative',serif;color:#f87171;font-size:0.95rem;margin-bottom:0.5rem;letter-spacing:0.05em">Abbandonare la Partita?</div>
        <div style="font-family:'EB Garamond',serif;font-size:0.95rem;color:#9a8a6a;line-height:1.6;margin-bottom:1.4rem;font-style:italic">
          «Nel gioco del trono, chi abbandona il campo è già sconfitto.<br>Sei sicuro di voler tornare alla home?»
        </div>
        <div style="display:flex;gap:0.75rem">
          <button onclick="document.getElementById('abandon-overlay').remove()" style="flex:1;padding:0.7rem;background:transparent;border:1px solid rgba(201,168,76,0.4);border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#c9a84c">
            ← Continua a combattere
          </button>
          <button onclick="document.getElementById('abandon-overlay').remove();if(typeof AudioManager!=='undefined')AudioManager.playMainFromWar();localStorage.removeItem('ia_save');Game._doAbandon()" style="flex:1;padding:0.7rem;background:linear-gradient(135deg,#7f1d1d,#dc2626);border:none;border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#fff">
            Abbandona ✕
          </button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  function _doAbandon() {
    state = {};
    showScreen('screen-splash');
  }

  function restart() {
    if (typeof AudioManager !== 'undefined') AudioManager.playMainFromWar();
    localStorage.removeItem('ia_save');
    state = {};
    showScreen('screen-splash');
  }

  // ══════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════
  return {
    showCharacterSelect,
    goBackToSplash: () => showScreen('screen-splash'),
    _showHouseSelect: () => _showHouseSelect(),
    startGame,
    startTutorial,
    showCustomCharScreen,
    _injectTutorialButton,
    _tutNext: () => Game._tutNext && Game._tutNext(),
    makeChoice,
    toggleDiplomacy,
    selectRavenTarget,
    ravenAction,
    clearRaven,
    loadGame,
    restart,
    abandonGame,
    _doAbandon,
    checkAndContinue,
    showChangelogPopup,
    cancelWar,
    requestAllyArmy,
    acceptAllyLoan,
    showWarConfirmation,
    triggerHouseBattle,
    showPreBattleOverlay,
    _startHouseBattleFromOverlay: (houseId, playerInitiated = true) => triggerHouseBattle(houseId, playerInitiated),
    _cancelFromPreBattle: (houseId) => {
      state.pendingWarTarget = null;
      state.pendingWarDeclaration = null;
      const loanedBefore = state.loanedArmy || 0;
      state.loanedArmy = 0;
      state.allyLoans = {};
      if (loanedBefore > 0) showToast(`⚔ Le truppe prestate (${loanedBefore}) sono tornate alle loro casate.`);
      // Casa diventa diffidente, costo potere
      const h = state.houses[houseId];
      if (h) {
        h.status = 'diffidente';
        if (!state.diffidentePardonCost) state.diffidentePardonCost = {};
        state.diffidentePardonCost[houseId] = 15 + Math.floor(Math.random() * 10);
      }
      state.resources.power = clampRes(state.resources.power - 10);
      if (typeof AudioManager !== 'undefined') AudioManager.playMainFromWar();
      showToast(`🏃 Vi siete ritirati. Casa ${h?.name} vi disprezza — ora diffidente.`, 'warn');
      updateHUD(); saveGame(); drawNextCard();
    },
    acceptResourceExchange,
    rejectResourceExchange,
    challengeKing,
    _openKingDetailPopup,
    executeThroneAttack,
    showBattleAnimation,
    acceptAllianceDemand,
    rejectAllianceDemand,
    acceptTruce,
    refuseTruce,
    sendSpy,
    payDiffidentePardon,
    showTributeOfferOverlay,
    acceptTributeOffer,
    acceptAllyResourceGift,
    requestSpecificResource,
    warDiploTribute,
    warDiploDirectWar,
    _refuseAllyLoan,
    _openHousePopup: (hId) => _openHousePopup(hId),
    showModal,
    requestLoyaltyPledge,
    _loyaltyAccepted,
    _loyaltyRefused,
    _openKingChallengeDiplomacy,
    _continueAfterRetreat,
    _payAttackCompensation,
    _openWarDiplomacy,
    resumeCardFlow,
    // Exposed internals for callbacks outside the IIFE
    _updateHUD: () => updateHUD(),
    _drawNextCard: () => drawNextCard(),
    _checkGameOver: () => checkGameOver(),
    _saveGame: () => saveGame(),
    _showToast: (msg, type) => showToast(msg, type),
    _clamp: (v) => clamp(v),
    _returnLoanedArmies: () => returnLoanedArmies(),
    _getState: () => state,
    // Chronicles & progression (definite fuori IIFE come Game.X)
    // Battle callbacks
    _battleRetreat: null,
    _battleRetreatFn: null,
    _battleRetreatFinish: null,
    _battleCompleteFn: null,
    _battleResolveFn: null,
    _battleContinuePhase: null,
    _throneNextPhase: null,
    _throneStartPhase0: null,
    _battleTimer: null,
    _battleToggleSpeed: null,
  };

})();

window.addEventListener('load', () => {
  // Version badge
  const badge = document.getElementById('version-badge');
  if (badge) badge.textContent = 'v2.1.0';

  // Changelog popup check
  const seen = localStorage.getItem('ia_version_seen');
  if (seen !== '2.1.0') {
    Game.showChangelogPopup();
  }

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});

// ══════════════════════════════════════════════════════════════
// AUDIO MANAGER
// Gestisce track-1.mp3 (musica base) e track-2.mp3 (guerra)
// ══════════════════════════════════════════════════════════════
const AudioManager = (() => {

  const FADE_IN_MS  = 1800;
  const FADE_OUT_MS = 1200;
  const MAIN_VOL    = 0.55;
  const WAR_VOL     = 0.70;

  let track1    = null;
  let track2    = null;
  let _warActive = false;
  let _muted     = false;

  function createAudio(src) {
    const a = new Audio();
    a.src     = src;
    a.volume  = 0;
    a.preload = 'auto';
    a._fadeTimer = null;
    return a;
  }

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

  function fadeOut(audio, durationMs, onDone) {
    if (!audio) { if (onDone) onDone(); return; }
    clearInterval(audio._fadeTimer);

    const startVol = audio.volume;
    if (startVol <= 0.001) {
      audio.pause();
      // Only reset track2 to beginning, preserve track1 position
      if (audio === track2) {
        audio.currentTime = 0;
      }
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
        // Only reset track2 to beginning, preserve track1 position
        if (audio === track2) {
          audio.currentTime = 0;
        }
        if (onDone) onDone();
      }
    }, stepMs);
  }

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
        [track1, track2].forEach(t => {
          if (!t) return;
          clearInterval(t._fadeTimer);
          t.volume = 0;
          t.pause();
        });
      } else {
        if (_warActive) fadeIn(track2, WAR_VOL, FADE_IN_MS);
        else            fadeIn(track1, MAIN_VOL, FADE_IN_MS);
      }
    });

    document.body.appendChild(btn);
  }

  function init() {
    // Carica i file audio
    track1 = createAudio('track-1.mp3');
    track2 = createAudio('track-2.mp3');
    track1.loop = true;
    track2.loop = true; // loop war music — fadeOut resets currentTime when needed
    track1.load();
    track2.load();
    buildMuteButton();
    
    // Try to start music immediately
    setTimeout(() => {
      console.log('Attempting to start background music on page load');
      playMain();
    }, 500);
    
    // Fallback: try to play audio on first user interaction if autoplay is blocked
    document.addEventListener('click', function initAudio() {
      console.log('Audio initialization triggered by user click (fallback)');
      if (track1 && track1.paused) {
        playMain();
      }
      document.removeEventListener('click', initAudio);
    }, { once: true });
  }

  function playMain() {
    if (_muted || _warActive || !track1) return;
    if (track2 && !track2.paused && track2.volume > 0.001) {
      // Guerra in corso → fai crossfade
      fadeOut(track2, FADE_OUT_MS, () => fadeIn(track1, MAIN_VOL, FADE_IN_MS));
    } else if (!track1.paused && track1.volume >= MAIN_VOL - 0.02) {
      // Track1 già in riproduzione al volume corretto → non fare nulla
      return;
    } else if (!track1.paused && track1.volume > 0) {
      // Track1 in play ma volume non corretto → porta al volume target senza restart
      clearInterval(track1._fadeTimer);
      const startVol = track1.volume;
      const STEPS = 20;
      const stepMs = 800 / STEPS;
      const diff = MAIN_VOL - startVol;
      let step = 0;
      track1._fadeTimer = setInterval(() => {
        step++;
        track1.volume = Math.min(MAIN_VOL, +(startVol + diff * (step / STEPS)).toFixed(5));
        if (step >= STEPS) { clearInterval(track1._fadeTimer); track1.volume = MAIN_VOL; }
      }, stepMs);
    } else {
      // Track1 in pausa o volume 0 → fadeIn normale
      fadeIn(track1, MAIN_VOL, FADE_IN_MS);
    }
  }

  function playWar() {
    if (_warActive || _muted || !track2) return;
    _warActive = true;
    fadeOut(track1, FADE_OUT_MS, () => fadeIn(track2, WAR_VOL, FADE_IN_MS));
  }

  function playMainFromWar() {
    if (_muted || !track1) return;
    _warActive = false;
    if (track2 && !track2.paused && track2.volume > 0.001) {
      // C'era davvero la guerra — crossfade
      fadeOut(track2, FADE_OUT_MS, () => fadeIn(track1, MAIN_VOL, FADE_IN_MS));
    } else {
      // Nessuna guerra in corso — comportati come playMain (non rifà il fadeIn se già in play)
      if (track2) { track2.pause(); track2.currentTime = 0; }
      if (!track1.paused && track1.volume >= MAIN_VOL - 0.02) return; // già in play al volume corretto
      fadeIn(track1, MAIN_VOL, FADE_IN_MS);
    }
  }

  return { init, playMain, playWar, playMainFromWar };
})();

// =========================================================
// INIZIALIZZAZIONE CORRETTA
// L'audio manager deve essere inizializzato QUI, 
// dopo che è stato definito completamente.
// =========================================================
AudioManager.init();

// =========================================================
// GESTIONE TASTO BACK (Android / browser history)
// =========================================================
(function() {
  // Spingiamo uno stato iniziale nello history così il primo "back"
  // non chiude l'app ma viene catturato da noi.
  history.pushState({ ia: 'root' }, '');

  window.addEventListener('popstate', function(e) {
    // 1. Se c'è un overlay aperto (abandon, richiesta risorse, ecc.) → chiudilo
    const overlays = [
      'abandon-overlay', 'req-resources-overlay', 'req-resources-overlay2',
      'tribute-offer-overlay', 'changelog-overlay', 'game-modal',
      'house-popup', 'alliance-prereq-overlay', 'alliance-demand-overlay',
    ];
    for (const id of overlays) {
      const el = document.getElementById(id);
      if (el) {
        el.remove();
        history.pushState({ ia: 'root' }, ''); // rimetti lo stato per il prossimo back
        return;
      }
    }

    // 2. Se il pannello diplomazia è aperto → chiudilo
    const diploPanel = document.getElementById('diplomacy-panel');
    if (diploPanel && !diploPanel.classList.contains('hidden')) {
      Game.toggleDiplomacy();
      history.pushState({ ia: 'root' }, '');
      return;
    }

    // 3. Se siamo in battaglia → ignora (non fare nulla)
    const battleOverlay = document.getElementById('battle-overlay') ||
                          document.getElementById('battle-screen') ||
                          document.querySelector('[id^="battle"]');
    if (battleOverlay) {
      history.pushState({ ia: 'root' }, ''); // rimetti lo stato, blocca il back
      return;
    }

    // 4. Se siamo nella schermata di gioco (carte) → mostra popup abbandona
    const gameScreen = document.getElementById('screen-game');
    if (gameScreen && gameScreen.classList.contains('active')) {
      history.pushState({ ia: 'root' }, '');
      Game.abandonGame();
      return;
    }

    // 5. Se siamo nella selezione personaggio → torna alla splash
    const charScreen = document.getElementById('screen-char-select');
    if (charScreen && charScreen.classList.contains('active')) {
      history.pushState({ ia: 'root' }, '');
      // Mostra splash direttamente
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById('screen-splash').classList.add('active');
      return;
    }

    // 6. Se siamo nel prologo → torna alla selezione personaggio
    const prologueScreen = document.getElementById('screen-prologue');
    if (prologueScreen && prologueScreen.classList.contains('active')) {
      history.pushState({ ia: 'root' }, '');
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById('screen-char-select').classList.add('active');
      return;
    }

    // 7. Splash o ending → rimetti lo stato (non uscire dall'app)
    history.pushState({ ia: 'root' }, '');
  });
})();

Game._battleRetreatFinish = function(survived) {
  const s = Game._getState();
  Game._returnLoanedArmies();
  if (s && s.resources) s.resources.army = Math.max(1, survived);
  if (typeof AudioManager !== 'undefined') AudioManager.playMainFromWar();
  Game._updateHUD();
  Game._saveGame();
  Game._checkGameOver();
  if (s && !s.gameOver) Game._drawNextCard();
};

Game._battleRetreat = function() {
  if (Game._battleRetreatFn) Game._battleRetreatFn();
};

// Inject tutorial button — runs after Game IIFE is fully defined
(function() {
  function injectTutBtn() {
    if (document.getElementById('btn-tutorial')) return;
    const splash = document.getElementById('screen-splash');
    if (!splash) return;
    const content = splash.querySelector('.splash-content');
    if (!content) return;
    const btn = document.createElement('button');
    btn.id = 'btn-tutorial';
    btn.className = 'btn-secondary';
    btn.textContent = '📖 Tutorial';
    btn.style.cssText = 'margin-top:0.5rem;border-color:rgba(201,168,76,0.5);color:#c9a84c;';
    btn.addEventListener('click', () => Game.startTutorial());
    content.appendChild(btn);
    // Also add custom mode button
    const btnCustom = document.createElement('button');
    btnCustom.id = 'btn-custom-mode';
    btnCustom.className = 'btn-secondary';
    btnCustom.textContent = '⚜ Crea il Tuo Destino';
    btnCustom.style.cssText = 'margin-top:0.4rem;border-color:rgba(192,132,252,0.5);color:#c084fc;';
    btnCustom.addEventListener('click', () => Game.showCustomCharScreen());
    content.appendChild(btnCustom);
  }
  // Try at multiple points to ensure it runs regardless of load state
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectTutBtn);
  } else {
    injectTutBtn();
  }
  window.addEventListener('load', injectTutBtn);
  // Extra fallback after short delay
  setTimeout(injectTutBtn, 300);
})();

// ═══════════════════════════════════════════════════════════════
// SISTEMA PROGRESSIONE — Cronache, Personaggi Bloccati, Cavalieri
// ═══════════════════════════════════════════════════════════════

// ── PERSONAGGI BLOCCATI ──
// 1 per casata difficile, sbloccati completando l'obiettivo di un altro della stessa casata
const LOCKED_CHARS = {
  // TARGARYEN — Aegon il Conquistatore, il premio massimo della casata
  'aegon_t':      { unlockBy: ['daenerys','rhaenyra'],     reason: 'Completa l\'obiettivo di Daenerys o Rhaenyra Targaryen' },
  // LANNISTER — Tywin, il più potente, sblocca con uno qualsiasi della casata
  'tywin':        { unlockBy: ['cersei','tyrion','jaime'],  reason: 'Completa l\'obiettivo di Cersei, Tyrion o Jaime Lannister' },
  // STARK — Ned è l'anima della casata, richiede i guerrieri
  'ned':          { unlockBy: ['jon','robb'],               reason: 'Completa l\'obiettivo di Jon Snow o Robb Stark' },
  // BARATHEON — Stannis il pretendente, si sblocca con il suo fedele Davos
  'stannis':      { unlockBy: ['davos'],                    reason: 'Completa l\'obiettivo di Davos Seaworth' },
  // TYRELL — Olenna la mente, si sblocca con Margaery
  'olenna':       { unlockBy: ['margaery'],                 reason: 'Completa l\'obiettivo di Margaery Tyrell' },
  // BOLTON — Ramsay il più spietato, richiede Roose
  'ramsay':       { unlockBy: ['roose'],                    reason: 'Completa l\'obiettivo di Roose Bolton' },
  // HIGHTOWER — Alicent richiede Otto
  'alicent':      { unlockBy: ['otto'],                     reason: 'Completa l\'obiettivo di Otto Hightower' },
  // SENZA CASA — i personaggi più unici e difficili
  'tormund':      { unlockBy: ['ygritte'],                  reason: 'Completa l\'obiettivo di Ygritte' },
  'melisandre':   { unlockBy: ['stannis','davos'],          reason: 'Completa l\'obiettivo di Stannis o Davos Baratheon' },
  'oberyn':       { unlockBy: ['catelyn'],                  reason: 'Completa l\'obiettivo di Catelyn Tully' },
  'littlefinger': { unlockBy: ['tyrion','cersei'],          reason: 'Completa l\'obiettivo di Tyrion o Cersei Lannister' },
};

// Casate e personaggi per il completamento oro
const HOUSE_CHARS = {
  'Targaryen':  ['daenerys','viserys','rhaenyra','aegon_t'],
  'Lannister':  ['cersei','tyrion','jaime','tywin'],
  'Stark':      ['jon','sansa','arya','robb','ned'],
  'Baratheon':  ['stannis','davos'],
  'Tyrell':     ['margaery','olenna'],
  'Bolton':     ['roose','ramsay'],
  'Hightower':  ['otto','alicent'],
  'SenzaCasa':  ['littlefinger','bronn','sandor','jorah','theon','catelyn','brienne','melisandre','oberyn','ygritte','tormund'],
};

function _getProgress() {
  try { return JSON.parse(localStorage.getItem('ia_progress') || '{}'); } catch(e) { return {}; }
}
function _saveProgress(p) {
  localStorage.setItem('ia_progress', JSON.stringify(p));
}

function isCharLocked(charId) {
  if (!LOCKED_CHARS[charId]) return false;
  const p = _getProgress();
  const unlockBy = LOCKED_CHARS[charId].unlockBy;
  return !unlockBy.some(id => p.completed?.[id]);
}

function markCharCompleted(charId) {
  const p = _getProgress();
  if (!p.completed) p.completed = {};
  p.completed[charId] = true;
  _saveProgress(p);
  _checkKnightsBookUnlock();
}

function _checkKnightsBookUnlock() {
  const p = _getProgress();
  const allChars = Object.values(HOUSE_CHARS).flat();
  const allDone = allChars.every(id => p.completed?.[id]);
  if (allDone && !p.knightsBookUnlocked) {
    p.knightsBookUnlocked = true;
    _saveProgress(p);
  }
  // Mostra icona nella home
  const btn = document.getElementById('btn-knights-home');
  if (btn) btn.style.display = p.knightsBookUnlocked ? 'block' : 'none';
}

// ── CRONACHE ──
function saveChroniclEntry(won, char, resources, turn, allies, deathReason) {
  const chronicles = JSON.parse(localStorage.getItem('ia_chronicles') || '[]');
  chronicles.unshift({
    charId: char.id, charName: char.name, charIcon: char.icon,
    charHouse: char.house, won, turn, allies,
    gold: Math.round(resources.gold), faith: Math.round(resources.faith),
    people: Math.round(resources.people), army: Math.round(resources.army),
    power: Math.round(resources.power),
    deathReason: deathReason || null,
    date: new Date().toLocaleDateString('it-IT'),
  });
  localStorage.setItem('ia_chronicles', JSON.stringify(chronicles.slice(0, 7)));
}

function _buildChronicleNarrative(c) {
  const house = c.charHouse || 'i Sette Regni';
  if (c.won) {
    return [
      `Il Trono ricordava ogni promessa spezzata, ogni alleanza cementata col sangue. ${c.charName} aveva attraversato ${c.turn} turni di intrighi e acciaio prima che il destino si compisse.`,
      `«${c.charName} non è giunto fin qui per caso,» mormorarono i corvi portando la notizia ai quattro angoli di Westeros. «${house} ha scritto oggi una pagina che i maestri citeranno per generazioni.»`,
      `Con ${c.allies} casata${c.allies !== 1 ? 'e' : ''} fedel${c.allies !== 1 ? 'i' : 'e'} al proprio stendardo e le risorse della corona saldamente in pugno — oro ${c.gold}, esercito ${c.army}, popolo ${c.people} — il nome di ${c.charName} fu inciso nella pietra del Grande Mastio.`,
      `La Fede cantò inni di vittoria. Il popolo acclamò. E i nemici, quelli ancora in vita, si inchinarono.`,
    ].join('\n\n');
  } else {
    const causeMap = {
      gold: 'le casse della corona erano vuote — il denaro è il sangue del potere, e senza di esso anche i re muoiono',
      faith: 'la Fede si era rivoltata — quando i Sette voltano le spalle, nessuno scettro regge',
      people: 'il popolo aveva gridato abbastanza — i troni si costruiscono sulle spalle degli uomini, e quegli uomini si erano alzati',
      army: 'l\'esercito era svanito come nebbia mattutina — senza spade, i titoli sono solo parole',
      power: 'il potere aveva consumato ogni cosa — chi vola troppo vicino al sole brucia, anche i draghi',
    };
    const cause = c.deathReason && causeMap[c.deathReason] ? causeMap[c.deathReason] : 'il destino aveva altri piani';
    return [
      `I corvi non portano solo buone notizie. Dopo ${c.turn} turni di regno, la storia di ${c.charName} si concluse prima del previsto.`,
      `${cause.charAt(0).toUpperCase() + cause.slice(1)}.`,
      `${house} pianse — o forse esultò in segreto. A corte è difficile distinguere il lutto dalla soddisfazione.`,
      `Con oro ${c.gold}, fede ${c.faith}, popolo ${c.people} ed esercito ${c.army} quando tutto finì, il nome di ${c.charName} rimase — ma come ammonimento, non come gloria.`,
    ].join('\n\n');
  }
}

Game.showChronicles = function() {
  document.getElementById('screen-chronicles')?.remove();
  const chronicles = JSON.parse(localStorage.getItem('ia_chronicles') || '[]');
  const overlay = document.createElement('div');
  overlay.id = 'screen-chronicles';
  overlay.className = 'screen-chronicles';

  if (chronicles.length === 0) {
    overlay.innerHTML = `
      <div class="chronicles-cover">
        <div style="font-size:3rem;margin-bottom:1rem">📜</div>
        <div style="font-family:'Cinzel Decorative',serif;font-size:1rem;color:#c9a84c;margin-bottom:0.5rem">Libro delle Cronache</div>
        <div style="font-family:'EB Garamond',serif;font-size:0.95rem;color:#6b5e4a;font-style:italic;text-align:center;max-width:280px">
          «Le pagine sono ancora bianche. Scrivi la tua storia.»
        </div>
        <button onclick="document.getElementById('screen-chronicles').remove()" style="margin-top:2rem;padding:0.7rem 2rem;background:transparent;border:1px solid rgba(201,168,76,0.4);border-radius:3px;font-family:'Cinzel',serif;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#c9a84c">← Torna alla Home</button>
      </div>`;
    document.body.appendChild(overlay);
    return;
  }

  const indexHTML = chronicles.map((c, i) => `
    <div class="chronicle-index-item" onclick="Game._openChroniclePage(${i})">
      <span class="ci-num">${['I','II','III','IV','V','VI','VII'][i]}</span>
      <span class="ci-icon" style="display:flex;align-items:center;justify-content:center;width:2.4rem;height:2.4rem;border-radius:50%;overflow:hidden;border:1px solid rgba(201,168,76,0.3);background:rgba(0,0,0,0.4);flex-shrink:0">
        <img src="images/characters/${c.charId}.png" alt="${c.charName}"
          style="width:100%;height:100%;object-fit:cover;object-position:top"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <span style="display:none;font-size:1.2rem;width:100%;height:100%;align-items:center;justify-content:center">${c.charIcon}</span>
      </span>
      <div class="ci-info">
        <div class="ci-name">${c.charName}</div>
        <div class="ci-result">${c.won ? '✦ Vittoria' : '✝ Sconfitta'} · Turno ${c.turn} · ${c.date}</div>
      </div>
      <span class="ci-arrow">›</span>
    </div>`).join('');

  overlay.innerHTML = `
    <div class="chronicles-cover">
      <div style="font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:#6b5e4a;margin-bottom:0.5rem;font-family:'Cinzel',serif">Le Sette Cronache di Westeros</div>
      <div class="chronicles-book">
        <div class="chronicles-book-title">📜 Libro delle Cronache</div>
        ${indexHTML}
      </div>
      <button onclick="document.getElementById('screen-chronicles').remove()" style="margin-top:1.25rem;padding:0.6rem 1.75rem;background:transparent;border:1px solid rgba(201,168,76,0.35);border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#9a8a6a">← Torna alla Home</button>
    </div>`;
  document.body.appendChild(overlay);
}

Game._openChroniclePage = function(index) {
  const chronicles = JSON.parse(localStorage.getItem('ia_chronicles') || '[]');
  const c = chronicles[index];
  if (!c) return;
  const overlay = document.getElementById('screen-chronicles');
  if (!overlay) return;

  const narrative = _buildChronicleNarrative(c);
  const wonColor = c.won ? '#4ade80' : '#f87171';
  const wonLabel = c.won ? '✦ VITTORIA ✦' : '✝ SCONFITTA ✝';
  const numeral = ['I','II','III','IV','V','VI','VII'][index];

  overlay.innerHTML = `
    <div class="chronicles-cover">
      <div class="chronicles-book" style="max-height:85vh;">
        <div class="chronicles-book-title" style="display:flex;align-items:center;justify-content:center;gap:0.75rem;padding:1.25rem 1rem 0.75rem">
          <div style="width:3.5rem;height:3.5rem;border-radius:50%;overflow:hidden;border:2px solid rgba(201,168,76,0.5);background:rgba(0,0,0,0.5);flex-shrink:0">
            <img src="images/characters/${c.charId}.png" alt="${c.charName}"
              style="width:100%;height:100%;object-fit:cover;object-position:top"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <span style="display:none;font-size:1.8rem;width:100%;height:100%;display:flex;align-items:center;justify-content:center">${c.charIcon}</span>
          </div>
          <div>
            <div style="font-family:'Cinzel Decorative',serif;font-size:0.95rem;color:#c9a84c">${c.charName}</div>
            <div style="font-size:0.65rem;color:#6b5e4a;font-family:'EB Garamond',serif;font-style:italic">${c.charHouse}</div>
          </div>
        </div>
        <div class="chronicle-page">
          <div style="text-align:center;font-family:'Cinzel',serif;font-size:0.65rem;letter-spacing:0.2em;color:#6b5e4a;margin-bottom:0.3rem">CRONACA ${numeral} · ${c.date}</div>
          <div style="text-align:center;font-family:'Cinzel Decorative',serif;font-size:0.85rem;color:${wonColor};margin-bottom:0.75rem;text-shadow:0 0 12px ${wonColor}40">${wonLabel}</div>
          <div class="cp-divider">⚜ ⚜ ⚜</div>
          <p style="font-size:0.8rem;color:#6b5e4a;font-style:italic;text-align:center">${c.charHouse}</p>
          <div class="cp-divider">— ✦ —</div>
          <p style="white-space:pre-line;animation:inkWrite 0.8s ease">${narrative}</p>
          <div class="cp-divider">⚜ ⚜ ⚜</div>
          <div style="display:flex;flex-wrap:wrap;gap:0.35rem;justify-content:center;margin-top:0.5rem">
            <span class="cp-stat">⏱ ${c.turn} turni</span>
            <span class="cp-stat">💰 ${c.gold}</span>
            <span class="cp-stat">✝ ${c.faith}</span>
            <span class="cp-stat">👥 ${c.people}</span>
            <span class="cp-stat">⚔ ${c.army}</span>
            <span class="cp-stat">👑 ${c.power}</span>
            <span class="cp-stat">🤝 ${c.allies} alleanze</span>
          </div>
        </div>
      </div>
      <button onclick="Game.showChronicles()" style="margin-top:1rem;padding:0.6rem 1.75rem;background:transparent;border:1px solid rgba(201,168,76,0.35);border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#9a8a6a">← Indice</button>
    </div>`;
};

// ── LIBRO DEI CAVALIERI ──
const WESTEROS_KNIGHTS = [
  { name: 'Ser Duncan l\'Alto', gesta: 'Cavaliere errante che divenne Lord Comandante della Guardia del Re. Difese l\'innocente contro il potente in tre celebri tornei e battaglie, guadagnandosi il rispetto di tutto il regno.' },
  { name: 'Ser Barristan il Temerario', gesta: 'Lord Comandante della Guardia del Re sotto tre re. Combatté in oltre quaranta tornei senza mai essere disarcionato. La sua lealtà e il suo valore non ebbero pari in tutta la storia dei Sette Regni.' },
  { name: 'Aemon Targaryen il Drago-Cavaliere', gesta: 'Principe e cavaliere senza pari, vinse più di novanta duelli singolari. Rifiutò la corona per onorare i suoi voti e morì difendendo ciò che amava.' },
  { name: 'Ser Gerold Hightower', gesta: 'Il Toro Bianco, Lord Comandante della Guardia del Re sotto il Re Folle. Morì fedele al proprio giuramento sulla Torre della Gioia, combattendo fino all\'ultimo respiro.' },
  { name: 'Brynden Rivers, Corvo dai Mille Occhi', gesta: 'Figlio del re, comandante dei Corvi Messaggeri, poi Corvo a Tre Occhi. La sua saggezza abbracciò secoli di storia e il suo sguardo vide ciò che nessun altro poteva vedere.' },
];

Game.showKnightsBook = function(showFinalEntry) {
  document.getElementById('knights-book-overlay')?.remove();
  const p = _getProgress();
  const overlay = document.createElement('div');
  overlay.id = 'knights-book-overlay';
  overlay.className = 'knights-book-overlay';

  const knightsList = WESTEROS_KNIGHTS.map((k,i) => `
    <div class="knights-index-item" onclick="Game._openKnightPage(${i})">
      ${i+1}. ${k.name}
    </div>`).join('');

  const playerEntry = p.playerGesta ? `
    <div class="knights-index-item" style="color:#6b3a1f;font-weight:bold" onclick="Game._openPlayerPage()">
      ${WESTEROS_KNIGHTS.length+1}. ${p.playerName || 'Il Governatore dei Sette Regni'}
    </div>` : '';

  const addBtn = !p.playerGesta ? `<button class="knights-add-btn" onclick="Game._startPlayerGesta()">✦ Aggiungi il tuo nome</button>` : '';

  overlay.innerHTML = `
    <div class="knights-book-page">
      <div class="knights-title">⚔ Libro dei Cavalieri di Westeros ⚔</div>
      ${knightsList}
      ${playerEntry}
      ${addBtn}
      <button onclick="document.getElementById('knights-book-overlay').remove()" style="width:100%;margin-top:0.75rem;padding:0.6rem;background:transparent;border:1px solid #c8a87a;border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;cursor:pointer;color:#6b3a1f">← Chiudi il libro</button>
    </div>`;
  document.body.appendChild(overlay);
}

Game._openKnightPage = function(index) {
  const k = WESTEROS_KNIGHTS[index];
  document.getElementById('knights-book-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'knights-book-overlay';
  overlay.className = 'knights-book-overlay';
  overlay.innerHTML = `
    <div class="knights-book-page">
      <div class="knights-title">${k.name}</div>
      <p class="knights-gesta-text" style="animation:inkWrite 0.6s ease">${k.gesta}</p>
      <button onclick="Game.showKnightsBook()" style="width:100%;margin-top:1.5rem;padding:0.6rem;background:transparent;border:1px solid #c8a87a;border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;cursor:pointer;color:#6b3a1f">← Indice</button>
    </div>`;
  document.body.appendChild(overlay);
};

Game._openPlayerPage = function() {
  const p = _getProgress();
  if (!p.playerGesta) return;
  document.getElementById('knights-book-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'knights-book-overlay';
  overlay.className = 'knights-book-overlay';
  overlay.innerHTML = `
    <div class="knights-book-page">
      <div class="knights-title">${p.playerName || 'Il Governatore'}</div>
      <p class="knights-gesta-text">${p.playerGesta}</p>
      ${p.playerSignature ? `<div style="margin-top:1rem;text-align:center"><img src="${p.playerSignature}" style="max-width:100%;border-top:1px solid #c8a87a;padding-top:0.75rem"/></div>` : ''}
      <button onclick="Game.showKnightsBook()" style="width:100%;margin-top:1.5rem;padding:0.6rem;background:transparent;border:1px solid #c8a87a;border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;cursor:pointer;color:#6b3a1f">← Indice</button>
    </div>`;
  document.body.appendChild(overlay);
};

Game._startPlayerGesta = function() {
  document.getElementById('knights-book-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'knights-book-overlay';
  overlay.className = 'knights-book-overlay';
  overlay.innerHTML = `
    <div class="knights-book-page">
      <div class="knights-title">Il tuo nome nella storia</div>
      <p style="color:#3d2b1a;font-size:0.9rem;margin-bottom:1rem;font-family:'EB Garamond',serif">Come sarai ricordato nei Sette Regni?</p>
      <input id="player-name-input" type="text" maxlength="30" placeholder="Inserisci il tuo nome..."
        style="width:100%;padding:0.65rem;border:1px solid #c8a87a;border-radius:3px;font-family:'Cinzel',serif;font-size:0.9rem;color:#3d2b1a;background:#faf7f0;box-sizing:border-box;margin-bottom:0.75rem"
        onkeydown="if(event.key==='Enter'){Game._writeGesta()}" />
      <button class="knights-add-btn" onclick="Game._writeGesta()">OK — Scrivi le mie gesta</button>
      <button onclick="Game.showKnightsBook()" style="width:100%;margin-top:0.5rem;padding:0.6rem;background:transparent;border:1px solid #c8a87a;border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;cursor:pointer;color:#6b3a1f">← Annulla</button>
    </div>`;
  document.body.appendChild(overlay);
  setTimeout(() => document.getElementById('player-name-input')?.focus(), 200);
};

const GESTA_TEMPLATE = (name) => [
  `${name}, Governatore dei Sette Regni e Signore di Westeros, la cui saggezza superò quella dei Grandi Maestri e il cui coraggio fece tremare i re più potenti della storia.`,
  `\n\nEgli percorse ogni casata, strinse alleanze dove altri trovavano nemici, e spezzò le resistenze dove la diplomazia non bastava. Le cronache dicono che in tutta la sua campagna non vi fu giorno in cui la sua volontà vacillò.`,
  `\n\nSotto il suo governo, il popolo mangiò, la Fede cantò, gli eserciti marciarono compatti e il tesoro della corona non conobbe mai il fondo. I sette regni divennero uno solo — non per forza di conquista soltanto, ma per forza di carattere.`,
  `\n\nI corvi portarono il suo nome fino a Castamere e oltre il Muro. I bardi lo cantarono nelle taverne di Approdo del Re e nelle sale di Grande Inverno. Persino i Dothraki, si dice, pronunciarono il suo nome con rispetto.`,
  `\n\nE quando il Trono di Spade fu finalmente suo, ${name} non si sedette con arroganza — ma con la consapevolezza di chi sa che il potere è un peso, non un premio.`,
  `\n\n«Che questo libro ricordi,» scrissero i maestri, «che ${name} governò non perché il destino lo impose, ma perché lo meritò.»`,
].join('');

Game._writeGesta = function() {
  const nameInput = document.getElementById('player-name-input');
  const name = nameInput?.value?.trim();
  if (!name) { nameInput?.focus(); return; }

  document.getElementById('knights-book-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'knights-book-overlay';
  overlay.className = 'knights-book-overlay';

  const fullText = GESTA_TEMPLATE(name);
  overlay.innerHTML = `
    <div class="knights-book-page">
      <div class="knights-title">${name}</div>
      <p id="gesta-writing" class="knights-gesta-text"></p>
      <div id="gesta-signature-area" style="display:none;margin-top:1.25rem">
        <div style="font-family:'Cinzel',serif;font-size:0.75rem;color:#6b3a1f;text-align:center;margin-bottom:0.5rem;letter-spacing:0.1em">APPONI LA TUA FIRMA</div>
        <canvas id="sig-canvas" class="signature-canvas" width="340" height="120"></canvas>
        <div style="display:flex;gap:0.5rem;margin-top:0.5rem">
          <button onclick="Game._clearSignature()" style="flex:1;padding:0.5rem;background:transparent;border:1px solid #c8a87a;border-radius:3px;font-family:'Cinzel',serif;font-size:0.7rem;cursor:pointer;color:#6b3a1f">Ricomincia</button>
          <button onclick="Game._saveSignatureAndFinish('${name.replace(/'/g,"\\'")}','${encodeURIComponent(fullText)}')" style="flex:1;padding:0.5rem;background:linear-gradient(135deg,#6b3a1f,#c8a87a);border:none;border-radius:3px;font-family:'Cinzel',serif;font-size:0.7rem;font-weight:700;cursor:pointer;color:#faf7f0">✓ Conferma firma</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  // Scrivi il testo lentamente
  let i = 0;
  const el = document.getElementById('gesta-writing');
  const speed = 18;
  function typeChar() {
    if (i < fullText.length) {
      el.textContent += fullText[i++];
      el.scrollIntoView({ block: 'end', behavior: 'smooth' });
      setTimeout(typeChar, speed);
    } else {
      document.getElementById('gesta-signature-area').style.display = 'block';
      Game._initSignatureCanvas();
    }
  }
  setTimeout(typeChar, 400);
};

Game._initSignatureCanvas = function() {
  const canvas = document.getElementById('sig-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#2d1f0e';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  let drawing = false, lastX = 0, lastY = 0;

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return [src.clientX - r.left, src.clientY - r.top];
  }
  function start(e) { e.preventDefault(); drawing = true; [lastX, lastY] = getPos(e); }
  function draw(e) {
    if (!drawing) return; e.preventDefault();
    const [x, y] = getPos(e);
    ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
    [lastX, lastY] = [x, y];
  }
  function stop() { drawing = false; }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stop);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stop);
};

Game._clearSignature = function() {
  const canvas = document.getElementById('sig-canvas');
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
};

Game._saveSignatureAndFinish = function(name, encodedGesta) {
  const canvas = document.getElementById('sig-canvas');
  const sig = canvas ? canvas.toDataURL() : null;
  const gesta = decodeURIComponent(encodedGesta);

  const p = _getProgress();
  p.playerName = name;
  p.playerGesta = gesta;
  p.playerSignature = sig;
  _saveProgress(p);

  // Mostra pagina finale con firma
  document.getElementById('knights-book-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'knights-book-overlay';
  overlay.className = 'knights-book-overlay';
  overlay.innerHTML = `
    <div class="knights-book-page" id="final-page">
      <div class="knights-title">${name}</div>
      <p class="knights-gesta-text">${gesta}</p>
      ${sig ? `<div style="margin-top:1rem;text-align:center;border-top:1px solid #c8a87a;padding-top:0.75rem"><img src="${sig}" style="max-width:100%"/></div>` : ''}
    </div>`;
  document.body.appendChild(overlay);

  // Dopo 5s → dissolvenza → grazie → home
  setTimeout(() => {
    overlay.style.transition = 'opacity 2s ease';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      const thanks = document.createElement('div');
      thanks.style.cssText = 'position:fixed;inset:0;background:#000;z-index:1100;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem;animation:fadeIn 1.5s ease';
      thanks.innerHTML = `
        <div style="font-family:'Cinzel Decorative',serif;font-size:1.3rem;color:#c9a84c;text-align:center;letter-spacing:0.1em;line-height:1.6">
          Grazie per aver giocato<br>
          <span style="font-size:0.9rem;color:#6b5e4a">Iron & Alliances</span>
        </div>
        <div style="font-size:2rem">⚔ 👑 ⚔</div>`;
      document.body.appendChild(thanks);
      setTimeout(() => {
        thanks.style.transition = 'opacity 2s ease';
        thanks.style.opacity = '0';
        setTimeout(() => {
          thanks.remove();
          // Torna alla home e mostra icona libro
          document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
          document.getElementById('screen-splash').classList.add('active');
          const btn = document.getElementById('btn-knights-home');
          if (btn) btn.style.display = 'block';
        }, 2000);
      }, 3500);
    }, 2000);
  }, 5000);
};

// ── AGGANCIA triggerEnd per salvare cronaca e aggiornare progressione ──
const _origTriggerEnd = Game._getState; // riferimento per patch
(function() {
  // Patch triggerEnd via override del restart per salvare dati prima
  const origRestart = Game.restart.bind(Game);

  // Intercettiamo showScreen per catturare il momento in cui si va a screen-ending
  const origShowScreen = null; // non accessibile direttamente dall'esterno

  // Usiamo MutationObserver sulla schermata ending
  const endingEl = document.getElementById('screen-ending');
  if (endingEl) {
    const obs = new MutationObserver(() => {
      if (endingEl.classList.contains('active')) {
        const s = Game._getState();
        if (!s || !s.character || s._chronicleSaved) return;
        s._chronicleSaved = true;
        const won = s.character.objectiveCheck(s);
        const deathRes = won ? null : (() => {
          const r = s.resources;
          if (r.gold <= 0 || r.gold >= 100) return 'gold';
          if (r.faith <= 0 || r.faith >= 100) return 'faith';
          if (r.people <= 0 || r.people >= 100) return 'people';
          if (r.army <= 0 || r.army >= 100) return 'army';
          if (r.power <= 0 || r.power >= 100) return 'power';
          return null;
        })();
        saveChroniclEntry(won, s.character, s.resources, s.turn,
          Object.values(s.houses).filter(h => h.status === 'ally').length, deathRes);
        if (won) markCharCompleted(s.character.id);
        _updateCharGrid();
      }
    });
    obs.observe(endingEl, { attributes: true, attributeFilter: ['class'] });
  }
})();

// ── AGGIORNA GRIGLIA PERSONAGGI con oro e lucchetti ──
function _updateCharGrid() {
  const p = _getProgress();
  // Aggiorna nomi oro sui char-card già renderizzati
  document.querySelectorAll('.char-card').forEach(card => {
    const charId = card.dataset.charId;
    if (!charId) return;
    const nameEl = card.querySelector('.char-name');
    if (!nameEl) return;
    if (p.completed?.[charId]) nameEl.classList.add('char-name-gold');

    // Lucchetto
    const lockEl = card.querySelector('.char-locked-overlay');
    if (isCharLocked(charId)) {
      if (!lockEl) {
        const lock = document.createElement('div');
        lock.className = 'char-locked-overlay';
        lock.innerHTML = '🔒';
        lock.onclick = (e) => { e.stopPropagation(); _showLockPopup(charId); };
        card.style.position = 'relative';
        card.appendChild(lock);
      }
    } else {
      lockEl?.remove();
    }
  });

  // Oro sulle casate nella griglia (se visibile)
  Object.entries(HOUSE_CHARS).forEach(([house, chars]) => {
    const allDone = chars.every(id => p.completed?.[id]);
    if (!allDone) return;
    document.querySelectorAll(`[data-house="${house}"]`).forEach(el => {
      el.classList.add('house-name-gold');
      el.closest('.char-card')?.querySelector('.char-icon')?.classList.add('icon-gold-border');
    });
  });
}

function _showLockPopup(charId) {
  const lock = LOCKED_CHARS[charId];
  if (!lock) return;
  document.getElementById('lock-popup')?.remove();
  const popup = document.createElement('div');
  popup.id = 'lock-popup';
  popup.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:800;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);animation:fadeIn 0.25s ease';
  popup.innerHTML = `
    <div style="background:#12121a;border:1px solid rgba(201,168,76,0.4);border-radius:8px;width:88%;max-width:360px;padding:1.5rem;font-family:'Cinzel',serif;text-align:center">
      <div style="font-size:2.5rem;margin-bottom:0.5rem">🔒</div>
      <div style="font-family:'Cinzel Decorative',serif;color:#c9a84c;font-size:0.9rem;margin-bottom:0.5rem">Personaggio Bloccato</div>
      <div style="font-family:'EB Garamond',serif;font-size:0.9rem;color:#9a8a6a;line-height:1.6;margin-bottom:1.25rem;font-style:italic">
        «${lock.reason}»
      </div>
      <button onclick="document.getElementById('lock-popup').remove()" style="padding:0.6rem 2rem;background:transparent;border:1px solid rgba(201,168,76,0.4);border-radius:3px;font-family:'Cinzel',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:#c9a84c">Capito</button>
    </div>`;
  document.body.appendChild(popup);
}

// Inizializza all'avvio
window.addEventListener('load', () => {
  _checkKnightsBookUnlock();
  // data-charId sui char-card viene settato dopo showCharacterSelect
});

// Hook su showCharacterSelect per aggiornare la griglia dopo il render
const _origShowCharSelect = Game.showCharacterSelect.bind(Game);
Game.showCharacterSelect = function() {
  _origShowCharSelect();
  setTimeout(_updateCharGrid, 100);
};
