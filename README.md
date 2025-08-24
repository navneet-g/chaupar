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

## 🚀 Quick Start

### **Option 1: Automated Setup (Recommended)**
```bash
# Clone and setup in one command
git clone <repository-url>
cd chaupar

# Automatic setup (creates Firebase project, configures everything)
./setup.sh --deploy
```

### **Option 2: Manual Setup**
```bash
# Clone repository
git clone <repository-url>
cd chaupar

# Install dependencies
npm install

# Copy environment template
cp env.template .env.local

# Start development server
npm run dev
```

## 🔧 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or yarn
- **Firebase account** (for multiplayer functionality)
- **For AI Mode**: Ollama (local) or OpenAI API key

## 📚 Documentation

- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Documentation overview and navigation
- **[SETUP.md](SETUP.md)** - Complete setup instructions
- **[AUTOMATION.md](AUTOMATION.md)** - Automation scripts guide
- **[GAME_RULES.md](GAME_RULES.md)** - Detailed game rules and mechanics

## 🎮 Game Modes

### **AI Mode (Default)**
- Play against 1-4 AI opponents
- Configurable skill levels (Basic, Intermediate, Advanced)
- Local AI via Ollama or cloud AI via OpenAI

### **Multiplayer Mode**
- Create games with 6-character codes
- Invite friends to play online
- Real-time gameplay with Firebase backend

### **Single Player**
- Practice mode with AI opponents
- Tutorial mode for learning rules
- Customizable AI difficulty

## 🏗️ Architecture

- **Frontend**: React 19 + Vite + Framer Motion
- **Backend**: Firebase (Firestore, Authentication, Hosting)
- **AI Integration**: Ollama (local) + OpenAI API
- **Styling**: Custom CSS with ancient Indian theme
- **State Management**: React Hooks + Context API

## 🔐 Security Features

- Firebase Security Rules for data protection
- Google Authentication integration
- Secure API key handling
- Input validation and sanitization

## 🚀 Deployment

### **Development**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### **Production**
```bash
# Deploy to Firebase Hosting
firebase deploy

# Or use automated deployment
./setup.sh --deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Ancient Indian game heritage and culture
- React and Firebase communities
- Open source contributors

---

**Ready to play?** 🎲 Start with `./setup.sh --deploy` for the fastest setup experience!
