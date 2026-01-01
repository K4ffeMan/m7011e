import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import axios from "axios";
import { useEffect, useState } from "react";
import { Wheel } from "react-custom-roulette";
import { useNavigate, useParams } from "react-router-dom";
import "./room.css";


interface YouTubeEntry {
  id: number;
  url: string;
  votes: number;
}

function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [votingActive, setVotingActive] = useState(false);
  const [voteEnded, setVoteEnded] = useState(false);
  const [urls, setUrls] = useState<YouTubeEntry[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [winner, setWinner] = useState<YouTubeEntry | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [winningIndex, setWinningIndex] = useState(0);
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
      setVotingActive(true);   
      setVoteEnded(false);
      await axios.post(`/api/vote/start/${roomId}`);
      const res = await axios.get(`/api/videos/${roomId}`);
      setUrls(res.data);
      setAlertMessage("Voting started!");
      setAlertSeverity("info");
    } catch {
      setAlertMessage("Failed to start vote");
      setAlertSeverity("error");
    }
  };
  


  const castVote = async (videoId: number) => {
    if (!roomId || !videoId) {
      console.error("Vote blocked — invalid state", { roomId, videoId });
      return;
    }
    try {
      const res = await axios.post(`/api/vote/${roomId}/${videoId}`);
      
      setUrls(prev =>
      prev.map(video =>
        video.id === videoId
          ? { ...video, votes: res.data.votes }
          : video
      )
    );
    } catch {
      setAlertMessage("Failed to cast vote");
      setAlertSeverity("error");
    }
  };

  const endVote = async () => {
    try {
      const res = await axios.post(`/api/vote/end/${roomId}`);
      setVotingActive(res.data.votingActive);
      setUrls(res.data.videos);
      setVoteEnded(true);
      setAlertMessage("Voting ended! Winning video kept.");
      setAlertSeverity("success");
    } catch {
      setAlertMessage("Failed to end vote");
      setAlertSeverity("error");
    }
  };


  const spinWheel = () => {
    const weightedList: number[] = [];

    urls.forEach((video, index) => {
      const voteCount = video.votes || 1; // fallback
      for (let i = 0; i < voteCount; i++) {
        weightedList.push(index);
      }
    });

    if (weightedList.length === 0) return;

    const randomIndex =
      weightedList[Math.floor(Math.random() * weightedList.length)];

    setWinningIndex(randomIndex);
    setSpinning(true);
  };


const fetchRoomState = async () => {
    const res = await axios.get(`/api/rooms/${roomId}`);
    setVotingActive(res.data.votingActive);
  };

  useEffect(() => {
    fetchRoomState();
  }, [roomId]);


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
        
        setUrls((prev) => [
          ...prev,
          {
            id: res.data.video.id,
            url: youtubeUrl,
            votes: 0,
          },
        ]);
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
  
  const wheelData = urls.flatMap((video) =>
    Array(video.votes || 1).fill({
      option: video.url,
    })
  );

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
        {!votingActive && urls.length > 0 && !voteEnded &&(
          <Button
            variant="contained"
            color="primary"
            onClick={startVote}
            data-testid="start-vote-button"
          >
            Start Vote
          </Button>
        )}

        {votingActive && (
          <Button
            variant="contained"
            color="secondary"
            onClick={endVote}
            data-testid="end-vote-button"
            style={{ marginLeft: "1rem" }}
          >
            End Vote
          </Button>
        )}
      </div>

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
                
                <Button
                  onClick={() => {
                    if (!entry.id) return;
                    castVote(entry.id);
                  }}
                  
                  disabled={!votingActive}
                >
                  👍 {entry.votes ?? 0}
                </Button>
              </div>

            );
          })
        ) : (
          <p style={{ textAlign: "center", color: "#6b7280" }}>
            No videos yet — submit one above!
          </p>
        )}
      </div>
      {!votingActive && urls.length > 0 && !winner && voteEnded &&(
        <Button
          variant="contained"
          color="success"
          onClick={spinWheel}
          style={{ marginTop: "1rem" }}
          disabled={spinning}
        >
          {spinning ? "Spinning..." : "Spin the Wheel 🎡"}
        </Button>
      )}

      {voteEnded && (
        <Wheel
          mustStartSpinning={spinning}
          prizeNumber={winningIndex}
          data={wheelData}
          backgroundColors={["#3e3e3e", "#df3428"]}
          textColors={["#ffffff"]}
          onStopSpinning={() => {
            setSpinning(false);
            setWinner(urls[winningIndex]);
          }}
        />
      )}

      {winner && (
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <h2>🎉 Winning Video 🎉</h2>
          <iframe
            src={toEmbedUrl(winner.url)!}
            width="560"
            height="315"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}

export default Room;
