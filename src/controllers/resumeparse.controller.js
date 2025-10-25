import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AI_parsing } from "../langchain/resumeparselangchain.js";
const llm = new ChatGoogleGenerativeAI({
  apiKey: "AIzaSyBL6FZeN90TORkYpLJSdKtjMi4h32r8VxY",
  model: "gemini-2.0-flash",
  temperature: 0.7,
});
export const parseResume = async (_req, res) => {
  const result = await AI_parsing();
  res.status(200).json({ message: "Resume parsed successfully", ai: result });
};
