'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, VolumeX, X } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface LogoSplashProps {
  forceShow?: boolean;
  onClose?: () => void;
}

export default function LogoSplash({ forceShow = false, onClose }: LogoSplashProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      return;
    }

    const hasPlayed = sessionStorage.getItem('dmat_splash_played');
    if (!hasPlayed) {
      setIsVisible(true);
    }
  }, [forceShow]);

  const handleEnded = () => {
    dismissSplash();
  };

  const dismissSplash = () => {
    sessionStorage.setItem('dmat_splash_played', 'true');
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/40 via-slate-950 to-indigo-950/30 opacity-80 pointer-events-none" />

          {/* Top Control Bar */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 backdrop-blur-md transition-all shadow-lg"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={dismissSplash}
              className="px-4 py-2 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-bold border border-blue-400/30 backdrop-blur-md transition-all shadow-lg flex items-center gap-1.5"
            >
              Skip Intro
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Center Video Reveal Container */}
          <div className="relative w-full max-w-4xl px-4 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-800/60 bg-black">
              <video
                ref={videoRef}
                src="/logo_reveal.mp4"
                autoPlay
                muted={isMuted}
                playsInline
                onEnded={handleEnded}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Subtle Brand Title beneath video */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-6 flex flex-col items-center text-center space-y-2"
            >
              <BrandLogo variant="horizontal" height={38} />
              <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">
                Official Examination & Practice Platform
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
