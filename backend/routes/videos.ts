import { Request, Response, Router } from "express";
import { pool } from "../db/database";

const router = Router();

// GET videos for a room
router.get("/:roomId", async (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const room = await pool.query(
    `SELECT 1 FROM watch.rooms
    WHERE id = $1`,
    [roomId]
  );
  
  const videos = await pool.query(
    `SELECT id, url FROM watch.videos
    WHERE room_id = $1`,
    [roomId]
  );

  if(room.rowCount == 0){
    return res.status(404).json({ error: "No room found" });
  }

  res.json(videos.rows);
});


router.post("/:roomId", async (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const { url } = req.body as { url: string };
  

  const room = await pool.query(
    `SELECT 1 FROM watch.rooms
    WHERE id = $1`,
    [roomId]
  );

  if (!url){
    return res.status(400).json({ error: "Missing URL" });
  } 

  if(room.rowCount == 0){
    return res.status(404).json({ error: "No room found" });
  }

  try{
    const video = await pool.query(
        `INSERT INTO watch.videos (room_id, url)
        VALUES ($1, $2)
        RETURNING id, url`,
        [roomId, url]
    );

    console.log(video.rows[0]);
    
    res.json({ success: true, video: video.rows[0] });
  }catch(err: any){
    if(err.code === "23505"){
      return res.json({success: false, error: "Video exists in room"});
    }
    return res.status(500).json({
      success: false,
      error: "Failed to add video",
    });
  }
});

export default router;
