import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { pool } from "../db/dbconnection.js";
import { llm } from "../langchain/modal.js";
import { embededUserQuery } from "../vector_db/embeddings.js";
import { PromptTemplate } from "@langchain/core/prompts";
import z from "zod";
const formatedSchema = z.object({
  question: z.string(),
  recommendations: z
    .array(
      z.object({
        name: z.string().min(1, "Product name is required"),
        price: z.number().nonnegative("Price must be positive"),
        reason: z.string().min(10, "Reason must be at least 10 characters"),
        stock: z.number().int().nonnegative("Stock must be 0 or more"),
        productImage: z.string().url("Must be a valid image URL"),
      })
    )
    .nonempty("At least one recommendation is required"),
  note: z.string().min(10, "Note must be at least 10 characters").optional(),
});
const parser = StructuredOutputParser.fromZodSchema(formatedSchema);
export const embedData = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Query text is required" });
    }
    const embededQuestion = await embededUserQuery(question);
    const formattedEmbedding = `[${embededQuestion.join(",")}]`;

    const { rows: products } = await pool.query(
      `SELECT id, product_name, description, price ,stock,product_img,
              1 - (embedding <=> $1::vector) AS similarity
       FROM products
       ORDER BY embedding <=> $1::vector
       LIMIT 5;`,
      [formattedEmbedding]
    );
    if (!products.length) {
      return res.json({
        answer: "No relevant products found in the database.",
      });
    }
console.log(products);

    const context = products
      .map(
        (p) =>
          ` ${p.product_name} — ₹${p.price}\nDescription: ${p.description}\nStock:${p.stock}/nProductImage:${p.product_img}`
      )
      .join("\n");
    const prompt = PromptTemplate.fromTemplate(`
You are an AI skincare expert.
Based on the following product data, 
provide personalized skincare product recommendations in response to the user's query.

strict Guidelines:
- Recommend products only from the provided list.
- Provide a clear reason for each recommendation based on the product details.
- Suggest at least 3 products, if available.
- Format the response in a friendly and engaging manner.
Formated as: {formatedInstructions}
User query: {question}

Product details:
{context}

Respond naturally, friendly, and helpfully.
    `);
    const pipe = prompt.pipe(llm).pipe(parser)
    const response = await pipe.invoke({question,context,formatedInstructions: parser.getFormatInstructions()});
    console.log(response);

    return res.status(200).json({ data: response });
  } catch (error) {
    console.log("Errrr", error.message);
    return res.status(500).json({ error: error.message });
  }
};
