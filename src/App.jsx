import React, { useEffect } from "react";
import Layout from "./components/Layout";
import { motion } from "framer-motion";
import { Shield, Lock, Terminal, Zap, HardDrive, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const heroText = [
  "Advanced ephemeral file transport.",
  "Client-side encryption via",
  "Zero-knowledge architecture.",
];

const statusItems = [
  { icon: <Terminal size={12} />, text: "NODE: ONLINE" },
  { icon: <HardDrive size={12} />, text: "STORAGE: GRID_FS" },
  { icon: <Zap size={12} />, text: "LATENCY: 24ms" },
  { icon: <Lock size={12} />, text: "SSL: ACTIVE" },
];

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    toast.success("Welcome to Encrypted Upload Client!");
  }, []);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row h-full w-full">
        {/* LEFT SIDE (70%) */}
        <div className="w-full md:w-[70%] flex flex-col justify-center p-2 md:p-4 border-b md:border-b-0 md:border-r border-neon-green/20 relative overflow-hidden">
          {/* Decorative Icon */}
          <Shield className="absolute left-20 bottom-20 w-96 h-96 text-neon-green opacity-[0.03] rotate-12 pointer-events-none" />

          {/* CONTENT */}
          <div className="space-y-4 relative z-10">
            {/* SYSTEM READY */}
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-green/30 rounded-full bg-neon-green/5 w-fit">
              <div className="w-2 h-2 bg-neon-red rounded-full animate-pulse"></div>
              <span className="text-[12px] tracking-widest opacity-80">
                SYSTEM_READY
              </span>
            </div>

            {/* TITLE */}
            <motion.h1
              viewport={{ once: true }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-5xl md:text-6xl font-bold tracking-tighter leading-none 
                         text-transparent bg-clip-text bg-linear-to-r 
                         from-neon-green to-emerald-800/50 select-none"
            >
              FILE DROP
            </motion.h1>

            {/* UNDERLINE */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              className="h-1 w-50 bg-neon-green"
            />

            {/* HERO TEXT */}
            <motion.p className="text-sm md:text-lg opacity-90 max-w-lg leading-relaxed font-light whitespace-pre-line">
              <span className="text-neon-green font-bold mr-2">&gt;&gt;</span>

              {heroText.map((line, lineIndex) => (
                <motion.span key={lineIndex} className="block">
                  {line.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        delay: lineIndex * 0.6 + i * 0.02,
                        duration: 0.02,
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}

                  {/* Highlighted AES-GCM (Second Line) */}
                  {lineIndex === 1 && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: line.length * 0.02 + 0.6 }}
                      className="text-white bg-neon-green/20 px-1 ml-1"
                    >
                      AES-GCM.
                    </motion.span>
                  )}
                </motion.span>
              ))}
            </motion.p>

            {/* STATUS GRID */}
            <motion.div
              className="grid grid-cols-2 gap-4 mt-6 opacity-60 text-sm font-mono 
                         border-t border-neon-green/20 pt-6 max-w-sm"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.5 },
                },
              }}
            >
              {statusItems.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2"
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1 },
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {item.icon}
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* RIGHT SIDE (30%) */}
        <div className="w-full md:w-[30%] flex flex-col items-center justify-center p-6 md:p-0 bg-black/20">
          {/* BUTTON WITH RINGS */}
          <div className="relative w-full max-w-[200px] aspect-square flex items-center justify-center">
            {/* Outer Rings */}
            <div className="absolute inset-0 border border-neon-green/20 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-4 border border-neon-green/10 rounded-full border-dashed animate-[spin_15s_linear_infinite_reverse]" />

            {/* MAIN BUTTON */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => navigate("/upload")}
              className="group relative w-32 h-32 rounded-full 
                         bg-neon-green/10 border-2 border-neon-green 
                         flex flex-col items-center justify-center 
                         transition-all duration-600 
                         hover:bg-neon-green hover:text-cyber-black 
                         hover:scale-120 hover:shadow-[0_0_30px_rgba(0,255,65,0.6)] active:scale-105 active:duration-300"
            >
              <div className="mb-1">
                <Lock size={24} className="group-hover:hidden" />
                <div className="hidden group-hover:block font-black mt-1 text-xl">
                  GO <Rocket size={24} />
                </div>
              </div>

              <span className="text-[12px] tracking-widest font-bold group-hover:hidden">
                UPLOAD
              </span>
            </motion.button>
          </div>

          {/* FOOTER TEXT */}
          <motion.p
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 text-[12px] opacity-60 uppercase tracking-widest text-center"
          >
            Click to initiate
            <br />
            secure handshake
          </motion.p>
        </div>
      </div>
    </Layout>
  );
}

export default App;
