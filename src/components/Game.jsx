import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Square, Users, Home, Info } from 'lucide-react';
import GameBoard from './GameBoard';
import GameControls from './GameControls';
import GameInfo from './GameInfo';
import { createAIService } from '../services/aiService';
import { useChauparGame } from './GameState';
import { useAuth } from '../contexts/AuthContext';
import './Game.css';

const Game = ({ gameState: initialGameState, setGameState }) => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentGame, setCurrentGame] = useState(initialGameState);
  const [showInfo, setShowInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use proper Chaupar game state management
  const {
    gameState,
    gameInstance,
    initializeGame,
    throwCowries,
    makeMove,
    getAvailableMoves,
    endTurn,
    checkGameOver
  } = useChauparGame();

  // Memoize game initialization
  const initializeGameCallback = useCallback((mode, options = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      initializeGame(mode, options);
    } catch (err) {
      setError(err.message);
      console.error('Game initialization failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [initializeGame]);

  useEffect(() => {
    if (!currentGame && initialGameState) {
      // Initialize Chaupar game with proper state
      setCurrentGame(initialGameState);
      
      if (initialGameState.mode === 'ai') {
        initializeGameCallback('ai', {
          skillLevel: initialGameState.skillLevel,
          aiProvider: initialGameState.aiProvider
        });
      } else {
        initializeGameCallback('multiplayer');
      }
    } else if (!currentGame) {
      // Fallback: create basic multiplayer game
      const fallbackGame = {
        id: gameId,
        mode: 'multiplayer',
        players: [{ id: 'player1', name: 'You', isHost: true }],
        status: 'waiting',
        createdAt: new Date()
      };
      setCurrentGame(fallbackGame);
      initializeGameCallback('multiplayer');
    }
  }, [gameId, currentGame, initialGameState, initializeGameCallback]);

  // Memoize roll dice function
  const rollDice = useCallback(async () => {
    if (!gameInstance) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Use proper Chaupar cowrie throw
      const throwResult = throwCowries();
      
      if (throwResult) {
        // Check if it's AI turn and handle accordingly
        if (currentGame?.mode === 'ai' && gameState?.currentPlayer === 1) {
          await handleAITurn(throwResult);
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Dice roll failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [gameInstance, throwCowries, currentGame?.mode, gameState?.currentPlayer, handleAITurn]);

  // Memoize AI turn handler
  const handleAITurn = useCallback(async (throwResult) => {
    if (!gameState || gameState.currentPlayer !== 1) return;
    
    const aiPlayer = currentGame?.players?.[1];
    if (!aiPlayer?.isAI) return;

    // Create AI service for this player
    const aiService = createAIService(aiPlayer.aiProvider || 'ollama');
    
    // Simulate AI thinking time
    setTimeout(async () => {
      try {
        // Get available moves for AI
        const availableMoves = getAvailableMoves(1);
        
        if (availableMoves.length === 0) {
          // No moves available, end turn
          endTurn();
          return;
        }

        // Generate AI move with proper game state
        const aiMove = await aiService.generateMove(
          { 
            board: { 1: { pieces: gameState.players[1].pieces } },
            players: gameState.players,
            currentPlayer: gameState.currentPlayer,
            diceValue: throwResult.score
          },
          1,
          aiPlayer.skillLevel
        );

        console.log(`AI move:`, aiMove);
        
        // Execute the AI move
        if (aiMove.type !== 'pass' && aiMove.pieceIndex !== undefined) {
          const success = makeMove(1, aiMove.pieceIndex);
          if (success) {
            // Check for game over
            const gameOver = checkGameOver();
            if (!gameOver.gameOver) {
              endTurn();
            }
          } else {
            endTurn(); // Invalid move, just end turn
          }
        } else {
          endTurn(); // AI passed
        }
      } catch (error) {
        console.error('AI move failed:', error);
        setError('AI move failed. Please try again.');
        // Fallback: just end turn
        endTurn();
      }
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  }, [gameState, currentGame?.players, getAvailableMoves, makeMove, checkGameOver, endTurn]);

  // Memoize end turn handler
  const handleEndTurn = useCallback(() => {
    if (!gameInstance) return;
    
    try {
      // Use proper game state end turn
      endTurn();
      
      // If it's now the AI's turn, automatically trigger AI move after a short delay
      if (currentGame?.mode === 'ai' && gameState?.currentPlayer === 1) {
        setTimeout(() => {
          rollDice(); // This will trigger the AI turn
        }, 500);
      }
    } catch (err) {
      setError(err.message);
      console.error('End turn failed:', err);
    }
  }, [gameInstance, endTurn, currentGame?.mode, gameState?.currentPlayer, rollDice]);

  // Memoize copy game code function
  const copyGameCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(gameId);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy game code:', err);
      setError('Failed to copy game code');
    }
  }, [gameId]);

  // Memoize available moves
  const availableMoves = useMemo(() => {
    if (!gameState) return [];
    return getAvailableMoves(gameState.currentPlayer);
  }, [gameState, getAvailableMoves]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="game-loading">
        <div className="loading-spinner" />
        <p>Loading game...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="game-error">
        <div className="error-content">
          <h2>Game Error</h2>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      </div>
    );
  }

  if (!currentGame) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game">
      <motion.div 
        className="game-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-left">
          <button className="btn-icon" onClick={() => navigate('/')}>
            <Home size={20} />
          </button>
          <h1>Chaupar</h1>
        </div>
        
        <div className="game-info">
          <div className="game-code">
            <span>Game Code: </span>
            <code onClick={copyGameCode} title="Click to copy">
              {gameId}
            </code>
          </div>
          <div className="game-mode">
            <Users size={16} />
            {currentGame.mode === 'ai' ? 'AI Game' : 'Multiplayer'}
          </div>
        </div>

        <div className="header-right">
          <button 
            className="btn-icon"
            onClick={() => setShowInfo(!showInfo)}
          >
            <Info size={20} />
          </button>
        </div>
      </motion.div>

      <div className="game-content">
        <div className="game-main">
          <GameBoard 
            currentPlayer={gameState?.currentPlayer || 0}
            diceValue={gameState?.lastThrow?.score || null}
            gameStatus={gameState?.gameStatus || 'waiting'}
            gameState={gameState}
          />
          
          <GameControls
            onRollDice={rollDice}
            onEndTurn={handleEndTurn}
            diceValue={gameState?.lastThrow?.score || null}
            currentPlayer={gameState?.currentPlayer || 0}
            gameStatus={gameState?.gameStatus || 'waiting'}
            canRoll={!gameState?.lastThrow && gameState?.gameStatus === 'playing'}
            availableMoves={availableMoves}
            isLoading={isLoading}
          />
        </div>

        {showInfo && (
          <motion.div 
            className="game-sidebar"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3 }}
          >
            <GameInfo 
              game={currentGame}
              currentPlayer={gameState?.currentPlayer || 0}
              diceValue={gameState?.lastThrow?.score || null}
            />
          </motion.div>
        )}
      </div>

      {currentGame.mode === 'multiplayer' && currentGame.status === 'waiting' && (
        <motion.div 
          className="waiting-players"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3>Waiting for players to join...</h3>
          <p>Share the game code: <strong>{gameId}</strong></p>
          <div className="player-list">
            {currentGame.players.map(player => (
              <div key={player.id} className="player-item">
                <Crown size={16} />
                {player.name}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Game;
