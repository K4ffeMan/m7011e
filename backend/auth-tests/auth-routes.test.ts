/* 


import request from 'supertest';
import axios from 'axios';
import { app } from '../server';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Auth routes (Keycloak)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ---------------------------
    // POST /auth/token
    // ---------------------------
    it('POST /auth/token returns 200 when Keycloak returns token', async () => {
        mockedAxios.post.mockResolvedValueOnce({
            status: 200,
            data: {
                access_token: 'mock-access-token',
                refresh_token: 'mock-refresh-token',
                expires_in: 300,
            },
        });

        const res = await request(app).post('/auth/token').send({
            code: 'auth-code',
            redirect_uri: 'http://localhost:5173',
        });

        expect(res.status).toBe(200);
        expect(res.body.access_token).toBe('mock-access-token');
    });

    // ---------------------------
    // GET /auth/account
    // ---------------------------
    it('GET /auth/account returns 200 when Keycloak returns user info', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            status: 200,
            data: {
                sub: 'user-123',
                email: 'user@test.com',
                preferred_username: 'testuser',
            },
        });

        const res = await request(app).get('/auth/account').set('Authorization', 'Bearer mock-access-token');

        expect(res.status).toBe(200);
        expect(res.body.email).toBe('user@test.com');
        expect(res.body.sub).toBe('user-123');
    });
});

*/
