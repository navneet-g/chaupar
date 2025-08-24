import { motion } from 'framer-motion';
import { Square, RotateCcw, Play, Pause } from 'lucide-react';
import './GameControls.css';

const GameControls = ({ 
  onRollDice, 
  onEndTurn, 
  diceValue, 
  currentPlayer, 
  gameStatus, 
  canRoll 
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
            className={`btn btn-primary ${!canRoll ? 'disabled' : ''}`}
            onClick={onRollDice}
            disabled={!canRoll}
            whileHover={canRoll ? { scale: 1.05 } : {}}
            whileTap={canRoll ? { scale: 0.95 } : {}}
          >
            <div className="cowrie-icon">🐚</div>
            Throw Cowrie Shells
          </motion.button>
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
                AI is thinking...
              </span>
            )}
          </div>
        </div>

        {diceValue && isGameActive && (
          <motion.button
            className="btn btn-secondary"
            onClick={onEndTurn}
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
        <h4>Game Tips</h4>
        <ul>
          <li>Roll a 6 to start your journey</li>
          <li>Safe zones protect you from being sent back</li>
          <li>Land on opponents to send them back to start</li>
          <li>Reach the finish line to win!</li>
        </ul>
      </div>

      <div className="quick-actions">
        <button className="btn btn-outline">
          <RotateCcw size={16} />
          Reset Game
        </button>
        <button className="btn btn-outline">
          <Pause size={16} />
          Pause
        </button>
      </div>
    </div>
  );
};

export default GameControls;
