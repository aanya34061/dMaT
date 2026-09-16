'use client';

import React, { useState } from 'react';
import { LatinSquareVisualData } from '@/types/mockTest';
import { HelpCircle } from 'lucide-react';

interface LatinSquareGridProps {
  data: LatinSquareVisualData;
  selectedSymbol?: string | null;
  className?: string;
}

export default function LatinSquareGrid({ data, selectedSymbol, className = '' }: LatinSquareGridProps) {
  const { size, symbols, grid, targetCell } = data;
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  return (
    <div className={`flex flex-col items-center space-y-4 my-4 ${className}`}>
      {/* Symbols Legend Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Allowed Symbols ({size}×{size}):
        </span>
        <div className="flex items-center gap-1.5">
          {symbols.map((sym) => (
            <span
              key={sym}
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-xs border ${
                selectedSymbol === sym
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              {sym}
            </span>
          ))}
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative p-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-md">
        <div
          className="grid gap-1.5 sm:gap-2"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {grid.map((row, rIdx) =>
            row.map((cellValue, cIdx) => {
              const isTarget = rIdx === targetCell.row && cIdx === targetCell.col;
              const isHoveredAxis =
                hoveredCell && (hoveredCell.row === rIdx || hoveredCell.col === cIdx);

              let cellBg = 'bg-slate-50 dark:bg-slate-850';
              let textColor = 'text-slate-900 dark:text-white font-extrabold';
              let ringClass = '';

              if (isTarget) {
                cellBg = 'bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-500 animate-pulse';
                textColor = 'text-amber-700 dark:text-amber-300 font-black';
                ringClass = 'ring-2 ring-amber-400/40 shadow-sm';
              } else if (cellValue === null) {
                cellBg = 'bg-slate-100/60 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700';
                textColor = 'text-slate-400 font-normal';
              } else if (isHoveredAxis) {
                cellBg = 'bg-blue-50/70 dark:bg-blue-950/30';
              }

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onMouseEnter={() => setHoveredCell({ row: rIdx, col: cIdx })}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl border border-slate-200 dark:border-slate-750 flex flex-col items-center justify-center font-mono text-sm sm:text-base transition-all select-none cursor-default ${cellBg} ${textColor} ${ringClass}`}
                >
                  {isTarget ? (
                    <span className="flex flex-col items-center leading-none">
                      <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">?</span>
                      <span className="text-[9px] font-bold uppercase text-amber-600 dark:text-amber-400">Target</span>
                    </span>
                  ) : cellValue !== null ? (
                    <span>{cellValue}</span>
                  ) : (
                    <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic text-center max-w-sm">
        Hover over rows and columns to visually trace constraints. Each symbol occurs exactly once per row and column.
      </p>
    </div>
  );
}
