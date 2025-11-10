import { PromptTemplate } from "@langchain/core/prompts";
import { llm } from "./modal.js";
import {
  StringOutputParser,
  StructuredOutputParser,
} from "@langchain/core/output_parsers";
import z from "zod";
const inputParser = new StringOutputParser();
const zodSchema = z.object({
  query: z.string(),
  products: z.array(
    z.object({
      id: z.number(),
      product_name: z.string(),
      price: z.number(),
      stock: z.number(),
      description: z.string(),
      product_img: z.string().url(),
    })
  ),
});
const parser = StructuredOutputParser.fromZodSchema(zodSchema);

export const generateQuery = async (question,schema) => {
  const prompt = PromptTemplate.fromTemplate(`
You are an expert PostgreSQL query generator.
You are given a database schema:
{schema}
Your task:
Generate the correct PostgreSQL SELECT query that answers the user's question below.
Question:
{question}
Follow these strict rules:
1. Output ONLY the SQL query — no markdown, no explanations, no comments, no backticks, no prefixes like "sql:".
2. Only generate safe, read-only queries:
   - Use SELECT statements only.
   - Never use DROP, DELETE, UPDATE, INSERT, ALTER, or any DDL/DML operation.
3. Handle **ambiguous, conversational, or incomplete queries** gracefully:
   - If the question lacks key information (e.g. “Suggest three products in the given category” without category name), infer a reasonable fallback:
     • Return top N results overall, e.g. “SELECT ... ORDER BY popularity DESC LIMIT 3”.
     • Prefer popularity, rating, or created_at columns if available.
   - If the category is named (e.g. 'footwear'), use JOIN with the "categories" table and match by name using ILIKE.
   - Always include LIMIT — default 100, or the number specified in the question (“three” → LIMIT 3).
   - When matching free text, use "ILIKE" or "LOWER()" comparisons.
   - When user input may contain misspellings or fuzzy matches, prefer ILIKE with wildcards ("%term%") and note that a trigram search could be a fallback (but don’t assume it exists).
4. Be resilient to natural-language phrasing:
   - Understand that “show”, “suggest”, “list”, “recommend”, or “give” all mean SELECT queries.
   - Map nouns like “category”, “products”, “orders”, etc. to tables in the schema.
   - Infer numeric filters if mentioned (e.g., “under 50000” → "price <= 50000").
   - Support multiple constraints (e.g. “top 5 latest laptops under 50000” → ORDER BY created_at DESC LIMIT 5).
5. Always use explicit table aliases (p, c, o, etc.) when JOINs are required.
6. Handle missing context:
   - If a referenced field/table doesn’t exist in the schema, safely fallback to a neutral query like:
     "SELECT * FROM <most relevant table> LIMIT 3"
   - Do not generate invalid table/column names.
7. For user-specified numbers (e.g., “three”, “5”, “top 10”), convert to SQL LIMIT.
8. When the question implies sorting (like “latest”, “recent”, “top”, “popular”), use appropriate columns if they exist:
   - “latest” → ORDER BY created_at DESC
   - “popular” → ORDER BY popularity DESC or sales_count DESC
9. Default behavior (if uncertain):
   - Choose the most relevant table (e.g., products for product-related questions).
   - Return top 10 rows sorted by created_at or id DESC.
   - Use LIMIT 10 and only existing columns.
Remember:
- You must only output the final SQL query — nothing else.
- The query must be syntactically valid PostgreSQL.
  `);


  const pipe = prompt.pipe(llm).pipe(inputParser);

  const cleanedAIQuery = await pipe.invoke({ question,schema });

  const result = cleanedAIQuery.replace(/```sql|```/g, "").trim();

  return result;
};
// - If data is found, summarize the key details in a well-structured response (using bullet points or short paragraphs).
// You are a helpful assistant that answers user queries based on database results.

// User Question: {question}
// Database Result: {result}

// Your task:
// - Write a short, clear, and friendly answer in natural language.
//  - If data is found, summarize the key details in a well-structured response (using bullet points or short paragraphs).
// - If no data is found, respond with: “I couldn’t find any matching records.”
// - Avoid technical or raw database terms; make it conversational and easy to understand.

export const SummarizeResult = async (question, result) => {
  const prompt = PromptTemplate.fromTemplate(
    `
- If data is found, summarize the key details in a well-structured response (using bullet points or short paragraphs).
 You are a helpful assistant that answers user queries based on database results.

 User Question: {question}
 Database Result: {result}

 Your task:
 - Write a short, clear, and friendly answer in natural language.
  - If data is found, summarize the key details in {format_instructions}.
 - If no data is found, respond with: “I couldn’t find any matching records.”
 - Avoid technical or raw database terms; make it conversational and easy to understand.
`
  );
  const pipe = prompt.pipe(llm).pipe(parser);
  const response = await pipe.invoke({
    question,
    result,
    format_instructions: parser.getFormatInstructions(),
  });
  return response;
};
