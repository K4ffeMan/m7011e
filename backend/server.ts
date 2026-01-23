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

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.options("*", cors())
console.log("Does it get here")
// Routes
app.use("/api/rooms", createProxyMiddleware({
  target: "http://room:5001",
  changeOrigin: true,
}));
app.use("/api/videos", createProxyMiddleware({
  target: "http://video:5002",
  changeOrigin: true,
}));
app.use("/api/vote/start", createProxyMiddleware({
  target: "http://start-vote:5003",
  changeOrigin: true,
}));
app.use("/api/vote/end", createProxyMiddleware({
  target: "http://end-vote:5005",
  changeOrigin: true,
}));
app.use("/api/vote", createProxyMiddleware({
  target: "http://vote:5004",
  changeOrigin: true,
}));


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



