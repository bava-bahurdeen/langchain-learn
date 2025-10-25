import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import resumeParseRoutes from "./routes/resumeparse.routes.js"
configDotenv();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
 app.use('/api/resume',resumeParseRoutes)
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
