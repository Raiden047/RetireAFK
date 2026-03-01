import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingMessages = [
  "Initializing secure connection...",
  "Syncing blockchain data...",
  "Loading trading strategies...",
  "Calibrating portfolio metrics...",
  "Decrypting user preferences..."
];

const CircuitGhost: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ghost-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2979ff" />
        <stop offset="100%" stopColor="#0bda5e" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Ghost Body Outline */}
    <path 
      d="M20 55C20 30 35 15 50 15C65 15 80 30 80 55V85L72.5 80L65 85L57.5 80L50 85L42.5 80L35 85L27.5 80L20 85V55Z" 
      stroke="url(#ghost-gradient)" 
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#glow)"
    />
    
    {/* Eyes */}
    <circle cx="38" cy="45" r="5" fill="url(#ghost-gradient)" filter="url(#glow)" />
    <circle cx="62" cy="45" r="5" fill="url(#ghost-gradient)" filter="url(#glow)" />
    
    {/* Circuit Traces */}
    <g stroke="url(#ghost-gradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
      {/* Left Trace */}
      <path d="M28 60 L28 70 L35 75 L35 80" />
      <circle cx="28" cy="60" r="1.5" fill="url(#ghost-gradient)" />
      
      {/* Right Trace */}
      <path d="M72 60 L72 65 L65 70 L65 78" />
      <circle cx="72" cy="60" r="1.5" fill="url(#ghost-gradient)" />
      
      {/* Center Trace */}
      <path d="M50 65 L55 65 L60 70" />
      <circle cx="50" cy="65" r="1.5" fill="url(#ghost-gradient)" />
      
      {/* Top Left Trace */}
      <path d="M30 30 L35 35" />
      <circle cx="35" cy="35" r="1.5" fill="url(#ghost-gradient)" />
    </g>
  </svg>
);

const LoadingScreen: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background-dark text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neon-blue/5 via-transparent to-transparent opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        {/* Logo Section */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            filter: [
              "drop-shadow(0 0 10px rgba(41, 121, 255, 0.3))",
              "drop-shadow(0 0 20px rgba(41, 121, 255, 0.6))",
              "drop-shadow(0 0 10px rgba(41, 121, 255, 0.3))"
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative group"
        >
          <div className="relative z-10 p-6 rounded-2xl bg-charcoal/50 backdrop-blur-sm border border-white/5 ring-1 ring-white/10">
            <CircuitGhost className="w-20 h-20" />
          </div>
          
          {/* Decorative rings */}
          <div className="absolute inset-0 rounded-2xl border border-neon-blue/30 scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <motion.div 
            className="absolute inset-0 rounded-2xl border border-neon-blue/20"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Text Section */}
        <div className="flex flex-col items-center gap-4">
          <motion.h1 
            className="text-2xl font-bold tracking-[0.2em] text-white uppercase font-display"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Retire <span className="text-neon-blue drop-shadow-[0_0_10px_rgba(41,121,255,0.8)]">AFK</span>
          </motion.h1>

          {/* Loading Bar & Status */}
          <div className="flex flex-col items-center gap-3 w-64">
            <div className="w-full h-1 bg-charcoal-lighter rounded-full overflow-hidden relative">
              <motion.div
                className="absolute inset-y-0 left-0 bg-neon-blue shadow-[0_0_15px_#2979ff]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
              />
            </div>
            
            <div className="h-6 overflow-hidden relative w-full text-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs text-slate-400 font-mono tracking-wide uppercase"
                >
                  {loadingMessages[messageIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Footer Version */}
      <motion.div 
        className="absolute bottom-8 text-[10px] text-slate-600 font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        V 5.0.0 // SYSTEM READY
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
