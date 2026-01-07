import { Request, Response, Router } from "express";
import { authtest } from "../auth/jwtAuth";
import { pool } from "../db/database";

const router = Router();


router.post("/start/:roomId", authtest, async (req: Request, res: Response) => {
  const roomId = req.params.roomId;

  const room = await pool.query(
    `SELECT 1 FROM watch.rooms
    WHERE id = $1`,
    [roomId]
  );

  const roomState = await pool.query(
    `UPDATE watch.rooms
    SET game_state = $1
    WHERE id = $2
    RETURNING game_state`,
    ["voting", roomId]
  );

  return res.status(200).json({
    success: true,
    gameState: roomState.rows[0].game_state,
  });
});

export default router;
