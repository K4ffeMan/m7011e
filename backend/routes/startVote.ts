import { Request, Response, Router } from "express";
import { rooms } from "../logic/states";

const router = Router();


router.post("/start/:roomId", (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  if(!rooms[roomId]){
    return res.status(404).json({ error: "No room found" });
  }
  
  rooms[roomId].votingActive = true;

  return res.status(200).json({
    success: true,
    votingActive: rooms[roomId].votingActive,
  });
});

export default router;
