import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import "./room.css";

interface YouTubeEntry {
  id: string;
  url: string;
}

function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [urls, setUrls] = useState<YouTubeEntry[]>([]);

  // Alert state
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<"success" | "info" | "warning" | "error">("success");

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setAlertMessage("Room link copied to clipboard!");
    setAlertSeverity("success");
  };

  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const toEmbedUrl = (url: string): string | null => {
    const id = extractYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      setAlertMessage("Please enter a valid YouTube link!");
      setAlertSeverity("error");
      return;
    }

    const newEntry: YouTubeEntry = {
      id: Math.random().toString(36).substring(2, 8),
      url: youtubeUrl,
    };

    setUrls((prev) => [...prev, newEntry]);
    setYoutubeUrl("");
    setAlertMessage("Video added successfully!");
    setAlertSeverity("success");
  };

  const goHome = () => navigate("/");

  return (
    <div className="room-container">
      {/* Home button */}
      <Button variant="outlined" className="home-button" onClick={goHome}>
        ← Home
      </Button>

      {/* Alert */}
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

      {/* Room header */}
      <div className="room-header">
        <h1 className="text-3xl font-bold mb-2">You’re in Room: {roomId}</h1>
        <Button variant="contained" className="copy-button" onClick={handleCopyLink}>
          Copy Room Link
        </Button>
      </div>

      {/* YouTube URL form */}
      <form className="url-form" onSubmit={handleSubmit}>
        <input
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="Enter YouTube URL"
          className="url-input"
          required
        />
        <Button type="submit" variant="contained" className="submit-button">
          Submit
        </Button>
      </form>

      {/* Video grid */}
      <div className="video-grid">
        {urls.length > 0 ? (
          urls.map((entry) => {
            const embedUrl = toEmbedUrl(entry.url);
            return (
              <div key={entry.id} className="video-card">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <p>Invalid URL</p>
                )}
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: "center", color: "#6b7280" }}>No videos yet — submit one above!</p>
        )}
      </div>
    </div>
  );
}

export default Room;
