import { Request, Response, Router } from "express";
import { pool } from "../db/database";

const router = Router();


router.post("/start/:roomId", async (req: Request, res: Response) => {
  const roomId = req.params.roomId;

  const room = await pool.query(
    `SELECT 1 FROM watch.rooms
    WHERE id = $1`,
    [roomId]
  );

  const votingstatus = await pool.query(
    `UPDATE watch.rooms
    SET voting_active = true
    WHERE id = $1
    RETURNING voting_active`,
    [roomId]
  );

  return res.status(200).json({
    success: true,
    votingActive: votingstatus.rows[0].voting_active,
  });
});

export default router;
