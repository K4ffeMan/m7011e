import { Router, Request, Response } from "express";

interface VideoEntry {
  id: string;
  url: string;
}

const rooms: Record<string, VideoEntry[]> = {};

const router = Router();

// GET videos for a room
router.get("/:roomId", (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  res.json(rooms[roomId] || []);
});

// POST a new video to a room
router.post("/:roomId", (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const { url } = req.body as { url: string };

  if (!url) return res.status(400).json({ error: "Missing URL" });

  const newVideo: VideoEntry = {
    id: Math.random().toString(36).substring(2, 8),
    url,
  };

  if (!rooms[roomId]) rooms[roomId] = [];
  rooms[roomId].push(newVideo);

  res.json({ success: true, video: newVideo });
});

export default router;
