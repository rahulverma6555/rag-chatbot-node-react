import OpenAI from "openai";
import { HfInference } from "@huggingface/inference";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Model configuration
export const MODELS = {
  openai: {
    name: "OpenAI GPT-4o-mini",
    provider: "openai",
    chatModel: "gpt-4o-mini",
    embeddingModel: "text-embedding-3-small",
    requiresKey: true,
    keyEnv: "OPENAI_API_KEY"
  },
  huggingface: {
    name: "Hugging Face Llama-3-8B",
    provider: "huggingface",
    chatModel: "meta-llama/Meta-Llama-3-8B-Instruct",
    embeddingModel: "sentence-transformers/all-MiniLM-L6-v2",
    requiresKey: true,
    keyEnv: "HUGGINGFACE_API_KEY"
  },
  gemini: {
    name: "Google Gemini 1.5 Flash",
    provider: "gemini",
    chatModel: "gemini-1.5-flash",
    embeddingModel: null, // Gemini doesn't support embeddings
    requiresKey: true,
    keyEnv: "GOOGLE_API_KEY"
  },
  demo: {
    name: "Demo Mode (No API Key Required)",
    provider: "demo",
    chatModel: "demo",
    embeddingModel: "demo",
    requiresKey: false,
    keyEnv: null
  }
};

// Client instances
let openaiClient = null;
let hfClient = null;
let geminiClient = null;

// Initialize clients
function getOpenAIClient() {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

function getHFClient() {
  if (!hfClient && process.env.HUGGINGFACE_API_KEY) {
    hfClient = new HfInference(process.env.HUGGINGFACE_API_KEY);
  }
  return hfClient;
}

function getGeminiClient() {
  if (!geminiClient && process.env.GOOGLE_API_KEY) {
    geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }
  return geminiClient;
}

// Embedding functions
export async function getEmbedding(text, provider = "openai") {
  switch (provider) {
    case "openai":
      const openai = getOpenAIClient();
      if (!openai) throw new Error("OpenAI API key not configured");
      const res = await openai.embeddings.create({
        model: MODELS.openai.embeddingModel,
        input: text
      });
      return res.data[0].embedding;

    case "huggingface":
      try {
        const hf = getHFClient();
        if (!hf) throw new Error("Hugging Face API key not configured");
        const hfRes = await hf.featureExtraction({
          model: MODELS.huggingface.embeddingModel,
          inputs: text
        });
        return Array.isArray(hfRes) ? hfRes : Object.values(hfRes);
      } catch (error) {
        // Fallback to hash-based embedding if Hugging Face fails
        console.warn("Hugging Face embedding failed, using hash-based fallback:", error.message);
        const hfEmbedding = new Array(384).fill(0);
        let hfHash = 0;
        for (let i = 0; i < text.length; i++) {
          hfHash = ((hfHash << 5) - hfHash) + text.charCodeAt(i);
          hfHash = hfHash & hfHash;
        }
        for (let i = 0; i < 384; i++) {
          hfEmbedding[i] = Math.cos(hfHash * (i + 1)) * 0.1;
        }
        return hfEmbedding;
      }

    case "gemini":
      // Gemini doesn't support embeddings, use hash-based embedding
      const geminiEmbedding = new Array(384).fill(0);
      let geminiHash = 0;
      for (let i = 0; i < text.length; i++) {
        geminiHash = ((geminiHash << 5) - geminiHash) + text.charCodeAt(i);
        geminiHash = geminiHash & geminiHash;
      }
      for (let i = 0; i < 384; i++) {
        geminiEmbedding[i] = Math.sin(geminiHash * (i + 1)) * 0.1;
      }
      return geminiEmbedding;

    case "demo":
      // Return a simple mock embedding for demo mode
      // Generate a consistent 384-dimensional vector based on text hash
      const embedding = new Array(384).fill(0);
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash = hash & hash;
      }
      for (let i = 0; i < 384; i++) {
        embedding[i] = Math.sin(hash * (i + 1)) * 0.1;
      }
      return embedding;

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

// Chat completion functions
export async function getChatCompletion(messages, provider = "openai") {
  switch (provider) {
    case "openai":
      const openai = getOpenAIClient();
      if (!openai) throw new Error("OpenAI API key not configured");
      const completion = await openai.chat.completions.create({
        model: MODELS.openai.chatModel,
        messages
      });
      return completion.choices[0].message.content;

    case "huggingface":
      const hf = getHFClient();
      if (!hf) throw new Error("Hugging Face API key not configured");
      
      // Format messages for Hugging Face
      const formattedMessages = messages.map(msg => 
        `${msg.role === 'system' ? 'System' : msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`
      ).join('\n');
      
      const hfRes = await hf.textGeneration({
        model: MODELS.huggingface.chatModel,
        inputs: formattedMessages,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          do_sample: true
        }
      });
      return hfRes.generated_text.replace(formattedMessages, '').trim();

    case "gemini":
      const gemini = getGeminiClient();
      if (!gemini) throw new Error("Google API key not configured");
      
      // Convert OpenAI format to Gemini format
      const geminiMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      
      const model = gemini.getGenerativeModel({ model: MODELS.gemini.chatModel });
      const chat = model.startChat({
        history: geminiMessages.slice(0, -1)
      });
      
      const result = await chat.sendMessage(geminiMessages[geminiMessages.length - 1].parts[0].text);
      return result.response.text();

    case "demo":
      // Return a simple demo response
      const userMessage = messages.find(msg => msg.role === 'user')?.content || '';
      const demoResponses = [
        "This is a demo response. The app is working, but you need to configure API keys to get real AI responses.",
        "Demo mode active! Add your OpenAI, Hugging Face, or Google API keys to use actual AI models.",
        "This is a mock response. Configure API keys in your .env file to enable real AI functionality.",
        "Demo response: The RAG system is functioning, but requires API keys for actual AI responses."
      ];
      
      // Simple keyword-based responses
      if (userMessage.toLowerCase().includes('node')) {
        return "Demo: Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine.";
      } else if (userMessage.toLowerCase().includes('react')) {
        return "Demo: React is a JavaScript library for building user interfaces.";
      } else if (userMessage.toLowerCase().includes('rag')) {
        return "Demo: RAG (Retrieval-Augmented Generation) combines retrieval systems with language models.";
      } else {
        return demoResponses[Math.floor(Math.random() * demoResponses.length)];
      }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

// Check if provider is available
export function isProviderAvailable(provider) {
  switch (provider) {
    case "openai":
      return !!process.env.OPENAI_API_KEY;
    case "huggingface":
      return !!process.env.HUGGINGFACE_API_KEY;
    case "gemini":
      return !!process.env.GOOGLE_API_KEY;
    case "demo":
      return true; // Demo mode is always available
    default:
      return false;
  }
}

// Get available providers
export function getAvailableProviders() {
  const available = Object.keys(MODELS).filter(provider => isProviderAvailable(provider));
  
  // Add demo mode if no providers are available
  if (available.length === 0) {
    return ['demo'];
  }
  
  return available;
}
