import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import endVotesRouter from "./routes/endVote";
import roomsrouter from "./routes/rooms";
import startVotesRouter from "./routes/startVote";
import videosRouter from "./routes/videos";
import votesRouter from "./routes/votes";

// Load environment variables from .env (local dev only)
dotenv.config();


const app = express();
const PORT = 5000;

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json());

// Test PostgreSQL connection on startup
/*
testConnection();

createUsersTable();
*/
// Routes
app.use("/api/vote", startVotesRouter);
app.use("/api/vote", endVotesRouter);
app.use("/api/videos", videosRouter);
app.use("/api/rooms", roomsrouter);
app.use("/api/vote", votesRouter);


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
