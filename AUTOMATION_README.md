# 🤖 **CHAUPAR GAME SETUP AUTOMATION**

This directory contains automation scripts to streamline the Chaupar game setup process. Choose the automation method that best fits your environment and requirements.

---

## 🚀 **QUICK START**

### **Option 1: Bash Script (Recommended for most users)**
```bash
# Make script executable (if not already)
chmod +x setup.sh

# Run setup with your Firebase project ID
./setup.sh -p chaupar-game-123 -n "Chaupar"

# Example:
./setup.sh -p chaupar-game-123 -n "My Chaupar Game"
```

### **Option 2: Python Script (Advanced users)**
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run Python automation
python setup_automation.py --project-id chaupar-game-123 --project-name "Chaupar"

# Example:
python setup_automation.py --project-id chaupar-game-123 --project-name "My Chaupar Game"
```

---

## 🆔 **AUTOMATIC PROJECT CREATION**

### **🎯 Zero-Configuration Setup**

**NEW: You can now run setup without providing a project ID!**

```bash
# Bash script - automatic project creation
# Uses default name "Chaupar"
./setup.sh

# Or specify custom name
./setup.sh --project-name "Chaupar"

# This automatically:
✅ Creates Firebase project
✅ Configures hosting (firebase.json)
✅ Sets up SPA routing for React Router
✅ Enables static asset caching
✅ Builds the game
✅ Deploys to Firebase hosting

# Python script - automatic project creation
python setup_automation.py
```

**What happens automatically:**
1. **Unique project ID** generated (e.g., `my-chaupar-game-123456-abc`)
2. **Firebase project** created via Firebase CLI
3. **Project cached** for future reruns
4. **Zero manual setup** required

### **🔄 Smart Caching System**

**Project ID is automatically cached after first run:**

```bash
# First run - creates and caches project
# Uses default name "Chaupar"
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
- **Timestamp tracking** for project creation/updates
- **Safe reruns** without losing configurations

---

## 🌐 **FIREBASE HOSTING INTEGRATION**

### **🚀 Automatic Hosting Setup**

**The setup scripts automatically configure Firebase hosting for your game:**

```bash
# Complete setup with hosting
# Uses default name "Chaupar"
./setup.sh

# Or specify custom name
./setup.sh --project-name "Chaupar"
```

### **📁 Hosting Configuration**

**Generated `firebase.json`:**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{"source": "**", "destination": "/index.html"}],
    "headers": [{"source": "**/*.@(js|css)", "headers": [{"key": "Cache-Control", "value": "max-age=31536000"}]}]
  }
}
```

**Features:**
- **SPA Routing**: All routes redirect to index.html for React Router
- **Asset Caching**: JS/CSS files cached for 1 year
- **Clean Build**: Only dist/ folder deployed
- **HTTPS**: Secure by default

### **🚀 Deployment Options**

#### **Automatic Deployment (Recommended)**
```bash
# Setup and deploy in one command
# Uses default name "Chaupar"
./setup.sh --deploy

# Or specify custom name
./setup.sh --project-name "Chaupar" --deploy

# Python version
python3 setup_automation.py
```

#### **Manual Deployment**
```bash
# After setup, deploy manually
npm run build
firebase deploy --only hosting

# View your live game
firebase open hosting:site
```

### **🌍 Hosting Benefits**

- **Global CDN**: Fast loading worldwide
- **Custom Domains**: Add your own domain
- **Preview Channels**: Test before production
- **Rollback**: Easy version management
- **Analytics**: Built-in performance monitoring
- **SSL Certificates**: Automatic HTTPS setup

---

## 📋 **AUTOMATION FEATURES**

### **✅ What Gets Automated**

1. **Prerequisites Check**
   - Node.js version validation (16+)
   - npm availability
   - Firebase CLI detection
   - Ollama availability

2. **Environment Setup**
   - Creates `.env.local` with your project configuration
   - Backs up existing configuration files
   - Generates proper Firebase configuration template

3. **Dependencies Installation**
   - Runs `npm install` automatically
   - Installs all required packages

4. **AI Service Setup**
   - Detects and configures Ollama
   - Starts Ollama service if available
   - Tests AI service connectivity

5. **Build & Test**
   - Tests application build process
   - Runs test suite
   - Validates setup completion

6. **Firebase Integration**
   - Deploys Firestore security rules
   - Configures project settings
   - Sets up authentication structure

7. **Reporting**
   - Generates comprehensive setup report
   - Provides next steps and console links
   - Saves detailed logs

---

## 🔧 **SCRIPT OPTIONS**

### **Bash Script Options**
```bash
./setup.sh [OPTIONS]

Options:
  -p, --project-id ID     Firebase project ID (required)
  -n, --project-name NAME Project display name (default: 'Chaupar Game')
  -s, --skip-firebase     Skip Firebase setup
  -o, --skip-ollama       Skip Ollama setup
  -h, --help              Show help message
```

### **Python Script Options**
```bash
python setup_automation.py [OPTIONS]

Options:
  --project-id ID          Firebase project ID (required)
  --project-name NAME      Project display name (default: 'Chaupar Game')
  --skip-firebase          Skip Firebase setup
  --skip-ollama            Skip Ollama setup
```

---

## 📊 **REQUIREMENTS**

### **Bash Script Requirements**
- **Operating System**: Linux, macOS, or Windows (WSL)
- **Node.js**: Version 16 or higher
- **npm**: Latest version
- **Firebase CLI**: Optional (for rules deployment)
- **Ollama**: Optional (for AI features)

### **Python Script Requirements**
- **Python**: Version 3.8 or higher
- **Dependencies**: See `requirements.txt`
- **Google Cloud SDK**: For Firebase Admin operations
- **Firebase Admin SDK**: For project management

---

## 🎯 **USAGE EXAMPLES**

### **Basic Setup**
```bash
# Simple setup with project ID
./setup.sh -p my-chaupar-game

# Setup with custom project name
./setup.sh -p my-chaupar-game -n "My Awesome Game"
```

### **Advanced Setup**
```bash
# Skip Firebase setup (for development only)
./setup.sh -p my-chaupar-game -s

# Skip Ollama setup (if not using local AI)
./setup.sh -p my-chaupar-game -o

# Skip both (minimal setup)
./setup.sh -p my-chaupar-game -s -o
```

### **Python Automation**
```bash
# Full automation with Python
python setup_automation.py --project-id my-chaupar-game --project-name "My Game"

# Skip certain components
python setup_automation.py --project-id my-chaupar-game --skip-firebase
```

---

## 🔍 **WHAT HAPPENS DURING SETUP**

### **Step-by-Step Process**

1. **Validation**
   - Checks project ID format
   - Validates system requirements
   - Confirms tool availability

2. **Configuration**
   - Creates environment files
   - Sets up project structure
   - Configures Firebase settings

3. **Installation**
   - Installs npm dependencies
   - Sets up AI services
   - Configures development environment

4. **Testing**
   - Builds application
   - Runs test suite
   - Validates functionality

5. **Deployment**
   - Deploys security rules
   - Configures production settings
   - Sets up monitoring

6. **Reporting**
   - Generates setup report
   - Provides next steps
   - Saves configuration details

---

## 📝 **OUTPUT FILES**

### **Generated Files**

- **`.env.local`** - Environment configuration
- **`setup_report.txt`** - Detailed setup report
- **`.env.local.backup`** - Backup of existing config

### **Report Contents**

The setup report includes:
- Project information and configuration
- Setup step completion status
- Firebase console links
- Next steps and requirements
- Troubleshooting information

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

#### **Project ID Validation Error**
```bash
❌ Invalid project ID. Use only lowercase letters, numbers, and hyphens.

# Solution: Use valid format
./setup.sh -p chaupar-game-123  # ✅ Valid
./setup.sh -p Chaupar_Game      # ❌ Invalid
```

#### **Node.js Version Error**
```bash
❌ Node.js 16+ required. Current version: 14.17.0

# Solution: Update Node.js
# Visit: https://nodejs.org/
```

#### **Firebase CLI Not Found**
```bash
⚠️ Firebase CLI not found
# Install with: npm install -g firebase-tools

# Then run:
npm install -g firebase-tools
firebase login
```

#### **Ollama Connection Failed**
```bash
⚠️ Failed to start Ollama

# Solution: Install Ollama
# Visit: https://ollama.ai/
```

### **Debug Mode**

Enable verbose logging:
```bash
# Bash script
DEBUG=true ./setup.sh -p your-project-id

# Python script
python setup_automation.py --project-id your-project-id --verbose
```

### **Rerun Troubleshooting**

#### **Configuration Not Updating**
```bash
# Check if .env.local exists and has correct project ID
cat .env.local | grep "VITE_FIREBASE_PROJECT_ID"

# Force update by removing .env.local
rm .env.local
./setup.sh -p your-project-id
```

#### **Backup Files Accumulating**
```bash
# List all backup files
ls -la .env.local.backup*

# Clean up old backups (keep recent ones)
rm .env.local.backup.*
```

#### **Firebase Rules Not Deploying**
```bash
# Check Firebase CLI login
firebase login --reauth

# Force rules deployment
firebase deploy --only firestore:rules --project your-project-id
```

---

## 🔄 **RERUNNING SETUP SCRIPTS**

### **Smart Rerun Detection**

Both automation scripts are **rerunnable** and will intelligently handle existing configurations:

#### **Same Project Rerun**
```bash
# If you run setup again for the same project ID
./setup.sh -p chaupar-game-123

# Script will detect it's a rerun and:
✅ Update existing configuration (not overwrite)
✅ Preserve your Firebase API keys
✅ Update timestamps and project info
✅ Skip unnecessary steps
```

#### **Different Project Rerun**
```bash
# If you run setup for a different project ID
./setup.sh -p new-chaupar-project

# Script will:
✅ Backup existing .env.local with timestamp
✅ Create new configuration for new project
✅ Preserve old configuration safely
```

### **Rerun Use Cases**

1. **Update Configuration**
   - Change project settings
   - Update environment variables
   - Modify AI configuration

2. **Fix Setup Issues**
   - Retry failed steps
   - Update dependencies
   - Redeploy security rules

3. **Switch Projects**
   - Development vs production
   - Multiple game instances
   - Testing environments

### **Rerun Safety Features**

- **Automatic backups** with timestamps
- **Configuration validation** before updates
- **No data loss** - existing configs preserved
- **Clear logging** of what's being updated

---

## 🔄 **POST-SETUP STEPS**

### **Required Manual Steps**

1. **Update Firebase Configuration**
   - Edit `.env.local`
   - Add your Firebase API keys
   - Configure authentication settings

2. **Enable Google Authentication**
   - Go to Firebase Console → Authentication
   - Enable Google provider
   - Configure OAuth consent screen

3. **Test Application**
   ```bash
   npm run dev
   # Open http://localhost:5173
   ```

4. **Deploy to Production**
   ```bash
   firebase deploy
   ```

---

## 📚 **INTEGRATION WITH DOCUMENTATION**

### **Setup Automation + Manual Guide**

- **Automation Scripts**: Handle technical setup
- **COMPREHENSIVE_SETUP.md**: Detailed manual instructions
- **SECURITY_SETUP.md**: Security configuration
- **AI_SETUP.md**: AI service configuration

### **Workflow**

1. **Run automation script** → Technical setup
2. **Follow manual guide** → Configuration and testing
3. **Deploy to production** → Go live

---

## 🤝 **CONTRIBUTING**

### **Improving Automation**

- **Add new features** to automation scripts
- **Improve error handling** and user feedback
- **Add support** for new platforms or services
- **Enhance reporting** and monitoring

### **Testing**

```bash
# Test bash script
./setup.sh -p test-project -s -o

# Test Python script
python setup_automation.py --project-id test-project --skip-firebase
```

---

## 📞 **SUPPORT**

### **Getting Help**

1. **Check this guide** for common solutions
2. **Review setup report** for specific issues
3. **Check prerequisites** and system requirements
4. **Create GitHub issue** for unique problems

### **Useful Links**

- 🔗 **Comprehensive Setup Guide**: [COMPREHENSIVE_SETUP.md](COMPREHENSIVE_SETUP.md)
- 🔗 **Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com)
- 🔗 **Ollama**: [ollama.ai](https://ollama.ai)
- 🔗 **Node.js**: [nodejs.org](https://nodejs.org)

---

**🎯 The automation scripts make setup 10x faster and more reliable than manual configuration! 🚀✨**

**Choose the script that fits your needs and get your Chaupar game running in minutes instead of hours.**
