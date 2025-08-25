import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, User, Crown, LogIn, LogOut, Play, 
  AlertCircle, CheckCircle, X, Copy, Gamepad2, Menu, BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Container,
  AppBar,
  Toolbar,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  IconButton,
  Stack,
  Divider,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Grid
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Group as GroupIcon,
  SmartToy as AIIcon,
  Login as LoginIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  Book as BookIcon,
  Logout as LogoutIcon,
  Help as HelpIcon
} from '@mui/icons-material';

const Home = ({ setGameState }) => {
  const [gameCode, setGameCode] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [menuOpen, setMenuOpen] = useState(false);
  
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
          id: user?.uid || 'guest',
          name: playerName, 
          email: user?.email || 'guest@chaupar.com',
          isAnonymous: user?.isAnonymous || true,
          createdBy: user?.uid || 'guest'
        }],
        skillLevel: mode === 'ai' ? skillLevel : null,
        status: 'waiting',
        createdAt: new Date().toISOString(),
        currentTurn: 0
      };
      
      setGameState(newGame);
        navigate(`/game/${gameId}`);
    } catch (error) {
      console.error('Error creating game:', error);
      setLocalError('Failed to create game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isOffline, isAuthenticated, user, skillLevel, setGameState, navigate, signInAnonymous, clearError]);

  const joinGame = useCallback(async () => {
    if (isOffline) {
      setLocalError('You are offline. Please check your connection and try again.');
      return;
    }

    if (!gameCode.trim()) {
      setLocalError('Please enter a game code.');
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

      // For now, just navigate to the game with the code
      // In a real app, you'd validate the game exists first
      navigate(`/game/${gameCode.trim().toUpperCase()}`);
    } catch (error) {
      console.error('Error joining game:', error);
      setLocalError('Failed to join game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isOffline, gameCode, isAuthenticated, navigate, signInAnonymous, clearError]);

  const copyErrorToClipboard = useCallback(async () => {
    try {
      const errorText = `Error: ${localError}\n\nUser: ${user?.email || 'Guest'}\nTimestamp: ${new Date().toISOString()}`;
      await navigator.clipboard.writeText(errorText);
      setSuccessMessage('Error details copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy error:', err);
      setLocalError('Failed to copy error details.');
    }
  }, [localError, user]);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setSuccessMessage('Successfully signed out!');
      setMenuOpen(false);
    } catch (error) {
      setLocalError('Failed to sign out. Please try again.');
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

  if (authLoading || isConnecting) {
    return (
      <Container maxWidth="sm" sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1b0f 25%, #4a2c2a 50%, #8b4513 75%, #a0522d 100%)'
      }}>
        <Box sx={{ textAlign: 'center', color: '#ffffff' }}>
          <Typography variant="h4" sx={{ mb: 2, color: '#ffd700' }}>
            Loading Chaupar...
          </Typography>
          <Typography variant="body1">
            Please wait while we set up your game experience.
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
      {/* App Bar */}
      <AppBar position="static" sx={{ 
        background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
        borderBottom: '2px solid #daa520'
      }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Gamepad2 size={24} style={{ color: '#ffd700' }} />
            <Box>
              <Typography variant="h5" sx={{ 
                color: '#ffffff',
                fontWeight: 800,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                lineHeight: 1
              }}>
                Chaupar
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#ffd700',
                fontWeight: 500
              }}>
                Ancient Indian Strategy Game
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
              <PersonIcon sx={{ color: '#ffd700' }} />
              <Typography variant="body2" sx={{ color: '#ffffff' }}>
                {isAnonymous ? 'Guest Player' : user?.displayName || 'Player'}
              </Typography>
            </Box>
            
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
              Menu
            </Typography>
            <IconButton
              onClick={() => setMenuOpen(false)}
              sx={{ color: '#ffffff' }}
            >
              <X size={20} />
            </IconButton>
          </Box>
          
          <Divider sx={{ backgroundColor: '#daa520', mb: 2 }} />
          
          <List>
            {/* User Info */}
            <ListItem sx={{ mb: 1 }}>
              <Paper elevation={2} sx={{ 
                p: 2, 
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <PersonIcon sx={{ color: '#ffd700', fontSize: 32, mb: 1 }} />
                  <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                    {isAnonymous ? 'Guest Player' : user?.displayName || 'Player'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#ffd700' }}>
                    {isAnonymous ? 'Playing as guest' : user?.email || 'Signed in user'}
                  </Typography>
                </Box>
              </Paper>
            </ListItem>

            {/* Authentication */}
            {!isAuthenticated ? (
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={signInWithGoogle}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 1,
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.2)'
                    }
                  }}
                >
                  <ListItemIcon>
                    <LoginIcon sx={{ color: '#ffd700' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sign In with Google" 
                    sx={{ color: '#ffffff' }}
                  />
                </ListItemButton>
              </ListItem>
            ) : (
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
            )}

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
          </List>
        </Box>
      </Drawer>

      {/* Main Content - Using MUI Grid for proper layout */}
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* Game Modes Section */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ 
              background: 'linear-gradient(135deg, #654321 0%, #8b4513 100%)',
              border: '2px solid #daa520',
              overflow: 'hidden'
            }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ 
                  mb: 3, 
                  color: '#ffd700',
                  fontWeight: 700,
                  textAlign: 'center'
                }}>
                  Choose Your Game Mode
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Multiplayer Card */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      height: '100%',
                      background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
                      border: '1px solid #daa520',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <CardContent sx={{ 
                        p: 3, 
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                        justifyContent: 'space-between'
                      }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                            <GroupIcon sx={{ color: '#ffd700', mr: 1, fontSize: 32 }} />
                            <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 700 }}>
                              Multiplayer
                            </Typography>
                          </Box>
                          
                          <Typography variant="body1" sx={{ mb: 3, color: '#ffffff', fontSize: '1.1rem' }}>
                            Play with friends in real-time
                          </Typography>
                        </Box>
                        
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<PlayIcon />}
                          onClick={() => createNewGame('multiplayer')}
                          disabled={isLoading}
                          sx={{
                            background: 'linear-gradient(135deg, #daa520 0%, #ffd700 100%)',
                            color: '#2c1810',
                            py: 1.5,
                            px: 4,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            '&:hover': {
                              background: 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)'
                            }
                          }}
                        >
                          Create Game
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* AI Challenge Card */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      height: '100%',
                      background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
                      border: '1px solid #daa520',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <CardContent sx={{ 
                        p: 3, 
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                        justifyContent: 'space-between'
                      }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                            <AIIcon sx={{ color: '#ffd700', mr: 1, fontSize: 32 }} />
                            <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 700 }}>
                              AI Challenge
                            </Typography>
                          </Box>
                          
                          <Typography variant="body1" sx={{ mb: 3, color: '#ffffff', fontSize: '1.1rem' }}>
                            Test your skills against AI
                          </Typography>
                          
                          <FormControl size="medium" sx={{ mb: 2, minWidth: 150 }}>
                            <InputLabel sx={{ color: '#ffffff' }}>Skill Level</InputLabel>
                            <Select
                              value={skillLevel}
                              onChange={(e) => setSkillLevel(e.target.value)}
                              sx={{
                                color: '#2c1810',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#daa520'
                                }
                              }}
                            >
                              <MenuItem value="beginner">Beginner</MenuItem>
                              <MenuItem value="intermediate">Intermediate</MenuItem>
                              <MenuItem value="expert">Expert</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<PlayIcon />}
                          onClick={() => createNewGame('ai')}
                          disabled={isLoading}
                          sx={{
                            background: 'linear-gradient(135deg, #daa520 0%, #ffd700 100%)',
                            color: '#2c1810',
                            py: 1.5,
                            px: 4,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            '&:hover': {
                              background: 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)'
                            }
                          }}
                        >
                          Start AI Game
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Join Game Section */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ 
              background: 'linear-gradient(135deg, #654321 0%, #8b4513 100%)',
              border: '2px solid #daa520'
            }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ 
                  mb: 3, 
                  color: '#ffd700',
                  fontWeight: 700,
                  textAlign: 'center'
                }}>
                  Join Existing Game
                </Typography>
                
                <Grid container spacing={3} justifyContent="center" alignItems="center">
                  <Grid item xs={12} sm={8} md={6}>
                    <TextField
                      placeholder="Enter 6-character game code"
                      value={gameCode}
                      onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                      size="large"
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#2c1810',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '1.1rem',
                          '& fieldset': {
                            borderColor: '#daa520',
                            borderWidth: '2px'
                          },
                          '&:hover fieldset': {
                            borderColor: '#ffd700'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#ffd700'
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4} md={3}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayIcon />}
                      onClick={joinGame}
                      disabled={isLoading || !gameCode.trim()}
                      fullWidth
                      sx={{
                        background: 'linear-gradient(135deg, #daa520 0%, #ffd700 100%)',
                        color: '#2c1810',
                        py: 1.5,
                        px: 4,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        height: 56,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)'
                        }
                      }}
                    >
                      JOIN GAME
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Status Messages */}
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed',
              top: 70,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000
            }}
          >
            <Alert 
              severity="warning" 
              sx={{ 
                backgroundColor: 'rgba(139, 69, 19, 0.9)',
                color: '#ffffff',
                border: '1px solid #daa520'
              }}
            >
              You are currently offline. Some features may be limited.
            </Alert>
          </motion.div>
        )}

        {localError && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed',
              top: 70,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000
            }}
          >
            <Alert 
              severity="error"
              action={
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={copyErrorToClipboard}
                >
                  <Copy size={16} />
                </IconButton>
              }
              sx={{ 
                backgroundColor: 'rgba(139, 0, 0, 0.9)',
                color: '#ffffff',
                border: '1px solid #ff4500'
              }}
            >
              {localError}
            </Alert>
          </motion.div>
        )}

        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed',
              top: 70,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000
            }}
          >
            <Alert 
              severity="success"
              sx={{ 
                backgroundColor: 'rgba(0, 100, 0, 0.9)',
                color: '#ffffff',
                border: '1px solid #32cd32'
              }}
            >
              {successMessage}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Home;
