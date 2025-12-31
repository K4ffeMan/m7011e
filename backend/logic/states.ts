//Before connecting database. We can check so the api works with this.
export interface VideoEntry {
  id: string;
  url: string;
  votes: number;
}

export interface Room {
  id: string;
  videos: VideoEntry[];
  votingActive: boolean;
}

export const rooms: Record<string, Room> = {};
