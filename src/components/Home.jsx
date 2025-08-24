import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, User, BookOpen, Crown, Square } from 'lucide-react';
import './Home.css';

const Home = ({ setGameState }) => {
  const [gameCode, setGameCode] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [aiCount, setAiCount] = useState(1); // Single AI opponent
  const [aiProvider, setAiProvider] = useState('ollama'); // 'ollama' or 'openai'
  const navigate = useNavigate();

  const generateGameCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createNewGame = (mode) => {
    const gameId = generateGameCode();
    const newGame = {
      id: gameId,
      mode: mode,
      players: [{ id: 'player1', name: 'You', isHost: true }],
      status: 'waiting',
      skillLevel: skillLevel,
      aiCount: aiCount,
      aiProvider: aiProvider,
      createdAt: new Date()
    };
    
    if (mode === 'ai') {
      // Add multiple AI players
      for (let i = 0; i < aiCount; i++) {
        newGame.players.push({
          id: `ai_${i + 1}`,
          name: `AI ${i + 1} (${skillLevel})`,
          isAI: true,
          skillLevel: skillLevel,
          aiProvider: aiProvider
        });
      }
      newGame.status = 'playing';
    }
    
    setGameState(newGame);
    navigate(`/game/${gameId}`);
  };

  const joinGame = () => {
    if (gameCode.length === 6) {
      navigate(`/game/${gameCode.toUpperCase()}`);
    }
  };

  return (
    <div className="home">
      <motion.div 
        className="hero"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <Crown className="hero-icon" size={80} />
          <h1>Chaupar</h1>
          <p>The Ancient Indian Game of Strategy & Fortune</p>
        </div>
      </motion.div>

      <motion.div 
        className="game-options"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="option-card">
          <h3><Users /> Multiplayer</h3>
          <p>Play with friends online</p>
          <button 
            className="btn btn-primary"
            onClick={() => createNewGame('multiplayer')}
          >
            Create Game
          </button>
        </div>

        <div className="option-card">
          <h3><User /> AI Opponent (Default)</h3>
          <p>Challenge a single AI player</p>
          <div className="ai-config">
            <div className="config-row">
              <label>AI Opponent:</label>
              <select value={aiCount} onChange={(e) => setAiCount(parseInt(e.target.value))}>
                <option value={1}>1 AI Player</option>
              </select>
            </div>
            <div className="config-row">
              <label>AI Skill Level:</label>
              <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>
                <option value="basic">Basic</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="config-row">
              <label>AI Provider:</label>
              <select value={aiProvider} onChange={(e) => setAiProvider(e.target.value)}>
                <option value="ollama">Ollama (Local Qwen2.5)</option>
                <option value="openai">OpenAI GPT-4</option>
              </select>
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => createNewGame('ai')}
          >
            Start AI Game
          </button>
        </div>

        <div className="option-card">
          <h3><BookOpen /> Learn to Play</h3>
          <p>Master the ancient rules</p>
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/tutorial')}
          >
            Tutorial
          </button>
        </div>
      </motion.div>

      <motion.div 
        className="join-game"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <h3>Join Existing Game</h3>
        <div className="join-input">
          <input
            type="text"
            placeholder="Enter 6-character game code"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <button 
            className="btn btn-primary"
            onClick={joinGame}
            disabled={gameCode.length !== 6}
          >
            Join Game
          </button>
        </div>
      </motion.div>

      <motion.div 
        className="footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        <p>Experience the rich heritage of ancient India through this timeless game</p>
      </motion.div>
    </div>
  );
};

export default Home;
