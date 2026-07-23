'use client';

import React from 'react';
import { BookOpen, Layers, CheckCircle2, ListFilter } from 'lucide-react';
import { Chapter, Question, UserProgress } from '../types';

interface SidebarProps {
  chapters: Chapter[];
  selectedChapter: string | null;
  onSelectChapter: (chapterName: string | null) => void;
  questions: Question[];
  progress: UserProgress;
}

export default function Sidebar({
  chapters,
  selectedChapter,
  onSelectChapter,
  questions,
  progress,
}: SidebarProps) {
  const getChapterStats = (chapterName: string) => {
    const chapterQuestions = questions.filter((q) => q.chapter === chapterName);
    const count = chapterQuestions.length;
    const answered = chapterQuestions.filter((q) => q.id in progress.answers).length;
    return { count, answered };
  };

  const totalQuestions = questions.length;
  const totalAnswered = questions.filter((q) => q.id in progress.answers).length;

  return (
    <aside className="w-full md:w-80 shrink-0 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 h-full md:overflow-y-auto transition-colors duration-200">
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-850">
        <ListFilter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Practice Filters
        </h2>
      </div>

      <div className="space-y-1">
        {/* All Chapters option */}
        <button
          onClick={() => onSelectChapter(null)}
          type="button"
          className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
            selectedChapter === null
              ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-650 dark:text-blue-400 font-bold border-l-2 border-blue-600 dark:border-blue-500 rounded-l-none'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850/30'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <Layers className="w-4 h-4 shrink-0" />
            <span className="truncate">All Chapters (Comprehensive)</span>
          </div>
          <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
            {totalAnswered}/{totalQuestions}
          </span>
        </button>

        <div className="pt-4 pb-2">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block px-3">
            Chapters
          </span>
        </div>

        {chapters.map((ch) => {
          const isSelected = selectedChapter === ch.name;
          const { count, answered } = getChapterStats(ch.name);
          const isCompleted = count > 0 && answered === count;

          return (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(ch.name)}
              type="button"
              className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all group ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-955/35 text-blue-650 dark:text-blue-400 font-bold border-l-2 border-blue-600 dark:border-blue-500 rounded-l-none'
                  : 'text-slate-605 dark:text-slate-405 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850/30'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span className="truncate pr-1">{ch.name}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 select-none">
                {isCompleted && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100 dark:fill-none" />
                )}
                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                  {answered}/{count}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
