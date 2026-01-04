import request from 'supertest';
import express, { RequestHandler } from 'express';
import { authtest } from '../auth/jwtAuth'; // use authtest

const app = express();

// Wrap middleware to satisfy ts
const getAuthMiddleware = (): RequestHandler => authtest as unknown as RequestHandler;

app.get('/protected', getAuthMiddleware(), (req, res) => {
    const authReq = req as typeof req & { auth?: { sub?: string } };
    res.status(200).json({ sub: authReq.auth?.sub });
});

describe('Mock JWT integration', () => {
    beforeAll(() => {
        process.env.NODE_ENV = 'test'; // ensures authtest uses mockJwt
    });

    it('returns a mock sub for testing', async () => {
        const res = await request(app).get('/protected');

        expect(res.status).toBe(200);
        expect(res.body.sub).toBe('mock-user');
    });
});
