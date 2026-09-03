'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, X, Maximize2 } from 'lucide-react';

interface ImageZoomModalProps {
  isOpen: boolean;
  src: string;
  alt?: string;
  onClose: () => void;
}

export default function ImageZoomModal({
  isOpen,
  src,
  alt = 'High Resolution Figure',
  onClose,
}: ImageZoomModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.35, 4));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.35, 0.8));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-hidden">
        {/* Controls Toolbar */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2 shadow-2xl backdrop-blur-md text-white">
          <button
            onClick={handleZoomIn}
            type="button"
            className="p-2.5 rounded-xl hover:bg-slate-800 transition-colors text-slate-200 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            type="button"
            className="p-2.5 rounded-xl hover:bg-slate-800 transition-colors text-slate-200 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleReset}
            type="button"
            className="p-2.5 rounded-xl hover:bg-slate-800 transition-colors text-slate-200 hover:text-white"
            title="Reset Zoom"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-slate-700 mx-1" />
          <button
            onClick={onClose}
            type="button"
            className="p-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition-colors"
            title="Close Zoom Viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Badge */}
        <div className="absolute top-4 left-4 z-10 hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-300 backdrop-blur-md">
          <Maximize2 className="w-4 h-4 text-blue-400" />
          <span>High-Resolution Inspection ({Math.round(scale * 100)}%)</span>
        </div>

        {/* Pan and Zoom Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
        >
          <motion.div
            drag
            dragConstraints={{ left: -1200, right: 1200, top: -1200, bottom: 1200 }}
            style={{ x: position.x, y: position.y, scale }}
            animate={{ scale }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            className="max-w-full max-h-full flex items-center justify-center p-6"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-w-none max-h-[85vh] object-contain rounded-xl shadow-2xl bg-white p-2 select-none border border-slate-800"
              style={{
                imageRendering: 'crisp-edges',
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
