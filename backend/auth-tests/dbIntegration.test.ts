import request from 'supertest';
import express from 'express';
import { pool, setupTestDatabase, cleanDatabase } from '../auth-tests/dbSetup';
import { authtest } from '../auth/jwtAuth';

// route imports
import roomsRouter from '../routes/rooms';
import videosRouter from '../routes/videos';
import startVotesRouter from '../routes/startVote';
import endVotesRouter from '../routes/endVote';
import votesRouter from '../routes/votes';
const app = express();
app.use(express.json());

// jest hooks
beforeAll(async () => {
    // Enable test mode before mounting routes
    process.env.NODE_ENV = 'test';

    // Mount routers
    app.use('/api/rooms', roomsRouter);
    app.use('/api/videos', videosRouter);

    // Vote routes require authentication; authtest will mock JWT in test mode
    app.use('/api/vote', authtest, startVotesRouter);
    app.use('/api/vote', authtest, endVotesRouter);
    app.use('/api/vote', authtest, votesRouter);

    await setupTestDatabase();
});

afterAll(async () => {
    await pool.end();
});

beforeEach(async () => {
    await cleanDatabase();
});

// Helper funcs
async function createRoom(userId = 1) {
    const roomId = Math.random().toString(36).substring(2, 8);
    await pool.query('INSERT INTO watch.rooms (id, owner_id, game_state) VALUES ($1, $2, $3)', [roomId, userId, 'lobby']);
    return roomId;
}

async function addVideo(roomId: string, url: string) {
    const res = await pool.query('INSERT INTO watch.videos (room_id, url) VALUES ($1, $2) RETURNING id', [roomId, url]);
    return res.rows[0].id;
}

async function voteVideo(roomId: string, videoId: number, userId = 1) {
    await pool.query('INSERT INTO watch.votes (room_id, video_id, user_id) VALUES ($1, $2, $3)', [roomId, videoId, userId]);
}

// tests
describe('Backend integration', () => {
    it('creates a room', async () => {
        const roomId = await createRoom();
        expect(typeof roomId).toBe('string');
    });

    it('retrieves a room', async () => {
        const roomId = await createRoom();
        const res = await request(app).get(`/api/rooms/${roomId}`);
        expect(res.body.roomId).toBe(roomId);
    });

    it('retrieves a room game state', async () => {
        const roomId = await createRoom();
        const res = await request(app).get(`/api/rooms/${roomId}`);
        expect(res.body.gameState).toBe('lobby');
    });

    it('adds a video', async () => {
        const roomId = await createRoom();
        const videoId = await addVideo(roomId, 'https://video.test/1');
        expect(typeof videoId).toBe('number');
    });

    it('retrieves videos for a room', async () => {
        const roomId = await createRoom();
        const videoId = await addVideo(roomId, 'https://video.test/1');
        const res = await request(app).get(`/api/videos/${roomId}`);
        expect(res.body[0].id).toBe(videoId);
    });

    it('retrieves video votes', async () => {
        const roomId = await createRoom();
        const videoId = await addVideo(roomId, 'https://video.test/1');
        const res = await request(app).get(`/api/videos/${roomId}`);
        expect(res.body[0].votes).toBe(0);
    });

    it('starts voting', async () => {
        const roomId = await createRoom();
        const res = await request(app).post(`/api/vote/start/${roomId}`);
        expect(res.body.success).toBe(true);
    });

    it('updates room state to voting', async () => {
        const roomId = await createRoom();
        await request(app).post(`/api/vote/start/${roomId}`);
        const room = await pool.query('SELECT game_state FROM watch.rooms WHERE id = $1', [roomId]);
        expect(room.rows[0].game_state).toBe('voting');
    });

    it('ends voting and selects a winner', async () => {
        const roomId = await createRoom();
        const videoId1 = await addVideo(roomId, 'https://video.test/1');
        const videoId2 = await addVideo(roomId, 'https://video.test/2');
        await voteVideo(roomId, videoId1);

        const res = await request(app).post(`/api/vote/end/${roomId}`);
        expect([videoId1, videoId2]).toContain(res.body.winningVideoId);
    });

    it('retrieves initially empty videos', async () => {
        const roomId = await createRoom();
        const res = await request(app).get(`/api/videos/${roomId}`);
        expect(res.body.length).toBe(0);
    });

    it('posts a video', async () => {
        const roomId = await createRoom();
        const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        const postRes = await request(app).post(`/api/videos/${roomId}`).send({ url: videoUrl });
        expect(postRes.body.success).toBe(true);
    });

    it('retrieves posted video', async () => {
        const roomId = await createRoom();
        const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        await request(app).post(`/api/videos/${roomId}`).send({ url: videoUrl });
        const getRes = await request(app).get(`/api/videos/${roomId}`);
        expect(getRes.body[0].url).toBe(videoUrl);
    });

    it('posting video without URL returns error', async () => {
        const roomId = await createRoom();
        const res = await request(app).post(`/api/videos/${roomId}`).send({});
        expect(res.body.error).toBe('Missing URL');
    });

    it('deliberate fail: expects 1 video in empty room', async () => {
        const roomId = await createRoom();
        const res = await request(app).get(`/api/videos/${roomId}`);
        let failed = false;
        try {
            expect(res.body.length).toBe(1); // intentionally wrong
        } catch (err) {
            failed = true;
        }
        expect(failed).toBe(true);
    });

    it('deliberate fail: asserting wrong URL', async () => {
        const roomId = await createRoom();
        const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        const postRes = await request(app).post(`/api/videos/${roomId}`).send({ url: videoUrl });
        let failed = false;
        try {
            expect(postRes.body.video.url).toBe('https://example.com/fakevideo'); // intentionally wrong
        } catch (err) {
            failed = true;
        }
        expect(failed).toBe(true);
    });
});
