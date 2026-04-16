import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// localStorage shim for window.storage
window.storage = {
  get: (key) => Promise.resolve({ value: localStorage.getItem(key) }),
  set: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
