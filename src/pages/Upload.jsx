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
import { generateKey, encryptFile, exportKey } from "../utils";

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

      // 4. Upload Simulation (Replace with actual API call later)
      setStatus("uploading");
      setTimeout(() => {
        setStatus("done");
        setEncryptionData({ keyString });
      }, 2000);
    } catch (error) {
      console.error("Encryption Failed:", error);
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
            relative w-full max-w-4xl h-80 rounded-xl border-2 border-dashed cursor-pointer 
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
              backgroundImage: "radial-gradient(#00ff41 1px, transparent 1px)",
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
                <div className="p-6 rounded-full bg-cyber-black border border-neon-green/30 group-hover:border-neon-green group-hover:shadow-[0_0_20px_rgba(0,255,65,0.2)] transition-all duration-300">
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
                className="w-full px-12 flex flex-col items-center z-10"
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
          {status === "done" && (
            <motion.div
              key="done"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-8 p-4 border border-neon-green/50 bg-neon-green/10 rounded-lg text-center max-w-md"
            >
              <div className="flex items-center justify-center gap-2 text-neon-green mb-2">
                <CheckCircle size={24} />
                <span className="font-bold">SECURE DROP CREATED</span>
              </div>
              <p className="text-xs opacity-60 font-mono break-all">
                Key: {encryptionData?.keyString?.substring(0, 24)}...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Upload;
