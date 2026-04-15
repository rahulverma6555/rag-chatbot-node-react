import { BaseProvider } from "./BaseProvider.js";

export class HuggingFaceProvider extends BaseProvider {
  constructor() {
    super({
      name: "Hugging Face Llama-3-8B",
      id: "huggingface"
    });
    this.chatModel = "meta-llama/Meta-Llama-3-8B-Instruct";
    this.embeddingModel = "sentence-transformers/all-MiniLM-L6-v2";
    this.apiEndpoint = "https://router.huggingface.co/hf-inference/models/meta-llama/Meta-Llama-3-8B-Instruct";
  }

  async initialize() {
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error("Hugging Face API key not configured");
    }
    // No test call - API key presence is enough
    // Runtime errors will be handled gracefully
  }

  async getEmbedding(text) {
    try {
      await this.initialize();
      
      // Use direct API call for embeddings
      const embeddingEndpoint = `https://router.huggingface.co/hf-inference/models/${this.embeddingModel}`;
      const response = await fetch(embeddingEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: text
        })
      });
      
      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.statusText}`);
      }
      
      const result = await response.json();
      return Array.isArray(result) ? result : Object.values(result);
    } catch (error) {
      console.error(`Hugging Face embedding failed:`, error.message);
      // Fallback to hash-based embedding (completely independent)
      return this.generateHashEmbedding(text);
    }
  }

  async getChatCompletion(messages) {
    try {
      await this.initialize();
      
      // Get the user message from the conversation
      const userMessage = messages.find(msg => msg.role === 'user')?.content || '';
      
      // Use text-generation format (simpler and more reliable)
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: userMessage,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false
          }
        })
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Chat API error: ${response.statusText} - ${errorBody}`);
      }
      
      const result = await response.json();
      return result[0]?.generated_text || result.generated_text || "No response generated";
    } catch (error) {
      console.error(`Hugging Face chat failed:`, error.message);
      // Fallback to demo response (completely independent)
      const userMessage = messages.find(msg => msg.role === 'user')?.content || '';
      return this.generateDemoResponse(userMessage);
    }
  }
}
