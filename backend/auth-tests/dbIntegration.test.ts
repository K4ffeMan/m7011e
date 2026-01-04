// testing-ci/auth-tests/dbIntegration.test.ts
import request from 'supertest';
import express, { RequestHandler } from 'express';
import { authtest } from '../auth/jwtAuth';
import { pool, setupTestDatabase, cleanDatabase } from '../auth-tests/dbSetup';

// Wrap JWT middleware to satisfy TypeScript (Option B)
const getAuthMiddleware = (): RequestHandler => authtest as unknown as RequestHandler;

// Express app for testing
const app = express();
app.get('/protected', getAuthMiddleware(), async (req, res) => {
    const authReq = req as typeof req & { auth?: { sub?: string } };
    const userId = authReq.auth?.sub === 'mock-user' ? 1 : 0;

    const result = await pool.query('SELECT * FROM todos WHERE user_id = $1', [userId]);
    res.status(200).json(result.rows);
});

// CRUD helpers for tests
async function createTodo(title: string, description: string, userId: number) {
    const result = await pool.query('INSERT INTO todos (title, description, user_id) VALUES ($1, $2, $3) RETURNING todo_id', [
        title,
        description,
        userId,
    ]);
    return result.rows[0].todo_id as number;
}

async function markTodoComplete(todoId: number, userId: number) {
    const result = await pool.query('UPDATE todos SET completed = TRUE WHERE todo_id = $1 AND user_id = $2 RETURNING *', [todoId, userId]);
    if (result.rowCount === 0) throw new Error('Todo not found');
}

// Jest hooks
beforeAll(async () => {
    process.env.NODE_ENV = 'test'; // ensures authtest uses mock JWT
    await setupTestDatabase();
});

afterAll(async () => {
    await pool.end();
});

beforeEach(async () => {
    await cleanDatabase();
});

// Tests
describe('Todo integration', () => {
    it('creates and retrieves a todo', async () => {
        const todoId = await createTodo('Integration test todo', 'Desc', 1);
        expect(todoId).toBeDefined();

        const res = await request(app).get('/protected');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].todo_id).toBe(todoId);
        expect(res.body[0].completed).toBe(false);
    });

    it('isolates todos between users', async () => {
        const todo1 = await createTodo('User 1', 'Desc', 1);
        const todo2 = await createTodo('User 2', 'Desc', 2);

        const res = await request(app).get('/protected');
        expect(res.body.length).toBe(1);
        expect(res.body[0].todo_id).toBe(todo1);
    });

    it('marks todo complete', async () => {
        const todoId = await createTodo('Complete me', 'Desc', 1);
        await markTodoComplete(todoId, 1);

        const res = await request(app).get('/protected');
        expect(res.body[0].completed).toBe(true);
    });

    it('prevents other users from completing todo', async () => {
        const todoId = await createTodo('User 1 todo', 'Desc', 1);

        await expect(markTodoComplete(todoId, 2)).rejects.toThrow('Todo not found');
    });
});
