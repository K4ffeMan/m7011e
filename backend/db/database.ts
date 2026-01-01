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

export async function testConnection() {
  try {
    console.log("Connected to PostgreSQL");
  } catch (error) {
    console.error("PostgreSQL connection failed:", error);
  }
}

export async function createTablesWatch() {
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS watch;`
  );

  await pool.query(
    `CREATE TABLE IF NOT EXISTS watch.rooms (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    voting_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  );

  await pool.query(
    `CREATE TABLE IF NOT EXISTS watch.videos (
    id SERIAL PRIMARY KEY,
    room_id TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_video_per_room
    UNIQUE (room_id, url),

    FOREIGN KEY (room_id)
      REFERENCES watch.rooms(id)
      ON DELETE CASCADE
    );`
  );

  await pool.query(
    `CREATE TABLE IF NOT EXISTS watch.votes (
    id SERIAL PRIMARY KEY,
    room_id TEXT NOT NULL,
    video_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (room_id)
      REFERENCES watch.rooms(id)
      ON DELETE CASCADE,

    FOREIGN KEY (video_id)
      REFERENCES watch.videos(id)
      ON DELETE CASCADE,

    UNIQUE (room_id, user_id)
    );
  `);
};

