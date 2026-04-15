import express from "express";
import { retrieve } from "../rag/retrieve.js";
import { buildDB, getCurrentProvider } from "../rag/store.js";
import { providerFactory } from "../rag/providers/ProviderFactory.js";

const router = express.Router();

let factoryInitialized = false;
let dbBuilt = false;

async function ensureFactoryInitialized() {
  if (!factoryInitialized) {
    await providerFactory.initialize();
    factoryInitialized = true;
  }
}

async function ensureDB(providerId = "openai") {
  if (!dbBuilt || getCurrentProvider() !== providerId) {
    await buildDB(providerId);
    dbBuilt = true;
  }
}

// Get available models endpoint
router.get("/models", async (req, res) => {
  try {
    await ensureFactoryInitialized();
    
    const availableProviders = providerFactory.getAvailableProviders();
    
    if (availableProviders.length === 0) {
      return res.status(200).json({ 
        models: [],
        message: "No providers available. Demo mode will be used.",
        allProviders: providerFactory.getAllProviders()
      });
    }
    
    res.json({ models: availableProviders });
  } catch (error) {
    console.error("Failed to fetch models:", error);
    res.status(500).json({ 
      error: "Failed to fetch models", 
      details: error.message 
    });
  }
});

// Test all providers endpoint
router.get("/test", async (req, res) => {
  try {
    await ensureFactoryInitialized();
    
    const results = await providerFactory.testAllProviders();
    res.json({ results });
  } catch (error) {
    console.error("Failed to test providers:", error);
    res.status(500).json({ 
      error: "Failed to test providers", 
      details: error.message 
    });
  }
});

router.post("/", async (req, res) => {
  try {
    await ensureFactoryInitialized();
    
    const { message, provider: providerId = "demo" } = req.body;
    
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get provider
    const provider = providerFactory.getProvider(providerId);
    
    // Build database for this provider
    await ensureDB(providerId);
    
    // Retrieve relevant documents
    const docs = await retrieve(message);
    const context = docs.map(d => d.text).join("\n");

    const messages = [
      { role: "system", content: "Answer only from context." },
      { role: "user", content: `Context:\n${context}\n\nQ:${message}` }
    ];

    // Get chat completion from the specific provider
    const reply = await provider.getChatCompletion(messages);
    
    res.json({ 
      reply, 
      provider: provider.name,
      providerId: provider.id,
      contextUsed: docs.length
    });

  } catch (error) {
    console.error(`Chat error with provider:`, error);
    res.status(500).json({ 
      error: "Failed to process chat request", 
      details: error.message 
    });
  }
});

export default router;