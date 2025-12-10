import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App.jsx";
import Upload from "./pages/Upload.jsx";
import Download from "./pages/Download.jsx";

import { Toaster } from "sonner";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.Fragment>
    {/* Global Toaster */}
    <Toaster
      theme="dark"
      position="top-right"
      richColors
      // closeButton
      toastOptions={{
        style: {
          background: "#0a0a0a", // pure black
          color: "#00ff41", // matrix green
          textShadow: "0 0 1px #00ff41", // neon glow effect
          boxShadow: "0 0 16px #00ff4160",
        },
      }}
    />

    {/* App Routing */}
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/download/:id" element={<Download />} />
      </Routes>
    </BrowserRouter>
  </React.Fragment>
);
