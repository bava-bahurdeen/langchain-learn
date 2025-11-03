import { runQuery } from "../db/runQuery.js";
import { generateQuery, SummarizeResult } from "../langchain/generateQuery.js";
import { getDBSchema } from "../schema/generateSchema.js";

export const askDatabase = async (req, res) => {
  const { question } = req.body;
  const schema = await getDBSchema();
  try {
    if (!question || question.trim() === "") {
      return res.status(400).json({ error: "Question is required" });
    }
    const result = await generateQuery(question,schema);
    if (!result) {
      return res.status(500).json({ error: "Failed to generate query" });
    }
    const sqlQuery = await runQuery(result)
    const AI_result = await SummarizeResult(sqlQuery,question)
    console.log(AI_result);
    return res.status(200).json({ query: AI_result });
    
  } catch (error) {
    return res.status(500).json({message:'Internal Server Error'})
  }
};
