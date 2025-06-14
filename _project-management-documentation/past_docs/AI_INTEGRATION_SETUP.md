# 🤖 AI Integration Setup Guide

## Overview

The PipeCD AI Agent is now integrated with **Claude 3.5 Sonnet** for intelligent responses, autonomous planning, and task assistance. This guide shows you how to enable and test the AI features.

## ✅ Current Status

- **Phase 1**: Database ✅ Complete
- **Phase 2**: GraphQL API ✅ Complete  
- **Phase 3**: Frontend Components ✅ Complete
- **Phase 4**: AI Integration ✅ **NEWLY IMPLEMENTED**

## 🔧 Setup Instructions

### 1. Get Anthropic API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Create a new API key
5. Copy the key (starts with `sk-ant-...`)

### 2. Configure Environment

Add your API key to your environment variables:

```bash
# For local development (.env file)
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here

# For Netlify deployment
# Add ANTHROPIC_API_KEY to your Netlify environment variables
```

### 3. Restart Development Server

```bash
# Restart netlify dev to pick up the new environment variable
netlify dev
```

## 🧪 Testing the AI Features

### **Without API Key (Fallback Mode)**
- AI agent will run in placeholder mode
- Shows helpful message about missing API key
- Basic conversation management still works

### **With API Key (Full AI Mode)**
- Real Claude 3.5 Sonnet responses
- Intelligent conversation understanding
- Contextual PipeCD assistance
- Thinking process visualization
- Tool suggestion capabilities

## 🎯 What the AI Can Do

### **Current Capabilities**
- **Intelligent Responses**: Real conversational AI powered by Claude
- **PipeCD Context**: Understands deals, contacts, activities, workflows
- **Thinking Process**: Shows reasoning steps behind responses
- **Tool Awareness**: Knows about available MCP tools
- **Error Handling**: Graceful fallbacks if AI service fails

### **Example Interactions**
```
👤 User: "Help me organize my deals for this quarter"

🤖 AI: I'll help you organize your deals for this quarter. Let me think about the best approach:

<thinking>
The user wants to organize deals for the current quarter. I should:
1. Understand what organization means (by status, priority, value)
2. Suggest filtering and sorting approaches
3. Recommend action items for deal progression
</thinking>

I can help you organize your quarterly deals! Here are some strategies:

1. **By Deal Stage**: Group deals by pipeline stage to see progress
2. **By Value**: Prioritize high-value opportunities
3. **By Close Date**: Focus on deals closing this quarter
4. **By Activity**: Identify deals needing follow-up

Would you like me to help you with any specific aspect of deal organization?
```

## 🔍 Architecture Details

### **AI Service (`lib/aiAgent/aiService.ts`)**
- Claude API integration
- Response parsing and structuring
- Error handling and fallbacks
- Configurable model parameters

### **Agent Service (`lib/aiAgent/agentService.ts`)**
- Manages conversation state
- Integrates AI service with database
- Handles thoughts and tool interactions
- Provides fallback for missing API key

### **Frontend Integration**
- Real-time AI responses in chat interface
- Thinking process visualization (when enabled)
- Smooth error handling and loading states

## ⚙️ Configuration Options

The AI service supports these configuration options:

```typescript
{
  model: 'claude-sonnet-4-20250514',  // Claude model version
  maxTokens: 4096,                      // Maximum response length
  temperature: 0.7,                     // Response creativity (0-1)
}
```

## 🔐 Security Notes

- **API Key Protection**: Never commit API keys to version control
- **Environment Variables**: Use proper environment variable management
- **Rate Limits**: Claude API has usage limits - monitor your usage
- **Cost Management**: Each request costs money - implement usage controls as needed

## 🚀 Next Steps

With AI integration complete, you can now:

1. **Test real conversations** with intelligent responses
2. **Enable thinking process** to see AI reasoning
3. **Explore tool integration** for automated actions
4. **Customize system prompts** for specific use cases
5. **Implement conversation history** features
6. **Add agent settings** panel for user customization

## 📊 Cost Estimates

Approximate costs with Claude 3.5 Sonnet:
- **Input**: ~$3 per million tokens
- **Output**: ~$15 per million tokens
- **Typical conversation**: ~500-2000 tokens per exchange
- **Monthly cost**: Varies by usage (typically $10-50 for moderate use)

Monitor your usage in the Anthropic Console to track costs.

---

🎉 **The AI Agent is now fully functional and ready for intelligent assistance!** 