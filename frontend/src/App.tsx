import { useState } from 'react'
import mutter from './assets/TKL.png'
import ytLogo from './assets/youtube-logo.png'

import Header from "./components/header";

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    
    <Header />
      <main className="pt-4">
        {/* your routes here */}
      </main>

      <title>Video Selector</title>
      <div>
        <h1>Youtube Video Selector</h1>
        <a href="https://youtube.com" target="_blank">
          <img src={ytLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://www.hitta.se/rasmus+kebert/lule%C3%A5/person/lpxinttu" target="_blank">
          <img src={mutter} className="logo react" alt="React logo" />
        </a>
      </div>
      
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          By <code>Viggo Härdelin, Rasmus Kebert, TO FIND</code> 
        </p>
      </div>
      <p className="auth">
        An app created by those who can't agree on what to watch
      </p>
    </>
  )
}

export default App
