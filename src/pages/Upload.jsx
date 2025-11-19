import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File, X, Lock, Cpu } from 'lucide-react';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // --- Event Handlers ---

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    // (Optional: Add size limit checks here later)
    setFile(selectedFile);
  };

  const clearFile = (e) => {
    e.stopPropagation(); // Prevent triggering the upload click
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Format bytes to readable size (KB, MB)
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleEncryptAndUpload = (e) => {
      e.preventDefault();
      e.stopPropagation();
  }


  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full w-full max-w-5xl mx-auto">
        
        {/* Header Text */}
        <div className="text-center space-y-2 mb-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-neon-green to-emerald-900"
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

        {/* --- The Drop Zone --- */}
        <motion.div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          
          animate={{
            borderColor: isDragging ? '#00ff41' : 'rgba(0, 255, 65, 0.3)',
            backgroundColor: isDragging ? 'rgba(0, 255, 65, 0.05)' : 'rgba(0, 0, 0, 0.2)',
            scale: isDragging ? 1.02 : 1,
          }}
          transition={{ duration: 0.2 }}
          
          className={`
            relative w-full max-w-4xl h-80 rounded-xl border-2 border-dashed cursor-pointer 
            flex flex-col items-center justify-center overflow-hidden group
            ${file ? 'border-neon-green bg-neon-green/5' : ''}
          `}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
          />

          {/* Grid Background Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.1]" 
               style={{ backgroundImage: 'radial-gradient(#00ff41 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          </div>

          <AnimatePresence mode="wait">
            
            {/* STATE 1: NO FILE SELECTED */}
            {!file ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center space-y-4 z-10"
              >
                <div className="p-6 rounded-full bg-cyber-black border border-neon-green/30 group-hover:border-neon-green group-hover:shadow-[0_0_20px_rgba(0,255,65,0.2)] transition-all duration-300">
                  <UploadCloud size={48} className="text-neon-green opacity-80" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-lg font-bold tracking-wider">DRAG_AND_DROP</p>
                  <p className="text-xs opacity-50 font-mono">OR CLICK TO BROWSE SYSTEM</p>
                </div>
              </motion.div>
            ) : (
              
            /* STATE 2: FILE SELECTED */
              <motion.div 
                key="file"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full px-12 flex flex-col items-center z-10"
              >
                <div className="w-full bg-cyber-black/80 border border-neon-green/50 p-4 rounded-lg flex items-center gap-4 shadow-[0_0_30px_rgba(0,255,65,0.1)] relative overflow-hidden">
                  
                  {/* File Icon */}
                  <div className="p-3 bg-neon-green/10 rounded-md">
                    <File size={24} />
                  </div>

                  {/* File Details */}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-bold truncate text-neon-green">{file.name}</p>
                    <p className="text-xs opacity-60 font-mono">{formatSize(file.size)}</p>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={clearFile}
                    className="p-2 hover:bg-neon-red/20 transition-all hover:text-neon-red rounded-full duration-300"
                  >
                    <X size={20} />
                  </button>

                  {/* Scanning Animation Line */}
                  <motion.div 
                    className="absolute top-0 left-0 w-0.5 h-full bg-neon-green/50 shadow-[0_0_10px_#00ff41]"
                    animate={{ left: ['0%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  />
                </div>

                <div className="mt-8 flex items-center gap-2 text-xs opacity-60 font-mono">
                   <Cpu size={14} className="animate-pulse" />
                   <span>WAITING FOR ENCRYPTION KEY...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
           {/* --- Action Button (Only shows when file is present) --- */}
        <AnimatePresence>
          {file && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-8 px-10 py-4 bg-neon-green text-cyber-black font-bold text-lg rounded-sm hover:bg-neon-green/90 hover:scale-105 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(0,255,65,0.4)]"
            onClick={handleEncryptAndUpload}
           >
              <Lock size={20} />
              <span>ENCRYPT_AND_UPLOAD</span>
            </motion.button>
          )}
        </AnimatePresence>
        </motion.div>

       

      </div>
    </Layout>
  );
};

export default Upload;