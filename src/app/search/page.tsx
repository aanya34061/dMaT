'use client';

import React, { useState } from 'react';
import { useProgress } from '../../hooks/useProgress';
import SearchBar from '../../components/SearchBar';
import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function SearchPage() {
  const { isLoaded, questions } = useProgress();
  const [query, setQuery] = useState('');

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 font-semibold">
        Loading search engine...
      </div>
    );
  }

  // Filter matching questions
  const cleanQuery = query.toLowerCase().trim();
  const filteredQuestions = cleanQuery
    ? questions.filter(
        (q) =>
          q.question.toLowerCase().includes(cleanQuery) ||
          q.chapter.toLowerCase().includes(cleanQuery) ||
          q.topic.toLowerCase().includes(cleanQuery) ||
          q.difficulty.toLowerCase().includes(cleanQuery) ||
          q.options.some((opt) => opt.toLowerCase().includes(cleanQuery))
      )
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-grow bg-white dark:bg-slate-950">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-905 dark:text-white">
          Search Questions
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Type keywords, chapters, topics, or question fragments to query the database.
        </p>
      </div>

      <div className="space-y-6">
        <SearchBar query={query} onChange={setQuery} />

        {query && (
          <div className="space-y-4 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
              Results found ({filteredQuestions.length})
            </h3>

            {filteredQuestions.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  No matching questions found
                </p>
                <p className="text-xs text-slate-450 dark:text-slate-500">
                  Try searching with broader keywords like &quot;HIPAA&quot;, &quot;specificity&quot;, or &quot;EMR&quot;.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex justify-between items-start gap-4"
                  >
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/35">
                          {q.chapter}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                          Topic: {q.topic}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                          Page {q.bookPage}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                        {q.question}
                      </h4>
                    </div>

                    <Link
                      href={`/practice?id=${q.id}`}
                      className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center shrink-0 mt-1"
                      title="Practice Question"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
