import { QdrantVectorStore } from "@langchain/qdrant";

const client = new QdrantClient({
  url: "https://003a05d5-8e9b-4429-b705-117ec7471821.us-east4-0.gcp.cloud.qdrant.io:6333",
  apiKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.w30_lX-XLmznD4O7IbgJtL9uLx36z2yAIUtmlzYoTmE",
});

try {
  const result = await client.getCollections();
  console.log("List of collections:", result.collections);
} catch (err) {
  console.error("Could not get collections:", err);
}
