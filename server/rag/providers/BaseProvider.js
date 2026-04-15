export class BaseProvider {
  constructor(config) {
    this.config = config;
    this.name = config.name;
    this.id = config.id;
    this.isAvailable = false;
    this.error = null;
  }

  async initialize() {
    throw new Error('initialize() must be implemented by subclass');
  }

  async getEmbedding(text) {
    throw new Error('getEmbedding() must be implemented by subclass');
  }

  async getChatCompletion(messages) {
    throw new Error('getChatCompletion() must be implemented by subclass');
  }

  async healthCheck() {
    try {
      // Debug logging for API keys - show actual values (masked)
      console.log("=== API Key Debug ===");
      console.log("OpenAI:", process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 8)}...` : "Not found");
      console.log("Hugging Face:", process.env.HUGGINGFACE_API_KEY ? `${process.env.HUGGINGFACE_API_KEY.substring(0, 8)}...` : "Not found");
      console.log("Gemini:", process.env.GOOGLE_API_KEY ? `${process.env.GOOGLE_API_KEY.substring(0, 8)}...` : "Not found");
      console.log("==================");
      
      // For demo mode, always available
      if (this.id === 'demo') {
        this.isAvailable = true;
        this.error = null;
        return true;
      }
      
      // For other providers, only check if API key exists
      // Don't make test API calls - they can fail for many reasons (model loading, rate limits, etc.)
      // The actual API call will be tested when the user sends a message
      if (this.id === 'openai' && !process.env.OPENAI_API_KEY) {
        this.isAvailable = false;
        this.error = "OpenAI API key not configured";
        return false;
      }
      if (this.id === 'huggingface' && !process.env.HUGGINGFACE_API_KEY) {
        this.isAvailable = false;
        this.error = "Hugging Face API key not configured";
        return false;
      }
      if (this.id === 'gemini' && !process.env.GOOGLE_API_KEY) {
        this.isAvailable = false;
        this.error = "Gemini API key not configured";
        return false;
      }
      
      // API key exists - mark as available
      // Runtime errors will be handled gracefully in each provider
      this.isAvailable = true;
      this.error = null;
      return true;
    } catch (error) {
      this.isAvailable = false;
      this.error = error.message;
      return false;
    }
  }

  // Hash-based embedding fallback (completely independent)
  generateHashEmbedding(text, dimensions = 384) {
    const embedding = new Array(dimensions).fill(0);
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash & hash;
    }
    for (let i = 0; i < dimensions; i++) {
      embedding[i] = Math.sin(hash * (i + 1)) * 0.1;
    }
    return embedding;
  }

  // Demo response fallback
  generateDemoResponse(userMessage) {
    const responses = [
      `Demo response from ${this.name}: This is a mock response for testing purposes.`,
      `${this.name} demo: The system is working, but this is a simulated response.`,
      `Demo mode (${this.name}): Configure API keys for real AI responses.`
    ];

    // Simple keyword-based responses
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('node')) {
      return `Demo (${this.name}): Node.js is a JavaScript runtime built on Chrome's V8 engine.`;
    } else if (lowerMessage.includes('react')) {
      return `Demo (${this.name}): React is a JavaScript library for building user interfaces.`;
    } else if (lowerMessage.includes('rag')) {
      return `Demo (${this.name}): RAG combines retrieval systems with language models.`;
    } else {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
}
