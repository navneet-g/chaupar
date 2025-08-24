# 🤖 AI Setup Guide for Chaupar Game

## Overview

The Chaupar game now supports playing against multiple AI opponents using either:
- **Ollama** (Local Qwen2.5 model) - Recommended for privacy and cost
- **OpenAI API** (GPT-4) - For cloud-based AI with advanced reasoning

## 🚀 Quick Start

### Option 1: Ollama (Local AI) - Recommended

1. **Install Ollama**
   ```bash
   # macOS/Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Windows
   # Download from https://ollama.ai/download
   ```

2. **Pull Qwen2.5 Model**
   ```bash
   ollama pull qwen2.5:latest
   ```

3. **Start Ollama Service**
   ```bash
   ollama serve
   ```

4. **Test Connection**
   ```bash
   curl http://localhost:11434/api/tags
   ```

5. **Configure Game**
   - Set AI Provider to "Ollama (Local Qwen2.5)"
   - Choose number of AI players (default: 3)
   - Select skill level

### Option 2: OpenAI API

1. **Get OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Create account and get API key
   - Add billing information

2. **Configure Environment**
   ```bash
   # Create .env.local file
   VITE_OPENAI_API_KEY=your_api_key_here
   VITE_AI_PROVIDER=openai
   ```

3. **Configure Game**
   - Set AI Provider to "OpenAI GPT-4"
   - Choose number of AI players
   - Select skill level

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Ollama Configuration
VITE_OLLAMA_URL=http://localhost:11434
VITE_AI_PROVIDER=ollama

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_api_key_here

# Game Defaults
VITE_DEFAULT_AI_COUNT=3
VITE_DEFAULT_AI_SKILL=intermediate
```

### AI Provider Settings

| Provider | Pros | Cons | Cost |
|----------|------|------|------|
| Ollama | Free, Private, Fast | Requires local setup | $0 |
| OpenAI | No setup, Advanced | API costs, Privacy concerns | $0.03/1K tokens |

## 🎮 Game Modes

### Default Mode: 3 AI Opponents
- **Player 1**: You (Human)
- **Player 2**: AI 1 (Qwen2.5/GPT-4)
- **Player 3**: AI 2 (Qwen2.5/GPT-4)
- **Player 4**: AI 3 (Qwen2.5/GPT-4)

### AI Skill Levels

1. **Basic**
   - Random moves with some logic
   - Temperature: 0.8 (more random)
   - Good for beginners

2. **Intermediate**
   - Strategic thinking
   - Temperature: 0.5 (balanced)
   - Challenging gameplay

3. **Advanced**
   - Deep strategic analysis
   - Temperature: 0.2 (deterministic)
   - Expert-level challenge

## 🔧 Advanced Configuration

### Custom Ollama Models

You can use other models with Ollama:

```bash
# Pull different models
ollama pull llama3.1:8b
ollama pull mistral:7b
ollama pull codellama:7b

# Update config.js
model: 'llama3.1:8b'
```

### Custom OpenAI Models

```javascript
// In aiService.js
model: 'gpt-3.5-turbo' // Faster, cheaper
model: 'gpt-4-turbo'   // Better reasoning
```

### AI Thinking Delays

Customize AI response timing:

```javascript
// In config.js
aiThinkingDelay: {
  min: 500,    // Minimum delay (ms)
  max: 3000    // Maximum delay (ms)
}
```

## 🐛 Troubleshooting

### Ollama Issues

1. **Connection Failed**
   ```bash
   # Check if Ollama is running
   ps aux | grep ollama
   
   # Restart Ollama
   ollama serve
   ```

2. **Model Not Found**
   ```bash
   # List available models
   ollama list
   
   # Pull missing model
   ollama pull qwen2.5:latest
   ```

3. **Port Already in Use**
   ```bash
   # Change port in config
   VITE_OLLAMA_URL=http://localhost:11435
   ```

### OpenAI Issues

1. **API Key Invalid**
   - Check API key in OpenAI dashboard
   - Verify billing status
   - Check rate limits

2. **Rate Limiting**
   - Reduce concurrent requests
   - Implement exponential backoff
   - Check usage quotas

### General AI Issues

1. **Slow Responses**
   - Reduce model complexity
   - Optimize prompts
   - Check network latency

2. **Poor Move Quality**
   - Adjust temperature settings
   - Improve prompt engineering
   - Use fallback logic

## 📊 Performance Monitoring

### Ollama Performance
```bash
# Monitor resource usage
htop
nvidia-smi  # If using GPU

# Check model performance
ollama run qwen2.5:latest "Test response time"
```

### OpenAI Performance
- Monitor API usage in dashboard
- Track response times
- Analyze cost per game

## 🔒 Security & Privacy

### Ollama (Local)
- ✅ No data leaves your machine
- ✅ No API costs
- ✅ Full control over models
- ⚠️ Requires local resources

### OpenAI (Cloud)
- ⚠️ Data sent to OpenAI servers
- ⚠️ API costs per request
- ✅ No local resource usage
- ⚠️ Internet dependency

## 🚀 Deployment

### Local Development
```bash
npm run dev
# AI works with local Ollama
```

### Production Deployment
```bash
# Build for production
npm run build

# Deploy with environment variables
VITE_AI_PROVIDER=openai
VITE_OPENAI_API_KEY=prod_key_here
```

## 📚 Additional Resources

- [Ollama Documentation](https://ollama.ai/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Qwen2.5 Model Info](https://huggingface.co/Qwen/Qwen2.5-7B)
- [Chaupar Game Rules](https://en.wikipedia.org/wiki/Chaupar)

---

**Enjoy playing against intelligent AI opponents in Chaupar! 🎲🤖**
