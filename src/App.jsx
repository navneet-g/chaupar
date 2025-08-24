import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Home from './components/Home';
import Game from './components/Game';
import Tutorial from './components/Tutorial';
import './App.css';

function App() {
  const [gameState, setGameState] = useState(null);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home setGameState={setGameState} />} />
          <Route path="/game/:gameId" element={<Game gameState={gameState} setGameState={setGameState} />} />
          <Route path="/tutorial" element={<Tutorial />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
