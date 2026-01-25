import cors from "cors";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { createTablesWatch, testConnection } from "./db/database";

const app = express();
const PORT = 5000;

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

const room_service_url = process.env.ROOM_SERVICE_URL || "http://localhost:5001";
const video_service_url = process.env.VIDEO_SERVICE_URL || "http://localhost:5002";
const start_vote_service_url = process.env.START_VOTE_SERVICE_URL || "http://localhost:5003";
const end_vote_service_url = process.env.END_VOTE_SERVICE_URL || "http://localhost:5005";
const vote_service_url = process.env.VOTE_SERVICE_URL || "http://localhost:5004";

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.options("*", cors())

app.use((req, res, next) => {
  if (req.method === "OPTIONS"){
    res.sendStatus(204);
    return;
  }
  next();
})
// Routes
app.use("/api/rooms", createProxyMiddleware({
  target: room_service_url,
  changeOrigin: true,
  xfwd: true,
}));
app.use("/api/videos", createProxyMiddleware({
  target: video_service_url,
  changeOrigin: true,
  xfwd: true,
}));
app.use("/api/vote/start", createProxyMiddleware({
  target: start_vote_service_url,
  changeOrigin: true,
  xfwd: true,
}));
app.use("/api/vote/end", createProxyMiddleware({
  target: end_vote_service_url,
  changeOrigin: true,
  xfwd: true,
}));
app.use("/api/vote", createProxyMiddleware({
  target: vote_service_url,
  changeOrigin: true,
  xfwd: true,
}));


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



