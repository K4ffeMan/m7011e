import { pool } from "../db/database";

export async function castVote(roomId: string, videoId: number, userId: string){
    const room = await pool.query(
    `SELECT game_state FROM watch.rooms
    WHERE id = $1`,
    [roomId]
  );

  if(room.rowCount == 0){
    throw new Error("No room found");
  }

  const {game_state} = room.rows[0]

  if(game_state != "voting"){
    throw new Error("Voting is not active");
  }

  try{

    await pool.query(
        `INSERT INTO watch.votes (room_id, video_id, user_id)
        VALUES ($1, $2, $3)`,
        [roomId, videoId, userId]
    );

    const numbVotes = await pool.query(
        `SELECT COUNT(*) FROM watch.votes
        WHERE room_id = $1 AND video_id = $2`,
        [roomId, videoId]
    );

    const totVotes = numbVotes.rows[0].count

    return {
        videoId,
        votes: totVotes
    }

  }catch(err: any){
    if(err.code === "23505"){
      throw new Error("Already voted");
    }
  }
}