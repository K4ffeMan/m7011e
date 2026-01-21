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
  labelNames: ['method', 'action', 'status', 'service'],
})

const request_duration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'http request latency in seconds',
  labelNames: ['method', 'action', 'service'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1]
})

const request_abort = new client.Counter({
  name: 'http_requests_aborted_total',
  help: 'Requests aborted',
  labelNames: ['method', 'action', 'service']
})

const rabbitmq_messages_rejected = new client.Counter({
  name: 'rabbitmq_messages_rejected',
  help: 'Rabbitmq messages rejected',
  labelNames: ['action', 'service']
})



function act(action: string){
  return(req: any, _res: any, next: any) => {
    req.action = action;
    next();
  };
}

app.use((req, res, next)=>{
  if(req.path == "/metrics"){
    return next();
  }
  const start = process.hrtime();

  req.on("aborted", () => {
    request_abort.labels(req.method, String(req.action), "backend").inc();
  })

  res.on("finish", () => {
    const endDiff = process.hrtime(start);
    let duration = endDiff[0] + endDiff[1]/1000000000
    let action: string;
    console.log(req.action);

    request_count.labels(
      req.method,
      String(req.action),
      String(res.statusCode),
      "backend"
    ).inc();

    request_duration.labels(
      req.method,
      String(req.action),
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
app.use("/api/videos", act("videos"), videosRouter);
app.use("/api/vote", act("start"), startVotesRouter);
app.use("/api/vote", act("end"), endVotesRouter);
app.use("/api/rooms", act("room"), roomsrouter);
app.use("/api/vote", act("vote"), votesRouter);


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

