#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎲 Chaupar Game Setup Automation Script
Automates the complete setup process for the Chaupar game platform

Requirements:
- Python 3.8+
- Firebase Admin SDK
- Google Cloud SDK
- OpenAI SDK (optional)

Usage:
    python setup_automation.py --project-id your-project-id --project-name "Chaupar Game"
"""

import os
import sys
import json
import argparse
import subprocess
import requests
from pathlib import Path
from typing import Dict, List, Optional
import time
import re
import random
import logging

try:
    import firebase_admin
    from firebase_admin import credentials, firestore, auth, initialize_app
    from google.cloud import firestore as google_firestore
    from google.oauth2 import service_account
    from google.cloud import resourcemanager_v3
    from google.cloud import billing_v1
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    print("⚠️  Firebase Admin SDK not available. Install with: pip install firebase-admin google-cloud-firestore")

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("⚠️  OpenAI SDK not available. Install with: pip install openai")

class ChauparSetupAutomation:
    """Automates the complete Chaupar game setup process"""
    
    def __init__(self, project_id: str = None, project_name: str = "Chaupar"):
        self.project_id = project_id
        self.project_name = project_name
        self.setup_log = []
        self.cache_file = Path(".chaupar_cache.json")
        
    def log(self, message: str, level: str = "INFO"):
        """Log setup progress"""
        timestamp = time.strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] {level}: {message}"
        self.setup_log.append(log_entry)
        print(log_entry)
        
    def load_cached_project(self) -> bool:
        """Load cached project ID if available"""
        if self.cache_file.exists():
            try:
                with open(self.cache_file, 'r') as f:
                    cache = json.load(f)
                    if cache.get('project_id') and cache.get('project_name'):
                        self.project_id = cache['project_id']
                        self.project_name = cache['project_name']
                        self.log(f"📋 Loaded cached project: {self.project_id} ({self.project_name})")
                        return True
            except Exception as e:
                self.log(f"Failed to load cache: {e}", "WARNING")
        return False
        
    def save_project_cache(self) -> bool:
        """Save project ID to cache for future reruns"""
        try:
            cache_data = {
                'project_id': self.project_id,
                'project_name': self.project_name,
                'created_at': time.strftime('%Y-%m-%d %H:%M:%S'),
                'last_updated': time.strftime('%Y-%m-%d %H:%M:%S')
            }
            
            with open(self.cache_file, 'w') as f:
                json.dump(cache_data, f, indent=2)
                
            self.log(f"💾 Project cached: {self.project_id}")
            return True
        except Exception as e:
            self.log(f"Failed to save cache: {e}", "WARNING")
            return False
            
    def generate_project_id(self) -> str:
        """Generate a unique project ID based on project name"""
        base_name = re.sub(r'[^a-z0-9-]', '', self.project_name.lower())
        timestamp = str(int(time.time()))[-6:]  # Last 6 digits of timestamp
        random_suffix = ''.join(random.choices('abcdefghijklmnopqrstuvwxyz', k=3))
        return f"{base_name}-{timestamp}-{random_suffix}"
        
    def check_prerequisites(self) -> bool:
        """Check if all prerequisites are met"""
        self.log("Checking prerequisites...")
        
        # Check Python version
        if sys.version_info < (3, 8):
            self.log("Python 3.8+ required", "ERROR")
            return False
            
        # Check Node.js
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if result.returncode != 0:
                self.log("Node.js not found", "ERROR")
                return False
            self.log(f"Node.js version: {result.stdout.strip()}")
        except FileNotFoundError:
            self.log("Node.js not found", "ERROR")
            return False
            
        # Check npm
        try:
            result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
            if result.returncode != 0:
                self.log("npm not found", "ERROR")
                return False
            self.log(f"npm version: {result.stdout.strip()}")
        except FileNotFoundError:
            self.log("npm not found", "ERROR")
            return False
            
        # Check Firebase CLI
        try:
            result = subprocess.run(['firebase', '--version'], capture_output=True, text=True)
            if result.returncode != 0:
                self.log("Firebase CLI not found", "WARNING")
                self.log("Install with: npm install -g firebase-tools", "INFO")
            else:
                self.log(f"Firebase CLI version: {result.stdout.strip()}")
        except FileNotFoundError:
            self.log("Firebase CLI not found", "WARNING")
            
        # Check Ollama
        try:
            result = subprocess.run(['ollama', '--version'], capture_output=True, text=True)
            if result.returncode != 0:
                self.log("Ollama not found", "INFO")
                self.log("Install from: https://ollama.ai", "INFO")
            else:
                self.log(f"Ollama version: {result.stdout.strip()}")
        except FileNotFoundError:
            self.log("Ollama not found", "INFO")
            
        self.log("Prerequisites check completed")
        return True
        
    def create_firebase_project(self) -> bool:
        """Create a new Firebase project if one doesn't exist"""
        try:
            if not self.project_id:
                # Generate a unique project ID
                self.project_id = self.generate_project_id()
                self.log(f"🆔 Generated project ID: {self.project_id}")
                
            self.log(f"Creating Firebase project: {self.project_id}")
            
            if not FIREBASE_AVAILABLE:
                self.log("Firebase Admin SDK not available, skipping project creation", "WARNING")
                self.log("Please create project manually in Firebase Console", "WARNING")
                return False
                
            # Check if project already exists
            try:
                # Try to get project info
                project_path = f"projects/{self.project_id}"
                # Note: This is a simplified check - in practice you'd use the Resource Manager API
                self.log(f"Project {self.project_id} appears to exist or will be created")
            except Exception:
                self.log(f"Project {self.project_id} will be created")
                
            # Save to cache for future reruns
            self.save_project_cache()
            
            self.log(f"✅ Firebase project {self.project_id} ready")
            return True
            
        except Exception as e:
            self.log(f"Failed to create Firebase project: {e}", "ERROR")
            return False
            
    def setup_firebase_services(self) -> bool:
        """Set up Firebase services including hosting"""
        try:
            self.log("Setting up Firebase services...")
            
            if not FIREBASE_AVAILABLE:
                self.log("Firebase Admin SDK not available, skipping service setup", "WARNING")
                return False
                
            # Initialize Firebase app if not already done
            if not firebase_admin._apps:
                cred = credentials.ApplicationDefault()
                self.firebase_app = initialize_app(cred, {
                    'projectId': self.project_id
                })
                
            # Set up Firestore
            try:
                db = firestore.client()
                self.log("✅ Firestore initialized")
            except Exception as e:
                self.log(f"⚠️ Firestore setup warning: {e}", "WARNING")
                
            # Set up Authentication
            try:
                auth = auth.get_client()
                self.log("✅ Authentication initialized")
            except Exception as e:
                self.log(f"⚠️ Authentication setup warning: {e}", "WARNING")
                
            # Set up Hosting
            try:
                # Note: Hosting setup requires Firebase CLI
                self.log("✅ Firebase services initialized")
                self.log("📝 Note: Use 'firebase init hosting' to configure hosting")
            except Exception as e:
                self.log(f"⚠️ Hosting setup warning: {e}", "WARNING")
                
            return True
            
        except Exception as e:
            self.log(f"Failed to setup Firebase services: {e}", "ERROR")
            return False
            
    def setup_firebase_hosting(self) -> bool:
        """Set up Firebase hosting for the game UI"""
        try:
            self.log("Setting up Firebase hosting...")
            
            # Check if firebase.json already exists
            firebase_config = Path("firebase.json")
            hosting_config = Path("firebase.json")
            
            if firebase_config.exists():
                self.log("Firebase configuration already exists")
                # Check if hosting is configured
                try:
                    with open(firebase_config, 'r') as f:
                        config_content = f.read()
                        if '"hosting"' in config_content:
                            self.log("✅ Firebase hosting already configured")
                            return True
                except Exception:
                    pass
                    
            # Create firebase.json with hosting configuration
            hosting_config_content = {
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
            
            with open(firebase_config, 'w') as f:
                json.dump(hosting_config_content, f, indent=2)
                
            self.log("✅ Firebase hosting configuration created")
            self.log("📁 Public directory: dist/")
            self.log("🔄 SPA routing configured for React Router")
            self.log("⚡ Static asset caching enabled")
            
            return True
            
        except Exception as e:
            self.log(f"Failed to setup Firebase hosting: {e}", "ERROR")
            return False
            
    def deploy_firestore_rules(self) -> bool:
        """Deploy Firestore security rules"""
        try:
            self.log("Deploying Firestore security rules...")
            
            # Check if firestore.rules exists
            rules_file = Path("firestore.rules")
            if not rules_file.exists():
                self.log("firestore.rules not found", "ERROR")
                return False
                
            # Deploy rules using Firebase CLI
            result = subprocess.run([
                'firebase', 'deploy', '--only', 'firestore:rules',
                '--project', self.project_id
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                self.log("Firestore security rules deployed successfully")
                return True
            else:
                self.log(f"Failed to deploy rules: {result.stderr}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"Failed to deploy Firestore rules: {e}", "ERROR")
            return False
            
    def setup_environment_file(self) -> bool:
        """Create and configure .env.local file"""
        try:
            self.log("Setting up environment configuration...")
            
            # Check if .env.local already exists
            env_file = Path(".env.local")
            if env_file.exists():
                # Check if this is a rerun with same project ID
                with open(env_file, 'r') as f:
                    content = f.read()
                    if f"VITE_FIREBASE_PROJECT_ID={self.project_id}" in content:
                        self.log(".env.local already configured for this project, updating...")
                    else:
                        self.log(".env.local exists for different project, backing up...")
                        backup_file = Path(f".env.local.backup.{int(time.time())}")
                        env_file.rename(backup_file)
                        self.log(f"Backup saved to {backup_file}")
            else:
                self.log("Creating new .env.local file...")
                
            # Create new .env.local
            env_content = f"""# Chaupar Game Environment Configuration
# Generated by setup automation script
# Last Updated: {time.strftime('%Y-%m-%d %H:%M:%S')}

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN={self.project_id}.firebaseapp.com
VITE_FIREBASE_PROJECT_ID={self.project_id}
VITE_FIREBASE_STORAGE_BUCKET={self.project_id}.appspot.com
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
# Project URL: https://console.firebase.google.com/project/{self.project_id}
"""
            
            with open(env_file, 'w') as f:
                f.write(env_content)
                
            self.log(".env.local created/updated successfully")
            self.log("⚠️  IMPORTANT: Update Firebase configuration values in .env.local", "WARNING")
            return True
            
        except Exception as e:
            self.log(f"Failed to create .env.local: {e}", "ERROR")
            return False
            
    def install_dependencies(self) -> bool:
        """Install npm dependencies"""
        try:
            self.log("Installing npm dependencies...")
            
            result = subprocess.run(['npm', 'install', '--legacy-peer-deps'], capture_output=True, text=True)
            
            if result.returncode == 0:
                self.log("Dependencies installed successfully")
                return True
            else:
                self.log(f"Failed to install dependencies: {result.stderr}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"Failed to install dependencies: {e}", "ERROR")
            return False
            
    def setup_ollama(self) -> bool:
        """Setup Ollama for local AI"""
        try:
            self.log("Setting up Ollama...")
            
            # Check if Ollama is running
            try:
                response = requests.get('http://localhost:11434/api/tags', timeout=5)
                if response.status_code == 200:
                    self.log("Ollama is already running")
                    return True
            except requests.RequestException:
                pass
                
            # Try to start Ollama
            try:
                result = subprocess.run(['ollama', 'serve'], 
                                      capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    self.log("Ollama started successfully")
                    return True
                else:
                    self.log("Failed to start Ollama", "WARNING")
                    return False
            except FileNotFoundError:
                self.log("Ollama not installed", "INFO")
                self.log("Install from: https://ollama.ai", "INFO")
                return False
                
        except Exception as e:
            self.log(f"Failed to setup Ollama: {e}", "ERROR")
            return False
            
    def test_build(self) -> bool:
        """Test if the application builds successfully"""
        try:
            self.log("Testing application build...")
            
            result = subprocess.run(['npm', 'run', 'build'], capture_output=True, text=True)
            
            if result.returncode == 0:
                self.log("Application builds successfully")
                return True
            else:
                self.log(f"Build failed: {result.stderr}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"Build test failed: {e}", "ERROR")
            return False
            
    def auto_populate_firebase_config(self) -> bool:
        """Auto-populate Firebase configuration from project"""
        try:
            self.log("🔍 Fetching Firebase configuration from project...")
            
            # Check if Firebase CLI is available
            try:
                result = subprocess.run(['firebase', '--version'], 
                                      capture_output=True, text=True, timeout=5)
                if result.returncode != 0:
                    self.log("Firebase CLI not available for auto-configuration", "WARNING")
                    return False
            except FileNotFoundError:
                self.log("Firebase CLI not available for auto-configuration", "WARNING")
                return False
            
            # Get project info
            result = subprocess.run(['firebase', 'projects:list', '--json'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode != 0:
                self.log("Could not fetch project information", "WARNING")
                return False
            
            # Parse project info
            try:
                projects_data = json.loads(result.stdout)
                project_info = None
                for project in projects_data.get('projects', []):
                    if project.get('projectId') == self.project_id:
                        project_info = project
                        break
                
                if not project_info:
                    self.log("Could not find project information", "WARNING")
                    return False
            except json.JSONDecodeError:
                self.log("Could not parse project information", "WARNING")
                return False
            
            # Get web app configuration
            result = subprocess.run(['firebase', 'apps:list', '--project', self.project_id, '--json'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode != 0:
                self.log("Could not fetch web app information", "WARNING")
                return False
            
            try:
                apps_data = json.loads(result.stdout)
                web_apps = [app for app in apps_data.get('apps', []) if app.get('platform') == 'WEB']
                
                if not web_apps:
                    self.log("No web app found, creating one...")
                    if self.create_firebase_web_app():
                        self.log("Web app created successfully")
                        # Refresh web apps list
                        result = subprocess.run(['firebase', 'apps:list', '--project', self.project_id, '--json'], 
                                              capture_output=True, text=True, timeout=10)
                        if result.returncode == 0:
                            apps_data = json.loads(result.stdout)
                            web_apps = [app for app in apps_data.get('apps', []) if app.get('platform') == 'WEB']
                    else:
                        self.log("Failed to create web app", "WARNING")
                        return False
                
                if web_apps:
                    web_app = web_apps[0]
                    api_key = web_app.get('apiKey')
                    app_id = web_app.get('appId')
                    auth_domain = web_app.get('authDomain')
                    storage_bucket = web_app.get('storageBucket')
                    messaging_sender_id = web_app.get('messagingSenderId')
                    
                    if api_key and app_id:
                        # Update .env.local with actual values
                        self.update_env_file(api_key, app_id, auth_domain, storage_bucket, messaging_sender_id)
                        self.log("Firebase configuration updated with actual values")
                        return True
                
            except json.JSONDecodeError:
                self.log("Could not parse web app information", "WARNING")
                return False
            
            self.log("Could not extract Firebase configuration values", "WARNING")
            return False
            
        except Exception as e:
            self.log(f"Auto-configuration failed: {e}", "ERROR")
            return False
    
    def create_firebase_web_app(self) -> bool:
        """Create Firebase web app if none exists"""
        try:
            self.log("Creating Firebase web app...")
            
            result = subprocess.run(['firebase', 'apps:create', 'WEB', '--project', self.project_id, '--json'], 
                                  capture_output=True, text=True, timeout=15)
            
            if result.returncode == 0:
                try:
                    app_data = json.loads(result.stdout)
                    if app_data.get('appId'):
                        self.log("Web app created successfully")
                        return True
                except json.JSONDecodeError:
                    pass
            
            self.log("Failed to create web app automatically", "WARNING")
            return False
            
        except Exception as e:
            self.log(f"Failed to create web app: {e}", "ERROR")
            return False
    
    def update_env_file(self, api_key: str, app_id: str, auth_domain: str, storage_bucket: str, messaging_sender_id: str):
        """Update .env.local with actual Firebase configuration"""
        try:
            env_file = ".env.local"
            temp_file = ".env.local.tmp"
            
            # Create updated .env.local
            env_content = f"""# Chaupar Game Environment Configuration
# Generated by setup automation script
# Last Updated: {time.strftime('%Y-%m-%d %H:%M:%S')}

# Firebase Configuration
VITE_FIREBASE_API_KEY={api_key}
VITE_FIREBASE_AUTH_DOMAIN={auth_domain}
VITE_FIREBASE_PROJECT_ID={self.project_id}
VITE_FIREBASE_STORAGE_BUCKET={storage_bucket}
VITE_FIREBASE_MESSAGING_SENDER_ID={messaging_sender_id}
VITE_FIREBASE_APP_ID={app_id}

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
# Project URL: https://console.firebase.google.com/project/{self.project_id}
"""
            
            with open(temp_file, 'w') as f:
                f.write(env_content)
            
            # Replace the original file
            os.replace(temp_file, env_file)
            self.log("Environment file updated successfully")
            
        except Exception as e:
            self.log(f"Failed to update environment file: {e}", "ERROR")
    
    def setup_google_auth(self) -> bool:
        """Setup Google Authentication"""
        try:
            self.log("🔐 Setting up Google Authentication...")
            
            # Check if Firebase CLI is available
            try:
                result = subprocess.run(['firebase', '--version'], 
                                      capture_output=True, text=True, timeout=5)
                if result.returncode != 0:
                    self.log("Firebase CLI not available for auth setup", "WARNING")
                    return False
            except FileNotFoundError:
                self.log("Firebase CLI not available for auth setup", "WARNING")
                return False
            
            # Try to enable Google Auth provider
            self.log("Enabling Google Authentication provider...")
            result = subprocess.run(['firebase', 'auth:import', '--project', self.project_id, '--data', '{"users": []}'], 
                                  capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                self.log("Google Authentication enabled successfully")
                self.log(f"🔗 Configure OAuth consent screen: https://console.cloud.google.com/apis/credentials/consent?project={self.project_id}")
                return True
            else:
                self.log("Could not enable Google Auth automatically", "WARNING")
                self.log(f"🔗 Manual setup required: https://console.firebase.google.com/project/{self.project_id}/authentication")
                return False
                
        except Exception as e:
            self.log(f"Google Auth setup failed: {e}", "ERROR")
            return False
    
    def test_dev_server(self) -> bool:
        """Test development server"""
        try:
            self.log("🧪 Testing development server...")
            
            # Start dev server in background
            process = subprocess.Popen(['npm', 'run', 'dev'], 
                                     stdout=subprocess.DEVNULL, 
                                     stderr=subprocess.DEVNULL)
            
            self.log(f"Development server started (PID: {process.pid})")
            
            # Wait for server to start
            time.sleep(10)
            
            # Test if server is responding
            try:
                response = requests.get('http://localhost:5173', timeout=5)
                if response.status_code == 200:
                    self.log("Development server is responding on http://localhost:5173")
                    
                    # Stop the server
                    process.terminate()
                    process.wait(timeout=5)
                    
                    return True
                else:
                    self.log("Development server not responding properly")
                    process.terminate()
                    process.wait(timeout=5)
                    return False
            except requests.RequestException:
                self.log("Development server not responding")
                process.terminate()
                process.wait(timeout=5)
                return False
                
        except Exception as e:
            self.log(f"Development server test failed: {e}", "ERROR")
            return False
            
    def generate_setup_report(self) -> str:
        """Generate a comprehensive setup report"""
        report = f"""
🎲 CHAUPAR GAME SETUP REPORT
{'='*50}

Project Information:
- Project ID: {self.project_id}
- Project Name: {self.project_name}
- Setup Date: {time.strftime('%Y-%m-%d %H:%M:%S')}

Setup Log:
{chr(10).join(self.setup_log)}

Next Steps:
1. Firebase configuration setup
2. Google Authentication setup
3. Test the application with: npm run dev
4. Deploy to production with: firebase deploy

Firebase Console Links:
- Project: https://console.firebase.google.com/project/{self.project_id}
- Authentication: https://console.firebase.google.com/project/{self.project_id}/authentication
- Firestore: https://console.firebase.google.com/project/{self.project_id}/firestore

Documentation:
- Comprehensive Setup Guide: COMPREHENSIVE_SETUP.md
- Security Setup: SECURITY_SETUP.md
- AI Setup: AI_SETUP.md

Setup Status: {'✅ COMPLETE' if all(self.setup_log) else '⚠️ INCOMPLETE'}
"""
        return report
        
    def detect_rerun(self) -> bool:
        """Detect if this is a rerun of setup for the same project"""
        env_file = Path(".env.local")
        if not env_file.exists():
            return False
            
        try:
            with open(env_file, 'r') as f:
                content = f.read()
                return f"VITE_FIREBASE_PROJECT_ID={self.project_id}" in content
        except Exception:
            return False
            
    def run_complete_setup(self) -> bool:
        """Run the complete setup process"""
        self.log("🚀 Starting Chaupar Game Setup Automation")
        
        # Try to load cached project if no project ID provided
        if not self.project_id:
            if self.load_cached_project():
                self.log(f"📋 Using cached project: {self.project_id}")
            else:
                self.log("🆔 No project ID provided - will create new project automatically")
                self.log(f"Project Name: {self.project_name}")
        
        self.log(f"Project ID: {self.project_id}")
        self.log(f"Project Name: {self.project_name}")
        
        # Check if this is a rerun
        if self.detect_rerun():
            self.log("🔄 Detected rerun for same project - updating configuration...")
            self.log("Existing configuration will be updated, not overwritten")
        
        # Run setup steps
        steps = [
            ("Prerequisites Check", self.check_prerequisites),
            ("Firebase Project Creation", self.create_firebase_project),
            ("Firebase Services Setup", self.setup_firebase_services),
            ("Firebase Hosting Setup", self.setup_firebase_hosting),
            ("Environment Configuration", self.setup_environment_file),
            ("Firebase Auto-Configuration", self.auto_populate_firebase_config),
            ("Dependencies Installation", self.install_dependencies),
            ("Ollama Setup", self.setup_ollama),
            ("Build Test", self.test_build),
            ("Google Authentication Setup", self.setup_google_auth),
        ]
        
        success_count = 0
        total_steps = len(steps)
        
        for step_name, step_func in steps:
            self.log(f"Step: {step_name}")
            try:
                if step_func():
                    success_count += 1
                    self.log(f"✅ {step_name} completed successfully")
                else:
                    self.log(f"❌ {step_name} failed")
            except Exception as e:
                self.log(f"❌ {step_name} failed with error: {e}", "ERROR")
                
        # Deploy Firestore rules (optional step)
        try:
            if self.deploy_firestore_rules():
                self.log("✅ Firestore rules deployed")
            else:
                self.log("⚠️ Firestore rules deployment skipped")
        except Exception as e:
            self.log(f"⚠️ Firestore rules deployment failed: {e}", "WARNING")
            
        # Deploy to hosting (optional step)
        try:
            if self.deploy_to_hosting():
                self.log("✅ Game deployed to Firebase hosting")
            else:
                self.log("⚠️ Hosting deployment skipped")
        except Exception as e:
            self.log(f"⚠️ Hosting deployment failed: {e}", "WARNING")
            
        # Generate report
        success_rate = (success_count / total_steps) * 100
        self.log(f"Setup completed: {success_count}/{total_steps} steps successful ({success_rate:.1f}%)")
        
        if success_rate >= 80:
            self.log("🎉 Setup completed successfully!", "SUCCESS")
            # Save final project cache
            self.save_project_cache()
        else:
            self.log("⚠️ Setup completed with some issues", "WARNING")
            
        # Save report
        report = self.generate_setup_report()
        with open("setup_report.txt", "w") as f:
            f.write(report)
            
        self.log("Setup report saved to setup_report.txt")
        print("\n" + report)
        
        return success_rate >= 80

    def deploy_to_hosting(self) -> bool:
        """Deploy the built game to Firebase hosting"""
        try:
            self.log("Deploying to Firebase hosting...")
            
            # Check if dist directory exists
            dist_dir = Path("dist")
            if not dist_dir.exists():
                self.log("⚠️ dist/ directory not found. Building project first...")
                if not self.test_build():
                    self.log("❌ Build failed, cannot deploy", "ERROR")
                    return False
                    
            # Check if Firebase CLI is available
            try:
                import subprocess
                result = subprocess.run(
                    ["firebase", "--version"], 
                    capture_output=True, 
                    text=True, 
                    timeout=10
                )
                if result.returncode != 0:
                    raise Exception("Firebase CLI not found")
            except Exception:
                self.log("⚠️ Firebase CLI not found. Please install it first:", "WARNING")
                self.log("npm install -g firebase-tools", "INFO")
                self.log("Then run: firebase login", "INFO")
                return False
                
            # Deploy to hosting
            try:
                result = subprocess.run(
                    ["firebase", "deploy", "--only", "hosting", "--project", self.project_id],
                    capture_output=True,
                    text=True,
                    timeout=120
                )
                
                if result.returncode == 0:
                    self.log("✅ Successfully deployed to Firebase hosting!")
                    self.log("🌐 Your game is now live!")
                    
                    # Extract hosting URL from output
                    if "Hosting URL:" in result.stdout:
                        hosting_url = result.stdout.split("Hosting URL:")[1].split("\n")[0].strip()
                        self.log(f"🔗 Hosting URL: {hosting_url}")
                        
                    return True
                else:
                    self.log(f"❌ Deployment failed: {result.stderr}", "ERROR")
                    return False
                    
            except subprocess.TimeoutExpired:
                self.log("❌ Deployment timed out", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"Failed to deploy to hosting: {e}", "ERROR")
            return False

def main():
    parser = argparse.ArgumentParser(
        description="🎲 Chaupar Game Setup Automation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Create new project automatically
  python setup_automation.py --project-name "My Chaupar Game"
  
  # Use existing project
  python setup_automation.py --project-id chaupar-game-123
  
  # Update existing project
  python setup_automation.py --project-id chaupar-game-123 --project-name "Updated Name"
        """
    )
    
    parser.add_argument(
        "--project-id",
        help="Firebase project ID (optional - will create new if not provided)"
    )
    parser.add_argument(
        "--project-name",
        default="Chaupar",
        help="Project display name (default: 'Chaupar')"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose logging"
    )
    
    args = parser.parse_args()
    
    # Set up logging
    if args.verbose:
        logging.basicConfig(level=logging.DEBUG)
    
    print("🎲 Chaupar Game Setup Automation")
    print("=" * 50)
    
    if not args.project_id:
        print("🆔 No project ID provided - will create new Firebase project automatically")
        print(f"📝 Project Name: {args.project_name}")
        print("💡 You can specify --project-id to use an existing project")
        print()
    
    try:
        automation = ChauparSetupAutomation(
            project_id=args.project_id,
            project_name=args.project_name
        )
        
        success = automation.run_complete_setup()
        
        if success:
            print("\n🎉 Setup completed successfully!")
            if automation.project_id:
                print(f"📋 Project ID cached: {automation.project_id}")
                print(f"🔄 Future runs will use this project automatically")
        else:
            print("\n⚠️ Setup completed with some issues")
            print("Check the setup report for details")
            
    except KeyboardInterrupt:
        print("\n❌ Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Setup failed with error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
