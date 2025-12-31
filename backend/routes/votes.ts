import { Request, Response, Router } from "express";
import { rooms } from "../logic/states";

const router = Router();



// POST a new video to a room
router.post("/:roomId/:videosId", (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const videoId = req.params.videosId;

  if(!rooms[roomId]){
    return res.status(404).json({ error: "No room found" });
  }

  if(!rooms[roomId].votingActive){
    return res.status(403).json({error: "Voting need to be active"});
  }

  var votes = null;

  for (var i = 0; i < rooms[roomId].videos.length; i++){
    if (videoId == rooms[roomId].videos[i].id){
      rooms[roomId].videos[i].votes += 1;
      votes = rooms[roomId].videos[i].votes;
    }
  }
  
  return res.status(200).json({
    success: true,
    videoId,
    votes
  });
});

export default router;
