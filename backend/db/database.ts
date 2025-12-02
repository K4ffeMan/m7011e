import { Pool } from "pg";

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Connected to PostgreSQL at:", res.rows[0].now);
  } catch (error) {
    console.error("PostgreSQL connection failed:", error);
  }
}

export async function createUsersTable() {
  const query = 
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(200) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  ;

  try {
    await pool.query(query);
    console.log("Users table ready");
  } catch (error) {
    console.error("Failed to create users table", error);
  }
}
