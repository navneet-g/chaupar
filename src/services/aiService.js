// AI Service for Chaupar Game
// Supports both Ollama (local Qwen2.5) and OpenAI API

class AIService {
  constructor(provider = 'ollama', config = {}) {
    this.provider = provider;
    this.baseUrl = provider === 'ollama' 
      ? (config.ollamaUrl || 'http://localhost:11434')
      : 'https://api.openai.com/v1';
    
    this.config = {
      ollamaUrl: config.ollamaUrl || 'http://localhost:11434',
      openaiApiKey: config.openaiApiKey || null, // Will be set server-side
      timeout: config.timeout || 30000
    };
  }

  async generateMove(gameState, playerId, skillLevel) {
    try {
      if (this.provider === 'ollama') {
        return await this.generateOllamaMove(gameState, playerId, skillLevel);
      } else {
        return await this.generateOpenAIMove(gameState, playerId, skillLevel);
      }
    } catch (error) {
      console.error('AI move generation failed:', error);
      // Return a fallback move instead of throwing
      return this.generateFallbackMove(gameState, playerId, skillLevel);
    }
  }

  async generateOllamaMove(gameState, playerId, skillLevel) {
    const prompt = this.buildGamePrompt(gameState, playerId, skillLevel);
    
    const response = await fetch(`${this.config.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5:latest',
        prompt: prompt,
        stream: false,
        options: {
          temperature: this.getTemperatureForSkill(skillLevel),
          top_p: 0.9,
          max_tokens: 100
        }
      }),
      signal: AbortSignal.timeout(this.config.timeout)
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return this.parseAIResponse(data.response, gameState, playerId);
  }

  // Generate move using OpenAI API - API key handled server-side
  async generateOpenAIMove(gameState, playerId, skillLevel) {
    // For production, this should call a server endpoint
    // that handles the OpenAI API key securely
    const prompt = this.buildGamePrompt(gameState, playerId, skillLevel);
    
    try {
      // Call our secure server endpoint instead of OpenAI directly
      const response = await fetch('/api/ai/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          skillLevel: skillLevel,
          model: 'gpt-4'
        }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseAIResponse(data.response, gameState, playerId);
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      // Fallback to rule-based AI
      return this.generateFallbackMove(gameState, playerId, skillLevel);
    }
  }

  // Fallback rule-based AI when external services fail
  generateFallbackMove(gameState, playerId, skillLevel) {
    const availableMoves = this.getAvailableMoves(gameState, playerId, gameState.diceValue);
    
    if (availableMoves.length === 0) {
      return { type: 'pass', pieceIndex: null };
    }

    // Simple rule-based logic based on skill level
    let selectedMove;
    
    switch (skillLevel) {
      case 'basic':
        // Random move
        selectedMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        break;
        
      case 'intermediate':
        // Prefer captures and safe moves
        const captureMoves = availableMoves.filter(move => move.type === 'capture');
        const safeMoves = availableMoves.filter(move => move.type === 'safe');
        
        if (captureMoves.length > 0) {
          selectedMove = captureMoves[0];
        } else if (safeMoves.length > 0) {
          selectedMove = safeMoves[0];
        } else {
          selectedMove = availableMoves[0];
        }
        break;
        
      case 'advanced':
        // Strategic move selection
        selectedMove = this.selectStrategicMove(availableMoves, gameState);
        break;
        
      default:
        selectedMove = availableMoves[0];
    }

    return {
      type: 'move',
      pieceIndex: selectedMove.pieceIndex,
      reasoning: `Rule-based move: ${selectedMove.type}`
    };
  }

  selectStrategicMove(availableMoves, gameState) {
    // Advanced strategic logic
    let bestMove = availableMoves[0];
    let bestScore = -Infinity;

    for (const move of availableMoves) {
      let score = 0;
      
      // Prefer captures
      if (move.type === 'capture') score += 100;
      
      // Prefer safe squares
      if (move.type === 'safe') score += 50;
      
      // Prefer moves that get closer to home
      if (move.newPosition > move.currentPosition) {
        score += (move.newPosition - move.currentPosition) * 2;
      }
      
      // Avoid moves that put pieces in danger
      if (this.isPositionDangerous(move.newPosition, gameState)) {
        score -= 30;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  isPositionDangerous(position, gameState) {
    // Check if position is near opponent pieces
    const opponentPieces = gameState.players
      .filter(p => p.id !== gameState.currentPlayer)
      .flatMap(p => p.pieces)
      .filter(p => p.status === 'playing');
    
    return opponentPieces.some(piece => 
      Math.abs(piece.position - position) <= 6
    );
  }

  // Build the game prompt for AI
  buildGamePrompt(gameState, playerId, skillLevel) {
    const { board, players, currentPlayer, diceValue } = gameState;
    const playerBoard = board[playerId];
    
    let prompt = `You are playing Chaupar, an ancient Indian board game. You are the AI opponent (Player 2).

Game State:
- Current Player: ${currentPlayer + 1}
- Dice Roll: ${diceValue}
- Your Pieces: ${playerBoard.pieces.map((pos, i) => `Piece ${i + 1}: ${pos === 0 ? 'Not started' : pos === -1 ? 'Finished' : `Position ${pos}`}`).join(', ')}
- Safe Zones: [8, 15, 22, 29, 36, 43, 50, 57, 64]

Skill Level: ${skillLevel}

Traditional Chaupar Rules:
- You need a "high throw" (10, 25, or 30 points) to start pieces
- Move clockwise around the outer perimeter
- Safe squares (flower motifs) protect from capture
- You must capture at least one opponent piece before going home
- Use "peghedu" bonus points strategically
- Count squares carefully: "aanth ghar pacchees" (8 for 25) and "tehr ghar trees" (13 for 30)

Available moves: ${this.getAvailableMoves(gameState, playerId, diceValue).map(move => 
  `Piece ${move.pieceIndex + 1}: ${move.currentPosition === 0 ? 'Start' : `Move from ${move.currentPosition} to ${move.newPosition}`}`
).join(', ')}

Based on your skill level (${skillLevel}), make the best strategic move. Consider:
- Capturing opponent pieces to get your "tohd"
- Moving to safe squares when possible
- Using bonus moves strategically
- Positioning pieces for future captures

Respond with only the piece number (1-4) to move, or "pass" if no valid moves.`;

    return prompt;
  }

  // Get available moves for the AI player
  getAvailableMoves(gameState, playerId, diceValue) {
    const { board } = gameState;
    const playerBoard = board[playerId];
    const availableMoves = [];

    for (let i = 0; i < playerBoard.pieces.length; i++) {
      const piece = playerBoard.pieces[i];
      
      if (piece === 0 && diceValue >= 10) {
        // Can start piece
        availableMoves.push({
          pieceIndex: i,
          type: 'start',
          currentPosition: 0,
          newPosition: 1
        });
      } else if (piece > 0 && piece !== -1) {
        // Can move existing piece
        const newPosition = piece + diceValue;
        if (newPosition <= 68) {
          availableMoves.push({
            pieceIndex: i,
            type: 'move',
            currentPosition: piece,
            newPosition: newPosition
          });
        }
      }
    }

    return availableMoves;
  }

  // Parse AI response
  parseAIResponse(response, gameState, playerId) {
    try {
      const cleanResponse = response.trim().toLowerCase();
      
      // Extract piece number
      const pieceMatch = cleanResponse.match(/piece (\d+)/);
      if (pieceMatch) {
        const pieceIndex = parseInt(pieceMatch[1]) - 1;
        if (pieceIndex >= 0 && pieceIndex < 4) {
          return { type: 'move', pieceIndex };
        }
      }
      
      // Check for pass
      if (cleanResponse.includes('pass') || cleanResponse.includes('no move')) {
        return { type: 'pass', pieceIndex: null };
      }
      
      // Fallback: try to extract any number
      const numberMatch = cleanResponse.match(/(\d+)/);
      if (numberMatch) {
        const pieceIndex = parseInt(numberMatch[1]) - 1;
        if (pieceIndex >= 0 && pieceIndex < 4) {
          return { type: 'move', pieceIndex };
        }
      }
      
      // Default to pass if can't parse
      return { type: 'pass', pieceIndex: null };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return { type: 'pass', pieceIndex: null };
    }
  }

  // Get temperature based on skill level
  getTemperatureForSkill(skillLevel) {
    switch (skillLevel) {
      case 'basic':
        return 0.8; // More random
      case 'advanced':
        return 0.2; // More deterministic
      default:
        return 0.5; // Balanced
    }
  }

  // Test connection to AI provider
  async testConnection() {
    try {
      if (this.provider === 'ollama') {
        const response = await fetch(`${this.config.ollamaUrl}/api/tags`);
        return response.ok;
      } else {
        // Test our secure endpoint
        const response = await fetch('/api/ai/health');
        return response.ok;
      }
    } catch (error) {
      console.error('AI connection test failed:', error);
      return false;
    }
  }
}

// Configuration helper - no API keys exposed
export const getAIConfig = () => {
  const config = {
    ollamaUrl: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434',
    defaultProvider: import.meta.env.VITE_AI_PROVIDER || 'ollama'
  };
  
  return config;
};

// Create AI service instance
export const createAIService = (provider, config = {}) => {
  return new AIService(provider, config);
};
