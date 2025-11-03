import { pool } from "./dbconnection.js";

export const runQuery = async (sql) => {
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (error) {
    return { error: error.message };
  }
};
