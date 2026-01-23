import bodyParser from "body-parser";
import cors from "cors";
import express, { Request, Response, Router } from "express";
import client from "prom-client";
import { authtest } from "./auth/jwtAuth";
import { pool, testConnection } from "./database";

const app = express();
const PORT = 5003;

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
      "start-vote"
    ).inc();

    request_duration.labels(
      req.method,
      "start-vote"
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

  const room = await pool.query(
    `SELECT 1 FROM watch.rooms
    WHERE id = $1`,
    [roomId]
  );

  if (room.rowCount === 0) {
    return res.status(404).json({ error: "Room not found" });
  }

  const roomState = await pool.query(
    `UPDATE watch.rooms
    SET game_state = $1
    WHERE id = $2
    RETURNING game_state`,
    ["voting", roomId]
  );

  return res.status(200).json({
    success: true,
    gameState: roomState.rows[0].game_state,
  });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

