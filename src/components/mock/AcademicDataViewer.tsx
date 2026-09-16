'use client';

import React from 'react';
import { AcademicDataVisual } from '@/types/mockTest';
import MathRenderer from '@/components/MathRenderer';
import { Table, BarChart2 } from 'lucide-react';

interface AcademicDataViewerProps {
  data: AcademicDataVisual;
  className?: string;
}

export default function AcademicDataViewer({ data, className = '' }: AcademicDataViewerProps) {
  const { title, tableData, caption } = data;

  if (!tableData) return null;

  return (
    <div className={`space-y-2.5 my-4 ${className}`}>
      {title && (
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <Table className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{title}</span>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold">
              {tableData.headers.map((h, i) => (
                <th key={i} className="py-3 px-4 border-r last:border-r-0 border-slate-200 dark:border-slate-700 whitespace-nowrap">
                  <MathRenderer content={h} inline />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {tableData.rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors"
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className={`py-3 px-4 border-r last:border-r-0 border-slate-100 dark:border-slate-800 ${
                      cIdx === 0
                        ? 'font-bold text-slate-900 dark:text-slate-100'
                        : 'font-mono text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <MathRenderer content={String(cell)} inline />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {caption && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic text-left pl-1">
          {caption}
        </p>
      )}
    </div>
  );
}
