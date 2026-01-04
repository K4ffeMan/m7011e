import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { createTablesWatch, testConnection } from './db/database';
import endVotesRouter from './routes/endVote';
import roomsrouter from './routes/rooms';
import startVotesRouter from './routes/startVote';
import videosRouter from './routes/videos';
import votesRouter from './routes/votes';

const app = express();
const PORT = 5000;

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(bodyParser.json());

// Routes
app.use('/api/videos', videosRouter);
app.use('/api/vote', startVotesRouter);
app.use('/api/vote', endVotesRouter);
app.use('/api/rooms', roomsrouter);
app.use('/api/vote', votesRouter);

async function startserver() {
    try {
        await testConnection();
        await createTablesWatch();

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.log('Something went wrong');
        process.exit(1);
    }
}

startserver();
