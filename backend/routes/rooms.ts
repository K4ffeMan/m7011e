import { Request, Response, Router } from "express";
import { rooms } from "../logic/states";

const router = Router();


router.get("/", (req: Request, res: Response) => {
  res.json(rooms || []);
});


router.post("/", (req: Request, res: Response) => {
  const roomId = Math.random().toString(36).substring(2, 8);

  rooms[roomId]= {
    id: roomId,
    videos: [],
    votingActive: false,
  }
  res.status(201).json({
    success: true,
    roomId
  });
});

export default router;
