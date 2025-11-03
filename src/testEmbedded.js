import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { configDotenv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

configDotenv();

const test = async () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_API_KEY;
  const supabaseClient = createClient(supabaseUrl, supabaseKey);
  try {
    const embeddings =  new GoogleGenerativeAIEmbeddings({
      model: "models/embedding-001",
    }) 
    const queryEmbedding  =  await embeddings.embedQuery("What is the capital of France?")
    console.log(queryEmbedding);
    
  } catch (error) {
    
  }
};
test()
