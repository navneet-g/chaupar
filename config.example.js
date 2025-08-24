// Configuration Example for Chaupar Game AI
// Copy this file to config.js and update with your settings

export const config = {
  // AI Configuration
  ai: {
    // Ollama Configuration (Local AI)
    ollama: {
      url: 'http://localhost:11434',
      model: 'qwen2.5:latest',
      timeout: 30000
    },
    
    // OpenAI Configuration (Cloud AI)
    openai: {
      apiKey: 'your_openai_api_key_here',
      model: 'gpt-4',
      timeout: 30000
    },
    
    // Default AI Settings
    default: {
      provider: 'ollama',
      count: 3,
      skillLevel: 'intermediate'
    }
  },
  
  // Game Configuration
  game: {
    maxPlayers: 4,
    boardSize: 68,
    safeSquares: [8, 15, 22, 29, 36, 43, 50, 57, 64],
    aiThinkingDelay: {
      min: 1000,
      max: 2000
    }
  },
  
  // Firebase Configuration (if using multiplayer)
  firebase: {
    apiKey: 'your_firebase_api_key',
    authDomain: 'your_project.firebaseapp.com',
    projectId: 'your_project_id',
    storageBucket: 'your_project.appspot.com',
    messagingSenderId: 'your_sender_id',
    appId: 'your_app_id'
  }
};

export default config;
