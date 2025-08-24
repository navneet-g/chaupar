import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Users, User, BookOpen, Crown, Square, LogIn, LogOut, UserCheck, 
  AlertCircle, CheckCircle, X, Play, Star, Trophy, Sparkles, 
  Target, Zap, Heart, Shield, Globe, Clock, Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home = ({ setGameState }) => {
  const [gameCode, setGameCode] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [aiCount, setAiCount] = useState(1); // Single AI opponent
  const [aiProvider, setAiProvider] = useState('ollama'); // 'ollama' or 'openai'
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const navigate = useNavigate();
  const { 
    user, 
    isAuthenticated, 
    isAnonymous,
    signInWithGoogle, 
    signInAnonymous,
    signOutUser, 
    loading: authLoading,
    isConnecting,
    error: authError,
    clearError 
  } = useAuth();

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (localError) {
      const timer = setTimeout(() => setLocalError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [localError]);

  // Parallax scroll effects
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 300], [0, -100]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.8]);
  const featuresY = useTransform(scrollY, [0, 500], [0, -50]);

  const generateGameCode = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);

  const createNewGame = useCallback(async (mode) => {
    if (isOffline) {
      setLocalError('You are offline. Please check your connection and try again.');
      return;
    }

    if (!isAuthenticated) {
      setLocalError('Please sign in to create a game');
      return;
    }

    try {
      setIsLoading(true);
      setLocalError(null);
      clearError();
      
      const gameId = generateGameCode();
      const playerName = user.displayName || (isAnonymous ? 'Guest Player' : 'You');
      
      const newGame = {
        id: gameId,
        mode: mode,
        players: [{ 
          id: user.uid, 
          name: playerName, 
          isHost: true,
          email: user.email || null,
          isAnonymous: isAnonymous
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
      setSuccessMessage(`${mode === 'ai' ? 'AI game' : 'Multiplayer game'} created successfully!`);
      
      // Small delay for user feedback
      setTimeout(() => {
        navigate(`/game/${gameId}`);
      }, 500);
      
    } catch (err) {
      const errorMessage = err.message || 'Failed to create game. Please try again.';
      setLocalError(errorMessage);
      console.error('Game creation failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAnonymous, isOffline, user, skillLevel, aiCount, aiProvider, generateGameCode, setGameState, navigate, clearError]);

  const joinGame = useCallback(async () => {
    if (isOffline) {
      setLocalError('You are offline. Please check your connection and try again.');
      return;
    }

    if (!isAuthenticated) {
      setLocalError('Please sign in to join a game');
      return;
    }

    if (gameCode.length !== 6) {
      setLocalError('Game code must be exactly 6 characters long');
      return;
    }

    if (!/^[A-Z0-9]{6}$/.test(gameCode)) {
      setLocalError('Game code can only contain letters and numbers');
      return;
    }

    try {
      setIsLoading(true);
      setLocalError(null);
      clearError();
      
      // For now, navigate to the game - in production, validate the game exists
      const upperGameCode = gameCode.toUpperCase();
      navigate(`/game/${upperGameCode}`);
      setSuccessMessage(`Joining game ${upperGameCode}...`);
    } catch (err) {
      const errorMessage = err.message || 'Failed to join game. Please check the code and try again.';
      setLocalError(errorMessage);
      console.error('Game join failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isOffline, gameCode, navigate, clearError]);

  const handleSignIn = async (method = 'google') => {
    if (isOffline) {
      setLocalError('You are offline. Please check your connection and try again.');
      return;
    }

    try {
      setLocalError(null);
      clearError();
      
      if (method === 'google') {
        await signInWithGoogle();
        setSuccessMessage('Successfully signed in with Google!');
      } else if (method === 'anonymous') {
        await signInAnonymous();
        setSuccessMessage('Playing as guest!');
      }
    } catch (err) {
      // Error is already handled in AuthContext
      console.error('Sign in failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      setLocalError(null);
      clearError();
      await signOutUser();
      setSuccessMessage('Successfully signed out!');
    } catch (err) {
      setLocalError('Sign out failed. Please try again.');
      console.error('Sign out failed:', err);
    }
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="home-loading">
        <div className="loading-spinner" />
        <p>Initializing Chaupar...</p>
      </div>
    );
  }

  // Current error to display (priority: auth error, then local error)
  const currentError = authError || localError;

  return (
    <div className="home">
      {/* Hero Section with Parallax */}
      <motion.div 
        className="hero-section"
        style={{ y: headerY, scale: heroScale }}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="hero-background">
          <div className="hero-particles"></div>
          <div className="hero-glow"></div>
        </div>
        
        <div className="hero-content">
          <motion.div 
            className="hero-badge"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <Sparkles size={24} />
            <span>🕉️ Ancient Indian Strategy 🕉️</span>
          </motion.div>
          
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <span className="title-main">Chaupar</span>
            <span className="title-subtitle">🎭 The Royal Game of Kings 🎭</span>
          </motion.h1>
          
          <motion.p 
            className="hero-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Experience the strategic depth of India's most revered board game, 
            played by kings and queens for centuries. 🏛️✨
            Challenge AI opponents or play with friends in this beautifully crafted digital adaptation.
          </motion.p>
          
          <motion.div 
            className="hero-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="stat-item">
              <Trophy size={20} />
              <span>Strategic</span>
            </div>
            <div className="stat-item">
              <Heart size={20} />
              <span>Authentic</span>
            </div>
            <div className="stat-item">
              <Globe size={20} />
              <span>Multiplayer</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

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
              <div className="user-details">
                {isAnonymous ? (
                  <div className="guest-indicator">
                    <UserCheck size={16} />
                    <span className="user-name">Playing as Guest</span>
                  </div>
                ) : (
                  <div className="google-user">
                    <CheckCircle size={16} />
                    <span className="user-name">Welcome, {user.displayName || 'Player'}!</span>
                  </div>
                )}
              </div>
              <button 
                className="btn btn-outline"
                onClick={handleSignOut}
                disabled={isLoading || isConnecting}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => handleSignIn('google')}
                disabled={isLoading || isConnecting || isOffline}
              >
                <LogIn size={16} />
                {isConnecting ? 'Connecting...' : 'Sign In with Google'}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => handleSignIn('anonymous')}
                disabled={isLoading || isConnecting || isOffline}
              >
                <UserCheck size={16} />
                {isConnecting ? 'Connecting...' : 'Play as Guest'}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Offline Status Banner */}
      {isOffline && (
        <motion.div 
          className="offline-banner"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle size={16} />
          <span>You are offline. Some features may not work.</span>
        </motion.div>
      )}

      {/* Error Messages */}
      <AnimatePresence>
        {currentError && (
          <motion.div 
            className="error-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertCircle size={16} />
            <span>{currentError}</span>
            <button 
              onClick={() => {
                setLocalError(null);
                clearError();
              }}
              aria-label="Close error"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            className="success-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <CheckCircle size={16} />
            <span>{successMessage}</span>
            <button 
              onClick={() => setSuccessMessage(null)}
              aria-label="Close success message"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="home-content">
        {isAuthenticated ? (
          <>
            <motion.div 
              className="game-modes-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
                          <div className="section-header">
              <h2>🎯 Choose Your Adventure</h2>
              <p>Select your preferred way to experience the ancient wisdom of Chaupar</p>
            </div>
              
              <div className="game-modes">
                <motion.div 
                  className="mode-card ai-mode"
                  initial={{ opacity: 0, x: -30, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="mode-header">
                    <div className="mode-icon">
                      <Users size={40} />
                      <div className="icon-glow"></div>
                    </div>
                    <div className="mode-title">
                      <h2>AI Opponents</h2>
                      <span className="mode-subtitle">Challenge intelligent opponents</span>
                    </div>
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
                  disabled={isLoading || isConnecting || isOffline}
                >
                  <Play size={18} />
                  {isLoading ? 'Creating...' : 'Start AI Game'}
                  <div className="btn-shine"></div>
                </button>
              </motion.div>

              <motion.div 
                className="mode-card multiplayer-mode"
                initial={{ opacity: 0, x: 30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.6, type: "spring" }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="mode-header">
                  <div className="mode-icon">
                    <User size={40} />
                    <div className="icon-glow"></div>
                  </div>
                  <div className="mode-title">
                    <h2>Multiplayer</h2>
                    <span className="mode-subtitle">Play with friends online</span>
                  </div>
                </div>
                
                <div className="mode-features">
                  <div className="feature-tag">
                    <Globe size={16} />
                    <span>Global</span>
                  </div>
                  <div className="feature-tag">
                    <Clock size={16} />
                    <span>Real-time</span>
                  </div>
                  <div className="feature-tag">
                    <Heart size={16} />
                    <span>Social</span>
                  </div>
                </div>
                
                <button 
                  className="btn btn-secondary mode-btn"
                  onClick={() => createNewGame('multiplayer')}
                  disabled={isLoading || isConnecting || isOffline}
                >
                  <Users size={18} />
                  {isLoading ? 'Creating...' : 'Create Multiplayer Game'}
                  <div className="btn-shine"></div>
                </button>
              </motion.div>
            </div>
          </motion.div>

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
                  disabled={isLoading || isConnecting}
                  className={currentError && gameCode ? 'input-error' : ''}
                  aria-label="Game code input"
                />
                <button 
                  className="btn btn-outline"
                  onClick={joinGame}
                  disabled={gameCode.length !== 6 || isLoading || isConnecting || isOffline}
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
              <h2>Welcome to Chaupar!</h2>
              <p>Sign in to play the ancient Indian strategy game</p>
              
              <div className="auth-options">
                <button 
                  className="btn btn-primary btn-large"
                  onClick={() => handleSignIn('google')}
                  disabled={isLoading || isConnecting || isOffline}
                >
                  <LogIn size={20} />
                  {isConnecting ? 'Connecting...' : 'Sign In with Google'}
                </button>
                
                <div className="auth-divider">
                  <span>or</span>
                </div>
                
                <button 
                  className="btn btn-secondary btn-large"
                  onClick={() => handleSignIn('anonymous')}
                  disabled={isLoading || isConnecting || isOffline}
                >
                  <UserCheck size={20} />
                  {isConnecting ? 'Connecting...' : 'Play as Guest'}
                </button>
              </div>
              
              <p className="auth-note">
                {isOffline ? 
                  'You are offline. Please check your connection.' : 
                  'Choose Google sign-in for full features or play as guest to try the game.'
                }
              </p>
            </div>
          </motion.div>
        )}

        <motion.div 
          className="features-section"
          style={{ y: featuresY }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
                      <div className="section-header">
              <h3>🌟 Why Players Love Chaupar</h3>
              <p>Discover what makes this ancient Indian game so captivating and timeless</p>
            </div>
          
          <div className="features-grid">
            <motion.div 
              className="feature-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              whileHover={{ y: -5, scale: 1.05 }}
            >
              <div className="feature-icon">
                <BookOpen size={28} />
                <div className="icon-pulse"></div>
              </div>
              <h4>Interactive Tutorial</h4>
              <span>Learn the game step-by-step with guided instructions</span>
            </motion.div>
            
            <motion.div 
              className="feature-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              whileHover={{ y: -5, scale: 1.05 }}
            >
              <div className="feature-icon">
                <Crown size={28} />
                <div className="icon-pulse"></div>
              </div>
              <h4>Authentic Rules</h4>
              <span>Play with traditional rules passed down through generations</span>
            </motion.div>
            
            <motion.div 
              className="feature-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              whileHover={{ y: -5, scale: 1.05 }}
            >
              <div className="feature-icon">
                <Target size={28} />
                <div className="icon-pulse"></div>
              </div>
              <h4>Strategic Depth</h4>
              <span>Master complex strategies and outthink your opponents</span>
            </motion.div>
            
            <motion.div 
              className="feature-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              whileHover={{ y: -5, scale: 1.05 }}
            >
              <div className="feature-icon">
                <Zap size={28} />
                <div className="icon-pulse"></div>
              </div>
              <h4>AI Opponents</h4>
              <span>Challenge intelligent AI with adjustable difficulty levels</span>
            </motion.div>
            
            <motion.div 
              className="feature-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              whileHover={{ y: -5, scale: 1.05 }}
            >
              <div className="feature-icon">
                <Globe size={28} />
                <div className="icon-pulse"></div>
              </div>
              <h4>Global Multiplayer</h4>
              <span>Connect with players worldwide in real-time matches</span>
            </motion.div>
            
            <motion.div 
              className="feature-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              whileHover={{ y: -5, scale: 1.05 }}
            >
              <div className="feature-icon">
                <Award size={28} />
                <div className="icon-pulse"></div>
              </div>
              <h4>Beautiful Design</h4>
              <span>Immerse yourself in stunning ancient Indian aesthetics</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Call to Action Section */}
        <motion.div 
          className="cta-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <div className="cta-content">
            <motion.div 
              className="cta-icon"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatType: "reverse" 
              }}
            >
              <Star size={48} />
            </motion.div>
            
            <h3>🚀 Ready to Begin Your Chaupar Journey?</h3>
            <p>Join thousands of players discovering the strategic brilliance of this ancient Indian game</p>
            
            {!isAuthenticated && (
              <motion.div 
                className="cta-buttons"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7, duration: 0.6 }}
              >
                <button 
                  className="btn btn-primary btn-large cta-btn"
                  onClick={() => handleSignIn('google')}
                  disabled={isConnecting || isOffline}
                >
                  <LogIn size={20} />
                  Start Playing Now
                  <div className="btn-shine"></div>
                </button>
                
                <button 
                  className="btn btn-outline btn-large cta-btn"
                  onClick={() => handleSignIn('anonymous')}
                  disabled={isConnecting || isOffline}
                >
                  <UserCheck size={20} />
                  Try as Guest
                </button>
              </motion.div>
            )}
            
            {isAuthenticated && (
              <motion.div 
                className="cta-buttons"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7, duration: 0.6 }}
              >
                <button 
                  className="btn btn-primary btn-large cta-btn"
                  onClick={() => createNewGame('ai')}
                  disabled={isLoading || isConnecting || isOffline}
                >
                  <Play size={20} />
                  Start New Game
                  <div className="btn-shine"></div>
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
