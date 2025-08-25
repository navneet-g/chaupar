import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useChauparGame } from './GameState';
import GameBoard from './GameBoard';
import GameControls from './GameControls';
import GameInfo from './GameInfo';
import {
  Box,
  Button,
  Typography,
  Container,
  AppBar,
  Toolbar,
  Chip,
  IconButton,
  Stack,
  Paper,
  Divider,
  CircularProgress,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from '@mui/material';
import {
  Home as HomeIcon,
  Share as ShareIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon,
  SmartToy as AIIcon,
  Menu as MenuIcon,
  Book as BookIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Close as XIcon
} from '@mui/icons-material';

const Game = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user, isAnonymous, signOutUser } = useAuth();
  
  const [currentGame, setCurrentGame] = useState(null);
  const [gameInstance, setGameInstance] = useState(null);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    gameState,
    initializeGame: initializeGameCallback,
    rollDice,
    makeMove,
    isLoading: gameLoading,
    error: gameError
  } = useChauparGame();

  // Initialize game when component mounts or game changes
  useEffect(() => {
    if (currentGame && !gameInstance) {
      console.log('Initializing game:', currentGame.mode);
      if (currentGame.mode === 'ai') {
        initializeGameCallback('ai', {
          skillLevel: currentGame.skillLevel || 'intermediate'
        });
      } else {
        initializeGameCallback('multiplayer');
      }
    }
  }, [currentGame, gameInstance, initializeGameCallback]);

  // Handle game creation/joining
  useEffect(() => {
    if (gameId && !currentGame) {
      // For demo purposes, create a mock game
      const mockGame = {
        id: gameId,
        mode: 'ai', // Default to AI for demo
        players: [
          {
            id: user?.uid || 'guest',
            name: user?.displayName || 'Guest Player',
            email: user?.email || 'guest@chaupar.com',
            isAnonymous: user?.isAnonymous || true
          }
        ],
        skillLevel: 'intermediate',
        status: 'playing',
        createdAt: new Date().toISOString()
      };
      setCurrentGame(mockGame);
    }
  }, [gameId, currentGame, user]);

  const handleRollDice = useCallback(async () => {
    if (!gameInstance) {
      console.log('No game instance available');
      return;
    }
    
    console.log('Rolling dice...');
    try {
      await rollDice();
    } catch (error) {
      console.error('Error rolling dice:', error);
      setError('Failed to roll dice. Please try again.');
    }
  }, [gameInstance, rollDice]);

  const handleMove = useCallback(async (fromSquare, toSquare) => {
    if (!gameInstance) return;
    
    try {
      await makeMove(fromSquare, toSquare);
    } catch (error) {
      console.error('Error making move:', error);
      setError('Failed to make move. Please try again.');
    }
  }, [gameInstance, makeMove]);

  const handleNewGame = useCallback(() => {
    setCurrentGame(null);
    setGameInstance(null);
    setError(null);
    navigate('/');
  }, [navigate]);

  const handleShareGame = useCallback(async () => {
    try {
      await navigator.share({
        title: 'Join my Chaupar game!',
        text: `I'm playing Chaupar! Join me with code: ${gameId}`,
        url: window.location.href
      });
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
    }
  }, [gameId]);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleTutorial = () => {
    navigate('/tutorial');
    setMenuOpen(false);
  };

  const handleHelp = () => {
    navigate('/help');
    setMenuOpen(false);
  };

  const canRoll = gameState?.currentPlayer === 0 && gameState?.gameStatus === 'playing' && !gameLoading;

  if (error) {
    return (
      <Container maxWidth="md" sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1b0f 25%, #4a2c2a 50%, #8b4513 75%, #a0522d 100%)'
      }}>
        <Paper elevation={3} sx={{ 
          p: 4, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
          border: '2px solid #daa520'
        }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#ffffff' }}>
            Game Error
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: '#ffffff' }}>
            {error}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={() => setError(null)}
              sx={{
                background: 'linear-gradient(135deg, #daa520 0%, #ffd700 100%)',
                color: '#2c1810',
                '&:hover': {
                  background: 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)'
                }
              }}
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              onClick={handleNewGame}
              sx={{
                color: '#ffffff',
                borderColor: '#ffffff',
                '&:hover': {
                  backgroundColor: '#ffffff',
                  color: '#2c1810'
                }
              }}
            >
              New Game
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (!currentGame || gameLoading) {
    return (
      <Container maxWidth="md" sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1b0f 25%, #4a2c2a 50%, #8b4513 75%, #a0522d 100%)'
      }}>
        <Box sx={{ textAlign: 'center', color: '#ffffff' }}>
          <CircularProgress size={60} sx={{ color: '#ffd700', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 1, color: '#ffd700' }}>
            Loading Game...
          </Typography>
          <Typography variant="body1">
            Setting up your Chaupar experience
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1b0f 25%, #4a2c2a 50%, #8b4513 75%, #a0522d 100%)',
      color: '#ffffff'
    }}>
      {/* Game Header */}
      <AppBar position="static" sx={{ 
        background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
        borderBottom: '2px solid #daa520'
      }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              onClick={handleNewGame}
              sx={{ color: '#ffffff' }}
            >
              <HomeIcon />
            </IconButton>
            
            <Divider orientation="vertical" flexItem sx={{ backgroundColor: '#daa520' }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {currentGame.mode === 'ai' ? (
                <AIIcon sx={{ color: '#ffd700' }} />
              ) : (
                <GroupIcon sx={{ color: '#ffd700' }} />
              )}
              <Typography variant="body2" sx={{ color: '#ffffff' }}>
                {currentGame.mode === 'ai' ? 'AI Game' : 'Multiplayer'}
              </Typography>
            </Box>
            
            {currentGame.skillLevel && (
              <Chip 
                label={currentGame.skillLevel} 
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  border: '1px solid #ffffff'
                }}
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              onClick={handleShareGame}
              sx={{ color: '#ffffff' }}
            >
              <ShareIcon />
            </IconButton>
            
            <IconButton
              color="inherit"
              onClick={() => setMenuOpen(true)}
              sx={{ color: '#ffffff' }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hamburger Menu */}
      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
            borderLeft: '2px solid #daa520',
            width: 280
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700 }}>
              Game Menu
            </Typography>
                          <IconButton
                onClick={() => setMenuOpen(false)}
                sx={{ color: '#ffffff' }}
              >
                <XIcon />
              </IconButton>
          </Box>
          
          <Divider sx={{ backgroundColor: '#daa520', mb: 2 }} />
          
          <List>
            {/* Game Actions */}
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  setShowSettings(!showSettings);
                  setMenuOpen(false);
                }}
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                <ListItemIcon>
                  <SettingsIcon sx={{ color: '#ffd700' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Game Settings" 
                  sx={{ color: '#ffffff' }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => window.location.reload()}
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                <ListItemIcon>
                  <RefreshIcon sx={{ color: '#ffd700' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Restart Game" 
                  sx={{ color: '#ffffff' }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={handleNewGame}
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                <ListItemIcon>
                  <HomeIcon sx={{ color: '#ffd700' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="New Game" 
                  sx={{ color: '#ffffff' }}
                />
              </ListItemButton>
            </ListItem>

            {/* Navigation */}
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={handleTutorial}
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                <ListItemIcon>
                  <BookIcon sx={{ color: '#ffd700' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Tutorial" 
                  sx={{ color: '#ffffff' }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={handleHelp}
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                <ListItemIcon>
                  <HelpIcon sx={{ color: '#ffd700' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Help & Rules" 
                  sx={{ color: '#ffffff' }}
                />
              </ListItemButton>
            </ListItem>

            {/* User Actions */}
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={handleSignOut}
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                <ListItemIcon>
                  <LogoutIcon sx={{ color: '#ffd700' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Sign Out" 
                  sx={{ color: '#ffffff' }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Game Content */}
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Stack spacing={2}>
          {/* Game Info */}
          <Paper elevation={3} sx={{ 
            p: 2,
            background: 'linear-gradient(135deg, #654321 0%, #8b4513 100%)',
            border: '1px solid #daa520'
          }}>
            <GameInfo 
              gameState={gameState}
              currentGame={currentGame}
              user={user}
            />
          </Paper>

          {/* Game Board */}
          <Paper elevation={3} sx={{ 
            p: 2,
            background: 'linear-gradient(135deg, #654321 0%, #8b4513 100%)',
            border: '1px solid #daa520'
          }}>
            <GameBoard 
              gameState={gameState}
              onSquareClick={handleMove}
              currentPlayer={gameState?.currentPlayer}
            />
          </Paper>

          {/* Game Controls */}
          <Paper elevation={3} sx={{ 
            p: 2,
            background: 'linear-gradient(135deg, #654321 0%, #8b4513 100%)',
            border: '1px solid #daa520'
          }}>
            <GameControls 
              onRollDice={handleRollDice}
              canRoll={canRoll}
              isLoading={gameLoading}
              gameState={gameState}
            />
          </Paper>
        </Stack>
      </Container>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '300px',
              height: '100vh',
              zIndex: 1000
            }}
          >
            <Paper elevation={8} sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
              borderLeft: '2px solid #daa520'
            }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#ffffff' }}>
                  Game Settings
                </Typography>
                
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => window.location.reload()}
                    sx={{
                      color: '#ffffff',
                      borderColor: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        color: '#2c1810'
                      }
                    }}
                  >
                    Restart Game
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<HomeIcon />}
                    onClick={handleNewGame}
                    sx={{
                      color: '#ffffff',
                      borderColor: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        color: '#2c1810'
                      }
                    }}
                  >
                    New Game
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Game;
