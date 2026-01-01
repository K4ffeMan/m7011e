import { Request, Response, Router } from "express";
import { keycloakJwt } from "../auth/jwtAuth";
import { pool } from "../db/database";

const router = Router();


router.get("/:roomId", async (req: Request, res: Response) => {
  const { roomId } = req.params;

  const room = await pool.query(
    `SELECT voting_active
     FROM watch.rooms
     WHERE id = $1`,
    [roomId]
  );

  if (room.rowCount === 0) {
    return res.status(404).json({ error: "Room not found" });
  }

  res.json({
    votingActive: room.rows[0].voting_active,
  });
});


router.post("/", keycloakJwt, async (req: Request, res: Response) => {
  console.log("reach")
  const userId = (req as any).auth?.sub;
  const roomId = Math.random().toString(36).substring(2, 8);
  
  await pool.query(
    `INSERT INTO watch.rooms (id, owner_id, voting_active)
    VALUES ($1, $2, $3)`,
    [roomId, userId, false]
  );
  
  res.status(201).json({
    success: true,
    roomId
  });
});

export default router;
