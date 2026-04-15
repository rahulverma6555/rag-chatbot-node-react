import { BaseProvider } from "./BaseProvider.js";

export class DemoProvider extends BaseProvider {
  constructor() {
    super({
      name: "Demo Mode (No API Key Required)",
      id: "demo"
    });
    // Demo provider is always available
    this.isAvailable = true;
  }

  async initialize() {
    // Demo provider doesn't need initialization
    return true;
  }

  async getEmbedding(text) {
    // Always use hash-based embedding for demo
    console.log(`Demo: Using hash-based embedding for: "${text.substring(0, 50)}..."`);
    return this.generateHashEmbedding(text);
  }

  async getChatCompletion(messages) {
    // Always use demo responses
    const userMessage = messages.find(msg => msg.role === 'user')?.content || '';
    const contextMessage = messages.find(msg => msg.role === 'system')?.content || '';
    
    // Generate more varied responses based on context and user input
    return this.generateContextualDemoResponse(userMessage, contextMessage);
  }

  generateContextualDemoResponse(userMessage, contextMessage) {
    const lowerMessage = userMessage.toLowerCase();
    const responses = [];
    
    // Context-aware responses
    if (contextMessage.includes('Answer only from context')) {
      responses.push(`Based on the provided context, here's what I can tell you about "${userMessage}": This is a demo response demonstrating RAG functionality.`);
      responses.push(`From the context documents, regarding "${userMessage}": This is a simulated response showing how the system retrieves and uses relevant information.`);
      responses.push(`According to the context sources about "${userMessage}": This demonstrates the retrieval-augmented generation approach with mock data.`);
    }
    
    // Topic-specific responses
    if (lowerMessage.includes('node') || lowerMessage.includes('nodejs')) {
      responses.push(`Node.js is a JavaScript runtime that enables server-side JavaScript development. It uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.`);
      responses.push(`Node.js allows developers to use JavaScript on the server, creating scalable network applications. It's built on Chrome's V8 JavaScript engine.`);
    }
    if (lowerMessage.includes('react')) {
      responses.push(`React is a JavaScript library for building user interfaces. It uses a component-based architecture and virtual DOM for efficient updates.`);
      responses.push(`React enables developers to create reusable UI components and manage application state efficiently. It's maintained by Facebook.`);
    }
    if (lowerMessage.includes('rag') || lowerMessage.includes('retrieval')) {
      responses.push(`RAG (Retrieval-Augmented Generation) combines information retrieval with language models to provide accurate, context-aware responses.`);
      responses.push(`Retrieval-Augmented Generation enhances AI responses by retrieving relevant documents and using them as context for generating answers.`);
    }
    if (lowerMessage.includes('api')) {
      responses.push(`APIs (Application Programming Interfaces) allow different software systems to communicate with each other using defined protocols and data formats.`);
      responses.push(`RESTful APIs use HTTP methods to perform CRUD operations, enabling standardized communication between clients and servers.`);
    }
    if (lowerMessage.includes('database')) {
      responses.push(`Databases store and manage data efficiently. They can be relational (like PostgreSQL) or NoSQL (like MongoDB), each suited for different use cases.`);
      responses.push(`Modern applications use various database types including SQL databases for structured data and NoSQL databases for flexible document storage.`);
    }
    
    // General varied responses
    responses.push(`This is a demo response from ${this.name}. The system is working correctly - configure API keys for real AI responses.`);
    responses.push(`Demo mode active: This shows how the chat interface functions. Add your OpenAI, Hugging Face, or Google API keys for actual AI responses.`);
    responses.push(`This is a simulated response demonstrating the chat functionality. The RAG system retrieves relevant documents and generates context-aware answers.`);
    responses.push(`In demo mode, I provide mock responses to show the interface. With real API keys, you'd get actual AI-generated answers based on retrieved context.`);
    responses.push(`Demo response: The system successfully processed your message "${userMessage}" and retrieved relevant context for generating this response.`);
    
    // Return a random response from the available options
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async healthCheck() {
    // Demo provider is always healthy
    this.isAvailable = true;
    this.error = null;
    return true;
  }
}
