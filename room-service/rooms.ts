import bodyParser from "body-parser";
import cors from "cors";
import express, { Request, Response, Router } from "express";
import client from "prom-client";
import { authtest } from "./auth/jwtAuth";
import { pool, testConnection } from "./database";

const app = express();
const PORT = 5001;

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
  origin: ["https://frontend-dev.ltu-m7011e-7.se"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
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
      "rooms"
    ).inc();

    request_duration.labels(
      req.method,
      "rooms"
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

router.get("/:roomId", async (req: Request, res: Response) => {
  try{

    const { roomId } = req.params;

    const room = await pool.query(
      `SELECT game_state, winner_video
      FROM watch.rooms
      WHERE id = $1`,
      [roomId]
    );

    if (room.rowCount === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({
      success: true,
      roomId,
      gameState: room.rows[0].game_state,
      winning_video: room.rows[0].winner_video ?? null
    });
  }catch(err){
    console.error("database is not working");
    return res.status(503).json({
      error: "Database temporarily unavailable"
    });
  }
});


router.post("/", authtest, async (req: Request, res: Response) => {
  try{
    const userId = req.auth?.sub;
    const roomId = Math.random().toString(36).substring(2, 8);
    
    await pool.query(
      `INSERT INTO watch.rooms (id, owner_id, game_state)
      VALUES ($1, $2, $3)`,
      [roomId, userId, "lobby"]
    );

    const room = await pool.query(
      `SELECT game_state, winner_video
      FROM watch.rooms
      WHERE id = $1`,
      [roomId]
    )
    
    res.status(201).json({
      success: true,
      roomId,
      gameState: room.rows[0].game_state,
      winningVideoId: room.rows[0].winner_video ?? null
    });
  }catch(err){
    console.error("database is not working");
    return res.status(503).json({
      error: "Database temporarily unavailable"
    });
  }
});

router.delete("/:roomId", authtest, async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const roles = req.auth?.realm_access?.roles;
    const Admin = roles?.includes("admin");


    if(!Admin){
        return res.status(403).json({ error: "You need to be admin" });
    }

    await pool.query(
        "DELETE FROM watch.rooms WHERE id = $1",
        [roomId]
    )
    res.status(200).json({
        success: true
    })
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

