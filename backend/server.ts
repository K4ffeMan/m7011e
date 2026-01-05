import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { createTablesWatch, testConnection } from "./db/database";
import endVotesRouter from "./routes/endVote";
import roomsrouter from "./routes/rooms";
import startVotesRouter from "./routes/startVote";
import videosRouter from "./routes/videos";
import votesRouter from "./routes/votes";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({ origin: ["http://localhost:5173", "http://frontend:3000", "https://frontend-dev.ltu-m7011e-7.se"] }));
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

