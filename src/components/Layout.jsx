import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-cyber-black p-3 md:p-6 flex items-center justify-center text-neon-green font-mono selection:bg-neon-green selection:text-cyber-black !overflow-x-hidden">
      
      {/* Main Terminal Window */}
      <div className="w-full max-w-6xl border border-neon-green/30 bg-cyber-gray/90 p-6 shadow-[0_0_20px_rgba(0,255,65,0.1)] relative overflow-hidden rounded-sm flex flex-col max-h-[90vh] backdrop-blur-sm">
        
        {/* 1. Top Window Controls */}
        <div className="flex justify-between items-center mb-6 border-b border-neon-green/20 pb-2 shrink-0 z-20 relative">
          <div className="flex md:flex-row flex-col md:gap-2 gap-1">
            <div className="md:w-3 md:h-3 w-6 h-1 rounded-full bg-neon-red opacity-70 shadow-[0_0_5px_rgba(255,0,60,0.5)]"></div>
            <div className="md:w-3 md:h-3 w-6 h-1 rounded-full bg-yellow-500 opacity-70 shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div>
            <div className="md:w-3 md:h-3 w-6 h-1 rounded-full bg-neon-green opacity-70 shadow-[0_0_5px_rgba(0,255,65,0.5)]"></div>
          </div>
          <div className="text-sm tracking-[0.2em] opacity-60 uppercase font-bold">
            ENCRYPTED_CONNECTION
          </div>
        </div>

        {/* 2. The Page Content */}
        <div className="relative z-20 flex-1 overflow-y-auto pr-2">
          {children}
        </div>
        
      </div>
      
      {/* Background Watermark */}
      <div className="fixed bottom-0 right-0 text-[15vw] font-bold opacity-[0.02] pointer-events-none select-none leading-none z-0 text-neon-green">
        SECURE
      </div>
    </div>
  );
};

export default Layout;