# 🎲 Chaupar Game Setup Guide

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase** (for multiplayer)
   - Update `src/firebase/config.js` with your Firebase credentials
   - Enable Firestore Database in Firebase Console

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:5173`

## 🎮 Game Features

### Single Player Mode
- Play against AI with 3 skill levels
- Basic: Random moves
- Intermediate: Some strategy
- Advanced: Strategic thinking

### Multiplayer Mode
- Create games with 6-character codes
- Share codes with friends
- Real-time gameplay updates
- Up to 4 players per game

### Learning Features
- Interactive tutorial with 6 steps
- Game rules and tips
- Visual board explanations
- Strategy guidance

## 🎨 Design Features

- **Ancient Indian Theme**: Rich browns, golds, and warm colors
- **Responsive Design**: Works on all devices
- **Smooth Animations**: Framer Motion integration
- **Interactive Elements**: Hover effects and transitions
- **Cultural Elements**: Traditional Indian design patterns

## 🏗️ Architecture

- **Frontend**: React 18 + Vite
- **State Management**: React hooks and context
- **Styling**: Custom CSS with ancient Indian theme
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Firebase (Firestore, Auth)

## 🔧 Configuration

### Firebase Setup
1. Create Firebase project
2. Enable Firestore Database
3. Enable Authentication (optional)
4. Copy config to `src/firebase/config.js`

### Environment Variables
Create `.env.local` for custom configurations:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

## 🐛 Troubleshooting

### Common Issues

1. **Firebase not configured**
   - Check `src/firebase/config.js`
   - Ensure Firebase project is set up

2. **Build errors**
   - Clear `node_modules` and reinstall
   - Check for missing dependencies

3. **Game not loading**
   - Check browser console for errors
   - Verify Firebase rules allow read/write

### Development Tips

- Use browser dev tools for debugging
- Check Firebase console for database issues
- Test on different devices for responsiveness

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Chaupar Game History](https://en.wikipedia.org/wiki/Chaupar)

---

**Enjoy playing the ancient Indian game of Chaupar! 🎲✨**
