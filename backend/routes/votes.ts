import { Request, Response, Router } from "express";
import { pool } from "../db/database";

const router = Router();


router.post("/:roomId/:videoId", async (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const videoId = req.params.videoId;
  const userId = Math.random().toString(36).substring(2, 8);
  
  

  const room = await pool.query(
    `SELECT voting_active FROM watch.rooms
    WHERE id = $1`,
    [roomId]
  );

  if(room.rowCount == 0){
    return res.status(404).json({ error: "No room found" });
  }

  const {voting_active} = room.rows[0]

  if(voting_active == false){
    return res.status(403).json({error: "Voting need to be active"});
  }

  try{

    //This is only for testing right now. Will be removed in future
    await pool.query(
      `INSERT INTO watch.users (id)
      VALUES ($1)
      ON CONFLICT DO NOTHING`,
      [userId]
    );

    await pool.query(
        `INSERT INTO watch.votes (room_id, video_id, user_id)
        VALUES ($1, $2, $3)`,
        [roomId, videoId, userId]
    );

    const numbVotes = await pool.query(
        `SELECT COUNT(*) FROM watch.votes
        WHERE room_id = $1 AND video_id = $2`,
        [roomId, videoId]
    );

    const totVotes = numbVotes.rows[0].count

    return res.status(200).json({
    success: true,
    videoId,
    votes: totVotes
  });

  }catch(err: any){
    if(err.code === "23505"){
      return res.json({success: false, error: "User already voted"});
    }
  }
});

export default router;
