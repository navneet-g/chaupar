import { motion } from 'framer-motion';
import { Square, RotateCcw, Play, Pause, Loader } from 'lucide-react';
import './GameControls.css';

const GameControls = ({ 
  onRollDice, 
  onEndTurn, 
  diceValue, 
  currentPlayer, 
  gameStatus, 
  canRoll,
  availableMoves = [],
  isLoading = false
}) => {
  const isGameActive = gameStatus === 'playing';
  const isPlayerTurn = currentPlayer === 0;

  return (
    <div className="game-controls">
      <div className="controls-header">
        <h3>Game Controls</h3>
        <div className="game-status">
          <span className={`status-indicator ${gameStatus}`}>
            {gameStatus === 'waiting' && <Pause size={16} />}
            {gameStatus === 'playing' && <Play size={16} />}
            {gameStatus}
          </span>
        </div>
      </div>

      <div className="dice-section">
        <div className="dice-display">
          {diceValue ? (
            <motion.div 
              className="dice-result"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className="cowrie-shells">
                <div className="cowrie-shell">🐚</div>
                <div className="cowrie-shell">🐚</div>
                <div className="cowrie-shell">🐚</div>
                <div className="cowrie-shell">🐚</div>
                <div className="cowrie-shell">🐚</div>
                <div className="cowrie-shell">🐚</div>
              </div>
              <span className="dice-number">{diceValue}</span>
              <span className="throw-description">
                {diceValue === 10 && '1 up, 6 down'}
                {diceValue === 25 && '5 up, 2 down'}
                {diceValue === 30 && '6 up, 1 down'}
                {diceValue === 7 && 'All down'}
                {diceValue === 14 && 'All up'}
                {[2, 3, 4].includes(diceValue) && `${diceValue === 2 ? '2' : diceValue === 3 ? '3' : '4'} up, ${diceValue === 2 ? '5' : diceValue === 3 ? '4' : '3'} down`}
              </span>
            </motion.div>
          ) : (
            <div className="dice-placeholder">
              <div className="cowrie-shells">
                <div className="cowrie-shell">🐚</div>
                <div className="cowrie-shell">🐚</div>
                <div className="cowrie-shell">🐚</div>
                <div className="cowrie-shell">🐚</div>
                <div className="cowrie-shell">🐚</div>
                <div className="cowrie-shell">🐚</div>
              </div>
              <span>Roll the cowrie shells</span>
            </div>
          )}
        </div>

        <div className="dice-controls">
          <motion.button
            className={`btn btn-primary ${!canRoll || isLoading ? 'disabled' : ''}`}
            onClick={onRollDice}
            disabled={!canRoll || isLoading}
            aria-label="Roll cowrie shells to determine move"
            role="button"
            whileHover={canRoll && !isLoading ? { scale: 1.05 } : {}}
            whileTap={canRoll && !isLoading ? { scale: 0.95 } : {}}
          >
            {isLoading ? (
              <>
                <Loader size={20} className="spinning" />
                Rolling...
              </>
            ) : (
              <>
                <div className="cowrie-icon">🐚</div>
                {canRoll ? 'Throw Cowrie Shells' : 'Not Your Turn'}
              </>
            )}
          </motion.button>
          
          {!canRoll && !isLoading && (
            <div className="roll-status">
              {currentPlayer !== 0 ? 'Wait for your turn' : 'Game not ready'}
            </div>
          )}
        </div>
      </div>

      <div className="turn-controls">
        <div className="turn-info">
          <h4>Current Turn</h4>
          <div className="player-turn">
            <div className={`player-indicator player-${currentPlayer}`}>
              {currentPlayer === 0 ? 'Your Turn' : 'AI Turn'}
            </div>
            {!isPlayerTurn && (
              <span className="ai-thinking">
                {isLoading ? 'AI is thinking...' : 'AI is thinking...'}
              </span>
            )}
          </div>
        </div>

        {diceValue && isGameActive && (
          <motion.button
            className="btn btn-secondary"
            onClick={onEndTurn}
            disabled={isLoading}
            aria-label="End current turn and pass to next player"
            role="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={20} />
            End Turn
          </motion.button>
        )}
      </div>

      <div className="game-tips">
        <h4>Chaupar Rules</h4>
        <ul>
          <li>Need high throw (10, 25, 30) to start pieces</li>
          <li>Safe squares (🌸) protect from capture</li>
          <li>Must capture opponent piece to go home</li>
          <li>Special moves: 25→8, 30→13 squares</li>
          <li>3 consecutive high throws = "beli jaye"</li>
        </ul>
        {availableMoves.length > 0 && (
          <div className="available-moves">
            <h5>Available Moves:</h5>
            <ul>
              {availableMoves.map((move, index) => (
                <li key={index}>
                  Piece {move.pieceIndex + 1}: {move.type === 'start' ? 'Start' : `${move.currentPosition} → ${move.newPosition}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="quick-actions">
        <h4>Quick Actions</h4>
        <div className="action-buttons">
          <button 
            className="btn btn-outline" 
            onClick={() => window.location.reload()}
            aria-label="Start a new game"
            role="button"
          >
            <Square size={16} />
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameControls;
