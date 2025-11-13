import { pipeline } from "@xenova/transformers";

// ✅ Create a custom LangChain-compatible embedding class
export class XenovaEmbeddings {
  constructor(modelName = "Xenova/all-MiniLM-L6-v2") {
    this.modelName = modelName;
  }

  async init() {
    this.pipeline = await pipeline("feature-extraction", this.modelName);
  }

  // LangChain expects this method
  async embedQuery(text) {
    const result = await this.pipeline(text, { pooling: "mean", normalize: true });
    return Array.from(result.data);
  }

  // LangChain sometimes calls this too
  async embedDocuments(texts) {
    const embeddings = [];
    for (const text of texts) {
      const result = await this.pipeline(text, { pooling: "mean", normalize: true });
      embeddings.push(Array.from(result.data));
    }
    return embeddings;
  }
}
