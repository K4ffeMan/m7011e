import { useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import mutter from "./assets/TKL.png";
import ytLogo from "./assets/youtube-logo.png";
import Header from "./components/header";
import Room from "./components/room";
import Login from "./auth/login";
import Register from "./auth/register";
import "./App.css";

function App() {
  const [count, setCount] = useState<number>(0);
  const navigate = useNavigate();

  const goToRandomRoom = (): void => {
    const randomId = Math.random().toString(36).substring(2, 8);
    navigate(`/room/${randomId}`);
  };

  return (
    <>
      <Header />
      <main className="pt-4">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <h1>Youtube Video Selector</h1>
                <a href="https://youtube.com" target="_blank">
                  <img src={ytLogo} className="logo" alt="YouTube logo" />
                </a>
                <a
                  href="https://www.hitta.se/rasmus+kebert/lule%C3%A5/person/lpxinttu"
                  target="_blank"
                >
                  <img src={mutter} className="logo react" alt="TKL logo" />
                </a>

                <div className="card">
                  <button onClick={() => setCount((c) => c + 1)}>
                    count is {count}
                  </button>

                  <button onClick={goToRandomRoom}>Go to Random Room</button>

                  <p>
                    By <code>Viggo Härdelin, Rasmus Kebert, TO FIND</code>
                  </p>
                </div>
                <p className="auth">
                  An app created by those who can't agree on what to watch
                </p>
              </>
            }
          />

          <Route path="/room/:roomId" element={<Room />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
