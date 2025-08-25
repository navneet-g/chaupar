import { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack
} from '@mui/material';
import {
  Casino as DiceIcon,
  Star as StarIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const GameBoard = ({ gameState, onSquareClick, currentPlayer }) => {
  // Central path squares (1-68)
  const centralPath = useMemo(() => {
    const squares = [];
    for (let i = 1; i <= 68; i++) {
      squares.push({
        id: i,
        type: 'path',
        isSpecial: i === 1 || i === 9 || i === 14 || i === 22 || i === 27 || i === 35 || i === 40 || i === 48 || i === 53 || i === 61 || i === 66
      });
    }
    return squares;
  }, []);

  // Special squares with their properties
  const specialSquares = useMemo(() => ({
    1: { type: 'start', color: '#4CAF50' },
    9: { type: 'safe', color: '#2196F3' },
    14: { type: 'safe', color: '#2196F3' },
    22: { type: 'safe', color: '#2196F3' },
    27: { type: 'safe', color: '#2196F3' },
    35: { type: 'safe', color: '#2196F3' },
    40: { type: 'safe', color: '#2196F3' },
    48: { type: 'safe', color: '#2196F3' },
    53: { type: 'safe', color: '#2196F3' },
    61: { type: 'safe', color: '#2196F3' },
    66: { type: 'safe', color: '#2196F3' }
  }), []);

  const renderXShapedPath = () => {
    return (
      <Box sx={{ 
        display: 'grid',
        gridTemplateAreas: `
          "top-left center top-right"
          "left center right"
          "bottom-left center bottom-right"
        `,
        gap: 1,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Top-left diagonal path */}
        <Box sx={{ 
          gridArea: 'top-left',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0.5,
          transform: 'rotate(-45deg)',
          transformOrigin: 'center'
        }}>
          {centralPath.slice(0, 16).map(square => (
            <Box
              key={square.id}
              onClick={() => onSquareClick?.(square.id)}
              sx={{
                width: 24,
                height: 24,
                border: '1px solid #daa520',
                borderRadius: '4px',
                backgroundColor: specialSquares[square.id]?.color || '#8b4513',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '10px',
                color: '#ffffff',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#ffd700',
                  color: '#2c1810'
                }
              }}
            >
              {square.id}
            </Box>
          ))}
        </Box>

        {/* Top-right diagonal path */}
        <Box sx={{ 
          gridArea: 'top-right',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0.5,
          transform: 'rotate(45deg)',
          transformOrigin: 'center'
        }}>
          {centralPath.slice(16, 32).map(square => (
            <Box
              key={square.id}
              onClick={() => onSquareClick?.(square.id)}
              sx={{
                width: 24,
                height: 24,
                border: '1px solid #daa520',
                borderRadius: '4px',
                backgroundColor: specialSquares[square.id]?.color || '#8b4513',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '10px',
                color: '#ffffff',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#ffd700',
                  color: '#2c1810'
                }
              }}
            >
              {square.id}
            </Box>
          ))}
        </Box>

        {/* Bottom-left diagonal path */}
        <Box sx={{ 
          gridArea: 'bottom-left',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0.5,
          transform: 'rotate(45deg)',
          transformOrigin: 'center'
        }}>
          {centralPath.slice(32, 48).map(square => (
            <Box
              key={square.id}
              onClick={() => onSquareClick?.(square.id)}
              sx={{
                width: 24,
                height: 24,
                border: '1px solid #daa520',
                borderRadius: '4px',
                backgroundColor: specialSquares[square.id]?.color || '#8b4513',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '10px',
                color: '#ffffff',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#ffd700',
                  color: '#2c1810'
                }
              }}
            >
              {square.id}
            </Box>
          ))}
        </Box>

        {/* Bottom-right diagonal path */}
        <Box sx={{ 
          gridArea: 'bottom-right',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0.5,
          transform: 'rotate(-45deg)',
          transformOrigin: 'center'
        }}>
          {centralPath.slice(48, 64).map(square => (
            <Box
              key={square.id}
              onClick={() => onSquareClick?.(square.id)}
              sx={{
                width: 24,
                height: 24,
                border: '1px solid #daa520',
                borderRadius: '4px',
                backgroundColor: specialSquares[square.id]?.color || '#8b4513',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '10px',
                color: '#ffffff',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#ffd700',
                  color: '#2c1810'
                }
              }}
            >
              {square.id}
            </Box>
          ))}
        </Box>

        {/* Central hub */}
        <Box sx={{ 
          gridArea: 'center',
          width: 80,
          height: 80,
          border: '3px solid #daa520',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <StarIcon sx={{ color: '#ffd700', fontSize: 24 }} />
          <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
            Chaupar
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: 400,
      margin: '0 auto'
    }}>
      {/* Board Title */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ 
          color: '#ffd700',
          fontWeight: 800,
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
        }}>
          Chaupar Board
        </Typography>
      </Box>

      {/* Home Areas */}
      <Box sx={{ mb: 2 }}>
        {/* Top row - Players 1 & 2 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mb: 1 
        }}>
          <Paper elevation={2} sx={{ 
            p: 1,
            background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
            border: '1px solid #daa520',
            minWidth: 120,
            textAlign: 'center'
          }}>
            <Typography variant="caption" sx={{ 
              color: '#ffffff',
              fontWeight: 'bold',
              display: 'block',
              mb: 0.5
            }}>
              Player 1
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 0.5, 
              justifyContent: 'center' 
            }}>
              {[1, 2, 3, 4].map(piece => (
                <Box
                  key={piece}
                  sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: '#ff6b6b',
                    border: '1px solid #ffffff',
                    borderRadius: '50%'
                  }}
                />
              ))}
            </Box>
          </Paper>

          <Paper elevation={2} sx={{ 
            p: 1,
            background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
            border: '1px solid #daa520',
            minWidth: 120,
            textAlign: 'center'
          }}>
            <Typography variant="caption" sx={{ 
              color: '#ffffff',
              fontWeight: 'bold',
              display: 'block',
              mb: 0.5
            }}>
              Player 2
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 0.5, 
              justifyContent: 'center' 
            }}>
              {[1, 2, 3, 4].map(piece => (
                <Box
                  key={piece}
                  sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: '#4ecdc4',
                    border: '1px solid #ffffff',
                    borderRadius: '50%'
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Bottom row - Players 3 & 4 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between' 
        }}>
          <Paper elevation={2} sx={{ 
            p: 1,
            background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
            border: '1px solid #daa520',
            minWidth: 120,
            textAlign: 'center'
          }}>
            <Typography variant="caption" sx={{ 
              color: '#ffffff',
              fontWeight: 'bold',
              display: 'block',
              mb: 0.5
            }}>
              Player 3
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 0.5, 
              justifyContent: 'center' 
            }}>
              {[1, 2, 3, 4].map(piece => (
                <Box
                  key={piece}
                  sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: '#45b7d1',
                    border: '1px solid #ffffff',
                    borderRadius: '50%'
                  }}
                />
              ))}
            </Box>
          </Paper>

          <Paper elevation={2} sx={{ 
            p: 1,
            background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
            border: '1px solid #daa520',
            minWidth: 120,
            textAlign: 'center'
          }}>
            <Typography variant="caption" sx={{ 
              color: '#ffffff',
              fontWeight: 'bold',
              display: 'block',
              mb: 0.5
            }}>
              Player 4
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 0.5, 
              justifyContent: 'center' 
            }}>
              {[1, 2, 3, 4].map(piece => (
                <Box
                  key={piece}
                  sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: '#96ceb4',
                    border: '1px solid #ffffff',
                    borderRadius: '50%'
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Game Board Center */}
      <Paper elevation={3} sx={{ 
        p: 2,
        background: 'linear-gradient(135deg, #654321 0%, #8b4513 100%)',
        border: '2px solid #daa520'
      }}>
        {renderXShapedPath()}
      </Paper>

      {/* Board Legend */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" sx={{ 
          color: '#ffffff',
          fontWeight: 'bold',
          display: 'block',
          mb: 1
        }}>
          Legend:
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Chip 
            icon={<HomeIcon sx={{ fontSize: 12 }} />}
            label="Start" 
            size="small"
            sx={{ 
              backgroundColor: '#4CAF50',
              color: '#ffffff',
              fontSize: '10px'
            }}
          />
          <Chip 
            icon={<StarIcon sx={{ fontSize: 12 }} />}
            label="Safe" 
            size="small"
            sx={{ 
              backgroundColor: '#2196F3',
              color: '#ffffff',
              fontSize: '10px'
            }}
          />
          <Chip 
            icon={<DiceIcon sx={{ fontSize: 12 }} />}
            label="Path" 
            size="small"
            sx={{ 
              backgroundColor: '#8b4513',
              color: '#ffffff',
              fontSize: '10px'
            }}
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default GameBoard;
