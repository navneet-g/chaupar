// AI Service for Chaupar Game
// Supports both Ollama (local Qwen2.5) and OpenAI API

class AIService {
  constructor(provider = 'ollama', config = {}) {
    this.provider = provider;
    this.config = config;
    this.baseUrl = provider === 'ollama' 
      ? (config.ollamaUrl || 'http://localhost:11434')
      : 'https://api.openai.com/v1';
  }

  // Generate AI move using the selected provider
  async generateMove(gameState, playerId, skillLevel) {
    try {
      if (this.provider === 'ollama') {
        return await this.generateOllamaMove(gameState, playerId, skillLevel);
      } else {
        return await this.generateOpenAIMove(gameState, playerId, skillLevel);
      }
    } catch (error) {
      console.error('AI move generation failed:', error);
      // Fallback to basic AI logic
      return this.generateFallbackMove(gameState, playerId, skillLevel);
    }
  }

  // Generate move using Ollama (local Qwen2.5)
  async generateOllamaMove(gameState, playerId, skillLevel) {
    const prompt = this.buildGamePrompt(gameState, playerId, skillLevel);
    
    const response = await fetch(`${this.baseUrl}/api/generate`, {
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
          max_tokens: 500
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return this.parseAIResponse(data.response, gameState, playerId);
  }

  // Generate move using OpenAI API
  async generateOpenAIMove(gameState, playerId, skillLevel) {
    if (!this.config.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = this.buildGamePrompt(gameState, playerId, skillLevel);
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI player in the ancient Indian game Chaupar. Make strategic decisions based on the game state.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.getTemperatureForSkill(skillLevel),
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return this.parseAIResponse(data.choices[0].message.content, gameState, playerId);
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
    const moves = [];

    playerBoard.pieces.forEach((position, pieceIndex) => {
      if (position === 0 && diceValue === 6) {
        // Can start this piece
        moves.push({
          pieceIndex,
          currentPosition: position,
          newPosition: 1,
          type: 'start'
        });
      } else if (position > 0 && position !== -1) {
        // Can move this piece
        const newPosition = position + diceValue;
        if (newPosition <= 68) {
          moves.push({
            pieceIndex,
            currentPosition: position,
            newPosition,
            type: 'move'
          });
        }
      }
    });

    return moves;
  }

  // Parse AI response and convert to game move
  parseAIResponse(response, gameState, playerId) {
    try {
      // Clean the response
      const cleanResponse = response.trim().toLowerCase();
      
      // Look for piece number
      const pieceMatch = cleanResponse.match(/(?:piece\s*)?(\d)/);
      if (pieceMatch) {
        const pieceIndex = parseInt(pieceMatch[1]) - 1;
        if (pieceIndex >= 0 && pieceIndex < 4) {
          return {
            pieceIndex,
            type: 'move',
            confidence: 0.9
          };
        }
      }

      // Check for pass
      if (cleanResponse.includes('pass') || cleanResponse.includes('no move')) {
        return {
          type: 'pass',
          confidence: 0.8
        };
      }

      // Fallback: analyze response for strategic hints
      return this.analyzeStrategicResponse(cleanResponse, gameState, playerId);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.generateFallbackMove(gameState, playerId, 'basic');
    }
  }

  // Analyze strategic response when direct parsing fails
  analyzeStrategicResponse(response, gameState, playerId) {
    const { board, diceValue } = gameState;
    const playerBoard = board[playerId];
    
    // Look for strategic keywords
    if (response.includes('finish') || response.includes('complete')) {
      // Try to finish a piece
      for (let i = 0; i < playerBoard.pieces.length; i++) {
        const pos = playerBoard.pieces[i];
        if (pos > 0 && pos + diceValue === 68) {
          return { pieceIndex: i, type: 'move', confidence: 0.7 };
        }
      }
    }

    if (response.includes('safe') || response.includes('protect')) {
      // Try to move to safe zone
      for (let i = 0; i < playerBoard.pieces.length; i++) {
        const pos = playerBoard.pieces[i];
        if (pos > 0) {
          const newPos = pos + diceValue;
          if ([8, 15, 22, 29, 36, 43, 50, 57, 64].includes(newPos)) {
            return { pieceIndex: i, type: 'move', confidence: 0.7 };
          }
        }
      }
    }

    // Default: move the first available piece
    for (let i = 0; i < playerBoard.pieces.length; i++) {
      const pos = playerBoard.pieces[i];
      if (pos === 0 && diceValue === 6) {
        return { pieceIndex: i, type: 'move', confidence: 0.6 };
      }
      if (pos > 0 && pos + diceValue <= 68) {
        return { pieceIndex: i, type: 'move', confidence: 0.6 };
      }
    }

    return { type: 'pass', confidence: 0.5 };
  }

  // Fallback move generation (basic AI logic)
  generateFallbackMove(gameState, playerId, skillLevel) {
    const availableMoves = this.getAvailableMoves(gameState, playerId, gameState.diceValue);
    
    if (availableMoves.length === 0) {
      return { type: 'pass', confidence: 0.5 };
    }

    // Basic strategy based on skill level
    if (skillLevel === 'basic') {
      // Random move
      return {
        ...availableMoves[Math.floor(Math.random() * availableMoves.length)],
        confidence: 0.3
      };
    } else if (skillLevel === 'intermediate') {
      // Prioritize finishing pieces
      const finishingMoves = availableMoves.filter(move => move.newPosition === 68);
      if (finishingMoves.length > 0) {
        return { ...finishingMoves[0], confidence: 0.6 };
      }
      return { ...availableMoves[0], confidence: 0.5 };
    } else {
      // Advanced: strategic positioning
      const strategicMoves = availableMoves.filter(move => 
        [8, 15, 22, 29, 36, 43, 50, 57, 64].includes(move.newPosition)
      );
      if (strategicMoves.length > 0) {
        return { ...strategicMoves[0], confidence: 0.7 };
      }
      return { ...availableMoves[0], confidence: 0.6 };
    }
  }

  // Get temperature setting based on skill level
  getTemperatureForSkill(skillLevel) {
    switch (skillLevel) {
      case 'basic':
        return 0.8; // More random
      case 'intermediate':
        return 0.5; // Balanced
      case 'advanced':
        return 0.2; // More deterministic
      default:
        return 0.5;
    }
  }

  // Test connection to AI provider
  async testConnection() {
    try {
      if (this.provider === 'ollama') {
        const response = await fetch(`${this.baseUrl}/api/tags`);
        return response.ok;
      } else {
        // Test OpenAI with a simple request
        const response = await fetch(`${this.baseUrl}/models`, {
          headers: {
            'Authorization': `Bearer ${this.config.openaiApiKey}`
          }
        });
        return response.ok;
      }
    } catch (error) {
      console.error('AI connection test failed:', error);
      return false;
    }
  }
}

// Configuration helper
export const getAIConfig = () => {
  const config = {
    ollamaUrl: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434',
    openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    defaultProvider: import.meta.env.VITE_AI_PROVIDER || 'ollama'
  };
  
  return config;
};

// Create AI service instance
export const createAIService = (provider, config = {}) => {
  const aiConfig = { ...getAIConfig(), ...config };
  return new AIService(provider, aiConfig);
};

export default AIService;
