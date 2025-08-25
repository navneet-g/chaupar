import { useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
  Paper
} from '@mui/material';
import {
  Casino as DiceIcon
} from '@mui/icons-material';

const GameControls = ({ onRollDice, canRoll, isLoading, gameState }) => {
  const handleRollDice = useCallback(() => {
    if (canRoll && !isLoading) {
      onRollDice();
    }
  }, [canRoll, isLoading, onRollDice]);

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ 
        mb: 2, 
        color: '#ffffff',
        fontWeight: 700
      }}>
        Game Controls
      </Typography>
      
      <Stack spacing={2} alignItems="center">
        <Button
          variant="contained"
          size="large"
          startIcon={<DiceIcon />}
          onClick={handleRollDice}
          disabled={!canRoll || isLoading}
          sx={{
            background: canRoll 
              ? 'linear-gradient(135deg, #daa520 0%, #ffd700 100%)'
              : 'linear-gradient(135deg, #666666 0%, #999999 100%)',
            color: canRoll ? '#2c1810' : '#ffffff',
            minHeight: 48,
            minWidth: 200,
            fontSize: '1.1rem',
            fontWeight: 600,
            '&:hover': canRoll ? {
              background: 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)'
            } : {},
            '&:disabled': {
              background: 'linear-gradient(135deg, #666666 0%, #999999 100%)',
              color: '#ffffff'
            }
          }}
        >
          {canRoll ? 'Throw Cowrie Shells' : 'Not Your Turn'}
        </Button>
        
        {!canRoll && !isLoading && (
          <Paper elevation={1} sx={{ 
            p: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant="body2" sx={{ color: '#ffffff' }}>
              {gameState?.currentPlayer === 0 
                ? 'Waiting for your turn...' 
                : `Player ${gameState?.currentPlayer + 1}'s turn`
              }
            </Typography>
          </Paper>
        )}
        
        {gameState?.lastThrow && (
          <Paper elevation={1} sx={{ 
            p: 1,
            backgroundColor: 'rgba(255, 215, 0, 0.2)',
            border: '1px solid #daa520'
          }}>
            <Typography variant="body2" sx={{ color: '#ffd700', fontWeight: 600 }}>
              Last Throw: {gameState.lastThrow.score}
            </Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
};

export default GameControls;
