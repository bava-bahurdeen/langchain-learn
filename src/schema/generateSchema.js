import { pool } from "../db/dbconnection.js";

  export const getDBSchema = async()=> {
  const res = await pool.query(`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

  const schema = {};
  for (const row of res.rows) {
    if (!schema[row.table_name]) schema[row.table_name] = [];
    schema[row.table_name].push(`${row.column_name} (${row.data_type})`);
  }

  let schemaText = "";
  for (const [table, columns] of Object.entries(schema)) {
    schemaText += `\nTable: ${table}\nColumns: ${columns.join(", ")}\n`;
  }

  return schemaText;
}
