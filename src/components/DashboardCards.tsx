'use client';

import React from 'react';
import { CheckCircle, XCircle, Percent, Bookmark, HelpCircle, ShieldCheck } from 'lucide-react';

interface DashboardCardsProps {
  totalQuestionsCount: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  bookmarksCount: number;
  independentSolvesCount: number;
}

export default function DashboardCards({
  totalQuestionsCount,
  attemptedCount,
  correctCount,
  incorrectCount,
  accuracy,
  bookmarksCount,
  independentSolvesCount,
}: DashboardCardsProps) {
  const cards = [
    {
      title: 'Questions Solved Independently',
      value: independentSolvesCount,
      description: 'Solved correctly on your first attempt',
      icon: ShieldCheck,
      color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30',
    },
    {
      title: 'Correct Answers',
      value: correctCount,
      description: `${correctCount} total correct responses`,
      icon: CheckCircle,
      color: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30',
    },
    {
      title: 'Accuracy Rate',
      value: `${accuracy}%`,
      description: 'Based on answered questions',
      icon: Percent,
      color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30',
    },
    {
      title: 'Questions Attempted',
      value: attemptedCount,
      description: `${Math.round((attemptedCount / (totalQuestionsCount || 1)) * 100)}% of total bank`,
      icon: CheckCircle,
      color: 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30',
    },
    {
      title: 'Bookmarked Questions',
      value: bookmarksCount,
      description: 'Saved for quick review',
      icon: Bookmark,
      color: 'text-violet-750 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-900/30',
    },
    {
      title: 'Total Question Bank',
      value: totalQuestionsCount,
      description: 'Available across all chapters',
      icon: HelpCircle,
      color: 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${card.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {card.title}
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {card.value}
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400">
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
