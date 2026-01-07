import { Request, Response, Router } from "express";
import { pool } from "../db/database";

const router = Router();


router.post("/end/:roomId", async (req: Request, res: Response) => {
   const roomId = req.params.roomId;
  
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
            votes: vote.get(video.id),
        });
    }

    const weightVoting = [];

    for (const video of videosfull){
      if (video.votes == undefined){
        video.votes = 0;
      }
      for(let i = 0; i < video.votes; i++){
        weightVoting.push(video.id);
      }
    }

    if (weightVoting.length === 0){
      return res.status(400).json({error: "no votes"})
    }

    const winner = weightVoting[Math.floor(Math.random()* weightVoting.length)];

    const room = await pool.query(
      `UPDATE watch.rooms
      SET game_state = $1,
      winner_video = $2
      WHERE id = $3
      RETURNING game_state, winner_video`,
      ["finish", winner, roomId]
    );

  return res.status(200).json({
    success: true,
    gameState: room.rows[0].game_state,
    winningVideoId: room.rows[0].winner_video,
    videos: videosfull
  });
});

export default router;
