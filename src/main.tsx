import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GameProvider } from './context/GameContext';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <GameProvider>
    <App />
  </GameProvider>
    
  </StrictMode>,
)