import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Game from '../Game';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the useChauparGame hook
jest.mock('../GameState', () => ({
  useChauparGame: () => ({
    gameState: {
      currentPlayer: 0,
      lastThrow: { score: 10 },
      gameStatus: 'playing',
      players: [
        { id: 0, name: 'Player 1', pieces: [] },
        { id: 1, name: 'AI Player', pieces: [], isAI: true }
      ]
    },
    gameInstance: {},
    initializeGame: jest.fn(),
    throwCowries: jest.fn(() => ({ score: 10 })),
    makeMove: jest.fn(),
    getAvailableMoves: jest.fn(() => []),
    endTurn: jest.fn(),
    checkGameOver: jest.fn(() => ({ gameOver: false }))
  })
}));

// Mock the AI service
jest.mock('../../services/aiService', () => ({
  createAIService: jest.fn(() => ({
    generateMove: jest.fn(() => Promise.resolve({ type: 'move', pieceIndex: 0 }))
  }))
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Game Component', () => {
  const mockGameState = {
    id: 'TEST123',
    mode: 'ai',
    players: [
      { id: 'user1', name: 'You', isHost: true },
      { id: 'ai1', name: 'AI Player', isAI: true, skillLevel: 'intermediate' }
    ],
    status: 'playing',
    skillLevel: 'intermediate',
    aiProvider: 'ollama'
  };

  test('renders game board and controls', () => {
    renderWithRouter(<Game gameState={mockGameState} />);
    
    expect(screen.getByText('Chaupar')).toBeInTheDocument();
    expect(screen.getByText('Game Code: TEST123')).toBeInTheDocument();
    expect(screen.getByText('AI Game')).toBeInTheDocument();
  });

  test('shows loading state when initializing', () => {
    renderWithRouter(<Game gameState={mockGameState} />);
    
    // The component should show loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays game controls', () => {
    renderWithRouter(<Game gameState={mockGameState} />);
    
    expect(screen.getByText('Game Controls')).toBeInTheDocument();
    expect(screen.getByText('Throw Cowrie Shells')).toBeInTheDocument();
  });

  test('shows game status', () => {
    renderWithRouter(<Game gameState={mockGameState} />);
    
    expect(screen.getByText('playing')).toBeInTheDocument();
  });

  test('displays available moves when dice is rolled', async () => {
    renderWithRouter(<Game gameState={mockGameState} />);
    
    // Wait for game to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Check if dice result is displayed
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
