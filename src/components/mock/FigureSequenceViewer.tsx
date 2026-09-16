'use client';

import React, { useState } from 'react';
import { FigureSequenceVisualData } from '@/types/mockTest';
import { HelpCircle, ZoomIn } from 'lucide-react';
import ImageZoomModal from '@/components/ImageZoomModal';

interface FigureSequenceViewerProps {
  data: FigureSequenceVisualData;
  className?: string;
}

export default function FigureSequenceViewer({ data, className = '' }: FigureSequenceViewerProps) {
  const { frames, questionIndex } = data;
  const [activeZoomSvg, setActiveZoomSvg] = useState<string | null>(null);

  return (
    <div className={`space-y-4 my-4 ${className}`}>
      {/* Sequence Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Figure Progression Sequence:
        </span>
        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30">
          5-Stage Pattern Logic
        </span>
      </div>

      {/* Frame Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
        {frames.map((frame, idx) => (
          <div
            key={frame.id || idx}
            className="flex flex-col items-center gap-1.5 bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs group relative"
          >
            <div className="w-full aspect-square flex items-center justify-center p-1 overflow-hidden">
              <div
                className="w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: frame.svgContent }}
              />
            </div>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              Frame {idx + 1}
            </span>
          </div>
        ))}

        {/* Target Frame (Slot 5) */}
        <div className="flex flex-col items-center justify-center p-2.5 rounded-xl border-2 border-dashed border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-2xs">
          <div className="w-full aspect-square flex flex-col items-center justify-center gap-1">
            <HelpCircle className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-bounce" />
            <span className="text-lg font-black text-blue-700 dark:text-blue-300">?</span>
          </div>
          <span className="text-[11px] font-extrabold uppercase text-blue-700 dark:text-blue-300">
            Frame 5 (Target)
          </span>
        </div>
      </div>
    </div>
  );
}
