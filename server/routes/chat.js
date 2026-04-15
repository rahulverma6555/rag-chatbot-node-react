import express from "express";
import OpenAI from "openai";
import { retrieve } from "../rag/retrieve.js";
import { buildDB } from "../rag/store.js";

const router = express.Router();

let client = null;
function getClient() {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

let dbBuilt = false;
async function ensureDB() {
  if (!dbBuilt) {
    await buildDB();
    dbBuilt = true;
  }
}

router.post("/", async (req, res) => {
  try {
    await ensureDB();
    const { message } = req.body;

    const docs = await retrieve(message);
    const context = docs.map(d => d.text).join("\n");

    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Answer only from context." },
        { role: "user", content: `Context:\n${context}\n\nQ:${message}` }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;