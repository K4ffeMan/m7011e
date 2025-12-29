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

export async function createTablesWatch() {

  const userQuery = 
    `CREATE TABLE IF NOT EXISTS watch.users (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  await pool.query(userQuery);

  const roomQuery = 
    `CREATE TABLE IF NOT EXISTS watch.rooms (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id)
      REFERENCES watch.users(id)
      ON DELETE CASCADE
    );`
  await pool.query(roomQuery);

  const videoQuery = 
    `CREATE TABLE IF NOT EXISTS watch.videos (
    id SERIAL PRIMARY KEY,
    room_id TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (room_id)
      REFERENCES watch.rooms(id)
      ON DELETE CASCADE
    );`
  await pool.query(videoQuery);

  const voteQuery = 
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

    FOREIGN KEY (user_id)
      REFERENCES watch.users(id)
      ON DELETE CASCADE,

    UNIQUE (room_id, user_id)
    );`
  await pool.query(voteQuery);
};

