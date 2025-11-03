import { PromptTemplate } from "@langchain/core/prompts";
import { llm } from "./modal.js";
import { StringOutputParser } from "@langchain/core/output_parsers";
const parser = new StringOutputParser();

export const generateQuery = async (question, schema) => {
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

  const pipe = prompt.pipe(llm).pipe(parser);

  const cleanedAIQuery = await pipe.invoke({ question, schema });

  const result = cleanedAIQuery.replace(/```sql|```/g, "").trim();

  return result ;
};

export const SummarizeResult = async (question, result) => {
  const prompt = PromptTemplate.fromTemplate(
    `
   The user asked: {question}
Here is the raw data from the database:
{result}

Write a short, clear, and friendly answer in natural language.
If no data found, say "I couldn’t find any matching records."
 Question:{question}
    `
  );
  const pipe = prompt.pipe(llm).pipe(parser);
  const response = await pipe.invoke({ question, result });
  return response;
};
