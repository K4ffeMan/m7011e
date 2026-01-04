import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getKeycloak } from "../auth/keycloak";
import keyaxios from "../auth/keycloakaxios";
import "./room.css";

interface YouTubeEntry {
  id: number;
  url: string;
  votes: number;
}

type GameState = "lobby" | "voting" | "finish";

function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [urls, setUrls] = useState<YouTubeEntry[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [roomState, setRoomState] = useState<{
    gameState: GameState;
    winningVideoId?: number;
  }>({ gameState: "lobby" });

  const [showWinner, setShowWinner] = useState(false);
  const [revealingWinner, setRevealingWinner] = useState(false);

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] =
    useState<"success" | "info" | "warning" | "error">("success");

  const isLobby = roomState.gameState === "lobby";
  const isVoting = roomState.gameState === "voting";
  const isFinished = roomState.gameState === "finish";

  const keycloak = getKeycloak();

  const requireLogin = async () => {
    if (!keycloak?.authenticated) {
      await keycloak?.login();
      return false;
    }
    return true;
  };

  const roles =
    (keycloak?.tokenParsed as any)?.realm_access?.roles ?? [];

  const isAdmin = roles.includes("admin");

  /* Fetch videos */
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await keyaxios.get<YouTubeEntry[]>(`/api/videos/${roomId}`);
        setUrls(res.data ?? []);
      } catch {
        setAlertMessage("Failed to load videos");
        setAlertSeverity("error");
      }
    };
    fetchVideos();
  }, [roomId]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await keyaxios.get<YouTubeEntry[]>(
          `/api/videos/${roomId}`
        );
        setUrls(res.data ?? []);
      } catch {
        // silent fail
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [roomId]);

  

  /* Poll room state */
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await keyaxios.get(`/api/rooms/${roomId}`);

      const raw = res.data.winning_video;
      const winningVideoId =
        raw === null || raw === undefined ? undefined : Number(raw);

      setRoomState({
        gameState: res.data.gameState,
        winningVideoId,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
  if (roomState.gameState === "finish") {
    setShowWinner(false);
    setRevealingWinner(true);

    const t = setTimeout(() => {
      setRevealingWinner(false);
      setShowWinner(true);
    }, 2500);

    return () => clearTimeout(t);
  }
}, [roomState.gameState]);

  /* Actions */
  const startVote = async () => {
    try {
      await keyaxios.post(`/api/vote/start/${roomId}`);
    } catch (err: any){
      if (err.response?.status === 401){
        await getKeycloak().login();
        return;
      }
      setAlertMessage("Failed to start vote");
      setAlertSeverity("error");
    }
  };

  const endVote = async () => {
    try {
      await keyaxios.post(`/api/vote/end/${roomId}`);
    } catch (err: any){
      if (err.response?.status === 401){
        await getKeycloak().login();
        return;
      }
      setAlertMessage("Failed to end vote");
      setAlertSeverity("error");
    }
  };

  const castVote = async (videoId: number) => {
    try {
      await keyaxios.post(`/api/vote/${roomId}/${videoId}`);
    } catch (err: any){
      if (err.response?.status === 401){
        await getKeycloak().login();
        return;
      }
      setAlertMessage("Failed to vote");
      setAlertSeverity("error");
    }
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;
    try {
      await keyaxios.post(`/api/videos/${roomId}`, { url: youtubeUrl });
        setYoutubeUrl("");
      }catch {
      setAlertMessage("Failed to add video");
      setAlertSeverity("error");
    }
  };

  async function handleDeleteRoom() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this room?"
    );
    if (!confirmed) return;

    try {
      await keyaxios.delete(`/api/rooms/${roomId}`);
      navigate("/");
    } catch (err) {
      alert("You are not allowed to delete this room.");
    }
  }

  const inviteLink = `${window.location.origin}/room/${roomId}`;

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setAlertMessage("Invite link copied to clipboard!");
      setAlertSeverity("success");
    } catch {
      setAlertMessage("Failed to copy invite link");
      setAlertSeverity("error");
    }
  };

  const goHome = () => navigate("/");

  const toEmbedUrl = (url: string) => {
  try {
    const u = new URL(url);
    const id = u.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : "";
  } catch {
    return "";
  }
};

  return (
    <div className="room-container">
      <Button onClick={goHome}>← Home</Button>

      {alertMessage && (
        <Alert
          severity={alertSeverity}
          action={
            <IconButton onClick={() => setAlertMessage(null)}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {alertMessage}
        </Alert>
      )}

      <h1>Room: {roomId}</h1>

      {isAdmin && (
        <button
          style={{ backgroundColor: "red", color: "white" }}
          onClick={handleDeleteRoom}
        >
          Delete room
        </button>
      )}

      <Button
        variant="outlined"
        onClick={copyInviteLink}
        style={{ marginBottom: "1rem" }}
      >
        Invite others
      </Button>

      {isLobby && (
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Enter YouTube URL"
            required
          />
          <Button type="submit">Submit</Button>
        </form>
      )}

      {isLobby && urls.length > 0 && <Button onClick={startVote}>Start Vote</Button>}
      {isVoting && <Button onClick={endVote}>End Vote</Button>}

      <div className="video-grid">
        {urls.map((entry) => (
          <div key={entry.id} className="video-card">
            <iframe src={toEmbedUrl(entry.url)} allowFullScreen title="yt" />
            <Button disabled={!isVoting} onClick={() => castVote(entry.id)}>
              👍 {entry.votes}
            </Button>
          </div>
        ))}
      </div>

      {revealingWinner && (
        <h2 style={{ marginTop: "2rem" }}>
          Spinning the wheel...
        </h2>
      )}

      {isFinished && showWinner && roomState.winningVideoId && (
        <iframe
          src={toEmbedUrl(
            urls.find(v => v.id === roomState.winningVideoId)?.url || ""
          )}
          allowFullScreen
        />
      )}
    </div>
  );
}

export default Room;
