import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Square, Users, Target, Crown, Star, Info } from 'lucide-react';
import './Tutorial.css';

const Tutorial = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to Chaupar",
      icon: <BookOpen size={40} />,
      content: (
        <div>
          <p>Chaupar is an ancient Indian board game that combines strategy, luck, and skill. 
          It has been played for centuries and is considered one of the oldest board games in the world.</p>
          <div className="tutorial-highlight">
            <h4>🎯 Objective</h4>
            <p>Be the first player to move all your pieces around the board and reach the finish line!</p>
          </div>
        </div>
      )
    },
    {
      title: "The Game Board",
      icon: <Target size={40} />,
      content: (
        <div>
          <p>The Chaupar board consists of 68 squares arranged in a cross pattern, representing the journey of life.</p>
          <div className="board-explanation">
            <div className="board-element">
              <Crown size={24} color="#FFD700" />
              <span>Start Square (1)</span>
            </div>
            <div className="board-element">
              <Star size={24} color="#FFD700" />
              <span>Finish Square (68)</span>
            </div>
            <div className="board-element">
              <div className="safe-dot">●</div>
              <span>Safe Zones (Protected squares)</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Getting Started",
      icon: <Square size={40} />,
      content: (
        <div>
          <p>To begin your journey, you must roll a 6 on the dice.</p>
          <div className="step-list">
            <div className="step">
              <span className="step-number">1</span>
              <span>Roll the dice</span>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <span>If you get a 6, place your piece on the start square</span>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <span>Roll again to move your piece</span>
            </div>
          </div>
          <div className="tutorial-tip">
            <Info size={16} />
            <span>You can only start moving after rolling a 6!</span>
          </div>
        </div>
      )
    },
    {
      title: "Moving Your Pieces",
      icon: <Users size={40} />,
      content: (
        <div>
          <p>Once you've started, move your pieces clockwise around the board according to your dice roll.</p>
          <div className="movement-rules">
            <h4>Movement Rules:</h4>
            <ul>
              <li>Move clockwise around the board</li>
              <li>Roll the dice on each turn</li>
              <li>Move the number of squares shown on the dice</li>
              <li>You can move multiple pieces in one turn</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Special Squares & Rules",
      icon: <Crown size={40} />,
      content: (
        <div>
          <p>Chaupar has several special rules that make the game exciting and strategic.</p>
          <div className="special-rules">
            <div className="rule-item">
              <h4>🛡️ Safe Zones</h4>
              <p>Certain squares (8, 15, 22, 29, 36, 43, 50, 57, 64) are safe zones. 
              Pieces on these squares cannot be captured.</p>
            </div>
            <div className="rule-item">
              <h4>⚔️ Capturing</h4>
              <p>If you land on an opponent's piece, they must return to the start and begin again.</p>
            </div>
            <div className="rule-item">
              <h4>🎲 Multiple Rolls</h4>
              <p>Rolling a 6 gives you an extra turn. You can continue rolling as long as you get 6s!</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Winning the Game",
      icon: <Star size={40} />,
      content: (
        <div>
          <p>To win, you must be the first player to move all your pieces to the finish line.</p>
          <div className="winning-conditions">
            <h4>🏆 Victory Conditions:</h4>
            <ul>
              <li>All your pieces must reach the finish square (68)</li>
              <li>You must land exactly on the finish square</li>
              <li>If you roll too many numbers, you must wait for your next turn</li>
            </ul>
          </div>
          <div className="tutorial-tip">
            <Info size={16} />
            <span>Strategy tip: Keep some pieces in safe zones to avoid being sent back!</span>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToGame = () => {
    navigate('/');
  };

  return (
    <div className="tutorial">
      <motion.div 
        className="tutorial-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button className="btn-back" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back to Game
        </button>
        <h1>Chaupar Tutorial</h1>
        <p>Master the ancient Indian game of strategy</p>
      </motion.div>

      <div className="tutorial-content">
        <div className="tutorial-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            ></div>
          </div>
          <span className="progress-text">
            Step {currentStep + 1} of {tutorialSteps.length}
          </span>
        </div>

        <motion.div 
          className="tutorial-step"
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <div className="step-header">
            <div className="step-icon">
              {tutorialSteps[currentStep].icon}
            </div>
            <h2>{tutorialSteps[currentStep].title}</h2>
          </div>
          
          <div className="step-content">
            {tutorialSteps[currentStep].content}
          </div>
        </motion.div>

        <div className="tutorial-navigation">
          <button 
            className={`btn btn-outline ${currentStep === 0 ? 'disabled' : ''}`}
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </button>
          
          <div className="step-indicators">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                className={`step-dot ${index === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(index)}
              />
            ))}
          </div>

          {currentStep === tutorialSteps.length - 1 ? (
            <button className="btn btn-primary" onClick={goToGame}>
              Start Playing!
            </button>
          ) : (
            <button className="btn btn-primary" onClick={nextStep}>
              Next
            </button>
          )}
        </div>
      </div>

      <div className="tutorial-footer">
        <p>Ready to experience the ancient wisdom of Chaupar?</p>
        <button className="btn btn-secondary" onClick={goToGame}>
          Return to Game
        </button>
      </div>
    </div>
  );
};

export default Tutorial;
