import { pool } from "../db/database";

export async function addVideo(roomId: string, url: string){
   const room = await pool.query(
    `SELECT 1 FROM watch.rooms
    WHERE id = $1`,
    [roomId]
  );

  if (!url){
    throw new Error("Missing url");
  } 

  if(room.rowCount == 0){
    throw new Error("No room found");
  }
    try{
        const video = await pool.query(
            `INSERT INTO watch.videos (room_id, url)
            VALUES ($1, $2)
            RETURNING id, url`,
            [roomId, url]
        );
    
    
    
    return {
        video: video.rows[0]
    }
  }catch(err: any){
    if(err.code === "23505"){
      throw new Error("Video exists in room");
    }

      throw new Error("Failed to add video");
  }
}