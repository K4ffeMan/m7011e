import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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

  const [urls, setUrls] = useState<YouTubeEntry[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<
    "success" | "info" | "warning" | "error"
  >("success");

  // Fetch videos for this room
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get<YouTubeEntry[]>(`/api/videos/${roomId}`);
        setUrls(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setAlertMessage("Failed to load videos");
        setAlertSeverity("error");
        setUrls([]);
      }
    };

    fetchVideos();
  }, [roomId]);

  // Copy room link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setAlertMessage("Room link copied!");
    setAlertSeverity("success");
  };

  // Extract YouTube video ID
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

  // Submit new video
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
    } catch (err) {
      setAlertMessage("Failed to add video!");
      setAlertSeverity("error");
    }
  };

  const goHome = () => navigate("/");

  return (
    <div className="room-container">
      <Button variant="outlined" className="home-button" onClick={goHome}>
        ← Home
      </Button>

      {/* MUI Alert */}
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
        <Button variant="contained" onClick={handleCopyLink}>
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
        />
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </form>

      <div className="video-grid">
        {Array.isArray(urls) && urls.length > 0 ? (
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
