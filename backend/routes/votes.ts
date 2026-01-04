import { Request, Response, Router } from "express";
import { keycloakJwt } from "../auth/jwtAuth";
import { pool } from "../db/database";

const router = Router();


router.post("/:roomId/:videoId", keycloakJwt, async (req: Request, res: Response) => {
  const userId = (req as any).auth?.sub;
  const roomId = req.params.roomId;
  const videoId = req.params.videoId;
  

  const room = await pool.query(
    `SELECT game_state FROM watch.rooms
    WHERE id = $1`,
    [roomId]
  );

  if(room.rowCount == 0){
    return res.status(404).json({ error: "No room found" });
  }

  const {game_state} = room.rows[0]

  if(game_state != "voting"){
    return res.status(403).json({error: "Voting need to be active"});
  }

  try{

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
