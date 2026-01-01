import { Request, Response, Router } from "express";
import { pool } from "../db/database";

const router = Router();


router.post("/end/:roomId", async (req: Request, res: Response) => {
   const roomId = req.params.roomId;
  
    const room = await pool.query(
      `UPDATE watch.rooms
      SET voting_active = false
      WHERE id = $1
      RETURNING voting_active`,
      [roomId]
    );

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

    const voteMap = new Map<number, number>();

    for (const row of numbVotes.rows) {
        voteMap.set(row.video_id, row.votes);
    }
    const videosfull = [];

    for (const video of videos.rows) {
        videosfull.push({
            id: video.id,
            url: video.url,
            votes: voteMap.get(video.id),
        });
    }
  return res.status(200).json({
    success: true,
    votingActive: room.rows[0].voting_active,
    videos: videosfull
  });
});

export default router;
