'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface OptionCardProps {
  index: number; // 0, 1, 2, 3
  text: string;
  isSelected: boolean;
  isRevealed: boolean;
  isCorrect: boolean;
  onClick: () => void;
  disabled: boolean;
}

export default function OptionCard({
  index,
  text,
  isSelected,
  isRevealed,
  isCorrect,
  onClick,
  disabled,
}: OptionCardProps) {
  const letters = ['A', 'B', 'C', 'D'];
  
  let cardClass = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-400';
  let badgeClass = 'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400';

  if (isSelected) {
    cardClass = 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20';
    badgeClass = 'bg-blue-600 text-white';
  }

  if (isRevealed) {
    if (isCorrect) {
      cardClass = 'border-emerald-500 dark:border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/10';
      badgeClass = 'bg-emerald-500 text-white';
    } else if (isSelected) {
      cardClass = 'border-red-500 dark:border-red-650 bg-red-50/40 dark:bg-red-950/10';
      badgeClass = 'bg-red-500 text-white';
    }
  }

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.01, x: 4 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      onClick={onClick}
      disabled={disabled}
      type="button"
      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${cardClass} focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${badgeClass}`}>
        {letters[index]}
      </div>
      <span className="text-slate-800 dark:text-slate-200 font-medium text-sm leading-relaxed">
        {text}
      </span>
    </motion.button>
  );
}
