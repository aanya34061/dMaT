'use client';

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  query,
  onChange,
  placeholder = 'Search by question, keyword, chapter, or topic...',
}: SearchBarProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-11 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm dark:shadow-none transition-all"
        id="search-input-field"
      />
      {query && (
        <button
          onClick={() => onChange('')}
          type="button"
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
