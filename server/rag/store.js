import fs from "fs";
import { getEmbedding } from "./embed.js";

const docs = JSON.parse(fs.readFileSync("./data/docs.json"));
let db = [];

export async function buildDB() {
  if (db.length) return;
  for (let doc of docs) {
    const emb = await getEmbedding(doc.text);
    db.push({ ...doc, embedding: emb });
  }
}

export function getDB() {
  return db;
}