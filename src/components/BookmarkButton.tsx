'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onToggle: () => void;
  className?: string;
}

export default function BookmarkButton({
  isBookmarked,
  onToggle,
  className = '',
}: BookmarkButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      type="button"
      className={`p-2 rounded-lg hover:bg-slate-105 dark:hover:bg-slate-800 transition-all ${className}`}
      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
    >
      <Star
        className={`w-5 h-5 transition-transform active:scale-90 ${
          isBookmarked
            ? 'fill-amber-500 text-amber-500'
            : 'text-slate-400 dark:text-slate-500 hover:text-amber-500'
        }`}
      />
    </button>
  );
}
