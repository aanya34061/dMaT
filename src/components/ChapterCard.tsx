'use client';

import Link from 'next/link';
import { BookOpen, HelpCircle } from 'lucide-react';
import ProgressBar from './ProgressBar';
import { motion } from 'framer-motion';

interface ChapterCardProps {
  name: string;
  questionCount: number;
  answeredCount: number;
}

export default function ChapterCard({
  name,
  questionCount,
  answeredCount,
}: ChapterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01, boxShadow: '0 12px 20px -5px rgba(0,0,0,0.05)' }}
      transition={{ type: 'spring' as const, stiffness: 140, damping: 14 }}
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
    >
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
            Study Chapter
          </span>
        </div>

        {/* Chapter Title */}
        <h3 className="text-lg font-bold text-slate-950 dark:text-white line-clamp-2 mb-4 h-14">
          {name}
        </h3>

        {/* Completion Progress */}
        <div className="mb-6 bg-slate-50 dark:bg-slate-850/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <ProgressBar
             value={answeredCount}
             max={questionCount}
             label="Practice Progress"
             size="sm"
          />
        </div>
      </div>

      {/* Chapter Action Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
        <Link
          href={`/practice?chapter=${encodeURIComponent(name)}`}
          className="w-full text-center py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 duration-150"
        >
          <HelpCircle className="w-4 h-4" />
          Start Practice
        </Link>
      </div>
    </motion.div>
  );
}
