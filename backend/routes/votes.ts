import { Request, Response, Router } from "express";
import { authtest } from "../auth/jwtAuth";
import { getChannel } from "../rabbitmq/producer";

const router = Router();


router.post("/:roomId/:videoId", authtest, async (req: Request, res: Response) => {
  const userId = (req as any).auth?.sub;
  const roomId = req.params.roomId;
  const videoId = Number(req.params.videoId);
  
  const channel = await getChannel();

  channel.sendToQueue(
    "votes",
    Buffer.from(JSON.stringify({
      roomId,
      videoId,
      userId,
      timestamp: Date.now()
    })),
    {persistent: true}
  )

  return res.status(200).json({
    status: "vote queued"
  });
});

export default router;
