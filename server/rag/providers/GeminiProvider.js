import { GoogleGenerativeAI } from "@google/generative-ai";
import { BaseProvider } from "./BaseProvider.js";

export class GeminiProvider extends BaseProvider {
  constructor() {
    super({
      name: "Google Gemini",
      id: "gemini"
    });
    this.client = null;
    // Try these model names in order - first one that works will be used
    this.modelNames = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-flash-latest", "gemini-2.0-flash"];
    this.chatModel = null;
  }

  async initialize() {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("Gemini API key not configured");
    }
    
    if (!this.client) {
      this.client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    }
    // No test call - API key presence is enough
    // Runtime errors will be handled gracefully
  }

  async getEmbedding(text) {
    // Gemini doesn't support embeddings natively
    // Always use hash-based embedding (completely independent)
    console.log(`Gemini: Using hash-based embedding for: "${text.substring(0, 50)}..."`);
    return this.generateHashEmbedding(text);
  }

  async getChatCompletion(messages) {
    try {
      await this.initialize();
      
      const userMessage = messages.find(msg => msg.role === 'user')?.content || '';
      
      // Try each model name until one works
      let lastError = null;
      for (const modelName of this.modelNames) {
        try {
          const model = this.client.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(userMessage);
          const response = result.response.text();
          // If successful, remember this model name for future calls
          this.chatModel = modelName;
          console.log(`Gemini: Successfully used model: ${modelName}`);
          return response;
        } catch (err) {
          console.log(`Gemini: Model ${modelName} failed: ${err.message}`);
          lastError = err;
          continue;
        }
      }
      
      throw lastError || new Error("No Gemini model available");
    } catch (error) {
      console.error(`Gemini chat failed:`, error.message);
      const userMessage = messages.find(msg => msg.role === 'user')?.content || '';
      return this.generateDemoResponse(userMessage);
    }
  }
}
