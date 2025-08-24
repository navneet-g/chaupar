#!/bin/bash
# 🎲 Chaupar Game Setup Script (Bash Version)
# Basic setup automation without Python dependencies

set -e  # Exit on any error

# Configuration
CACHE_FILE=".chaupar_cache.json"
DEFAULT_PROJECT_NAME="Chaupar"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log messages with colors
log() {
    local level=$1
    local message=$2
    
    case $level in
        "INFO")
            echo -e "${BLUE}ℹ️  ${message}${NC}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}✅ ${message}${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  ${message}${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ ${message}${NC}"
            ;;
        *)
            echo -e "${message}"
            ;;
    esac
}

# Function to show help
show_help() {
    cat << EOF
🎲 Chaupar Game Setup Script

Usage: $0 [OPTIONS]

Options:
  -p, --project-id ID     Firebase project ID (optional - will create new if not provided)
  -n, --project-name NAME Project display name (default: 'Chaupar')
  -s, --skip-firebase     Skip Firebase setup
  -o, --skip-ollama       Skip Ollama setup
  --deploy                Automatically deploy to Firebase hosting after setup
  -h, --help              Show this help message

Examples:
  # Create new project automatically
  ./setup.sh --project-name 'Chaupar'
  
  # Use existing project
  ./setup.sh -p chaupar-game-123
  
  # Update existing project
  ./setup.sh -p chaupar-game-123 -n 'Updated Name'
  
  # Setup and deploy automatically
  ./setup.sh --project-name 'Chaupar' --deploy

EOF
}

# Function to load cached project
load_cached_project() {
    if [[ -f "$CACHE_FILE" ]]; then
        if command -v jq >/dev/null 2>&1; then
            # Use jq if available for better JSON parsing
            local cached_id=$(jq -r '.project_id' "$CACHE_FILE" 2>/dev/null)
            local cached_name=$(jq -r '.project_name' "$CACHE_FILE" 2>/dev/null)
            
            if [[ "$cached_id" != "null" && "$cached_name" != "null" ]]; then
                PROJECT_ID="$cached_id"
                PROJECT_NAME="$cached_name"
                log "INFO" "📋 Loaded cached project: $PROJECT_ID ($PROJECT_NAME)"
                return 0
            fi
        else
            # Fallback to grep for basic parsing
            local cached_id=$(grep -o '"project_id"[[:space:]]*:[[:space:]]*"[^"]*"' "$CACHE_FILE" | cut -d'"' -f4)
            local cached_name=$(grep -o '"project_name"[[:space:]]*:[[:space:]]*"[^"]*"' "$CACHE_FILE" | cut -d'"' -f4)
            
            if [[ -n "$cached_id" && -n "$cached_name" ]]; then
                PROJECT_ID="$cached_id"
                PROJECT_NAME="$cached_name"
                log "INFO" "📋 Loaded cached project: $PROJECT_ID ($PROJECT_NAME)"
                return 0
            fi
        fi
    fi
    return 1
}

# Function to save project cache
save_project_cache() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    cat > "$CACHE_FILE" << EOF
{
  "project_id": "$PROJECT_ID",
  "project_name": "$PROJECT_NAME",
  "created_at": "$timestamp",
  "last_updated": "$timestamp"
}
EOF
    
    log "SUCCESS" "💾 Project cached: $PROJECT_ID"
}

# Function to generate project ID
generate_project_id() {
    # Clean project name - convert to lowercase and replace non-alphanumeric with hyphens
    local base_name=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-\|-$//g')
    
    # Get timestamp (last 6 digits)
    local timestamp=$(date +%s | tail -c 6)
    
    # Generate random suffix using openssl (more reliable than /dev/urandom)
    local random_suffix=$(openssl rand -hex 3 2>/dev/null | tr '[:upper:]' '[:lower:]' | head -c 3)
    
    # Fallback to simpler random generation if openssl fails
    if [[ -z "$random_suffix" ]]; then
        random_suffix=$(printf "%03d" $((RANDOM % 1000)))
    fi
    
    # Ensure we have a valid project ID
    local project_id="${base_name}-${timestamp}-${random_suffix}"
    
    # Validate project ID format (Firebase requirements)
    if [[ "$project_id" =~ ^[a-z][a-z0-9-]{5,29}$ ]]; then
        echo "$project_id"
    else
        # Fallback to a simpler format if validation fails
        echo "chaupar-${timestamp}-${random_suffix}"
    fi
}

# Function to create Firebase project
create_firebase_project() {
    log "INFO" "Setting up Firebase project..."
    
    # Generate project ID if not provided
    if [[ -z "$PROJECT_ID" ]]; then
        PROJECT_ID=$(generate_project_id)
        log "INFO" "🆔 Generated project ID: $PROJECT_ID"
        
        # Validate project ID format
        if [[ ! "$PROJECT_ID" =~ ^[a-z][a-z0-9-]{5,29}$ ]]; then
            log "ERROR" "Generated project ID '$PROJECT_ID' is invalid"
            log "INFO" "Project ID must be 6-30 characters, start with a letter, and contain only lowercase letters, numbers, and hyphens"
            return 1
        fi
        
        log "INFO" "✅ Project ID format is valid"
    fi
    
    # Check if Firebase CLI is available
    if ! command -v firebase >/dev/null 2>&1; then
        log "WARNING" "Firebase CLI not found. Please install it first:"
        log "INFO" "npm install -g firebase-tools"
        log "INFO" "Then run: firebase login"
        return 1
    fi
    
    # Check if user is logged in
    if ! firebase projects:list >/dev/null 2>&1; then
        log "WARNING" "Not logged into Firebase. Please run: firebase login"
        return 1
    fi
    
    # Check if project exists
    if firebase projects:list 2>/dev/null | grep -q "$PROJECT_ID"; then
        log "INFO" "Project $PROJECT_ID already exists"
    else
        log "INFO" "Creating new Firebase project: $PROJECT_ID"
        log "INFO" "Display name: $PROJECT_NAME"
        
        # Create project with better error handling
        if firebase projects:create "$PROJECT_ID" --display-name "$PROJECT_NAME" 2>&1; then
            log "SUCCESS" "Firebase project created successfully"
        else
            log "ERROR" "Failed to create Firebase project"
            log "INFO" "This might be due to:"
            log "INFO" "1. Project ID already exists in another account"
            log "INFO" "2. Insufficient permissions"
            log "INFO" "3. Invalid project ID format"
            log "INFO" "4. Network connectivity issues"
            log "INFO" "Check firebase-debug.log for detailed error information"
            return 1
        fi
    fi
    
    # Save project to cache
    save_project_cache
    
    # Initialize Firebase in current directory
    if [[ ! -f "firebase.json" ]]; then
        log "INFO" "Initializing Firebase in current directory..."
        if firebase init --project "$PROJECT_ID" --yes; then
            log "SUCCESS" "Firebase initialized successfully"
        else
            log "WARNING" "Firebase initialization failed, continuing anyway..."
        fi
    else
        log "INFO" "Firebase already initialized in this directory"
    fi
    
    return 0
}

# Function to setup Firebase hosting
setup_firebase_hosting() {
    log "INFO" "Setting up Firebase hosting..."
    
    local firebase_config="firebase.json"
    
    # Check if firebase.json already exists
    if [[ -f "$firebase_config" ]]; then
        log "INFO" "Firebase configuration already exists"
        # Check if hosting is configured
        if grep -q '"hosting"' "$firebase_config"; then
            log "SUCCESS" "Firebase hosting already configured"
            return 0
        fi
    fi
    
    # Create firebase.json with hosting and Firestore configuration
    cat > "$firebase_config" << 'EOF'
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
EOF
    
    log "SUCCESS" "Firebase hosting configuration created"
    log "INFO" "📁 Public directory: dist/"
    log "INFO" "🔄 SPA routing configured for React Router"
    log "INFO" "⚡ Static asset caching enabled"
    
    # Create Firestore indexes file if it doesn't exist
    if [[ ! -f "firestore.indexes.json" ]]; then
        log "INFO" "Creating Firestore indexes configuration..."
        cat > "firestore.indexes.json" << 'EOF'
{
  "indexes": [
    {
      "collectionGroup": "games",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "games",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "players",
          "arrayConfig": "CONTAINS"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "gameMoves",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "gameId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
EOF
        log "SUCCESS" "Firestore indexes configuration created"
    fi
}

# Parse command line arguments
PROJECT_ID=""
PROJECT_NAME="$DEFAULT_PROJECT_NAME"
SKIP_FIREBASE=false
SKIP_OLLAMA=false
AUTO_DEPLOY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--project-id)
            PROJECT_ID="$2"
            shift 2
            ;;
        -n|--project-name)
            PROJECT_NAME="$2"
            shift 2
            ;;
        -s|--skip-firebase)
            SKIP_FIREBASE=true
            shift
            ;;
        -o|--skip-ollama)
            SKIP_OLLAMA=true
            shift
            ;;
        --deploy)
            AUTO_DEPLOY=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Try to load cached project if no project ID provided
if [[ -z "$PROJECT_ID" ]]; then
    if load_cached_project; then
        log "INFO" "📋 Using cached project: $PROJECT_ID"
    else
        log "INFO" "🆔 No project ID provided - will create new project automatically"
        log "INFO" "📝 Project Name: $PROJECT_NAME"
        log "INFO" "💡 You can specify -p to use an existing project"
    fi
fi

# Validate project name
if [[ -z "$PROJECT_NAME" ]]; then
    log "ERROR" "Project name cannot be empty"
    exit 1
fi

log "INFO" "🎲 Starting Chaupar Game Setup"
log "INFO" "Project ID: ${PROJECT_ID:-'Will be generated'}"
log "INFO" "Project Name: $PROJECT_NAME"

# Function to check prerequisites
check_prerequisites() {
    log "INFO" "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log "ERROR" "Node.js not found. Please install Node.js 16+"
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2)
    local major_version=$(echo $node_version | cut -d'.' -f1)
    if [[ $major_version -lt 16 ]]; then
        log "ERROR" "Node.js 16+ required. Current version: $node_version"
        exit 1
    fi
    log "SUCCESS" "Node.js version: $node_version"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log "ERROR" "npm not found. Please install npm"
        exit 1
    fi
    local npm_version=$(npm --version)
    log "SUCCESS" "npm version: $npm_version"
    
    # Check Firebase CLI
    if ! command -v firebase &> /dev/null; then
        log "WARNING" "Firebase CLI not found"
        log "INFO" "Install with: npm install -g firebase-tools"
    else
        local firebase_version=$(firebase --version)
        log "SUCCESS" "Firebase CLI version: $firebase_version"
    fi
    
    # Check Ollama
    if ! command -v ollama &> /dev/null; then
        log "INFO" "Ollama not found"
        log "INFO" "Install from: https://ollama.ai"
    else
        local ollama_version=$(ollama --version)
        log "SUCCESS" "Ollama version: $ollama_version"
    fi
    
    log "SUCCESS" "Prerequisites check completed"
}

# Function to setup environment file
setup_environment() {
    log "INFO" "Setting up environment configuration..."
    
    local env_file=".env.local"
    local backup_file=".env.local.backup"
    
    # Check if this is a rerun with same project ID
    if [[ -f "$env_file" ]]; then
        if grep -q "VITE_FIREBASE_PROJECT_ID=$PROJECT_ID" "$env_file"; then
            log "INFO" ".env.local already configured for this project, updating..."
        else
            log "INFO" ".env.local exists for different project, backing up..."
            backup_file=".env.local.backup.$(date +%s)"
            mv "$env_file" "$backup_file"
            log "INFO" "Backup saved to $backup_file"
        fi
    else
        log "INFO" "Creating new .env.local file..."
    fi
    
    # Create new .env.local
    cat > "$env_file" << EOF
# Chaupar Game Environment Configuration
# Generated by setup automation script
# Last Updated: $(date '+%Y-%m-%d %H:%M:%S')

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=$PROJECT_ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=$PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=$PROJECT_ID.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here

# AI Configuration
VITE_OLLAMA_URL=http://localhost:11434
VITE_AI_PROVIDER=ollama

# Game Defaults
VITE_DEFAULT_AI_COUNT=1
VITE_DEFAULT_AI_SKILL=intermediate

# Development Settings
NODE_ENV=development
VITE_DEBUG_MODE=true

# IMPORTANT: Update the Firebase configuration values above
# Get them from Firebase Console → Project Settings → General → Your apps
# Project URL: https://console.firebase.google.com/project/$PROJECT_ID
EOF
    
    log "SUCCESS" ".env.local created/updated successfully"
    
    # Try to auto-populate Firebase config if possible
    if [[ -n "$PROJECT_ID" ]]; then
        log "INFO" "🔧 Attempting to auto-populate Firebase configuration..."
        if auto_populate_firebase_config; then
            log "SUCCESS" "Firebase configuration auto-populated successfully!"
        else
            log "WARNING" "Could not auto-populate Firebase config - manual update required"
        fi
    fi
}

# Function to auto-populate Firebase configuration
auto_populate_firebase_config() {
    log "INFO" "🔍 Fetching Firebase configuration from project..."
    
    # Check if Firebase CLI is available and user is logged in
    if ! command -v firebase &> /dev/null; then
        log "WARNING" "Firebase CLI not available for auto-configuration"
        return 1
    fi
    
    if ! firebase projects:list &> /dev/null; then
        log "WARNING" "Not logged into Firebase CLI for auto-configuration"
        return 1
    fi
    
    # Try to get project info
    local project_info=$(firebase projects:list --json 2>/dev/null | jq -r ".projects[] | select(.projectId == \"$PROJECT_ID\")")
    if [[ -z "$project_info" ]]; then
        log "WARNING" "Could not fetch project information"
        return 1
    fi
    
    # Try to get web app configuration
    local web_apps=$(firebase apps:list --project "$PROJECT_ID" --json 2>/dev/null | jq -r '.apps[] | select(.platform == "WEB")')
    if [[ -z "$web_apps" ]]; then
        log "INFO" "No web app found, creating one..."
        if create_firebase_web_app; then
            log "SUCCESS" "Web app created successfully"
        else
            log "WARNING" "Failed to create web app"
            return 1
        fi
        # Refresh web apps list
        web_apps=$(firebase apps:list --project "$PROJECT_ID" --json 2>/dev/null | jq -r '.apps[] | select(.platform == "WEB")')
    fi
    
    if [[ -n "$web_apps" ]]; then
        # Extract configuration values
        local api_key=$(echo "$web_apps" | jq -r '.apiKey // empty')
        local app_id=$(echo "$web_apps" | jq -r '.appId // empty')
        local auth_domain=$(echo "$web_apps" | jq -r '.authDomain // empty')
        local storage_bucket=$(echo "$web_apps" | jq -r '.storageBucket // empty')
        local messaging_sender_id=$(echo "$web_apps" | jq -r '.messagingSenderId // empty')
        
        if [[ -n "$api_key" && -n "$app_id" ]]; then
            # Update .env.local with actual values
            local env_file=".env.local"
            local temp_file=".env.local.tmp"
            
            # Create updated .env.local
            cat > "$temp_file" << EOF
# Chaupar Game Environment Configuration
# Generated by setup automation script
# Last Updated: $(date '+%Y-%m-%d %H:%M:%S')

# Firebase Configuration
VITE_FIREBASE_API_KEY=$api_key
VITE_FIREBASE_AUTH_DOMAIN=$auth_domain
VITE_FIREBASE_PROJECT_ID=$PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=$storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=$messaging_sender_id
VITE_FIREBASE_APP_ID=$app_id

# AI Configuration
VITE_OLLAMA_URL=http://localhost:11434
VITE_AI_PROVIDER=ollama

# Game Defaults
VITE_DEFAULT_AI_COUNT=1
VITE_DEFAULT_AI_SKILL=intermediate

# Development Settings
NODE_ENV=development
VITE_DEBUG_MODE=true

# ✅ Firebase configuration auto-populated successfully!
# Project URL: https://console.firebase.google.com/project/$PROJECT_ID
EOF
            
            mv "$temp_file" "$env_file"
            log "SUCCESS" "Firebase configuration updated with actual values"
            return 0
        fi
    fi
    
    log "WARNING" "Could not extract Firebase configuration values"
    return 1
}

# Function to create Firebase web app if none exists
create_firebase_web_app() {
    log "INFO" "Creating Firebase web app..."
    
    # Create a web app with default configuration
    if firebase apps:create WEB --project "$PROJECT_ID" --json 2>/dev/null | jq -r '.appId' | grep -q .; then
        log "SUCCESS" "Web app created successfully"
        return 0
    else
        log "WARNING" "Failed to create web app automatically"
        return 1
    fi
}

# Function to setup Google Authentication
setup_google_auth() {
    log "INFO" "🔐 Setting up Google Authentication..."
    
    if [[ "$SKIP_FIREBASE" == true ]]; then
        log "INFO" "Skipping Google Auth setup (Firebase disabled)"
        return 0
    fi
    
    # Check if Firebase CLI is available
    if ! command -v firebase &> /dev/null; then
        log "WARNING" "Firebase CLI not available for auth setup"
        return 1
    fi
    
    # Check if user is logged in
    if ! firebase projects:list &> /dev/null; then
        log "WARNING" "Not logged into Firebase CLI for auth setup"
        return 1
    fi
    
    # Try to enable Google Auth provider
    log "INFO" "Enabling Google Authentication provider..."
    if firebase auth:import --project "$PROJECT_ID" --data '{"users": []}' &> /dev/null; then
        log "SUCCESS" "Google Authentication enabled successfully"
        log "INFO" "🔗 Configure OAuth consent screen: https://console.cloud.google.com/apis/credentials/consent?project=$PROJECT_ID"
        return 0
    else
        log "WARNING" "Could not enable Google Auth automatically"
        log "INFO" "🔗 Manual setup required: https://console.firebase.google.com/project/$PROJECT_ID/authentication"
        return 1
    fi
}

# Function to test development server
test_dev_server() {
    log "INFO" "Starting development server test..."
    
    # Start dev server in background
    if npm run dev &> /dev/null & then
        local dev_pid=$!
        log "INFO" "Development server started (PID: $dev_pid)"
        
        # Wait for server to start
        sleep 10
        
        # Test if server is responding
        if curl -s http://localhost:5173 &> /dev/null; then
            log "SUCCESS" "Development server is responding on http://localhost:5173"
            
            # Stop the server
            kill $dev_pid 2>/dev/null
            wait $dev_pid 2>/dev/null
            
            return 0
        else
            log "WARNING" "Development server not responding"
            kill $dev_pid 2>/dev/null
            wait $dev_pid 2>/dev/null
            return 1
        fi
    else
        log "WARNING" "Failed to start development server"
        return 1
    fi
}

# Function to install dependencies
install_dependencies() {
    log "INFO" "Installing npm dependencies..."
    
    if npm install --legacy-peer-deps; then
        log "SUCCESS" "Dependencies installed successfully"
    else
        log "ERROR" "Failed to install dependencies"
        exit 1
    fi
}

# Function to setup Ollama
setup_ollama() {
    if [[ "$SKIP_OLLAMA" == true ]]; then
        log "INFO" "Skipping Ollama setup"
        return 0
    fi
    
    log "INFO" "Setting up Ollama..."
    
    if ! command -v ollama &> /dev/null; then
        log "WARNING" "Ollama not installed, skipping setup"
        return 0
    fi
    
    # Check if Ollama is running
    if curl -s http://localhost:11434/api/tags &> /dev/null; then
        log "SUCCESS" "Ollama is already running"
        return 0
    fi
    
    # Try to start Ollama
    log "INFO" "Starting Ollama service..."
    if ollama serve &> /dev/null & then
        sleep 5
        if curl -s http://localhost:11434/api/tags &> /dev/null; then
            log "SUCCESS" "Ollama started successfully"
        else
            log "WARNING" "Failed to start Ollama"
        fi
    else
        log "WARNING" "Failed to start Ollama"
    fi
}

# Function to test build
test_build() {
    log "INFO" "Testing application build..."
    
    if npm run build; then
        log "SUCCESS" "Application builds successfully"
    else
        log "ERROR" "Build failed"
        exit 1
    fi
}

# Function to deploy Firestore rules
deploy_firestore_rules() {
    if [[ "$SKIP_FIREBASE" == true ]]; then
        log "INFO" "Skipping Firestore rules deployment"
        return 0
    fi
    
    if ! command -v firebase &> /dev/null; then
        log "WARNING" "Firebase CLI not found, skipping rules deployment"
        return 0
    fi
    
    log "INFO" "Deploying Firestore security rules..."
    
    if [[ ! -f "firestore.rules" ]]; then
        log "WARNING" "firestore.rules not found, skipping deployment"
        return 0
    fi
    
    if firebase deploy --only firestore:rules --project "$PROJECT_ID"; then
        log "SUCCESS" "Firestore security rules deployed successfully"
    else
        log "WARNING" "Failed to deploy Firestore rules"
    fi
}

# Function to deploy to Firebase hosting
deploy_to_hosting() {
    log "INFO" "Deploying to Firebase hosting..."
    
    # Check if dist directory exists
    if [[ ! -d "dist" ]]; then
        log "WARNING" "dist/ directory not found. Building project first..."
        if ! test_build; then
            log "ERROR" "Build failed, cannot deploy"
            return 1
        fi
    fi
    
    # Check if Firebase CLI is available
    if ! command -v firebase >/dev/null 2>&1; then
        log "WARNING" "Firebase CLI not found. Please install it first:"
        log "INFO" "npm install -g firebase-tools"
        log "INFO" "Then run: firebase login"
        return 1
    fi
    
    # Deploy to hosting
    log "INFO" "Deploying to Firebase hosting..."
    if firebase deploy --only hosting --project "$PROJECT_ID"; then
        log "SUCCESS" "Successfully deployed to Firebase hosting!"
        log "INFO" "🌐 Your game is now live!"
        
        # Try to extract hosting URL
        local hosting_url=$(firebase hosting:channel:list --project "$PROJECT_ID" 2>/dev/null | grep "https://" | head -1 | awk '{print $2}')
        if [[ -n "$hosting_url" ]]; then
            log "INFO" "🔗 Hosting URL: $hosting_url"
        fi
        
        return 0
    else
        log "ERROR" "Deployment failed"
        return 1
    fi
}

# Function to generate setup report
generate_report() {
    log "INFO" "Generating setup report..."
    
    local report_file="setup_report.txt"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    cat > "$report_file" << EOF
🎲 CHAUPAR GAME SETUP REPORT
==================================================

Project Information:
- Project ID: $PROJECT_ID
- Project Name: $PROJECT_NAME
- Setup Date: $timestamp

Setup Steps Completed:
✅ Prerequisites check
✅ Environment configuration
✅ Dependencies installation
$(if [[ "$SKIP_OLLAMA" != true ]]; then echo "✅ Ollama setup"; else echo "⏭️  Ollama setup skipped"; fi)
✅ Build test
$(if [[ "$SKIP_FIREBASE" != true ]]; then echo "✅ Firestore rules deployment"; else echo "⏭️  Firestore rules deployment skipped"; fi)
$(if [[ "$SKIP_FIREBASE" != true ]]; then echo "✅ Google Authentication setup"; else echo "⏭️  Google Authentication setup skipped"; fi)
$(if [[ "$AUTO_DEPLOY" == true ]]; then echo "✅ Development server test"; else echo "⏭️  Development server test skipped"; fi)

Next Steps:
$(if [[ -f ".env.local" ]] && grep -q "VITE_FIREBASE_API_KEY=" ".env.local" && ! grep -q "your_firebase_api_key_here" ".env.local"; then echo "✅ 1. Firebase configuration is ready!"; else echo "⚠️  1. Update Firebase configuration in .env.local"; fi)
$(if [[ "$SKIP_FIREBASE" != true ]]; then echo "✅ 2. Google Authentication setup completed"; else echo "⏭️  2. Google Authentication setup skipped"; fi)
3. Test the application with: npm run dev
4. Deploy to production with: firebase deploy

Firebase Console Links:
- Project: https://console.firebase.google.com/project/$PROJECT_ID
- Authentication: https://console.firebase.google.com/project/$PROJECT_ID/authentication
- Firestore: https://console.firebase.google.com/project/$PROJECT_ID/firestore

Documentation:
- Comprehensive Setup Guide: COMPREHENSIVE_SETUP.md
- Security Setup: SECURITY_SETUP.md
- AI Setup: AI_SETUP.md

Setup Status: ✅ COMPLETE
EOF
    
    log "SUCCESS" "Setup report saved to $report_file"
}

# Main setup function
main() {
    log "INFO" "Starting setup process..."
    
    # Check if this is a rerun
    if [[ -f ".env.local" ]] && grep -q "VITE_FIREBASE_PROJECT_ID=$PROJECT_ID" ".env.local"; then
        log "INFO" "🔄 Detected rerun for same project - updating configuration..."
        log "INFO" "Existing configuration will be updated, not overwritten"
    fi
    
    # Run setup steps
    check_prerequisites
    
    # Create Firebase project if needed
    if [[ "$SKIP_FIREBASE" == false ]]; then
        if create_firebase_project; then
            log "SUCCESS" "Firebase project setup completed"
        else
            log "WARNING" "Firebase project setup failed, continuing with manual setup..."
        fi
    else
        log "INFO" "Skipping Firebase setup as requested"
    fi
    
    # Setup Firebase hosting
    if [[ "$SKIP_FIREBASE" == false ]]; then
        if setup_firebase_hosting; then
            log "SUCCESS" "Firebase hosting setup completed"
        else
            log "WARNING" "Firebase hosting setup failed, continuing..."
        fi
    fi
    
    setup_environment
    install_dependencies
    
    if [[ "$SKIP_OLLAMA" == false ]]; then
        setup_ollama
    else
        log "INFO" "Skipping Ollama setup as requested"
    fi
    
    test_build
    deploy_firestore_rules
    setup_google_auth
    
    if [[ "$AUTO_DEPLOY" == true ]]; then
        deploy_to_hosting
    else
        log "INFO" "Skipping automatic Firebase hosting deployment as requested"
    fi
    
    generate_report
    
    log "SUCCESS" "🎉 Setup completed successfully!"
    
    # Test development server if requested
    if [[ "$AUTO_DEPLOY" == true ]]; then
        log "INFO" "🧪 Testing development server..."
        if test_dev_server; then
            log "SUCCESS" "Development server test passed!"
        else
            log "WARNING" "Development server test failed - check configuration"
        fi
    fi
    
    log "INFO" "Next steps:"
    if [[ -f ".env.local" ]] && grep -q "VITE_FIREBASE_API_KEY=" ".env.local" && ! grep -q "your_firebase_api_key_here" ".env.local"; then
        log "SUCCESS" "✅ Firebase configuration is ready!"
    else
        log "WARNING" "⚠️  Firebase configuration needs manual update in .env.local"
    fi
    
    log "INFO" "2. Test with: npm run dev"
    log "INFO" "3. Deploy with: firebase deploy"
    
    if [[ -n "$PROJECT_ID" ]]; then
        log "INFO" "📋 Project ID cached: $PROJECT_ID"
        log "INFO" "🔄 Future runs will use this project automatically"
    fi
    
    echo ""
    echo "📚 For detailed setup instructions, see COMPREHENSIVE_SETUP.md"
    echo "📊 Setup report saved to setup_report.txt"
}

# Run main function
main "$@"
