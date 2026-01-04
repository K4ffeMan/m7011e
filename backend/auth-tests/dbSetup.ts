import { pool as backendPool } from '../db/database';

export const pool = backendPool;

export async function setupTestDatabase() {
    // Drop schema to start clean
    await pool.query(`DROP SCHEMA IF EXISTS watch CASCADE;`);
    await pool.query(`CREATE SCHEMA watch;`);

    // Rooms table
    await pool.query(`
    CREATE TABLE watch.rooms (
      id VARCHAR PRIMARY KEY,
      owner_id INT NOT NULL,
      game_state VARCHAR DEFAULT 'lobby',
      winner_video INT
    );
  `);

    // Videos table
    await pool.query(`
    CREATE TABLE watch.videos (
      id SERIAL PRIMARY KEY,
      room_id VARCHAR REFERENCES watch.rooms(id) ON DELETE CASCADE,
      url TEXT NOT NULL
    );
  `);

    // Votes table
    await pool.query(`
    CREATE TABLE watch.votes (
      room_id VARCHAR REFERENCES watch.rooms(id) ON DELETE CASCADE,
      video_id INT REFERENCES watch.videos(id) ON DELETE CASCADE,
      user_id INT,
      PRIMARY KEY(room_id, video_id, user_id)
    );
  `);
}

// Clean database before each test
export async function cleanDatabase() {
    await pool.query('DELETE FROM watch.votes');
    await pool.query('DELETE FROM watch.videos');
    await pool.query('DELETE FROM watch.rooms');
}
