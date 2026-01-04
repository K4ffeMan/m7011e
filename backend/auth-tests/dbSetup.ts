// testing-ci/dbSetup.ts
import { pool as backendPool } from '../db/database';

// Export pool so tests can use it
export const pool = backendPool;

// Create todos table if it does not exist
export async function setupTestDatabase() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      todo_id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      user_id INTEGER NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Clean todos table before each test
export async function cleanDatabase() {
    await pool.query('DELETE FROM todos');
}
