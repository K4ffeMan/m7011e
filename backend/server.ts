import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import client from "prom-client";
import { createTablesWatch, testConnection } from "./db/database";
import endVotesRouter from "./routes/endVote";
import roomsrouter from "./routes/rooms";
import startVotesRouter from "./routes/startVote";
import videosRouter from "./routes/videos";
import votesRouter from "./routes/votes";

const app = express();
const PORT = 5000;

client.collectDefaultMetrics();

const request_count = new client.Counter({
  name: 'http_requests_total',
  help: 'total HTTTP requests',
  labelNames: ['method', 'endpoint', 'status', 'service'],
})

const request_duration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'http request latency in seconds',
  labelNames: ['method', 'endpoint', 'service'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1]
})

app.use((req, res, next)=>{
  if(req.path == "/metrics"){
    return next();
  }
  const start = process.hrtime();

  res.on("finish", () => {
    const endDiff = process.hrtime(start);
    let duration = endDiff[0] + endDiff[1]/1000000000

    request_count.labels(
      req.method,
      req.path,
      String(res.statusCode),
      "backend"
    ).inc();

    request_duration.labels(
      req.method,
      req.path,
      "backend"
    ).observe(duration)
  });
  next();
})

app.get("/metrics", async(_req, res) =>{
  res.set("content-type", client.register.contentType);
  res.end(await client.register.metrics());
})



// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.options("*", cors())
app.use(bodyParser.json());
// Routes
app.use("/api/videos", videosRouter);
app.use("/api/vote", startVotesRouter);
app.use("/api/vote", endVotesRouter);
app.use("/api/rooms", roomsrouter);
app.use("/api/vote", votesRouter);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

async function initdatabase() {
  try{
    await testConnection();
    await createTablesWatch();

    console.log("database working")
  }catch(err){
    console.log("Database is not working")
  }
}

initdatabase();

