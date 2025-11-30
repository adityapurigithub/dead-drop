import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Upload from './pages/Upload.jsx' 
import Download from './pages/Download.jsx' 


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/download/:id" element={<Download />} />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)