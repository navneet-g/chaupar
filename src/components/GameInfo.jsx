import { motion } from 'framer-motion';
import { Users, Clock, Trophy, Target, Info } from 'lucide-react';
import './GameInfo.css';

const GameInfo = ({ game, currentPlayer, diceValue }) => {
  const getPlayerStatus = (player) => {
    if (player.isAI) {
      return `AI (${player.skillLevel})`;
    }
    return player.name;
  };

  const getGameDuration = () => {
    if (!game.createdAt) return '0:00';
    const now = new Date();
    const diff = now - game.createdAt;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="game-info">
      <div className="info-header">
        <h3><Info size={20} /> Game Information</h3>
      </div>

      <div className="info-section">
        <h4><Users size={16} /> Players</h4>
        <div className="players-list">
          {game.players.map((player, index) => (
            <div 
              key={player.id} 
              className={`player-item ${index === currentPlayer ? 'current' : ''}`}
            >
              <div className={`player-avatar player-${index}`}>
                {player.isAI ? '🤖' : '👤'}
              </div>
              <div className="player-details">
                <span className="player-name">{getPlayerStatus(player)}</span>
                <span className="player-role">
                  {player.isHost ? 'Host' : player.isAI ? 'AI' : 'Player'}
                </span>
              </div>
              {index === currentPlayer && (
                <div className="current-turn-indicator">▶</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="info-section">
        <h4><Clock size={16} /> Game Time</h4>
        <div className="game-time">
          <span className="time-display">{getGameDuration()}</span>
        </div>
      </div>

      <div className="info-section">
        <h4><Target size={16} /> Game Mode</h4>
        <div className="game-mode-info">
          <span className={`mode-badge ${game.mode}`}>
            {game.mode === 'ai' ? 'AI Game (1 vs 1)' : 'Multiplayer'}
          </span>
          {game.mode === 'ai' && (
            <>
              <span className="skill-badge">{game.skillLevel}</span>
              <span className="provider-badge">{game.aiProvider || 'ollama'}</span>
            </>
          )}
        </div>
      </div>

      <div className="info-section">
        <h4><Trophy size={16} /> Game Status</h4>
        <div className="status-info">
          <span className={`status-badge ${game.status}`}>
            {game.status === 'waiting' ? 'Waiting for Players' : 'In Progress'}
          </span>
        </div>
      </div>

      {diceValue && (
        <div className="info-section">
          <h4>Last Roll</h4>
          <div className="dice-info">
            <span className="dice-value">{diceValue}</span>
            <span className="dice-label">on current turn</span>
          </div>
        </div>
      )}

      <div className="info-section">
        <h4>Rules Summary</h4>
        <div className="rules-summary">
          <ul>
            <li>Roll a 6 to start</li>
            <li>Move clockwise around the board</li>
            <li>Safe zones protect you</li>
            <li>Land on opponents to send them back</li>
            <li>First to reach the end wins!</li>
          </ul>
        </div>
      </div>

      <div className="info-footer">
        <p>Chaupar - Ancient Indian Strategy Game</p>
        <small>Experience the heritage of India</small>
      </div>
    </div>
  );
};

export default GameInfo;
