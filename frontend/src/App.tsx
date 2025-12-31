import axios from "axios";
import Keycloak from 'keycloak-js';
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import mutter from "./assets/TKL.png";
import ytLogo from "./assets/youtube-logo.png";
import { keycloakConfig } from "./auth/keycloak-config";
import Header from "./components/header";
import Room from "./components/room";

let keycloakInstance: Keycloak | null = null;
const getKeycloak = () => {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak(keycloakConfig);
  }
  return keycloakInstance;
};


interface User {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isAdmin: boolean;
}

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [count, setCount] = useState<number>(0);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const keycloak = getKeycloak();

    keycloak.init({
      onLoad: 'check-sso',   // or 'login-required'
      pkceMethod: 'S256',
      checkLoginIframe: false
    }).then(authenticated => {
      setAuthenticated(authenticated);
      setLoading(false);

      if (authenticated) {
        // Load user profile
        keycloak.loadUserProfile().then(profile => {
          // Check if user has admin role
          const isAdmin = keycloak.hasRealmRole('admin');
          setUser({
            ...profile,
            isAdmin
          });
        });
        setLoading(false);
      }
    }).catch(err => {
      console.error('Keycloak initialization error:', err);
      setError('Failed to initialize authentication');
      setLoading(false);
    });
  }, []);

  const goToRandomRoom = async (): Promise<void> => {
    
    try {
      const res = await axios.post(`/api/rooms/`);
      if (res.data.success) {
        navigate(`/room/${res.data.roomId}`);
      }
    } catch {
      setAlertMessage("Failed to create a room");
      setAlertSeverity("error");
    }
    
  };

    const handleLogin = () => {
    getKeycloak().login();
    };

    const handleRegister = () => {
    getKeycloak().login({ action: "register" });
    };


  return (
    <>
      <Header
        authenticated={authenticated}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={() => getKeycloak().logout()}
      />

      <main className="pt-4">
        <Routes>
         <Route
        path="/"
        element={
          <>
            {loading && <p>Loading authentication…</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {authenticated && user && (
              <p>Welcome {user.username}</p>
            )}

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
              <button onClick={() => setCount((c) => c + 2)}>
                count is {count}
              </button>

              <button onClick={goToRandomRoom}>Go to Random Room</button>

              <p>
                By <code>Viggo Härdelin, Rasmus Kebert, Olle Göransson</code>
              </p>
            </div>

            <p className="auth">
              An app created by those who can't agree on what to watch
            </p>
          </>
        }
      />


          

          <Route path="/room/:roomId" element={<Room />} />
          
        </Routes>
      </main>
    </>
  );
}

export default App;

function setAlertMessage(arg0: string) {
  throw new Error(arg0);
}

function setAlertSeverity(arg0: string) {
  throw new Error(arg0);
}

