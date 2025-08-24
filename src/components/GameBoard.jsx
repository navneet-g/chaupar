import { motion } from 'framer-motion';
import { Crown, Star } from 'lucide-react';
import './GameBoard.css';

const GameBoard = ({ currentPlayer, diceValue, gameStatus }) => {
  // Traditional Chaupar board has 68 squares arranged in a cross pattern
  // The board is divided into 4 arms with a central hub
  
  // Define the board layout - each arm has 17 squares
  const boardLayout = {
    topArm: Array.from({ length: 17 }, (_, i) => i + 1),      // 1-17
    leftArm: Array.from({ length: 17 }, (_, i) => i + 18),    // 18-34
    rightArm: Array.from({ length: 17 }, (_, i) => i + 35),   // 35-51
    bottomArm: Array.from({ length: 17 }, (_, i) => i + 52),  // 52-68
    centralHub: [] // Traditional Chaupar has no playable squares in center
  };
  
  // Special squares based on traditional Chaupar rules
  const specialSquares = {
    1: { type: 'start', player: 0, name: 'Start' },
    68: { type: 'finish', player: 0, name: 'Finish' },
    8: { type: 'safe', player: 0, name: 'Safe' },
    15: { type: 'safe', player: 0, name: 'Safe' },
    22: { type: 'safe', player: 0, name: 'Safe' },
    29: { type: 'safe', player: 0, name: 'Safe' },
    36: { type: 'safe', player: 0, name: 'Safe' },
    43: { type: 'safe', player: 0, name: 'Safe' },
    50: { type: 'safe', player: 0, name: 'Safe' },
    57: { type: 'safe', player: 0, name: 'Safe' },
    64: { type: 'safe', player: 0, name: 'Safe' }
  };

  const getSquareClass = (squareNum) => {
    let classes = ['board-square'];
    
    if (specialSquares[squareNum]) {
      classes.push(`square-${specialSquares[squareNum].type}`);
      if (specialSquares[squareNum].player !== undefined) {
        classes.push(`player-${specialSquares[squareNum].player}`);
      }
    }
    
    // Add traditional Chaupar color classes
    if (squareNum <= 17) classes.push('top-arm');
    else if (squareNum <= 34) classes.push('left-arm');
    else if (squareNum <= 51) classes.push('right-arm');
    else if (squareNum <= 68) classes.push('bottom-arm');
    
    return classes.join(' ');
  };

  const getSquareContent = (squareNum) => {
    if (squareNum === 1) {
      return <Crown size={16} color="#FFD700" />;
    }
    if (squareNum === 68) {
      return <Star size={16} color="#FFD700" />;
    }
    if (specialSquares[squareNum]?.type === 'safe') {
      return <div className="safe-indicator">🌸</div>;
    }
    return <span className="square-number">{squareNum}</span>;
  };

  const renderArm = (squares, armClass, direction = 'horizontal') => (
    <div className={`board-arm ${armClass}`}>
      {squares.map((squareNum) => (
        <motion.div
          key={squareNum}
          className={getSquareClass(squareNum)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={`Square ${squareNum}${specialSquares[squareNum] ? ` - ${specialSquares[squareNum].name}` : ''}`}
        >
          {getSquareContent(squareNum)}
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="game-board">
      <div className="board-container">
        <div className="board-header">
          <h2>Traditional Chaupar Board</h2>
          <div className="board-info">
            <span>Player {currentPlayer + 1}'s Turn</span>
            {diceValue && <span className="dice-result">Cowrie: {diceValue}</span>}
          </div>
        </div>
        
        <div className="board-container-cross">
          {/* Top arm of the cross */}
          {renderArm(boardLayout.topArm, 'board-arm-top', 'horizontal')}
          
          {/* Middle section with left and right arms */}
          <div className="board-middle">
            {/* Left arm */}
            {renderArm(boardLayout.leftArm, 'board-arm-left', 'vertical')}
            
            {/* Central hub - traditional Chaupar design */}
            <div className="board-central-hub">
              <div className="central-design">
                <div className="chaupar-title">Chaupar</div>
                <div className="chaupar-symbol">🎲</div>
                <div className="chaupar-subtitle">Ancient Indian Game</div>
              </div>
            </div>
            
            {/* Right arm */}
            {renderArm(boardLayout.rightArm, 'board-arm-right', 'vertical')}
          </div>
          
          {/* Bottom arm of the cross */}
          {renderArm(boardLayout.bottomArm, 'board-arm-bottom', 'horizontal')}
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
            <span>Start (Square 1)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color finish"></div>
            <span>Finish (Square 68)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color safe"></div>
            <span>Safe Zone (🌸)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color top-arm"></div>
            <span>Top Arm (1-17)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color left-arm"></div>
            <span>Left Arm (18-34)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color right-arm"></div>
            <span>Right Arm (35-51)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bottom-arm"></div>
            <span>Bottom Arm (52-68)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
