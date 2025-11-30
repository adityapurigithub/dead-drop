import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Unlock, FileDown, AlertTriangle, CheckCircle, Loader2, ShieldAlert } from 'lucide-react';
import { importKey, decryptFile } from '../utils/crypto';

const Download = () => {
  const { id } = useParams(); // File ID from URL
  const { hash } = useLocation(); // Secret Key from URL Hash
  
  const [status, setStatus] = useState('idle'); // idle | downloading | decrypting | error | success
  const [fileName, setFileName] = useState('Encrypted_File.bin');

  const handleDownload = async () => {
    setStatus('downloading');

    try {
      // 1. Get the Secret Key from the URL Hash (remove the '#')
      const keyString = hash.replace('#', '');
      if (!keyString) throw new Error('NO_DECRYPTION_KEY_FOUND');

      // 2. Fetch the Encrypted Blob from Server
      // Note: This triggers the "Burn on Read" logic on the backend!
      const response = await fetch(`http://localhost:5000/api/download/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) throw new Error('FILE_ALREADY_DESTROYED');
        throw new Error('DOWNLOAD_FAILED');
      }

      // 3. Extract Headers (IV and Filename)
      const ivHeader = response.headers.get('x-iv');
      const contentDisposition = response.headers.get('Content-Disposition');
      
      // Parse filename roughly
      let originalName = 'downloaded_file';
      if (contentDisposition && contentDisposition.includes('filename="')) {
        originalName = contentDisposition.split('filename="')[1].split('"')[0].replace('.encrypted', '');
      }
      setFileName(originalName);

      // Convert IV from String to Uint8Array
      const ivArray = new Uint8Array(ivHeader.split(',').map(Number));
      
      // Get the encrypted data as an ArrayBuffer
      const encryptedBlob = await response.arrayBuffer();

      setStatus('decrypting');

      // 4. Decrypt (Client-Side)
      const key = await importKey(keyString);
      const decryptedBlob = await decryptFile(encryptedBlob, key, ivArray);

      // 5. Trigger Browser Download
      const url = window.URL.createObjectURL(decryptedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus('success');

    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto text-center">
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="border border-neon-red/30 bg-neon-red/5 p-8 rounded-xl w-full"
        >
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            <div className={`p-6 rounded-full border-2 ${status === 'error' ? 'border-neon-red bg-neon-red/20 text-neon-red' : 'border-neon-green bg-neon-green/10 text-neon-green'} transition-all duration-500`}>
              {status === 'idle' && <ShieldAlert size={48} />}
              {(status === 'downloading' || status === 'decrypting') && <Loader2 size={48} className="animate-spin" />}
              {status === 'success' && <CheckCircle size={48} />}
              {status === 'error' && <AlertTriangle size={48} />}
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {status === 'error' ? 'CONNECTION_TERMINATED' : 'SECURE_PACKAGE_DETECTED'}
          </h1>
          
          <p className="font-mono text-sm opacity-60 mb-8">
            {status === 'idle' && 'CAUTION: FILE WILL SELF-DESTRUCT AFTER DOWNLOAD'}
            {status === 'downloading' && 'RETRIEVING ENCRYPTED PAYLOAD...'}
            {status === 'decrypting' && 'DECRYPTING CONTENT...'}
            {status === 'success' && 'ASSET RECOVERED. SERVER DATA WIPED.'}
            {status === 'error' && 'ERROR: FILE NOT FOUND OR LINK EXPIRED'}
          </p>

          {/* Action Button */}
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.button
                onClick={handleDownload}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-4 bg-neon-green text-cyber-black font-bold text-xl rounded-sm hover:bg-neon-green/90 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,255,65,0.4)]"
              >
                <Unlock size={24} />
                <span>DECRYPT_AND_DOWNLOAD</span>
              </motion.button>
            )}
          </AnimatePresence>

        </motion.div>

        {/* Success Message */}
        {status === 'success' && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="mt-8 text-neon-green font-mono text-sm"
           >
             // PROTOCOL COMPLETE. FILE SAVED: {fileName}
           </motion.div>
        )}

      </div>
    </Layout>
  );
};

export default Download;