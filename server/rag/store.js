import fs from "fs";
import { getEmbedding } from "./embed.js";

const docs = JSON.parse(fs.readFileSync("./data/docs.json"));
let db = [];
let currentProvider = "openai";

export async function buildDB(providerId = "openai") {
  if (db.length && currentProvider === providerId) return;
  
  // Clear DB if switching providers
  if (currentProvider !== providerId) {
    db = [];
    currentProvider = providerId;
  }
  
  console.log(`Building database with provider: ${providerId}`);
  
  for (let doc of docs) {
    try {
      const emb = await getEmbedding(doc.text, providerId);
      db.push({ ...doc, embedding: emb });
    } catch (error) {
      console.error(`Failed to embed document ${doc.id} with ${providerId}:`, error.message);
      // Continue with other documents
    }
  }
  
  console.log(`Database built with ${db.length} documents for provider: ${providerId}`);
}

export function getDB() {
  return db;
}

export function getCurrentProvider() {
  return currentProvider;
}