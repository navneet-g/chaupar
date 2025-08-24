import { motion } from 'framer-motion';
import { Crown, Star } from 'lucide-react';
import './GameBoard.css';

const GameBoard = ({ currentPlayer, diceValue, gameStatus }) => {
  // Traditional Chaupar board has 68 squares arranged in a cross pattern
  const boardSquares = Array.from({ length: 68 }, (_, i) => i + 1);
  
  // Special squares based on traditional board layout
  const specialSquares = {
    1: { type: 'start', player: 0 },
    68: { type: 'finish', player: 0 },
    8: { type: 'safe', player: 0 },
    15: { type: 'safe', player: 0 },
    22: { type: 'safe', player: 0 },
    29: { type: 'safe', player: 0 },
    36: { type: 'safe', player: 0 },
    43: { type: 'safe', player: 0 },
    50: { type: 'safe', player: 0 },
    57: { type: 'safe', player: 0 },
    64: { type: 'safe', player: 0 }
  };

  // Traditional color scheme based on the image
  const traditionalColors = [
    '#FFFFFF', // White
    '#800080', // Purple
    '#008000', // Green
    '#FF69B4', // Pink
    '#FFFF00', // Yellow/Lime
    '#32CD32'  // Lime Green
  ];

  const getSquareClass = (squareNum) => {
    let classes = ['board-square'];
    
    if (specialSquares[squareNum]) {
      classes.push(`square-${specialSquares[squareNum].type}`);
      if (specialSquares[squareNum].player !== undefined) {
        classes.push(`player-${specialSquares[squareNum].player}`);
      }
    }
    
    // Add player position indicators
    if (squareNum === 1) classes.push('player-start');
    if (squareNum === 68) classes.push('player-finish');
    
    return classes.join(' ');
  };

  const getSquareContent = (squareNum) => {
    if (squareNum === 1) {
      return <Crown size={20} color="#FFD700" />;
    }
    if (squareNum === 68) {
      return <Star size={20} color="#FFD700" />;
    }
    if (specialSquares[squareNum]?.type === 'safe') {
      return <div className="safe-indicator">●</div>;
    }
    return squareNum;
  };

  return (
    <div className="game-board">
      <div className="board-container">
        <div className="board-header">
          <h2>Chaupar Board</h2>
          <div className="board-info">
            <span>Player {currentPlayer + 1}'s Turn</span>
            {diceValue && <span className="dice-result">Dice: {diceValue}</span>}
          </div>
        </div>
        
        <div className="board-container-cross">
          {/* Top arm of the cross */}
          <div className="board-arm board-arm-top">
            {boardSquares.slice(0, 17).map((squareNum) => (
              <motion.div
                key={squareNum}
                className={getSquareClass(squareNum)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {getSquareContent(squareNum)}
              </motion.div>
            ))}
          </div>
          
          {/* Middle section with left and right arms */}
          <div className="board-middle">
            <div className="board-arm board-arm-left">
              {boardSquares.slice(17, 34).map((squareNum) => (
                <motion.div
                  key={squareNum}
                  className={getSquareClass(squareNum)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {getSquareContent(squareNum)}
                </motion.div>
              ))}
            </div>
            
            {/* Central hub */}
            <div className="board-central-hub">
              <div className="central-square">
                <Crown size={30} color="#FFD700" />
                <span>Chaupar</span>
              </div>
            </div>
            
            <div className="board-arm board-arm-right">
              {boardSquares.slice(34, 51).map((squareNum) => (
                <motion.div
                  key={squareNum}
                  className={getSquareClass(squareNum)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {getSquareContent(squareNum)}
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Bottom arm of the cross */}
          <div className="board-arm board-arm-bottom">
            {boardSquares.slice(51, 68).map((squareNum) => (
              <motion.div
                key={squareNum}
                className={getSquareClass(squareNum)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {getSquareContent(squareNum)}
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Player piece areas around the board - 2 players only */}
        <div className="player-areas">
          <div className="player-area player-area-top">
            <div className="player-pieces">
              <div className="player-piece black"></div>
              <div className="player-piece black"></div>
              <div className="player-piece black"></div>
              <div className="player-piece black"></div>
            </div>
            <span>You (Player 1)</span>
          </div>
          
          <div className="player-area player-area-bottom">
            <div className="player-pieces">
              <div className="player-piece red"></div>
              <div className="player-piece red"></div>
              <div className="player-piece red"></div>
              <div className="player-piece red"></div>
            </div>
            <span>AI Opponent (Player 2)</span>
          </div>
        </div>

        <div className="board-legend">
          <div className="legend-item">
            <div className="legend-color start"></div>
            <span>Start</span>
          </div>
          <div className="legend-item">
            <div className="legend-color finish"></div>
            <span>Finish</span>
          </div>
          <div className="legend-item">
            <div className="legend-color safe"></div>
            <span>Safe Zone</span>
          </div>
          <div className="legend-item">
            <div className="legend-color player-0"></div>
            <span>Player 1</span>
          </div>
          <div className="legend-item">
            <div className="legend-color player-1"></div>
            <span>Player 2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
