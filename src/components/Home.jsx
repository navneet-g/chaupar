import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, User, BookOpen, Crown, Square, LogIn, LogOut, UserCheck, 
  AlertCircle, CheckCircle, X, Play, Star, Trophy, Sparkles, 
  Target, Zap, Heart, Shield, Globe, Clock, Award, Copy, Gamepad2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home = ({ setGameState }) => {
  const [gameCode, setGameCode] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [aiCount, setAiCount] = useState(1);
  const [aiProvider, setAiProvider] = useState('ollama');
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
      console.error('Sign in failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setSuccessMessage('Successfully signed out!');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const copyErrorToClipboard = useCallback(async (errorText) => {
    try {
      const errorInfo = `Chaupar Home Error:
Error: ${errorText}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}`;
      
      await navigator.clipboard.writeText(errorInfo);
      const button = document.querySelector('.copy-error-btn');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy error to clipboard:', err);
      const errorElement = document.querySelector('.error-banner p');
      if (errorElement) {
        const range = document.createRange();
        range.selectNode(errorElement);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
      }
    }
  }, []);

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="home-loading">
        <div className="loading-spinner" />
        <p>Initializing Chaupar...</p>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Header */}
      <header className="home-header">
        <div className="auth-section">
          <div className="user-info">
            {isAuthenticated ? (
              <div className="user-details">
                <h3>{user.displayName || 'Player'}</h3>
                <p>{isAnonymous ? 'Guest User' : user.email}</p>
              </div>
            ) : (
              <div className="guest-indicator">
                <User size={16} />
                Guest User
              </div>
            )}
          </div>
          
          <div className="auth-buttons">
            {isAuthenticated ? (
              <button 
                onClick={handleSignOut}
                className="btn btn-outline"
                disabled={isConnecting}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            ) : (
              <>
                <button 
                  onClick={() => handleSignIn('google')}
                  className="btn btn-primary"
                  disabled={isConnecting || isOffline}
                >
                  <LogIn size={16} />
                  Sign In with Google
                </button>
                <button 
                  onClick={() => handleSignIn('anonymous')}
                  className="btn btn-secondary"
                  disabled={isConnecting || isOffline}
                >
                  <User size={16} />
                  Play as Guest
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Status Banners */}
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            className="offline-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertCircle size={16} />
            <span>You are currently offline. Some features may be limited.</span>
          </motion.div>
        )}

        {localError && (
          <motion.div 
            className="error-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertCircle size={16} />
            <span>{localError}</span>
            <div className="error-actions">
              <button 
                onClick={() => copyErrorToClipboard(localError)}
                className="copy-error-btn"
                aria-label="Copy error"
                title="Copy error to clipboard"
              >
                <Copy size={14} />
              </button>
              <button 
                onClick={() => {
                  setLocalError(null);
                  clearError();
                }}
                aria-label="Close error"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}

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
              aria-label="Close message"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Gamepad2 size={16} />
            Ancient Indian Strategy Game
          </div>
          
          <div className="hero-title">
            <h1 className="title-main">Chaupar</h1>
            <p className="title-subtitle">The Royal Game of Kings</p>
          </div>
          
          <p className="hero-description">
            Experience the timeless strategy and skill of Chaupar, an ancient Indian board game 
            that has been played for centuries. Challenge AI opponents or play with friends 
            in this beautifully crafted digital adaptation.
          </p>
          
          <div className="hero-stats">
            <div className="stat-item">
              <span>2-4 Players</span>
            </div>
            <div className="stat-item">
              <span>Strategy & Luck</span>
            </div>
            <div className="stat-item">
              <span>Ancient Heritage</span>
            </div>
          </div>
        </div>
      </section>

      {/* Game Modes Section */}
      <section className="game-modes-section">
        <div className="section-header">
          <h2>Choose Your Game Mode</h2>
          <p>Select how you'd like to play Chaupar today</p>
        </div>
        
        <div className="game-modes">
          <div className="mode-card">
            <div className="mode-icon">
              <Users size={32} />
            </div>
            <div className="mode-title">
              <h3>Multiplayer</h3>
              <p className="mode-subtitle">Play with friends online</p>
            </div>
            <div className="mode-features">
              <span className="feature-tag">Real-time</span>
              <span className="feature-tag">6-character codes</span>
              <span className="feature-tag">Friend invites</span>
            </div>
            <button 
              onClick={() => createNewGame('multiplayer')}
              className="mode-btn"
              disabled={isLoading || !isAuthenticated}
            >
              <Play size={16} />
              Create Game
            </button>
          </div>

          <div className="mode-card">
            <div className="mode-icon">
              <Crown size={32} />
            </div>
            <div className="mode-title">
              <h3>AI Challenge</h3>
              <p className="mode-subtitle">Test your skills against AI</p>
            </div>
            <div className="mode-features">
              <span className="feature-tag">3 AI opponents</span>
              <span className="feature-tag">Skill levels</span>
              <span className="feature-tag">Instant play</span>
            </div>
            
            <div className="ai-config">
              <div className="config-row">
                <label>AI Skill Level:</label>
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
              
              <div className="config-row">
                <label>AI Provider:</label>
                <select 
                  value={aiProvider} 
                  onChange={(e) => setAiProvider(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="ollama">Local AI (Ollama)</option>
                  <option value="openai">OpenAI GPT-4</option>
                </select>
              </div>
            </div>
            
            <button 
              onClick={() => createNewGame('ai')}
              className="mode-btn"
              disabled={isLoading || !isAuthenticated}
            >
              <Play size={16} />
              Start AI Game
            </button>
          </div>
        </div>
      </section>

      {/* Join Game Section */}
      <section className="join-section">
        <h3>Join an Existing Game</h3>
        <p>Have a game code? Enter it below to join your friends</p>
        
        <div className="join-form">
          <input
            type="text"
            className={`join-input ${localError && gameCode.length !== 6 ? 'input-error' : ''}`}
            placeholder="Enter 6-character code"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            maxLength={6}
            disabled={isLoading || !isAuthenticated}
          />
          <button 
            onClick={joinGame}
            className="btn btn-primary"
            disabled={isLoading || !isAuthenticated || gameCode.length !== 6}
          >
            <Play size={16} />
            Join Game
          </button>
        </div>
      </section>

      {/* Auth Required Section */}
      {!isAuthenticated && (
        <section className="auth-required">
          <div className="auth-message">
            <h3>Sign In to Play</h3>
            <p>Create an account or sign in to start playing Chaupar</p>
            
            <div className="auth-options">
              <button 
                onClick={() => handleSignIn('google')}
                className="btn btn-primary btn-large"
                disabled={isConnecting || isOffline}
              >
                <LogIn size={20} />
                Sign In with Google
              </button>
              
              <div className="auth-divider">
                <span>or</span>
              </div>
              
              <button 
                onClick={() => handleSignIn('anonymous')}
                className="btn btn-outline btn-large"
                disabled={isConnecting || isOffline}
              >
                <User size={20} />
                Play as Guest
              </button>
            </div>
            
            <p className="auth-note">
              Guest accounts are temporary and will be reset when you close the browser
            </p>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Play Chaupar?</h2>
          <p>Discover the unique features that make this ancient game special</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">
              <Trophy size={28} />
            </div>
            <h4>Strategic Depth</h4>
            <span>Master the art of piece movement and strategic positioning</span>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <Globe size={28} />
            </div>
            <h4>Cultural Heritage</h4>
            <span>Experience a game that has been played for centuries</span>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <Users size={28} />
            </div>
            <h4>Social Gaming</h4>
            <span>Connect with friends through shared game experiences</span>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <Zap size={28} />
            </div>
            <h4>AI Opponents</h4>
            <span>Challenge intelligent AI players at various skill levels</span>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <Shield size={28} />
            </div>
            <h4>Secure & Private</h4>
            <span>Your games and data are protected with modern security</span>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <Clock size={28} />
            </div>
            <h4>Quick Sessions</h4>
            <span>Enjoy fast-paced games that fit your schedule</span>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-content">
          <div className="cta-icon">🎲</div>
          <h3>Ready to Play?</h3>
          <p>Join thousands of players enjoying Chaupar online</p>
          
          <div className="cta-buttons">
            {isAuthenticated ? (
              <button 
                onClick={() => createNewGame('ai')}
                className="btn btn-primary btn-large"
                disabled={isLoading}
              >
                <Play size={20} />
                Start Playing Now
              </button>
            ) : (
              <button 
                onClick={() => handleSignIn('google')}
                className="btn cta-btn btn-large"
                disabled={isConnecting || isOffline}
              >
                <LogIn size={20} />
                Get Started
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
