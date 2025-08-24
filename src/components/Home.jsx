import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, User, Crown, LogIn, LogOut, Play, 
  AlertCircle, CheckCircle, X, Copy, Gamepad2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home = ({ setGameState }) => {
  const [gameCode, setGameCode] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate');
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

    try {
      setIsLoading(true);
      setLocalError(null);
      clearError();
      
      // If user is not authenticated, sign them in anonymously first
      if (!isAuthenticated) {
        try {
          await signInAnonymous();
          setSuccessMessage('Signed in as guest to start playing!');
        } catch (signInError) {
          setLocalError('Failed to sign in as guest. Please try again.');
          console.error('Anonymous sign in failed:', signInError);
          return;
        }
      }
      
      const gameId = generateGameCode();
      const playerName = user?.displayName || (user?.isAnonymous ? 'Guest Player' : 'You');
      
      const newGame = {
        id: gameId,
        mode: mode,
        players: [{ 
          id: user?.uid || 'guest_' + Date.now(), 
          name: playerName, 
          isHost: true,
          email: user?.email || null,
          isAnonymous: user?.isAnonymous || true
        }],
        status: 'waiting',
        skillLevel: skillLevel,
        createdAt: new Date(),
        createdBy: user?.uid || 'guest_' + Date.now()
      };
      
      if (mode === 'ai') {
        newGame.players.push({
          id: 'ai_1',
          name: `AI (${skillLevel})`,
          isAI: true,
          skillLevel: skillLevel
        });
        newGame.status = 'playing';
      }
      
      setGameState(newGame);
      setSuccessMessage(`${mode === 'ai' ? 'AI game' : 'Multiplayer game'} created!`);
      
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
  }, [isAuthenticated, isAnonymous, isOffline, user, skillLevel, generateGameCode, setGameState, navigate, clearError, signInAnonymous]);

  const joinGame = useCallback(async () => {
    if (isOffline) {
      setLocalError('You are offline. Please check your connection and try again.');
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
      
      // If user is not authenticated, sign them in anonymously first
      if (!isAuthenticated) {
        try {
          await signInAnonymous();
          setSuccessMessage('Signed in as guest to join the game!');
        } catch (signInError) {
          setLocalError('Failed to sign in as guest. Please try again.');
          console.error('Anonymous sign in failed:', signInError);
          return;
        }
      }
      
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
  }, [isAuthenticated, isOffline, gameCode, navigate, clearError, signInAnonymous]);

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
    }
  }, []);

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="home-loading">
        <div className="loading-spinner" />
        <p>Loading Chaupar...</p>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Compact Header */}
      <header className="home-header">
        <div className="auth-section">
          <div className="user-info">
            {isAuthenticated ? (
              <div className="user-details">
                <h3>{user.displayName || 'Player'}</h3>
                <p>{isAnonymous ? 'Guest' : user.email}</p>
              </div>
            ) : (
              <div className="guest-indicator">
                <User size={14} />
                Guest Player
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
                <LogOut size={14} />
                Sign Out
              </button>
            ) : (
              <button 
                onClick={() => handleSignIn('google')}
                className="btn btn-outline"
                disabled={isConnecting || isOffline}
              >
                <LogIn size={14} />
                Sign In
              </button>
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
            <AlertCircle size={14} />
            <span>Offline mode - limited features</span>
          </motion.div>
        )}

        {localError && (
          <motion.div 
            className="error-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertCircle size={14} />
            <span>{localError}</span>
            <div className="error-actions">
              <button 
                onClick={() => copyErrorToClipboard(localError)}
                className="copy-error-btn"
                aria-label="Copy error"
                title="Copy error to clipboard"
              >
                <Copy size={12} />
              </button>
              <button 
                onClick={() => {
                  setLocalError(null);
                  clearError();
                }}
                aria-label="Close error"
              >
                <X size={14} />
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
            <CheckCircle size={14} />
            <span>{successMessage}</span>
            <button 
              onClick={() => setSuccessMessage(null)}
              aria-label="Close message"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section - Ultra Compact */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Gamepad2 size={14} />
            Ancient Indian Strategy
          </div>
          
          <div className="hero-title">
            <h1 className="title-main">Chaupar</h1>
            <p className="title-subtitle">The Royal Game</p>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <span>2-4 Players</span>
            </div>
            <div className="stat-item">
              <span>Strategy</span>
            </div>
            <div className="stat-item">
              <span>Ancient</span>
            </div>
          </div>
        </div>
      </section>

      {/* Game Modes - Mobile Optimized */}
      <section className="game-modes-section">
        <div className="game-modes">
          <div className="mode-card">
            <div className="mode-icon">
              <Users size={20} />
            </div>
            <div className="mode-title">
              <h3>Multiplayer</h3>
              <p className="mode-subtitle">Play with friends</p>
            </div>
            <button 
              onClick={() => createNewGame('multiplayer')}
              className="mode-btn"
              disabled={isLoading}
            >
              <Play size={14} />
              Create Game
            </button>
          </div>

          <div className="mode-card">
            <div className="mode-icon">
              <Crown size={20} />
            </div>
            <div className="mode-title">
              <h3>AI Challenge</h3>
              <p className="mode-subtitle">Test your skills</p>
            </div>
            
            <div className="ai-config">
              <div className="config-row">
                <label>Skill:</label>
                <select 
                  value={skillLevel} 
                  onChange={(e) => setSkillLevel(e.target.value)}
                >
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            
            <button 
              onClick={() => createNewGame('ai')}
              className="mode-btn"
              disabled={isLoading}
            >
              <Play size={14} />
              Start AI Game
            </button>
          </div>
        </div>
      </section>

      {/* Join Game - Compact */}
      <section className="join-section">
        <h3>Join Game</h3>
        <div className="join-form">
          <input
            type="text"
            className={`join-input ${localError && gameCode.length !== 6 ? 'input-error' : ''}`}
            placeholder="Enter 6-character code"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            maxLength={6}
            disabled={isLoading}
          />
          <button 
            onClick={joinGame}
            className="btn btn-primary"
            disabled={isLoading || gameCode.length !== 6}
          >
            <Play size={14} />
            Join
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
