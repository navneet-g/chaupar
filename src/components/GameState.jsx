// Integrated Game State Management Component
// Bridges the gap between UI and Chaupar rules

import { useState, useEffect } from 'react';
import { ChauparGameState } from '../utils/chauparRules';

export const useChauparGame = () => {
  const [gameState, setGameState] = useState(null);
  const [gameInstance, setGameInstance] = useState(null);
  
  // Initialize game
  const initializeGame = (mode = 'ai', aiConfig = {}) => {
    const newGame = new ChauparGameState();
    
    if (mode === 'ai') {
      // Setup AI player
      newGame.players[1] = {
        ...newGame.players[1],
        isAI: true,
        skillLevel: aiConfig.skillLevel || 'intermediate',
        aiProvider: aiConfig.aiProvider || 'ollama'
      };
      newGame.gameStatus = 'playing';
    }
    
    setGameInstance(newGame);
    setGameState({
      players: newGame.players,
      currentPlayer: newGame.currentPlayer,
      gameStatus: newGame.gameStatus,
      lastThrow: newGame.lastThrow,
      moveHistory: newGame.moveHistory
    });
    
    return newGame;
  };
  
  // Throw cowrie shells
  const throwCowries = () => {
    if (!gameInstance) return null;
    
    const result = gameInstance.throwCowrieShells();
    updateGameState();
    return result;
  };
  
  // Make a move
  const makeMove = (playerId, pieceIndex) => {
    if (!gameInstance || !gameInstance.lastThrow) return false;
    
    const canMove = gameInstance.canMovePiece(playerId, pieceIndex, gameInstance.lastThrow.score);
    if (canMove) {
      gameInstance.movePiece(playerId, pieceIndex, gameInstance.lastThrow.score);
      updateGameState();
      return true;
    }
    return false;
  };
  
  // Get available moves
  const getAvailableMoves = (playerId) => {
    if (!gameInstance || !gameInstance.lastThrow) return [];
    return gameInstance.getAvailableMoves(playerId, gameInstance.lastThrow.score);
  };
  
  // End turn
  const endTurn = () => {
    if (!gameInstance) return;
    
    gameInstance.nextTurn();
    updateGameState();
  };
  
  // Update local state from game instance
  const updateGameState = () => {
    if (!gameInstance) return;
    
    setGameState({
      players: gameInstance.players,
      currentPlayer: gameInstance.currentPlayer,
      gameStatus: gameInstance.gameStatus,
      lastThrow: gameInstance.lastThrow,
      moveHistory: gameInstance.moveHistory,
      gameStats: gameInstance.getGameStats()
    });
  };
  
  // Check game over
  const checkGameOver = () => {
    if (!gameInstance) return { gameOver: false };
    return gameInstance.checkGameOver();
  };
  
  return {
    gameState,
    gameInstance,
    initializeGame,
    throwCowries,
    makeMove,
    getAvailableMoves,
    endTurn,
    checkGameOver,
    updateGameState
  };
};

export default useChauparGame;
