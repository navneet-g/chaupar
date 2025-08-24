import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

// Game collection reference
const gamesCollection = collection(db, 'games');

// Create a new game
export const createGame = async (gameData) => {
  try {
    const gameRef = doc(gamesCollection, gameData.id);
    const gameWithTimestamp = {
      ...gameData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: gameData.mode === 'ai' ? 'playing' : 'waiting'
    };
    
    await setDoc(gameRef, gameWithTimestamp);
    return gameData.id;
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
};

// Get game by ID
export const getGame = async (gameId) => {
  try {
    const gameRef = doc(gamesCollection, gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (gameSnap.exists()) {
      return { id: gameSnap.id, ...gameSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting game:', error);
    throw error;
  }
};

// Update game
export const updateGame = async (gameId, updates) => {
  try {
    const gameRef = doc(gamesCollection, gameId);
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(gameRef, updatesWithTimestamp);
  } catch (error) {
    console.error('Error updating game:', error);
    throw error;
  }
};

// Join game
export const joinGame = async (gameId, playerData) => {
  try {
    const game = await getGame(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    if (game.status !== 'waiting') {
      throw new Error('Game is already in progress');
    }
    
    if (game.players.length >= 4) {
      throw new Error('Game is full');
    }
    
    const updatedPlayers = [...game.players, playerData];
    const updates = {
      players: updatedPlayers,
      status: updatedPlayers.length >= 2 ? 'playing' : 'waiting'
    };
    
    await updateGame(gameId, updates);
    return true;
  } catch (error) {
    console.error('Error joining game:', error);
    throw error;
  }
};

// Make a move
export const makeMove = async (gameId, playerId, moveData) => {
  try {
    const game = await getGame(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    if (game.status !== 'playing') {
      throw new Error('Game is not in progress');
    }
    
    const updates = {
      currentPlayer: moveData.nextPlayer,
      lastMove: {
        playerId,
        diceValue: moveData.diceValue,
        fromPosition: moveData.fromPosition,
        toPosition: moveData.toPosition,
        timestamp: serverTimestamp()
      },
      gameState: moveData.gameState
    };
    
    await updateGame(gameId, updates);
    return true;
  } catch (error) {
    console.error('Error making move:', error);
    throw error;
  }
};

// Listen to game changes in real-time
export const subscribeToGame = (gameId, callback) => {
  try {
    const gameRef = doc(gamesCollection, gameId);
    
    return onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const gameData = { id: doc.id, ...doc.data() };
        callback(gameData);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error listening to game:', error);
      callback(null);
    });
  } catch (error) {
    console.error('Error subscribing to game:', error);
    return null;
  }
};

// Get recent games
export const getRecentGames = async (limit = 10) => {
  try {
    const q = query(
      gamesCollection,
      orderBy('updatedAt', 'desc'),
      limit(limit)
    );
    
    // This would need to be implemented with getDocs
    // For now, returning empty array
    return [];
  } catch (error) {
    console.error('Error getting recent games:', error);
    return [];
  }
};

// Delete game
export const deleteGame = async (gameId) => {
  try {
    const gameRef = doc(gamesCollection, gameId);
    await setDoc(gameRef, { deleted: true, deletedAt: serverTimestamp() });
    return true;
  } catch (error) {
    console.error('Error deleting game:', error);
    throw error;
  }
};

// AI move logic
export const calculateAIMove = (gameState, skillLevel) => {
  // Basic AI logic - can be enhanced based on skill level
  const { currentPlayer, players, board } = gameState;
  
  // Simple AI strategy
  let move = {
    diceValue: Math.floor(Math.random() * 6) + 1,
    targetPiece: 0,
    strategy: 'basic'
  };
  
  if (skillLevel === 'intermediate') {
    // Add some strategic thinking
    move.strategy = 'intermediate';
  } else if (skillLevel === 'advanced') {
    // Advanced AI with better decision making
    move.strategy = 'advanced';
  }
  
  return move;
};

// Game validation
export const validateGameState = (gameState) => {
  const { players, board, currentPlayer } = gameState;
  
  // Check if game is valid
  if (!players || players.length < 2) {
    return false;
  }
  
  if (currentPlayer < 0 || currentPlayer >= players.length) {
    return false;
  }
  
  return true;
};
