import {pipeline} from '@xenova/transformers'
import {pool} from '../db/dbconnection.js'

const generateEmbeddings = async()=>{
  try {
      const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
   const products = await pool.query("SELECT id, name, description, category_id,price,stock,product_img FROM products");

   products.rows.forEach(async(product)=>{
     const inputText = `
        Product: ${product.name}
        Description: ${product.description}
        Category ID: ${product.category_id}
        Price: ${product.price}
        Stock: ${product.stock}
      `;

      const result = await embedder(inputText, { pooling: "mean", normalize: true });
      const embedding = Array.from(result.data);

      await pool.query(
        "UPDATE products SET embedding = $1 WHERE id = $2",
        [embedding, product.id]
      );

      console.log(`Embedded: ${product.name}`);
   })
  } catch (error) {
        console.error("❌ Error generating embeddings:", error);

  }
  finally{
    await pool.end()
  }
 

  const result  = await embedder(text)
  console.log(result.data);
  
}

generateEmbeddings()