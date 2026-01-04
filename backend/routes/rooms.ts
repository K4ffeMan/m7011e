import { Request, Response, Router } from "express";
import { authtest } from "../auth/jwtAuth";
import { pool } from "../db/database";

const router = Router();


router.get("/:roomId", async (req: Request, res: Response) => {
  const { roomId } = req.params;

  const room = await pool.query(
    `SELECT game_state, winner_video
     FROM watch.rooms
     WHERE id = $1`,
    [roomId]
  );

  if (room.rowCount === 0) {
    return res.status(404).json({ error: "Room not found" });
  }

  res.json({
    success: true,
    roomId,
    gameState: room.rows[0].game_state,
    winning_video: room.rows[0].winner_video ?? null
  });
});


router.post("/", authtest, async (req: Request, res: Response) => {
  const userId = req.auth?.sub;
  const roomId = Math.random().toString(36).substring(2, 8);
  
  await pool.query(
    `INSERT INTO watch.rooms (id, owner_id, game_state)
    VALUES ($1, $2, $3)`,
    [roomId, userId, "lobby"]
  );

  const room = await pool.query(
    `SELECT game_state, winner_video
    FROM watch.rooms
    WHERE id = $1`,
    [roomId]
  )
  
  res.status(201).json({
    success: true,
    roomId,
    gameState: room.rows[0].game_state,
    winningVideoId: room.rows[0].winner_video ?? null
  });
});

router.delete("/:roomId", authtest, async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const roles = req.auth?.realm_access?.roles;
  const Admin = roles?.includes("admin");
  console.log(roles);


  if(!Admin){
    return res.status(403).json({ error: "You need to be admin" });
  }

  await pool.query(
    "DELETE FROM watch.rooms WHERE id = $1",
    [roomId]
  )
  res.status(200).json({
    success: true
  })
});

export default router;
