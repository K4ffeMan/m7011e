import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./room.css";

interface YouTubeEntry {
  id: string;
  url: string;
}
/*
interface Vote {
  videoId: string;
  votes: number;
}*/

function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [votingActive, setVotingActive] = useState(false);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [urls, setUrls] = useState<YouTubeEntry[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<
    "success" | "info" | "warning" | "error"
  >("success");

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get<YouTubeEntry[]>(`/api/videos/${roomId}`);
        setUrls(Array.isArray(res.data) ? res.data : []);
      } catch {
        setAlertMessage("Failed to load videos");
        setAlertSeverity("error");
        setUrls([]);
      }
    };

    fetchVideos();
  }, [roomId]);

  const startVote = async () => {
    try {
      await axios.post(`/api/vote/start/${roomId}`);
      setVotingActive(true);
      setVotes({});
      setAlertMessage("Voting started!");
      setAlertSeverity("info");
    } catch {
      setAlertMessage("Failed to start vote");
      setAlertSeverity("error");
    }
  };

  const castVote = async (videoId: string) => {
    try {
      await axios.post(`/api/vote/${roomId}/${videoId}`);
      setVotes((prev) => ({
        ...prev,
        [videoId]: (prev[videoId] || 0) + 1,
      }));
    } catch {
      setAlertMessage("Failed to cast vote");
      setAlertSeverity("error");
    }
  };
/*
  const endVote = async () => {
    try {
      const res = await axios.post(`/api/vote/end/${roomId}`);
      const winningVideo = res.data.winningVideo;
      setUrls([winningVideo]);
      setVotingActive(false);
      setVotes({});
      setAlertMessage("Voting ended! Winning video kept.");
      setAlertSeverity("success");
    } catch {
      setAlertMessage("Failed to end vote");
      setAlertSeverity("error");
    }
  };
*/
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setAlertMessage("Room link copied!");
    setAlertSeverity("success");
  };

  const extractYouTubeId = (url: string): string | null => {
    const regex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const toEmbedUrl = (url: string) => {
    const id = extractYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      setAlertMessage("Please enter a valid YouTube URL!");
      setAlertSeverity("error");
      return;
    }

    try {
      const res = await axios.post(`/api/videos/${roomId}`, { url: youtubeUrl });
      if (res.data.success) {
        setUrls((prev) => [...prev, { id: res.data.video.id, url: youtubeUrl }]);
        setYoutubeUrl("");
        setAlertMessage("Video added successfully!");
        setAlertSeverity("success");
      }
    } catch {
      setAlertMessage("Failed to add video!");
      setAlertSeverity("error");
    }
  };

  const goHome = () => navigate("/");

  return (
    <div className="room-container">
      <Button
        variant="outlined"
        className="home-button"
        onClick={goHome}
        data-testid="home-button"
      >
        ← Home
      </Button>

      {alertMessage && (
        <Alert
          severity={alertSeverity}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setAlertMessage(null)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          style={{ marginBottom: "1rem" }}
        >
          {alertMessage}
        </Alert>
      )}

      <div className="room-header">
        <h1>Room: {roomId}</h1>
        <Button
          variant="contained"
          onClick={handleCopyLink}
          data-testid="copy-link-button"
        >
          Copy Room Link
        </Button>
      </div>

      <form className="url-form" onSubmit={handleSubmit}>
        <input
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="Enter YouTube URL"
          className="url-input"
          required
          disabled={votingActive}
          data-testid="video-url-input"
        />
        <Button
          type="submit"
          variant="contained"
          disabled={votingActive}
          data-testid="submit-video-button"
        >
          Submit
        </Button>
      </form>

      {votingActive && (
        <p style={{ color: "#ef4444", fontStyle: "italic" }}>
          Cannot add videos while voting is active.
        </p>
      )}

      <div className="voting-buttons" style={{ marginBottom: "1rem" }}>
        {!votingActive && urls.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={startVote}
            data-testid="start-vote-button"
          >
            Start Vote
          </Button>
        )}
      </div>

      <div className="video-grid">
        {Array.isArray(urls) && urls.length > 0 ? (
          urls.map((entry) => {
            const embedUrl = toEmbedUrl(entry.url);
            return (
              <div key={entry.id} className="video-card">
                {votingActive && (
                  <Button
                    onClick={() => castVote(entry.id)}
                    data-testid={`vote-button-${entry.id}`}
                  >
                    Vote
                  </Button>
                )}
                <p>Votes: {votes[entry.id] || 0}</p>

                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <p>Invalid URL</p>
                )}
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: "center", color: "#6b7280" }}>
            No videos yet — submit one above!
          </p>
        )}
      </div>
    </div>
  );
}

export default Room;
