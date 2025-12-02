import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createUsersTable, testConnection } from "./db/database";
import videosRouter from "./routes/videos";

// Load environment variables from .env (local dev only)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json());

// Test PostgreSQL connection on startup
testConnection();

createUsersTable();

// Routes
app.use("/api/videos", videosRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
