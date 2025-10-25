import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv"
dotenv.config();
export const llm = new ChatGoogleGenerativeAI({
  apiKey: 'AIzaSyBL6FZeN90TORkYpLJSdKtjMi4h32r8VxY',
  model: "gemini-1.5-pro-latest",
  temperature: 0.7,
  maxOutputTokens: 2048,
});
