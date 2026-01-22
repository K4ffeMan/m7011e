import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_NAME,
});

pool.on("error", (err) =>{
  console.error("Database crashed for rooms", err);
});

export async function testConnection() {
  try {
    console.log("Connected to PostgreSQL");
  } catch (error) {
    console.error("PostgreSQL connection failed:", error);
  }
}

