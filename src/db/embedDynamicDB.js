import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { pool } from "./dbconnection.js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { configDotenv } from "dotenv";

configDotenv();

 const embededDatabase = async () => {
  try {
    const client = await pool.connect();

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_API_KEY;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tables = tableRes.rows.map((r) => r.table_name);
    console.log("Tables:", tables);

    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "models/embedding-001",
    });

    const allTexts = [];
    const allMetadatas = [];

    for (const table of tables) {
      const rowsRes = await client.query(`SELECT * FROM "${table}" LIMIT 1000`);
      const rows = rowsRes.rows;

      for (const row of rows) {
        const text = Object.entries(row)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");

        const formatted = `Table: ${table} | ${text}`;
        allTexts.push(formatted);
        allMetadatas.push({ table, id: row.id ?? null });
      }
    }
   const texts = [
      "Best facewash for oily skin with natural ingredients",
      "Gentle cleanser suitable for dry and sensitive skin",
      "Anti-dandruff shampoo with aloe vera",
      "Moisturizer with SPF for men",
    ];

    const metadatas = [
      { category: "Facewash", brand: "GlowPure" },
      { category: "Cleanser", brand: "SoftSkin" },
      { category: "Shampoo", brand: "HerbalPro" },
      { category: "Moisturizer", brand: "ManCare" },
    ];
    console.log("Embedding and uploading to Supabase...");
    await SupabaseVectorStore.fromTexts(texts, metadatas, embeddings, {
      client: supabaseClient,
      tableName: "documents",
    });

    console.log(" All embeddings stored successfully in Supabase!");
  } catch (error) {
    console.error(" Embedding error:", error);
  } finally {
    await pool.end();
  }
};

embededDatabase()
