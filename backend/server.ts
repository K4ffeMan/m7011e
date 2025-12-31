import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { createTablesWatch, testConnection } from "./db/database";
import videosRouter from "./routes/videos";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json());


// Routes
app.use("/api/videos", videosRouter);

async function startserver() {
  try{
    await testConnection();
    await createTablesWatch();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }catch(err){
    console.log("Something went wrong")
    process.exit(1);
  }
}

startserver();

