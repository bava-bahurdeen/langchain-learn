import { pipeline } from "@xenova/transformers";
import { pool } from "../db/dbconnection.js";
const embedder = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2"
);
const generateEmbeddings = async () => {
  try {
    const products = await pool.query(
      "SELECT id , product_name,price,stock,product_img,description FROM products"
    );

    for (const product of products.rows) {
      const inputText = `
        Product: ${product.name}
        Description: ${product.description}
        Category ID: ${product.category_id}
        Price: ${product.price}
        Stock: ${product.stock}
      `;

      const result = await embedder(inputText, {
        pooling: "mean",
        normalize: true,
      });
      const embedding = Array.from(result.data);
      const formattedEmbedding = `[${embedding.join(",")}]`;

      await pool.query("UPDATE products SET embedding = $1 WHERE id = $2", [
        formattedEmbedding,
        product.id,
      ]);

      console.log(`✅ Embedded: ${product.product_name}`);
    }
  } catch (error) {
    console.error("❌ Error generating embeddings:", error);
  } finally {
    await pool.end();
  }
};

export const embededUserQuery = async (query) => {
  try {
    const result = await embedder(query, { pooling: "mean", normalize: true });
    return result.data;
  } catch (error) {
    console.log("Error embedding user query:", error);
  }
};

// Run the function
// generateEmbeddings();
