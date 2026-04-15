import { providerFactory } from "./providers/ProviderFactory.js";

export async function getEmbedding(text, providerId = "openai") {
  await providerFactory.initialize();
  const provider = providerFactory.getProvider(providerId);
  return await provider.getEmbedding(text);
}