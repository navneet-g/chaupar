// Game constants
export const BOARD_SIZE = 68;
export const SAFE_SQUARES = [8, 15, 22, 29, 36, 43, 50, 57, 64];
export const START_SQUARE = 1;
export const FINISH_SQUARE = 68;

// Player colors for the board
export const PLAYER_COLORS = {
  0: '#FF6B6B', // Red
  1: '#4ECDC4', // Teal
  2: '#45B7D1', // Blue
  3: '#96CEB4'  // Green
};

// Game state management
export class GameState {
  constructor(players, mode = 'multiplayer') {
    this.players = players;
    this.mode = mode;
    this.currentPlayer = 0;
    this.gameStatus = 'waiting';
    this.board = this.initializeBoard();
    this.diceHistory = [];
    this.moveHistory = [];
    this.winner = null;
  }

  initializeBoard() {
    const board = {};
    
    // Initialize player positions
    this.players.forEach((player, index) => {
      board[index] = {
        pieces: [0, 0, 0, 0], // 4 pieces per player, 0 means not started
        home: [],
        finished: []
      };
    });

    return board;
  }

  // Roll dice and return value
  rollDice() {
    const roll = Math.floor(Math.random() * 6) + 1;
    this.diceHistory.push({
      player: this.currentPlayer,
      value: roll,
      timestamp: Date.now()
    });
    return roll;
  }

  // Check if a player can start (needs a 6)
  canStart(playerId, diceValue) {
    return diceValue === 6 && this.board[playerId].pieces.every(piece => piece === 0);
  }

  // Check if a move is valid
  isValidMove(playerId, pieceIndex, diceValue) {
    const playerBoard = this.board[playerId];
    const currentPosition = playerBoard.pieces[pieceIndex];
    
    // If piece hasn't started, need a 6
    if (currentPosition === 0) {
      return diceValue === 6;
    }
    
    // Check if move would exceed finish
    const newPosition = currentPosition + diceValue;
    if (newPosition > FINISH_SQUARE) {
      return false;
    }
    
    return true;
  }

  // Make a move
  makeMove(playerId, pieceIndex, diceValue) {
    if (!this.isValidMove(playerId, pieceIndex, diceValue)) {
      return { success: false, error: 'Invalid move' };
    }

    const playerBoard = this.board[playerId];
    const currentPosition = playerBoard.pieces[pieceIndex];
    
    if (currentPosition === 0) {
      // Starting a piece
      playerBoard.pieces[pieceIndex] = START_SQUARE;
    } else {
      // Moving an existing piece
      const newPosition = currentPosition + diceValue;
      
      if (newPosition === FINISH_SQUARE) {
        // Piece finished
        playerBoard.finished.push(pieceIndex);
        playerBoard.pieces[pieceIndex] = -1; // Mark as finished
      } else {
        playerBoard.pieces[pieceIndex] = newPosition;
      }
    }

    // Check for captures
    this.checkCaptures(playerId, playerBoard.pieces[pieceIndex]);

    // Record move
    this.moveHistory.push({
      player: playerId,
      piece: pieceIndex,
      from: currentPosition,
      to: playerBoard.pieces[pieceIndex],
      diceValue,
      timestamp: Date.now()
    });

    return { success: true, newPosition: playerBoard.pieces[pieceIndex] };
  }

  // Check if any pieces were captured
  checkCaptures(playerId, position) {
    if (position === 0 || position === -1) return; // Not on board or finished

    this.players.forEach((otherPlayer, otherPlayerId) => {
      if (otherPlayerId === playerId) return; // Same player

      const otherPlayerBoard = this.board[otherPlayerId];
      otherPlayerBoard.pieces.forEach((piecePosition, pieceIndex) => {
        if (piecePosition === position && !SAFE_SQUARES.includes(position)) {
          // Capture the piece
          otherPlayerBoard.pieces[pieceIndex] = 0;
          this.moveHistory.push({
            type: 'capture',
            capturedPlayer: otherPlayerId,
            capturedPiece: pieceIndex,
            position,
            timestamp: Date.now()
          });
        }
      });
    });
  }

  // Check if game is over
  checkGameOver() {
    const finishedPlayers = this.players.map((_, playerId) => {
      const playerBoard = this.board[playerId];
      return playerBoard.finished.length === 4;
    });

    const winnerIndex = finishedPlayers.findIndex(finished => finished);
    if (winnerIndex !== -1) {
      this.gameStatus = 'finished';
      this.winner = winnerIndex;
      return { gameOver: true, winner: winnerIndex };
    }

    return { gameOver: false };
  }

  // Get next player
  nextPlayer() {
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    return this.currentPlayer;
  }

  // Get available moves for current player
  getAvailableMoves(playerId, diceValue) {
    const moves = [];
    const playerBoard = this.board[playerId];

    playerBoard.pieces.forEach((position, pieceIndex) => {
      if (this.isValidMove(playerId, pieceIndex, diceValue)) {
        moves.push({
          pieceIndex,
          currentPosition: position,
          newPosition: position === 0 ? START_SQUARE : Math.min(position + diceValue, FINISH_SQUARE)
        });
      }
    });

    return moves;
  }

  // Get game statistics
  getGameStats() {
    const stats = {
      totalMoves: this.moveHistory.length,
      totalRolls: this.diceHistory.length,
      captures: this.moveHistory.filter(move => move.type === 'capture').length,
      players: this.players.map((player, index) => ({
        name: player.name,
        piecesStarted: this.board[index].pieces.filter(pos => pos > 0).length,
        piecesFinished: this.board[index].finished.length,
        piecesHome: this.board[index].home.length
      }))
    };

    return stats;
  }
}

// AI logic for different skill levels
export class AI {
  constructor(skillLevel = 'basic') {
    this.skillLevel = skillLevel;
  }

  // Make AI decision
  makeDecision(gameState, availableMoves) {
    switch (this.skillLevel) {
      case 'basic':
        return this.basicAI(gameState, availableMoves);
      case 'intermediate':
        return this.intermediateAI(gameState, availableMoves);
      case 'advanced':
        return this.advancedAI(gameState, availableMoves);
      default:
        return this.basicAI(gameState, availableMoves);
    }
  }

  // Basic AI: random choice
  basicAI(gameState, availableMoves) {
    if (availableMoves.length === 0) return null;
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  // Intermediate AI: some strategy
  intermediateAI(gameState, availableMoves) {
    if (availableMoves.length === 0) return null;

    // Prioritize finishing pieces
    const finishingMoves = availableMoves.filter(move => 
      move.newPosition === FINISH_SQUARE
    );
    if (finishingMoves.length > 0) {
      return finishingMoves[0];
    }

    // Avoid moving pieces that are close to finish
    const safeMoves = availableMoves.filter(move => 
      move.currentPosition < FINISH_SQUARE - 6
    );
    if (safeMoves.length > 0) {
      return safeMoves[Math.floor(Math.random() * safeMoves.length)];
    }

    return availableMoves[0];
  }

  // Advanced AI: strategic thinking
  advancedAI(gameState, availableMoves) {
    if (availableMoves.length === 0) return null;

    // Score each move
    const scoredMoves = availableMoves.map(move => {
      let score = 0;

      // High score for finishing
      if (move.newPosition === FINISH_SQUARE) {
        score += 100;
      }

      // Score based on position (closer to finish = higher score)
      score += move.newPosition;

      // Bonus for safe squares
      if (SAFE_SQUARES.includes(move.newPosition)) {
        score += 20;
      }

      // Penalty for moving pieces that are close to finish
      if (move.currentPosition > FINISH_SQUARE - 6 && move.newPosition < FINISH_SQUARE) {
        score -= 30;
      }

      return { ...move, score };
    });

    // Return move with highest score
    scoredMoves.sort((a, b) => b.score - a.score);
    return scoredMoves[0];
  }
}

// Utility functions
export const isSafeSquare = (position) => {
  return SAFE_SQUARES.includes(position);
};

export const calculateDistance = (from, to) => {
  if (from === 0) return to;
  return to - from;
};

export const formatGameTime = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}:${minutes % 60}:${seconds % 60}`;
  }
  return `${minutes}:${seconds % 60}`;
};
