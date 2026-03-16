/* ============================================================
   IRON & ALLIANCES — game.js (Minimal Test Version)
   ============================================================ */

'use strict';

const Game = (() => {
  
  // Simple test functions
  function showCharacterSelect() {
    console.log('showCharacterSelect called');
  }
  
  function startGame() {
    console.log('startGame called');
  }
  
  function makeChoice(side) {
    console.log('makeChoice called with:', side);
  }

  // Return the Game object
  return {
    showCharacterSelect,
    startGame,
    makeChoice
  };
})();

// Test that Game is defined
console.log('Game object created:', typeof Game);
console.log('Game methods:', Object.keys(Game));
