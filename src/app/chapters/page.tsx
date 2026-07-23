'use client';

import React from 'react';
import { useProgress } from '../../hooks/useProgress';
import ChapterCard from '../../components/ChapterCard';
import { BookOpen } from 'lucide-react';

export default function Chapters() {
  const { isLoaded, chapters, questions, progress } = useProgress();

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 font-semibold">
        Loading chapters...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-grow bg-white dark:bg-slate-950">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-905 dark:text-white">
          Study Chapters
        </h1>
        <p className="text-slate-650 dark:text-slate-400 text-sm max-w-xl">
          Select a chapter below to practice questions specific to that exam topic. Your progress is saved automatically.
        </p>
      </div>

      {chapters.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No chapters found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {chapters.map((ch) => {
            const chQuestions = questions.filter((q) => q.chapter === ch.name);
            const questionCount = chQuestions.length;
            const answeredCount = chQuestions.filter((q) => q.id in progress.answers).length;

            return (
              <ChapterCard
                key={ch.id}
                name={ch.name}
                questionCount={questionCount}
                answeredCount={answeredCount}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
