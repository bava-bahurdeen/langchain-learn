import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

// export const pool = new Pool({
//   user: process.env.PGUSER,
//   host: process.env.PGHOST,
//   database: process.env.PGDATABASE,
//   password: process.env.PGPASSWORD,
//   port: 5432,
//   ssl: { rejectUnauthorized: false },
// });
export const pool = new Pool({
  connectionString:process.env.EXTERNAL_URL,
  ssl: { rejectUnauthorized: false },
});






