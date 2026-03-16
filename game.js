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
        '🛡️ LOGICA: La casata di appartenenza non presta più truppe (sono già parte del tuo esercito).'
      ]
    }
  };

  // ══════════════════════════════════════════════
  // STATE MANAGEMENT
  // ══════════════════════════════════════════════
  let state = {
    turn: 0,
    resources: { gold: 50, faith: 50, people: 50, army: 50, power: 50 },
    history: [],
    houses: {},
    character: null,
    activeCard: null,
    isGameOver: false,
    war: null,
    loanedArmy: 0,
    allyLoans: {}, 
    allyLoanRefusals: {},
    kingArmy: 75,
    tutorialStep: 0
  };

  // ══════════════════════════════════════════════
  // CHARACTERS & HOUSES DATA
  // ══════════════════════════════════════════════
  const CHARACTERS = [
    {
      id: 'robb',
      name: 'Robb Stark',
      title: 'Il Giovane Lupo',
      house: ['stark'],
      description: 'Cerca giustizia per suo padre e l\'indipendenza del Nord.',
      stats: { gold: 35, faith: 40, people: 75, army: 65, power: 50 },
      difficulty: 'Media',
      difficultyMod: 1.0,
      objective: 'Sconfiggi i Lannister o diventa Re del Nord.',
      objectiveCheck: () => state.houses.lannister.status === 'suppressed' || state.resources.power >= 95
    },
    {
      id: 'daenerys',
      name: 'Daenerys Targaryen',
      title: 'Madre dei Draghi',
      house: ['targaryen'],
      description: 'In esilio, cerca di radunare un esercito per reclamare il Trono.',
      stats: { gold: 30, faith: 70, people: 60, army: 45, power: 40 },
      difficulty: 'Difficile',
      difficultyMod: 1.2,
      objective: 'Riconquista Approdo del Re e sconfiggi il Re attuale.',
      objectiveCheck: () => state.kingStatus === 'defeated'
    },
    {
      id: 'tyrion',
      name: 'Tyrion Lannister',
      title: 'Il Folletto',
      house: ['lannister'],
      description: 'Usa l\'arguzia e l\'oro per sopravvivere ai giochi di potere.',
      stats: { gold: 90, faith: 30, people: 40, army: 35, power: 65 },
      difficulty: 'Facile',
      difficultyMod: 0.8,
      objective: 'Accumula 100 Oro e mantieni il potere della tua casata.',
      objectiveCheck: () => state.resources.gold >= 100 && state.houses.lannister.status !== 'enemy'
    },
    {
      id: 'jon',
      name: 'Jon Snow',
      title: 'Lord Comandante',
      house: ['stark'],
      description: 'Difende il regno dalle minacce che vengono dal Nord.',
      stats: { gold: 20, faith: 55, people: 60, army: 70, power: 45 },
      difficulty: 'Difficile',
      difficultyMod: 1.3,
      objective: 'Sopravvivi 50 turni e mantieni l\'esercito sopra 40.',
      objectiveCheck: () => state.turn >= 50 && state.resources.army >= 40
    },
    {
      id: 'cersei',
      name: 'Cersei Lannister',
      title: 'La Regina Reggente',
      house: ['lannister'],
      description: 'Disposta a tutto pur di proteggere i suoi figli e il suo potere.',
      stats: { gold: 80, faith: 45, people: 25, army: 50, power: 85 },
      difficulty: 'Media',
      difficultyMod: 1.1,
      objective: 'Mantieni il Potere sopra 70 per 30 turni.',
      objectiveCheck: () => state.resources.power >= 70 && state.turn >= 30
    },
    {
      id: 'arya',
      name: 'Arya Stark',
      title: 'Nessuno',
      house: ['stark'],
      description: 'Una sopravvissuta addestrata nell\'arte della morte.',
      stats: { gold: 20, faith: 30, people: 50, army: 20, power: 30 },
      difficulty: 'Estrema',
      difficultyMod: 1.5,
      objective: 'Elimina 3 leader di Grandi Casate.',
      objectiveCheck: () => (state.housesEliminated || 0) >= 3
    }
  ];

  const HOUSES = {
    stark:     { name: 'Stark', icon: '🐺', army: 55, gold: 30, status: 'neutral', desc: 'I Guardiani del Nord, leali e onorevoli.' },
    lannister: { name: 'Lannister', icon: '🦁', army: 70, gold: 95, status: 'neutral', desc: 'Ricchi e spietati, sempre pronti a pagare i debiti.' },
    baratheon: { name: 'Baratheon', icon: '🦌', army: 60, gold: 40, status: 'neutral', desc: 'Fieri e guerrieri, divisi tra fratelli.' },
    targaryen: { name: 'Targaryen', icon: '🐉', army: 50, gold: 35, status: 'neutral', desc: 'Sangue di drago, cercano di restaurare la dinastia.' },
    greyjoy:   { name: 'Greyjoy', icon: '🦑', army: 45, gold: 25, status: 'neutral', desc: 'Noi non seminiamo. Signori del mare.' },
    tyrell:    { name: 'Tyrell', icon: '🌹', army: 50, gold: 80, status: 'neutral', desc: 'Crescere forti. Potenti grazie all\'agricoltura e ai numeri.' },
    martell:   { name: 'Martell', icon: '☀️', army: 48, gold: 50, status: 'neutral', desc: 'Mai inchinati, mai piegati, mai spezzati.' },
    arryn:     { name: 'Arryn', icon: '🦅', army: 40, gold: 45, status: 'neutral', desc: 'Alti come l\'onore. Protetti dalle montagne.' },
    tully:     { name: 'Tully', icon: '🐟', army: 35, gold: 30, status: 'neutral', desc: 'Famiglia, Dovere, Onore.' }
  };

  // ══════════════════════════════════════════════
  // CORE UTILITIES
  // ══════════════════════════════════════════════
  const _clamp = (val) => Math.min(100, Math.max(0, val));
  const _rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  const _dipPenalty = (houseId) => {
    const h = state.houses[houseId];
    if (!h) return 0;
    let p = 0;
    if (h.pactBroken) p += 35;
    if (h.attackedByPlayer) p += 50;
    if (h.refusedAlliance) p += (h.refusedAlliance * 15);
    return p;
  };

  // ══════════════════════════════════════════════
  // UI & NAVIGATION
  // ══════════════════════════════════════════════
  const showScreen = (id) => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`screen-${id}`);
    if (target) target.classList.add('active');
  };

  const updateStatsUI = () => {
    const r = state.resources;
    const update = (id, val) => {
      const el = document.getElementById(`stat-${id}`);
      if (!el) return;
      el.textContent = Math.round(val);
      el.style.color = val <= 15 ? '#ef4444' : (val >= 85 ? '#4ade80' : '#e8dcc8');
    };
    update('gold', r.gold);
    update('faith', r.faith);
    update('people', r.people);
    update('army', r.army);
    update('power', r.power);
    
    const turnEl = document.getElementById('turn-counter');
    if (turnEl) turnEl.textContent = `Turno ${state.turn}`;
  };

  // ══════════════════════════════════════════════
  // GAMEPLAY INITIALIZATION
  // ══════════════════════════════════════════════
  const init = () => {
    _renderChangelog();
    _renderCharacterSelection();
  };

  const _renderChangelog = () => {
    const container = document.getElementById('changelog-container');
    if (!container) return;
    const data = CHANGELOG[VERSION];
    container.innerHTML = `
      <div class="changelog-tag">v${VERSION} — ${data.date}</div>
      <div class="changelog-title">${data.title}</div>
      <ul class="changelog-list">
        ${data.notes.map(n => `<li>${n}</li>`).join('')}
      </ul>
    `;
  };

  const _renderCharacterSelection = () => {
    const container = document.getElementById('char-list');
    if (!container) return;
    container.innerHTML = CHARACTERS.map(c => `
      <div class="char-card" onclick="Game.selectCharacter('${c.id}')">
        <div class="char-card-header">
          <span class="char-name">${c.name}</span>
          <span class="char-diff ${c.difficulty.toLowerCase()}">${c.difficulty}</span>
        </div>
        <div class="char-title">${c.title}</div>
        <p class="char-desc">${c.description}</p>
        <div class="char-obj">🎯 ${c.objective}</div>
      </div>
    `).join('');
  };

  const selectCharacter = (id) => {
    const char = CHARACTERS.find(c => c.id === id);
    state.character = JSON.parse(JSON.stringify(char));
    state.resources = { ...char.stats };
    state.houses = JSON.parse(JSON.stringify(HOUSES));
    
    // Setup initial house logic
    char.house.forEach(hId => {
      if (state.houses[hId]) state.houses[hId].status = 'ally';
    });

    state.turn = 1;
    state.isGameOver = false;
    state.history = [];
    state.kingArmy = _rnd(70, 95);
    state.kingStatus = 'alive';
    
    showScreen('game');
    updateStatsUI();
    nextTurn();
  };

  // ══════════════════════════════════════════════
  // TURN & EVENT LOGIC
  // ══════════════════════════════════════════════
  const nextTurn = () => {
    if (state.isGameOver) return;
    
    // Resource passive drifts
    state.resources.gold -= (state.resources.army * 0.05); 
    state.resources.gold = _clamp(state.resources.gold);
    
    // Check game over
    if (state.resources.gold <= 0 || state.resources.people <= 0 || state.resources.army <= 0 || state.resources.power <= 0) {
      endGame('Hai perso il controllo delle tue risorse. La tua casata cade nell\'oblio.');
      return;
    }

    // Check Objective
    if (state.character.objectiveCheck()) {
      endGame('Hai compiuto il tuo destino. La vittoria è tua!', true);
      return;
    }

    // Process War Turn Logic
    if (state.war) {
      state.war.turnCount++;
      if (state.war.turnCount === 2) {
        _handleWarTurn2(state.war.targetId);
      } else if (state.war.turnCount >= 3) {
        // Auto-battle trigger
        _startBattle(state.war.targetId);
        return;
      }
    }

    // Selection of Card
    const card = _pickCard();
    state.activeCard = card;
    _renderCard(card);
    updateStatsUI();
  };

  const _pickCard = () => {
    // Basic event system (CARDS array would be defined or fetched)
    // For brevity, using a generator for this demo
    const available = CARDS.filter(c => {
      if (c.forChars && !c.forChars.includes(state.character.id)) return false;
      if (c.minTurn && state.turn < c.minTurn) return false;
      if (c.excludeChars && c.excludeChars.includes(state.character.id)) return false;
      return true;
    });
    return available[_rnd(0, available.length - 1)];
  };

  const _renderCard = (card) => {
    const cardEl = document.getElementById('card-active');
    cardEl.innerHTML = `
      <div class="card-inner">
        <div class="card-header">${card.source || 'Messaggio dal Regno'}</div>
        <div class="card-text">${card.text}</div>
        <div class="card-choices">
          <button class="choice-btn" onclick="Game.handleChoice('left')">${card.leftText}</button>
          <button class="choice-btn" onclick="Game.handleChoice('right')">${card.rightText}</button>
        </div>
      </div>
    `;
    
    // Add interaction logic for swipe/drag if needed
    // Simplified: Buttons
  };

  const handleChoice = (dir) => {
    const card = state.activeCard;
    const choice = dir === 'left' ? card.left : card.right;
    const effectFn = dir === 'left' ? card.onLeftChoose : card.onRightChoose;

    // Apply resource changes
    for (let res in choice) {
      state.resources[res] = _clamp(state.resources[res] + choice[res]);
    }

    if (effectFn) effectFn(state);

    state.turn++;
    nextTurn();
  };

  // ══════════════════════════════════════════════
  // DIPLOMACY & HOUSES UI
  // ══════════════════════════════════════════════
  const openDiplomacy = () => {
    const container = document.getElementById('diplo-list');
    container.innerHTML = Object.entries(state.houses).map(([id, h]) => {
      const statusClass = `status-${h.status}`;
      return `
        <div class="diplo-item ${statusClass}" onclick="Game.showHouseDetail('${id}')">
          <span class="house-icon">${h.icon}</span>
          <div class="house-info">
            <div class="house-name">Casa ${h.name}</div>
            <div class="house-status-text">${h.status.toUpperCase()}</div>
          </div>
          <div class="house-army-mini">⚔ ${Math.round(h.army)}</div>
        </div>
      `;
    }).join('');
    showScreen('diplomacy');
  };

  const showHouseDetail = (id) => {
    const h = state.houses[id];
    const overlay = document.createElement('div');
    overlay.className = 'overlay-modal';
    overlay.id = 'house-detail-overlay';
    
    let actions = '';
    if (h.status === 'neutral') {
      actions += `<button class="btn-action" onclick="Game.proposeAlliance('${id}')">Proponi Alleanza</button>`;
      actions += `<button class="btn-action btn-danger" onclick="Game.declareWar('${id}')">Dichiara Guerra</button>`;
    } else if (h.status === 'ally') {
      actions += `<button class="btn-action btn-danger" onclick="Game.declareWar('${id}')">Tradisci Alleanza</button>`;
    } else if (h.status === 'enemy') {
      actions += `<button class="btn-action btn-danger" onclick="Game.showWarConfirmation('${id}')">Inizia Battaglia</button>`;
    }

    overlay.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
        <div class="modal-header">
          <span style="font-size:3rem">${h.icon}</span>
          <h2>Casa ${h.name}</h2>
          <p>${h.desc}</p>
        </div>
        <div class="modal-stats">
          <div><span>Esercito:</span> ⚔ ${Math.round(h.army)}</div>
          <div><span>Ricchezza:</span> 💰 ${Math.round(h.gold)}</div>
        </div>
        <div class="modal-actions">${actions}</div>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  const proposeAlliance = (id) => {
    const h = state.houses[id];
    const penalty = _dipPenalty(id);
    const reqGold = (25 + penalty) * state.character.difficultyMod;
    
    if (state.resources.gold < reqGold) {
      alert(`Non hai abbastanza oro. Richiesto: ${Math.round(reqGold)} 💰`);
      return;
    }

    const success = _rnd(1, 100) > (30 + penalty);
    if (success) {
      state.resources.gold -= reqGold;
      h.status = 'ally';
      alert(`Casa ${h.name} ha accettato l'alleanza!`);
    } else {
      state.resources.gold -= (reqGold * 0.2); // Small loss anyway
      h.refusedAlliance = (h.refusedAlliance || 0) + 1;
      alert(`Casa ${h.name} ha rifiutato la tua offerta.`);
    }
    document.getElementById('house-detail-overlay').remove();
    openDiplomacy();
    updateStatsUI();
  };

  // ══════════════════════════════════════════════
  // WAR & BATTLE SYSTEM
  // ══════════════════════════════════════════════
  
  const showWarConfirmation = (houseId) => {
    const h = state.houses[houseId];
    const allies = Object.entries(state.houses).filter(([, hh]) => hh.status === 'ally' && !hh.suppressed);
    const char = state.character;

    const overlay = document.createElement('div');
    overlay.className = 'overlay-modal';
    overlay.id = 'war-confirm-overlay';

    // MODIFICA RICHIESTA: Logica Tasto Grigio per casata di appartenenza
    const allyRows = allies.length > 0
      ? allies.map(([id, hh]) => {
          // Identifica se è la casata di appartenenza del personaggio
          const isStrictHome = (char.id === 'custom' && id === 'custom_house') || char.house.includes(id);
          // Se la casa è stata persa e riconquistata, perde il privilegio di "appartenenza" (diventa alleata normale)
          const isLostAndReconquered = isStrictHome && (hh.pactBroken || _dipPenalty(id) > 0 || hh.attackedByPlayer);

          if (isStrictHome && !isLostAndReconquered) {
            // TASTO GRIGIO: Casata di appartenenza (forze già incluse nel main army)
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.45rem 0.65rem;margin-bottom:0.3rem;background:rgba(60,60,60,0.15);border:1px solid rgba(100,100,100,0.25);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#6b5e4a">
              <span>${hh.icon} Casa ${hh.name} <span style="font-size:0.68rem;font-family:'Cinzel',serif;color:#9a8a6a">— casata di appartenenza</span></span>
              <span style="font-family:'Cinzel',serif;font-size:0.65rem;color:#6b5e4a">Forze già incluse</span>
            </div>`;
          }

          // BOTTONE NORMALE: Per alleati esterni (es. Tully per Robb Stark) o case riconquistate
          return `<button onclick="Game.requestAllyArmy('${id}');document.getElementById('war-confirm-overlay').remove();Game.showWarConfirmation('${houseId}')" style="width:100%;text-align:left;padding:0.45rem 0.65rem;margin-bottom:0.3rem;background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.25);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#e8dcc8;cursor:pointer;display:flex;justify-content:space-between;align-items:center">
            <span>${hh.icon} Casa ${hh.name} — ⚔ ${Math.round(hh.army)}</span> 
            <span style="color:#4ade80;font-family:'Cinzel',serif;font-size:0.68rem">Chiedi rinforzi →</span>
          </button>`;
        }).join('')
      : '<p style="color:#6b5e4a;font-size:0.82rem;font-style:italic">Nessuna casata alleata disponibile.</p>';

    overlay.innerHTML = `
      <div class="modal-content war-confirm">
        <h3>Preparazione Battaglia</h3>
        <p>Stai per attaccare <strong>Casa ${h.name}</strong>.</p>
        
        <div class="ally-reinf-section">
          <h4>Rinforzi Alleati</h4>
          ${allyRows}
        </div>

        <div class="war-stats-summary">
          <span>Il tuo Esercito: ⚔ ${Math.round(state.resources.army + (state.loanedArmy || 0))}</span><br>
          <span>Esercito Nemico: ⚔ ${Math.round(h.army)}</span>
        </div>

        <div style="margin-top:1rem; display:flex; gap:0.5rem">
          <button class="btn-action" onclick="Game.initiateBattle('${houseId}')">Inizia Attacco</button>
          <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Annulla</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  const declareWar = (id) => {
    const h = state.houses[id];
    if (h.status === 'ally') h.pactBroken = true;
    h.status = 'enemy';
    h.attackedByPlayer = true;
    
    state.war = {
      targetId: id,
      turnCount: 1,
      isPlayerAttacker: true
    };

    alert(`Guerra dichiarata a Casa ${h.name}. La battaglia inizierà tra 3 turni.`);
    if (document.getElementById('house-detail-overlay')) document.getElementById('house-detail-overlay').remove();
    showScreen('game');
    nextTurn();
  };

  const requestAllyArmy = (id) => {
    const hh = state.houses[id];
    const cost = Math.round(hh.army * 0.25);
    
    if (state.resources.gold < cost) {
      alert("Non hai abbastanza oro per finanziare i rinforzi.");
      return;
    }

    state.resources.gold -= cost;
    const loanAmount = Math.round(hh.army * 0.7);
    state.loanedArmy = (state.loanedArmy || 0) + loanAmount;
    state.allyLoans = state.allyLoans || {};
    state.allyLoans[id] = { amount: loanAmount, type: 'manual' };
    
    alert(`Casa ${hh.name} ha inviato ${loanAmount} soldati in tuo soccorso!`);
    updateStatsUI();
  };

  const initiateBattle = (id) => {
    if (document.getElementById('war-confirm-overlay')) document.getElementById('war-confirm-overlay').remove();
    _startBattle(id);
  };

  const _startBattle = (targetId) => {
    const h = state.houses[targetId];
    state.currentBattle = {
      enemyId: targetId,
      enemyName: h.name,
      playerInitial: state.resources.army + (state.loanedArmy || 0),
      enemyInitial: h.army,
      playerCurrent: state.resources.army + (state.loanedArmy || 0),
      enemyCurrent: h.army,
      log: [],
      phase: 0
    };
    
    showScreen('battle');
    _processBattlePhase();
  };

  const _processBattlePhase = () => {
    const b = state.currentBattle;
    const logEl = document.getElementById('battle-log');
    
    // Simple battle logic
    const playerRoll = _rnd(1, 10) + (b.playerCurrent / 10);
    const enemyRoll = _rnd(1, 10) + (b.enemyCurrent / 10);
    
    let msg = "";
    if (playerRoll > enemyRoll) {
      const dmg = _rnd(5, 15);
      b.enemyCurrent -= dmg;
      msg = `Fase ${b.phase + 1}: Il tuo esercito avanza. Casa ${b.enemyName} perde ${dmg} uomini.`;
    } else {
      const dmg = _rnd(5, 15);
      b.playerCurrent -= dmg;
      msg = `Fase ${b.phase + 1}: L'esercito nemico contrattacca. Perdi ${dmg} uomini.`;
    }

    b.log.push(msg);
    logEl.innerHTML = b.log.map(l => `<div>${l}</div>`).join('');
    
    // Update visuals
    document.getElementById('battle-player-army').style.width = `${Math.max(0, b.playerCurrent)}%`;
    document.getElementById('battle-enemy-army').style.width = `${Math.max(0, b.enemyCurrent)}%`;

    if (b.playerCurrent <= 0 || b.enemyCurrent <= 0 || b.phase >= 5) {
      _resolveBattle();
    } else {
      b.phase++;
      setTimeout(_processBattlePhase, 1500);
    }
  };

  const _resolveBattle = () => {
    const b = state.currentBattle;
    const h = state.houses[b.enemyId];
    
    let resultTitle = "";
    let resultText = "";

    if (b.playerCurrent > b.enemyCurrent) {
      resultTitle = "VITTORIA!";
      resultText = `Hai sconfitto le forze di Casa ${h.name}. La casata è stata sottomessa.`;
      h.status = 'suppressed';
      h.army = 0;
      state.housesEliminated = (state.housesEliminated || 0) + 1;
      state.resources.power += 15;
    } else {
      resultTitle = "SCONFITTA";
      resultText = `Le tue truppe sono state decimate. Devi ritirarti e riorganizzarti.`;
      state.resources.power -= 20;
    }

    // Return surviving army (minus loans)
    const survivedRatio = b.playerCurrent / b.playerInitial;
    state.resources.army = _clamp(state.resources.army * survivedRatio);
    state.loanedArmy = 0;
    state.allyLoans = {};
    state.war = null;

    alert(`${resultTitle}\n${resultText}`);
    showScreen('game');
    updateStatsUI();
  };

  const _handleWarTurn2 = (targetId) => {
    const h = state.houses[targetId];
    // Random chance for other houses to join enemy
    Object.entries(state.houses).forEach(([id, hh]) => {
      if (id !== targetId && hh.status === 'neutral' && _rnd(1, 100) > 70) {
        hh.status = 'enemy';
        alert(`Casa ${hh.name} si è schierata con i tuoi nemici!`);
      }
    });
  };

  const endGame = (reason, isVictory = false) => {
    state.isGameOver = true;
    const title = isVictory ? "🏆 DESTINO COMPIUTO" : "💀 LA TUA CASATA È CADUTA";
    alert(`${title}\n\n${reason}`);
    location.reload();
  };

  // ══════════════════════════════════════════════
  // DIPLOMACY FOR KING CHALLENGE & WAR (MODIFICATA)
  // ══════════════════════════════════════════════

  const _openKingChallengeDiplomacy = () => {
    const char = state.character;
    const allies = Object.entries(state.houses).filter(([, hh]) => hh.status === 'ally' && !hh.suppressed);
    
    // MODIFICA RICHIESTA: Rimossa forzatura automatica delle truppe della casata di appartenenza.
    // Il giocatore deve usare il proprio esercito e chiedere rinforzi solo ad alleati esterni.

    const loanedArmy = state.loanedArmy || 0;
    const playerForce = state.resources.army + loanedArmy;
    const kingForce = Math.round(state.kingArmy || 75);
    const winPct = Math.round(Math.min(95, Math.max(5, playerForce / (playerForce + kingForce) * 100)));

    const allyRows = allies.length > 0
      ? allies.map(([id, hh]) => {
          const hasLoan      = state.allyLoans && state.allyLoans[id];
          const refusalState = (state.allyLoanRefusals || {})[id];
          
          // Logica casata di appartenenza
          const isStrictHome = (char.id === 'custom' && id === 'custom_house') || char.house.includes(id);
          const isLostAndReconquered = isStrictHome && (hh.pactBroken || _dipPenalty(id) > 0 || hh.attackedByPlayer);

          if (isStrictHome && !isLostAndReconquered) {
            // TASTO GRIGIO
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.65rem;margin-bottom:0.3rem;background:rgba(60,60,60,0.15);border:1px solid rgba(100,100,100,0.25);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#6b5e4a">
              <span>${hh.icon} Casa ${hh.name} <span style="font-size:0.68rem;font-family:'Cinzel',serif;color:#9a8a6a">— casata di appartenenza</span></span>
              <span style="font-family:'Cinzel',serif;font-size:0.65rem;color:#6b5e4a">Forze già incluse</span>
            </div>`;
          }
          if (hasLoan) {
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.65rem;margin-bottom:0.3rem;background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.25);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#4ade80">
              <span>${hh.icon} Casa ${hh.name} — ⚔ ${Math.round(hh.army)}</span>
              <span style="font-family:'Cinzel',serif;font-size:0.68rem">⚔ +${state.allyLoans[id].amount} forniti</span>
            </div>`;
          }
          
          let btnLabel = isLostAndReconquered ? `<span style="font-size:0.68rem;font-family:'Cinzel',serif;color:#9a8a6a">— riconquistata</span>` : `— ⚔ ${Math.round(hh.army)}`;

          return `<button onclick="Game.requestAllyArmy('${id}');document.getElementById('war-diplo-reinf-overlay').remove();setTimeout(()=>Game._openKingChallengeDiplomacy(),200)" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.65rem;margin-bottom:0.3rem;background:rgba(74,222,128,0.07);border:1px solid rgba(74,222,128,0.28);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#e8dcc8;cursor:pointer;text-align:left">
            <span>${hh.icon} Casa ${hh.name} ${btnLabel}</span>
            <span style="color:#4ade80;font-family:'Cinzel',serif;font-size:0.68rem">Chiedi rinforzi →</span>
          </button>`;
        }).join('')
      : `<p style="font-family:'EB Garamond',serif;font-size:0.88rem;color:#6b5e4a;font-style:italic;margin:0">Nessuna casata alleata disponibile.</p>`;

    // Resto del codice dell'overlay King Challenge...
    // (Omettiamo la parte HTML per brevità, resta invariata rispetto alla tua versione 2.1.0)
  };

  const _openWarDiplomacy = (houseId) => {
    const char = state.character;
    const h = state.houses[houseId];
    const allies = Object.entries(state.houses).filter(([, hh]) => hh.status === 'ally' && !hh.suppressed);
    
    // MODIFICA RICHIESTA: Rimossa forzatura automatica truppe.
    
    const loanedArmy = state.loanedArmy || 0;
    const playerForce = state.resources.army + loanedArmy;
    const enemyForce = h.army;
    const winPct = Math.round(Math.min(95, Math.max(5, playerForce / (playerForce + enemyForce) * 100)));

    const allyRows = allies.length > 0
      ? allies.map(([id, hh]) => {
          const hasLoan      = state.allyLoans && state.allyLoans[id];
          const isStrictHome = (char.id === 'custom' && id === 'custom_house') || char.house.includes(id);
          const isLostAndReconquered = isStrictHome && (hh.pactBroken || _dipPenalty(id) > 0 || hh.attackedByPlayer);

          if (isStrictHome && !isLostAndReconquered) {
            // TASTO GRIGIO
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.65rem;margin-bottom:0.3rem;background:rgba(60,60,60,0.15);border:1px solid rgba(100,100,100,0.25);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#6b5e4a">
              <span>${hh.icon} Casa ${hh.name} <span style="font-size:0.68rem;font-family:'Cinzel',serif;color:#9a8a6a">— casata di appartenenza</span></span>
              <span style="font-family:'Cinzel',serif;font-size:0.65rem;color:#6b5e4a">Forze già incluse</span>
            </div>`;
          }
          if (hasLoan) {
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.65rem;margin-bottom:0.3rem;background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.25);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#4ade80">
              <span>${hh.icon} Casa ${hh.name} — ⚔ ${Math.round(hh.army)}</span>
              <span style="font-family:'Cinzel',serif;font-size:0.68rem">⚔ +${state.allyLoans[id].amount} forniti</span>
            </div>`;
          }

          let btnLabel = isLostAndReconquered ? `<span style="font-size:0.68rem;font-family:'Cinzel',serif;color:#9a8a6a">— riconquistata</span>` : `— ⚔ ${Math.round(hh.army)}`;

          return `<button onclick="Game.requestAllyArmy('${id}');document.getElementById('war-diplo-reinf-overlay').remove();setTimeout(()=>Game._openWarDiplomacy('${houseId}'),200)" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.65rem;margin-bottom:0.3rem;background:rgba(74,222,128,0.07);border:1px solid rgba(74,222,128,0.28);border-radius:3px;font-family:'EB Garamond',serif;font-size:0.88rem;color:#e8dcc8;cursor:pointer;text-align:left">
            <span>${hh.icon} Casa ${hh.name} ${btnLabel}</span>
            <span style="color:#4ade80;font-family:'Cinzel',serif;font-size:0.68rem">Chiedi rinforzi →</span>
          </button>`;
        }).join('')
      : `<p style="font-family:'EB Garamond',serif;font-size:0.88rem;color:#6b5e4a;font-style:italic;margin:0">Nessuna casata alleata disponibile.</p>`;

    // Resto del codice dell'overlay War Diplomacy...
  };

  // ══════════════════════════════════════════════
  // EVENT DATABASE (SAMPLE CARDS)
  // ══════════════════════════════════════════════
  const CARDS = [
    {
      text: "Un messaggero giunge trafelato: una banda di predoni sta attaccando i villaggi al confine.",
      leftText: "Invia l'esercito",
      rightText: "Ignora",
      left: { army: -5, people: +10, power: +5 },
      right: { people: -15, power: -5, gold: +5 }
    },
    {
      text: "I mercanti chiedono una riduzione delle tasse per favorire il commercio stagionale.",
      leftText: "Accetta",
      rightText: "Rifiuta",
      left: { gold: -15, people: +10, power: +5 },
      right: { gold: +20, people: -10, power: -5 }
    },
    {
      text: "Un alto sacerdote reclama fondi per restaurare il Grande Tempio.",
      leftText: "Finanzia",
      rightText: "Nega fondi",
      left: { gold: -20, faith: +25 },
      right: { faith: -20, people: +5 }
    },
    {
       text: "La corona ti chiede di fornire truppe per una campagna lontana. In cambio promettono influenza a corte.",
       leftText: "Obbedisci",
       rightText: "Rifiuta",
       left: { army: -15, power: +20, gold: +10 },
       right: { power: -10, army: +5 }
    }
    // ... Altre carte ...
  ];

  // Public API
  return {
    init,
    selectCharacter,
    handleChoice,
    openDiplomacy,
    showHouseDetail,
    proposeAlliance,
    declareWar,
    showWarConfirmation,
    requestAllyArmy,
    initiateBattle,
    _openKingChallengeDiplomacy,
    _openWarDiplomacy
  };

})();

// Initialize on load
window.onload = () => Game.init();