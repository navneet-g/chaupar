# 🚀 Chaupar Game Setup Guide

Complete setup instructions for the Chaupar game, including automated and manual setup options.

## 🎯 Quick Start (Recommended)

### **Automated Setup - Zero Configuration**
```bash
# Clone repository
git clone <repository-url>
cd chaupar

# Automatic setup (creates Firebase project, configures everything)
./setup.sh --deploy
```

**This single command will:**
- ✅ Create Firebase project automatically
- ✅ Configure Firebase services (Firestore, Auth, Hosting)
- ✅ Set up environment variables
- ✅ Install dependencies
- ✅ Build and deploy to Firebase hosting
- ✅ Give you a live game URL

## 🔧 Prerequisites

### **System Requirements**
- **Node.js**: v16 or higher
- **npm**: v8 or higher
- **Firebase CLI**: `npm install -g firebase-tools`
- **Git**: For cloning repository

### **Accounts Required**
- **Firebase Account**: [Create here](https://console.firebase.google.com/)
- **Google Account**: For authentication
- **GitHub Account**: For repository access

## 🚀 Setup Options

### **Option 1: Fully Automated (Recommended)**
```bash
# Create new project automatically
./setup.sh

# Or specify custom name
./setup.sh --project-name "My Chaupar Game"

# Setup + auto-deploy
./setup.sh --deploy
```

### **Option 2: Use Existing Firebase Project**
```bash
# Use existing project
./setup.sh -p your-project-id -n "Your Game Name"

# Example
./setup.sh -p chaupar-game-123 -n "Chaupar Tournament"
```

### **Option 3: Python Automation**
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run automation
python3 setup_automation.py
```

## 🔄 Smart Rerun System

### **Project Caching**
The setup scripts automatically cache your project ID for future reruns:

```bash
# First run - creates project
./setup.sh
# Creates: chaupar-123456-abc

# Future runs - uses cached project automatically
./setup.sh
# Uses: chaupar-123456-abc (from cache)

# Switch projects - updates cache
./setup.sh -p different-project
# Cache updated to: different-project
```

**Cache file**: `.chaupar_cache.json`
- **Automatic backup** when switching projects
- **Safe reruns** without losing configurations

## 🔐 Firebase Configuration

### **Automatic Configuration**
The setup scripts automatically:
- ✅ Create Firebase project
- ✅ Configure Firestore database
- ✅ Set up Authentication
- ✅ Configure Hosting
- ✅ Create web app
- ✅ Fetch API keys
- ✅ Update `.env.local`

### **Manual Configuration (if needed)**
If you need to configure manually:

1. **Get Firebase Config**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Project Settings → General → Your apps
   - Add web app if none exists
   - Copy configuration

2. **Update Environment File**
   ```bash
   # Copy template
   cp env.template .env.local
   
   # Edit with your values
   nano .env.local
   ```

3. **Enable Authentication**
   - Firebase Console → Authentication → Sign-in method
   - Enable Google provider
   - Add authorized domains

## 🤖 AI Setup

### **Ollama (Local AI)**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull Qwen2.5 model
ollama pull qwen2.5:latest

# Start Ollama service
ollama serve
```

### **OpenAI (Cloud AI)**
1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to `.env.local`:
   ```bash
   VITE_OPENAI_API_KEY=your_api_key_here
   VITE_AI_PROVIDER=openai
   ```

## 🚀 Deployment

### **Development**
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### **Production**
```bash
# Deploy to Firebase hosting
firebase deploy

# Or use automated deployment
./setup.sh --deploy
```

## 🔍 Troubleshooting

### **Common Issues**

#### **Firebase CLI Not Found**
```bash
npm install -g firebase-tools
firebase login
```

#### **Permission Denied on setup.sh**
```bash
chmod +x setup.sh
```

#### **Python Dependencies Missing**
```bash
pip install -r requirements.txt
```

#### **Build Failures**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### **Getting Help**
- Check the setup logs in terminal output
- Review `setup_report.txt` for detailed status
- Ensure all prerequisites are met
- Verify Firebase project permissions

## 📊 Setup Status

### **What Gets Created**
- ✅ Firebase project with unique ID
- ✅ Firestore database with security rules
- ✅ Authentication with Google provider
- ✅ Hosting configuration for React app
- ✅ Environment variables file
- ✅ Production build
- ✅ Live hosting URL

### **What Gets Configured**
- 🔧 Firebase services (Firestore, Auth, Hosting)
- 🔐 Google Authentication
- 🌐 SPA routing for React Router
- ⚡ Static asset caching
- 🎮 Game configuration
- 🤖 AI integration settings

## 🎉 Success Indicators

### **Setup Complete When You See:**
- ✅ "Setup completed successfully!"
- ✅ Firebase project created
- ✅ Environment file configured
- ✅ Dependencies installed
- ✅ Build successful
- ✅ Hosting URL provided

### **Next Steps After Setup:**
1. **Test the game**: Visit the provided hosting URL
2. **Customize settings**: Modify `.env.local` for AI preferences
3. **Invite players**: Share game codes for multiplayer
4. **Monitor usage**: Check Firebase Console for analytics

---

**Ready to get started?** 🚀 Run `./setup.sh --deploy` for the fastest setup experience!
