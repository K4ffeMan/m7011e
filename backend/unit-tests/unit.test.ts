/* 

import request from 'supertest';
import { app } from '../server';
import { pool } from '../db/database';

// Mock auth middleware
jest.mock('../auth/jwtAuth', () => ({
    authtest: (_req: any, _res: any, next: any) => {
        _req.auth = { sub: 'test-user' };
        next();
    },
    keycloakJwt: (_req: any, _res: any, next: any) => {
        (_req as any).auth = { sub: 'test-user' };
        next();
    },
}));

// Mock database
jest.mock('../db/database', () => ({
    pool: {
        query: jest.fn(),
    },
}));

const mockQuery = pool.query as jest.Mock;

describe('Route tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // /health
    it('GET /health returns ok', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'ok' });
    });

    // rooms
    describe('/api/rooms', () => {
        it('GET /api/rooms/:roomId', async () => {
            mockQuery.mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ game_state: 'voting', winner_video: null }],
            });

            const res = await request(app).get('/api/rooms/room123');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                success: true,
                roomId: 'room123',
                gameState: 'voting',
                winning_video: null,
            });
        });

        it('POST /api/rooms creates room', async () => {
            mockQuery
                .mockResolvedValueOnce({}) // insert
                .mockResolvedValueOnce({
                    rowCount: 1,
                    rows: [{ game_state: 'lobby', winner_video: null }],
                });

            const res = await request(app).post('/api/rooms');

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.gameState).toBe('lobby');
        });

        // assert for error no rom found
        it('POST /api/videos/:roomId fails if room does not exist', async () => {
            mockQuery.mockResolvedValueOnce({
                rowCount: 0,
                rows: [],
            });

            const res = await request(app).post('/api/videos/room123').send({ url: 'https://example.com' });

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('No room found');
        });
    });

    // /api/videos
    describe('/api/videos', () => {
        it('GET /api/videos/:roomId', async () => {
            mockQuery
                .mockResolvedValueOnce({ rowCount: 1, rows: [{}] }) // room exists
                .mockResolvedValueOnce({ rows: [{ id: 1, url: 'url1' }] }) // videos
                .mockResolvedValueOnce({ rows: [{ video_id: 1, votes: 3 }] }); // votes

            const res = await request(app).get('/api/videos/room123');

            expect(res.status).toBe(200);
            expect(res.body).toEqual([{ id: 1, url: 'url1', votes: 3 }]);
        });

        it('POST /api/videos/:roomId', async () => {
            mockQuery
                .mockResolvedValueOnce({ rowCount: 1, rows: [{}] }) // room exists
                .mockResolvedValueOnce({ rows: [{ id: 1, url: 'url1' }] }); // insert

            const res = await request(app).post('/api/videos/room123').send({ url: 'url1' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.video.id).toBe(1);
        });
    });

    // vote start
    describe('/api/vote/start', () => {
        it('starts voting', async () => {
            mockQuery
                .mockResolvedValueOnce({ rowCount: 1, rows: [{}] }) // SELECT room
                .mockResolvedValueOnce({ rows: [{ game_state: 'voting' }] }); // UPDATE room

            const res = await request(app).post('/api/vote/start/room123');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.gameState).toBe('voting');
        });
    });

    // vote end
    describe('/api/vote/end', () => {
        it('ends vote and selects winner', async () => {
            mockQuery
                .mockResolvedValueOnce({ rows: [{ id: 1, url: 'url1' }] }) // videos
                .mockResolvedValueOnce({ rows: [{ video_id: 1, votes: 2 }] }) // votes
                .mockResolvedValueOnce({
                    rows: [{ game_state: 'finish', winner_video: 1 }],
                });

            const res = await request(app).post('/api/vote/end/room123');

            expect(res.status).toBe(200);
            expect(res.body.gameState).toBe('finish');
            expect(res.body.winningVideoId).toBe(1);
        });

        it('returns 400 when no votes', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, url: 'url1' }] }).mockResolvedValueOnce({ rows: [] });

            const res = await request(app).post('/api/vote/end/room123');

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('no votes');
        });
    });

    // videoId
    describe('/api/vote/:roomId/:videoId', () => {
        it('vote succeeds', async () => {
            mockQuery
                .mockResolvedValueOnce({
                    rowCount: 1,
                    rows: [{ game_state: 'voting' }],
                }) // check room
                .mockResolvedValueOnce({}) // insert vote
                .mockResolvedValueOnce({
                    rows: [{ count: 1 }],
                }); // count votes

            const res = await request(app).post('/api/vote/room123/1');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.videoId).toBe('1');
            expect(res.body.votes).toBe(1);
        });

        it('vote fails if room missing', async () => {
            mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });

            const res = await request(app).post('/api/vote/room123/1');

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('No room found');
        });

        // assert for error missing url
        it('POST /api/videos/:roomId fails when URL is missing', async () => {
            mockQuery.mockResolvedValueOnce({
                rowCount: 1,
                rows: [{}], // room exists
            });

            const res = await request(app).post('/api/videos/room123').send({});

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Missing URL');
        });
    });
});

*/
