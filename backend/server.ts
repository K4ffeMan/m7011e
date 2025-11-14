import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import videosRouter from "./routes/videos";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({ origin: "http://localhost:5173" })); // allow React dev server
app.use(bodyParser.json());

// Routes
app.use("/api/videos", videosRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
