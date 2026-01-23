import bodyParser from "body-parser";
import cors from "cors";
import express, { Request, Response, Router } from "express";
import client from "prom-client";
import { authtest } from "./auth/jwtAuth";
import { pool, testConnection } from "./database";

const app = express();
const PORT = 5005;

client.collectDefaultMetrics();

const request_count = new client.Counter({
  name: 'http_requests_total',
  help: 'total HTTTP requests',
  labelNames: ['method', 'status', 'service'],
})

const request_duration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'http request latency in seconds',
  labelNames: ['method', 'service'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1]
})

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.options("*", cors())
app.use(bodyParser.json());

app.use((req, res, next)=>{
  if(req.path == "/metrics"){
    return next();
  }
  const start = process.hrtime();

  res.on("finish", () => {
    const endDiff = process.hrtime(start);
    let duration = endDiff[0] + endDiff[1]/1000000000
    let action: string;

    request_count.labels(
      req.method,
      String(res.statusCode),
      "end-vote"
    ).inc();

    request_duration.labels(
      req.method,
      "end-vote"
    ).observe(duration)
  });
  next();
})

app.get("/metrics", async(_req, res) =>{
  res.set("content-type", client.register.contentType);
  res.end(await client.register.metrics());
})

async function connectDatabase() {
  try{
    await testConnection();

    console.log("database working")
  }catch(err){
    console.log("Database is not working")
  }
}

connectDatabase();

const router = Router();

app.use("/", router);

router.post("/:roomId", authtest, async (req: Request, res: Response) => {
   const roomId = req.params.roomId;
  
    const videos = await pool.query(
        `SELECT id, url FROM watch.videos
        WHERE room_id = $1`,
        [roomId]
    );

    const numbVotes = await pool.query(
        `SELECT video_id, COUNT(*)::int AS votes FROM watch.votes
        WHERE room_id = $1
        GROUP BY video_id`,
        [roomId]
    );

    const vote = new Map<number, number>();

    for (const row of numbVotes.rows) {
        vote.set(row.video_id, row.votes);
    }
    const videosfull = [];

    for (const video of videos.rows) {
        videosfull.push({
            id: video.id,
            url: video.url,
            votes: vote.get(video.id),
        });
    }

    const weightVoting = [];

    for (const video of videosfull){
      if (video.votes == undefined){
        video.votes = 0;
      }
      for(let i = 0; i < video.votes; i++){
        weightVoting.push(video.id);
      }
    }

    if (weightVoting.length === 0){
      return res.status(400).json({error: "no votes"})
    }

    const winner = weightVoting[Math.floor(Math.random()* weightVoting.length)];

    const room = await pool.query(
      `UPDATE watch.rooms
      SET game_state = $1,
      winner_video = $2
      WHERE id = $3
      RETURNING game_state, winner_video`,
      ["finish", winner, roomId]
    );

  return res.status(200).json({
    success: true,
    gameState: room.rows[0].game_state,
    winningVideoId: room.rows[0].winner_video,
    videos: videosfull
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

