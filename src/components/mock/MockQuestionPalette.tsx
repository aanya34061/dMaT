'use client';

import React, { useState } from 'react';
import { QuestionAttemptStatus } from '@/types/mockTest';
import { CheckCircle2, Bookmark, Circle, HelpCircle } from 'lucide-react';

interface MockQuestionPaletteProps {
  totalQuestions: number;
  currentIndex: number;
  statuses: Record<string, QuestionAttemptStatus>;
  answers: Record<string, number>;
  questionIds: string[];
  onSelectIndex: (index: number) => void;
  className?: string;
}

export default function MockQuestionPalette({
  totalQuestions,
  currentIndex,
  statuses,
  answers,
  questionIds,
  onSelectIndex,
  className = '',
}: MockQuestionPaletteProps) {
  const [filter, setFilter] = useState<'ALL' | 'ANSWERED' | 'MARKED' | 'UNANSWERED'>('ALL');

  // Compute stats
  let answeredCount = 0;
  let markedCount = 0;
  let unansweredCount = 0;

  questionIds.forEach((qId) => {
    const st = statuses[qId] || 'unanswered';
    const isAns = qId in answers;

    if (isAns) answeredCount++;
    else unansweredCount++;

    if (st === 'marked' || st === 'marked_answered') {
      markedCount++;
    }
  });

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4 flex flex-col h-full ${className}`}>
      {/* Palette Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          Question Navigator
        </h3>
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold">
          {currentIndex + 1} of {totalQuestions}
        </span>
      </div>

      {/* Legend & Stats Grid */}
      <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 flex items-center justify-center text-[8px] text-white font-bold">✓</span>
          <span>Answered: <strong>{answeredCount}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300">
          <span className="w-3.5 h-3.5 rounded-full bg-purple-600 flex items-center justify-center text-[8px] text-white font-bold">★</span>
          <span>Marked: <strong>{markedCount}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 col-span-2">
          <span className="w-3.5 h-3.5 rounded-full bg-slate-400 dark:bg-slate-600"></span>
          <span>Unanswered: <strong>{unansweredCount}</strong></span>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-[10px] font-bold">
        {(['ALL', 'ANSWERED', 'MARKED', 'UNANSWERED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-1 rounded-lg capitalize transition-colors ${
              filter === tab
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {tab.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Question Number Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-5 gap-2">
          {questionIds.map((qId, idx) => {
            const st = statuses[qId] || 'unanswered';
            const isAnswered = qId in answers;
            const isMarked = st === 'marked' || st === 'marked_answered';
            const isCurrent = idx === currentIndex;

            // Apply filter
            if (filter === 'ANSWERED' && !isAnswered) return null;
            if (filter === 'MARKED' && !isMarked) return null;
            if (filter === 'UNANSWERED' && isAnswered) return null;

            let btnClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700';

            if (isMarked && isAnswered) {
              btnClass = 'bg-purple-600 text-white ring-2 ring-emerald-400 shadow-xs';
            } else if (isMarked) {
              btnClass = 'bg-purple-600 text-white shadow-xs';
            } else if (isAnswered) {
              btnClass = 'bg-emerald-600 text-white shadow-xs';
            }

            return (
              <button
                key={qId}
                onClick={() => onSelectIndex(idx)}
                type="button"
                className={`relative h-9 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center ${btnClass} ${
                  isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 scale-105 z-10' : ''
                }`}
                title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}${isMarked ? ' (Marked for Review)' : ''}`}
              >
                <span>{idx + 1}</span>
                {isMarked && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white dark:border-slate-900" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
