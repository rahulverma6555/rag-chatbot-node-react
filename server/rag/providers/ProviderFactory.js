import { OpenAIProvider } from "./OpenAIProvider.js";
import { HuggingFaceProvider } from "./HuggingFaceProvider.js";
import { GeminiProvider } from "./GeminiProvider.js";
import { DemoProvider } from "./DemoProvider.js";

export class ProviderFactory {
  constructor() {
    this.providers = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Create provider instances
    const providerClasses = [
      OpenAIProvider,
      HuggingFaceProvider, 
      GeminiProvider,
      DemoProvider
    ];

    for (const ProviderClass of providerClasses) {
      const provider = new ProviderClass();
      await provider.healthCheck(); // Check availability without throwing
      this.providers.set(provider.id, provider);
    }

    this.initialized = true;
    console.log(`Initialized ${this.providers.size} providers`);
  }

  getProvider(id) {
    if (!this.initialized) {
      throw new Error("ProviderFactory not initialized. Call initialize() first.");
    }
    
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`Provider '${id}' not found. Available: ${Array.from(this.providers.keys()).join(', ')}`);
    }
    
    return provider;
  }

  getAvailableProviders() {
    if (!this.initialized) {
      throw new Error("ProviderFactory not initialized. Call initialize() first.");
    }

    // Show all providers, not just available ones
    return Array.from(this.providers.values())
      .map(provider => ({
        id: provider.id,
        name: provider.name,
        available: provider.isAvailable,
        error: provider.error
      }));
  }

  getAllProviders() {
    if (!this.initialized) {
      throw new Error("ProviderFactory not initialized. Call initialize() first.");
    }

    return Array.from(this.providers.values())
      .map(provider => ({
        id: provider.id,
        name: provider.name,
        available: provider.isAvailable,
        error: provider.error
      }));
  }

  async testProvider(id) {
    const provider = this.getProvider(id);
    const success = await provider.healthCheck();
    
    return {
      id: provider.id,
      name: provider.name,
      available: success,
      error: provider.error
    };
  }

  async testAllProviders() {
    const results = [];
    
    for (const [id, provider] of this.providers) {
      const result = await this.testProvider(id);
      results.push(result);
    }
    
    return results;
  }
}

// Singleton instance
export const providerFactory = new ProviderFactory();
