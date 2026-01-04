// auth-tests/dbIntegration.test.ts
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

// ===== Jest hooks =====
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

// ===== Helper functions =====
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

// ===== Tests =====
describe('Backend integration', () => {
    it('creates and retrieves a room', async () => {
        const roomId = await createRoom();

        const res = await request(app).get(`/api/rooms/${roomId}`);
        expect(res.status).toBe(200);
        expect(res.body.roomId).toBe(roomId);
        expect(res.body.gameState).toBe('lobby');
    });

    it('adds and retrieves videos for a room', async () => {
        const roomId = await createRoom();
        const videoId = await addVideo(roomId, 'https://video.test/1');

        const res = await request(app).get(`/api/videos/${roomId}`);
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].id).toBe(videoId);
        expect(res.body[0].votes).toBe(0);
    });

    it('starts voting for a room', async () => {
        const roomId = await createRoom();

        const res = await request(app).post(`/api/vote/start/${roomId}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.gameState).toBe('voting');

        const room = await pool.query('SELECT game_state FROM watch.rooms WHERE id = $1', [roomId]);
        expect(room.rows[0].game_state).toBe('voting');
    });

    it('ends voting and selects a winner', async () => {
        const roomId = await createRoom();
        const videoId1 = await addVideo(roomId, 'https://video.test/1');
        const videoId2 = await addVideo(roomId, 'https://video.test/2');

        await voteVideo(roomId, videoId1);

        const res = await request(app).post(`/api/vote/end/${roomId}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.gameState).toBe('finish');
        expect([videoId1, videoId2]).toContain(res.body.winningVideoId);
    });

    //it('allows voting for a video', async () => {
    //    const roomId = await createRoom();
    //    const videoId = await addVideo(roomId, 'https://video.test/1');
    //
    //    // Set room to voting state
    //    await pool.query('UPDATE watch.rooms SET game_state = $1 WHERE id = $2', ['voting', roomId]);
    //
    //    const res = await request(app).post(`/api/vote/${roomId}/${videoId}`);
    //
    //    expect(res.status).toBe(200);
    //    expect(res.body.success).toBe(true);
    //    expect(res.body.videoId).toBe(videoId.toString());
    //    expect(res.body.votes).toBe('1'); // DB returns string
    //});
    //
    //it('prevents voting if room is not in voting state', async () => {
    //    const roomId = await createRoom();
    //    const videoId = await addVideo(roomId, 'https://video.test/1');
    //
    //    const res = await request(app).post(`/api/vote/${roomId}/${videoId}`);
    //
    //    expect(res.status).toBe(403);
    //    expect(res.body.error).toBe('Voting need to be active');
    //});
    //
    //it('returns 404 when voting in a non-existent room', async () => {
    //    const res = await request(app).post('/api/vote/invalidRoom/1');
    //
    //    expect(res.status).toBe(404);
    //    expect(res.body.error).toBe('No room found');
    //});
});
