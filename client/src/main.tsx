import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './tailwindcss.css'
import App from './App.tsx'

// Initialize theme from localStorage
const saved = localStorage.getItem("theme") || "dark";
document.documentElement.classList.toggle("dark", saved === "dark");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
