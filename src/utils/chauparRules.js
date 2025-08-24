// Traditional Chaupar Rules Implementation
// Based on: https://en.wikipedia.org/wiki/Chaupar

export const CHAUPAR_RULES = {
  // Game constants
  BOARD_SIZE: 68,
  PLAYERS: 2,
  PIECES_PER_PLAYER: 4,
  
  // Traditional scoring for cowrie shells
  COWRIE_SCORES: {
    '0-7': 7,    // All 7 facing down
    '1-6': 10,   // 1 facing up, 6 facing down
    '2-5': 2,    // 2 facing up, 5 facing down
    '3-4': 3,    // 3 facing up, 4 facing down
    '4-3': 4,    // 4 facing up, 3 facing down
    '5-2': 25,   // 5 facing up, 2 facing down
    '6-1': 30,   // 6 facing up, 1 facing down
    '7-0': 14    // All 7 facing up
  },
  
  // High throws that allow starting pieces
  HIGH_THROWS: [10, 25, 30],
  
  // Safe squares (flower motifs)
  SAFE_SQUARES: [8, 15, 22, 29, 36, 43, 50, 57, 64],
  
  // Special moves
  SPECIAL_MOVES: {
    '25': 8,   // "aanth ghar pacchees" - move 8 for throw of 25
    '30': 13   // "tehr ghar trees" - move 13 for throw of 30
  }
};

// Game state class for Chaupar
export class ChauparGameState {
  constructor() {
    this.players = [
      { id: 0, name: 'Player 1', pieces: this.initializePieces(), hasThore: false },
      { id: 1, name: 'AI Opponent', pieces: this.initializePieces(), hasThore: false, isAI: true }
    ];
    this.currentPlayer = 0;
    this.gameStatus = 'waiting';
    this.lastThrow = null;
    this.consecutiveHighThrows = 0;
    this.moveHistory = [];
  }

  initializePieces() {
    return [
      { position: 0, status: 'home', canMove: false },
      { position: 0, status: 'home', canMove: false },
      { position: 0, status: 'home', canMove: false },
      { position: 0, status: 'home', canMove: false }
    ];
  }

  // Simulate cowrie shell throw
  throwCowrieShells() {
    // Simulate 7 cowrie shells
    const facingUp = Math.floor(Math.random() * 8); // 0-7 shells facing up
    const facingDown = 7 - facingUp;
    
    const score = CHAUPAR_RULES.COWRIE_SCORES[`${facingUp}-${facingDown}`];
    
    this.lastThrow = {
      score,
      facingUp,
      facingDown,
      isHighThrow: CHAUPAR_RULES.HIGH_THROWS.includes(score)
    };

    // Check for consecutive high throws
    if (this.lastThrow.isHighThrow) {
      this.consecutiveHighThrows++;
      if (this.consecutiveHighThrows >= 3) {
        // "Beli jaye" - burn up, lose turn
        this.consecutiveHighThrows = 0;
        this.nextTurn();
        return { ...this.lastThrow, burned: true };
      }
    } else {
      this.consecutiveHighThrows = 0;
    }

    return this.lastThrow;
  }

  // Check if player can start a piece
  canStartPiece(playerId, throwScore) {
    if (!CHAUPAR_RULES.HIGH_THROWS.includes(throwScore)) {
      return false;
    }
    
    const player = this.players[playerId];
    return player.pieces.some(piece => piece.status === 'home');
  }

  // Check if player can move a piece
  canMovePiece(playerId, pieceIndex, throwScore) {
    const player = this.players[playerId];
    const piece = player.pieces[pieceIndex];
    
    if (piece.status === 'finished') return false;
    
    if (piece.status === 'home') {
      return CHAUPAR_RULES.HIGH_THROWS.includes(throwScore);
    }
    
    // Check if move would exceed board
    const newPosition = piece.position + throwScore;
    return newPosition <= CHAUPAR_RULES.BOARD_SIZE;
  }

  // Move a piece
  movePiece(playerId, pieceIndex, throwScore) {
    const player = this.players[playerId];
    const piece = player.pieces[pieceIndex];
    
    if (piece.status === 'home') {
      // Starting a piece
      piece.status = 'playing';
      piece.position = 1;
      piece.canMove = true;
    } else {
      // Moving an existing piece
      const newPosition = piece.position + throwScore;
      
      // Check for special moves
      if (CHAUPAR_RULES.SPECIAL_MOVES[throwScore]) {
        piece.position = newPosition;
      } else {
        piece.position = newPosition;
      }
      
      // Check if piece finished
      if (piece.position >= CHAUPAR_RULES.BOARD_SIZE) {
        piece.status = 'finished';
        piece.position = CHAUPAR_RULES.BOARD_SIZE;
        piece.canMove = false;
      }
    }
    
    // Check for captures
    this.checkCaptures(playerId, piece.position);
    
    // Record move
    this.moveHistory.push({
      player: playerId,
      piece: pieceIndex,
      from: piece.status === 'home' ? 0 : piece.position - throwScore,
      to: piece.position,
      throwScore,
      timestamp: Date.now()
    });
  }

  // Check for captures
  checkCaptures(playerId, position) {
    if (CHAUPAR_RULES.SAFE_SQUARES.includes(position)) {
      return; // Safe square, no capture possible
    }
    
    this.players.forEach((otherPlayer, otherPlayerId) => {
      if (otherPlayerId === playerId) return;
      
      otherPlayer.pieces.forEach((piece, pieceIndex) => {
        if (piece.position === position && piece.status === 'playing') {
          // Capture the piece
          piece.status = 'home';
          piece.position = 0;
          piece.canMove = false;
          
          // Player gets their "tohd"
          this.players[playerId].hasThore = true;
          
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

  // Check if player can go home
  canGoHome(playerId) {
    const player = this.players[playerId];
    return player.hasThore; // Must have captured at least one piece
  }

  // Check for game over
  checkGameOver() {
    const finishedPlayers = this.players.map(player => 
      player.pieces.every(piece => piece.status === 'finished')
    );
    
    const winnerIndex = finishedPlayers.findIndex(finished => finished);
    if (winnerIndex !== -1) {
      this.gameStatus = 'finished';
      return { gameOver: true, winner: winnerIndex };
    }
    
    return { gameOver: false };
  }

  // Next turn
  nextTurn() {
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    this.consecutiveHighThrows = 0;
  }

  // Get available moves for current player
  getAvailableMoves(playerId, throwScore) {
    const moves = [];
    const player = this.players[playerId];
    
    player.pieces.forEach((piece, pieceIndex) => {
      if (this.canMovePiece(playerId, pieceIndex, throwScore)) {
        moves.push({
          pieceIndex,
          currentPosition: piece.position,
          newPosition: piece.status === 'home' ? 1 : piece.position + throwScore,
          type: piece.status === 'home' ? 'start' : 'move'
        });
      }
    });
    
    return moves;
  }

  // Get game statistics
  getGameStats() {
    return {
      totalMoves: this.moveHistory.length,
      captures: this.moveHistory.filter(move => move.type === 'capture').length,
      players: this.players.map(player => ({
        name: player.name,
        piecesStarted: player.pieces.filter(p => p.status !== 'home').length,
        piecesFinished: player.pieces.filter(p => p.status === 'finished').length,
        hasThore: player.hasThore
      }))
    };
  }
}

// Utility functions
export const formatThrowScore = (score) => {
  const throwInfo = Object.entries(CHAUPAR_RULES.COWRIE_SCORES).find(([key, value]) => value === score);
  if (throwInfo) {
    const [facingUp, facingDown] = throwInfo[0].split('-');
    return `${facingUp} up, ${facingDown} down = ${score} points`;
  }
  return `${score} points`;
};

export const isHighThrow = (score) => {
  return CHAUPAR_RULES.HIGH_THROWS.includes(score);
};

export const getSpecialMove = (score) => {
  return CHAUPAR_RULES.SPECIAL_MOVES[score] || null;
};
