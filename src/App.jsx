import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './components/Home';
import Game from './components/Game';
import Tutorial from './components/Tutorial';
import './App.css';

function App() {
  const [gameState, setGameState] = useState(null);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home setGameState={setGameState} />} />
              <Route path="/game/:gameId" element={<Game gameState={gameState} setGameState={setGameState} />} />
              <Route path="/tutorial" element={<Tutorial />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
