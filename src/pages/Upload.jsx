import React, { useState, useRef, useCallback, useMemo } from "react";
import Layout from "../components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  File,
  X,
  Lock,
  Cpu,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { generateKey, encryptFile, exportKey } from "../utils/crypto";
import { toast } from "sonner";

// --- Pure Helper Function (Moved outside to prevent re-creation) ---
const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const Upload = () => {
  // --- State & Refs ---
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | encrypting | uploading | done
  const [encryptionData, setEncryptionData] = useState(null);

  const fileInputRef = useRef(null);

  // --- Memoized Derived Values ---
  // Only recalculate string when file object actually changes
  const formattedFileSize = useMemo(
    () => (file ? formatSize(file.size) : ""),
    [file]
  );

  // --- Memoized Handlers ---

  const handleDragOver = useCallback((e) => {
    e.preventDefault(); // Prevent browser from opening the file
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }, []);

  const clearFile = useCallback((e) => {
    e.stopPropagation();
    setFile(null);
    setStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // --- Core Encryption Logic ---
  const handleUpload = useCallback(async () => {
    if (!file) return;

    setStatus("encrypting");

    try {
      // 1. Zero-Knowledge: Generate Key locally
      const key = await generateKey();

      // 2. Encrypt: Heavy compute task (runs on main thread, could be web worker in future)
      const { encryptedBlob, iv } = await encryptFile(file, key);

      // 3. Export: Create the hash fragment for the URL
      const keyString = await exportKey(key);

      // Debugging logs (Remove in Production)
      console.log("🔒 Encrypted Size:", encryptedBlob.size);
      console.log("🔑 Key Generated:", keyString);

      // 4. PREPARE FORM DATA
      const formData = new FormData();
      // 'file' is the field name Multer expects
      formData.append("file", encryptedBlob, file.name);
      // 'iv' is required by our backend model
      formData.append("iv", iv.toString());

      console.log(formData.get("file"));
      console.log(formData.get("iv"));

      setStatus("uploading");

      // 5. SEND TO BACKEND
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed on server");

      const data = await response.json();
      console.log("Server Response:", data);

      // Construct the full magic link
      const fullLink = `${window.location.origin}/download/${data.fileId}#${keyString}`;

      setStatus("done");
      setEncryptionData({ link: fullLink }); // <--- Save the FULL link, not just the key
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Encryption Failed:", error);
      toast.error("Upload failed. Please try again.");
      setStatus("idle");
    }
  }, [file]); // Dependency: Only recreate if file changes

  // --- Render ---
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full w-full max-w-5xl mx-auto">
        {/* 1. Header: Brief Instructions */}
        <div className="text-center space-y-2 mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-neon-green to-emerald-900"
          >
            UPLOAD_TARGET
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.2 }}
            className="text-xs md:text-sm font-mono tracking-widest text-neon-green"
          >
            // DROP FILE TO INITIATE ENCRYPTION PROTOCOL
          </motion.p>
        </div>

        {/* 2. Drop Zone: Handles Selection Only */}
        {status !== "done" && (
          <motion.div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            animate={{
              borderColor: isDragging ? "#00ff41" : "rgba(0, 255, 65, 0.3)",
              backgroundColor: isDragging
                ? "rgba(0, 255, 65, 0.05)"
                : "rgba(0, 0, 0, 0.2)",
              scale: isDragging ? 1.01 : 1, // Subtle scale
            }}
            transition={{ duration: 0.2 }}
            className={`
            relative w-full max-w-4xl p-1 h-60 rounded-xl border-2 border-dashed cursor-pointer 
            flex flex-col items-center justify-center overflow-hidden group
            ${file ? "border-neon-green bg-neon-green/5" : ""}
          `}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Visual: Grid Overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.1]"
              style={{
                backgroundImage:
                  "radial-gradient(#00ff41 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            <AnimatePresence mode="wait">
              {!file ? (
                // State A: Empty / Prompt
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center space-y-4 z-10"
                >
                  <div className="p-6 rounded-full bg-cyber-black border border-neon-green/30 hover:scale-105 hover:border-neon-green/80 group-hover:border-neon-green group-hover:shadow-[0_0_20px_rgba(0,255,65,0.2)] transition-all duration-300">
                    <UploadCloud
                      size={48}
                      className="text-neon-green opacity-80"
                    />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-lg font-bold tracking-wider">
                      DRAG_AND_DROP
                    </p>
                    <p className="text-xs opacity-50 font-mono">
                      OR CLICK TO BROWSE SYSTEM
                    </p>
                  </div>
                </motion.div>
              ) : (
                // State B: File Loaded Preview
                <motion.div
                  key="file"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full md:px-12 px-2 flex flex-col items-center z-10"
                  onClick={(e) => e.stopPropagation()} // Stop clicks here from opening file dialog
                >
                  <div className="w-full bg-cyber-black/80 border border-neon-green/50 p-4 rounded-lg flex items-center gap-4 shadow-[0_0_30px_rgba(0,255,65,0.1)] relative overflow-hidden">
                    <div className="p-3 bg-neon-green/10 rounded-md">
                      <File size={24} />
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-bold truncate text-neon-green">
                        {file.name}
                      </p>
                      <p className="text-xs opacity-60 font-mono">
                        {formattedFileSize}
                      </p>
                    </div>

                    <button
                      onClick={clearFile}
                      className="p-2 hover:bg-neon-red/20 transition-all hover:text-neon-red rounded-full duration-300"
                    >
                      <X size={20} />
                    </button>

                    {/* Visual: Scanning Laser Animation */}
                    <motion.div
                      className="absolute top-0 left-0 w-0.5 h-full bg-neon-green/50 shadow-[0_0_10px_#00ff41]"
                      animate={{ left: ["0%", "100%"] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "linear",
                      }}
                    />
                  </div>

                  <div className="mt-8 flex items-center gap-2 text-xs opacity-60 font-mono">
                    <Cpu size={14} className="animate-pulse" />
                    <span>WAITING FOR ENCRYPTION KEY...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* 3. Action Area: Encryption & Upload (Outside Drop Zone) */}
        <AnimatePresence mode="wait">
          {/* Button: Shows only when file is ready & idle */}
          {file && status === "idle" && (
            <motion.button
              key="btn-upload"
              onClick={handleUpload}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 px-10 py-4 bg-neon-green text-cyber-black font-bold text-lg rounded-sm hover:bg-neon-green/90 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(0,255,65,0.4)]"
            >
              <Lock size={20} />
              <span>ENCRYPT_AND_UPLOAD</span>
            </motion.button>
          )}

          {/* Status: Processing Bar */}
          {(status === "encrypting" || status === "uploading") && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 flex flex-col items-center space-y-3"
            >
              <div className="flex items-center gap-3 text-neon-green">
                <Loader2 size={24} className="animate-spin" />
                <span className="font-mono tracking-widest text-sm">
                  {status === "encrypting"
                    ? "ENCRYPTING_CHUNKS..."
                    : "UPLOADING_TO_GRID_FS..."}
                </span>
              </div>
              <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-neon-green"
                  initial={{ width: "0%" }}
                  animate={{ width: status === "encrypting" ? "50%" : "100%" }}
                  transition={{ duration: 2 }} // Simulated progress
                />
              </div>
            </motion.div>
          )}

          {/* Status: Success */}
          {/* STATE: SUCCESS (The Link Display) */}
          {status === "done" && (
            <motion.div
              key="done"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-8 w-full max-w-lg"
            >
              <div className="p-6 border border-neon-green bg-neon-green/5 rounded-lg text-center relative overflow-hidden">
                {/* Success Icon */}
                <div className="flex items-center justify-center gap-2 text-neon-green mb-4">
                  <CheckCircle size={24} />
                  <span className="font-bold tracking-wider">
                    ENCRYPTION COMPLETE
                  </span>
                </div>

                {/* The Link Box */}
                <div
                  className="flex items-center gap-2 bg-cyber-black/50 p-2 rounded border border-neon-green/30"
                  onClick={() => {
                    navigator.clipboard.writeText(encryptionData?.link);
                    toast.success("Copied to clipboard!");
                  }}
                >
                  <input
                    readOnly
                    value={encryptionData?.link}
                    className="bg-transparent text-neon-green text-xs font-mono w-full focus:outline-none truncate px-2"
                  />
                  <button className="p-2 bg-neon-green text-cyber-black rounded font-bold text-xs hover:bg-white transition-colors">
                    COPY
                  </button>
                </div>

                <p className="text-[10px] text-neon-green/60 mt-4 font-mono uppercase">
                  Warning: This link works exactly once.
                </p>

                {/* Background scanning effect */}
                <motion.div
                  className="absolute top-0 left-0 w-full h-1 bg-neon-red/20"
                  animate={{ top: ["0%", "100%"] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "backInOut",
                  }}
                />
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setFile(null);
                  setStatus("idle");
                }}
                className="mt-6 text-sm text-neon-green/50 hover:text-neon-green underline decoration-dashed underline-offset-4"
              >
                UPLOAD NEW FILE
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Upload;
