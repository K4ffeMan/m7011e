import { Request, Response, Router } from "express";
import { VideoEntry, rooms } from "../logic/states";

const router = Router();

// GET videos for a room
router.get("/:roomId", (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  res.json(rooms[roomId].videos || []);
});


router.post("/:roomId", (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const { url } = req.body as { url: string };

  if (!url){
    return res.status(400).json({ error: "Missing URL" });
  } 

  if(!rooms[roomId]){
    return res.status(404).json({ error: "No room found" });
  }

  const newVideo: VideoEntry = {
    id: Math.random().toString(36).substring(2, 8),
    url,
    votes: 0
  };

  rooms[roomId].videos.push(newVideo);

  res.json({ success: true, video: newVideo });
});

export default router;
