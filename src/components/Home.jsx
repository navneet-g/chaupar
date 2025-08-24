import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, User, BookOpen, Crown, Square, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home = ({ setGameState }) => {
  const [gameCode, setGameCode] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [aiCount, setAiCount] = useState(1); // Single AI opponent
  const [aiProvider, setAiProvider] = useState('ollama'); // 'ollama' or 'openai'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { user, isAuthenticated, signInWithGoogle, signOutUser, loading: authLoading } = useAuth();

  const generateGameCode = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);

  const createNewGame = useCallback(async (mode) => {
    if (!isAuthenticated) {
      setError('Please sign in to create a game');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const gameId = generateGameCode();
      const newGame = {
        id: gameId,
        mode: mode,
        players: [{ 
          id: user.uid, 
          name: user.displayName || 'You', 
          isHost: true,
          email: user.email 
        }],
        status: 'waiting',
        skillLevel: skillLevel,
        aiCount: aiCount,
        aiProvider: aiProvider,
        createdAt: new Date(),
        createdBy: user.uid
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
    } catch (err) {
      setError('Failed to create game. Please try again.');
      console.error('Game creation failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, skillLevel, aiCount, aiProvider, generateGameCode, setGameState, navigate]);

  const joinGame = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Please sign in to join a game');
      return;
    }

    if (gameCode.length !== 6) {
      setError('Game code must be 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // For now, navigate to the game - in production, validate the game exists
      navigate(`/game/${gameCode.toUpperCase()}`);
    } catch (err) {
      setError('Failed to join game. Please check the code and try again.');
      console.error('Game join failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, gameCode, navigate]);

  const handleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError('Sign in failed. Please try again.');
      console.error('Sign in failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      setError(null);
      await signOutUser();
    } catch (err) {
      setError('Sign out failed. Please try again.');
      console.error('Sign out failed:', err);
    }
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="home-loading">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="home">
      <motion.div 
        className="home-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h1>🎲 Chaupar</h1>
          <p>Ancient Indian Strategy Game</p>
        </div>
        
        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-info">
              <span className="user-name">Welcome, {user.displayName || 'Player'}!</span>
              <button 
                className="btn btn-outline"
                onClick={handleSignOut}
                disabled={isLoading}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={handleSignIn}
              disabled={isLoading}
            >
              <LogIn size={16} />
              Sign In to Play
            </button>
          )}
        </div>
      </motion.div>

      {error && (
        <motion.div 
          className="error-banner"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </motion.div>
      )}

      <div className="home-content">
        {isAuthenticated ? (
          <>
            <div className="game-modes">
              <motion.div 
                className="mode-card ai-mode"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="mode-header">
                  <Users size={40} />
                  <h2>AI Opponents</h2>
                </div>
                
                <div className="mode-config">
                  <div className="config-group">
                    <label>AI Players:</label>
                    <select 
                      value={aiCount} 
                      onChange={(e) => setAiCount(parseInt(e.target.value))}
                      disabled={isLoading}
                    >
                      <option value={1}>1 AI</option>
                      <option value={2}>2 AI</option>
                      <option value={3}>3 AI</option>
                    </select>
                  </div>
                  
                  <div className="config-group">
                    <label>Skill Level:</label>
                    <select 
                      value={skillLevel} 
                      onChange={(e) => setSkillLevel(e.target.value)}
                      disabled={isLoading}
                    >
                      <option value="basic">Basic</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div className="config-group">
                    <label>AI Provider:</label>
                    <select 
                      value={aiProvider} 
                      onChange={(e) => setAiProvider(e.target.value)}
                      disabled={isLoading}
                    >
                      <option value="ollama">Ollama (Local Qwen2.5)</option>
                      <option value="openai">OpenAI GPT-4</option>
                    </select>
                  </div>
                </div>
                
                <button 
                  className="btn btn-primary mode-btn"
                  onClick={() => createNewGame('ai')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Start AI Game'}
                </button>
              </motion.div>

              <motion.div 
                className="mode-card multiplayer-mode"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="mode-header">
                  <User size={40} />
                  <h2>Multiplayer</h2>
                </div>
                
                <p>Play with friends online</p>
                
                <button 
                  className="btn btn-secondary mode-btn"
                  onClick={() => createNewGame('multiplayer')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Multiplayer Game'}
                </button>
              </motion.div>
            </div>

            <motion.div 
              className="join-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3>Join Existing Game</h3>
              <div className="join-form">
                <input
                  type="text"
                  placeholder="Enter 6-character game code"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  disabled={isLoading}
                />
                <button 
                  className="btn btn-outline"
                  onClick={joinGame}
                  disabled={gameCode.length !== 6 || isLoading}
                >
                  {isLoading ? 'Joining...' : 'Join Game'}
                </button>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div 
            className="auth-required"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="auth-message">
              <h2>Sign In to Play</h2>
              <p>Please sign in with your Google account to start playing Chaupar</p>
              <button 
                className="btn btn-primary"
                onClick={handleSignIn}
                disabled={isLoading}
              >
                <LogIn size={20} />
                Sign In with Google
              </button>
            </div>
          </motion.div>
        )}

        <motion.div 
          className="features-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3>Game Features</h3>
          <div className="features-grid">
            <div className="feature-item">
              <BookOpen size={24} />
              <span>Interactive Tutorial</span>
            </div>
            <div className="feature-item">
              <Crown size={24} />
              <span>Traditional Rules</span>
            </div>
            <div className="feature-item">
              <Square size={24} />
              <span>Beautiful Design</span>
            </div>
            <div className="feature-item">
              <Users size={24} />
              <span>AI Opponents</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
