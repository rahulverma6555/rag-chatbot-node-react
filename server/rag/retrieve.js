import { getEmbedding } from "./embed.js";
import { getDB } from "./store.js";

function cosine(a, b) {
  const dot = a.reduce((s, v, i) => s + v*b[i], 0);
  const ma = Math.sqrt(a.reduce((s, v) => s + v*v, 0));
  const mb = Math.sqrt(b.reduce((s, v) => s + v*v, 0));
  return dot/(ma*mb);
}

export async function retrieve(query) {
  const q = await getEmbedding(query);
  const db = getDB();

  return db.map(d => ({
    ...d,
    score: cosine(q, d.embedding)
  })).sort((a,b)=>b.score-a.score).slice(0,3);
}