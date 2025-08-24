# 🎲 Chaupar - Ancient Indian Board Game

A modern, online multiplayer version of the ancient Indian game Chaupar, built with React and Firebase. Experience the rich heritage of India through this timeless strategy game.

## ✨ Features

- **Default AI Mode**: Play against 3 AI opponents by default
- **Dual AI Providers**: Choose between Ollama (local Qwen2.5) or OpenAI (GPT-4)
- **Multiple AI Players**: Configure 1-4 AI opponents with different skill levels
- **Multiplayer Mode**: Play with friends online using 6-character game codes
- **AI Skill Levels**: Three difficulty levels (Basic, Intermediate, Advanced)
- **Beautiful UI**: Ancient Indian themed design with rich colors and animations
- **Interactive Tutorial**: Step-by-step learning guide for new players
- **Real-time Gameplay**: Live updates and smooth animations
- **Responsive Design**: Works perfectly on desktop and mobile devices

## 🎯 Game Rules

Chaupar is an ancient Indian board game that combines strategy, luck, and skill:

1. **Objective**: Be the first player to move all pieces around the board and reach the finish line
2. **Starting**: Roll a 6 to begin your journey
3. **Movement**: Move clockwise around the 68-square board according to dice rolls
4. **Safe Zones**: Certain squares protect your pieces from capture
5. **Capturing**: Land on opponents to send them back to start
6. **Winning**: Reach the finish square exactly to win

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account (for multiplayer functionality)
- **For AI Mode**: Ollama (local) or OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chaupar-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **AI Setup** (Choose one):
   - **Ollama (Recommended)**: Install Ollama and pull qwen2.5:latest model
   - **OpenAI**: Get API key from [OpenAI Platform](https://platform.openai.com/)
   - See [AI_SETUP.md](AI_SETUP.md) for detailed instructions

4. **Firebase Setup** (for multiplayer)
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database and Authentication
   - Copy your Firebase config to `src/firebase/config.js`

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Firebase Configuration

Update `src/firebase/config.js` with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 🎮 How to Play

### Single Player (AI) - Default Mode
1. Click "AI Opponents (Default)" on the home screen
2. Configure number of AI players (1-4)
3. Select skill level (Basic, Intermediate, Advanced)
4. Choose AI provider (Ollama or OpenAI)
5. Start playing against intelligent AI opponents

### Multiplayer
1. Click "Multiplayer" to create a new game
2. Share the 6-character game code with friends
3. Wait for players to join
4. Start the game when ready

### Joining a Game
1. Enter the 6-character game code in the "Join Existing Game" section
2. Click "Join Game" to enter the lobby

## 🏗️ Project Structure

```
chaupar-game/
├── src/
│   ├── components/
│   │   ├── Home.jsx          # Main landing page
│   │   ├── Game.jsx          # Main game component
│   │   ├── GameBoard.jsx     # Game board display
│   │   ├── GameControls.jsx  # Dice and turn controls
│   │   ├── GameInfo.jsx      # Game sidebar information
│   │   └── Tutorial.jsx      # Learning guide
│   ├── firebase/
│   │   └── config.js         # Firebase configuration
│   ├── App.jsx               # Main app component
│   └── App.css               # Global styles
├── public/                   # Static assets
└── package.json             # Dependencies and scripts
```

## 🎨 Design Features

- **Ancient Indian Theme**: Rich browns, golds, and warm colors
- **Smooth Animations**: Framer Motion for engaging interactions
- **Responsive Layout**: Adapts to all screen sizes
- **Interactive Elements**: Hover effects and smooth transitions
- **Cultural Elements**: Traditional Indian design patterns and colors

## 🛠️ Technologies Used

- **Frontend**: React 18, Vite
- **Styling**: CSS3 with custom ancient Indian theme
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Firebase (Firestore, Authentication)
- **AI Integration**: Ollama (local Qwen2.5) + OpenAI API
- **Routing**: React Router DOM

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Ancient Indian culture and heritage
- The original Chaupar game and its rich history
- React and Firebase communities
- Open source contributors

## 📞 Support

For support, questions, or feedback:
- Create an issue in the repository
- Contact the development team
- Check the tutorial section for game rules

---

**Experience the ancient wisdom of Chaupar - where strategy meets tradition! 🎲✨**
