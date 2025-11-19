import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

const Upload = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8,delay: 0.2 }}
          className="text-4xl font-bold text-neon-green"
        >
          INITIATE_UPLOAD_SEQUENCE
        </motion.h1>
        <motion.div
        initial={{ opacity: 0,scale: 0.9 }}
        animate={{ opacity: 1,scale: 1 }}
        transition={{ duration: 0.5 }}

        className="p-10 border-2 border-dashed border-neon-green/30 rounded-lg bg-neon-green/5 w-full max-w-2xl h-64 flex items-center justify-center">
          <p className="opacity-50">Drag & Drop Zone (Coming Soon)</p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Upload;