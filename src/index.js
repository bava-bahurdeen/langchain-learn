import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import resumeParseRoutes from "./routes/resumeparse.routes.js";
import dbParseRoutes from "./routes/askdb.routes.js";
import ragChatRoutes from './routes/ragchat.routes.js'
import { pool } from "./db/dbconnection.js";
configDotenv();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/api/resume", resumeParseRoutes);
app.use("/api/db", dbParseRoutes);
app.use('/api/ragchat',ragChatRoutes)
const PORT = process.env.PORT;
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log(" Connected to PostgreSQL");
  } catch (err) {
    console.error(" Connection failed:", err.message);
  }
}

testConnection();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
testConnection();
