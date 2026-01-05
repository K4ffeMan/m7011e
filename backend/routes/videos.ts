import { Request, Response, Router } from "express";
import { authtest } from "../auth/jwtAuth";
import { pool } from "../db/database";
import { getChannel } from "../rabbitmq/producer";

const router = Router();

// GET videos for a room
router.get("/:roomId", async (req: Request, res: Response) => {
  try{
    const roomId = req.params.roomId;
    const room = await pool.query(
      `SELECT 1 FROM watch.rooms
      WHERE id = $1`,
      [roomId]
    );

    if(room.rowCount == 0){
      return res.status(404).json({ error: "No room found" });
    }

    const videos = await pool.query(
          `SELECT id, url FROM watch.videos
          WHERE room_id = $1`,
          [roomId]
      );

      const numbVotes = await pool.query(
          `SELECT video_id, COUNT(*)::int AS votes FROM watch.votes
          WHERE room_id = $1
          GROUP BY video_id`,
          [roomId]
      );

      const vote = new Map<number, number>();

      for (const row of numbVotes.rows) {
          vote.set(row.video_id, row.votes);
      }
      const videosfull = [];

      for (const video of videos.rows) {
          videosfull.push({
              id: video.id,
              url: video.url,
              votes: vote.get(video.id) ?? 0,
          });
      }

    res.json(videosfull);
    }catch(err){
      console.error("database is not working");
      return res.status(503).json({
        error: "Database temporarily unavailable"
      });
    }
});


router.post("/:roomId", authtest, async (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const { url } = req.body as { url: string };

  if(!url){
    return res.status(400).json({error: "missing a url"})
  }
  const channel = await getChannel();
  
    channel.sendToQueue(
      "video",
      Buffer.from(JSON.stringify({
        roomId,
        url,
        timestamp: Date.now()
      })),
      {persistent: true}
    )
  
    return res.status(200).json({
      status: "video queued"
    });
});

export default router;
