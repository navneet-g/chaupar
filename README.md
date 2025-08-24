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

- Node.js (v16 or higher)
- npm or yarn
- Firebase account (for multiplayer functionality)
- **For AI Mode**: Ollama (local) or OpenAI API key

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chaupar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Automated Setup (Recommended)

For the fastest setup experience, use our automation scripts:

```bash
# Option 1: Bash script (most users)
./setup.sh -p your-project-id -n "Your Game Name"

# Option 2: Python script (advanced users)
python setup_automation.py --project-id your-project-id --project-name "Your Game Name"
```

**🎯 NEW: Automatic Project Creation!**

If you don't provide a project ID, the scripts will automatically create a new Firebase project for you:

```bash
# Create new project automatically (recommended for first-time users)
# Uses default name "Chaupar" if no --project-name specified
./setup.sh

# Or specify custom name
./setup.sh --project-name "My Chaupar Game"

# Python version (requires dependencies: pip install -r requirements.txt)
python3 setup_automation.py
```

**Benefits of Automatic Creation:**
- ✅ **No manual Firebase setup** required
- ✅ **Unique project IDs** generated automatically
- ✅ **Project caching** for future reruns
- ✅ **Zero configuration** needed upfront

**Where to get these values (if you want to use existing projects):**

#### **Project ID (`your-project-id`)**
1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Click "Create Project" or select existing project**
3. **Your Project ID** appears in the URL: `https://console.firebase.google.com/project/YOUR-PROJECT-ID`
4. **Example Project IDs**: `chaupar-game-123`, `my-chaupar-app`, `chaupar-prod`

#### **Game Name (`Your Game Name`)**
- **Any descriptive name** for your game instance
- **Examples**: `"My Chaupar Game"`, `"Chaupar Tournament"`, `"Family Game Night"`
- **This is just for display** and can be changed later

#### **Complete Example**
```bash
# If your Firebase project ID is "chaupar-game-2024"
./setup.sh -p chaupar-game-2024 -n "Chaupar Tournament 2024"

# Or with Python
python setup_automation.py --project-id chaupar-game-2024 --project-name "Chaupar Tournament 2024"
```

**See [AUTOMATION_README.md](AUTOMATION_README.md) for complete automation details.**

### Project Caching & Reruns

**🔄 Smart Rerun System**

Both setup scripts automatically cache your project ID and can be rerun safely:

```bash
# First run - creates new project automatically
# Uses default name "Chaupar"
./setup.sh
# Creates: chaupar-123456-abc

# Future runs - automatically uses cached project
./setup.sh
# Uses: chaupar-123456-abc (from cache)

# Switch to different project
./setup.sh -p different-project-id
# Updates cache to new project
```

**💾 Cache File**
- **Location**: `.chaupar_cache.json`
- **Contents**: Project ID, name, timestamps
- **Purpose**: Enable reruns without specifying project ID
- **Safety**: Backed up automatically when switching projects

**🔄 Rerun Scenarios**
1. **Same Project**: Updates configuration, preserves API keys
2. **Different Project**: Backs up old config, creates new one
3. **No Project ID**: Uses cached project or creates new one

### Getting Firebase Configuration Values

After running the setup script, you'll need to update the Firebase configuration in `.env.local`:

#### **Step 1: Get Firebase Config**
1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Select your project** (the one you used in setup)
3. **Click Project Settings** (gear icon)
4. **Scroll to "Your apps" section**
5. **Click "Add app" → Web** (if no web app exists)
6. **Copy the configuration object**

#### **Step 2: Update .env.local**
Replace the placeholder values in `.env.local`:

```bash
# Before (placeholder values)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com

# After (your actual values)
VITE_FIREBASE_API_KEY=AIzaSyC...your_actual_key
VITE_FIREBASE_AUTH_DOMAIN=chaupar-game-123.firebaseapp.com
```

#### **Step 3: Enable Authentication**
1. **In Firebase Console → Authentication**
2. **Click "Get Started"**
3. **Click "Sign-in method"**
4. **Enable Google provider**
5. **Add your domain to authorized domains**

#### **Step 4: Deploy to Firebase Hosting**
The setup scripts automatically configure Firebase hosting for your game:

```bash
# Build and deploy
npm run build
firebase deploy --only hosting

# Or use the setup script to deploy automatically
./setup.sh --deploy
```

**🌐 Your game will be hosted at**: `https://your-project-id.web.app`

### Deployment to Firebase Hosting

#### **🚀 Automatic Deployment**
The setup scripts automatically configure and deploy your game:

```bash
# Complete setup with automatic deployment
# Uses default name "Chaupar"
./setup.sh --deploy

# Or specify custom name
./setup.sh --project-name "My Chaupar Game" --deploy

# This will:
✅ Create Firebase project
✅ Configure hosting
✅ Build the game
✅ Deploy to Firebase hosting
✅ Provide hosting URL
```

#### **🔧 Manual Deployment**
If you prefer manual deployment:

```bash
# 1. Build the game
npm run build

# 2. Deploy to hosting
firebase deploy --only hosting

# 3. View your live game
firebase open hosting:site
```

#### **📱 Hosting Features**
- **Global CDN**: Fast loading worldwide
- **HTTPS**: Secure by default
- **Custom domains**: Add your own domain
- **Preview channels**: Test before production
- **Rollback**: Easy version management

### Complete Setup

For detailed setup instructions including Firebase configuration, AI setup, security configuration, and production deployment, see:

📚 **[COMPREHENSIVE_SETUP.md](COMPREHENSIVE_SETUP.md)** - Complete setup guide for production deployment

This guide covers:
- 🔥 Firebase configuration and security
- 🤖 AI setup (Ollama & OpenAI)
- 🔒 Security configuration and deployment
- 🚀 Production deployment to multiple platforms
- 🧪 Testing and development setup
- 🔍 Troubleshooting and support

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
