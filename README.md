# 🚀 Elite RAG Chatbot (Node.js + React)

## Features
- RAG (Retrieval-Augmented Generation)
- Multi-provider AI support (OpenAI, Hugging Face, Google Gemini)
- Clean architecture (client/server split)
- Modern chat UI with model selection
- Typing indicator and error handling
- Scalable backend
- Cost-effective with free model options
- Ready for deployment

## Tech Stack
- Node.js + Express
- React
- OpenAI API
- Hugging Face API
- Google Gemini API
- Vector similarity (cosine)

## Setup

### Backend
cd server
npm install
node index.js

### Frontend
cd client
npm install
npm install react-scripts
npm start

## Environment Setup

Create `.env` in server directory:

```bash
# OpenAI API Key (for GPT-4o-mini)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY="your_openai_key_here"

# Hugging Face API Key (for Llama-3-8B and other free models)
# Get from: https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY="your_huggingface_key_here"

# Google AI API Key (for Gemini models)
# Get from: https://makersuite.google.com/app/apikey
GOOGLE_API_KEY="your_google_key_here"
```

**Note:** You can use one or all of the above keys. The app will automatically detect which providers are available and show them in the dropdown.

## Cost Comparison

| Provider | Model | Cost (per 1M tokens) | Free Tier |
|----------|-------|-------------------|-----------|
| OpenAI | GPT-4o-mini | $0.15/$0.60 | Limited |
| Hugging Face | Llama-3-8B | Free | Yes |
| Google | Gemini 1.5 Flash | Free | Yes |

## Usage

1. Start the backend server
2. Start the frontend
3. Select your preferred AI model from the dropdown
4. Start chatting!

