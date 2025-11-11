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

Your task: Generate only the pure SQL query that correctly answers the user's question below.

Strict Rules:
- Output ONLY the SQL query.
- Do NOT include markdown, code fences, language tags, or explanations.
- Do NOT include any prefix like "sql" or triple backticks.
- Do NOT say anything except the query.
- Never use DROP, DELETE, or UPDATE.

Question: {question}
  `);


  const pipe = prompt.pipe(llm).pipe(inputParser);

  const cleanedAIQuery = await pipe.invoke({ question,schema });

  const result = cleanedAIQuery.replace(/```sql|```/g, "").trim();
console.log(result);

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
