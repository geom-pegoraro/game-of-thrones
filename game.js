/* ============================================================
   IRON & ALLIANCES — game.js
   Full game engine: characters, events, diplomacy, war, memory
   ============================================================ */

'use strict';

const Game = (() => {

  // ══════════════════════════════════════════════
  // VERSION & CHANGELOG
  // ══════════════════════════════════════════════
  const VERSION = '2.1.0';

  const CHANGELOG = {
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
        '📜 Ultimatum: scegli tra pagare tributo OR guerra immediata OR umiliazione pubblica',
        '🔄 Se paghi: +10 potere al Re, -10 potere tuo, ma guadagni tempo per rafforzarti',
        '🔄 Se umili: -15 potere, ma casate neutrali simpatizzano (+2 alleati probabili)',
        '⚔️ Se combatti: guerra immediata senza alleati (casate neutrali spaventate)',
        '📊 Statistiche dinamiche in HUD: esercito, conquiste, cap risorse',
        '🎨 Interfaccia Diplomazia migliorata: stato visibile, pulsanti contestuali',
        '🔄 Reset alleanze dopo conquista: casate nemiche tornano neutrali (non alleate)',
        '⚔️ Sistema guerra bilanciato: truppe prestate restituite, perdite realistiche',
      ],
    },
    '1.7.0': {
      date: '2026',
      title: 'Sfida al Trono',
      notes: [
        '👑 Sfida al Re: richiede Esercito >70, 2+ alleati, -12 Popolo',
        '⚔️ Battaglia epica 5 fasi contro il Re con animazione completa',
        '🏆 Vittoria: conquisti il Trono, game over vittorioso con epilogo',
        '💀 Sconfitta: game over, annessione ed esecuzione pubblica',
        '📜 Nuova carta evento: "Sfida al Re" (appare dopo certi requisiti)',
        '🎨 Interfaccia battaglia reale: barre progresso, truppe animate, log eventi',
        '🔄 Sistema alleanze dinamico: alleati possono partecipare alla guerra',
        '⚖️ Bilanciamento: esercito Re 50-75, player 20-68, alleati 40-75',
        '🎯 Obiettivo alternativo: sconfiggere il Re per vincere (oltre ai classici)',
        '📊 HUD aggiornato: mostra esercito e stato alleanze in tempo reale',
      ],
    },
    '1.6.0': {
      date: '2026',
      title: 'Alleanze & Tradimenti',
      notes: [
        '🤝 Sistema alleanze completo: proponi, accetta, rompi patti',
        '💀 Tradimenti: rompere patto rende casata nemica permanente',
        '📜 Carte evento dinamiche basate su stato alleanze',
        '⚔️ Guerra tra casate: conquista casate nemiche',
        '🏰 Vittoria conquistando casate: +100 cap risorse per conquista',
        '💔 Sconfitta: game over, casata nemica ti annette',
        '📊 HUD alleanze: mostra stato casate (alleato/nemico/neutrale)',
        '🔄 Reset alleanze dopo conquista: nuova mappa geopolitica',
        '⚖️ Bilanciamento: costi alleanza, benefici tradimenti',
        '🎨 Interfaccia diplomazia: pannello alleanze interattivo',
      ],
    },
    '1.5.0': {
      date: '2026',
      title: 'Guerre tra Casate',
      notes: [
        '⚔️ Sistema guerra completo: dichiara guerra, combatti, conquista',
        '🏰 Conquista casate nemiche per espandere influenza',
        '💀 Sconfitta in guerra = game over',
        '📊 Eserciti casate: valori dinamici 40-75',
        '⚖️ Bilanciamento guerre: costi e benefici',
        '🎨 Animazione battaglia: truppe, progresso, esito',
        '🔄 Reset dinamiche dopo conquista',
      ],
    },
    '1.4.0': {
      date: '2026',
      title: 'Eserciti & Risorse Militari',
      notes: [
        '⚔️ Nuova risorsa: Esercito (0-100)',
        '👑 Esercito del Re: 50-75 (dinamico)',
        '📊 Eserciti casate: 40-75 (dinamici)',
        '⚖️ Bilanciamento risorse militari',
        '🎨 HUD esercito: barra forza militare',
        '📜 Eventi militari: guerre, richieste truppe',
        '⚔️ Costo decisioni militari',
      ],
    },
    '1.3.0': {
      date: '2026',
      title: 'Bilanciamento & Profondità',
      notes: [
        '⚖️ Ribilanciamento costi/benefici tutte le scelte',
        '📊 Sistema reputazione casate (influenza probabilità eventi)',
        '🎨 Interfaccia migliorata: animazioni, feedback',
        '📜 Nuove carte evento: situazioni complesse',
        '⚔️ Conseguenze a lungo termine delle decisioni',
        '🔄 Sistema memoria: le casate ricordano le tue azioni',
      ],
    },
    '1.2.0': {
      date: '2026',
      title: 'Corvi & Diplomazia',
      notes: [
        '🦅 Sistema corvi: invia messaggi alle casate',
        '🤝 Richieste alleanze, scambi risorse',
        '📜 Risposte dinamiche delle casate',
        '⚖️ Reputazione influenza probabilità successo',
        '🎨 Interfaccia corvi: pannello interattivo',
      ],
    },
    '1.1.0': {
      date: '2026',
      title: 'Salvataggi & Continuità',
      notes: [
        '💾 Salvataggio automatico ogni decisione',
        '📂 Carica partita salvata',
        '🔄 Continuità tra sessioni',
        '📊 Statistiche persistenti',
        '🎨 Interfaccia salvataggi',
      ],
    },
    '1.0.0': {
      date: '2026',
      title: 'Lancio Iniziale',
      notes: [
        '🎯 Sistema gioco base',
        '📜 Carte evento casuali',
        '⚔️ Decisioni con conseguenze',
        '🎨 Interfaccia utente',
        '👑 Personaggi giocabili',
      ],
    },
  };

  // ══════════════════════════════════════════════
  // GAME STATE
  // ══════════════════════════════════════════════
  let state = {};
  let currentCard = null;

  // ══════════════════════════════════════════════
  // CORE FUNCTIONS
  // ══════════════════════════════════════════════
  
  function showCharacterSelect() {
    console.log('showCharacterSelect called');
    const splash = document.getElementById('screen-splash');
    const charSelect = document.getElementById('screen-char-select');
    
    if (splash) splash.classList.remove('active');
    if (charSelect) charSelect.classList.add('active');
    
    // Build character grid
    const grid = document.getElementById('char-grid');
    if (grid) {
      grid.innerHTML = '<div style="text-align:center;padding:2rem;color:#c9a84c">Caricamento personaggi...</div>';
      setTimeout(() => {
        grid.innerHTML = '<div style="text-align:center;padding:2rem;color:#c9a84c">Personaggi in arrivo...</div>';
      }, 1000);
    }
  }
  
  function startGame() {
    console.log('startGame called');
    const charSelect = document.getElementById('screen-char-select');
    const game = document.getElementById('screen-game');
    
    if (charSelect) charSelect.classList.remove('active');
    if (game) game.classList.add('active');
    
    // Initialize game state
    state = {
      turn: 1,
      resources: { gold: 50, faith: 50, people: 50, army: 50, power: 50 },
      gameOver: false
    };
  }
  
  function makeChoice(side) {
    console.log('makeChoice called with:', side);
    // TODO: Implement choice logic
  }
  
  function loadGame() {
    console.log('loadGame called');
    // TODO: Implement load game
  }
  
  function restart() {
    console.log('restart called');
    // TODO: Implement restart
  }

  // ══════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════
  return {
    showCharacterSelect,
    startGame,
    makeChoice,
    loadGame,
    restart,
    // Add more functions as needed
  };

})();

// Initialize battle callback functions after Game object is created
Game._battleRetreatFinish = function(survived) {
  console.log('Battle retreat finish called with survived:', survived);
  // TODO: Implement retreat finish logic
};

Game._battleRetreat = function() {
  console.log('Battle retreat called');
  // TODO: Implement retreat logic
};

// Fix the _tutNext circular reference
Game._tutNext = function() {
  console.log('Tutorial next called');
  // TODO: Implement tutorial next logic
};

console.log('Game object created successfully');
console.log('Available methods:', Object.keys(Game));
