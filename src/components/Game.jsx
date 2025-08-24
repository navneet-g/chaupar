import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Square, Users, Home, Info } from 'lucide-react';
import GameBoard from './GameBoard';
import GameControls from './GameControls';
import GameInfo from './GameInfo';
import { createAIService } from '../services/aiService';
import './Game.css';

const Game = ({ gameState, setGameState }) => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [currentGame, setCurrentGame] = useState(gameState);
  const [showInfo, setShowInfo] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [gameStatus, setGameStatus] = useState('waiting');

  useEffect(() => {
    if (!currentGame) {
      // Try to load game from Firebase or create new one
      setCurrentGame({
        id: gameId,
        mode: 'multiplayer',
        players: [{ id: 'player1', name: 'You', isHost: true }],
        status: 'waiting',
        createdAt: new Date()
      });
    }
  }, [gameId, currentGame]);

  const rollDice = () => {
    // Traditional Chaupar cowrie shell scoring
    const scores = [7, 10, 2, 3, 4, 25, 30, 14];
    const weights = [1, 1, 2, 2, 2, 1, 1, 1]; // Weighted random selection
    
    let totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedScore = scores[0];
    for (let i = 0; i < scores.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedScore = scores[i];
        break;
      }
    }
    
    setDiceValue(selectedScore);
    
    // Handle AI turns
    if (currentGame?.mode === 'ai' && currentPlayer > 0) {
      handleAITurn(selectedScore);
    }
  };

  const handleAITurn = async (diceRoll) => {
    if (!currentGame || currentPlayer !== 1) return; // Only handle AI (player 1)
    
    const aiPlayer = currentGame.players[currentPlayer];
    if (!aiPlayer.isAI) return;

    // Create AI service for this player
    const aiService = createAIService(aiPlayer.aiProvider || 'ollama');
    
    // Simulate AI thinking time
    setTimeout(async () => {
      try {
        // Generate AI move
        const aiMove = await aiService.generateMove(
          { 
            board: {}, // Simplified board state for now
            players: currentGame.players,
            currentPlayer: currentPlayer,
            diceValue: diceRoll
          },
          currentPlayer,
          aiPlayer.skillLevel
        );

        console.log(`AI move:`, aiMove);
        
        // Move back to human player
        setCurrentPlayer(0);
        setDiceValue(null);
      } catch (error) {
        console.error('AI move failed:', error);
        // Fallback: move back to human player
        setCurrentPlayer(0);
        setDiceValue(null);
      }
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const endTurn = () => {
    if (currentGame?.mode === 'ai') {
      setCurrentPlayer(currentPlayer === 0 ? 1 : 0);
    }
    setDiceValue(null);
  };

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameId);
  };

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
            currentPlayer={currentPlayer}
            diceValue={diceValue}
            gameStatus={gameStatus}
          />
          
          <GameControls
            onRollDice={rollDice}
            onEndTurn={endTurn}
            diceValue={diceValue}
            currentPlayer={currentPlayer}
            gameStatus={gameStatus}
            canRoll={!diceValue && gameStatus === 'playing'}
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
              currentPlayer={currentPlayer}
              diceValue={diceValue}
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
