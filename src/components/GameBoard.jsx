import { motion } from 'framer-motion';
import { Crown, Star, Home } from 'lucide-react';
import './GameBoard.css';

const GameBoard = ({ currentPlayer, diceValue, gameStatus }) => {
  // Traditional Chaupar board layout - X-shaped with crossing paths
  // 4 home areas (corners) + central X-shaped path (68 squares)
  
  // Central path squares (1-68) - shared by all players
  const centralPath = Array.from({ length: 68 }, (_, i) => i + 1);
  
  // Special squares based on traditional Chaupar rules
  const specialSquares = {
    1: { type: 'start', name: 'Start' },
    68: { type: 'finish', name: 'Finish' },
    8: { type: 'safe', name: 'Safe' },
    15: { type: 'safe', name: 'Safe' },
    22: { type: 'safe', name: 'Safe' },
    29: { type: 'safe', name: 'Safe' },
    36: { type: 'safe', name: 'Safe' },
    43: { type: 'safe', name: 'Safe' },
    50: { type: 'safe', name: 'Safe' },
    57: { type: 'safe', name: 'Safe' },
    64: { type: 'safe', name: 'Safe' }
  };

  const getSquareClass = (squareNum) => {
    let classes = ['board-square'];
    
    if (specialSquares[squareNum]) {
      classes.push(`square-${specialSquares[squareNum].type}`);
    }
    
    // Add path position classes for proper coloring
    if (squareNum <= 17) classes.push('path-top');
    else if (squareNum <= 34) classes.push('path-left');
    else if (squareNum <= 51) classes.push('path-right');
    else if (squareNum <= 68) classes.push('path-bottom');
    
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

  const handleSquareClick = (squareNum) => {
    console.log(`Clicked square ${squareNum}`);
    // Handle square click logic here
  };

  const renderXShapedPath = () => (
    <div className="x-shaped-path">
      {/* Top-left diagonal path (1-17) */}
      <div className="path-diagonal path-top-left">
        {centralPath.slice(0, 17).map((squareNum) => (
          <motion.div
            key={squareNum}
            className={`board-square ${getSquareClass(squareNum)}`}
            onClick={() => handleSquareClick(squareNum)}
            onKeyDown={(e) => e.key === 'Enter' && handleSquareClick(squareNum)}
            tabIndex={0}
            role="button"
            aria-label={`Square ${squareNum}${specialSquares[squareNum] ? ` - ${specialSquares[squareNum].name}` : ''}`}
            title={`Square ${squareNum}${specialSquares[squareNum] ? ` - ${specialSquares[squareNum].name}` : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {getSquareContent(squareNum)}
          </motion.div>
        ))}
      </div>
      
      {/* Top-right diagonal path (18-34) */}
      <div className="path-diagonal path-top-right">
        {centralPath.slice(17, 34).map((squareNum) => (
          <motion.div
            key={squareNum}
            className={`board-square ${getSquareClass(squareNum)}`}
            onClick={() => handleSquareClick(squareNum)}
            onKeyDown={(e) => e.key === 'Enter' && handleSquareClick(squareNum)}
            tabIndex={0}
            role="button"
            aria-label={`Square ${squareNum}${specialSquares[squareNum] ? ` - ${specialSquares[squareNum].name}` : ''}`}
            title={`Square ${squareNum}${specialSquares[squareNum] ? ` - ${specialSquares[squareNum].name}` : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {getSquareContent(squareNum)}
          </motion.div>
        ))}
      </div>
      
      {/* Central hub - traditional Chaupar design */}
      <div className="board-central-hub">
        <div className="central-design">
          <div className="chaupar-title">Chaupar</div>
          <div className="chaupar-symbol">🎲</div>
          <div className="chaupar-subtitle">Ancient Indian Game</div>
        </div>
      </div>
      
      {/* Bottom-left diagonal path (35-51) */}
      <div className="path-diagonal path-bottom-left">
        {centralPath.slice(34, 51).map((squareNum) => (
          <motion.div
            key={squareNum}
            className={`board-square ${getSquareClass(squareNum)}`}
            onClick={() => handleSquareClick(squareNum)}
            onKeyDown={(e) => e.key === 'Enter' && handleSquareClick(squareNum)}
            tabIndex={0}
            role="button"
            aria-label={`Square ${squareNum}${specialSquares[squareNum] ? ` - ${specialSquares[squareNum].name}` : ''}`}
            title={`Square ${squareNum}${specialSquares[squareNum] ? ` - ${specialSquares[squareNum].name}` : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {getSquareContent(squareNum)}
          </motion.div>
        ))}
      </div>
      
      {/* Bottom-right diagonal path (52-68) */}
      <div className="path-diagonal path-bottom-right">
        {centralPath.slice(51, 68).map((squareNum) => (
          <motion.div
            key={squareNum}
            className={`board-square ${getSquareClass(squareNum)}`}
            onClick={() => handleSquareClick(squareNum)}
            onKeyDown={(e) => e.key === 'Enter' && handleSquareClick(squareNum)}
            tabIndex={0}
            role="button"
            aria-label={`Square ${squareNum}${specialSquares[squareNum] ? ` - ${specialSquares[squareNum].name}` : ''}`}
            title={`Square ${squareNum}${specialSquares[squareNum] ? ` - ${specialSquares[squareNum].name}` : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {getSquareContent(squareNum)}
          </motion.div>
        ))}
      </div>
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
        
        <div className="board-layout">
          {/* Top home areas - side by side */}
          <div className="home-areas-row">
            <div className="home-area home-top-left">
              <div className="home-title">Player 1</div>
              <div className="home-pieces">
                <div className="home-piece player1-piece"></div>
                <div className="home-piece player1-piece"></div>
                <div className="home-piece player1-piece"></div>
                <div className="home-piece player1-piece"></div>
              </div>
            </div>
            
            <div className="home-area home-top-right">
              <div className="home-title">Player 2</div>
              <div className="home-pieces">
                <div className="home-piece player2-piece"></div>
                <div className="home-piece player2-piece"></div>
                <div className="home-piece player2-piece"></div>
                <div className="home-piece player2-piece"></div>
              </div>
            </div>
          </div>
          
          {/* Central game board with X-shaped paths */}
          <div className="game-board-center">
            {renderXShapedPath()}
          </div>
          
          {/* Bottom home areas - side by side */}
          <div className="home-areas-row">
            <div className="home-area home-bottom-left">
              <div className="home-title">Player 3</div>
              <div className="home-pieces">
                <div className="home-piece player3-piece"></div>
                <div className="home-piece player3-piece"></div>
                <div className="home-piece player3-piece"></div>
                <div className="home-piece player3-piece"></div>
              </div>
            </div>
            
            <div className="home-area home-bottom-right">
              <div className="home-title">Player 4</div>
              <div className="home-pieces">
                <div className="home-piece player4-piece"></div>
                <div className="home-piece player4-piece"></div>
                <div className="home-piece player4-piece"></div>
                <div className="home-piece player4-piece"></div>
              </div>
            </div>
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
            <div className="legend-color path-top"></div>
            <span>Top Path (1-17)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color path-left"></div>
            <span>Left Path (18-34)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color path-right"></div>
            <span>Right Path (35-51)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color path-bottom"></div>
            <span>Bottom Path (52-68)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
