import OpenAI from "openai";
import { BaseProvider } from "./BaseProvider.js";

export class OpenAIProvider extends BaseProvider {
  constructor() {
    super({
      name: "OpenAI GPT-4o-mini",
      id: "openai"
    });
    this.client = null;
    this.chatModel = "gpt-4o-mini";
    this.embeddingModel = "text-embedding-3-small";
  }

  async initialize() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }
    
    if (!this.client) {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    
    // Test connection with a simple request
    await this.client.models.list();
  }

  async getEmbedding(text) {
    try {
      await this.initialize();
      const response = await this.client.embeddings.create({
        model: this.embeddingModel,
        input: text
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error(`OpenAI embedding failed:`, error.message);
      // Fallback to hash-based embedding
      return this.generateHashEmbedding(text);
    }
  }

  async getChatCompletion(messages) {
    try {
      await this.initialize();
      const completion = await this.client.chat.completions.create({
        model: this.chatModel,
        messages
      });
      return completion.choices[0].message.content;
    } catch (error) {
      console.error(`OpenAI chat failed:`, error.message);
      // Fallback to demo response
      const userMessage = messages.find(msg => msg.role === 'user')?.content || '';
      return this.generateDemoResponse(userMessage);
    }
  }
}
